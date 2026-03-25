'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/markets', label: 'Indices' },
  { href: '/markets/stocks/sp500', label: 'Stocks' },
  { href: '/markets/commodities', label: 'Commodities' },
  { href: '/markets/currencies', label: 'Currencies' },
];

export default function MarketsHeader({ updatedAt }: { updatedAt?: string | null }) {
  const pathname = usePathname();

  const updatedStr = updatedAt
    ? new Date(updatedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : '';

  return (
    <>
      <div className="flex items-end justify-between mb-1">
        <h1 className="text-[24px] font-bold">Markets</h1>
        {updatedStr && (
          <span className="text-[11px] text-[#999] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Live &middot; {updatedStr}
          </span>
        )}
      </div>
      <p className="text-[13px] text-[#999] mb-6">
        Live delayed quotes from Yahoo Finance. Stock indices, commodities, and exchange rates.
      </p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#e8e8e8]">
        {TABS.map(t => (
          <Link
            key={t.href}
            href={t.href}
            className={`px-4 py-2 text-[13px] transition border-b-2 -mb-[1px] ${
              pathname === t.href || (t.href.includes('/stocks/') && pathname.startsWith('/markets/stocks'))
                ? 'border-[#0066cc] text-[#0066cc] font-medium'
                : 'border-transparent text-[#666] hover:text-[#333]'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </>
  );
}
