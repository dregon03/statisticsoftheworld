#!/usr/bin/env python3
"""
ETL: Official release schedules → Supabase

Parses machine-readable schedules from official statistical agencies:
  - BLS: iCal feeds per release (Employment, CPI, PPI, etc.)
  - BEA: Schedule page (GDP, PCE, Personal Income)

These are the CONFIRMED future dates — no tentative/estimated dates.
Stores in sotw_release_schedule table, which the calendar API reads
for upcoming events.

Schedule: Weekly Monday 6 AM UTC
Runtime: ~10 seconds
"""

import datetime
import json
import os
import re
import sys
import urllib.request

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "aws-1-ca-central-1.pooler.supabase.com")
DB_PORT = int(os.environ.get("SUPABASE_DB_PORT", "6543"))
DB_USER = os.environ.get("SUPABASE_DB_USER", "postgres.seyrycaldytfjvvkqopu")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")

# ── BLS iCal feeds ──────────────────────────────────────
# Each BLS release has its own .ics file
# https://www.bls.gov/schedule/news_release/
BLS_RELEASES = [
    {
        "ics_url": "https://www.bls.gov/schedule/news_release/empsit.ics",
        "name": "Employment Situation (Nonfarm Payrolls)",
        "category": "Labor",
        "impact": "high",
        "time": "08:30",
        "series_id": "PAYEMS",
    },
    {
        "ics_url": "https://www.bls.gov/schedule/news_release/cpi.ics",
        "name": "Consumer Price Index (CPI)",
        "category": "Inflation",
        "impact": "high",
        "time": "08:30",
        "series_id": "CPIAUCSL",
    },
    {
        "ics_url": "https://www.bls.gov/schedule/news_release/ppi.ics",
        "name": "Producer Price Index (PPI)",
        "category": "Inflation",
        "impact": "high",
        "time": "08:30",
        "series_id": "PPIFIS",
    },
    {
        "ics_url": "https://www.bls.gov/schedule/news_release/jolts.ics",
        "name": "JOLTS Job Openings",
        "category": "Labor",
        "impact": "high",
        "time": "10:00",
        "series_id": "JTSJOL",
    },
    {
        "ics_url": "https://www.bls.gov/schedule/news_release/prod.ics",
        "name": "Productivity & Costs",
        "category": "Labor",
        "impact": "medium",
        "time": "08:30",
        "series_id": "PROD",
    },
    {
        "ics_url": "https://www.bls.gov/schedule/news_release/ximpim.ics",
        "name": "Import/Export Price Indexes",
        "category": "Trade",
        "impact": "medium",
        "time": "08:30",
        "series_id": "XIMPIM",
    },
]

# ── BEA releases (parsed from schedule page) ──────────────
BEA_RELEASES = [
    {
        "name": "Gross Domestic Product (GDP)",
        "category": "GDP",
        "impact": "high",
        "time": "08:30",
        "series_id": "GDP",
        "bea_keyword": "Gross Domestic Product",
    },
    {
        "name": "Personal Income & Outlays (PCE)",
        "category": "Inflation",
        "impact": "high",
        "time": "08:30",
        "series_id": "PCEPI",
        "bea_keyword": "Personal Income",
    },
]

# ── Other official schedule sources ──────────────────────
# Census Bureau releases (Retail Sales, Housing, Durable Goods, Trade Balance, New Home Sales)
# These don't have clean iCal feeds, so we use FRED confirmed release dates
FRED_KEY = os.environ.get("FRED_API_KEY", "74b554c354e549e1e3087a689608fc29")

FRED_SCHEDULE_RELEASES = [
    (22,  "RSAFS",   "Retail Sales",                    "Consumer",   "high",   "08:30"),
    (13,  "INDPRO",  "Industrial Production",            "Production", "high",   "09:15"),
    (21,  "DGORDER", "Durable Goods Orders",             "Production", "high",   "08:30"),
    (27,  "HOUST",   "Housing Starts & Building Permits","Housing",    "high",   "08:30"),
    (97,  "HSN1F",   "New Home Sales",                   "Housing",    "high",   "10:00"),
    (127, "BOPGSTB", "Trade Balance",                    "Trade",      "medium", "08:30"),
    (14,  "UMCSENT", "Michigan Consumer Sentiment",      "Consumer",   "medium", "10:00"),
    (180, "ICSA",    "Initial Jobless Claims",           "Labor",      "medium", "08:30"),
]


