import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'FDI by Country 2026 — Foreign Direct Investment Inflows Ranked',
  description: 'Foreign direct investment by country 2026: all countries ranked by FDI inflows as % of GDP. Who attracts the most investment? Nearshoring winners: India, Vietnam, Mexico. Source: World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/fdi-by-country' },
  openGraph: {
    title: 'FDI by Country 2026 — Foreign Direct Investment Ranked',
    description: 'Countries ranked by FDI inflows as % of GDP. Nearshoring shifts investment toward India, Vietnam, Mexico. Source: World Bank.',
    url: 'https://statisticsoftheworld.com/fdi-by-country',
    siteName: 'Statistics of the World',
    type: 'website',
  },
};

export default async function FDIByCountryPage() {
  const data = await getIndicatorForAllCountries('BX.KLT.DINV.WD.GD.ZS');
  const year = data[0]?.year || '2024';
  const avg = data.length > 0 ? data.reduce((s, d) => s + (d.value || 0), 0) / data.length : 0;

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
        { '@type': 'ListItem', position: 2, name: 'FDI Rankings', item: 'https://statisticsoftheworld.com/ranking/fdi-inflows' },
        { '@type': 'ListItem', position: 3, name: `FDI by Country ${year}`, item: 'https://statisticsoftheworld.com/fdi-by-country' },
      ],
    },
    { '@type': 'Dataset', name: `FDI Inflows by Country ${year}`, description: `Foreign direct investment as % of GDP for ${data.length} countries. Source: World Bank.`, url: 'https://statisticsoftheworld.com/fdi-by-country', creator: { '@type': 'Organization', name: 'World Bank' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Which country receives the most FDI?', acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} receives the highest FDI inflows at ${formatValue(data[0]?.value, 'percent', 1)} of GDP. Small open economies and those with favorable investment climates tend to attract the most FDI relative to their size. In absolute terms, the United States, China, and Singapore are consistently the world's largest FDI recipients. Source: World Bank, UNCTAD.` } },
      { '@type': 'Question', name: 'What is FDI?', acceptedAnswer: { '@type': 'Answer', text: 'Foreign Direct Investment (FDI) is investment from a company or individual in one country into business operations in another, involving lasting management interest (typically 10%+ ownership). FDI differs from portfolio investment because it represents a long-term commitment to operating in the host country — building factories, acquiring companies, or establishing supply chain facilities.' } },
      { '@type': 'Question', name: 'How do US tariffs affect global FDI flows in 2026?', acceptedAnswer: { '@type': 'Answer', text: 'The Trump administration\'s April 2026 tariff package is accelerating the friend-shoring and nearshoring trends that began during COVID. Companies are shifting manufacturing investment away from China (facing 145% US tariffs) toward tariff-exempt or lower-tariff locations: India (18% after the February 2026 US-India trade deal), Vietnam, Mexico (USMCA-protected), and Eastern Europe. UNCTAD estimates China\'s FDI inflows fell 15–20% in 2025–2026 as multinationals diversified away. India recorded its highest-ever FDI inflows in FY2025–2026, driven by electronics manufacturing and data center investment. Source: UNCTAD, IMF.' } },
      { '@type': 'Question', name: 'Which countries are winning the FDI nearshoring boom?', acceptedAnswer: { '@type': 'Answer', text: 'The biggest nearshoring FDI winners in 2025–2026 are India (Apple, Samsung supply chain expansion; semiconductor fab investment), Mexico (auto and electronics factories relocating from China under USMCA), Vietnam (Samsung, Intel, Nike manufacturing hubs), and Poland/Romania (EU manufacturing reshoring from Asia). Singapore remains the top Asia-Pacific hub for regional headquarters and financial holding companies despite high operating costs. Source: UNCTAD World Investment Report 2025.' } },
      { '@type': 'Question', name: 'Why do small countries top the FDI-to-GDP rankings?', acceptedAnswer: { '@type': 'Answer', text: 'Countries like Luxembourg, Ireland, Singapore, and the Netherlands appear at the top of FDI-to-GDP rankings because they are regional financial and holding company hubs. Much of their FDI represents multinational tax structuring — profits booked locally through holding companies — rather than physical factories or employment. This "conduit FDI" inflates the ratio. For genuine manufacturing and operational FDI, look at absolute inflow figures from UNCTAD or FDI project counts from fDi Markets. Source: UNCTAD, IMF.' } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/ranking/fdi-inflows" className="hover:text-gray-600 transition">FDI Rankings</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">FDI by Country</span>
        </nav>

        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Foreign Direct Investment by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">
          {data.length} countries ranked · FDI inflows as % of GDP · Source: World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Global FDI Flows</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Foreign direct investment represents long-term capital commitment to operating in another country — building factories, acquiring companies, or establishing new operations. Unlike portfolio investment (buying stocks and bonds), FDI brings technology transfer, management practices, and access to global supply chains. The <Link href="/us-economy" className="text-[#0066cc] hover:underline">United States</Link>, <Link href="/china-economy" className="text-[#0066cc] hover:underline">China</Link>, and <Link href="/singapore-economy" className="text-[#0066cc] hover:underline">Singapore</Link> are the world&apos;s largest FDI recipients in absolute terms, while small open economies dominate the FDI-to-GDP rankings due to their roles as financial and holding company hubs.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">As a percentage of GDP, small open economies attract the most FDI — <Link href="/ireland-economy" className="text-[#0066cc] hover:underline">Ireland</Link>, Singapore, and Luxembourg have FDI stocks exceeding 100% of GDP, largely reflecting multinational tax structuring rather than physical production. For genuine operational FDI — factories, supply chain facilities, R&amp;D centers — <Link href="/mexico-economy" className="text-[#0066cc] hover:underline">Mexico</Link>, <Link href="/vietnam-economy" className="text-[#0066cc] hover:underline">Vietnam</Link>, and <Link href="/india-economy" className="text-[#0066cc] hover:underline">India</Link> are the standout destinations, benefiting from supply chain diversification away from China. FDI flows are tracked by UNCTAD via the World Bank.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The Trump administration&apos;s April 2026 tariff package has reshuffled global FDI geography at a pace not seen since the early 2000s China manufacturing boom. With US tariffs on Chinese goods reaching 145%, multinationals operating China-for-US export models are accelerating relocation. <Link href="/india-economy" className="text-[#0066cc] hover:underline">India</Link> recorded its highest-ever FDI inflows in FY2025–2026, driven by Apple and Samsung electronics manufacturing expansions and a surge in semiconductor fab announcements. Mexico, protected under USMCA, is absorbing auto and electronics factories. Vietnam, despite facing its own US tariff exposure, remains attractive for labor-cost arbitrage. <Link href="/china-economy" className="text-[#0066cc] hover:underline">China</Link>&apos;s FDI inflows fell sharply — UNCTAD estimates a 15–20% decline — as multinationals restructured their China presence from export-focused to domestic-market-only operations. The net effect is the most significant geographic rebalancing of global manufacturing investment in two decades.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">FDI inflows as % of GDP by country. Source: World Bank.</caption>
              <thead>
                <tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-4 py-2.5 w-12">#</th>
                  <th scope="col" className="px-4 py-2.5">Country</th>
                  <th scope="col" className="px-4 py-2.5 text-right">FDI (% GDP)</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 50).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5">
                      <Link href={`${getCleanCountryUrl(d.countryId)}/fdi-inflows`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(d.value, 'percent', 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right">
            <Link href="/ranking/fdi-inflows" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {data.length} countries →</Link>
          </div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Related Data</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/ranking/fdi-inflows', label: 'FDI Rankings' },
              { href: '/trade-by-country', label: 'Trade Openness' },
              { href: '/gdp-by-country', label: 'GDP by Country' },
              { href: '/gdp-growth-by-country', label: 'GDP Growth' },
              { href: '/corruption-by-country', label: 'Corruption Index' },
              { href: '/largest-economies', label: 'Largest Economies' },
              { href: '/india-economy', label: 'India Economy' },
              { href: '/vietnam-economy', label: 'Vietnam Economy' },
              { href: '/mexico-economy', label: 'Mexico Economy' },
              { href: '/china-economy', label: 'China Economy' },
              { href: '/singapore-economy', label: 'Singapore Economy' },
              { href: '/world-economy', label: 'World Economy' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
