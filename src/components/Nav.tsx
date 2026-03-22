'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/countries', label: 'Countries' },
  { href: '/rankings', label: 'Indicators' },
  { href: '/compare', label: 'Compare' },
  { href: '/map', label: 'Map' },
  { href: '/markets', label: 'Markets' },
  { href: '/commodities', label: 'Commodities' },
];

export default function Nav() {
  const pathname = usePathname();

  return (
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
        </nav>
      </div>
    </header>
  );
}
