import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCountry, getAllIndicatorsForCountry, INDICATORS, formatValue } from '@/lib/data';
import Flag from '../../Flag';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

// ─── Expert editorial for top comparison pages ──────────
const COMPARISON_EDITORIAL: Record<string, string> = {
  'united-states-vs-china': 'The United States and China are the two largest economies in the world, together accounting for over 40% of global GDP. The US leads in nominal terms with an economy driven by technology, financial services, and consumer spending, while China — the world\'s manufacturing powerhouse — has closed the gap dramatically over the past three decades and surpasses the US in purchasing power parity (PPP) terms. The economic rivalry between these two nations shapes global trade policy, technology competition, and geopolitical alignment.',
  'united-states-vs-japan': 'The United States and Japan represent the world\'s first and fourth largest economies. Japan\'s GDP peaked relative to the US in the early 1990s at roughly 70% of American output, but decades of deflation, demographic decline, and stagnant growth have widened the gap. Japan remains a global leader in automotive manufacturing, robotics, and electronics, while the US dominates in technology, financial services, and higher education. Japan\'s government debt exceeds 250% of GDP — the highest in the developed world — yet it borrows at near-zero interest rates due to domestic savings and central bank policy.',
  'united-states-vs-germany': 'The United States and Germany are the largest economies in the Americas and Europe respectively. Germany\'s export-driven economy — built on automotive engineering, industrial machinery, and chemicals — contrasts with America\'s more consumption-driven model. Germany consistently runs a large trade surplus while the US runs a deficit. However, Germany faces structural challenges: an aging population, dependence on Russian energy (a vulnerability exposed by the Ukraine war), and a manufacturing sector under pressure from Chinese competition and the electric vehicle transition.',
  'united-states-vs-india': 'The United States and India represent the world\'s largest established economy and its fastest-growing major economy. India\'s GDP growth rate consistently outpaces the US by 3-4 percentage points, driven by a young population, rapid urbanization, and a booming technology services sector. However, India\'s GDP per capita remains roughly one-fiftieth of America\'s, reflecting the enormous development gap that persists despite decades of growth. India overtook the UK as the world\'s fifth-largest economy in 2022 and is projected to become the third-largest by the early 2030s.',
  'china-vs-india': 'China and India — the world\'s two most populous nations — offer a fascinating economic comparison. China\'s economy is roughly five times larger than India\'s in nominal terms, reflecting China\'s 20-year head start in economic reform (1978 vs 1991) and its more aggressive industrialization strategy. China\'s GDP per capita is about five times India\'s. However, India\'s growth rate now exceeds China\'s, and its younger demographic profile suggests stronger long-term growth potential. China faces the "middle-income trap" risk with an aging population, while India\'s demographic dividend is just beginning.',
  'united-states-vs-united-kingdom': 'The United States and United Kingdom share deep economic ties — the UK is one of America\'s largest foreign investors, and London and New York are the world\'s two dominant financial centers. The US economy is roughly seven times larger than the UK\'s, and GDP per capita is about 50% higher. The UK has faced unique economic headwinds since Brexit, including reduced trade access to the European single market and labor shortages in key sectors. Both countries share a services-dominated economic structure, with financial services, technology, and professional services driving growth.',
  'germany-vs-france': 'Germany and France are the two largest economies in the European Union and the political core of European integration. Germany\'s economy is about 30% larger, driven by industrial exports, while France has a more balanced economy with stronger services and agricultural sectors. France maintains a larger military and nuclear deterrent, while Germany has traditionally relied on NATO. Both countries face similar demographic challenges — aging populations and low fertility rates — but differ in labor market flexibility, with France historically having higher unemployment and stronger worker protections.',
  'japan-vs-south-korea': 'Japan and South Korea share remarkable economic parallels: both are highly developed East Asian economies built on export-oriented manufacturing, with strong automotive and electronics sectors. Japan\'s economy is roughly three times larger, but South Korea has grown much faster over the past three decades, narrowing the per-capita income gap significantly. South Korea now leads in semiconductor manufacturing (Samsung, SK Hynix) and has a younger population, while Japan has deeper capital markets and more diversified industrial conglomerates. Both countries face severe demographic headwinds — South Korea\'s fertility rate (below 0.8) is now lower than Japan\'s.',
  'india-vs-brazil': 'India and Brazil are the largest economies in South Asia and South America respectively, and both are key members of the BRICS group. India\'s economy has pulled significantly ahead — roughly three times larger than Brazil\'s in nominal terms — driven by its massive population advantage (1.4 billion vs 215 million) and sustained high growth rates. However, Brazil\'s GDP per capita is roughly twice India\'s, reflecting higher average living standards. Brazil\'s economy is more dependent on commodity exports (soybeans, iron ore, oil), while India\'s growth is driven by services, technology, and a large domestic consumer market.',
  'united-states-vs-russia': 'The economic gap between the United States and Russia is far larger than Cold War-era comparisons might suggest. The US economy is roughly 15 times larger than Russia\'s in nominal terms — Russia\'s GDP is comparable to Italy\'s or South Korea\'s despite having the world\'s largest landmass and vast natural resources. Russia\'s economy is heavily dependent on oil and gas exports, which account for roughly 40% of government revenue. Western sanctions following the 2022 invasion of Ukraine have further isolated Russia from global financial markets, though energy exports to Asia have partially offset the impact.',
};

