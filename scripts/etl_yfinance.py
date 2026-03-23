#!/usr/bin/env python3
"""
Yahoo Finance ETL for Statistics of the World.
Uses yfinance library — no API key, no signup, free.

Fetches:
  - Stock market indices for 40+ countries (20+ years history)
  - Major commodity prices (gold, silver, oil, gas, copper)
  - Key FX pairs vs USD

Usage:
  python3 scripts/etl_yfinance.py                  # All
  python3 scripts/etl_yfinance.py --source indices  # Stock indices only
  python3 scripts/etl_yfinance.py --source commodities
  python3 scripts/etl_yfinance.py --source forex
"""

import argparse
import os
import socket
import time
import datetime
import psycopg2

try:
    import yfinance as yf
except ImportError:
    print("ERROR: pip install yfinance")
    exit(1)

# ============================================================
# CONFIG
# ============================================================

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "db.seyrycaldytfjvvkqopu.supabase.co")
# Force IPv4 (GitHub Actions runners fail on IPv6)
try:
    DB_HOST = socket.getaddrinfo(DB_HOST, 5432, socket.AF_INET)[0][4][0]
except Exception:
    pass
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")

DB = dict(
    host=DB_HOST, port=5432, dbname="postgres", user="postgres",
    password=DB_PASS, sslmode="require",
    options="-c statement_timeout=0",
)

HISTORY_TABLE = "sotw_indicators_history"
LATEST_TABLE = "sotw_indicators"
META_TABLE = "sotw_indicator_meta"

# ============================================================
# STOCK MARKET INDICES — symbol -> (country_id, label)
# ============================================================

INDICES = {
    # Americas (one primary index per country)
    "^GSPC":    ("USA", "S&P 500"),
    "^GSPTSE":  ("CAN", "S&P/TSX Composite"),
    "^BVSP":    ("BRA", "Bovespa"),
    "^MXX":     ("MEX", "IPC Mexico"),
    "^MERV":    ("ARG", "MERVAL"),
    "^IPSA":    ("CHL", "S&P CLX IPSA"),

    # Europe
    "^FTSE":    ("GBR", "FTSE 100"),
    "^GDAXI":   ("DEU", "DAX"),
    "^FCHI":    ("FRA", "CAC 40"),
    "^AEX":     ("NLD", "AEX (Amsterdam)"),
    "^IBEX":    ("ESP", "IBEX 35"),
    "FTSEMIB.MI":("ITA", "FTSE MIB"),
    "^SSMI":    ("CHE", "Swiss Market Index"),
    "^OMX":     ("SWE", "OMX Stockholm 30"),
    "^OMXC25":  ("DNK", "OMX Copenhagen 25"),
    "^OMXH25":  ("FIN", "OMX Helsinki 25"),
    "OSEAX.OL": ("NOR", "Oslo All Share"),
    "^ATX":     ("AUT", "ATX (Vienna)"),
    "^BFX":     ("BEL", "BEL 20"),
    "PSI20.LS": ("PRT", "PSI 20"),
    "^ISEQ":    ("IRL", "ISEQ Overall"),
    "WIG20.WA": ("POL", "WIG 20"),

    # Asia-Pacific
    "^N225":    ("JPN", "Nikkei 225"),
    "^HSI":     ("HKG", "Hang Seng"),
    "000001.SS":("CHN", "Shanghai Composite"),
    "^KS11":    ("KOR", "KOSPI"),
    "^TWII":    ("TWN", "TAIEX"),
    "^BSESN":   ("IND", "BSE Sensex"),
    "^AXJO":    ("AUS", "S&P/ASX 200"),
    "^NZ50":    ("NZL", "NZX 50"),
    "^STI":     ("SGP", "Straits Times Index"),
    "^JKSE":    ("IDN", "Jakarta Composite"),
    "^SET.BK":  ("THA", "SET Index"),
    "^KLSE":    ("MYS", "KLCI"),
    "PSEI.PS":  ("PHL", "PSEi"),

    # Middle East & Africa
    "^TA125.TA":("ISR", "TA-125"),
    "^TASI.SR": ("SAU", "Tadawul All Share"),
    "^J203.JO": ("ZAF", "JSE All Share"),
    "^CASE30":  ("EGY", "EGX 30"),
}

