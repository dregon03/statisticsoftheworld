import { supabase } from '@/lib/supabase';

export default async function CountryNarrative({ countryId }: { countryId: string }) {
  const { data } = await supabase
    .from('sotw_country_narratives')
    .select('narrative')
    .eq('country_id', countryId)
    .single();

  if (!data?.narrative) return null;

  return (
    <div className="mb-8 border border-gray-100 rounded-xl p-5">
      <p className="text-[14px] text-[#444] leading-relaxed">{data.narrative}</p>
    </div>
  );
}
