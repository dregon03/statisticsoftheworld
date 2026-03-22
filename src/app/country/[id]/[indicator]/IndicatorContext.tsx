'use client';

import { useState, useEffect } from 'react';

export default function IndicatorContext({ countryId, indicatorId }: { countryId: string; indicatorId: string }) {
  const [context, setContext] = useState('');

  useEffect(() => {
    fetch(`/api/indicator-context?country=${encodeURIComponent(countryId)}&indicator=${encodeURIComponent(indicatorId)}`)
      .then(r => r.json())
      .then(data => setContext(data.context || ''))
      .catch(() => {});
  }, [countryId, indicatorId]);

  if (!context) return null;

  return (
    <div className="mb-6 px-5 py-3 bg-[#f8f9fa] border-l-3 border-l-[#0066cc] rounded-r-lg text-[14px] text-[#444] leading-relaxed">
      {context}
    </div>
  );
}
