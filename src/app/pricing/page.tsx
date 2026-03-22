'use client';

import { useState } from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Link from 'next/link';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For students and researchers exploring data.',
    rateLimit: '100 req/day',
    features: [
      'No API key needed',
      '100 requests per day (per IP)',
      'All endpoints (read-only)',
      '490+ indicators, 218 countries',
      'JSON responses',
    ],
    cta: 'Start Using',
    ctaLink: '/api-docs',
    highlighted: false,
  },
  {
    name: 'Developer',
    price: '$0',
    period: 'free with key',
    description: 'For developers building personal projects.',
    rateLimit: '1,000 req/day',
    features: [
      'Free API key (email signup)',
      '1,000 requests per day',
      'Usage tracking dashboard',
      'X-API-Key header auth',
      '20+ years historical data',
      'Personal use only',
    ],
    cta: 'Get Free API Key',
    ctaAction: 'signup',
    highlighted: true,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For startups and commercial applications.',
    rateLimit: '50,000 req/day',
    features: [
      '50,000 requests per day',
      'All Developer features',
      'Commercial use license',
      'Bulk data export (full dataset)',
      'Live market quotes endpoint',
      'CSV & Excel export',
      'Email support (24hr response)',
    ],
    cta: 'Subscribe',
    ctaAction: 'stripe_pro',
    highlighted: false,
    stripePriceId: 'price_pro',
  },
  {
    name: 'Business',
    price: '$500',
    period: '/month',
    description: 'For teams and data-intensive products.',
    rateLimit: '500,000 req/day',
    features: [
      '500,000 requests per day',
      'All Pro features',
      'Webhook notifications on data updates',
      'Custom indicator bundles',
      'Priority support (4hr response)',
      'SLA guarantee (99.9% uptime)',
      'Up to 5 API keys per account',
    ],
    cta: 'Subscribe',
    ctaAction: 'stripe_business',
    highlighted: false,
    stripePriceId: 'price_business',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations and governments.',
    rateLimit: 'Unlimited',
    features: [
      'Unlimited API requests',
      'All Business features',
      'Dedicated infrastructure',
      'Custom data pipelines & integrations',
      'White-label / private deployment',
      'Dedicated account manager',
      'Custom SLA & invoicing',
      'On-premise option available',
    ],
    cta: 'Contact Sales',
    ctaAction: 'contact',
    highlighted: false,
  },
];

