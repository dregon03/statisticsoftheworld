import Link from 'next/link';
import { getCountry, getAllIndicatorsForCountry, INDICATORS, CATEGORIES, formatValue } from '@/lib/data';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Flag from '../../Flag';

type Props = { params: Promise<{ id: string }> };

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
    title: `${country.name} — Statistics & Data`,
    description: `${parts.join(' | ')}. Explore ${country.name}'s economy, demographics, health, education, and 300+ indicators with data from IMF and World Bank.`,
    openGraph: {
      title: `${country.name} — Key Statistics`,
      description: `${parts.join(' | ')}`,
      siteName: 'Statistics of the World',
    },
  };
}

export default async function CountryPage({ params }: Props) {
  const { id } = await params;
  const country = await getCountry(id);
  if (!country) notFound();

  const indicators = await getAllIndicatorsForCountry(id);

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
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/icon-192.png" alt="SOTW" width={28} height={28} className="rounded" />
            <span className="font-semibold">Statistics of the World</span>
          </Link>
          <nav className="flex gap-6 text-sm text-gray-500">
            <Link href="/countries" className="hover:text-gray-900 transition">Countries</Link>
            <Link href="/rankings" className="hover:text-gray-900 transition">Indicators</Link>
          </nav>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/countries" className="hover:text-gray-600 transition">Countries</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{country.name}</span>
        </div>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Flag iso2={country.iso2} size={40} />
              {country.name}
            </h1>
            <div className="flex gap-4 text-sm text-gray-400">
              {country.capitalCity && <span>Capital: {country.capitalCity}</span>}
              <span>Region: {country.region}</span>
              <span>Income: {country.incomeLevel}</span>
            </div>
          </div>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { id: 'IMF.NGDPD', label: 'GDP' },
            { id: 'SP.POP.TOTL', label: 'Population' },
            { id: 'IMF.NGDPDPC', label: 'GDP per Capita' },
            { id: 'SP.DYN.LE00.IN', label: 'Life Expectancy' },
          ].map(stat => {
            const ind = INDICATORS.find(i => i.id === stat.id);
            const d = indicators[stat.id];
            return (
              <div key={stat.id} className="border border-gray-100 rounded-xl p-5">
                <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
                <div className="text-2xl font-bold text-blue-600">
                  {d && ind ? formatValue(d.value, ind.format, ind.decimals) : 'N/A'}
                </div>
                {d && <div className="text-xs text-gray-400 mt-1">{d.year}</div>}
              </div>
            );
          })}
        </div>

        {/* All indicators by category */}
        <div className="space-y-8">
          {CATEGORIES.map(category => {
            const categoryIndicators = INDICATORS.filter(ind => ind.category === category);
            const hasData = categoryIndicators.some(ind => indicators[ind.id]);
            if (!hasData) return null;

            return (
              <div key={category}>
                <h2 className="text-lg font-semibold mb-3 text-gray-900">{category}</h2>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
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
                          <tr key={ind.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                            <td className="px-5 py-2.5 text-sm">{ind.label}</td>
                            <td className="px-5 py-2.5 text-right font-mono text-sm">{formatValue(d.value, ind.format, ind.decimals)}</td>
                            <td className="px-5 py-2.5 text-right text-gray-400 text-xs">{d.year}</td>
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

      <footer className="border-t border-gray-100 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-gray-400">
          <p>Data from IMF, World Bank, WHO, UNESCO, ILO, and FAO.</p>
          <p className="mt-1">Statistics of the World 2026</p>
        </div>
      </footer>
    </main>
  );
}
