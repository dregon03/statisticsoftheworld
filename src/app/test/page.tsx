import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'ETL Test', robots: { index: false } };

export const dynamic = 'force-dynamic';

async function getTableStats(table: string) {
  const pageSize = 1000;
  const allRows: { id: string; source: string; country_id: string; value: number; year: number }[] = [];
  for (let offset = 0; ; offset += pageSize) {
    const { data } = await supabase
      .from(table)
      .select('id, source, country_id, value, year')
      .range(offset, offset + pageSize - 1);
    if (!data || data.length === 0) break;
    allRows.push(...(data as typeof allRows));
    if (data.length < pageSize) break;
  }

  const bySource: Record<string, number> = {};
  const byIndicator: Record<string, { count: number; source: string }> = {};
  for (const row of allRows) {
    bySource[row.source] = (bySource[row.source] || 0) + 1;
    if (!byIndicator[row.id]) byIndicator[row.id] = { count: 0, source: row.source };
    byIndicator[row.id].count++;
  }

  return { total: allRows.length, bySource, byIndicator, rows: allRows };
}

export default async function TestPage() {
  const [mainStats, stagingStats] = await Promise.all([
    getTableStats('sotw_indicators'),
    getTableStats('sotw_indicators_staging'),
  ]);

  // Get last ETL runs
  const { data: runs } = await supabase
    .from('sotw_etl_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(5);

  // Compare indicators
  const allIndicatorIds = new Set([
    ...Object.keys(mainStats.byIndicator),
    ...Object.keys(stagingStats.byIndicator),
  ]);

  type Diff = { id: string; mainCount: number; stagingCount: number; diff: number; source: string };
  const diffs: Diff[] = [];
  let matches = 0;
  let mismatches = 0;
  let onlyMain = 0;
  let onlyStaging = 0;

  for (const id of allIndicatorIds) {
    const mainCount = mainStats.byIndicator[id]?.count || 0;
    const stagingCount = stagingStats.byIndicator[id]?.count || 0;
    const source = mainStats.byIndicator[id]?.source || stagingStats.byIndicator[id]?.source || '?';
    const diff = stagingCount - mainCount;

    if (mainCount > 0 && stagingCount === 0) onlyMain++;
    else if (mainCount === 0 && stagingCount > 0) onlyStaging++;
    else if (diff !== 0) mismatches++;
    else matches++;

    if (diff !== 0 || mainCount === 0 || stagingCount === 0) {
      diffs.push({ id, mainCount, stagingCount, diff, source });
    }
  }

  diffs.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">ETL Pipeline Test</h1>
        <p className="text-gray-500 mb-8">Comparing staging vs main data to validate ETL pipeline</p>

        {/* Last ETL Runs */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Recent ETL Runs</h2>
          {runs && runs.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b">
                  <th className="py-2">ID</th>
                  <th>Source</th>
                  <th>Table</th>
                  <th>Status</th>
                  <th>Rows</th>
                  <th>Indicators</th>
                  <th>Started</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run: Record<string, string | number | null>) => {
                  const started = run.started_at ? new Date(run.started_at as string) : null;
                  const finished = run.finished_at ? new Date(run.finished_at as string) : null;
                  const duration = started && finished ? Math.round((finished.getTime() - started.getTime()) / 1000) : null;
                  return (
                    <tr key={run.id as number} className="border-b border-gray-50">
                      <td className="py-2 font-mono">{run.id as number}</td>
                      <td>{run.source as string}</td>
                      <td>{run.target_table as string}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          run.status === 'completed' ? 'bg-green-100 text-green-700' :
                          run.status === 'running' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {run.status as string}
                        </span>
                      </td>
                      <td className="font-mono">{(run.rows_updated as number)?.toLocaleString()}</td>
                      <td className="font-mono">{run.indicators_count as number}</td>
                      <td className="text-gray-400">{started?.toLocaleString()}</td>
                      <td className="text-gray-400">{duration ? `${duration}s` : '...'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-400">No ETL runs recorded yet.</p>
          )}
        </section>

        {/* Summary Comparison */}
        <section className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Main Table (Live)</h2>
            <div className="text-3xl font-bold text-blue-600 mb-2">{mainStats.total.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mb-4">{Object.keys(mainStats.byIndicator).length} unique indicators</div>
            {Object.entries(mainStats.bySource).map(([src, count]) => (
              <div key={src} className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{src.toUpperCase()}</span>
                <span className="font-mono">{count.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Staging Table (ETL)</h2>
            <div className="text-3xl font-bold text-cyan-600 mb-2">{stagingStats.total.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mb-4">{Object.keys(stagingStats.byIndicator).length} unique indicators</div>
            {Object.entries(stagingStats.bySource).map(([src, count]) => (
              <div key={src} className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{src.toUpperCase()}</span>
                <span className="font-mono">{count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Match Summary */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Indicator Comparison</h2>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{matches}</div>
              <div className="text-xs text-gray-500">Match</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{mismatches}</div>
              <div className="text-xs text-gray-500">Different count</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{onlyMain}</div>
              <div className="text-xs text-gray-500">Only in main</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{onlyStaging}</div>
              <div className="text-xs text-gray-500">Only in staging</div>
            </div>
          </div>

          {diffs.length > 0 && (
            <>
              <h3 className="text-sm font-bold text-gray-500 mb-2">Differences ({diffs.length})</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b">
                    <th className="py-2">Indicator</th>
                    <th>Source</th>
                    <th className="text-right">Main</th>
                    <th className="text-right">Staging</th>
                    <th className="text-right">Diff</th>
                  </tr>
                </thead>
                <tbody>
                  {diffs.slice(0, 50).map(d => (
                    <tr key={d.id} className="border-b border-gray-50">
                      <td className="py-1.5 font-mono text-xs">{d.id}</td>
                      <td className="text-gray-400">{d.source}</td>
                      <td className="text-right font-mono">{d.mainCount}</td>
                      <td className="text-right font-mono">{d.stagingCount}</td>
                      <td className={`text-right font-mono font-bold ${d.diff > 0 ? 'text-green-600' : d.diff < 0 ? 'text-red-600' : ''}`}>
                        {d.diff > 0 ? '+' : ''}{d.diff}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {diffs.length === 0 && stagingStats.total > 0 && (
            <div className="text-center py-8 text-green-600 font-bold text-xl">
              All {matches} indicators match perfectly.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