# ============================================================
# COMMODITIES
# ============================================================

COMMODITIES = {
    "GC=F":  ("YF.GOLD", "Gold (USD/troy oz)"),
    "SI=F":  ("YF.SILVER", "Silver (USD/troy oz)"),
    "CL=F":  ("YF.CRUDE_OIL", "WTI Crude Oil (USD/barrel)"),
    "BZ=F":  ("YF.BRENT", "Brent Crude Oil (USD/barrel)"),
    "NG=F":  ("YF.NATGAS", "Natural Gas (USD/MMBtu)"),
    "HG=F":  ("YF.COPPER", "Copper (USD/lb)"),
    "PL=F":  ("YF.PLATINUM", "Platinum (USD/troy oz)"),
    "PA=F":  ("YF.PALLADIUM", "Palladium (USD/troy oz)"),
    "ZW=F":  ("YF.WHEAT", "Wheat (USD/bushel)"),
    "ZC=F":  ("YF.CORN", "Corn (USD/bushel)"),
    "ZS=F":  ("YF.SOYBEANS", "Soybeans (USD/bushel)"),
    "KC=F":  ("YF.COFFEE", "Coffee (USD/lb)"),
    "CT=F":  ("YF.COTTON", "Cotton (USD/lb)"),
    "SB=F":  ("YF.SUGAR", "Sugar (USD/lb)"),
    "CC=F":  ("YF.COCOA", "Cocoa (USD/tonne)"),
}

# ============================================================
# FOREX (vs USD)
# ============================================================

FOREX = {
    "EURUSD=X":  ("YF.FX.EUR", "EUR/USD Exchange Rate", ["DEU", "FRA", "ITA", "ESP", "NLD", "BEL", "AUT", "FIN", "IRL", "PRT", "GRC"]),
    "GBPUSD=X":  ("YF.FX.GBP", "GBP/USD Exchange Rate", ["GBR"]),
    "USDJPY=X":  ("YF.FX.JPY", "USD/JPY Exchange Rate", ["JPN"]),
    "USDCAD=X":  ("YF.FX.CAD", "USD/CAD Exchange Rate", ["CAN"]),
    "AUDUSD=X":  ("YF.FX.AUD", "AUD/USD Exchange Rate", ["AUS"]),
    "USDCHF=X":  ("YF.FX.CHF", "USD/CHF Exchange Rate", ["CHE"]),
    "USDCNY=X":  ("YF.FX.CNY", "USD/CNY Exchange Rate", ["CHN"]),
    "USDINR=X":  ("YF.FX.INR", "USD/INR Exchange Rate", ["IND"]),
    "USDKRW=X":  ("YF.FX.KRW", "USD/KRW Exchange Rate", ["KOR"]),
    "USDBRL=X":  ("YF.FX.BRL", "USD/BRL Exchange Rate", ["BRA"]),
    "USDMXN=X":  ("YF.FX.MXN", "USD/MXN Exchange Rate", ["MEX"]),
    "USDZAR=X":  ("YF.FX.ZAR", "USD/ZAR Exchange Rate", ["ZAF"]),
    "USDSEK=X":  ("YF.FX.SEK", "USD/SEK Exchange Rate", ["SWE"]),
    "USDNOK=X":  ("YF.FX.NOK", "USD/NOK Exchange Rate", ["NOR"]),
    "USDSGD=X":  ("YF.FX.SGD", "USD/SGD Exchange Rate", ["SGP"]),
    "USDIDR=X":  ("YF.FX.IDR", "USD/IDR Exchange Rate", ["IDN"]),
    "USDTRY=X":  ("YF.FX.TRY", "USD/TRY Exchange Rate", ["TUR"]),
    "USDPLN=X":  ("YF.FX.PLN", "USD/PLN Exchange Rate", ["POL"]),
    "USDHKD=X":  ("YF.FX.HKD", "USD/HKD Exchange Rate", ["HKG"]),
    "USDTHB=X":  ("YF.FX.THB", "USD/THB Exchange Rate", ["THA"]),
}

