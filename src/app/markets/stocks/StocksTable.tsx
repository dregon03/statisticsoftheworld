'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import MarketsHeader from '../MarketsHeader';
import ExportButton from '@/components/ExportButton';
import AnimatedPrice from '@/components/AnimatedPrice';
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

// Finnhub stores some logos under exchange-specific names.
// For .TO and .L tickers, Finnhub often uses the ticker as-is or a variant.
// We use clearbit logo API as fallback for companies Finnhub doesn't cover.
const LOGO_OVERRIDES: Record<string, string> = {
  META: 'FB', AZN: 'AZN.L', BMO: 'BMO.TO', BP: 'BP.L', ENB: 'ENB.TO',
  HSBC: 'HSBA.L', NVO: 'NOVO B.CO', RY: 'RY.TO', SAP: 'SAP.DE', SHEL: 'SHEL.L',
  CNXC: '942965499836', CSCO: '950800186156', CNR: 'CNR.TO',
  TD: 'TD.TO', BNS: 'BNS.TO', CM: 'CM.TO', SU: 'SU.TO', TRP: 'TRP.TO',
  CP: 'CP.TO', MFC: 'MFC.TO', SLF: 'SLF.TO', BCE: 'BCE.TO', T: 'T',
  BHP: 'BHP.AX', RIO: 'RIO.L', UL: 'ULVR.L', TM: 'TM', SONY: 'SONY',
  ASML: 'ASML.AS', TSM: 'TSM', BABA: 'BABA', PDD: 'PDD', JD: 'JD',
};

