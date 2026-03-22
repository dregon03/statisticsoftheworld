import { NextResponse } from 'next/server';

// ── FRED Release metadata: ID → display info ──────────────────
interface ReleaseInfo {
  name: string;
  country: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  sotwIndicators?: string[]; // link to SOTW indicators
}

const RELEASES: Record<number, ReleaseInfo> = {
  // ── US High Impact ──
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

  // ── US Medium Impact ──
  180: { name: 'Weekly Jobless Claims', country: 'US', impact: 'medium', category: 'Labor' },
  188: { name: 'Import & Export Price Indexes', country: 'US', impact: 'medium', category: 'Trade' },
  11:  { name: 'Employment Cost Index', country: 'US', impact: 'medium', category: 'Labor' },
  290: { name: 'Wholesale Trade: Sales & Inventories', country: 'US', impact: 'medium', category: 'Trade' },
  321: { name: 'Empire State Manufacturing Survey', country: 'US', impact: 'medium', category: 'Production' },
  236: { name: 'Housing Affordability Index', country: 'US', impact: 'medium', category: 'Housing' },
  313: { name: 'Sticky Price CPI', country: 'US', impact: 'medium', category: 'Inflation' },
  315: { name: 'Median CPI', country: 'US', impact: 'medium', category: 'Inflation' },
  148: { name: 'Building Permits', country: 'US', impact: 'medium', category: 'Housing' },
  296: { name: 'Housing Vacancies & Homeownership', country: 'US', impact: 'medium', category: 'Housing' },
  22:  { name: 'Advance Monthly Retail Sales', country: 'US', impact: 'high', category: 'Consumer' },
  17:  { name: 'Gross Domestic Product (GDP)', country: 'US', impact: 'high', category: 'GDP', sotwIndicators: ['FRED.GDP'] },
  25:  { name: 'Manufacturing & Trade Inventories', country: 'US', impact: 'medium', category: 'Production' },
  53:  { name: 'Current Employment Statistics', country: 'US', impact: 'medium', category: 'Labor' },
  21:  { name: 'Durable Goods (New Orders)', country: 'US', impact: 'high', category: 'Production' },
  110: { name: 'Personal Income by State', country: 'US', impact: 'low', category: 'Consumer' },
  112: { name: 'State Employment & Unemployment', country: 'US', impact: 'low', category: 'Labor' },
  80:  { name: 'Treasury Bulletin', country: 'US', impact: 'low', category: 'Government' },

  // ── International ──
  267: { name: 'GDP (Eurostat)', country: 'EU', impact: 'high', category: 'GDP' },
  251: { name: 'Harmonized CPI (HICP)', country: 'EU', impact: 'high', category: 'Inflation' },
  201: { name: 'International Consumer Prices', country: 'Global', impact: 'medium', category: 'Inflation' },
  202: { name: 'International Unemployment Rates', country: 'Global', impact: 'medium', category: 'Labor' },
  204: { name: 'International GDP per Capita Comparison', country: 'Global', impact: 'medium', category: 'GDP' },
  230: { name: 'International Manufacturing Productivity', country: 'Global', impact: 'medium', category: 'Production' },
};

const RELEASE_IDS = Object.keys(RELEASES).map(Number);

// ── Fixed global events (summits, intl org meetings — NOT central banks) ──
// Central bank meetings are scraped from cbrates.com via /api/calendar/cb-meetings
interface FixedEvent {
  date: string;
  name: string;
  country: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
}

const FIXED_EVENTS_2026: FixedEvent[] = [
  // IMF/World Bank
  { date: '2026-04-13', name: 'IMF/World Bank Spring Meetings', country: 'Global', impact: 'high', category: 'Summit' },
  { date: '2026-10-12', name: 'IMF/World Bank Annual Meetings (Bangkok)', country: 'Global', impact: 'high', category: 'Summit' },
  // G7/G20
  { date: '2026-06-15', name: 'G7 Summit', country: 'Global', impact: 'high', category: 'Summit' },
  { date: '2026-11-22', name: 'G20 Summit', country: 'Global', impact: 'high', category: 'Summit' },
  // OPEC+
  { date: '2026-03-01', name: 'OPEC+ Meeting', country: 'Global', impact: 'high', category: 'Energy' },
  { date: '2026-06-01', name: 'OPEC+ Meeting', country: 'Global', impact: 'high', category: 'Energy' },
  { date: '2026-09-01', name: 'OPEC+ Meeting', country: 'Global', impact: 'high', category: 'Energy' },
  { date: '2026-12-01', name: 'OPEC+ Meeting', country: 'Global', impact: 'high', category: 'Energy' },
  // WEF Davos
  { date: '2026-01-19', name: 'World Economic Forum (Davos)', country: 'Global', impact: 'medium', category: 'Summit' },
];

// CB code → display info for scraped meetings
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
const CB_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

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
  releaseId: number;
  name: string;
  country: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  type: 'economic' | 'earnings';
  sotwIndicators?: string[];
  // Earnings-specific fields
  symbol?: string;
  epsEstimate?: number | null;
  revenueEstimate?: number | null;
}

