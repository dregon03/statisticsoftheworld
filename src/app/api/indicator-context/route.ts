import { supabase } from '@/lib/supabase';
import { getIndicatorForAllCountries, INDICATORS, formatValue } from '@/lib/data';

const OPENROUTER_KEY = process.env.OPENROUTER_KEY || '';
const MODEL = 'mistralai/mistral-small-3.1-24b-instruct';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryId = searchParams.get('country');
  const indicatorId = searchParams.get('indicator');

  if (!countryId || !indicatorId) {
    return Response.json({ error: 'Missing country or indicator' }, { status: 400 });
  }

  // Check cache
  const { data: cached } = await supabase
    .from('sotw_indicator_context')
    .select('context')
    .eq('country_id', countryId)
    .eq('indicator_id', indicatorId)
    .single();

  if (cached?.context) {
    return Response.json({ context: cached.context, cached: true });
  }

  // Get current data for this country+indicator
  const ind = INDICATORS.find(i => i.id === indicatorId);
  if (!ind) return Response.json({ context: '' });

  // Get all countries for ranking
  const allCountries = await getIndicatorForAllCountries(indicatorId);
  const entry = allCountries.find(c => c.countryId === countryId);
  if (!entry || entry.value == null) return Response.json({ context: '' });

  const rank = allCountries.findIndex(c => c.countryId === countryId) + 1;
  const total = allCountries.length;
  const valueStr = formatValue(entry.value, ind.format, ind.decimals);

  // Find YoY change
  const { data: histData } = await supabase
    .from('sotw_indicators_history')
    .select('year, value')
    .eq('id', indicatorId)
    .eq('country_id', countryId)
    .not('value', 'is', null)
    .order('year', { ascending: false })
    .limit(2);

  let yoyStr = '';
  if (histData && histData.length >= 2) {
    const curr = histData[0].value;
    const prev = histData[1].value;
    if (prev && prev !== 0) {
      const pctChange = ((curr - prev) / Math.abs(prev)) * 100;
      yoyStr = `${pctChange >= 0 ? 'up' : 'down'} from ${formatValue(prev, ind.format, ind.decimals)} in ${histData[1].year} (${pctChange >= 0 ? '+' : ''}${pctChange.toFixed(1)}%)`;
    }
  }

  const prompt = `Write exactly one sentence (max 30 words) summarizing this economic data point. Be factual. No markdown.

Country: ${entry.country}
Indicator: ${ind.label}
Value: ${valueStr} (${entry.year})
Global rank: #${rank} of ${total}
${yoyStr ? `Change: ${yoyStr}` : ''}

Example style: "The United States recorded GDP growth of 2.1% in 2026, ranking 45th globally, down from 2.8% the previous year."`;

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
        max_tokens: 80,
        temperature: 0.3,
      }),
    });

    if (!resp.ok) return Response.json({ context: '' });

    const data = await resp.json();
    const context = (data.choices?.[0]?.message?.content || '').trim().replace(/^["']|["']$/g, '');

    if (context && context.length > 20) {
      await supabase
        .from('sotw_indicator_context')
        .upsert({ country_id: countryId, indicator_id: indicatorId, context });
    }

    return Response.json({ context });
  } catch {
    return Response.json({ context: '' });
  }
}
