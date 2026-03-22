import { supabase } from '@/lib/supabase';

const HEATMAP_PRESETS: Record<string, { label: string; indicators: { id: string; label: string; higherIsBetter: boolean }[] }> = {
  macro: {
    label: 'Macroeconomic',
    indicators: [
      { id: 'IMF.NGDP_RPCH', label: 'GDP Growth', higherIsBetter: true },
      { id: 'IMF.PCPIPCH', label: 'Inflation', higherIsBetter: false },
      { id: 'IMF.LUR', label: 'Unemployment', higherIsBetter: false },
      { id: 'IMF.GGXWDG_NGDP', label: 'Govt Debt/GDP', higherIsBetter: false },
      { id: 'IMF.BCA_NGDPD', label: 'Current Acct', higherIsBetter: true },
      { id: 'IMF.NGDPDPC', label: 'GDP/Capita', higherIsBetter: true },
    ],
  },
  social: {
    label: 'Social Development',
    indicators: [
      { id: 'SP.DYN.LE00.IN', label: 'Life Expect.', higherIsBetter: true },
      { id: 'SP.DYN.TFRT.IN', label: 'Fertility', higherIsBetter: false },
      { id: 'SP.POP.GROW', label: 'Pop Growth', higherIsBetter: false },
      { id: 'SH.XPD.CHEX.GD.ZS', label: 'Health Spend', higherIsBetter: true },
      { id: 'SE.ADT.LITR.ZS', label: 'Literacy', higherIsBetter: true },
      { id: 'SI.POV.GINI', label: 'Gini Index', higherIsBetter: false },
    ],
  },
  trade: {
    label: 'Trade & Finance',
    indicators: [
      { id: 'NE.TRD.GNFS.ZS', label: 'Trade/GDP', higherIsBetter: true },
      { id: 'BX.KLT.DINV.WD.GD.ZS', label: 'FDI Inflows', higherIsBetter: true },
      { id: 'FI.RES.TOTL.CD', label: 'Reserves', higherIsBetter: true },
      { id: 'BN.CAB.XOKA.GD.ZS', label: 'Current Acct', higherIsBetter: true },
      { id: 'NE.EXP.GNFS.ZS', label: 'Exports/GDP', higherIsBetter: true },
      { id: 'NE.IMP.GNFS.ZS', label: 'Imports/GDP', higherIsBetter: false },
    ],
  },
  environment: {
    label: 'Energy & Environment',
    indicators: [
      { id: 'EN.ATM.CO2E.PC', label: 'CO2/Capita', higherIsBetter: false },
      { id: 'EG.FEC.RNEW.ZS', label: 'Renewable %', higherIsBetter: true },
      { id: 'EG.ELC.ACCS.ZS', label: 'Electricity Access', higherIsBetter: true },
      { id: 'AG.LND.FRST.ZS', label: 'Forest %', higherIsBetter: true },
      { id: 'EN.ATM.PM25.MC.M3', label: 'PM2.5', higherIsBetter: false },
      { id: 'ER.LND.PTLD.ZS', label: 'Protected Land', higherIsBetter: true },
    ],
  },
};

const COUNTRY_GROUPS: Record<string, string[]> = {
  G7: ['USA', 'CAN', 'GBR', 'DEU', 'FRA', 'ITA', 'JPN'],
  G20: ['USA', 'CAN', 'GBR', 'DEU', 'FRA', 'ITA', 'JPN', 'CHN', 'IND', 'BRA', 'RUS', 'AUS', 'KOR', 'MEX', 'IDN', 'TUR', 'SAU', 'ZAF', 'ARG'],
  BRICS: ['BRA', 'RUS', 'IND', 'CHN', 'ZAF'],
  EU: ['DEU', 'FRA', 'ITA', 'ESP', 'NLD', 'BEL', 'AUT', 'IRL', 'FIN', 'PRT', 'GRC', 'POL', 'SWE', 'DNK', 'CZE', 'ROU', 'HUN'],
  Asia: ['CHN', 'JPN', 'KOR', 'IND', 'IDN', 'THA', 'MYS', 'SGP', 'PHL', 'VNM', 'BGD', 'PAK'],
  Americas: ['USA', 'CAN', 'BRA', 'MEX', 'ARG', 'COL', 'CHL', 'PER'],
  Top20: ['USA', 'CHN', 'JPN', 'DEU', 'IND', 'GBR', 'FRA', 'ITA', 'BRA', 'CAN', 'RUS', 'KOR', 'AUS', 'ESP', 'MEX', 'IDN', 'NLD', 'SAU', 'TUR', 'CHE'],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const preset = searchParams.get('preset') || 'macro';
  const group = searchParams.get('group') || 'G20';

  const config = HEATMAP_PRESETS[preset];
  if (!config) return Response.json({ error: 'Invalid preset' }, { status: 400 });

  const countryIds = COUNTRY_GROUPS[group] || COUNTRY_GROUPS['G20'];
  const indicatorIds = config.indicators.map(i => i.id);

  // Fetch all data in one query
  const { data, error } = await supabase
    .from('sotw_indicators')
    .select('id, country_id, value, year')
    .in('id', indicatorIds)
    .in('country_id', countryIds)
    .not('value', 'is', null);

  if (error) return Response.json({ error: 'DB error' }, { status: 500 });

  // Fetch country names
  const { data: countries } = await supabase
    .from('sotw_countries')
    .select('id, name, iso2')
    .in('id', countryIds);

  const countryMap = new Map((countries || []).map(c => [c.id, c]));

  // Build matrix: country → indicator → value
  const matrix: Record<string, Record<string, { value: number; year: string }>> = {};
  for (const row of data || []) {
    if (!matrix[row.country_id]) matrix[row.country_id] = {};
    matrix[row.country_id][row.id] = { value: row.value, year: String(row.year) };
  }

  // Compute min/max per indicator for color scaling
  const ranges: Record<string, { min: number; max: number }> = {};
  for (const indId of indicatorIds) {
    const values = (data || []).filter(r => r.id === indId).map(r => r.value);
    if (values.length > 0) {
      ranges[indId] = { min: Math.min(...values), max: Math.max(...values) };
    }
  }

  // Build response rows
  const rows = countryIds
    .filter(cid => countryMap.has(cid))
    .map(cid => ({
      countryId: cid,
      country: countryMap.get(cid)!.name,
      iso2: countryMap.get(cid)!.iso2,
      values: matrix[cid] || {},
    }));

  return Response.json({
    preset,
    presetLabel: config.label,
    group,
    indicators: config.indicators,
    ranges,
    countries: rows,
    availablePresets: Object.entries(HEATMAP_PRESETS).map(([k, v]) => ({ id: k, label: v.label })),
    availableGroups: Object.keys(COUNTRY_GROUPS),
  });
}
