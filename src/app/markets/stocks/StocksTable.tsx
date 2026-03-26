'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import MarketsHeader from '../MarketsHeader';
import ExportButton from '@/components/ExportButton';
import StocksHeader from './StocksHeader';
import { COMPANY_NAMES } from './tickers';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

// Finnhub stores some logos under exchange-specific names
const LOGO_OVERRIDES: Record<string, string> = {
  META: 'FB', AZN: 'AZN.L', BMO: 'BMO.TO', BP: 'BP.L', ENB: 'ENB.TO',
  HSBC: 'HSBA.L', NVO: 'NOVO B.CO', RY: 'RY.TO', SAP: 'SAP.DE', SHEL: 'SHEL.L',
  CNXC: '942965499836', CSCO: '950800186156', CNR: 'CNR.TO',
  TD: 'TD.TO', BNS: 'BNS.TO', CM: 'CM.TO', SU: 'SU.TO', TRP: 'TRP.TO',
  CP: 'CP.TO', MFC: 'MFC.TO', SLF: 'SLF.TO', BCE: 'BCE.TO', T: 'T',
  BHP: 'BHP.AX', RIO: 'RIO.L', UL: 'ULVR.L', TM: 'TM', SONY: 'SONY',
  ASML: 'ASML.AS', TSM: 'TSM', BABA: 'BABA', PDD: 'PDD', JD: 'JD',
};

