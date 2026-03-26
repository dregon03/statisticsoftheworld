'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import MarketsHeader from '../MarketsHeader';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

/* ── Types ─────────────────────────────────────────── */

interface CryptoQuote {
  pair: string;
  name: string;
  symbol: string;
  icon: string;
  price: number | null;
  previousClose: number | null;
  marketTime: string | null;
  weeklyChg?: number;
  monthlyChg?: number;
  ytdChg?: number;
}

interface ChartPoint {
  date: string;
  value: number;
}

interface PredictionMarket {
  id: string;
  question: string;
  probability: number;
  volume: number;
  endDate: string;
  url: string;
}

/* ── Constants ─────────────────────────────────────── */

const RANGES = [
  { key: '1d', label: '1D' },
  { key: '5d', label: '5D' },
  { key: '1mo', label: '1M' },
  { key: '3mo', label: '3M' },
  { key: '6mo', label: '6M' },
  { key: '1y', label: '1Y' },
  { key: '5y', label: '5Y' },
] as const;

const COINS: { pair: string; name: string; symbol: string; icon: string }[] = [
  { pair: 'BTCUSD', name: 'Bitcoin', symbol: 'BTC', icon: '₿' },
  { pair: 'ETHUSD', name: 'Ethereum', symbol: 'ETH', icon: 'Ξ' },
  { pair: 'BNBUSD', name: 'BNB', symbol: 'BNB', icon: '◆' },
  { pair: 'XRPUSD', name: 'XRP', symbol: 'XRP', icon: '✕' },
  { pair: 'SOLUSD', name: 'Solana', symbol: 'SOL', icon: '◎' },
  { pair: 'ADAUSD', name: 'Cardano', symbol: 'ADA', icon: '♦' },
  { pair: 'DOGEUSD', name: 'Dogecoin', symbol: 'DOGE', icon: 'Ð' },
  { pair: 'AVAXUSD', name: 'Avalanche', symbol: 'AVAX', icon: '▲' },
  { pair: 'DOTUSD', name: 'Polkadot', symbol: 'DOT', icon: '●' },
  { pair: 'LINKUSD', name: 'Chainlink', symbol: 'LINK', icon: '⬡' },
  { pair: 'MATICUSD', name: 'Polygon', symbol: 'MATIC', icon: '⬠' },
  { pair: 'UNIUSD', name: 'Uniswap', symbol: 'UNI', icon: '🦄' },
  { pair: 'ATOMUSD', name: 'Cosmos', symbol: 'ATOM', icon: '⚛' },
  { pair: 'LTCUSD', name: 'Litecoin', symbol: 'LTC', icon: 'Ł' },
  { pair: 'BCHUSD', name: 'Bitcoin Cash', symbol: 'BCH', icon: '₿' },
  { pair: 'NEARUSD', name: 'NEAR Protocol', symbol: 'NEAR', icon: 'Ⓝ' },
  { pair: 'XLMUSD', name: 'Stellar', symbol: 'XLM', icon: '✦' },
  { pair: 'ICPUSD', name: 'Internet Computer', symbol: 'ICP', icon: '∞' },
  { pair: 'APTUSD', name: 'Aptos', symbol: 'APT', icon: '◈' },
  { pair: 'SUIUSD', name: 'Sui', symbol: 'SUI', icon: '💧' },
];

const PREDICTION_KEYWORDS = [
  'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'solana', 'sol',
  'xrp', 'dogecoin', 'doge', 'cardano', 'ada', 'defi', 'nft',
  'stablecoin', 'binance', 'coinbase', 'altcoin', 'blockchain',
];

/* ── Crypto Chart (expandable) ─────────────────────── */

