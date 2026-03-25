'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { formatValue } from '@/lib/data';

interface Quote {
  id: string;
  label: string;
  price: number;
  previousClose: number;
  change: number;
  changePct: number;
}

interface QuotesResponse {
  count: number;
  updatedAt: string | null;
  quotes: Quote[];
}

// Map SOTW IDs to country codes for linking
const ID_TO_COUNTRY: Record<string, string> = {
  'YF.IDX.USA': 'USA', 'YF.IDX.CAN': 'CAN', 'YF.IDX.BRA': 'BRA', 'YF.IDX.MEX': 'MEX',
  'YF.IDX.ARG': 'ARG', 'YF.IDX.GBR': 'GBR', 'YF.IDX.DEU': 'DEU', 'YF.IDX.FRA': 'FRA',
  'YF.IDX.NLD': 'NLD', 'YF.IDX.ESP': 'ESP', 'YF.IDX.ITA': 'ITA', 'YF.IDX.CHE': 'CHE',
  'YF.IDX.JPN': 'JPN', 'YF.IDX.HKG': 'HKG', 'YF.IDX.CHN': 'CHN', 'YF.IDX.KOR': 'KOR',
  'YF.IDX.IND': 'IND', 'YF.IDX.AUS': 'AUS', 'YF.IDX.NZL': 'NZL', 'YF.IDX.SGP': 'SGP',
  'YF.IDX.IDN': 'IDN', 'YF.IDX.MYS': 'MYS', 'YF.IDX.ISR': 'ISR', 'YF.IDX.SAU': 'SAU',
  'YF.IDX.ZAF': 'ZAF',
};

const COUNTRY_NAMES: Record<string, string> = {
  'USA': 'United States', 'GBR': 'United Kingdom', 'DEU': 'Germany', 'FRA': 'France',
  'JPN': 'Japan', 'CHN': 'China', 'HKG': 'Hong Kong', 'IND': 'India', 'KOR': 'South Korea',
  'CAN': 'Canada', 'AUS': 'Australia', 'BRA': 'Brazil', 'MEX': 'Mexico', 'ARG': 'Argentina',
  'ESP': 'Spain', 'ITA': 'Italy', 'CHE': 'Switzerland', 'NLD': 'Netherlands',
  'NZL': 'New Zealand', 'SGP': 'Singapore', 'IDN': 'Indonesia', 'MYS': 'Malaysia',
  'ISR': 'Israel', 'SAU': 'Saudi Arabia', 'ZAF': 'South Africa',
};

const REGIONS: Record<string, string[]> = {
  'Americas': ['YF.IDX.USA', 'YF.IDX.CAN', 'YF.IDX.BRA', 'YF.IDX.MEX', 'YF.IDX.ARG'],
  'Europe': ['YF.IDX.GBR', 'YF.IDX.DEU', 'YF.IDX.FRA', 'YF.IDX.ESP', 'YF.IDX.ITA', 'YF.IDX.CHE', 'YF.IDX.NLD'],
  'Asia-Pacific': ['YF.IDX.JPN', 'YF.IDX.CHN', 'YF.IDX.HKG', 'YF.IDX.KOR', 'YF.IDX.IND', 'YF.IDX.AUS', 'YF.IDX.NZL', 'YF.IDX.SGP', 'YF.IDX.IDN', 'YF.IDX.MYS'],
  'Middle East & Africa': ['YF.IDX.ISR', 'YF.IDX.SAU', 'YF.IDX.ZAF'],
};

type Tab = 'stocks' | 'commodities' | 'currencies';

function ChangeCell({ value, pct }: { value: number; pct: number }) {
  const color = value >= 0 ? 'text-[#2ecc40]' : 'text-[#e74c3c]';
  const sign = value >= 0 ? '+' : '';
  return (
    <>
      <td className={`px-3 py-2 text-right font-mono text-[12px] ${color}`}>
        {sign}{value.toFixed(2)}
      </td>
      <td className={`px-3 py-2 text-right font-mono text-[12px] ${color}`}>
        {sign}{pct.toFixed(2)}%
      </td>
    </>
  );
}

