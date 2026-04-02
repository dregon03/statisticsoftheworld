'use client';

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

/**
 * Redirect page for TradingView widget links.
 * TradingView's largeChartUrl sends users to /markets/redirect/EXCHANGE-SYMBOL
 * This page maps those to the correct SOTW pages.
 */

const TV_TO_SOTW: Record<string, string> = {
  // Indices
  "FOREXCOM-SPXUSD": "/markets/stocks/sp500",
  "FOREXCOM-SPX500": "/markets/stocks/sp500",
  "FOREXCOM-NSXUSD": "/markets/stocks/nasdaq100",
  "FOREXCOM-NAS100": "/markets/stocks/nasdaq100",
  "FOREXCOM-DJI": "/markets/stocks/sp500",
  "FOREXCOM-US30": "/markets/stocks/sp500",
  "INDEX-NKY": "/markets/stocks",
  "INDEX-DEU40": "/markets/stocks",
  "FOREXCOM-UKXGBP": "/markets/stocks/ftse100",
  "FOREXCOM-UK100": "/markets/stocks/ftse100",
  "TSX-TSX": "/markets/stocks/tsx60",
  "BSE-SENSEX": "/markets/stocks",
  // Commodities (futures)
  "COMEX-GC1!": "/markets/commodities/gold",
  "COMEX-SI1!": "/markets/commodities/silver",
  "NYMEX-CL1!": "/markets/commodities/crude-oil",
  "NYMEX-NG1!": "/markets/commodities/natural-gas",
  "COMEX-HG1!": "/markets/commodities/copper",
  "CBOT-ZC1!": "/markets/commodities/corn",
  "CBOT-ZW1!": "/markets/commodities/wheat",
  // Commodities (TVC spot)
  "TVC-GOLD": "/markets/commodities/gold",
  "TVC-SILVER": "/markets/commodities/silver",
  "TVC-USOIL": "/markets/commodities/crude-oil",
  // Commodities (Pepperstone CFD)
  "PEPPERSTONE-NATGAS": "/markets/commodities/natural-gas",
  "PEPPERSTONE-COPPER": "/markets/commodities/copper",
  "PEPPERSTONE-CORN": "/markets/commodities/corn",
  "PEPPERSTONE-WHEAT": "/markets/commodities/wheat",
  // Crypto
  "BINANCE-BTCUSDT": "/markets/crypto/btcusd",
  "BINANCE-ETHUSDT": "/markets/crypto/ethusd",
  "BINANCE-SOLUSDT": "/markets/crypto/solusd",
  "BINANCE-XRPUSDT": "/markets/crypto/xrpusd",
  "BINANCE-DOGEUSDT": "/markets/crypto/dogeusd",
  "BINANCE-ADAUSDT": "/markets/crypto/adausd",
  "BITSTAMP-BTCUSD": "/markets/crypto/btcusd",
  "BITSTAMP-ETHUSD": "/markets/crypto/ethusd",
  // Forex
  "FX-EURUSD": "/markets/currencies/eurusd",
  "FX-GBPUSD": "/markets/currencies/gbpusd",
  "FX-USDJPY": "/markets/currencies/usdjpy",
  "FX-USDCAD": "/markets/currencies/usdcad",
  "FX-AUDUSD": "/markets/currencies/audusd",
  "FX-USDCHF": "/markets/currencies/usdchf",
};

function tickerToSotw(tvticker: string): string {
  // Direct lookup
  if (TV_TO_SOTW[tvticker]) return TV_TO_SOTW[tvticker];

  // Try without URL encoding artifacts
  const cleaned = decodeURIComponent(tvticker);
  if (TV_TO_SOTW[cleaned]) return TV_TO_SOTW[cleaned];

  // Fallback: try to parse exchange-symbol format
  const parts = cleaned.split('-');
  if (parts.length >= 2) {
    const exchange = parts[0].toUpperCase();
    const symbol = parts.slice(1).join('-');

    // Crypto
    if (['BINANCE', 'COINBASE', 'BITSTAMP'].includes(exchange)) {
      const pair = symbol.replace('USDT', 'usd').replace(/USD$/, 'usd').toLowerCase();
      return `/markets/crypto/${pair}`;
    }
    // Forex
    if (exchange === 'FX') {
      return `/markets/currencies/${symbol.toLowerCase()}`;
    }
    // Commodity futures
    const commodityMap: Record<string, string> = {
      GC: 'gold', SI: 'silver', CL: 'crude-oil', NG: 'natural-gas',
      HG: 'copper', ZC: 'corn', ZW: 'wheat', ZS: 'soybeans',
    };
    const prefix = symbol.replace(/\d.*/, '').replace('!', '');
    if (commodityMap[prefix]) return `/markets/commodities/${commodityMap[prefix]}`;

    // Stock ticker
    return `/markets/stocks/${symbol}`;
  }

  // Last resort
  return `/markets/stocks/${tvticker}`;
}

export default function RedirectPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tvticker = (params.tvticker as string) || '';

  useEffect(() => {
    // TradingView sends the actual symbol in ?tvwidgetsymbol=EXCHANGE:SYMBOL
    // The path param {tvticker} may be literal if TradingView doesn't replace it
    const querySymbol = searchParams.get('tvwidgetsymbol');
    let key = tvticker;
    if (querySymbol) {
      // Convert EXCHANGE:SYMBOL to EXCHANGE-SYMBOL for lookup
      key = querySymbol.replace(':', '-');
    }
    const target = tickerToSotw(key);
    router.replace(target);
  }, [tvticker, searchParams, router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0d1b2a', color: '#fff' }}>
      <p>Redirecting...</p>
    </div>
  );
}
