'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ExportButton from '@/components/ExportButton';

// ── Types ──────────────────────────────────────────────
interface CalendarEvent {
  date: string;
  time?: string;
  releaseId: number;
  name: string;
  country: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  type: 'economic' | 'earnings';
  sotwIndicators?: string[];
  forecast?: string;
  actual?: string;
  outcome?: string;
  detail?: string;
  source?: string;
  symbol?: string;
  epsEstimate?: number | null;
  revenueEstimate?: number | null;
}

interface CalendarMeta {
  total?: number;
  updatedAt?: string;
}

// ── Constants ──────────────────────────────────────────
const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸', EU: '🇪🇺', Global: '🌍', UK: '🇬🇧', JP: '🇯🇵',
  CN: '🇨🇳', CA: '🇨🇦', AU: '🇦🇺', KR: '🇰🇷', IN: '🇮🇳',
  BR: '🇧🇷', MX: '🇲🇽', CH: '🇨🇭', NZ: '🇳🇿', ZA: '🇿🇦',
  SG: '🇸🇬', HK: '🇭🇰', SE: '🇸🇪', NO: '🇳🇴', DK: '🇩🇰',
  NL: '🇳🇱', DE: '🇩🇪', FR: '🇫🇷', IT: '🇮🇹', ES: '🇪🇸', TW: '🇹🇼',
};

const LOGO_OVERRIDES: Record<string, string> = {
  META: 'FB', AZN: 'AZN.L', BMO: 'BMO.TO', BP: 'BP.L', ENB: 'ENB.TO',
  HSBC: 'HSBA.L', NVO: 'NOVO B.CO', RY: 'RY.TO', SAP: 'SAP.DE', SHEL: 'SHEL.L',
  CNXC: '942965499836', CSCO: '950800186156', CNR: 'CNR.TO',
};

function stockLogoUrl(ticker: string): string {
  const key = LOGO_OVERRIDES[ticker] || ticker;
  return `https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/${encodeURIComponent(key)}.png`;
}

// Brief descriptions for common macro events (shown as tooltip)
const MACRO_DESCRIPTIONS: Record<string, string> = {
  'Consumer Price Index': 'Measures inflation by tracking prices of a basket of consumer goods and services. Higher than expected is hawkish for central banks.',
  'CPI': 'Measures inflation by tracking prices of a basket of consumer goods and services. Higher than expected is hawkish for central banks.',
  'Nonfarm Payrolls': 'Number of jobs added/lost in the US economy excluding farm workers. The most-watched monthly employment indicator.',
  'Employment Situation': 'Comprehensive labor market report covering payrolls, unemployment rate, and wage growth.',
  'Unemployment Rate': 'Percentage of the labor force that is jobless and actively seeking work.',
  'Jobless Claims': 'Weekly count of new filings for unemployment insurance. A leading indicator of labor market health.',
  'FOMC': 'Federal Open Market Committee meeting — sets the federal funds rate and signals monetary policy direction.',
  'GDP': 'Gross Domestic Product — the total value of goods and services produced. The broadest measure of economic activity.',
  'PCE': 'Personal Consumption Expenditures — the Fed\'s preferred inflation gauge. Tracks consumer spending patterns.',
  'Personal Income': 'Measures total income received by individuals. Rising incomes support consumer spending.',
  'Retail Sales': 'Monthly measure of consumer spending at retail establishments. Consumer spending drives ~70% of US GDP.',
  'Industrial Production': 'Measures output of factories, mines, and utilities. A key indicator of manufacturing sector health.',
  'PPI': 'Producer Price Index — tracks wholesale prices. A leading indicator of consumer inflation.',
  'Producer Price': 'Producer Price Index — tracks wholesale prices. A leading indicator of consumer inflation.',
  'Housing Starts': 'Number of new residential construction projects begun. Reflects housing demand and builder confidence.',
  'Building Permits': 'Approved permits for new construction. A leading indicator of future housing activity.',
  'Durable Goods': 'Orders for manufactured goods expected to last 3+ years. Reflects business investment intentions.',
  'New Home Sales': 'Number of newly constructed homes sold. A leading indicator of housing market health.',
  'Consumer Sentiment': 'Survey measuring consumer confidence about the economy. Influences spending decisions.',
  'Michigan': 'University of Michigan Consumer Sentiment Index — measures consumer attitudes about current and future economic conditions.',
  'Consumer Confidence': 'Survey measuring how optimistic consumers are about the economy and their financial situation.',
  'JOLTS': 'Job Openings and Labor Turnover Survey — tracks job openings, hires, and separations.',
  'Trade Balance': 'Difference between exports and imports. A persistent deficit can weaken the currency.',
  'PMI': 'Purchasing Managers\' Index — survey of business conditions. Above 50 signals expansion, below 50 signals contraction.',
  'ISM': 'Institute for Supply Management survey — a leading indicator of manufacturing and services sector health.',
  'Existing Home Sales': 'Number of previously owned homes sold. Reflects overall housing demand.',
  'Import': 'Tracks prices of imported goods. Rising import prices can feed into domestic inflation.',
  'Export': 'Tracks prices of exported goods. Reflects competitiveness of domestic goods abroad.',
  'Construction Spending': 'Total value of construction activity. Covers residential, commercial, and public projects.',
  'Productivity': 'Output per hour worked. Rising productivity supports economic growth without inflationary pressure.',
  'Current Account': 'Broadest measure of trade — includes goods, services, income, and transfers with other countries.',
  'BoJ': 'Bank of Japan monetary policy — key for yen direction and Asian market sentiment.',
  'ECB': 'European Central Bank — sets interest rates for the eurozone. Key for euro and EU markets.',
  'BoE': 'Bank of England — sets UK interest rates. Key for sterling and UK markets.',
  'Core CPI': 'CPI excluding food and energy — shows underlying inflation trend. Closely watched by central banks.',
  'GfK': 'German consumer confidence survey — a leading indicator of consumer spending in Europe\'s largest economy.',
  'Richmond Fed': 'Regional manufacturing survey covering the US mid-Atlantic area. Part of the Fed\'s economic monitoring.',
  'Manufacturing Index': 'Survey of manufacturing sector activity. Positive readings signal expansion.',
};

