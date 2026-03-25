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
  'Nonfarm Payrolls': ['FRED.PAYEMS', 'FRED.UNRATE'],
  'Non-Farm Employment Change': ['FRED.PAYEMS', 'FRED.UNRATE'],
  'Unemployment Rate': ['FRED.UNRATE'],
  'Unemployment Claims': ['FRED.ICSA'],
  'Initial Jobless Claims': ['FRED.ICSA'],
  'FOMC': ['FRED.FEDFUNDS'],
  'Fed Interest Rate Decision': ['FRED.FEDFUNDS'],
  'Federal Funds Rate': ['FRED.FEDFUNDS'],
  'GDP': ['FRED.GDP'],
  'Advance GDP': ['FRED.GDP'],
  'PCE Price Index': ['FRED.PCEPI'],
  'Retail Sales': ['FRED.RSAFS'],
  'Industrial Production': ['FRED.INDPRO'],
  'Producer Price Index': ['FRED.PPIFIS'],
  'PPI': ['FRED.PPIFIS'],
  'Housing Starts': ['FRED.HOUST'],
  'Building Permits': ['FRED.PERMIT'],
  'Durable Goods': ['FRED.DGORDER'],
  'New Home Sales': ['FRED.HSN1F'],
  'Consumer Sentiment': ['FRED.UMCSENT'],
  'Michigan Consumer Sentiment': ['FRED.UMCSENT'],
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
interface FixedEvent {
  date: string;
  name: string;
  country: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
}

const FIXED_EVENTS_2026: FixedEvent[] = [
  { date: '2026-04-13', name: 'IMF/World Bank Spring Meetings', country: 'Global', impact: 'high', category: 'Summit' },
  { date: '2026-10-12', name: 'IMF/World Bank Annual Meetings (Bangkok)', country: 'Global', impact: 'high', category: 'Summit' },
  { date: '2026-06-15', name: 'G7 Summit', country: 'Global', impact: 'high', category: 'Summit' },
  { date: '2026-11-22', name: 'G20 Summit', country: 'Global', impact: 'high', category: 'Summit' },
  { date: '2026-03-01', name: 'OPEC+ Meeting', country: 'Global', impact: 'high', category: 'Energy' },
  { date: '2026-06-01', name: 'OPEC+ Meeting', country: 'Global', impact: 'high', category: 'Energy' },
  { date: '2026-09-01', name: 'OPEC+ Meeting', country: 'Global', impact: 'high', category: 'Energy' },
  { date: '2026-12-01', name: 'OPEC+ Meeting', country: 'Global', impact: 'high', category: 'Energy' },
];

// ── CB meeting scraping ──────────────────────────────
const CB_DISPLAY: Record<string, { country: string; name: string; impact: 'high' | 'medium' }> = {
  Fed:  { country: 'US', name: 'Fed Interest Rate Decision', impact: 'high' },
  ECB:  { country: 'EU', name: 'ECB Interest Rate Decision', impact: 'high' },
  BOE:  { country: 'UK', name: 'BOE Interest Rate Decision', impact: 'high' },
  BOJ:  { country: 'JP', name: 'BOJ Interest Rate Decision', impact: 'high' },
  BOC:  { country: 'CA', name: 'BOC Interest Rate Decision', impact: 'high' },
  RBA:  { country: 'AU', name: 'RBA Interest Rate Decision', impact: 'medium' },
  RBNZ: { country: 'NZ', name: 'RBNZ Interest Rate Decision', impact: 'medium' },
  SNB:  { country: 'CH', name: 'SNB Interest Rate Decision', impact: 'medium' },
  RBI:  { country: 'IN', name: 'RBI Interest Rate Decision', impact: 'medium' },
  BCB:  { country: 'BR', name: 'BCB Interest Rate Decision', impact: 'medium' },
  PBoC: { country: 'CN', name: 'PBoC Interest Rate Decision', impact: 'high' },
  SARB: { country: 'ZA', name: 'SARB Interest Rate Decision', impact: 'medium' },
};

let cbCache: { meetings: FixedEvent[]; fetchedAt: number } | null = null;
const CB_CACHE_TTL = 24 * 60 * 60 * 1000;

