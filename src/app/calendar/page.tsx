import CalendarContent from './CalendarContent';
import { INTERNAL_BASE } from '@/lib/internal-fetch';

export const revalidate = 3600;

async function getCalendarData() {
  try {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    const extFrom = new Date(monday.getTime() - 7 * 86400000).toISOString().slice(0, 10);
    const extTo = new Date(sunday.getTime() + 21 * 86400000).toISOString().slice(0, 10);

    const res = await fetch(`${INTERNAL_BASE}/api/calendar?from=${extFrom}&to=${extTo}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function CalendarPage() {
  const data = await getCalendarData();

  return (
    <CalendarContent
      initialEvents={data?.events}
      initialMeta={data?.meta}
    />
  );
}
