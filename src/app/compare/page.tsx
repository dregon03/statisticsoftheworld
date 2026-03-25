'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { INDICATORS, CATEGORIES, formatValue } from '@/lib/data';
import Flag from '../Flag';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import MultiCountryChart from '@/components/charts/MultiCountryChart';

interface Country {
  id: string;
  iso2: string;
  name: string;
  region: string;
}

interface HistoryPoint {
  year: number;
  value: number | null;
}

// Default indicators to show in comparison
const DEFAULT_INDICATORS = [
  'IMF.NGDPD', 'IMF.NGDPDPC', 'IMF.NGDP_RPCH', 'SP.POP.TOTL',
  'SP.DYN.LE00.IN', 'IMF.PCPIPCH', 'IMF.LUR', 'IMF.GGXWDG_NGDP',
];

export default function ComparePage() {
  return (
    <main className="min-h-screen">
      <Nav />
      <Suspense>
        <CompareContent />
      </Suspense>
      <Footer />
    </main>
  );
}

export function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse URL params
  const urlCountries = searchParams.get('countries')?.split(',').filter(Boolean) || [];
  const urlIndicator = searchParams.get('indicator') || '';

  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(urlCountries);
  const [selectedIndicator, setSelectedIndicator] = useState(urlIndicator || 'IMF.NGDPD');
  const [countrySearch, setCountrySearch] = useState('');
  const [indicatorSearch, setIndicatorSearch] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showIndicatorPicker, setShowIndicatorPicker] = useState(false);

  // Data
  const [latestData, setLatestData] = useState<Record<string, Record<string, { value: number | null; year: string }>>>({});
  const [chartData, setChartData] = useState<Record<string, HistoryPoint[]>>({});
  const [loading, setLoading] = useState(false);

  // Fetch all countries on mount
  useEffect(() => {
    fetch('/api/countries')
      .then(r => r.json())
      .then(({ countries }) => {
        setAllCountries(countries.sort((a: Country, b: Country) => a.name.localeCompare(b.name)));
      })
      .catch(() => {});
  }, []);

  // Update URL when selection changes
  const updateUrl = useCallback((countries: string[], indicator: string) => {
    const params = new URLSearchParams();
    if (countries.length > 0) params.set('countries', countries.join(','));
    if (indicator) params.set('indicator', indicator);
    router.replace(`/compare?${params.toString()}`, { scroll: false });
  }, [router]);

  // Fetch data when countries or indicator changes
  useEffect(() => {
    if (selectedCountries.length === 0) return;

    setLoading(true);

    // Fetch latest values for all default indicators
    const fetchLatest = async () => {
      const results: Record<string, Record<string, { value: number | null; year: string }>> = {};
      for (const cid of selectedCountries) {
        const res = await fetch(`/api/countries?id=${cid}`);
        const data = await res.json();
        if (data.indicators) {
          results[cid] = {};
          for (const [indId, val] of Object.entries(data.indicators)) {
            results[cid][indId] = val as { value: number | null; year: string };
          }
        }
      }
      setLatestData(results);
    };

    // Fetch chart data for selected indicator
    const fetchChart = async () => {
      const res = await fetch(`/api/history?indicator=${encodeURIComponent(selectedIndicator)}&countries=${selectedCountries.join(',')}`);
      const data = await res.json();
      setChartData(data);
    };

    Promise.all([fetchLatest(), fetchChart()])
      .then(() => setLoading(false))
      .catch(() => setLoading(false));

    updateUrl(selectedCountries, selectedIndicator);
  }, [selectedCountries, selectedIndicator, updateUrl]);

  const addCountry = (id: string) => {
    if (selectedCountries.length >= 8 || selectedCountries.includes(id)) return;
    setSelectedCountries(prev => [...prev, id]);
    setCountrySearch('');
    setShowCountryPicker(false);
  };

  const removeCountry = (id: string) => {
    setSelectedCountries(prev => prev.filter(c => c !== id));
  };

  const filteredCountries = allCountries.filter(c =>
    !selectedCountries.includes(c.id) &&
    (c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
     c.id.toLowerCase().includes(countrySearch.toLowerCase()))
  );

  const filteredIndicators = INDICATORS.filter(ind =>
    ind.label.toLowerCase().includes(indicatorSearch.toLowerCase()) ||
    ind.category.toLowerCase().includes(indicatorSearch.toLowerCase())
  );

  const currentIndicator = INDICATORS.find(i => i.id === selectedIndicator);
  const countryMap = Object.fromEntries(allCountries.map(c => [c.id, c]));
  const countryNames = Object.fromEntries(selectedCountries.map(id => [id, countryMap[id]?.name || id]));

  // Indicators to show in the table
  const tableIndicators = DEFAULT_INDICATORS
    .map(id => INDICATORS.find(i => i.id === id))
    .filter(Boolean) as typeof INDICATORS;

  // CSV export
  const exportCSV = () => {
    if (selectedCountries.length === 0) return;
    const headers = ['Indicator', ...selectedCountries.map(id => countryNames[id] || id)];
    const rows = tableIndicators.map(ind => {
      const vals = selectedCountries.map(cid => {
        const d = latestData[cid]?.[ind.id];
        return d?.value != null ? String(d.value) : '';
      });
      return [ind.label, ...vals];
    });
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sotw-compare-${selectedCountries.join('-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
      <section className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[28px] font-bold mb-1">Compare Countries</h1>
          <p className="text-[13px] text-[#999]">
            Select up to 8 countries to compare side-by-side across 300+ indicators with 20+ years of historical data. Free — no account required.
          </p>
        </div>

        {/* Country selector */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedCountries.map(id => {
              const c = countryMap[id];
              return (
                <div key={id} className="flex items-center gap-1.5 bg-[#f0f7ff] border border-[#cce0ff] rounded-lg px-3 py-1.5 text-[13px]">
                  {c && <Flag iso2={c.iso2} size={18} />}
                  <span className="font-medium text-[#0066cc]">{c?.name || id}</span>
                  <button
                    onClick={() => removeCountry(id)}
                    className="ml-1 text-[#999] hover:text-[#e74c3c] transition text-[16px] leading-none"
                  >
                    &times;
                  </button>
                </div>
              );
            })}
            {selectedCountries.length < 8 && (
              <div className="relative">
                <button
                  onClick={() => setShowCountryPicker(!showCountryPicker)}
                  className="flex items-center gap-1 bg-white border border-dashed border-[#ccc] rounded-lg px-3 py-1.5 text-[13px] text-[#999] hover:border-[#0066cc] hover:text-[#0066cc] transition"
                >
                  + Add Country
                </button>
                {showCountryPicker && (
                  <div className="absolute top-full left-0 mt-1 w-[280px] bg-white border border-[#e8e8e8] rounded-lg shadow-lg z-50 max-h-[300px] overflow-hidden">
                    <div className="p-2 border-b border-[#e8e8e8]">
                      <input
                        type="text"
                        placeholder="Search countries..."
                        value={countrySearch}
                        onChange={e => setCountrySearch(e.target.value)}
                        className="w-full border border-[#e8e8e8] rounded px-3 py-1.5 text-[13px] outline-none focus:border-[#0066cc]"
                        autoFocus
                      />
                    </div>
                    <div className="overflow-y-auto max-h-[250px]">
                      {filteredCountries.slice(0, 50).map(c => (
                        <button
                          key={c.id}
                          onClick={() => addCountry(c.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-left hover:bg-[#f5f7fa] transition"
                        >
                          <Flag iso2={c.iso2} size={18} />
                          <span>{c.name}</span>
                          <span className="ml-auto text-[#ccc] text-[11px]">{c.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-2 text-[12px]">
            <span className="text-[#999]">Quick:</span>
            <button onClick={() => setSelectedCountries(['USA', 'CHN', 'JPN', 'DEU', 'IND'])} className="text-[#0066cc] hover:underline">G5 Economies</button>
            <button onClick={() => setSelectedCountries(['USA', 'GBR', 'FRA', 'DEU', 'JPN', 'ITA', 'CAN'])} className="text-[#0066cc] hover:underline">G7</button>
            <button onClick={() => setSelectedCountries(['BRA', 'RUS', 'IND', 'CHN', 'ZAF'])} className="text-[#0066cc] hover:underline">BRICS</button>
            <button onClick={() => setSelectedCountries(['NOR', 'SWE', 'DNK', 'FIN'])} className="text-[#0066cc] hover:underline">Nordics</button>
            <button onClick={() => setSelectedCountries(['USA', 'CAN', 'MEX'])} className="text-[#0066cc] hover:underline">USMCA</button>
            <button onClick={() => setSelectedCountries(['SGP', 'HKG', 'KOR', 'TWN'])} className="text-[#0066cc] hover:underline">Asian Tigers</button>
            <button onClick={() => setSelectedCountries(['DEU', 'FRA', 'ITA', 'ESP', 'NLD'])} className="text-[#0066cc] hover:underline">EU Big 5</button>
          </div>
        </div>

        {selectedCountries.length === 0 ? (
          <div className="text-center py-20 text-[#999]">
            <div className="text-[48px] mb-4">&#127760;</div>
            <div className="text-[16px] font-medium mb-2">Select countries to compare</div>
            <div className="text-[13px]">Use the selector above or try a quick preset like G7 or BRICS</div>
          </div>
        ) : (
          <>
            {/* Chart section */}
            <div className="border border-[#e8e8e8] rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-semibold">
                  {currentIndicator?.label || selectedIndicator}
                </h2>
                <div className="relative">
                  <button
                    onClick={() => setShowIndicatorPicker(!showIndicatorPicker)}
                    className="text-[12px] text-[#0066cc] hover:underline"
                  >
                    Change indicator &#9662;
                  </button>
                  {showIndicatorPicker && (
                    <div className="absolute top-full right-0 mt-1 w-[320px] bg-white border border-[#e8e8e8] rounded-lg shadow-lg z-50 max-h-[400px] overflow-hidden">
                      <div className="p-2 border-b border-[#e8e8e8]">
                        <input
                          type="text"
                          placeholder="Search indicators..."
                          value={indicatorSearch}
                          onChange={e => setIndicatorSearch(e.target.value)}
                          className="w-full border border-[#e8e8e8] rounded px-3 py-1.5 text-[13px] outline-none focus:border-[#0066cc]"
                          autoFocus
                        />
                      </div>
                      <div className="overflow-y-auto max-h-[350px]">
                        {CATEGORIES.map(cat => {
                          const inds = filteredIndicators.filter(i => i.category === cat);
                          if (inds.length === 0) return null;
                          return (
                            <div key={cat}>
                              <div className="px-3 py-1.5 text-[10px] font-bold text-[#999] uppercase bg-[#f8f9fa] sticky top-0">{cat}</div>
                              {inds.map(ind => (
                                <button
                                  key={ind.id}
                                  onClick={() => { setSelectedIndicator(ind.id); setShowIndicatorPicker(false); setIndicatorSearch(''); }}
                                  className={`w-full text-left px-3 py-1.5 text-[13px] hover:bg-[#f5f7fa] transition ${
                                    ind.id === selectedIndicator ? 'bg-[#f0f7ff] text-[#0066cc] font-medium' : 'text-[#333]'
                                  }`}
                                >
                                  {ind.label}
                                </button>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12 text-[#999]">Loading chart data...</div>
              ) : Object.keys(chartData).length > 0 ? (
                <MultiCountryChart
                  data={chartData}
                  countryNames={countryNames}
                  format={currentIndicator?.format || 'number'}
                  decimals={currentIndicator?.decimals}
                  height={380}
                />
              ) : (
                <div className="text-center py-12 text-[#999] text-[13px]">No historical data available for this indicator</div>
              )}
            </div>

            {/* Quick indicator buttons for chart */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {DEFAULT_INDICATORS.map(id => {
                const ind = INDICATORS.find(i => i.id === id);
                if (!ind) return null;
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedIndicator(id)}
                    className={`px-3 py-1 rounded-full text-[12px] transition ${
                      id === selectedIndicator
                        ? 'bg-[#0066cc] text-white'
                        : 'bg-[#f0f0f0] text-[#666] hover:bg-[#e0e0e0]'
                    }`}
                  >
                    {ind.label.replace(/ \(.*\)/, '').replace(/ —.*/, '')}
                  </button>
                );
              })}
            </div>

            {/* Data table */}
            <div className="border border-[#e8e8e8] rounded-xl overflow-hidden mb-6">
              <div className="flex items-center justify-between px-4 py-3 bg-[#f8f9fa] border-b border-[#e8e8e8]">
                <h2 className="text-[14px] font-semibold">Key Indicators</h2>
                <button
                  onClick={exportCSV}
                  className="text-[12px] text-[#0066cc] hover:underline flex items-center gap-1"
                >
                  &#8681; Download CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[11px] text-[#999] uppercase border-b border-[#e8e8e8]">
                      <th className="px-4 py-2.5 sticky left-0 bg-white z-10 min-w-[200px]">Indicator</th>
                      {selectedCountries.map(id => {
                        const c = countryMap[id];
                        return (
                          <th key={id} className="px-4 py-2.5 text-right min-w-[130px]">
                            <div className="flex items-center justify-end gap-1.5">
                              {c && <Flag iso2={c.iso2} size={16} />}
                              <Link href={`/country/${id}`} className="hover:text-[#0066cc] transition">{c?.name || id}</Link>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {tableIndicators.map((ind, i) => (
                      <tr key={ind.id} className={`border-b border-[#f0f0f0] hover:bg-[#f8f9fa] transition ${i % 2 === 0 ? '' : 'bg-[#fafbfc]'}`}>
                        <td className="px-4 py-2.5 text-[13px] sticky left-0 bg-inherit z-10">
                          <Link href={`/indicators?id=${encodeURIComponent(ind.id)}`} className="text-[#333] hover:text-[#0066cc] transition">
                            {ind.label}
                          </Link>
                        </td>
                        {selectedCountries.map(cid => {
                          const d = latestData[cid]?.[ind.id];
                          return (
                            <td key={cid} className="px-4 py-2.5 text-right font-mono text-[13px]">
                              {d?.value != null ? (
                                <Link href={`/country/${cid}/${encodeURIComponent(ind.id)}`} className="hover:text-[#0066cc] transition">
                                  {formatValue(d.value, ind.format, ind.decimals)}
                                  <span className="text-[#ccc] text-[10px] ml-1">{d.year}</span>
                                </Link>
                              ) : (
                                <span className="text-[#ddd]">&mdash;</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* All categories expandable */}
            <AllCategoriesComparison
              selectedCountries={selectedCountries}
              latestData={latestData}
              countryMap={countryMap}
            />
          </>
        )}
      </section>
  );
}

function AllCategoriesComparison({
  selectedCountries,
  latestData,
  countryMap,
}: {
  selectedCountries: string[];
  latestData: Record<string, Record<string, { value: number | null; year: string }>>;
  countryMap: Record<string, Country>;
}) {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  const toggleCat = (cat: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  // Skip financial categories that might not have per-country data
  const skipCats = new Set(['Commodities', 'US Economy']);

  return (
    <div className="space-y-2">
      <h2 className="text-[15px] font-semibold mb-3">All Categories</h2>
      {CATEGORIES.filter(c => !skipCats.has(c)).map(cat => {
        const catIndicators = INDICATORS.filter(i => i.category === cat);
        // Check if any country has data for any indicator in this category
        const hasData = catIndicators.some(ind =>
          selectedCountries.some(cid => latestData[cid]?.[ind.id]?.value != null)
        );
        if (!hasData) return null;

        const isExpanded = expandedCats.has(cat);
        return (
          <div key={cat} className="border border-[#e8e8e8] rounded-lg overflow-hidden">
            <button
              onClick={() => toggleCat(cat)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#f8f9fa] hover:bg-[#f0f2f5] transition text-left"
            >
              <span className="text-[13px] font-semibold text-[#333]">{cat}</span>
              <span className="text-[#999] text-[12px]">{isExpanded ? '▲' : '▼'} {catIndicators.length} indicators</span>
            </button>
            {isExpanded && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-[11px] text-[#999] uppercase border-b border-[#e8e8e8]">
                      <th className="px-4 py-2 text-left sticky left-0 bg-white z-10 min-w-[200px]">Indicator</th>
                      {selectedCountries.map(id => {
                        const c = countryMap[id];
                        return (
                          <th key={id} className="px-4 py-2 text-right min-w-[120px]">
                            <div className="flex items-center justify-end gap-1">
                              {c && <Flag iso2={c.iso2} size={14} />}
                              <span>{c?.name || id}</span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {catIndicators.map(ind => {
                      const anyData = selectedCountries.some(cid => latestData[cid]?.[ind.id]?.value != null);
                      if (!anyData) return null;
                      return (
                        <tr key={ind.id} className="border-b border-[#f0f0f0] hover:bg-[#f8f9fa] transition">
                          <td className="px-4 py-2 text-[12px] text-[#333] sticky left-0 bg-inherit z-10">{ind.label}</td>
                          {selectedCountries.map(cid => {
                            const d = latestData[cid]?.[ind.id];
                            return (
                              <td key={cid} className="px-4 py-2 text-right font-mono text-[12px]">
                                {d?.value != null ? (
                                  formatValue(d.value, ind.format, ind.decimals)
                                ) : (
                                  <span className="text-[#ddd]">&mdash;</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
