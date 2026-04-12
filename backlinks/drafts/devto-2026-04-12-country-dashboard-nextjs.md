# Dev.to Article: Building a Country Comparison Dashboard with Next.js and Free Data

**Platform**: dev.to
**Type**: Article
**Status**: Ready to post
**Tags**: nextjs, react, api, webdev, tutorial
**Pre-post check**: Search dev.to for "statisticsoftheworld" — if already posted recently, SKIP

---

# Building a Country Comparison Dashboard with Next.js and Free Data

I wanted to build a simple dashboard that lets you compare any two countries side-by-side — GDP, population, inflation, the works. The hard part wasn't the UI. It was getting clean data without stitching together five different APIs.

Here's how I built it in about two hours using Next.js App Router and free economic data.

## The Stack

- **Next.js 14+** (App Router, Server Components)
- **Tailwind CSS** for styling
- **Free economic data API** for country statistics

No database needed — we're fetching live data on each request and caching with Next.js.

## Step 1: Fetching Country Data

The annoying thing about economic data is that it's scattered. GDP comes from the IMF, population from the World Bank, health data from the WHO — and they all use different country codes.

I used [Statistics of the World's API](https://statisticsoftheworld.com/api-docs) because it normalizes all of these into one endpoint with consistent ISO-3 codes. No auth needed for basic use.

```typescript
// lib/data.ts
const BASE = 'https://statisticsoftheworld.com/api/v2';

export async function getCountryData(countryId: string) {
  const res = await fetch(`${BASE}/country/${countryId}`, {
    next: { revalidate: 86400 } // Cache for 24 hours
  });
  return res.json();
}

export async function getRanking(indicator: string) {
  const res = await fetch(`${BASE}/ranking/${indicator}`, {
    next: { revalidate: 86400 }
  });
  return res.json();
}
```

## Step 2: The Comparison Page

```typescript
// app/compare/[slug]/page.tsx
import { getCountryData } from '@/lib/data';

export default async function ComparePage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const [country1, country2] = params.slug.split('-vs-');
  
  const [data1, data2] = await Promise.all([
    getCountryData(country1),
    getCountryData(country2),
  ]);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">
        {data1.name} vs {data2.name}
      </h1>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-right font-mono">{fmt(data1.gdp)}</div>
        <div className="text-center text-gray-500">GDP</div>
        <div className="font-mono">{fmt(data2.gdp)}</div>
        
        <div className="text-right font-mono">{fmt(data1.population)}</div>
        <div className="text-center text-gray-500">Population</div>
        <div className="font-mono">{fmt(data2.population)}</div>
        
        <div className="text-right font-mono">{data1.inflation}%</div>
        <div className="text-center text-gray-500">Inflation</div>
        <div className="font-mono">{data2.inflation}%</div>
      </div>
    </div>
  );
}
```

## Step 3: Making It SEO-Friendly

Since this is a server component, the HTML is rendered on the server — Google sees the full data. I added `generateMetadata` for dynamic titles:

```typescript
export async function generateMetadata({ params }) {
  const [c1, c2] = params.slug.split('-vs-');
  const [d1, d2] = await Promise.all([
    getCountryData(c1),
    getCountryData(c2),
  ]);
  
  return {
    title: `${d1.name} vs ${d2.name} — Economy Comparison`,
    description: `Compare ${d1.name} (GDP: ${fmt(d1.gdp)}) vs ${d2.name} (GDP: ${fmt(d2.gdp)}). Population, inflation, unemployment, and more.`,
  };
}
```

## Step 4: Static Paths for Popular Comparisons

Pre-render the most searched comparisons:

```typescript
export function generateStaticParams() {
  return [
    'united-states-vs-china',
    'united-states-vs-india',
    'china-vs-japan',
    'germany-vs-france',
    'united-kingdom-vs-france',
  ].map(slug => ({ slug }));
}
```

## The Result

A clean comparison dashboard that:
- Loads instantly (server-rendered, cached)
- Works with any two countries (218 total)
- Has proper SEO metadata
- Cost $0 in API fees

The full comparison is more polished than what I showed here — you can see a live example at [statisticsoftheworld.com/compare/united-states-vs-china](https://statisticsoftheworld.com/compare/united-states-vs-china).

## What I Learned

1. **Server Components are perfect for data dashboards** — no client-side loading spinners, no layout shift, great for SEO
2. **Caching is your friend** — economic data doesn't change hourly, so `revalidate: 86400` keeps things fast
3. **One normalized API beats three raw ones** — I spent more time on the UI than on data fetching, which is how it should be

---

What are you building with country data? I'm always interested in what people use this kind of data for.