function CryptoChart({ pair, name }: { pair: string; name: string }) {
  const [range, setRange] = useState('1y');
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChart = useCallback(async (r: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/fx-chart?pair=${pair}&range=${r}`);
      const data = await res.json();
      setPoints(data.points || []);
    } catch {
      if (!silent) setPoints([]);
    }
    if (!silent) setLoading(false);
  }, [pair]);

  useEffect(() => {
    fetchChart(range);
    const iv = setInterval(() => fetchChart(range, true), 60_000);
    return () => clearInterval(iv);
  }, [range, fetchChart]);

  const first = points[0]?.value;
  const last = points[points.length - 1]?.value;
  const changeAmt = first && last ? last - first : 0;
  const changePct = first ? ((last - first) / first) * 100 : 0;
  const isUp = changeAmt >= 0;
  const color = isUp ? '#16a34a' : '#dc2626';

  const formatXTick = (date: string) => {
    if (range === '1d' || range === '5d') return date.replace(/,.*,/, ',').split(', ').pop() || date;
    const d = new Date(date + 'T12:00:00');
    if (range === '5y') return d.toLocaleDateString('en', { year: '2-digit', month: 'short' });
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="border-t border-[#e8e8e8] bg-[#fafbfc] px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[#333]">{name}</span>
          {points.length > 1 && (
            <span className={`text-[12px] font-mono ${isUp ? 'text-green-600' : 'text-red-600'}`}>
              {isUp ? '+' : ''}${Math.abs(changeAmt).toLocaleString(undefined, { maximumFractionDigits: 2 })} ({isUp ? '+' : ''}{changePct.toFixed(2)}%)
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {RANGES.map(r => (
            <button key={r.key} onClick={() => setRange(r.key)}
              className={`px-2 py-0.5 text-[11px] rounded ${range === r.key ? 'bg-[#0066cc] text-white' : 'bg-white border border-[#ddd] text-[#666] hover:bg-[#f0f0f0]'}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-[200px] flex items-center justify-center text-[#999] text-[12px]">Loading chart...</div>
      ) : points.length < 2 ? (
        <div className="h-[200px] flex items-center justify-center text-[#999] text-[12px]">No chart data</div>
      ) : (
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id={`cryptograd-${pair}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date"
                tickFormatter={(date: string) => {
                  if (points.length > 0 && date === points[points.length - 1].date) return 'Now';
                  return formatXTick(date);
                }}
                tick={{ fontSize: 10, fill: '#999' }} tickLine={false} axisLine={{ stroke: '#e8e8e8' }}
                ticks={(() => {
                  if (points.length <= 2) return undefined;
                  const n = Math.min(10, points.length);
                  const step = Math.floor((points.length - 1) / n);
                  const ticks: string[] = [];
                  for (let i = 0; i < points.length - 1; i += step) ticks.push(points[i].date);
                  ticks.push(points[points.length - 1].date);
                  return ticks;
                })()}
              />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#999' }} tickLine={false} axisLine={false}
                tickFormatter={(v: number) => v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${v.toFixed(2)}`} width={65} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const p = payload[0].payload as ChartPoint;
                const isISO = p.date.match(/^\d{4}-\d{2}-\d{2}$/);
                const dateLabel = isISO ? new Date(p.date + 'T12:00:00').toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' }) : p.date;
                return (
                  <div className="bg-white border border-[#ddd] shadow-lg rounded px-3 py-2 text-[12px]">
                    <div className="text-[#999] mb-0.5">{dateLabel}</div>
                    <div className="font-mono font-semibold text-[14px]">${p.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                );
              }} />
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} fill={`url(#cryptograd-${pair})`} dot={false} activeDot={{ r: 3, fill: color, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/* ── Prediction Card ───────────────────────────────── */

function PredictionCard({ market }: { market: PredictionMarket }) {
  const pct = Math.round(market.probability * 100);
  const vol = market.volume >= 1e6 ? `$${(market.volume / 1e6).toFixed(1)}M` : market.volume >= 1e3 ? `$${(market.volume / 1e3).toFixed(0)}K` : `$${market.volume.toFixed(0)}`;
  const end = market.endDate ? new Date(market.endDate).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '';

  return (
    <a href={market.url} target="_blank" rel="noopener noreferrer"
      className="flex items-center justify-between gap-3 px-3 py-2.5 border border-[#e8e8e8] rounded-lg hover:border-[#ccc] hover:shadow-sm transition group">
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-[#333] font-medium leading-tight truncate group-hover:text-[#0066cc] transition">{market.question}</div>
        <div className="text-[10px] text-[#999] mt-0.5">Vol: {vol}{end ? ` · Resolves ${end}` : ''}</div>
      </div>
      <div className="shrink-0 flex items-center gap-2">
        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct >= 50 ? '#16a34a' : '#dc2626' }} />
        </div>
        <span className="text-[13px] font-bold tabular-nums" style={{ color: pct >= 50 ? '#16a34a' : '#dc2626', minWidth: 36, textAlign: 'right' }}>{pct}%</span>
      </div>
    </a>
  );
}

/* ── Change Span ───────────────────────────────────── */

function ChangeSpan({ value }: { value: number | null }) {
  if (value == null) return <span className="text-[#ccc]">—</span>;
  const color = value >= 0 ? 'text-green-600' : 'text-red-600';
  return <span className={`font-mono ${color}`}>{value >= 0 ? '+' : ''}{value.toFixed(2)}%</span>;
}

/* ── Main Page ─────────────────────────────────────── */

export default function CryptoPage() {
  const [data, setData] = useState<Record<string, CryptoQuote>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictionMarket[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<'price' | 'dayChg' | 'weeklyChg' | 'monthlyChg'>('price');
  const [sortAsc, setSortAsc] = useState(false);

  // Phase 1: fetch prices
  const fetchPrices = useCallback(async () => {
    const results = await Promise.all(
      COINS.map(async c => {
        try {
          const res = await fetch(`/api/fx-chart?pair=${c.pair}&range=1d`);
          const json = await res.json();
          return {
            ...c,
            price: json.regularMarketPrice ?? null,
            previousClose: json.previousClose ?? null,
            marketTime: json.regularMarketTime ?? null,
          };
        } catch {
          return { ...c, price: null, previousClose: null, marketTime: null };
        }
      })
    );
    const d: Record<string, CryptoQuote> = {};
    let latestTime: string | null = null;
    for (const r of results) {
      d[r.pair] = r;
      if (r.marketTime && (!latestTime || r.marketTime > latestTime)) latestTime = r.marketTime;
    }
    setData(d);
    setUpdatedAt(latestTime || new Date().toISOString());
    setLoading(false);
  }, []);

  // Phase 2: backfill weekly/monthly/YTD
  const fetchMultiTimeframe = useCallback(async () => {
    for (const c of COINS) {
      try {
        const res = await fetch(`/api/fx-chart?pair=${c.pair}&range=1y`);
        const json = await res.json();
        const pts: ChartPoint[] = json.points || [];
        const now = json.regularMarketPrice;

        if (now && pts.length > 5) {
          const today = new Date();
          const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7);
          const monthAgo = new Date(today); monthAgo.setMonth(today.getMonth() - 1);
          const yearStart = `${today.getFullYear()}-01-02`;

          const findClosest = (target: string) => {
            let closest = pts[0];
            for (const pt of pts) { if (pt.date <= target) closest = pt; }
            return closest;
          };

          const weekPt = findClosest(weekAgo.toISOString().slice(0, 10));
          const monthPt = findClosest(monthAgo.toISOString().slice(0, 10));
          const ytdPt = findClosest(yearStart);

          setData(prev => ({
            ...prev,
            [c.pair]: {
              ...prev[c.pair],
              weeklyChg: weekPt?.value ? ((now - weekPt.value) / weekPt.value) * 100 : undefined,
              monthlyChg: monthPt?.value ? ((now - monthPt.value) / monthPt.value) * 100 : undefined,
              ytdChg: ytdPt?.value ? ((now - ytdPt.value) / ytdPt.value) * 100 : undefined,
            },
          }));
        }
      } catch { /* skip */ }
    }
  }, []);

  useEffect(() => {
    fetchPrices().then(() => fetchMultiTimeframe());
    const iv = setInterval(fetchPrices, 60_000); // 1 min for crypto
    return () => clearInterval(iv);
  }, [fetchPrices, fetchMultiTimeframe]);

  useEffect(() => {
    fetch('/api/predictions?limit=200')
      .then(r => r.json())
      .then(d => setPredictions(d.markets || []))
      .catch(() => {});
  }, []);

  const cryptoPredictions = predictions.filter(m => {
    const q = m.question.toLowerCase();
    return PREDICTION_KEYWORDS.some(kw => q.includes(kw));
  });

  // BTC headline
  const btc = data['BTCUSD'];
  const eth = data['ETHUSD'];
  const btcChange = (btc?.price && btc?.previousClose) ? ((btc.price - btc.previousClose) / btc.previousClose) * 100 : null;
  const ethChange = (eth?.price && eth?.previousClose) ? ((eth.price - eth.previousClose) / eth.previousClose) * 100 : null;

  // Sort
  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };
  const sortIcon = (key: typeof sortKey) => sortKey !== key ? '' : sortAsc ? ' ↑' : ' ↓';

  const sortedCoins = [...COINS].sort((a, b) => {
    const da = data[a.pair];
    const db = data[b.pair];
    let va = 0, vb = 0;
    if (sortKey === 'price') { va = da?.price ?? 0; vb = db?.price ?? 0; }
    else if (sortKey === 'dayChg') {
      va = (da?.price && da?.previousClose) ? ((da.price - da.previousClose) / da.previousClose) * 100 : 0;
      vb = (db?.price && db?.previousClose) ? ((db.price - db.previousClose) / db.previousClose) * 100 : 0;
    }
    else if (sortKey === 'weeklyChg') { va = da?.weeklyChg ?? 0; vb = db?.weeklyChg ?? 0; }
    else if (sortKey === 'monthlyChg') { va = da?.monthlyChg ?? 0; vb = db?.monthlyChg ?? 0; }
    return sortAsc ? va - vb : vb - va;
  });

  return (
    <main className="min-h-screen bg-white text-[#333]">
      <Nav />

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <MarketsHeader updatedAt={updatedAt} />

        {/* BTC + ETH Headline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border border-[#e8e8e8] rounded-xl p-5 bg-gradient-to-r from-[#fff8f0] to-white">
            <div className="text-[11px] text-[#999] uppercase tracking-wider mb-1">Bitcoin (BTC)</div>
            <div className="flex items-baseline gap-3">
              <span className="text-[28px] font-bold font-mono text-[#333]">
                {btc?.price != null ? `$${btc.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '—'}
              </span>
              {btcChange != null && (
                <span className={`text-[14px] font-mono ${btcChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {btcChange >= 0 ? '+' : ''}{btcChange.toFixed(2)}%
                </span>
              )}
            </div>
            {btc?.ytdChg != null && (
              <div className="text-[11px] text-[#999] mt-1">
                YTD: <span className={btc.ytdChg >= 0 ? 'text-green-600' : 'text-red-600'}>{btc.ytdChg >= 0 ? '+' : ''}{btc.ytdChg.toFixed(1)}%</span>
              </div>
            )}
          </div>
          <div className="border border-[#e8e8e8] rounded-xl p-5 bg-gradient-to-r from-[#f0f4ff] to-white">
            <div className="text-[11px] text-[#999] uppercase tracking-wider mb-1">Ethereum (ETH)</div>
            <div className="flex items-baseline gap-3">
              <span className="text-[28px] font-bold font-mono text-[#333]">
                {eth?.price != null ? `$${eth.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '—'}
              </span>
              {ethChange != null && (
                <span className={`text-[14px] font-mono ${ethChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {ethChange >= 0 ? '+' : ''}{ethChange.toFixed(2)}%
                </span>
              )}
            </div>
            {eth?.ytdChg != null && (
              <div className="text-[11px] text-[#999] mt-1">
                YTD: <span className={eth.ytdChg >= 0 ? 'text-green-600' : 'text-red-600'}>{eth.ytdChg >= 0 ? '+' : ''}{eth.ytdChg.toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#999]">Loading crypto prices...</div>
        ) : (
          <div className="space-y-8">
            {/* Coins Table */}
            <div>
              <h2 className="text-[14px] font-semibold text-[#666] uppercase tracking-wider mb-3">Top 20 Cryptocurrencies</h2>
              <div className="border border-[#e8e8e8] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="text-[11px] text-[#999] uppercase tracking-wider bg-[#f8f9fa] border-b border-[#e8e8e8]">
                      <th className="text-left px-3 py-2">#</th>
                      <th className="text-left px-3 py-2">Name</th>
                      <th className="text-right px-3 py-2">
                        <button onClick={() => handleSort('price')} className="hover:text-[#333]">Price{sortIcon('price')}</button>
                      </th>
                      <th className="text-right px-3 py-2">
                        <button onClick={() => handleSort('dayChg')} className="hover:text-[#333]">24h{sortIcon('dayChg')}</button>
                      </th>
                      <th className="text-right px-3 py-2 hidden md:table-cell">
                        <button onClick={() => handleSort('weeklyChg')} className="hover:text-[#333]">7d{sortIcon('weeklyChg')}</button>
                      </th>
                      <th className="text-right px-3 py-2 hidden md:table-cell">
                        <button onClick={() => handleSort('monthlyChg')} className="hover:text-[#333]">30d{sortIcon('monthlyChg')}</button>
                      </th>
                      <th className="text-right px-3 py-2 hidden lg:table-cell">YTD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCoins.map((coin, i) => {
                      const d = data[coin.pair];
                      const isExpanded = expanded === coin.pair;
                      const dayChg = (d?.price && d?.previousClose) ? ((d.price - d.previousClose) / d.previousClose) * 100 : null;

                      return (
                        <React.Fragment key={coin.pair}>
                          <tr
                            className={`border-b border-[#f0f0f0] hover:bg-[#f5f7fa] transition text-[13px] cursor-pointer ${isExpanded ? 'bg-[#f5f7fa]' : ''}`}
                            onClick={() => setExpanded(isExpanded ? null : coin.pair)}
                          >
                            <td className="px-3 py-2 text-[#999] text-[12px]">{i + 1}</td>
                            <td className="px-3 py-2">
                              <span className="flex items-center gap-2">
                                <span className={`text-[10px] text-[#999] transition-transform inline-block ${isExpanded ? 'rotate-90' : ''}`}>&#9654;</span>
                                <span className="text-[16px] w-5 text-center">{coin.icon}</span>
                                <span className="font-medium">{coin.name}</span>
                                <span className="text-[11px] text-[#999]">{coin.symbol}</span>
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-semibold">
                              {d?.price != null ? `$${d.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                            </td>
                            <td className="px-3 py-2 text-right text-[12px]"><ChangeSpan value={dayChg} /></td>
                            <td className="px-3 py-2 text-right text-[12px] hidden md:table-cell"><ChangeSpan value={d?.weeklyChg ?? null} /></td>
                            <td className="px-3 py-2 text-right text-[12px] hidden md:table-cell"><ChangeSpan value={d?.monthlyChg ?? null} /></td>
                            <td className="px-3 py-2 text-right text-[12px] hidden lg:table-cell"><ChangeSpan value={d?.ytdChg ?? null} /></td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={7} className="p-0">
                                <CryptoChart pair={coin.pair} name={coin.name} />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Prediction Markets */}
            {cryptoPredictions.length > 0 && (
              <div>
                <h2 className="text-[14px] font-semibold text-[#666] uppercase tracking-wider mb-3">
                  &#x1F52E; Crypto Predictions
                </h2>
                <p className="text-[12px] text-[#999] mb-3">
                  Live prediction market odds from <a href="https://polymarket.com" target="_blank" rel="noopener noreferrer" className="text-[#0066cc] hover:underline">Polymarket</a>. Real-money forecasts on crypto prices and events.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {cryptoPredictions.slice(0, 10).map(m => <PredictionCard key={m.id} market={m} />)}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-[11px] text-[#999] mt-6">
          Prices from Yahoo Finance (15-min delayed). Crypto markets trade 24/7.
        </div>
      </div>

      <Footer />
    </main>
  );
}
