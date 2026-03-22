#!/usr/bin/env python3
"""
Financial & extended data ETL for Statistics of the World.
Fetches data from free APIs: FRED, OECD, ECB, Alpha Vantage, ExchangeRate-API.

Usage:
  python3 scripts/etl_financial.py --source fred
  python3 scripts/etl_financial.py --source oecd
  python3 scripts/etl_financial.py --source ecb
  python3 scripts/etl_financial.py --source alphavantage
  python3 scripts/etl_financial.py --source exchangerate
  python3 scripts/etl_financial.py --source all

All APIs are free. No scraping. No paid tiers required.
"""

import argparse
import json
import os
import sys
import time
import datetime
import psycopg2
import urllib.request
import urllib.parse

# ============================================================
# CONFIG
# ============================================================

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "db.seyrycaldytfjvvkqopu.supabase.co")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")

DB = dict(
    host=DB_HOST, port=5432, dbname="postgres", user="postgres",
    password=DB_PASS, sslmode="require",
    options="-c statement_timeout=0",
)

# API Keys (free tier)
FRED_API_KEY = os.environ.get("FRED_API_KEY", "")  # Get free key at fred.stlouisfed.org
ALPHA_VANTAGE_KEY = os.environ.get("ALPHA_VANTAGE_KEY", "")  # Get free key at alphavantage.co
FINNHUB_KEY = os.environ.get("FINNHUB_KEY", "")  # Get free key at finnhub.io/register
FMP_KEY = os.environ.get("FMP_KEY", "")  # Get free key at financialmodelingprep.com

HISTORY_TABLE = "sotw_indicators_history"
LATEST_TABLE = "sotw_indicators"
META_TABLE = "sotw_indicator_meta"

# ============================================================
# HELPERS
# ============================================================

def fetch_json(url, retries=3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": "Mozilla/5.0 (StatisticsOfTheWorld ETL)",
                "Accept": "application/json",
            })
            with urllib.request.urlopen(req, timeout=60) as resp:
                return json.loads(resp.read())
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
            else:
                raise


def upsert_history(cur, ind_id, country_id, value, year, source):
    cur.execute(f"""
        INSERT INTO {HISTORY_TABLE} (id, country_id, value, year, source)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (id, country_id, year) DO UPDATE SET
            value = EXCLUDED.value, source = EXCLUDED.source, updated_at = NOW()
    """, (ind_id, country_id, value, year, source))


def upsert_latest(cur, ind_id, country_id, value, year, source):
    cur.execute(f"""
        INSERT INTO {LATEST_TABLE} (id, country_id, value, year, source)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (id, country_id) DO UPDATE SET
            value = EXCLUDED.value, year = EXCLUDED.year,
            source = EXCLUDED.source, updated_at = NOW()
    """, (ind_id, country_id, value, year, source))


def upsert_meta(cur, ind_id, description, source_name, source_url, unit=None, category=None):
    cur.execute(f"""
        INSERT INTO {META_TABLE} (id, description, source_name, source_url, unit)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (id) DO UPDATE SET
            description = COALESCE(EXCLUDED.description, {META_TABLE}.description),
            source_name = EXCLUDED.source_name,
            source_url = EXCLUDED.source_url,
            unit = COALESCE(EXCLUDED.unit, {META_TABLE}.unit),
            last_updated = NOW()
    """, (ind_id, description, source_name, source_url, unit))


# ============================================================
# FRED SERIES MAPPING
# country_id -> {sotw_indicator_id -> fred_series_id}
# ============================================================

# 10-Year Government Bond Yields (OECD data in FRED)
# Pattern: IRLTLT01{CC}M156N where CC = 2-letter country code
FRED_BOND_YIELDS_10Y = {
    "USA": "IRLTLT01USM156N", "GBR": "IRLTLT01GBM156N", "DEU": "IRLTLT01DEM156N",
    "FRA": "IRLTLT01FRM156N", "JPN": "IRLTLT01JPM156N", "CAN": "IRLTLT01CAM156N",
    "AUS": "IRLTLT01AUM156N", "ITA": "IRLTLT01ITM156N", "ESP": "IRLTLT01ESM156N",
    "KOR": "IRLTLT01KRM156N", "NLD": "IRLTLT01NLM156N", "BEL": "IRLTLT01BEM156N",
    "AUT": "IRLTLT01ATM156N", "CHE": "IRLTLT01CHM156N", "SWE": "IRLTLT01SEM156N",
    "NOR": "IRLTLT01NOM156N", "DNK": "IRLTLT01DKM156N", "FIN": "IRLTLT01FIM156N",
    "IRL": "IRLTLT01IEM156N", "PRT": "IRLTLT01PTM156N", "GRC": "IRLTLT01GRM156N",
    "POL": "IRLTLT01PLM156N", "CZE": "IRLTLT01CZM156N", "HUN": "IRLTLT01HUM156N",
    "NZL": "IRLTLT01NZM156N", "ZAF": "IRLTLT01ZAM156N", "MEX": "IRLTLT01MXM156N",
    "CHL": "IRLTLT01CLM156N", "COL": "IRLTLT01COM156N", "ISR": "IRLTLT01ILM156N",
    "TUR": "IRLTLT01TRM156N", "SVK": "IRLTLT01SKM156N", "SVN": "IRLTLT01SIM156N",
    "LVA": "IRLTLT01LVM156N", "LTU": "IRLTLT01LTM156N", "EST": "IRLTLT01EEM156N",
    "LUX": "IRLTLT01LUM156N", "ISL": "IRLTLT01ISM156N", "IND": "IRLTLT01INM156N",
    "IDN": "IRLTLT01IDM156N", "RUS": "IRLTLT01RUM156N", "CHN": "IRLTLT01CNM156N",
    "BRA": "IRLTLT01BRM156N", "CRI": "IRLTLT01CRM156N",
}

