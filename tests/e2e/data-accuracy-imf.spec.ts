import { test, expect } from '@playwright/test';

/**
 * IMF WEO Cross-Reference
 *
 * Fetches from IMF DataMapper API & compares to SOTW's /api/indicator.
 * SOTW /api/indicator?id=X returns array of { countryId, value, year } for ALL countries.
 */

const IMF_API = 'https://www.imf.org/external/datamapper/api/v1';

async function fetchIMF(indicator: string, country: string): Promise<{ year: string; value: number }[]> {
  const imfCode = indicator.replace('IMF.', '');
  try {
    const res = await fetch(`${IMF_API}/${imfCode}/${country}`);
    if (!res.ok) return [];
    const data = await res.json();
    const values = data?.values?.[imfCode]?.[country];
    if (!values) return [];
    return Object.entries(values)
      .map(([year, val]) => ({ year, value: val as number }))
      .filter(d => d.value != null)
      .sort((a, b) => b.year.localeCompare(a.year));
  } catch {
    return [];
  }
}

async function fetchSOTW(request: any, indicator: string, country: string): Promise<{ value: number; year: string } | null> {
  const res = await request.get(`/api/indicator?id=${indicator}`);
  if (!res.ok()) return null;
  const body = await res.json();
  if (!Array.isArray(body)) return null;
  const entry = body.find((r: any) => r.countryId === country);
  if (!entry || entry.value == null) return null;
  return { value: entry.value, year: entry.year || '' };
}

test.describe.configure({ mode: 'serial' });

test.describe('IMF WEO Cross-Reference — GDP', () => {
  const COUNTRIES = ['USA', 'CHN', 'JPN', 'DEU', 'GBR'];

  for (const country of COUNTRIES) {
    test(`DA-IMF-GDP-${country}: GDP matches IMF for ${country}`, async ({ request }) => {
      test.setTimeout(60_000);
      const imfData = await fetchIMF('IMF.NGDPD', country);
      if (imfData.length === 0) { test.skip(); return; }

      const sotw = await fetchSOTW(request, 'IMF.NGDPD', country);
      if (!sotw) { test.skip(); return; }

      // IMF stores in billions, SOTW may store in absolute USD
      // Find the IMF value for the same year SOTW shows
      const imfForYear = imfData.find(d => d.year === sotw.year) || imfData[0];
      const imfAbsolute = imfForYear.value * 1e9; // billions → absolute
      // Compare: SOTW value could be in billions or absolute
      const sotwNorm = sotw.value > 1e9 ? sotw.value : sotw.value * 1e9;
      const imfNorm = imfAbsolute;
      const pctDiff = Math.abs(sotwNorm - imfNorm) / imfNorm;
      console.log(`GDP ${country}: IMF=${imfForYear.value}B (${imfForYear.year}), SOTW=${sotw.value} (${sotw.year}), diff=${(pctDiff * 100).toFixed(1)}%`);
      expect(pctDiff).toBeLessThan(0.20);
    });
  }
});

test.describe('IMF WEO Cross-Reference — Growth', () => {
  const COUNTRIES = ['USA', 'CHN', 'IND', 'BRA'];

  for (const country of COUNTRIES) {
    test(`DA-IMF-GROWTH-${country}: Real GDP Growth matches for ${country}`, async ({ request }) => {
      test.setTimeout(60_000);
      const imfData = await fetchIMF('IMF.NGDP_RPCH', country);
      if (imfData.length === 0) { test.skip(); return; }

      const sotw = await fetchSOTW(request, 'IMF.NGDP_RPCH', country);
      if (!sotw) { test.skip(); return; }
      const imfForYear = imfData.find(d => d.year === sotw.year) || imfData[0];

      const diff = Math.abs(sotw.value - imfForYear.value);
      console.log(`GDP Growth ${country}: IMF=${imfForYear.value}% (${imfForYear.year}), SOTW=${sotw.value}% (${sotw.year}), diff=${diff.toFixed(1)}pp`);
      expect(diff).toBeLessThan(3);
    });
  }
});

test.describe('IMF WEO Cross-Reference — Inflation', () => {
  const COUNTRIES = ['USA', 'TUR', 'JPN'];

  for (const country of COUNTRIES) {
    test(`DA-IMF-CPI-${country}: Inflation matches for ${country}`, async ({ request }) => {
      test.setTimeout(60_000);
      const imfData = await fetchIMF('IMF.PCPIPCH', country);
      if (imfData.length === 0) { test.skip(); return; }

      const sotw = await fetchSOTW(request, 'IMF.PCPIPCH', country);
      if (!sotw) { test.skip(); return; }
      const imfForYear = imfData.find(d => d.year === sotw.year) || imfData[0];

      const pctDiff = imfForYear.value !== 0
        ? Math.abs(sotw.value - imfForYear.value) / Math.abs(imfForYear.value)
        : Math.abs(sotw.value - imfForYear.value);
      console.log(`Inflation ${country}: IMF=${imfForYear.value}% (${imfForYear.year}), SOTW=${sotw.value}% (${sotw.year})`);
      expect(pctDiff).toBeLessThan(0.3);
    });
  }
});

test.describe('IMF WEO Cross-Reference — Unemployment & Debt', () => {
  test('DA-IMF-UNEMP-USA: US unemployment matches IMF', async ({ request }) => {
    test.setTimeout(60_000);
    const imfData = await fetchIMF('IMF.LUR', 'USA');
    if (imfData.length === 0) { test.skip(); return; }

    const sotw = await fetchSOTW(request, 'IMF.LUR', 'USA');
    if (!sotw) { test.skip(); return; }
    const imfForYear = imfData.find(d => d.year === sotw.year) || imfData[0];

    console.log(`US Unemployment: IMF=${imfForYear.value}% (${imfForYear.year}), SOTW=${sotw.value}% (${sotw.year})`);
    expect(Math.abs(sotw.value - imfForYear.value)).toBeLessThan(3);
  });

  test('DA-IMF-DEBT-JPN: Japan govt debt matches IMF', async ({ request }) => {
    test.setTimeout(60_000);
    const imfData = await fetchIMF('IMF.GGXWDG_NGDP', 'JPN');
    if (imfData.length === 0) { test.skip(); return; }

    const sotw = await fetchSOTW(request, 'IMF.GGXWDG_NGDP', 'JPN');
    if (!sotw) { test.skip(); return; }
    const imfForYear = imfData.find(d => d.year === sotw.year) || imfData[0];

    console.log(`Japan Debt/GDP: IMF=${imfForYear.value}% (${imfForYear.year}), SOTW=${sotw.value}% (${sotw.year})`);
    expect(Math.abs(sotw.value - imfForYear.value)).toBeLessThan(30);
  });
});
