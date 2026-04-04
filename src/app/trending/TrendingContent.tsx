'use client';

import Link from 'next/link';
import Flag from '../Flag';
import { formatValue } from '@/lib/data';

interface Country { id: string; name: string; iso2: string; value: number; year: string; }
interface Insight {
  title: string;
  description: string;
  countries: Country[];
  indicatorId: string;
  indicatorLabel: string;
  type: 'highest' | 'lowest' | 'fastest' | 'slowest';
}

export default function TrendingContent({ insights }: { insights: Insight[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {insights.map((insight, i) => {
        const isNeg = insight.type === 'lowest' || insight.type === 'slowest';
        const ind = { format: insight.indicatorId.includes('NGDPDPC') ? 'currency' : insight.indicatorId.includes('POP') ? 'number' : 'percent' };
        const maxVal = Math.max(...insight.countries.map(c => Math.abs(c.value)));

        return (
          <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-[#f4f6f9] border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold">{insight.title}</h2>
              <Link
                href={`/indicators?id=${encodeURIComponent(insight.indicatorId)}`}
                className="text-[15px] text-[#0066cc] hover:underline"
              >
                {insight.indicatorLabel} →
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {insight.countries.map((c, j) => {
                const barWidth = maxVal > 0 ? (Math.abs(c.value) / maxVal) * 100 : 0;
                return (
                  <div key={c.id} className="flex items-center px-4 py-2 gap-3 hover:bg-[#fafafa] transition">
                    <span className="text-[15px] text-[#94a3b8] w-5 text-right">{j + 1}</span>
                    <Flag iso2={c.iso2} size={18} />
                    <Link href={`/country/${c.id}`} className="text-[15px] text-[#0066cc] hover:underline flex-1 truncate">
                      {c.name}
                    </Link>
                    <div className="w-20 hidden sm:block">
                      <div className="w-full bg-gray-100 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full ${isNeg ? 'bg-red-400' : 'bg-green-500'}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                    <span className={`text-[14px] font-mono w-20 text-right ${c.value < 0 ? 'text-red-500' : ''}`}>
                      {formatValue(c.value, ind.format, 1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
