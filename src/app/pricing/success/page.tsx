'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

const TIER_DETAILS: Record<string, { name: string; limit: string; price: string }> = {
  pro: { name: 'Pro', limit: '50,000', price: '$49/mo' },
  business: { name: 'Business', limit: '500,000', price: '$500/mo' },
};

function SuccessContent() {
  const params = useSearchParams();
  const tier = params.get('tier') || 'pro';
  const sessionId = params.get('session_id') || '';
  const details = TIER_DETAILS[tier] || TIER_DETAILS.pro;

  const [apiKey, setApiKey] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(!!sessionId);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    let attempts = 0;
    const fetchKey = () => {
      fetch(`/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`)
        .then(r => r.json())
        .then(data => {
          if (data.apiKey) {
            setApiKey(data.apiKey);
            setEmail(data.email || '');
            setLoading(false);
          } else if (data.error?.includes('processing') && attempts < 3) {
            // Webhook may not have fired yet — retry
            attempts++;
            setTimeout(fetchKey, 2000);
          } else {
            setError(data.error || 'Could not retrieve API key');
            setLoading(false);
          }
        })
        .catch(() => { setError('Network error'); setLoading(false); });
    };
    fetchKey();
  }, [sessionId]);

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="max-w-[600px] mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-[28px] font-bold text-[#0d1b2a] mb-2">Welcome to SOTW {details.name}</h1>
      <p className="text-[16px] text-[#64748b] mb-8">
        Your subscription is active. You now have {details.limit} API requests per day.
      </p>

      {/* API Key Card */}
      {loading ? (
        <div className="border border-[#d5dce6] rounded-xl p-6 mb-8 bg-white text-[15px] text-[#64748b]">
          Retrieving your API key...
        </div>
      ) : apiKey ? (
        <div className="border border-[#d5dce6] rounded-xl p-6 mb-8 bg-white text-left">
          <div className="text-[14px] font-medium text-[#64748b] mb-1">Your API Key</div>
          <div className="font-mono text-[15px] text-[#0d1b2a] bg-[#f4f6f9] border border-[#d5dce6] rounded-lg p-3 break-all mb-3">
            {apiKey}
          </div>
          <button
            onClick={copyKey}
            className="w-full px-4 py-2 bg-[#0d1b2a] text-white rounded-lg text-[15px] font-medium hover:bg-[#162d4a] transition"
          >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
          <p className="text-[14px] text-[#94a3b8] mt-3">
            Save this key — you won&apos;t be able to see it again after leaving this page.
          </p>
        </div>
      ) : error ? (
        <div className="border border-red-200 rounded-xl p-6 mb-8 bg-red-50 text-[15px] text-red-600">
          {error}
        </div>
      ) : null}

      {/* Next Steps */}
      <div className="border border-[#d5dce6] rounded-xl p-6 text-left mb-8 bg-white">
        <h2 className="text-[16px] font-semibold text-[#0d1b2a] mb-4">Quick start</h2>
        <div className="space-y-4 text-[15px] text-[#64748b]">
          <div className="flex gap-3">
            <span className="text-green-600 font-bold shrink-0">1.</span>
            <div>
              <div className="text-[#0d1b2a] font-medium">Make your first request</div>
              <code className="text-[13px] bg-[#f4f6f9] px-2 py-1 rounded block mt-1 break-all">
                curl -H &quot;X-API-Key: {apiKey ? apiKey.slice(0, 16) + '...' : 'YOUR_KEY'}&quot; https://statisticsoftheworld.com/api/v1/countries
              </code>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-green-600 font-bold shrink-0">2.</span>
            <div>
              <div className="text-[#0d1b2a] font-medium">Explore the API</div>
              Check the <Link href="/api-docs" className="text-[#0066cc] hover:underline">API documentation</Link> for all available endpoints — countries, indicators, rankings, history, and more.
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-green-600 font-bold shrink-0">3.</span>
            <div>
              <div className="text-[#0d1b2a] font-medium">Manage your subscription</div>
              Stripe will email a receipt to {email || 'your email'}. Use the link in the receipt to update payment or cancel.
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Link
          href="/api-docs"
          className="px-5 py-2.5 bg-[#0d1b2a] text-white rounded-lg text-[15px] font-medium hover:bg-[#162d4a] transition"
        >
          View API Docs
        </Link>
        <Link
          href="/pricing"
          className="px-5 py-2.5 border border-[#d5dce6] rounded-lg text-[15px] font-medium text-[#64748b] hover:bg-[#f4f6f9] transition"
        >
          Back to Pricing
        </Link>
      </div>

      <p className="text-[14px] text-[#94a3b8] mt-8">
        Questions? Email <a href="mailto:api@statisticsoftheworld.com" className="text-[#0066cc] hover:underline">api@statisticsoftheworld.com</a>
      </p>
    </section>
  );
}

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <Nav />
      <Suspense>
        <SuccessContent />
      </Suspense>
      <Footer />
    </main>
  );
}
