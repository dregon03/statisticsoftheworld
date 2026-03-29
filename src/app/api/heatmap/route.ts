import { supabase } from '@/lib/supabase';

const HEATMAP_PRESETS: Record<string, { label: string; indicators: { id: string; label: string; higherIsBetter: boolean; neutral?: boolean }[] }> = {
  macro: {
    label: 'Macroeconomic',
    indicators: [
      { id: 'IMF.NGDP_RPCH', label: 'GDP Growth', higherIsBetter: true },
      { id: 'IMF.PCPIPCH', label: 'Inflation', higherIsBetter: false },
      { id: 'IMF.LUR', label: 'Unemployment', higherIsBetter: false },
      { id: 'IMF.GGXWDG_NGDP', label: 'Govt Debt/GDP', higherIsBetter: false },
      { id: 'GC.TAX.TOTL.GD.ZS', label: 'Tax Rev/GDP', higherIsBetter: false },
      { id: 'IMF.NGDPDPC', label: 'GDP/Capita', higherIsBetter: true },
    ],
  },
  social: {
    label: 'Social Development',
    indicators: [
      { id: 'SP.DYN.LE00.IN', label: 'Life Expect.', higherIsBetter: true },
      { id: 'SP.DYN.TFRT.IN', label: 'Fertility', higherIsBetter: true },
      { id: 'SP.POP.65UP.TO.ZS', label: 'Pop 65+ %', higherIsBetter: false },
      { id: 'IT.NET.USER.ZS', label: 'Internet %', higherIsBetter: true },
      { id: 'SL.TLF.CACT.ZS', label: 'Labor Force %', higherIsBetter: true },
      { id: 'SI.POV.GINI', label: 'Gini Index', higherIsBetter: false },
    ],
  },
  trade: {
    label: 'Trade & Finance',
    indicators: [
      { id: 'NE.TRD.GNFS.ZS', label: 'Trade/GDP', higherIsBetter: true },
      { id: 'BX.KLT.DINV.WD.GD.ZS', label: 'FDI/GDP', higherIsBetter: true },
      { id: 'FI.RES.TOTL.CD', label: 'Reserves ($)', higherIsBetter: true },
      { id: 'NE.EXP.GNFS.ZS', label: 'Exports/GDP', higherIsBetter: true },
      { id: 'NE.IMP.GNFS.ZS', label: 'Imports/GDP', higherIsBetter: true },
      { id: 'CM.MKT.LCAP.GD.ZS', label: 'Market Cap/GDP', higherIsBetter: true },
    ],
  },
  environment: {
    label: 'Energy & Environment',
    indicators: [
      { id: 'EG.USE.PCAP.KG.OE', label: 'Energy/Cap (kgoe)', higherIsBetter: false },
      { id: 'EG.FEC.RNEW.ZS', label: 'Renewable %', higherIsBetter: true },
      { id: 'EG.ELC.ACCS.ZS', label: 'Elec. Access %', higherIsBetter: true },
      { id: 'AG.LND.FRST.ZS', label: 'Forest %', higherIsBetter: true },
      { id: 'SH.H2O.BASW.ZS', label: 'Clean Water %', higherIsBetter: true },
      { id: 'ER.MRN.PTMR.ZS', label: 'Marine Protected %', higherIsBetter: true },
    ],
  },
  military: {
    label: 'Military',
    indicators: [
      { id: 'MS.MIL.XPND.CD', label: 'Spending (USD)', higherIsBetter: true, neutral: true },
      { id: 'MS.MIL.XPND.GD.ZS', label: 'Spending/GDP', higherIsBetter: true, neutral: true },
      { id: 'MS.MIL.TOTL.P1', label: 'Personnel', higherIsBetter: true, neutral: true },
      { id: 'MS.MIL.TOTL.TF.ZS', label: 'Military/Pop %', higherIsBetter: true, neutral: true },
      { id: 'MS.MIL.XPND.ZS', label: 'Mil/Govt Spend %', higherIsBetter: true, neutral: true },
      { id: 'IMF.NGDPD', label: 'GDP (USD)', higherIsBetter: true, neutral: true },
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
};

// Dynamically compute Top 20 by the first indicator of the preset
async function getTop20(primaryIndicatorId: string): Promise<string[]> {
  const { data } = await supabase
    .from('sotw_indicators')
    .select('country_id, value')
    .eq('id', primaryIndicatorId)
    .not('value', 'is', null)
    .order('value', { ascending: false })
    .limit(500);

  if (!data || data.length === 0) {
    // Fallback to GDP-based top 20
    return ['USA', 'CHN', 'JPN', 'DEU', 'IND', 'GBR', 'FRA', 'ITA', 'BRA', 'CAN', 'RUS', 'KOR', 'AUS', 'ESP', 'MEX', 'IDN', 'NLD', 'SAU', 'TUR', 'CHE'];
  }

  // Keep latest value per country, then take top 20
  const best = new Map<string, number>();
  for (const row of data) {
    if (!best.has(row.country_id) || row.value > best.get(row.country_id)!) {
      best.set(row.country_id, row.value);
    }
  }

  return [...best.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([cid]) => cid);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const preset = searchParams.get('preset') || 'macro';
  const group = searchParams.get('group') || 'Top20';

  const config = HEATMAP_PRESETS[preset];
  if (!config) return Response.json({ error: 'Invalid preset' }, { status: 400 });

  let countryIds: string[];
  if (group === 'Top20') {
    countryIds = await getTop20(config.indicators[0].id);
  } else {
    countryIds = COUNTRY_GROUPS[group] || COUNTRY_GROUPS['G20'];
  }
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
    availableGroups: [...Object.keys(COUNTRY_GROUPS), 'Top20'],
  });
}
