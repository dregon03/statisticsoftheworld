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
      <section className="relative flex flex-col items-center justify-center pt-12 pb-4">
        <Globe />
      </section>

      {/* Title below globe */}
      <section className="text-center px-6 mt-4 mb-8">
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/vision-1.jpg" alt="Global data network visualization" className="rounded-2xl shadow-lg" />
        </div>

        {/* 2 - Nowcasting */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/vision-2.jpg" alt="Nowcasting visualization" className="order-2 md:order-1 rounded-2xl shadow-lg" />
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/vision-3.jpg" alt="AI data layer visualization" className="rounded-2xl shadow-lg" />
        </div>

        {/* 4 - AI Intelligence */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/vision-4.jpg" alt="AI intelligence interface" className="order-2 md:order-1 rounded-2xl shadow-lg" />
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/vision-5.jpg" alt="Country scoring dashboard" className="rounded-2xl shadow-lg" />
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