async function fetchCBMeetings(): Promise<FixedEvent[]> {
  if (cbCache && Date.now() - cbCache.fetchedAt < CB_CACHE_TTL) {
    return cbCache.meetings;
  }
  try {
    const resp = await fetch('https://www.cbrates.com/meetings.htm', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!resp.ok) return cbCache?.meetings || [];
    const html = await resp.text();
    const cellMatches = html.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
    const cells = cellMatches.map(c => c.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').trim());
    const MONTH_MAP: Record<string, number> = {
      Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
      Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
    };
    const meetings: FixedEvent[] = [];
    let currentDate: string | null = null;
    const year = new Date().getFullYear();
    for (const cell of cells) {
      const dateMatch = cell.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})$/);
      if (dateMatch) {
        const month = MONTH_MAP[dateMatch[1]];
        const day = parseInt(dateMatch[2]);
        currentDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        continue;
      }
      if (cell.includes(':') && !cell.includes('Central Bank') && currentDate) {
        const codeMatch = cell.match(/\((\w+)\)/);
        const code = codeMatch ? codeMatch[1] : '';
        const info = CB_DISPLAY[code];
        if (info) {
          meetings.push({ date: currentDate, name: info.name, country: info.country, impact: info.impact, category: 'Central Bank' });
        }
      }
    }
    cbCache = { meetings, fetchedAt: Date.now() };
    return meetings;
  } catch {
    return cbCache?.meetings || [];
  }
}

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
  previous?: string;
  revised?: string;
  source?: string;
  symbol?: string;
  epsEstimate?: number | null;
  revenueEstimate?: number | null;
}

// ── Macro events from sotw_macro_releases (FRED official data) ──
async function fetchMacroEvents(from: string, to: string): Promise<CalendarEvent[]> {
  try {
    const { data, error } = await supabase
      .from('sotw_macro_releases')
      .select('series_id, name, category, impact, release_date, release_time, actual, previous, revised, source')
      .gte('release_date', from)
      .lte('release_date', to)
      .order('release_date', { ascending: true });

    if (error || !data || data.length === 0) return [];

    // Deduplicate: multiple series can share a release date (e.g., CPI + Core CPI)
    // Show the primary series for each release
    return data.map((e: any) => {
      const date = typeof e.release_date === 'string' ? e.release_date.slice(0, 10) : e.release_date;
      return {
        date,
        time: e.release_time || undefined,
        releaseId: 0,
        name: e.name,
        country: 'US',
        impact: e.impact || 'medium',
        category: e.category || 'Other',
        type: 'economic' as const,
        sotwIndicators: findIndicatorLinks(e.name),
        actual: e.actual || undefined,
        previous: e.previous || undefined,
        revised: e.revised || undefined,
        source: 'FRED',
      };
    });
  } catch {
    return [];
  }
}

// ── Scheduled future events from sotw_release_schedule (BLS/BEA/FRED official) ──
async function fetchScheduledEvents(from: string, to: string): Promise<CalendarEvent[]> {
  try {
    const { data, error } = await supabase
      .from('sotw_release_schedule')
      .select('series_id, name, category, impact, release_date, release_time, source, source_url, verified')
      .gte('release_date', from)
      .lte('release_date', to)
      .order('release_date', { ascending: true });

    if (error || !data || data.length === 0) return [];

    return data.map((e: any) => {
      const date = typeof e.release_date === 'string' ? e.release_date.slice(0, 10) : e.release_date;
      return {
        date,
        time: e.release_time || undefined,
        releaseId: 0,
        name: e.name,
        country: 'US',
        impact: e.impact || 'medium',
        category: e.category || 'Other',
        type: 'economic' as const,
        sotwIndicators: findIndicatorLinks(e.name),
        source: e.source,
      };
    });
  } catch {
    return [];
  }
}

// ── Earnings from sotw_calendar_events (Finnhub) ──
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

    return data.map((e: any) => {
      const date = typeof e.date === 'string' ? e.date.slice(0, 10) : e.date;
      return {
        date,
        releaseId: 0,
        name: e.title,
        country: e.country || 'US',
        impact: 'high' as const,
        category: 'Earnings',
        type: 'earnings' as const,
        symbol: e.symbol || undefined,
        epsEstimate: e.eps_estimate ?? undefined,
        revenueEstimate: e.revenue_estimate ?? undefined,
        source: 'Finnhub',
      };
    });
  } catch {
    return [];
  }
}

