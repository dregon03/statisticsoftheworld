'use client';

import { useState } from 'react';

interface ExportButtonProps {
  getData: () => { headers: string[]; rows: (string | number | null)[][] };
  filename: string;
}

export default function ExportButton({ getData, filename }: ExportButtonProps) {
  const [showMenu, setShowMenu] = useState(false);

  const exportCSV = () => {
    const { headers, rows } = getData();
    const escape = (val: string | number | null) => {
      if (val === null || val === undefined) return '';
      const s = String(val);
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
    download(csv, `${filename}.csv`, 'text/csv');
    setShowMenu(false);
  };

  const exportJSON = () => {
    const { headers, rows } = getData();
    const data = rows.map(row => {
      const obj: Record<string, string | number | null> = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });
    const json = JSON.stringify(data, null, 2);
    download(json, `${filename}.json`, 'application/json');
    setShowMenu(false);
  };

  const download = (content: string, name: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-1 text-[12px] text-[#0066cc] hover:text-[#004999] transition"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export
      </button>
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white border border-[#e8e8e8] rounded-lg shadow-lg z-50 min-w-[120px]">
            <button onClick={exportCSV} className="w-full text-left px-3 py-2 text-[12px] hover:bg-[#f5f7fa] transition">
              Download CSV
            </button>
            <button onClick={exportJSON} className="w-full text-left px-3 py-2 text-[12px] hover:bg-[#f5f7fa] transition border-t border-[#f0f0f0]">
              Download JSON
            </button>
          </div>
        </>
      )}
    </div>
  );
}
