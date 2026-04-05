import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Embed Economic Data — Free Widgets for Your Website',
  description: 'Embed free economic data charts and country statistics cards on your website, blog, or report. Interactive charts with data from IMF and World Bank. No API key required.',
  alternates: { canonical: 'https://statisticsoftheworld.com/embed' },
};

export default function EmbedPage() {
  return (
    <main className="min-h-screen">
      <Nav />
      <section className="max-w-[800px] mx-auto px-6 py-12">
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-4">Embed Economic Data on Your Site</h1>
        <p className="text-[15px] text-[#475569] leading-[1.8] mb-8">
          Add interactive economic data to your website, blog, or report for free. Our embeddable widgets pull live data from the IMF World Economic Outlook and World Bank, updating automatically as new data is released. No API key required.
        </p>

        <div className="space-y-10">
          <div>
            <h2 className="text-[22px] font-bold text-[#0d1b2a] mb-3">Country Data Card</h2>
            <p className="text-[14px] text-[#64748b] mb-4">
              A compact card showing key economic indicators (GDP, population, inflation, unemployment) for any country. Perfect for blog posts and reports.
            </p>
            <div className="border border-[#d5dce6] rounded-xl p-4 bg-[#f8f9fb] mb-4">
              <img
                src="/embed/card?country=USA"
                alt="United States economic data card"
                width={600}
                height={320}
                className="rounded-lg border border-[#d5dce6]"
              />
            </div>
            <div className="bg-[#0d1b2a] rounded-lg p-4 mb-2">
              <code className="text-[13px] text-green-400 break-all">
                {`<iframe src="https://statisticsoftheworld.com/embed/card?country=USA" width="600" height="320" frameborder="0" style="border:1px solid #d5dce6;border-radius:12px;"></iframe>`}
              </code>
            </div>
            <p className="text-[12px] text-[#94a3b8]">
              Replace <code className="bg-[#f0f0f0] px-1 rounded">USA</code> with any ISO3 country code: JPN, DEU, GBR, IND, CHN, BRA, CAN, etc.
            </p>
          </div>

          <div>
            <h2 className="text-[22px] font-bold text-[#0d1b2a] mb-3">Interactive Chart</h2>
            <p className="text-[14px] text-[#64748b] mb-4">
              An interactive historical chart for any indicator and country combination. Includes tooltips, zoom, and full data series.
            </p>
            <div className="bg-[#0d1b2a] rounded-lg p-4 mb-2">
              <code className="text-[13px] text-green-400 break-all">
                {`<iframe src="https://statisticsoftheworld.com/embed/chart?indicator=IMF.NGDPD&country=USA" width="600" height="350" frameborder="0" style="border:1px solid #e8e8e8;border-radius:8px;"></iframe>`}
              </code>
            </div>
            <p className="text-[12px] text-[#94a3b8]">
              Common indicators: IMF.NGDPD (GDP), SP.POP.TOTL (Population), IMF.PCPIPCH (Inflation), IMF.LUR (Unemployment)
            </p>
          </div>

          <div className="border-t border-[#d5dce6] pt-8">
            <h2 className="text-[22px] font-bold text-[#0d1b2a] mb-3">Terms of Use</h2>
            <p className="text-[15px] text-[#374151] leading-[1.8]">
              All embeds are free to use on any website, including commercial sites. The embedded content includes a &ldquo;statisticsoftheworld.com&rdquo; attribution link which must remain visible. Data is sourced from the IMF, World Bank, and WHO — attribution to these primary sources is included automatically.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
