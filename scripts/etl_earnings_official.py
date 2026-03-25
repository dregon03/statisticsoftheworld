#!/usr/bin/env python3
"""
ETL: Official earnings data → Supabase

Sources:
  1. Alpha Vantage EARNINGS_CALENDAR — seed upcoming earnings dates (1 call)
  2. SEC EDGAR XBRL — actual EPS/revenue post-release (free, no key)
  3. Finnhub — fallback for dates + estimates

Pipeline:
  - Alpha Vantage seeds dates for 75-company watchlist
  - SEC EDGAR pulls actual results after release
  - Finnhub fills gaps where AV/EDGAR miss
  - All stored in sotw_earnings_releases (normalized, compounding)

Schedule: Daily 7 AM UTC
Runtime: ~30 seconds
"""

import datetime
import json
import os
import sys
import time
import urllib.request

import re

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "aws-1-ca-central-1.pooler.supabase.com")
DB_PORT = int(os.environ.get("SUPABASE_DB_PORT", "6543"))
DB_USER = os.environ.get("SUPABASE_DB_USER", "postgres.seyrycaldytfjvvkqopu")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")
AV_KEY = os.environ.get("ALPHA_VANTAGE_KEY", "")
FINNHUB_KEY = os.environ.get("FINNHUB_KEY", "d6vl62hr01qiiutc8p6gd6vl62hr01qiiutc8p70")
OPENROUTER_KEY = os.environ.get("OPENROUTER_KEY", "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")


