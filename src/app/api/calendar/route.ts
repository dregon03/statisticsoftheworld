import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── SOTW indicator links for known events ──────────────────
const INDICATOR_LINKS: Record<string, string[]> = {
  'Consumer Price Index': ['FRED.CPIAUCSL'],
  'CPI': ['FRED.CPIAUCSL'],
  'Nonfarm Payrolls': ['FRED.PAYEMS', 'FRED.UNRATE'],
  'Non-Farm Employment Change': ['FRED.PAYEMS', 'FRED.UNRATE'],
  'Unemployment Rate': ['FRED.UNRATE'],
  'FOMC': ['FRED.FEDFUNDS'],
  'Fed Interest Rate Decision': ['FRED.FEDFUNDS'],
  'Federal Funds Rate': ['FRED.FEDFUNDS'],
  'GDP': ['FRED.GDP'],
  'Advance GDP': ['FRED.GDP'],
  'PCE Price Index': ['FRED.PCEPI'],
};

function findIndicatorLinks(title: string): string[] | undefined {
  for (const [key, ids] of Object.entries(INDICATOR_LINKS)) {
    if (title.includes(key)) return ids;
  }
  return undefined;
}

// ── Fixed global events (summits, intl org meetings) ──
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
  { date: '2026-01-19', name: 'World Economic Forum (Davos)', country: 'Global', impact: 'medium', category: 'Summit' },
];

// CB meeting scraping from cbrates.com
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
          meetings.push({
            date: currentDate,
            name: info.name,
            country: info.country,
            impact: info.impact,
            category: 'Central Bank',
          });
        }
      }
    }

    cbCache = { meetings, fetchedAt: Date.now() };
    return meetings;
  } catch {
    return cbCache?.meetings || [];
  }
}

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
  forecast?: string;
  previous?: string;
  actual?: string;
  revised?: string;
  source?: string;
  symbol?: string;
  epsEstimate?: number | null;
  revenueEstimate?: number | null;
  epsActual?: number | null;
  revenueActual?: number | null;
}

// Map calendar event names to FRED series for actuals enrichment
const EVENT_TO_FRED_SERIES: Record<string, string[]> = {
  'Consumer Price Index': ['CPIAUCSL', 'CPILFESL'],
  'CPI': ['CPIAUCSL'],
  'Core CPI': ['CPILFESL'],
  'Nonfarm Payrolls': ['PAYEMS'],
  'Non-Farm Employment Change': ['PAYEMS'],
  'Unemployment Rate': ['UNRATE'],
  'Unemployment Claims': ['ICSA'],
  'Jobless Claims': ['ICSA'],
  'GDP': ['GDP'],
  'Advance GDP': ['GDP'],
  'Retail Sales': ['RSAFS'],
  'PCE Price Index': ['PCEPI'],
  'Core PCE': ['PCEPILFE'],
  'PPI': ['PPIFIS'],
  'Producer Price Index': ['PPIFIS'],
  'Industrial Production': ['INDPRO'],
  'Durable Goods': ['DGORDER'],
  'Housing Starts': ['HOUST'],
  'Building Permits': ['PERMIT'],
  'New Home Sales': ['HSN1F'],
  'Trade Balance': ['BOPGSTB'],
  'JOLTS': ['JTSJOL'],
  'Michigan Consumer Sentiment': ['UMCSENT'],
  'Consumer Sentiment': ['UMCSENT'],
  'Federal Funds Rate': ['FEDFUNDS'],
};

// Fetch official actuals from sotw_macro_releases and enrich events
async function enrichWithOfficialActuals(events: CalendarEvent[], from: string, to: string): Promise<CalendarEvent[]> {
  try {
    const { data: releases } = await supabase
      .from('sotw_macro_releases')
      .select('series_id, release_date, actual, previous, revised, source')
      .gte('release_date', from)
      .lte('release_date', to);

    if (!releases || releases.length === 0) return events;

    // Index by series_id + date
    const releaseMap = new Map<string, typeof releases[0]>();
    for (const r of releases) {
      const date = typeof r.release_date === 'string' ? r.release_date.slice(0, 10) : r.release_date;
      releaseMap.set(`${r.series_id}|${date}`, r);
    }

    // Enrich events
    return events.map(event => {
      if (event.type !== 'economic' || event.country !== 'US') return event;

      // Find matching FRED series for this event
      for (const [eventKey, seriesIds] of Object.entries(EVENT_TO_FRED_SERIES)) {
        if (event.name.includes(eventKey)) {
          for (const seriesId of seriesIds) {
            const release = releaseMap.get(`${seriesId}|${event.date}`);
            if (release) {
              return {
                ...event,
                actual: release.actual || undefined,
                previous: release.previous || event.previous,
                revised: release.revised || undefined,
                source: 'FRED',
              };
            }
          }
        }
      }
      return event;
    });
  } catch {
    return events;
  }
}

