'use client';

import Link from 'next/link';

const TABS = [
  { href: '/countries', label: 'Countries' },
  { href: '/indicators', label: 'Indicators' },
  { href: '/compare', label: 'Compare' },
  { href: '/map', label: 'Map' },
  { href: '/heatmap', label: 'Heatmap' },
  { href: '/forecasts', label: 'Forecasts' },
  { href: '/live', label: 'Live' },
];

export default function HeroTabs({ active, countryCount = 218, indicatorCount = 443 }: { active?: string; countryCount?: number; indicatorCount?: number }) {
  return (
    <section className="border-b border-[#d5dce6] bg-white">
      <div className="max-w-[1400px] mx-auto px-4 py-10 text-center">
        <h1 className="text-[32px] font-extrabold mb-2 text-[#0d1b2a] tracking-tight">Statistics of the World</h1>
        <p className="text-[15px] text-[#64748b] mb-6">
          {countryCount} countries. {indicatorCount} indicators. Free global data from IMF, World Bank, FRED, and more.
        </p>
        <div className="flex flex-wrap justify-center gap-1.5 text-[14px]">
          {TABS.map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2 rounded-lg transition font-medium ${
                active === tab.href
                  ? 'bg-[#0d1b2a] text-white'
                  : 'border border-[#d5dce6] text-[#64748b] hover:bg-[#f4f6f9] hover:text-[#0d1b2a]'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
