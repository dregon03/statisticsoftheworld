import Link from 'next/link';
import { getCountry, getAllIndicatorsForCountry, getHistoricalData, INDICATORS, CATEGORIES, formatValue } from '@/lib/data';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Flag from '../../Flag';
import CountryCharts from './CountryCharts';
import CountryNarrative from './CountryNarrative';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

type Props = { params: Promise<{ id: string }> };

const KEY_STATS = [
  { id: 'IMF.NGDPD', label: 'GDP' },
  { id: 'SP.POP.TOTL', label: 'Population' },
  { id: 'IMF.NGDPDPC', label: 'GDP per Capita' },
  { id: 'SP.DYN.LE00.IN', label: 'Life Expectancy' },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const country = await getCountry(id);
  if (!country) return { title: 'Country Not Found' };

  const indicators = await getAllIndicatorsForCountry(id);
  const gdp = indicators['IMF.NGDPD'];
  const pop = indicators['SP.POP.TOTL'];

  const parts = [country.name];
  if (gdp) parts.push(`GDP: ${formatValue(gdp.value, 'currency')}`);
  if (pop) parts.push(`Population: ${formatValue(pop.value, 'number')}`);

  return {
    title: `${country.name} Economy & Data 2026 — GDP, Population & More`,
    description: `${parts.join(' · ')}. Explore ${country.name}'s economy, demographics, trade, health, and 400+ indicators with interactive charts and historical data from IMF and World Bank. Free API.`,
    openGraph: {
      title: `${country.name} — Economy & Key Statistics 2026`,
      description: `${parts.join(' · ')}. 400+ indicators with charts.`,
      siteName: 'Statistics of the World',
    },
  };
}

export default async function CountryPage({ params }: Props) {
  const { id } = await params;
  const country = await getCountry(id);
  if (!country) notFound();

  const indicators = await getAllIndicatorsForCountry(id);

  // Fetch historical data for key stats (for charts)
  const historyPromises = KEY_STATS.map(stat => getHistoricalData(stat.id, id));
  const histories = await Promise.all(historyPromises);
  const keyStatsHistory: Record<string, { year: number; value: number | null }[]> = {};
  KEY_STATS.forEach((stat, i) => {
    keyStatsHistory[stat.id] = histories[i];
  });

  const gdp = indicators['IMF.NGDPD'];
  const pop = indicators['SP.POP.TOTL'];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Country',
    name: country.name,
    url: `https://statisticsoftheworld.com/country/${id}`,
    ...(country.capitalCity && { containsPlace: { '@type': 'City', name: country.capitalCity } }),
    additionalProperty: [
      ...(gdp ? [{ '@type': 'PropertyValue', name: 'GDP (USD Billions)', value: gdp.value, unitCode: 'USD' }] : []),
      ...(pop ? [{ '@type': 'PropertyValue', name: 'Population', value: pop.value }] : []),
    ],
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />

      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-4 text-[14px] text-[#94a3b8]">
          <Link href="/" className="hover:text-[#0d1b2a] transition">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/countries" className="hover:text-[#0d1b2a] transition">Countries</Link>
          <span className="mx-2">/</span>
          <span className="text-[#64748b]">{country.name}</span>
        </div>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-[34px] font-extrabold text-[#0d1b2a] mb-2 flex items-center gap-3 tracking-tight">
              <Flag iso2={country.iso2} size={40} />
              {country.name}
            </h1>
            <div className="flex gap-4 text-[14px] text-[#64748b]">
              {country.capitalCity && <span>Capital: {country.capitalCity}</span>}
              <span>Region: {country.region}</span>
              <span>Income: {country.incomeLevel}</span>
            </div>
          </div>
        </div>

        {/* Sub-navigation */}
        <div className="flex gap-1 mb-6 border-b border-[#d5dce6]">
          <span className="px-4 py-2.5 text-[14px] font-semibold text-[#0d1b2a] border-b-2 border-[#0d1b2a]">
            Overview
          </span>
          <Link href={`/country/${id}/forecast`} className="px-4 py-2.5 text-[14px] text-[#64748b] hover:text-[#0d1b2a] transition">
            Forecasts
          </Link>
          <Link href={`/country/${id}/trade-data`} className="px-4 py-2.5 text-[14px] text-[#64748b] hover:text-[#0d1b2a] transition">
            Trade
          </Link>
          <Link href={`/calendar`} className="px-4 py-2.5 text-[14px] text-[#64748b] hover:text-[#0d1b2a] transition">
            Calendar
          </Link>
          <Link href={`/indicators`} className="px-4 py-2.5 text-[14px] text-[#64748b] hover:text-[#0d1b2a] transition">
            All Indicators
          </Link>
        </div>

        {/* AI-generated country profile */}
        <CountryNarrative countryId={id} />

        {/* Key stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {KEY_STATS.map(stat => {
            const ind = INDICATORS.find(i => i.id === stat.id);
            const d = indicators[stat.id];
            return (
              <Link
                key={stat.id}
                href={`/country/${id}/${encodeURIComponent(stat.id)}`}
                className="bg-white border border-[#d5dce6] rounded-xl p-5 hover:border-[#b0bdd0] hover:shadow-md transition-all group"
              >
                <div className="text-[14px] text-[#64748b] mb-1">{stat.label}</div>
                <div className="text-[24px] font-extrabold text-[#0d1b2a] group-hover:text-[#0066cc] transition">
                  {d && ind ? formatValue(d.value, ind.format, ind.decimals) : 'N/A'}
                </div>
                {d && <div className="text-[14px] text-[#94a3b8] mt-1">{d.year}</div>}
              </Link>
            );
          })}
        </div>

        {/* Key stats charts */}
        <CountryCharts
          keyStats={KEY_STATS}
          indicators={indicators}
          history={keyStatsHistory}
        />

        {/* All indicators by category */}
        <div className="space-y-8 mt-12">
          {CATEGORIES.map(category => {
            const categoryIndicators = INDICATORS.filter(ind => ind.category === category);
            const hasData = categoryIndicators.some(ind => indicators[ind.id]);
            if (!hasData) return null;

            return (
              <div key={category}>
                <h2 className="text-[18px] font-bold mb-3 text-[#0d1b2a]">{category}</h2>
                <div className="bg-white border border-[#d5dce6] rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-[14px] text-[#64748b] border-b border-[#d5dce6] bg-[#f4f6f9]">
                        <th className="px-5 py-2.5">Indicator</th>
                        <th className="px-5 py-2.5 text-right">Value</th>
                        <th className="px-5 py-2.5 text-right">Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryIndicators.map(ind => {
                        const d = indicators[ind.id];
                        if (!d) return null;
                        return (
                          <tr key={ind.id} className="border-b border-[#edf0f5] hover:bg-[#f4f6f9] transition">
                            <td className="px-5 py-2.5 text-[14px]">
                              <Link
                                href={`/country/${id}/${encodeURIComponent(ind.id)}`}
                                className="text-[#0d1b2a] hover:text-[#0066cc] transition"
                              >
                                {ind.label}
                              </Link>
                            </td>
                            <td className="px-5 py-2.5 text-right font-mono text-[14px]">{formatValue(d.value, ind.format, ind.decimals)}</td>
                            <td className="px-5 py-2.5 text-right text-[#94a3b8] text-[14px]">{d.year}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </main>
  );
}
