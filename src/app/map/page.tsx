'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { INDICATORS, CATEGORIES, formatValue } from '@/lib/data';
import WorldMap from '@/components/charts/WorldMap';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import HeroTabs from '@/components/HeroTabs';

// Categories that can't be visualized on a world map (single-asset or single-country data)
const NON_MAP_CATEGORIES = new Set(['Stock Markets', 'Financial Markets', 'Commodities', 'Currencies', 'US Economy']);
const MAP_INDICATORS = INDICATORS.filter(i => !NON_MAP_CATEGORIES.has(i.category));
const MAP_CATEGORIES = CATEGORIES.filter(c => !NON_MAP_CATEGORIES.has(c));

interface RankingEntry {
  country: string;
  countryId: string;
  iso2: string;
  value: number | null;
  year: string;
}

export default function MapPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#1a1a2e]">
      <Nav />
      <HeroTabs active="/map" />
      <Suspense>
        <MapContent />
      </Suspense>
      <Footer />
    </main>
  );
}

export function MapContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');
  const initialIndicator = (initialId && MAP_INDICATORS.find(i => i.id === initialId)) || MAP_INDICATORS[0];

  const [selectedIndicator, setSelectedIndicator] = useState(initialIndicator);
  const [data, setData] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/indicator?id=${encodeURIComponent(selectedIndicator.id)}`)
      .then(r => r.json())
      .then(entries => {
        setData(entries);
        setLoading(false);
      })
      .catch(() => { setData([]); setLoading(false); });
  }, [selectedIndicator]);

  const mapData = data.map(d => ({
    countryId: d.countryId,
    value: d.value,
    year: d.year,
  }));

  const filteredIndicators = MAP_INDICATORS.filter(ind =>
    ind.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ind.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Top/bottom 5 for quick stats
  const sorted = [...data].filter(d => d.value != null);
  const top5 = sorted.slice(0, 5);
  const bottom5 = sorted.slice(-5).reverse();

  return (
    <section className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[28px] font-bold">World Map</h1>
            <Link href={`/indicators?id=${encodeURIComponent(selectedIndicator.id)}`} className="text-[12px] text-[#0066cc] hover:underline ml-2">
              View as table &rarr;
            </Link>
          </div>
          <p className="text-[13px] text-[#64748b]">
            Visualize any indicator across 218 countries. Color intensity represents relative values.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Indicator selector */}
          <div className="lg:col-span-1">
            <input
              type="text"
              placeholder="Search indicators..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full border border-[#d5dce6] rounded-lg px-3 py-2 text-[13px] mb-3 outline-none focus:border-[#0066cc]"
            />
            <div className="border border-[#d5dce6] rounded-xl overflow-hidden max-h-[60vh] overflow-y-auto">
              {MAP_CATEGORIES.map(cat => {
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
                        onClick={() => setSelectedIndicator(ind)}
                        className={`w-full text-left px-3 py-1.5 text-[12px] transition ${
                          selectedIndicator.id === ind.id
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

          {/* Map + stats */}
          <div className="lg:col-span-3">
            <div className="mb-4">
              <h2 className="text-[18px] font-bold">{selectedIndicator.label}</h2>
              <div className="text-[12px] text-[#64748b]">{selectedIndicator.category} &middot; {data.length} countries with data</div>
            </div>

            {loading ? (
              <div className="text-center py-20 text-[#64748b]">Loading map data...</div>
            ) : data.length === 0 ? (
              <div className="text-center py-20 text-[#64748b]">No data available for this indicator.</div>
            ) : (
              <>
                <WorldMap
                  data={mapData}
                  format={selectedIndicator.format}
                  decimals={selectedIndicator.decimals}
                />

                {/* Top/Bottom stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="border border-[#d5dce6] rounded-xl p-4">
                    <h3 className="text-[13px] font-semibold text-[#0d1b2a] mb-3">Highest</h3>
                    <div className="space-y-2">
                      {top5.map((d, i) => (
                        <div key={d.countryId} className="flex items-center justify-between text-[13px]">
                          <div className="flex items-center gap-2">
                            <span className="text-[#64748b] w-4">{i + 1}.</span>
                            <Link href={`/country/${d.countryId}`} className="text-[#0066cc] hover:underline">{d.country}</Link>
                          </div>
                          <span className="font-mono">{formatValue(d.value, selectedIndicator.format, selectedIndicator.decimals)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border border-[#d5dce6] rounded-xl p-4">
                    <h3 className="text-[13px] font-semibold text-[#0d1b2a] mb-3">Lowest</h3>
                    <div className="space-y-2">
                      {bottom5.map((d, i) => (
                        <div key={d.countryId} className="flex items-center justify-between text-[13px]">
                          <div className="flex items-center gap-2">
                            <span className="text-[#64748b] w-4">{sorted.length - 4 + i}.</span>
                            <Link href={`/country/${d.countryId}`} className="text-[#0066cc] hover:underline">{d.country}</Link>
                          </div>
                          <span className="font-mono">{formatValue(d.value, selectedIndicator.format, selectedIndicator.decimals)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
  );
}