# Central bank policy rates
FRED_CENTRAL_BANK_RATES = {
    "USA": "FEDFUNDS",
    "GBR": "BOERUKM",
    "EUR": "ECBDFR",       # Euro area — map to all eurozone countries
    "JPN": "IRSTCI01JPM156N",
    "CAN": "IRSTCI01CAM156N",
    "AUS": "IRSTCI01AUM156N",
    "CHE": "IRSTCI01CHM156N",
    "SWE": "IRSTCI01SEM156N",
    "NOR": "IRSTCI01NOM156N",
    "NZL": "IRSTCI01NZM156N",
    "KOR": "IRSTCI01KRM156N",
    "MEX": "IRSTCI01MXM156N",
    "BRA": "IRSTCI01BRM156N",
    "ZAF": "IRSTCI01ZAM156N",
    "IND": "IRSTCI01INM156N",
    "IDN": "IRSTCI01IDM156N",
    "TUR": "IRSTCI01TRM156N",
    "CHL": "IRSTCI01CLM156N",
    "COL": "IRSTCI01COM156N",
    "ISR": "IRSTCI01ILM156N",
    "POL": "IRSTCI01PLM156N",
    "CZE": "IRSTCI01CZM156N",
    "HUN": "IRSTCI01HUM156N",
    "RUS": "IRSTCI01RUM156N",
    "CHN": "IRSTCI01CNM156N",
}

# Eurozone countries that share ECB rate
EUROZONE = [
    "DEU", "FRA", "ITA", "ESP", "NLD", "BEL", "AUT", "FIN", "IRL", "PRT",
    "GRC", "SVK", "SVN", "LVA", "LTU", "EST", "LUX", "MLT", "CYP", "HRV",
]

# US-specific series (high-value, unique to FRED)
FRED_US_SERIES = {
    "FRED.DGS10": ("DGS10", "10-Year Treasury Yield", "percent"),
    "FRED.DGS2": ("DGS2", "2-Year Treasury Yield", "percent"),
    "FRED.T10Y2Y": ("T10Y2Y", "10Y-2Y Treasury Spread", "percent"),
    "FRED.FEDFUNDS": ("FEDFUNDS", "Federal Funds Rate", "percent"),
    "FRED.CPIAUCSL": ("CPIAUCSL", "Consumer Price Index (All Urban)", "index"),
    "FRED.UNRATE": ("UNRATE", "Unemployment Rate", "percent"),
    "FRED.PAYEMS": ("PAYEMS", "Nonfarm Payrolls (Thousands)", "number"),
    "FRED.M2SL": ("M2SL", "M2 Money Supply (Billions USD)", "currency"),
    "FRED.WALCL": ("WALCL", "Fed Total Assets (Millions USD)", "currency"),
    "FRED.GDP": ("GDP", "US GDP (Billions USD, Quarterly)", "currency"),
    "FRED.GDPC1": ("GDPC1", "Real GDP (Billions Chained 2017 USD)", "currency"),
    "FRED.DTWEXBGS": ("DTWEXBGS", "Trade Weighted US Dollar Index", "index"),
    "FRED.MORTGAGE30US": ("MORTGAGE30US", "30-Year Fixed Mortgage Rate", "percent"),
    "FRED.HOUST": ("HOUST", "Housing Starts (Thousands)", "number"),
    "FRED.RETAILSALES": ("RSAFS", "Retail Sales (Millions USD)", "currency"),
    "FRED.INDPRO": ("INDPRO", "Industrial Production Index", "index"),
    "FRED.UMCSENT": ("UMCSENT", "Consumer Sentiment (UMich)", "index"),
    "FRED.VIXCLS": ("VIXCLS", "VIX Volatility Index", "index"),
    "FRED.SP500": ("SP500", "S&P 500 Index", "index"),
    "FRED.DJIA": ("DJIA", "Dow Jones Industrial Average", "index"),
    "FRED.NASDAQCOM": ("NASDAQCOM", "NASDAQ Composite", "index"),
    "FRED.BAMLH0A0HYM2": ("BAMLH0A0HYM2", "High Yield Corporate Bond Spread", "percent"),
    "FRED.DCOILWTICO": ("DCOILWTICO", "WTI Crude Oil Price (USD/barrel)", "currency"),
    "FRED.GOLDAMGBD228NLBM": ("GOLDAMGBD228NLBM", "Gold Price (USD/troy oz)", "currency"),
}


