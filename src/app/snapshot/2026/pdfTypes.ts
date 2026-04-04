// PDF data types — separated from generatePDF.ts to avoid jsPDF SSR bundling issues

export interface CountryRow {
  country: string;
  countryId: string;
  iso2: string;
  value: number | null;
}

export interface TopBottom {
  top: CountryRow[];
  bottom: CountryRow[];
  total: number;
  data: CountryRow[];
}

export interface SnapshotPDFData {
  countries: number;
  worldGdp: number; worldPop: number; top10GdpSum: number; top10GdpShare: number;
  usGdp: number; cnGdp: number; usCnShare: string; usGdpChange: string | null;
  avgInflation: number; avgLifeExp: number; medianGdpPC: number;
  totalDebtCountriesOver100: number; avgUnemployment: number;
  richestPC: number; poorestPC: number; wealthRatio: number;
  longestLife: number; shortestLife: number; lifeGap: number;
  belowReplacement: number;
  gdp: TopBottom; gdpGrowth: TopBottom; gdpPerCapita: TopBottom;
  gdpPerCapitaPPP: TopBottom;
  population: TopBottom; popGrowth: TopBottom;
  inflation: TopBottom; unemployment: TopBottom; youthUnemployment: TopBottom;
  debt: TopBottom; fiscalBalance: TopBottom;
  lifeExp: TopBottom; lifeExpMale: TopBottom; lifeExpFemale: TopBottom;
  fertility: TopBottom; infantMortality: TopBottom;
  co2: TopBottom; co2Total: TopBottom; renewable: TopBottom;
  internet: TopBottom; mobileSubs: TopBottom; rdSpending: TopBottom; patentsResident: TopBottom;
  militaryPctGDP: TopBottom; militaryUSD: TopBottom;
  gini: TopBottom; poverty215: TopBottom; incomeTop10: TopBottom;
  healthSpendPC: TopBottom;
  tradeOpenness: TopBottom; tourismArrivals: TopBottom;
  womenParliament: TopBottom;
  accessElectricity: TopBottom;
  popAges65: TopBottom;
}
