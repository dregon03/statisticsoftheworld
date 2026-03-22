import { NextResponse } from 'next/server';

interface CBMeeting {
  date: string;
  country: string;
  bank: string;
  code: string;
}

const MONTHS: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};

// Map CB codes to our country codes + impact levels
const CB_MAP: Record<string, { country: string; impact: 'high' | 'medium' }> = {
  Fed: { country: 'US', impact: 'high' },
  ECB: { country: 'EU', impact: 'high' },
  BOE: { country: 'UK', impact: 'high' },
  BOJ: { country: 'JP', impact: 'high' },
  BOC: { country: 'CA', impact: 'high' },
  RBA: { country: 'AU', impact: 'medium' },
  RBNZ: { country: 'NZ', impact: 'medium' },
  SNB: { country: 'CH', impact: 'medium' },
  RBI: { country: 'IN', impact: 'medium' },
  BCB: { country: 'BR', impact: 'medium' },
  PBoC: { country: 'CN', impact: 'high' },
  SARB: { country: 'ZA', impact: 'medium' },
};

let cache: { meetings: CBMeeting[]; fetchedAt: number } | null = null;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

async function scrapeCBRates(): Promise<CBMeeting[]> {
  const resp = await fetch('https://www.cbrates.com/meetings.htm', {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  if (!resp.ok) return [];

  const html = await resp.text();

  // Extract td cells
  const cellMatches = html.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
  const cells = cellMatches.map(c =>
    c.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').trim()
  );

  const meetings: CBMeeting[] = [];
  let currentDate: string | null = null;
  const currentYear = new Date().getFullYear();

  for (const cell of cells) {
    // Match date like "Mar 19"
    const dateMatch = cell.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})$/);
    if (dateMatch) {
      const month = MONTHS[dateMatch[1]];
      const day = parseInt(dateMatch[2]);
      currentDate = `${currentYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      continue;
    }

    // Match bank name like "Japan: Bank of Japan (BOJ)"
    if (cell.includes(':') && !cell.includes('Central Bank') && currentDate) {
      const country = cell.split(':')[0].trim();
      const codeMatch = cell.match(/\((\w+)\)/);
      const code = codeMatch ? codeMatch[1] : '';

      if (CB_MAP[code]) {
        meetings.push({ date: currentDate, country, bank: cell, code });
      }
    }
  }

  return meetings;
}

export async function GET() {
  try {
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
      return NextResponse.json({ meetings: cache.meetings, cached: true });
    }

    const meetings = await scrapeCBRates();
    if (meetings.length > 0) {
      cache = { meetings, fetchedAt: Date.now() };
    }

    return NextResponse.json({ meetings });
  } catch {
    if (cache) {
      return NextResponse.json({ meetings: cache.meetings, cached: true });
    }
    return NextResponse.json({ meetings: [] });
  }
}
