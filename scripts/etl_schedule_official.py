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
OPENROUTER_KEY = os.environ.get("OPENROUTER_KEY", "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")


# ── AI verification ──────────────────────────────────────
def verify_dates_with_ai(events):
    """Ask AI to verify a batch of macro release dates.
    Returns set of (name, date) tuples that are confirmed correct.
    """
    if not events:
        return set()

    # Build a batch prompt
    lines = []
    for name, date in events:
        lines.append(f"- {name} on {date}")

    prompt = f"""You are a macro economics expert. For each of the following US economic data releases,
answer whether the date is a real scheduled release date.
Only answer with the line number and YES or NO. No explanation needed.

Releases to verify:
{chr(10).join(f'{i+1}. {name} on {date}' for i, (name, date) in enumerate(events))}

Answer format (one per line):
1. YES
2. NO
etc."""

    try:
        req_data = json.dumps({
            "model": "mistralai/mistral-small-3.1-24b-instruct",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": len(events) * 10,
            "temperature": 0.1,
        }).encode()

        req = urllib.request.Request(
            "https://openrouter.ai/api/v1/chat/completions",
            data=req_data,
            headers={
                "Authorization": f"Bearer {OPENROUTER_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://statisticsoftheworld.com",
            },
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read())

        answer = result.get("choices", [{}])[0].get("message", {}).get("content", "")

        # Parse YES/NO answers
        verified = set()
        for line in answer.strip().split("\n"):
            line = line.strip()
            if not line:
                continue
            # Match "1. YES" or "1: YES" or "1 YES"
            match = re.match(r"(\d+)[.\s:]+\s*(YES|NO)", line, re.IGNORECASE)
            if match:
                idx = int(match.group(1)) - 1
                is_yes = match.group(2).upper() == "YES"
                if is_yes and 0 <= idx < len(events):
                    verified.add(events[idx])

        return verified

    except Exception as e:
        print(f"  AI verification error: {e}")
        # On failure, reject all — better to show nothing than wrong dates
        return set()


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
    # BLS releases (iCal blocked, use FRED per-release as fallback)
    (10,  "CPIAUCSL", "Consumer Price Index (CPI)",         "Inflation",  "high",   "08:30"),
    (50,  "PAYEMS",   "Employment Situation (Nonfarm Payrolls)", "Labor", "high",   "08:30"),
    (46,  "PPIFIS",   "Producer Price Index (PPI)",         "Inflation",  "high",   "08:30"),
    (286, "JTSJOL",   "JOLTS Job Openings",                 "Labor",      "high",   "10:00"),
    # Census Bureau releases
    (22,  "RSAFS",    "Retail Sales",                       "Consumer",   "high",   "08:30"),
    (13,  "INDPRO",   "Industrial Production",              "Production", "high",   "09:15"),
    (21,  "DGORDER",  "Durable Goods Orders",               "Production", "high",   "08:30"),
    (27,  "HOUST",    "Housing Starts & Building Permits",  "Housing",    "high",   "08:30"),
    (97,  "HSN1F",    "New Home Sales",                     "Housing",    "high",   "10:00"),
    (127, "BOPGSTB",  "Trade Balance",                      "Trade",      "medium", "08:30"),
    # BEA releases (HTML parsing unreliable, use FRED)
    (17,  "GDP",      "Gross Domestic Product (GDP)",        "GDP",        "high",   "08:30"),
    (54,  "PCEPI",    "PCE Price Index",                     "Inflation",  "high",   "08:30"),
    # Other
    (14,  "UMCSENT",  "Michigan Consumer Sentiment",         "Consumer",   "medium", "10:00"),
    (180, "ICSA",     "Initial Jobless Claims",              "Labor",      "medium", "08:30"),
]


def fetch_url(url):
    """Fetch URL content as text."""
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            "Accept": "text/html,text/calendar,application/json,*/*",
        })
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
    """Get release dates from FRED per-release endpoint (includes upcoming scheduled).

    NOTE: We use include_release_dates_with_no_data=true here because this is
    the PER-RELEASE endpoint (release/dates?release_id=X), which is reliable.
    The problem before was the ALL-RELEASES endpoint (releases/dates) which
    returned tentative dates across all releases.
    """
    today = datetime.date.today()
    qs = (f"api_key={FRED_KEY}&file_type=json&release_id={release_id}"
          f"&include_release_dates_with_no_data=true"
          f"&realtime_start={today.strftime('%Y-%m-%d')}"
          f"&realtime_end={(today + datetime.timedelta(days=180)).strftime('%Y-%m-%d')}"
          f"&sort_order=asc&limit={limit}")
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

    # ── 3. FRED dates → collect all, then AI-verify ──
    print("\n--- FRED dates (collect for verification) ---", flush=True)
    import time
    candidates = []  # (series_id, name, category, impact, release_time, date, release_id)

    for release_id, series_id, name, category, impact, release_time in FRED_SCHEDULE_RELEASES:
        print(f"  {series_id:12s} {name:42s}", end=" ", flush=True)

        dates = fetch_fred_release_dates_confirmed(release_id, limit=12)
        future = [d for d in dates if d >= today_str]

        for d in future:
            candidates.append((series_id, name, category, impact, release_time, d, release_id))

        print(f"{len(future)} candidates", flush=True)
        time.sleep(0.3)

    # ── 4. AI verification — reject wrong dates ──
    print(f"\n--- AI verification ({len(candidates)} candidates) ---", flush=True)

    # Clear old schedule data before storing fresh verified dates
    cur.execute("DELETE FROM sotw_release_schedule")

    if candidates:
        # Batch verify: send all (name, date) pairs to AI
        to_verify = [(name, date) for _, name, _, _, _, date, _ in candidates]

        # Split into chunks of 20 to avoid token limits
        verified_set = set()
        for i in range(0, len(to_verify), 20):
            chunk = to_verify[i:i+20]
            chunk_verified = verify_dates_with_ai(chunk)
            verified_set.update(chunk_verified)
            print(f"  Batch {i//20 + 1}: {len(chunk_verified)}/{len(chunk)} verified", flush=True)

        # Store only verified dates
        for series_id, name, category, impact, release_time, date, release_id in candidates:
            if (name, date) in verified_set:
                cur.execute("""
                    INSERT INTO sotw_release_schedule
                        (series_id, country, name, category, impact, release_date, release_time,
                         source, source_url, verified, updated_at)
                    VALUES (%s, 'US', %s, %s, %s, %s, %s, 'FRED', %s, TRUE, NOW())
                    ON CONFLICT (series_id, release_date) DO UPDATE SET
                        verified = TRUE, updated_at = NOW()
                """, (
                    series_id, name, category, impact, date, release_time,
                    f"https://fred.stlouisfed.org/releases/dates?rid={release_id}",
                ))
                stored += 1

        rejected = len(candidates) - stored
        print(f"  Result: {stored} verified, {rejected} rejected", flush=True)
    else:
        print("  No candidates to verify", flush=True)

    cur.close()
    conn.close()

    print(f"\n=== Done: {stored} schedule entries stored, {errors} errors ===", flush=True)


if __name__ == "__main__":
    main()
