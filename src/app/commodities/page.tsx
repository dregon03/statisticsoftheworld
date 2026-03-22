'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { formatValue } from '@/lib/data';
import SparklineChart from '@/components/charts/SparklineChart';

interface CommodityData {
  id: string;
  label: string;
  value: number | null;
  year: string;
  history: { year: number; value: number | null }[];
}

const COMMODITY_SECTIONS: { title: string; items: { id: string; label: string }[] }[] = [
  {
    title: 'Energy',
    items: [
      { id: 'YF.CRUDE_OIL', label: 'WTI Crude Oil' },
      { id: 'YF.BRENT', label: 'Brent Crude Oil' },
      { id: 'YF.NATGAS', label: 'Natural Gas' },
    ],
  },
  {
    title: 'Precious Metals',
    items: [
      { id: 'YF.GOLD', label: 'Gold' },
      { id: 'YF.SILVER', label: 'Silver' },
      { id: 'YF.PLATINUM', label: 'Platinum' },
      { id: 'YF.PALLADIUM', label: 'Palladium' },
    ],
  },
  {
    title: 'Industrial Metals',
    items: [
      { id: 'YF.COPPER', label: 'Copper' },
      { id: 'AV.ALUMINUM', label: 'Aluminum' },
    ],
  },
  {
    title: 'Agriculture',
    items: [
      { id: 'YF.WHEAT', label: 'Wheat' },
      { id: 'YF.CORN', label: 'Corn' },
      { id: 'YF.SOYBEANS', label: 'Soybeans' },
      { id: 'YF.COFFEE', label: 'Coffee' },
      { id: 'YF.COTTON', label: 'Cotton' },
      { id: 'YF.SUGAR', label: 'Sugar' },
      { id: 'YF.COCOA', label: 'Cocoa' },
    ],
  },
];

export default function CommoditiesPage() {
  const [data, setData] = useState<Record<string, CommodityData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allIds = COMMODITY_SECTIONS.flatMap(s => s.items.map(i => i.id));

    // Fetch latest values and history for each commodity
    Promise.all(
      allIds.map(async id => {
        const [latest, history] = await Promise.all([
          fetch(`/api/indicator?id=${encodeURIComponent(id)}`).then(r => r.json()).catch(() => []),
          fetch(`/api/history?indicator=${encodeURIComponent(id)}&country=WLD`).then(r => r.json()).catch(() => []),
        ]);
        const entry = latest?.[0];
        const item = COMMODITY_SECTIONS.flatMap(s => s.items).find(i => i.id === id);
        return {
          id,
          label: item?.label || id,
          value: entry?.value || null,
          year: entry?.year || '',
          history: Array.isArray(history) ? history : [],
        };
      })
    ).then(results => {
      const d: Record<string, CommodityData> = {};
      for (const r of results) d[r.id] = r;
      setData(d);
      setLoading(false);
    });
  }, []);

  return (
    <main className="min-h-screen bg-white text-[#333]">
      <Nav />

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <h1 className="text-[24px] font-bold mb-1">Commodities</h1>
        <p className="text-[13px] text-[#999] mb-6">Energy, metals, and agricultural commodity prices.</p>

        {loading ? (
          <div className="text-center py-20 text-[#999]">Loading commodity prices...</div>
        ) : (
          <div className="space-y-8">
            {COMMODITY_SECTIONS.map(section => (
              <div key={section.title}>
                <h2 className="text-[14px] font-semibold text-[#666] uppercase tracking-wider mb-3">{section.title}</h2>
                <div className="border border-[#e8e8e8] rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="text-[11px] text-[#999] uppercase tracking-wider bg-[#f8f9fa] border-b border-[#e8e8e8]">
                        <th className="text-left px-3 py-2">Commodity</th>
                        <th className="text-right px-3 py-2">Price</th>
                        <th className="text-right px-3 py-2 w-[100px] hidden md:table-cell">Trend</th>
                        <th className="text-right px-3 py-2">Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.items.map(item => {
                        const d = data[item.id];
                        return (
                          <tr key={item.id} className="border-b border-[#f0f0f0] hover:bg-[#f5f7fa] transition text-[13px]">
                            <td className="px-3 py-2">
                              <Link href={`/country/WLD/${encodeURIComponent(item.id)}`} className="text-[#0066cc] hover:underline font-medium">
                                {item.label}
                              </Link>
                            </td>
                            <td className="px-3 py-2 text-right font-mono">
                              {d?.value ? formatValue(d.value, 'currency', 2) : '—'}
                            </td>
                            <td className="px-3 py-2 text-right hidden md:table-cell">
                              {d?.history && d.history.length > 2 && (
                                <div className="flex justify-end">
                                  <SparklineChart data={d.history} width={80} height={24} />
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right text-[#999]">{d?.year || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
