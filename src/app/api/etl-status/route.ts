import { supabase } from '@/lib/supabase';

export async function GET() {
  // Get latest ETL run
  const { data: runs } = await supabase
    .from('sotw_etl_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(5);

  // Count rows in main table by source
  const { data: mainCounts } = await supabase
    .rpc('sotw_main_counts');

  // Count rows in staging table by source
  const { data: stagingCounts } = await supabase
    .rpc('sotw_staging_counts');

  // Fallback: direct queries if RPC doesn't exist
  let main: Record<string, number> = {};
  let staging: Record<string, number> = {};

  if (!mainCounts) {
    const { data: m } = await supabase
      .from('sotw_indicators')
      .select('source')
      .limit(50000);
    if (m) {
      for (const row of m) {
        main[row.source] = (main[row.source] || 0) + 1;
      }
    }
  }

  if (!stagingCounts) {
    const { data: s } = await supabase
      .from('sotw_indicators_staging')
      .select('source')
      .limit(50000);
    if (s) {
      for (const row of s) {
        staging[row.source] = (staging[row.source] || 0) + 1;
      }
    }
  }

  // Get unique indicator counts
  const { data: mainIndicators } = await supabase
    .from('sotw_indicators')
    .select('id')
    .limit(50000);
  const mainUniqueIds = new Set((mainIndicators || []).map((r: { id: string }) => r.id));

  const { data: stagingIndicators } = await supabase
    .from('sotw_indicators_staging')
    .select('id')
    .limit(50000);
  const stagingUniqueIds = new Set((stagingIndicators || []).map((r: { id: string }) => r.id));

  const mainTotal = Object.values(main).reduce((a, b) => a + b, 0);
  const stagingTotal = Object.values(staging).reduce((a, b) => a + b, 0);

  return Response.json({
    runs: runs || [],
    main: { total: mainTotal, bySource: main, uniqueIndicators: mainUniqueIds.size },
    staging: { total: stagingTotal, bySource: staging, uniqueIndicators: stagingUniqueIds.size },
  });
}
