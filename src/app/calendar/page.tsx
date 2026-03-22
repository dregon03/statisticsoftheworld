'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

// ============================================================
// LIVE ECONOMIC EVENTS (from Yahoo Finance)
// ============================================================

interface LiveEvent {
  event: string;
  countryCode: string;
  eventTime: number;
  period: string;
  actual: string;
  estimate: string;
  prior: string;
  description: string;
}

// ISO2 country code to ISO3 mapping for linking
const ISO2_TO_ISO3: Record<string, string> = {
  US: 'USA', CA: 'CAN', GB: 'GBR', DE: 'DEU', FR: 'FRA', JP: 'JPN', CN: 'CHN',
  AU: 'AUS', NZ: 'NZL', CH: 'CHE', SE: 'SWE', NO: 'NOR', DK: 'DNK', FI: 'FIN',
  IT: 'ITA', ES: 'ESP', NL: 'NLD', BE: 'BEL', AT: 'AUT', PT: 'PRT', IE: 'IRL',
  KR: 'KOR', IN: 'IND', BR: 'BRA', MX: 'MEX', ZA: 'ZAF', TR: 'TUR', PL: 'POL',
  RU: 'RUS', IL: 'ISR', SA: 'SAU', SG: 'SGP', HK: 'HKG', TW: 'TWN', ID: 'IDN',
  TH: 'THA', MY: 'MYS', PH: 'PHL', CL: 'CHL', AR: 'ARG', CO: 'COL', EG: 'EGY',
};

