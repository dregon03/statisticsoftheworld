'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Flag from '../../../Flag';

interface Partner { name: string; iso: string; value: number; }
interface Commodity { code: string; name: string; value: number; }

function formatUSD(v: number): string {
  if (Math.abs(v) >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${v.toLocaleString()}`;
}

export default function CountryTradePage() {
  const params = useParams();
  const countryId = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/trade?country=${countryId}`)
      .then(r => r.json())
      .then(d => { if (!d.error) setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [countryId]);

  return (
    <main className="min-h-screen">
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <div className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/countries" className="hover:text-gray-600">Countries</Link>
          <span className="mx-2">/</span>
          <Link href={`/country/${countryId}`} className="hover:text-gray-600">{countryId}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">Trade</span>
        </div>

        <h1 className="text-[26px] font-bold mb-2">{countryId} — International Trade</h1>

        {/* Sub-nav */}
        <div className="flex gap-1 mb-6 border-b border-gray-100">
          <Link href={`/country/${countryId}`} className="px-4 py-2 text-[13px] text-[#64748b] hover:text-[#0d1b2a]">Overview</Link>
          <Link href={`/country/${countryId}/forecast`} className="px-4 py-2 text-[13px] text-[#64748b] hover:text-[#0d1b2a]">Forecasts</Link>
          <span className="px-4 py-2 text-[13px] font-medium text-[#0066cc] border-b-2 border-[#0066cc]">Trade</span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-[#64748b]">Loading trade data...</div>
        ) : !data ? (
          <div className="text-center py-16 text-[#64748b]">Trade data not available for this country. <Link href="/trade" className="text-[#0066cc] hover:underline">Browse available countries →</Link></div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="text-[11px] text-[#64748b] mb-1">Exports ({data.year})</div>
                <div className="text-[20px] font-bold text-green-600">{formatUSD(data.totalExports)}</div>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="text-[11px] text-[#64748b] mb-1">Imports ({data.year})</div>
                <div className="text-[20px] font-bold text-red-500">{formatUSD(data.totalImports)}</div>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="text-[11px] text-[#64748b] mb-1">Balance</div>
                <div className={`text-[20px] font-bold ${data.tradeBalance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {data.tradeBalance >= 0 ? '+' : ''}{formatUSD(data.tradeBalance)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="border border-gray-100 rounded-xl p-5">
                <h2 className="text-[14px] font-semibold mb-3">Top Export Partners</h2>
                {(data.topExportPartners || []).map((p: Partner, i: number) => (
                  <div key={i} className="flex items-center justify-between py-1.5 text-[12px]">
                    <span className="text-[#0d1b2a]">{i + 1}. {p.name}</span>
                    <span className="font-mono text-[#64748b]">{formatUSD(p.value)}</span>
                  </div>
                ))}
              </div>
              <div className="border border-gray-100 rounded-xl p-5">
                <h2 className="text-[14px] font-semibold mb-3">Top Import Sources</h2>
                {(data.topImportPartners || []).map((p: Partner, i: number) => (
                  <div key={i} className="flex items-center justify-between py-1.5 text-[12px]">
                    <span className="text-[#0d1b2a]">{i + 1}. {p.name}</span>
                    <span className="font-mono text-[#64748b]">{formatUSD(p.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-[#64748b]">Source: UN COMTRADE ({data.year})</div>
          </>
        )}
      </section>
      <Footer />
    </main>
  );
}
