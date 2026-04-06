import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <main className="min-h-screen">
      <Nav />
      <section className="max-w-[600px] mx-auto px-6 py-20 text-center">
        <h1 className="text-[48px] font-bold text-[#0d1b2a] mb-4">404</h1>
        <p className="text-[18px] text-[#475569] mb-8">This page doesn&apos;t exist. Here&apos;s where you probably want to go:</p>

        <div className="grid grid-cols-2 gap-3 max-w-[400px] mx-auto mb-10">
          <Link href="/" className="px-4 py-3 bg-[#0d1b2a] text-white rounded-xl text-[14px] font-medium hover:bg-[#1a2d42] transition">
            Homepage
          </Link>
          <Link href="/gdp-by-country" className="px-4 py-3 bg-white border border-[#d5dce6] rounded-xl text-[14px] font-medium text-[#0d1b2a] hover:bg-[#f8f9fb] transition">
            GDP by Country
          </Link>
          <Link href="/countries" className="px-4 py-3 bg-white border border-[#d5dce6] rounded-xl text-[14px] font-medium text-[#0d1b2a] hover:bg-[#f8f9fb] transition">
            All Countries
          </Link>
          <Link href="/world-economy" className="px-4 py-3 bg-white border border-[#d5dce6] rounded-xl text-[14px] font-medium text-[#0d1b2a] hover:bg-[#f8f9fb] transition">
            World Economy
          </Link>
          <Link href="/ranking/gdp" className="px-4 py-3 bg-white border border-[#d5dce6] rounded-xl text-[14px] font-medium text-[#0d1b2a] hover:bg-[#f8f9fb] transition">
            GDP Rankings
          </Link>
          <Link href="/api-docs" className="px-4 py-3 bg-white border border-[#d5dce6] rounded-xl text-[14px] font-medium text-[#0d1b2a] hover:bg-[#f8f9fb] transition">
            API Docs
          </Link>
        </div>

        <p className="text-[14px] text-[#94a3b8]">
          Looking for economic data? Try our <Link href="/api-docs" className="text-[#0066cc] hover:underline">free API</Link> or browse <Link href="/indicators" className="text-[#0066cc] hover:underline">440+ indicators</Link> for <Link href="/countries" className="text-[#0066cc] hover:underline">218 countries</Link>.
        </p>
      </section>
      <Footer />
    </main>
  );
}
