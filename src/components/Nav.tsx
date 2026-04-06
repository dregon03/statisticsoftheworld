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
                : pathname.startsWith(item.href);
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
