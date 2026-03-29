import Link from 'next/link';
import { getIndicatorForAllCountries, INDICATORS, formatValue } from '@/lib/data';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Flag from '../../Flag';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

// Slug → Indicator ID mapping for SEO-friendly URLs
const SLUG_MAP: Record<string, { id: string; title: string; description: string }> = {
  'gdp': { id: 'IMF.NGDPD', title: 'GDP by Country', description: 'Gross Domestic Product (nominal USD) rankings for all countries. Data from IMF World Economic Outlook.' },
  'gdp-growth': { id: 'IMF.NGDP_RPCH', title: 'GDP Growth Rate by Country', description: 'Real GDP growth rate (%) rankings. Annual percentage change in real GDP from IMF WEO.' },
  'gdp-per-capita': { id: 'IMF.NGDPDPC', title: 'GDP per Capita by Country', description: 'GDP per capita (current USD) rankings. A measure of economic output per person.' },
  'gdp-ppp': { id: 'IMF.PPPGDP', title: 'GDP (PPP) by Country', description: 'GDP adjusted for purchasing power parity (international dollars). Allows fairer cross-country comparison.' },
  'gdp-per-capita-ppp': { id: 'IMF.PPPPC', title: 'GDP per Capita (PPP) by Country', description: 'GDP per capita adjusted for purchasing power parity. Best measure of living standards.' },
  'inflation-rate': { id: 'IMF.PCPIPCH', title: 'Inflation Rate by Country', description: 'Consumer price inflation (annual %) for all countries. IMF WEO estimates and projections.' },
  'unemployment-rate': { id: 'IMF.LUR', title: 'Unemployment Rate by Country', description: 'Unemployment rate (%) rankings. Percentage of labor force that is unemployed, from IMF.' },
  'government-debt': { id: 'IMF.GGXWDG_NGDP', title: 'Government Debt to GDP by Country', description: 'General government gross debt as a percentage of GDP. Higher values indicate heavier debt burden.' },
  'current-account': { id: 'IMF.BCA_NGDPD', title: 'Current Account Balance by Country', description: 'Current account balance as percentage of GDP. Positive = surplus, negative = deficit.' },
  'population': { id: 'SP.POP.TOTL', title: 'Population by Country', description: 'Total population rankings for all countries. Data from World Bank.' },
  'population-growth': { id: 'SP.POP.GROW', title: 'Population Growth by Country', description: 'Annual population growth rate (%). Includes natural increase and net migration.' },
  'life-expectancy': { id: 'SP.DYN.LE00.IN', title: 'Life Expectancy by Country', description: 'Life expectancy at birth (years). A key measure of health and development.' },
  'fertility-rate': { id: 'SP.DYN.TFRT.IN', title: 'Fertility Rate by Country', description: 'Total fertility rate (births per woman). Below 2.1 indicates declining population without migration.' },
  'co2-emissions': { id: 'EN.ATM.CO2E.PC', title: 'CO₂ Emissions per Capita by Country', description: 'Carbon dioxide emissions per capita (metric tons). Key climate change indicator.' },
  'internet-users': { id: 'IT.NET.USER.ZS', title: 'Internet Users by Country', description: 'Percentage of population using the internet. Measure of digital connectivity.' },
  'health-spending': { id: 'SH.XPD.CHEX.GD.ZS', title: 'Health Spending (% of GDP) by Country', description: 'Current health expenditure as a share of GDP. Reflects national health investment priority.' },
  'education-spending': { id: 'SE.XPD.TOTL.GD.ZS', title: 'Education Spending (% of GDP) by Country', description: 'Government expenditure on education as a share of GDP.' },
  'military-spending': { id: 'MS.MIL.XPND.GD.ZS', title: 'Military Spending (% of GDP) by Country', description: 'Military expenditure as a percentage of GDP.' },
  'trade-openness': { id: 'NE.TRD.GNFS.ZS', title: 'Trade Openness by Country', description: 'Trade (exports + imports) as a percentage of GDP. Higher = more open economy.' },
  'fdi-inflows': { id: 'BX.KLT.DINV.WD.GD.ZS', title: 'FDI Inflows (% of GDP) by Country', description: 'Foreign direct investment net inflows as a share of GDP.' },
  'gini-index': { id: 'SI.POV.GINI', title: 'Gini Index (Inequality) by Country', description: 'Gini coefficient measuring income inequality. 0 = perfect equality, 100 = maximum inequality.' },
  'poverty-rate': { id: 'SI.POV.DDAY', title: 'Poverty Rate by Country', description: 'Population living on less than $2.15/day (%). International poverty line.' },
  'infant-mortality': { id: 'SH.DYN.MORT', title: 'Infant Mortality Rate by Country', description: 'Under-5 mortality rate per 1,000 live births. Key child health indicator.' },
  'urban-population': { id: 'SP.URB.TOTL.IN.ZS', title: 'Urban Population by Country', description: 'Share of population living in urban areas (%).' },
  'renewable-energy': { id: 'EG.FEC.RNEW.ZS', title: 'Renewable Energy by Country', description: 'Renewable energy consumption as a share of total energy consumption (%).' },
  'forest-area': { id: 'AG.LND.FRST.ZS', title: 'Forest Area by Country', description: 'Forest area as a percentage of total land area.' },
  'corruption-control': { id: 'CC.EST', title: 'Control of Corruption by Country', description: 'World Bank governance indicator measuring control of corruption (-2.5 to +2.5).' },
  'rule-of-law': { id: 'RL.EST', title: 'Rule of Law by Country', description: 'World Bank governance indicator measuring rule of law (-2.5 to +2.5).' },
  'tourism-arrivals': { id: 'ST.INT.ARVL', title: 'International Tourism Arrivals by Country', description: 'Number of international tourist arrivals per year.' },
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const config = SLUG_MAP[slug];
  if (!config) return { title: 'Not Found' };

  return {
    title: `${config.title} — 2026 Rankings | Statistics of the World`,
    description: config.description,
    openGraph: {
      title: config.title,
      description: config.description,
      siteName: 'Statistics of the World',
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(SLUG_MAP).map(slug => ({ slug }));
}

export default async function RankingPage({ params }: Props) {
  const { slug } = await params;
  const config = SLUG_MAP[slug];
  if (!config) notFound();

  const ind = INDICATORS.find(i => i.id === config.id);
  if (!ind) notFound();

  const data = await getIndicatorForAllCountries(config.id);

  // Find related rankings
  const related = Object.entries(SLUG_MAP)
    .filter(([s]) => s !== slug)
    .slice(0, 8);

  return (
    <main className="min-h-screen">
      <Nav />

      <section className="max-w-[1000px] mx-auto px-6 py-10">
        {/* Breadcrumbs */}
        <div className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/indicators" className="hover:text-gray-600 transition">Indicators</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{config.title}</span>
        </div>

        <h1 className="text-[28px] font-bold mb-2">{config.title}</h1>
        <p className="text-[14px] text-[#64748b] mb-6 leading-relaxed max-w-[700px]">{config.description}</p>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="border border-gray-100 rounded-xl p-4">
            <div className="text-[15px] text-gray-400 mb-1">Countries</div>
            <div className="text-[20px] font-bold">{data.length}</div>
          </div>
          {data.length > 0 && (
            <>
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="text-[15px] text-gray-400 mb-1">Highest</div>
                <div className="text-[16px] font-bold text-green-600">{formatValue(data[0].value, ind.format, ind.decimals)}</div>
                <div className="text-[15px] text-gray-400">{data[0].country}</div>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="text-[15px] text-gray-400 mb-1">Lowest</div>
                <div className="text-[16px] font-bold text-red-500">{formatValue(data[data.length - 1].value, ind.format, ind.decimals)}</div>
                <div className="text-[15px] text-gray-400">{data[data.length - 1].country}</div>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="text-[15px] text-gray-400 mb-1">Latest Year</div>
                <div className="text-[20px] font-bold">{data[0].year}</div>
              </div>
            </>
          )}
        </div>

        {/* Rankings table */}
        <div className="border border-gray-100 rounded-xl overflow-hidden mb-8">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[15px] text-gray-400 uppercase border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-2.5 w-12">#</th>
                <th className="px-4 py-2.5">Country</th>
                <th className="px-4 py-2.5 text-right">{ind.label}</th>
                <th className="px-4 py-2.5 w-48 hidden md:table-cell"></th>
                <th className="px-4 py-2.5 text-right w-16">Year</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry, i) => {
                const maxVal = Math.max(...data.map(d => Math.abs(d.value || 0)));
                const barWidth = maxVal > 0 ? (Math.abs(entry.value || 0) / maxVal) * 100 : 0;
                return (
                  <tr key={entry.countryId} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-2 text-gray-300 text-[15px]">{i + 1}</td>
                    <td className="px-4 py-2">
                      <Link href={`/country/${entry.countryId}/${encodeURIComponent(config.id)}`} className="inline-flex items-center gap-2 text-[15px] text-blue-600 hover:text-blue-800">
                        <Flag iso2={entry.iso2} size={20} />
                        {entry.country}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-[15px]">
                      {formatValue(entry.value, ind.format, ind.decimals)}
                    </td>
                    <td className="px-4 py-2 hidden md:table-cell">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${barWidth}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right text-gray-400 text-[14px]">{entry.year}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Related rankings */}
        <div>
          <h2 className="text-[16px] font-semibold mb-3">Related Rankings</h2>
          <div className="flex flex-wrap gap-2">
            {related.map(([s, cfg]) => (
              <Link
                key={s}
                href={`/ranking/${s}`}
                className="text-[14px] px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-[#64748b]"
              >
                {cfg.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
