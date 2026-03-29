import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AskSOTW from '@/components/AskSOTW';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'Statistics of the World — Every Country, Every Indicator',
    template: '%s | Statistics of the World',
  },
  description: '395+ indicators across 27 categories for 218 countries. GDP, population, stock markets, commodities, and more — free data from IMF, World Bank, FRED, Yahoo Finance, ECB, and Alpha Vantage.',
  metadataBase: new URL('https://statisticsoftheworld.com'),
  openGraph: {
    type: 'website',
    siteName: 'Statistics of the World',
    title: 'Statistics of the World — Every Country, Every Indicator',
    description: '490+ indicators for 218 countries. Free API and interactive visualizations from IMF, World Bank, FRED, and more.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Statistics of the World',
    description: '490+ indicators for 218 countries. Free API and interactive data visualizations.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  name: 'Statistics of the World',
                  url: 'https://statisticsoftheworld.com',
                  description: '490+ economic indicators for 218 countries. Free API and interactive data visualizations.',
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: 'https://statisticsoftheworld.com/countries?q={search_term_string}',
                    'query-input': 'required name=search_term_string',
                  },
                },
                {
                  '@type': 'Organization',
                  name: 'Statistics of the World',
                  url: 'https://statisticsoftheworld.com',
                  contactPoint: {
                    '@type': 'ContactPoint',
                    email: 'statisticsoftheworldcontact@gmail.com',
                    contactType: 'customer service',
                  },
                },
              ],
            }),
          }}
        />
        {children}
        <AskSOTW />
      </body>
    </html>
  );
}
