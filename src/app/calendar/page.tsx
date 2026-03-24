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

const IMPACT_STYLES = {
  high: { dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200', label: 'High' },
  medium: { dot: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Medium' },
  low: { dot: 'bg-gray-300', badge: 'bg-gray-50 text-gray-500 border-gray-200', label: 'Low' },
};

const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸', EU: '🇪🇺', Global: '🌍', UK: '🇬🇧', JP: '🇯🇵', CN: '🇨🇳', CA: '🇨🇦', AU: '🇦🇺',
  KR: '🇰🇷', IN: '🇮🇳', BR: '🇧🇷', MX: '🇲🇽', CH: '🇨🇭',
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekDates(offset: number): { from: string; to: string; dates: Date[] } {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
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
    return `${from.toLocaleDateString('en', { month: 'long', day: 'numeric' })} – ${to.getDate()}, ${to.getFullYear()}`;
  }
  return `${from.toLocaleDateString('en', opts)} – ${to.toLocaleDateString('en', opts)}, ${to.getFullYear()}`;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [filterCountry, setFilterCountry] = useState('');
  const [filterImpact, setFilterImpact] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [summaries, setSummaries] = useState<Record<string, string>>({});

  const week = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  useEffect(() => {
    setLoading(true);
    // Fetch 4 weeks of data to allow navigation
    const extFrom = new Date(new Date(week.from).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const extTo = new Date(new Date(week.to).getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    fetch(`/api/calendar?from=${extFrom}&to=${extTo}`)
      .then(r => r.json())
      .then(data => {
        setEvents(data.events || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [weekOffset, week.from, week.to]);

  // Fetch AI summaries for past events
  const fetchSummaries = useCallback(async (evts: CalendarEvent[]) => {
    const today = new Date().toISOString().slice(0, 10);
    const pastEvents = evts
      .filter(e => e.date < today)
      .map(e => ({ date: e.date, name: e.name, type: e.type, symbol: e.symbol }));

    if (pastEvents.length === 0) return;

    // Check which ones we already have
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
  const categories = useMemo(() => [...new Set(events.map(e => e.category))].sort(), [events]);

  const filtered = useMemo(() => {
    return events.filter(e => {
      if (filterCountry && e.country !== filterCountry) return false;
      if (filterImpact && e.impact !== filterImpact) return false;
      if (filterCategory && e.category !== filterCategory) return false;
      return true;
    });
  }, [events, filterCountry, filterImpact, filterCategory]);

  // Group events by date for the current week
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
    // Sort within each day: high first, then medium, then low
    const order = { high: 0, medium: 1, low: 2 };
    for (const date of Object.keys(map)) {
      map[date].sort((a, b) => order[a.impact] - order[b.impact]);
    }
    return map;
  }, [filtered, week.dates]);

  const todayStr = new Date().toISOString().slice(0, 10);

  const totalThisWeek = week.dates.reduce((sum, d) => sum + (eventsByDate[d.toISOString().slice(0, 10)]?.length || 0), 0);

  return (
    <main className="min-h-screen bg-white text-[#333]">
      <Nav />

      <section className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-[28px] font-bold mb-1">Economic Calendar</h1>
          <p className="text-[13px] text-[#999]">
            Upcoming economic data releases from the Federal Reserve, BLS, Census Bureau, and international organizations.
          </p>
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

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          <select
            value={filterCountry}
            onChange={e => setFilterCountry(e.target.value)}
            className="border border-[#e8e8e8] rounded-lg px-3 py-1.5 text-[12px] outline-none"
          >
            <option value="">All Countries</option>
            {countries.map(c => (
              <option key={c} value={c}>{COUNTRY_FLAGS[c] || ''} {c}</option>
            ))}
          </select>
          <select
            value={filterImpact}
            onChange={e => setFilterImpact(e.target.value)}
            className="border border-[#e8e8e8] rounded-lg px-3 py-1.5 text-[12px] outline-none"
          >
            <option value="">All Impact</option>
            <option value="high">High Impact</option>
            <option value="medium">Medium Impact</option>
            <option value="low">Low Impact</option>
          </select>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="border border-[#e8e8e8] rounded-lg px-3 py-1.5 text-[12px] outline-none"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="ml-auto text-[12px] text-[#999] self-center">
            {totalThisWeek} events this week
          </div>
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="text-center py-20 text-[#999]">Loading calendar...</div>
        ) : (
          <div className="border border-[#e8e8e8] rounded-xl overflow-hidden">
            {week.dates.map(d => {
              const dateStr = d.toISOString().slice(0, 10);
              const dayEvents = eventsByDate[dateStr] || [];
              const isToday = dateStr === todayStr;
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;

              if (isWeekend && dayEvents.length === 0) return null;

              return (
                <div key={dateStr} className={`${isToday ? 'bg-[#f0f7ff]' : ''}`}>
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
                    <span className="text-[11px] text-[#999]">
                      {dayEvents.length > 0 ? `${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}` : ''}
                    </span>
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
                        return (
                          <div key={`${event.releaseId}-${event.symbol || ''}-${i}`} className="flex items-center px-4 py-2.5 hover:bg-[#f8f9fa] transition gap-3">
                            {/* Impact dot */}
                            <div className={`w-2 h-2 rounded-full shrink-0 ${isEarnings ? 'bg-purple-500' : style.dot}`} title={isEarnings ? 'Earnings' : `${style.label} impact`} />

                            {/* Country / Symbol */}
                            <span className="text-[14px] w-7 shrink-0" title={event.country}>
                              {isEarnings ? '📊' : (COUNTRY_FLAGS[event.country] || event.country)}
                            </span>

                            {/* Event name + AI summary */}
                            <div className="flex-1 min-w-0">
                              <span className={`text-[13px] font-medium ${isEarnings ? 'text-purple-700' : 'text-[#333]'}`}>
                                {isEarnings && event.symbol ? (
                                  <>
                                    <span className="font-bold">{event.symbol}</span>
                                    <span className="font-normal text-[#666]"> Earnings Report</span>
                                  </>
                                ) : event.name}
                              </span>
                              {isPast && summary && (
                                <div className="text-[11px] text-[#888] mt-0.5 truncate" title={summary}>
                                  {summary}
                                </div>
                              )}
                            </div>

                            {/* Earnings estimates */}
                            {isEarnings && (
                              <span className="text-[11px] text-[#666] font-mono hidden sm:inline">
                                {event.epsEstimate != null && `EPS est $${event.epsEstimate.toFixed(2)}`}
                                {event.revenueEstimate != null && event.revenueEstimate > 0 && (
                                  <> · Rev {event.revenueEstimate >= 1e9 ? `$${(event.revenueEstimate / 1e9).toFixed(1)}B` : `$${(event.revenueEstimate / 1e6).toFixed(0)}M`}</>
                                )}
                              </span>
                            )}

                            {/* Forecast / Previous */}
                            {!isEarnings && (event.forecast || event.previous) && (
                              <span className="text-[11px] text-[#666] font-mono hidden sm:inline">
                                {event.forecast && <><span className="text-[#999]">Fcst</span> {event.forecast}</>}
                                {event.forecast && event.previous && ' · '}
                                {event.previous && <><span className="text-[#999]">Prev</span> {event.previous}</>}
                              </span>
                            )}

                            {/* Category */}
                            {!isEarnings && (
                              <span className="text-[11px] text-[#999] hidden sm:inline">
                                {event.category}
                              </span>
                            )}

                            {/* Impact badge */}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 hidden md:inline ${
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
                                    className="text-[10px] bg-[#f0f0f0] px-1.5 py-0.5 rounded hover:bg-[#e0e0e0] transition text-[#666]"
                                    title={`View ${indId} data`}
                                  >
                                    SOTW →
                                  </Link>
                                ))}
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

        {/* Legend + source */}
        <div className="mt-4 flex flex-wrap items-center justify-between text-[11px] text-[#999]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> High Impact</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Medium Impact</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> Major Earnings</span>
          </div>
          <div>
            Sources: <a href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener noreferrer" className="text-[#0066cc] hover:underline">ForexFactory</a> + <a href="https://finnhub.io" target="_blank" rel="noopener noreferrer" className="text-[#0066cc] hover:underline">Finnhub</a> + <a href="https://fred.stlouisfed.org/releases/calendar" target="_blank" rel="noopener noreferrer" className="text-[#0066cc] hover:underline">FRED</a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