// ── Live Finnhub fallback ──
const MAJOR_SYMBOLS = new Set([
  'AAPL','MSFT','GOOGL','AMZN','NVDA','META','TSLA',
  'AVGO','CRM','ORCL','ADBE','AMD','INTC','CSCO','QCOM','TXN','NOW','NFLX','SHOP','SNOW','NET','PLTR','UBER','ABNB',
  'JPM','GS','MS','BAC','WFC','C','V','MA','PYPL','SQ','COIN',
  'WMT','COST','HD','MCD','SBUX','NKE','DIS',
  'UNH','JNJ','PFE','ABBV','LLY','MRK','TMO',
  'XOM','CVX','BA','CAT','GE','DE',
  'KO','PEP','PG',
  'RY','TD','ENB','CNR','BMO',
  'SHEL','AZN','HSBC','UL','BP',
  'ASML','SAP','NVO',
  'TM','SONY','SSNLF','TCEHY','BHP',
]);

async function fetchEarningsLive(from: string, to: string): Promise<CalendarEvent[]> {
  const token = process.env.FINNHUB_KEY || 'd6vl62hr01qiiutc8p6gd6vl62hr01qiiutc8p70';
  const url = `https://finnhub.io/api/v1/calendar/earnings?from=${from}&to=${to}&token=${token}`;
  try {
    const resp = await fetch(url, { next: { revalidate: 3600 } });
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.earningsCalendar || [])
      .filter((e: any) => MAJOR_SYMBOLS.has(e.symbol))
      .map((e: any) => ({
        date: e.date,
        releaseId: 0,
        name: `${e.symbol} Earnings`,
        country: 'US',
        impact: 'high' as const,
        category: 'Earnings',
        type: 'earnings' as const,
        symbol: e.symbol,
        epsEstimate: e.epsEstimate,
        revenueEstimate: e.revenueEstimate,
        source: 'Finnhub',
      }));
  } catch {
    return [];
  }
}

// ── Main handler ──────────────────────────────────────
interface CachedData { events: CalendarEvent[]; fetchedAt: number; }
let cache: CachedData | null = null;
const CACHE_TTL = 60 * 60 * 1000;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    async function getAllEvents(from: string, to: string): Promise<CalendarEvent[]> {
      // 1. Past macro events with actuals (sotw_macro_releases — FRED data)
      const macroActuals = await fetchMacroEvents(from, to);

      // 2. Future scheduled events (sotw_release_schedule — BLS/BEA/FRED official)
      const scheduled = await fetchScheduledEvents(from, to);

      // 3. Merge: actuals take priority over schedule for same series+date
      const actualKeys = new Set(macroActuals.map(e => `${e.date}|${e.name}`));
      const dedupedSchedule = scheduled.filter(e => !actualKeys.has(`${e.date}|${e.name}`));
      const macro = [...macroActuals, ...dedupedSchedule];

      // 4. Earnings from Supabase cache, fallback to live Finnhub
      let earnings = await fetchEarningsEvents(from, to);
      if (earnings.length === 0) {
        earnings = await fetchEarningsLive(from, to);
      }

      // 5. CB meetings + fixed events
      const cbMeetings = await fetchCBMeetings();
      const fixed = [...FIXED_EVENTS_2026, ...cbMeetings]
        .filter(e => e.date >= from && e.date <= to)
        .map(e => ({ ...e, releaseId: 0, type: 'economic' as const, sotwIndicators: findIndicatorLinks(e.name) }));

      // Deduplicate CB meetings if already covered
      const macroKeys = new Set(macro.map(e => `${e.date}|${e.category}`));
      const dedupedFixed = fixed.filter(e => !macroKeys.has(`${e.date}|${e.category}`));

      return [...macro, ...dedupedFixed, ...earnings].sort((a, b) => a.date.localeCompare(b.date));
    }

    if (from && to) {
      const events = await getAllEvents(from, to);
      const econCount = events.filter(e => e.type === 'economic').length;
      const earningsCount = events.filter(e => e.type === 'earnings').length;
      const highCount = events.filter(e => e.impact === 'high').length;
      return NextResponse.json({
        events,
        meta: {
          total: events.length,
          economic: econCount,
          earnings: earningsCount,
          highImpact: highCount,
          countries: [...new Set(events.map(e => e.country))].length,
          sources: ['FRED', 'Finnhub', 'cbrates.com'],
          updatedAt: new Date().toISOString(),
        },
      });
    }

    // Default: current + next 90 days
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
