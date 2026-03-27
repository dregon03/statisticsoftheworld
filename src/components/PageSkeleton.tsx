import Nav from '@/components/Nav';
import HeroTabs from '@/components/HeroTabs';

export default function PageSkeleton({ active }: { active?: string }) {
  return (
    <>
      <Nav />
      <HeroTabs active={active} />
      <div className="max-w-[1400px] mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-100 rounded w-72" />
          <div className="mt-8 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