// ── Cached events from Supabase (ForexFactory economic + Finnhub earnings) ──
async function fetchCachedEvents(from: string, to: string): Promise<{ economic: CalendarEvent[]; earnings: CalendarEvent[] }> {
  try {
    const { data, error } = await supabase
      .from('sotw_calendar_events')
      .select('*')
      .gte('date', from)
      .lte('date', to)
      .order('date', { ascending: true });

    if (error || !data || data.length === 0) return { economic: [], earnings: [] };

    const economic: CalendarEvent[] = [];
    const earnings: CalendarEvent[] = [];

    for (const e of data) {
      const date = typeof e.date === 'string' ? e.date.slice(0, 10) : e.date;
      const isEarnings = e.event_type === 'earnings';

      const event: CalendarEvent = {
        date,
        time: e.time || undefined,
        releaseId: 0,
        name: e.title,
        country: e.country || '',
        impact: e.impact || 'low',
        category: e.category || 'Other',
        type: isEarnings ? 'earnings' : 'economic',
        sotwIndicators: isEarnings ? undefined : findIndicatorLinks(e.title),
        forecast: e.forecast || undefined,
        previous: e.previous || undefined,
        symbol: e.symbol || undefined,
        epsEstimate: e.eps_estimate ?? undefined,
        revenueEstimate: e.revenue_estimate ?? undefined,
      };

      if (isEarnings) {
        earnings.push(event);
      } else {
        economic.push(event);
      }
    }

    return { economic, earnings };
  } catch {
    return { economic: [], earnings: [] };
  }
}

// ── Live ForexFactory fetch (fallback if Supabase cache is empty) ──
async function fetchFFLive(): Promise<CalendarEvent[]> {
  try {
    const resp = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
      headers: { 'User-Agent': 'SOTW/2.0' },
      next: { revalidate: 3600 },
    });
    if (!resp.ok) return [];

    const raw = await resp.json();
    const CURRENCY_MAP: Record<string, string> = {
      USD: 'US', EUR: 'EU', GBP: 'UK', JPY: 'JP', CNY: 'CN',
      CAD: 'CA', AUD: 'AU', NZD: 'NZ', CHF: 'CH', KRW: 'KR',
      INR: 'IN', BRL: 'BR', MXN: 'MX', ZAR: 'ZA', SGD: 'SG',
    };
    const IMPACT_MAP: Record<string, 'high' | 'medium' | 'low'> = {
      High: 'high', Medium: 'medium', Low: 'low',
    };

    return (raw as any[]).map((e: any) => ({
      date: (e.date || '').slice(0, 10),
      releaseId: 0,
      name: e.title || '',
      country: CURRENCY_MAP[e.country] || (e.country || '').slice(0, 2),
      impact: IMPACT_MAP[e.impact] || 'low',
      category: categorizeEvent(e.title || ''),
      type: 'economic' as const,
      sotwIndicators: findIndicatorLinks(e.title || ''),
      forecast: e.forecast || undefined,
      previous: e.previous || undefined,
    }));
  } catch {
    return [];
  }
}

function categorizeEvent(title: string): string {
  const t = title.toLowerCase();
  if (/cpi|ppi|inflation|pce|price/.test(t)) return 'Inflation';
  if (/employment|payroll|jobless|unemployment|labor|jobs|adp/.test(t)) return 'Labor';
  if (/gdp|growth/.test(t)) return 'GDP';
  if (/rate decision|interest rate|fomc|monetary policy/.test(t)) return 'Central Bank';
  if (/housing|home sale|building permit|mortgage/.test(t)) return 'Housing';
  if (/retail|consumer|spending|confidence|sentiment/.test(t)) return 'Consumer';
  if (/manufacturing|pmi|industrial|production|factory/.test(t)) return 'Production';
  if (/trade|export|import|current account|balance/.test(t)) return 'Trade';
  if (/bond|treasury|auction|yield/.test(t)) return 'Fixed Income';
  if (/speaks|speech|testimony|press conference/.test(t)) return 'Speech';
  return 'Other';
}

