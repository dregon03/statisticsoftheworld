#!/usr/bin/env python3
"""
ETL: Official macro data → Supabase normalized event store

Sources:
  US: FRED API (CPI, PPI, NFP, GDP, PCE, retail, housing, industrial, etc.)
  CA: StatCan WDS + Bank of Canada Valet (future)
  UK: ONS API (future)
  EU: Eurostat + ECB (future)

This builds a compounding data asset: every run stores actual values,
so historical data gets stronger over time.

Schedule: Daily 7 AM UTC
Runtime: ~15 seconds (20 FRED series × 2 API calls each)
"""

import datetime
import json
import os
import sys
import urllib.request
import time

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "aws-1-ca-central-1.pooler.supabase.com")
DB_PORT = int(os.environ.get("SUPABASE_DB_PORT", "6543"))
DB_USER = os.environ.get("SUPABASE_DB_USER", "postgres.seyrycaldytfjvvkqopu")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")
FRED_KEY = os.environ.get("FRED_API_KEY", "74b554c354e549e1e3087a689608fc29")

# ── Curated US macro indicators ──────────────────────────
# (series_id, release_id, name, category, impact, release_time_ET)
FRED_SERIES = [
    # Inflation
    ("CPIAUCSL",  10,  "Consumer Price Index (CPI)",         "Inflation",   "high",   "08:30"),
    ("CPILFESL",  10,  "Core CPI (ex Food & Energy)",        "Inflation",   "high",   "08:30"),
    ("PCEPI",     54,  "PCE Price Index",                     "Inflation",   "high",   "08:30"),
    ("PCEPILFE",  54,  "Core PCE Price Index",                "Inflation",   "high",   "08:30"),
    ("PPIFIS",    46,  "Producer Price Index (PPI)",          "Inflation",   "high",   "08:30"),
    # Labor
    ("PAYEMS",    50,  "Nonfarm Payrolls",                    "Labor",       "high",   "08:30"),
    ("UNRATE",    50,  "Unemployment Rate",                   "Labor",       "high",   "08:30"),
    ("ICSA",     180,  "Initial Jobless Claims",              "Labor",       "medium", "08:30"),
    ("JTSJOL",   286,  "JOLTS Job Openings",                  "Labor",       "high",   "10:00"),
    # GDP
    ("GDP",       17,  "Gross Domestic Product (GDP)",        "GDP",         "high",   "08:30"),
    ("GDPC1",     17,  "Real GDP",                            "GDP",         "high",   "08:30"),
    # Consumer
    ("RSAFS",     22,  "Retail Sales",                        "Consumer",    "high",   "08:30"),
    ("UMCSENT",   14,  "Michigan Consumer Sentiment",         "Consumer",    "medium", "10:00"),
    # Production
    ("INDPRO",    13,  "Industrial Production",               "Production",  "high",   "09:15"),
    ("DGORDER",   21,  "Durable Goods Orders",                "Production",  "high",   "08:30"),
    # Housing
    ("HOUST",     27,  "Housing Starts",                      "Housing",     "high",   "08:30"),
    ("PERMIT",    27,  "Building Permits",                    "Housing",     "high",   "08:30"),
    ("HSN1F",     97,  "New Home Sales",                      "Housing",     "high",   "10:00"),
    # Trade
    ("BOPGSTB",  127,  "Trade Balance",                       "Trade",       "medium", "08:30"),
    # Central Bank
    ("FEDFUNDS", 101,  "Federal Funds Rate",                  "Central Bank","high",   "14:00"),
]


def fred_get(endpoint, params):
    """Call FRED API and return JSON."""
    params["api_key"] = FRED_KEY
    params["file_type"] = "json"
    qs = "&".join(f"{k}={v}" for k, v in params.items())
    url = f"https://api.stlouisfed.org/fred/{endpoint}?{qs}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "SOTW/2.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read())
    except Exception as e:
        print(f"  FRED API error: {e}")
        return None


def fetch_release_dates(release_id, limit=10):
    """Get recent release dates for a FRED release."""
    data = fred_get("release/dates", {
        "release_id": release_id,
        "sort_order": "desc",
        "limit": str(limit),
    })
    if not data or "release_dates" not in data:
        return []
    return [rd["date"] for rd in data["release_dates"]]


