'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchModal from './SearchModal';

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/markets', label: 'Markets' },
  { href: '/commodities', label: 'Commodities' },
  { href: '/heatmap', label: 'Heatmap' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/forecasts', label: 'Forecasts' },
  { href: '/predictions', label: 'Predictions' },
  { href: '/ai', label: 'AI' },
];

export default function Nav() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  // Ctrl+K / Cmd+K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <header className="border-b border-[#e8e8e8] sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-[1200px] mx-auto px-4 h-[48px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/icon-192.png" alt="SOTW" width={24} height={24} className="rounded" />
            <span className="font-semibold text-[15px] text-[#333]">Statistics of the World</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(item => {
              const isActive = item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 text-[13px] rounded transition ${
                    isActive
                      ? 'text-[#0066cc] font-medium'
                      : 'text-[#666] hover:text-[#333]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => setSearchOpen(true)}
              className="ml-2 flex items-center gap-1.5 px-2.5 py-1 border border-gray-200 rounded-lg text-[12px] text-gray-400 hover:text-gray-600 hover:border-gray-300 transition"
              title="Search (Ctrl+K)"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <kbd className="text-[10px] border border-gray-200 rounded px-1 py-0.5 hidden sm:inline">Ctrl+K</kbd>
            </button>
          </nav>
        </div>
      </header>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
