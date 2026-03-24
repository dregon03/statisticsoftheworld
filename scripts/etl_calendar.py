#!/usr/bin/env python3
"""
ETL: ForexFactory economic calendar + Finnhub earnings → Supabase

1. ForexFactory: Current week's verified economic events
   Source: https://nfs.faireconomy.media/ff_calendar_thisweek.json

2. Finnhub: Major company earnings dates (next 90 days)
   Source: https://finnhub.io/api/v1/calendar/earnings
   Free tier: 60 calls/min

Schedule: Weekly (Monday 6 AM UTC) + Daily 7 AM UTC
Runtime: ~5 seconds
"""

import datetime
import json
import os
import sys
import urllib.request

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "aws-1-ca-central-1.pooler.supabase.com")
DB_PORT = int(os.environ.get("SUPABASE_DB_PORT", "6543"))
DB_USER = os.environ.get("SUPABASE_DB_USER", "postgres.seyrycaldytfjvvkqopu")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")

FF_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json"
FINNHUB_KEY = os.environ.get("FINNHUB_KEY", "d6vl62hr01qiiutc8p6gd6vl62hr01qiiutc8p70")

# Map ForexFactory currency codes to display country codes
CURRENCY_TO_COUNTRY = {
    "USD": "US", "EUR": "EU", "GBP": "UK", "JPY": "JP", "CNY": "CN",
    "CAD": "CA", "AUD": "AU", "NZD": "NZ", "CHF": "CH", "KRW": "KR",
    "INR": "IN", "BRL": "BR", "MXN": "MX", "ZAR": "ZA", "SGD": "SG",
    "HKD": "HK", "SEK": "SE", "NOK": "NO", "DKK": "DK",
}

IMPACT_MAP = {
    "High": "high",
    "Medium": "medium",
    "Low": "low",
    "Holiday": "low",
    "": "low",
}

# Major companies to track for earnings
MAJOR_SYMBOLS = {
    # Mag 7
    "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA",
    # Big Tech
    "AVGO", "CRM", "ORCL", "ADBE", "AMD", "INTC", "CSCO", "QCOM", "TXN",
    "NOW", "NFLX", "SHOP", "SNOW", "NET", "PLTR", "UBER", "ABNB",
    # Finance
    "JPM", "GS", "MS", "BAC", "WFC", "C", "V", "MA", "PYPL", "SQ", "COIN",
    # Consumer/Retail
    "WMT", "COST", "HD", "MCD", "SBUX", "NKE", "DIS",
    # Healthcare
    "UNH", "JNJ", "PFE", "ABBV", "LLY", "MRK", "TMO",
    # Industrial/Energy
    "XOM", "CVX", "BA", "CAT", "GE", "DE",
    # Consumer Staples
    "KO", "PEP", "PG",
}


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


