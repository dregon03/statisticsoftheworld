import Link from 'next/link';
import type { Metadata } from 'next';
import Globe from './Globe';

export const metadata: Metadata = {
  title: 'Vision',
  description: 'The future of Statistics of the World — the intelligence layer for understanding every country on Earth.',
};

export default function VisionPage() {
  return (
    <main className="min-h-screen bg-sky-50 text-gray-900 overflow-hidden">
      {/* Nav */}
      <header className="border-b border-gray-200 sticky top-0 bg-sky-50/90 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-500 rounded flex items-center justify-center font-bold text-xs text-white">SW</div>
            <span className="font-semibold text-gray-900">Statistics of the World</span>
          </Link>
          <nav className="flex gap-6 text-sm text-gray-500">
            <Link href="/countries" className="hover:text-gray-900 transition">Countries</Link>
            <Link href="/rankings" className="hover:text-gray-900 transition">Indicators</Link>
          </nav>
        </div>
      </header>

      {/* Globe Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center -mt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100/50 via-transparent to-transparent" />
        <Globe />
      </section>

      {/* Title below globe */}
      <section className="text-center px-6 -mt-8 mb-8">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
            Every country. Every indicator.
          </span>
        </h1>
      </section>

      {/* Stats bar */}
      <section className="border-y border-gray-200 bg-white/60">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-3 gap-8">
          {[
            { value: '217', label: 'Countries', color: 'text-blue-400' },
            { value: '285+', label: 'Indicators', color: 'text-cyan-400' },
            { value: '39K+', label: 'Data Points', color: 'text-emerald-400' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className={`text-3xl md:text-4xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* The Problem */}
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-16">
        <p className="text-2xl md:text-3xl text-gray-900 font-bold leading-snug mb-6">
          $110 trillion in global GDP. 8 billion lives. 217 sovereign nations. And the world still can&apos;t agree on the numbers.
        </p>
        <p className="text-lg text-gray-500 leading-relaxed mb-4">
          The IMF says US GDP is $31.8 trillion. The World Bank says $28.7 trillion. The UN says $29.3 trillion. All three are &ldquo;right&rdquo; &mdash; they just measure at different times, with different methods. Multiply that confusion across 300 indicators and 217 countries and you get the state of global data today: fragmented, delayed, and inaccessible.
        </p>
        <p className="text-lg text-gray-500 leading-relaxed">
          Policy gets made on stale numbers. Investors trade on incomplete pictures. Journalists cite whichever source they found first. AI systems hallucinate because there&apos;s no single authoritative endpoint. This is a solvable problem.
        </p>
      </section>

      {/* Vision sections */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-32">

        {/* 1 - Canonical Source */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 tracking-wider">LIVE</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">One table. Every source.</h2>
            <p className="text-gray-600 leading-relaxed text-lg mb-4">
              We put IMF, World Bank, and United Nations estimates side by side for every country &mdash; so you see the full picture, not just one organization&apos;s version. The same indicator, three independent measurements, compared in seconds.
            </p>
            <p className="text-gray-500 leading-relaxed">
              This is what Wikipedia does for GDP. We do it for 285 indicators &mdash; health, education, trade, governance, environment &mdash; automatically, always current.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-3">
            {[
              { rank: 1, flag: 'us', name: 'United States', imf: '$31.82T', wb: '$28.75T', un: '$29.30T' },
              { rank: 2, flag: 'cn', name: 'China', imf: '$20.65T', wb: '$18.74T', un: '$18.74T' },
              { rank: 3, flag: 'de', name: 'Germany', imf: '$5.33T', wb: '$4.69T', un: '$4.66T' },
              { rank: 4, flag: 'in', name: 'India', imf: '$4.51T', wb: '$3.91T', un: '$3.95T' },
              { rank: 5, flag: 'jp', name: 'Japan', imf: '$4.46T', wb: '$4.03T', un: '$4.03T' },
            ].map(row => (
              <div key={row.rank} className="flex items-center gap-3 text-sm">
                <span className="text-gray-600 w-4">{row.rank}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://flagcdn.com/w20/${row.flag}.png`} width={20} alt="" className="shrink-0" />
                <span className="flex-1 text-gray-700">{row.name}</span>
                <span className="font-mono text-blue-400 text-xs">{row.imf}</span>
                <span className="font-mono text-gray-500 text-xs">{row.wb}</span>
                <span className="font-mono text-gray-600 text-xs">{row.un}</span>
              </div>
            ))}
            <div className="flex justify-end gap-6 text-[10px] text-gray-600 pt-2 border-t border-gray-200">
              <span>IMF</span><span>World Bank</span><span>United Nations</span>
            </div>
          </div>
        </div>

        {/* 2 - Nowcasting */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-end gap-1 h-40 px-4">
              {[40, 42, 38, 45, 50, 48, 55, 52, 58, 62, 60, 65].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end items-center">
                  <div
                    className={`w-full rounded-t ${i >= 9 ? 'bg-cyan-500/60 border border-cyan-500/40' : 'bg-blue-500/30'}`}
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-gray-600 mt-2 px-4">
              <span>Jan</span><span>Mar</span><span>Jun</span><span>Sep</span><span className="text-cyan-400">Now</span>
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-blue-500/30" /> Official</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-cyan-500/60 border border-cyan-500/40" /> Nowcast</div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 tracking-wider">NEXT</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">Know before the numbers drop</h2>
            <p className="text-gray-600 leading-relaxed text-lg mb-4">
              Canada&apos;s GDP report comes out 60 days after the quarter ends. By then, the economy has already moved. What if you could see the trajectory <em className="text-gray-900 not-italic font-medium">now</em> &mdash; from satellite nightlights, container shipping volumes, electricity grids, and real-time payment flows?
            </p>
            <p className="text-gray-500 leading-relaxed">
              Nowcasting turns lagging indicators into leading ones. Hedge funds pay millions for this. We&apos;re building it for every country, starting with the US and Canada.
            </p>
          </div>
        </div>

        {/* 3 - World's API */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 tracking-wider">NEXT</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">The data layer for the AI era</h2>
            <p className="text-gray-600 leading-relaxed text-lg mb-4">
              A billion AI agents are about to be deployed &mdash; trading, analyzing, writing policy, advising governments. Every one of them will need to answer: &ldquo;How is this country doing?&rdquo; They need a source they can trust, call in milliseconds, and cite with confidence.
            </p>
            <p className="text-gray-500 leading-relaxed">
              REST APIs. Model Context Protocol. Tool-use for Claude, GPT, Gemini. We become the Stripe of country intelligence &mdash; one integration, every country, every metric.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-sm p-6 font-mono text-sm">
            <div className="text-gray-500 mb-3">// Any agent, any framework</div>
            <div className="mb-4">
              <span className="text-cyan-400">GET</span>{' '}
              <span className="text-gray-400">/api/v1/country/</span>
              <span className="text-white">NGA</span>
              <span className="text-gray-400">/gdp</span>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4 text-xs leading-relaxed">
              <div className="text-gray-600">{`{`}</div>
              <div className="ml-3"><span className="text-blue-400">&quot;imf&quot;</span>: {`{`} <span className="text-emerald-400">472.6B</span>, <span className="text-gray-500">2026</span> {`}`},</div>
              <div className="ml-3"><span className="text-gray-400">&quot;world_bank&quot;</span>: {`{`} <span className="text-emerald-400">362.8B</span>, <span className="text-gray-500">2024</span> {`}`},</div>
              <div className="ml-3"><span className="text-gray-400">&quot;united_nations&quot;</span>: {`{`} <span className="text-emerald-400">362.9B</span>, <span className="text-gray-500">2024</span> {`}`}</div>
              <div className="text-gray-600">{`}`}</div>
            </div>
          </div>
        </div>

        {/* 4 - AI Intelligence */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 space-y-3">
            {[
              'Which Sub-Saharan countries grew fastest while reducing inequality?',
              'Compare healthcare outcomes: countries spending >8% vs <4% of GDP on health.',
              'Which countries are most likely to face a debt crisis in 2 years?',
            ].map((q, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl shadow-sm px-5 py-4 text-gray-600 text-lg italic relative">
                <span className="absolute -left-3 top-4 w-1.5 h-1.5 rounded-full bg-purple-500" />
                &ldquo;{q}&rdquo;
              </div>
            ))}
          </div>
          <div className="order-1 md:order-2">
            <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 tracking-wider">FUTURE</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">Ask anything about any country</h2>
            <p className="text-gray-600 leading-relaxed text-lg mb-4">
              McKinsey charges $500K for a country market entry report. A PhD student spends months assembling data for a single research question. Both are doing the same thing &mdash; connecting dots across hundreds of indicators. That should take seconds.
            </p>
            <p className="text-gray-500 leading-relaxed">
              Natural language queries across 50 years of history, 217 countries, every source. With citations, confidence intervals, and methodology transparency that no consultant can match.
            </p>
          </div>
        </div>

        {/* 5 - Country Scores */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 tracking-wider">FUTURE</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">The open Moody&apos;s</h2>
            <p className="text-gray-600 leading-relaxed text-lg mb-4">
              Three companies &mdash; Moody&apos;s, S&amp;P, Fitch &mdash; rate the creditworthiness of nations behind closed doors. Their downgrades move billions. Their methodology is proprietary. Their track record includes missing the 2008 crisis entirely.
            </p>
            <p className="text-gray-500 leading-relaxed">
              We compute country scores from hundreds of public indicators &mdash; development trajectory, governance quality, innovation capacity, sustainability &mdash; with fully transparent methodology. When a country improves, the score updates. No phone calls. No politics.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
            {[
              { label: 'Development', score: 82, color: 'bg-emerald-500' },
              { label: 'Innovation', score: 71, color: 'bg-blue-500' },
              { label: 'Sustainability', score: 45, color: 'bg-amber-500' },
              { label: 'Governance', score: 68, color: 'bg-purple-500' },
              { label: 'Human Capital', score: 77, color: 'bg-cyan-500' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="text-gray-900 font-mono">{item.score}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Closing */}
      <section className="border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <p className="text-3xl md:text-4xl text-gray-900 font-bold leading-snug mb-4">
            Every country deserves to be understood.
          </p>
          <p className="text-lg text-gray-500 mb-10">
            Not just the G7. Not just the ones that make the news. All 217 &mdash; measured fairly, compared honestly, updated continuously. That&apos;s what we&apos;re building.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition">
              Explore the data
            </Link>
            <Link href="/countries" className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-sm font-medium transition">
              Browse countries
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
