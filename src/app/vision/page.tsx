import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vision',
  description: 'The future of Statistics of the World — the intelligence layer for understanding every country on Earth.',
};

export default function VisionPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <header className="border-b border-white/5 sticky top-0 bg-gray-950/90 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-500 rounded flex items-center justify-center font-bold text-xs text-white">SW</div>
            <span className="font-semibold text-white">Statistics of the World</span>
          </Link>
          <nav className="flex gap-6 text-sm text-gray-500">
            <Link href="/countries" className="hover:text-white transition">Countries</Link>
            <Link href="/rankings" className="hover:text-white transition">Indicators</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent" />
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-24 relative">
          <div className="text-blue-400 text-sm font-mono tracking-widest mb-6 uppercase">Vision</div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-8">
            The intelligence layer for{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              every country on Earth
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl">
            The world publishes enormous amounts of data about itself &mdash; but it&apos;s scattered across dozens of organizations, buried in PDFs, and months out of date. We&apos;re building the system that makes all of it instantly accessible to humans and machines alike.
          </p>
        </div>
      </section>

      {/* Phases */}
      <section className="max-w-3xl mx-auto px-6 pb-32">
        <div className="space-y-24">

          {/* Phase 1 */}
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500 to-blue-500/0" />
            <div className="flex items-center gap-3 mb-6">
              <span className="relative -left-[21px] w-2.5 h-2.5 bg-blue-500 rounded-full ring-4 ring-gray-950" />
              <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 tracking-wider">LIVE</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">The canonical source</h2>
            <p className="text-gray-400 leading-relaxed mb-4 text-lg">
              Every time someone asks &ldquo;What&apos;s the GDP of Nigeria?&rdquo; &mdash; the answer should come from one place. Not Wikipedia&apos;s manually-edited tables. Not the World Bank&apos;s data portal that requires a PhD to navigate.
            </p>
            <p className="text-gray-400 leading-relaxed text-lg">
              One clean, fast, comprehensive source. IMF, World Bank, and United Nations data in one table. 285 indicators. 217 countries. Updated automatically.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">285</div>
                <div className="text-xs text-gray-500 mt-1">Indicators</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">217</div>
                <div className="text-xs text-gray-500 mt-1">Countries</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">3</div>
                <div className="text-xs text-gray-500 mt-1">Sources</div>
              </div>
            </div>
          </div>

          {/* Phase 2 */}
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500 to-cyan-500/0" />
            <div className="flex items-center gap-3 mb-6">
              <span className="relative -left-[21px] w-2.5 h-2.5 bg-cyan-500 rounded-full ring-4 ring-gray-950" />
              <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 tracking-wider">NEXT</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Nowcast everything</h2>
            <p className="text-gray-400 leading-relaxed mb-4 text-lg">
              Official GDP numbers are released quarterly, months after the fact. By the time the world sees the numbers, the reality has already changed.
            </p>
            <p className="text-gray-400 leading-relaxed mb-4 text-lg">
              We&apos;re building models that estimate key economic indicators <em className="text-white not-italic font-medium">before official releases</em> &mdash; using satellite imagery, shipping movements, electricity consumption, internet traffic, and real-time transaction data. Starting with the US and Canada, then every G20 economy, then everywhere.
            </p>
            <p className="text-gray-500 leading-relaxed text-lg">
              Hedge funds pay millions for this intelligence. We&apos;ll make the basic signals free and the deep analysis institutional-grade.
            </p>
          </div>

          {/* Phase 3 */}
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500 to-cyan-500/0" />
            <div className="flex items-center gap-3 mb-6">
              <span className="relative -left-[21px] w-2.5 h-2.5 bg-cyan-500 rounded-full ring-4 ring-gray-950" />
              <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 tracking-wider">NEXT</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">The world&apos;s API</h2>
            <p className="text-gray-400 leading-relaxed mb-4 text-lg">
              Every newsroom writing about a country&apos;s economy. Every research paper citing development statistics. Every app showing country comparisons.
            </p>
            <p className="text-gray-400 leading-relaxed mb-4 text-lg">
              But the biggest consumer won&apos;t be humans &mdash; it will be <em className="text-white not-italic font-medium">AI agents</em>. Autonomous systems making investment decisions, writing policy briefs, generating reports. When an agent needs the inflation rate in Turkey or the debt-to-GDP ratio of Argentina, it needs an authoritative source it can call in milliseconds.
            </p>
            <p className="text-gray-400 leading-relaxed text-lg">
              REST APIs. Model Context Protocol. Tool-use endpoints. Whatever protocol AI systems speak next &mdash; we&apos;re the data layer they connect to.
            </p>
            <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-5 font-mono text-sm">
              <div className="text-gray-500 mb-2">// Any AI agent, any framework</div>
              <div><span className="text-cyan-400">GET</span> <span className="text-gray-300">/api/v1/country/NGA/gdp</span></div>
              <div className="text-gray-600 mt-1">{`{`}</div>
              <div className="text-gray-400 ml-4">&quot;imf&quot;: {`{`} &quot;value&quot;: 472.6, &quot;year&quot;: 2026 {`}`},</div>
              <div className="text-gray-400 ml-4">&quot;world_bank&quot;: {`{`} &quot;value&quot;: 362.8, &quot;year&quot;: 2024 {`}`},</div>
              <div className="text-gray-400 ml-4">&quot;united_nations&quot;: {`{`} &quot;value&quot;: 362.9, &quot;year&quot;: 2024 {`}`}</div>
              <div className="text-gray-600">{`}`}</div>
            </div>
          </div>

          {/* Phase 4 */}
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500 to-purple-500/0" />
            <div className="flex items-center gap-3 mb-6">
              <span className="relative -left-[21px] w-2.5 h-2.5 bg-purple-500 rounded-full ring-4 ring-gray-950" />
              <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 tracking-wider">FUTURE</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">AI-native intelligence</h2>
            <div className="space-y-3 mb-6">
              <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-gray-300 text-lg italic">
                &ldquo;Which Sub-Saharan countries grew fastest while reducing inequality over the last decade?&rdquo;
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-gray-300 text-lg italic">
                &ldquo;Compare healthcare outcomes between countries spending &gt;8% of GDP on health vs &lt;4%.&rdquo;
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-gray-300 text-lg italic">
                &ldquo;Which countries are most likely to experience a debt crisis in the next 2 years?&rdquo;
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed text-lg">
              Not dashboards. Not pivot tables. Natural language across 300+ indicators, 217 countries, and 50 years of history &mdash; with answers that show sources, methodology, and confidence levels. The analyst that never sleeps.
            </p>
          </div>

          {/* Phase 5 */}
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500 to-transparent" />
            <div className="flex items-center gap-3 mb-6">
              <span className="relative -left-[21px] w-2.5 h-2.5 bg-purple-500 rounded-full ring-4 ring-gray-950" />
              <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 tracking-wider">FUTURE</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Country scores</h2>
            <p className="text-gray-400 leading-relaxed mb-4 text-lg">
              Moody&apos;s and S&amp;P score countries on debt risk behind closed doors. We&apos;ll score them on <em className="text-white not-italic font-medium">everything</em> &mdash; development trajectory, institutional quality, innovation capacity, sustainability, human capital &mdash; computed transparently from hundreds of underlying indicators.
            </p>
            <p className="text-gray-400 leading-relaxed text-lg">
              Open methodology. Open data. Open scores. When a country improves its education system or reduces corruption, the score updates automatically. A living, breathing assessment of every nation&apos;s progress &mdash; accountable to the data, not to politics.
            </p>
          </div>

        </div>

        {/* Closing */}
        <div className="mt-32 border-t border-white/10 pt-16">
          <p className="text-2xl md:text-3xl text-white font-bold leading-snug mb-3">
            The world is drowning in data about itself but starving for understanding.
          </p>
          <p className="text-xl text-gray-500 mb-10">
            We&apos;re building the layer that turns 217 countries&apos; worth of scattered statistics into clarity &mdash; for every human, every agent, every decision.
          </p>
          <div className="flex gap-4">
            <Link href="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition">
              Explore the data
            </Link>
            <Link href="/countries" className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-lg text-sm font-medium transition border border-white/10">
              Browse countries
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