function getMacroTooltip(name: string): string {
  for (const [key, desc] of Object.entries(MACRO_DESCRIPTIONS)) {
    if (name.includes(key)) return desc;
  }
  return '';
}

const INDICATOR_LINKS: Record<string, string> = {
  'Consumer Price Index': 'FRED.CPIAUCSL', 'CPI': 'FRED.CPIAUCSL',
  'Nonfarm Payrolls': 'FRED.PAYEMS', 'Employment Situation': 'FRED.PAYEMS',
  'Unemployment': 'FRED.UNRATE', 'Jobless Claims': 'FRED.ICSA',
  'FOMC': 'FRED.FEDFUNDS', 'Federal Funds': 'FRED.FEDFUNDS',
  'GDP': 'FRED.GDP', 'PCE': 'FRED.PCEPI', 'Personal Income': 'FRED.PCEPI',
  'Retail Sales': 'FRED.RSAFS', 'Industrial Production': 'FRED.INDPRO',
  'PPI': 'FRED.PPIFIS', 'Producer Price': 'FRED.PPIFIS',
  'Housing Starts': 'FRED.HOUST', 'Building Permits': 'FRED.PERMIT',
  'Durable Goods': 'FRED.DGORDER', 'New Home Sales': 'FRED.HSN1F',
  'Consumer Sentiment': 'FRED.UMCSENT', 'Michigan': 'FRED.UMCSENT',
  'JOLTS': 'FRED.JTSJOL', 'Trade Balance': 'FRED.BOPGSTB',
};

function findIndicatorLink(name: string): string | undefined {
  for (const [key, id] of Object.entries(INDICATOR_LINKS)) {
    if (name.includes(key)) return id;
  }
  return undefined;
}

// ── Helpers ────────────────────────────────────────────
function getWeekDates(offset: number) {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
  return {
    dates,
    from: dates[0].toISOString().slice(0, 10),
    to: dates[6].toISOString().slice(0, 10),
  };
}

function formatTime(t?: string) {
  if (!t) return '';
  const clean = t.replace(/\s*(AM|PM|ET|EST|EDT|UTC|GMT|BMO|AMC)\s*/gi, '').trim();
  if (/^(BMO|AMC)$/i.test(t.trim())) return t.trim().toUpperCase();
  return clean || '';
}

