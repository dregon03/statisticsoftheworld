'use client';

import ExportButton from './ExportButton';

interface HistoryExportButtonProps {
  countryName: string;
  countryId: string;
  indicatorLabel: string;
  indicatorId: string;
  history: { year: number; value: number | null }[];
}

export default function HistoryExportButton({
  countryName, countryId, indicatorLabel, indicatorId, history,
}: HistoryExportButtonProps) {
  return (
    <ExportButton
      filename={`sotw-${countryId}-${indicatorId.replace(/\./g, '-')}`}
      getData={() => ({
        headers: ['Country', 'Country Code', 'Indicator', 'Year', 'Value'],
        rows: history
          .filter(d => d.value !== null)
          .map(d => [countryName, countryId, indicatorLabel, d.year, d.value]),
      })}
    />
  );
}
