import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import AskSOTW from '@/components/AskSOTW';

const GA_MEASUREMENT_ID = 'G-HT0C0WQXM5';

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
  description: '440+ economic indicators for 218 countries. GDP, population, stock markets, commodities, and more — interactive charts, live data, and free API. Sources: IMF, World Bank, FRED, Yahoo Finance.',
  metadataBase: new URL('https://statisticsoftheworld.com'),
  openGraph: {
    type: 'website',
    siteName: 'Statistics of the World',
    title: 'Statistics of the World — Every Country, Every Indicator',
    description: '440+ indicators for 218 countries. Free API, interactive charts, and live market data.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Statistics of the World',
    description: '440+ indicators for 218 countries. Free API, interactive charts, and live market data.',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'GZ8I0JdG3utqeBBfO_Y9jQqwCr3yOPT6qTwmlbtM0qE',
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
      <head>
        <link rel="preconnect" href="https://flagcdn.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://flagcdn.com" />
        <link rel="alternate" type="application/rss+xml" title="Statistics of the World" href="/feed" />
        <link rel="search" type="application/opensearchdescription+xml" title="Statistics of the World" href="/opensearch.xml" />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>
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
                  description: 'Free global statistics platform aggregating data from IMF, World Bank, WHO, FRED, and United Nations for 218 countries.',
                  sameAs: [
                    'https://x.com/sotwdata',
                    'https://bsky.app/profile/sotwdata.bsky.social',
                  ],
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
