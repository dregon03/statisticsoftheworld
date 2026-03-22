'use client';

import { useState, useEffect } from 'react';

export default function CountryNarrative({ countryId }: { countryId: string }) {
  const [narrative, setNarrative] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/narrative?id=${encodeURIComponent(countryId)}`)
      .then(r => r.json())
      .then(data => {
        setNarrative(data.narrative || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [countryId]);

  if (loading) {
    return (
      <div className="mb-8 border border-gray-100 rounded-xl p-5 animate-pulse">
        <div className="h-3 bg-gray-100 rounded w-full mb-2" />
        <div className="h-3 bg-gray-100 rounded w-11/12 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-10/12 mb-4" />
        <div className="h-3 bg-gray-100 rounded w-full mb-2" />
        <div className="h-3 bg-gray-100 rounded w-9/12" />
      </div>
    );
  }

  if (!narrative) return null;

  return (
    <div className="mb-8 border border-gray-100 rounded-xl p-5">
      <p className="text-[14px] text-[#444] leading-relaxed">{narrative}</p>
    </div>
  );
}
