'use client';

import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // Animate rotation
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
    <div className="relative w-full max-w-[600px] aspect-square mx-auto">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ contain: 'layout paint size' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
