/**
 * Bidirectional mapping between country names/slugs and ISO3 codes.
 * Used for clean SEO-friendly URLs like /country/united-states/gdp
 */

// ISO3 → slug (manually curated for common countries, auto-generated for rest)
const ISO3_TO_SLUG: Record<string, string> = {
  // Major economies — manually verified slugs
  USA: 'united-states', CHN: 'china', JPN: 'japan', DEU: 'germany',
  GBR: 'united-kingdom', FRA: 'france', IND: 'india', BRA: 'brazil',
  CAN: 'canada', AUS: 'australia', KOR: 'south-korea', MEX: 'mexico',
  RUS: 'russia', ITA: 'italy', ESP: 'spain', IDN: 'indonesia',
  NLD: 'netherlands', TUR: 'turkey', CHE: 'switzerland', SAU: 'saudi-arabia',
  ARG: 'argentina', ZAF: 'south-africa', NGA: 'nigeria', SGP: 'singapore',
  ISR: 'israel', NOR: 'norway', SWE: 'sweden', EGY: 'egypt',
  POL: 'poland', THA: 'thailand', VNM: 'vietnam', IRL: 'ireland',
  PHL: 'philippines', MYS: 'malaysia', PAK: 'pakistan', CHL: 'chile',
  COL: 'colombia', BGD: 'bangladesh', ARE: 'uae', NZL: 'new-zealand',
  PRT: 'portugal', GRC: 'greece', CZE: 'czech-republic', ROU: 'romania',
  DNK: 'denmark', FIN: 'finland', AUT: 'austria', BEL: 'belgium',
  KEN: 'kenya', ETH: 'ethiopia', IRN: 'iran', IRQ: 'iraq',
  PER: 'peru', HKG: 'hong-kong', TWN: 'taiwan', UKR: 'ukraine',
  HUN: 'hungary', QAT: 'qatar', KWT: 'kuwait', OMN: 'oman',
  BHR: 'bahrain', JOR: 'jordan', LBN: 'lebanon', LKA: 'sri-lanka',
  MMR: 'myanmar', KHM: 'cambodia', NPL: 'nepal', GHA: 'ghana',
  TZA: 'tanzania', UGA: 'uganda', MOZ: 'mozambique', ZMB: 'zambia',
  SEN: 'senegal', CIV: 'ivory-coast', CMR: 'cameroon', AGO: 'angola',
  MAR: 'morocco', TUN: 'tunisia', DZA: 'algeria', LBY: 'libya',
  SDN: 'sudan', SSD: 'south-sudan', COD: 'dr-congo', COG: 'congo',
  ECU: 'ecuador', BOL: 'bolivia', PRY: 'paraguay', URY: 'uruguay',
  CRI: 'costa-rica', PAN: 'panama', DOM: 'dominican-republic',
  GTM: 'guatemala', HND: 'honduras', SLV: 'el-salvador', NIC: 'nicaragua',
  CUB: 'cuba', HTI: 'haiti', JAM: 'jamaica', TTO: 'trinidad-and-tobago',
  SVK: 'slovakia', SVN: 'slovenia', HRV: 'croatia', SRB: 'serbia',
  BGR: 'bulgaria', BIH: 'bosnia', ALB: 'albania', MKD: 'north-macedonia',
  MNE: 'montenegro', LTU: 'lithuania', LVA: 'latvia', EST: 'estonia',
  GEO: 'georgia', ARM: 'armenia', AZE: 'azerbaijan', KAZ: 'kazakhstan',
  UZB: 'uzbekistan', TKM: 'turkmenistan', KGZ: 'kyrgyzstan', TJK: 'tajikistan',
  MNG: 'mongolia', AFG: 'afghanistan', ISL: 'iceland', CYP: 'cyprus',
  LUX: 'luxembourg', MLT: 'malta', BRN: 'brunei', FJI: 'fiji',
  MUS: 'mauritius', MDG: 'madagascar', NAM: 'namibia', BWA: 'botswana',
  RWA: 'rwanda', LAO: 'laos', BLR: 'belarus', MDA: 'moldova',
  PNG: 'papua-new-guinea', SOM: 'somalia', YEM: 'yemen', SYR: 'syria',
  PSE: 'palestine', WLD: 'world',
};

// Reverse map: slug → ISO3
const SLUG_TO_ISO3: Record<string, string> = {};
for (const [iso3, slug] of Object.entries(ISO3_TO_SLUG)) {
  SLUG_TO_ISO3[slug] = iso3;
}

/** Get the SEO slug for a country ISO3 code */
export function getCountrySlug(iso3: string): string | null {
  return ISO3_TO_SLUG[iso3] || null;
}

/** Get the ISO3 code from a country slug */
export function getCountryFromSlug(slug: string): string | null {
  // Direct slug match
  if (SLUG_TO_ISO3[slug]) return SLUG_TO_ISO3[slug];
  // Maybe it's already an ISO3 code (backwards compat)
  if (slug.length === 3 && slug === slug.toUpperCase()) return slug;
  return null;
}

/** Check if a string looks like an ISO3 code */
export function isIso3(s: string): boolean {
  return /^[A-Z]{3}$/.test(s);
}