def fetch_url(url):
    """Fetch URL content as text."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "SOTW/2.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"  Fetch error: {e}")
        return None


def parse_ics_dates(ics_text):
    """Extract DTSTART dates from iCal text. Returns list of 'YYYY-MM-DD' strings."""
    if not ics_text:
        return []
    dates = []
    for match in re.finditer(r"DTSTART[^:]*:(\d{8})", ics_text):
        raw = match.group(1)
        try:
            d = datetime.date(int(raw[:4]), int(raw[4:6]), int(raw[6:8]))
            dates.append(d.isoformat())
        except ValueError:
            continue
    return sorted(set(dates))


def fetch_fred_release_dates_confirmed(release_id, limit=12):
    """Get confirmed release dates from FRED (NO tentative flag)."""
    qs = f"api_key={FRED_KEY}&file_type=json&release_id={release_id}&sort_order=desc&limit={limit}"
    url = f"https://api.stlouisfed.org/fred/release/dates?{qs}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "SOTW/2.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
        return [rd["date"] for rd in data.get("release_dates", [])]
    except Exception as e:
        print(f"  FRED error: {e}")
        return []


def main():
    if not DB_PASS:
        print("SUPABASE_DB_PASSWORD not set")
        sys.exit(1)

    import psycopg2

    print("=== Official Schedule ETL (BLS + BEA + FRED) ===", flush=True)

    conn = psycopg2.connect(
        host=DB_HOST, dbname="postgres", user=DB_USER,
        password=DB_PASS, port=DB_PORT
    )
    conn.autocommit = True
    cur = conn.cursor()

    # Create schedule table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS sotw_release_schedule (
            id SERIAL PRIMARY KEY,
            series_id TEXT NOT NULL,
            country TEXT NOT NULL DEFAULT 'US',
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            impact TEXT DEFAULT 'medium',
            release_date DATE NOT NULL,
            release_time TEXT,
            source TEXT NOT NULL,
            source_url TEXT,
            verified BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(series_id, release_date)
        );
        CREATE INDEX IF NOT EXISTS idx_schedule_date ON sotw_release_schedule(release_date);
        CREATE INDEX IF NOT EXISTS idx_schedule_series ON sotw_release_schedule(series_id);
    """)

    today = datetime.date.today()
    today_str = today.isoformat()
    stored = 0
    errors = 0

    # ── 1. BLS iCal feeds ──────────────────────────────
    print("\n--- BLS iCal feeds ---", flush=True)
    for rel in BLS_RELEASES:
        print(f"  {rel['series_id']:12s} {rel['name']:42s}", end=" ", flush=True)
        ics_text = fetch_url(rel["ics_url"])
        if not ics_text:
            print("⚠ fetch failed")
            errors += 1
            continue

        dates = parse_ics_dates(ics_text)
        # Only store future dates
        future = [d for d in dates if d >= today_str]

        for d in future:
            cur.execute("""
                INSERT INTO sotw_release_schedule
                    (series_id, country, name, category, impact, release_date, release_time,
                     source, source_url, verified, updated_at)
                VALUES (%s, 'US', %s, %s, %s, %s, %s, 'BLS', %s, TRUE, NOW())
                ON CONFLICT (series_id, release_date) DO UPDATE SET
                    verified = TRUE, source = 'BLS', updated_at = NOW()
            """, (
                rel["series_id"], rel["name"], rel["category"], rel["impact"],
                d, rel["time"], rel["ics_url"],
            ))
            stored += 1

        print(f"✓ {len(future)} upcoming ({len(dates)} total in feed)", flush=True)

    # ── 2. BEA schedule (parse HTML) ──────────────────────
    print("\n--- BEA schedule ---", flush=True)
    bea_html = fetch_url("https://www.bea.gov/news/schedule")
    if bea_html:
        # BEA schedule page has dates in various formats
        # Look for date patterns near known release names
        for rel in BEA_RELEASES:
            print(f"  {rel['series_id']:12s} {rel['name']:42s}", end=" ", flush=True)

            # Find dates near the keyword in the HTML
            # BEA uses formats like "March 27, 2026" or "2026-03-27"
            bea_dates = []
            # Try to find month/day/year patterns
            pattern = r"(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})"
            for match in re.finditer(pattern, bea_html):
                month_name, day, year = match.group(1), int(match.group(2)), int(match.group(3))
                month_map = {
                    "January": 1, "February": 2, "March": 3, "April": 4,
                    "May": 5, "June": 6, "July": 7, "August": 8,
                    "September": 9, "October": 10, "November": 11, "December": 12,
                }
                try:
                    d = datetime.date(year, month_map[month_name], day)
                    if d >= today:
                        bea_dates.append(d.isoformat())
                except ValueError:
                    continue

            # Check which dates are near the keyword (within 200 chars)
            keyword_pos = bea_html.lower().find(rel["bea_keyword"].lower())
            if keyword_pos >= 0:
                nearby_text = bea_html[max(0, keyword_pos - 100):keyword_pos + 500]
                nearby_dates = []
                for match in re.finditer(pattern, nearby_text):
                    month_name, day, year = match.group(1), int(match.group(2)), int(match.group(3))
                    month_map = {
                        "January": 1, "February": 2, "March": 3, "April": 4,
                        "May": 5, "June": 6, "July": 7, "August": 8,
                        "September": 9, "October": 10, "November": 11, "December": 12,
                    }
                    try:
                        d = datetime.date(year, month_map[month_name], day)
                        if d >= today:
                            nearby_dates.append(d.isoformat())
                    except ValueError:
                        continue

                for d in nearby_dates[:6]:
                    cur.execute("""
                        INSERT INTO sotw_release_schedule
                            (series_id, country, name, category, impact, release_date, release_time,
                             source, source_url, verified, updated_at)
                        VALUES (%s, 'US', %s, %s, %s, %s, %s, 'BEA', 'https://www.bea.gov/news/schedule', TRUE, NOW())
                        ON CONFLICT (series_id, release_date) DO UPDATE SET
                            verified = TRUE, source = 'BEA', updated_at = NOW()
                    """, (
                        rel["series_id"], rel["name"], rel["category"], rel["impact"],
                        d, rel["time"],
                    ))
                    stored += 1

                print(f"✓ {len(nearby_dates)} upcoming", flush=True)
            else:
                print("⚠ keyword not found on page", flush=True)
                errors += 1
    else:
        print("  ⚠ BEA page fetch failed")
        errors += 1

    # ── 3. FRED confirmed release dates (Census Bureau releases) ──
    print("\n--- FRED confirmed dates (Census/Fed) ---", flush=True)
    import time
    for release_id, series_id, name, category, impact, release_time in FRED_SCHEDULE_RELEASES:
        print(f"  {series_id:12s} {name:42s}", end=" ", flush=True)

        dates = fetch_fred_release_dates_confirmed(release_id, limit=12)
        future = [d for d in dates if d >= today_str]

        for d in future:
            cur.execute("""
                INSERT INTO sotw_release_schedule
                    (series_id, country, name, category, impact, release_date, release_time,
                     source, source_url, verified, updated_at)
                VALUES (%s, 'US', %s, %s, %s, %s, %s, 'FRED', %s, TRUE, NOW())
                ON CONFLICT (series_id, release_date) DO UPDATE SET
                    verified = TRUE, updated_at = NOW()
            """, (
                series_id, name, category, impact, d, release_time,
                f"https://fred.stlouisfed.org/releases/dates?rid={release_id}",
            ))
            stored += 1

        print(f"✓ {len(future)} upcoming ({len(dates)} total)", flush=True)
        time.sleep(0.3)

    cur.close()
    conn.close()

    print(f"\n=== Done: {stored} schedule entries stored, {errors} errors ===", flush=True)


if __name__ == "__main__":
    main()