function formatRev(v: number): string {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${Math.round(v).toLocaleString()}`;
}

function formatWeekRange(dates: Date[]) {
  const a = dates[0], b = dates[dates.length - 1];
  const mo = (d: Date) => d.toLocaleDateString('en', { month: 'short' });
  if (a.getMonth() === b.getMonth()) return `${mo(a)} ${a.getDate()} – ${b.getDate()}, ${a.getFullYear()}`;
  return `${mo(a)} ${a.getDate()} – ${mo(b)} ${b.getDate()}, ${b.getFullYear()}`;
}

// ── Main Page ──────────────────────────────────────────
type TabType = 'all' | 'macro' | 'earnings';

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [meta, setMeta] = useState<CalendarMeta>({});
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [filterCountry, setFilterCountry] = useState('');
  const [filterImpact, setFilterImpact] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const dayRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const week = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    setLoading(true);
    const extFrom = new Date(new Date(week.from).getTime() - 7 * 86400000).toISOString().slice(0, 10);
    const extTo = new Date(new Date(week.to).getTime() + 21 * 86400000).toISOString().slice(0, 10);
    fetch(`/api/calendar?from=${extFrom}&to=${extTo}`)
      .then(r => r.json())
      .then(data => { setEvents(data.events || []); setMeta(data.meta || {}); setLoading(false); })
      .catch(() => setLoading(false));
  }, [weekOffset, week.from, week.to]);

  const countries = useMemo(() => [...new Set(events.map(e => e.country))].sort(), [events]);

  const filtered = useMemo(() => {
    return events.filter(e => {
      if (activeTab === 'macro' && e.type !== 'economic') return false;
      if (activeTab === 'earnings' && e.type !== 'earnings') return false;
      if (filterCountry && e.country !== filterCountry) return false;
      if (filterImpact && e.impact !== filterImpact) return false;
      return true;
    });
  }, [events, activeTab, filterCountry, filterImpact]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const d of week.dates) map[d.toISOString().slice(0, 10)] = [];
    for (const e of filtered) { if (map[e.date]) map[e.date].push(e); }
    const impOrd = { high: 0, medium: 1, low: 2 };
    for (const date of Object.keys(map)) {
      map[date].sort((a, b) => {
        if (a.type !== b.type) return a.type === 'economic' ? -1 : 1;
        return impOrd[a.impact] - impOrd[b.impact];
      });
    }
    return map;
  }, [filtered, week.dates]);

  const weekEvents = useMemo(() =>
    week.dates.reduce<CalendarEvent[]>((acc, d) => acc.concat(eventsByDate[d.toISOString().slice(0, 10)] || []), []),
    [week.dates, eventsByDate]
  );

  const totalThisWeek = weekEvents.length;
  const highThisWeek = weekEvents.filter(e => e.impact === 'high').length;
  const earningsThisWeek = weekEvents.filter(e => e.type === 'earnings').length;

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#1a1a2e]">
      <Nav />

      <section className="max-w-[1100px] mx-auto px-4 py-6">
        {/* Header row: title + week nav */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[28px] font-extrabold text-[#0d1b2a] tracking-tight">Economic Calendar</h1>
            <p className="text-[13px] text-[#64748b]">
              {totalThisWeek} events · {highThisWeek} high impact · {earningsThisWeek} earnings
              {meta.updatedAt && <span className="ml-2">· Updated {new Date(meta.updatedAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}</span>}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setWeekOffset(w => w - 1)} className="px-2.5 py-1 border border-[#e0e0e0] rounded text-[11px] hover:bg-[#f5f5f5] transition">←</button>
            <button onClick={() => setWeekOffset(0)} className={`px-3 py-1 border rounded text-[11px] transition ${weekOffset === 0 ? 'bg-[#333] text-white border-[#333]' : 'border-[#e0e0e0] hover:bg-[#f5f5f5]'}`}>This Week</button>
            <button onClick={() => setWeekOffset(w => w + 1)} className="px-2.5 py-1 border border-[#e0e0e0] rounded text-[11px] hover:bg-[#f5f5f5] transition">→</button>
            <span className="text-[12px] font-medium text-[#64748b] ml-2 hidden sm:inline">{formatWeekRange(week.dates)}</span>
          </div>
        </div>

        {/* Tabs + Filters — single row */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-0 border-b border-[#d5dce6]">
            {([
              { id: 'all' as TabType, label: 'All', count: totalThisWeek },
              { id: 'macro' as TabType, label: 'Macro', count: weekEvents.filter(e => e.type === 'economic').length },
              { id: 'earnings' as TabType, label: 'Earnings', count: earningsThisWeek },
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-[11px] font-medium border-b-2 -mb-px transition ${
                  activeTab === tab.id ? 'border-[#333] text-[#0d1b2a]' : 'border-transparent text-[#64748b] hover:text-[#64748b]'
                }`}
              >
                {tab.label} <span className="opacity-50">({tab.count})</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} className="border border-[#e0e0e0] rounded px-2 py-1 text-[11px] outline-none">
              <option value="">All Countries</option>
              {countries.map(c => <option key={c} value={c}>{COUNTRY_FLAGS[c] || ''} {c}</option>)}
            </select>
            <select value={filterImpact} onChange={e => setFilterImpact(e.target.value)} className="border border-[#e0e0e0] rounded px-2 py-1 text-[11px] outline-none">
              <option value="">All Impact</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            {(filterCountry || filterImpact) && (
              <button onClick={() => { setFilterCountry(''); setFilterImpact(''); }} className="text-[10px] text-[#64748b] hover:text-[#0d1b2a]">Clear</button>
            )}
            <ExportButton
              filename={`sotw-calendar-${week.from}`}
              getData={() => ({
                headers: ['Date', 'Time', 'Country', 'Event', 'Type', 'Impact', 'Expected', 'Actual'],
                rows: filtered.map(e => [
                  e.date, e.time || '', e.country, e.name, e.type, e.impact,
                  e.type === 'earnings' && e.epsEstimate ? `EPS $${e.epsEstimate.toFixed(2)}` : e.forecast || '',
                  e.actual || '',
                ]),
              })}
            />
          </div>
        </div>

        {/* Calendar table */}
        {loading ? (
          <div className="text-center py-16 text-[#64748b] text-[13px]">Loading calendar...</div>
        ) : (
          <div className="border border-[#d5dce6] rounded-lg overflow-visible">
            {/* Column headers */}
            <div className="hidden sm:flex items-center px-3 py-1.5 bg-[#f8f8f8] border-b border-[#d5dce6] text-[10px] font-medium text-[#64748b] uppercase tracking-wider gap-2">
              <span className="w-2 shrink-0" />
              <span className="w-11 shrink-0">Time</span>
              <span className="w-6 shrink-0"></span>
              <span className="flex-1">Event</span>
              <span className="w-36 text-right">Actual</span>
              <span className="w-20 text-right">Expected</span>
              <span className="w-12 text-center hidden md:block">Impact</span>
            </div>

            {week.dates.map(d => {
              const dateStr = d.toISOString().slice(0, 10);
              const dayEvents = eventsByDate[dateStr] || [];
              const isToday = dateStr === todayStr;
              const isPastDay = dateStr < todayStr;
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              if (isWeekend && dayEvents.length === 0) return null;

              return (
                <div key={dateStr} ref={el => { dayRefs.current[dateStr] = el; }}>
                  {/* Day header */}
                  <div className={`px-3 py-1.5 border-b border-[#d5dce6] flex items-center justify-between ${
                    isToday ? 'bg-blue-50' : 'bg-[#fafafa]'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-[12px] font-semibold ${isToday ? 'text-blue-600' : isPastDay ? 'text-[#64748b]' : 'text-[#0d1b2a]'}`}>
                        {d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      {isToday && <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium">TODAY</span>}
                    </div>
                    <span className="text-[10px] text-[#bbb]">
                      {dayEvents.length > 0 ? `${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}` : ''}
                    </span>
                  </div>

                  {dayEvents.length === 0 ? (
                    <div className="px-3 py-2 text-[11px] text-[#ddd] border-b border-[#f0f0f0]">No events</div>
                  ) : (
                    <div className="divide-y divide-[#f5f5f5]">
                      {dayEvents.map((event, i) => {
                        const isEarnings = event.type === 'earnings';
                        const isPast = event.date < todayStr;
                        const indicatorId = findIndicatorLink(event.name);

                        return (
                          <div key={`${dateStr}-${i}`} className={`flex items-center px-3 py-2 gap-2 text-[12px] ${isPast ? 'text-[#aaa]' : 'hover:bg-[#fafafa]'} transition`}>
                            {/* Impact dot */}
                            <span className={`w-2 h-2 rounded-full shrink-0 ${
                              isEarnings ? 'bg-purple-400' :
                              event.impact === 'high' ? 'bg-red-500' :
                              event.impact === 'medium' ? 'bg-amber-400' :
                              'bg-gray-300'
                            }`} />

                            {/* Time */}
                            <span className="w-11 shrink-0 text-[10px] font-mono text-[#aaa] hidden sm:block">
                              {formatTime(event.time) || '—'}
                            </span>

                            {/* Country */}
                            <span className="text-[13px] w-6 shrink-0" title={event.country}>
                              {COUNTRY_FLAGS[event.country] || event.country}
                            </span>

                            {/* Event name */}
                            <div className="flex-1 min-w-0">
                              <span className={`text-[12px] relative [&:hover>.cal-tip]:block ${
                                isEarnings ? 'text-purple-700 font-medium' :
                                event.impact === 'high' ? 'text-[#111] font-semibold' :
                                'text-[#444]'
                              }`}>
                                {isEarnings && event.symbol ? (
                                  <span className="inline-flex items-center gap-1">
                                    <img src={stockLogoUrl(event.symbol)} alt="" width={14} height={14} className="rounded-sm" onError={e => (e.currentTarget.style.display = 'none')} loading="lazy" />
                                    <span className="font-bold">{event.symbol}</span>
                                  </span>
                                ) : event.name}
                                {(() => {
                                  const tip = event.detail || getMacroTooltip(event.name);
                                  return tip ? (
                                    <span className="cal-tip hidden absolute left-0 top-full mt-1.5 z-[100] bg-white text-[#0d1b2a] text-[12px] px-3 py-2.5 rounded-lg shadow-lg whitespace-normal w-[340px] leading-relaxed pointer-events-none border border-[#d0d0d0]">
                                      {tip}
                                    </span>
                                  ) : null;
                                })()}
                              </span>
                              {indicatorId && (
                                <Link
                                  href={`/indicators?id=${encodeURIComponent(indicatorId)}`}
                                  className="text-[9px] text-[#0066cc] hover:underline ml-1.5"
                                  onClick={e => e.stopPropagation()}
                                >
                                  Chart →
                                </Link>
                              )}
                            </div>

                            {/* Actual */}
                            <span className="w-36 text-right text-[11px] font-mono hidden sm:block truncate">
                              {event.actual ? (
                                <span className={`font-semibold ${
                                  event.actual.includes('beat') ? 'text-green-600' :
                                  event.actual.includes('miss') ? 'text-red-500' :
                                  'text-green-600'
                                }`} title={event.outcome || ''}>{event.actual}</span>
                              ) : <span className="text-[#e0e0e0]">—</span>}
                            </span>

                            {/* Expected */}
                            <span className="w-20 text-right text-[11px] font-mono text-[#888] hidden sm:block">
                              {isEarnings ? (
                                event.epsEstimate != null ? (
                                  <span title={event.revenueEstimate ? `Rev: ${formatRev(event.revenueEstimate)}` : ''}>
                                    ${event.epsEstimate.toFixed(2)}
                                  </span>
                                ) : <span className="text-[#e0e0e0]">—</span>
                              ) : (
                                event.forecast ? event.forecast : <span className="text-[#e0e0e0]">—</span>
                              )}
                            </span>

                            {/* Impact */}
                            <span className={`w-12 text-center text-[9px] py-0.5 rounded shrink-0 hidden md:inline-block font-medium ${
                              isEarnings ? 'text-purple-600 bg-purple-50' :
                              event.impact === 'high' ? 'text-red-600 bg-red-50' :
                              event.impact === 'medium' ? 'text-amber-600 bg-amber-50' :
                              'text-gray-400 bg-gray-50'
                            }`}>
                              {isEarnings ? 'Earn' : event.impact === 'high' ? 'High' : event.impact === 'medium' ? 'Med' : 'Low'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="mt-3 flex items-center gap-4 text-[10px] text-[#bbb]">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> High</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> Medium</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" /> Low</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" /> Earnings</span>
          <span className="ml-auto">Sources: FRED · Finnhub · Gemini Search</span>
        </div>
      </section>

      <Footer />
    </main>
  );
}
