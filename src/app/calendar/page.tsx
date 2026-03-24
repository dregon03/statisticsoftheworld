'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

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
  updatedAt?: string;
}

// ── Constants ──────────────────────────────────────────
const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸', EU: '🇪🇺', Global: '🌍', UK: '🇬🇧', JP: '🇯🇵',
  CN: '🇨🇳', CA: '🇨🇦', AU: '🇦🇺', KR: '🇰🇷', IN: '🇮🇳',
  BR: '🇧🇷', MX: '🇲🇽', CH: '🇨🇭', NZ: '🇳🇿', ZA: '🇿🇦',
  SG: '🇸🇬', HK: '🇭🇰', SE: '🇸🇪', NO: '🇳🇴', DK: '🇩🇰',
};

// Market reaction data for known event types
const MARKET_INTEL: Record<string, {
  whyShort: string;
  assets: string;
  reaction: string;
  watchFor: string;
  bull: string;
  bear: string;
}> = {
  'Consumer Price Index': {
    whyShort: 'Primary US inflation gauge. Directly drives Fed rate expectations.',
    assets: 'USD, US 10Y, Gold, SPX',
    reaction: 'SPX ±0.3% on surprise · 10Y ±5bps',
    watchFor: 'Core CPI and shelter components matter more than headline',
    bull: 'Cooler print supports rate-cut expectations, lifts risk assets',
    bear: 'Hot core print pressures duration and growth stocks',
  },
  'CPI': {
    whyShort: 'Inflation benchmark. Shapes rate path and yield curve.',
    assets: 'Local currency, government bonds',
    reaction: 'Currency ±0.3% on surprise',
    watchFor: 'Core vs headline divergence signals underlying trend',
    bull: 'Below forecast = dovish central bank bias',
    bear: 'Above forecast = hawkish repricing risk',
  },
  'Nonfarm Payrolls': {
    whyShort: 'Most watched US jobs number. Sets macro narrative for weeks.',
    assets: 'USD, US 10Y, SPX, Gold',
    reaction: 'SPX ±0.5% · USD ±0.4% · 10Y ±8bps',
    watchFor: 'Revisions to prior months often matter as much as headline',
    bull: 'Goldilocks: moderate growth without wage pressure',
    bear: 'Too strong = higher-for-longer; too weak = recession fear',
  },
  'Non-Farm Employment Change': {
    whyShort: 'Most watched US jobs number. Sets macro narrative for weeks.',
    assets: 'USD, US 10Y, SPX, Gold',
    reaction: 'SPX ±0.5% · USD ±0.4% · 10Y ±8bps',
    watchFor: 'Revisions to prior months often matter as much as headline',
    bull: 'Goldilocks: moderate growth without wage pressure',
    bear: 'Too strong = higher-for-longer; too weak = recession fear',
  },
  'Flash Manufacturing PMI': {
    whyShort: 'First look at factory activity. Leading indicator for GDP.',
    assets: 'EUR, GBP, local equities',
    reaction: 'Usually ±0.1-0.2% on local currency',
    watchFor: 'Above/below 50 is the expansion/contraction line',
    bull: 'Rising PMI signals recovery, helps cyclicals',
    bear: 'Sub-50 print raises recession concerns',
  },
  'Flash Services PMI': {
    whyShort: 'Services dominate developed economies (60-80% of GDP).',
    assets: 'EUR, GBP, local equities',
    reaction: 'Usually ±0.1-0.2% on local currency',
    watchFor: 'Services weakness hits consumer confidence hard',
    bull: 'Resilient services = soft landing narrative intact',
    bear: 'Services downturn = broader economic weakness spreading',
  },
  'FOMC': {
    whyShort: 'The single most important event for global markets.',
    assets: 'Everything — USD, bonds, equities, commodities, crypto',
    reaction: 'SPX ±1% on surprise · USD ±0.5% · 10Y ±10bps',
    watchFor: 'Dot plot, press conference tone, and forward guidance language',
    bull: 'Dovish pivot or pause signals easing ahead',
    bear: 'Hawkish hold or surprise hike hits all risk assets',
  },
  'Fed Interest Rate Decision': {
    whyShort: 'The single most important event for global markets.',
    assets: 'Everything — USD, bonds, equities, commodities, crypto',
    reaction: 'SPX ±1% on surprise · USD ±0.5% · 10Y ±10bps',
    watchFor: 'Dot plot, press conference tone, and forward guidance language',
    bull: 'Dovish pivot or pause signals easing ahead',
    bear: 'Hawkish hold or surprise hike hits all risk assets',
  },
  'ECB Interest Rate Decision': {
    whyShort: 'Sets monetary policy for the Eurozone. Second most-watched CB.',
    assets: 'EUR, European equities, Bunds',
    reaction: 'EURUSD ±0.4% · DAX ±0.5%',
    watchFor: 'Lagarde press conference often moves markets more than the decision',
    bull: 'Rate cut or dovish guidance lifts European assets',
    bear: 'Hawkish surprise strengthens EUR but pressures equities',
  },
  'BOE Interest Rate Decision': {
    whyShort: 'UK monetary policy decision. Key for GBP and gilts.',
    assets: 'GBP, UK gilts, FTSE',
    reaction: 'GBPUSD ±0.3% · FTSE ±0.4%',
    watchFor: 'Vote split among MPC members signals future direction',
    bull: 'Dovish tilt supports UK equities and housing',
    bear: 'Hawkish hold keeps mortgage rates elevated',
  },
  'BOJ Interest Rate Decision': {
    whyShort: 'Any shift in BOJ policy ripples through global bond markets.',
    assets: 'JPY, JGBs, Nikkei, global bonds',
    reaction: 'USDJPY ±1% on policy change · Nikkei ±1.5%',
    watchFor: 'YCC tweaks and forward guidance on normalization pace',
    bull: 'Status quo = carry trade intact, risk-on',
    bear: 'Hawkish shift triggers global bond selloff via JGB spillover',
  },
  'Unemployment Claims': {
    whyShort: 'Weekly pulse on labor market. Trend matters more than level.',
    assets: 'USD, US equities',
    reaction: 'Usually muted unless trend break (>250K)',
    watchFor: 'Four-week average trend matters more than single week',
    bull: 'Stable claims = labor market holding up',
    bear: 'Rising trend above 250K signals deterioration',
  },
  'Retail Sales': {
    whyShort: 'Direct measure of consumer spending — 70% of US GDP.',
    assets: 'USD, consumer stocks, SPX',
    reaction: 'SPX ±0.2% · Consumer sector ±0.5%',
    watchFor: 'Control group (ex-auto, gas, building) feeds directly into GDP',
    bull: 'Strong consumer = economic resilience',
    bear: 'Weak spending = demand destruction, earnings risk',
  },
  'GDP': {
    whyShort: 'Broadest measure of economic output. Backward-looking but market-moving.',
    assets: 'USD, bonds, equities',
    reaction: 'SPX ±0.2% · Moderate bond move',
    watchFor: 'GDP deflator and consumption components signal underlying health',
    bull: 'Above trend growth supports earnings outlook',
    bear: 'Contraction or sharp slowdown triggers recession narrative',
  },
  'Advance GDP': {
    whyShort: 'First estimate of quarterly GDP. Most market-moving of the three releases.',
    assets: 'USD, bonds, equities',
    reaction: 'SPX ±0.3% on surprise',
    watchFor: 'Inventory vs final sales distinction reveals true demand',
    bull: 'Strong final sales growth = genuine economic momentum',
    bear: 'Negative GDP print, especially if broad-based',
  },
  'PCE Price Index': {
    whyShort: 'The Fed\'s preferred inflation measure. More important than CPI for policy.',
    assets: 'USD, US 10Y, Gold, SPX',
    reaction: 'SPX ±0.3% · 10Y ±4bps',
    watchFor: 'Core PCE is the single most important inflation number for the Fed',
    bull: 'Core PCE declining toward 2% supports rate cuts',
    bear: 'Sticky core PCE delays easing, pressures growth stocks',
  },
};

