import Link from 'next/link';
import { getCountries, getTop10AllIndicators, formatValue, INDICATORS, CATEGORIES } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CategorySection from './CategorySection';
import LiveCounters from '@/components/LiveCounter';

// Key indicators shown by default per category
const FEATURED: Record<string, string[]> = {
  'Economy': ['IMF.NGDPD', 'IMF.NGDPDPC', 'IMF.NGDP_RPCH', 'IMF.PPPGDP', 'IMF.PPPPC', 'IMF.PPPSH'],
  'Fiscal & Monetary': ['IMF.PCPIPCH', 'IMF.LUR', 'IMF.GGXWDG_NGDP', 'FI.RES.TOTL.CD'],
  'Trade': ['NE.TRD.GNFS.ZS', 'BX.KLT.DINV.WD.GD.ZS', 'TX.VAL.TECH.MF.ZS'],
  'People': ['SP.POP.TOTL', 'SP.DYN.LE00.IN', 'SP.DYN.TFRT.IN', 'EN.POP.DNST'],
  'Labor': ['SL.UEM.TOTL.ZS', 'SL.TLF.CACT.ZS', 'SL.UEM.1524.ZS'],
  'Education': ['SE.ADT.LITR.ZS', 'SE.XPD.TOTL.GD.ZS', 'SE.TER.ENRR'],
  'Health': ['SH.XPD.CHEX.GD.ZS', 'SH.DYN.MORT', 'SH.MED.PHYS.ZS', 'SH.STA.MMRT'],
  'Energy & Environment': ['EN.GHG.CO2.PC.CE.AR5', 'EG.ELC.RNEW.ZS', 'EG.ELC.ACCS.ZS', 'EN.ATM.PM25.MC.M3'],
  'Technology': ['IT.NET.USER.ZS', 'GB.XPD.RSDV.GD.ZS', 'IT.CEL.SETS.P2'],
  'Governance': ['CC.EST', 'RL.EST', 'PV.EST', 'VA.EST'],
  'Military': ['MS.MIL.XPND.GD.ZS', 'MS.MIL.TOTL.P1', 'MS.MIL.XPND.CD'],
  'Poverty & Inequality': ['SI.POV.GINI', 'SI.POV.DDAY', 'SI.DST.10TH.10'],
};

// Skip these categories from the homepage (they have their own pages)
const SKIP_CATEGORIES = ['Stock Markets', 'Commodities', 'Currencies', 'US Economy', 'Financial Markets'];