def fetch_forexfactory():
    """Fetch current week's economic events from ForexFactory."""
    print("Fetching ForexFactory calendar...", end=" ", flush=True)
    try:
        req = urllib.request.Request(FF_URL, headers={"User-Agent": "SOTW/2.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = json.loads(resp.read())
    except Exception as e:
        print(f"Failed: {e}")
        return []

    print(f"{len(raw)} raw events", flush=True)

    events = []
    for e in raw:
        title = e.get("title", "")
        currency = e.get("country", "")
        date_str = e.get("date", "")
        impact = e.get("impact", "")
        forecast = e.get("forecast", "")
        previous = e.get("previous", "")

        if not title or not date_str:
            continue

        date = date_str[:10]
        time = date_str[11:16] if len(date_str) > 11 else ""
        country = CURRENCY_TO_COUNTRY.get(currency, currency[:2] if currency else "")

        events.append({
            "date": date,
            "time": time,
            "title": title,
            "country": country,
            "currency": currency,
            "impact": IMPACT_MAP.get(impact, "low"),
            "category": categorize(title),
            "event_type": "economic",
            "forecast": forecast,
            "previous": previous,
            "symbol": "",
            "eps_estimate": None,
            "revenue_estimate": None,
        })

    return events


def fetch_finnhub_earnings():
    """Fetch major company earnings dates from Finnhub (next 90 days)."""
    today = datetime.date.today()
    from_date = today.strftime("%Y-%m-%d")
    to_date = (today + datetime.timedelta(days=90)).strftime("%Y-%m-%d")

    print(f"Fetching Finnhub earnings ({from_date} to {to_date})...", end=" ", flush=True)
    url = f"https://finnhub.io/api/v1/calendar/earnings?from={from_date}&to={to_date}&token={FINNHUB_KEY}"

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "SOTW/2.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
    except Exception as e:
        print(f"Failed: {e}")
        return []

    all_earnings = data.get("earningsCalendar", [])
    print(f"{len(all_earnings)} total", end=" ", flush=True)

    # Filter to major companies only
    major = [e for e in all_earnings if e.get("symbol") in MAJOR_SYMBOLS]
    print(f"→ {len(major)} major companies", flush=True)

    events = []
    for e in major:
        symbol = e.get("symbol", "")
        eps = e.get("epsEstimate")
        rev = e.get("revenueEstimate")

        events.append({
            "date": e.get("date", ""),
            "time": "",
            "title": f"{symbol} Earnings Report",
            "country": "US",
            "currency": "USD",
            "impact": "high",
            "category": "Earnings",
            "event_type": "earnings",
            "forecast": f"EPS ${eps:.2f}" if eps is not None else "",
            "previous": "",
            "symbol": symbol,
            "eps_estimate": eps,
            "revenue_estimate": rev,
        })

    return events


def main():
    if not DB_PASS:
        print("SUPABASE_DB_PASSWORD not set")
        sys.exit(1)

    import psycopg2
    from psycopg2.extras import execute_values

    print("=== Calendar ETL (ForexFactory + Finnhub Earnings) ===", flush=True)

    # 1. Fetch both sources
    ff_events = fetch_forexfactory()
    earnings_events = fetch_finnhub_earnings()

    all_events = ff_events + earnings_events
    if not all_events:
        print("No events to store")
        return

    # 2. Connect to DB
    conn = psycopg2.connect(
        host=DB_HOST, dbname="postgres", user=DB_USER,
        password=DB_PASS, port=DB_PORT
    )
    conn.autocommit = True
    cur = conn.cursor()

    # Create table if not exists (includes all columns)
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
            week_start DATE,
            event_type TEXT DEFAULT 'economic',
            symbol TEXT,
            eps_estimate DOUBLE PRECISION,
            revenue_estimate DOUBLE PRECISION,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    """)

    # Migrate existing table: add new columns if they don't exist
    for col, typ in [
        ("event_type", "TEXT DEFAULT 'economic'"),
        ("symbol", "TEXT"),
        ("eps_estimate", "DOUBLE PRECISION"),
        ("revenue_estimate", "DOUBLE PRECISION"),
    ]:
        try:
            cur.execute(f"ALTER TABLE sotw_calendar_events ADD COLUMN IF NOT EXISTS {col} {typ}")
        except Exception:
            pass

    # Create indexes after columns exist
    cur.execute("""
        CREATE INDEX IF NOT EXISTS idx_calendar_date ON sotw_calendar_events(date);
        CREATE INDEX IF NOT EXISTS idx_calendar_week ON sotw_calendar_events(week_start);
        CREATE INDEX IF NOT EXISTS idx_calendar_type ON sotw_calendar_events(event_type);
    """)

    # 3. Store ForexFactory events (replace current week)
    if ff_events:
        dates = sorted(set(e["date"] for e in ff_events))
        week_start = dates[0]
        print(f"ForexFactory week: {dates[0]} to {dates[-1]}", flush=True)

        cur.execute(
            "DELETE FROM sotw_calendar_events WHERE week_start = %s AND event_type = 'economic'",
            (week_start,)
        )

        values = [
            (e["date"], e["time"], e["title"], e["country"], e["currency"],
             e["impact"], e["category"], e["forecast"], e["previous"],
             week_start, "economic", "", None, None)
            for e in ff_events
        ]
        execute_values(cur, """
            INSERT INTO sotw_calendar_events
                (date, time, title, country, currency, impact, category,
                 forecast, previous, week_start, event_type, symbol, eps_estimate, revenue_estimate)
            VALUES %s
        """, values)

        high = sum(1 for e in ff_events if e["impact"] == "high")
        print(f"  Stored {len(ff_events)} economic events ({high} high impact)", flush=True)

    # 4. Store earnings events (replace all future earnings)
    if earnings_events:
        today = datetime.date.today().strftime("%Y-%m-%d")
        cur.execute(
            "DELETE FROM sotw_calendar_events WHERE event_type = 'earnings' AND date >= %s",
            (today,)
        )

        values = [
            (e["date"], e["time"], e["title"], e["country"], e["currency"],
             e["impact"], e["category"], e["forecast"], e["previous"],
             None, "earnings", e["symbol"], e["eps_estimate"], e["revenue_estimate"])
            for e in earnings_events
        ]
        execute_values(cur, """
            INSERT INTO sotw_calendar_events
                (date, time, title, country, currency, impact, category,
                 forecast, previous, week_start, event_type, symbol, eps_estimate, revenue_estimate)
            VALUES %s
        """, values)

        # Show upcoming earnings
        for e in sorted(earnings_events, key=lambda x: x["date"])[:10]:
            eps_str = f"EPS ${e['eps_estimate']:.2f}" if e["eps_estimate"] else ""
            rev_str = ""
            if e["revenue_estimate"] and e["revenue_estimate"] > 0:
                if e["revenue_estimate"] >= 1e9:
                    rev_str = f"Rev ${e['revenue_estimate']/1e9:.1f}B"
                else:
                    rev_str = f"Rev ${e['revenue_estimate']/1e6:.0f}M"
            print(f"  {e['date']}  {e['symbol']:6s}  {eps_str}  {rev_str}", flush=True)

        print(f"  Stored {len(earnings_events)} earnings events", flush=True)

    cur.close()
    conn.close()

    total = len(ff_events) + len(earnings_events)
    print(f"\nTotal: {total} events stored ({len(ff_events)} economic + {len(earnings_events)} earnings)", flush=True)
    print("=== Done ===")


if __name__ == "__main__":
    main()