# ============================================================
# ETL: FRED
# ============================================================

def etl_fred(cur):
    if not FRED_API_KEY:
        print("ERROR: FRED_API_KEY not set. Get a free key at https://fred.stlouisfed.org/docs/api/api_key.html")
        print("  Set via: export FRED_API_KEY=your_key_here")
        return 0

    print("\n=== FRED ETL ===")
    base = "https://api.stlouisfed.org/fred/series/observations"
    total = 0

    # Get valid countries
    cur.execute("SELECT id FROM sotw_countries")
    valid_countries = {r[0] for r in cur.fetchall()}

    # 1. US-specific series
    print("  Fetching US-specific series...")
    for sotw_id, (fred_id, label, fmt) in FRED_US_SERIES.items():
        try:
            url = f"{base}?series_id={fred_id}&api_key={FRED_API_KEY}&file_type=json&frequency=a&sort_order=desc&limit=30"
            data = fetch_json(url)
            count = 0
            latest_val, latest_yr = None, None
            for obs in data.get("observations", []):
                if obs["value"] == ".":
                    continue
                yr = int(obs["date"][:4])
                val = float(obs["value"])
                upsert_history(cur, sotw_id, "USA", val, yr, "fred")
                count += 1
                if latest_val is None:
                    latest_val, latest_yr = val, yr
            if latest_val is not None:
                upsert_latest(cur, sotw_id, "USA", latest_val, latest_yr, "fred")
            total += count
        except Exception as e:
            print(f"    SKIP {sotw_id}: {e}")
        time.sleep(0.2)

    print(f"    US series: {total} data points")

    # 2. 10Y bond yields by country
    print("  Fetching 10Y bond yields...")
    bond_count = 0
    for country_id, fred_id in FRED_BOND_YIELDS_10Y.items():
        if country_id not in valid_countries:
            continue
        try:
            url = f"{base}?series_id={fred_id}&api_key={FRED_API_KEY}&file_type=json&frequency=a&sort_order=desc&limit=30"
            data = fetch_json(url)
            latest_val, latest_yr = None, None
            for obs in data.get("observations", []):
                if obs["value"] == ".":
                    continue
                yr = int(obs["date"][:4])
                val = float(obs["value"])
                upsert_history(cur, "FRED.BOND10Y", country_id, val, yr, "fred")
                bond_count += 1
                if latest_val is None:
                    latest_val, latest_yr = val, yr
            if latest_val is not None:
                upsert_latest(cur, "FRED.BOND10Y", country_id, latest_val, latest_yr, "fred")
        except Exception as e:
            if "404" not in str(e) and "400" not in str(e):
                print(f"    SKIP {country_id} bond: {e}")
        time.sleep(0.2)

    total += bond_count
    print(f"    Bond yields: {bond_count} data points")

    # 3. Central bank rates by country
    print("  Fetching central bank rates...")
    cb_count = 0
    for country_id, fred_id in FRED_CENTRAL_BANK_RATES.items():
        if country_id not in valid_countries and country_id != "EUR":
            continue
        try:
            url = f"{base}?series_id={fred_id}&api_key={FRED_API_KEY}&file_type=json&frequency=a&sort_order=desc&limit=30"
            data = fetch_json(url)
            latest_val, latest_yr = None, None
            for obs in data.get("observations", []):
                if obs["value"] == ".":
                    continue
                yr = int(obs["date"][:4])
                val = float(obs["value"])

                if country_id == "EUR":
                    # Apply to all eurozone countries
                    for ez_country in EUROZONE:
                        upsert_history(cur, "FRED.CBRATE", ez_country, val, yr, "fred")
                        cb_count += 1
                        if latest_val is None:
                            upsert_latest(cur, "FRED.CBRATE", ez_country, val, yr, "fred")
                else:
                    upsert_history(cur, "FRED.CBRATE", country_id, val, yr, "fred")
                    cb_count += 1

                if latest_val is None:
                    latest_val, latest_yr = val, yr
                    if country_id != "EUR":
                        upsert_latest(cur, "FRED.CBRATE", country_id, latest_val, latest_yr, "fred")
        except Exception as e:
            if "404" not in str(e) and "400" not in str(e):
                print(f"    SKIP {country_id} cbrate: {e}")
        time.sleep(0.2)

    total += cb_count
    print(f"    Central bank rates: {cb_count} data points")

    # 4. Insert metadata for FRED indicators
    upsert_meta(cur, "FRED.BOND10Y", "Long-term government bond yield (10-year maturity). The yield on benchmark government bonds with 10-year remaining maturity.", "FRED / OECD", "https://fred.stlouisfed.org/", "Percent per annum")
    upsert_meta(cur, "FRED.CBRATE", "Central bank policy interest rate. The rate at which the central bank lends to commercial banks, the primary monetary policy instrument.", "FRED / OECD / Central Banks", "https://fred.stlouisfed.org/", "Percent per annum")
    for sotw_id, (fred_id, label, fmt) in FRED_US_SERIES.items():
        upsert_meta(cur, sotw_id, label, "FRED (Federal Reserve Economic Data)", f"https://fred.stlouisfed.org/series/{fred_id}", fmt)

    print(f"  FRED total: {total} data points")
    return total


