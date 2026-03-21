import Link from 'next/link';
import { getCountries, getIndicatorForAllCountries, formatValue, INDICATORS, CATEGORIES } from '@/lib/data';

// One featured indicator per category — the most important one
const FEATURED: { id: string; label: string }[] = [
  { id: 'IMF.NGDPD', label: 'GDP, Nominal (USD Billions)' },
  { id: 'SP.POP.TOTL', label: 'Population, Total' },
  { id: 'IMF.NGDPDPC', label: 'GDP per Capita (USD)' },
  { id: 'IMF.NGDP_RPCH', label: 'Real GDP Growth (%)' },
  { id: 'IMF.PCPIPCH', label: 'Inflation Rate, CPI (%)' },
  { id: 'IMF.LUR', label: 'Unemployment Rate (%)' },
  { id: 'IMF.GGXWDG_NGDP', label: 'Government Debt (% of GDP)' },
  { id: 'SP.DYN.LE00.IN', label: 'Life Expectancy at Birth (Years)' },
  { id: 'NE.TRD.GNFS.ZS', label: 'Trade (% of GDP)' },
  { id: 'IMF.PPPPC', label: 'GDP per Capita, PPP (Intl $)' },
  { id: 'SL.UEM.TOTL.ZS', label: 'Unemployment, ILO Estimate (%)' },
  { id: 'EN.ATM.CO2E.PC', label: 'CO₂ Emissions (Tonnes per Capita)' },
  { id: 'SH.XPD.CHEX.GD.ZS', label: 'Health Expenditure (% of GDP)' },
  { id: 'SE.XPD.TOTL.GD.ZS', label: 'Education Expenditure (% of GDP)' },
  { id: 'IT.NET.USER.ZS', label: 'Internet Users (% of Population)' },
  { id: 'MS.MIL.XPND.GD.ZS', label: 'Military Expenditure (% of GDP)' },
  { id: 'SI.POV.GINI', label: 'Gini Index (Income Inequality)' },
  { id: 'SH.DYN.MORT', label: 'Infant Mortality (per 1,000)' },
  { id: 'SP.DYN.TFRT.IN', label: 'Fertility Rate (Births per Woman)' },
  { id: 'ST.INT.ARVL', label: 'International Tourism Arrivals' },
  { id: 'GB.XPD.RSDV.GD.ZS', label: 'R&D Expenditure (% of GDP)' },
  { id: 'CC.EST', label: 'Control of Corruption Index' },
  { id: 'EG.ELC.RNEW.ZS', label: 'Renewable Electricity (% of Total)' },
  { id: 'AG.YLD.CREL.KG', label: 'Cereal Yield (kg per Hectare)' },
];

async function getFeaturedData() {
  const results = await Promise.all(
    FEATURED.map(async (f) => {
      const data = await getIndicatorForAllCountries(f.id);
      const ind = INDICATORS.find(i => i.id === f.id);
      return { ...f, data: data.slice(0, 10), format: ind?.format || 'number', decimals: ind?.decimals, isIMFBillions: f.id === 'IMF.NGDPD' || f.id === 'IMF.PPPGDP' };
    })
  );
  return results;
}

export default async function Home() {
  const [countries, featured] = await Promise.all([
    getCountries(),
    getFeaturedData(),
  ]);

  // Pair them up for side-by-side layout
  const pairs: { left: typeof featured[0]; right?: typeof featured[0] }[] = [];
  for (let i = 0; i < featured.length; i += 2) {
    pairs.push({ left: featured[i], right: featured[i + 1] });
  }

  return (
    <main className="min-h-screen">
      {/* Nav */}
      <header className="border-b border-gray-100">
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
          {countries.length} countries. {INDICATORS.length} indicators. Sourced from IMF, World Bank, WHO, and UNESCO.
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

      {/* All featured indicators — side by side */}
      <section className="max-w-6xl mx-auto px-6 pb-16 space-y-8">
        {pairs.map((pair, pairIdx) => (
          <div key={pairIdx} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[pair.left, pair.right].filter(Boolean).map((f) => (
              <div key={f!.id}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-gray-900">{f!.label}</h2>
                  <Link href="/rankings" className="text-xs text-gray-400 hover:text-gray-600 transition">All countries</Link>
                </div>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  {f!.data.map((d, i) => (
                    <Link
                      key={d.countryId}
                      href={`/country/${d.countryId}`}
                      className="flex items-center px-4 py-2 hover:bg-gray-50 transition border-b border-gray-50 last:border-0"
                    >
                      <span className="text-gray-300 text-xs w-5">{i + 1}</span>
                      <span className="flex-1 text-sm">{d.country}</span>
                      <span className="text-sm font-mono text-gray-500">
                        {f!.isIMFBillions
                          ? formatValue((d.value || 0) * 1e9, f!.format, f!.decimals)
                          : formatValue(d.value, f!.format, f!.decimals)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>

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
