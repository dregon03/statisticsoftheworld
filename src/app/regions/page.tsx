'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { INDICATORS, CATEGORIES, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

interface RegionData {
  name: string;
  countries: number;
  avg: number;
  median: number;
  sum: number;
  min: number;
  max: number;
}

interface RegionResponse {
  indicator: string;
  byRegion: RegionData[];
  byIncome: RegionData[];
  totalCountries: number;
}

// Key indicators to show in the overview
const OVERVIEW_INDICATORS = [
  { id: 'IMF.NGDPDPC', label: 'GDP per Capita', useMedian: true },
  { id: 'IMF.NGDP_RPCH', label: 'GDP Growth', useMedian: false },
  { id: 'SP.DYN.LE00.IN', label: 'Life Expectancy', useMedian: false },
  { id: 'IMF.PCPIPCH', label: 'Inflation', useMedian: true },
  { id: 'IMF.LUR', label: 'Unemployment', useMedian: false },
  { id: 'SP.POP.TOTL', label: 'Population', useMedian: false },
];

export default function RegionsPage() {
  return (
    <Suspense>
      <RegionsContent />
    </Suspense>
  );
}

function RegionsContent() {
  const searchParams = useSearchParams();
  const urlIndicator = searchParams.get('id');

  const [selectedId, setSelectedId] = useState(urlIndicator || 'IMF.NGDPDPC');
  const [data, setData] = useState<RegionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'region' | 'income'>('region');
  const [metric, setMetric] = useState<'avg' | 'median' | 'sum'>('avg');
  const [searchTerm, setSearchTerm] = useState('');

  // Overview data: multiple indicators aggregated
  const [overviewData, setOverviewData] = useState<Record<string, RegionResponse>>({});
  const [overviewLoading, setOverviewLoading] = useState(true);

  const selectedIndicator = INDICATORS.find(i => i.id === selectedId);

  // Fetch overview data on mount
  useEffect(() => {
    setOverviewLoading(true);
    Promise.all(
      OVERVIEW_INDICATORS.map(ind =>
        fetch(`/api/regions?indicator=${encodeURIComponent(ind.id)}`)
          .then(r => r.json())
          .then(d => ({ id: ind.id, data: d }))
          .catch(() => null)
      )
    ).then(results => {
      const map: Record<string, RegionResponse> = {};
      for (const r of results) {
        if (r) map[r.id] = r.data;
      }
      setOverviewData(map);
      setOverviewLoading(false);
    });
  }, []);

  // Fetch selected indicator data
  useEffect(() => {
    setLoading(true);
    fetch(`/api/regions?indicator=${encodeURIComponent(selectedId)}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedId]);

  const currentData = view === 'region' ? data?.byRegion : data?.byIncome;
  const maxVal = currentData ? Math.max(...currentData.map(d => d[metric])) : 1;

  const filteredIndicators = INDICATORS.filter(ind =>
    ind.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ind.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen">
      <Nav />

      <section className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-[28px] font-bold mb-1">Regional Analysis</h1>
          <p className="text-[13px] text-[#64748b]">
            Compare world regions and income groups across 300+ indicators. Average, median, and aggregate statistics.
          </p>
        </div>

        {/* Overview cards */}
        {!overviewLoading && Object.keys(overviewData).length > 0 && (
          <div className="mb-8">
            <h2 className="text-[15px] font-semibold mb-3">Regional Overview</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[11px] text-[#64748b] uppercase border-b border-[#d5dce6]">
                    <th className="px-3 py-2 text-left sticky left-0 bg-white z-10">Region</th>
                    {OVERVIEW_INDICATORS.map(ind => (
                      <th key={ind.id} className="px-3 py-2 text-right min-w-[100px]">
                        <button
                          onClick={() => setSelectedId(ind.id)}
                          className="hover:text-[#0066cc] transition"
                        >
                          {ind.label}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {overviewData[OVERVIEW_INDICATORS[0].id]?.byRegion.map(region => (
                    <tr key={region.name} className="border-b border-[#edf0f5] hover:bg-[#f4f6f9] transition">
                      <td className="px-3 py-2 text-[13px] font-medium sticky left-0 bg-inherit z-10">{region.name}</td>
                      {OVERVIEW_INDICATORS.map(indDef => {
                        const regionData = overviewData[indDef.id]?.byRegion.find(r => r.name === region.name);
                        const ind = INDICATORS.find(i => i.id === indDef.id);
                        const val = regionData ? (indDef.useMedian ? regionData.median : regionData.avg) : null;
                        return (
                          <td key={indDef.id} className="px-3 py-2 text-right font-mono text-[12px]">
                            {val != null ? formatValue(val, ind?.format || 'number', ind?.decimals) : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <input
              type="text"
              placeholder="Search indicators..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full border border-[#d5dce6] rounded-lg px-3 py-2 text-[13px] mb-3 outline-none focus:border-[#0066cc]"
            />
            <div className="border border-[#d5dce6] rounded-xl overflow-hidden max-h-[60vh] overflow-y-auto">
              {CATEGORIES.map(cat => {
                const catInds = filteredIndicators.filter(i => i.category === cat);
                if (catInds.length === 0) return null;
                return (
                  <div key={cat}>
                    <div className="px-3 py-1.5 text-[10px] font-bold text-[#64748b] uppercase tracking-wider bg-[#f4f6f9] sticky top-0">
                      {cat}
                    </div>
                    {catInds.map(ind => (
                      <button
                        key={ind.id}
                        onClick={() => setSelectedId(ind.id)}
                        className={`w-full text-left px-3 py-1.5 text-[12px] transition ${
                          selectedId === ind.id
                            ? 'bg-[#f0f7ff] text-[#0066cc] font-medium border-l-2 border-[#0066cc]'
                            : 'text-[#64748b] hover:bg-[#f4f6f9]'
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

          {/* Main content */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[18px] font-bold">{selectedIndicator?.label || selectedId}</h2>
                <div className="text-[12px] text-[#64748b]">{data?.totalCountries || 0} countries with data</div>
              </div>
              <div className="flex gap-2">
                <div className="flex gap-1 bg-[#f0f0f0] rounded-lg p-0.5">
                  <button
                    onClick={() => setView('region')}
                    className={`px-3 py-1 rounded text-[12px] transition ${view === 'region' ? 'bg-white shadow-sm font-medium' : 'text-[#64748b]'}`}
                  >
                    By Region
                  </button>
                  <button
                    onClick={() => setView('income')}
                    className={`px-3 py-1 rounded text-[12px] transition ${view === 'income' ? 'bg-white shadow-sm font-medium' : 'text-[#64748b]'}`}
                  >
                    By Income
                  </button>
                </div>
                <select
                  value={metric}
                  onChange={e => setMetric(e.target.value as 'avg' | 'median' | 'sum')}
                  className="border border-[#d5dce6] rounded-lg px-2 py-1 text-[12px] outline-none"
                >
                  <option value="avg">Average</option>
                  <option value="median">Median</option>
                  <option value="sum">Total</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20 text-[#64748b]">Loading regional data...</div>
            ) : !currentData || currentData.length === 0 ? (
              <div className="text-center py-20 text-[#64748b]">No regional data available.</div>
            ) : (
              <>
                {/* Bar visualization */}
                <div className="space-y-3 mb-6">
                  {currentData.map(region => {
                    const width = maxVal > 0 ? (Math.abs(region[metric]) / Math.abs(maxVal)) * 100 : 0;
                    return (
                      <div key={region.name} className="flex items-center gap-3">
                        <div className="w-[180px] text-[13px] font-medium text-[#0d1b2a] shrink-0 truncate">{region.name}</div>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 bg-[#f0f0f0] rounded-full h-[20px] overflow-hidden">
                            <div
                              className="bg-[#3b82f6] h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(width, 1)}%` }}
                            />
                          </div>
                          <div className="w-[100px] text-right font-mono text-[12px] text-[#0d1b2a] shrink-0">
                            {formatValue(region[metric], selectedIndicator?.format || 'number', selectedIndicator?.decimals)}
                          </div>
                        </div>
                        <div className="w-[40px] text-right text-[11px] text-[#64748b] shrink-0">
                          n={region.countries}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Detail table */}
                <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="text-[11px] text-[#64748b] uppercase border-b border-[#d5dce6] bg-[#f4f6f9]">
                        <th className="px-4 py-2.5 text-left">{view === 'region' ? 'Region' : 'Income Level'}</th>
                        <th className="px-4 py-2.5 text-right">Countries</th>
                        <th className="px-4 py-2.5 text-right">Average</th>
                        <th className="px-4 py-2.5 text-right">Median</th>
                        <th className="px-4 py-2.5 text-right">Min</th>
                        <th className="px-4 py-2.5 text-right">Max</th>
                        <th className="px-4 py-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.map(region => (
                        <tr key={region.name} className="border-b border-[#edf0f5] hover:bg-[#f4f6f9] transition">
                          <td className="px-4 py-2.5 text-[13px] font-medium">{region.name}</td>
                          <td className="px-4 py-2.5 text-right text-[12px] text-[#64748b]">{region.countries}</td>
                          <td className="px-4 py-2.5 text-right font-mono text-[12px]">
                            {formatValue(region.avg, selectedIndicator?.format || 'number', selectedIndicator?.decimals)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-[12px]">
                            {formatValue(region.median, selectedIndicator?.format || 'number', selectedIndicator?.decimals)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-[12px] text-[#64748b]">
                            {formatValue(region.min, selectedIndicator?.format || 'number', selectedIndicator?.decimals)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-[12px] text-[#64748b]">
                            {formatValue(region.max, selectedIndicator?.format || 'number', selectedIndicator?.decimals)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-[12px]">
                            {formatValue(region.sum, selectedIndicator?.format || 'number', selectedIndicator?.decimals)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
