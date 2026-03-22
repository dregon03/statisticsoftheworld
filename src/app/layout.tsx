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
    description: '320+ indicators for 217 countries. Explore global data from IMF, World Bank, and more.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Statistics of the World',
    description: '320+ indicators for 217 countries. Free global statistics reference.',
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
        {children}
        <AskSOTW />
      </body>
    </html>
  );
}
