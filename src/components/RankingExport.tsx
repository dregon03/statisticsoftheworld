'use client';

import { useState } from 'react';

interface RankingExportProps {
  title: string;
  indicatorLabel: string;
  data: { country: string; value: number | null; year: string | number }[];
}

export default function RankingExport({ title, indicatorLabel, data }: RankingExportProps) {
  const [format, setFormat] = useState<'csv' | 'json' | null>(null);

  const download = (content: string, name: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers = ['Rank', 'Country', indicatorLabel, 'Year'];
    const rows = data.map((d, i) => [i + 1, d.country, d.value ?? '', d.year].join(','));
    download([headers.join(','), ...rows].join('\n'), `${title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.csv`, 'text/csv');
  };

  const exportJSON = () => {
    const json = data.map((d, i) => ({ rank: i + 1, country: d.country, [indicatorLabel]: d.value, year: d.year }));
    download(JSON.stringify(json, null, 2), `${title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.json`, 'application/json');
  };

  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-[13px] text-[#94a3b8]">Download data:</span>
      <button onClick={exportCSV} className="text-[13px] text-[#0066cc] hover:text-[#004999] border border-[#d5dce6] rounded-lg px-3 py-1.5 hover:bg-[#f8f9fb] transition flex items-center gap-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        CSV
      </button>
      <button onClick={exportJSON} className="text-[13px] text-[#0066cc] hover:text-[#004999] border border-[#d5dce6] rounded-lg px-3 py-1.5 hover:bg-[#f8f9fb] transition flex items-center gap-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        JSON
      </button>
    </div>
  );
}
