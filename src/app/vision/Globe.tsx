'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

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
  const containerRef = useRef<HTMLDivElement>(null);
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
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 2.0;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Earth sphere with night texture
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('/earth-night.jpg');
    earthTexture.colorSpace = THREE.SRGBColorSpace;

    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const material = new THREE.MeshBasicMaterial({
      map: earthTexture,
    });
    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // Atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(1.02, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity * 0.6;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Stars
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 100;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, sizeAttenuation: true });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Animate
    let animId: number;
    const animate = () => {
      earth.rotation.y += 0.001;
      atmosphere.rotation.y += 0.001;
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

    // Resize
    const onResize = () => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const country = COUNTRIES[activeIdx];

  return (
    <div className="relative w-full max-w-[850px] aspect-square mx-auto">
      <div ref={containerRef} className="w-full h-full" />

      {/* Centered country card */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`transition-all duration-400 ${fade ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
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
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-sky-50 to-transparent pointer-events-none" />
    </div>
  );
}
