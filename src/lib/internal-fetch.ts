/**
 * Fetch from our own API routes during SSR.
 * Uses the public URL so it works both in dev and production.
 */
export const INTERNAL_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://statisticsoftheworld.com';

export async function internalFetch(path: string, revalidateSeconds = 3600): Promise<any> {
  try {
    const res = await fetch(`${INTERNAL_BASE}${path}`, {
      next: { revalidate: revalidateSeconds },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
