import DashboardContent from './DashboardContent';
import { INTERNAL_BASE } from '@/lib/internal-fetch';

export const revalidate = 300;

async function getDashboardData() {
  try {
    const [quotesRes, calendarRes, trendingRes] = await Promise.all([
      fetch(`${INTERNAL_BASE}/api/quotes`, { next: { revalidate: 60 } }).then(r => r.json()).catch(() => ({ quotes: [] })),
      fetch(`${INTERNAL_BASE}/api/calendar`, { next: { revalidate: 3600 } }).then(r => r.json()).catch(() => ({ events: [] })),
      fetch(`${INTERNAL_BASE}/api/trending`, { next: { revalidate: 3600 } }).then(r => r.json()).catch(() => ({ insights: [] })),
    ]);

    const quotes = (quotesRes.quotes || []).slice(0, 12);
    const today = new Date().toISOString().slice(0, 10);
    const week = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    const events = (calendarRes.events || [])
      .filter((e: any) => e.date >= today && e.date <= week)
      .slice(0, 10);
    const trending = (trendingRes.insights || []).slice(0, 4);

    return { quotes, events, trending };
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <DashboardContent
      initialQuotes={data?.quotes}
      initialEvents={data?.events}
      initialTrending={data?.trending}
    />
  );
}