// ─── Country slug → ISO3 mapping ────────────────────────
const SLUG_TO_ID: Record<string, string> = {
  'united-states': 'USA', 'china': 'CHN', 'japan': 'JPN', 'germany': 'DEU',
  'united-kingdom': 'GBR', 'france': 'FRA', 'india': 'IND', 'brazil': 'BRA',
  'canada': 'CAN', 'australia': 'AUS', 'south-korea': 'KOR', 'mexico': 'MEX',
  'russia': 'RUS', 'italy': 'ITA', 'spain': 'ESP', 'indonesia': 'IDN',
  'netherlands': 'NLD', 'turkey': 'TUR', 'switzerland': 'CHE', 'saudi-arabia': 'SAU',
  'argentina': 'ARG', 'south-africa': 'ZAF', 'nigeria': 'NGA', 'singapore': 'SGP',
  'israel': 'ISR', 'norway': 'NOR', 'sweden': 'SWE', 'egypt': 'EGY',
  'poland': 'POL', 'thailand': 'THA', 'vietnam': 'VNM', 'ireland': 'IRL',
  'philippines': 'PHL', 'malaysia': 'MYS', 'pakistan': 'PAK', 'chile': 'CHL',
  'colombia': 'COL', 'bangladesh': 'BGD', 'uae': 'ARE', 'new-zealand': 'NZL',
  'portugal': 'PRT', 'greece': 'GRC', 'czech-republic': 'CZE', 'romania': 'ROU',
  'denmark': 'DNK', 'finland': 'FIN', 'austria': 'AUT', 'belgium': 'BEL',
  'kenya': 'KEN', 'ethiopia': 'ETH', 'iran': 'IRN', 'iraq': 'IRQ',
};

