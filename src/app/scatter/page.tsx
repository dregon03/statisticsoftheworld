'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { INDICATORS, CATEGORIES, formatValue } from '@/lib/data';
import ScatterPlotChart from '@/components/charts/ScatterChart';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

interface Country {
  id: string;
  iso2: string;
  name: string;
  region: string;
}

interface IndicatorData {
  countryId: string;
  country: string;
  value: number | null;
  year: string;
}

// Curated presets for interesting scatter plots
const PRESETS = [
  { x: 'IMF.NGDPDPC', y: 'SP.DYN.LE00.IN', label: 'GDP per Capita vs Life Expectancy', logX: true },
  { x: 'IMF.NGDPDPC', y: 'SE.XPD.TOTL.GD.ZS', label: 'GDP per Capita vs Education Spending', logX: true },
  { x: 'IMF.NGDPDPC', y: 'SI.POV.GINI', label: 'GDP per Capita vs Inequality (Gini)', logX: true },
  { x: 'SP.POP.TOTL', y: 'IMF.NGDPD', label: 'Population vs GDP', logX: true, logY: true },
  { x: 'IMF.PCPIPCH', y: 'IMF.LUR', label: 'Inflation vs Unemployment (Phillips Curve)' },
  { x: 'SE.ADT.LITR.ZS', y: 'SP.DYN.LE00.IN', label: 'Literacy Rate vs Life Expectancy' },
  { x: 'IMF.NGDPDPC', y: 'IT.NET.USER.ZS', label: 'GDP per Capita vs Internet Usage', logX: true },
  { x: 'SH.XPD.CHEX.GD.ZS', y: 'SP.DYN.LE00.IN', label: 'Health Spending vs Life Expectancy' },
  { x: 'IMF.GGXWDG_NGDP', y: 'IMF.NGDP_RPCH', label: 'Government Debt vs GDP Growth' },
  { x: 'EN.GHG.CO2.PC.CE.AR5', y: 'IMF.NGDPDPC', label: 'CO2 Emissions vs GDP per Capita', logY: true },
  { x: 'MS.MIL.XPND.GD.ZS', y: 'PV.EST', label: 'Military Spending vs Political Stability' },
  { x: 'GB.XPD.RSDV.GD.ZS', y: 'IMF.NGDPDPC', label: 'R&D Spending vs GDP per Capita', logY: true },
];

// Macro indicators that make good X/Y axes
const POPULAR_INDICATORS = [
  'IMF.NGDPD', 'IMF.NGDPDPC', 'IMF.NGDP_RPCH', 'IMF.PPPPC', 'SP.POP.TOTL',
  'SP.DYN.LE00.IN', 'IMF.PCPIPCH', 'IMF.LUR', 'IMF.GGXWDG_NGDP',
  'SE.XPD.TOTL.GD.ZS', 'SE.ADT.LITR.ZS', 'SH.XPD.CHEX.GD.ZS',
  'SI.POV.GINI', 'IT.NET.USER.ZS', 'EN.GHG.CO2.PC.CE.AR5',
  'MS.MIL.XPND.GD.ZS', 'EG.ELC.RNEW.ZS', 'CC.EST', 'PV.EST',
  'SL.TLF.CACT.ZS', 'GB.XPD.RSDV.GD.ZS', 'NE.TRD.GNFS.ZS',
];

export default function ScatterPage() {
  return (
    <Suspense>
      <ScatterContent />
    </Suspense>
  );
}

