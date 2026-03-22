'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { INDICATORS, formatValue } from '@/lib/data';
import TimeSeriesChart from '@/components/charts/TimeSeriesChart';

interface HistoryPoint {
  year: number;
  value: number | null;
}

export default function EmbedChartPage() {
  return (
    <Suspense>
      <EmbedChartContent />
    </Suspense>
  );
}

function EmbedChartContent() {
  const searchParams = useSearchParams();
  const indicatorId = searchParams.get('indicator') || '';
  const countryId = searchParams.get('country') || '';

  const [data, setData] = useState<HistoryPoint[]>([]);
  const [countryName, setCountryName] = useState('');
  const [loading, setLoading] = useState(true);

  const ind = INDICATORS.find(i => i.id === indicatorId);

  useEffect(() => {
    if (!indicatorId || !countryId) { setLoading(false); return; }

    Promise.all([
      fetch(`/api/history?indicator=${encodeURIComponent(indicatorId)}&country=${encodeURIComponent(countryId)}`).then(r => r.json()),
      fetch(`/api/countries?id=${encodeURIComponent(countryId)}`).then(r => r.json()),
    ]).then(([history, countryData]) => {
      setData(history);
      // Try to find country name from indicators or use the ID
      setCountryName(countryId);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [indicatorId, countryId]);

  if (!indicatorId || !countryId) {
    return <div className="p-4 text-[13px] text-[#999]">Missing indicator or country parameter.</div>;
  }

  const currentYear = new Date().getFullYear();
  const forecastStartYear = indicatorId.startsWith('IMF.') ? currentYear : undefined;

  return (
    <div className="p-3 font-sans" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {loading ? (
        <div className="text-center py-8 text-[#999] text-[13px]">Loading...</div>
      ) : data.length < 2 ? (
        <div className="text-center py-8 text-[#999] text-[13px]">No data available.</div>
      ) : (
        <>
          <div className="mb-2">
            <div className="text-[14px] font-semibold text-[#333]">
              {countryId} — {ind?.label || indicatorId}
            </div>
          </div>
          <TimeSeriesChart
            data={data}
            format={ind?.format || 'number'}
            decimals={ind?.decimals}
            height={250}
            forecastStartYear={forecastStartYear}
          />
          <div className="mt-2 text-[10px] text-[#999] flex items-center justify-between">
            <span>Source: IMF, World Bank, FRED</span>
            <a
              href={`https://statisticsoftheworld.com/country/${countryId}/${encodeURIComponent(indicatorId)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0066cc] hover:underline"
            >
              statisticsoftheworld.com
            </a>
          </div>
        </>
      )}
    </div>
  );
}
