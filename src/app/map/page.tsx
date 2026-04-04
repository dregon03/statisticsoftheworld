import MapContent from './MapContent';
import { getIndicatorForAllCountries } from '@/lib/data';

export const revalidate = 3600;

async function getDefaultMapData() {
  try {
    const data = await getIndicatorForAllCountries('IMF.NGDPD');
    return data.map((d: any) => ({
      country: d.country,
      countryId: d.countryId,
      iso2: d.iso2 || '',
      value: d.value,
      year: String(d.year),
    }));
  } catch {
    return undefined;
  }
}

export default async function MapPage() {
  const data = await getDefaultMapData();
  return <MapContent initialData={data} />;
}
