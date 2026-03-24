'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

interface CalendarEvent {
  date: string;
  releaseId: number;
  name: string;
  country: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  type: 'economic' | 'earnings';
  sotwIndicators?: string[];
  forecast?: string;
  previous?: string;
  symbol?: string;
  epsEstimate?: number | null;
  revenueEstimate?: number | null;
}

interface CalendarMeta {
  total?: number;
  economic?: number;
  earnings?: number;
  highImpact?: number;
  countries?: number;
  sources?: string[];
  updatedAt?: string;
  cached?: boolean;
}

const IMPACT_STYLES = {
  high: { dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200', label: 'High', ring: 'ring-red-100' },
  medium: { dot: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Medium', ring: 'ring-amber-100' },
  low: { dot: 'bg-gray-300', badge: 'bg-gray-50 text-gray-500 border-gray-200', label: 'Low', ring: 'ring-gray-100' },
};

const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸', EU: '🇪🇺', Global: '🌍', UK: '🇬🇧', JP: '🇯🇵',
  CN: '🇨🇳', CA: '🇨🇦', AU: '🇦🇺', KR: '🇰🇷', IN: '🇮🇳',
  BR: '🇧🇷', MX: '🇲🇽', CH: '🇨🇭', NZ: '🇳🇿', ZA: '🇿🇦',
  SG: '🇸🇬', HK: '🇭🇰', SE: '🇸🇪', NO: '🇳🇴', DK: '🇩🇰',
};

const CATEGORY_CONTEXT: Record<string, string> = {
  'Inflation': 'Measures price changes. Above forecast = hawkish central bank pressure.',
  'Labor': 'Jobs market health. Strong = economic growth, weak = recession risk.',
  'GDP': 'Total economic output. The broadest measure of economic health.',
  'Central Bank': 'Interest rate decisions directly move currencies, bonds, and equities.',
  'Housing': 'Leading indicator. Housing weakness often precedes broader slowdowns.',
  'Consumer': 'Consumer spending drives ~70% of GDP in developed economies.',
  'Production': 'Factory/manufacturing activity. PMI below 50 = contraction.',
  'Trade': 'Import/export balance. Affects currency strength and trade policy.',
  'Fixed Income': 'Bond auctions and yields. Signals market risk appetite.',
  'Speech': 'Central banker commentary can shift market expectations.',
  'Earnings': 'Quarterly corporate results vs analyst estimates.',
  'Summit': 'International policy coordination. Can signal trade/fiscal shifts.',
  'Energy': 'OPEC+ decisions affect oil prices and inflation outlook.',
};

function getWeekDates(offset: number): { from: string; to: string; dates: Date[] } {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) + offset * 7);

  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }

  return {
    from: dates[0].toISOString().slice(0, 10),
    to: dates[6].toISOString().slice(0, 10),
    dates,
  };
}

function formatDateHeader(d: Date): string {
  return d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatWeekRange(dates: Date[]): string {
  const from = dates[0];
  const to = dates[6];
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  if (from.getMonth() === to.getMonth()) {
    return `${from.toLocaleDateString('en', { month: 'long', day: 'numeric' })} \u2013 ${to.getDate()}, ${to.getFullYear()}`;
  }
  return `${from.toLocaleDateString('en', opts)} \u2013 ${to.toLocaleDateString('en', opts)}, ${to.getFullYear()}`;
}

function formatRevenue(val: number): string {
  if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(0)}M`;
  return `$${val.toLocaleString()}`;
}

function SkeletonRow() {
  return (
    <div className="flex items-center px-4 py-3 gap-3 animate-pulse">
      <div className="w-2 h-2 rounded-full bg-gray-200 shrink-0" />
      <div className="w-7 h-4 bg-gray-200 rounded shrink-0" />
      <div className="flex-1 flex flex-col gap-1">
        <div className="h-3.5 bg-gray-200 rounded w-2/3" />
      </div>
      <div className="h-3 bg-gray-200 rounded w-16 hidden sm:block" />
      <div className="h-3 bg-gray-200 rounded w-12 hidden sm:block" />
      <div className="h-5 bg-gray-200 rounded w-14 hidden md:block" />
    </div>
  );
}

function SkeletonDay({ isToday }: { isToday?: boolean }) {
  return (
    <div className={isToday ? 'bg-[#f0f7ff]' : ''}>
      <div className={`px-4 py-2 border-b border-[#e8e8e8] flex items-center justify-between ${isToday ? 'bg-[#e8f0fe]' : 'bg-[#f8f9fa]'}`}>
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
      </div>
      <div className="divide-y divide-[#f0f0f0] border-b border-[#e8e8e8]">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    </div>
  );
}

