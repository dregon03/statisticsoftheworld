import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-[#e8e8e8] mt-12">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-between gap-6 text-[12px] text-[#999]">
          <div>
            <p>Data from IMF, World Bank, FRED, ECB, Yahoo Finance, and Alpha Vantage.</p>
            <p className="mt-1">Statistics of the World © {new Date().getFullYear()}</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/countries" className="hover:text-[#333] transition">Countries</Link>
            <Link href="/rankings" className="hover:text-[#333] transition">Indicators</Link>
            <Link href="/compare" className="hover:text-[#333] transition">Compare</Link>
            <Link href="/map" className="hover:text-[#333] transition">Map</Link>
            <Link href="/scatter" className="hover:text-[#333] transition">Scatter</Link>
            <Link href="/regions" className="hover:text-[#333] transition">Regions</Link>
            <Link href="/calendar" className="hover:text-[#333] transition">Calendar</Link>
            <Link href="/credit-ratings" className="hover:text-[#333] transition">Ratings</Link>
            <Link href="/markets" className="hover:text-[#333] transition">Markets</Link>
            <Link href="/commodities" className="hover:text-[#333] transition">Commodities</Link>
            <Link href="/api-docs" className="hover:text-[#333] transition">API</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
