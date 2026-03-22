import { supabase } from '@/lib/supabase';
import { getCountry, getAllIndicatorsForCountry, getIndicatorForAllCountries, INDICATORS, formatValue } from '@/lib/data';

const OPENROUTER_KEY = process.env.OPENROUTER_KEY || '';
const MODEL = 'mistralai/mistral-small-3.1-24b-instruct';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryId = searchParams.get('id');
  if (!countryId) return Response.json({ error: 'Missing id' }, { status: 400 });

  // Check cache first
  const { data: cached } = await supabase
    .from('sotw_country_narratives')
    .select('narrative, generated_at')
    .eq('country_id', countryId)
    .single();

  if (cached?.narrative) {
    // Return cached if less than 30 days old
    const age = Date.now() - new Date(cached.generated_at).getTime();
    if (age < 30 * 24 * 60 * 60 * 1000) {
      return Response.json({ narrative: cached.narrative, cached: true });
    }
  }

  // Generate new narrative
  const country = await getCountry(countryId);
  if (!country) return Response.json({ error: 'Country not found' }, { status: 404 });

  const indicators = await getAllIndicatorsForCountry(countryId);

  // Gather key data points for the prompt
  const dataPoints: string[] = [];
  const keyIds = [
    'IMF.NGDPD', 'IMF.NGDPDPC', 'IMF.NGDP_RPCH', 'IMF.PCPIPCH', 'IMF.LUR',
    'SP.POP.TOTL', 'SP.DYN.LE00.IN', 'SP.DYN.TFRT.IN',
    'NE.TRD.GNFS.ZS', 'BX.KLT.DINV.WD.GD.ZS',
    'SE.ADT.LITR.ZS', 'SH.XPD.CHEX.GD.ZS',
    'EN.ATM.CO2E.PC', 'SL.UEM.TOTL.ZS',
    'NY.GNP.PCAP.CD', 'SI.POV.GINI',
  ];

  for (const id of keyIds) {
    const d = indicators[id];
    if (!d) continue;
    const ind = INDICATORS.find(i => i.id === id);
    if (!ind) continue;
    dataPoints.push(`${ind.label}: ${formatValue(d.value, ind.format, ind.decimals)} (${d.year})`);
  }

  // Get GDP rank
  let gdpRank = '';
  try {
    const allGdp = await getIndicatorForAllCountries('IMF.NGDPD');
    const rank = allGdp.findIndex(c => c.countryId === countryId) + 1;
    if (rank > 0) gdpRank = `GDP global rank: #${rank} of ${allGdp.length}`;
  } catch { /* skip */ }

  if (dataPoints.length < 3) {
    return Response.json({ narrative: '', error: 'Insufficient data' });
  }

  const prompt = `Write a concise 2-paragraph economic and social profile of ${country.name} for a statistics reference website. Use the data below. Be factual, authoritative, and neutral — like a World Bank country brief. Do not use markdown formatting. Do not start with the country name.

Data:
- Region: ${country.region}
- Income group: ${country.incomeLevel}
- Capital: ${country.capitalCity || 'N/A'}
${gdpRank ? `- ${gdpRank}` : ''}
${dataPoints.map(d => `- ${d}`).join('\n')}

Paragraph 1: Economy — GDP, growth, per capita income, key economic features, trade openness.
Paragraph 2: Society — population, life expectancy, education, health spending, notable development indicators.

Keep it under 150 words total. No bullet points.`;

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
        max_tokens: 300,
        temperature: 0.4,
      }),
    });

    if (!resp.ok) {
      return Response.json({ narrative: cached?.narrative || '', error: 'AI generation failed' });
    }

    const data = await resp.json();
    const narrative = (data.choices?.[0]?.message?.content || '').trim();

    if (narrative && narrative.length > 50) {
      // Cache in Supabase
      await supabase
        .from('sotw_country_narratives')
        .upsert({
          country_id: countryId,
          narrative,
          generated_at: new Date().toISOString(),
          model: MODEL,
        });
    }

    return Response.json({ narrative });
  } catch {
    return Response.json({ narrative: cached?.narrative || '' });
  }
}
