'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
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
  const email = params.get('email') || '';
  const details = TIER_DETAILS[tier] || TIER_DETAILS.pro;

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

      <div className="border border-[#d5dce6] rounded-xl p-6 text-left mb-8 bg-white">
        <h2 className="text-[16px] font-semibold text-[#0d1b2a] mb-4">What happens next</h2>
        <div className="space-y-4 text-[15px] text-[#64748b]">
          <div className="flex gap-3">
            <span className="text-green-600 font-bold shrink-0">1.</span>
            <div>
              <div className="text-[#0d1b2a] font-medium">Your API key is upgraded</div>
              Your existing key{email ? ` (${email})` : ''} now has {details.name}-tier rate limits. No new key needed.
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-green-600 font-bold shrink-0">2.</span>
            <div>
              <div className="text-[#0d1b2a] font-medium">Start making requests</div>
              Use your API key with <code className="bg-[#f4f6f9] px-1 rounded text-[14px]">X-API-Key</code> header. Check the <Link href="/api-docs" className="text-[#0066cc] hover:underline">API docs</Link> for all endpoints.
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-green-600 font-bold shrink-0">3.</span>
            <div>
              <div className="text-[#0d1b2a] font-medium">Receipt sent to your email</div>
              Stripe will send a payment receipt to {email || 'your email'}. You can manage your subscription from the receipt link.
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
