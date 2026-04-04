import HeatmapContent from './HeatmapContent';
import { INTERNAL_BASE } from '@/lib/internal-fetch';

export const revalidate = 3600;

async function getHeatmapData() {
  try {
    const res = await fetch(`${INTERNAL_BASE}/api/heatmap?preset=macro&group=Top20`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function HeatmapPage() {
  const data = await getHeatmapData();

  return (
    <HeatmapContent
      initialData={data ? {
        indicators: data.indicators,
        ranges: data.ranges,
        countries: data.countries,
        availablePresets: data.availablePresets,
        availableGroups: data.availableGroups,
      } : undefined}
    />
  );
}