# ============================================================
# ETL: OECD (Quarterly GDP — no API key required)
# ============================================================

OECD_COUNTRIES = {
    "AUS": "AUS", "AUT": "AUT", "BEL": "BEL", "CAN": "CAN", "CHL": "CHL",
    "COL": "COL", "CRI": "CRI", "CZE": "CZE", "DNK": "DNK", "EST": "EST",
    "FIN": "FIN", "FRA": "FRA", "DEU": "DEU", "GRC": "GRC", "HUN": "HUN",
    "ISL": "ISL", "IRL": "IRL", "ISR": "ISR", "ITA": "ITA", "JPN": "JPN",
    "KOR": "KOR", "LVA": "LVA", "LTU": "LTU", "LUX": "LUX", "MEX": "MEX",
    "NLD": "NLD", "NZL": "NZL", "NOR": "NOR", "POL": "POL", "PRT": "PRT",
    "SVK": "SVK", "SVN": "SVN", "ESP": "ESP", "SWE": "SWE", "CHE": "CHE",
    "TUR": "TUR", "GBR": "GBR", "USA": "USA",
}

def etl_oecd(cur):
    print("\n=== OECD ETL ===")
    total = 0

    # Get valid countries
    cur.execute("SELECT id FROM sotw_countries")
    valid_countries = {r[0] for r in cur.fetchall()}

    # Annual GDP growth rate for OECD countries (new SDMX API)
    print("  Fetching OECD annual GDP growth...")
    try:
        url = "https://sdmx.oecd.org/public/rest/data/OECD.SDD.NAD,DSD_NAAG@DF_NAAG_I,1.0/..B1GQ..GY..?startPeriod=2000&dimensionAtObservation=AllDimensions&format=jsondata"
        data = fetch_json(url)

        if "dataSets" in data and data["dataSets"]:
            ds = data["dataSets"][0]
            observations = ds.get("observations", {})

            # Get dimension values
            dims = data["structure"]["dimensions"]["observation"]
            ref_area_vals = [v["id"] for v in dims[0]["values"]]  # country codes
            time_vals = [v["id"] for v in dims[-1]["values"]]  # time periods

            for obs_key, obs_val in observations.items():
                if obs_val[0] is None:
                    continue
                indices = obs_key.split(":")
                country_idx = int(indices[0])
                time_idx = int(indices[-1])

                if country_idx >= len(ref_area_vals) or time_idx >= len(time_vals):
                    continue

                country_id = ref_area_vals[country_idx]
                time_period = time_vals[time_idx]

                # Map 2-letter OECD codes to 3-letter ISO
                iso3 = OECD_COUNTRIES.get(country_id, country_id)
                if iso3 not in valid_countries:
                    continue

                yr = int(time_period[:4])
                val = obs_val[0]
                upsert_history(cur, "OECD.GDPGR", iso3, val, yr, "oecd")
                total += 1

            print(f"    OECD GDP growth: {total} data points")
    except Exception as e:
        print(f"    SKIP OECD GDP growth: {e}")

    upsert_meta(cur, "OECD.GDPGR", "Real GDP growth rate, annual. Percentage change from previous year, based on volume estimates.", "OECD National Accounts", "https://data.oecd.org/gdp/real-gdp-forecast.htm", "Percent change")

    print(f"  OECD total: {total} data points")
    return total


# ============================================================
# ETL: ECB (European Central Bank — no API key required)
# ============================================================

def etl_ecb(cur):
    print("\n=== ECB ETL ===")
    total = 0

    # ECB exchange rates vs EUR
    print("  Fetching ECB exchange rates...")
    ecb_currencies = {
        "USD": "USA", "GBP": "GBR", "JPY": "JPN", "CHF": "CHE", "CAD": "CAN",
        "AUD": "AUS", "NZD": "NZL", "SEK": "SWE", "NOK": "NOR", "DKK": "DNK",
        "PLN": "POL", "CZK": "CZE", "HUF": "HUN", "TRY": "TUR", "BRL": "BRA",
        "CNY": "CHN", "INR": "IND", "KRW": "KOR", "MXN": "MEX", "ZAR": "ZAF",
        "SGD": "SGP", "HKD": "HKG", "THB": "THA", "IDR": "IDN", "MYR": "MYS",
        "PHP": "PHL", "RUB": "RUS", "ILS": "ISR", "ISK": "ISL", "BGN": "BGR",
        "RON": "ROU", "HRK": "HRV",
    }

    for currency, country_id in ecb_currencies.items():
        try:
            url = f"https://data-api.ecb.europa.eu/service/data/EXR/A.{currency}.EUR.SP00.A?format=jsondata&startPeriod=2000"
            data = fetch_json(url)

            observations = data.get("dataSets", [{}])[0].get("series", {})
            time_dim = data.get("structure", {}).get("dimensions", {}).get("observation", [{}])[0].get("values", [])
            time_labels = [t.get("id", "") for t in time_dim]

            for series_key, series_data in observations.items():
                for time_idx, obs_val in series_data.get("observations", {}).items():
                    if obs_val[0] is None:
                        continue
                    yr = int(time_labels[int(time_idx)][:4])
                    val = obs_val[0]
                    upsert_history(cur, "ECB.EXRATE", country_id, val, yr, "ecb")
                    total += 1

        except Exception as e:
            if "404" not in str(e):
                pass  # ECB API can be flaky
        time.sleep(0.3)

    print(f"    ECB exchange rates: {total} data points")

    upsert_meta(cur, "ECB.EXRATE", "Exchange rate against EUR. Annual average. Units of national currency per 1 EUR.", "European Central Bank", "https://data.ecb.europa.eu/", "National currency per EUR")

    print(f"  ECB total: {total} data points")
    return total


