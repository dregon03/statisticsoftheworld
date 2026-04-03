import Link from 'next/link';
import type { Metadata } from 'next';
import { getIndicatorForAllCountries, getCountries, formatValue } from '@/lib/data';
import Flag from '../../Flag';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: '2026 Global Economic Snapshot — The World in Numbers',
  description: 'The definitive 2026 global economic snapshot. GDP rankings, population milestones, inflation hotspots, fastest-growing economies, and surprising data insights — all in one visual report.',
  alternates: { canonical: 'https://statisticsoftheworld.com/snapshot/2026' },
  openGraph: {
    title: '2026 Global Economic Snapshot — The World in Numbers',
    description: 'The globe in 2026: $110T+ GDP, 8.1B people, and the data stories that defined the year.',
    type: 'article',
  },
};

// Helper to get top N and bottom N
async function getTopBottom(indicatorId: string, topN: number, bottomN: number) {
  const data = await getIndicatorForAllCountries(indicatorId);
  return {
    top: data.slice(0, topN),
    bottom: data.slice(-bottomN).reverse(),
    total: data.length,
    data,
  };
}

function fmt(n: number, type: 'currency' | 'number' | 'percent' | 'years' = 'number', decimals?: number) {
  return formatValue(n, type, decimals);
}

export default async function Snapshot2026() {
  // Fetch all the data we need in parallel
  const [
    gdp, gdpGrowth, gdpPerCapita, population, popGrowth,
    inflation, unemployment, debt, lifeExp, fertility,
    co2, renewable, internet, militarySpending, gini,
    tradeOpenness, fdi, healthSpending,
  ] = await Promise.all([
    getTopBottom('IMF.NGDPD', 10, 5),
    getTopBottom('IMF.NGDP_RPCH', 10, 5),
    getTopBottom('IMF.NGDPDPC', 10, 5),
    getTopBottom('SP.POP.TOTL', 10, 5),
    getTopBottom('SP.POP.GROW', 5, 5),
    getTopBottom('IMF.PCPIPCH', 10, 5),
    getTopBottom('IMF.LUR', 5, 5),
    getTopBottom('IMF.GGXWDG_NGDP', 10, 3),
    getTopBottom('SP.DYN.LE00.IN', 5, 5),
    getTopBottom('SP.DYN.TFRT.IN', 5, 5),
    getTopBottom('EN.GHG.CO2.PC.CE.AR5', 5, 5),
    getTopBottom('EG.FEC.RNEW.ZS', 5, 5),
    getTopBottom('IT.NET.USER.ZS', 5, 5),
    getTopBottom('MS.MIL.XPND.GD.ZS', 5, 3),
    getTopBottom('SI.POV.GINI', 5, 5),
    getTopBottom('NE.TRD.GNFS.ZS', 5, 3),
    getTopBottom('BX.KLT.DINV.WD.GD.ZS', 5, 3),
    getTopBottom('SH.XPD.CHEX.GD.ZS', 5, 3),
  ]);

  const countries = await getCountries();

  // Compute aggregate stats
  const worldGdp = gdp.data.reduce((sum, d) => sum + (d.value || 0), 0);
  const worldPop = population.data.reduce((sum, d) => sum + (d.value || 0), 0);
  const top10GdpShare = gdp.data.slice(0, 10).reduce((sum, d) => sum + (d.value || 0), 0) / worldGdp * 100;
  const avgInflation = inflation.data.reduce((sum, d) => sum + (d.value || 0), 0) / inflation.total;
  const avgLifeExp = lifeExp.data.reduce((sum, d) => sum + (d.value || 0), 0) / lifeExp.total;
  const medianGdpPerCapita = gdpPerCapita.data[Math.floor(gdpPerCapita.total / 2)]?.value || 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: '2026 Global Economic Snapshot — The World in Numbers',
    description: 'Annual data report covering GDP, population, inflation, growth, and more for 218 countries.',
    url: 'https://statisticsoftheworld.com/snapshot/2026',
    datePublished: '2026-04-03',
    author: { '@type': 'Organization', name: 'Statistics of the World' },
  };

  return (
    <main className="min-h-screen bg-[#0d1b2a] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-[1000px] mx-auto px-6 py-20 text-center">
          <div className="text-[14px] uppercase tracking-[0.3em] text-blue-400 mb-4">Statistics of the World presents</div>
          <h1 className="text-[56px] md:text-[72px] font-extrabold leading-[1.05] mb-6 bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent">
            2026 Global<br />Economic Snapshot
          </h1>
          <p className="text-[18px] text-white/60 max-w-[600px] mx-auto mb-8">
            The entire planet&apos;s economy in one report. {countries.length} countries. 440+ indicators. The numbers that defined the year.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <div className="text-[36px] font-extrabold text-blue-400">${(worldGdp / 1000).toFixed(0)}T</div>
              <div className="text-[13px] text-white/40 uppercase tracking-wider">World GDP</div>
            </div>
            <div>
              <div className="text-[36px] font-extrabold text-emerald-400">{(worldPop / 1e9).toFixed(2)}B</div>
              <div className="text-[13px] text-white/40 uppercase tracking-wider">People</div>
            </div>
            <div>
              <div className="text-[36px] font-extrabold text-amber-400">{avgInflation.toFixed(1)}%</div>
              <div className="text-[13px] text-white/40 uppercase tracking-wider">Avg Inflation</div>
            </div>
            <div>
              <div className="text-[36px] font-extrabold text-purple-400">{avgLifeExp.toFixed(1)}</div>
              <div className="text-[13px] text-white/40 uppercase tracking-wider">Avg Life Expectancy</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Big Numbers */}
      <Section title="The Big Picture" subtitle="What the global economy looks like right now">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          <BigStat value={`$${(worldGdp / 1000).toFixed(1)}T`} label="Total World GDP" color="blue" />
          <BigStat value={`${top10GdpShare.toFixed(0)}%`} label="of GDP from Top 10 economies" color="blue" />
          <BigStat value={`$${fmt(medianGdpPerCapita, 'currency')}`} label="Median GDP per capita" color="emerald" />
          <BigStat value={`${(worldPop / 1e9).toFixed(2)}B`} label="Global population" color="emerald" />
          <BigStat value={`${countries.length}`} label="Countries tracked" color="purple" />
          <BigStat value="440+" label="Economic indicators" color="purple" />
        </div>
      </Section>

      {/* GDP Powerhouses */}
      <Section title="The $100 Trillion Club" subtitle="The 10 largest economies in the world — and how much of the pie they take">
        <div className="space-y-3">
          {gdp.top.map((d, i) => (
            <RankBar
              key={d.countryId}
              rank={i + 1}
              country={d.country}
              iso2={d.iso2}
              countryId={d.countryId}
              value={`$${fmt(d.value!, 'currency')}`}
              pct={(d.value! / worldGdp) * 100}
              color={i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-blue-400' : 'bg-blue-300/50'}
            />
          ))}
        </div>
        <Insight text={`Just ${gdp.top[0].country} and ${gdp.top[1].country} together account for ${((gdp.top[0].value! + gdp.top[1].value!) / worldGdp * 100).toFixed(0)}% of global GDP.`} />
      </Section>

      {/* Fastest Growing */}
      <Section title="Sprinting Ahead" subtitle="The fastest-growing economies by real GDP growth">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-[15px] font-bold text-emerald-400 uppercase tracking-wider mb-3">Fastest Growing</h3>
            <div className="space-y-2">
              {gdpGrowth.top.slice(0, 8).map((d, i) => (
                <CountryRow key={d.countryId} rank={i + 1} country={d.country} iso2={d.iso2} countryId={d.countryId} value={`+${d.value!.toFixed(1)}%`} valueColor="text-emerald-400" />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-red-400 uppercase tracking-wider mb-3">Shrinking Economies</h3>
            <div className="space-y-2">
              {gdpGrowth.bottom.map((d, i) => (
                <CountryRow key={d.countryId} rank={gdpGrowth.total - i} country={d.country} iso2={d.iso2} countryId={d.countryId} value={`${d.value!.toFixed(1)}%`} valueColor="text-red-400" />
              ))}
            </div>
          </div>
        </div>
        <Insight text={`The fastest-growing economy (${gdpGrowth.top[0].country} at ${gdpGrowth.top[0].value!.toFixed(1)}%) is growing ${Math.abs(gdpGrowth.top[0].value! / gdpGrowth.bottom[0].value!).toFixed(0)}x faster than the worst performer is shrinking.`} />
      </Section>

      {/* Richest & Poorest */}
      <Section title="Rich vs. Poor" subtitle={`GDP per capita: from $${fmt(gdpPerCapita.top[0].value!, 'currency')} to $${fmt(gdpPerCapita.bottom[0].value!, 'currency')}`}>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-[15px] font-bold text-blue-400 uppercase tracking-wider mb-3">Richest per Person</h3>
            <div className="space-y-2">
              {gdpPerCapita.top.map((d, i) => (
                <CountryRow key={d.countryId} rank={i + 1} country={d.country} iso2={d.iso2} countryId={d.countryId} value={`$${fmt(d.value!, 'currency')}`} valueColor="text-blue-400" />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-orange-400 uppercase tracking-wider mb-3">Poorest per Person</h3>
            <div className="space-y-2">
              {gdpPerCapita.bottom.map((d, i) => (
                <CountryRow key={d.countryId} rank={gdpPerCapita.total - i} country={d.country} iso2={d.iso2} countryId={d.countryId} value={`$${fmt(d.value!, 'currency')}`} valueColor="text-orange-400" />
              ))}
            </div>
          </div>
        </div>
        <Insight text={`The richest country per capita (${gdpPerCapita.top[0].country}) earns ${Math.round(gdpPerCapita.top[0].value! / gdpPerCapita.bottom[0].value!)}x more per person than the poorest (${gdpPerCapita.bottom[0].country}).`} />
      </Section>

      {/* Inflation */}
      <Section title="Inflation Hotspots" subtitle="Where prices are rising fastest — and slowest">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-[15px] font-bold text-red-400 uppercase tracking-wider mb-3">Highest Inflation</h3>
            <div className="space-y-2">
              {inflation.top.slice(0, 8).map((d, i) => (
                <CountryRow key={d.countryId} rank={i + 1} country={d.country} iso2={d.iso2} countryId={d.countryId} value={`${d.value!.toFixed(1)}%`} valueColor="text-red-400" />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-emerald-400 uppercase tracking-wider mb-3">Lowest / Deflation</h3>
            <div className="space-y-2">
              {inflation.bottom.map((d, i) => (
                <CountryRow key={d.countryId} rank={inflation.total - i} country={d.country} iso2={d.iso2} countryId={d.countryId} value={`${d.value!.toFixed(1)}%`} valueColor="text-emerald-400" />
              ))}
            </div>
          </div>
        </div>
        <Insight text={`Global average inflation is ${avgInflation.toFixed(1)}%. The gap between the highest (${inflation.top[0].country}: ${inflation.top[0].value!.toFixed(0)}%) and lowest is staggering.`} />
      </Section>

      {/* Population */}
      <Section title="8 Billion and Counting" subtitle="The most populated nations and where growth is happening">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-[15px] font-bold text-purple-400 uppercase tracking-wider mb-3">Most Populated</h3>
            <div className="space-y-2">
              {population.top.map((d, i) => (
                <CountryRow key={d.countryId} rank={i + 1} country={d.country} iso2={d.iso2} countryId={d.countryId} value={fmt(d.value!, 'number')} valueColor="text-purple-400" />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-amber-400 uppercase tracking-wider mb-3">Fastest Pop. Growth</h3>
            <div className="space-y-2">
              {popGrowth.top.map((d, i) => (
                <CountryRow key={d.countryId} rank={i + 1} country={d.country} iso2={d.iso2} countryId={d.countryId} value={`+${d.value!.toFixed(1)}%`} valueColor="text-amber-400" />
              ))}
            </div>
            <h3 className="text-[15px] font-bold text-red-400 uppercase tracking-wider mb-3 mt-6">Shrinking Populations</h3>
            <div className="space-y-2">
              {popGrowth.bottom.map((d, i) => (
                <CountryRow key={d.countryId} rank={popGrowth.total - i} country={d.country} iso2={d.iso2} countryId={d.countryId} value={`${d.value!.toFixed(1)}%`} valueColor="text-red-400" />
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Life & Death */}
      <Section title="Life & Death" subtitle="Where people live longest — and where life is shortest">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-[15px] font-bold text-emerald-400 uppercase tracking-wider mb-3">Longest Lives</h3>
            <div className="space-y-2">
              {lifeExp.top.map((d, i) => (
                <CountryRow key={d.countryId} rank={i + 1} country={d.country} iso2={d.iso2} countryId={d.countryId} value={`${d.value!.toFixed(1)} years`} valueColor="text-emerald-400" />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-red-400 uppercase tracking-wider mb-3">Shortest Lives</h3>
            <div className="space-y-2">
              {lifeExp.bottom.map((d, i) => (
                <CountryRow key={d.countryId} rank={lifeExp.total - i} country={d.country} iso2={d.iso2} countryId={d.countryId} value={`${d.value!.toFixed(1)} years`} valueColor="text-red-400" />
              ))}
            </div>
          </div>
        </div>
        <Insight text={`A baby born in ${lifeExp.top[0].country} can expect to live ${(lifeExp.top[0].value! - lifeExp.bottom[0].value!).toFixed(0)} years longer than one born in ${lifeExp.bottom[0].country}.`} />
      </Section>

      {/* Debt */}
      <Section title="The Debt Mountain" subtitle="Government debt as a percentage of GDP — who owes the most?">
        <div className="space-y-2">
          {debt.top.map((d, i) => (
            <RankBar
              key={d.countryId}
              rank={i + 1}
              country={d.country}
              iso2={d.iso2}
              countryId={d.countryId}
              value={`${d.value!.toFixed(0)}%`}
              pct={Math.min(d.value! / 3, 100)}
              color={d.value! > 150 ? 'bg-red-500' : d.value! > 100 ? 'bg-amber-500' : 'bg-blue-400/50'}
            />
          ))}
        </div>
        <Insight text={`${debt.top.filter(d => d.value! > 100).length} countries have debt exceeding 100% of their GDP.`} />
      </Section>

      {/* Planet */}
      <Section title="Planet Report" subtitle="Carbon, renewables, and the green transition">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-[15px] font-bold text-red-400 uppercase tracking-wider mb-3">Highest CO2 per Capita</h3>
            <div className="space-y-2">
              {co2.top.map((d, i) => (
                <CountryRow key={d.countryId} rank={i + 1} country={d.country} iso2={d.iso2} countryId={d.countryId} value={`${d.value!.toFixed(1)} tonnes`} valueColor="text-red-400" />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-emerald-400 uppercase tracking-wider mb-3">Most Renewable Energy</h3>
            <div className="space-y-2">
              {renewable.top.map((d, i) => (
                <CountryRow key={d.countryId} rank={i + 1} country={d.country} iso2={d.iso2} countryId={d.countryId} value={`${d.value!.toFixed(0)}%`} valueColor="text-emerald-400" />
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Inequality */}
      <Section title="The Inequality Gap" subtitle="Gini Index: 0 = perfect equality, 100 = maximum inequality">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-[15px] font-bold text-red-400 uppercase tracking-wider mb-3">Most Unequal</h3>
            <div className="space-y-2">
              {gini.top.map((d, i) => (
                <CountryRow key={d.countryId} rank={i + 1} country={d.country} iso2={d.iso2} countryId={d.countryId} value={d.value!.toFixed(1)} valueColor="text-red-400" />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-emerald-400 uppercase tracking-wider mb-3">Most Equal</h3>
            <div className="space-y-2">
              {gini.bottom.map((d, i) => (
                <CountryRow key={d.countryId} rank={gini.total - i} country={d.country} iso2={d.iso2} countryId={d.countryId} value={d.value!.toFixed(1)} valueColor="text-emerald-400" />
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="max-w-[600px] mx-auto px-6">
          <h2 className="text-[32px] font-extrabold mb-4">Explore the Full Data</h2>
          <p className="text-white/50 mb-8">This snapshot only scratches the surface. Dive into 440+ indicators for {countries.length} countries — all free, no login required.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/countries" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition">Browse Countries</Link>
            <Link href="/ranking/gdp" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition">View Rankings</Link>
            <Link href="/compare" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition">Compare Countries</Link>
            <Link href="/api-docs" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition">Free API</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-white/30 text-[13px]">
        <p>Data sourced from IMF World Economic Outlook, World Bank WDI, and WHO. Updated regularly.</p>
        <p className="mt-2">
          <Link href="/" className="text-white/50 hover:text-white transition">statisticsoftheworld.com</Link>
          {' · '}
          <Link href="/api-docs" className="text-white/50 hover:text-white transition">API</Link>
          {' · '}
          <Link href="/blog" className="text-white/50 hover:text-white transition">Blog</Link>
        </p>
      </footer>
    </main>
  );
}

// ─── Components ──────────────────────────────────────

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="py-16 border-t border-white/5">
      <div className="max-w-[900px] mx-auto px-6">
        <h2 className="text-[28px] md:text-[36px] font-extrabold mb-2">{title}</h2>
        <p className="text-[15px] text-white/40 mb-8">{subtitle}</p>
        {children}
      </div>
    </section>
  );
}

function BigStat({ value, label, color }: { value: string; label: string; color: string }) {
  const colorMap: Record<string, string> = { blue: 'text-blue-400', emerald: 'text-emerald-400', purple: 'text-purple-400', amber: 'text-amber-400', red: 'text-red-400' };
  return (
    <div className="bg-white/5 rounded-xl p-6 text-center">
      <div className={`text-[28px] md:text-[36px] font-extrabold ${colorMap[color] || 'text-white'}`}>{value}</div>
      <div className="text-[13px] text-white/40 mt-1">{label}</div>
    </div>
  );
}

function RankBar({ rank, country, iso2, countryId, value, pct, color }: { rank: number; country: string; iso2: string; countryId: string; value: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-white/30 text-[14px] w-6 text-right font-mono">{rank}</div>
      <Link href={`/country/${countryId}`} className="flex items-center gap-2 min-w-[140px] hover:text-blue-400 transition">
        <Flag iso2={iso2} size={20} />
        <span className="text-[14px] font-medium">{country}</span>
      </Link>
      <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden">
        <div className={`${color} h-full rounded-full flex items-center justify-end pr-2 transition-all`} style={{ width: `${Math.max(pct, 3)}%` }}>
          <span className="text-[11px] font-bold text-white/90">{value}</span>
        </div>
      </div>
    </div>
  );
}

function CountryRow({ rank, country, iso2, countryId, value, valueColor }: { rank: number; country: string; iso2: string; countryId: string; value: string; valueColor: string }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg hover:bg-white/10 transition">
      <div className="flex items-center gap-2">
        <span className="text-white/20 text-[12px] font-mono w-5 text-right">{rank}</span>
        <Link href={`/country/${countryId}`} className="flex items-center gap-2 hover:text-blue-400 transition">
          <Flag iso2={iso2} size={18} />
          <span className="text-[14px]">{country}</span>
        </Link>
      </div>
      <span className={`font-mono text-[14px] font-bold ${valueColor}`}>{value}</span>
    </div>
  );
}

function Insight({ text }: { text: string }) {
  return (
    <div className="mt-6 bg-white/5 border-l-2 border-blue-500 rounded-r-lg px-4 py-3">
      <span className="text-[13px] text-white/60">{text}</span>
    </div>
  );
}