/** Get indicator slug from indicator ID, using ranking slugs map */
const INDICATOR_SLUGS: Record<string, string> = {
  'IMF.NGDPD': 'gdp', 'IMF.NGDP_RPCH': 'gdp-growth', 'IMF.NGDPDPC': 'gdp-per-capita',
  'IMF.PPPGDP': 'gdp-ppp', 'IMF.PPPPC': 'gdp-per-capita-ppp', 'IMF.PCPIPCH': 'inflation-rate',
  'IMF.LUR': 'unemployment-rate', 'IMF.GGXWDG_NGDP': 'government-debt',
  'IMF.BCA_NGDPD': 'current-account', 'SP.POP.TOTL': 'population',
  'SP.POP.GROW': 'population-growth', 'SP.DYN.LE00.IN': 'life-expectancy',
  'SP.DYN.TFRT.IN': 'fertility-rate', 'EN.ATM.CO2E.PC': 'co2-emissions',
  'EN.GHG.CO2.PC.CE.AR5': 'co2-emissions-ghg',
  'IT.NET.USER.ZS': 'internet-users', 'SH.XPD.CHEX.GD.ZS': 'health-spending',
  'SE.XPD.TOTL.GD.ZS': 'education-spending', 'MS.MIL.XPND.GD.ZS': 'military-spending',
  'NE.TRD.GNFS.ZS': 'trade-openness', 'BX.KLT.DINV.WD.GD.ZS': 'fdi-inflows',
  'SI.POV.GINI': 'gini-index', 'SI.POV.DDAY': 'poverty-rate',
  'SH.DYN.MORT': 'infant-mortality', 'SP.URB.TOTL.IN.ZS': 'urban-population',
  'EG.FEC.RNEW.ZS': 'renewable-energy', 'AG.LND.FRST.ZS': 'forest-area',
  'CC.EST': 'corruption-control', 'RL.EST': 'rule-of-law', 'ST.INT.ARVL': 'tourism-arrivals',
  'SP.POP.65UP.TO.ZS': 'population-over-65', 'SP.POP.0014.TO.ZS': 'population-under-15',
  'SL.UEM.TOTL.ZS': 'unemployment', 'SL.UEM.1524.ZS': 'youth-unemployment',
  'GB.XPD.RSDV.GD.ZS': 'rd-spending', 'GC.TAX.TOTL.GD.ZS': 'tax-revenue',
  'SM.POP.NETM': 'net-migration', 'SH.STA.SUIC.P5': 'suicide-rate',
  'IS.AIR.PSGR': 'air-passengers', 'IS.AIR.GOOD.MT.K1': 'air-freight',
  'NY.GNP.MKTP.CD': 'gni', 'NY.GNP.PCAP.CD': 'gni-per-capita',
  'VC.IHR.PSRC.P5': 'homicide-rate', 'NE.IMP.GNFS.CD': 'imports',
  'WHO.ROAD_DEATHS': 'road-traffic-deaths',
};

// Reverse: slug → indicator ID
const SLUG_TO_INDICATOR: Record<string, string> = {};
for (const [id, slug] of Object.entries(INDICATOR_SLUGS)) {
  SLUG_TO_INDICATOR[slug] = id;
}

export function getIndicatorSlug(indicatorId: string): string | null {
  return INDICATOR_SLUGS[indicatorId] || null;
}

export function getIndicatorFromSlug(slug: string): string | null {
  if (SLUG_TO_INDICATOR[slug]) return SLUG_TO_INDICATOR[slug];
  // Maybe it's already an encoded indicator ID (backwards compat)
  const decoded = decodeURIComponent(slug);
  if (decoded.includes('.')) return decoded;
  return null;
}

/** Build a clean canonical URL for a country/indicator detail page */
export function getCleanCountryIndicatorUrl(iso3: string, indicatorId: string): string {
  const countrySlug = getCountrySlug(iso3);
  const indicatorSlug = getIndicatorSlug(indicatorId);
  if (countrySlug && indicatorSlug) {
    return `/country/${countrySlug}/${indicatorSlug}`;
  }
  // Use country slug even if indicator has no slug mapping
  const country = countrySlug || iso3;
  return `/country/${country}/${encodeURIComponent(indicatorId)}`;
}

/** Build a clean canonical URL for a country page */
export function getCleanCountryUrl(iso3: string): string {
  const slug = getCountrySlug(iso3);
  return slug ? `/country/${slug}` : `/country/${iso3}`;
}

/** All mapped country slugs for sitemap generation */
export function getAllCountrySlugs(): { slug: string; iso3: string }[] {
  return Object.entries(ISO3_TO_SLUG).map(([iso3, slug]) => ({ slug, iso3 }));
}

/** Top indicator slugs for sitemap (high-traffic indicators) */
export const TOP_INDICATOR_SLUGS = [
  'gdp', 'gdp-per-capita', 'gdp-growth', 'population', 'inflation-rate',
  'unemployment-rate', 'life-expectancy', 'government-debt', 'gdp-ppp',
  'gdp-per-capita-ppp', 'fertility-rate', 'co2-emissions', 'gini-index',
  'military-spending', 'health-spending', 'trade-openness', 'internet-users',
  'education-spending', 'poverty-rate', 'renewable-energy',
];