function StockLogo({ ticker, size = 20 }: { ticker: string; size?: number }) {
  const [error, setError] = useState(false);
  if (error) return null;
  const logoKey = LOGO_OVERRIDES[ticker] || ticker;
  return (
    <img
      src={`https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/${encodeURIComponent(logoKey)}.png`}
      alt=""
      width={size}
      height={size}
      className="rounded-sm object-contain"
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}

interface Quote {
  id: string;
  label: string;
  price: number;
  previousClose: number;
  change: number;
  changePct: number;
}

type SortKey = 'label' | 'price' | 'change' | 'changePct';

const RANGES = [
  { key: '1d', label: '1D' },
  { key: '5d', label: '5D' },
  { key: '1mo', label: '1M' },
  { key: '3mo', label: '3M' },
  { key: '6mo', label: '6M' },
  { key: '1y', label: '1Y' },
  { key: '5y', label: '5Y' },
  { key: 'max', label: 'All' },
] as const;

interface ChartPoint { date: string; value: number }

function StockChart({ ticker, name }: { ticker: string; name: string }) {
  const [range, setRange] = useState('1y');
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChart = useCallback(async (r: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/index-chart?ticker=${encodeURIComponent(ticker)}&range=${r}`);
      const data = await res.json();
      setPoints(data.points || []);
    } catch {
      if (!silent) setPoints([]);
    }
    if (!silent) setLoading(false);
  }, [ticker]);

  useEffect(() => {
    fetchChart(range);
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
              {isUp ? '+' : ''}${Math.abs(changeAmt).toFixed(2)} ({isUp ? '+' : ''}{changePct.toFixed(2)}%)
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
                <linearGradient id={`stockgrad-${ticker.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date"
                tickFormatter={(date: string) => {
                  if (points.length > 0 && date === points[points.length - 1].date) return 'Today';
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
                tickFormatter={(v: number) => `$${v.toFixed(0)}`} width={55} />
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
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} fill={`url(#stockgrad-${ticker.replace(/[^a-zA-Z0-9]/g, '')})`} dot={false} activeDot={{ r: 3, fill: color, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

interface StockProfile { sector: string; industry: string; marketCap: number }

// ── Squarified Treemap (Canvas-based, Finviz-style) ──────────────

function getTreemapColor(pct: number): string {
  if (pct <= -3) return '#7a1a1a';
  if (pct <= -2) return '#a02020';
  if (pct <= -1) return '#c03030';
  if (pct <= -0.3) return '#c85050';
  if (pct < 0) return '#a06060';
  if (pct === 0) return '#555';
  if (pct < 0.3) return '#608060';
  if (pct < 1) return '#407040';
  if (pct < 2) return '#306030';
  if (pct < 3) return '#205020';
  return '#184018';
}

interface TreemapStock { ticker: string; name: string; size: number; changePct: number; industry: string }
interface TreemapSector { name: string; children: TreemapStock[]; totalCap: number }
interface Tile { x: number; y: number; w: number; h: number; ticker: string; name: string; changePct: number; sector: string; industry: string; size: number }

// Squarified treemap layout algorithm (Bruls-Huetink-van Wijk)
function squarify(items: { key: string; size: number }[], rect: { x: number; y: number; w: number; h: number }): Map<string, { x: number; y: number; w: number; h: number }> {
  const result = new Map<string, { x: number; y: number; w: number; h: number }>();
  if (items.length === 0 || rect.w <= 0 || rect.h <= 0) return result;

  const totalSize = items.reduce((s, i) => s + i.size, 0);
  if (totalSize <= 0) return result;

  const sorted = [...items].sort((a, b) => b.size - a.size);
  let { x, y, w, h } = rect;

  function layoutRow(row: typeof sorted, rowArea: number, side: number) {
    const rowWidth = rowArea / side;
    let offset = 0;
    for (const item of row) {
      const itemLen = (item.size / rowArea) * side;
      if (w >= h) {
        result.set(item.key, { x: x, y: y + offset, w: rowWidth, h: itemLen });
      } else {
        result.set(item.key, { x: x + offset, y: y, w: itemLen, h: rowWidth });
      }
      offset += itemLen;
    }
    if (w >= h) { x += rowWidth; w -= rowWidth; }
    else { y += rowWidth; h -= rowWidth; }
  }

  function worstRatio(row: typeof sorted, rowArea: number, side: number): number {
    const rowWidth = rowArea / side;
    let worst = 0;
    for (const item of row) {
      const itemLen = (item.size / rowArea) * side;
      const r = Math.max(rowWidth / itemLen, itemLen / rowWidth);
      if (r > worst) worst = r;
    }
    return worst;
  }

  let remaining = sorted.map(item => ({ ...item, size: (item.size / totalSize) * w * h }));

  while (remaining.length > 0) {
    const side = Math.min(w, h);
    if (side <= 0) break;
    const row: typeof remaining = [remaining[0]];
    let rowArea = remaining[0].size;
    let bestRatio = worstRatio(row, rowArea, side);

    let i = 1;
    while (i < remaining.length) {
      const newRow = [...row, remaining[i]];
      const newArea = rowArea + remaining[i].size;
      const newRatio = worstRatio(newRow, newArea, side);
      if (newRatio <= bestRatio) {
        row.push(remaining[i]);
        rowArea = newArea;
        bestRatio = newRatio;
        i++;
      } else break;
    }

    layoutRow(row, rowArea, side);
    remaining = remaining.slice(i);
  }

  return result;
}

// Canvas-based Finviz-style treemap
function StockTreemap({ sectors, profiles: profs }: { sectors: TreemapSector[]; profiles: Record<string, StockProfile> }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = React.useState<Tile | null>(null);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [dims, setDims] = React.useState({ w: 0, h: 640 });
  const tilesRef = React.useRef<Tile[]>([]);
  const headersRef = React.useRef<{ x: number; y: number; w: number; h: number; label: string; type: 'sector' | 'industry' }[]>([]);

  // Observe container width
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      const cr = entries[0].contentRect;
      if (cr.width > 0) setDims({ w: cr.width, h: 640 });
    });
    obs.observe(el);
    setDims({ w: el.clientWidth, h: 640 });
    return () => obs.disconnect();
  }, []);

  // Compute layout
  const { tiles, headers } = React.useMemo(() => {
    if (dims.w <= 0) return { tiles: [] as Tile[], headers: [] as typeof headersRef.current };
    const totalCap = sectors.reduce((s, sec) => s + sec.totalCap, 0);
    const allTiles: Tile[] = [];
    const allHeaders: typeof headersRef.current = [];
    const SECTOR_H = 16;
    const INDUSTRY_H = 12;

    // Lay out sectors as vertical columns (like Finviz)
    let sx = 0;
    for (const sector of sectors) {
      const sectorW = (sector.totalCap / totalCap) * dims.w;
      if (sectorW < 2) { sx += sectorW; continue; }

      // Sector header
      allHeaders.push({ x: sx, y: 0, w: sectorW, h: SECTOR_H, label: sector.name.toUpperCase(), type: 'sector' });

      // Group by industry
      const industries: Record<string, TreemapStock[]> = {};
      for (const s of sector.children) {
        const ind = s.industry || 'Other';
        if (!industries[ind]) industries[ind] = [];
        industries[ind].push(s);
      }
      const industryEntries = Object.entries(industries)
        .map(([name, stocks]) => ({ name, stocks, total: stocks.reduce((s, c) => s + c.size, 0) }))
        .sort((a, b) => b.total - a.total);

      // Squarify industries within the sector column
      const sectorBodyY = SECTOR_H;
      const sectorBodyH = dims.h - SECTOR_H;
      const indLayout = squarify(
        industryEntries.map(ie => ({ key: ie.name, size: ie.total })),
        { x: sx, y: sectorBodyY, w: sectorW, h: sectorBodyH }
      );

      for (const ie of industryEntries) {
        const indRect = indLayout.get(ie.name);
        if (!indRect || indRect.w < 2 || indRect.h < 2) continue;

        // Industry sub-header (only if big enough)
        const showIndHeader = indRect.w > 50 && indRect.h > 30;
        const indHeaderH = showIndHeader ? INDUSTRY_H : 0;
        if (showIndHeader) {
          const shortName = ie.name.replace(/-/g, ' - ').toUpperCase();
          allHeaders.push({ x: indRect.x, y: indRect.y, w: indRect.w, h: indHeaderH, label: shortName, type: 'industry' });
        }

        // Squarify stocks within industry
        const stockRect = { x: indRect.x, y: indRect.y + indHeaderH, w: indRect.w, h: indRect.h - indHeaderH };
        const stockLayout = squarify(
          ie.stocks.map(s => ({ key: s.ticker, size: s.size })),
          stockRect
        );

        for (const stock of ie.stocks) {
          const r = stockLayout.get(stock.ticker);
          if (!r || r.w < 1 || r.h < 1) continue;
          allTiles.push({ ...r, ticker: stock.ticker, name: stock.name, changePct: stock.changePct, sector: sector.name, industry: ie.name, size: stock.size });
        }
      }

      sx += sectorW;
    }

    return { tiles: allTiles, headers: allHeaders };
  }, [sectors, dims]);

  // Store in refs for mouse handler
  React.useEffect(() => { tilesRef.current = tiles; headersRef.current = headers; }, [tiles, headers]);

  // Draw canvas
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dims.w <= 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dims.w * dpr;
    canvas.height = dims.h * dpr;
    canvas.style.width = `${dims.w}px`;
    canvas.style.height = `${dims.h}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = '#181818';
    ctx.fillRect(0, 0, dims.w, dims.h);

    // Draw tiles
    for (const tile of tiles) {
      ctx.fillStyle = getTreemapColor(tile.changePct);
      ctx.fillRect(tile.x, tile.y, tile.w, tile.h);

      // Border
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1;
      ctx.strokeRect(tile.x + 0.5, tile.y + 0.5, tile.w - 1, tile.h - 1);

      // Hover highlight
      if (hovered && hovered.ticker === tile.ticker) {
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(tile.x, tile.y, tile.w, tile.h);
      }

      // Adaptive text
      const area = tile.w * tile.h;
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (area > 15000 && tile.w > 45 && tile.h > 30) {
        const fs = Math.min(15, tile.w / 4.5, tile.h / 3.5);
        ctx.font = `bold ${fs}px system-ui, -apple-system, sans-serif`;
        ctx.fillText(tile.ticker, tile.x + tile.w / 2, tile.y + tile.h / 2 - fs * 0.5);
        ctx.globalAlpha = 0.8;
        ctx.font = `${fs * 0.75}px system-ui, -apple-system, sans-serif`;
        ctx.fillText(`${tile.changePct >= 0 ? '+' : ''}${tile.changePct.toFixed(2)}%`, tile.x + tile.w / 2, tile.y + tile.h / 2 + fs * 0.45);
        ctx.globalAlpha = 1;
      } else if (area > 3000 && tile.w > 25 && tile.h > 16) {
        const fs = Math.min(10, tile.w / 4, tile.h / 2.2);
        ctx.font = `bold ${fs}px system-ui, -apple-system, sans-serif`;
        ctx.fillText(tile.ticker, tile.x + tile.w / 2, tile.y + tile.h / 2);
      }
    }

    // Draw sector headers
    for (const h of headers) {
      if (h.type === 'sector') {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(h.x, h.y, h.w, h.h);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(h.x, h.y, h.w, h.h);
        if (h.w > 30) {
          ctx.fillStyle = '#bbb';
          ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(h.label, h.x + 4, h.y + h.h / 2, h.w - 8);
        }
      } else {
        // Industry sub-header — subtle overlay
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(h.x, h.y, h.w, h.h);
        if (h.w > 40) {
          ctx.fillStyle = '#999';
          ctx.font = '7px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(h.label, h.x + 3, h.y + h.h / 2, h.w - 6);
        }
      }
    }

    // Sector borders (thicker)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    let bx = 0;
    const totalCap = sectors.reduce((s, sec) => s + sec.totalCap, 0);
    for (const sector of sectors) {
      const sw = (sector.totalCap / totalCap) * dims.w;
      ctx.strokeRect(bx, 0, sw, dims.h);
      bx += sw;
    }
  }, [tiles, headers, hovered, dims, sectors]);

  // Mouse handler
  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setMousePos({ x: e.clientX, y: e.clientY });
    const hit = tilesRef.current.find(t => mx >= t.x && mx <= t.x + t.w && my >= t.y && my <= t.y + t.h);
    setHovered(hit || null);
  }, []);

  return (
    <div ref={containerRef}>
      {/* Color legend */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#111] text-[10px] text-[#888]">
        <span>Size = market cap · Color = daily change</span>
        <div className="flex items-center gap-0">
          <span className="mr-1.5 text-[#ef5350]">-3%</span>
          {[
            { c: '#7a1a1a', l: '-3%' }, { c: '#a02020', l: '-2%' }, { c: '#c03030', l: '-1%' },
            { c: '#555', l: '0%' },
            { c: '#407040', l: '+1%' }, { c: '#306030', l: '+2%' }, { c: '#205020', l: '+3%' },
          ].map((s, i) => (
            <div key={i} style={{ backgroundColor: s.c, width: 28, height: 14 }} className="flex items-center justify-center text-[8px] text-white/70">{s.l}</div>
          ))}
          <span className="ml-1.5 text-[#4caf50]">+3%</span>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(null)}
        className="block cursor-pointer"
        style={{ width: dims.w, height: dims.h }}
      />

      {/* Sector legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 px-3 py-2 bg-[#111] border-t border-[#2a2a2a]">
        {sectors.map(s => (
          <span key={s.name} className="text-[10px] text-[#777] uppercase tracking-wider">
            {s.name} <span className="text-[#555]">({s.children.length})</span>
          </span>
        ))}
      </div>

      {/* Tooltip */}
      {hovered && (
        <div
          className="fixed z-[200] bg-[#1a1a1a] border border-[#444] shadow-2xl rounded px-4 py-3 text-[13px] min-w-[200px] pointer-events-none"
          style={{ left: mousePos.x + 14, top: mousePos.y - 14 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-[16px] text-white">{hovered.ticker}</span>
            <span className="text-[#888] text-[12px]">{hovered.name}</span>
          </div>
          <div className="text-[#666] text-[11px] mb-2">{hovered.sector} · {hovered.industry}</div>
          <div className="flex items-center justify-between border-t border-[#333] pt-2">
            <span className={`font-mono font-bold text-[18px] ${hovered.changePct >= 0 ? 'text-[#4caf50]' : 'text-[#ef5350]'}`}>
              {hovered.changePct >= 0 ? '+' : ''}{hovered.changePct.toFixed(2)}%
            </span>
            <span className="text-[#666] text-[12px] font-mono">${(hovered.size / 1e9).toFixed(0)}B</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StocksTable({ tickers, title }: { tickers: string[]; title: string }) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('changePct');
  const [sortAsc, setSortAsc] = useState(false);
  const [profiles, setProfiles] = useState<Record<string, StockProfile>>({});

  const tickerSet = useMemo(() => new Set(tickers), [tickers]);

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

  // Fetch stock profiles (sector/market cap) for treemap
  useEffect(() => {
    fetch('/api/stock-profiles')
      .then(r => r.json())
      .then(data => { if (data && typeof data === 'object' && !data.error) setProfiles(data); })
      .catch(() => {});
  }, []);

  // Build treemap data grouped by sector → industry
  const treemapData = useMemo(() => {
    const sectors: Record<string, TreemapStock[]> = {};
    for (const q of quotes) {
      if (!q.id.startsWith('YF.STOCK.')) continue;
      const ticker = q.id.replace('YF.STOCK.', '');
      if (!tickerSet.has(ticker)) continue;
      const profile = profiles[ticker];
      if (!profile || !profile.marketCap) continue;
      const sector = profile.sector || 'Other';
      if (!sectors[sector]) sectors[sector] = [];
      sectors[sector].push({
        ticker,
        name: COMPANY_NAMES[ticker] || ticker,
        size: profile.marketCap,
        changePct: q.changePct,
        industry: profile.industry || '',
      });
    }
    return Object.entries(sectors)
      .map(([sector, children]) => ({
        name: sector,
        children: children.sort((a, b) => b.size - a.size),
        totalCap: children.reduce((s, c) => s + c.size, 0),
      }))
      .sort((a, b) => {
        const aSize = a.children.reduce((sum, c) => sum + c.size, 0);
        const bSize = b.children.reduce((sum, c) => sum + c.size, 0);
        return bSize - aSize;
      });
  }, [quotes, profiles, tickerSet]);

  const stockQuotes = useMemo(() => {
    let list = quotes.filter(q => {
      if (!q.id.startsWith('YF.STOCK.')) return false;
      const ticker = q.id.replace('YF.STOCK.', '');
      return tickerSet.has(ticker);
    });

    if (search) {
      const s = search.toUpperCase();
      list = list.filter(q => {
        const name = COMPANY_NAMES[q.label] || '';
        return q.label.toUpperCase().includes(s) || name.toUpperCase().includes(s);
      });
    }

    list.sort((a, b) => {
      if (sortKey === 'label') {
        return sortAsc ? a.label.localeCompare(b.label) : b.label.localeCompare(a.label);
      }
      const aVal = (a as any)[sortKey] as number;
      const bVal = (b as any)[sortKey] as number;
      return sortAsc ? aVal - bVal : bVal - aVal;
    });

    return list;
  }, [quotes, search, sortKey, sortAsc, tickerSet]);

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
        <StocksHeader />

        {loading ? (
          <div className="text-center py-20 text-[#999]">Loading {title} data...</div>
        ) : stockQuotes.length === 0 ? (
          <div className="text-center py-20 text-[#999]">No {title} data yet. ETL job may still be running its first fetch.</div>
        ) : (
          <>
            {/* Gainers / Losers */}
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

            {/* Treemap */}
            {treemapData.length > 0 && (
              <div className="rounded-lg overflow-hidden bg-[#181818] mb-6">
                <StockTreemap sectors={treemapData} profiles={profiles} />
              </div>
            )}

            {/* Search + Export */}
            <div className="flex flex-wrap gap-3 mb-4">
              <input
                type="text"
                placeholder="Search ticker..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-white border border-[#e8e8e8] rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-[#0066cc] transition w-48"
              />
              <span className="text-[12px] text-[#999] self-center ml-auto flex items-center gap-3">
                {stockQuotes.length} stocks
                <ExportButton
                  filename={`sotw-${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}`}
                  getData={() => ({
                    headers: ['Ticker', 'Company', 'Price', 'Prev Close', 'Change', '% Change'],
                    rows: stockQuotes.map(q => [
                      q.label, COMPANY_NAMES[q.label] || '', q.price, q.previousClose, q.change, q.changePct,
                    ]),
                  })}
                />
              </span>
            </div>

            {/* Table */}
            <div className="border border-[#e8e8e8] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-[11px] text-[#999] uppercase tracking-wider bg-[#f8f9fa] border-b border-[#e8e8e8]">
                    <th className="text-left px-3 py-2">
                      <button onClick={() => handleSort('label')} className="hover:text-[#333]">Ticker{sortIcon('label')}</button>
                    </th>
                    <th className="text-left px-3 py-2 hidden md:table-cell">Name</th>
                    <th className="text-right px-3 py-2">
                      <button onClick={() => handleSort('price')} className="hover:text-[#333]">Price{sortIcon('price')}</button>
                    </th>
                    <th className="text-right px-3 py-2 hidden sm:table-cell">Prev Close</th>
                    <th className="text-right px-3 py-2">
                      <button onClick={() => handleSort('change')} className="hover:text-[#333]">Change{sortIcon('change')}</button>
                    </th>
                    <th className="text-right px-3 py-2">
                      <button onClick={() => handleSort('changePct')} className="hover:text-[#333]">% Change{sortIcon('changePct')}</button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stockQuotes.map((q, i) => {
                    const color = q.change >= 0 ? 'text-[#2ecc40]' : 'text-[#e74c3c]';
                    const sign = q.change >= 0 ? '+' : '';
                    const isExpanded2 = expanded === q.label;
                    return (
                      <React.Fragment key={q.id}>
                        <tr
                          className={`border-b border-[#f0f0f0] hover:bg-[#f5f7fa] transition text-[13px] cursor-pointer ${isExpanded2 ? 'bg-[#f5f7fa]' : i % 2 ? 'bg-[#fafbfc]' : ''}`}
                          onClick={() => setExpanded(isExpanded2 ? null : q.label)}
                        >
                          <td className="px-3 py-2 font-semibold">
                            <span className="flex items-center gap-1.5">
                              <span className={`text-[10px] text-[#999] transition-transform inline-block ${isExpanded2 ? 'rotate-90' : ''}`}>&#9654;</span>
                              <StockLogo ticker={q.label} size={18} />
                              {q.label}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-[12px] text-[#666] hidden md:table-cell">{COMPANY_NAMES[q.label] || ''}</td>
                          <td className="px-3 py-2 text-right font-mono font-semibold">
                            ${q.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-[12px] text-[#999] hidden sm:table-cell">
                            ${q.previousClose.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className={`px-3 py-2 text-right font-mono text-[12px] ${color}`}>{sign}{q.change.toFixed(2)}</td>
                          <td className={`px-3 py-2 text-right font-mono text-[12px] font-semibold ${color}`}>{sign}{q.changePct.toFixed(2)}%</td>
                        </tr>
                        {isExpanded2 && (
                          <tr>
                            <td colSpan={6} className="p-0">
                              <StockChart ticker={q.label} name={COMPANY_NAMES[q.label] || q.label} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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
