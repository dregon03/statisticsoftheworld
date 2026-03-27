#!/usr/bin/env python3
"""
Fetch live/delayed market quotes from Yahoo Finance and write to Supabase.

Two modes:
  --once     Single fetch (default for daily ETL)
  --loop     Continuous loop: fetch every 30 seconds until market close
             Used by live-quotes.yml during market hours (~6.5 hour run)

Fetches current price, previous close, day change for:
  - 25 stock market indices
  - 11 commodities
  - 10 FX pairs
"""

import argparse
import datetime
import json
import os
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
    # Index futures (trade nearly 24h, Sun 6PM - Fri 5PM ET)
    "ES=F": ("YF.FUT.SP500", "S&P 500 Futures"),
    "NQ=F": ("YF.FUT.NASDAQ", "Nasdaq 100 Futures"),
    "YM=F": ("YF.FUT.DOW", "Dow Futures"),
    "RTY=F": ("YF.FUT.RUSSELL", "Russell 2000 Futures"),
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
    # Commodities — Precious Metals
    "GC=F": ("YF.GOLD", "Gold"),
    "SI=F": ("YF.SILVER", "Silver"),
    "PL=F": ("YF.PLATINUM", "Platinum"),
    "PA=F": ("YF.PALLADIUM", "Palladium"),
    # Commodities — Industrial Metals
    "HG=F": ("YF.COPPER", "Copper"),
    "ALI=F": ("YF.ALUMINUM", "Aluminum"),
    "HRC=F": ("YF.STEEL", "Steel HRC"),
    "TIO=F": ("YF.IRON_ORE", "Iron Ore"),
    # Commodities — LME Proxy ETCs (London, track LME spot prices)
    "NICK.L": ("YF.NICKEL_ETC", "Nickel ETC"),
    "ZINC.L": ("YF.ZINC_ETC", "Zinc ETC"),
    # Commodities — Energy
    "CL=F": ("YF.CRUDE_OIL", "WTI Crude"),
    "BZ=F": ("YF.BRENT", "Brent Crude"),
    "NG=F": ("YF.NATGAS", "Natural Gas"),
    "RB=F": ("YF.GASOLINE", "Gasoline RBOB"),
    "HO=F": ("YF.HEATING_OIL", "Heating Oil"),
    # Commodities — Grains
    "ZW=F": ("YF.WHEAT", "Wheat"),
    "KE=F": ("YF.WHEAT_KC", "KC HRW Wheat"),
    "ZC=F": ("YF.CORN", "Corn"),
    "ZS=F": ("YF.SOYBEANS", "Soybeans"),
    "ZM=F": ("YF.SOYBEAN_MEAL", "Soybean Meal"),
    "ZL=F": ("YF.SOYBEAN_OIL", "Soybean Oil"),
    "ZO=F": ("YF.OATS", "Oats"),
    "ZR=F": ("YF.RICE", "Rough Rice"),
    # Commodities — Softs
    "KC=F": ("YF.COFFEE", "Coffee"),
    "CC=F": ("YF.COCOA", "Cocoa"),
    "SB=F": ("YF.SUGAR", "Sugar"),
    "CT=F": ("YF.COTTON", "Cotton"),
    "OJ=F": ("YF.OJ", "Orange Juice"),
    "LBR=F": ("YF.LUMBER", "Lumber"),
    # Commodities — Livestock
    "LE=F": ("YF.LIVE_CATTLE", "Live Cattle"),
    "HE=F": ("YF.LEAN_HOGS", "Lean Hogs"),
    "GF=F": ("YF.FEEDER_CATTLE", "Feeder Cattle"),
    # Commodities — Dairy
    "DC=F": ("YF.MILK", "Milk Class III"),
    "CB=F": ("YF.BUTTER", "Butter"),
    "CSC=F": ("YF.CHEESE", "Cheese"),
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


def fetch_once(conn):
    """Single fetch of all quotes."""
    cur = conn.cursor()
    count = 0
    errors = 0

    for symbol in SYMBOLS:
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

        except Exception as e:
            errors += 1

    conn.commit()
    return count, errors


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--loop", action="store_true", help="Loop every 30s until market close (8 PM UTC)")
    parser.add_argument("--interval", type=int, default=30, help="Seconds between fetches in loop mode")
    args = parser.parse_args()

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

    if not args.loop:
        # Single fetch
        count, errors = fetch_once(conn)
        print(f"Updated {count} quotes ({errors} errors)")
        conn.close()
        return

    # Loop mode: fetch every 30 seconds for up to 5.5 hours
    # (stays under GHA's 6-hour job limit)
    # Three cron triggers cover the full day: pre-market, core, after-hours
    print(f"=== Live quotes loop (every {args.interval}s) ===", flush=True)
    iteration = 0
    max_runtime_seconds = 5.5 * 3600  # 5 hours 30 minutes
    start_time = time.time()

    while True:
        elapsed_total = time.time() - start_time
        if elapsed_total >= max_runtime_seconds:
            print(f"\nMax runtime reached ({elapsed_total/3600:.1f}h). Stopping.", flush=True)
            break

        now = datetime.datetime.utcnow()
        start = time.time()
        try:
            count, errors = fetch_once(conn)
            iteration += 1
            elapsed = time.time() - start
            print(f"  [{now.strftime('%H:%M:%S')}] #{iteration}: {count} quotes in {elapsed:.1f}s", flush=True)
        except Exception as e:
            print(f"  [{now.strftime('%H:%M:%S')}] Error: {e}", flush=True)
            # Reconnect on DB errors
            try:
                conn.close()
            except Exception:
                pass
            time.sleep(5)
            try:
                conn = psycopg2.connect(**DB)
                cur = conn.cursor()
            except Exception as e2:
                print(f"  Reconnect failed: {e2}", flush=True)
                time.sleep(30)
                continue

        # Sleep remaining time to hit the interval
        elapsed = time.time() - start
        sleep_time = max(0, args.interval - elapsed)
        if sleep_time > 0:
            time.sleep(sleep_time)

    conn.close()
    print(f"=== Done: {iteration} iterations ===", flush=True)


if __name__ == "__main__":
    main()