// ─── Top 50 comparison pairs ────────────────────────────
const PAIRS: [string, string][] = [
  ['united-states', 'china'], ['united-states', 'japan'], ['united-states', 'germany'],
  ['united-states', 'united-kingdom'], ['united-states', 'india'], ['united-states', 'canada'],
  ['united-states', 'russia'], ['united-states', 'brazil'], ['united-states', 'australia'],
  ['united-states', 'mexico'], ['united-states', 'france'], ['united-states', 'south-korea'],
  ['china', 'india'], ['china', 'japan'], ['china', 'russia'], ['china', 'germany'],
  ['china', 'united-kingdom'], ['china', 'brazil'],
  ['japan', 'germany'], ['japan', 'south-korea'], ['japan', 'india'],
  ['germany', 'france'], ['germany', 'united-kingdom'], ['germany', 'italy'],
  ['united-kingdom', 'france'], ['united-kingdom', 'canada'], ['united-kingdom', 'australia'],
  ['france', 'italy'], ['france', 'spain'],
  ['india', 'brazil'], ['india', 'pakistan'], ['india', 'indonesia'], ['india', 'bangladesh'],
  ['brazil', 'mexico'], ['brazil', 'argentina'],
  ['canada', 'australia'], ['canada', 'mexico'],
  ['south-korea', 'japan'], ['south-korea', 'australia'],
  ['russia', 'india'], ['russia', 'brazil'],
  ['italy', 'spain'], ['italy', 'netherlands'],
  ['australia', 'new-zealand'],
  ['turkey', 'mexico'], ['turkey', 'brazil'],
  ['saudi-arabia', 'uae'], ['saudi-arabia', 'iran'],
  ['nigeria', 'south-africa'], ['nigeria', 'kenya'],
  ['singapore', 'switzerland'],
  // Added: high-volume missing pairs
  ['united-states', 'italy'], ['united-states', 'spain'],
  ['china', 'south-korea'], ['china', 'indonesia'],
  ['india', 'russia'], ['india', 'japan'], ['india', 'united-kingdom'],
  ['japan', 'united-kingdom'], ['japan', 'france'],
  ['germany', 'japan'], ['germany', 'china'], ['germany', 'india'],
  ['indonesia', 'india'], ['indonesia', 'brazil'], ['indonesia', 'mexico'],
  ['russia', 'united-states'], ['russia', 'germany'],
  ['mexico', 'indonesia'], ['mexico', 'argentina'],
  ['south-korea', 'germany'], ['south-korea', 'united-kingdom'],
  ['poland', 'germany'], ['poland', 'united-kingdom'],
  ['thailand', 'vietnam'], ['thailand', 'indonesia'],
  ['philippines', 'vietnam'], ['philippines', 'indonesia'],
  ['egypt', 'saudi-arabia'], ['egypt', 'nigeria'],
  ['israel', 'uae'], ['israel', 'saudi-arabia'],
  ['vietnam', 'indonesia'], ['vietnam', 'india'],
  ['pakistan', 'bangladesh'], ['pakistan', 'nigeria'],
  ['switzerland', 'norway'], ['switzerland', 'germany'],
  ['netherlands', 'belgium'], ['sweden', 'norway'],
  ['argentina', 'colombia'], ['chile', 'argentina'],
  ['kenya', 'ethiopia'], ['south-africa', 'egypt'],
];

// ─── Indicators to compare ──────────────────────────────
const COMPARE_INDICATORS = [
  { id: 'IMF.NGDPD', label: 'GDP (USD)', rankSlug: 'gdp' },
  { id: 'IMF.NGDPDPC', label: 'GDP per Capita', rankSlug: 'gdp-per-capita' },
  { id: 'IMF.NGDP_RPCH', label: 'GDP Growth (%)', rankSlug: 'gdp-growth' },
  { id: 'IMF.PPPPC', label: 'GDP per Capita (PPP)', rankSlug: 'gdp-per-capita-ppp' },
  { id: 'SP.POP.TOTL', label: 'Population', rankSlug: 'population' },
  { id: 'SP.DYN.LE00.IN', label: 'Life Expectancy', rankSlug: 'life-expectancy' },
  { id: 'IMF.PCPIPCH', label: 'Inflation (%)', rankSlug: 'inflation-rate' },
  { id: 'IMF.LUR', label: 'Unemployment (%)', rankSlug: 'unemployment-rate' },
  { id: 'IMF.GGXWDG_NGDP', label: 'Govt Debt (% GDP)', rankSlug: 'government-debt' },
  { id: 'SP.DYN.TFRT.IN', label: 'Fertility Rate', rankSlug: 'fertility-rate' },
  { id: 'SI.POV.GINI', label: 'Gini Index', rankSlug: 'gini-index' },
  { id: 'EN.GHG.CO2.PC.CE.AR5', label: 'CO₂ per Capita (t)', rankSlug: 'co2-emissions' },
];

