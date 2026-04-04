'use client';

import { useState, useEffect, useRef } from 'react';

// ─── Table of Contents with scroll spy ─────────────────
const CHAPTERS = [
  { id: 'hero', label: 'Overview' },
  { id: 'chapter-1', label: '1. The $110T Economy' },
  { id: 'chapter-2', label: '2. The Growth Race' },
  { id: 'chapter-3', label: '3. Rich vs Poor' },
  { id: 'chapter-4', label: '4. 8.1 Billion Humans' },
  { id: 'chapter-5', label: '5. Inflation & Prices' },
  { id: 'chapter-6', label: '6. Work & Wages' },
  { id: 'chapter-7', label: '7. Debt Mountain' },
  { id: 'chapter-8', label: '8. Life & Death' },
  { id: 'chapter-9', label: '9. Planet Report' },
  { id: 'chapter-10', label: '10. Digital World' },
  { id: 'chapter-11', label: '11. Trade & Power' },
  { id: 'chapter-12', label: '12. Inequality' },
  { id: 'methodology', label: 'Methodology' },
];

export function SnapshotTOC() {
  const [active, setActive] = useState('hero');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    for (const ch of CHAPTERS) {
      const el = document.getElementById(ch.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Desktop TOC - fixed sidebar */}
      <nav className="hidden xl:block fixed left-2 top-1/2 -translate-y-1/2 z-50 w-36">
        <div className="bg-[#0d1b2a]/90 backdrop-blur-sm border border-white/10 rounded-xl p-2">
          <div className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-1.5 px-1.5">Contents</div>
          {CHAPTERS.map((ch) => (
            <a
              key={ch.id}
              href={`#${ch.id}`}
              className={`block text-[11px] px-1.5 py-1 rounded-md transition-all ${
                active === ch.id
                  ? 'text-blue-400 bg-blue-500/10 font-medium'
                  : 'text-white/40 hover:text-white/70'
              }`}
              onClick={() => setIsOpen(false)}
            >
              {ch.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Mobile TOC - floating button */}
      <div className="xl:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-full shadow-2xl flex items-center justify-center transition"
          aria-label="Table of contents"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute bottom-16 right-0 w-56 bg-[#0d1b2a]/95 backdrop-blur-sm border border-white/10 rounded-xl p-3 shadow-2xl">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2 px-2">Jump to</div>
            {CHAPTERS.map((ch) => (
              <a
                key={ch.id}
                href={`#${ch.id}`}
                className={`block text-[13px] px-2 py-1.5 rounded-md transition-all ${
                  active === ch.id
                    ? 'text-blue-400 bg-blue-500/10 font-medium'
                    : 'text-white/40 hover:text-white/70'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {ch.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Share buttons ─────────────────────────────
export function ShareBar() {
  const [copied, setCopied] = useState(false);
  const url = 'https://statisticsoftheworld.com/snapshot/2026';
  const title = '2026 Global Economic Snapshot — The World in Numbers';

  const share = (platform: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const map: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      hn: `https://news.ycombinator.com/submitlink?u=${encodedUrl}&t=${encodedTitle}`,
    };
    window.open(map[platform], '_blank', 'width=600,height=400');
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[12px] text-white/30 uppercase tracking-wider mr-1">Share</span>
      <button onClick={() => share('twitter')} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[12px] text-white/60 hover:text-white transition" aria-label="Share on Twitter">𝕏</button>
      <button onClick={() => share('linkedin')} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[12px] text-white/60 hover:text-white transition" aria-label="Share on LinkedIn">LinkedIn</button>
      <button onClick={() => share('reddit')} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[12px] text-white/60 hover:text-white transition" aria-label="Share on Reddit">Reddit</button>
      <button onClick={() => share('hn')} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[12px] text-white/60 hover:text-white transition" aria-label="Share on Hacker News">HN</button>
      <button onClick={copyLink} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[12px] text-white/60 hover:text-white transition" aria-label="Copy link">
        {copied ? '✓ Copied' : 'Copy link'}
      </button>
      <DownloadPDFButton />
    </div>
  );
}

// ─── PDF Download ─────────────────────────────
export type { SnapshotPDFData } from './pdfTypes';

// Global store for PDF data (set by server component, read by client button)
let _pdfData: import('./pdfTypes').SnapshotPDFData | null = null;

export function PDFDataProvider({ data }: { data: import('./pdfTypes').SnapshotPDFData }) {
  useEffect(() => {
    _pdfData = data;
  }, [data]);
  return null;
}

function DownloadPDFButton({ prominent = false }: { prominent?: boolean }) {
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    if (!_pdfData) return;
    setGenerating(true);
    try {
      const { generateSnapshotPDF } = await import('./generatePDF');
      generateSnapshotPDF(_pdfData);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  if (prominent) {
    return (
      <button
        onClick={handleDownload}
        disabled={generating}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-[14px] font-semibold text-white shadow-lg shadow-blue-600/25 transition disabled:opacity-50"
        aria-label="Download PDF Report"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
        {generating ? 'Generating PDF...' : 'Download PDF'}
      </button>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-[12px] text-blue-400 hover:text-blue-300 transition disabled:opacity-50"
      aria-label="Download PDF Report"
    >
      {generating ? 'Generating...' : 'PDF Report'}
    </button>
  );
}

export function DownloadPDFButtonProminent() {
  return <DownloadPDFButton prominent />;
}

// ─── Animated number counter ─────────────────────────────
export function AnimatedNumber({ value, prefix = '', suffix = '', duration = 1500, decimals = 0 }: {
  value: number; prefix?: string; suffix?: string; duration?: number; decimals?: number;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setDisplay(value * eased);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref}>
      {prefix}{display.toFixed(decimals)}{suffix}
    </span>
  );
}

// ─── Progress bar that animates on scroll ─────────────────
export function AnimatedBar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setWidth(pct), delay);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [pct, delay]);

  return (
    <div ref={ref} className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.max(width, 2)}%`, backgroundColor: color }} />
  );
}
