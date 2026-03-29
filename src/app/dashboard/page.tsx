'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import LiveCounters from '@/components/LiveCounter';

interface Quote { id: string; label: string; price: number; previousClose: number; change: number; changePct: number; }
interface CalendarEvent { date: string; name: string; country: string; impact: string; type: string; symbol?: string; }
interface TrendingInsight { title: string; countries: { id: string; name: string; value: number }[]; indicatorId: string; }

export default function DashboardPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [trending, setTrending] = useState<TrendingInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/quotes').then(r => r.json()).catch(() => ({ quotes: [] })),
      fetch('/api/calendar').then(r => r.json()).catch(() => ({ events: [] })),
      fetch('/api/trending').then(r => r.json()).catch(() => ({ insights: [] })),
    ]).then(([q, c, t]) => {
      setQuotes((q.quotes || []).slice(0, 12));
      // Next 7 days of events
      const today = new Date().toISOString().slice(0, 10);
      const week = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
      setEvents((c.events || []).filter((e: CalendarEvent) => e.date >= today && e.date <= week).slice(0, 10));
      setTrending((t.insights || []).slice(0, 4));
      setLoading(false);
    });
  }, []);

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#1a1a2e]">
      <Nav />

      <section className="max-w-[1200px] mx-auto px-4 py-8">
        <h1 className="text-[28px] font-bold mb-1">Global Dashboard</h1>
        <p className="text-[15px] text-[#64748b] mb-6">Real-time pulse of the global economy.</p>

        {/* Live counters */}
        <div className="border border-gray-100 rounded-xl p-5 mb-6">
          <LiveCounters />
        </div>

        {loading ? (
          <div className="text-center py-16 text-[#64748b]">Loading dashboard...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Markets */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-[#f4f6f9] border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-[14px] font-semibold">Markets</h2>
                <Link href="/markets" className="text-[15px] text-[#0066cc] hover:underline">View all →</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {quotes.map(q => (
                  <div key={q.id} className="flex items-center justify-between px-4 py-2 text-[14px]">
                    <span className="text-[#0d1b2a] font-medium truncate flex-1">{q.label}</span>
                    <span className="font-mono text-[#0d1b2a] w-20 text-right">{q.price?.toFixed(2)}</span>
                    <span className={`font-mono w-16 text-right ${q.changePct >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {q.changePct >= 0 ? '+' : ''}{q.changePct?.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-[#f4f6f9] border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-[14px] font-semibold">Upcoming Events</h2>
                <Link href="/calendar" className="text-[15px] text-[#0066cc] hover:underline">Full calendar →</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {events.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[14px] text-[#64748b]">No upcoming events</div>
                ) : events.map((e, i) => (
                  <div key={i} className="px-4 py-2 text-[14px]">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${e.impact === 'high' ? 'bg-red-500' : e.type === 'earnings' ? 'bg-purple-500' : 'bg-amber-400'}`} />
                      <span className="text-[#0d1b2a] font-medium truncate">{e.type === 'earnings' && e.symbol ? `${e.symbol} Earnings` : e.name}</span>
                    </div>
                    <div className="text-[15px] text-[#64748b] ml-3.5">{e.date} · {e.country}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-[#f4f6f9] border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-[14px] font-semibold">Trending Data</h2>
                <Link href="/trending" className="text-[15px] text-[#0066cc] hover:underline">View all →</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {trending.map((t, i) => (
                  <div key={i} className="px-4 py-2.5">
                    <Link href={`/indicators?id=${encodeURIComponent(t.indicatorId)}`} className="text-[15px] font-medium text-[#0d1b2a] hover:text-[#0066cc]">
                      {t.title}
                    </Link>
                    <div className="text-[15px] text-[#64748b] mt-0.5">
                      {t.countries.slice(0, 3).map(c => c.name).join(', ')}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="mt-8 flex flex-wrap gap-2">
          {[
            { href: '/ranking/gdp', label: 'GDP Rankings' },
            { href: '/ranking/inflation-rate', label: 'Inflation' },
            { href: '/ranking/unemployment-rate', label: 'Unemployment' },
            { href: '/heatmap', label: 'Heatmap' },
            { href: '/forecasts', label: 'Forecasts' },
            { href: '/compare', label: 'Compare' },
            { href: '/trade', label: 'Trade Explorer' },
            { href: '/scatter', label: 'Scatter Plot' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="px-3 py-1.5 text-[14px] border border-gray-200 rounded-lg hover:bg-gray-50 text-[#64748b]">
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
