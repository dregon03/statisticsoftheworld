'use client';

import { useState, useEffect, useRef } from 'react';

interface CounterConfig {
  label: string;
  baseValue: number;
  ratePerSecond: number; // how much it changes per second
  format: 'number' | 'currency' | 'weight';
  prefix?: string;
  suffix?: string;
  color?: string;
}

// Global rates derived from annual data:
// World population: ~8.1B, growth ~0.9%/year = ~73M/year = ~2.3/sec
// World CO2: ~37.5B tonnes/year = ~1,189 tonnes/sec
// US national debt: ~36T, growing ~$1T/year = ~$31,710/sec
// World GDP: ~105T/year = ~$3.3M/sec
// Global military spending: ~$2.4T/year (SIPRI 2024) = ~$76,104/sec
// Global gov debt: ~$97T, growing ~$4T/year = ~$126,839/sec
// Global healthcare spending: ~$9.8T/year (WHO) = ~$310,744/sec
// Global energy: ~14,500 Mtoe/year (IEA) = ~460 tonnes oil equiv/sec

const WORLD_COUNTERS: CounterConfig[] = [
  {
    label: 'World Population',
    baseValue: 8_190_000_000,
    ratePerSecond: 2.3,
    format: 'number',
    color: 'text-blue-600',
  },
  {
    label: 'CO₂ Emitted Today',
    baseValue: 0,
    ratePerSecond: 1189,
    format: 'weight',
    suffix: ' tonnes',
    color: 'text-orange-600',
  },
  {
    label: 'US National Debt',
    baseValue: 36_200_000_000_000,
    ratePerSecond: 31710,
    format: 'currency',
    prefix: '$',
    color: 'text-red-500',
  },
  {
    label: 'World GDP (2026)',
    baseValue: 110_000_000_000_000,
    ratePerSecond: 3_300_000,
    format: 'currency',
    prefix: '$',
    color: 'text-green-600',
  },
  {
    label: 'Military Spending Today',
    baseValue: 0,
    ratePerSecond: 76104,
    format: 'currency',
    prefix: '$',
    color: 'text-red-600',
  },
  {
    label: 'Global Government Debt',
    baseValue: 97_000_000_000_000,
    ratePerSecond: 126839,
    format: 'currency',
    prefix: '$',
    color: 'text-rose-500',
  },
  {
    label: 'Healthcare Spending Today',
    baseValue: 0,
    ratePerSecond: 310744,
    format: 'currency',
    prefix: '$',
    color: 'text-emerald-600',
  },
  {
    label: 'Energy Used Today',
    baseValue: 0,
    ratePerSecond: 460,
    format: 'weight',
    suffix: ' toe',
    color: 'text-amber-600',
  },
];

function formatLargeNumber(value: number, format: string, prefix?: string, suffix?: string): string {
  const p = prefix || '';
  const s = suffix || '';
  // Full figures with commas — makes the ticking feel live
  return `${p}${Math.floor(value).toLocaleString('en-US')}${s}`;
}

function SingleCounter({ config }: { config: CounterConfig }) {
  const [value, setValue] = useState(config.baseValue);
  const startRef = useRef(Date.now());

  useEffect(() => {
    // For "today" counters, calculate from midnight UTC
    const now = new Date();
    const midnightUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const secondsSinceMidnight = (now.getTime() - midnightUTC.getTime()) / 1000;

    const base = config.baseValue === 0
      ? config.ratePerSecond * secondsSinceMidnight // "today" counter starts from midnight
      : config.baseValue;

    startRef.current = Date.now();
    setValue(base);

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      setValue(base + config.ratePerSecond * elapsed);
    }, 50); // Update 20 times/sec for smooth ticking

    return () => clearInterval(interval);
  }, [config]);

  return (
    <div className="text-center">
      <div className={`text-[15px] md:text-[18px] font-bold font-mono tabular-nums ${config.color || 'text-[#0d1b2a]'}`}>
        {formatLargeNumber(value, config.format, config.prefix, config.suffix)}
      </div>
      <div className="text-[11px] text-[#64748b] mt-1">{config.label}</div>
    </div>
  );
}

export default function LiveCounters() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-5">
      {WORLD_COUNTERS.map((config, i) => (
        <SingleCounter key={i} config={config} />
      ))}
    </div>
  );
}