function LiveEventsTab() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCountry, setFilterCountry] = useState('');

  useEffect(() => {
    fetch('/api/calendar')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setEvents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const countries = [...new Set(events.map(e => e.countryCode))].sort();

  const filtered = filterCountry
    ? events.filter(e => e.countryCode === filterCountry)
    : events;

  if (loading) return <div className="text-center py-16 text-[#999]">Loading economic events...</div>;
  if (events.length === 0) return <div className="text-center py-16 text-[#999]">No events available. Try again later.</div>;

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <select
          value={filterCountry}
          onChange={e => setFilterCountry(e.target.value)}
          className="border border-[#e8e8e8] rounded-lg px-3 py-1.5 text-[12px] outline-none"
        >
          <option value="">All Countries ({events.length} events)</option>
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="border border-[#e8e8e8] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-[11px] text-[#999] uppercase border-b border-[#e8e8e8] bg-[#f8f9fa]">
              <th className="px-4 py-2.5 text-left">Time</th>
              <th className="px-4 py-2.5 text-left w-10">Country</th>
              <th className="px-4 py-2.5 text-left">Event</th>
              <th className="px-4 py-2.5 text-left">Period</th>
              <th className="px-4 py-2.5 text-right">Actual</th>
              <th className="px-4 py-2.5 text-right">Forecast</th>
              <th className="px-4 py-2.5 text-right">Previous</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((event, i) => {
              const time = event.eventTime ? new Date(event.eventTime) : null;
              const iso3 = ISO2_TO_ISO3[event.countryCode];
              const hasSurprise = event.actual && event.estimate &&
                parseFloat(event.actual) !== parseFloat(event.estimate);
              const isPositiveSurprise = hasSurprise &&
                parseFloat(event.actual) > parseFloat(event.estimate);

              return (
                <tr key={i} className="border-b border-[#f0f0f0] hover:bg-[#f8f9fa] transition" title={event.description}>
                  <td className="px-4 py-2 text-[12px] text-[#999] whitespace-nowrap">
                    {time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td className="px-4 py-2 text-[12px]">
                    {iso3 ? (
                      <Link href={`/country/${iso3}`} className="text-[#0066cc] hover:underline font-medium">
                        {event.countryCode}
                      </Link>
                    ) : (
                      <span className="font-medium">{event.countryCode}</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-[13px] text-[#333]">{event.event}</td>
                  <td className="px-4 py-2 text-[12px] text-[#999]">{event.period}</td>
                  <td className={`px-4 py-2 text-right font-mono text-[12px] font-semibold ${
                    hasSurprise ? (isPositiveSurprise ? 'text-[#2ecc40]' : 'text-[#e74c3c]') : 'text-[#333]'
                  }`}>
                    {event.actual || '—'}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-[12px] text-[#666]">
                    {event.estimate || '—'}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-[12px] text-[#999]">
                    {event.prior || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-[11px] text-[#999]">
        Data sourced from Yahoo Finance. Updated every 15 minutes. Green = beat forecast, Red = missed forecast.
      </div>
    </div>
  );
}

// Known release schedules for major international org data
// These are recurring releases that SOTW users care about
interface CalendarEvent {
  name: string;
  org: string;
  frequency: string;
  description: string;
  url: string;
  months: number[]; // which months this typically releases (1-12)
  indicators: string[]; // related SOTW indicator IDs
  importance: 'high' | 'medium' | 'low';
}

const CALENDAR_EVENTS: CalendarEvent[] = [
  // IMF
  {
    name: 'IMF World Economic Outlook',
    org: 'IMF',
    frequency: 'Biannual (April & October)',
    description: 'GDP, inflation, unemployment, and fiscal forecasts for 196 countries. Includes 5-year projections. The most influential macroeconomic forecast publication globally.',
    url: 'https://www.imf.org/en/publications/weo',
    months: [4, 10],
    indicators: ['IMF.NGDPD', 'IMF.NGDP_RPCH', 'IMF.PCPIPCH', 'IMF.LUR', 'IMF.GGXWDG_NGDP'],
    importance: 'high',
  },
  {
    name: 'IMF WEO Update',
    org: 'IMF',
    frequency: 'Biannual (January & July)',
    description: 'Interim update to the WEO with revised GDP growth and inflation projections. Shorter than the full WEO but often market-moving.',
    url: 'https://www.imf.org/en/publications/weo',
    months: [1, 7],
    indicators: ['IMF.NGDPD', 'IMF.NGDP_RPCH', 'IMF.PCPIPCH'],
    importance: 'high',
  },
  {
    name: 'IMF Global Financial Stability Report',
    org: 'IMF',
    frequency: 'Biannual (April & October)',
    description: 'Analysis of global financial market conditions, risks, and vulnerabilities. Released alongside the WEO.',
    url: 'https://www.imf.org/en/publications/gfsr',
    months: [4, 10],
    indicators: [],
    importance: 'medium',
  },
  {
    name: 'IMF Fiscal Monitor',
    org: 'IMF',
    frequency: 'Biannual (April & October)',
    description: 'Analysis of global fiscal policy developments, including government debt and deficit projections.',
    url: 'https://www.imf.org/en/publications/fm',
    months: [4, 10],
    indicators: ['IMF.GGXWDG_NGDP', 'IMF.GGXCNL_NGDP'],
    importance: 'medium',
  },
  // World Bank
  {
    name: 'World Bank World Development Indicators Update',
    org: 'World Bank',
    frequency: 'Quarterly (latest by mid-year)',
    description: 'Comprehensive update to 1,600+ indicators for 217 countries. The largest freely available development data compilation.',
    url: 'https://datatopics.worldbank.org/world-development-indicators/',
    months: [3, 6, 9, 12],
    indicators: ['SP.POP.TOTL', 'SP.DYN.LE00.IN', 'NY.GDP.MKTP.CD'],
    importance: 'high',
  },
  {
    name: 'World Bank Global Economic Prospects',
    org: 'World Bank',
    frequency: 'Biannual (January & June)',
    description: 'GDP growth forecasts and analysis of global economic trends, with focus on emerging and developing economies.',
    url: 'https://www.worldbank.org/en/publication/global-economic-prospects',
    months: [1, 6],
    indicators: ['IMF.NGDP_RPCH'],
    importance: 'high',
  },
  {
    name: 'World Bank Poverty & Shared Prosperity Report',
    org: 'World Bank',
    frequency: 'Biennial (even years, October)',
    description: 'Flagship poverty report with updated poverty headcounts and inequality measures.',
    url: 'https://www.worldbank.org/en/publication/poverty-and-shared-prosperity',
    months: [10],
    indicators: ['SI.POV.DDAY', 'SI.POV.GINI'],
    importance: 'medium',
  },
  // UN
  {
    name: 'UN World Population Prospects',
    org: 'United Nations',
    frequency: 'Biennial (odd years, July)',
    description: 'Demographic estimates and projections for all countries: population, fertility, mortality, migration.',
    url: 'https://population.un.org/wpp/',
    months: [7],
    indicators: ['SP.POP.TOTL', 'SP.DYN.TFRT.IN', 'SP.DYN.LE00.IN'],
    importance: 'high',
  },
  {
    name: 'UN Human Development Report',
    org: 'United Nations (UNDP)',
    frequency: 'Annual (varies, typically Q4)',
    description: 'Human Development Index rankings and analysis of human development trends.',
    url: 'https://hdr.undp.org/',
    months: [9, 10, 11],
    indicators: [],
    importance: 'medium',
  },
  {
    name: 'UNCTAD World Investment Report',
    org: 'UNCTAD',
    frequency: 'Annual (June)',
    description: 'Analysis of global FDI trends, with country-level data on investment flows.',
    url: 'https://unctad.org/topic/investment/world-investment-report',
    months: [6],
    indicators: ['BX.KLT.DINV.WD.GD.ZS'],
    importance: 'medium',
  },
  // ILO
  {
    name: 'ILO World Employment & Social Outlook',
    org: 'ILO',
    frequency: 'Annual (January)',
    description: 'Global employment trends, unemployment projections, and analysis of labor market challenges.',
    url: 'https://www.ilo.org/global/research/global-reports/weso',
    months: [1],
    indicators: ['SL.UEM.TOTL.ZS', 'SL.TLF.CACT.ZS'],
    importance: 'medium',
  },
  // WHO
  {
    name: 'WHO World Health Statistics',
    org: 'WHO',
    frequency: 'Annual (May)',
    description: 'Health statistics for WHO member states: life expectancy, disease burden, health system resources.',
    url: 'https://www.who.int/data/gho/publications/world-health-statistics',
    months: [5],
    indicators: ['SH.XPD.CHEX.GD.ZS', 'SH.DYN.MORT', 'SP.DYN.LE00.IN'],
    importance: 'medium',
  },
  // FRED/US
  {
    name: 'US Bureau of Labor Statistics — Jobs Report',
    org: 'BLS (US)',
    frequency: 'Monthly (first Friday)',
    description: 'Nonfarm payrolls, unemployment rate, and labor force participation. The most market-moving US economic release.',
    url: 'https://www.bls.gov/news.release/empsit.nr0.htm',
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    indicators: ['FRED.UNRATE', 'FRED.PAYEMS'],
    importance: 'high',
  },
  {
    name: 'US Bureau of Labor Statistics — CPI Report',
    org: 'BLS (US)',
    frequency: 'Monthly (mid-month)',
    description: 'Consumer Price Index measuring US inflation. Key input for Federal Reserve policy decisions.',
    url: 'https://www.bls.gov/cpi/',
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    indicators: ['FRED.CPIAUCSL'],
    importance: 'high',
  },
  {
    name: 'US Federal Reserve — FOMC Meeting',
    org: 'Federal Reserve',
    frequency: '8 times/year',
    description: 'Federal Open Market Committee sets the federal funds rate and releases economic projections.',
    url: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm',
    months: [1, 3, 5, 6, 7, 9, 11, 12],
    indicators: ['FRED.FEDFUNDS'],
    importance: 'high',
  },
  // ECB
  {
    name: 'ECB Monetary Policy Decision',
    org: 'ECB',
    frequency: '6 times/year',
    description: 'European Central Bank interest rate decisions and macroeconomic projections for the euro area.',
    url: 'https://www.ecb.europa.eu/mopo/decisions/html/index.en.html',
    months: [1, 3, 4, 6, 9, 10, 12],
    indicators: ['FRED.CBRATE'],
    importance: 'high',
  },
  // UNESCO
  {
    name: 'UNESCO Global Education Monitoring Report',
    org: 'UNESCO',
    frequency: 'Annual (varies)',
    description: 'Tracks progress toward SDG 4 (Education) with global enrollment, literacy, and spending data.',
    url: 'https://www.unesco.org/gem-report/',
    months: [7, 10],
    indicators: ['SE.ADT.LITR.ZS', 'SE.XPD.TOTL.GD.ZS'],
    importance: 'medium',
  },
];

const ORGS = [...new Set(CALENDAR_EVENTS.map(e => e.org))].sort();
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const IMPORTANCE_COLORS = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-gray-50 text-gray-600 border-gray-200',
};

export default function CalendarPage() {
  const [tab, setTab] = useState<'live' | 'schedule'>('live');
  const [filterOrg, setFilterOrg] = useState('');
  const [filterImportance, setFilterImportance] = useState('');
  const [view, setView] = useState<'timeline' | 'list'>('timeline');

  const currentMonth = new Date().getMonth() + 1; // 1-12

  const filtered = CALENDAR_EVENTS.filter(e => {
    if (filterOrg && e.org !== filterOrg) return false;
    if (filterImportance && e.importance !== filterImportance) return false;
    return true;
  });

  return (
    <main className="min-h-screen">
      <Nav />

      <section className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-[28px] font-bold mb-1">Economic Calendar</h1>
          <p className="text-[13px] text-[#999]">
            Live economic data releases and international organization publication schedules.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#f0f0f0] rounded-lg p-0.5 w-fit">
          <button
            onClick={() => setTab('live')}
            className={`px-4 py-1.5 rounded text-[13px] transition ${tab === 'live' ? 'bg-white shadow-sm font-medium' : 'text-[#666]'}`}
          >
            Live Events
          </button>
          <button
            onClick={() => setTab('schedule')}
            className={`px-4 py-1.5 rounded text-[13px] transition ${tab === 'schedule' ? 'bg-white shadow-sm font-medium' : 'text-[#666]'}`}
          >
            Publication Schedule
          </button>
        </div>

        {tab === 'live' ? (
          <LiveEventsTab />
        ) : (
        <>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={filterOrg}
            onChange={e => setFilterOrg(e.target.value)}
            className="border border-[#e8e8e8] rounded-lg px-3 py-1.5 text-[12px] outline-none"
          >
            <option value="">All Organizations</option>
            {ORGS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <select
            value={filterImportance}
            onChange={e => setFilterImportance(e.target.value)}
            className="border border-[#e8e8e8] rounded-lg px-3 py-1.5 text-[12px] outline-none"
          >
            <option value="">All Importance</option>
            <option value="high">High Impact</option>
            <option value="medium">Medium Impact</option>
          </select>
          <div className="flex gap-1 ml-auto bg-[#f0f0f0] rounded-lg p-0.5">
            <button
              onClick={() => setView('timeline')}
              className={`px-3 py-1 rounded text-[12px] transition ${view === 'timeline' ? 'bg-white shadow-sm font-medium' : 'text-[#666]'}`}
            >Timeline</button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1 rounded text-[12px] transition ${view === 'list' ? 'bg-white shadow-sm font-medium' : 'text-[#666]'}`}
            >List</button>
          </div>
        </div>

        {view === 'timeline' ? (
          /* Monthly timeline view */
          <div className="space-y-6">
            {MONTHS.map((monthName, i) => {
              const monthNum = i + 1;
              const monthEvents = filtered.filter(e => e.months.includes(monthNum));
              if (monthEvents.length === 0) return null;
              const isCurrent = monthNum === currentMonth;

              return (
                <div key={monthNum} className={`border rounded-xl overflow-hidden ${isCurrent ? 'border-[#0066cc] ring-1 ring-[#0066cc]/20' : 'border-[#e8e8e8]'}`}>
                  <div className={`px-4 py-2.5 flex items-center justify-between ${isCurrent ? 'bg-[#f0f7ff]' : 'bg-[#f8f9fa]'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-[14px] font-semibold ${isCurrent ? 'text-[#0066cc]' : 'text-[#333]'}`}>{monthName}</span>
                      {isCurrent && <span className="text-[10px] bg-[#0066cc] text-white px-1.5 py-0.5 rounded">Current</span>}
                    </div>
                    <span className="text-[11px] text-[#999]">{monthEvents.length} releases</span>
                  </div>
                  <div className="divide-y divide-[#f0f0f0]">
                    {monthEvents.map((event, j) => (
                      <div key={j} className="px-4 py-3 hover:bg-[#f8f9fa] transition">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium text-[#0066cc] hover:underline">
                                {event.name}
                              </a>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${IMPORTANCE_COLORS[event.importance]}`}>
                                {event.importance}
                              </span>
                            </div>
                            <div className="text-[12px] text-[#666] mb-1">{event.description}</div>
                            <div className="flex items-center gap-3 text-[11px] text-[#999]">
                              <span>{event.org}</span>
                              <span>{event.frequency}</span>
                            </div>
                            {event.indicators.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {event.indicators.slice(0, 4).map(indId => (
                                  <Link
                                    key={indId}
                                    href={`/rankings?id=${encodeURIComponent(indId)}`}
                                    className="text-[10px] bg-[#f0f0f0] px-2 py-0.5 rounded hover:bg-[#e0e0e0] transition text-[#666]"
                                  >
                                    {indId}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List view */
          <div className="border border-[#e8e8e8] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-[11px] text-[#999] uppercase border-b border-[#e8e8e8] bg-[#f8f9fa]">
                  <th className="px-4 py-2.5 text-left">Publication</th>
                  <th className="px-4 py-2.5 text-left">Organization</th>
                  <th className="px-4 py-2.5 text-left">Frequency</th>
                  <th className="px-4 py-2.5 text-center">Months</th>
                  <th className="px-4 py-2.5 text-center">Impact</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((event, i) => (
                  <tr key={i} className="border-b border-[#f0f0f0] hover:bg-[#f8f9fa] transition">
                    <td className="px-4 py-2.5">
                      <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-[13px] text-[#0066cc] hover:underline">
                        {event.name}
                      </a>
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-[#666]">{event.org}</td>
                    <td className="px-4 py-2.5 text-[12px] text-[#666]">{event.frequency}</td>
                    <td className="px-4 py-2.5 text-center text-[11px] text-[#999]">
                      {event.months.map(m => MONTHS[m - 1].slice(0, 3)).join(', ')}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${IMPORTANCE_COLORS[event.importance]}`}>
                        {event.importance}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* About section */}
        <div className="mt-8 border border-[#e8e8e8] rounded-xl p-5 bg-[#f8f9fa]">
          <h3 className="text-[14px] font-semibold mb-2">About This Calendar</h3>
          <p className="text-[12px] text-[#666] leading-relaxed">
            This calendar tracks major data publications from international organizations and central banks that update the indicators on Statistics of the World.
            Unlike trading-focused economic calendars that track individual data releases (monthly CPI, weekly jobless claims), this calendar focuses on
            <strong> research-grade publications</strong> — the comprehensive reports that provide the deepest, most authoritative data available for cross-country comparison.
            When these organizations publish, we update our database accordingly.
          </p>
        </div>
        </>
        )}
      </section>

      <Footer />
    </main>
  );
}
