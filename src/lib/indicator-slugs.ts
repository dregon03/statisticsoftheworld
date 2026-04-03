import { INDICATORS } from './data';

/** Generate a URL-friendly slug from an indicator label */
function labelToSlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/[₂₃]/g, m => m === '₂' ? '2' : '3')  // CO₂ → co2
    .replace(/[(),%]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Build slug → indicator ID map, handling duplicates by appending source */
function buildSlugMap(): Map<string, string> {
  const slugCount = new Map<string, string[]>();

  for (const ind of INDICATORS) {
    const slug = labelToSlug(ind.label);
    if (!slugCount.has(slug)) slugCount.set(slug, []);
    slugCount.get(slug)!.push(ind.id);
  }

  const map = new Map<string, string>();
  for (const [slug, ids] of slugCount) {
    if (ids.length === 1) {
      map.set(slug, ids[0]);
    } else {
      // Multiple indicators with same label — disambiguate with source prefix
      for (const id of ids) {
        const ind = INDICATORS.find(i => i.id === id)!;
        const source = ind.source === 'imf' ? 'imf' : ind.source === 'who' ? 'who' : 'wb';
        const disambiguated = `${slug}-${source}`;
        map.set(disambiguated, id);
      }
    }
  }

  return map;
}

const SLUG_MAP = buildSlugMap();

// Reverse map: indicator ID → slug
const ID_TO_SLUG = new Map<string, string>();
for (const [slug, id] of SLUG_MAP) {
  ID_TO_SLUG.set(id, slug);
}

export function getIndicatorBySlug(slug: string): { id: string; slug: string } | null {
  const id = SLUG_MAP.get(slug);
  if (!id) return null;
  return { id, slug };
}

export function getSlugForIndicator(indicatorId: string): string | null {
  return ID_TO_SLUG.get(indicatorId) || null;
}

export function getAllIndicatorSlugs(): string[] {
  return [...SLUG_MAP.keys()];
}
