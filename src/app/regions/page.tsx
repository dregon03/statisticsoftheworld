import RegionsContent from './RegionsContent';
import { INTERNAL_BASE } from '@/lib/internal-fetch';

export const revalidate = 3600;

const OVERVIEW_IDS = [
  'IMF.NGDPDPC', 'IMF.NGDP_RPCH', 'SP.DYN.LE00.IN',
  'IMF.PCPIPCH', 'IMF.LUR', 'SP.POP.TOTL',
];

async function getRegionsData() {
  try {
    const results = await Promise.all(
      OVERVIEW_IDS.map(id =>
        fetch(`${INTERNAL_BASE}/api/regions?indicator=${encodeURIComponent(id)}`, { next: { revalidate: 3600 } })
          .then(r => r.json())
          .then(d => ({ id, data: d }))
          .catch(() => null)
      )
    );

    const overview: Record<string, any> = {};
    for (const r of results) {
      if (r) overview[r.id] = r.data;
    }

    return { overview, defaultData: overview['IMF.NGDPDPC'] || null };
  } catch {
    return null;
  }
}

export default async function RegionsPage() {
  const data = await getRegionsData();

  return (
    <RegionsContent
      initialOverview={data?.overview}
      initialData={data?.defaultData}
    />
  );
}