# ============================================================
# ETL: ALPHA VANTAGE (free key, 25 req/day on free tier)
# ============================================================

# Commodity symbols
AV_COMMODITIES = {
    "AV.WTI": ("WTI", "WTI Crude Oil (USD/barrel)", "currency"),
    "AV.BRENT": ("BRENT", "Brent Crude Oil (USD/barrel)", "currency"),
    "AV.NATGAS": ("NATURAL_GAS", "Natural Gas (USD/MMBtu)", "currency"),
    "AV.COPPER": ("COPPER", "Copper (USD/lb)", "currency"),
    "AV.ALUMINUM": ("ALUMINUM", "Aluminum (USD/tonne)", "currency"),
    "AV.WHEAT": ("WHEAT", "Wheat (USD/bushel)", "currency"),
    "AV.CORN": ("CORN", "Corn (USD/bushel)", "currency"),
    "AV.COTTON": ("COTTON", "Cotton (USD/lb)", "currency"),
    "AV.SUGAR": ("SUGAR", "Sugar (USD/lb)", "currency"),
    "AV.COFFEE": ("COFFEE", "Coffee (USD/lb)", "currency"),
}

# Economic indicators (US-focused, Alpha Vantage provides)
AV_ECONOMIC = {
    "AV.REAL_GDP": ("REAL_GDP", "US Real GDP (Billions USD, Quarterly)", "currency"),
    "AV.REAL_GDP_PER_CAPITA": ("REAL_GDP_PER_CAPITA", "US Real GDP per Capita (USD, Quarterly)", "currency"),
    "AV.TREASURY_YIELD": ("TREASURY_YIELD", "US Treasury Yield 10Y (%)", "percent"),
    "AV.FEDERAL_FUNDS_RATE": ("FEDERAL_FUNDS_RATE", "US Federal Funds Rate (%)", "percent"),
    "AV.CPI": ("CPI", "US Consumer Price Index", "index"),
    "AV.INFLATION": ("INFLATION", "US Inflation Rate (%)", "percent"),
    "AV.RETAIL_SALES": ("RETAIL_SALES", "US Retail Sales (Millions USD)", "currency"),
    "AV.DURABLES": ("DURABLES", "US Durable Goods Orders (Millions USD)", "currency"),
    "AV.UNEMPLOYMENT": ("UNEMPLOYMENT", "US Unemployment Rate (%)", "percent"),
    "AV.NONFARM_PAYROLL": ("NONFARM_PAYROLL", "US Nonfarm Payrolls (Thousands)", "number"),
}

