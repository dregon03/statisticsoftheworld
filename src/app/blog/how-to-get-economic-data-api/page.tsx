import Link from 'next/link';
import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'How to Get World GDP & Economic Data via API (Free, No Auth)',
  description: 'Get GDP, population, inflation, and 440+ economic indicators for 218 countries via a free REST API. No API key required. JSON responses with code examples in Python, JavaScript, and curl.',
  alternates: { canonical: 'https://statisticsoftheworld.com/blog/how-to-get-economic-data-api' },
  openGraph: {
    title: 'How to Get Economic Data via API (Free)',
    description: 'Free REST API for GDP, population, inflation, and 440+ indicators across 218 countries. No auth required.',
    siteName: 'Statistics of the World',
    type: 'article',
  },
};

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  return (
    <div className="relative mb-6">
      <div className="absolute top-0 left-0 bg-[#1e293b] text-[11px] text-[#94a3b8] px-3 py-1 rounded-tl-lg rounded-br-lg font-mono">{lang}</div>
      <pre className="bg-[#0f172a] text-[#e2e8f0] p-4 pt-8 rounded-lg overflow-x-auto text-[13px] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function APITutorialPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        headline: 'How to Get World GDP & Economic Data via API',
        description: 'Tutorial on using the free Statistics of the World API to access GDP, population, inflation, and 440+ indicators for 218 countries.',
        url: 'https://statisticsoftheworld.com/blog/how-to-get-economic-data-api',
        datePublished: '2026-04-04',
        dateModified: '2026-04-04',
        author: { '@type': 'Organization', name: 'Statistics of the World' },
        publisher: { '@type': 'Organization', name: 'Statistics of the World' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://statisticsoftheworld.com/blog' },
          { '@type': 'ListItem', position: 3, name: 'How to Get Economic Data via API' },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Is the Statistics of the World API free?',
            acceptedAnswer: { '@type': 'Answer', text: 'Yes. The API is completely free for up to 100 requests per day without an API key. Free API keys are available for up to 1,000 requests per day.' },
          },
          {
            '@type': 'Question',
            name: 'Do I need an API key to get GDP data?',
            acceptedAnswer: { '@type': 'Answer', text: 'No. The API works without any authentication. Just send a GET request to the endpoint and receive JSON data.' },
          },
          {
            '@type': 'Question',
            name: 'What data sources does the API use?',
            acceptedAnswer: { '@type': 'Answer', text: 'Data comes from three authoritative sources: IMF World Economic Outlook, World Bank World Development Indicators, and WHO Global Health Observatory.' },
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />

      <article className="max-w-[800px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-gray-600 transition">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">API Tutorial</span>
        </nav>

        <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#0d1b2a] mb-3 leading-tight">
          How to Get World GDP & Economic Data via API
        </h1>
        <p className="text-[15px] text-[#64748b] mb-8">
          Free REST API. No API key. 440+ indicators for 218 countries. JSON responses.
        </p>

        {/* Intro */}
        <div className="prose prose-slate max-w-none">
          <p className="text-[15px] text-[#475569] leading-[1.8] mb-6">
            Need GDP data for a project? Population figures for a dashboard? Inflation rates for a research paper? The Statistics of the World API gives you access to 440+ economic, demographic, and development indicators for 218 countries, all from IMF, World Bank, and WHO. It&apos;s free, requires no authentication, and returns clean JSON.
          </p>

          <h2 className="text-[22px] font-bold text-[#0d1b2a] mt-10 mb-4">Base URL</h2>
          <CodeBlock lang="text" code="https://statisticsoftheworld.com/api/v2" />

          <h2 className="text-[22px] font-bold text-[#0d1b2a] mt-10 mb-4">1. Get All Data for a Country</h2>
          <p className="text-[15px] text-[#475569] leading-[1.8] mb-4">
            Returns every available indicator for a single country. Uses ISO 3166-1 alpha-3 country codes (USA, GBR, CHN, etc.).
          </p>
          <CodeBlock lang="curl" code="curl https://statisticsoftheworld.com/api/v2/country/USA" />
          <CodeBlock lang="python" code={`import requests

data = requests.get("https://statisticsoftheworld.com/api/v2/country/USA").json()

# Access GDP
gdp = data["indicators"]["IMF.NGDPD"]
print(f"US GDP: {'$'}{gdp['value']} billion ({gdp['year']})")

# Access population
pop = data["indicators"]["SP.POP.TOTL"]
print(f"US Population: {pop['value']:,.0f}")`} />
          <CodeBlock lang="javascript" code={`const res = await fetch("https://statisticsoftheworld.com/api/v2/country/USA");
const data = await res.json();

console.log("US GDP:", data.indicators["IMF.NGDPD"]);
console.log("US Population:", data.indicators["SP.POP.TOTL"]);`} />

          <h2 className="text-[22px] font-bold text-[#0d1b2a] mt-10 mb-4">2. Get Rankings for an Indicator</h2>
          <p className="text-[15px] text-[#475569] leading-[1.8] mb-4">
            Returns all countries ranked by a specific indicator. Supports <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[13px]">limit</code> and <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[13px]">order</code> parameters.
          </p>
          <CodeBlock lang="curl" code={`# Top 10 countries by GDP
curl "https://statisticsoftheworld.com/api/v2/indicator/IMF.NGDPD?limit=10&order=desc"

# Bottom 10 by life expectancy
curl "https://statisticsoftheworld.com/api/v2/indicator/SP.DYN.LE00.IN?limit=10&order=asc"`} />
          <CodeBlock lang="python" code={`import requests

# Get top 10 economies
url = "https://statisticsoftheworld.com/api/v2/indicator/IMF.NGDPD?limit=10&order=desc"
top10 = requests.get(url).json()

for country in top10["data"]:
    print(f"{country['country']}: {'$'}{country['value']:.1f}B")`} />

          <h2 className="text-[22px] font-bold text-[#0d1b2a] mt-10 mb-4">3. Get Historical Time Series</h2>
          <p className="text-[15px] text-[#475569] leading-[1.8] mb-4">
            Returns 20+ years of historical data for any indicator and country combination.
          </p>
          <CodeBlock lang="curl" code={`# US GDP history
curl "https://statisticsoftheworld.com/api/v2/history?indicator=IMF.NGDPD&country=USA"

# China inflation history
curl "https://statisticsoftheworld.com/api/v2/history?indicator=IMF.PCPIPCH&country=CHN"`} />
          <CodeBlock lang="python" code={`import requests
import pandas as pd

url = "https://statisticsoftheworld.com/api/v2/history"
params = {"indicator": "IMF.NGDPD", "country": "USA"}
history = requests.get(url, params=params).json()

# Convert to DataFrame
df = pd.DataFrame(history["data"])
print(df.tail(10))  # Last 10 years of US GDP`} />

          <h2 className="text-[22px] font-bold text-[#0d1b2a] mt-10 mb-4">Common Indicator IDs</h2>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden text-[14px]">
              <thead>
                <tr className="bg-[#0d1b2a] text-white">
                  <th className="px-4 py-2.5 text-left font-semibold">Indicator</th>
                  <th className="px-4 py-2.5 text-left font-semibold">ID</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Source</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['GDP (Nominal USD)', 'IMF.NGDPD', 'IMF'],
                  ['GDP Growth Rate', 'IMF.NGDP_RPCH', 'IMF'],
                  ['GDP per Capita', 'IMF.NGDPDPC', 'IMF'],
                  ['Inflation Rate', 'IMF.PCPIPCH', 'IMF'],
                  ['Unemployment Rate', 'IMF.LUR', 'IMF'],
                  ['Govt Debt (% GDP)', 'IMF.GGXWDG_NGDP', 'IMF'],
                  ['Population', 'SP.POP.TOTL', 'World Bank'],
                  ['Life Expectancy', 'SP.DYN.LE00.IN', 'World Bank'],
                  ['Fertility Rate', 'SP.DYN.TFRT.IN', 'World Bank'],
                  ['CO₂ Emissions per Capita', 'EN.GHG.CO2.PC.CE.AR5', 'World Bank'],
                  ['Gini Index', 'SI.POV.GINI', 'World Bank'],
                  ['Internet Users (%)', 'IT.NET.USER.ZS', 'World Bank'],
                ].map(([name, id, src], i) => (
                  <tr key={id} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                    <td className="px-4 py-2 text-[#475569]">{name}</td>
                    <td className="px-4 py-2 font-mono text-[13px] text-[#2563eb]">{id}</td>
                    <td className="px-4 py-2 text-[#64748b]">{src}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[14px] text-[#64748b] mb-6">
            Full list of 440+ indicators available at <Link href="/indicators" className="text-[#2563eb] hover:underline">statisticsoftheworld.com/indicators</Link> and in our <Link href="/api-docs" className="text-[#2563eb] hover:underline">API documentation</Link>.
          </p>

          <h2 className="text-[22px] font-bold text-[#0d1b2a] mt-10 mb-4">Rate Limits</h2>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden text-[14px]">
              <thead>
                <tr className="bg-[#0d1b2a] text-white">
                  <th className="px-4 py-2.5 text-left font-semibold">Tier</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Requests/Day</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Auth Required</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 text-[#475569]">Anonymous</td>
                  <td className="px-4 py-2 font-mono">100</td>
                  <td className="px-4 py-2 text-[#64748b]">No</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-2 text-[#475569]">Free (API key)</td>
                  <td className="px-4 py-2 font-mono">1,000</td>
                  <td className="px-4 py-2 text-[#64748b]">X-API-Key header</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-[#475569]">Pro</td>
                  <td className="px-4 py-2 font-mono">50,000</td>
                  <td className="px-4 py-2 text-[#64748b]">X-API-Key header</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-[22px] font-bold text-[#0d1b2a] mt-10 mb-4">Use Cases</h2>
          <ul className="list-disc pl-6 text-[15px] text-[#475569] space-y-2 mb-6">
            <li>Dashboards and data visualizations</li>
            <li>Academic research and economics papers</li>
            <li>Journalism and data stories</li>
            <li>AI/ML training data pipelines</li>
            <li>Fintech apps and investment analysis</li>
            <li>Educational tools and classroom exercises</li>
          </ul>

          <h2 className="text-[22px] font-bold text-[#0d1b2a] mt-10 mb-4">FAQ</h2>
          <div className="space-y-3 mb-8">
            {[
              { q: 'Is the API free?', a: 'Yes. 100 requests/day without any key. Get a free API key for 1,000 requests/day.' },
              { q: 'Do I need an API key?', a: 'No. The API works without authentication. API keys are optional and unlock higher rate limits.' },
              { q: 'What format is the response?', a: 'All endpoints return JSON. Country codes use ISO 3166-1 alpha-3 (USA, GBR, CHN, etc.).' },
              { q: 'Where does the data come from?', a: 'IMF World Economic Outlook, World Bank World Development Indicators, and WHO Global Health Observatory.' },
              { q: 'How often is the data updated?', a: 'Automatically when sources publish new data. IMF updates biannually, World Bank continuously.' },
            ].map(faq => (
              <details key={faq.q} className="bg-white border border-gray-200 rounded-lg">
                <summary className="px-4 py-3 text-[15px] font-semibold text-[#0d1b2a] cursor-pointer hover:bg-gray-50">{faq.q}</summary>
                <p className="px-4 pb-3 text-[14px] text-[#475569]">{faq.a}</p>
              </details>
            ))}
          </div>

          <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-6 mb-8 text-center">
            <h3 className="text-[18px] font-bold text-[#0d1b2a] mb-2">Ready to start?</h3>
            <p className="text-[14px] text-[#475569] mb-4">Try the API right now. No signup required.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/api-docs" className="px-5 py-2.5 bg-[#2563eb] text-white text-[14px] font-medium rounded-lg hover:bg-[#1d4ed8] transition">
                API Documentation
              </Link>
              <Link href="/indicators" className="px-5 py-2.5 bg-white text-[#2563eb] text-[14px] font-medium rounded-lg border border-[#2563eb] hover:bg-[#eff6ff] transition">
                Browse All Indicators
              </Link>
            </div>
          </div>
        </div>

        {/* Related links */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-[16px] font-semibold text-[#0d1b2a] mb-3">Related</h3>
          <div className="space-y-2">
            <Link href="/api-docs" className="block text-[14px] text-[#2563eb] hover:underline">Full API Documentation</Link>
            <Link href="/snapshot/2026" className="block text-[14px] text-[#2563eb] hover:underline">2026 Global Economic Snapshot</Link>
            <Link href="/ranking/gdp" className="block text-[14px] text-[#2563eb] hover:underline">GDP Rankings by Country</Link>
            <Link href="/blog" className="block text-[14px] text-[#2563eb] hover:underline">More Data Articles</Link>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
