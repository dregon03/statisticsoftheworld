import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vision',
  description: 'The future of Statistics of the World — the intelligence layer for understanding every country on Earth.',
};

export default function VisionPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center font-bold text-xs text-white">SW</div>
            <span className="font-semibold">Statistics of the World</span>
          </Link>
          <nav className="flex gap-6 text-sm text-gray-500">
            <Link href="/countries" className="hover:text-gray-900 transition">Countries</Link>
            <Link href="/rankings" className="hover:text-gray-900 transition">Indicators</Link>
          </nav>
        </div>
      </header>

      <article className="max-w-2xl mx-auto px-6 py-20">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
          Every country.<br />
          Every indicator.<br />
          <span className="text-blue-600">Real time.</span>
        </h1>

        <p className="text-xl text-gray-500 mb-16 leading-relaxed">
          The world publishes enormous amounts of data about itself &mdash; GDP, health, education, trade, governance &mdash; but it&apos;s scattered across dozens of organizations, buried in PDFs, months out of date, and impossible to compare. We&apos;re fixing that.
        </p>

        {/* Phase 1 */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">NOW</span>
            <h2 className="text-2xl font-bold">The canonical source</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            Every time someone asks &ldquo;What&apos;s the GDP of Nigeria?&rdquo; or &ldquo;Which country has the highest life expectancy?&rdquo;, the answer should come from one place. Not Wikipedia&apos;s manually-edited tables. Not the World Bank&apos;s data portal that requires a PhD to navigate. One clean, fast, comprehensive source &mdash; with data from every credible international organization side by side.
          </p>
          <p className="text-gray-600 leading-relaxed">
            285 indicators. 22 categories. 217 countries. IMF, World Bank, and United Nations data in one table. This is where we start.
          </p>
        </section>

        {/* Phase 2 */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">NEXT</span>
            <h2 className="text-2xl font-bold">Nowcast everything</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            Official GDP numbers are released quarterly, months after the fact. Unemployment figures lag by weeks. Trade data takes months. By the time the world sees the numbers, the reality has already changed.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            We&apos;re building nowcasting models that estimate key economic indicators <em>before</em> official releases &mdash; using satellite imagery, shipping container movements, electricity consumption, internet traffic, and real-time transaction data. Starting with the US and Canada, then every G20 economy, then everywhere.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Hedge funds pay millions for this kind of intelligence. We&apos;ll make the basic signals free and the deep analysis institutional-grade.
          </p>
        </section>

        {/* Phase 3 */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">FUTURE</span>
            <h2 className="text-2xl font-bold">The world&apos;s API</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            Every newsroom writing about a country&apos;s economy. Every research paper citing development statistics. Every app showing country comparisons. Every AI agent that needs to know how a country is doing. They all need the same thing: reliable, structured, up-to-date country data through a simple API.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Stripe became the API for payments. Twilio became the API for communications. We&apos;re becoming the API for country intelligence.
          </p>
        </section>

        {/* Phase 4 */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">FUTURE</span>
            <h2 className="text-2xl font-bold">AI-native intelligence</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            &ldquo;Which Sub-Saharan countries grew fastest while reducing inequality over the last decade?&rdquo;
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            &ldquo;Compare healthcare outcomes between countries that spend more than 8% of GDP on health vs those that spend less.&rdquo;
          </p>
          <p className="text-gray-600 leading-relaxed">
            Not dashboards. Not pivot tables. Natural language questions across 300+ indicators, 217 countries, and 50 years of history &mdash; with answers that show their sources, methodology, and confidence level. The analyst that never sleeps, for every country on Earth.
          </p>
        </section>

        {/* Phase 5 */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">FUTURE</span>
            <h2 className="text-2xl font-bold">Country scores</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            Credit rating agencies score countries on debt risk. We&apos;ll score them on everything &mdash; development trajectory, institutional quality, innovation capacity, sustainability, human capital &mdash; computed transparently from hundreds of underlying indicators.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Not behind closed doors like Moody&apos;s. Open methodology, open data, open scores. When a country improves its education system or reduces corruption, the score updates automatically. A living, breathing assessment of every nation&apos;s progress.
          </p>
        </section>

        {/* Closing */}
        <section className="border-t border-gray-100 pt-12">
          <p className="text-xl text-gray-900 font-semibold leading-relaxed mb-6">
            The world is drowning in data about itself but starving for understanding. We&apos;re building the layer that turns 217 countries&apos; worth of scattered statistics into clarity.
          </p>
          <div className="flex gap-4">
            <Link href="/" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
              Explore the data
            </Link>
            <Link href="/countries" className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition">
              Browse countries
            </Link>
          </div>
        </section>
      </article>

      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-gray-400">
          <p>Statistics of the World 2026</p>
        </div>
      </footer>
    </main>
  );
}
