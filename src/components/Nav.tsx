'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const SearchModal = dynamic(() => import('./SearchModal'), {
  ssr: false,
  loading: () => null,
});

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/markets', label: 'Markets' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/predictions', label: 'Predictions' },
  { href: '/ai', label: 'AI' },
  { href: '/api', label: 'API', dropdown: [
    { href: '/api-docs', label: 'API Docs' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/dashboard/api', label: 'My API Key' },
  ]},
  { href: '/special', label: 'Special', dropdown: [
    { href: '/tariff-tracker', label: 'Tariff Impact Tracker' },
    { href: '/snapshot/2026', label: '2026 Economic Snapshot' },
    { href: '/credit-ratings', label: 'Credit Ratings' },
    { href: '/world-economy', label: 'World Economy' },
    { href: '/forecasts', label: 'Forecasts' },
    { href: '/richest-countries', label: 'Richest Countries' },
    { href: '/poorest-countries', label: 'Poorest Countries' },
    { href: '/safest-countries', label: 'Safest Countries' },
    { href: '/largest-economies', label: 'Largest Economies' },
    { href: '/g7-economy', label: 'G7 Economy' },
    { href: '/brics-economy', label: 'BRICS Economy' },
  ]},
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
      <header className="sticky top-0 bg-[#0d1b2a]/[.97] backdrop-blur z-50">
        <div className="max-w-[1200px] mx-auto px-4 h-[52px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/icon-192.png" alt="SOTW" width={26} height={26} className="rounded" loading="eager" fetchPriority="high" />
            <span className="font-bold text-[16px] text-white tracking-tight">Statistics of the World</span>
          </Link>
          <nav className="flex items-center gap-0.5">
            {NAV_ITEMS.map(item => {
              const isActive = item.href === '/'
                ? pathname === '/'
                : item.dropdown
                  ? item.dropdown.some(d => pathname.startsWith(d.href))
                  : pathname.startsWith(item.href);

              if (item.dropdown) {
                return (
                  <div key={item.href} className="relative group">
                    <button
                      className={`px-3 py-1.5 text-[14px] rounded-lg transition flex items-center gap-1 ${
                        isActive
                          ? 'text-white font-semibold bg-white/10'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {item.label}
                      <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <div className="absolute top-full right-0 mt-1 w-56 bg-[#0d1b2a] border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 py-1.5 z-50">
                      {item.dropdown.map(sub => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`block px-4 py-2 text-[13px] transition ${
                            pathname === sub.href
                              ? 'text-white bg-white/10'
                              : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 text-[14px] rounded-lg transition ${
                    isActive
                      ? 'text-white font-semibold bg-white/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => setSearchOpen(true)}
              className="ml-2 flex items-center gap-1.5 px-2.5 py-1 border border-white/20 rounded-lg text-[14px] text-white/40 hover:text-white/70 hover:border-white/30 transition"
              title="Search (Ctrl+K)"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <kbd className="text-[14px] border border-white/20 rounded px-1 py-0.5 hidden sm:inline">Ctrl+K</kbd>
            </button>
          </nav>
        </div>
      </header>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
