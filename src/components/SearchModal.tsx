'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { INDICATORS, CATEGORIES } from '@/lib/data';

interface SearchResult {
  type: 'country' | 'indicator' | 'page';
  label: string;
  sublabel?: string;
  href: string;
}

interface CountryItem {
  id: string;
  name: string;
  iso2: string;
  region: string;
}

const PAGES: SearchResult[] = [
  { type: 'page', label: 'Compare Countries', href: '/compare' },
  { type: 'page', label: 'World Map', href: '/map' },
  { type: 'page', label: 'Scatter Plot', href: '/scatter' },
  { type: 'page', label: 'Regional Analysis', href: '/regions' },
  { type: 'page', label: 'Markets', href: '/markets' },
  { type: 'page', label: 'Commodities', href: '/commodities' },
  { type: 'page', label: 'Economic Calendar', href: '/calendar' },
  { type: 'page', label: 'Credit Ratings', href: '/credit-ratings' },
  { type: 'page', label: 'API Documentation', href: '/api-docs' },
  { type: 'page', label: 'Pricing', href: '/pricing' },
];

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fetch countries once
  useEffect(() => {
    fetch('/api/countries')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setCountries(data);
      })
      .catch(() => {});
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults(PAGES.slice(0, 6));
      setSelectedIndex(0);
      return;
    }

    const q = query.toLowerCase();
    const matches: SearchResult[] = [];

    // Search countries
    for (const c of countries) {
      if (matches.length >= 20) break;
      if (c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)) {
        matches.push({
          type: 'country',
          label: c.name,
          sublabel: c.region,
          href: `/country/${c.id}`,
        });
      }
    }

    // Search indicators
    for (const ind of INDICATORS) {
      if (matches.length >= 20) break;
      if (ind.label.toLowerCase().includes(q) || ind.id.toLowerCase().includes(q) || ind.category.toLowerCase().includes(q)) {
        matches.push({
          type: 'indicator',
          label: ind.label,
          sublabel: ind.category,
          href: `/indicators?id=${encodeURIComponent(ind.id)}`,
        });
      }
    }

    // Search pages
    for (const p of PAGES) {
      if (matches.length >= 20) break;
      if (p.label.toLowerCase().includes(q)) {
        matches.push(p);
      }
    }

    setResults(matches.slice(0, 12));
    setSelectedIndex(0);
  }, [query, countries]);

  const navigate = useCallback((href: string) => {
    onClose();
    router.push(href);
  }, [onClose, router]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        navigate(results[selectedIndex].href);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, results, selectedIndex, navigate, onClose]);

  if (!open) return null;

  const TYPE_ICONS = { country: '🏳️', indicator: '📊', page: '📄' };
  const TYPE_LABELS = { country: 'Country', indicator: 'Indicator', page: 'Page' };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[560px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center border-b border-gray-100 px-4">
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search countries, indicators, pages..."
            className="w-full px-3 py-3.5 text-[14px] outline-none bg-transparent"
          />
          <kbd className="text-[10px] text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 shrink-0">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-[13px] text-gray-400">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            results.map((r, i) => (
              <button
                key={`${r.href}-${i}`}
                onClick={() => navigate(r.href)}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${
                  i === selectedIndex ? 'bg-[#f0f7ff]' : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-[14px] w-6 text-center shrink-0">{TYPE_ICONS[r.type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[#333] truncate">{r.label}</div>
                  {r.sublabel && (
                    <div className="text-[11px] text-gray-400 truncate">{r.sublabel}</div>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">{TYPE_LABELS[r.type]}</span>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-4 py-2 flex items-center gap-4 text-[10px] text-gray-400">
          <span><kbd className="border border-gray-200 rounded px-1 py-0.5 mr-1">↑↓</kbd> Navigate</span>
          <span><kbd className="border border-gray-200 rounded px-1 py-0.5 mr-1">↵</kbd> Open</span>
          <span><kbd className="border border-gray-200 rounded px-1 py-0.5 mr-1">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