export default async function Home() {
  const [countries, allTop10] = await Promise.all([
    getCountries(),
    getTop10AllIndicators(),
  ]);

  const categoriesWithData = CATEGORIES
    .filter(c => !SKIP_CATEGORIES.includes(c))
    .map(category => {
      const featured = FEATURED[category] || [];
      const indicators = INDICATORS
        .filter(ind => ind.category === category && allTop10[ind.id]?.length > 0)
        .map(ind => ({ ...ind, data: allTop10[ind.id] || [] }));
      indicators.sort((a, b) => {
        const aFeat = featured.indexOf(a.id);
        const bFeat = featured.indexOf(b.id);
        if (aFeat !== -1 && bFeat !== -1) return aFeat - bFeat;
        if (aFeat !== -1) return -1;
        if (bFeat !== -1) return 1;
        return 0;
      });
      const featuredCount = indicators.filter(ind => featured.includes(ind.id)).length;
      return { category, indicators, featuredCount: Math.max(featuredCount, 2) };
    }).filter(c => c.indicators.length > 0);

  const totalIndicators = INDICATORS.length;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Statistics of the World',
    url: 'https://statisticsoftheworld.com',
    description: `${totalIndicators} indicators for ${countries.length} countries. Free global statistics from IMF, World Bank, FRED, and more.`,
  };

  return (
    <main className="min-h-screen bg-white text-[#333]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />

      {/* Hero */}
      <section className="border-b border-[#e8e8e8]">
        <div className="max-w-[1200px] mx-auto px-4 py-12 text-center">
          <h1 className="text-[32px] font-bold mb-4">Statistics of the World</h1>
          <div className="mb-8">
            <LiveCounters />
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-[13px]">
            <Link href="/countries" className="px-4 py-2 bg-[#0066cc] text-white rounded-lg hover:bg-[#0055aa] transition">
              Browse Countries
            </Link>
            <Link href="/compare" className="px-4 py-2 bg-[#0066cc] text-white rounded-lg hover:bg-[#0055aa] transition">
              Compare Countries
            </Link>
            <Link href="/map" className="px-4 py-2 border border-[#e8e8e8] rounded-lg hover:bg-[#f5f7fa] transition">
              World Map
            </Link>
            <Link href="/markets" className="px-4 py-2 border border-[#e8e8e8] rounded-lg hover:bg-[#f5f7fa] transition">
              Markets
            </Link>
            <Link href="/indicators" className="px-4 py-2 border border-[#e8e8e8] rounded-lg hover:bg-[#f5f7fa] transition">
              Indicators
            </Link>
            <Link href="/api-docs" className="px-4 py-2 border border-[#e8e8e8] rounded-lg hover:bg-[#f5f7fa] transition">
              Free API
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Rankings — SEO links */}
      <section className="max-w-[1200px] mx-auto px-4 pt-8 pb-4">
        <h2 className="text-[16px] font-semibold mb-3">Popular Rankings</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { slug: 'gdp', label: 'GDP' },
            { slug: 'gdp-growth', label: 'GDP Growth' },
            { slug: 'gdp-per-capita', label: 'GDP per Capita' },
            { slug: 'inflation-rate', label: 'Inflation Rate' },
            { slug: 'unemployment-rate', label: 'Unemployment' },
            { slug: 'population', label: 'Population' },
            { slug: 'life-expectancy', label: 'Life Expectancy' },
            { slug: 'government-debt', label: 'Govt Debt' },
            { slug: 'co2-emissions', label: 'CO2 Emissions' },
            { slug: 'gini-index', label: 'Inequality' },
            { slug: 'trade-openness', label: 'Trade Openness' },
            { slug: 'military-spending', label: 'Military Spending' },
          ].map(r => (
            <Link key={r.slug} href={`/ranking/${r.slug}`} className="px-3 py-1.5 text-[12px] border border-[#e8e8e8] rounded-lg hover:bg-[#f5f7fa] hover:border-[#ccc] transition text-[#555]">
              {r.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Analysis tools grid */}
      <section className="max-w-[1200px] mx-auto px-4 py-6">
        <h2 className="text-[16px] font-semibold mb-4">Free Analysis Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/compare" className="border border-[#e8e8e8] rounded-xl p-4 hover:border-[#0066cc] hover:bg-[#f8fbff] transition group">
            <div className="text-[20px] mb-2">&#x2194;</div>
            <div className="text-[14px] font-semibold group-hover:text-[#0066cc] transition">Compare Countries</div>
            <div className="text-[12px] text-[#999] mt-1">Side-by-side comparison with charts. G7, BRICS, custom selections.</div>
          </Link>
          <Link href="/map" className="border border-[#e8e8e8] rounded-xl p-4 hover:border-[#0066cc] hover:bg-[#f8fbff] transition group">
            <div className="text-[20px] mb-2">&#x1F5FA;</div>
            <div className="text-[14px] font-semibold group-hover:text-[#0066cc] transition">World Map</div>
            <div className="text-[12px] text-[#999] mt-1">Choropleth visualization for any indicator across 218 countries.</div>
          </Link>
          <Link href="/scatter" className="border border-[#e8e8e8] rounded-xl p-4 hover:border-[#0066cc] hover:bg-[#f8fbff] transition group">
            <div className="text-[20px] mb-2">&#x2022;&#x2022;</div>
            <div className="text-[14px] font-semibold group-hover:text-[#0066cc] transition">Scatter Explorer</div>
            <div className="text-[12px] text-[#999] mt-1">Gapminder-style plots. GDP vs life expectancy and 100+ combinations.</div>
          </Link>
          <Link href="/regions" className="border border-[#e8e8e8] rounded-xl p-4 hover:border-[#0066cc] hover:bg-[#f8fbff] transition group">
            <div className="text-[20px] mb-2">&#x25A8;</div>
            <div className="text-[14px] font-semibold group-hover:text-[#0066cc] transition">Regional Analysis</div>
            <div className="text-[12px] text-[#999] mt-1">Compare world regions and income groups. Average, median, totals.</div>
          </Link>
          <Link href="/heatmap" className="border border-[#e8e8e8] rounded-xl p-4 hover:border-[#0066cc] hover:bg-[#f8fbff] transition group">
            <div className="text-[20px] mb-2">&#x25A6;</div>
            <div className="text-[14px] font-semibold group-hover:text-[#0066cc] transition">Heatmap</div>
            <div className="text-[12px] text-[#999] mt-1">Country-by-indicator matrix. G7, G20, BRICS color-coded at a glance.</div>
          </Link>
          <Link href="/calendar" className="border border-[#e8e8e8] rounded-xl p-4 hover:border-[#0066cc] hover:bg-[#f8fbff] transition group">
            <div className="text-[20px] mb-2">&#x1F4C5;</div>
            <div className="text-[14px] font-semibold group-hover:text-[#0066cc] transition">Economic Calendar</div>
            <div className="text-[12px] text-[#999] mt-1">Data releases, central bank meetings, earnings. FRED + Finnhub powered.</div>
          </Link>
          <Link href="/forecasts" className="border border-[#e8e8e8] rounded-xl p-4 hover:border-[#0066cc] hover:bg-[#f8fbff] transition group">
            <div className="text-[20px] mb-2">&#x1F4C8;</div>
            <div className="text-[14px] font-semibold group-hover:text-[#0066cc] transition">IMF Forecasts</div>
            <div className="text-[12px] text-[#999] mt-1">Free 2-year projections for GDP, inflation, unemployment. TE charges for this.</div>
          </Link>
          <Link href="/trade" className="border border-[#e8e8e8] rounded-xl p-4 hover:border-[#0066cc] hover:bg-[#f8fbff] transition group">
            <div className="text-[20px] mb-2">&#x1F6A2;</div>
            <div className="text-[14px] font-semibold group-hover:text-[#0066cc] transition">Trade Explorer</div>
            <div className="text-[12px] text-[#999] mt-1">Top exports, imports, and trading partners from UN COMTRADE.</div>
          </Link>
          <Link href="/predictions" className="border border-[#e8e8e8] rounded-xl p-4 hover:border-[#7c3aed] hover:bg-[#faf5ff] transition group">
            <div className="text-[20px] mb-2">&#x1F52E;</div>
            <div className="text-[14px] font-semibold group-hover:text-[#7c3aed] transition">Prediction Markets</div>
            <div className="text-[12px] text-[#999] mt-1">Live Polymarket odds on elections, Fed rates, geopolitics. Real-money forecasts.</div>
          </Link>
        </div>
      </section>

      {/* AI-Powered section */}
      <section className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="border border-[#e8e8e8] rounded-xl p-5 bg-gradient-to-r from-[#f8fbff] to-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[16px] font-semibold mb-1">AI-Powered Data Access</h2>
              <p className="text-[12px] text-[#999] mb-3">
                First global statistics platform built for AI agents. Query our data via MCP, OpenAPI, or natural language.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href="/ai" className="px-3 py-1.5 text-[12px] bg-[#0066cc] text-white rounded-lg hover:bg-[#0055aa] transition">
                  MCP Server + API Docs
                </Link>
                <Link href="/api-docs" className="px-3 py-1.5 text-[12px] border border-[#e8e8e8] rounded-lg hover:bg-[#f5f7fa] transition">
                  Free REST API
                </Link>
                <span className="px-3 py-1.5 text-[12px] text-[#999] border border-[#e8e8e8] rounded-lg">
                  llms.txt &middot; OpenAPI &middot; GPT Actions
                </span>
              </div>
            </div>
            <div className="text-[32px] hidden md:block">&#x1F916;</div>
          </div>
        </div>
      </section>

      {/* Category nav */}
      <nav className="max-w-[1200px] mx-auto px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] border-b border-[#f0f0f0]">
        {categoriesWithData.map(({ category }) => (
          <a
            key={category}
            href={`#${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            className="text-[#999] hover:text-[#333] transition whitespace-nowrap"
          >
            {category}
          </a>
        ))}
        <Link href="/markets" className="text-[#0066cc] hover:underline whitespace-nowrap font-medium">Markets →</Link>
        <Link href="/commodities" className="text-[#0066cc] hover:underline whitespace-nowrap font-medium">Commodities →</Link>
      </nav>

      {/* Indicator sections */}
      {categoriesWithData.map(({ category, indicators, featuredCount }) => (
        <CategorySection key={category} category={category} indicators={indicators} featuredCount={featuredCount} />
      ))}

      {/* Browse countries */}
      <section className="max-w-[1200px] mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold">Browse Countries</h2>
          <Link href="/countries" className="text-[12px] text-[#999] hover:text-[#666] transition">View all {countries.length}</Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-1.5">
          {countries
            .sort((a, b) => a.name.localeCompare(b.name))
            .slice(0, 40)
            .map(c => (
              <Link
                key={c.id}
                href={`/country/${c.id}`}
                className="px-2.5 py-1.5 border border-[#e8e8e8] rounded text-[12px] hover:bg-[#f5f7fa] hover:border-[#ccc] transition truncate text-center"
              >
                {c.name}
              </Link>
            ))}
          <Link
            href="/countries"
            className="px-2.5 py-1.5 bg-[#f8f9fa] border border-[#e8e8e8] rounded text-[12px] text-[#0066cc] hover:bg-[#f0f0f0] transition text-center"
          >
            +{countries.length - 40} more
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