// Earnings intelligence generator
function getEarningsIntel(event: CalendarEvent): { oneLiner: string; context: string } | null {
  if (event.type !== 'earnings' || !event.symbol) return null;
  const eps = event.epsEstimate;
  const rev = event.revenueEstimate;

  if (eps != null && rev != null && rev > 0) {
    const revB = rev / 1e9;
    if (revB > 50) return { oneLiner: 'Mega-cap report. Sets tone for entire sector.', context: `${event.symbol} is a market bellwether — results move sector peers and index futures.` };
    if (eps > 3) return { oneLiner: 'High expectations priced in. Guidance matters more than beat.', context: `Street expects strong quarter. Watch for forward guidance and margin commentary.` };
    return { oneLiner: 'Estimate consensus in range. Watch for guidance revisions.', context: `EPS and revenue estimates are moderate. Conference call tone will drive after-hours reaction.` };
  }
  if (eps != null) {
    if (eps > 2) return { oneLiner: 'High EPS bar. Beat/miss will move the stock.', context: 'Elevated earnings expectations mean a miss could trigger sharp selling.' };
    return { oneLiner: 'Moderate expectations. Guidance likely to matter more.', context: 'With a reasonable EPS bar, management outlook will drive the stock direction.' };
  }
  return { oneLiner: 'Earnings report — watch for surprise.', context: 'Key event for sector sentiment.' };
}

