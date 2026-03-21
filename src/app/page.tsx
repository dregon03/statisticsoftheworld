import Link from 'next/link';
import { getCountries, getTop10AllIndicators, formatValue, INDICATORS, CATEGORIES } from '@/lib/data';
import CategorySection from './CategorySection';

// Key indicators shown by default per category (before "show more")
const FEATURED: Record<string, string[]> = {
  'Economy': [
    'IMF.NGDPD', 'IMF.NGDPDPC', 'IMF.NGDP_RPCH',
    'IMF.PPPGDP', 'IMF.PPPPC', 'IMF.PPPSH',
  ],
  'Fiscal & Monetary': [
    'IMF.PCPIPCH', 'IMF.LUR', 'IMF.GGXWDG_NGDP', 'FI.RES.TOTL.CD',
  ],
  'Trade': [
    'NE.TRD.GNFS.ZS', 'BX.KLT.DINV.WD.GD.ZS', 'TX.VAL.TECH.MF.ZS',
  ],
  'External Debt': [
    'DT.DOD.DECT.GN.ZS', 'DT.DOD.DECT.CD',
  ],
  'Finance': [
    'CM.MKT.LCAP.GD.ZS', 'FS.AST.PRVT.GD.ZS',
  ],
  'Business Environment': [
    'IC.ELC.DURS',
  ],
  'People': [
    'SP.POP.TOTL', 'SP.DYN.LE00.IN', 'SP.DYN.TFRT.IN', 'EN.POP.DNST',
  ],
  'Labor': [
    'SL.UEM.TOTL.ZS', 'SL.TLF.CACT.ZS', 'SL.UEM.1524.ZS',
  ],
  'Education': [
    'SE.ADT.LITR.ZS', 'SE.XPD.TOTL.GD.ZS', 'SE.TER.ENRR',
  ],
  'Health': [
    'SH.XPD.CHEX.GD.ZS', 'SH.DYN.MORT', 'SH.MED.PHYS.ZS', 'SH.STA.MMRT',
  ],
  'Energy & Environment': [
    'EN.GHG.CO2.PC.CE.AR5', 'EG.ELC.RNEW.ZS', 'EG.ELC.ACCS.ZS', 'EN.ATM.PM25.MC.M3',
  ],
  'Agriculture': [
    'AG.YLD.CREL.KG', 'SN.ITK.DEFC.ZS',
  ],
  'Technology': [
    'IT.NET.USER.ZS', 'GB.XPD.RSDV.GD.ZS', 'IT.CEL.SETS.P2',
  ],
  'Infrastructure': [
    'IS.AIR.PSGR', 'LP.LPI.OVRL.XQ',
  ],
  'Gender': [
    'SG.GEN.PARL.ZS', 'SP.ADO.TFRT',
  ],
  'Governance': [
    'CC.EST', 'RL.EST', 'PV.EST', 'VA.EST',
  ],
  'Military': [
    'MS.MIL.XPND.GD.ZS', 'MS.MIL.TOTL.P1', 'MS.MIL.XPND.CD',
  ],
  'Poverty & Inequality': [
    'SI.POV.GINI', 'SI.POV.DDAY', 'SI.DST.10TH.10',
  ],
  'Social Protection': [
    'HD.HCI.OVRL', 'HD.HCI.LAYS',
  ],
  'Tourism': [
    'ST.INT.ARVL', 'ST.INT.RCPT.CD',
  ],
  'Urban Development': [
    'SP.URB.GROW', 'EN.POP.SLUM.UR.ZS',
  ],
  'Private Sector': [
    'IC.FRM.CORR.ZS', 'IC.FRM.TRNG.ZS',
  ],
};

