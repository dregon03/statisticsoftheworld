'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Flag from '../../../Flag';

interface ForecastRow { countryId: string; country: string; iso2: string; region: string; values: Record<number, number>; }

export default function CountryForecastPage() {
  const params = useParams();
  const countryId = params.id as string;
  const [indicators, setIndicators] = useState<{ id: string; label: string }[]>([]);
  const [selectedId, setSelectedId] = useState('IMF.NGDP_RPCH');
  const [years, setYears] = useState<number[]>([]);
  const [countryData, setCountryData] = useState<ForecastRow | null>(null);
  const [countryName, setCountryName] = useState('');
  const [iso2, setIso2] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/forecasts?indicator=${encodeURIComponent(selectedId)}`)
      .then(r => r.json())
      .then(data => {
        setIndicators(data.indicators || []);
        setYears(data.years || []);
        const row = (data.countries || []).find((c: ForecastRow) => c.countryId === countryId);
        setCountryData(row || null);
        if (row) { setCountryName(row.country); setIso2(row.iso2); }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedId, countryId]);

  return (
    <main className="min-h-screen">
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <div className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/countries" className="hover:text-gray-600">Countries</Link>
          <span className="mx-2">/</span>
          <Link href={`/country/${countryId}`} className="hover:text-gray-600">{countryName || countryId}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">Forecast</span>
        </div>

        <h1 className="text-[26px] font-bold mb-2 flex items-center gap-3">
          {iso2 && <Flag iso2={iso2} size={32} />}
          {countryName || countryId} — IMF Forecasts
        </h1>

        {/* Sub-nav */}
        <div className="flex gap-1 mb-6 border-b border-gray-100">
          <Link href={`/country/${countryId}`} className="px-4 py-2 text-[13px] text-[#64748b] hover:text-[#0d1b2a]">Overview</Link>
          <span className="px-4 py-2 text-[13px] font-medium text-[#0066cc] border-b-2 border-[#0066cc]">Forecasts</span>
          <Link href={`/country/${countryId}/trade-data`} className="px-4 py-2 text-[13px] text-[#64748b] hover:text-[#0d1b2a]">Trade</Link>
        </div>

        {/* Indicator buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {indicators.map(ind => (
            <button key={ind.id} onClick={() => setSelectedId(ind.id)}
              className={`px-3 py-1.5 text-[12px] rounded-lg border transition ${selectedId === ind.id ? 'bg-[#0066cc] text-white border-[#0066cc]' : 'border-[#d5dce6] text-[#64748b] hover:bg-[#f4f6f9]'}`}>
              {ind.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-[#64748b]">Loading forecasts...</div>
        ) : !countryData ? (
          <div className="text-center py-16 text-[#64748b]">No forecast data available for this country.</div>
        ) : (
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-2.5">Year</th>
                  <th className="px-5 py-2.5 text-right">Projected Value</th>
                </tr>
              </thead>
              <tbody>
                {years.map(y => {
                  const val = countryData.values[y];
                  return (
                    <tr key={y} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-2.5 text-sm font-medium">{y}</td>
                      <td className="px-5 py-2.5 text-right font-mono text-sm">{val != null ? val.toFixed(2) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-[11px] text-[#64748b]">
          Source: <a href="https://www.imf.org/en/publications/weo" target="_blank" rel="noopener noreferrer" className="text-[#0066cc] hover:underline">IMF World Economic Outlook</a>
        </div>
      </section>
      <Footer />
    </main>
  );
}
