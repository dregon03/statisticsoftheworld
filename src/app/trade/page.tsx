'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

interface Partner { name: string; iso: string; value: number; }
interface Commodity { code: string; name: string; value: number; }

interface TradeData {
  countryId: string;
  year: number;
  totalExports: number;
  totalImports: number;
  tradeBalance: number;
  topExportPartners: Partner[];
  topImportPartners: Partner[];
  topExportCommodities: Commodity[];
  topImportCommodities: Commodity[];
  availableCountries: string[];
}

function formatUSD(v: number): string {
  if (Math.abs(v) >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${v.toLocaleString()}`;
}

function BarList({ items, maxValue, color }: { items: { label: string; value: number; sub?: string }[]; maxValue: number; color: string }) {
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => {
        const pct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[15px] text-[#64748b] w-5 text-right shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[14px] text-[#0d1b2a] truncate" title={item.label}>{item.label}</span>
                <span className="text-[15px] font-mono text-[#64748b] shrink-0 ml-2">{formatUSD(item.value)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1">
                <div className={`${color} h-1 rounded-full transition-all duration-500`} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TradePage() {
  const [countryId, setCountryId] = useState('USA');
  const [data, setData] = useState<TradeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/trade?country=${countryId}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) {
          setData(null);
        } else {
          setData(d);
          if (d.availableCountries) setCountries(d.availableCountries);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [countryId]);

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#1a1a2e]">
      <Nav />

      <section className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[28px] font-bold mb-1">International Trade</h1>
            <p className="text-[15px] text-[#64748b]">
              Top trading partners and export/import commodities from UN COMTRADE.
            </p>
          </div>
          <select
            value={countryId}
            onChange={e => setCountryId(e.target.value)}
            className="border border-[#d5dce6] rounded-lg px-3 py-2 text-[15px] outline-none"
          >
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#64748b]">Loading trade data...</div>
        ) : !data ? (
          <div className="text-center py-20 text-[#64748b]">Trade data not available for this country.</div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="border border-gray-100 rounded-xl p-5">
                <div className="text-[14px] text-[#64748b] mb-1">Total Exports ({data.year})</div>
                <div className="text-[22px] font-bold text-green-600">{formatUSD(data.totalExports)}</div>
              </div>
              <div className="border border-gray-100 rounded-xl p-5">
                <div className="text-[14px] text-[#64748b] mb-1">Total Imports ({data.year})</div>
                <div className="text-[22px] font-bold text-red-500">{formatUSD(data.totalImports)}</div>
              </div>
              <div className="border border-gray-100 rounded-xl p-5">
                <div className="text-[14px] text-[#64748b] mb-1">Trade Balance ({data.year})</div>
                <div className={`text-[22px] font-bold ${data.tradeBalance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {data.tradeBalance >= 0 ? '+' : ''}{formatUSD(data.tradeBalance)}
                </div>
              </div>
            </div>

            {/* Trading partners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border border-gray-100 rounded-xl p-5">
                <h2 className="text-[15px] font-semibold mb-4">Top Export Destinations</h2>
                <BarList
                  items={data.topExportPartners.map(p => ({ label: p.name, value: p.value }))}
                  maxValue={data.topExportPartners[0]?.value || 1}
                  color="bg-green-500"
                />
              </div>
              <div className="border border-gray-100 rounded-xl p-5">
                <h2 className="text-[15px] font-semibold mb-4">Top Import Sources</h2>
                <BarList
                  items={data.topImportPartners.map(p => ({ label: p.name, value: p.value }))}
                  maxValue={data.topImportPartners[0]?.value || 1}
                  color="bg-red-400"
                />
              </div>
            </div>

            {/* Commodities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-100 rounded-xl p-5">
                <h2 className="text-[15px] font-semibold mb-4">Top Exports by Product</h2>
                <BarList
                  items={data.topExportCommodities.map(c => ({ label: c.name, value: c.value }))}
                  maxValue={data.topExportCommodities[0]?.value || 1}
                  color="bg-blue-500"
                />
              </div>
              <div className="border border-gray-100 rounded-xl p-5">
                <h2 className="text-[15px] font-semibold mb-4">Top Imports by Product</h2>
                <BarList
                  items={data.topImportCommodities.map(c => ({ label: c.name, value: c.value }))}
                  maxValue={data.topImportCommodities[0]?.value || 1}
                  color="bg-orange-400"
                />
              </div>
            </div>

            <div className="mt-6 text-[15px] text-[#64748b]">
              Source: <a href="https://comtrade.un.org/" target="_blank" rel="noopener noreferrer" className="text-[#0066cc] hover:underline">UN COMTRADE</a> ({data.year} data).
              Values in current USD. HS classification.
            </div>
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}
