'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import createGlobe from 'cobe';

const COUNTRIES = [
  { name: 'United States', flag: 'us', gdp: '$31.82T', gdppc: '$93K', life: '78.4y', pop: '340M', lat: 38, lng: -97 },
  { name: 'China', flag: 'cn', gdp: '$20.65T', gdppc: '$15K', life: '78.6y', pop: '1.41B', lat: 35, lng: 105 },
  { name: 'India', flag: 'in', gdp: '$4.51T', gdppc: '$3K', life: '72.0y', pop: '1.45B', lat: 20, lng: 77 },
  { name: 'Germany', flag: 'de', gdp: '$5.33T', gdppc: '$63K', life: '80.6y', pop: '84M', lat: 51, lng: 10 },
  { name: 'Japan', flag: 'jp', gdp: '$4.46T', gdppc: '$36K', life: '84.0y', pop: '124M', lat: 36, lng: 138 },
  { name: 'Brazil', flag: 'br', gdp: '$2.33T', gdppc: '$11K', life: '76.0y', pop: '216M', lat: -15, lng: -47 },
  { name: 'Nigeria', flag: 'ng', gdp: '$473B', gdppc: '$2K', life: '53.9y', pop: '224M', lat: 9, lng: 8 },
  { name: 'United Kingdom', flag: 'gb', gdp: '$4.23T', gdppc: '$62K', life: '80.7y', pop: '68M', lat: 54, lng: -2 },
  { name: 'South Korea', flag: 'kr', gdp: '$1.87T', gdppc: '$36K', life: '83.7y', pop: '52M', lat: 36, lng: 128 },
  { name: 'Australia', flag: 'au', gdp: '$1.80T', gdppc: '$65K', life: '83.3y', pop: '27M', lat: -25, lng: 134 },
  { name: 'France', flag: 'fr', gdp: '$3.56T', gdppc: '$52K', life: '82.3y', pop: '68M', lat: 46, lng: 2 },
  { name: 'Mexico', flag: 'mx', gdp: '$1.79T', gdppc: '$14K', life: '75.1y', pop: '129M', lat: 23, lng: -102 },
  { name: 'Indonesia', flag: 'id', gdp: '$1.47T', gdppc: '$5K', life: '68.6y', pop: '278M', lat: -5, lng: 120 },
  { name: 'Saudi Arabia', flag: 'sa', gdp: '$1.07T', gdppc: '$29K', life: '77.6y', pop: '37M', lat: 24, lng: 45 },
  { name: 'Egypt', flag: 'eg', gdp: '$398B', gdppc: '$4K', life: '71.5y', pop: '111M', lat: 27, lng: 31 },
];

interface CardPosition {
  x: number;
  y: number;
  visible: boolean;
}

function projectToScreen(lat: number, lng: number, phi: number, theta: number, size: number): CardPosition {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;

  // 3D point on unit sphere
  const cosLat = Math.cos(latRad);
  const sinLat = Math.sin(latRad);
  const cosLng = Math.cos(lngRad - phi);
  const sinLng = Math.sin(lngRad - phi);
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);

  // Rotate by theta (tilt)
  const x = cosLat * sinLng;
  const y = -(sinLat * cosTheta - cosLat * cosLng * sinTheta);
  const z = sinLat * sinTheta + cosLat * cosLng * cosTheta;

  const center = size / 2;
  const radius = size * 0.42; // globe visual radius

  return {
    x: center + x * radius,
    y: center + y * radius,
    visible: z > 0.15, // only show when clearly facing viewer
  };
}

export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0);
  const [cards, setCards] = useState<(CardPosition & { idx: number })[]>([]);
  const sizeRef = useRef(600);

  const updateCards = useCallback(() => {
    const theta = 0.3;
    const size = sizeRef.current;
    const positions = COUNTRIES.map((c, i) => ({
      ...projectToScreen(c.lat, c.lng, phiRef.current, theta, size),
      idx: i,
    }));

    // Show only the top 3 visible cards (closest to viewer = highest z)
    const visible = positions
      .filter(p => p.visible)
      .sort((a, b) => {
        // Prefer cards nearer center of globe
        const aDist = Math.hypot(a.x - size / 2, a.y - size / 2);
        const bDist = Math.hypot(b.x - size / 2, b.y - size / 2);
        return aDist - bDist;
      })
      .slice(0, 3);

    setCards(visible);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const width = canvasRef.current.offsetWidth;
    sizeRef.current = width;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 3,
      mapSamples: 16000,
      mapBrightness: 2,
      baseColor: [0.15, 0.15, 0.2],
      markerColor: [0.3, 0.5, 1],
      glowColor: [0.1, 0.1, 0.2],
      markers: COUNTRIES.map(c => ({
        location: [c.lat, c.lng] as [number, number],
        size: 0.05,
      })),
    });

    let frameId: number;
    const frame = () => {
      phiRef.current += 0.003;
      globe.update({ phi: phiRef.current });
      frameId = requestAnimationFrame(frame);
    };
    frameId = requestAnimationFrame(frame);

    // Update card positions at lower frequency
    const cardInterval = setInterval(updateCards, 200);

    return () => {
      cancelAnimationFrame(frameId);
      clearInterval(cardInterval);
      globe.destroy();
    };
  }, [updateCards]);

  return (
    <div className="relative w-full max-w-[700px] aspect-square mx-auto">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ contain: 'layout paint size' }}
      />
      {/* Country cards projected onto globe positions */}
      {cards.map(card => {
        const country = COUNTRIES[card.idx];
        const size = sizeRef.current;
        // Convert pixel position to percentage
        const leftPct = (card.x / size) * 100;
        const topPct = (card.y / size) * 100;

        return (
          <div
            key={country.name}
            className="absolute pointer-events-none transition-all duration-500 ease-out"
            style={{
              left: `${leftPct}%`,
              top: `${topPct}%`,
              transform: 'translate(-50%, -120%)',
            }}
          >
            {/* Connector line */}
            <div className="absolute left-1/2 bottom-0 w-px h-4 bg-gradient-to-t from-blue-500/60 to-transparent -translate-x-1/2 translate-y-full" />
            {/* Card */}
            <div className="bg-gray-900/85 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 shadow-xl shadow-blue-500/5 whitespace-nowrap animate-in fade-in duration-500">
              <div className="flex items-center gap-1.5 mb-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://flagcdn.com/w20/${country.flag}.png`} width={14} alt="" className="shrink-0" />
                <span className="text-white text-xs font-semibold">{country.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                <div>
                  <span className="text-gray-500">GDP </span>
                  <span className="text-blue-400 font-mono">{country.gdp}</span>
                </div>
                <div>
                  <span className="text-gray-500">Pop </span>
                  <span className="text-gray-300 font-mono">{country.pop}</span>
                </div>
                <div>
                  <span className="text-gray-500">GDP/cap </span>
                  <span className="text-cyan-400 font-mono">{country.gdppc}</span>
                </div>
                <div>
                  <span className="text-gray-500">Life </span>
                  <span className="text-emerald-400 font-mono">{country.life}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {/* Bottom fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
