import { NextResponse } from 'next/server';

interface YahooEvent {
  event: string;
  countryCode: string;
  eventTime: number;
  period: string;
  actual: string;
  estimate: string;
  prior: string;
  description: string;
  importance?: string;
}

interface CachedData {
  events: YahooEvent[];
  fetchedAt: number;
}

let cache: CachedData | null = null;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

async function fetchYahooCalendar(): Promise<YahooEvent[]> {
  const url = 'https://finance.yahoo.com/calendar/economic';
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    next: { revalidate: 900 }, // 15 min cache
  });

  const html = await resp.text();

  // Yahoo embeds JSON in script tags with data-ttl attribute
  const pattern = /data-ttl="5">([\s\S]*?)<\/script/g;
  let match;
  const allEvents: YahooEvent[] = [];

  while ((match = pattern.exec(html)) !== null) {
    const content = match[1];
    if (!content.includes('economicEvents')) continue;

    try {
      // Decode HTML entities
      const decoded = content
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'");

      const wrapper = JSON.parse(decoded);
      const bodyStr = wrapper.body || '';
      const body = JSON.parse(bodyStr);
      const eventGroups = body?.finance?.result?.economicEvents || [];

      for (const group of eventGroups) {
        const records = group.records || [];
        for (const record of records) {
          if (record.economicEvents) {
            allEvents.push({
              event: record.event || '',
              countryCode: record.countryCode || '',
              eventTime: record.eventTime || group.timestamp || 0,
              period: record.period || '',
              actual: record.actual || '',
              estimate: record.estimate || '',
              prior: record.prior || '',
              description: record.description || '',
              importance: record.importance || '',
            });
          }
        }
      }
    } catch {
      // Skip unparseable blocks
    }
  }

  return allEvents;
}

export async function GET() {
  try {
    // Check cache
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
      return NextResponse.json(cache.events);
    }

    const events = await fetchYahooCalendar();
    cache = { events, fetchedAt: Date.now() };
    return NextResponse.json(events);
  } catch (error) {
    // Return cached data if available, even if stale
    if (cache) {
      return NextResponse.json(cache.events);
    }
    return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 });
  }
}