function slugToName(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return PAIRS.map(([a, b]) => ({ slug: `${a}-vs-${b}` }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [slugA, slugB] = slug.split('-vs-');
  if (!slugA || !slugB || !SLUG_TO_ID[slugA] || !SLUG_TO_ID[slugB]) {
    return { title: 'Not Found' };
  }

  const nameA = slugToName(slugA);
  const nameB = slugToName(slugB);

  return {
    title: `${nameA} vs ${nameB} — Economy Compared (2026)`,
    description: `${nameA} vs ${nameB}: GDP, population, inflation, unemployment, debt, life expectancy, and 400+ indicators compared. Interactive charts with IMF & World Bank data. Updated ${new Date().getFullYear()}.`,
    alternates: { canonical: `https://statisticsoftheworld.com/compare/${slug}` },
    openGraph: {
      title: `${nameA} vs ${nameB} — Economy & Data Compared`,
      description: `Side-by-side comparison of ${nameA} and ${nameB} across 12 key indicators.`,
      siteName: 'Statistics of the World',
    },
  };
}

export default async function ComparisonPage({ params }: Props) {
  const { slug } = await params;
  const parts = slug.split('-vs-');
  if (parts.length !== 2) notFound();
  const [slugA, slugB] = parts;
  const idA = SLUG_TO_ID[slugA];
  const idB = SLUG_TO_ID[slugB];
  if (!idA || !idB) notFound();

  const [countryA, countryB, dataA, dataB] = await Promise.all([
    getCountry(idA),
    getCountry(idB),
    getAllIndicatorsForCountry(idA),
    getAllIndicatorsForCountry(idB),
  ]);

  if (!countryA || !countryB) notFound();

  // Build comparison rows
  const rows = COMPARE_INDICATORS.map(ci => {
    const ind = INDICATORS.find(i => i.id === ci.id);
    const valA = dataA[ci.id]?.value ?? null;
    const valB = dataB[ci.id]?.value ?? null;
    const fmtA = valA !== null && ind ? formatValue(valA, ind.format, ind.decimals) : 'N/A';
    const fmtB = valB !== null && ind ? formatValue(valB, ind.format, ind.decimals) : 'N/A';

    // Determine "winner" — higher is better for most, except inflation/unemployment/debt/gini
    const lowerIsBetter = ['IMF.PCPIPCH', 'IMF.LUR', 'IMF.GGXWDG_NGDP', 'SI.POV.GINI', 'EN.GHG.CO2.PC.CE.AR5'].includes(ci.id);
    let winner: 'A' | 'B' | 'tie' = 'tie';
    if (valA !== null && valB !== null) {
      if (lowerIsBetter) winner = valA < valB ? 'A' : valA > valB ? 'B' : 'tie';
      else winner = valA > valB ? 'A' : valA < valB ? 'B' : 'tie';
    }

    return { ...ci, valA, valB, fmtA, fmtB, winner, ind };
  });

  // Narrative
  const gdpA = dataA['IMF.NGDPD']?.value;
  const gdpB = dataB['IMF.NGDPD']?.value;
  const popA = dataA['SP.POP.TOTL']?.value;
  const popB = dataB['SP.POP.TOTL']?.value;
  const gdpRatio = gdpA && gdpB ? (Math.max(gdpA, gdpB) / Math.min(gdpA, gdpB)).toFixed(1) : null;
  const winsA = rows.filter(r => r.winner === 'A').length;
  const winsB = rows.filter(r => r.winner === 'B').length;

  // FAQ for comparison queries
  const gdpAFmt = gdpA ? formatValue(gdpA, 'currency') : null;
  const gdpBFmt = gdpB ? formatValue(gdpB, 'currency') : null;
  const compFaqs = [
    ...(gdpAFmt && gdpBFmt ? [{
      q: `Which has a larger economy, ${countryA.name} or ${countryB.name}?`,
      a: `${gdpA! > gdpB! ? countryA.name : countryB.name} has the larger economy with a GDP of ${gdpA! > gdpB! ? gdpAFmt : gdpBFmt}, compared to ${gdpA! > gdpB! ? countryB.name : countryA.name}'s ${gdpA! > gdpB! ? gdpBFmt : gdpAFmt}${gdpRatio ? ` (${gdpRatio}x larger)` : ''}. Source: IMF World Economic Outlook.`,
    }] : []),
    ...(popA && popB ? [{
      q: `Which country has a larger population, ${countryA.name} or ${countryB.name}?`,
      a: `${popA > popB ? countryA.name : countryB.name} has a larger population at ${formatValue(Math.max(popA, popB), 'number')}, compared to ${popA > popB ? countryB.name : countryA.name}'s ${formatValue(Math.min(popA, popB), 'number')}. Source: World Bank.`,
    }] : []),
    {
      q: `How do ${countryA.name} and ${countryB.name} compare overall?`,
      a: `Across ${COMPARE_INDICATORS.length} key indicators, ${winsA > winsB ? countryA.name : winsB > winsA ? countryB.name : 'neither country'} leads in ${Math.max(winsA, winsB)} categories. The comparison covers GDP, population, inflation, unemployment, debt, life expectancy, and more. Data from IMF and World Bank.`,
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Dataset',
        name: `${countryA.name} vs ${countryB.name} — Economic Comparison`,
        description: `Side-by-side comparison of ${countryA.name} and ${countryB.name} across ${COMPARE_INDICATORS.length} key indicators including GDP, population, inflation, unemployment, and life expectancy. Data from IMF World Economic Outlook and World Bank.`,
        url: `https://statisticsoftheworld.com/compare/${slug}`,
        license: 'https://creativecommons.org/licenses/by/4.0/',
        creator: [
          { '@type': 'Organization', name: 'IMF', url: 'https://www.imf.org' },
          { '@type': 'Organization', name: 'World Bank', url: 'https://www.worldbank.org' },
        ],
        provider: { '@type': 'Organization', name: 'Statistics of the World', url: 'https://statisticsoftheworld.com' },
        isAccessibleForFree: true,
        dateModified: new Date().toISOString().split('T')[0],
      },
      {
        '@type': 'FAQPage',
        mainEntity: compFaqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
          { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://statisticsoftheworld.com/compare' },
          { '@type': 'ListItem', position: 3, name: `${countryA.name} vs ${countryB.name}` },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />

      <section className="max-w-[900px] mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/compare" className="hover:text-gray-600 transition">Compare</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{countryA.name} vs {countryB.name}</span>
        </nav>

        {/* Hero */}
        <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#0d1b2a] mb-2">
          {countryA.name} vs {countryB.name}
        </h1>
        <p className="text-[15px] text-[#64748b] mb-4">
          Side-by-side economic and demographic comparison · {new Date().getFullYear()} data · Source: IMF & World Bank
        </p>

        {/* Expert editorial (if available) */}
        {COMPARISON_EDITORIAL[slug] && (
          <p className="text-[15px] text-[#374151] leading-[1.8] mb-6 max-w-[800px]">
            {COMPARISON_EDITORIAL[slug]}
          </p>
        )}

        {/* Data summary paragraph */}
        <p className="text-[14px] text-[#475569] leading-relaxed mb-8 max-w-[800px]">
          {gdpAFmt && gdpBFmt ? `${countryA.name} has a GDP of ${gdpAFmt} compared to ${countryB.name}'s ${gdpBFmt}${gdpRatio ? `, making it ${gdpA! > gdpB! ? gdpRatio + 'x larger' : (gdpB! / gdpA!).toFixed(1) + 'x smaller'}` : ''}. ` : ''}
          {popA && popB ? `${countryA.name}'s population is ${formatValue(popA, 'number')} vs ${countryB.name}'s ${formatValue(popB, 'number')}. ` : ''}
          Across {COMPARE_INDICATORS.length} key indicators, {winsA > winsB ? `${countryA.name} leads in ${winsA}` : winsB > winsA ? `${countryB.name} leads in ${winsB}` : 'both countries are evenly matched in'} categories.
          All data sourced from the IMF World Economic Outlook and World Bank World Development Indicators.
        </p>

        {/* Score overview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5 text-center">
            <Flag iso2={countryA.iso2} size={36} />
            <div className="text-[16px] font-bold text-[#0d1b2a] mt-2">{countryA.name}</div>
            <div className="text-[28px] font-extrabold text-[#2563eb]">{winsA}</div>
            <div className="text-[12px] text-[#64748b]">indicators lead</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5 text-center flex flex-col items-center justify-center">
            <div className="text-[14px] text-[#94a3b8] font-bold">VS</div>
            {gdpRatio && (
              <div className="text-[11px] text-[#94a3b8] mt-1">GDP ratio: {gdpRatio}x</div>
            )}
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5 text-center">
            <Flag iso2={countryB.iso2} size={36} />
            <div className="text-[16px] font-bold text-[#0d1b2a] mt-2">{countryB.name}</div>
            <div className="text-[28px] font-extrabold text-[#dc2626]">{winsB}</div>
            <div className="text-[12px] text-[#64748b]">indicators lead</div>
          </div>
        </div>

        {/* Comparison table */}
        <div className="bg-white border border-[#d5dce6] rounded-xl overflow-hidden shadow-sm mb-8">
          <table className="w-full">
            <thead>
              <tr className="bg-[#0d1b2a] text-white">
                <th className="px-5 py-3 text-left text-[13px] font-semibold">Indicator</th>
                <th className="px-5 py-3 text-right text-[13px] font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <Flag iso2={countryA.iso2} size={14} /> {countryA.name}
                  </span>
                </th>
                <th className="px-5 py-3 text-right text-[13px] font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <Flag iso2={countryB.iso2} size={14} /> {countryB.name}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} className={i % 2 === 1 ? 'bg-[#f8fafc]' : ''}>
                  <td className="px-5 py-3">
                    <Link href={`/ranking/${row.rankSlug}`} className="text-[14px] text-[#475569] hover:text-[#2563eb] transition">
                      {row.label}
                    </Link>
                  </td>
                  <td className={`px-5 py-3 text-right font-mono text-[14px] ${row.winner === 'A' ? 'text-[#2563eb] font-bold' : 'text-[#64748b]'}`}>
                    {row.fmtA}
                    {row.winner === 'A' && <span className="ml-1 text-[10px]">✓</span>}
                  </td>
                  <td className={`px-5 py-3 text-right font-mono text-[14px] ${row.winner === 'B' ? 'text-[#dc2626] font-bold' : 'text-[#64748b]'}`}>
                    {row.fmtB}
                    {row.winner === 'B' && <span className="ml-1 text-[10px]">✓</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Narrative */}
        <div className="bg-white border border-[#d5dce6] rounded-xl p-6 mb-8">
          <h2 className="text-[18px] font-bold text-[#0d1b2a] mb-3">Summary</h2>
          <p className="text-[14px] text-[#475569] leading-relaxed">
            {gdpA && gdpB ? (
              <>
                {countryA.name} has a GDP of {formatValue(gdpA, 'currency')} compared to {countryB.name}&apos;s {formatValue(gdpB, 'currency')}, making the {gdpA > gdpB ? 'former' : 'latter'} economy {gdpRatio}x larger.
              </>
            ) : null}
            {' '}
            {popA && popB ? (
              <>
                In terms of population, {countryA.name} has {formatValue(popA, 'number')} people while {countryB.name} has {formatValue(popB, 'number')}.
              </>
            ) : null}
            {' '}
            Across the {COMPARE_INDICATORS.length} indicators compared, {countryA.name} leads in {winsA} and {countryB.name} leads in {winsB}.
          </p>
        </div>

        {/* Cross-links */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Link href={`/country/${idA}`} className="bg-white border border-[#d5dce6] rounded-xl p-4 hover:border-[#2563eb] hover:shadow-md transition group">
            <div className="flex items-center gap-2 mb-1">
              <Flag iso2={countryA.iso2} size={20} />
              <span className="text-[15px] font-bold text-[#0d1b2a] group-hover:text-[#2563eb]">{countryA.name}</span>
            </div>
            <span className="text-[13px] text-[#64748b]">Full country profile with 400+ indicators →</span>
          </Link>
          <Link href={`/country/${idB}`} className="bg-white border border-[#d5dce6] rounded-xl p-4 hover:border-[#2563eb] hover:shadow-md transition group">
            <div className="flex items-center gap-2 mb-1">
              <Flag iso2={countryB.iso2} size={20} />
              <span className="text-[15px] font-bold text-[#0d1b2a] group-hover:text-[#2563eb]">{countryB.name}</span>
            </div>
            <span className="text-[13px] text-[#64748b]">Full country profile with 400+ indicators →</span>
          </Link>
        </div>

        {/* Other comparisons */}
        <div>
          <h2 className="text-[16px] font-semibold text-[#0d1b2a] mb-3">Other Comparisons</h2>
          <div className="flex flex-wrap gap-2">
            {PAIRS.filter(([a, b]) => `${a}-vs-${b}` !== slug).slice(0, 12).map(([a, b]) => (
              <Link
                key={`${a}-${b}`}
                href={`/compare/${a}-vs-${b}`}
                className="text-[13px] px-3 py-1.5 bg-white border border-[#d5dce6] rounded-lg hover:bg-[#f1f5f9] transition text-[#475569]"
              >
                {slugToName(a)} vs {slugToName(b)}
              </Link>
            ))}
          </div>
        </div>

        {/* Interactive tool link */}
        <div className="mt-8 text-center">
          <Link href="/compare" className="text-[14px] text-[#2563eb] hover:underline">
            Want to compare different countries? Use our interactive comparison tool →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