// ── FRED (confirmed releases only — no tentative dates) ──
// Only used for past weeks where ForexFactory data isn't cached
const RELEASES: Record<number, { name: string; country: string; impact: 'high' | 'medium' | 'low'; category: string; sotwIndicators?: string[] }> = {
  10:  { name: 'Consumer Price Index (CPI)', country: 'US', impact: 'high', category: 'Inflation', sotwIndicators: ['FRED.CPIAUCSL'] },
  50:  { name: 'Employment Situation (Nonfarm Payrolls)', country: 'US', impact: 'high', category: 'Labor', sotwIndicators: ['FRED.PAYEMS', 'FRED.UNRATE'] },
  46:  { name: 'Producer Price Index (PPI)', country: 'US', impact: 'high', category: 'Inflation' },
  54:  { name: 'Personal Income & Outlays (PCE)', country: 'US', impact: 'high', category: 'Consumer' },
  101: { name: 'FOMC Interest Rate Decision', country: 'US', impact: 'high', category: 'Central Bank', sotwIndicators: ['FRED.FEDFUNDS'] },
  13:  { name: 'Industrial Production & Capacity Utilization', country: 'US', impact: 'high', category: 'Production' },
  97:  { name: 'New Home Sales', country: 'US', impact: 'high', category: 'Housing' },
  27:  { name: 'Housing Starts & Building Permits', country: 'US', impact: 'high', category: 'Housing' },
  291: { name: 'Existing Home Sales', country: 'US', impact: 'high', category: 'Housing' },
  194: { name: 'ADP National Employment Report', country: 'US', impact: 'high', category: 'Labor' },
  47:  { name: 'Productivity & Costs', country: 'US', impact: 'high', category: 'Labor' },
  323: { name: 'PCE Inflation Rate (Trimmed Mean)', country: 'US', impact: 'high', category: 'Inflation' },
  180: { name: 'Weekly Jobless Claims', country: 'US', impact: 'medium', category: 'Labor' },
  188: { name: 'Import & Export Price Indexes', country: 'US', impact: 'medium', category: 'Trade' },
  22:  { name: 'Advance Monthly Retail Sales', country: 'US', impact: 'high', category: 'Consumer' },
  17:  { name: 'Gross Domestic Product (GDP)', country: 'US', impact: 'high', category: 'GDP', sotwIndicators: ['FRED.GDP'] },
  21:  { name: 'Durable Goods (New Orders)', country: 'US', impact: 'high', category: 'Production' },
  267: { name: 'GDP (Eurostat)', country: 'EU', impact: 'high', category: 'GDP' },
  251: { name: 'Harmonized CPI (HICP)', country: 'EU', impact: 'high', category: 'Inflation' },
};

async function fetchFredConfirmed(from: string, to: string): Promise<CalendarEvent[]> {
  const apiKey = process.env.FRED_API_KEY || '74b554c354e549e1e3087a689608fc29';
  // NO include_release_dates_with_no_data — only confirmed/published releases
  const url = `https://api.stlouisfed.org/fred/releases/dates?api_key=${apiKey}&file_type=json&sort_order=asc&limit=1000&realtime_start=${from}&realtime_end=${to}`;

  try {
    const resp = await fetch(url, { next: { revalidate: 3600 } });
    if (!resp.ok) return [];

    const data = await resp.json();
    const releaseDates = data.release_dates || [];

    const events: CalendarEvent[] = [];
    const seen = new Set<string>();

    for (const rd of releaseDates) {
      const info = RELEASES[rd.release_id];
      if (!info) continue;

      const key = `${rd.date}-${rd.release_id}`;
      if (seen.has(key)) continue;
      seen.add(key);

      events.push({
        date: rd.date,
        releaseId: rd.release_id,
        name: info.name,
        country: info.country,
        impact: info.impact,
        category: info.category,
        type: 'economic',
        sotwIndicators: info.sotwIndicators,
      });
    }

    return events;
  } catch {
    return [];
  }
}

