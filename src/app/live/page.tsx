import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import HeroTabs from '@/components/HeroTabs';
import LiveCounters from '@/components/LiveCounter';

export default function LivePage() {
  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#1a1a2e]">
      <Nav />
      <HeroTabs active="/live" />
      <section className="max-w-[1000px] mx-auto px-4 py-10">
        <LiveCounters />
      </section>
      <Footer />
    </main>
  );
}