def etl_alphavantage(cur):
    if not ALPHA_VANTAGE_KEY:
        print("ERROR: ALPHA_VANTAGE_KEY not set.")
        return 0

    print("\n=== Alpha Vantage ETL ===")
    base = "https://www.alphavantage.co/query"
    total = 0
    calls = 0
    MAX_CALLS = 24  # Stay under 25/day free limit

    # 1. Commodity prices (global, stored under "WLD" world aggregate)
    print("  Fetching commodity prices...")
    for sotw_id, (av_func, label, fmt) in AV_COMMODITIES.items():
        if calls >= MAX_CALLS:
            print("    Rate limit reached, stopping.")
            break
        try:
            url = f"{base}?function={av_func}&interval=annual&apikey={ALPHA_VANTAGE_KEY}"
            data = fetch_json(url)
            records = data.get("data", [])
            count = 0
            for rec in records:
                try:
                    yr = int(rec["date"][:4])
                    val = float(rec["value"])
                    if yr >= 2000:
                        upsert_history(cur, sotw_id, "WLD", val, yr, "alphavantage")
                        count += 1
                except (ValueError, KeyError):
                    continue
            # Latest value
            if records:
                try:
                    latest = records[0]
                    upsert_latest(cur, sotw_id, "WLD", float(latest["value"]), int(latest["date"][:4]), "alphavantage")
                except:
                    pass
            cur.connection.commit()
            total += count
            calls += 1
            upsert_meta(cur, sotw_id, label, "Alpha Vantage", "https://www.alphavantage.co/", fmt)
            cur.connection.commit()
        except Exception as e:
            cur.connection.rollback()
            print(f"    SKIP {sotw_id}: {e}")
        time.sleep(1)

    print(f"    Commodities: {total} data points ({calls} API calls)")

    # 2. US economic indicators
    print("  Fetching US economic indicators...")
    econ_count = 0
    for sotw_id, (av_func, label, fmt) in AV_ECONOMIC.items():
        if calls >= MAX_CALLS:
            print("    Rate limit reached, stopping.")
            break
        try:
            url = f"{base}?function={av_func}&interval=annual&apikey={ALPHA_VANTAGE_KEY}"
            data = fetch_json(url)
            records = data.get("data", [])
            count = 0
            for rec in records:
                try:
                    yr = int(rec["date"][:4])
                    val = float(rec["value"])
                    if yr >= 2000:
                        upsert_history(cur, sotw_id, "USA", val, yr, "alphavantage")
                        count += 1
                except (ValueError, KeyError):
                    continue
            if records:
                try:
                    latest = records[0]
                    upsert_latest(cur, sotw_id, "USA", float(latest["value"]), int(latest["date"][:4]), "alphavantage")
                except:
                    pass
            cur.connection.commit()
            econ_count += count
            calls += 1
            upsert_meta(cur, sotw_id, label, "Alpha Vantage", "https://www.alphavantage.co/", fmt)
            cur.connection.commit()
        except Exception as e:
            cur.connection.rollback()
            print(f"    SKIP {sotw_id}: {e}")
        time.sleep(1)

    total += econ_count
    print(f"    US economic: {econ_count} data points")
    print(f"  Alpha Vantage total: {total} data points ({calls} API calls used)")
    return total


# ============================================================
# ETL: ExchangeRate-API (free, no key for open endpoint)
# ============================================================

def etl_exchangerate(cur):
    print("\n=== ExchangeRate-API ETL ===")
    total = 0

    try:
        url = "https://open.er-api.com/v6/latest/USD"
        data = fetch_json(url)
        rates = data.get("rates", {})

        # Map currency codes to ISO3 country codes
        currency_to_country = {
            "EUR": ["DEU", "FRA", "ITA", "ESP", "NLD", "BEL", "AUT", "FIN", "IRL", "PRT", "GRC"],
            "GBP": ["GBR"], "JPY": ["JPN"], "CAD": ["CAN"], "AUD": ["AUS"],
            "CHF": ["CHE"], "CNY": ["CHN"], "INR": ["IND"], "KRW": ["KOR"],
            "BRL": ["BRA"], "MXN": ["MEX"], "ZAR": ["ZAF"], "SEK": ["SWE"],
            "NOK": ["NOR"], "DKK": ["DNK"], "NZD": ["NZL"], "SGD": ["SGP"],
            "HKD": ["HKG"], "TRY": ["TUR"], "PLN": ["POL"], "CZK": ["CZE"],
            "HUF": ["HUN"], "THB": ["THA"], "IDR": ["IDN"], "MYR": ["MYS"],
            "PHP": ["PHL"], "RUB": ["RUS"], "ILS": ["ISR"], "CLP": ["CHL"],
            "COP": ["COL"], "PEN": ["PER"], "ARS": ["ARG"], "EGP": ["EGY"],
            "NGN": ["NGA"], "KES": ["KEN"], "GHS": ["GHA"], "PKR": ["PAK"],
            "BDT": ["BGD"], "VND": ["VNM"], "UAH": ["UKR"], "RON": ["ROU"],
            "BGN": ["BGR"], "HRK": ["HRV"], "ISK": ["ISL"], "TWD": ["TWN"],
        }

        # Get valid countries from DB
        cur.execute("SELECT id FROM sotw_countries")
        valid_countries = {r[0] for r in cur.fetchall()}

        yr = datetime.datetime.now().year
        for currency, rate in rates.items():
            countries = currency_to_country.get(currency, [])
            for country_id in countries:
                if country_id not in valid_countries:
                    continue
                upsert_latest(cur, "FX.USD", country_id, rate, yr, "exchangerate")
                upsert_history(cur, "FX.USD", country_id, rate, yr, "exchangerate")
                total += 1

        # USD to USD is 1
        upsert_latest(cur, "FX.USD", "USA", 1.0, yr, "exchangerate")
        upsert_history(cur, "FX.USD", "USA", 1.0, yr, "exchangerate")
        total += 1

    except Exception as e:
        print(f"    SKIP ExchangeRate: {e}")

    upsert_meta(cur, "FX.USD", "Exchange rate against USD. Units of national currency per 1 USD. Real-time market rate.", "ExchangeRate-API (Open)", "https://open.er-api.com/", "National currency per USD")

    print(f"  ExchangeRate total: {total} data points")
    return total


# ============================================================
# ETL: FINNHUB (free key, 60 calls/min)
# ============================================================

