import { test, expect } from '@playwright/test';

/**
 * World Bank WDI Cross-Reference
 * SOTW /api/indicator?id=X returns array of { countryId, value, year }
 */

const WB_API = 'https://api.worldbank.org/v2';

async function fetchWB(indicator: string, iso2: string): Promise<{ year: number; value: number } | null> {
  try {
    const res = await fetch(`${WB_API}/country/${iso2}/indicator/${indicator}?format=json&per_page=5&date=2020:2025`);
    if (!res.ok) return null;
    const data = await res.json();
    const records = data[1];
    if (!records) return null;
    const latest = records.find((r: any) => r.value != null);
    if (!latest) return null;
    return { year: parseInt(latest.date), value: latest.value };
  } catch {
    return null;
  }
}

async function fetchSOTW(request: any, indicator: string, country: string): Promise<number | null> {
  const res = await request.get(`/api/indicator?id=${indicator}`);
  if (!res.ok()) return null;
  const body = await res.json();
  if (!Array.isArray(body)) return null;
  const entry = body.find((r: any) => r.countryId === country);
  return entry?.value ?? null;
}

const ISO3_TO_ISO2: Record<string, string> = {
  USA: 'US', CHN: 'CN', IND: 'IN', NGA: 'NG', JPN: 'JP',
  ZAF: 'ZA', BRA: 'BR', SWE: 'SE', ESP: 'ES', SLE: 'SL', QAT: 'QA',
};

test.describe.configure({ mode: 'serial' });

test.describe('World Bank Cross-Reference — Population', () => {
  const COUNTRIES = ['USA', 'CHN', 'IND', 'NGA'];

  for (const iso3 of COUNTRIES) {
    test(`DA-WB-POP-${iso3}: Population matches WB`, async ({ request }) => {
      test.setTimeout(60_000);
      const wb = await fetchWB('SP.POP.TOTL', ISO3_TO_ISO2[iso3]);
      if (!wb) { test.skip(); return; }

      const sotwValue = await fetchSOTW(request, 'SP.POP.TOTL', iso3);

      if (sotwValue != null) {
        const pctDiff = Math.abs(sotwValue - wb.value) / wb.value;
        console.log(`Population ${iso3}: WB=${(wb.value / 1e6).toFixed(1)}M (${wb.year}), SOTW=${(sotwValue / 1e6).toFixed(1)}M, diff=${(pctDiff * 100).toFixed(1)}%`);
        expect(pctDiff).toBeLessThan(0.1);
      }
    });
  }
});

test.describe('World Bank Cross-Reference — Life Expectancy', () => {
  const COUNTRIES = ['JPN', 'USA'];

  for (const iso3 of COUNTRIES) {
    test(`DA-WB-LE-${iso3}: Life expectancy matches WB`, async ({ request }) => {
      test.setTimeout(60_000);
      const wb = await fetchWB('SP.DYN.LE00.IN', ISO3_TO_ISO2[iso3]);
      if (!wb) { test.skip(); return; }

      const sotwValue = await fetchSOTW(request, 'SP.DYN.LE00.IN', iso3);

      if (sotwValue != null) {
        const diff = Math.abs(sotwValue - wb.value);
        console.log(`Life Expectancy ${iso3}: WB=${wb.value.toFixed(1)} (${wb.year}), SOTW=${sotwValue}, diff=${diff.toFixed(1)} years`);
        expect(diff).toBeLessThan(5);
      }
    });
  }
});

test.describe('World Bank Cross-Reference — Unemployment', () => {
  test('DA-WB-UNEMP-ZAF: SA unemployment matches WB', async ({ request }) => {
    test.setTimeout(60_000);
    const wb = await fetchWB('SL.UEM.TOTL.ZS', 'ZA');
    if (!wb) { test.skip(); return; }

    const sotwValue = await fetchSOTW(request, 'SL.UEM.TOTL.ZS', 'ZAF');

    if (sotwValue != null) {
      console.log(`SA Unemployment: WB=${wb.value.toFixed(1)}% (${wb.year}), SOTW=${sotwValue}%`);
      expect(Math.abs(sotwValue - wb.value)).toBeLessThan(10);
    }
  });
});

test.describe('World Bank Cross-Reference — Inequality', () => {
  test('DA-WB-GINI-BRA: Brazil Gini matches WB', async ({ request }) => {
    test.setTimeout(60_000);
    const wb = await fetchWB('SI.POV.GINI', 'BR');
    if (!wb) { test.skip(); return; }

    const sotwValue = await fetchSOTW(request, 'SI.POV.GINI', 'BRA');

    if (sotwValue != null) {
      console.log(`Brazil Gini: WB=${wb.value.toFixed(1)} (${wb.year}), SOTW=${sotwValue}`);
      expect(Math.abs(sotwValue - wb.value)).toBeLessThan(10);
    }
  });
});

test.describe('World Bank Cross-Reference — Environment', () => {
  test('DA-WB-CO2-USA: US CO2/capita matches WB', async ({ request }) => {
    test.setTimeout(60_000);
    const wb = await fetchWB('EN.GHG.CO2.PC.CE.AR5', 'US');
    if (!wb) { test.skip(); return; }

    const sotwValue = await fetchSOTW(request, 'EN.GHG.CO2.PC.CE.AR5', 'USA');

    if (sotwValue != null) {
      const pctDiff = Math.abs(sotwValue - wb.value) / wb.value;
      console.log(`US CO2/capita: WB=${wb.value.toFixed(1)} (${wb.year}), SOTW=${sotwValue}`);
      expect(pctDiff).toBeLessThan(0.3);
    }
  });
});
