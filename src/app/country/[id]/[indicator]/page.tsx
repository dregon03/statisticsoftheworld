import Link from 'next/link';
import { getCountry, getHistoricalData, getHistoricalStats, getYoYChange, getIndicatorForAllCountries, getIndicatorMeta, INDICATORS, formatValue } from '@/lib/data';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Flag from '../../../Flag';
import IndicatorDetailCharts from './IndicatorDetailCharts';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import StatsRow from '@/components/StatsRow';
import HistoryExportButton from '@/components/HistoryExportButton';
import EmbedButton from '@/components/EmbedButton';
import IndicatorContext from './IndicatorContext';

type Props = { params: Promise<{ id: string; indicator: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, indicator: rawIndicator } = await params;
  const indicatorId = decodeURIComponent(rawIndicator);
  const country = await getCountry(id);
  const ind = INDICATORS.find(i => i.id === indicatorId);
  if (!country || !ind) return { title: 'Not Found' };

  const history = await getHistoricalData(indicatorId, id);
  const latest = history.filter(d => d.value !== null).at(-1);
  const valueStr = latest ? formatValue(latest.value, ind.format, ind.decimals) : 'N/A';

  return {
    title: `${country.name} ${ind.label} ${latest?.year || ''} — ${valueStr}`,
    description: `${country.name} ${ind.label}: ${valueStr} (${latest?.year || 'latest'}). Historical data from ${history[0]?.year || '2000'} to ${latest?.year || 'present'}. Source: ${ind.source === 'imf' ? 'IMF' : 'World Bank'}.`,
    openGraph: {
      title: `${country.name} — ${ind.label}`,
      description: `${valueStr} (${latest?.year || 'latest'}). ${history.filter(d => d.value !== null).length} years of data.`,
      siteName: 'Statistics of the World',
    },
  };
}

// Map futures/alternative IDs to their canonical indicator IDs
const ID_ALIASES: Record<string, string> = {
  'YF.FUT.SP500': 'YF.IDX.USA',
  'YF.FUT.NASDAQ': 'YF.IDX.USA',
  'YF.FUT.DOW': 'YF.IDX.USA',
  'YF.FUT.RUSSELL': 'YF.IDX.USA',
};