# Major stock market indices by country
FINNHUB_INDICES = {
    "USA": "^GSPC",    # S&P 500
    "GBR": "^FTSE",    # FTSE 100
    "DEU": "^GDAXI",   # DAX
    "FRA": "^FCHI",    # CAC 40
    "JPN": "^N225",    # Nikkei 225
    "CHN": "000001.SS", # Shanghai Composite
    "HKG": "^HSI",     # Hang Seng
    "IND": "^BSESN",   # BSE Sensex
    "KOR": "^KS11",    # KOSPI
    "CAN": "^GSPTSE",  # S&P/TSX
    "AUS": "^AXJO",    # ASX 200
    "BRA": "^BVSP",    # Bovespa
    "MEX": "^MXX",     # IPC Mexico
}

def etl_finnhub(cur):
    if not FINNHUB_KEY:
        print("ERROR: FINNHUB_KEY not set. Get free key at https://finnhub.io/register")
        return 0

    print("\n=== Finnhub ETL ===")
    total = 0

    # Get valid countries
    cur.execute("SELECT id FROM sotw_countries")
    valid_countries = {r[0] for r in cur.fetchall()}

    # 1. Economic calendar — upcoming releases
    print("  Fetching economic calendar...")
    try:
        from_date = datetime.datetime.now().strftime("%Y-%m-%d")
        to_date = (datetime.datetime.now() + datetime.timedelta(days=30)).strftime("%Y-%m-%d")
        url = f"https://finnhub.io/api/v1/calendar/economic?from={from_date}&to={to_date}&token={FINNHUB_KEY}"
        data = fetch_json(url)
        events = data.get("economicCalendar", [])
        print(f"    Economic calendar: {len(events)} upcoming events")
        # Store in a separate table later — for now just log count
    except Exception as e:
        print(f"    SKIP economic calendar: {e}")
    time.sleep(0.5)

    # 2. Country economic data
    print("  Fetching country economic codes...")
    try:
        url = f"https://finnhub.io/api/v1/economic/code?token={FINNHUB_KEY}"
        codes = fetch_json(url)

        # Fetch key indicators
        key_codes = [c for c in codes if c.get("code") in [
            "MA-USA-0025",  # US GDP
            "MA-USA-0004",  # US CPI
            "MA-USA-0014",  # US Unemployment
            "MA-GBR-0001",  # UK GDP
            "MA-DEU-0001",  # Germany GDP
            "MA-JPN-0001",  # Japan GDP
            "MA-CHN-0001",  # China GDP
        ]]

        for code_info in key_codes[:10]:  # Limit calls
            code = code_info["code"]
            try:
                url = f"https://finnhub.io/api/v1/economic?code={code}&token={FINNHUB_KEY}"
                series = fetch_json(url)
                if series:
                    country_iso = code.split("-")[1]
                    if country_iso in valid_countries:
                        for point in series:
                            try:
                                yr = int(point["date"][:4])
                                val = float(point["value"])
                                upsert_history(cur, f"FH.{code}", country_iso, val, yr, "finnhub")
                                total += 1
                            except (ValueError, KeyError):
                                continue
                        cur.connection.commit()
            except Exception as e:
                cur.connection.rollback()
            time.sleep(0.5)

        print(f"    Economic data: {total} data points")
    except Exception as e:
        print(f"    SKIP economic codes: {e}")

    print(f"  Finnhub total: {total} data points")
    return total


# ============================================================
# ETL: FINANCIAL MODELING PREP (free key, 250 calls/day)
# ============================================================

# Major indices with FMP symbols
FMP_INDICES = {
    "^GSPC": ("USA", "S&P 500"),
    "^DJI": ("USA", "Dow Jones Industrial Average"),
    "^IXIC": ("USA", "NASDAQ Composite"),
    "^FTSE": ("GBR", "FTSE 100"),
    "^GDAXI": ("DEU", "DAX"),
    "^FCHI": ("FRA", "CAC 40"),
    "^N225": ("JPN", "Nikkei 225"),
    "^HSI": ("HKG", "Hang Seng"),
    "^BSESN": ("IND", "BSE Sensex"),
    "^KS11": ("KOR", "KOSPI"),
    "^GSPTSE": ("CAN", "S&P/TSX Composite"),
    "^AXJO": ("AUS", "ASX 200"),
    "^BVSP": ("BRA", "Bovespa"),
    "^STOXX50E": ("EUR", "Euro Stoxx 50"),
    "^STI": ("SGP", "Straits Times Index"),
}