# ============================================================
# HELPERS
# ============================================================

def upsert_history(cur, ind_id, country_id, value, year, source="yfinance"):
    cur.execute(f"""
        INSERT INTO {HISTORY_TABLE} (id, country_id, value, year, source)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (id, country_id, year) DO UPDATE SET
            value = EXCLUDED.value, source = EXCLUDED.source, updated_at = NOW()
    """, (ind_id, country_id, value, year, source))


def upsert_latest(cur, ind_id, country_id, value, year, source="yfinance"):
    cur.execute(f"""
        INSERT INTO {LATEST_TABLE} (id, country_id, value, year, source)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (id, country_id) DO UPDATE SET
            value = EXCLUDED.value, year = EXCLUDED.year,
            source = EXCLUDED.source, updated_at = NOW()
    """, (ind_id, country_id, value, year, source))


def upsert_meta(cur, ind_id, description, source_url, unit=None):
    cur.execute(f"""
        INSERT INTO {META_TABLE} (id, description, source_name, source_url, unit)
        VALUES (%s, %s, 'Yahoo Finance', %s, %s)
        ON CONFLICT (id) DO UPDATE SET
            description = EXCLUDED.description,
            source_name = EXCLUDED.source_name,
            source_url = EXCLUDED.source_url,
            unit = COALESCE(EXCLUDED.unit, {META_TABLE}.unit),
            last_updated = NOW()
    """, (ind_id, description, source_url, unit))


def get_annual_close(symbol, start_year=2000):
    """Fetch annual closing prices from Yahoo Finance."""
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(start=f"{start_year}-01-01", interval="1mo")
        if hist.empty:
            return {}

        # Get December close (or last available month) for each year
        yearly = {}
        for date, row in hist.iterrows():
            yr = date.year
            yearly[yr] = float(row["Close"])  # Convert numpy to native Python float

        return yearly
    except Exception:
        return {}


# ============================================================
# ETL: STOCK INDICES
# ============================================================

def etl_indices(cur, valid_countries):
    print("\n=== Yahoo Finance: Stock Indices ===")
    total = 0

    for symbol, (country_id, label) in INDICES.items():
        if country_id not in valid_countries:
            continue
        try:
            yearly = get_annual_close(symbol)
            if not yearly:
                continue

            sotw_id = f"YF.IDX.{country_id}"
            count = 0
            for yr, val in yearly.items():
                upsert_history(cur, sotw_id, country_id, round(val, 2), yr)
                count += 1

            # Latest
            if yearly:
                latest_yr = max(yearly.keys())
                upsert_latest(cur, sotw_id, country_id, round(yearly[latest_yr], 2), latest_yr)

            cur.connection.commit()
            upsert_meta(cur, sotw_id, f"{label} — stock market index, annual closing value.", f"https://finance.yahoo.com/quote/{symbol}", "Index points")
            cur.connection.commit()
            total += count
            print(f"  {label} ({country_id}): {count} years")

        except Exception as e:
            cur.connection.rollback()
            print(f"  SKIP {symbol} ({country_id}): {e}")
        time.sleep(0.3)

    print(f"  Stock indices total: {total} data points")
    return total


# ============================================================
# ETL: COMMODITIES
# ============================================================

