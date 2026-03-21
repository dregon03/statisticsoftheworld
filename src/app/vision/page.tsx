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

      {/* Vision sections */}
      <section className="max-w-5xl mx-auto px-6 py-24 space-y-32">

        {/* 1 - Canonical Source */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 tracking-wider">LIVE</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">The canonical source</h2>
            <p className="text-gray-400 leading-relaxed text-lg mb-4">
              When anyone asks &ldquo;What&apos;s the GDP of Nigeria?&rdquo; &mdash; the answer comes from here. IMF, World Bank, and United Nations data in one table. No PDFs, no spreadsheets, no waiting.
            </p>
            <p className="text-gray-500 leading-relaxed">
              Updated automatically. Compared across sources. Free and open.
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
                <span className="flex-1 text-gray-300">{row.name}</span>
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
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">Nowcast everything</h2>
            <p className="text-gray-400 leading-relaxed text-lg mb-4">
              Official GDP numbers arrive months late. We estimate economic indicators <em className="text-gray-900 not-italic font-medium">before</em> official releases &mdash; using satellite imagery, shipping data, electricity consumption, and real-time transactions.
            </p>
            <p className="text-gray-500 leading-relaxed">
              Starting with US &amp; Canada. Then G20. Then everywhere.
            </p>
          </div>
        </div>

        {/* 3 - World's API */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 tracking-wider">NEXT</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">The world&apos;s API</h2>
            <p className="text-gray-400 leading-relaxed text-lg mb-4">
              The biggest consumer of country data won&apos;t be humans &mdash; it will be <em className="text-gray-900 not-italic font-medium">AI agents</em>. Autonomous systems making decisions, writing reports, answering questions.
            </p>
            <p className="text-gray-500 leading-relaxed">
              REST APIs. Model Context Protocol. Tool-use endpoints. Whatever protocol AI speaks next &mdash; we&apos;re the data layer.
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
              <div key={i} className="bg-white border border-gray-200 rounded-xl shadow-sm px-5 py-4 text-gray-300 text-lg italic relative">
                <span className="absolute -left-3 top-4 w-1.5 h-1.5 rounded-full bg-purple-500" />
                &ldquo;{q}&rdquo;
              </div>
            ))}
          </div>
          <div className="order-1 md:order-2">
            <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 tracking-wider">FUTURE</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">AI-native intelligence</h2>
            <p className="text-gray-400 leading-relaxed text-lg mb-4">
              Natural language across 300+ indicators, 217 countries, 50 years of history. With sources, methodology, and confidence levels.
            </p>
            <p className="text-gray-500 leading-relaxed">
              The analyst that never sleeps. For every country on Earth.
            </p>
          </div>
        </div>

        {/* 5 - Country Scores */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 tracking-wider">FUTURE</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">Country scores</h2>
            <p className="text-gray-400 leading-relaxed text-lg mb-4">
              Moody&apos;s scores countries behind closed doors. We score them on <em className="text-gray-900 not-italic font-medium">everything</em> &mdash; transparently, from hundreds of indicators.
            </p>
            <p className="text-gray-500 leading-relaxed">
              Open methodology. Open data. Accountable to the data, not politics.
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
            The world is drowning in data about itself but starving for understanding.
          </p>
          <p className="text-lg text-gray-500 mb-10">
            We&apos;re building the layer that turns it into clarity &mdash; for every human, every agent, every decision.
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
