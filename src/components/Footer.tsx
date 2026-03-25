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
    return <p className="text-[12px] text-green-600">Subscribed! You'll receive the weekly digest.</p>;
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="px-3 py-1.5 text-[12px] border border-[#e8e8e8] rounded-lg bg-white focus:outline-none focus:border-[#0066cc] transition w-[200px]"
        required
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-3 py-1.5 text-[12px] bg-[#0066cc] text-white rounded-lg hover:bg-[#0055aa] transition disabled:opacity-50"
      >
        {status === 'loading' ? '...' : 'Subscribe'}
      </button>
      {status === 'error' && <span className="text-[11px] text-red-500 self-center">Failed</span>}
    </form>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-[#e8e8e8] mt-12">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Newsletter signup */}
        <div className="mb-6 pb-5 border-b border-[#f0f0f0]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[13px] font-semibold text-[#333]">Weekly Digest</div>
              <div className="text-[11px] text-[#999]">Prediction markets, data releases, and global trends — every Monday.</div>
            </div>
            <NewsletterForm />
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-6 text-[12px] text-[#999]">
          <div>
            <p>Data from IMF, World Bank, FRED, UN COMTRADE, ForexFactory, Finnhub, Polymarket, and Alpha Vantage.</p>
            <p className="mt-1">Statistics of the World &copy; {new Date().getFullYear()}</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/countries" className="hover:text-[#333] transition">Countries</Link>
            <Link href="/indicators" className="hover:text-[#333] transition">Indicators</Link>
            <Link href="/compare" className="hover:text-[#333] transition">Compare</Link>
            <Link href="/map" className="hover:text-[#333] transition">Map</Link>
            <Link href="/scatter" className="hover:text-[#333] transition">Scatter</Link>
            <Link href="/regions" className="hover:text-[#333] transition">Regions</Link>
            <Link href="/calendar" className="hover:text-[#333] transition">Calendar</Link>
            <Link href="/credit-ratings" className="hover:text-[#333] transition">Ratings</Link>
            <Link href="/markets" className="hover:text-[#333] transition">Markets</Link>
            <Link href="/markets/commodities" className="hover:text-[#333] transition">Commodities</Link>
            <Link href="/predictions" className="hover:text-[#333] transition">Predictions</Link>
            <Link href="/pricing" className="hover:text-[#333] transition">Pricing</Link>
            <Link href="/api-docs" className="hover:text-[#333] transition">API</Link>
            <Link href="/ai" className="hover:text-[#333] transition">AI</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