def fetch_observations(series_id, limit=10):
    """Get recent observations for a FRED series."""
    data = fred_get("series/observations", {
        "series_id": series_id,
        "sort_order": "desc",
        "limit": str(limit),
    })
    if not data or "observations" not in data:
        return []
    # Filter out missing values
    return [
        {"date": o["date"], "value": o["value"]}
        for o in data["observations"]
        if o["value"] != "."
    ]


def format_value(series_id, value_str):
    """Format a raw FRED value into human-readable form."""
    try:
        val = float(value_str)
    except (ValueError, TypeError):
        return value_str, None

    # Percentage-based series
    pct_series = {"UNRATE", "CPIAUCSL", "CPILFESL", "PCEPI", "PCEPILFE", "FEDFUNDS"}
    if series_id in pct_series:
        return f"{val:.1f}%", val

    # Index series (ISM, Michigan, etc.)
    index_series = {"UMCSENT"}
    if series_id in index_series:
        return f"{val:.1f}", val

    # Thousands (jobs)
    if series_id in {"PAYEMS"}:
        return f"{val/1000:.1f}M" if val >= 1000 else f"{val:.0f}K", val
    if series_id in {"ICSA"}:
        return f"{val/1000:.0f}K", val
    if series_id in {"JTSJOL"}:
        return f"{val/1000:.1f}M", val

    # Billions (GDP, trade)
    if series_id in {"GDP", "GDPC1"}:
        return f"${val/1000:.1f}T" if val >= 10000 else f"${val:.0f}B", val
    if series_id in {"BOPGSTB"}:
        return f"${val:.1f}B", val

    # Housing (thousands of units)
    if series_id in {"HOUST", "PERMIT", "HSN1F"}:
        return f"{val:.0f}K", val

    # Others: millions/billions
    if series_id in {"RSAFS", "DGORDER"}:
        return f"${val/1000:.1f}B" if val >= 1000 else f"${val:.0f}M", val

    # Production index
    if series_id in {"INDPRO"}:
        return f"{val:.1f}", val

    # PPI
    if series_id in {"PPIFIS"}:
        return f"{val:.1f}", val

    return f"{val:.2f}", val


def get_ref_period(date_str):
    """Convert observation date to human-readable reference period."""
    try:
        d = datetime.date.fromisoformat(date_str)
        return d.strftime("%b %Y")
    except Exception:
        return date_str


