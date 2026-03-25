import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── SOTW indicator links ──────────────────────────────
const INDICATOR_LINKS: Record<string, string[]> = {
  'Consumer Price Index': ['FRED.CPIAUCSL'],
  'CPI': ['FRED.CPIAUCSL'],
  'Nonfarm Payrolls': ['FRED.PAYEMS'],
  'Employment Situation': ['FRED.PAYEMS'],
  'Unemployment': ['FRED.UNRATE'],
  'Jobless Claims': ['FRED.ICSA'],
  'FOMC': ['FRED.FEDFUNDS'],
  'Federal Funds': ['FRED.FEDFUNDS'],
  'GDP': ['FRED.GDP'],
  'PCE': ['FRED.PCEPI'],
  'Personal Income': ['FRED.PCEPI'],
  'Retail Sales': ['FRED.RSAFS'],
  'Industrial Production': ['FRED.INDPRO'],
  'PPI': ['FRED.PPIFIS'],
  'Producer Price': ['FRED.PPIFIS'],
  'Housing Starts': ['FRED.HOUST'],
  'Building Permits': ['FRED.PERMIT'],
  'Durable Goods': ['FRED.DGORDER'],
  'New Home Sales': ['FRED.HSN1F'],
  'Consumer Sentiment': ['FRED.UMCSENT'],
  'Michigan': ['FRED.UMCSENT'],
  'JOLTS': ['FRED.JTSJOL'],
  'Trade Balance': ['FRED.BOPGSTB'],
};

function findIndicatorLinks(title: string): string[] | undefined {
  for (const [key, ids] of Object.entries(INDICATOR_LINKS)) {
    if (title.includes(key)) return ids;
  }
  return undefined;
}

// ── Fixed global events ──────────────────────────────
const FIXED_EVENTS: { date: string; name: string; country: string; impact: 'high' | 'medium'; category: string }[] = [
  { date: '2026-04-13', name: 'IMF/World Bank Spring Meetings', country: 'Global', impact: 'high', category: 'Summit' },
  { date: '2026-10-12', name: 'IMF/World Bank Annual Meetings', country: 'Global', impact: 'high', category: 'Summit' },
  { date: '2026-06-15', name: 'G7 Summit', country: 'Global', impact: 'high', category: 'Summit' },
  { date: '2026-11-22', name: 'G20 Summit', country: 'Global', impact: 'high', category: 'Summit' },
];

// ── Calendar event interface ──────────────────────────
interface CalendarEvent {
  date: string;
  time?: string;
  releaseId: number;
  name: string;
  country: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  type: 'economic' | 'earnings';
  sotwIndicators?: string[];
  actual?: string;
  outcome?: string;
  detail?: string;
  source?: string;
  symbol?: string;
  epsEstimate?: number | null;
  revenueEstimate?: number | null;
}

// ── Macro events from Perplexity-sourced schedule ──
async function fetchMacroEvents(from: string, to: string): Promise<CalendarEvent[]> {
  try {
    const { data, error } = await supabase
      .from('sotw_release_schedule')
      .select('name, country, category, impact, release_date, release_time, source, actual, outcome, detail')
      .gte('release_date', from)
      .lte('release_date', to)
      .order('release_date', { ascending: true });

    if (error || !data || data.length === 0) return [];

    return data.map((e: any) => ({
      date: typeof e.release_date === 'string' ? e.release_date.slice(0, 10) : e.release_date,
      time: e.release_time || undefined,
      releaseId: 0,
      name: e.name,
      country: e.country || 'US',
      impact: e.impact || 'medium',
      category: e.category || 'Other',
      type: 'economic' as const,
      sotwIndicators: findIndicatorLinks(e.name),
      actual: e.actual || undefined,
      outcome: e.outcome || undefined,
      detail: e.detail || undefined,
      source: e.source || 'Gemini Search',
    }));
  } catch {
    return [];
  }
}

// ── Earnings events ──
async function fetchEarningsEvents(from: string, to: string): Promise<CalendarEvent[]> {
  try {
    const { data, error } = await supabase
      .from('sotw_calendar_events')
      .select('*')
      .eq('event_type', 'earnings')
      .gte('date', from)
      .lte('date', to)
      .order('date', { ascending: true });

    if (error || !data || data.length === 0) return [];

    return data.map((e: any) => ({
      date: typeof e.date === 'string' ? e.date.slice(0, 10) : e.date,
      time: e.time || undefined,
      releaseId: 0,
      name: e.title,
      country: e.country || 'US',
      impact: 'high' as const,
      category: 'Earnings',
      type: 'earnings' as const,
      symbol: e.symbol || undefined,
      epsEstimate: e.eps_estimate ?? undefined,
      revenueEstimate: e.revenue_estimate ?? undefined,
      source: 'Gemini Search',
    }));
  } catch {
    return [];
  }
}

// ── Main handler ──────────────────────────────────────
interface CachedData { events: CalendarEvent[]; fetchedAt: number }
let cache: CachedData | null = null;
const CACHE_TTL = 60 * 60 * 1000;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    async function getAllEvents(from: string, to: string): Promise<CalendarEvent[]> {
      const [macro, earnings] = await Promise.all([
        fetchMacroEvents(from, to),
        fetchEarningsEvents(from, to),
      ]);

      // Fixed events (summits)
      const fixed = FIXED_EVENTS
        .filter(e => e.date >= from && e.date <= to)
        .map(e => ({ ...e, releaseId: 0, type: 'economic' as const }));

      // Deduplicate
      const macroKeys = new Set(macro.map(e => `${e.date}|${e.name}`));
      const dedupedFixed = fixed.filter(e => !macroKeys.has(`${e.date}|${e.name}`));

      return [...macro, ...dedupedFixed, ...earnings].sort((a, b) => a.date.localeCompare(b.date));
    }

    if (from && to) {
      const events = await getAllEvents(from, to);
      return NextResponse.json({
        events,
        meta: {
          total: events.length,
          economic: events.filter(e => e.type === 'economic').length,
          earnings: events.filter(e => e.type === 'earnings').length,
          highImpact: events.filter(e => e.impact === 'high').length,
          countries: [...new Set(events.map(e => e.country))].length,
          sources: ['Perplexity'],
          updatedAt: new Date().toISOString(),
        },
      });
    }

    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
      return NextResponse.json({ events: cache.events, meta: { updatedAt: new Date(cache.fetchedAt).toISOString(), cached: true } });
    }

    const today = new Date();
    const fromDate = new Date(today.getTime() - 7 * 86400000).toISOString().slice(0, 10);
    const toDate = new Date(today.getTime() + 90 * 86400000).toISOString().slice(0, 10);
    const events = await getAllEvents(fromDate, toDate);
    cache = { events, fetchedAt: Date.now() };

    return NextResponse.json({ events, meta: { updatedAt: new Date().toISOString() } });
  } catch {
    if (cache) {
      return NextResponse.json({ events: cache.events, meta: { updatedAt: new Date(cache.fetchedAt).toISOString(), cached: true } });
    }
    return NextResponse.json({ events: [], error: 'Failed to fetch calendar' }, { status: 500 });
  }
}
