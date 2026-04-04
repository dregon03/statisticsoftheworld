import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'How to Cite Statistics of the World — Citation Guide for Researchers',
  description: 'Citation formats for Statistics of the World data in APA, MLA, Chicago, and BibTeX. Use our data in academic papers, reports, and journalism with proper attribution.',
  alternates: { canonical: 'https://statisticsoftheworld.com/cite' },
};

export default function CitePage() {
  const year = new Date().getFullYear();
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <main className="min-h-screen">
      <Nav />
      <section className="max-w-[800px] mx-auto px-6 py-12">
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-4">How to Cite This Data</h1>
        <p className="text-[15px] text-[#475569] leading-[1.8] mb-8">
          All data on Statistics of the World is free to use with attribution. Below are citation formats for academic papers, reports, and journalism. Our data is sourced from the IMF World Economic Outlook, World Bank World Development Indicators, WHO Global Health Observatory, and other official international organizations.
        </p>

        <div className="space-y-8">
          <div>
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-3">APA 7th Edition</h2>
            <div className="bg-[#f8f9fb] border border-[#d5dce6] rounded-lg p-4 font-mono text-[13px] text-[#374151] leading-relaxed">
              Statistics of the World. ({year}). <em>[Indicator name] — [Country name]</em>. Retrieved {today}, from https://statisticsoftheworld.com/country/[country]/[indicator]
            </div>
            <p className="text-[13px] text-[#94a3b8] mt-2">
              Example: Statistics of the World. ({year}). <em>GDP (Nominal) — United States</em>. Retrieved {today}, from https://statisticsoftheworld.com/country/united-states/gdp
            </p>
          </div>

          <div>
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-3">MLA 9th Edition</h2>
            <div className="bg-[#f8f9fb] border border-[#d5dce6] rounded-lg p-4 font-mono text-[13px] text-[#374151] leading-relaxed">
              &ldquo;[Indicator name] — [Country name].&rdquo; <em>Statistics of the World</em>, {year}, statisticsoftheworld.com/country/[country]/[indicator]. Accessed {today}.
            </div>
          </div>

          <div>
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-3">Chicago / Turabian</h2>
            <div className="bg-[#f8f9fb] border border-[#d5dce6] rounded-lg p-4 font-mono text-[13px] text-[#374151] leading-relaxed">
              Statistics of the World. &ldquo;[Indicator name] — [Country name].&rdquo; Accessed {today}. https://statisticsoftheworld.com/country/[country]/[indicator].
            </div>
          </div>

          <div>
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-3">BibTeX</h2>
            <div className="bg-[#f8f9fb] border border-[#d5dce6] rounded-lg p-4 font-mono text-[13px] text-[#374151] leading-relaxed whitespace-pre">
{`@misc{sotw_${year},
  author = {{Statistics of the World}},
  title = {[Indicator name] -- [Country name]},
  year = {${year}},
  url = {https://statisticsoftheworld.com/country/[country]/[indicator]},
  note = {Data from IMF, World Bank, WHO}
}`}
            </div>
          </div>

          <div>
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-3">For Journalism / Reports</h2>
            <div className="bg-[#f8f9fb] border border-[#d5dce6] rounded-lg p-4 text-[14px] text-[#374151] leading-relaxed">
              <p><strong>In-text:</strong> According to Statistics of the World, citing IMF data, the United States GDP reached $33 trillion in 2027.</p>
              <p className="mt-2"><strong>Source line:</strong> Source: Statistics of the World (statisticsoftheworld.com), data from IMF World Economic Outlook.</p>
            </div>
          </div>

          <div className="border-t border-[#d5dce6] pt-8">
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-3">Data Licensing</h2>
            <p className="text-[15px] text-[#374151] leading-[1.8]">
              All data aggregated by Statistics of the World is sourced from publicly available international databases (IMF, World Bank, WHO, FRED, UN) and is provided under a Creative Commons Attribution 4.0 International (CC BY 4.0) license. You are free to share, adapt, and use the data for any purpose — including commercial use — provided you give appropriate credit.
            </p>
            <p className="text-[15px] text-[#374151] leading-[1.8] mt-3">
              For API access, visit our <a href="/api-docs" className="text-[#0066cc] hover:underline">API documentation</a>. For custom data requests, contact <a href="mailto:statisticsoftheworldcontact@gmail.com" className="text-[#0066cc] hover:underline">statisticsoftheworldcontact@gmail.com</a>.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
