import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <Nav />
      <section className="max-w-[800px] mx-auto px-4 py-10">
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-6">Privacy Policy</h1>
        <p className="text-[14px] text-[#64748b] mb-8">Last updated: March 28, 2026</p>

        <div className="space-y-6 text-[15px] text-[#333] leading-relaxed">
          <section>
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-2">1. What We Collect</h2>
            <p>We collect the minimum data necessary to provide our service:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>API key registration:</strong> Email address and optional name/project description.</li>
              <li><strong>Newsletter signup:</strong> Email address only.</li>
              <li><strong>Payment (paid tiers):</strong> Processed by Stripe. We do not store credit card numbers. We store your Stripe customer ID and subscription ID.</li>
              <li><strong>API usage:</strong> Request counts per API key (daily and total). We do not log individual API request content.</li>
              <li><strong>Anonymous visitors:</strong> IP address (for rate limiting only, not stored persistently). Standard web server logs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-2">2. How We Use Your Data</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide and maintain the API service (authentication, rate limiting, usage tracking).</li>
              <li>To process payments via Stripe.</li>
              <li>To send the weekly newsletter (if you opted in). You can unsubscribe at any time.</li>
              <li>To respond to support requests.</li>
            </ul>
            <p className="mt-2">We do not sell your data. We do not use your data for advertising. We do not share your data with third parties except as required to provide the service (Stripe for payments, Supabase for database hosting).</p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-2">3. Third-Party Services</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Stripe:</strong> Payment processing. See <a href="https://stripe.com/privacy" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">Stripe&apos;s Privacy Policy</a>.</li>
              <li><strong>Supabase:</strong> Database hosting. Data stored in AWS ca-central-1 (Canada). See <a href="https://supabase.com/privacy" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">Supabase&apos;s Privacy Policy</a>.</li>
              <li><strong>Hetzner:</strong> Website hosting. See <a href="https://www.hetzner.com/legal/privacy-policy/" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">Hetzner&apos;s Privacy Policy</a>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-2">4. Cookies</h2>
            <p>We use minimal cookies for essential functionality only (no tracking cookies, no advertising cookies). We do not use Google Analytics or similar third-party tracking services.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-2">5. Data Retention</h2>
            <p>API keys and associated usage data are retained as long as your account is active. If you request deletion of your data, we will remove your API key record and associated email within 30 days.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-2">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Request a copy of the data we hold about you.</li>
              <li>Request deletion of your data.</li>
              <li>Unsubscribe from the newsletter at any time.</li>
              <li>Revoke your API key.</li>
            </ul>
            <p className="mt-2">To exercise any of these rights, email <a href="mailto:api@statisticsoftheworld.com" className="text-[#0066cc] hover:underline">api@statisticsoftheworld.com</a>.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-2">7. Security</h2>
            <p>We use industry-standard security measures including HTTPS encryption, secure API key generation, and Stripe webhook signature verification. However, no system is 100% secure. Keep your API key confidential.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-2">8. Changes</h2>
            <p>We may update this policy from time to time. We will post changes on this page with an updated date.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-2">9. Contact</h2>
            <p>Questions about privacy? Email <a href="mailto:api@statisticsoftheworld.com" className="text-[#0066cc] hover:underline">api@statisticsoftheworld.com</a>.</p>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  );
}
