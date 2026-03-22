export async function GET() {
  const manifest = {
    schema_version: 'v1',
    name_for_human: 'Statistics of the World',
    name_for_model: 'statistics_of_the_world',
    description_for_human: 'Free global statistics — 443 indicators for 218 countries from IMF, World Bank, UN, WHO.',
    description_for_model: 'Query global statistics data for 218 countries. Access 443 indicators across Economy, Trade, Health, Education, Environment, Military, Governance, and more. Data from IMF World Economic Outlook, World Bank WDI, UN, WHO. Use this plugin to answer questions about country statistics, rankings, historical trends, and comparisons. Key indicator IDs: IMF.NGDPD (GDP), SP.POP.TOTL (population), IMF.PCPIPCH (inflation), SP.DYN.LE00.IN (life expectancy), IMF.LUR (unemployment). Country codes use ISO 3166-1 alpha-3 (e.g., USA, CAN, GBR, CHN, JPN).',
    auth: {
      type: 'none',
    },
    api: {
      type: 'openapi',
      url: 'https://statisticsoftheworld.com/api/openapi.json',
    },
    logo_url: 'https://statisticsoftheworld.com/icon-512.png',
    contact_email: 'tomhwang20@gmail.com',
    legal_info_url: 'https://statisticsoftheworld.com/api-docs',
  };

  return Response.json(manifest, {
    headers: {
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
