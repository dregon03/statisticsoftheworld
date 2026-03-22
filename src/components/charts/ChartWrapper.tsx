'use client';

import { useRef, useState } from 'react';

interface ChartWrapperProps {
  children: React.ReactNode;
  title?: string;
  source?: string;
  downloadFilename?: string;
}

export default function ChartWrapper({
  children,
  title,
  source,
  downloadFilename,
}: ChartWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div
      ref={ref}
      className={`relative ${fullscreen ? 'fixed inset-0 z-50 bg-white p-8 overflow-auto' : ''}`}
    >
      {(title || downloadFilename) && (
        <div className="flex items-center justify-between mb-1">
          {title && <div className="text-sm font-semibold text-gray-700">{title}</div>}
          <div className="flex gap-2">
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="text-xs text-gray-400 hover:text-gray-600 transition"
              title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {fullscreen ? '✕ Close' : '⛶'}
            </button>
          </div>
        </div>
      )}
      {children}
      {source && (
        <div className="text-[10px] text-gray-400 mt-1">Source: {source}</div>
      )}
    </div>
  );
}
