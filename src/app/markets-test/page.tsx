'use client';

import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { useEffect, useRef } from 'react';

function TradingViewWidget({ scriptSrc, config }: { scriptSrc: string; config: object }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'tradingview-widget-container';
    container.style.width = '100%';
    container.style.height = '100%';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.width = '100%';
    widgetDiv.style.height = '100%';
    container.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.textContent = JSON.stringify(config);
    container.appendChild(script);
    script.src = scriptSrc;
    script.async = true;

    ref.current.appendChild(container);

    return () => { if (ref.current) ref.current.innerHTML = ''; };
  }, [scriptSrc, config]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
}

const HEATMAP_CONFIG = {
  exchanges: [],
  dataSource: "SPX500",
  grouping: "sector",
  blockSize: "market_cap_basic",
  blockColor: "change",
  locale: "en",
  symbolUrl: "/markets/stocks/{tvticker}",
  colorTheme: "light",
  hasTopBar: true,
  isDataSetEnabled: true,
  isZoomEnabled: true,
  hasSymbolTooltip: true,
  isMonoSize: false,
  width: "100%",
  height: "100%",
};

const OVERVIEW_CONFIG = {
  colorTheme: "light",
  dateRange: "12M",
  showChart: true,
  locale: "en",
  isTransparent: true,
  showSymbolLogo: true,
  width: "100%",
  height: "100%",
  tabs: [
    { title: "Indices", symbols: [
      { s: "FOREXCOM:SPXUSD", d: "S&P 500" }, { s: "FOREXCOM:NSXUSD", d: "US 100" },
      { s: "FOREXCOM:DJI", d: "Dow Jones" }, { s: "INDEX:NKY", d: "Nikkei 225" },
      { s: "INDEX:DEU40", d: "DAX" }, { s: "FOREXCOM:UKXGBP", d: "FTSE 100" },
      { s: "TSX:TSX", d: "S&P/TSX" }, { s: "BSE:SENSEX", d: "Sensex" },
    ]},
    { title: "Commodities", symbols: [
      { s: "COMEX:GC1!", d: "Gold" }, { s: "COMEX:SI1!", d: "Silver" },
      { s: "NYMEX:CL1!", d: "WTI Crude" }, { s: "NYMEX:NG1!", d: "Natural Gas" },
      { s: "COMEX:HG1!", d: "Copper" }, { s: "CBOT:ZC1!", d: "Corn" },
      { s: "CBOT:ZW1!", d: "Wheat" },
    ]},
    { title: "Crypto", symbols: [
      { s: "BINANCE:BTCUSDT", d: "Bitcoin" }, { s: "BINANCE:ETHUSDT", d: "Ethereum" },
      { s: "BINANCE:SOLUSDT", d: "Solana" }, { s: "BINANCE:XRPUSDT", d: "XRP" },
      { s: "BINANCE:DOGEUSDT", d: "Dogecoin" }, { s: "BINANCE:ADAUSDT", d: "Cardano" },
    ]},
    { title: "Forex", symbols: [
      { s: "FX:EURUSD", d: "EUR/USD" }, { s: "FX:GBPUSD", d: "GBP/USD" },
      { s: "FX:USDJPY", d: "USD/JPY" }, { s: "FX:USDCAD", d: "USD/CAD" },
      { s: "FX:AUDUSD", d: "AUD/USD" }, { s: "FX:USDCHF", d: "USD/CHF" },
    ]},
  ],
};

const CRYPTO_HEATMAP_CONFIG = {
  dataSource: "Crypto",
  blockSize: "market_cap_calc",
  blockColor: "change",
  locale: "en",
  symbolUrl: "/markets/crypto/{tvticker}",
  colorTheme: "light",
  hasTopBar: true,
  isDataSetEnabled: true,
  isZoomEnabled: true,
  hasSymbolTooltip: true,
  width: "100%",
  height: "100%",
};

const TICKER_CONFIG = {
  symbols: [
    { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
    { proName: "FOREXCOM:NSXUSD", title: "US 100" },
    { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
    { proName: "BITSTAMP:ETHUSD", title: "Ethereum" },
    { proName: "FX:EURUSD", title: "EUR/USD" },
    { proName: "COMEX:GC1!", title: "Gold" },
    { proName: "NYMEX:CL1!", title: "WTI Crude" },
  ],
  showSymbolLogo: true,
  isTransparent: true,
  displayMode: "adaptive",
  colorTheme: "light",
  locale: "en",
};

export default function MarketsTestPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#1a1a2e]">
      <Nav />
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <h1 className="text-[28px] font-bold text-[#0d1b2a] mb-2">Markets (TradingView Test)</h1>
        <p className="text-[15px] text-[#64748b] mb-8">Testing TradingView widgets as replacement for yfinance live data.</p>

        <section className="mb-10">
          <h2 className="text-[18px] font-bold text-[#0d1b2a] mb-4">S&P 500 Heatmap</h2>
          <div className="bg-white border border-[#d5dce6] rounded-xl overflow-hidden shadow-sm" style={{ height: '500px' }}>
            <TradingViewWidget scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js" config={HEATMAP_CONFIG} />
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-[18px] font-bold text-[#0d1b2a] mb-4">Market Overview</h2>
          <div className="bg-white border border-[#d5dce6] rounded-xl overflow-hidden shadow-sm" style={{ height: '550px' }}>
            <TradingViewWidget scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js" config={OVERVIEW_CONFIG} />
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-[18px] font-bold text-[#0d1b2a] mb-4">Crypto Heatmap</h2>
          <div className="bg-white border border-[#d5dce6] rounded-xl overflow-hidden shadow-sm" style={{ height: '500px' }}>
            <TradingViewWidget scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js" config={CRYPTO_HEATMAP_CONFIG} />
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-[18px] font-bold text-[#0d1b2a] mb-4">Ticker Tape</h2>
          <TradingViewWidget scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js" config={TICKER_CONFIG} />
        </section>
      </div>
      <Footer />
    </main>
  );
}