export default async function Home() {
  const [countries, allTop10] = await Promise.all([
    getCountries(),
    getTop10AllIndicators(),
  ]);

  // Group indicators by category, featured ones first
  const categoriesWithData = CATEGORIES.map(category => {
    const featured = FEATURED[category] || [];
    const indicators = INDICATORS
      .filter(ind => ind.category === category && allTop10[ind.id]?.length > 0)
      .map(ind => ({
        ...ind,
        data: allTop10[ind.id] || [],
      }));
    // Sort: featured first, rest in original order
    indicators.sort((a, b) => {
      const aFeat = featured.indexOf(a.id);
      const bFeat = featured.indexOf(b.id);
      if (aFeat !== -1 && bFeat !== -1) return aFeat - bFeat;
      if (aFeat !== -1) return -1;
      if (bFeat !== -1) return 1;
      return 0;
    });
    // Count how many featured ones actually have data
    const featuredCount = indicators.filter(ind => featured.includes(ind.id)).length;
    return { category, indicators, featuredCount: Math.max(featuredCount, 2) };
  }).filter(c => c.indicators.length > 0);

  const totalIndicatorsWithData = categoriesWithData.reduce((sum, c) => sum + c.indicators.length, 0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Statistics of the World',
    url: 'https://statisticsoftheworld.com',
    description: `${countries.length} countries. ${INDICATORS.length} indicators. Free global statistics from IMF, World Bank, WHO, and UNESCO.`,
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://statisticsoftheworld.com/countries?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Nav */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center font-bold text-xs text-white">SW</div>
            <span className="font-semibold">Statistics of the World</span>
          </Link>
          <nav className="flex gap-6 text-sm text-gray-500">
            <Link href="/countries" className="hover:text-gray-900 transition">Countries</Link>
            <Link href="/rankings" className="hover:text-gray-900 transition">Indicators</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
          The world&apos;s data,
          <br />
          <span className="text-blue-600">in one place.</span>
        </h1>
        <p className="text-lg text-gray-500 mt-4 max-w-xl">
          {countries.length} countries. {totalIndicatorsWithData} indicators. Sourced from IMF, World Bank, WHO, and UNESCO.
        </p>
        <div className="flex gap-3 mt-8">
          <Link href="/countries" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
            Explore Countries
          </Link>
          <Link href="/rankings" className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition">
            Browse Indicators
          </Link>
        </div>
      </section>

      {/* Category jump nav */}
      <section className="max-w-6xl mx-auto px-6 pb-8">
        <div className="flex flex-wrap gap-2">
          {categoriesWithData.map(({ category, indicators }) => (
            <a
              key={category}
              href={`#${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className="px-3 py-1.5 border border-gray-200 rounded-full text-xs text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition"
            >
              {category} <span className="text-gray-300">({indicators.length})</span>
            </a>
          ))}
        </div>
      </section>

      {/* All indicators by category — top 2 shown, expandable */}
      {categoriesWithData.map(({ category, indicators, featuredCount }) => (
        <CategorySection key={category} category={category} indicators={indicators} featuredCount={featuredCount} />
      ))}

      {/* Browse countries */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Browse Countries</h2>
          <Link href="/countries" className="text-xs text-gray-400 hover:text-gray-600 transition">View all {countries.length}</Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-1.5">
          {countries
            .sort((a, b) => a.name.localeCompare(b.name))
            .slice(0, 40)
            .map(c => (
              <Link
                key={c.id}
                href={`/country/${c.id}`}
                className="px-2.5 py-1.5 border border-gray-100 rounded text-xs hover:bg-gray-50 hover:border-gray-200 transition truncate text-center"
              >
                {c.name}
              </Link>
            ))}
          <Link
            href="/countries"
            className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-blue-600 hover:bg-gray-100 transition text-center"
          >
            +{countries.length - 40} more
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-gray-400">
          <p>Data from IMF World Economic Outlook, World Bank, WHO, UNESCO, ILO, and FAO.</p>
          <p className="mt-1">Statistics of the World 2026</p>
        </div>
      </footer>
    </main>
  );
}
