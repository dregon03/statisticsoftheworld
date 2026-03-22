import { getAllIndicatorsForCountry, getCountry, INDICATORS, formatValue } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countriesParam = searchParams.get('countries');
  const indicatorsParam = searchParams.get('indicators');

  if (!countriesParam) {
    return Response.json({
      error: 'Missing countries parameter (comma-separated ISO codes)',
      example: 'GET /api/v1/compare?countries=USA,CHN,JPN&indicators=IMF.NGDPD,SP.POP.TOTL',
    }, { status: 400 });
  }

  const countryIds = countriesParam.split(',').slice(0, 10);
  const indicatorIds = indicatorsParam
    ? indicatorsParam.split(',').slice(0, 30)
    : ['IMF.NGDPD', 'IMF.NGDPDPC', 'IMF.NGDP_RPCH', 'SP.POP.TOTL', 'SP.DYN.LE00.IN', 'IMF.PCPIPCH', 'IMF.LUR', 'IMF.GGXWDG_NGDP'];

  // Fetch all data in parallel
  const results = await Promise.all(
    countryIds.map(async (cid) => {
      const [country, indicators] = await Promise.all([
        getCountry(cid),
        getAllIndicatorsForCountry(cid),
      ]);

      const data: Record<string, { value: number | null; formattedValue: string; year: string }> = {};
      for (const indId of indicatorIds) {
        const ind = INDICATORS.find(i => i.id === indId);
        const d = indicators[indId];
        data[indId] = {
          value: d?.value ?? null,
          formattedValue: d && ind ? formatValue(d.value, ind.format, ind.decimals) : 'N/A',
          year: d?.year || '',
        };
      }

      return {
        countryId: cid,
        country: country?.name || cid,
        iso2: country?.iso2 || '',
        region: country?.region || '',
        data,
      };
    })
  );

  return Response.json({
    countries: results,
    indicators: indicatorIds.map(id => {
      const ind = INDICATORS.find(i => i.id === id);
      return { id, label: ind?.label || id, category: ind?.category || '', format: ind?.format || 'number' };
    }),
    meta: {
      source: 'statisticsoftheworld.com',
      documentation: 'https://statisticsoftheworld.com/api-docs',
    },
  });
}
