'use client';

import { useEffect, useRef, useState } from 'react';
import createGlobe from 'cobe';

const COUNTRIES = [
  { name: 'United States', flag: 'us', gdp: '$31.82T', pop: '340M', growth: '2.1%', pos: { top: '20%', left: '8%' } },
  { name: 'China', flag: 'cn', gdp: '$20.65T', pop: '1.41B', growth: '4.5%', pos: { top: '30%', right: '5%' } },
  { name: 'India', flag: 'in', gdp: '$4.51T', pop: '1.45B', growth: '6.5%', pos: { bottom: '35%', right: '8%' } },
  { name: 'Germany', flag: 'de', gdp: '$5.33T', pop: '84M', growth: '0.3%', pos: { top: '15%', right: '15%' } },
  { name: 'Japan', flag: 'jp', gdp: '$4.46T', pop: '124M', growth: '0.6%', pos: { top: '25%', left: '5%' } },
  { name: 'Brazil', flag: 'br', gdp: '$2.33T', pop: '216M', growth: '2.2%', pos: { bottom: '25%', left: '5%' } },
  { name: 'Nigeria', flag: 'ng', gdp: '$473B', pop: '224M', growth: '3.0%', pos: { bottom: '30%', left: '15%' } },
  { name: 'United Kingdom', flag: 'gb', gdp: '$4.23T', pop: '68M', growth: '1.1%', pos: { top: '18%', left: '20%' } },
  { name: 'South Korea', flag: 'kr', gdp: '$1.87T', pop: '52M', growth: '2.0%', pos: { top: '32%', right: '12%' } },
  { name: 'Australia', flag: 'au', gdp: '$1.80T', pop: '27M', growth: '1.5%', pos: { bottom: '20%', right: '5%' } },
];

function CountryCard({ country, visible }: { country: typeof COUNTRIES[0]; visible: boolean }) {
  return (
    <div
      className={`absolute transition-all duration-1000 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
      style={country.pos as React.CSSProperties}
    >
      <div className="bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 shadow-2xl shadow-blue-500/5 min-w-[160px]">
        <div className="flex items-center gap-2 mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://flagcdn.com/w20/${country.flag}.png`} width={18} alt="" className="shrink-0" />
          <span className="text-white text-sm font-semibold">{country.name}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <div>
            <div className="text-gray-500">GDP</div>
            <div className="text-blue-400 font-mono">{country.gdp}</div>
          </div>
          <div>
            <div className="text-gray-500">Pop</div>
            <div className="text-cyan-400 font-mono">{country.pop}</div>
          </div>
          <div>
            <div className="text-gray-500">Growth</div>
            <div className="text-emerald-400 font-mono">{country.growth}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visibleCards, setVisibleCards] = useState<number[]>([0, 1]);

  // Cycle country cards
  useEffect(() => {
    let idx = 2;
    const interval = setInterval(() => {
      setVisibleCards(prev => {
        const next = [...prev];
        // Replace the oldest card
        const replaceIdx = idx % 2 === 0 ? 0 : 1;
        next[replaceIdx] = idx % COUNTRIES.length;
        return next;
      });
      idx++;
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    let phi = 0;
    const width = canvasRef.current.offsetWidth;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 3,
      mapSamples: 16000,
      mapBrightness: 1.2,
      baseColor: [0.1, 0.1, 0.15],
      markerColor: [0.4, 0.6, 1],
      glowColor: [0.08, 0.08, 0.15],
      markers: [
        { location: [40.7128, -74.006], size: 0.06 },
        { location: [51.5074, -0.1278], size: 0.06 },
        { location: [35.6762, 139.6503], size: 0.06 },
        { location: [31.2304, 121.4737], size: 0.06 },
        { location: [28.6139, 77.209], size: 0.05 },
        { location: [-23.5505, -46.6333], size: 0.05 },
        { location: [6.5244, 3.3792], size: 0.04 },
        { location: [55.7558, 37.6173], size: 0.05 },
        { location: [-33.8688, 151.2093], size: 0.04 },
        { location: [48.8566, 2.3522], size: 0.05 },
        { location: [1.3521, 103.8198], size: 0.04 },
        { location: [-1.2921, 36.8219], size: 0.03 },
        { location: [19.4326, -99.1332], size: 0.04 },
        { location: [37.5665, 126.978], size: 0.05 },
        { location: [30.0444, 31.2357], size: 0.04 },
      ],
    });

    const frame = () => {
      phi += 0.003;
      globe.update({ phi });
      requestAnimationFrame(frame);
    };
    const raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      globe.destroy();
    };
  }, []);

  return (
    <div className="relative w-full max-w-[700px] aspect-square mx-auto">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ contain: 'layout paint size' }}
      />
      {/* Floating country cards */}
      {COUNTRIES.map((country, i) => (
        <CountryCard key={country.name} country={country} visible={visibleCards.includes(i)} />
      ))}
      {/* Bottom fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
