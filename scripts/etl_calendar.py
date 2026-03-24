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
# (symbol, company_name, country, exchange, ir_url, disclosure_url)
EARNINGS_WATCHLIST = [
    # ── US (50 names) — SEC EDGAR: https://efts.sec.gov/LATEST/search-index?q= ──
    # Mag 7
    ("AAPL",  "Apple",              "US", "NASDAQ", "https://investor.apple.com", ""),
    ("MSFT",  "Microsoft",          "US", "NASDAQ", "https://www.microsoft.com/en-us/investor", ""),
    ("GOOGL", "Alphabet",           "US", "NASDAQ", "https://abc.xyz/investor/", ""),
    ("AMZN",  "Amazon",             "US", "NASDAQ", "https://ir.aboutamazon.com", ""),
    ("NVDA",  "NVIDIA",             "US", "NASDAQ", "https://investor.nvidia.com", ""),
    ("META",  "Meta Platforms",     "US", "NASDAQ", "https://investor.fb.com", ""),
    ("TSLA",  "Tesla",              "US", "NASDAQ", "https://ir.tesla.com", ""),
    # Big Tech
    ("AVGO",  "Broadcom",           "US", "NASDAQ", "", ""),
    ("CRM",   "Salesforce",         "US", "NYSE",   "", ""),
    ("ORCL",  "Oracle",             "US", "NYSE",   "", ""),
    ("ADBE",  "Adobe",              "US", "NASDAQ", "", ""),
    ("AMD",   "AMD",                "US", "NASDAQ", "", ""),
    ("INTC",  "Intel",              "US", "NASDAQ", "", ""),
    ("CSCO",  "Cisco",              "US", "NASDAQ", "", ""),
    ("QCOM",  "Qualcomm",           "US", "NASDAQ", "", ""),
    ("TXN",   "Texas Instruments",  "US", "NASDAQ", "", ""),
    ("NOW",   "ServiceNow",         "US", "NYSE",   "", ""),
    ("NFLX",  "Netflix",            "US", "NASDAQ", "", ""),
    ("SHOP",  "Shopify",            "US", "NYSE",   "", ""),
    ("SNOW",  "Snowflake",          "US", "NYSE",   "", ""),
    ("NET",   "Cloudflare",         "US", "NYSE",   "", ""),
    ("PLTR",  "Palantir",           "US", "NYSE",   "", ""),
    ("UBER",  "Uber",               "US", "NYSE",   "", ""),
    ("ABNB",  "Airbnb",             "US", "NASDAQ", "", ""),
    # Finance
    ("JPM",   "JPMorgan Chase",     "US", "NYSE",   "", ""),
    ("GS",    "Goldman Sachs",      "US", "NYSE",   "", ""),
    ("MS",    "Morgan Stanley",     "US", "NYSE",   "", ""),
    ("BAC",   "Bank of America",    "US", "NYSE",   "", ""),
    ("WFC",   "Wells Fargo",        "US", "NYSE",   "", ""),
    ("C",     "Citigroup",          "US", "NYSE",   "", ""),
    ("V",     "Visa",               "US", "NYSE",   "", ""),
    ("MA",    "Mastercard",         "US", "NYSE",   "", ""),
    ("PYPL",  "PayPal",             "US", "NASDAQ", "", ""),
    ("SQ",    "Block (Square)",     "US", "NYSE",   "", ""),
    ("COIN",  "Coinbase",           "US", "NASDAQ", "", ""),
    # Consumer/Retail
    ("WMT",   "Walmart",            "US", "NYSE",   "", ""),
    ("COST",  "Costco",             "US", "NASDAQ", "", ""),
    ("HD",    "Home Depot",         "US", "NYSE",   "", ""),
    ("MCD",   "McDonald's",         "US", "NYSE",   "", ""),
    ("SBUX",  "Starbucks",          "US", "NASDAQ", "", ""),
    ("NKE",   "Nike",               "US", "NYSE",   "", ""),
    ("DIS",   "Walt Disney",        "US", "NYSE",   "", ""),
    # Healthcare
    ("UNH",   "UnitedHealth",       "US", "NYSE",   "", ""),
    ("JNJ",   "Johnson & Johnson",  "US", "NYSE",   "", ""),
    ("PFE",   "Pfizer",             "US", "NYSE",   "", ""),
    ("ABBV",  "AbbVie",             "US", "NYSE",   "", ""),
    ("LLY",   "Eli Lilly",          "US", "NYSE",   "", ""),
    ("MRK",   "Merck",              "US", "NYSE",   "", ""),
    ("TMO",   "Thermo Fisher",      "US", "NYSE",   "", ""),
    # Industrial/Energy
    ("XOM",   "ExxonMobil",         "US", "NYSE",   "", ""),
    ("CVX",   "Chevron",            "US", "NYSE",   "", ""),
    ("BA",    "Boeing",             "US", "NYSE",   "", ""),
    ("CAT",   "Caterpillar",        "US", "NYSE",   "", ""),
    ("GE",    "GE Aerospace",       "US", "NYSE",   "", ""),
    ("DE",    "John Deere",         "US", "NYSE",   "", ""),
    # Consumer Staples
    ("KO",    "Coca-Cola",          "US", "NYSE",   "", ""),
    ("PEP",   "PepsiCo",           "US", "NASDAQ", "", ""),
    ("PG",    "Procter & Gamble",   "US", "NYSE",   "", ""),

    # ── Canada (5 names) — SEDAR+: https://www.sedarplus.ca/landingpage/ ──
    ("RY",    "Royal Bank of Canada",  "CA", "TSX",  "https://www.rbc.com/investor-relations/", "https://www.sedarplus.ca"),
    ("TD",    "Toronto-Dominion Bank", "CA", "TSX",  "https://www.td.com/ca/en/about-td/investors", "https://www.sedarplus.ca"),
    ("ENB",   "Enbridge",             "CA", "TSX",  "https://www.enbridge.com/investor-relations", "https://www.sedarplus.ca"),
    ("CNR",   "Canadian National Railway", "CA", "TSX", "https://www.cn.ca/en/investors/", "https://www.sedarplus.ca"),
    ("BMO",   "Bank of Montreal",      "CA", "TSX",  "https://www.bmo.com/ir/", "https://www.sedarplus.ca"),

    # ── UK (5 names) — LSE RNS: https://www.londonstockexchange.com/news?tab=news-explorer ──
    ("SHEL",  "Shell",              "UK", "LSE",   "https://www.shell.com/investors", "https://www.londonstockexchange.com/news?tab=news-explorer"),
    ("AZN",   "AstraZeneca",        "UK", "LSE",   "https://www.astrazeneca.com/investor-relations.html", "https://www.londonstockexchange.com/news?tab=news-explorer"),
    ("HSBA",  "HSBC Holdings",      "UK", "LSE",   "https://www.hsbc.com/investors", "https://www.londonstockexchange.com/news?tab=news-explorer"),
    ("ULVR",  "Unilever",           "UK", "LSE",   "https://www.unilever.com/investors/", "https://www.londonstockexchange.com/news?tab=news-explorer"),
    ("BP",    "BP",                 "UK", "LSE",   "https://www.bp.com/en/global/corporate/investors.html", "https://www.londonstockexchange.com/news?tab=news-explorer"),

    # ── Europe (5 names) — Euronext: https://live.euronext.com/en/products/equities/company-news ──
    ("ASML",  "ASML",               "NL", "EURONEXT", "https://www.asml.com/en/investors", "https://live.euronext.com/en/products/equities/company-news"),
    ("SAP",   "SAP",                "DE", "XETRA",   "https://www.sap.com/investors", "https://live.euronext.com/en/products/equities/company-news"),
    ("NVO",   "Novo Nordisk",       "DK", "CPH",     "https://www.novonordisk.com/investors.html", "https://live.euronext.com/en/products/equities/company-news"),
    ("MC.PA", "LVMH",               "FR", "EURONEXT", "https://www.lvmh.com/investors/", "https://live.euronext.com/en/products/equities/company-news"),
    ("SIE.DE","Siemens",            "DE", "XETRA",   "https://www.siemens.com/investor", "https://live.euronext.com/en/products/equities/company-news"),

    # ── Asia-Pacific (5 names) ──
    # Japan — TDnet: https://www.release.tdnet.info/inbs/I_main_00.html
    ("7203.T","Toyota Motor",       "JP", "TSE",   "https://global.toyota/en/ir/", "https://www.release.tdnet.info/inbs/I_main_00.html"),
    ("6758.T","Sony Group",         "JP", "TSE",   "https://www.sony.com/en/SonyInfo/IR/", "https://www.release.tdnet.info/inbs/I_main_00.html"),
    # South Korea — DART: https://dart.fss.or.kr/dsab007/main.do
    ("005930.KS","Samsung Electronics", "KR", "KRX", "https://www.samsung.com/global/ir/", "https://dart.fss.or.kr/dsab007/main.do"),
    # Hong Kong — HKEXnews: https://www.hkexnews.hk/
    ("0700.HK", "Tencent Holdings",    "HK", "HKEX", "https://www.tencent.com/en-us/investors.html", "https://www.hkexnews.hk/"),
    # Australia — ASX: https://www.asx.com.au/asx/v2/statistics/announcements.do
    ("BHP.AX",  "BHP Group",           "AU", "ASX",  "https://www.bhp.com/investors", "https://www.asx.com.au/asx/v2/statistics/announcements.do"),
]

