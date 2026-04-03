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
