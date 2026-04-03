import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Terms of Service',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <Nav />
      <section className="max-w-[800px] mx-auto px-4 py-10">
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-6">Terms of Service</h1>
        <p className="text-[14px] text-[#64748b] mb-8">Last updated: March 28, 2026</p>

        <div className="space-y-6 text-[15px] text-[#333] leading-relaxed">
          <section>
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using Statistics of the World ("SOTW", "we", "our"), including our website at statisticsoftheworld.com and our API, you agree to be bound by these Terms of Service. If you do not agree, do not use our services.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-2">2. Description of Service</h2>
            <p>SOTW provides economic and statistical data for 218 countries and 490+ indicators. Data is aggregated from public sources including the IMF, World Bank, FRED, UN COMTRADE, Finnhub, and others. We also provide live market quotes, an economic calendar, prediction market data, and an AI-powered chat interface.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-2">3. API Access and Tiers</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Free tier:</strong> 100 requests/day without an API key, 1,000 requests/day with a free key. For personal and educational use only.</li>
              <li><strong>Pro ($49/month):</strong> 50,000 requests/day. Includes commercial use license.</li>
              <li><strong>Business ($500/month):</strong> 500,000 requests/day. Includes webhooks, multiple API keys, and priority support.</li>
              <li><strong>Enterprise (custom):</strong> Unlimited requests. Contact us for pricing.</li>
            </ul>
            <p className="mt-2">Rate limits reset daily at midnight UTC. Exceeding your limit returns a 429 status code.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-2">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Resell or redistribute raw data from SOTW without a commercial license (Pro tier or above).</li>
              <li>Attempt to circumvent rate limits, authentication, or security measures.</li>
              <li>Use the service to compete directly with SOTW by building a substantially similar data portal.</li>
              <li>Use automated tools to scrape the website instead of using the API.</li>
              <li>Misrepresent SOTW data as your own original research without attribution.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-2">5. Data Accuracy</h2>
            <p>SOTW aggregates data from third-party public sources. While we strive for accuracy, we make no guarantees about the completeness, timeliness, or correctness of the data. SOTW is not a financial advisor. Do not make investment decisions based solely on data from this service.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-2">6. Payment and Billing</h2>
            <p>Paid subscriptions are billed monthly via Stripe. You may cancel at any time — your access continues until the end of the current billing period. Refunds are handled on a case-by-case basis. We reserve the right to change pricing with 30 days notice to existing subscribers.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-2">7. API Keys</h2>
            <p>Your API key is confidential. Do not share it publicly (e.g., in client-side code, public repositories). If your key is compromised, contact us immediately. We reserve the right to revoke API keys that violate these terms.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-2">8. Limitation of Liability</h2>
            <p>SOTW is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service, including but not limited to data inaccuracies, service downtime, or financial losses.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-2">9. Termination</h2>
            <p>We may suspend or terminate your access if you violate these terms. You may stop using the service at any time.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-2">10. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-2">11. Contact</h2>
            <p>Questions about these terms? Email us at <a href="mailto:api@statisticsoftheworld.com" className="text-[#0066cc] hover:underline">api@statisticsoftheworld.com</a>.</p>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  );
}
