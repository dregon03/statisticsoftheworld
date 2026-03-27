import { getCountries, getTop10AllIndicators, INDICATORS, CATEGORIES } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import HeroTabs from '@/components/HeroTabs';
import CategorySection from '../CategorySection';
import IndicatorExplorer from './IndicatorExplorer';
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

const SKIP_CATEGORIES = ['Stock Markets', 'Commodities', 'Currencies', 'US Economy', 'Financial Markets'];

export default async function IndicatorsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const params = await searchParams;
  const hasExplorer = !!params.id;
  const allTop10 = await getTop10AllIndicators();

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

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#1a1a2e]">
      <Nav />
      <HeroTabs active="/indicators" indicatorCount={INDICATORS.length} />

      {/* Category nav */}
      <nav className="max-w-[1200px] mx-auto px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] border-b border-[#edf0f5]">
        {categoriesWithData.map(({ category }) => (
          <a
            key={category}
            href={`#${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            className="text-[#64748b] hover:text-[#0d1b2a] transition whitespace-nowrap"
          >
            {category}
          </a>
        ))}
      </nav>

      {/* Indicator explorer (when ?id= is present) */}
      {hasExplorer && <IndicatorExplorer />}

      {/* Category sections with top-10 rankings */}
      {categoriesWithData.map(({ category, indicators, featuredCount }) => (
        <CategorySection key={category} category={category} indicators={indicators} featuredCount={featuredCount} />
      ))}

      <Footer />
    </main>
  );
}
