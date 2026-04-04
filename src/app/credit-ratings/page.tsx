import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CreditRatingsContent from './CreditRatingsContent';
import { supabase } from '@/lib/supabase';
import { getIndicatorForAllCountries, getCountries } from '@/lib/data';

export const revalidate = 86400;

function governanceToScore(avg: number): number {
  return Math.max(0, Math.min(100, ((avg + 2.5) / 5) * 100));
}

function scoreToGrade(score: number): string {
  if (score >= 90) return 'AAA';
  if (score >= 85) return 'AA+';
  if (score >= 80) return 'AA';
  if (score >= 75) return 'AA-';
  if (score >= 70) return 'A+';
  if (score >= 65) return 'A';
  if (score >= 60) return 'A-';
  if (score >= 55) return 'BBB+';
  if (score >= 50) return 'BBB';
  if (score >= 45) return 'BBB-';
  if (score >= 40) return 'BB+';
  if (score >= 35) return 'BB';
  if (score >= 30) return 'BB-';
  if (score >= 25) return 'B+';
  if (score >= 20) return 'B';
  if (score >= 15) return 'B-';
  if (score >= 10) return 'CCC';
  if (score >= 5) return 'CC';
  return 'C';
}

async function getCreditRatings() {
  const [cc, ge, rl, pv, va, rq, gdppc, debt, countries] = await Promise.all([
    getIndicatorForAllCountries('CC.EST'),
    getIndicatorForAllCountries('GE.EST'),
    getIndicatorForAllCountries('RL.EST'),
    getIndicatorForAllCountries('PV.EST'),
    getIndicatorForAllCountries('VA.EST'),
    getIndicatorForAllCountries('RQ.EST'),
    getIndicatorForAllCountries('IMF.NGDPDPC'),
    getIndicatorForAllCountries('IMF.GGXWDG_NGDP'),
    getCountries(),
  ]);

  const makeMap = (data: any[]) => Object.fromEntries(data.map((d: any) => [d.countryId, d]));
  const ccMap = makeMap(cc);
  const geMap = makeMap(ge);
  const rlMap = makeMap(rl);
  const pvMap = makeMap(pv);
  const vaMap = makeMap(va);
  const rqMap = makeMap(rq);
  const gdpMap = makeMap(gdppc);
  const debtMap = makeMap(debt);

  const results = [];
  for (const c of countries) {
    const scores = [ccMap[c.id], geMap[c.id], rlMap[c.id], pvMap[c.id], vaMap[c.id], rqMap[c.id]]
      .filter(s => s?.value != null)
      .map(s => s.value);

    if (scores.length < 3) continue;

    const avgGovernance = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
    const baseScore = governanceToScore(avgGovernance);

    const gdp = gdpMap[c.id]?.value;
    let gdpBonus = 0;
    if (gdp) {
      if (gdp > 50000) gdpBonus = 5;
      else if (gdp > 20000) gdpBonus = 3;
      else if (gdp > 10000) gdpBonus = 1;
    }

    const debtVal = debtMap[c.id]?.value;
    let debtPenalty = 0;
    if (debtVal) {
      if (debtVal > 150) debtPenalty = 5;
      else if (debtVal > 100) debtPenalty = 2;
    }

    const finalScore = Math.max(0, Math.min(100, baseScore + gdpBonus - debtPenalty));
    const grade = scoreToGrade(finalScore);

    results.push({
      countryId: c.id,
      country: c.name,
      iso2: c.iso2 || c.id.toLowerCase().slice(0, 2),
      region: c.region,
      score: Math.round(finalScore * 10) / 10,
      governance: Math.round(avgGovernance * 100) / 100,
      gdpPerCapita: gdp ? Math.round(gdp) : null,
      debtToGdp: debtVal ? Math.round(debtVal * 10) / 10 : null,
      grade,
    });
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

export default async function CreditRatingsPage() {
  const ratings = await getCreditRatings();

  return (
    <main className="min-h-screen">
      <Nav />
      <CreditRatingsContent ratings={ratings} />
      <Footer />
    </main>
  );
}