// Clearbit logo fallback: ticker → company domain
const CLEARBIT_DOMAINS: Record<string, string> = {
  // TSX 60
  'RY.TO': 'rbc.com', 'TD.TO': 'td.com', 'BNS.TO': 'scotiabank.com', 'BMO.TO': 'bmo.com',
  'CM.TO': 'cibc.com', 'ENB.TO': 'enbridge.com', 'CNR.TO': 'cn.ca', 'CP.TO': 'cpkcr.com',
  'TRP.TO': 'tcenergy.com', 'SU.TO': 'suncor.com', 'CNQ.TO': 'cnrl.com', 'MFC.TO': 'manulife.com',
  'SLF.TO': 'sunlife.com', 'BCE.TO': 'bce.ca', 'T.TO': 'telus.com', 'ABX.TO': 'barrick.com',
  'NTR.TO': 'nutrien.com', 'FNV.TO': 'franco-nevada.com', 'CSU.TO': 'csisoftware.com',
  'SHOP.TO': 'shopify.com', 'ATD.TO': 'couche-tard.com', 'WCN.TO': 'wasteconnections.com',
  'IFC.TO': 'intactfc.com', 'QSR.TO': 'rbi.com', 'DOL.TO': 'dollarama.com',
  'SAP.TO': 'saputo.com', 'GIB-A.TO': 'cgi.com', 'WSP.TO': 'wsp.com', 'CCO.TO': 'cameco.com',
  'TRI.TO': 'thomsonreuters.com', 'BAM.TO': 'brookfield.com', 'BN.TO': 'bn.brookfield.com',
  'POW.TO': 'powercorporation.com', 'FFH.TO': 'fairfax.ca', 'GWO.TO': 'greatwestlifeco.com',
  'IAG.TO': 'ia.ca', 'NA.TO': 'nbc.ca', 'EMA.TO': 'emera.com', 'FTS.TO': 'fortisinc.com',
  'AQN.TO': 'algonquinpower.com', 'H.TO': 'hydroone.com', 'MG.TO': 'magna.com',
  'L.TO': 'loblaw.ca', 'CTC-A.TO': 'canadiantire.ca', 'WPM.TO': 'wheatonpm.com',
  'AEM.TO': 'agnicoeagle.com', 'K.TO': 'kinross.com', 'FM.TO': 'first-quantum.com',
  'IMO.TO': 'imperialoil.ca', 'CVE.TO': 'cenovus.com', 'HSE.TO': 'huskyenergy.com',
  'PPL.TO': 'pembina.com', 'IPL.TO': 'interpipeline.com', 'KEY.TO': 'keyera.com',
  'GFL.TO': 'gflenv.com', 'TFII.TO': 'tfiintl.com', 'STN.TO': 'stantec.com',
  'OTEX.TO': 'opentext.com', 'BB.TO': 'blackberry.com', 'LSPD.TO': 'lightspeedhq.com',
  // FTSE 100
  'III.L': '3i.com', 'ADM.L': 'admiralgroup.co.uk', 'AAF.L': 'airtel.in',
  'AAL.L': 'angloamerican.com', 'ANTO.L': 'antofagasta.co.uk', 'AHT.L': 'ashtead-group.com',
  'ABF.L': 'abf.co.uk', 'AZN.L': 'astrazeneca.com', 'AUTO.L': 'autotrader.co.uk',
  'AVV.L': 'aveva.com', 'AV.L': 'aviva.com', 'BME.L': 'bmstores.co.uk',
  'BA.L': 'baesystems.com', 'BARC.L': 'barclays.co.uk', 'BDEV.L': 'barrattdevelopments.co.uk',
  'BEZ.L': 'beazley.com', 'BKG.L': 'berkeleygroup.co.uk', 'BP.L': 'bp.com',
  'BATS.L': 'bat.com', 'BLND.L': 'britishland.com', 'BT-A.L': 'bt.com',
  'BNZL.L': 'bunzl.com', 'BRBY.L': 'burberry.com', 'CCH.L': 'coca-colahellenic.com',
  'CPG.L': 'compass-group.com', 'CNA.L': 'centrica.com', 'CRH.L': 'crh.com',
  'CRDA.L': 'croda.com', 'DCC.L': 'dcc.ie', 'DGE.L': 'diageo.com',
  'DPLM.L': 'diplomaplc.com', 'EDV.L': 'endeavourmining.com', 'ENT.L': 'entaingroup.com',
  'EXPN.L': 'experian.com', 'FRAS.L': 'frasers.group', 'FRES.L': 'fresnilloplc.com',
  'GLEN.L': 'glencore.com', 'GSK.L': 'gsk.com', 'HLN.L': 'haleon.com',
  'HLMA.L': 'halma.com', 'HSBA.L': 'hsbc.com', 'IHG.L': 'ihgplc.com',
  'IMB.L': 'imperialbrandsplc.com', 'INF.L': 'informa.com', 'ITV.L': 'itvplc.com',
  'JD.L': 'jdplc.com', 'KGF.L': 'kingfisher.com', 'LAND.L': 'landsecurities.com',
  'LGEN.L': 'legalandgeneralgroup.com', 'LLOY.L': 'lloydsbankinggroup.com',
  'LSEG.L': 'lseg.com', 'MNG.L': 'mandg.com', 'MRO.L': 'melroseplc.net',
  'MNDI.L': 'mondigroup.com', 'NG.L': 'nationalgrid.com', 'NWG.L': 'natwestgroup.com',
  'NXT.L': 'nextplc.co.uk', 'OCDO.L': 'ocadogroup.com', 'PSON.L': 'pearson.com',
  'PSN.L': 'persimmonhomes.com', 'PHNX.L': 'thephoenixgroup.com', 'PRU.L': 'prudential.co.uk',
  'RKT.L': 'reckitt.com', 'REL.L': 'relx.com', 'RIO.L': 'riotinto.com',
  'RMV.L': 'rightmove.co.uk', 'RR.L': 'rolls-royce.com', 'RS1.L': 'rsgroup.com',
  'RTO.L': 'rentokil-initial.com', 'SAG.L': 'sage.com', 'SBRY.L': 'sainsburys.co.uk',
  'SDR.L': 'schroders.com', 'SGE.L': 'sage.com', 'SGRO.L': 'segro.com',
  'SHEL.L': 'shell.com', 'SJP.L': 'sjp.co.uk', 'SKG.L': 'smurfitkappa.com',
  'SMIN.L': 'smiths.com', 'SMT.L': 'bailliegifford.com', 'SN.L': 'smith-nephew.com',
  'SPX.L': 'spiraxgroup.com', 'SSE.L': 'sse.com', 'STAN.L': 'sc.com',
  'SVT.L': 'severntrent.com', 'TSCO.L': 'tescoplc.com', 'TW.L': 'taylorwimpey.co.uk',
  'ULVR.L': 'unilever.com', 'UTG.L': 'unitegroup.com', 'UU.L': 'unitedutilities.com',
  'VOD.L': 'vodafone.com', 'WEIR.L': 'global.weir', 'WPP.L': 'wpp.com',
  'WTB.L': 'whitbread.co.uk',
};

