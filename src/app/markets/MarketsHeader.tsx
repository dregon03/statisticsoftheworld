'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/markets', label: 'Indices' },
  { href: '/markets/stocks/sp500', label: 'Stocks' },
  { href: '/markets/commodities', label: 'Commodities' },
  { href: '/markets/currencies', label: 'Currencies' },
  { href: '/markets/crypto', label: 'Crypto' },
];

export default function MarketsHeader({ updatedAt }: { updatedAt?: string | null }) {
  const pathname = usePathname();

  const updatedStr = updatedAt
    ? new Date(updatedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : '';

  return (
    <>
      <div className="flex items-end justify-between mb-1">
        <h1 className="text-[28px] font-extrabold text-[#0d1b2a] tracking-tight">Markets</h1>
        {updatedStr && (
          <span className="text-[14px] text-[#94a3b8] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#16a34a] rounded-full animate-pulse" />
            Live &middot; {updatedStr}
          </span>
        )}
      </div>
      <p className="text-[15px] text-[#64748b] mb-6">
        Live delayed quotes from Yahoo Finance. Stock indices, commodities, and exchange rates.
      </p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#d5dce6]">
        {TABS.map(t => (
          <Link
            key={t.href}
            href={t.href}
            className={`px-4 py-2.5 text-[14px] transition border-b-2 -mb-[1px] ${
              pathname === t.href || (t.href !== '/markets' && pathname.startsWith(t.href))
                ? 'border-[#0d1b2a] text-[#0d1b2a] font-semibold'
                : 'border-transparent text-[#64748b] hover:text-[#0d1b2a]'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </>
  );
}
