'use client';

import { useState } from 'react';
import TimeSeriesChart from '@/components/charts/TimeSeriesChart';
import ChartWrapper from '@/components/charts/ChartWrapper';
import { INDICATORS } from '@/lib/data';

interface CountryChartsProps {
  keyStats: { id: string; label: string }[];
  indicators: Record<string, { year: string; value: number | null }>;
  history: Record<string, { year: number; value: number | null }[]>;
}

export default function CountryCharts({ keyStats, indicators, history }: CountryChartsProps) {
  const [selectedStat, setSelectedStat] = useState(keyStats[0]?.id || '');

  const ind = INDICATORS.find(i => i.id === selectedStat);
  const data = history[selectedStat] || [];
  const hasData = data.filter(d => d.value !== null).length >= 2;

  if (!hasData && keyStats.every(s => (history[s.id] || []).filter(d => d.value !== null).length < 2)) {
    return null;
  }

  return (
    <div className="border border-gray-100 rounded-xl p-5 mb-4">
      <div className="flex items-center gap-2 mb-4">
        {keyStats.map(stat => {
          const statHistory = history[stat.id] || [];
          const statHasData = statHistory.filter(d => d.value !== null).length >= 2;
          if (!statHasData) return null;
          return (
            <button
              key={stat.id}
              onClick={() => setSelectedStat(stat.id)}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                selectedStat === stat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {stat.label}
            </button>
          );
        })}
      </div>
      {hasData && ind && (
        <ChartWrapper
          source={ind.source === 'imf' ? 'IMF World Economic Outlook' : 'World Bank'}
        >
          <TimeSeriesChart
            data={data}
            format={ind.format}
            decimals={ind.decimals}
            height={280}
          />
        </ChartWrapper>
      )}
    </div>
  );
}