// Importance scoring for ranking
function getImportanceScore(event: CalendarEvent): number {
  let score = 0;
  if (event.impact === 'high') score += 10;
  else if (event.impact === 'medium') score += 5;
  else score += 1;

  // Known market-moving events get bonus
  const name = event.name;
  if (name.includes('Interest Rate Decision') || name.includes('FOMC')) score += 8;
  if (name.includes('Nonfarm') || name.includes('Non-Farm')) score += 7;
  if (name.includes('CPI') && !name.includes('Core')) score += 6;
  if (name.includes('GDP')) score += 5;
  if (name.includes('PCE')) score += 5;
  if (name.includes('Retail Sales')) score += 4;
  if (name.includes('PMI') && name.includes('Flash')) score += 3;
  if (name.includes('Unemployment Claims')) score += 2;

  // US events weighted higher (global reserve currency)
  if (event.country === 'US') score += 3;
  else if (['EU', 'UK', 'JP', 'CN'].includes(event.country)) score += 1;

  // Earnings: mega-caps get bonus
  if (event.type === 'earnings') {
    score += 5;
    const megaCaps = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA'];
    if (event.symbol && megaCaps.includes(event.symbol)) score += 5;
  }

  // Has forecast = more actionable
  if (event.forecast) score += 1;

  return score;
}

// Find market intel for an event
function findIntel(name: string) {
  for (const [key, intel] of Object.entries(MARKET_INTEL)) {
    if (name.includes(key)) return intel;
  }
  return null;
}

// ── Utility ──────────────────────────────────────────
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
  return { from: dates[0].toISOString().slice(0, 10), to: dates[6].toISOString().slice(0, 10), dates };
}

function formatWeekRange(dates: Date[]): string {
  const from = dates[0], to = dates[6];
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  if (from.getMonth() === to.getMonth()) {
    return `${from.toLocaleDateString('en', { month: 'long', day: 'numeric' })} – ${to.getDate()}, ${to.getFullYear()}`;
  }
  return `${from.toLocaleDateString('en', opts)} – ${to.toLocaleDateString('en', opts)}, ${to.getFullYear()}`;
}

