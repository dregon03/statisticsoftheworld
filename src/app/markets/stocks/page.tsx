'use client';

import { useState, useEffect, useMemo } from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import MarketsHeader from '../MarketsHeader';

interface Quote {
  id: string;
  label: string;
  price: number;
  previousClose: number;
  change: number;
  changePct: number;
}

type SortKey = 'label' | 'price' | 'change' | 'changePct';

export default function StocksPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('changePct');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    const fetchQuotes = () => {
      fetch('/api/quotes')
        .then(r => r.json())
        .then((data: { quotes: Quote[]; updatedAt: string }) => {
          setQuotes(data.quotes || []);
          setUpdatedAt(data.updatedAt);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 10_000);
    return () => clearInterval(interval);
  }, []);

  const stockQuotes = useMemo(() => {
    let list = quotes.filter(q => q.id.startsWith('YF.SP500.'));

    // Search
    if (search) {
      const s = search.toUpperCase();
      list = list.filter(q => q.label.toUpperCase().includes(s));
    }

    // Sort
    list.sort((a, b) => {
      let aVal: number | string, bVal: number | string;
      if (sortKey === 'label') {
        aVal = a.label; bVal = b.label;
        return sortAsc ? (aVal as string).localeCompare(bVal as string) : (bVal as string).localeCompare(aVal as string);
      }
      aVal = (a as any)[sortKey]; bVal = (b as any)[sortKey];
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return list;
  }, [quotes, search, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(key === 'label'); }
  };

  const sortIcon = (key: SortKey) => sortKey !== key ? '' : sortAsc ? ' \u2191' : ' \u2193';

  const gainers = [...stockQuotes].sort((a, b) => b.changePct - a.changePct).slice(0, 5);
  const losers = [...stockQuotes].sort((a, b) => a.changePct - b.changePct).slice(0, 5);

  return (
    <main className="min-h-screen bg-white text-[#333]">
      <Nav />

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <MarketsHeader updatedAt={updatedAt} />

        {loading ? (
          <div className="text-center py-20 text-[#999]">Loading S&P 500 data...</div>
        ) : stockQuotes.length === 0 ? (
          <div className="text-center py-20 text-[#999]">No S&P 500 data yet. ETL job may still be running its first fetch.</div>
        ) : (
          <>
            {/* Top Gainers / Losers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border border-[#e8e8e8] rounded-lg p-4">
                <h3 className="text-[13px] font-semibold text-[#2ecc40] mb-3">Top Gainers</h3>
                {gainers.map(q => (
                  <div key={q.id} className="flex justify-between text-[13px] py-1">
                    <span className="font-medium">{q.label}</span>
                    <span className="font-mono text-[#2ecc40]">+{q.changePct.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
              <div className="border border-[#e8e8e8] rounded-lg p-4">
                <h3 className="text-[13px] font-semibold text-[#e74c3c] mb-3">Top Losers</h3>
                {losers.map(q => (
                  <div key={q.id} className="flex justify-between text-[13px] py-1">
                    <span className="font-medium">{q.label}</span>
                    <span className="font-mono text-[#e74c3c]">{q.changePct.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Search + count */}
            <div className="flex flex-wrap gap-3 mb-4">
              <input
                type="text"
                placeholder="Search ticker..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-white border border-[#e8e8e8] rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-[#0066cc] transition w-48"
              />
              <span className="text-[12px] text-[#999] self-center ml-auto">{stockQuotes.length} stocks</span>
            </div>

            {/* Table */}
            <div className="border border-[#e8e8e8] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-[11px] text-[#999] uppercase tracking-wider bg-[#f8f9fa] border-b border-[#e8e8e8]">
                    <th className="text-left px-3 py-2">
                      <button onClick={() => handleSort('label')} className="hover:text-[#333] transition">
                        Ticker{sortIcon('label')}
                      </button>
                    </th>
                    <th className="text-right px-3 py-2">
                      <button onClick={() => handleSort('price')} className="hover:text-[#333] transition">
                        Price{sortIcon('price')}
                      </button>
                    </th>
                    <th className="text-right px-3 py-2 hidden sm:table-cell">Prev Close</th>
                    <th className="text-right px-3 py-2">
                      <button onClick={() => handleSort('change')} className="hover:text-[#333] transition">
                        Change{sortIcon('change')}
                      </button>
                    </th>
                    <th className="text-right px-3 py-2">
                      <button onClick={() => handleSort('changePct')} className="hover:text-[#333] transition">
                        % Change{sortIcon('changePct')}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stockQuotes.map((q, i) => {
                    const color = q.change >= 0 ? 'text-[#2ecc40]' : 'text-[#e74c3c]';
                    const sign = q.change >= 0 ? '+' : '';
                    return (
                      <tr key={q.id} className={`border-b border-[#f0f0f0] hover:bg-[#f5f7fa] transition text-[13px] ${i % 2 ? 'bg-[#fafbfc]' : ''}`}>
                        <td className="px-3 py-2 font-semibold">{q.label}</td>
                        <td className="px-3 py-2 text-right font-mono font-semibold">
                          ${q.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-[12px] text-[#999] hidden sm:table-cell">
                          ${q.previousClose.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className={`px-3 py-2 text-right font-mono text-[12px] ${color}`}>
                          {sign}{q.change.toFixed(2)}
                        </td>
                        <td className={`px-3 py-2 text-right font-mono text-[12px] font-semibold ${color}`}>
                          {sign}{q.changePct.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}