def main():
    if not DB_PASS:
        print("SUPABASE_DB_PASSWORD not set")
        sys.exit(1)

    import psycopg2

    print("=== Official Macro ETL (FRED) ===", flush=True)

    # Connect and create schema
    conn = psycopg2.connect(
        host=DB_HOST, dbname="postgres", user=DB_USER,
        password=DB_PASS, port=DB_PORT
    )
    conn.autocommit = True
    cur = conn.cursor()

    # Create normalized event store
    cur.execute("""
        CREATE TABLE IF NOT EXISTS sotw_macro_releases (
            id SERIAL PRIMARY KEY,
            series_id TEXT NOT NULL,
            country TEXT NOT NULL DEFAULT 'US',
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            impact TEXT DEFAULT 'medium',
            release_date DATE NOT NULL,
            release_time TEXT,
            actual TEXT,
            actual_numeric DOUBLE PRECISION,
            previous TEXT,
            previous_numeric DOUBLE PRECISION,
            revised TEXT,
            revised_numeric DOUBLE PRECISION,
            forecast TEXT,
            forecast_numeric DOUBLE PRECISION,
            forecast_source TEXT,
            source TEXT NOT NULL DEFAULT 'FRED',
            source_url TEXT,
            ref_period TEXT,
            surprise_pct DOUBLE PRECISION,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(series_id, release_date)
        );
        CREATE INDEX IF NOT EXISTS idx_macro_releases_date ON sotw_macro_releases(release_date);
        CREATE INDEX IF NOT EXISTS idx_macro_releases_series ON sotw_macro_releases(series_id);
        CREATE INDEX IF NOT EXISTS idx_macro_releases_country ON sotw_macro_releases(country);
    """)

    # Create earnings store
    cur.execute("""
        CREATE TABLE IF NOT EXISTS sotw_earnings_releases (
            id SERIAL PRIMARY KEY,
            symbol TEXT NOT NULL,
            company_name TEXT NOT NULL,
            report_date DATE NOT NULL,
            report_timing TEXT,
            eps_estimate DOUBLE PRECISION,
            revenue_estimate DOUBLE PRECISION,
            eps_actual DOUBLE PRECISION,
            revenue_actual DOUBLE PRECISION,
            eps_surprise_pct DOUBLE PRECISION,
            revenue_surprise_pct DOUBLE PRECISION,
            prev_quarter_eps_actual DOUBLE PRECISION,
            prev_quarter_eps_surprise_pct DOUBLE PRECISION,
            source TEXT NOT NULL DEFAULT 'Finnhub',
            filing_url TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(symbol, report_date)
        );
        CREATE INDEX IF NOT EXISTS idx_earnings_date ON sotw_earnings_releases(report_date);
        CREATE INDEX IF NOT EXISTS idx_earnings_symbol ON sotw_earnings_releases(symbol);
    """)

    print(f"Schema ready. Processing {len(FRED_SERIES)} FRED series...", flush=True)

    stored = 0
    updated = 0
    errors = 0

    for series_id, release_id, name, category, impact, release_time in FRED_SERIES:
        print(f"  {series_id:12s} {name:40s}", end=" ", flush=True)

        # 1. Get release dates (when this data was published)
        release_dates = fetch_release_dates(release_id, limit=6)
        if not release_dates:
            print("⚠ no release dates")
            errors += 1
            time.sleep(0.3)
            continue

        # 2. Get recent observations (actual values)
        observations = fetch_observations(series_id, limit=6)
        if not observations:
            print("⚠ no observations")
            errors += 1
            time.sleep(0.3)
            continue

        # 3. Store each release date with its corresponding observation
        # The most recent observation corresponds to the most recent release date
        for i, obs in enumerate(observations[:5]):
            obs_date = obs["date"]
            actual_display, actual_num = format_value(series_id, obs["value"])
            ref_period = get_ref_period(obs_date)

            # Match to nearest release date (release dates are when data was published)
            # Release date should be >= observation date
            rel_date = release_dates[i] if i < len(release_dates) else None
            if not rel_date:
                continue

            # Previous = next older observation
            prev_display = None
            prev_num = None
            if i + 1 < len(observations):
                prev_display, prev_num = format_value(series_id, observations[i + 1]["value"])

            # Check for revision: if we already have this release_date stored,
            # and the actual changed, record the revision
            revised_display = None
            revised_num = None
            cur.execute(
                "SELECT actual, actual_numeric FROM sotw_macro_releases WHERE series_id = %s AND release_date = %s",
                (series_id, rel_date)
            )
            existing = cur.fetchone()
            if existing and existing[1] is not None and actual_num is not None:
                if abs(existing[1] - actual_num) > 0.001:
                    revised_display = existing[0]
                    revised_num = existing[1]

            # Upsert
            cur.execute("""
                INSERT INTO sotw_macro_releases
                    (series_id, country, name, category, impact, release_date, release_time,
                     actual, actual_numeric, previous, previous_numeric,
                     revised, revised_numeric,
                     source, source_url, ref_period, updated_at)
                VALUES (%s, 'US', %s, %s, %s, %s, %s,
                        %s, %s, %s, %s,
                        %s, %s,
                        'FRED', %s, %s, NOW())
                ON CONFLICT (series_id, release_date) DO UPDATE SET
                    actual = EXCLUDED.actual,
                    actual_numeric = EXCLUDED.actual_numeric,
                    previous = EXCLUDED.previous,
                    previous_numeric = EXCLUDED.previous_numeric,
                    revised = COALESCE(EXCLUDED.revised, sotw_macro_releases.revised),
                    revised_numeric = COALESCE(EXCLUDED.revised_numeric, sotw_macro_releases.revised_numeric),
                    updated_at = NOW()
            """, (
                series_id, name, category, impact, rel_date, release_time,
                actual_display, actual_num, prev_display, prev_num,
                revised_display, revised_num,
                f"https://fred.stlouisfed.org/series/{series_id}",
                ref_period,
            ))

            if existing:
                updated += 1
            else:
                stored += 1

        print(f"✓ {len(observations)} obs, {len(release_dates)} dates", flush=True)
        time.sleep(0.3)  # FRED rate limit: 120 req/min

    cur.close()
    conn.close()

    print(f"\n=== Done: {stored} new, {updated} updated, {errors} errors ===", flush=True)
    print(f"Total series: {len(FRED_SERIES)} | FRED API calls: ~{len(FRED_SERIES) * 2}", flush=True)


if __name__ == "__main__":
    main()