type TabType = 'all' | 'macro' | 'earnings';

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [meta, setMeta] = useState<CalendarMeta>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [filterCountry, setFilterCountry] = useState('');
  const [filterImpact, setFilterImpact] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, string>>({});

  const week = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const extFrom = new Date(new Date(week.from).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const extTo = new Date(new Date(week.to).getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    fetch(`/api/calendar?from=${extFrom}&to=${extTo}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        setEvents(data.events || []);
        setMeta(data.meta || {});
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load calendar');
        setLoading(false);
      });
  }, [weekOffset, week.from, week.to]);

  // Fetch AI summaries for past events
  const fetchSummaries = useCallback(async (evts: CalendarEvent[]) => {
    const today = new Date().toISOString().slice(0, 10);
    const pastEvents = evts
      .filter(e => e.date < today)
      .map(e => ({ date: e.date, name: e.name, type: e.type, symbol: e.symbol }));

    if (pastEvents.length === 0) return;

    const needed = pastEvents.filter(e => {
      const key = `${e.date}|${e.name}|${e.symbol || ''}`;
      return !summaries[key];
    });

    if (needed.length === 0) return;

    try {
      const resp = await fetch('/api/calendar/summaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: needed }),
      });
      const data = await resp.json();
      if (data.summaries) {
        setSummaries(prev => ({ ...prev, ...data.summaries }));
      }
    } catch { /* silent */ }
  }, [summaries]);

  useEffect(() => {
    if (events.length > 0) {
      fetchSummaries(events);
    }
  }, [events, fetchSummaries]);

  const countries = useMemo(() => [...new Set(events.map(e => e.country))].sort(), [events]);
  const categories = useMemo(() => [...new Set(events.map(e => e.category))].filter(c => c !== 'Earnings').sort(), [events]);

  const filtered = useMemo(() => {
    return events.filter(e => {
      if (activeTab === 'macro' && e.type !== 'economic') return false;
      if (activeTab === 'earnings' && e.type !== 'earnings') return false;
      if (filterCountry && e.country !== filterCountry) return false;
      if (filterImpact && e.impact !== filterImpact) return false;
      if (filterCategory && e.category !== filterCategory) return false;
      return true;
    });
  }, [events, activeTab, filterCountry, filterImpact, filterCategory]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const d of week.dates) {
      map[d.toISOString().slice(0, 10)] = [];
    }
    for (const e of filtered) {
      if (map[e.date]) {
        map[e.date].push(e);
      }
    }
    const order = { high: 0, medium: 1, low: 2 };
    for (const date of Object.keys(map)) {
      map[date].sort((a, b) => {
        // Earnings after economic events within same impact tier
        if (a.type !== b.type) return a.type === 'economic' ? -1 : 1;
        return order[a.impact] - order[b.impact];
      });
    }
    return map;
  }, [filtered, week.dates]);

  const todayStr = new Date().toISOString().slice(0, 10);

  const weekEvents = week.dates.reduce<CalendarEvent[]>((acc, d) => {
    const dateStr = d.toISOString().slice(0, 10);
    return acc.concat(eventsByDate[dateStr] || []);
  }, []);
  const totalThisWeek = weekEvents.length;
  const highThisWeek = weekEvents.filter(e => e.impact === 'high').length;
  const econThisWeek = weekEvents.filter(e => e.type === 'economic').length;
  const earningsThisWeek = weekEvents.filter(e => e.type === 'earnings').length;

  return (
    <main className="min-h-screen bg-white text-[#333]">
      <Nav />

      <section className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-[28px] font-bold mb-1">Economic Calendar</h1>
          <p className="text-[13px] text-[#666]">
            Track the week&apos;s most important macro events, earnings, and market-moving releases in one place.
          </p>
        </div>

        {/* Metadata bar */}
        <div className="flex flex-wrap items-center gap-3 mb-5 px-4 py-2.5 bg-[#f8f9fa] border border-[#e8e8e8] rounded-lg text-[11px] text-[#666]">
          {loading ? (
            <div className="flex items-center gap-2 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-gray-300" />
              <span className="text-[#999]">Loading feeds...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-red-600">Feed error</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span>All feeds operational</span>
              </div>
              <span className="text-[#ddd]">|</span>
              <span><strong className="text-[#333]">{totalThisWeek}</strong> events this week</span>
              {highThisWeek > 0 && (
                <>
                  <span className="text-[#ddd]">|</span>
                  <span><strong className="text-red-600">{highThisWeek}</strong> high impact</span>
                </>
              )}
              {earningsThisWeek > 0 && (
                <>
                  <span className="text-[#ddd]">|</span>
                  <span><strong className="text-purple-600">{earningsThisWeek}</strong> earnings</span>
                </>
              )}
              <span className="text-[#ddd]">|</span>
              <span>{[...new Set(weekEvents.map(e => e.country))].length} countries</span>
            </>
          )}
          <div className="ml-auto text-[#999]">
            {meta.updatedAt && (
              <span>Updated {new Date(meta.updatedAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}</span>
            )}
          </div>
        </div>

        {/* Week navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset(w => w - 1)}
              className="px-3 py-1.5 border border-[#e8e8e8] rounded-lg text-[12px] hover:bg-[#f5f7fa] transition"
            >
              ← Prev
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className={`px-3 py-1.5 border rounded-lg text-[12px] transition ${
                weekOffset === 0 ? 'bg-[#0066cc] text-white border-[#0066cc]' : 'border-[#e8e8e8] hover:bg-[#f5f7fa]'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setWeekOffset(w => w + 1)}
              className="px-3 py-1.5 border border-[#e8e8e8] rounded-lg text-[12px] hover:bg-[#f5f7fa] transition"
            >
              Next →
            </button>
          </div>
          <div className="text-[14px] font-semibold text-[#333]">
            {formatWeekRange(week.dates)}
          </div>
        </div>

        {/* Tabs: All / Macro / Earnings */}
        <div className="flex items-center gap-0 mb-4 border-b border-[#e8e8e8]">
          {([
            { id: 'all' as TabType, label: 'All Events', count: totalThisWeek },
            { id: 'macro' as TabType, label: 'Macro', count: econThisWeek },
            { id: 'earnings' as TabType, label: 'Earnings', count: earningsThisWeek },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-[12px] font-medium border-b-2 transition -mb-px ${
                activeTab === tab.id
                  ? 'border-[#0066cc] text-[#0066cc]'
                  : 'border-transparent text-[#999] hover:text-[#666]'
              }`}
            >
              {tab.label}
              {!loading && <span className="ml-1.5 text-[10px] opacity-60">({tab.count})</span>}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          <select
            value={filterCountry}
            onChange={e => setFilterCountry(e.target.value)}
            className="border border-[#e8e8e8] rounded-lg px-3 py-1.5 text-[12px] outline-none bg-white"
          >
            <option value="">All Countries</option>
            {countries.map(c => (
              <option key={c} value={c}>{COUNTRY_FLAGS[c] || ''} {c}</option>
            ))}
          </select>
          <select
            value={filterImpact}
            onChange={e => setFilterImpact(e.target.value)}
            className="border border-[#e8e8e8] rounded-lg px-3 py-1.5 text-[12px] outline-none bg-white"
          >
            <option value="">All Impact</option>
            <option value="high">High Impact</option>
            <option value="medium">Medium Impact</option>
            <option value="low">Low Impact</option>
          </select>
          {activeTab !== 'earnings' && (
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="border border-[#e8e8e8] rounded-lg px-3 py-1.5 text-[12px] outline-none bg-white"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          {(filterCountry || filterImpact || filterCategory) && (
            <button
              onClick={() => { setFilterCountry(''); setFilterImpact(''); setFilterCategory(''); }}
              className="px-3 py-1.5 text-[11px] text-[#999] hover:text-[#333] transition"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Error state */}
        {error && !loading && (
          <div className="border border-red-200 bg-red-50 rounded-xl p-6 text-center mb-6">
            <div className="text-[14px] font-medium text-red-700 mb-1">Unable to load calendar</div>
            <div className="text-[12px] text-red-600 mb-3">{error}</div>
            <button
              onClick={() => setWeekOffset(w => w)}
              className="px-4 py-1.5 text-[12px] bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Calendar grid */}
        {loading ? (
          <div className="border border-[#e8e8e8] rounded-xl overflow-hidden">
            <SkeletonDay isToday />
            <SkeletonDay />
            <SkeletonDay />
            <SkeletonDay />
            <SkeletonDay />
          </div>
        ) : !error && (
          <div className="border border-[#e8e8e8] rounded-xl overflow-hidden">
            {/* Column headers */}
            <div className="hidden sm:flex items-center px-4 py-1.5 bg-[#f0f1f3] border-b border-[#e8e8e8] text-[10px] font-medium text-[#999] uppercase tracking-wider gap-3">
              <span className="w-2 shrink-0" />
              <span className="w-7 shrink-0">Ctry</span>
              <span className="flex-1">Event</span>
              <span className="w-20 text-right">Forecast</span>
              <span className="w-20 text-right">Previous</span>
              <span className="w-16 text-right">Category</span>
              <span className="w-14 text-right hidden md:block">Impact</span>
            </div>

            {week.dates.map(d => {
              const dateStr = d.toISOString().slice(0, 10);
              const dayEvents = eventsByDate[dateStr] || [];
              const isToday = dateStr === todayStr;
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;

              if (isWeekend && dayEvents.length === 0) return null;

              return (
                <div key={dateStr} className={isToday ? 'bg-[#f0f7ff]' : ''}>
                  {/* Day header */}
                  <div className={`px-4 py-2 border-b border-[#e8e8e8] flex items-center justify-between ${
                    isToday ? 'bg-[#e8f0fe]' : 'bg-[#f8f9fa]'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-[13px] font-semibold ${isToday ? 'text-[#0066cc]' : 'text-[#333]'}`}>
                        {formatDateHeader(d)}
                      </span>
                      {isToday && (
                        <span className="text-[10px] bg-[#0066cc] text-white px-1.5 py-0.5 rounded font-medium">Today</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#999]">
                      {dayEvents.filter(e => e.impact === 'high').length > 0 && (
                        <span className="text-red-500 font-medium">{dayEvents.filter(e => e.impact === 'high').length} high</span>
                      )}
                      <span>
                        {dayEvents.length > 0 ? `${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Events */}
                  {dayEvents.length === 0 ? (
                    <div className="px-4 py-3 text-[12px] text-[#ccc] border-b border-[#f0f0f0]">
                      No scheduled releases
                    </div>
                  ) : (
                    <div className="divide-y divide-[#f0f0f0] border-b border-[#e8e8e8]">
                      {dayEvents.map((event, i) => {
                        const style = IMPACT_STYLES[event.impact];
                        const isEarnings = event.type === 'earnings';
                        const isPast = event.date < todayStr;
                        const summaryKey = `${event.date}|${event.name}|${event.symbol || ''}`;
                        const summary = summaries[summaryKey];
                        const categoryContext = CATEGORY_CONTEXT[event.category];

                        return (
                          <div key={`${event.releaseId}-${event.symbol || ''}-${i}`}>
                            <div className="flex items-center px-4 py-2.5 hover:bg-[#f8f9fa] transition gap-3 group">
                              {/* Impact dot */}
                              <div className={`w-2 h-2 rounded-full shrink-0 ${isEarnings ? 'bg-purple-500' : style.dot}`} title={isEarnings ? 'Earnings' : `${style.label} impact`} />

                              {/* Country / Symbol */}
                              <span className="text-[14px] w-7 shrink-0" title={event.country}>
                                {isEarnings ? '📊' : (COUNTRY_FLAGS[event.country] || event.country)}
                              </span>

                              {/* Event name + context */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[13px] font-medium ${isEarnings ? 'text-purple-700' : 'text-[#333]'}`}>
                                    {isEarnings && event.symbol ? (
                                      <>
                                        <span className="font-bold">{event.symbol}</span>
                                        <span className="font-normal text-[#666]"> Earnings Report</span>
                                      </>
                                    ) : event.name}
                                  </span>
                                  {/* Category context toggle */}
                                  {categoryContext && !isEarnings && (
                                    <button
                                      onClick={() => setExpandedCategory(expandedCategory === `${dateStr}-${i}` ? null : `${dateStr}-${i}`)}
                                      className="text-[10px] text-[#bbb] hover:text-[#0066cc] transition opacity-0 group-hover:opacity-100"
                                      title="Why this matters"
                                    >
                                      ?
                                    </button>
                                  )}
                                </div>
                                {isPast && summary && (
                                  <div className="text-[11px] text-[#888] mt-0.5 truncate" title={summary}>
                                    {summary}
                                  </div>
                                )}
                              </div>

                              {/* Forecast / EPS estimate */}
                              <span className="w-20 text-right text-[11px] font-mono text-[#333] hidden sm:block">
                                {isEarnings ? (
                                  event.epsEstimate != null ? (
                                    <span title="EPS Estimate">
                                      <span className="text-[#999] text-[10px]">EPS </span>${event.epsEstimate.toFixed(2)}
                                    </span>
                                  ) : <span className="text-[#ccc]">—</span>
                                ) : (
                                  event.forecast ? (
                                    <span title="Consensus forecast">{event.forecast}</span>
                                  ) : <span className="text-[#ccc]">—</span>
                                )}
                              </span>

                              {/* Previous / Revenue estimate */}
                              <span className="w-20 text-right text-[11px] font-mono text-[#666] hidden sm:block">
                                {isEarnings ? (
                                  event.revenueEstimate != null && event.revenueEstimate > 0 ? (
                                    <span title="Revenue Estimate">
                                      <span className="text-[#999] text-[10px]">Rev </span>{formatRevenue(event.revenueEstimate)}
                                    </span>
                                  ) : <span className="text-[#ccc]">—</span>
                                ) : (
                                  event.previous ? (
                                    <span title="Previous value">{event.previous}</span>
                                  ) : <span className="text-[#ccc]">—</span>
                                )}
                              </span>

                              {/* Category */}
                              <span className="w-16 text-right text-[11px] text-[#999] hidden sm:block truncate" title={event.category}>
                                {event.category}
                              </span>

                              {/* Impact badge */}
                              <span className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 hidden md:inline w-14 text-center ${
                                isEarnings ? 'bg-purple-50 text-purple-700 border-purple-200' : style.badge
                              }`}>
                                {isEarnings ? 'Earnings' : style.label}
                              </span>

                              {/* SOTW indicator links */}
                              {event.sotwIndicators && event.sotwIndicators.length > 0 && (
                                <div className="flex gap-1 shrink-0">
                                  {event.sotwIndicators.map(indId => (
                                    <Link
                                      key={indId}
                                      href={`/indicators?id=${encodeURIComponent(indId)}`}
                                      className="text-[10px] bg-[#e8f0fe] px-1.5 py-0.5 rounded hover:bg-[#d0e0f8] transition text-[#0066cc]"
                                      title={`View ${indId} historical data`}
                                    >
                                      Chart →
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Category context expansion */}
                            {expandedCategory === `${dateStr}-${i}` && categoryContext && (
                              <div className="px-4 pb-2 pl-12 text-[11px] text-[#888] italic">
                                {categoryContext}
                              </div>
                            )}
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

        {/* Legend + source attribution */}
        <div className="mt-5 px-4 py-3 bg-[#f8f9fa] border border-[#e8e8e8] rounded-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#999]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> High Impact</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Medium</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" /> Low</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> Earnings</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-[#e8e8e8] text-[10px] text-[#bbb] flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-medium text-[#999]">Sources:</span>
            <span>Macro events: <a href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener noreferrer" className="text-[#0066cc] hover:underline">ForexFactory</a></span>
            <span className="text-[#ddd]">·</span>
            <span>Earnings: <a href="https://finnhub.io" target="_blank" rel="noopener noreferrer" className="text-[#0066cc] hover:underline">Finnhub</a></span>
            <span className="text-[#ddd]">·</span>
            <span>CB meetings: <a href="https://www.cbrates.com" target="_blank" rel="noopener noreferrer" className="text-[#0066cc] hover:underline">cbrates.com</a></span>
            <span className="text-[#ddd]">·</span>
            <span>Historical: <a href="https://fred.stlouisfed.org" target="_blank" rel="noopener noreferrer" className="text-[#0066cc] hover:underline">FRED</a></span>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
