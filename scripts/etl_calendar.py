#!/usr/bin/env python3
"""
ETL: ForexFactory economic calendar → Supabase

Fetches the current week's economic calendar from ForexFactory's free JSON feed.
This is more accurate than FRED's releases/dates API which returns tentative dates.

Source: https://nfs.faireconomy.media/ff_calendar_thisweek.json
Schedule: Weekly (Monday 6 AM UTC), before calendar cache warm
Runtime: ~5 seconds
"""

import json
import os
import sys
import urllib.request

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "aws-1-ca-central-1.pooler.supabase.com")
DB_PORT = int(os.environ.get("SUPABASE_DB_PORT", "6543"))
DB_USER = os.environ.get("SUPABASE_DB_USER", "postgres.seyrycaldytfjvvkqopu")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")

FF_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json"

# Map ForexFactory currency codes to display country codes
CURRENCY_TO_COUNTRY = {
    "USD": "US", "EUR": "EU", "GBP": "UK", "JPY": "JP", "CNY": "CN",
    "CAD": "CA", "AUD": "AU", "NZD": "NZ", "CHF": "CH", "KRW": "KR",
    "INR": "IN", "BRL": "BR", "MXN": "MX", "ZAR": "ZA", "SGD": "SG",
    "HKD": "HK", "SEK": "SE", "NOK": "NO", "DKK": "DK",
}

# Map ForexFactory impact to our impact levels
IMPACT_MAP = {
    "High": "high",
    "Medium": "medium",
    "Low": "low",
    "Holiday": "low",
    "": "low",
}

# Categorize events by keyword
def categorize(title):
    title_lower = title.lower()
    if any(k in title_lower for k in ["cpi", "ppi", "inflation", "pce", "price"]):
        return "Inflation"
    if any(k in title_lower for k in ["employment", "payroll", "jobless", "unemployment", "labor", "jobs", "adp"]):
        return "Labor"
    if any(k in title_lower for k in ["gdp", "growth"]):
        return "GDP"
    if any(k in title_lower for k in ["rate decision", "interest rate", "fomc", "monetary policy", "central bank"]):
        return "Central Bank"
    if any(k in title_lower for k in ["housing", "home sale", "building permit", "mortgage"]):
        return "Housing"
    if any(k in title_lower for k in ["retail", "consumer", "spending", "confidence", "sentiment"]):
        return "Consumer"
    if any(k in title_lower for k in ["manufacturing", "pmi", "industrial", "production", "factory"]):
        return "Production"
    if any(k in title_lower for k in ["trade", "export", "import", "current account", "balance"]):
        return "Trade"
    if any(k in title_lower for k in ["bond", "treasury", "auction", "yield"]):
        return "Fixed Income"
    if any(k in title_lower for k in ["speaks", "speech", "testimony", "press conference"]):
        return "Speech"
    return "Other"


def main():
    if not DB_PASS:
        print("SUPABASE_DB_PASSWORD not set")
        sys.exit(1)

    import psycopg2

    print("=== ForexFactory Calendar ETL ===", flush=True)

    # 1. Fetch ForexFactory data
    print("Fetching ForexFactory calendar...", end=" ", flush=True)
    try:
        req = urllib.request.Request(FF_URL, headers={"User-Agent": "SOTW/2.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = json.loads(resp.read())
    except Exception as e:
        print(f"Failed: {e}")
        sys.exit(1)

    print(f"{len(raw)} events", flush=True)

    # 2. Transform events
    events = []
    for e in raw:
        title = e.get("title", "")
        currency = e.get("country", "")
        date_str = e.get("date", "")  # ISO format: 2026-03-24T08:30:00-04:00
        impact = e.get("impact", "")
        forecast = e.get("forecast", "")
        previous = e.get("previous", "")

        if not title or not date_str:
            continue

        # Extract date (YYYY-MM-DD) from ISO datetime
        date = date_str[:10]
        time = date_str[11:16] if len(date_str) > 11 else ""

        country = CURRENCY_TO_COUNTRY.get(currency, currency[:2] if currency else "")
        category = categorize(title)

        events.append({
            "date": date,
            "time": time,
            "title": title,
            "country": country,
            "currency": currency,
            "impact": IMPACT_MAP.get(impact, "low"),
            "category": category,
            "forecast": forecast,
            "previous": previous,
        })

    print(f"Transformed {len(events)} events", flush=True)

    # 3. Get week range from events
    if not events:
        print("No events to store")
        return

    dates = sorted(set(e["date"] for e in events))
    week_start = dates[0]
    week_end = dates[-1]
    print(f"Week: {week_start} to {week_end}", flush=True)

    # 4. Store in Supabase
    conn = psycopg2.connect(
        host=DB_HOST, dbname="postgres", user=DB_USER,
        password=DB_PASS, port=DB_PORT
    )
    conn.autocommit = True
    cur = conn.cursor()

    # Create table if not exists
    cur.execute("""
        CREATE TABLE IF NOT EXISTS sotw_calendar_events (
            id SERIAL PRIMARY KEY,
            date DATE NOT NULL,
            time TEXT,
            title TEXT NOT NULL,
            country TEXT,
            currency TEXT,
            impact TEXT,
            category TEXT,
            forecast TEXT,
            previous TEXT,
            week_start DATE NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_calendar_date ON sotw_calendar_events(date);
        CREATE INDEX IF NOT EXISTS idx_calendar_week ON sotw_calendar_events(week_start);
    """)

    # Delete existing events for this week (replace with fresh data)
    cur.execute("DELETE FROM sotw_calendar_events WHERE week_start = %s", (week_start,))

    # Insert new events
    from psycopg2.extras import execute_values
    values = [
        (e["date"], e["time"], e["title"], e["country"], e["currency"],
         e["impact"], e["category"], e["forecast"], e["previous"], week_start)
        for e in events
    ]
    execute_values(cur, """
        INSERT INTO sotw_calendar_events
            (date, time, title, country, currency, impact, category, forecast, previous, week_start)
        VALUES %s
    """, values)

    # Count by impact
    high = sum(1 for e in events if e["impact"] == "high")
    med = sum(1 for e in events if e["impact"] == "medium")
    low = sum(1 for e in events if e["impact"] == "low")
    countries = len(set(e["country"] for e in events))

    cur.close()
    conn.close()

    print(f"Stored {len(events)} events ({high} high, {med} medium, {low} low) for {countries} countries", flush=True)
    print("=== Done ===")


if __name__ == "__main__":
    main()
