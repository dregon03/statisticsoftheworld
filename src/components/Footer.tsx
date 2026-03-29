'use client';

import { useState } from 'react';
import Link from 'next/link';

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return <p className="text-[15px] text-emerald-400">Subscribed! You'll receive the weekly digest.</p>;
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="px-3 py-1.5 text-[15px] border border-white/15 rounded-lg bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition w-[200px]"
        required
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-3 py-1.5 text-[15px] bg-white text-[#0d1b2a] font-semibold rounded-lg hover:bg-white/90 transition disabled:opacity-50"
      >
        {status === 'loading' ? '...' : 'Subscribe'}
      </button>
      {status === 'error' && <span className="text-[14px] text-red-400 self-center">Failed</span>}
    </form>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#0d1b2a] mt-12">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Newsletter signup */}
        <div className="mb-6 pb-6 border-b border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[14px] font-semibold text-white">Weekly Digest</div>
              <div className="text-[14px] text-white/40">Prediction markets, data releases, and global trends — every Monday.</div>
            </div>
            <NewsletterForm />
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-6 text-[15px] text-white/40">
          <div>
            <p>Data from IMF, World Bank, FRED, UN COMTRADE, ForexFactory, Finnhub, Polymarket, and Alpha Vantage.</p>
            <p className="mt-1 text-white/25">Statistics of the World &copy; {new Date().getFullYear()}</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/countries" className="hover:text-white transition">Countries</Link>
            <Link href="/indicators" className="hover:text-white transition">Indicators</Link>
            <Link href="/compare" className="hover:text-white transition">Compare</Link>
            <Link href="/map" className="hover:text-white transition">Map</Link>
            <Link href="/scatter" className="hover:text-white transition">Scatter</Link>
            <Link href="/regions" className="hover:text-white transition">Regions</Link>
            <Link href="/calendar" className="hover:text-white transition">Calendar</Link>
            <Link href="/credit-ratings" className="hover:text-white transition">Ratings</Link>
            <Link href="/markets" className="hover:text-white transition">Markets</Link>
            <Link href="/markets/commodities" className="hover:text-white transition">Commodities</Link>
            <Link href="/predictions" className="hover:text-white transition">Predictions</Link>
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link href="/api-docs" className="hover:text-white transition">API</Link>
            <Link href="/ai" className="hover:text-white transition">AI</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
