'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/markets/stocks/sp500', label: 'S&P 500' },
  { href: '/markets/stocks/nasdaq100', label: 'Nasdaq 100' },
  { href: '/markets/stocks/tsx60', label: 'TSX 60' },
  { href: '/markets/stocks/ftse100', label: 'FTSE 100' },
];

export default function StocksHeader() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 mb-6 border-b border-[#e8e8e8]">
      {TABS.map(t => (
        <Link
          key={t.href}
          href={t.href}
          className={`px-3 py-1.5 text-[14px] transition border-b-2 -mb-[1px] ${
            pathname === t.href
              ? 'border-[#0066cc] text-[#0066cc] font-medium'
              : 'border-transparent text-[#666] hover:text-[#333]'
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