function ScatterContent() {
  const searchParams = useSearchParams();
  const urlX = searchParams.get('x');
  const urlY = searchParams.get('y');

  const defaultPreset = PRESETS[0];
  const [xIndicatorId, setXIndicatorId] = useState(urlX || defaultPreset.x);
  const [yIndicatorId, setYIndicatorId] = useState(urlY || defaultPreset.y);
  const [logX, setLogX] = useState(defaultPreset.logX || false);
  const [logY, setLogY] = useState(defaultPreset.logY || false);

  const [countries, setCountries] = useState<Country[]>([]);
  const [xData, setXData] = useState<IndicatorData[]>([]);
  const [yData, setYData] = useState<IndicatorData[]>([]);
  const [popData, setPopData] = useState<IndicatorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showXPicker, setShowXPicker] = useState(false);
  const [showYPicker, setShowYPicker] = useState(false);
  const [searchX, setSearchX] = useState('');
  const [searchY, setSearchY] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

  const xInd = INDICATORS.find(i => i.id === xIndicatorId);
  const yInd = INDICATORS.find(i => i.id === yIndicatorId);

  // Fetch countries once
  useEffect(() => {
    fetch('/api/countries')
      .then(r => r.json())
      .then(({ countries: list }) => setCountries(list))
      .catch(() => {});
    // Also fetch population for bubble sizing
    fetch(`/api/indicator?id=SP.POP.TOTL`)
      .then(r => r.json())
      .then(setPopData)
      .catch(() => {});
  }, []);

  // Fetch indicator data
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/indicator?id=${encodeURIComponent(xIndicatorId)}`).then(r => r.json()),
      fetch(`/api/indicator?id=${encodeURIComponent(yIndicatorId)}`).then(r => r.json()),
    ]).then(([x, y]) => {
      setXData(x);
      setYData(y);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [xIndicatorId, yIndicatorId]);

  // Build scatter data
  const countryMap = Object.fromEntries(countries.map(c => [c.id, c]));
  const xMap = Object.fromEntries(xData.map(d => [d.countryId, d]));
  const yMap = Object.fromEntries(yData.map(d => [d.countryId, d]));
  const popMap = Object.fromEntries(popData.map(d => [d.countryId, d]));

  const regions = [...new Set(countries.map(c => c.region))].sort();

  const scatterData = countries
    .filter(c => {
      const x = xMap[c.id];
      const y = yMap[c.id];
      if (!x?.value || !y?.value) return false;
      if (regionFilter && c.region !== regionFilter) return false;
      return true;
    })
    .map(c => ({
      country: c.name,
      countryId: c.id,
      x: xMap[c.id].value as number,
      y: yMap[c.id].value as number,
      size: popMap[c.id]?.value ? Math.sqrt(popMap[c.id].value as number) : 50,
      region: c.region,
    }));

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setXIndicatorId(preset.x);
    setYIndicatorId(preset.y);
    setLogX(preset.logX || false);
    setLogY(preset.logY || false);
  };

  const filteredXIndicators = INDICATORS.filter(i =>
    i.label.toLowerCase().includes(searchX.toLowerCase()) ||
    i.category.toLowerCase().includes(searchX.toLowerCase())
  );
  const filteredYIndicators = INDICATORS.filter(i =>
    i.label.toLowerCase().includes(searchY.toLowerCase()) ||
    i.category.toLowerCase().includes(searchY.toLowerCase())
  );

  return (
    <main className="min-h-screen">
      <Nav />

      <section className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-[28px] font-bold mb-1">Scatter Plot Explorer</h1>
          <p className="text-[13px] text-[#999]">
            Explore relationships between any two indicators across 218 countries. Bubble size represents population. Inspired by Gapminder.
          </p>
        </div>

        {/* Presets */}
        <div className="mb-6">
          <div className="text-[12px] text-[#999] mb-2">Popular correlations:</div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => applyPreset(p)}
                className={`px-3 py-1 rounded-full text-[11px] transition ${
                  xIndicatorId === p.x && yIndicatorId === p.y
                    ? 'bg-[#0066cc] text-white'
                    : 'bg-[#f0f0f0] text-[#666] hover:bg-[#e0e0e0]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Axis selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* X axis */}
          <div className="border border-[#e8e8e8] rounded-lg p-3">
            <div className="text-[11px] text-[#999] uppercase mb-1">X-Axis</div>
            <div className="relative">
              <button
                onClick={() => { setShowXPicker(!showXPicker); setShowYPicker(false); }}
                className="text-[13px] font-medium text-[#0066cc] hover:underline"
              >
                {xInd?.label || xIndicatorId} &#9662;
              </button>
              {showXPicker && (
                <IndicatorPicker
                  search={searchX}
                  setSearch={setSearchX}
                  indicators={filteredXIndicators}
                  selectedId={xIndicatorId}
                  onSelect={(id) => { setXIndicatorId(id); setShowXPicker(false); setSearchX(''); }}
                  onClose={() => setShowXPicker(false)}
                />
              )}
            </div>
            <label className="flex items-center gap-1.5 mt-2 text-[11px] text-[#999]">
              <input type="checkbox" checked={logX} onChange={e => setLogX(e.target.checked)} className="rounded" />
              Log scale
            </label>
          </div>

          {/* Y axis */}
          <div className="border border-[#e8e8e8] rounded-lg p-3">
            <div className="text-[11px] text-[#999] uppercase mb-1">Y-Axis</div>
            <div className="relative">
              <button
                onClick={() => { setShowYPicker(!showYPicker); setShowXPicker(false); }}
                className="text-[13px] font-medium text-[#0066cc] hover:underline"
              >
                {yInd?.label || yIndicatorId} &#9662;
              </button>
              {showYPicker && (
                <IndicatorPicker
                  search={searchY}
                  setSearch={setSearchY}
                  indicators={filteredYIndicators}
                  selectedId={yIndicatorId}
                  onSelect={(id) => { setYIndicatorId(id); setShowYPicker(false); setSearchY(''); }}
                  onClose={() => setShowYPicker(false)}
                />
              )}
            </div>
            <label className="flex items-center gap-1.5 mt-2 text-[11px] text-[#999]">
              <input type="checkbox" checked={logY} onChange={e => setLogY(e.target.checked)} className="rounded" />
              Log scale
            </label>
          </div>
        </div>

        {/* Region filter */}
        <div className="flex items-center gap-3 mb-4">
          <select
            value={regionFilter}
            onChange={e => setRegionFilter(e.target.value)}
            className="border border-[#e8e8e8] rounded-lg px-3 py-1.5 text-[12px] outline-none"
          >
            <option value="">All Regions ({scatterData.length} countries)</option>
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Chart */}
        {loading ? (
          <div className="text-center py-20 text-[#999]">Loading data...</div>
        ) : scatterData.length === 0 ? (
          <div className="text-center py-20 text-[#999]">No overlapping data for these indicators.</div>
        ) : (
          <div className="border border-[#e8e8e8] rounded-xl p-4">
            <ScatterPlotChart
              data={scatterData}
              xLabel={xInd?.label || ''}
              yLabel={yInd?.label || ''}
              xFormat={xInd?.format || 'number'}
              yFormat={yInd?.format || 'number'}
              xDecimals={xInd?.decimals}
              yDecimals={yInd?.decimals}
              logX={logX}
              logY={logY}
              height={500}
            />
          </div>
        )}

        {/* Insights */}
        {scatterData.length > 5 && (
          <div className="mt-6 border border-[#e8e8e8] rounded-xl p-5 bg-[#f8f9fa]">
            <h3 className="text-[14px] font-semibold mb-3">Quick Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[13px]">
              <div>
                <div className="text-[#999] text-[11px]">Countries plotted</div>
                <div className="font-mono font-semibold">{scatterData.length}</div>
              </div>
              <div>
                <div className="text-[#999] text-[11px]">Correlation</div>
                <div className="font-mono font-semibold">{computeCorrelation(scatterData).toFixed(3)}</div>
              </div>
              <div>
                <div className="text-[#999] text-[11px]">{xInd?.label} range</div>
                <div className="font-mono text-[12px]">
                  {formatValue(Math.min(...scatterData.map(d => d.x)), xInd?.format || 'number', xInd?.decimals)} — {formatValue(Math.max(...scatterData.map(d => d.x)), xInd?.format || 'number', xInd?.decimals)}
                </div>
              </div>
              <div>
                <div className="text-[#999] text-[11px]">{yInd?.label} range</div>
                <div className="font-mono text-[12px]">
                  {formatValue(Math.min(...scatterData.map(d => d.y)), yInd?.format || 'number', yInd?.decimals)} — {formatValue(Math.max(...scatterData.map(d => d.y)), yInd?.format || 'number', yInd?.decimals)}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

function IndicatorPicker({
  search, setSearch, indicators, selectedId, onSelect, onClose,
}: {
  search: string;
  setSearch: (s: string) => void;
  indicators: typeof INDICATORS;
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute left-0 top-full mt-1 w-[320px] bg-white border border-[#e8e8e8] rounded-lg shadow-lg z-50 max-h-[400px] overflow-hidden">
        <div className="p-2 border-b border-[#e8e8e8]">
          <input
            type="text"
            placeholder="Search indicators..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-[#e8e8e8] rounded px-3 py-1.5 text-[13px] outline-none focus:border-[#0066cc]"
            autoFocus
          />
        </div>
        <div className="overflow-y-auto max-h-[350px]">
          {CATEGORIES.map(cat => {
            const inds = indicators.filter(i => i.category === cat);
            if (inds.length === 0) return null;
            return (
              <div key={cat}>
                <div className="px-3 py-1.5 text-[10px] font-bold text-[#999] uppercase bg-[#f8f9fa] sticky top-0">{cat}</div>
                {inds.map(ind => (
                  <button
                    key={ind.id}
                    onClick={() => onSelect(ind.id)}
                    className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-[#f5f7fa] transition ${
                      ind.id === selectedId ? 'bg-[#f0f7ff] text-[#0066cc] font-medium' : 'text-[#333]'
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
    </>
  );
}

function computeCorrelation(data: { x: number; y: number }[]): number {
  const n = data.length;
  if (n < 3) return 0;
  const meanX = data.reduce((s, d) => s + d.x, 0) / n;
  const meanY = data.reduce((s, d) => s + d.y, 0) / n;
  let num = 0, denX = 0, denY = 0;
  for (const d of data) {
    const dx = d.x - meanX;
    const dy = d.y - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : num / den;
}
