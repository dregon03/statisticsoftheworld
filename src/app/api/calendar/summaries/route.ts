import { NextResponse } from 'next/server';

const OPENROUTER_KEY = process.env.OPENROUTER_KEY || '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';
const MODEL = 'mistralai/mistral-small-3.1-24b-instruct';

// Persistent cache: key = "date|name" → summary string
const summaryCache = new Map<string, string>();

async function generateSummary(eventName: string, eventDate: string, eventType: string, symbol?: string): Promise<string> {
  const cacheKey = `${eventDate}|${eventName}|${symbol || ''}`;
  if (summaryCache.has(cacheKey)) {
    return summaryCache.get(cacheKey)!;
  }

  const prompt = eventType === 'earnings' && symbol
    ? `In exactly one sentence (max 15 words), summarize the outcome of ${symbol}'s earnings report on ${eventDate}. Focus on whether they beat/missed estimates and stock reaction. If unknown, write "Results pending." Do not use quotes.`
    : `In exactly one sentence (max 15 words), summarize the outcome of the "${eventName}" economic release on ${eventDate}. Focus on the key number and whether it was above/below expectations. If unknown, write "Data pending." Do not use quotes.`;

  try {
    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://statisticsoftheworld.com',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50,
        temperature: 0.3,
      }),
    });

    if (!resp.ok) return '';

    const data = await resp.json();
    const summary = (data.choices?.[0]?.message?.content || '').trim().replace(/^["']|["']$/g, '');
    if (summary) {
      summaryCache.set(cacheKey, summary);
    }
    return summary;
  } catch {
    return '';
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const events: { date: string; name: string; type: string; symbol?: string }[] = body.events || [];

    if (events.length === 0) {
      return NextResponse.json({ summaries: {} });
    }

    // Limit to 10 per request to avoid overwhelming the API
    const toProcess = events.slice(0, 10);
    const summaries: Record<string, string> = {};

    // Check cache first, only generate for uncached
    const uncached: typeof toProcess = [];
    for (const e of toProcess) {
      const key = `${e.date}|${e.name}|${e.symbol || ''}`;
      if (summaryCache.has(key)) {
        summaries[key] = summaryCache.get(key)!;
      } else {
        uncached.push(e);
      }
    }

    // Generate in parallel (max 5 concurrent)
    const batchSize = 5;
    for (let i = 0; i < uncached.length; i += batchSize) {
      const batch = uncached.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(e => generateSummary(e.name, e.date, e.type, e.symbol))
      );
      batch.forEach((e, j) => {
        const key = `${e.date}|${e.name}|${e.symbol || ''}`;
        if (results[j]) {
          summaries[key] = results[j];
        }
      });
    }

    return NextResponse.json({ summaries });
  } catch {
    return NextResponse.json({ summaries: {} });
  }
}