function formatRev(val: number): string {
  if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(0)}M`;
  return `$${val.toLocaleString()}`;
}

function formatTime(time?: string): string {
  if (!time || time.length < 4) return '';
  return time.slice(0, 5);
}

// ── Components ──────────────────────────────────────────

// Skeleton
function SkeletonPulse({ className }: { className: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

function SkeletonTimeline() {
  return (
    <div className="grid grid-cols-5 gap-3 mb-6">
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} className="bg-[#f8f9fa] rounded-xl p-4 border border-[#e8e8e8]">
          <SkeletonPulse className="h-4 w-16 mb-3" />
          <SkeletonPulse className="h-6 w-full mb-2" />
          <SkeletonPulse className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

function SkeletonCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
      {[0, 1, 2].map(i => (
        <div key={i} className="bg-white rounded-xl p-4 border border-[#e8e8e8] animate-pulse">
          <SkeletonPulse className="h-4 w-32 mb-2" />
          <SkeletonPulse className="h-3 w-full mb-1" />
          <SkeletonPulse className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

// Week Timeline — "Battle Map"
function WeekTimeline({ dates, eventsByDate, todayStr, onDayClick }: {
  dates: Date[];
  eventsByDate: Record<string, CalendarEvent[]>;
  todayStr: string;
  onDayClick: (dateStr: string) => void;
}) {
  const weekdays = dates.filter(d => d.getDay() !== 0 && d.getDay() !== 6);

  return (
    <div className="grid grid-cols-5 gap-2 mb-6">
      {weekdays.map(d => {
        const dateStr = d.toISOString().slice(0, 10);
        const dayEvents = eventsByDate[dateStr] || [];
        const isToday = dateStr === todayStr;
        const isPast = dateStr < todayStr;
        const highCount = dayEvents.filter(e => e.impact === 'high').length;
        const earningsCount = dayEvents.filter(e => e.type === 'earnings').length;
        const topEvent = dayEvents.sort((a, b) => getImportanceScore(b) - getImportanceScore(a))[0];

        return (
          <button
            key={dateStr}
            onClick={() => onDayClick(dateStr)}
            className={`rounded-xl p-3 border text-left transition-all hover:shadow-md cursor-pointer ${
              isToday
                ? 'bg-[#0066cc] text-white border-[#0055aa] shadow-lg shadow-blue-100'
                : isPast
                  ? 'bg-[#f8f9fa] border-[#e8e8e8] opacity-70'
                  : 'bg-white border-[#e8e8e8] hover:border-[#ccc]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[11px] font-semibold uppercase tracking-wide ${isToday ? 'text-blue-100' : 'text-[#999]'}`}>
                {d.toLocaleDateString('en', { weekday: 'short' })}
              </span>
              {isToday && <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full font-medium">TODAY</span>}
            </div>
            <div className={`text-[18px] font-bold mb-1.5 ${isToday ? 'text-white' : 'text-[#333]'}`}>
              {d.getDate()}
            </div>

            {/* Event density indicators */}
            <div className="flex gap-0.5 mb-1.5 min-h-[8px]">
              {dayEvents.slice(0, 20).map((e, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full ${
                    e.type === 'earnings' ? (isToday ? 'bg-purple-300' : 'bg-purple-400') :
                    e.impact === 'high' ? (isToday ? 'bg-red-300' : 'bg-red-500') :
                    e.impact === 'medium' ? (isToday ? 'bg-amber-200' : 'bg-amber-400') :
                    (isToday ? 'bg-white/30' : 'bg-gray-200')
                  }`}
                  style={{ height: e.impact === 'high' || e.type === 'earnings' ? 8 : e.impact === 'medium' ? 6 : 4 }}
                />
              ))}
            </div>

            {/* Summary line */}
            <div className={`text-[10px] ${isToday ? 'text-blue-100' : 'text-[#999]'}`}>
              {dayEvents.length > 0 ? (
                <>
                  <span className="font-medium">{dayEvents.length}</span> events
                  {highCount > 0 && <> · <span className={isToday ? 'text-red-200 font-semibold' : 'text-red-500 font-semibold'}>{highCount} high</span></>}
                  {earningsCount > 0 && <> · <span className={isToday ? 'text-purple-200' : 'text-purple-500'}>{earningsCount} earnings</span></>}
                </>
              ) : (
                <span className="italic">No events</span>
              )}
            </div>

            {/* Top event preview */}
            {topEvent && (
              <div className={`text-[10px] mt-1.5 pt-1.5 border-t truncate ${
                isToday ? 'border-white/20 text-blue-100' : 'border-[#f0f0f0] text-[#666]'
              }`}>
                {COUNTRY_FLAGS[topEvent.country] || ''} {topEvent.name}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// "What Matters" — Top Events Cards
function TopEventsSection({ events, todayStr }: { events: CalendarEvent[]; todayStr: string }) {
  const todayEvents = events
    .filter(e => e.date === todayStr)
    .sort((a, b) => getImportanceScore(b) - getImportanceScore(a))
    .slice(0, 5);

  const weekTopEvents = events
    .sort((a, b) => getImportanceScore(b) - getImportanceScore(a))
    .slice(0, 8);

  if (todayEvents.length === 0 && weekTopEvents.length === 0) return null;

  return (
    <div className="mb-6">
      {todayEvents.length > 0 && (
        <div className="mb-4">
          <h2 className="text-[14px] font-bold text-[#333] mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0066cc] animate-pulse" />
            Today&apos;s Key Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {todayEvents.map((event, i) => {
              const intel = event.type === 'earnings' ? null : findIntel(event.name);
              const earningsIntel = getEarningsIntel(event);
              const isEarnings = event.type === 'earnings';
              return (
                <div key={i} className={`rounded-xl p-3 border transition-all hover:shadow-md ${
                  isEarnings
                    ? 'bg-purple-50 border-purple-200'
                    : event.impact === 'high'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-white border-[#e8e8e8]'
                }`}>
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px]">{isEarnings ? '📊' : (COUNTRY_FLAGS[event.country] || event.country)}</span>
                      <span className={`text-[12px] font-semibold ${isEarnings ? 'text-purple-800' : 'text-[#333]'}`}>
                        {isEarnings ? event.symbol : event.name}
                      </span>
                    </div>
                    {event.time && (
                      <span className="text-[10px] font-mono text-[#999] bg-[#f0f0f0] px-1.5 py-0.5 rounded">
                        {formatTime(event.time)}
                      </span>
                    )}
                  </div>

                  {/* Forecast → Previous */}
                  {!isEarnings && (event.forecast || event.previous) && (
                    <div className="flex items-center gap-2 text-[11px] font-mono mb-1">
                      {event.forecast && <span><span className="text-[#999] text-[10px]">Fcst</span> <span className="text-[#333] font-semibold">{event.forecast}</span></span>}
                      {event.previous && <span><span className="text-[#999] text-[10px]">Prev</span> {event.previous}</span>}
                    </div>
                  )}

                  {/* Earnings estimates */}
                  {isEarnings && (
                    <div className="flex items-center gap-2 text-[11px] font-mono mb-1">
                      {event.epsEstimate != null && <span><span className="text-[#999] text-[10px]">EPS</span> <span className="font-semibold">${event.epsEstimate.toFixed(2)}</span></span>}
                      {event.revenueEstimate != null && event.revenueEstimate > 0 && <span><span className="text-[#999] text-[10px]">Rev</span> {formatRev(event.revenueEstimate)}</span>}
                    </div>
                  )}

                  {/* One-liner intel */}
                  <div className="text-[10px] text-[#888] mt-0.5">
                    {intel ? intel.whyShort : earningsIntel ? earningsIntel.oneLiner : ''}
                  </div>

                  {/* Typical reaction */}
                  {intel && (
                    <div className="text-[9px] text-[#aaa] mt-1 font-mono">
                      {intel.reaction}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* This Week's Biggest */}
      <div>
        <h2 className="text-[14px] font-bold text-[#333] mb-2">
          This Week&apos;s Most Important
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {weekTopEvents.map((event, i) => {
            const isEarnings = event.type === 'earnings';
            return (
              <div key={i} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] border transition-all hover:shadow-sm ${
                isEarnings
                  ? 'bg-purple-50 border-purple-200 text-purple-800'
                  : event.impact === 'high'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                <span className="text-[12px]">{isEarnings ? '📊' : (COUNTRY_FLAGS[event.country] || '')}</span>
                <span className="font-medium">{isEarnings ? event.symbol : event.name}</span>
                <span className="text-[9px] opacity-60">
                  {new Date(event.date + 'T00:00:00').toLocaleDateString('en', { weekday: 'short' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Intelligence Card (expandable)
function IntelCard({ event }: { event: CalendarEvent }) {
  const intel = event.type === 'earnings' ? null : findIntel(event.name);
  const earningsIntel = getEarningsIntel(event);
  if (!intel && !earningsIntel) return null;

  if (intel) {
    return (
      <div className="px-4 pb-3 pl-12">
        <div className="bg-[#f8f9fa] rounded-lg p-3 border border-[#e8e8e8] text-[11px] space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] font-semibold text-[#999] uppercase tracking-wider mb-0.5">Why it matters</div>
              <div className="text-[#555]">{intel.whyShort}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-[#999] uppercase tracking-wider mb-0.5">What to watch</div>
              <div className="text-[#555]">{intel.watchFor}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-[#e8e8e8]">
            <div>
              <div className="text-[10px] font-semibold text-[#999] uppercase tracking-wider mb-0.5">Affected assets</div>
              <div className="font-mono text-[#555]">{intel.assets}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-green-600 uppercase tracking-wider mb-0.5">Bull case</div>
              <div className="text-[#555]">{intel.bull}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-red-600 uppercase tracking-wider mb-0.5">Bear case</div>
              <div className="text-[#555]">{intel.bear}</div>
            </div>
          </div>
          <div className="text-[9px] font-mono text-[#aaa] pt-1 border-t border-[#e8e8e8]">
            Typical reaction: {intel.reaction}
          </div>
        </div>
      </div>
    );
  }

  if (earningsIntel) {
    return (
      <div className="px-4 pb-3 pl-12">
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 text-[11px]">
          <div className="font-medium text-purple-800 mb-1">{earningsIntel.oneLiner}</div>
          <div className="text-purple-600">{earningsIntel.context}</div>
        </div>
      </div>
    );
  }

  return null;
}

// ── Main Page ──────────────────────────────────────────
type TabType = 'all' | 'macro' | 'earnings';
type ViewMode = 'full' | 'top10';

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
  const [viewMode, setViewMode] = useState<ViewMode>('top10');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const dayRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const week = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const extFrom = new Date(new Date(week.from).getTime() - 7 * 86400000).toISOString().slice(0, 10);
    const extTo = new Date(new Date(week.to).getTime() + 21 * 86400000).toISOString().slice(0, 10);

    fetch(`/api/calendar?from=${extFrom}&to=${extTo}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => { setEvents(data.events || []); setMeta(data.meta || {}); setLoading(false); })
      .catch(err => { setError(err.message || 'Failed to load'); setLoading(false); });
  }, [weekOffset, week.from, week.to]);

  // AI summaries for past events
  const fetchSummaries = useCallback(async (evts: CalendarEvent[]) => {
    const pastHigh = evts
      .filter(e => e.date < todayStr && e.impact === 'high')
      .map(e => ({ date: e.date, name: e.name, type: e.type, symbol: e.symbol }));
    if (pastHigh.length === 0) return;
    const needed = pastHigh.filter(e => !summaries[`${e.date}|${e.name}|${e.symbol || ''}`]);
    if (needed.length === 0) return;
    try {
      const resp = await fetch('/api/calendar/summaries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: needed }),
      });
      const data = await resp.json();
      if (data.summaries) setSummaries(prev => ({ ...prev, ...data.summaries }));
    } catch { /* silent */ }
  }, [summaries, todayStr]);

  useEffect(() => { if (events.length > 0) fetchSummaries(events); }, [events, fetchSummaries]);

  const countries = useMemo(() => [...new Set(events.map(e => e.country))].sort(), [events]);
  const categories = useMemo(() => [...new Set(events.map(e => e.category))].filter(c => c !== 'Earnings').sort(), [events]);

  // Filter events
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

  // Group by date for current week
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const d of week.dates) map[d.toISOString().slice(0, 10)] = [];
    for (const e of filtered) { if (map[e.date]) map[e.date].push(e); }
    // Sort: high impact first, then medium, then low; economic before earnings within same tier
    const impOrd = { high: 0, medium: 1, low: 2 };
    for (const date of Object.keys(map)) {
      map[date].sort((a, b) => {
        if (a.type !== b.type) return a.type === 'economic' ? -1 : 1;
        return impOrd[a.impact] - impOrd[b.impact];
      });
    }
    return map;
  }, [filtered, week.dates]);

  // Week events flattened (for current week only)
  const weekEvents = useMemo(() =>
    week.dates.reduce<CalendarEvent[]>((acc, d) => acc.concat(eventsByDate[d.toISOString().slice(0, 10)] || []), []),
    [week.dates, eventsByDate]
  );

  const totalThisWeek = weekEvents.length;
  const highThisWeek = weekEvents.filter(e => e.impact === 'high').length;
  const earningsThisWeek = weekEvents.filter(e => e.type === 'earnings').length;

  // Top 10 mode
  const top10Events = useMemo(() =>
    [...weekEvents].sort((a, b) => getImportanceScore(b) - getImportanceScore(a)).slice(0, 10),
    [weekEvents]
  );

  const toggleExpand = (key: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const scrollToDay = (dateStr: string) => {
    dayRefs.current[dateStr]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Render event row
  const renderEventRow = (event: CalendarEvent, i: number, dateStr: string) => {
    const isEarnings = event.type === 'earnings';
    const isPast = event.date < todayStr;
    const isReleased = isPast;
    const rowKey = `${dateStr}-${event.name}-${event.symbol || ''}-${i}`;
    const isExpanded = expandedRows.has(rowKey);
    const hasIntel = !!(findIntel(event.name) || getEarningsIntel(event));
    const summaryKey = `${event.date}|${event.name}|${event.symbol || ''}`;
    const summary = summaries[summaryKey];

    return (
      <div key={rowKey}>
        <div
          className={`flex items-center px-4 py-2.5 transition gap-3 group cursor-pointer ${
            isReleased ? 'opacity-60 hover:opacity-90' : 'hover:bg-[#f8f9fa]'
          }`}
          onClick={() => hasIntel && toggleExpand(rowKey)}
        >
          {/* Impact indicator */}
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            isEarnings ? 'bg-purple-500 ring-2 ring-purple-100' :
            event.impact === 'high' ? 'bg-red-500 ring-2 ring-red-100' :
            event.impact === 'medium' ? 'bg-amber-400' :
            'bg-gray-300'
          }`} />

          {/* Time */}
          <span className="w-12 shrink-0 text-[10px] font-mono text-[#999] hidden sm:block">
            {formatTime(event.time) || '—'}
          </span>

          {/* Country flag */}
          <span className="text-[14px] w-7 shrink-0" title={event.country}>
            {isEarnings ? '📊' : (COUNTRY_FLAGS[event.country] || event.country)}
          </span>

          {/* Event name */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`text-[13px] font-medium ${
                isReleased ? 'text-[#888]' :
                isEarnings ? 'text-purple-700' :
                event.impact === 'high' ? 'text-[#111] font-semibold' :
                'text-[#333]'
              }`}>
                {isEarnings && event.symbol ? (
                  <><span className="font-bold">{event.symbol}</span> <span className="font-normal text-[#666]">Earnings</span></>
                ) : event.name}
              </span>
              {hasIntel && (
                <span className={`text-[9px] px-1 py-0.5 rounded transition ${
                  isExpanded ? 'bg-[#0066cc] text-white' : 'bg-[#f0f0f0] text-[#999] group-hover:bg-[#e0e0e0]'
                }`}>
                  {isExpanded ? '▼' : 'Intel'}
                </span>
              )}
            </div>
            {isPast && summary && (
              <div className="text-[10px] text-[#888] mt-0.5 truncate italic">{summary}</div>
            )}
          </div>

          {/* Forecast / EPS */}
          <span className="w-20 text-right text-[11px] font-mono hidden sm:block">
            {isEarnings ? (
              event.epsEstimate != null ? (
                <span className="text-[#333]"><span className="text-[#999] text-[10px]">EPS </span>${event.epsEstimate.toFixed(2)}</span>
              ) : <span className="text-[#ddd]">—</span>
            ) : (
              event.forecast ? (
                <span className="text-[#333] font-semibold">{event.forecast}</span>
              ) : <span className="text-[#ddd]">—</span>
            )}
          </span>

          {/* Previous / Revenue */}
          <span className="w-20 text-right text-[11px] font-mono text-[#666] hidden sm:block">
            {isEarnings ? (
              event.revenueEstimate != null && event.revenueEstimate > 0 ? (
                <span><span className="text-[#999] text-[10px]">Rev </span>{formatRev(event.revenueEstimate)}</span>
              ) : <span className="text-[#ddd]">—</span>
            ) : (
              event.previous ? event.previous : <span className="text-[#ddd]">—</span>
            )}
          </span>

          {/* Category */}
          <span className="w-20 text-right text-[10px] text-[#999] hidden lg:block truncate">{event.category}</span>

          {/* Impact badge */}
          <span className={`text-[9px] px-2 py-0.5 rounded-full border shrink-0 hidden md:inline font-medium ${
            isEarnings ? 'bg-purple-50 text-purple-700 border-purple-200' :
            event.impact === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
            event.impact === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
            'bg-gray-50 text-gray-500 border-gray-200'
          }`}>
            {isEarnings ? 'Earnings' : event.impact === 'high' ? 'High' : event.impact === 'medium' ? 'Med' : 'Low'}
          </span>

          {/* SOTW link */}
          {event.sotwIndicators && event.sotwIndicators.length > 0 && (
            <Link
              href={`/indicators?id=${encodeURIComponent(event.sotwIndicators[0])}`}
              className="text-[9px] bg-[#e8f0fe] px-1.5 py-0.5 rounded hover:bg-[#d0e0f8] transition text-[#0066cc] shrink-0"
              title="View historical data"
              onClick={e => e.stopPropagation()}
            >
              Chart →
            </Link>
          )}
        </div>

        {/* Expanded intelligence card */}
        {isExpanded && <IntelCard event={event} />}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#fafbfc] text-[#333]">
      <Nav />

      <section className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-[28px] font-bold mb-1">Economic Calendar</h1>
          <p className="text-[13px] text-[#666]">
            Track the week&apos;s most important macro events, earnings, and market-moving releases.
          </p>
        </div>

        {/* Status bar */}
        <div className="flex flex-wrap items-center gap-3 mb-5 px-4 py-2 bg-white border border-[#e8e8e8] rounded-lg text-[11px] text-[#666]">
          {loading ? (
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" /><span className="text-[#999]">Loading feeds...</span></div>
          ) : error ? (
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400" /><span className="text-red-600">Feed error</span></div>
          ) : (
            <>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-400" /><span>All feeds operational</span></div>
              <span className="text-[#ddd]">|</span>
              <span><strong className="text-[#333]">{totalThisWeek}</strong> events</span>
              {highThisWeek > 0 && <><span className="text-[#ddd]">|</span><span><strong className="text-red-600">{highThisWeek}</strong> high impact</span></>}
              {earningsThisWeek > 0 && <><span className="text-[#ddd]">|</span><span><strong className="text-purple-600">{earningsThisWeek}</strong> earnings</span></>}
            </>
          )}
          <div className="ml-auto text-[#999]">
            {meta.updatedAt && <span>Updated {new Date(meta.updatedAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}</span>}
          </div>
        </div>

        {/* Week nav */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setWeekOffset(w => w - 1)} className="px-3 py-1.5 border border-[#e8e8e8] rounded-lg text-[12px] hover:bg-white transition bg-white">← Prev</button>
            <button onClick={() => setWeekOffset(0)} className={`px-3 py-1.5 border rounded-lg text-[12px] transition ${weekOffset === 0 ? 'bg-[#0066cc] text-white border-[#0066cc]' : 'border-[#e8e8e8] hover:bg-white bg-white'}`}>This Week</button>
            <button onClick={() => setWeekOffset(w => w + 1)} className="px-3 py-1.5 border border-[#e8e8e8] rounded-lg text-[12px] hover:bg-white transition bg-white">Next →</button>
          </div>
          <div className="text-[14px] font-semibold text-[#333]">{formatWeekRange(week.dates)}</div>
        </div>

        {/* Week Timeline "Battle Map" */}
        {loading ? <SkeletonTimeline /> : !error && (
          <WeekTimeline dates={week.dates} eventsByDate={eventsByDate} todayStr={todayStr} onDayClick={scrollToDay} />
        )}

        {/* Top Events / What Matters */}
        {loading ? <SkeletonCards /> : !error && (
          <TopEventsSection events={weekEvents} todayStr={todayStr} />
        )}

        {/* View mode + Tabs */}
        <div className="flex items-center justify-between mb-3 border-b border-[#e8e8e8]">
          <div className="flex items-center gap-0">
            {([
              { id: 'all' as TabType, label: 'All Events', count: totalThisWeek },
              { id: 'macro' as TabType, label: 'Macro', count: weekEvents.filter(e => e.type === 'economic').length },
              { id: 'earnings' as TabType, label: 'Earnings', count: earningsThisWeek },
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-[12px] font-medium border-b-2 transition -mb-px ${
                  activeTab === tab.id ? 'border-[#0066cc] text-[#0066cc]' : 'border-transparent text-[#999] hover:text-[#666]'
                }`}
              >
                {tab.label} <span className="text-[10px] opacity-60">({tab.count})</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 mb-1">
            <button
              onClick={() => setViewMode('top10')}
              className={`px-2.5 py-1 text-[10px] rounded-l-lg border font-medium transition ${
                viewMode === 'top10' ? 'bg-[#0066cc] text-white border-[#0066cc]' : 'bg-white text-[#666] border-[#e8e8e8] hover:bg-[#f5f5f5]'
              }`}
            >
              Top 10
            </button>
            <button
              onClick={() => setViewMode('full')}
              className={`px-2.5 py-1 text-[10px] rounded-r-lg border font-medium transition ${
                viewMode === 'full' ? 'bg-[#0066cc] text-white border-[#0066cc]' : 'bg-white text-[#666] border-[#e8e8e8] hover:bg-[#f5f5f5]'
              }`}
            >
              Full Calendar
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} className="border border-[#e8e8e8] rounded-lg px-3 py-1.5 text-[12px] outline-none bg-white">
            <option value="">All Countries</option>
            {countries.map(c => <option key={c} value={c}>{COUNTRY_FLAGS[c] || ''} {c}</option>)}
          </select>
          <select value={filterImpact} onChange={e => setFilterImpact(e.target.value)} className="border border-[#e8e8e8] rounded-lg px-3 py-1.5 text-[12px] outline-none bg-white">
            <option value="">All Impact</option>
            <option value="high">High Impact</option>
            <option value="medium">Medium Impact</option>
            <option value="low">Low Impact</option>
          </select>
          {activeTab !== 'earnings' && (
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="border border-[#e8e8e8] rounded-lg px-3 py-1.5 text-[12px] outline-none bg-white">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          {(filterCountry || filterImpact || filterCategory) && (
            <button onClick={() => { setFilterCountry(''); setFilterImpact(''); setFilterCategory(''); }} className="px-3 py-1.5 text-[11px] text-[#999] hover:text-[#333] transition">Clear filters</button>
          )}
        </div>

        {/* Error state */}
        {error && !loading && (
          <div className="border border-red-200 bg-red-50 rounded-xl p-6 text-center mb-6">
            <div className="text-[14px] font-medium text-red-700 mb-1">Unable to load calendar</div>
            <div className="text-[12px] text-red-600 mb-3">{error}</div>
            <button onClick={() => { setError(null); setLoading(true); setWeekOffset(w => w); }} className="px-4 py-1.5 text-[12px] bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Retry</button>
          </div>
        )}

        {/* ── TOP 10 VIEW ── */}
        {!loading && !error && viewMode === 'top10' && (
          <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
            {/* Column headers */}
            <div className="hidden sm:flex items-center px-4 py-1.5 bg-[#f0f1f3] border-b border-[#e8e8e8] text-[10px] font-medium text-[#999] uppercase tracking-wider gap-3">
              <span className="w-2.5 shrink-0" />
              <span className="w-12 shrink-0">Time</span>
              <span className="w-7 shrink-0">Ctry</span>
              <span className="flex-1">Event</span>
              <span className="w-20 text-right">Forecast</span>
              <span className="w-20 text-right">Previous</span>
              <span className="w-20 text-right hidden lg:block">Category</span>
              <span className="w-16 text-right hidden md:block">Impact</span>
            </div>
            <div className="divide-y divide-[#f0f0f0]">
              {top10Events.length === 0 ? (
                <div className="px-4 py-8 text-center text-[#999] text-[13px]">No events this week match your filters.</div>
              ) : (
                top10Events.map((event, i) => renderEventRow(event, i, event.date))
              )}
            </div>
            <div className="px-4 py-2 bg-[#f8f9fa] border-t border-[#e8e8e8] text-center">
              <button onClick={() => setViewMode('full')} className="text-[11px] text-[#0066cc] hover:underline font-medium">
                View full calendar ({totalThisWeek} events) →
              </button>
            </div>
          </div>
        )}

        {/* ── FULL CALENDAR VIEW ── */}
        {!loading && !error && viewMode === 'full' && (
          <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
            {/* Column headers */}
            <div className="hidden sm:flex items-center px-4 py-1.5 bg-[#f0f1f3] border-b border-[#e8e8e8] text-[10px] font-medium text-[#999] uppercase tracking-wider gap-3 sticky top-0 z-10">
              <span className="w-2.5 shrink-0" />
              <span className="w-12 shrink-0">Time</span>
              <span className="w-7 shrink-0">Ctry</span>
              <span className="flex-1">Event</span>
              <span className="w-20 text-right">Forecast</span>
              <span className="w-20 text-right">Previous</span>
              <span className="w-20 text-right hidden lg:block">Category</span>
              <span className="w-16 text-right hidden md:block">Impact</span>
            </div>

            {week.dates.map(d => {
              const dateStr = d.toISOString().slice(0, 10);
              const dayEvents = eventsByDate[dateStr] || [];
              const isToday = dateStr === todayStr;
              const isPastDay = dateStr < todayStr;
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              if (isWeekend && dayEvents.length === 0) return null;
              const highCount = dayEvents.filter(e => e.impact === 'high').length;

              return (
                <div key={dateStr} ref={el => { dayRefs.current[dateStr] = el; }} className={isToday ? 'bg-blue-50/30' : isPastDay ? 'opacity-70' : ''}>
                  {/* Day header — sticky */}
                  <div className={`px-4 py-2 border-b border-[#e8e8e8] flex items-center justify-between sticky top-0 z-[5] ${
                    isToday ? 'bg-[#e8f0fe]' : 'bg-[#f8f9fa]'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-[13px] font-semibold ${isToday ? 'text-[#0066cc]' : 'text-[#333]'}`}>
                        {d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      {isToday && <span className="text-[10px] bg-[#0066cc] text-white px-1.5 py-0.5 rounded font-medium">Today</span>}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#999]">
                      {highCount > 0 && <span className="text-red-500 font-semibold">{highCount} high</span>}
                      <span>{dayEvents.length > 0 ? `${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}` : ''}</span>
                    </div>
                  </div>

                  {dayEvents.length === 0 ? (
                    <div className="px-4 py-3 text-[12px] text-[#ccc] border-b border-[#f0f0f0]">No scheduled releases</div>
                  ) : (
                    <div className="divide-y divide-[#f0f0f0] border-b border-[#e8e8e8]">
                      {dayEvents.map((event, i) => renderEventRow(event, i, dateStr))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Source footer */}
        <div className="mt-5 px-4 py-3 bg-white border border-[#e8e8e8] rounded-lg">
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
