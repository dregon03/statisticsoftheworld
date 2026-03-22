'use client';

import TimeSeriesChart from '@/components/charts/TimeSeriesChart';
import ChartWrapper from '@/components/charts/ChartWrapper';

interface IndicatorDetailChartsProps {
  history: { year: number; value: number }[];
  format: string;
  decimals?: number;
  sourceName: string;
  forecastStartYear?: number;
}

export default function IndicatorDetailCharts({ history, format, decimals, sourceName, forecastStartYear }: IndicatorDetailChartsProps) {
  if (history.length < 2) return null;

  return (
    <ChartWrapper source={sourceName}>
      <TimeSeriesChart
        data={history}
        format={format}
        decimals={decimals}
        height={350}
        forecastStartYear={forecastStartYear}
      />
    </ChartWrapper>
  );
}