def verify_earnings_dates_with_ai(events):
    """Ask AI to verify a batch of earnings report dates.
    Returns set of (symbol, date) tuples that are confirmed correct.
    """
    if not events:
        return set()

    prompt = f"""You are a financial analyst. For each company below, verify if the earnings report date is correct.
Only answer with the line number and YES or NO. No explanation needed.

Companies to verify:
{chr(10).join(f'{i+1}. {name} ({symbol}) earnings on {date}' for i, (symbol, name, date) in enumerate(events))}

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

        verified = set()
        for line in answer.strip().split("\n"):
            line = line.strip()
            if not line:
                continue
            match = re.match(r"(\d+)[.\s:]+\s*(YES|NO)", line, re.IGNORECASE)
            if match:
                idx = int(match.group(1)) - 1
                is_yes = match.group(2).upper() == "YES"
                if is_yes and 0 <= idx < len(events):
                    verified.add((events[idx][0], events[idx][2]))  # (symbol, date)

        return verified

    except Exception as e:
        print(f"  AI verification error: {e}")
        # On failure, keep all — Alpha Vantage is generally reliable for earnings
        return {(s, d) for s, _, d in events}

# ── 75-company watchlist ──────────────────────────────
# (symbol, company_name, country, cik_number_for_edgar)
# CIK numbers from https://www.sec.gov/files/company_tickers.json
WATCHLIST = [
    # Mag 7
    ("AAPL",  "Apple",              "US", "0000320193"),
    ("MSFT",  "Microsoft",          "US", "0000789019"),
    ("GOOGL", "Alphabet",           "US", "0001652044"),
    ("AMZN",  "Amazon",             "US", "0001018724"),
    ("NVDA",  "NVIDIA",             "US", "0001045810"),
    ("META",  "Meta Platforms",     "US", "0001326801"),
    ("TSLA",  "Tesla",              "US", "0001318605"),
    # Big Tech
    ("AVGO",  "Broadcom",           "US", "0001649338"),
    ("CRM",   "Salesforce",         "US", "0001108524"),
    ("ORCL",  "Oracle",             "US", "0001341439"),
    ("ADBE",  "Adobe",              "US", "0000796343"),
    ("AMD",   "AMD",                "US", "0000002488"),
    ("INTC",  "Intel",              "US", "0000050863"),
    ("CSCO",  "Cisco",              "US", "0000858877"),
    ("QCOM",  "Qualcomm",           "US", "0000804328"),
    ("TXN",   "Texas Instruments",  "US", "0000097476"),
    ("NOW",   "ServiceNow",         "US", "0001373715"),
    ("NFLX",  "Netflix",            "US", "0001065280"),
    ("SHOP",  "Shopify",            "CA", ""),  # Canadian, no SEC CIK
    ("SNOW",  "Snowflake",          "US", "0001640147"),
    ("NET",   "Cloudflare",         "US", "0001477333"),
    ("PLTR",  "Palantir",           "US", "0001321655"),
    ("UBER",  "Uber",               "US", "0001543151"),
    ("ABNB",  "Airbnb",             "US", "0001559720"),
    # Finance
    ("JPM",   "JPMorgan Chase",     "US", "0000019617"),
    ("GS",    "Goldman Sachs",      "US", "0000886982"),
    ("MS",    "Morgan Stanley",     "US", "0000895421"),
    ("BAC",   "Bank of America",    "US", "0000070858"),
    ("WFC",   "Wells Fargo",        "US", "0000072971"),
    ("C",     "Citigroup",          "US", "0000831001"),
    ("V",     "Visa",               "US", "0001403161"),
    ("MA",    "Mastercard",         "US", "0001141391"),
    ("PYPL",  "PayPal",             "US", "0001633917"),
    ("SQ",    "Block (Square)",     "US", "0001512673"),
    ("COIN",  "Coinbase",           "US", "0001679788"),
    # Consumer/Retail
    ("WMT",   "Walmart",            "US", "0000104169"),
    ("COST",  "Costco",             "US", "0000909832"),
    ("HD",    "Home Depot",         "US", "0000354950"),
    ("MCD",   "McDonald's",         "US", "0000063908"),
    ("SBUX",  "Starbucks",          "US", "0000829224"),
    ("NKE",   "Nike",               "US", "0000320187"),
    ("DIS",   "Walt Disney",        "US", "0001744489"),
    # Healthcare
    ("UNH",   "UnitedHealth",       "US", "0000731766"),
    ("JNJ",   "Johnson & Johnson",  "US", "0000200406"),
    ("PFE",   "Pfizer",             "US", "0000078003"),
    ("ABBV",  "AbbVie",             "US", "0001551152"),
    ("LLY",   "Eli Lilly",          "US", "0000059478"),
    ("MRK",   "Merck",              "US", "0000310158"),
    ("TMO",   "Thermo Fisher",      "US", "0000097745"),
    # Industrial/Energy
    ("XOM",   "ExxonMobil",         "US", "0000034088"),
    ("CVX",   "Chevron",            "US", "0000093410"),
    ("BA",    "Boeing",             "US", "0000012927"),
    ("CAT",   "Caterpillar",        "US", "0000018230"),
    ("GE",    "GE Aerospace",       "US", "0000040554"),
    ("DE",    "John Deere",         "US", "0000315189"),
    # Consumer Staples
    ("KO",    "Coca-Cola",          "US", "0000021344"),
    ("PEP",   "PepsiCo",            "US", "0000077476"),
    ("PG",    "Procter & Gamble",   "US", "0000080424"),
    # International (no SEC CIK — schedule only, no EDGAR actuals)
    ("RY",    "Royal Bank of Canada",  "CA", ""),
    ("TD",    "Toronto-Dominion Bank", "CA", ""),
    ("ENB",   "Enbridge",             "CA", ""),
    ("CNR",   "Canadian National Railway", "CA", ""),
    ("BMO",   "Bank of Montreal",      "CA", ""),
    ("SHEL",  "Shell",              "UK", ""),
    ("AZN",   "AstraZeneca",        "UK", ""),
    ("HSBA",  "HSBC Holdings",      "UK", ""),
    ("ULVR",  "Unilever",           "UK", ""),
    ("BP",    "BP",                 "UK", ""),
    ("ASML",  "ASML",               "NL", ""),
    ("SAP",   "SAP",                "DE", ""),
    ("NVO",   "Novo Nordisk",       "DK", ""),
    # Semiconductors (ADR tickers on Alpha Vantage)
    ("TSM",   "TSMC",               "TW", ""),
    # Korea — no US ADR, need DART (dart.fss.or.kr) for schedule
    ("005930.KS", "Samsung Electronics", "KR", ""),
    ("000660.KS", "SK Hynix",           "KR", ""),
]

SYMBOL_MAP = {w[0]: {"name": w[1], "country": w[2], "cik": w[3]} for w in WATCHLIST}
US_SYMBOLS = {w[0] for w in WATCHLIST if w[2] == "US"}
# Finnhub uses ADR tickers for some international names
FINNHUB_EXTRA = {"HSBC", "UL", "TM", "SONY", "SSNLF", "TCEHY", "BHP"}


def fetch_url(url, headers=None):
    """Fetch URL content."""
    hdrs = {"User-Agent": "SOTW/2.0 statisticsoftheworld.com admin@statisticsoftheworld.com"}
    if headers:
        hdrs.update(headers)
    try:
        req = urllib.request.Request(url, headers=hdrs)
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read()
    except Exception as e:
        return None


# ── 1. Alpha Vantage: seed earnings dates ──────────────
def fetch_alpha_vantage_earnings():
    """Fetch upcoming earnings calendar from Alpha Vantage (1 API call, returns CSV)."""
    if not AV_KEY:
        print("  ⚠ ALPHA_VANTAGE_KEY not set, skipping", flush=True)
        return {}

    print("Fetching Alpha Vantage earnings calendar...", end=" ", flush=True)
    url = f"https://www.alphavantage.co/query?function=EARNINGS_CALENDAR&horizon=3month&apikey={AV_KEY}"
    raw = fetch_url(url)
    if not raw:
        print("failed", flush=True)
        return {}

    text = raw.decode("utf-8", errors="replace")
    lines = text.strip().split("\n")
    if len(lines) < 2:
        print("empty response", flush=True)
        return {}

    # Parse CSV: symbol,name,reportDate,fiscalDateEnding,estimate,currency
    header = lines[0].split(",")
    results = {}
    for line in lines[1:]:
        parts = line.split(",")
        if len(parts) < 4:
            continue
        symbol = parts[0].strip()
        if symbol in SYMBOL_MAP or symbol in FINNHUB_EXTRA:
            report_date = parts[2].strip()
            estimate = parts[4].strip() if len(parts) > 4 else ""
            try:
                eps_est = float(estimate) if estimate and estimate != "None" else None
            except ValueError:
                eps_est = None
            results[symbol] = {
                "report_date": report_date,
                "eps_estimate": eps_est,
                "source": "AlphaVantage",
            }

    print(f"{len(results)} watchlist matches from {len(lines)-1} total", flush=True)
    return results


# ── 2. Finnhub: backup earnings dates + estimates ──────
def fetch_finnhub_earnings():
    """Fetch upcoming earnings from Finnhub."""
    today = datetime.date.today()
    from_date = today.strftime("%Y-%m-%d")
    to_date = (today + datetime.timedelta(days=90)).strftime("%Y-%m-%d")

    print(f"Fetching Finnhub earnings ({from_date} to {to_date})...", end=" ", flush=True)
    url = f"https://finnhub.io/api/v1/calendar/earnings?from={from_date}&to={to_date}&token={FINNHUB_KEY}"
    raw = fetch_url(url)
    if not raw:
        print("failed", flush=True)
        return {}

    data = json.loads(raw)
    all_earnings = data.get("earningsCalendar", [])
    all_symbols = set(SYMBOL_MAP.keys()) | FINNHUB_EXTRA

    results = {}
    for e in all_earnings:
        symbol = e.get("symbol", "")
        if symbol in all_symbols:
            results[symbol] = {
                "report_date": e.get("date", ""),
                "eps_estimate": e.get("epsEstimate"),
                "revenue_estimate": e.get("revenueEstimate"),
                "source": "Finnhub",
            }

    print(f"{len(results)} watchlist matches from {len(all_earnings)} total", flush=True)
    return results


# ── 3. SEC EDGAR: actual EPS from recent 10-Q filings ──
def fetch_edgar_actuals(symbol, cik):
    """Fetch latest EPS from SEC EDGAR XBRL company facts."""
    if not cik:
        return None

    url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json"
    raw = fetch_url(url, headers={
        "User-Agent": "SOTW/2.0 statisticsoftheworld.com admin@statisticsoftheworld.com",
        "Accept": "application/json",
    })
    if not raw:
        return None

    try:
        data = json.loads(raw)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None

    facts = data.get("facts", {})
    us_gaap = facts.get("us-gaap", {})

    # Try EarningsPerShareDiluted first, then EarningsPerShareBasic
    for concept in ["EarningsPerShareDiluted", "EarningsPerShareBasic"]:
        eps_data = us_gaap.get(concept, {})
        units = eps_data.get("units", {})
        usd_per_share = units.get("USD/shares", [])
        if not usd_per_share:
            continue

        # Get quarterly filings only (10-Q form)
        quarterly = [
            e for e in usd_per_share
            if e.get("form") in ("10-Q", "10-K")
            and e.get("val") is not None
        ]
        if not quarterly:
            continue

        # Sort by filing date, get most recent
        quarterly.sort(key=lambda x: x.get("filed", ""), reverse=True)
        latest = quarterly[0]

        return {
            "eps_actual": latest["val"],
            "filed_date": latest.get("filed", ""),
            "period_end": latest.get("end", ""),
            "form": latest.get("form", ""),
        }

    return None


# ── 4. SEC EDGAR: actual Revenue from recent filings ──
def fetch_edgar_revenue(symbol, cik):
    """Fetch latest revenue from SEC EDGAR XBRL."""
    if not cik:
        return None

    url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json"
    raw = fetch_url(url, headers={
        "User-Agent": "SOTW/2.0 statisticsoftheworld.com admin@statisticsoftheworld.com",
        "Accept": "application/json",
    })
    if not raw:
        return None

    try:
        data = json.loads(raw)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None

    facts = data.get("facts", {})
    us_gaap = facts.get("us-gaap", {})

    # Try multiple revenue concepts
    for concept in ["Revenues", "RevenueFromContractWithCustomerExcludingAssessedTax", "SalesRevenueNet"]:
        rev_data = us_gaap.get(concept, {})
        units = rev_data.get("units", {})
        usd = units.get("USD", [])
        if not usd:
            continue

        quarterly = [
            e for e in usd
            if e.get("form") in ("10-Q", "10-K")
            and e.get("val") is not None
            and e.get("fp", "") in ("Q1", "Q2", "Q3", "Q4", "FY")
        ]
        if not quarterly:
            continue

        quarterly.sort(key=lambda x: x.get("filed", ""), reverse=True)
        latest = quarterly[0]

        return {
            "revenue_actual": latest["val"],
            "filed_date": latest.get("filed", ""),
        }

    return None


def main():
    if not DB_PASS:
        print("SUPABASE_DB_PASSWORD not set")
        sys.exit(1)

    import psycopg2

    print("=== Earnings ETL (Alpha Vantage + SEC EDGAR + Finnhub) ===", flush=True)

    conn = psycopg2.connect(
        host=DB_HOST, dbname="postgres", user=DB_USER,
        password=DB_PASS, port=DB_PORT
    )
    conn.autocommit = True
    cur = conn.cursor()

    # Ensure tables exist
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
            verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(symbol, report_date)
        );
        CREATE INDEX IF NOT EXISTS idx_earnings_date ON sotw_earnings_releases(report_date);
        CREATE INDEX IF NOT EXISTS idx_earnings_symbol ON sotw_earnings_releases(symbol);
    """)

    # Add verified column if not exists (migration)
    try:
        cur.execute("ALTER TABLE sotw_earnings_releases ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE")
    except Exception:
        pass

    # ── Step 1: Seed dates from Alpha Vantage ──
    print("\n--- Step 1: Alpha Vantage earnings dates ---", flush=True)
    av_data = fetch_alpha_vantage_earnings()

    # ── Step 2: Backup dates from Finnhub ──
    print("\n--- Step 2: Finnhub earnings dates ---", flush=True)
    fh_data = fetch_finnhub_earnings()

    # ── Step 3: Merge — Alpha Vantage primary, Finnhub fills gaps ──
    print("\n--- Step 3: Merge sources ---", flush=True)
    merged = {}
    for symbol, info in SYMBOL_MAP.items():
        entry = {"symbol": symbol, "name": info["name"], "country": info["country"]}

        # Alpha Vantage takes priority
        if symbol in av_data:
            entry.update(av_data[symbol])
        # Finnhub fills gaps
        elif symbol in fh_data:
            entry.update(fh_data[symbol])
        else:
            continue  # No data from either source

        merged[symbol] = entry

    print(f"  {len(merged)} companies with upcoming earnings", flush=True)
    print(f"    From Alpha Vantage: {sum(1 for s in merged.values() if s.get('source') == 'AlphaVantage')}", flush=True)
    print(f"    From Finnhub: {sum(1 for s in merged.values() if s.get('source') == 'Finnhub')}", flush=True)

    # ── Step 3.5: AI verification of earnings dates ──
    print("\n--- Step 3.5: AI verification ---", flush=True)
    today = datetime.date.today().strftime("%Y-%m-%d")
    to_verify = [
        (symbol, data["name"], data.get("report_date", ""))
        for symbol, data in merged.items()
        if data.get("report_date", "") >= today
    ]

    verified_pairs = set()
    for i in range(0, len(to_verify), 20):
        chunk = to_verify[i:i+20]
        chunk_verified = verify_earnings_dates_with_ai(chunk)
        verified_pairs.update(chunk_verified)
        print(f"  Batch {i//20 + 1}: {len(chunk_verified)}/{len(chunk)} verified", flush=True)

    # Remove unverified entries from merged
    before = len(merged)
    merged = {s: d for s, d in merged.items() if (s, d.get("report_date", "")) in verified_pairs or d.get("report_date", "") < today}
    rejected = before - len(merged)
    print(f"  Result: {len(merged)} kept, {rejected} rejected by AI", flush=True)

    # ── Step 4: Store schedule in both tables ──
    print("\n--- Step 4: Store earnings schedule ---", flush=True)
    stored = 0

    # Clear future earnings from calendar events table
    cur.execute("DELETE FROM sotw_calendar_events WHERE event_type = 'earnings' AND date >= %s", (today,))

    from psycopg2.extras import execute_values
    calendar_values = []

    for symbol, data in sorted(merged.items(), key=lambda x: x[1].get("report_date", "")):
        report_date = data.get("report_date", "")
        if not report_date or report_date < today:
            continue

        name = data["name"]
        country = data["country"]
        eps_est = data.get("eps_estimate")
        rev_est = data.get("revenue_estimate")
        source = data.get("source", "unknown")

        country_currency = {
            "US": "USD", "CA": "CAD", "UK": "GBP", "JP": "JPY", "KR": "KRW",
            "HK": "HKD", "AU": "AUD", "NL": "EUR", "DE": "EUR", "DK": "DKK", "FR": "EUR",
        }

        # Upsert into normalized earnings table
        cur.execute("""
            INSERT INTO sotw_earnings_releases
                (symbol, company_name, report_date, eps_estimate, revenue_estimate, source, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
            ON CONFLICT (symbol, report_date) DO UPDATE SET
                eps_estimate = COALESCE(EXCLUDED.eps_estimate, sotw_earnings_releases.eps_estimate),
                revenue_estimate = COALESCE(EXCLUDED.revenue_estimate, sotw_earnings_releases.revenue_estimate),
                source = EXCLUDED.source,
                updated_at = NOW()
        """, (symbol, name, report_date, eps_est, rev_est, source))

        # Also store in calendar events table for display
        calendar_values.append((
            report_date, "", f"{name} ({symbol}) Earnings",
            country, country_currency.get(country, "USD"),
            "high", "Earnings",
            f"EPS ${eps_est:.2f}" if eps_est is not None else "",
            "", None, "earnings", symbol, eps_est, rev_est,
        ))
        stored += 1

    if calendar_values:
        execute_values(cur, """
            INSERT INTO sotw_calendar_events
                (date, time, title, country, currency, impact, category,
                 forecast, previous, week_start, event_type, symbol, eps_estimate, revenue_estimate)
            VALUES %s
        """, calendar_values)

    print(f"  Stored {stored} upcoming earnings", flush=True)

    # ── Step 5: SEC EDGAR actuals for US companies ──
    print("\n--- Step 5: SEC EDGAR actuals (US companies) ---", flush=True)
    edgar_count = 0
    edgar_errors = 0

    # Only fetch EDGAR for US companies that have recent earnings
    us_with_cik = [(s, i) for s, i in SYMBOL_MAP.items() if i["cik"] and i["country"] == "US"]
    # Limit to 10 per run to stay within SEC rate limits (10 req/sec)
    batch = us_with_cik[:10]

    for symbol, info in batch:
        eps_result = fetch_edgar_actuals(symbol, info["cik"])
        if eps_result:
            rev_result = fetch_edgar_revenue(symbol, info["cik"])

            # Update the most recent earnings entry for this symbol
            cur.execute("""
                UPDATE sotw_earnings_releases
                SET eps_actual = %s,
                    revenue_actual = %s,
                    filing_url = %s,
                    verified = TRUE,
                    updated_at = NOW()
                WHERE symbol = %s
                AND report_date = (
                    SELECT MAX(report_date) FROM sotw_earnings_releases
                    WHERE symbol = %s AND report_date <= %s
                )
                AND eps_actual IS NULL
            """, (
                eps_result["eps_actual"],
                rev_result["revenue_actual"] if rev_result else None,
                f"https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={info['cik']}&type=10-Q&dateb=&owner=include&count=5",
                symbol, symbol, today,
            ))
            if cur.rowcount > 0:
                edgar_count += 1
                print(f"  {symbol:6s} EPS: ${eps_result['eps_actual']:.2f} (filed {eps_result['filed_date']})", flush=True)
        else:
            edgar_errors += 1

        time.sleep(0.15)  # SEC rate limit: ~10 req/sec

    print(f"  EDGAR: {edgar_count} actuals updated, {edgar_errors} no data", flush=True)

    # ── Summary ──
    by_country = {}
    for symbol, data in merged.items():
        country = data["country"]
        by_country[country] = by_country.get(country, 0) + 1

    print("\n--- Summary by country ---", flush=True)
    for country, count in sorted(by_country.items()):
        print(f"  {country}: {count} companies", flush=True)

    cur.close()
    conn.close()

    print(f"\n=== Done: {stored} scheduled, {edgar_count} EDGAR actuals ===", flush=True)


if __name__ == "__main__":
    main()