# Symbols set for Finnhub filtering (US tickers + international Finnhub-compatible tickers)
MAJOR_SYMBOLS = {w[0] for w in EARNINGS_WATCHLIST}
# Finnhub uses US-style tickers, so also add the base symbols for international names
FINNHUB_SYMBOLS = {
    # US names (Finnhub uses these directly)
    *{w[0] for w in EARNINGS_WATCHLIST if w[2] == "US"},
    # Canada (Finnhub format: RY, TD, etc. — same as US listing for dual-listed)
    "RY", "TD", "ENB", "CNR", "BMO",
    # UK (Finnhub uses US ADR tickers where available)
    "SHEL", "AZN", "HSBC", "UL", "BP",
    # Europe (Finnhub uses US ADR tickers)
    "ASML", "SAP", "NVO",
    # Japan/Korea/HK/AU (Finnhub uses US ADR or local format)
    "TM", "SONY", "SSNLF", "TCEHY", "BHP",
}

# Company lookup by symbol
COMPANY_INFO = {w[0]: {"name": w[1], "country": w[2], "exchange": w[3], "ir_url": w[4], "disclosure_url": w[5]} for w in EARNINGS_WATCHLIST}
# Also index by Finnhub-compatible symbols
FINNHUB_TO_WATCHLIST = {
    "HSBC": "HSBA", "UL": "ULVR", "TM": "7203.T", "SONY": "6758.T",
    "SSNLF": "005930.KS", "TCEHY": "0700.HK", "BHP": "BHP.AX",
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

    # Filter to watchlist companies (US + international)
    major = [e for e in all_earnings if e.get("symbol") in FINNHUB_SYMBOLS]
    print(f"→ {len(major)} watchlist companies", flush=True)

    events = []
    for e in major:
        symbol = e.get("symbol", "")
        eps = e.get("epsEstimate")
        rev = e.get("revenueEstimate")
        hour = e.get("hour", "")  # BMO, AMC, DMH

        # Resolve to watchlist symbol and get company info
        watchlist_symbol = FINNHUB_TO_WATCHLIST.get(symbol, symbol)
        info = COMPANY_INFO.get(watchlist_symbol) or COMPANY_INFO.get(symbol)
        company_name = info["name"] if info else symbol
        country = info["country"] if info else "US"

        # Map country to currency
        country_currency = {
            "US": "USD", "CA": "CAD", "UK": "GBP", "JP": "JPY", "KR": "KRW",
            "HK": "HKD", "AU": "AUD", "NL": "EUR", "DE": "EUR", "DK": "DKK",
            "FR": "EUR",
        }
        currency = country_currency.get(country, "USD")

        events.append({
            "date": e.get("date", ""),
            "time": "",
            "title": f"{company_name} ({symbol}) Earnings",
            "country": country,
            "currency": currency,
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

    # Migrate existing table: add new columns + fix constraints
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

    # Make week_start nullable (earnings don't have a week_start)
    try:
        cur.execute("ALTER TABLE sotw_calendar_events ALTER COLUMN week_start DROP NOT NULL")
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

        # Also upsert into normalized earnings store (sotw_earnings_releases)
        for e in earnings_events:
            symbol = e["symbol"]
            info = COMPANY_INFO.get(symbol, {})
            company_name = info.get("name", symbol) if info else symbol
            cur.execute("""
                INSERT INTO sotw_earnings_releases
                    (symbol, company_name, report_date, eps_estimate, revenue_estimate, source, updated_at)
                VALUES (%s, %s, %s, %s, %s, 'Finnhub', NOW())
                ON CONFLICT (symbol, report_date) DO UPDATE SET
                    eps_estimate = COALESCE(EXCLUDED.eps_estimate, sotw_earnings_releases.eps_estimate),
                    revenue_estimate = COALESCE(EXCLUDED.revenue_estimate, sotw_earnings_releases.revenue_estimate),
                    updated_at = NOW()
            """, (symbol, company_name, e["date"], e["eps_estimate"], e["revenue_estimate"]))

        # Show upcoming earnings by country
        by_country = {}
        for e in sorted(earnings_events, key=lambda x: x["date"]):
            by_country.setdefault(e["country"], []).append(e)

        for country, evts in sorted(by_country.items()):
            print(f"  {country}:", flush=True)
            for e in evts[:5]:
                eps_str = f"EPS ${e['eps_estimate']:.2f}" if e["eps_estimate"] else ""
                rev_str = ""
                if e["revenue_estimate"] and e["revenue_estimate"] > 0:
                    if e["revenue_estimate"] >= 1e9:
                        rev_str = f"Rev ${e['revenue_estimate']/1e9:.1f}B"
                    else:
                        rev_str = f"Rev ${e['revenue_estimate']/1e6:.0f}M"
                print(f"    {e['date']}  {e['symbol']:12s}  {eps_str}  {rev_str}", flush=True)

        us_count = sum(1 for e in earnings_events if e["country"] == "US")
        intl_count = len(earnings_events) - us_count
        print(f"  Stored {len(earnings_events)} earnings ({us_count} US + {intl_count} international)", flush=True)

    cur.close()
    conn.close()

    total = len(ff_events) + len(earnings_events)
    print(f"\nTotal: {total} events stored ({len(ff_events)} economic + {len(earnings_events)} earnings)", flush=True)
    print("=== Done ===")


if __name__ == "__main__":
    main()
