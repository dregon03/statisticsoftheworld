'use client';

import { useState, useEffect } from 'react';
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

function ChangeCell({ value, pct }: { value: number; pct: number }) {
  const color = value >= 0 ? 'text-[#2ecc40]' : 'text-[#e74c3c]';
  const sign = value >= 0 ? '+' : '';
  return (
    <>
      <td className={`px-3 py-2 text-right font-mono text-[12px] ${color}`}>
        {sign}{value.toFixed(4)}
      </td>
      <td className={`px-3 py-2 text-right font-mono text-[12px] ${color}`}>
        {sign}{pct.toFixed(2)}%
      </td>
    </>
  );
}

export default function CurrenciesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    const interval = setInterval(fetchQuotes, 30_000);
    return () => clearInterval(interval);
  }, []);

  const fxQuotes = quotes.filter(q => q.id.startsWith('YF.FX.'));

  return (
    <main className="min-h-screen bg-white text-[#333]">
      <Nav />

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <MarketsHeader updatedAt={updatedAt} />

        {loading ? (
          <div className="text-center py-20 text-[#999]">Loading currency data...</div>
        ) : (
          <div className="border border-[#e8e8e8] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-[11px] text-[#999] uppercase tracking-wider bg-[#f8f9fa] border-b border-[#e8e8e8]">
                  <th className="text-left px-3 py-2">Pair</th>
                  <th className="text-right px-3 py-2">Rate</th>
                  <th className="text-right px-3 py-2">Prev Close</th>
                  <th className="text-right px-3 py-2">Change</th>
                  <th className="text-right px-3 py-2">% Change</th>
                </tr>
              </thead>
              <tbody>
                {fxQuotes.map(q => (
                  <tr key={q.id} className="border-b border-[#f0f0f0] hover:bg-[#f5f7fa] transition text-[13px]">
                    <td className="px-3 py-2 font-medium">{q.label}</td>
                    <td className="px-3 py-2 text-right font-mono font-semibold">
                      {q.price.toFixed(4)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[12px] text-[#999]">
                      {q.previousClose.toFixed(4)}
                    </td>
                    <ChangeCell value={q.change} pct={q.changePct} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
