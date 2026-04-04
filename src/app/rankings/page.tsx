import { permanentRedirect } from 'next/navigation';
import { getSlugForIndicator } from '@/lib/indicator-slugs';

// Indicator ID → ranking slug for the 29 curated ranking pages
const RANKING_INDICATOR_TO_SLUG: Record<string, string> = {
  'IMF.NGDPD': 'gdp',
  'IMF.NGDP_RPCH': 'gdp-growth',
  'IMF.NGDPDPC': 'gdp-per-capita',
  'IMF.PPPGDP': 'gdp-ppp',
  'IMF.PPPPC': 'gdp-per-capita-ppp',
  'IMF.PCPIPCH': 'inflation-rate',
  'IMF.LUR': 'unemployment-rate',
  'IMF.GGXWDG_NGDP': 'government-debt',
  'IMF.BCA_NGDPD': 'current-account',
  'SP.POP.TOTL': 'population',
  'SP.POP.GROW': 'population-growth',
  'SP.DYN.LE00.IN': 'life-expectancy',
  'SP.DYN.TFRT.IN': 'fertility-rate',
  'EN.ATM.CO2E.PC': 'co2-emissions',
  'IT.NET.USER.ZS': 'internet-users',
  'SH.XPD.CHEX.GD.ZS': 'health-spending',
  'SE.XPD.TOTL.GD.ZS': 'education-spending',
  'MS.MIL.XPND.GD.ZS': 'military-spending',
  'NE.TRD.GNFS.ZS': 'trade-openness',
  'BX.KLT.DINV.WD.GD.ZS': 'fdi-inflows',
  'SI.POV.GINI': 'gini-index',
  'SI.POV.DDAY': 'poverty-rate',
  'SH.DYN.MORT': 'infant-mortality',
  'SP.URB.TOTL.IN.ZS': 'urban-population',
  'EG.FEC.RNEW.ZS': 'renewable-energy',
  'AG.LND.FRST.ZS': 'forest-area',
  'CC.EST': 'corruption-control',
  'RL.EST': 'rule-of-law',
  'ST.INT.ARVL': 'tourism-arrivals',
};

type Props = { searchParams: Promise<{ id?: string }> };

export default async function RankingsRedirect({ searchParams }: Props) {
  const { id } = await searchParams;

  if (id) {
    // Check if this indicator has a curated ranking page
    const rankingSlug = RANKING_INDICATOR_TO_SLUG[id];
    if (rankingSlug) {
      permanentRedirect(`/ranking/${rankingSlug}`);
    }

    // Otherwise redirect to the indicator page
    const indicatorSlug = getSlugForIndicator(id);
    if (indicatorSlug) {
      permanentRedirect(`/indicator/${indicatorSlug}`);
    }
  }

  permanentRedirect('/indicators');
}
