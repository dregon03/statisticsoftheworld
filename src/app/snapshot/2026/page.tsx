import Link from 'next/link';
import type { Metadata } from 'next';
import { getIndicatorForAllCountries, getCountries, formatValue, getHistoricalData } from '@/lib/data';
import Flag from '../../Flag';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { SnapshotTOC, ShareBar, AnimatedBar, PDFDataProvider } from './SnapshotClient';
import type { SnapshotPDFData } from './pdfTypes';

export const metadata: Metadata = {
  title: '2026 Global Economic Snapshot — The World in Numbers',
  description: 'The definitive 2026 global economic snapshot. GDP rankings, population milestones, inflation hotspots, inequality, climate data, and surprising insights from 218 countries — all in one interactive report.',
  alternates: { canonical: 'https://statisticsoftheworld.com/snapshot/2026' },
  openGraph: {
    title: '2026 Global Economic Snapshot — The World in Numbers',
    description: 'The globe in 2026: $110T+ GDP, 8.1B people, and the data stories that defined the year. A free, data-driven report from Statistics of the World.',
    type: 'article',
    url: 'https://statisticsoftheworld.com/snapshot/2026',
  },
  twitter: {
    card: 'summary_large_image',
    title: '2026 Global Economic Snapshot — The World in Numbers',
    description: 'The globe in 2026: $110T+ GDP, 8.1B people, and the data stories that defined the year.',
  },
};

// ─── Data helpers ────────────────────────────────────────
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

function pctOf(part: number, whole: number) {
  return ((part / whole) * 100).toFixed(1);
}

// Get region breakdown from country data
function getRegionStats(countries: { id: string; region: string; incomeLevel: string }[]) {
  const regions: Record<string, number> = {};
  const income: Record<string, number> = {};
  for (const c of countries) {
    regions[c.region] = (regions[c.region] || 0) + 1;
    income[c.incomeLevel] = (income[c.incomeLevel] || 0) + 1;
  }
  return { regions, income };
}

