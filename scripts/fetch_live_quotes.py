#!/usr/bin/env python3
"""
Fetch live/delayed market quotes from Yahoo Finance and write to Supabase.
Runs every 15 minutes via cron or on-demand. ~30 seconds total.

Fetches current price, previous close, day change for:
  - 38 stock market indices
  - 15 commodities
  - 20 FX pairs
"""

import json
import os
import socket
import time
import psycopg2

try:
    import yfinance as yf
except ImportError:
    print("ERROR: pip install yfinance")
    exit(1)

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "db.seyrycaldytfjvvkqopu.supabase.co")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")
DB = dict(
    host=DB_HOST, port=int(os.environ.get("SUPABASE_DB_PORT", "5432")), dbname="postgres", user=os.environ.get("SUPABASE_DB_USER", "postgres"),
    password=DB_PASS, sslmode="require",
)

QUOTES_TABLE = "sotw_live_quotes"

# All symbols to fetch
SYMBOLS = {
    # Stock indices
    "^GSPC": ("YF.IDX.USA", "S&P 500"),
    "^GSPTSE": ("YF.IDX.CAN", "S&P/TSX"),
    "^BVSP": ("YF.IDX.BRA", "Bovespa"),
    "^MXX": ("YF.IDX.MEX", "IPC Mexico"),
    "^MERV": ("YF.IDX.ARG", "MERVAL"),
    "^FTSE": ("YF.IDX.GBR", "FTSE 100"),
    "^GDAXI": ("YF.IDX.DEU", "DAX"),
    "^FCHI": ("YF.IDX.FRA", "CAC 40"),
    "^AEX": ("YF.IDX.NLD", "AEX"),
    "^IBEX": ("YF.IDX.ESP", "IBEX 35"),
    "FTSEMIB.MI": ("YF.IDX.ITA", "FTSE MIB"),
    "^SSMI": ("YF.IDX.CHE", "SMI"),
    "^N225": ("YF.IDX.JPN", "Nikkei 225"),
    "^HSI": ("YF.IDX.HKG", "Hang Seng"),
    "000001.SS": ("YF.IDX.CHN", "Shanghai"),
    "^KS11": ("YF.IDX.KOR", "KOSPI"),
    "^BSESN": ("YF.IDX.IND", "Sensex"),
    "^AXJO": ("YF.IDX.AUS", "ASX 200"),
    "^NZ50": ("YF.IDX.NZL", "NZX 50"),
    "^STI": ("YF.IDX.SGP", "STI"),
    "^JKSE": ("YF.IDX.IDN", "Jakarta"),
    "^KLSE": ("YF.IDX.MYS", "KLCI"),
    "^TA125.TA": ("YF.IDX.ISR", "TA-125"),
    "^TASI.SR": ("YF.IDX.SAU", "Tadawul"),
    "^J203.JO": ("YF.IDX.ZAF", "JSE"),
    # Commodities
    "GC=F": ("YF.GOLD", "Gold"),
    "SI=F": ("YF.SILVER", "Silver"),
    "CL=F": ("YF.CRUDE_OIL", "WTI Crude"),
    "BZ=F": ("YF.BRENT", "Brent Crude"),
    "NG=F": ("YF.NATGAS", "Natural Gas"),
    "HG=F": ("YF.COPPER", "Copper"),
    "PL=F": ("YF.PLATINUM", "Platinum"),
    "ZW=F": ("YF.WHEAT", "Wheat"),
    "ZC=F": ("YF.CORN", "Corn"),
    "KC=F": ("YF.COFFEE", "Coffee"),
    "CC=F": ("YF.COCOA", "Cocoa"),
    # Forex
    "EURUSD=X": ("YF.FX.EUR", "EUR/USD"),
    "GBPUSD=X": ("YF.FX.GBP", "GBP/USD"),
    "USDJPY=X": ("YF.FX.JPY", "USD/JPY"),
    "USDCAD=X": ("YF.FX.CAD", "USD/CAD"),
    "AUDUSD=X": ("YF.FX.AUD", "AUD/USD"),
    "USDCHF=X": ("YF.FX.CHF", "USD/CHF"),
    "USDCNY=X": ("YF.FX.CNY", "USD/CNY"),
    "USDINR=X": ("YF.FX.INR", "USD/INR"),
    "USDKRW=X": ("YF.FX.KRW", "USD/KRW"),
    "USDBRL=X": ("YF.FX.BRL", "USD/BRL"),
}


def main():
    conn = psycopg2.connect(**DB)
    cur = conn.cursor()

    # Create table if not exists
    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS {QUOTES_TABLE} (
            id TEXT PRIMARY KEY,
            label TEXT,
            price DOUBLE PRECISION,
            previous_close DOUBLE PRECISION,
            change DOUBLE PRECISION,
            change_pct DOUBLE PRECISION,
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)
    conn.commit()

    count = 0
    errors = 0

    # Batch fetch using yfinance download (faster than individual tickers)
    symbols = list(SYMBOLS.keys())

    for symbol in symbols:
        sotw_id, label = SYMBOLS[symbol]
        try:
            t = yf.Ticker(symbol)
            info = t.fast_info
            price = float(info.get("lastPrice", 0))
            prev = float(info.get("previousClose", 0))

            if price <= 0:
                continue

            change = price - prev
            change_pct = ((price / prev) - 1) * 100 if prev > 0 else 0

            cur.execute(f"""
                INSERT INTO {QUOTES_TABLE} (id, label, price, previous_close, change, change_pct, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, NOW())
                ON CONFLICT (id) DO UPDATE SET
                    price = EXCLUDED.price,
                    previous_close = EXCLUDED.previous_close,
                    change = EXCLUDED.change,
                    change_pct = EXCLUDED.change_pct,
                    updated_at = NOW()
            """, (sotw_id, label, round(price, 4), round(prev, 4), round(change, 4), round(change_pct, 4)))

            count += 1
            sign = "+" if change >= 0 else ""
            print(f"  {label:15s} {price:>12.2f}  {sign}{change:.2f} ({sign}{change_pct:.2f}%)")

        except Exception as e:
            errors += 1
            print(f"  SKIP {symbol}: {e}")

    conn.commit()
    conn.close()
    print(f"\nUpdated {count} quotes ({errors} errors)")


if __name__ == "__main__":
    main()
