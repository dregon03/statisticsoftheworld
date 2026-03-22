'use client';

import { useState } from 'react';

interface EmbedButtonProps {
  indicatorId: string;
  countryId: string;
}

export default function EmbedButton({ indicatorId, countryId }: EmbedButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const embedUrl = `https://statisticsoftheworld.com/embed/chart?indicator=${encodeURIComponent(indicatorId)}&country=${encodeURIComponent(countryId)}`;
  const iframeCode = `<iframe src="${embedUrl}" width="600" height="350" frameborder="0" style="border:1px solid #e8e8e8;border-radius:8px;"></iframe>`;

  const copyCode = () => {
    navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1 text-[12px] text-[#0066cc] hover:text-[#004999] transition"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
        Embed
      </button>

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setShowModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-[520px] max-w-[90vw] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold">Embed This Chart</h3>
              <button onClick={() => setShowModal(false)} className="text-[#999] hover:text-[#333] text-[18px]">&times;</button>
            </div>

            <p className="text-[12px] text-[#999] mb-3">
              Copy the code below and paste it into your website or blog.
            </p>

            <div className="relative">
              <pre className="bg-[#f8f9fa] rounded-lg p-3 text-[11px] text-[#333] overflow-x-auto whitespace-pre-wrap break-all border border-[#e8e8e8]">
                {iframeCode}
              </pre>
              <button
                onClick={copyCode}
                className="absolute top-2 right-2 px-2 py-1 bg-white border border-[#e8e8e8] rounded text-[11px] hover:bg-[#f0f0f0] transition"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="mt-4 text-[11px] text-[#999]">
              Preview:
            </div>
            <div className="mt-1 border border-[#e8e8e8] rounded-lg overflow-hidden" style={{ height: 350 }}>
              <iframe
                src={`/embed/chart?indicator=${encodeURIComponent(indicatorId)}&country=${encodeURIComponent(countryId)}`}
                width="100%"
                height="350"
                style={{ border: 'none' }}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