function StockLogo({ ticker, size = 20 }: { ticker: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(() => {
    const logoKey = LOGO_OVERRIDES[ticker] || ticker;
    return `https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/${encodeURIComponent(logoKey)}.png`;
  });

  if (!src) return null;

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className="rounded-sm object-contain"
      onError={() => {
        const domain = CLEARBIT_DOMAINS[ticker];
        if (domain && src.includes('finnhub')) {
          // Try Google favicon as fallback
          setSrc(`https://www.google.com/s2/favicons?domain=${domain}&sz=${size * 2}`);
        } else {
          setSrc(null);
        }
      }}
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
  { key: 'ytd', label: 'YTD' },
  { key: '1y', label: '1Y' },
  { key: '2y', label: '2Y' },
  { key: '5y', label: '5Y' },
  { key: '10y', label: '10Y' },
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
    if (range === '1d') {
      // Extract time like "10:30 AM" from intraday string
      const m = date.match(/(\d{1,2}:\d{2}\s*[AP]M)/i);
      return m ? m[1] : date.split(', ').pop() || date;
    }
    if (range === '5d') {
      // Show "Mon 10AM" style for 5-day
      const m = date.match(/([A-Z][a-z]{2})\s+\d+,?\s*(\d{1,2}:\d{2}\s*[AP]M)/i);
      if (m) return `${m[1]} ${m[2]}`;
      return date.split(', ').pop() || date;
    }
    const d = new Date(date + 'T12:00:00');
    if (range === '1mo') return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    if (range === '3mo' || range === '6mo' || range === 'ytd') return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    if (range === '1y' || range === '2y') return d.toLocaleDateString('en', { year: '2-digit', month: 'short' });
    if (range === '5y' || range === '10y') return d.toLocaleDateString('en', { year: 'numeric' });
    if (range === 'max') return d.getFullYear().toString();
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="border-t border-[#d5dce6] bg-[#fafbfd] px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-[#0d1b2a]">{name}</span>
          {points.length > 1 && (
            <span className={`text-[14px] font-mono ${isUp ? 'text-green-600' : 'text-red-600'}`}>
              {isUp ? '+' : ''}${Math.abs(changeAmt).toFixed(2)} ({isUp ? '+' : ''}{changePct.toFixed(2)}%)
            </span>
          )}
        </div>
        <div className="flex gap-1 flex-wrap">
          {RANGES.map(r => (
            <button key={r.key} onClick={() => setRange(r.key)}
              className={`px-2 py-0.5 text-[15px] rounded ${range === r.key ? 'bg-[#0d1b2a] text-white' : 'bg-white border border-[#ddd] text-[#64748b] hover:bg-[#f0f0f0]'}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-[200px] flex items-center justify-center text-[#64748b] text-[14px]">Loading chart...</div>
      ) : points.length < 2 ? (
        <div className="h-[200px] flex items-center justify-center text-[#64748b] text-[14px]">No chart data</div>
      ) : (() => {
        const vals = points.map(p => p.value).filter(v => v > 0);
        const minVal = Math.min(...vals);
        const maxVal = Math.max(...vals);
        const useLog = (range === 'max' || range === '10y') && maxVal / minVal > 10;
        const chartData = useLog
          ? points.filter(p => p.value > 0).map(p => ({ ...p, logValue: Math.log10(p.value) }))
          : points;
        const logTicks = (() => {
          if (!useLog) return undefined;
          const ticks: number[] = [];
          const bases = [1, 2, 5];
          let mag = Math.pow(10, Math.floor(Math.log10(minVal)));
          while (mag <= maxVal * 2) {
            for (const b of bases) {
              const v = mag * b;
              if (v >= minVal * 0.5 && v <= maxVal * 2) ticks.push(Math.log10(v));
            }
            mag *= 10;
          }
          return ticks;
        })();
        const fmtPrice = (v: number) => v >= 10000 ? `$${(v/1000).toFixed(0)}K` : v >= 1000 ? `$${(v/1000).toFixed(1)}K` : `$${v.toFixed(2)}`;
        return (
        <div className="h-[200px]">
          {useLog && <div className="text-[9px] text-[#94a3b8] text-right pr-2 -mb-1">log scale</div>}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id={`stockgrad-${ticker.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date"
                tickFormatter={(date: string) => {
                  if (chartData.length > 0 && date === chartData[chartData.length - 1].date) return 'Today';
                  return formatXTick(date);
                }}
                tick={{ fontSize: 10, fill: '#999' }} tickLine={false} axisLine={{ stroke: '#e8e8e8' }}
                ticks={(() => {
                  if (chartData.length <= 2) return undefined;
                  const n = Math.min(10, chartData.length);
                  const step = Math.floor((chartData.length - 1) / n);
                  const ticks: string[] = [];
                  for (let i = 0; i < chartData.length - 1; i += step) ticks.push(chartData[i].date);
                  ticks.push(chartData[chartData.length - 1].date);
                  return ticks;
                })()}
              />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#999' }} tickLine={false} axisLine={false}
                tickFormatter={(v: number) => useLog ? fmtPrice(Math.pow(10, v)) : fmtPrice(v)}
                ticks={logTicks} width={60}
                label={{ value: 'USD', position: 'insideTopLeft', offset: -5, style: { fontSize: 9, fill: '#94a3b8' } }} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const p = payload[0].payload as ChartPoint & { logValue?: number };
                const isISO = p.date.match(/^\d{4}-\d{2}-\d{2}$/);
                const dateLabel = isISO ? new Date(p.date + 'T12:00:00').toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' }) : p.date;
                return (
                  <div className="bg-white border border-[#ddd] shadow-lg rounded px-3 py-2 text-[14px]">
                    <div className="text-[#64748b] mb-0.5">{dateLabel}</div>
                    <div className="font-mono font-semibold text-[14px]">${p.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                );
              }} />
              <Area type="monotone" dataKey={useLog ? 'logValue' : 'value'} stroke={color} strokeWidth={1.5} fill={`url(#stockgrad-${ticker.replace(/[^a-zA-Z0-9]/g, '')})`} dot={false} activeDot={{ r: 3, fill: color, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        );
      })()}
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
  // Taller canvas when more stocks — ensures all tiles are visible
  const stockCount = sectors.reduce((s, sec) => s + sec.children.length, 0);
  const canvasH = stockCount > 200 ? 900 : stockCount > 100 ? 750 : 640;
  const [dims, setDims] = React.useState({ w: 0, h: canvasH });
  const tilesRef = React.useRef<Tile[]>([]);
  const headersRef = React.useRef<{ x: number; y: number; w: number; h: number; label: string; type: 'sector' | 'industry' }[]>([]);

  // Observe container width
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      const cr = entries[0].contentRect;
      if (cr.width > 0) setDims({ w: cr.width, h: canvasH });
    });
    obs.observe(el);
    setDims({ w: el.clientWidth, h: canvasH });
    return () => obs.disconnect();
  }, [canvasH]);

  // Compute layout
  const { tiles, headers } = React.useMemo(() => {
    if (dims.w <= 0) return { tiles: [] as Tile[], headers: [] as typeof headersRef.current };
    const allTiles: Tile[] = [];
    const allHeaders: typeof headersRef.current = [];
    const SECTOR_H = 16;
    const INDUSTRY_H = 12;

    // Use squarify for sectors (not vertical columns) — gives small sectors visible area
    const sectorLayout = squarify(
      sectors.map(sec => ({ key: sec.name, size: sec.totalCap })),
      { x: 0, y: 0, w: dims.w, h: dims.h }
    );

    for (const sector of sectors) {
      const sectorRect = sectorLayout.get(sector.name);
      if (!sectorRect || sectorRect.w < 2 || sectorRect.h < 2) continue;

      // Sector header
      const showSectorHeader = sectorRect.h > 20;
      const sectorHeaderH = showSectorHeader ? SECTOR_H : 0;
      if (showSectorHeader) {
        allHeaders.push({ x: sectorRect.x, y: sectorRect.y, w: sectorRect.w, h: sectorHeaderH, label: sector.name.toUpperCase(), type: 'sector' });
      }

      const bodyRect = { x: sectorRect.x, y: sectorRect.y + sectorHeaderH, w: sectorRect.w, h: sectorRect.h - sectorHeaderH };

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

      // Squarify industries within sector
      const indLayout = squarify(
        industryEntries.map(ie => ({ key: ie.name, size: ie.total })),
        bodyRect
      );

      for (const ie of industryEntries) {
        const indRect = indLayout.get(ie.name);
        if (!indRect || indRect.w < 1 || indRect.h < 1) continue;

        // Industry sub-header (only if big enough)
        const showIndHeader = indRect.w > 50 && indRect.h > 30;
        const indHeaderH = showIndHeader ? INDUSTRY_H : 0;
        if (showIndHeader) {
          const shortName = ie.name.replace(/-/g, ' - ').toUpperCase();
          allHeaders.push({ x: indRect.x, y: indRect.y, w: indRect.w, h: indHeaderH, label: shortName, type: 'industry' });
        }

        // Squarify stocks within industry — enforce minimum size so all companies are visible
        const stockRect = { x: indRect.x, y: indRect.y + indHeaderH, w: indRect.w, h: indRect.h - indHeaderH };
        const indTotalCap = ie.stocks.reduce((s, c) => s + c.size, 0);
        const minFraction = 0.02;
        const minSize = indTotalCap * minFraction;
        const stockLayout = squarify(
          ie.stocks.map(s => ({ key: s.ticker, size: Math.max(s.size, minSize) })),
          stockRect
        );

        for (const stock of ie.stocks) {
          const r = stockLayout.get(stock.ticker);
          if (!r) continue;
          allTiles.push({ ...r, ticker: stock.ticker, name: stock.name, changePct: stock.changePct, sector: sector.name, industry: ie.name, size: stock.size });
        }
      }
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

      // Adaptive text — show ticker on ALL tiles
      const area = tile.w * tile.h;
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (area > 15000 && tile.w > 45 && tile.h > 30) {
        // Large tile: ticker + change%
        const fs = Math.min(15, tile.w / 4.5, tile.h / 3.5);
        ctx.font = `bold ${fs}px system-ui, -apple-system, sans-serif`;
        ctx.fillText(tile.ticker, tile.x + tile.w / 2, tile.y + tile.h / 2 - fs * 0.5);
        ctx.globalAlpha = 0.8;
        ctx.font = `${fs * 0.75}px system-ui, -apple-system, sans-serif`;
        ctx.fillText(`${tile.changePct >= 0 ? '+' : ''}${tile.changePct.toFixed(2)}%`, tile.x + tile.w / 2, tile.y + tile.h / 2 + fs * 0.45);
        ctx.globalAlpha = 1;
      } else if (area > 3000 && tile.w > 25 && tile.h > 16) {
        // Medium tile: ticker only
        const fs = Math.min(10, tile.w / 4, tile.h / 2.2);
        ctx.font = `bold ${fs}px system-ui, -apple-system, sans-serif`;
        ctx.fillText(tile.ticker, tile.x + tile.w / 2, tile.y + tile.h / 2);
      } else if (tile.w > 12 && tile.h > 8) {
        // Small tile: tiny ticker, clipped
        const fs = Math.min(7, tile.w / 3.5, tile.h / 1.5);
        if (fs >= 4) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(tile.x, tile.y, tile.w, tile.h);
          ctx.clip();
          ctx.globalAlpha = 0.85;
          ctx.font = `bold ${fs}px system-ui, -apple-system, sans-serif`;
          ctx.fillText(tile.ticker, tile.x + tile.w / 2, tile.y + tile.h / 2);
          ctx.globalAlpha = 1;
          ctx.restore();
        }
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

    // Sector borders (thicker) — draw around squarified sector rects
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    for (const h of headers) {
      if (h.type !== 'sector') continue;
      const sectorTiles = tiles.filter(t => t.sector.toUpperCase() === h.label);
      if (sectorTiles.length === 0) continue;
      const minX = Math.min(h.x, ...sectorTiles.map(t => t.x));
      const minY = h.y;
      const maxX = Math.max(h.x + h.w, ...sectorTiles.map(t => t.x + t.w));
      const maxY = Math.max(...sectorTiles.map(t => t.y + t.h));
      ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
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
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#111] text-[14px] text-[#888]">
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
          <span key={s.name} className="text-[14px] text-[#777] uppercase tracking-wider">
            {s.name} <span className="text-[#555]">({s.children.length})</span>
          </span>
        ))}
      </div>

      {/* Tooltip */}
      {hovered && (
        <div
          className="fixed z-[200] bg-[#1a1a1a] border border-[#444] shadow-2xl rounded px-4 py-3 text-[15px] min-w-[200px] pointer-events-none"
          style={{ left: mousePos.x + 14, top: mousePos.y - 14 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-[16px] text-white">{hovered.ticker}</span>
            <span className="text-[#888] text-[14px]">{hovered.name}</span>
          </div>
          <div className="text-[#64748b] text-[15px] mb-2">{hovered.sector} · {hovered.industry}</div>
          <div className="flex items-center justify-between border-t border-[#333] pt-2">
            <span className={`font-mono font-bold text-[18px] ${hovered.changePct >= 0 ? 'text-[#4caf50]' : 'text-[#ef5350]'}`}>
              {hovered.changePct >= 0 ? '+' : ''}{hovered.changePct.toFixed(2)}%
            </span>
            <span className="text-[#64748b] text-[14px] font-mono">${(hovered.size / 1e9).toFixed(0)}B</span>
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
  const [sortKey, setSortKey] = useState<SortKey>('label');
  const [sortAsc, setSortAsc] = useState(true);
  const [profiles, setProfiles] = useState<Record<string, StockProfile>>({});

  const tickerSet = useMemo(() => new Set(tickers), [tickers]);

  useEffect(() => {
    const fetchQuotes = () => {
      fetch('/api/quotes')
        .then(r => r.json())
        .then((data: { quotes: Quote[]; updatedAt: string }) => {
          // Recalculate change from price & previousClose (DB values can be stale)
          const fixed = (data.quotes || []).map(q => {
            const change = q.previousClose > 0 ? q.price - q.previousClose : 0;
            const changePct = q.previousClose > 0 ? ((q.price / q.previousClose) - 1) * 100 : 0;
            return { ...q, change: Math.round(change * 100) / 100, changePct: Math.round(changePct * 100) / 100 };
          });
          setQuotes(fixed);
          setUpdatedAt(data.updatedAt);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 2_000);
    return () => clearInterval(interval);
  }, []);

  // Fetch stock profiles (sector/market cap) for treemap
  useEffect(() => {
    fetch('/api/stock-profiles')
      .then(r => r.json())
      .then(data => { if (data && typeof data === 'object' && !data.error) setProfiles(data); })
      .catch(() => {});
  }, []);

  // Backfill prices for tickers missing from DB quotes (via server-side proxy)
  const [backfillQuotes, setBackfillQuotes] = useState<Quote[]>([]);
  const backfillDone = React.useRef(false);
  useEffect(() => {
    if (loading || Object.keys(profiles).length === 0 || backfillDone.current) return;
    const quoteTickerSet = new Set(quotes.filter(q => q.id.startsWith('YF.STOCK.')).map(q => q.id.replace('YF.STOCK.', '')));
    const missing = [...tickerSet].filter(t => !quoteTickerSet.has(t) && profiles[t]);
    if (missing.length === 0) return;
    backfillDone.current = true;

    fetch(`/api/stock-quotes-backfill?tickers=${missing.join(',')}`)
      .then(r => r.json())
      .then((data: Quote[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setBackfillQuotes(data);
        }
      })
      .catch(() => {});
  }, [loading, profiles, quotes, tickerSet]);

  // Merge DB quotes + backfill quotes
  const allQuotes = useMemo(() => {
    if (backfillQuotes.length === 0) return quotes;
    const existing = new Set(quotes.map(q => q.id));
    return [...quotes, ...backfillQuotes.filter(q => !existing.has(q.id))];
  }, [quotes, backfillQuotes]);

  // Build treemap data grouped by sector → industry
  // Include ALL stocks with profiles (even without live quotes — show 0% change)
  const treemapData = useMemo(() => {
    const sectors: Record<string, TreemapStock[]> = {};
    const quoteLookup = new Map<string, { changePct: number }>();
    for (const q of allQuotes) {
      if (!q.id.startsWith('YF.STOCK.')) continue;
      quoteLookup.set(q.id.replace('YF.STOCK.', ''), { changePct: q.changePct });
    }

    // Add all stocks that are in the current index ticker set AND have a profile
    for (const ticker of tickerSet) {
      const profile = profiles[ticker];
      if (!profile || !profile.marketCap) continue;
      const sector = profile.sector || 'Other';
      if (!sectors[sector]) sectors[sector] = [];
      const quote = quoteLookup.get(ticker);
      sectors[sector].push({
        ticker,
        name: COMPANY_NAMES[ticker] || ticker,
        size: profile.marketCap,
        changePct: quote?.changePct ?? 0,
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
  }, [allQuotes, profiles, tickerSet]);

  const stockQuotes = useMemo(() => {
    // Build from live quotes + backfill
    const quoteLookup = new Map<string, Quote>();
    for (const q of allQuotes) {
      if (!q.id.startsWith('YF.STOCK.')) continue;
      const ticker = q.id.replace('YF.STOCK.', '');
      if (tickerSet.has(ticker)) quoteLookup.set(ticker, q);
    }

    // Include ALL stocks in tickerSet that have a profile (even without live quotes)
    let list: Quote[] = [];
    for (const ticker of tickerSet) {
      const existing = quoteLookup.get(ticker);
      if (existing) {
        list.push(existing);
      } else if (profiles[ticker]) {
        // No live quote — create a placeholder
        list.push({
          id: `YF.STOCK.${ticker}`,
          label: ticker,
          price: 0,
          previousClose: 0,
          change: 0,
          changePct: 0,
        });
      }
    }

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
  }, [allQuotes, search, sortKey, sortAsc, tickerSet, profiles]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(key === 'label'); }
  };

  const sortIcon = (key: SortKey) => sortKey !== key ? '' : sortAsc ? ' \u2191' : ' \u2193';

  const gainers = [...stockQuotes].sort((a, b) => b.changePct - a.changePct).slice(0, 5);
  const losers = [...stockQuotes].sort((a, b) => a.changePct - b.changePct).slice(0, 5);

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#1a1a2e]">
      <Nav />
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <MarketsHeader updatedAt={updatedAt} />
        <StocksHeader />

        {loading ? (
          <div className="text-center py-20 text-[#64748b]">Loading {title} data...</div>
        ) : stockQuotes.length === 0 ? (
          <div className="text-center py-20 text-[#64748b]">No {title} data yet. ETL job may still be running its first fetch.</div>
        ) : (
          <>
            {/* Gainers / Losers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border border-[#d5dce6] rounded-lg p-4">
                <h3 className="text-[15px] font-semibold text-[#2ecc40] mb-3">Top Gainers</h3>
                {gainers.map(q => (
                  <div key={q.id} className="flex justify-between text-[15px] py-1">
                    <span className="font-medium">{q.label}</span>
                    <span className="font-mono text-[#2ecc40]">+{q.changePct.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
              <div className="border border-[#d5dce6] rounded-lg p-4">
                <h3 className="text-[15px] font-semibold text-[#e74c3c] mb-3">Top Losers</h3>
                {losers.map(q => (
                  <div key={q.id} className="flex justify-between text-[15px] py-1">
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
                className="bg-white border border-[#d5dce6] rounded-lg px-3 py-1.5 text-[15px] outline-none focus:border-[#0066cc] transition w-48"
              />
              <span className="text-[14px] text-[#64748b] self-center ml-auto flex items-center gap-3">
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
            <div className="border border-[#d5dce6] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-[15px] text-[#64748b] uppercase tracking-wider bg-[#f4f6f9] border-b border-[#d5dce6]">
                    <th className="text-left px-3 py-2">
                      <button onClick={() => handleSort('label')} className="hover:text-[#0d1b2a]">Ticker{sortIcon('label')}</button>
                    </th>
                    <th className="text-left px-3 py-2 hidden md:table-cell">Name</th>
                    <th className="text-right px-3 py-2">
                      <button onClick={() => handleSort('price')} className="hover:text-[#0d1b2a]">Price{sortIcon('price')}</button>
                    </th>
                    <th className="text-right px-3 py-2 hidden sm:table-cell">Prev Close</th>
                    <th className="text-right px-3 py-2">
                      <button onClick={() => handleSort('change')} className="hover:text-[#0d1b2a]">Change{sortIcon('change')}</button>
                    </th>
                    <th className="text-right px-3 py-2">
                      <button onClick={() => handleSort('changePct')} className="hover:text-[#0d1b2a]">% Change{sortIcon('changePct')}</button>
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
                          className={`border-b border-[#edf0f5] hover:bg-[#f4f6f9] transition text-[15px] cursor-pointer ${isExpanded2 ? 'bg-[#f5f7fa]' : i % 2 ? 'bg-[#fafbfd]' : ''}`}
                          onClick={() => setExpanded(isExpanded2 ? null : q.label)}
                        >
                          <td className="px-3 py-2 font-semibold">
                            <span className="flex items-center gap-1.5">
                              <span className={`text-[14px] text-[#64748b] transition-transform inline-block ${isExpanded2 ? 'rotate-90' : ''}`}>&#9654;</span>
                              <StockLogo ticker={q.label} size={18} />
                              <Link href={`/markets/stocks/${q.label}`} className="hover:text-[#0066cc] transition" onClick={e => e.stopPropagation()}>{q.label}</Link>
                            </span>
                          </td>
                          <td className="px-3 py-2 text-[14px] text-[#64748b] hidden md:table-cell">
                            <Link href={`/markets/stocks/${q.label}`} className="hover:text-[#0066cc] transition">{COMPANY_NAMES[q.label] || ''}</Link>
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-semibold">
                            {q.price > 0
                              ? <AnimatedPrice value={q.price} format={v => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                              : <span className="text-[#94a3b8]">&mdash;</span>}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-[14px] text-[#64748b] hidden sm:table-cell">
                            {q.previousClose > 0 ? `$${q.previousClose.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '\u2014'}
                          </td>
                          <td className={`px-3 py-2 text-right font-mono text-[14px] ${q.price > 0 ? color : 'text-[#94a3b8]'}`}>{q.price > 0 ? `${sign}${q.change.toFixed(2)}` : '\u2014'}</td>
                          <td className={`px-3 py-2 text-right font-mono text-[14px] font-semibold ${q.price > 0 ? color : 'text-[#94a3b8]'}`}>{q.price > 0 ? `${sign}${q.changePct.toFixed(2)}%` : '\u2014'}</td>
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