export default async function IndicatorDetailPage({ params }: Props) {
  const { id, indicator: rawIndicator } = await params;
  const rawId = decodeURIComponent(rawIndicator);
  const indicatorId = ID_ALIASES[rawId] || rawId;
  const country = await getCountry(id);
  const ind = INDICATORS.find(i => i.id === indicatorId);
  if (!country || !ind) notFound();

  const [history, stats, yoy, allCountries, meta] = await Promise.all([
    getHistoricalData(indicatorId, id),
    getHistoricalStats(indicatorId, id),
    getYoYChange(indicatorId, id),
    getIndicatorForAllCountries(indicatorId),
    getIndicatorMeta(indicatorId),
  ]);

  const validHistory = history.filter(d => d.value !== null);
  const globalRank = allCountries.findIndex(c => c.countryId === id) + 1;
  const totalCountries = allCountries.length;

  // Peer countries (same region, top 5)
  const peers = allCountries
    .filter(c => c.countryId !== id)
    .slice(0, 5);

  const sourceName = ind.source === 'imf' ? 'IMF World Economic Outlook'
    : ind.id.startsWith('UN.') ? 'United Nations'
    : 'World Bank World Development Indicators';

  // IMF indicators include forecast data (current year + future years)
  const currentYear = new Date().getFullYear();
  const isIMF = indicatorId.startsWith('IMF.');
  const forecastStartYear = isIMF ? currentYear : undefined;
  const forecastData = isIMF
    ? validHistory.filter(d => d.year >= currentYear)
    : [];
  const actualData = isIMF
    ? validHistory.filter(d => d.year < currentYear)
    : validHistory;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${country.name} — ${ind.label}`,
    description: `Historical ${ind.label} data for ${country.name}`,
    url: `https://statisticsoftheworld.com/country/${id}/${encodeURIComponent(indicatorId)}`,
    creator: { '@type': 'Organization', name: sourceName },
    temporalCoverage: validHistory.length > 0
      ? `${validHistory[0].year}/${validHistory[validHistory.length - 1].year}`
      : undefined,
    variableMeasured: ind.label,
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />

      <section className="max-w-6xl mx-auto px-6 py-10">
        {/* Breadcrumbs */}
        <div className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/countries" className="hover:text-gray-600 transition">Countries</Link>
          <span className="mx-2">/</span>
          <Link href={`/country/${id}`} className="hover:text-gray-600 transition">{country.name}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{ind.label}</span>
        </div>

        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Flag iso2={country.iso2} size={40} />
            <span>{country.name}</span>
            <span className="text-gray-400 font-normal">—</span>
            <span>{ind.label}</span>
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <span>Category: {ind.category}</span>
            <span>Source: {sourceName}</span>
            {globalRank > 0 && <span>Global Rank: #{globalRank} of {totalCountries}</span>}
          </div>
        </div>

        {/* Summary stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {validHistory.length > 0 && (
            <div className="border border-gray-100 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">Latest Value</div>
              <div className="text-xl font-bold text-blue-600">
                {formatValue(validHistory[validHistory.length - 1].value, ind.format, ind.decimals)}
              </div>
              <div className="text-xs text-gray-400">{validHistory[validHistory.length - 1].year}</div>
            </div>
          )}
          {yoy && yoy.changePercent !== null && (
            <div className="border border-gray-100 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">YoY Change</div>
              <div className={`text-xl font-bold ${yoy.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {yoy.changePercent >= 0 ? '+' : ''}{yoy.changePercent.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">{yoy.previousYear} → {yoy.currentYear}</div>
            </div>
          )}
          {globalRank > 0 && (
            <div className="border border-gray-100 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">Global Rank</div>
              <div className="text-xl font-bold text-gray-900">#{globalRank}</div>
              <div className="text-xs text-gray-400">of {totalCountries} countries</div>
            </div>
          )}
          {stats && (
            <>
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">Maximum</div>
                <div className="text-lg font-bold text-gray-900">{formatValue(stats.max, ind.format, ind.decimals)}</div>
                <div className="text-xs text-gray-400">{stats.maxYear}</div>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">Minimum</div>
                <div className="text-lg font-bold text-gray-900">{formatValue(stats.min, ind.format, ind.decimals)}</div>
                <div className="text-xs text-gray-400">{stats.minYear}</div>
              </div>
              {stats.cagr !== null && (
                <div className="border border-gray-100 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-1">CAGR</div>
                  <div className={`text-xl font-bold ${stats.cagr >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.cagr >= 0 ? '+' : ''}{stats.cagr.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-400">{stats.dataPoints} years</div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Stats row (TE style) */}
        {stats && (
          <div className="mb-6">
            <StatsRow
              last={validHistory.length > 0 ? validHistory[validHistory.length - 1].value : null}
              previous={yoy?.previousValue ?? null}
              highest={stats.max}
              lowest={stats.min}
              format={ind.format}
              decimals={ind.decimals}
              unit={meta?.unit || undefined}
              source={sourceName}
            />
          </div>
        )}

        {/* AI-generated context */}
        <IndicatorContext countryId={id} indicatorId={indicatorId} />

        {/* Chart */}
        <IndicatorDetailCharts
          history={validHistory as { year: number; value: number }[]}
          format={ind.format}
          decimals={ind.decimals}
          sourceName={sourceName}
          forecastStartYear={forecastStartYear}
          indicatorId={indicatorId}
          countryId={id}
        />

        {/* Historical data table */}
        {validHistory.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Historical Data</h2>
              <div className="flex items-center gap-3">
                <EmbedButton indicatorId={indicatorId} countryId={id} />
                <HistoryExportButton
                  countryName={country.name}
                  countryId={id}
                  indicatorLabel={ind.label}
                  indicatorId={indicatorId}
                  history={validHistory}
                />
              </div>
            </div>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                    <th className="px-5 py-2.5">Year</th>
                    <th className="px-5 py-2.5 text-right">Value</th>
                    <th className="px-5 py-2.5 text-right">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {[...validHistory].reverse().map((d, i, arr) => {
                    const prev = arr[i + 1];
                    const change = prev && d.value !== null && prev.value !== null && prev.value !== 0
                      ? ((d.value - prev.value) / Math.abs(prev.value)) * 100
                      : null;
                    return (
                      <tr key={d.year} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="px-5 py-2.5 text-sm font-medium">{d.year}</td>
                        <td className="px-5 py-2.5 text-right font-mono text-sm">{formatValue(d.value, ind.format, ind.decimals)}</td>
                        <td className="px-5 py-2.5 text-right text-sm">
                          {change !== null && (
                            <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* IMF Forecast table */}
        {forecastData.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3">IMF Forecast</h2>
            <p className="text-[14px] text-[#64748b] mb-3">
              Projections from the IMF World Economic Outlook. These are staff estimates, not guarantees.
            </p>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-100 bg-[#fffbeb]">
                    <th className="px-5 py-2.5">Year</th>
                    <th className="px-5 py-2.5 text-right">Projected Value</th>
                    <th className="px-5 py-2.5 text-right">Change from Previous</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastData.map((d, i) => {
                    const prev = i === 0
                      ? actualData[actualData.length - 1]
                      : forecastData[i - 1];
                    const change = prev && d.value !== null && prev.value !== null && prev.value !== 0
                      ? ((d.value - prev.value) / Math.abs(prev.value)) * 100
                      : null;
                    return (
                      <tr key={d.year} className="border-b border-gray-50 bg-[#fffdf5] hover:bg-[#fffbeb] transition">
                        <td className="px-5 py-2.5 text-sm font-medium">
                          {d.year}
                          <span className="ml-2 text-[14px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Forecast</span>
                        </td>
                        <td className="px-5 py-2.5 text-right font-mono text-sm">{formatValue(d.value, ind.format, ind.decimals)}</td>
                        <td className="px-5 py-2.5 text-right text-sm">
                          {change !== null && (
                            <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Peer comparison */}
        {peers.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3">Top Countries — {ind.label}</h2>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                    <th className="px-5 py-2.5 w-8">#</th>
                    <th className="px-5 py-2.5">Country</th>
                    <th className="px-5 py-2.5 text-right">Value</th>
                    <th className="px-5 py-2.5 text-right">Year</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Show current country's row highlighted */}
                  {allCountries.slice(0, 10).map((c, i) => (
                    <tr
                      key={c.countryId}
                      className={`border-b border-gray-50 transition ${c.countryId === id ? 'bg-blue-50 font-semibold' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-5 py-2.5 text-sm text-gray-400">{i + 1}</td>
                      <td className="px-5 py-2.5 text-sm">
                        <Link href={`/country/${c.countryId}/${encodeURIComponent(indicatorId)}`} className="text-blue-600 hover:text-blue-800 transition">
                          {c.country}
                        </Link>
                      </td>
                      <td className="px-5 py-2.5 text-right font-mono text-sm">{formatValue(c.value, ind.format, ind.decimals)}</td>
                      <td className="px-5 py-2.5 text-right text-gray-400 text-xs">{c.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Link
                href={`/indicators?id=${encodeURIComponent(indicatorId)}`}
                className="block px-5 py-3 text-sm text-blue-600 hover:bg-gray-50 transition text-center border-t border-gray-100"
              >
                View all {totalCountries} countries →
              </Link>
            </div>
          </div>
        )}
        {/* Methodology & About */}
        {meta && (meta.description || meta.methodology) && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3">About This Indicator</h2>
            <div className="border border-gray-100 rounded-xl p-6 space-y-4">
              {meta.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Definition</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{meta.description}</p>
                </div>
              )}
              {meta.methodology && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Methodology</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{meta.methodology}</p>
                </div>
              )}
              {meta.unit && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Unit</h3>
                  <p className="text-sm text-gray-600">{meta.unit}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-6 text-xs text-gray-400 pt-2 border-t border-gray-100">
                {meta.sourceName && <span>Source: {meta.sourceName}</span>}
                {meta.coverageStart && meta.coverageEnd && (
                  <span>Coverage: {meta.coverageStart}–{meta.coverageEnd}</span>
                )}
                {meta.sourceUrl && (
                  <a href={meta.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 transition">
                    View original source →
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
