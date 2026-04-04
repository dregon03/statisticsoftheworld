import CompareContent from './CompareContent';
import { getCountries } from '@/lib/data';

export const revalidate = 3600;

export default async function ComparePage() {
  const countries = await getCountries();
  const sorted = countries
    .map((c: any) => ({ id: c.id, iso2: c.iso2, name: c.name, region: c.region }))
    .sort((a: any, b: any) => a.name.localeCompare(b.name));

  return <CompareContent initialCountries={sorted} />;
}
