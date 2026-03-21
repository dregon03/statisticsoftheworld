'use client';

import { useEffect, useRef, useState } from 'react';
import createGlobe from 'cobe';

const COUNTRIES = [
  { name: 'United States', flag: 'us', gdp: '$31.82T', gdppc: '$93K', life: '78.4', pop: '340M' },
  { name: 'China', flag: 'cn', gdp: '$20.65T', gdppc: '$15K', life: '78.6', pop: '1.41B' },
  { name: 'India', flag: 'in', gdp: '$4.51T', gdppc: '$3K', life: '72.0', pop: '1.45B' },
  { name: 'Germany', flag: 'de', gdp: '$5.33T', gdppc: '$63K', life: '80.6', pop: '84M' },
  { name: 'Japan', flag: 'jp', gdp: '$4.46T', gdppc: '$36K', life: '84.0', pop: '124M' },
  { name: 'Brazil', flag: 'br', gdp: '$2.33T', gdppc: '$11K', life: '76.0', pop: '216M' },
  { name: 'Nigeria', flag: 'ng', gdp: '$473B', gdppc: '$2K', life: '53.9', pop: '224M' },
  { name: 'United Kingdom', flag: 'gb', gdp: '$4.23T', gdppc: '$62K', life: '80.7', pop: '68M' },
  { name: 'South Korea', flag: 'kr', gdp: '$1.87T', gdppc: '$36K', life: '83.7', pop: '52M' },
  { name: 'Australia', flag: 'au', gdp: '$1.80T', gdppc: '$65K', life: '83.3', pop: '27M' },
  { name: 'France', flag: 'fr', gdp: '$3.56T', gdppc: '$52K', life: '82.3', pop: '68M' },
  { name: 'Indonesia', flag: 'id', gdp: '$1.47T', gdppc: '$5K', life: '68.6', pop: '278M' },
  { name: 'Canada', flag: 'ca', gdp: '$2.42T', gdppc: '$58K', life: '81.6', pop: '41M' },
  { name: 'Mexico', flag: 'mx', gdp: '$1.79T', gdppc: '$14K', life: '75.1', pop: '129M' },
  { name: 'Egypt', flag: 'eg', gdp: '$398B', gdppc: '$4K', life: '71.5', pop: '111M' },
];

export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [fade, setFade] = useState(true);

  // Cycle country cards
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setActiveIdx(prev => (prev + 1) % COUNTRIES.length);
        setFade(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    let phi = 0;
    const width = canvasRef.current.offsetWidth;

    // City lights as red markers scattered globally
    const cityLights: { location: [number, number]; size: number }[] = [
      // North America
      { location: [40.71, -74.01], size: 0.04 }, { location: [34.05, -118.24], size: 0.03 },
      { location: [41.88, -87.63], size: 0.03 }, { location: [43.65, -79.38], size: 0.02 },
      { location: [19.43, -99.13], size: 0.03 }, { location: [29.76, -95.37], size: 0.02 },
      { location: [33.45, -112.07], size: 0.02 }, { location: [49.28, -123.12], size: 0.02 },
      // Europe
      { location: [51.51, -0.13], size: 0.04 }, { location: [48.86, 2.35], size: 0.03 },
      { location: [52.52, 13.40], size: 0.03 }, { location: [41.39, 2.17], size: 0.02 },
      { location: [55.76, 37.62], size: 0.04 }, { location: [59.33, 18.07], size: 0.02 },
      { location: [45.46, 9.19], size: 0.02 }, { location: [50.08, 14.44], size: 0.02 },
      { location: [47.50, 19.04], size: 0.02 }, { location: [38.72, -9.14], size: 0.02 },
      // Asia
      { location: [35.68, 139.65], size: 0.04 }, { location: [31.23, 121.47], size: 0.04 },
      { location: [39.90, 116.40], size: 0.04 }, { location: [22.32, 114.17], size: 0.03 },
      { location: [37.57, 126.98], size: 0.03 }, { location: [1.35, 103.82], size: 0.03 },
      { location: [28.61, 77.21], size: 0.04 }, { location: [19.08, 72.88], size: 0.03 },
      { location: [13.76, 100.50], size: 0.02 }, { location: [25.20, 55.27], size: 0.03 },
      { location: [24.47, 54.37], size: 0.02 }, { location: [41.01, 28.98], size: 0.03 },
      { location: [33.68, 73.05], size: 0.02 }, { location: [23.81, 90.41], size: 0.02 },
      // Africa
      { location: [6.52, 3.38], size: 0.03 }, { location: [30.04, 31.24], size: 0.03 },
      { location: [-33.93, 18.42], size: 0.03 }, { location: [-1.29, 36.82], size: 0.02 },
      { location: [33.59, -7.59], size: 0.02 }, { location: [5.56, -0.19], size: 0.02 },
      // South America
      { location: [-23.55, -46.63], size: 0.04 }, { location: [-22.91, -43.17], size: 0.03 },
      { location: [-34.60, -58.38], size: 0.03 }, { location: [-33.45, -70.67], size: 0.02 },
      { location: [4.71, -74.07], size: 0.02 }, { location: [-12.05, -77.04], size: 0.02 },
      // Oceania
      { location: [-33.87, 151.21], size: 0.03 }, { location: [-37.81, 144.96], size: 0.02 },
      { location: [-36.85, 174.76], size: 0.02 },
    ];

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.25,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 20000,
      mapBrightness: 6,
      baseColor: [0.05, 0.05, 0.08],
      markerColor: [1, 0.3, 0.2],
      glowColor: [0.05, 0.05, 0.1],
    markers: cityLights,
    });

    let frameId: number;
    const frame = () => {
      phi += 0.002;
      globe.update({ phi });
      frameId = requestAnimationFrame(frame);
    };
    frameId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(frameId);
      globe.destroy();
    };
  }, []);

  const country = COUNTRIES[activeIdx];

  return (
    <div className="relative w-full max-w-[650px] aspect-square mx-auto">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ contain: 'layout paint size' }}
      />

      {/* Centered country card */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`transition-all duration-400 ${fade ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          <div className="bg-gray-950/70 backdrop-blur-md border border-white/10 rounded-xl px-5 py-4 shadow-2xl">
            <div className="flex items-center gap-2.5 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://flagcdn.com/w40/${country.flag}.png`}
                srcSet={`https://flagcdn.com/w80/${country.flag}.png 2x`}
                width={28} alt="" className="shrink-0"
              />
              <span className="text-white text-base font-bold">{country.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
              <div>
                <div className="text-gray-500">GDP</div>
                <div className="text-blue-400 font-mono text-sm font-semibold">{country.gdp}</div>
              </div>
              <div>
                <div className="text-gray-500">Population</div>
                <div className="text-white font-mono text-sm font-semibold">{country.pop}</div>
              </div>
              <div>
                <div className="text-gray-500">GDP per Capita</div>
                <div className="text-cyan-400 font-mono text-sm font-semibold">{country.gdppc}</div>
              </div>
              <div>
                <div className="text-gray-500">Life Expectancy</div>
                <div className="text-emerald-400 font-mono text-sm font-semibold">{country.life} yrs</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none" />
    </div>
  );
}