// ── Major companies to track for earnings ──────────────────
const MAJOR_SYMBOLS = new Set([
  // Mag 7
  'AAPL','MSFT','GOOGL','AMZN','NVDA','META','TSLA',
  // Big Tech
  'AVGO','CRM','ORCL','ADBE','AMD','INTC','CSCO','QCOM','TXN','NOW','NFLX','SHOP','SNOW','NET','PLTR','UBER','ABNB',
  // Finance
  'JPM','GS','MS','BAC','WFC','C','V','MA','PYPL','SQ','COIN',
  // Consumer/Retail
  'WMT','COST','HD','MCD','SBUX','NKE','DIS',
  // Healthcare
  'UNH','JNJ','PFE','ABBV','LLY','MRK','TMO',
  // Industrial/Energy
  'XOM','CVX','BA','CAT','GE','DE',
  // Consumer Staples
  'KO','PEP','PG',
]);

interface CachedData {
  events: CalendarEvent[];
  fetchedAt: number;
}

let cache: CachedData | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function fetchFredCalendar(from: string, to: string): Promise<CalendarEvent[]> {
  const apiKey = process.env.FRED_API_KEY || '74b554c354e549e1e3087a689608fc29';
  const url = `https://api.stlouisfed.org/fred/releases/dates?api_key=${apiKey}&file_type=json&include_release_dates_with_no_data=true&sort_order=asc&limit=1000&realtime_start=${from}&realtime_end=${to}`;

  const resp = await fetch(url, { next: { revalidate: 3600 } });
  if (!resp.ok) return [];

  const data = await resp.json();
  const releaseDates = data.release_dates || [];

  const events: CalendarEvent[] = [];
  const seen = new Set<string>(); // dedupe by date+releaseId
  const releaseCount: Record<number, number> = {}; // track how many times each release appears

  // First pass: count occurrences per release to detect daily/continuous releases
  for (const rd of releaseDates) {
    releaseCount[rd.release_id] = (releaseCount[rd.release_id] || 0) + 1;
  }

  // Calculate days in range to set threshold proportionally
  const fromD = new Date(from);
  const toD = new Date(to);
  const daysInRange = Math.max(1, Math.ceil((toD.getTime() - fromD.getTime()) / (24 * 60 * 60 * 1000)));
  const threshold = Math.max(15, Math.floor(daysInRange * 0.6));

  // Releases appearing too frequently are "continuous" — skip them
  const continuousReleases = new Set(
    Object.entries(releaseCount)
      .filter(([, count]) => count >= threshold)
      .map(([id]) => Number(id))
  );

  for (const rd of releaseDates) {
    const releaseId = rd.release_id;
    const info = RELEASES[releaseId];
    if (!info) continue;
    if (continuousReleases.has(releaseId)) continue; // skip daily releases

    const key = `${rd.date}-${releaseId}`;
    if (seen.has(key)) continue;
    seen.add(key);

    events.push({
      date: rd.date,
      releaseId,
      name: info.name,
      country: info.country,
      impact: info.impact,
      category: info.category,
      type: 'economic',
      sotwIndicators: info.sotwIndicators,
    });
  }

  return events;
}

async function fetchEarningsCalendar(from: string, to: string): Promise<CalendarEvent[]> {
  const token = process.env.FINNHUB_KEY || 'd6vl62hr01qiiutc8p6gd6vl62hr01qiiutc8p70';
  const url = `https://finnhub.io/api/v1/calendar/earnings?from=${from}&to=${to}&token=${token}`;

  try {
    const resp = await fetch(url, { next: { revalidate: 3600 } });
    if (!resp.ok) return [];

    const data = await resp.json();
    const all = data.earningsCalendar || [];

    // Filter to major companies only
    return all
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

    // If custom date range provided, fetch directly (no cache)
    if (from && to) {
      const [econ, earnings] = await Promise.all([
        fetchFredCalendar(from, to),
        fetchEarningsCalendar(from, to),
      ]);
      const fixed = await getFixedEvents(from, to);
      const events = [...econ, ...fixed, ...earnings].sort((a, b) => a.date.localeCompare(b.date));
      return NextResponse.json({ events, source: 'FRED + Finnhub' });
    }

    // Default: next 90 days (to catch quarterly earnings)
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
      return NextResponse.json({ events: cache.events, source: 'FRED + Finnhub', cached: true });
    }

    const today = new Date();
    const fromDate = today.toISOString().slice(0, 10);
    const toDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [econ, earnings] = await Promise.all([
      fetchFredCalendar(fromDate, toDate),
      fetchEarningsCalendar(fromDate, toDate),
    ]);
    const fixed = await getFixedEvents(fromDate, toDate);
    const events = [...econ, ...fixed, ...earnings].sort((a, b) => a.date.localeCompare(b.date));
    cache = { events, fetchedAt: Date.now() };

    return NextResponse.json({ events, source: 'FRED + Finnhub' });
  } catch {
    if (cache) {
      return NextResponse.json({ events: cache.events, source: 'FRED + Finnhub', cached: true });
    }
    return NextResponse.json({ events: [], error: 'Failed to fetch calendar' }, { status: 500 });
  }
}
