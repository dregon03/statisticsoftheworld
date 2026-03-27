'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Flag from '../Flag';
import { formatValue } from '@/lib/data';

interface Country { id: string; name: string; iso2: string; value: number; year: string; }
interface Insight {
  title: string;
  description: string;
  countries: Country[];
  indicatorId: string;
  indicatorLabel: string;
  type: 'highest' | 'lowest' | 'fastest' | 'slowest';
}

export default function TrendingPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/trending')
      .then(r => r.json())
      .then(data => {
        setInsights(data.insights || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#1a1a2e]">
      <Nav />

      <section className="max-w-[1200px] mx-auto px-4 py-8">
        <h1 className="text-[28px] font-bold mb-1">Trending Data</h1>
        <p className="text-[13px] text-[#64748b] mb-8">
          Auto-generated insights from the latest global statistics. Updated daily.
        </p>

        {loading ? (
          <div className="text-center py-20 text-[#64748b]">Loading insights...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((insight, i) => {
              const isNeg = insight.type === 'lowest' || insight.type === 'slowest';
              const ind = { format: insight.indicatorId.includes('NGDPDPC') ? 'currency' : insight.indicatorId.includes('POP') ? 'number' : 'percent' };
              const maxVal = Math.max(...insight.countries.map(c => Math.abs(c.value)));

              return (
                <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-[#f4f6f9] border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-[14px] font-semibold">{insight.title}</h2>
                    <Link
                      href={`/indicators?id=${encodeURIComponent(insight.indicatorId)}`}
                      className="text-[11px] text-[#0066cc] hover:underline"
                    >
                      {insight.indicatorLabel} →
                    </Link>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {insight.countries.map((c, j) => {
                      const barWidth = maxVal > 0 ? (Math.abs(c.value) / maxVal) * 100 : 0;
                      return (
                        <div key={c.id} className="flex items-center px-4 py-2 gap-3 hover:bg-[#fafafa] transition">
                          <span className="text-[11px] text-[#94a3b8] w-5 text-right">{j + 1}</span>
                          <Flag iso2={c.iso2} size={18} />
                          <Link href={`/country/${c.id}`} className="text-[13px] text-[#0066cc] hover:underline flex-1 truncate">
                            {c.name}
                          </Link>
                          <div className="w-20 hidden sm:block">
                            <div className="w-full bg-gray-100 rounded-full h-1">
                              <div
                                className={`h-1 rounded-full ${isNeg ? 'bg-red-400' : 'bg-green-500'}`}
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                          </div>
                          <span className={`text-[12px] font-mono w-20 text-right ${c.value < 0 ? 'text-red-500' : ''}`}>
                            {formatValue(c.value, ind.format, 1)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