// ── Major earnings (Finnhub free tier) ──
const MAJOR_SYMBOLS = new Set([
  'AAPL','MSFT','GOOGL','AMZN','NVDA','META','TSLA',
  'AVGO','CRM','ORCL','ADBE','AMD','INTC','CSCO','QCOM','TXN','NOW','NFLX','SHOP','SNOW','NET','PLTR','UBER','ABNB',
  'JPM','GS','MS','BAC','WFC','C','V','MA','PYPL','SQ','COIN',
  'WMT','COST','HD','MCD','SBUX','NKE','DIS',
  'UNH','JNJ','PFE','ABBV','LLY','MRK','TMO',
  'XOM','CVX','BA','CAT','GE','DE',
  'KO','PEP','PG',
]);

async function fetchEarningsCalendar(from: string, to: string): Promise<CalendarEvent[]> {
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
      }));
  } catch {
    return [];
  }
}

interface CachedData {
  events: CalendarEvent[];
  fetchedAt: number;
}

let cache: CachedData | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    async function getFixedEvents(from: string, to: string): Promise<CalendarEvent[]> {
      const cbMeetings = await fetchCBMeetings();
      const all = [...FIXED_EVENTS_2026, ...cbMeetings];
      return all
        .filter(e => e.date >= from && e.date <= to)
        .map(e => ({
          ...e,
          releaseId: 0,
          type: 'economic' as const,
        }));
    }

    async function getAllEvents(from: string, to: string): Promise<CalendarEvent[]> {
      // 1. Try Supabase cache (ForexFactory economic + Finnhub earnings from ETL)
      const cached = await fetchCachedEvents(from, to);
      let econ = cached.economic;
      let earnings = cached.earnings;

      // 2. Fallback for economic: live ForexFactory → FRED confirmed
      if (econ.length === 0) {
        const ffLive = await fetchFFLive();
        econ = ffLive.filter(e => e.date >= from && e.date <= to);
        if (econ.length === 0) {
          econ = await fetchFredConfirmed(from, to);
        }
      }

      // 3. Fallback for earnings: live Finnhub
      if (earnings.length === 0) {
        earnings = await fetchEarningsCalendar(from, to);
      }

      // 4. Fixed events (summits, CB meetings)
      const fixed = await getFixedEvents(from, to);

      // Deduplicate: if ForexFactory has a CB meeting, don't also show the hardcoded one
      const econKeys = new Set(econ.map(e => `${e.date}|${e.category}`));
      const dedupedFixed = fixed.filter(e => !econKeys.has(`${e.date}|${e.category}`));

      // 5. Enrich with official actuals from sotw_macro_releases
      const allEvents = [...econ, ...dedupedFixed, ...earnings].sort((a, b) => a.date.localeCompare(b.date));
      return enrichWithOfficialActuals(allEvents, from, to);
    }

    if (from && to) {
      const events = await getAllEvents(from, to);
      const econCount = events.filter(e => e.type === 'economic').length;
      const earningsCount = events.filter(e => e.type === 'earnings').length;
      const highCount = events.filter(e => e.impact === 'high').length;
      const countries = [...new Set(events.map(e => e.country))].length;
      return NextResponse.json({
        events,
        meta: {
          total: events.length,
          economic: econCount,
          earnings: earningsCount,
          highImpact: highCount,
          countries,
          sources: ['ForexFactory', 'Finnhub', 'FRED', 'cbrates.com'],
          updatedAt: new Date().toISOString(),
        },
      });
    }

    // Default: current + next 90 days
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
      return NextResponse.json({
        events: cache.events,
        meta: { updatedAt: new Date(cache.fetchedAt).toISOString(), cached: true },
      });
    }

    const today = new Date();
    const fromDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const toDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const events = await getAllEvents(fromDate, toDate);
    cache = { events, fetchedAt: Date.now() };

    return NextResponse.json({
      events,
      meta: { updatedAt: new Date().toISOString() },
    });
  } catch {
    if (cache) {
      return NextResponse.json({
        events: cache.events,
        meta: { updatedAt: new Date(cache.fetchedAt).toISOString(), cached: true },
      });
    }
    return NextResponse.json({ events: [], error: 'Failed to fetch calendar' }, { status: 500 });
  }
}