export default function PricingPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Look up existing key
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [showLookup, setShowLookup] = useState(false);

  const handleSignup = async () => {
    if (!email.includes('@')) { setMessage('Enter a valid email'); return; }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (data.apiKey) {
        setApiKey(data.apiKey);
        setMessage(data.message || 'API key created!');
      } else {
        setMessage(data.error || 'Failed to create key');
      }
    } catch {
      setMessage('Network error');
    }
    setLoading(false);
  };

  const handleLookup = async () => {
    if (!lookupEmail.includes('@')) return;
    const res = await fetch(`/api/keys?email=${encodeURIComponent(lookupEmail)}`);
    const data = await res.json();
    setLookupResult(data);
  };

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen">
      <Nav />

      <section className="max-w-[1100px] mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-[32px] font-bold mb-2">API Pricing</h1>
          <p className="text-[15px] text-[#666] max-w-[600px] mx-auto">
            Access 490+ indicators for 218 countries. Free for everyone.
            Pay only if you need higher rate limits.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-12">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={`border rounded-xl p-5 flex flex-col ${
                plan.highlighted
                  ? 'border-[#0066cc] ring-2 ring-[#0066cc]/10 bg-[#f8fbff]'
                  : 'border-[#e8e8e8]'
              }`}
            >
              <div className="mb-4">
                <h3 className="text-[16px] font-bold">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-[28px] font-bold">{plan.price}</span>
                  <span className="text-[13px] text-[#999]">{plan.period}</span>
                </div>
                <p className="text-[12px] text-[#666] mt-1">{plan.description}</p>
              </div>

              <div className="bg-[#f8f9fa] rounded-lg px-3 py-2 mb-4 text-center">
                <span className="text-[14px] font-bold text-[#0066cc]">{plan.rateLimit}</span>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-[#666]">
                    <span className="text-[#2ecc40] mt-0.5 shrink-0">&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>

              {plan.ctaLink ? (
                <Link
                  href={plan.ctaLink}
                  className="block text-center px-4 py-2 rounded-lg text-[13px] font-medium transition bg-[#f0f0f0] text-[#333] hover:bg-[#e0e0e0]"
                >
                  {plan.cta}
                </Link>
              ) : plan.ctaAction === 'signup' ? (
                <button
                  onClick={() => setShowSignup(true)}
                  className="w-full px-4 py-2 rounded-lg text-[13px] font-medium transition bg-[#0066cc] text-white hover:bg-[#0055aa]"
                >
                  {plan.cta}
                </button>
              ) : plan.ctaAction === 'contact' ? (
                <a
                  href="mailto:api@statisticsoftheworld.com?subject=Enterprise API Access"
                  className="block text-center w-full px-4 py-2 rounded-lg text-[13px] font-medium transition bg-[#333] text-white hover:bg-[#222]"
                >
                  {plan.cta}
                </a>
              ) : (
                <button
                  onClick={async () => {
                    const tier = plan.ctaAction?.replace('stripe_', '') || '';
                    if (!email && !apiKey) {
                      setShowSignup(true);
                      setMessage('Get a free API key first, then upgrade.');
                      return;
                    }
                    const res = await fetch('/api/stripe/checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ tier, email, apiKey }),
                    });
                    const data = await res.json();
                    if (data.url) {
                      window.location.href = data.url;
                    } else {
                      setMessage(data.error || 'Checkout failed');
                    }
                  }}
                  className="w-full px-4 py-2 rounded-lg text-[13px] font-medium transition bg-[#333] text-white hover:bg-[#222]"
                >
                  {plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* API Key Signup Modal */}
        {showSignup && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowSignup(false)}>
            <div className="bg-white rounded-xl shadow-2xl p-6 w-[420px] max-w-[90vw]" onClick={e => e.stopPropagation()}>
              <h3 className="text-[18px] font-bold mb-1">Get Your Free API Key</h3>
              <p className="text-[12px] text-[#999] mb-4">1,000 requests/day. No credit card required.</p>

              {apiKey ? (
                <div>
                  <div className="text-[12px] text-[#2ecc40] font-medium mb-2">{message}</div>
                  <div className="bg-[#f8f9fa] border border-[#e8e8e8] rounded-lg p-3 mb-3">
                    <div className="text-[11px] text-[#999] mb-1">Your API Key</div>
                    <div className="font-mono text-[13px] text-[#333] break-all">{apiKey}</div>
                  </div>
                  <button onClick={copyKey} className="w-full px-4 py-2 bg-[#0066cc] text-white rounded-lg text-[13px] font-medium hover:bg-[#0055aa] transition">
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                  <div className="mt-3 text-[11px] text-[#999]">
                    Usage: <code className="bg-[#f8f9fa] px-1 rounded">curl -H &quot;X-API-Key: {apiKey.slice(0, 12)}...&quot; https://statisticsoftheworld.com/api/v1/countries</code>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full border border-[#e8e8e8] rounded-lg px-3 py-2 text-[13px] mb-2 outline-none focus:border-[#0066cc]"
                  />
                  <input
                    type="text"
                    placeholder="Name or project (optional)"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full border border-[#e8e8e8] rounded-lg px-3 py-2 text-[13px] mb-3 outline-none focus:border-[#0066cc]"
                  />
                  {message && <div className="text-[12px] text-[#e74c3c] mb-2">{message}</div>}
                  <button
                    onClick={handleSignup}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-[#0066cc] text-white rounded-lg text-[13px] font-medium hover:bg-[#0055aa] transition disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Generate API Key'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comparison table */}
        <div className="border border-[#e8e8e8] rounded-xl overflow-hidden mb-10">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="text-[11px] text-[#999] uppercase bg-[#f8f9fa] border-b border-[#e8e8e8]">
                <th className="px-3 py-3 text-left">Feature</th>
                <th className="px-3 py-3 text-center">Free</th>
                <th className="px-3 py-3 text-center bg-[#f0f7ff]">Developer</th>
                <th className="px-3 py-3 text-center">Pro</th>
                <th className="px-3 py-3 text-center">Business</th>
                <th className="px-3 py-3 text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {[
                ['Monthly price', 'Free', 'Free', '$49', '$500', 'Custom'],
                ['Daily requests', '100', '1,000', '50,000', '500,000', 'Unlimited'],
                ['API key required', 'No', 'Yes (free)', 'Yes', 'Yes', 'Yes'],
                ['All endpoints', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes'],
                ['Historical data (20+ years)', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes'],
                ['490+ indicators', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes'],
                ['Usage dashboard', 'No', 'Yes', 'Yes', 'Yes', 'Yes'],
                ['Commercial use', 'No', 'No', 'Yes', 'Yes', 'Yes'],
                ['Bulk data export', 'No', 'No', 'Yes', 'Yes', 'Yes'],
                ['Live market quotes', 'No', 'No', 'Yes', 'Yes', 'Yes'],
                ['Webhooks', 'No', 'No', 'No', 'Yes', 'Yes'],
                ['Multiple API keys', 'No', 'No', 'No', '5 keys', 'Unlimited'],
                ['White-label / private deploy', 'No', 'No', 'No', 'No', 'Yes'],
                ['Custom data pipelines', 'No', 'No', 'No', 'No', 'Yes'],
                ['Support', 'Docs', 'Email', 'Email (24hr)', 'Priority (4hr)', 'Dedicated manager'],
                ['SLA', 'None', 'None', 'None', '99.9%', 'Custom'],
              ].map(([feature, ...values], i) => (
                <tr key={i} className="border-b border-[#f0f0f0]">
                  <td className="px-3 py-2.5 text-[#333] font-medium">{feature}</td>
                  {values.map((v, j) => (
                    <td key={j} className={`px-3 py-2.5 text-center text-[#666] ${j === 1 ? 'bg-[#f8fbff]' : ''}`}>
                      {v === 'Yes' ? <span className="text-[#2ecc40]">&#10003;</span> : v === 'No' ? <span className="text-[#ccc]">&mdash;</span> : v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* Look up existing key */}
        <div className="border border-[#e8e8e8] rounded-xl p-5 bg-[#f8f9fa] mb-10">
          <h3 className="text-[14px] font-semibold mb-2">Already have a key?</h3>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email to look up your key"
              value={lookupEmail}
              onChange={e => setLookupEmail(e.target.value)}
              className="flex-1 border border-[#e8e8e8] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#0066cc] bg-white"
            />
            <button
              onClick={handleLookup}
              className="px-4 py-2 bg-[#333] text-white rounded-lg text-[13px] font-medium hover:bg-[#222] transition"
            >
              Look Up
            </button>
          </div>
          {lookupResult && (
            <div className="mt-3 text-[13px]">
              {lookupResult.keys?.length > 0 ? (
                lookupResult.keys.map((k: any, i: number) => (
                  <div key={i} className="bg-white border border-[#e8e8e8] rounded-lg p-3 mt-2">
                    <div className="font-mono text-[12px] break-all">{k.api_key}</div>
                    <div className="flex gap-4 mt-1 text-[11px] text-[#999]">
                      <span>Tier: {k.tier}</span>
                      <span>Limit: {k.rate_limit?.toLocaleString()}/day</span>
                      <span>Used today: {k.requests_today || 0}</span>
                      <span>Total: {k.requests_total?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[#999] mt-2">No keys found for this email.</div>
              )}
            </div>
          )}
        </div>

        {/* FAQ */}
        <div className="max-w-[700px] mx-auto">
          <h2 className="text-[18px] font-bold mb-4 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4 text-[13px]">
            <div>
              <h3 className="font-semibold text-[#333] mb-1">Is the data really free?</h3>
              <p className="text-[#666]">Yes. All data comes from public international organizations (IMF, World Bank, WHO, UN) and free APIs (Yahoo Finance, FRED). We believe global statistics should be accessible to everyone.</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#333] mb-1">Why pay for higher tiers?</h3>
              <p className="text-[#666]">The free tier is generous for most use cases. Paid tiers are for production applications that need higher rate limits, commercial use licenses, and dedicated support.</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#333] mb-1">Can I use the API in my commercial product?</h3>
              <p className="text-[#666]">Free and Developer tiers are for personal/educational use. Pro ($49/mo) and above include a commercial use license.</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#333] mb-1">How do I authenticate?</h3>
              <p className="text-[#666]">Add your API key as an <code className="bg-[#f0f0f0] px-1 rounded">X-API-Key</code> header. Example: <code className="bg-[#f0f0f0] px-1 rounded">curl -H &quot;X-API-Key: sotw_abc123...&quot; https://statisticsoftheworld.com/api/v1/countries</code></p>
            </div>
            <div>
              <h3 className="font-semibold text-[#333] mb-1">What happens if I exceed my rate limit?</h3>
              <p className="text-[#666]">You&apos;ll receive a 429 response with details on when your limit resets. Rate limits reset daily at midnight UTC.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
