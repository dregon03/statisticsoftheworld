'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedPriceProps {
  value: number;
  format?: (v: number) => string;
  className?: string;
}

/**
 * Displays a price with a slide-up transition when the value changes.
 * Flashes green on price increase, red on decrease.
 */
export default function AnimatedPrice({ value, format, className = '' }: AnimatedPriceProps) {
  const prevRef = useRef(value);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const [sliding, setSliding] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const prev = prevRef.current;
    if (prev !== value && prev !== 0) {
      const direction = value > prev ? 'up' : 'down';
      setFlash(direction);
      setSliding(true);

      // Clear any existing timeout
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // Remove animation classes after transition completes
      timeoutRef.current = setTimeout(() => {
        setFlash(null);
        setSliding(false);
      }, 600);
    }
    prevRef.current = value;
  }, [value]);

  const formatted = format ? format(value) : value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const flashBg = flash === 'up'
    ? 'animate-price-up'
    : flash === 'down'
    ? 'animate-price-down'
    : '';

  return (
    <span className={`inline-flex overflow-hidden ${className}`}>
      <span className={`inline-block ${flashBg} ${sliding ? 'animate-slide-up' : ''}`}>
        {formatted}
      </span>
    </span>
  );
}
