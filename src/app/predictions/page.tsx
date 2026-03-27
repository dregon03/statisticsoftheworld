'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

interface PredictionMarket {
  id: string;
  question: string;
  slug: string;
  probability: number;
  outcomes: string[];
  outcomePrices: number[];
  volume: number;
  volume24hr: number;
  liquidity: number;
  endDate: string;
  category: string;
  url: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Central Banks & Rates': '#7c3aed',
  'Recession & Growth': '#dc2626',
  'Inflation & Prices': '#ea580c',
  'Elections & Politics': '#2563eb',
  'Geopolitics & Conflict': '#b91c1c',
  'Trade & Tariffs': '#059669',
  'Crypto & Markets': '#d97706',
  'Global Events': '#0891b2',
};

const CATEGORY_ORDER = [
  'Central Banks & Rates',
  'Recession & Growth',
  'Inflation & Prices',
  'Elections & Politics',
  'Geopolitics & Conflict',
  'Trade & Tariffs',
  'Crypto & Markets',
  'Global Events',
];

function formatVolume(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function ProbabilityBar({ probability, color }: { probability: number; color: string }) {
  const pct = Math.round(probability * 100);
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[14px] font-bold tabular-nums" style={{ color, minWidth: 42, textAlign: 'right' }}>
        {pct}%
      </span>
    </div>
  );
}

function MarketCard({ market }: { market: PredictionMarket }) {
  const color = CATEGORY_COLORS[market.category] || '#666';
  const endDate = market.endDate ? new Date(market.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  return (
    <a
      href={market.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-[#e8e8e8] rounded-xl p-4 hover:border-[#ccc] hover:shadow-sm transition group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-[13px] font-medium text-[#333] leading-tight group-hover:text-[#0066cc] transition flex-1">
          {market.question}
        </h3>
        <span
          className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
          style={{ color, backgroundColor: `${color}15` }}
        >
          {market.outcomes[0] || 'Yes'}
        </span>
      </div>

      <ProbabilityBar probability={market.probability} color={color} />

      <div className="flex items-center justify-between mt-2.5 text-[10px] text-[#999]">
        <div className="flex gap-3">
          <span>Vol: {formatVolume(market.volume)}</span>
          <span>Liq: {formatVolume(market.liquidity)}</span>
        </div>
        {endDate && <span>Resolves: {endDate}</span>}
      </div>
    </a>
  );
}

export default function PredictionsPage() {
  const [markets, setMarkets] = useState<PredictionMarket[]>([]);
  const [byCategory, setByCategory] = useState<Record<string, PredictionMarket[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const fetchPredictions = useCallback(async (silent = false) => {
    try {
      const r = await fetch('/api/predictions?limit=500');
      const data = await r.json();
      setMarkets(data.markets || []);
      setByCategory(data.byCategory || {});
      setUpdatedAt(data.updatedAt);
    } catch {}
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => {
    fetchPredictions();
    const iv = setInterval(() => fetchPredictions(true), 60_000);
    return () => clearInterval(iv);
  }, [fetchPredictions]);

  const filtered = selectedCategory
    ? (byCategory[selectedCategory] || [])
    : markets;

  const categories = CATEGORY_ORDER.filter(c => byCategory[c]?.length > 0);

  return (
    <main className="min-h-screen bg-white text-[#333]">
      <Nav />

      <section className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-[28px] font-bold">Prediction Markets</h1>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white bg-[#7c3aed] px-2 py-0.5 rounded">
              Live
            </span>
          </div>
          <p className="text-[13px] text-[#999] mb-1">
            Real-money prediction markets from{' '}
            <a href="https://polymarket.com" target="_blank" rel="noopener noreferrer" className="text-[#0066cc] hover:underline">
              Polymarket
            </a>
            . Prices reflect the crowd&apos;s probability estimate for each outcome.
          </p>
          {updatedAt && (
            <p className="text-[11px] text-[#ccc]">
              Last updated: {new Date(updatedAt).toLocaleString()}
            </p>
          )}
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 text-[12px] rounded-lg border transition ${
              !selectedCategory
                ? 'bg-[#333] text-white border-[#333]'
                : 'border-[#e8e8e8] text-[#666] hover:bg-[#f5f7fa]'
            }`}
          >
            All ({markets.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              className={`px-3 py-1.5 text-[12px] rounded-lg border transition ${
                selectedCategory === cat
                  ? 'text-white border-transparent'
                  : 'border-[#e8e8e8] text-[#666] hover:bg-[#f5f7fa]'
              }`}
              style={selectedCategory === cat ? { backgroundColor: CATEGORY_COLORS[cat] } : {}}
            >
              {cat} ({byCategory[cat]?.length || 0})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-[#999]">Loading prediction markets...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[#999]">No markets found in this category.</div>
        ) : selectedCategory ? (
          /* Single category view */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(m => <MarketCard key={m.id} market={m} />)}
          </div>
        ) : (
          /* All categories view */
          <div className="space-y-8">
            {categories.map(cat => {
              const catMarkets = byCategory[cat] || [];
              if (catMarkets.length === 0) return null;
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                    <h2 className="text-[15px] font-semibold">{cat}</h2>
                    <span className="text-[11px] text-[#999]">{catMarkets.length} markets</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {catMarkets.slice(0, 6).map(m => <MarketCard key={m.id} market={m} />)}
                  </div>
                  {catMarkets.length > 6 && (
                    <button
                      onClick={() => setSelectedCategory(cat)}
                      className="mt-2 text-[12px] text-[#0066cc] hover:underline"
                    >
                      View all {catMarkets.length} →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* How to read */}
        <div className="mt-12 border border-[#e8e8e8] rounded-xl p-6 bg-[#f8f9fa]">
          <h2 className="text-[15px] font-semibold mb-2">How to read prediction markets</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[12px] text-[#666]">
            <div>
              <div className="font-semibold text-[#333] mb-1">Probability</div>
              The percentage shown is the market&apos;s implied probability — the crowd&apos;s best estimate of the outcome happening.
              A market at 73% means traders collectively believe there&apos;s a 73% chance of &quot;Yes.&quot;
            </div>
            <div>
              <div className="font-semibold text-[#333] mb-1">Volume</div>
              Total dollars traded on this market. Higher volume = more attention and generally more reliable pricing.
              Markets with $1M+ volume are considered highly reliable signals.
            </div>
            <div>
              <div className="font-semibold text-[#333] mb-1">Liquidity</div>
              Money available in the order book. Higher liquidity means prices are harder to manipulate and
              more trustworthy as probability estimates.
            </div>
          </div>
        </div>

        <div className="mt-4 text-[11px] text-[#ccc] text-center">
          Data from <a href="https://polymarket.com" target="_blank" rel="noopener noreferrer" className="text-[#999] hover:underline">Polymarket</a> via Gamma API.
          Prediction markets reflect crowd consensus, not certainty. Not financial advice.
        </div>
      </section>

      <Footer />
    </main>
  );
}