def etl_commodities(cur):
    print("\n=== Yahoo Finance: Commodities ===")
    total = 0

    for symbol, (sotw_id, label) in COMMODITIES.items():
        try:
            yearly = get_annual_close(symbol)
            if not yearly:
                continue

            count = 0
            for yr, val in yearly.items():
                upsert_history(cur, sotw_id, "WLD", round(val, 2), yr)
                count += 1

            if yearly:
                latest_yr = max(yearly.keys())
                upsert_latest(cur, sotw_id, "WLD", round(yearly[latest_yr], 2), latest_yr)

            cur.connection.commit()
            upsert_meta(cur, sotw_id, f"{label} — annual average commodity price.", f"https://finance.yahoo.com/quote/{symbol}", "USD")
            cur.connection.commit()
            total += count
            print(f"  {label}: {count} years")

        except Exception as e:
            cur.connection.rollback()
            print(f"  SKIP {symbol}: {e}")
        time.sleep(0.3)

    print(f"  Commodities total: {total} data points")
    return total


# ============================================================
# ETL: FOREX
# ============================================================

def etl_forex(cur, valid_countries):
    print("\n=== Yahoo Finance: Forex ===")
    total = 0

    for symbol, (sotw_id, label, countries) in FOREX.items():
        try:
            yearly = get_annual_close(symbol)
            if not yearly:
                continue

            count = 0
            for country_id in countries:
                if country_id not in valid_countries:
                    continue
                for yr, val in yearly.items():
                    upsert_history(cur, sotw_id, country_id, round(val, 4), yr)
                    count += 1
                if yearly:
                    latest_yr = max(yearly.keys())
                    upsert_latest(cur, sotw_id, country_id, round(yearly[latest_yr], 4), latest_yr)

            cur.connection.commit()
            upsert_meta(cur, sotw_id, f"{label} — annual average exchange rate.", f"https://finance.yahoo.com/quote/{symbol}", "Exchange rate")
            cur.connection.commit()
            total += count
            print(f"  {label}: {count} data points")

        except Exception as e:
            cur.connection.rollback()
            print(f"  SKIP {symbol}: {e}")
        time.sleep(0.3)

    print(f"  Forex total: {total} data points")
    return total


# ============================================================
# MAIN
# ============================================================

def main():
    parser = argparse.ArgumentParser(description="SOTW Yahoo Finance ETL")
    parser.add_argument("--source", choices=["indices", "commodities", "forex", "all"], default="all")
    args = parser.parse_args()

    conn = psycopg2.connect(**DB)
    cur = conn.cursor()

    # Get valid countries
    cur.execute("SELECT id FROM sotw_countries")
    valid_countries = {r[0] for r in cur.fetchall()}
    print(f"Valid countries: {len(valid_countries)}")

    total = 0
    start = time.time()

    if args.source in ("indices", "all"):
        total += etl_indices(cur, valid_countries)

    if args.source in ("commodities", "all"):
        total += etl_commodities(cur)

    if args.source in ("forex", "all"):
        total += etl_forex(cur, valid_countries)

    elapsed = time.time() - start

    # Stats
    cur.execute(f"SELECT COUNT(*) FROM {HISTORY_TABLE}")
    total_history = cur.fetchone()[0]
    cur.execute(f"SELECT COUNT(DISTINCT id) FROM {HISTORY_TABLE}")
    unique = cur.fetchone()[0]
    cur.execute(f"SELECT COUNT(DISTINCT source) FROM {HISTORY_TABLE}")
    sources = cur.fetchone()[0]

    print(f"\n{'='*50}")
    print(f"Yahoo Finance ETL Complete")
    print(f"  Rows upserted this run: {total}")
    print(f"  Total history rows: {total_history}")
    print(f"  Unique indicators: {unique}")
    print(f"  Data sources: {sources}")
    print(f"  Elapsed: {elapsed:.0f}s ({elapsed/60:.1f}m)")
    print(f"{'='*50}")

    conn.close()


if __name__ == "__main__":
    main()
