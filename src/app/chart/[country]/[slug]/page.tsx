import Link from 'next/link';
import { getCountry, getCountries, getHistoricalData, INDICATORS, formatValue } from '@/lib/data';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Flag from '../../../Flag';
import ChartWrapper from '@/components/charts/ChartWrapper';
import TimeSeriesChart from '@/components/charts/TimeSeriesChart';
import HistoryExportButton from '@/components/HistoryExportButton';
import EmbedButton from '@/components/EmbedButton';

const SLUG_TO_INDICATOR: Record<string, string> = {
  'gdp': 'IMF.NGDPD',
  'gdp-growth': 'IMF.NGDP_RPCH',
  'gdp-per-capita': 'IMF.NGDPDPC',
  'gdp-ppp': 'IMF.PPPGDP',
  'inflation-rate': 'IMF.PCPIPCH',
  'unemployment-rate': 'IMF.LUR',
  'government-debt': 'IMF.GGXWDG_NGDP',
  'population': 'SP.POP.TOTL',
  'population-growth': 'SP.POP.GROW',
  'life-expectancy': 'SP.DYN.LE00.IN',
  'fertility-rate': 'SP.DYN.TFRT.IN',
  'co2-emissions': 'EN.ATM.CO2E.PC',
  'internet-users': 'IT.NET.USER.ZS',
  'health-spending': 'SH.XPD.CHEX.GD.ZS',
  'education-spending': 'SE.XPD.TOTL.GD.ZS',
  'military-spending': 'MS.MIL.XPND.GD.ZS',
  'trade-openness': 'NE.TRD.GNFS.ZS',
  'gini-index': 'SI.POV.GINI',
  'infant-mortality': 'SH.DYN.MORT',
  'urban-population': 'SP.URB.TOTL.IN.ZS',
  'renewable-energy': 'EG.FEC.RNEW.ZS',
  'current-account': 'IMF.BCA_NGDPD',
  'fdi-inflows': 'BX.KLT.DINV.WD.GD.ZS',
  'forest-area': 'AG.LND.FRST.ZS',
};

// Country slug → ISO3
const COUNTRY_SLUGS: Record<string, string> = {
  'united-states': 'USA', 'usa': 'USA', 'china': 'CHN', 'japan': 'JPN',
  'germany': 'DEU', 'united-kingdom': 'GBR', 'uk': 'GBR', 'france': 'FRA',
  'india': 'IND', 'italy': 'ITA', 'brazil': 'BRA', 'canada': 'CAN',
  'russia': 'RUS', 'south-korea': 'KOR', 'korea': 'KOR', 'australia': 'AUS',
  'spain': 'ESP', 'mexico': 'MEX', 'indonesia': 'IDN', 'netherlands': 'NLD',
  'saudi-arabia': 'SAU', 'turkey': 'TUR', 'switzerland': 'CHE', 'sweden': 'SWE',
  'norway': 'NOR', 'argentina': 'ARG', 'south-africa': 'ZAF', 'nigeria': 'NGA',
  'egypt': 'EGY', 'israel': 'ISR', 'singapore': 'SGP', 'world': 'WLD',
};

type Props = { params: Promise<{ country: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country: countrySlug, slug } = await params;
  const countryId = COUNTRY_SLUGS[countrySlug] || countrySlug.toUpperCase();
  const indicatorId = SLUG_TO_INDICATOR[slug];
  if (!indicatorId) return { title: 'Not Found' };

  const country = await getCountry(countryId);
  const ind = INDICATORS.find(i => i.id === indicatorId);
  if (!country || !ind) return { title: 'Not Found' };

  const history = await getHistoricalData(indicatorId, countryId);
  const valid = history.filter(d => d.value !== null);
  const firstYear = valid[0]?.year || 2000;
  const lastYear = valid[valid.length - 1]?.year || 2026;

  return {
    title: `${country.name} ${ind.label} ${firstYear}-${lastYear} | Historical Chart & Data`,
    description: `${country.name} ${ind.label} historical chart and data from ${firstYear} to ${lastYear}. Free download. Source: ${ind.source === 'imf' ? 'IMF' : 'World Bank'}.`,
    openGraph: {
      title: `${country.name} — ${ind.label} Historical Chart`,
      description: `${ind.label} data for ${country.name} from ${firstYear} to ${lastYear}.`,
      siteName: 'Statistics of the World',
    },
  };
}

export default async function ChartPage({ params }: Props) {
  const { country: countrySlug, slug } = await params;
  const countryId = COUNTRY_SLUGS[countrySlug] || countrySlug.toUpperCase();
  const indicatorId = SLUG_TO_INDICATOR[slug];
  if (!indicatorId) notFound();

  const [country, ind] = [await getCountry(countryId), INDICATORS.find(i => i.id === indicatorId)];
  if (!country || !ind) notFound();

  const history = await getHistoricalData(indicatorId, countryId);
  const validHistory = history.filter(d => d.value !== null);

  if (validHistory.length < 2) notFound();

  const latest = validHistory[validHistory.length - 1];
  const first = validHistory[0];
  const sourceName = ind.source === 'imf' ? 'IMF World Economic Outlook' : 'World Bank';

  return (
    <main className="min-h-screen">
      <Nav />

      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <div className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/country/${countryId}`} className="hover:text-gray-600">{country.name}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{ind.label}</span>
        </div>

        <h1 className="text-[26px] font-bold mb-2 flex items-center gap-3">
          <Flag iso2={country.iso2} size={32} />
          {country.name} {ind.label}
        </h1>
        <p className="text-[14px] text-[#666] mb-6">
          Historical data from {first.year} to {latest.year}. Latest value: <strong>{formatValue(latest.value, ind.format, ind.decimals)}</strong> ({latest.year}).
          Source: {sourceName}.
        </p>

        {/* Full-width chart */}
        <div className="mb-6">
          <ChartWrapper source={sourceName}>
            <TimeSeriesChart
              data={validHistory as { year: number; value: number }[]}
              format={ind.format}
              decimals={ind.decimals}
              height={400}
            />
          </ChartWrapper>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mb-8">
          <EmbedButton indicatorId={indicatorId} countryId={countryId} />
          <HistoryExportButton
            countryName={country.name}
            countryId={countryId}
            indicatorLabel={ind.label}
            indicatorId={indicatorId}
            history={validHistory}
          />
          <Link
            href={`/country/${countryId}/${encodeURIComponent(indicatorId)}`}
            className="text-[12px] text-[#0066cc] hover:underline ml-auto"
          >
            Full indicator detail →
          </Link>
        </div>

        {/* Data table */}
        <div className="border border-gray-100 rounded-xl overflow-hidden mb-8">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
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
                  <tr key={d.year} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-2 text-sm">{d.year}</td>
                    <td className="px-5 py-2 text-right font-mono text-sm">{formatValue(d.value, ind.format, ind.decimals)}</td>
                    <td className="px-5 py-2 text-right text-sm">
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

        {/* Related charts */}
        <div>
          <h2 className="text-[15px] font-semibold mb-3">More Charts for {country.name}</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SLUG_TO_INDICATOR)
              .filter(([s]) => s !== slug)
              .slice(0, 10)
              .map(([s, id]) => {
                const label = INDICATORS.find(i => i.id === id)?.label || s;
                return (
                  <Link key={s} href={`/chart/${countrySlug}/${s}`} className="text-[12px] px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-[#666]">
                    {label}
                  </Link>
                );
              })}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
