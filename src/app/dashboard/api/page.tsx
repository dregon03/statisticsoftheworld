'use client';

import { useState } from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface KeyInfo {
  email: string;
  tier: string;
  rateLimit: number;
  requestsToday: number;
  requestsTotal: number;
  active: boolean;
  createdAt: string;
}

const TIER_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700',
  pro: 'bg-blue-100 text-blue-700',
  business: 'bg-purple-100 text-purple-700',
  enterprise: 'bg-amber-100 text-amber-700',
};

export default function ApiDashboard() {
  const [apiKey, setApiKey] = useState('');
  const [info, setInfo] = useState<KeyInfo | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function lookupKey() {
    if (!apiKey.trim()) return;
    setLoading(true);
    setError('');
    setInfo(null);
    try {
      const res = await fetch(`/api/keys?key=${encodeURIComponent(apiKey.trim())}`);
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || 'API key not found');
        return;
      }
      const data = await res.json();
      setInfo(data);
    } catch {
      setError('Failed to look up key');
    } finally {
      setLoading(false);
    }
  }

  const usagePct = info ? Math.min(100, (info.requestsToday / info.rateLimit) * 100) : 0;
  const usageColor = usagePct > 90 ? 'bg-red-500' : usagePct > 70 ? 'bg-amber-500' : 'bg-green-500';

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#1a1a2e]">
      <Nav />

      <section className="max-w-[720px] mx-auto px-4 py-10">
        <h1 className="text-[28px] font-bold mb-1">API Dashboard</h1>
        <p className="text-[15px] text-[#64748b] mb-8">Monitor your API key usage and manage your subscription.</p>

        {/* Key input */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <label className="text-[14px] font-medium text-[#0d1b2a] block mb-2">Enter your API key</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && lookupKey()}
              placeholder="sotw_..."
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-mono bg-[#f8f9fb] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/30 focus:border-[#0066cc]"
            />
            <button
              onClick={lookupKey}
              disabled={loading || !apiKey.trim()}
              className="px-5 py-2.5 bg-[#0d1b2a] text-white rounded-lg text-[14px] font-medium hover:bg-[#1a2d4a] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Loading...' : 'Look Up'}
            </button>
          </div>
          {error && <p className="mt-3 text-[14px] text-red-500">{error}</p>}
          <p className="mt-2 text-[13px] text-[#94a3b8]">
            Don&apos;t have a key? <Link href="/pricing" className="text-[#0066cc] hover:underline">Get one free</Link>
          </p>
        </div>

        {/* Dashboard content */}
        {info && (
          <div className="space-y-4">
            {/* Status bar */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-[18px] font-semibold">API Key Status</h2>
                    <span className={`px-2 py-0.5 rounded-full text-[12px] font-medium ${info.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {info.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-[14px] text-[#64748b]">{info.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[13px] font-semibold ${TIER_COLORS[info.tier] || TIER_COLORS.free}`}>
                  {info.tier.charAt(0).toUpperCase() + info.tier.slice(1)}
                </span>
              </div>

              {/* Usage bar */}
              <div className="mb-2">
                <div className="flex justify-between text-[13px] mb-1.5">
                  <span className="text-[#64748b]">Today&apos;s usage</span>
                  <span className="font-mono font-medium text-[#0d1b2a]">
                    {info.requestsToday.toLocaleString()} / {info.rateLimit.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${usageColor} rounded-full transition-all duration-500`}
                    style={{ width: `${usagePct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[12px] text-[#94a3b8] mt-1">
                  <span>{usagePct.toFixed(1)}% used</span>
                  <span>{Math.max(0, info.rateLimit - info.requestsToday).toLocaleString()} remaining</span>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Tier" value={info.tier.charAt(0).toUpperCase() + info.tier.slice(1)} />
              <StatCard label="Daily Limit" value={info.rateLimit.toLocaleString()} />
              <StatCard label="Total Requests" value={info.requestsTotal.toLocaleString()} />
              <StatCard label="Member Since" value={new Date(info.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
            </div>

            {/* Quick start */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-[15px] font-semibold mb-3">Quick Start</h3>
              <pre className="bg-[#0d1b2a] text-[#e2e8f0] p-4 rounded-lg text-[13px] overflow-x-auto">
{`curl -H "X-API-Key: ${apiKey}" \\
  https://statisticsoftheworld.com/api/v1/countries

curl -H "X-API-Key: ${apiKey}" \\
  https://statisticsoftheworld.com/api/v1/indicators?country=USA

curl -H "X-API-Key: ${apiKey}" \\
  https://statisticsoftheworld.com/api/v1/history?country=USA&indicator=GDP`}</pre>
              <div className="flex gap-3 mt-4">
                <Link href="/api-docs" className="text-[14px] text-[#0066cc] hover:underline">Full API Docs →</Link>
                <Link href="/pricing" className="text-[14px] text-[#0066cc] hover:underline">
                  {info.tier === 'free' ? 'Upgrade Plan →' : 'Manage Subscription →'}
                </Link>
              </div>
            </div>

            {/* Upgrade CTA for free/developer tier */}
            {(info.tier === 'free') && (
              <div className="bg-gradient-to-r from-[#0d1b2a] to-[#1a3a5c] rounded-xl p-6 text-white">
                <h3 className="text-[16px] font-semibold mb-1">Need more requests?</h3>
                <p className="text-[14px] text-[#94b8d8] mb-4">
                  Upgrade to Pro for 50,000 requests/day and commercial use license.
                </p>
                <Link
                  href="/pricing"
                  className="inline-block px-5 py-2.5 bg-white text-[#0d1b2a] rounded-lg text-[14px] font-medium hover:bg-gray-100 transition"
                >
                  View Plans — from $49/mo
                </Link>
              </div>
            )}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="text-[12px] text-[#94a3b8] mb-1">{label}</div>
      <div className="text-[16px] font-semibold text-[#0d1b2a]">{value}</div>
    </div>
  );
}