def etl_fmp(cur):
    if not FMP_KEY:
        print("ERROR: FMP_KEY not set. Get free key at https://site.financialmodelingprep.com/developer/docs")
        return 0

    print("\n=== Financial Modeling Prep ETL ===")
    base = "https://financialmodelingprep.com/api/v3"
    total = 0

    # Get valid countries
    cur.execute("SELECT id FROM sotw_countries")
    valid_countries = {r[0] for r in cur.fetchall()}

    # 1. Historical index prices (annual close)
    print("  Fetching stock index annual prices...")
    for symbol, (country_id, label) in FMP_INDICES.items():
        if country_id not in valid_countries and country_id != "EUR":
            continue
        try:
            url = f"{base}/historical-price-full/{symbol}?apikey={FMP_KEY}&serietype=line"
            data = fetch_json(url)
            historical = data.get("historical", [])

            # Get year-end close prices
            yearly = {}
            for point in historical:
                yr = int(point["date"][:4])
                if yr >= 2000:
                    yearly[yr] = point["close"]  # Last entry per year = year-end

            count = 0
            sotw_id = f"FMP.IDX.{symbol.replace('^', '')}"
            targets = EUROZONE if country_id == "EUR" else [country_id]
            for cid in targets:
                if cid not in valid_countries:
                    continue
                for yr, val in yearly.items():
                    upsert_history(cur, sotw_id, cid, val, yr, "fmp")
                    count += 1
                # Latest
                if yearly:
                    latest_yr = max(yearly.keys())
                    upsert_latest(cur, sotw_id, cid, yearly[latest_yr], latest_yr, "fmp")

            cur.connection.commit()
            total += count
            upsert_meta(cur, sotw_id, f"{label} stock market index, annual closing price.", "Financial Modeling Prep", f"https://financialmodelingprep.com/", "Index points")
            cur.connection.commit()
            print(f"    {label}: {count} data points")
        except Exception as e:
            cur.connection.rollback()
            if "limit" in str(e).lower() or "429" in str(e):
                print(f"    Rate limited, stopping FMP.")
                break
            print(f"    SKIP {symbol}: {e}")
        time.sleep(0.5)

    # 2. Treasury rates
    print("  Fetching treasury rates...")
    try:
        url = f"{base}/treasury?from=2000-01-01&apikey={FMP_KEY}"
        data = fetch_json(url)
        if isinstance(data, list):
            yearly_10y = {}
            for point in data:
                yr = int(point["date"][:4])
                if "year10" in point and point["year10"] is not None:
                    yearly_10y[yr] = point["year10"]

            for yr, val in yearly_10y.items():
                upsert_history(cur, "FMP.TREASURY10Y", "USA", val, yr, "fmp")
                total += 1
            if yearly_10y:
                latest_yr = max(yearly_10y.keys())
                upsert_latest(cur, "FMP.TREASURY10Y", "USA", yearly_10y[latest_yr], latest_yr, "fmp")
            cur.connection.commit()
            upsert_meta(cur, "FMP.TREASURY10Y", "US 10-Year Treasury Rate", "Financial Modeling Prep", "https://financialmodelingprep.com/", "Percent")
            cur.connection.commit()
            print(f"    Treasury 10Y: {len(yearly_10y)} years")
    except Exception as e:
        cur.connection.rollback()
        print(f"    SKIP treasury: {e}")

    print(f"  FMP total: {total} data points")
    return total


# ============================================================
# MAIN
# ============================================================

def main():
    parser = argparse.ArgumentParser(description="SOTW Financial ETL")
    parser.add_argument("--source", choices=["fred", "oecd", "ecb", "alphavantage", "finnhub", "fmp", "exchangerate", "all"], default="all")
    args = parser.parse_args()

    conn = psycopg2.connect(**DB)
    cur = conn.cursor()

    total = 0
    start = time.time()

    if args.source in ("fred", "all"):
        total += etl_fred(cur)
        conn.commit()

    if args.source in ("oecd", "all"):
        total += etl_oecd(cur)
        conn.commit()

    if args.source in ("ecb", "all"):
        total += etl_ecb(cur)
        conn.commit()

    if args.source in ("alphavantage", "all"):
        total += etl_alphavantage(cur)
        conn.commit()

    if args.source in ("finnhub", "all"):
        total += etl_finnhub(cur)
        conn.commit()

    if args.source in ("fmp", "all"):
        total += etl_fmp(cur)
        conn.commit()

    if args.source in ("exchangerate", "all"):
        total += etl_exchangerate(cur)
        conn.commit()

    elapsed = time.time() - start

    # Stats
    cur.execute(f"SELECT COUNT(*) FROM {HISTORY_TABLE}")
    total_history = cur.fetchone()[0]
    cur.execute(f"SELECT COUNT(DISTINCT id) FROM {HISTORY_TABLE}")
    unique_indicators = cur.fetchone()[0]
    cur.execute(f"SELECT COUNT(DISTINCT source) FROM {HISTORY_TABLE}")
    unique_sources = cur.fetchone()[0]

    print(f"\n{'='*50}")
    print(f"Financial ETL Complete")
    print(f"  Rows upserted this run: {total}")
    print(f"  Total history rows: {total_history}")
    print(f"  Unique indicators: {unique_indicators}")
    print(f"  Data sources: {unique_sources}")
    print(f"  Elapsed: {elapsed:.0f}s ({elapsed/60:.1f}m)")
    print(f"{'='*50}")

    conn.close()


if __name__ == "__main__":
    main()
