#!/usr/bin/env python3
"""
ETL: Finnhub earnings calendar → Supabase

Fetches upcoming earnings dates for 75-company watchlist (55 US + 20 intl).
Stores in both sotw_calendar_events (for calendar page) and
sotw_earnings_releases (normalized, compounding data asset).

Schedule: Daily 7 AM UTC
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

FINNHUB_KEY = os.environ.get("FINNHUB_KEY", "d6vl62hr01qiiutc8p6gd6vl62hr01qiiutc8p70")

# ── 75-company earnings watchlist ──────────────────────
# (symbol, company_name, country, exchange, ir_url, disclosure_url)
EARNINGS_WATCHLIST = [
    # US (55 names) — SEC EDGAR for confirmation
    ("AAPL",  "Apple",              "US", "NASDAQ", "https://investor.apple.com", ""),
    ("MSFT",  "Microsoft",          "US", "NASDAQ", "https://www.microsoft.com/en-us/investor", ""),
    ("GOOGL", "Alphabet",           "US", "NASDAQ", "https://abc.xyz/investor/", ""),
    ("AMZN",  "Amazon",             "US", "NASDAQ", "https://ir.aboutamazon.com", ""),
    ("NVDA",  "NVIDIA",             "US", "NASDAQ", "https://investor.nvidia.com", ""),
    ("META",  "Meta Platforms",     "US", "NASDAQ", "https://investor.fb.com", ""),
    ("TSLA",  "Tesla",              "US", "NASDAQ", "https://ir.tesla.com", ""),
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
    ("WMT",   "Walmart",            "US", "NYSE",   "", ""),
    ("COST",  "Costco",             "US", "NASDAQ", "", ""),
    ("HD",    "Home Depot",         "US", "NYSE",   "", ""),
    ("MCD",   "McDonald's",         "US", "NYSE",   "", ""),
    ("SBUX",  "Starbucks",          "US", "NASDAQ", "", ""),
    ("NKE",   "Nike",               "US", "NYSE",   "", ""),
    ("DIS",   "Walt Disney",        "US", "NYSE",   "", ""),
    ("UNH",   "UnitedHealth",       "US", "NYSE",   "", ""),
    ("JNJ",   "Johnson & Johnson",  "US", "NYSE",   "", ""),
    ("PFE",   "Pfizer",             "US", "NYSE",   "", ""),
    ("ABBV",  "AbbVie",             "US", "NYSE",   "", ""),
    ("LLY",   "Eli Lilly",          "US", "NYSE",   "", ""),
    ("MRK",   "Merck",              "US", "NYSE",   "", ""),
    ("TMO",   "Thermo Fisher",      "US", "NYSE",   "", ""),
    ("XOM",   "ExxonMobil",         "US", "NYSE",   "", ""),
    ("CVX",   "Chevron",            "US", "NYSE",   "", ""),
    ("BA",    "Boeing",             "US", "NYSE",   "", ""),
    ("CAT",   "Caterpillar",        "US", "NYSE",   "", ""),
    ("GE",    "GE Aerospace",       "US", "NYSE",   "", ""),
    ("DE",    "John Deere",         "US", "NYSE",   "", ""),
    ("KO",    "Coca-Cola",          "US", "NYSE",   "", ""),
    ("PEP",   "PepsiCo",            "US", "NASDAQ", "", ""),
    ("PG",    "Procter & Gamble",   "US", "NYSE",   "", ""),
    # Canada (5) — SEDAR+
    ("RY",    "Royal Bank of Canada",  "CA", "TSX",  "", "https://www.sedarplus.ca"),
    ("TD",    "Toronto-Dominion Bank", "CA", "TSX",  "", "https://www.sedarplus.ca"),
    ("ENB",   "Enbridge",             "CA", "TSX",  "", "https://www.sedarplus.ca"),
    ("CNR",   "Canadian National Railway", "CA", "TSX", "", "https://www.sedarplus.ca"),
    ("BMO",   "Bank of Montreal",      "CA", "TSX",  "", "https://www.sedarplus.ca"),
    # UK (5) — LSE RNS
    ("SHEL",  "Shell",              "UK", "LSE",   "", "https://www.londonstockexchange.com/news?tab=news-explorer"),
    ("AZN",   "AstraZeneca",        "UK", "LSE",   "", "https://www.londonstockexchange.com/news?tab=news-explorer"),
    ("HSBA",  "HSBC Holdings",      "UK", "LSE",   "", "https://www.londonstockexchange.com/news?tab=news-explorer"),
    ("ULVR",  "Unilever",           "UK", "LSE",   "", "https://www.londonstockexchange.com/news?tab=news-explorer"),
    ("BP",    "BP",                 "UK", "LSE",   "", "https://www.londonstockexchange.com/news?tab=news-explorer"),
    # Europe (5) — Euronext
    ("ASML",  "ASML",               "NL", "EURONEXT", "", "https://live.euronext.com/en/products/equities/company-news"),
    ("SAP",   "SAP",                "DE", "XETRA",   "", "https://live.euronext.com/en/products/equities/company-news"),
    ("NVO",   "Novo Nordisk",       "DK", "CPH",     "", "https://live.euronext.com/en/products/equities/company-news"),
    ("MC.PA", "LVMH",               "FR", "EURONEXT", "", "https://live.euronext.com/en/products/equities/company-news"),
    ("SIE.DE","Siemens",            "DE", "XETRA",   "", "https://live.euronext.com/en/products/equities/company-news"),
    # Asia-Pacific (5) — TDnet/DART/HKEXnews/ASX
    ("7203.T","Toyota Motor",       "JP", "TSE",   "", "https://www.release.tdnet.info/inbs/I_main_00.html"),
    ("6758.T","Sony Group",         "JP", "TSE",   "", "https://www.release.tdnet.info/inbs/I_main_00.html"),
    ("005930.KS","Samsung Electronics", "KR", "KRX", "", "https://dart.fss.or.kr/dsab007/main.do"),
    ("0700.HK", "Tencent Holdings",    "HK", "HKEX", "", "https://www.hkexnews.hk/"),
    ("BHP.AX",  "BHP Group",           "AU", "ASX",  "", "https://www.asx.com.au/asx/v2/statistics/announcements.do"),
]

COMPANY_INFO = {w[0]: {"name": w[1], "country": w[2]} for w in EARNINGS_WATCHLIST}

# Finnhub-compatible symbols (US tickers + ADR tickers for intl)
FINNHUB_SYMBOLS = {
    *{w[0] for w in EARNINGS_WATCHLIST if w[2] == "US"},
    "RY", "TD", "ENB", "CNR", "BMO",
    "SHEL", "AZN", "HSBC", "UL", "BP",
    "ASML", "SAP", "NVO",
    "TM", "SONY", "SSNLF", "TCEHY", "BHP",
}

FINNHUB_TO_WATCHLIST = {
    "HSBC": "HSBA", "UL": "ULVR", "TM": "7203.T", "SONY": "6758.T",
    "SSNLF": "005930.KS", "TCEHY": "0700.HK", "BHP": "BHP.AX",
}


def fetch_finnhub_earnings():
    """Fetch earnings dates from Finnhub (next 90 days)."""
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

    major = [e for e in all_earnings if e.get("symbol") in FINNHUB_SYMBOLS]
    print(f"→ {len(major)} watchlist", flush=True)

    events = []
    country_currency = {
        "US": "USD", "CA": "CAD", "UK": "GBP", "JP": "JPY", "KR": "KRW",
        "HK": "HKD", "AU": "AUD", "NL": "EUR", "DE": "EUR", "DK": "DKK", "FR": "EUR",
    }

    for e in major:
        symbol = e.get("symbol", "")
        eps = e.get("epsEstimate")
        rev = e.get("revenueEstimate")

        watchlist_symbol = FINNHUB_TO_WATCHLIST.get(symbol, symbol)
        info = COMPANY_INFO.get(watchlist_symbol) or COMPANY_INFO.get(symbol)
        company_name = info["name"] if info else symbol
        country = info["country"] if info else "US"

        events.append({
            "date": e.get("date", ""),
            "title": f"{company_name} ({symbol}) Earnings",
            "country": country,
            "currency": country_currency.get(country, "USD"),
            "symbol": symbol,
            "company_name": company_name,
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

    print("=== Earnings ETL (Finnhub) ===", flush=True)

    earnings = fetch_finnhub_earnings()
    if not earnings:
        print("No earnings to store")
        return

    conn = psycopg2.connect(
        host=DB_HOST, dbname="postgres", user=DB_USER,
        password=DB_PASS, port=DB_PORT
    )
    conn.autocommit = True
    cur = conn.cursor()

    # Store in sotw_calendar_events (for calendar page display)
    today = datetime.date.today().strftime("%Y-%m-%d")
    cur.execute(
        "DELETE FROM sotw_calendar_events WHERE event_type = 'earnings' AND date >= %s",
        (today,)
    )

    values = [
        (e["date"], "", e["title"], e["country"], e["currency"],
         "high", "Earnings", f"EPS ${e['eps_estimate']:.2f}" if e["eps_estimate"] is not None else "",
         "", None, "earnings", e["symbol"], e["eps_estimate"], e["revenue_estimate"])
        for e in earnings
    ]
    execute_values(cur, """
        INSERT INTO sotw_calendar_events
            (date, time, title, country, currency, impact, category,
             forecast, previous, week_start, event_type, symbol, eps_estimate, revenue_estimate)
        VALUES %s
    """, values)

    # Also upsert into normalized earnings store
    for e in earnings:
        cur.execute("""
            INSERT INTO sotw_earnings_releases
                (symbol, company_name, report_date, eps_estimate, revenue_estimate, source, updated_at)
            VALUES (%s, %s, %s, %s, %s, 'Finnhub', NOW())
            ON CONFLICT (symbol, report_date) DO UPDATE SET
                eps_estimate = COALESCE(EXCLUDED.eps_estimate, sotw_earnings_releases.eps_estimate),
                revenue_estimate = COALESCE(EXCLUDED.revenue_estimate, sotw_earnings_releases.revenue_estimate),
                updated_at = NOW()
        """, (e["symbol"], e["company_name"], e["date"], e["eps_estimate"], e["revenue_estimate"]))

    # Print summary by country
    by_country = {}
    for e in sorted(earnings, key=lambda x: x["date"]):
        by_country.setdefault(e["country"], []).append(e)
    for country, evts in sorted(by_country.items()):
        print(f"  {country}: {len(evts)} earnings", flush=True)
        for e in evts[:3]:
            eps_str = f"EPS ${e['eps_estimate']:.2f}" if e["eps_estimate"] else ""
            print(f"    {e['date']}  {e['symbol']:12s}  {eps_str}", flush=True)

    us_count = sum(1 for e in earnings if e["country"] == "US")
    print(f"\nStored {len(earnings)} earnings ({us_count} US + {len(earnings) - us_count} intl)", flush=True)

    cur.close()
    conn.close()
    print("=== Done ===")


if __name__ == "__main__":
    main()
