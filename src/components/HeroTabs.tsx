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
    <section className="border-b border-[#e8e8e8]">
      <div className="max-w-[1400px] mx-auto px-4 py-8 text-center">
        <h1 className="text-[26px] font-bold mb-2">Statistics of the World</h1>
        <p className="text-[13px] text-[#999] mb-5">
          {countryCount} countries. {indicatorCount} indicators. Free global data from IMF, World Bank, FRED, and more.
        </p>
        <div className="flex flex-wrap justify-center gap-1 text-[13px]">
          {TABS.map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-1.5 rounded-lg transition font-medium ${
                active === tab.href
                  ? 'bg-[#0066cc] text-white'
                  : 'border border-[#e8e8e8] text-[#555] hover:bg-[#f5f7fa]'
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
