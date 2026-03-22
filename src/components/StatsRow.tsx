import { formatValue } from '@/lib/data';

interface StatsRowProps {
  last: number | null;
  previous: number | null;
  highest: number | null;
  lowest: number | null;
  format: string;
  decimals?: number;
  unit?: string;
  source?: string;
  year?: string | number;
}

export default function StatsRow({ last, previous, highest, lowest, format, decimals, unit, source, year }: StatsRowProps) {
  const items = [
    { label: 'Last', value: last },
    { label: 'Previous', value: previous },
    { label: 'Highest', value: highest },
    { label: 'Lowest', value: lowest },
  ];

  return (
    <div className="flex flex-wrap border border-[#e8e8e8] rounded-lg overflow-hidden text-[13px]">
      {items.map((item, i) => (
        <div key={item.label} className={`flex-1 min-w-[100px] px-4 py-3 ${i > 0 ? 'border-l border-[#e8e8e8]' : ''}`}>
          <div className="text-[11px] text-[#999] uppercase tracking-wider">{item.label}</div>
          <div className="font-semibold text-[#333] mt-0.5">
            {item.value !== null ? formatValue(item.value, format, decimals) : '—'}
          </div>
        </div>
      ))}
      {unit && (
        <div className="flex-1 min-w-[100px] px-4 py-3 border-l border-[#e8e8e8]">
          <div className="text-[11px] text-[#999] uppercase tracking-wider">Unit</div>
          <div className="text-[#333] mt-0.5">{unit}</div>
        </div>
      )}
      {source && (
        <div className="flex-1 min-w-[100px] px-4 py-3 border-l border-[#e8e8e8]">
          <div className="text-[11px] text-[#999] uppercase tracking-wider">Source</div>
          <div className="text-[#333] mt-0.5">{source}</div>
        </div>
      )}
    </div>
  );
}