export default function MarketsPage() {
  const [tab, setTab] = useState<Tab>('stocks');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = () => {
      fetch('/api/quotes')
        .then(r => r.json())
        .then((data: QuotesResponse) => {
          setQuotes(data.quotes || []);
          setUpdatedAt(data.updatedAt);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 30_000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const quoteMap = Object.fromEntries(quotes.map(q => [q.id, q]));

  const stockQuotes = quotes.filter(q => q.id.startsWith('YF.IDX.'));
  const commodityQuotes = quotes.filter(q =>
    ['YF.GOLD', 'YF.SILVER', 'YF.CRUDE_OIL', 'YF.BRENT', 'YF.NATGAS', 'YF.COPPER', 'YF.PLATINUM',
     'YF.WHEAT', 'YF.CORN', 'YF.COFFEE', 'YF.COCOA'].includes(q.id)
  );
  const fxQuotes = quotes.filter(q => q.id.startsWith('YF.FX.'));

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'stocks', label: 'Stock Indices', count: stockQuotes.length },
    { id: 'commodities', label: 'Commodities', count: commodityQuotes.length },
    { id: 'currencies', label: 'Currencies', count: fxQuotes.length },
  ];

  const updatedStr = updatedAt
    ? new Date(updatedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : '';

  return (
    <main className="min-h-screen bg-white text-[#333]">
      <Nav />

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex items-end justify-between mb-1">
          <h1 className="text-[24px] font-bold">Markets</h1>
          {updatedStr && (
            <span className="text-[11px] text-[#999] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Live &middot; {updatedStr}
            </span>
          )}
        </div>
        <p className="text-[13px] text-[#999] mb-6">
          Live delayed quotes from Yahoo Finance. Stock indices, commodities, and exchange rates.
        </p>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-[#e8e8e8]">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-[13px] transition border-b-2 -mb-[1px] ${
                tab === t.id
                  ? 'border-[#0066cc] text-[#0066cc] font-medium'
                  : 'border-transparent text-[#666] hover:text-[#333]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#999]">Loading market data...</div>
        ) : tab === 'stocks' ? (
          <div className="space-y-8">
            {Object.entries(REGIONS).map(([region, ids]) => {
              const regionQuotes = ids.map(id => quoteMap[id]).filter(Boolean);
              if (regionQuotes.length === 0) return null;
              return (
                <div key={region}>
                  <h2 className="text-[14px] font-semibold text-[#666] uppercase tracking-wider mb-3">{region}</h2>
                  <div className="border border-[#e8e8e8] rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="text-[11px] text-[#999] uppercase tracking-wider bg-[#f8f9fa] border-b border-[#e8e8e8]">
                          <th className="text-left px-3 py-2">Country</th>
                          <th className="text-left px-3 py-2">Index</th>
                          <th className="text-right px-3 py-2">Price</th>
                          <th className="text-right px-3 py-2">Prev Close</th>
                          <th className="text-right px-3 py-2">Change</th>
                          <th className="text-right px-3 py-2">% Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ids.map(id => {
                          const q = quoteMap[id];
                          if (!q) return null;
                          const cid = ID_TO_COUNTRY[id] || '';
                          return (
                            <tr key={id} className="border-b border-[#f0f0f0] hover:bg-[#f5f7fa] transition text-[13px]">
                              <td className="px-3 py-2">
                                <Link href={`/country/${cid}`} className="text-[#0066cc] hover:underline">
                                  {COUNTRY_NAMES[cid] || cid}
                                </Link>
                              </td>
                              <td className="px-3 py-2 text-[#666]">
                                <Link href={`/country/${cid}/${encodeURIComponent(id)}`} className="hover:text-[#0066cc] transition">
                                  {q.label}
                                </Link>
                              </td>
                              <td className="px-3 py-2 text-right font-mono font-semibold">
                                {q.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                              </td>
                              <td className="px-3 py-2 text-right font-mono text-[12px] text-[#999]">
                                {q.previousClose.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                              </td>
                              <ChangeCell value={q.change} pct={q.changePct} />
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        ) : tab === 'commodities' ? (
          <div className="border border-[#e8e8e8] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-[11px] text-[#999] uppercase tracking-wider bg-[#f8f9fa] border-b border-[#e8e8e8]">
                  <th className="text-left px-3 py-2">Commodity</th>
                  <th className="text-right px-3 py-2">Price</th>
                  <th className="text-right px-3 py-2">Prev Close</th>
                  <th className="text-right px-3 py-2">Change</th>
                  <th className="text-right px-3 py-2">% Change</th>
                </tr>
              </thead>
              <tbody>
                {commodityQuotes.map(q => (
                  <tr key={q.id} className="border-b border-[#f0f0f0] hover:bg-[#f5f7fa] transition text-[13px]">
                    <td className="px-3 py-2 font-medium">
                      <Link href={`/country/WLD/${encodeURIComponent(q.id)}`} className="text-[#0066cc] hover:underline">
                        {q.label}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-semibold">
                      ${q.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[12px] text-[#999]">
                      ${q.previousClose.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <ChangeCell value={q.change} pct={q.changePct} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