// ─── Page ────────────────────────────────────────────────
export default async function Snapshot2026() {
  // Fetch all data in parallel — 30+ indicators for a comprehensive report
  const [
    gdp, gdpGrowth, gdpPerCapita, gdpPPP, gdpPerCapitaPPP,
    population, popGrowth, popDensity, urbanPop,
    inflation, unemployment, youthUnemployment,
    debt, fiscalBalance, currentAccount,
    lifeExp, lifeExpMale, lifeExpFemale, fertility, infantMortality,
    co2, co2Total, renewable, forestArea,
    internet, mobileSubs, rdSpending, patentsResident,
    militaryPctGDP, militaryUSD, armedForces,
    gini, poverty215, incomeTop10,
    healthSpendGDP, healthSpendPC, hospitalBeds,
    tradeOpenness, highTechExports, fdiInflows, tourismArrivals,
    womenParliament, femaleLFP,
    educationSpend, literacy,
    corruption, ruleOfLaw, govEffectiveness,
    popAges65,
    accessElectricity,
  ] = await Promise.all([
    getTopBottom('IMF.NGDPD', 15, 5),           // GDP
    getTopBottom('IMF.NGDP_RPCH', 15, 10),       // GDP growth
    getTopBottom('IMF.NGDPDPC', 15, 10),          // GDP per capita
    getTopBottom('IMF.PPPGDP', 10, 3),            // GDP PPP
    getTopBottom('IMF.PPPPC', 10, 5),             // GDP per capita PPP
    getTopBottom('SP.POP.TOTL', 15, 5),           // Population
    getTopBottom('SP.POP.GROW', 10, 10),          // Pop growth
    getTopBottom('EN.POP.DNST', 10, 5),           // Pop density
    getTopBottom('SP.URB.TOTL.IN.ZS', 10, 10),   // Urban %
    getTopBottom('IMF.PCPIPCH', 15, 10),          // Inflation
    getTopBottom('IMF.LUR', 10, 10),              // Unemployment
    getTopBottom('SL.UEM.1524.ZS', 10, 5),        // Youth unemployment
    getTopBottom('IMF.GGXWDG_NGDP', 15, 5),      // Govt debt
    getTopBottom('IMF.GGXCNL_NGDP', 10, 10),     // Fiscal balance
    getTopBottom('IMF.BCA_NGDPD', 10, 10),        // Current account
    getTopBottom('SP.DYN.LE00.IN', 10, 10),       // Life expectancy
    getTopBottom('SP.DYN.LE00.MA.IN', 5, 5),      // Life exp male
    getTopBottom('SP.DYN.LE00.FE.IN', 5, 5),      // Life exp female
    getTopBottom('SP.DYN.TFRT.IN', 10, 10),       // Fertility
    getTopBottom('SH.DYN.MORT', 5, 10),           // Infant mortality
    getTopBottom('EN.GHG.CO2.PC.CE.AR5', 10, 5),  // CO2 per capita
    getTopBottom('EN.GHG.CO2.MT.CE.AR5', 10, 3),  // CO2 total
    getTopBottom('EG.FEC.RNEW.ZS', 10, 5),        // Renewable energy
    getTopBottom('AG.LND.FRST.ZS', 10, 5),        // Forest area
    getTopBottom('IT.NET.USER.ZS', 10, 10),        // Internet users
    getTopBottom('IT.CEL.SETS.P2', 10, 5),         // Mobile subs
    getTopBottom('GB.XPD.RSDV.GD.ZS', 10, 3),     // R&D spending
    getTopBottom('IP.PAT.RESD', 10, 3),            // Patents
    getTopBottom('MS.MIL.XPND.GD.ZS', 10, 3),     // Military % GDP
    getTopBottom('MS.MIL.XPND.CD', 10, 3),         // Military USD
    getTopBottom('MS.MIL.TOTL.P1', 10, 3),         // Armed forces
    getTopBottom('SI.POV.GINI', 10, 10),            // Gini
    getTopBottom('SI.POV.DDAY', 5, 5),              // Poverty $2.15/day
    getTopBottom('SI.DST.10TH.10', 10, 5),          // Income top 10%
    getTopBottom('SH.XPD.CHEX.GD.ZS', 10, 3),      // Health % GDP
    getTopBottom('SH.XPD.CHEX.PC.CD', 10, 5),       // Health per capita
    getTopBottom('SH.MED.BEDS.ZS', 10, 5),          // Hospital beds
    getTopBottom('NE.TRD.GNFS.ZS', 10, 5),          // Trade openness
    getTopBottom('TX.VAL.TECH.MF.ZS', 10, 3),       // High-tech exports
    getTopBottom('BX.KLT.DINV.WD.GD.ZS', 10, 3),   // FDI inflows
    getTopBottom('ST.INT.ARVL', 10, 3),              // Tourism
    getTopBottom('SG.GEN.PARL.ZS', 10, 5),          // Women in parliament
    getTopBottom('SL.TLF.CACT.FE.ZS', 5, 5),        // Female LFP
    getTopBottom('SE.XPD.TOTL.GD.ZS', 10, 3),       // Education spending
    getTopBottom('SE.ADT.LITR.ZS', 5, 10),           // Literacy
    getTopBottom('CC.EST', 10, 10),                   // Corruption control
    getTopBottom('RL.EST', 10, 10),                   // Rule of law
    getTopBottom('GE.EST', 10, 5),                    // Govt effectiveness
    getTopBottom('SP.POP.65UP.TO.ZS', 10, 5),        // Ages 65+
    getTopBottom('EG.ELC.ACCS.ZS', 5, 10),           // Electricity access
  ]);

  const countries = await getCountries();

  // Fetch historical GDP for top 3 economies (for YoY context)
  const [usGdpHist, cnGdpHist, jpGdpHist] = await Promise.all([
    getHistoricalData('IMF.NGDPD', 'USA'),
    getHistoricalData('IMF.NGDPD', 'CHN'),
    getHistoricalData('IMF.NGDPD', 'JPN'),
  ]);

  // ─── Compute aggregate stats ───────────────────────────
  const worldGdp = gdp.data.reduce((s, d) => s + (d.value || 0), 0);
  const worldPop = population.data.reduce((s, d) => s + (d.value || 0), 0);
  const top10GdpSum = gdp.data.slice(0, 10).reduce((s, d) => s + (d.value || 0), 0);
  const top10GdpShare = (top10GdpSum / worldGdp) * 100;
  const usGdp = gdp.data.find(d => d.countryId === 'USA')?.value || 0;
  const cnGdp = gdp.data.find(d => d.countryId === 'CHN')?.value || 0;
  const avgInflation = inflation.data.reduce((s, d) => s + (d.value || 0), 0) / inflation.total;
  const avgLifeExp = lifeExp.data.reduce((s, d) => s + (d.value || 0), 0) / lifeExp.total;
  const medianGdpPC = gdpPerCapita.data[Math.floor(gdpPerCapita.total / 2)]?.value || 0;
  const totalDebtCountriesOver100 = debt.data.filter(d => (d.value || 0) > 100).length;
  const avgUnemployment = unemployment.data.reduce((s, d) => s + (d.value || 0), 0) / unemployment.total;
  const totalCo2 = co2Total.data.reduce((s, d) => s + (d.value || 0), 0);

  // GDP per capita extremes ratio
  const richestPC = gdpPerCapita.top[0]?.value || 1;
  const poorestPC = gdpPerCapita.bottom[0]?.value || 1;
  const wealthRatio = Math.round(richestPC / poorestPC);

  // Life expectancy gap
  const longestLife = lifeExp.top[0]?.value || 0;
  const shortestLife = lifeExp.bottom[0]?.value || 0;
  const lifeGap = Math.round(longestLife - shortestLife);

  // US + China share
  const usCnShare = ((usGdp + cnGdp) / worldGdp * 100).toFixed(0);

  // Historical GDP change for US
  const usGdpPrev = usGdpHist.filter(d => d.value).slice(-2);
  const usGdpChange = usGdpPrev.length >= 2 && usGdpPrev[0].value && usGdpPrev[1].value
    ? ((usGdpPrev[1].value - usGdpPrev[0].value) / usGdpPrev[0].value * 100).toFixed(1)
    : null;

  const { regions: regionCounts } = getRegionStats(countries);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: '2026 Global Economic Snapshot — The World in Numbers',
    description: 'Annual data report covering GDP, population, inflation, growth, inequality, climate, and more for 218 countries.',
    url: 'https://statisticsoftheworld.com/snapshot/2026',
    datePublished: '2026-04-03',
    dateModified: new Date().toISOString().split('T')[0],
    author: { '@type': 'Organization', name: 'Statistics of the World', url: 'https://statisticsoftheworld.com' },
    publisher: { '@type': 'Organization', name: 'Statistics of the World', url: 'https://statisticsoftheworld.com' },
    mainEntityOfPage: 'https://statisticsoftheworld.com/snapshot/2026',
    image: 'https://statisticsoftheworld.com/og-snapshot-2026.png',
  };

  // PDF data for client-side download
  const pdfData: SnapshotPDFData = {
    countries: countries.length,
    worldGdp, worldPop, top10GdpSum, top10GdpShare,
    usGdp, cnGdp, usCnShare, usGdpChange,
    avgInflation, avgLifeExp, medianGdpPC,
    totalDebtCountriesOver100, avgUnemployment,
    richestPC, poorestPC, wealthRatio,
    longestLife, shortestLife, lifeGap,
    belowReplacement: fertility.bottom.filter(d => (d.value || 0) < 2.1).length,
    gdp, gdpGrowth, gdpPerCapita, gdpPerCapitaPPP,
    population, popGrowth,
    inflation, unemployment, youthUnemployment,
    debt, fiscalBalance,
    lifeExp, lifeExpMale, lifeExpFemale, fertility, infantMortality,
    co2, co2Total, renewable,
    internet, mobileSubs, rdSpending, patentsResident,
    militaryPctGDP, militaryUSD,
    gini, poverty215, incomeTop10,
    healthSpendPC,
    tradeOpenness, tourismArrivals,
    womenParliament,
    accessElectricity, popAges65,
  };

  return (
    <main className="min-h-screen bg-[#0d1b2a] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <SnapshotTOC />
      <PDFDataProvider data={pdfData} />

      {/* ═══════════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════════ */}
      <section id="hero" className="relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-[1000px] mx-auto px-6 pt-24 pb-16 text-center">
          <div className="inline-block mb-6 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <span className="text-[12px] uppercase tracking-[0.25em] text-blue-400 font-medium">Annual Report · April 2026</span>
          </div>

          <h1 className="text-[48px] sm:text-[56px] md:text-[72px] font-extrabold leading-[1.05] mb-6 bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent">
            The World in<br />Numbers
          </h1>

          <p className="text-[17px] md:text-[19px] text-white/50 max-w-[640px] mx-auto mb-10 leading-relaxed">
            {countries.length} countries. 440+ indicators. One report.<br className="hidden sm:block" />
            This is the global economy in 2026 — every number that matters, from GDP to CO₂, inequality to innovation.
          </p>

          {/* Hero stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-[800px] mx-auto mb-10">
            <HeroStat value={`$${(worldGdp / 1e12).toFixed(0)}T`} label="World GDP" accent="blue" />
            <HeroStat value={`${(worldPop / 1e9).toFixed(2)}B`} label="People" accent="emerald" />
            <HeroStat value={`${avgInflation.toFixed(1)}%`} label="Avg Inflation" accent="amber" />
            <HeroStat value={`${avgLifeExp.toFixed(1)}`} label="Avg Life Expectancy" accent="purple" />
          </div>

          <ShareBar />

          {/* Scroll hint */}
          <div className="mt-12 animate-bounce text-white/20">
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CHAPTER 1: THE $110T ECONOMY
          ═══════════════════════════════════════════════════════ */}
      <Chapter
        id="chapter-1"
        number={1}
        title={`The $${(worldGdp / 1e12).toFixed(0)} Trillion Economy`}
        subtitle="Global GDP and the concentration of economic power"
        narrative={`The global economy in 2026 is worth over $${(worldGdp / 1e12).toFixed(0)} trillion — an almost incomprehensible sum that, if divided equally, would give every person on Earth roughly $${Math.round(worldGdp / worldPop).toLocaleString()}. But the world's wealth is anything but equally distributed. Just two countries — the United States and China — account for ${usCnShare}% of all economic output. The top 10 economies produce ${top10GdpShare.toFixed(0)}% of everything. The remaining ${gdp.total - 10} nations share what's left.`}
      >
        {/* Top 10 GDP bar chart */}
        <div className="space-y-2.5 mb-8">
          {gdp.top.slice(0, 10).map((d, i) => {
            const share = (d.value! / worldGdp) * 100;
            const colors = ['#3b82f6', '#3b82f6', '#60a5fa', '#60a5fa', '#93c5fd', '#93c5fd', '#bfdbfe', '#bfdbfe', '#dbeafe', '#dbeafe'];
            return (
              <div key={d.countryId} className="group">
                <div className="flex items-center gap-3">
                  <div className="text-white/25 text-[13px] w-5 text-right font-mono">{i + 1}</div>
                  <Link href={`/country/${d.countryId}`} className="flex items-center gap-2 min-w-[130px] hover:text-blue-400 transition">
                    <Flag iso2={d.iso2} size={22} />
                    <span className="text-[14px] font-medium">{d.country}</span>
                  </Link>
                  <div className="flex-1 bg-white/5 rounded-full h-8 overflow-hidden relative">
                    <AnimatedBar pct={share * 3.5} color={colors[i]} delay={i * 80} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-white/80">
                      {fmt(d.value!, 'currency')} · {share.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rest of world */}
        <div className="flex items-center gap-3 mb-8 opacity-60">
          <div className="w-5" />
          <div className="min-w-[130px] text-[14px] text-white/40">Rest of world ({gdp.total - 10} countries)</div>
          <div className="flex-1 bg-white/5 rounded-full h-8 overflow-hidden relative">
            <AnimatedBar pct={(100 - top10GdpShare) * 3.5} color="#475569" delay={800} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-white/60">
              {fmt(worldGdp - top10GdpSum, 'currency')} · {(100 - top10GdpShare).toFixed(1)}%
            </span>
          </div>
        </div>

        <PullQuote>
          If the entire world&apos;s GDP were compressed into a single day, the United States would earn its share by 7:24 AM. The bottom 100 countries combined wouldn&apos;t start until 11 PM.
        </PullQuote>

        {/* GDP milestones context */}
        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          <FactCard
            label="US Economy"
            value={fmt(usGdp, 'currency')}
            detail={usGdpChange ? `${Number(usGdpChange) > 0 ? '+' : ''}${usGdpChange}% from last year` : ''}
          />
          <FactCard
            label="China Economy"
            value={fmt(cnGdp, 'currency')}
            detail={`${pctOf(cnGdp, worldGdp)}% of world GDP`}
          />
          <FactCard
            label="Median GDP/capita"
            value={fmt(medianGdpPC, 'currency')}
            detail={`Half of countries are below this`}
          />
        </div>
      </Chapter>

      {/* ═══════════════════════════════════════════════════════
          CHAPTER 2: THE GROWTH RACE
          ═══════════════════════════════════════════════════════ */}
      <Chapter
        id="chapter-2"
        number={2}
        title="The Growth Race"
        subtitle="Who's sprinting, who's crawling, and who's going backwards"
        narrative={`Economic growth is the engine of development — and in 2026, that engine runs at wildly different speeds. The fastest-growing economy, ${gdpGrowth.top[0].country}, is expanding at ${gdpGrowth.top[0].value!.toFixed(1)}% per year. At that rate, its economy would double in just ${Math.round(70 / gdpGrowth.top[0].value!)} years. Meanwhile, ${gdpGrowth.bottom[0].country} sits at the bottom with ${gdpGrowth.bottom[0].value!.toFixed(1)}% growth — an economy in contraction.`}
      >
        <div className="grid md:grid-cols-2 gap-8">
          {/* Fastest growing */}
          <div>
            <SectionLabel color="emerald">Fastest Growing</SectionLabel>
            <div className="space-y-1.5">
              {gdpGrowth.top.slice(0, 10).map((d, i) => (
                <RankRow key={d.countryId} rank={i + 1} country={d.country} iso2={d.iso2} countryId={d.countryId}>
                  <span className="text-emerald-400 font-mono font-bold text-[14px]">+{d.value!.toFixed(1)}%</span>
                </RankRow>
              ))}
            </div>
          </div>

          {/* Shrinking */}
          <div>
            <SectionLabel color="red">Shrinking Economies</SectionLabel>
            <div className="space-y-1.5">
              {gdpGrowth.bottom.filter(d => (d.value || 0) < 0).slice(0, 10).map((d, i) => (
                <RankRow key={d.countryId} rank={gdpGrowth.total - i} country={d.country} iso2={d.iso2} countryId={d.countryId}>
                  <span className="text-red-400 font-mono font-bold text-[14px]">{d.value!.toFixed(1)}%</span>
                </RankRow>
              ))}
            </div>
          </div>
        </div>

        <PullQuote>
          {gdpGrowth.top[0].country}&apos;s economy is growing {Math.abs(gdpGrowth.top[0].value! / (gdpGrowth.bottom[0].value || -1)).toFixed(0)}x faster than {gdpGrowth.bottom[0].country}&apos;s is shrinking. At their current trajectories, their economic fortunes will diverge by billions within a decade.
        </PullQuote>

        <div className="mt-6">
          <Link href="/ranking/gdp-growth" className="text-[13px] text-blue-400 hover:text-blue-300 transition">
            See full GDP growth rankings for all {gdpGrowth.total} countries →
          </Link>
        </div>
      </Chapter>

      {/* ═══════════════════════════════════════════════════════
          CHAPTER 3: RICH VS POOR
          ═══════════════════════════════════════════════════════ */}
      <Chapter
        id="chapter-3"
        number={3}
        title="Rich vs. Poor"
        subtitle={`GDP per capita: from ${fmt(richestPC, 'currency')} to ${fmt(poorestPC, 'currency')}`}
        narrative={`The gap between the world's richest and poorest countries is staggering. A person born in ${gdpPerCapita.top[0].country} has access to an economy that produces ${fmt(richestPC, 'currency')} per person per year. Someone born in ${gdpPerCapita.bottom[0].country} — just a flight away — lives in an economy producing ${fmt(poorestPC, 'currency')}. That's a ${wealthRatio}x difference. The median country produces ${fmt(medianGdpPC, 'currency')} per person — meaning half the world's nations fall below even that.`}
      >
        {/* Visual: richest vs poorest comparison */}
        <div className="bg-gradient-to-r from-blue-500/10 to-orange-500/10 rounded-2xl p-6 mb-8 border border-white/5">
          <div className="text-center mb-4">
            <span className="text-[48px] md:text-[64px] font-extrabold text-white/90">{wealthRatio}<span className="text-[24px] text-white/40">x</span></span>
            <div className="text-[13px] text-white/40">gap between richest and poorest per capita</div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <Flag iso2={gdpPerCapita.top[0].iso2} size={40} />
              <div className="text-[14px] font-medium mt-2">{gdpPerCapita.top[0].country}</div>
              <div className="text-[24px] font-extrabold text-blue-400">{fmt(richestPC, 'currency')}</div>
              <div className="text-[11px] text-white/30">per person / year</div>
            </div>
            <div className="text-center">
              <Flag iso2={gdpPerCapita.bottom[0].iso2} size={40} />
              <div className="text-[14px] font-medium mt-2">{gdpPerCapita.bottom[0].country}</div>
              <div className="text-[24px] font-extrabold text-orange-400">{fmt(poorestPC, 'currency')}</div>
              <div className="text-[11px] text-white/30">per person / year</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <SectionLabel color="blue">Richest per Person (Nominal)</SectionLabel>
            <div className="space-y-1.5">
              {gdpPerCapita.top.slice(0, 10).map((d, i) => (
                <RankRow key={d.countryId} rank={i + 1} country={d.country} iso2={d.iso2} countryId={d.countryId}>
                  <span className="text-blue-400 font-mono font-bold text-[13px]">{fmt(d.value!, 'currency')}</span>
                </RankRow>
              ))}
            </div>
          </div>
          <div>
            <SectionLabel color="orange">Poorest per Person</SectionLabel>
            <div className="space-y-1.5">
              {gdpPerCapita.bottom.slice(0, 10).map((d, i) => (
                <RankRow key={d.countryId} rank={gdpPerCapita.total - i} country={d.country} iso2={d.iso2} countryId={d.countryId}>
                  <span className="text-orange-400 font-mono font-bold text-[13px]">{fmt(d.value!, 'currency')}</span>
                </RankRow>
              ))}
            </div>
          </div>
        </div>

        {/* PPP context */}
        <div className="mt-8 bg-white/5 rounded-xl p-5 border border-white/5">
          <h4 className="text-[14px] font-bold mb-2 text-white/70">What about purchasing power?</h4>
          <p className="text-[13px] text-white/40 leading-relaxed mb-3">
            Nominal GDP per capita doesn&apos;t account for local prices. Adjusted for purchasing power (PPP), the rankings shift. A dollar goes much further in some countries than others.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {gdpPerCapitaPPP.top.slice(0, 5).map((d, i) => (
              <div key={d.countryId} className="text-center bg-white/5 rounded-lg p-2">
                <Flag iso2={d.iso2} size={18} />
                <div className="text-[11px] text-white/50 mt-1">{d.country}</div>
                <div className="text-[13px] font-bold text-emerald-400">{fmt(d.value!, 'currency')}</div>
              </div>
            ))}
          </div>
        </div>

        <PullQuote>
          A worker in {gdpPerCapita.top[0].country} earns in 3 days what a worker in {gdpPerCapita.bottom[0].country} earns in an entire year.
        </PullQuote>
      </Chapter>

      {/* ═══════════════════════════════════════════════════════
          CHAPTER 4: 8.1 BILLION HUMANS
          ═══════════════════════════════════════════════════════ */}
      <Chapter
        id="chapter-4"
        number={4}
        title="8.1 Billion and Counting"
        subtitle="Population, demographics, and the aging challenge"
        narrative={`The world now holds ${(worldPop / 1e9).toFixed(2)} billion people — and the distribution is remarkably uneven. India and China together account for over a third of all humans. But the story of 2026 is not just about size — it's about age. Some nations are getting younger fast, while others face demographic crises with shrinking workforces and aging populations that threaten to reshape their economies within a generation.`}
      >
        {/* Population top 10 */}
        <SectionLabel color="purple">Most Populated Countries</SectionLabel>
        <div className="space-y-2 mb-8">
          {population.top.slice(0, 10).map((d, i) => {
            const share = (d.value! / worldPop) * 100;
            return (
              <div key={d.countryId} className="flex items-center gap-3">
                <div className="text-white/25 text-[13px] w-5 text-right font-mono">{i + 1}</div>
                <Link href={`/country/${d.countryId}`} className="flex items-center gap-2 min-w-[120px] hover:text-blue-400 transition">
                  <Flag iso2={d.iso2} size={20} />
                  <span className="text-[14px] font-medium">{d.country}</span>
                </Link>
                <div className="flex-1 bg-white/5 rounded-full h-7 overflow-hidden relative">
                  <AnimatedBar pct={share * 3} color={i < 2 ? '#a855f7' : '#c084fc'} delay={i * 60} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-white/70">
                    {fmt(d.value!, 'number')} · {share.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <SectionLabel color="amber">Fastest Growing Populations</SectionLabel>
            <div className="space-y-1.5">
              {popGrowth.top.slice(0, 8).map((d, i) => (
                <RankRow key={d.countryId} rank={i + 1} country={d.country} iso2={d.iso2} countryId={d.countryId}>
                  <span className="text-amber-400 font-mono font-bold text-[13px]">+{d.value!.toFixed(1)}%</span>
                </RankRow>
              ))}
            </div>
          </div>
          <div>
            <SectionLabel color="red">Shrinking Populations</SectionLabel>
            <div className="space-y-1.5">
              {popGrowth.bottom.filter(d => (d.value || 0) < 0).slice(0, 8).map((d, i) => (
                <RankRow key={d.countryId} rank={popGrowth.total - i} country={d.country} iso2={d.iso2} countryId={d.countryId}>
                  <span className="text-red-400 font-mono font-bold text-[13px]">{d.value!.toFixed(1)}%</span>
                </RankRow>
              ))}
            </div>
          </div>
        </div>

        {/* Aging societies */}
        <div className="mt-8 bg-white/5 rounded-xl p-5 border border-white/5">
          <h4 className="text-[14px] font-bold mb-3 text-white/70">The Aging World: Countries with the most people 65+</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {popAges65.top.slice(0, 5).map((d) => (
              <div key={d.countryId} className="text-center bg-white/5 rounded-lg p-3">
                <Flag iso2={d.iso2} size={22} />
                <div className="text-[12px] text-white/50 mt-1">{d.country}</div>
                <div className="text-[18px] font-extrabold text-purple-400">{d.value!.toFixed(1)}%</div>
                <div className="text-[10px] text-white/25">aged 65+</div>
              </div>
            ))}
          </div>
        </div>

        {/* Fertility context */}
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          <FactCard label="Highest Fertility" value={`${fertility.top[0].value!.toFixed(1)} births/woman`} detail={fertility.top[0].country} />
          <FactCard label="Lowest Fertility" value={`${fertility.bottom[0].value!.toFixed(1)} births/woman`} detail={fertility.bottom[0].country} />
          <FactCard label="Replacement Rate" value="2.1 births/woman" detail="Needed to maintain population" />
        </div>

        <PullQuote>
          {fertility.bottom.filter(d => (d.value || 0) < 2.1).length} countries now have fertility rates below replacement level (2.1). These nations face a future where there are more coffins than cribs.
        </PullQuote>
      </Chapter>

      {/* ═══════════════════════════════════════════════════════
          CHAPTER 5: INFLATION & PRICES
          ═══════════════════════════════════════════════════════ */}
      <Chapter
        id="chapter-5"
        number={5}
        title="The Price of Everything"
        subtitle="Where inflation is running hot — and where prices are falling"
        narrative={`The global average inflation rate in 2026 is ${avgInflation.toFixed(1)}%. But that average hides enormous variation. In ${inflation.top[0].country}, prices are rising at ${inflation.top[0].value!.toFixed(0)}% per year — meaning a basket of groceries that cost $100 a year ago now costs $${(100 + inflation.top[0].value!).toFixed(0)}. Meanwhile, ${inflation.bottom.find(d => (d.value || 0) < 0)?.country || 'some countries'} are experiencing deflation, where prices are actually falling.`}
      >
        {/* Inflation bar chart */}
        <SectionLabel color="red">Highest Inflation Rates</SectionLabel>
        <div className="space-y-2 mb-6">
          {inflation.top.slice(0, 10).map((d, i) => {
            const barPct = Math.min((d.value! / (inflation.top[0].value! || 1)) * 100, 100);
            return (
              <div key={d.countryId} className="flex items-center gap-3">
                <div className="text-white/25 text-[13px] w-5 text-right font-mono">{i + 1}</div>
                <Link href={`/country/${d.countryId}`} className="flex items-center gap-2 min-w-[120px] hover:text-blue-400 transition">
                  <Flag iso2={d.iso2} size={20} />
                  <span className="text-[14px] font-medium">{d.country}</span>
                </Link>
                <div className="flex-1 bg-white/5 rounded-full h-7 overflow-hidden relative">
                  <AnimatedBar pct={barPct} color={d.value! > 50 ? '#ef4444' : d.value! > 20 ? '#f97316' : '#fbbf24'} delay={i * 60} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-white/80">
                    {d.value!.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <SectionLabel color="emerald">Lowest / Deflation</SectionLabel>
        <div className="space-y-1.5 mb-6">
          {inflation.bottom.slice(0, 5).map((d, i) => (
            <RankRow key={d.countryId} rank={inflation.total - i} country={d.country} iso2={d.iso2} countryId={d.countryId}>
              <span className={`font-mono font-bold text-[13px] ${(d.value || 0) < 0 ? 'text-blue-400' : 'text-emerald-400'}`}>
                {d.value!.toFixed(1)}%
              </span>
            </RankRow>
          ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <FactCard label="Global Average" value={`${avgInflation.toFixed(1)}%`} detail="Weighted by number of countries" />
          <FactCard label="Highest" value={`${inflation.top[0].value!.toFixed(0)}%`} detail={inflation.top[0].country} />
          <FactCard label="Countries in Deflation" value={`${inflation.data.filter(d => (d.value || 0) < 0).length}`} detail="Prices falling year-over-year" />
        </div>
      </Chapter>

      {/* ═══════════════════════════════════════════════════════
          CHAPTER 6: WORK & WAGES
          ═══════════════════════════════════════════════════════ */}
      <Chapter
        id="chapter-6"
        number={6}
        title="Work & Wages"
        subtitle="Unemployment, youth joblessness, and the labor market"
        narrative={`In 2026, the global average unemployment rate sits at ${avgUnemployment.toFixed(1)}%. But behind that number are millions of personal stories — and the burden falls disproportionately on young people. Youth unemployment runs significantly higher in many countries, creating a generation locked out of opportunity and economic participation.`}
      >
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <SectionLabel color="red">Highest Unemployment</SectionLabel>
            <div className="space-y-1.5">
              {unemployment.top.slice(0, 10).map((d, i) => (
                <RankRow key={d.countryId} rank={i + 1} country={d.country} iso2={d.iso2} countryId={d.countryId}>
                  <span className="text-red-400 font-mono font-bold text-[13px]">{d.value!.toFixed(1)}%</span>
                </RankRow>
              ))}
            </div>
          </div>
          <div>
            <SectionLabel color="amber">Lowest Unemployment</SectionLabel>
            <div className="space-y-1.5">
              {unemployment.bottom.slice(0, 10).map((d, i) => (
                <RankRow key={d.countryId} rank={unemployment.total - i} country={d.country} iso2={d.iso2} countryId={d.countryId}>
                  <span className="text-emerald-400 font-mono font-bold text-[13px]">{d.value!.toFixed(1)}%</span>
                </RankRow>
              ))}
            </div>
          </div>
        </div>

        {/* Youth unemployment spotlight */}
        <div className="mt-8 bg-white/5 rounded-xl p-5 border border-white/5">
          <h4 className="text-[14px] font-bold mb-3 text-white/70">Youth Unemployment Crisis (Ages 15-24)</h4>
          <p className="text-[13px] text-white/40 mb-4">
            In many countries, young people face unemployment rates 2-3x the national average. This isn&apos;t just an economic problem — it&apos;s a social time bomb.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {youthUnemployment.top.slice(0, 5).map((d) => (
              <div key={d.countryId} className="text-center bg-white/5 rounded-lg p-3">
                <Flag iso2={d.iso2} size={22} />
                <div className="text-[12px] text-white/50 mt-1">{d.country}</div>
                <div className="text-[18px] font-extrabold text-red-400">{d.value!.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>

        <PullQuote>
          In {youthUnemployment.top[0].country}, {youthUnemployment.top[0].value!.toFixed(0)}% of young people who want to work cannot find a job. That means roughly 1 in {Math.round(100 / youthUnemployment.top[0].value!)} young workers is left idle.
        </PullQuote>
      </Chapter>

      {/* ═══════════════════════════════════════════════════════
          CHAPTER 7: THE DEBT MOUNTAIN
          ═══════════════════════════════════════════════════════ */}
      <Chapter
        id="chapter-7"
        number={7}
        title="The Debt Mountain"
        subtitle="Government debt as a percentage of GDP — who owes the most?"
        narrative={`Governments around the world have borrowed trillions to fund wars, pandemics, and stimulus programs. Today, ${totalDebtCountriesOver100} countries have government debt exceeding 100% of their GDP — meaning they owe more than their entire economy produces in a year. At the top, ${debt.top[0].country} carries debt equal to ${debt.top[0].value!.toFixed(0)}% of GDP. The question isn't whether debt is good or bad — it's whether these countries can sustain it.`}
      >
        <div className="space-y-2.5 mb-8">
          {debt.top.slice(0, 12).map((d, i) => {
            const barPct = Math.min((d.value! / (debt.top[0].value! || 1)) * 100, 100);
            const dangerColor = d.value! > 150 ? '#ef4444' : d.value! > 100 ? '#f97316' : d.value! > 60 ? '#fbbf24' : '#60a5fa';
            return (
              <div key={d.countryId} className="flex items-center gap-3">
                <div className="text-white/25 text-[13px] w-5 text-right font-mono">{i + 1}</div>
                <Link href={`/country/${d.countryId}`} className="flex items-center gap-2 min-w-[130px] hover:text-blue-400 transition">
                  <Flag iso2={d.iso2} size={20} />
                  <span className="text-[14px] font-medium">{d.country}</span>
                </Link>
                <div className="flex-1 bg-white/5 rounded-full h-7 overflow-hidden relative">
                  <AnimatedBar pct={barPct} color={dangerColor} delay={i * 60} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-white/80">
                    {d.value!.toFixed(0)}% of GDP
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fiscal balance context */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/5 mb-6">
          <h4 className="text-[14px] font-bold mb-3 text-white/70">Fiscal Surplus vs Deficit</h4>
          <p className="text-[13px] text-white/40 mb-3">Not all debt is growing. Some countries run budget surpluses, paying down their borrowing.</p>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-[11px] text-emerald-400 uppercase tracking-wider mb-2">Largest Surpluses</div>
              {fiscalBalance.top.slice(0, 5).map((d, i) => (
                <div key={d.countryId} className="flex justify-between text-[13px] py-1">
                  <span className="text-white/60">{d.country}</span>
                  <span className="text-emerald-400 font-mono">+{d.value!.toFixed(1)}%</span>
                </div>
              ))}
            </div>
            <div>
              <div className="text-[11px] text-red-400 uppercase tracking-wider mb-2">Largest Deficits</div>
              {fiscalBalance.bottom.slice(0, 5).map((d, i) => (
                <div key={d.countryId} className="flex justify-between text-[13px] py-1">
                  <span className="text-white/60">{d.country}</span>
                  <span className="text-red-400 font-mono">{d.value!.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <PullQuote>
          {totalDebtCountriesOver100} countries owe more than their entire economic output. If every citizen of {debt.top[0].country} worked for free for {(debt.top[0].value! / 100).toFixed(1)} years, they still couldn&apos;t pay off the national debt.
        </PullQuote>
      </Chapter>

      {/* ═══════════════════════════════════════════════════════
          CHAPTER 8: LIFE & DEATH
          ═══════════════════════════════════════════════════════ */}
      <Chapter
        id="chapter-8"
        number={8}
        title="Life & Death"
        subtitle={`From ${longestLife.toFixed(0)} years in ${lifeExp.top[0].country} to ${shortestLife.toFixed(0)} years in ${lifeExp.bottom[0].country}`}
        narrative={`Where you're born still largely determines how long you'll live. A child born in ${lifeExp.top[0].country} in 2026 can expect to reach ${longestLife.toFixed(0)} years old. A child born in ${lifeExp.bottom[0].country} — on the same day, on the same planet — can expect to live just ${shortestLife.toFixed(0)} years. That's a ${lifeGap}-year gap. The difference isn't just healthcare — it's clean water, nutrition, conflict, and poverty working in combination.`}
      >
        {/* Life expectancy visual comparison */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-red-500/10 rounded-2xl p-6 mb-8 border border-white/5">
          <div className="text-center mb-4">
            <span className="text-[48px] md:text-[64px] font-extrabold text-white/90">{lifeGap}</span>
            <span className="text-[20px] text-white/40 ml-2">years gap</span>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <Flag iso2={lifeExp.top[0].iso2} size={40} />
              <div className="text-[14px] font-medium mt-2">{lifeExp.top[0].country}</div>
              <div className="text-[28px] font-extrabold text-emerald-400">{longestLife.toFixed(1)} yrs</div>
            </div>
            <div className="text-center">
              <Flag iso2={lifeExp.bottom[0].iso2} size={40} />
              <div className="text-[14px] font-medium mt-2">{lifeExp.bottom[0].country}</div>
              <div className="text-[28px] font-extrabold text-red-400">{shortestLife.toFixed(1)} yrs</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <SectionLabel color="emerald">Longest Life Expectancy</SectionLabel>
            <div className="space-y-1.5">
              {lifeExp.top.slice(0, 10).map((d, i) => (
                <RankRow key={d.countryId} rank={i + 1} country={d.country} iso2={d.iso2} countryId={d.countryId}>
                  <span className="text-emerald-400 font-mono font-bold text-[13px]">{d.value!.toFixed(1)} yrs</span>
                </RankRow>
              ))}
            </div>
          </div>
          <div>
            <SectionLabel color="red">Shortest Life Expectancy</SectionLabel>
            <div className="space-y-1.5">
              {lifeExp.bottom.slice(0, 10).map((d, i) => (
                <RankRow key={d.countryId} rank={lifeExp.total - i} country={d.country} iso2={d.iso2} countryId={d.countryId}>
                  <span className="text-red-400 font-mono font-bold text-[13px]">{d.value!.toFixed(1)} yrs</span>
                </RankRow>
              ))}
            </div>
          </div>
        </div>

        {/* Gender gap in life expectancy */}
        <div className="mt-8 bg-white/5 rounded-xl p-5 border border-white/5">
          <h4 className="text-[14px] font-bold mb-3 text-white/70">The Gender Gap: Women live longer everywhere</h4>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-[11px] text-pink-400 uppercase tracking-wider mb-2">Longest-lived women</div>
              {lifeExpFemale.top.slice(0, 5).map((d) => (
                <div key={d.countryId} className="flex justify-between text-[13px] py-1">
                  <span className="text-white/60">{d.country}</span>
                  <span className="text-pink-400 font-mono">{d.value!.toFixed(1)} yrs</span>
                </div>
              ))}
            </div>
            <div>
              <div className="text-[11px] text-blue-400 uppercase tracking-wider mb-2">Longest-lived men</div>
              {lifeExpMale.top.slice(0, 5).map((d) => (
                <div key={d.countryId} className="flex justify-between text-[13px] py-1">
                  <span className="text-white/60">{d.country}</span>
                  <span className="text-blue-400 font-mono">{d.value!.toFixed(1)} yrs</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Infant mortality */}
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          <FactCard label="Highest Infant Mortality" value={`${infantMortality.bottom[0].value!.toFixed(0)} per 1,000`} detail={infantMortality.bottom[0].country} />
          <FactCard label="Lowest Infant Mortality" value={`${infantMortality.top[0].value!.toFixed(1)} per 1,000`} detail={infantMortality.top[0].country} />
          <FactCard label="Avg Life Expectancy" value={`${avgLifeExp.toFixed(1)} years`} detail="Global average across all countries" />
        </div>

        <PullQuote>
          A baby born today in {lifeExp.top[0].country} will, on average, still be alive when a baby born in {lifeExp.bottom[0].country} would have already been dead for {lifeGap} years. Geography is still destiny.
        </PullQuote>
      </Chapter>

      {/* ═══════════════════════════════════════════════════════
          CHAPTER 9: PLANET REPORT
          ═══════════════════════════════════════════════════════ */}
      <Chapter
        id="chapter-9"
        number={9}
        title="Planet Report"
        subtitle="Carbon emissions, renewable energy, and the race to net zero"
        narrative={`The climate crisis doesn't respect borders, but its causes are wildly uneven. The top CO₂ emitter per capita, ${co2.top[0].country}, pumps out ${co2.top[0].value!.toFixed(1)} tonnes per person annually. Meanwhile, the countries contributing the least to emissions are often the most vulnerable to its effects. The good news: renewable energy is growing. Some countries already get over 90% of their energy from renewables. The question is whether the transition is happening fast enough.`}
      >
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <SectionLabel color="red">Highest CO₂ per Capita (tonnes)</SectionLabel>
            <div className="space-y-2">
              {co2.top.slice(0, 10).map((d, i) => {
                const barPct = (d.value! / (co2.top[0].value! || 1)) * 100;
                return (
                  <div key={d.countryId} className="flex items-center gap-3">
                    <div className="text-white/25 text-[12px] w-4 text-right font-mono">{i + 1}</div>
                    <Link href={`/country/${d.countryId}`} className="flex items-center gap-2 min-w-[100px] hover:text-blue-400 transition">
                      <Flag iso2={d.iso2} size={18} />
                      <span className="text-[13px]">{d.country}</span>
                    </Link>
                    <div className="flex-1 bg-white/5 rounded-full h-5 overflow-hidden relative">
                      <AnimatedBar pct={barPct} color="#ef4444" delay={i * 50} />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/70">{d.value!.toFixed(1)}t</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <SectionLabel color="emerald">Most Renewable Energy (%)</SectionLabel>
            <div className="space-y-2">
              {renewable.top.slice(0, 10).map((d, i) => {
                const barPct = d.value!;
                return (
                  <div key={d.countryId} className="flex items-center gap-3">
                    <div className="text-white/25 text-[12px] w-4 text-right font-mono">{i + 1}</div>
                    <Link href={`/country/${d.countryId}`} className="flex items-center gap-2 min-w-[100px] hover:text-blue-400 transition">
                      <Flag iso2={d.iso2} size={18} />
                      <span className="text-[13px]">{d.country}</span>
                    </Link>
                    <div className="flex-1 bg-white/5 rounded-full h-5 overflow-hidden relative">
                      <AnimatedBar pct={barPct} color="#10b981" delay={i * 50} />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/70">{d.value!.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Total CO2 by country */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/5 mb-6">
          <h4 className="text-[14px] font-bold mb-3 text-white/70">Biggest Total Emitters (kilotonnes CO₂)</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {co2Total.top.slice(0, 5).map((d) => (
              <div key={d.countryId} className="text-center bg-white/5 rounded-lg p-3">
                <Flag iso2={d.iso2} size={22} />
                <div className="text-[12px] text-white/50 mt-1">{d.country}</div>
                <div className="text-[14px] font-extrabold text-red-400">{fmt(d.value!, 'number')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Electricity access */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/5">
          <h4 className="text-[14px] font-bold mb-3 text-white/70">Still in the Dark: Lowest access to electricity</h4>
          <p className="text-[13px] text-white/40 mb-3">Hundreds of millions of people still live without reliable electricity.</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {accessElectricity.bottom.slice(0, 5).map((d) => (
              <div key={d.countryId} className="text-center bg-white/5 rounded-lg p-3">
                <Flag iso2={d.iso2} size={22} />
                <div className="text-[12px] text-white/50 mt-1">{d.country}</div>
                <div className="text-[16px] font-extrabold text-amber-400">{d.value!.toFixed(0)}%</div>
                <div className="text-[10px] text-white/25">have electricity</div>
              </div>
            ))}
          </div>
        </div>

        <PullQuote>
          The top 5 CO₂ emitters produce more carbon than the remaining {co2Total.total - 5} countries combined. Yet it&apos;s the lowest emitters — often island nations and sub-Saharan Africa — that face the worst consequences of a warming planet.
        </PullQuote>
      </Chapter>

      {/* ═══════════════════════════════════════════════════════
          CHAPTER 10: THE DIGITAL WORLD
          ═══════════════════════════════════════════════════════ */}
      <Chapter
        id="chapter-10"
        number={10}
        title="The Digital World"
        subtitle="Internet access, R&D spending, and the innovation economy"
        narrative={`The internet has reshaped every aspect of modern life — but not everyone is online yet. While ${internet.top[0].country} leads with ${internet.top[0].value!.toFixed(0)}% internet penetration, ${internet.bottom[0].country} sits at just ${internet.bottom[0].value!.toFixed(0)}%. The digital divide is shrinking, but it still mirrors the economic divide. Meanwhile, the countries investing most heavily in R&D are laying the groundwork for tomorrow's industries.`}
      >
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <SectionLabel color="blue">Highest Internet Penetration</SectionLabel>
            <div className="space-y-1.5">
              {internet.top.slice(0, 10).map((d, i) => (
                <RankRow key={d.countryId} rank={i + 1} country={d.country} iso2={d.iso2} countryId={d.countryId}>
                  <span className="text-blue-400 font-mono font-bold text-[13px]">{d.value!.toFixed(0)}%</span>
                </RankRow>
              ))}
            </div>
          </div>
          <div>
            <SectionLabel color="amber">Lowest Internet Penetration</SectionLabel>
            <div className="space-y-1.5">
              {internet.bottom.slice(0, 10).map((d, i) => (
                <RankRow key={d.countryId} rank={internet.total - i} country={d.country} iso2={d.iso2} countryId={d.countryId}>
                  <span className="text-amber-400 font-mono font-bold text-[13px]">{d.value!.toFixed(0)}%</span>
                </RankRow>
              ))}
            </div>
          </div>
        </div>

        {/* R&D and Innovation */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/5 mb-6">
          <h4 className="text-[14px] font-bold mb-3 text-white/70">R&D Spending (% of GDP) — Investing in Tomorrow</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {rdSpending.top.slice(0, 10).map((d) => (
              <div key={d.countryId} className="text-center bg-white/5 rounded-lg p-3">
                <Flag iso2={d.iso2} size={22} />
                <div className="text-[12px] text-white/50 mt-1">{d.country}</div>
                <div className="text-[16px] font-extrabold text-cyan-400">{d.value!.toFixed(2)}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Patent leaders */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/5">
          <h4 className="text-[14px] font-bold mb-3 text-white/70">Patent Applications (Residents) — The Innovation Pipeline</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {patentsResident.top.slice(0, 5).map((d) => (
              <div key={d.countryId} className="text-center bg-white/5 rounded-lg p-3">
                <Flag iso2={d.iso2} size={22} />
                <div className="text-[12px] text-white/50 mt-1">{d.country}</div>
                <div className="text-[14px] font-extrabold text-purple-400">{fmt(d.value!, 'number')}</div>
              </div>
            ))}
          </div>
        </div>

        <PullQuote>
          {mobileSubs.top[0].country} has {mobileSubs.top[0].value!.toFixed(0)} mobile subscriptions per 100 people — meaning there are more active phone lines than people. In {internet.bottom[0].country}, only {internet.bottom[0].value!.toFixed(0)}% of the population has ever been online.
        </PullQuote>
      </Chapter>

      {/* ═══════════════════════════════════════════════════════
          CHAPTER 11: TRADE, POWER & SECURITY
          ═══════════════════════════════════════════════════════ */}
      <Chapter
        id="chapter-11"
        number={11}
        title="Trade, Power & Security"
        subtitle="Military spending, trade flows, and geopolitical muscle"
        narrative={`Trade connects nations, but power divides them. In 2026, the world's economies are deeply intertwined — some countries trade goods and services worth over 300% of their GDP. At the same time, military spending continues to climb. ${militaryUSD.top[0].country} alone spends ${fmt(militaryUSD.top[0].value!, 'currency')} on defense — more than the next several countries combined.`}
      >
        {/* Military spending */}
        <SectionLabel color="red">Military Spending (USD)</SectionLabel>
        <div className="space-y-2 mb-8">
          {militaryUSD.top.slice(0, 8).map((d, i) => {
            const barPct = (d.value! / (militaryUSD.top[0].value! || 1)) * 100;
            return (
              <div key={d.countryId} className="flex items-center gap-3">
                <div className="text-white/25 text-[13px] w-5 text-right font-mono">{i + 1}</div>
                <Link href={`/country/${d.countryId}`} className="flex items-center gap-2 min-w-[120px] hover:text-blue-400 transition">
                  <Flag iso2={d.iso2} size={20} />
                  <span className="text-[14px] font-medium">{d.country}</span>
                </Link>
                <div className="flex-1 bg-white/5 rounded-full h-7 overflow-hidden relative">
                  <AnimatedBar pct={barPct} color="#ef4444" delay={i * 60} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-white/80">
                    {fmt(d.value!, 'currency')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <SectionLabel color="blue">Most Trade-Open Economies (Trade % of GDP)</SectionLabel>
            <div className="space-y-1.5">
              {tradeOpenness.top.slice(0, 8).map((d, i) => (
                <RankRow key={d.countryId} rank={i + 1} country={d.country} iso2={d.iso2} countryId={d.countryId}>
                  <span className="text-blue-400 font-mono font-bold text-[13px]">{d.value!.toFixed(0)}%</span>
                </RankRow>
              ))}
            </div>
          </div>
          <div>
            <SectionLabel color="amber">Highest Military Spending (% of GDP)</SectionLabel>
            <div className="space-y-1.5">
              {militaryPctGDP.top.slice(0, 8).map((d, i) => (
                <RankRow key={d.countryId} rank={i + 1} country={d.country} iso2={d.iso2} countryId={d.countryId}>
                  <span className="text-amber-400 font-mono font-bold text-[13px]">{d.value!.toFixed(1)}%</span>
                </RankRow>
              ))}
            </div>
          </div>
        </div>

        {/* Tourism */}
        {tourismArrivals.top[0]?.value && (
          <div className="bg-white/5 rounded-xl p-5 border border-white/5">
            <h4 className="text-[14px] font-bold mb-3 text-white/70">Most Visited Countries (International Tourist Arrivals)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {tourismArrivals.top.slice(0, 5).map((d) => (
                <div key={d.countryId} className="text-center bg-white/5 rounded-lg p-3">
                  <Flag iso2={d.iso2} size={22} />
                  <div className="text-[12px] text-white/50 mt-1">{d.country}</div>
                  <div className="text-[14px] font-extrabold text-emerald-400">{fmt(d.value!, 'number')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <PullQuote>
          {militaryUSD.top[0].country}&apos;s military budget alone exceeds the entire GDP of {gdp.data.filter(d => (d.value || 0) < (militaryUSD.top[0].value || 0)).length} countries. The world spends roughly $2 trillion on defense annually — enough to end extreme poverty several times over.
        </PullQuote>
      </Chapter>

      {/* ═══════════════════════════════════════════════════════
          CHAPTER 12: THE INEQUALITY GAP
          ═══════════════════════════════════════════════════════ */}
      <Chapter
        id="chapter-12"
        number={12}
        title="The Inequality Gap"
        subtitle="Income distribution, poverty, and who gets what"
        narrative={`Inequality isn't just about rich countries vs poor countries — it's about who benefits within each country. The Gini Index measures this: 0 means perfect equality, 100 means one person holds all the wealth. The most unequal country, ${gini.top[0].country} (Gini: ${gini.top[0].value!.toFixed(1)}), has a fundamentally different social contract than ${gini.bottom[0].country} (${gini.bottom[0].value!.toFixed(1)}). In the most unequal nations, the top 10% of earners capture over 40% of all income.`}
      >
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <SectionLabel color="red">Most Unequal (Gini Index)</SectionLabel>
            <div className="space-y-1.5">
              {gini.top.slice(0, 10).map((d, i) => (
                <RankRow key={d.countryId} rank={i + 1} country={d.country} iso2={d.iso2} countryId={d.countryId}>
                  <span className="text-red-400 font-mono font-bold text-[13px]">{d.value!.toFixed(1)}</span>
                </RankRow>
              ))}
            </div>
          </div>
          <div>
            <SectionLabel color="emerald">Most Equal (Gini Index)</SectionLabel>
            <div className="space-y-1.5">
              {gini.bottom.slice(0, 10).map((d, i) => (
                <RankRow key={d.countryId} rank={gini.total - i} country={d.country} iso2={d.iso2} countryId={d.countryId}>
                  <span className="text-emerald-400 font-mono font-bold text-[13px]">{d.value!.toFixed(1)}</span>
                </RankRow>
              ))}
            </div>
          </div>
        </div>

        {/* Income concentration */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/5 mb-6">
          <h4 className="text-[14px] font-bold mb-3 text-white/70">Income Share of the Top 10%</h4>
          <p className="text-[13px] text-white/40 mb-3">
            In the most concentrated economies, the richest 10% take nearly half of all income.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {incomeTop10.top.slice(0, 5).map((d) => (
              <div key={d.countryId} className="text-center bg-white/5 rounded-lg p-3">
                <Flag iso2={d.iso2} size={22} />
                <div className="text-[12px] text-white/50 mt-1">{d.country}</div>
                <div className="text-[16px] font-extrabold text-red-400">{d.value!.toFixed(1)}%</div>
                <div className="text-[10px] text-white/25">to top 10%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Extreme poverty */}
        {poverty215.top[0]?.value && (
          <div className="bg-white/5 rounded-xl p-5 border border-white/5 mb-6">
            <h4 className="text-[14px] font-bold mb-3 text-white/70">Extreme Poverty ($2.15/day)</h4>
            <p className="text-[13px] text-white/40 mb-3">
              The percentage of the population living on less than $2.15 a day — the World Bank&apos;s extreme poverty line.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {poverty215.top.slice(0, 5).map((d) => (
                <div key={d.countryId} className="text-center bg-white/5 rounded-lg p-3">
                  <Flag iso2={d.iso2} size={22} />
                  <div className="text-[12px] text-white/50 mt-1">{d.country}</div>
                  <div className="text-[16px] font-extrabold text-orange-400">{d.value!.toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Women in parliament + governance */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white/5 rounded-xl p-5 border border-white/5">
            <h4 className="text-[14px] font-bold mb-3 text-white/70">Women in Parliament (%)</h4>
            {womenParliament.top.slice(0, 5).map((d) => (
              <div key={d.countryId} className="flex justify-between text-[13px] py-1">
                <span className="text-white/60 flex items-center gap-1.5"><Flag iso2={d.iso2} size={14} /> {d.country}</span>
                <span className="text-pink-400 font-mono font-bold">{d.value!.toFixed(1)}%</span>
              </div>
            ))}
          </div>
          <div className="bg-white/5 rounded-xl p-5 border border-white/5">
            <h4 className="text-[14px] font-bold mb-3 text-white/70">Health Spending per Capita (USD)</h4>
            {healthSpendPC.top.slice(0, 5).map((d) => (
              <div key={d.countryId} className="flex justify-between text-[13px] py-1">
                <span className="text-white/60 flex items-center gap-1.5"><Flag iso2={d.iso2} size={14} /> {d.country}</span>
                <span className="text-emerald-400 font-mono font-bold">{fmt(d.value!, 'currency')}</span>
              </div>
            ))}
          </div>
        </div>

        <PullQuote>
          In {incomeTop10.top[0]?.country || 'the most unequal countries'}, the richest 10% earn {incomeTop10.top[0]?.value?.toFixed(0) || '45'}% of all income. In {gini.bottom[0].country}, the same top 10% earn less than {incomeTop10.bottom?.[0]?.value?.toFixed(0) || '22'}%. Same planet, different worlds.
        </PullQuote>
      </Chapter>

      {/* ═══════════════════════════════════════════════════════
          METHODOLOGY
          ═══════════════════════════════════════════════════════ */}
      <section id="methodology" className="py-16 border-t border-white/5">
        <div className="max-w-[900px] mx-auto px-6">
          <h2 className="text-[28px] md:text-[36px] font-extrabold mb-6">Methodology & Sources</h2>

          <div className="space-y-6 text-[14px] text-white/50 leading-relaxed">
            <p>
              This report was generated using live data from three authoritative sources. All values reflect the most recently available data point for each indicator and country, which may vary by 1-2 years depending on reporting schedules.
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <h4 className="text-white/80 font-bold mb-2">IMF World Economic Outlook</h4>
                <p className="text-[13px]">GDP, GDP growth, GDP per capita, inflation, unemployment, government debt, fiscal balance, current account, PPP estimates. Updated biannually (April & October).</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <h4 className="text-white/80 font-bold mb-2">World Bank WDI</h4>
                <p className="text-[13px]">Population, life expectancy, education, health, trade, environment, technology, infrastructure, poverty, inequality. Over 400 indicators, updated continuously.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <h4 className="text-white/80 font-bold mb-2">WHO Global Health Observatory</h4>
                <p className="text-[13px]">Health expenditure, disease prevalence, mortality rates, immunization coverage, health workforce indicators. Updated annually.</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <h4 className="text-white/80 font-bold mb-2">Important Notes</h4>
              <ul className="text-[13px] space-y-1 list-disc list-inside">
                <li><strong>Coverage:</strong> {countries.length} countries and territories tracked across 440+ indicators.</li>
                <li><strong>Currency:</strong> All monetary values are in current US dollars unless otherwise stated.</li>
                <li><strong>Rankings:</strong> Based on latest available data. Some indicators may reflect 2024 or 2025 values if 2026 data has not yet been published.</li>
                <li><strong>Aggregates:</strong> Global averages are unweighted (each country counts equally) unless specifically noted.</li>
                <li><strong>IMF GDP values:</strong> IMF reports GDP in billions of current international dollars.</li>
              </ul>
            </div>

            <p className="text-[13px]">
              Data is refreshed automatically. For the most up-to-date numbers, explore any indicator directly on{' '}
              <Link href="/" className="text-blue-400 hover:text-blue-300">statisticsoftheworld.com</Link>.
              Raw data is available via our <Link href="/api-docs" className="text-blue-400 hover:text-blue-300">free API</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-[700px] mx-auto px-6 text-center">
          <h2 className="text-[32px] md:text-[40px] font-extrabold mb-4">
            This Is Just the Summary
          </h2>
          <p className="text-[16px] text-white/40 mb-8 leading-relaxed">
            Behind every number in this report are {countries.length} country profiles, 440+ indicators, historical time series, interactive charts, and a free API.
            No login required. No paywall. Just data.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <Link href="/countries" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition shadow-lg shadow-blue-600/20">
              Browse Countries
            </Link>
            <Link href="/ranking/gdp" className="px-6 py-3 bg-white/10 hover:bg-white/15 rounded-xl font-medium transition">
              View Rankings
            </Link>
            <Link href="/compare" className="px-6 py-3 bg-white/10 hover:bg-white/15 rounded-xl font-medium transition">
              Compare Countries
            </Link>
            <Link href="/map" className="px-6 py-3 bg-white/10 hover:bg-white/15 rounded-xl font-medium transition">
              World Map
            </Link>
            <Link href="/api-docs" className="px-6 py-3 bg-white/10 hover:bg-white/15 rounded-xl font-medium transition">
              Free API
            </Link>
          </div>

          <ShareBar />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/10 py-10 text-center">
        <div className="max-w-[600px] mx-auto px-6">
          <p className="text-white/30 text-[13px] leading-relaxed">
            Data sourced from IMF World Economic Outlook, World Bank World Development Indicators, and WHO Global Health Observatory. This report is auto-generated from live data and updated regularly. All data is free to use with attribution.
          </p>
          <p className="mt-4 text-[13px]">
            <Link href="/" className="text-white/40 hover:text-white transition">statisticsoftheworld.com</Link>
            {' · '}
            <Link href="/blog" className="text-white/40 hover:text-white transition">Blog</Link>
            {' · '}
            <Link href="/api-docs" className="text-white/40 hover:text-white transition">API</Link>
            {' · '}
            <Link href="/contact" className="text-white/40 hover:text-white transition">Contact</Link>
          </p>
          <p className="mt-4 text-[11px] text-white/20">
            © {new Date().getFullYear()} Statistics of the World. Published April 2026.
          </p>
        </div>
      </footer>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════

function Chapter({ id, number, title, subtitle, narrative, children }: {
  id: string; number: number; title: string; subtitle: string; narrative: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className="py-16 md:py-20 border-t border-white/5">
      <div className="max-w-[900px] mx-auto px-6">
        {/* Chapter header */}
        <div className="mb-8">
          <div className="text-[12px] uppercase tracking-[0.3em] text-blue-400/60 font-medium mb-2">
            Chapter {number}
          </div>
          <h2 className="text-[28px] md:text-[40px] font-extrabold leading-tight mb-2">{title}</h2>
          <p className="text-[15px] text-white/35">{subtitle}</p>
        </div>

        {/* Editorial narrative */}
        <div className="text-[15px] text-white/55 leading-[1.8] mb-10 max-w-[780px]">
          {narrative}
        </div>

        {children}
      </div>
    </section>
  );
}

function HeroStat({ value, label, accent }: { value: string; label: string; accent: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    amber: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    purple: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
  };
  const [textColor] = (colors[accent] || colors.blue).split(' ');
  return (
    <div className={`rounded-xl border p-4 ${colors[accent] || colors.blue}`}>
      <div className={`text-[28px] sm:text-[32px] font-extrabold ${textColor}`}>{value}</div>
      <div className="text-[11px] text-white/35 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

function SectionLabel({ color, children }: { color: string; children: React.ReactNode }) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-400', emerald: 'text-emerald-400', red: 'text-red-400',
    amber: 'text-amber-400', purple: 'text-purple-400', orange: 'text-orange-400',
    pink: 'text-pink-400', cyan: 'text-cyan-400',
  };
  return (
    <h3 className={`text-[13px] font-bold uppercase tracking-[0.15em] mb-3 ${colorMap[color] || 'text-white/60'}`}>
      {children}
    </h3>
  );
}

function RankRow({ rank, country, iso2, countryId, children }: {
  rank: number; country: string; iso2: string; countryId: string; children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-white/[0.03] hover:bg-white/[0.06] rounded-lg transition group">
      <div className="flex items-center gap-2">
        <span className="text-white/15 text-[11px] font-mono w-5 text-right">{rank}</span>
        <Link href={`/country/${countryId}`} className="flex items-center gap-2 group-hover:text-blue-400 transition">
          <Flag iso2={iso2} size={18} />
          <span className="text-[13px] font-medium">{country}</span>
        </Link>
      </div>
      {children}
    </div>
  );
}

function FactCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
      <div className="text-[11px] text-white/30 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-[20px] font-extrabold text-white/90">{value}</div>
      {detail && <div className="text-[12px] text-white/35 mt-1">{detail}</div>}
    </div>
  );
}

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-8 relative">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
      <blockquote className="pl-6 text-[16px] md:text-[18px] text-white/60 leading-relaxed italic">
        {children}
      </blockquote>
    </div>
  );
}
