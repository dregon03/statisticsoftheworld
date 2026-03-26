'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { INDICATORS, formatValue } from '@/lib/data';
import Flag from '../Flag';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ExportButton from '@/components/ExportButton';
import HeroTabs from '@/components/HeroTabs';

interface Country {
  id: string;
  iso2: string;
  name: string;
  region: string;
  incomeLevel: string;
  capitalCity: string;
}

interface CountryStats {
  [countryId: string]: {
    gdp?: number;
    population?: number;
    gdpPerCapita?: number;
    lifeExpectancy?: number;
    inflation?: number;
    unemployment?: number;
    gdpGrowth?: number;
  };
}

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [stats, setStats] = useState<CountryStats>({});
  const [search, setSearch] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/countries')
      .then(r => r.json())
      .then(({ countries: list, stats: s }) => {
        setCountries(list.sort((a: Country, b: Country) => a.name.localeCompare(b.name)));
        setStats(s);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const regions = useMemo(() => [...new Set(countries.map(c => c.region))].sort(), [countries]);

  const filtered = useMemo(() => {
    return countries.filter(c => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
      const matchRegion = !filterRegion || c.region === filterRegion;
      return matchSearch && matchRegion;
    });
  }, [countries, search, filterRegion]);

  return (
    <main className="min-h-screen bg-white text-[#333]">
      <Nav />
      <HeroTabs active="/countries" countryCount={countries.length} indicatorCount={INDICATORS.length} />

      <section className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            placeholder="Search countries..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-white border border-[#e8e8e8] rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-[#0066cc] transition w-56"
          />
          <select
            value={filterRegion}
            onChange={e => setFilterRegion(e.target.value)}
            className="bg-white border border-[#e8e8e8] rounded-lg px-3 py-1.5 text-[13px] outline-none cursor-pointer"
          >
            <option value="">All Regions</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <span className="text-[12px] text-[#999] self-center ml-auto flex items-center gap-3">
            {filtered.length} countries
            <ExportButton
              filename={`sotw-countries-${new Date().toISOString().slice(0, 10)}`}
              getData={() => ({
                headers: ['Country', 'Code', 'Region', 'GDP', 'Population', 'GDP/Capita', 'GDP Growth', 'Inflation', 'Unemployment', 'Life Expectancy'],
                rows: filtered.map(c => {
                  const s = stats[c.id] || {};
                  return [c.name, c.id, c.region, s.gdp ?? null, s.population ?? null, s.gdpPerCapita ?? null, s.gdpGrowth ?? null, s.inflation ?? null, s.unemployment ?? null, s.lifeExpectancy ?? null];
                }),
              })}
            />
          </span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#999] text-[13px]">Loading countries...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(c => {
              const s = stats[c.id] || {};
              const growth = s.gdpGrowth;
              const growthColor = growth != null ? (growth >= 0 ? 'text-green-600' : 'text-red-500') : 'text-[#999]';
              return (
                <Link
                  key={c.id}
                  href={`/country/${c.id}`}
                  className="border border-[#e8e8e8] rounded-xl p-4 hover:border-[#ccc] hover:bg-[#fafbfc] transition group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-[15px] group-hover:text-[#0066cc] transition flex items-center gap-2">
                        <Flag iso2={c.iso2} size={22} />
                        {c.name}
                      </h3>
                      <div className="text-[11px] text-[#999]">{c.capitalCity || c.region}</div>
                    </div>
                    <span className="text-[10px] bg-[#f5f5f5] px-1.5 py-0.5 rounded text-[#999]">{c.id}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
                    <div>
                      <div className="text-[#999] text-[10px]">GDP</div>
                      <div className="font-mono text-[#0066cc] font-medium">{s.gdp ? formatValue(s.gdp, 'currency') : '—'}</div>
                    </div>
                    <div>
                      <div className="text-[#999] text-[10px]">Population</div>
                      <div className="font-mono">{s.population ? formatValue(s.population, 'number') : '—'}</div>
                    </div>
                    <div>
                      <div className="text-[#999] text-[10px]">GDP/Capita</div>
                      <div className="font-mono">{s.gdpPerCapita ? formatValue(s.gdpPerCapita, 'currency') : '—'}</div>
                    </div>
                    <div>
                      <div className="text-[#999] text-[10px]">GDP Growth</div>
                      <div className={`font-mono ${growthColor}`}>{growth != null ? `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%` : '—'}</div>
                    </div>
                    <div>
                      <div className="text-[#999] text-[10px]">Inflation</div>
                      <div className="font-mono">{s.inflation != null ? `${s.inflation.toFixed(1)}%` : '—'}</div>
                    </div>
                    <div>
                      <div className="text-[#999] text-[10px]">Life Exp.</div>
                      <div className="font-mono">{s.lifeExpectancy ? `${s.lifeExpectancy.toFixed(1)}y` : '—'}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-[10px] bg-[#f0f0f0] px-2 py-0.5 rounded text-[#999]">{c.region}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
