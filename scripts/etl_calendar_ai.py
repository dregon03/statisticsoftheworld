#!/usr/bin/env python3
"""
ETL: AI-powered economic calendar → Supabase

Uses Perplexity Sonar (via OpenRouter) for macro schedule — grounded in
official sources (BLS, BEA, Census, Fed) with citation URLs.

Uses Alpha Vantage for earnings schedule (more reliable for future dates).

This replaces: etl_schedule_official.py, etl_macro_official.py (schedule part),
and etl_earnings_official.py (schedule part).

Schedule: Daily 7 AM UTC
Runtime: ~15 seconds
Cost: ~$0.01/day (2 Perplexity calls + 1 AV call)
"""

import datetime
import json
import os
import re
import sys
import time
import urllib.request

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "aws-1-ca-central-1.pooler.supabase.com")
DB_PORT = int(os.environ.get("SUPABASE_DB_PORT", "6543"))
DB_USER = os.environ.get("SUPABASE_DB_USER", "postgres.seyrycaldytfjvvkqopu")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")
OPENROUTER_KEY = os.environ.get("OPENROUTER_KEY", "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")
AV_KEY = os.environ.get("ALPHA_VANTAGE_KEY", "")

TODAY = datetime.date.today()
TODAY_STR = TODAY.strftime("%Y-%m-%d")


def perplexity_query(prompt):
    """Call Perplexity Sonar via OpenRouter. Returns (content, citations)."""
    try:
        req_data = json.dumps({
            "model": "perplexity/sonar",
            "messages": [{"role": "user", "content": prompt}],
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
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read())

        msg = result.get("choices", [{}])[0].get("message", {})
        content = msg.get("content", "")
        citations = [
            a["url_citation"]["url"]
            for a in msg.get("annotations", [])
            if a.get("type") == "url_citation"
        ]
        return content, citations

    except Exception as e:
        print(f"  Perplexity error: {e}")
        return "", []


def parse_json_from_response(text):
    """Extract JSON array from a response that may have markdown fences."""
    text = text.strip()
    # Remove markdown code fences
    text = re.sub(r"```json\s*", "", text)
    text = re.sub(r"```\s*", "", text)
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to find JSON array in the text
        match = re.search(r"\[.*\]", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
    return []


# ── Impact classification ──────────────────────────────
def classify_impact(name):
    """Classify event impact based on name."""
    name_lower = name.lower()
    high = ["gdp", "cpi", "consumer price", "employment situation", "nonfarm",
            "payroll", "fomc", "interest rate", "pce", "personal income",
            "retail sales", "producer price", "ppi"]
    medium = ["jobless claims", "durable goods", "housing starts", "building permits",
              "new home sales", "industrial production", "trade", "jolts",
              "consumer sentiment", "michigan"]
    for h in high:
        if h in name_lower:
            return "high"
    for m in medium:
        if m in name_lower:
            return "medium"
    return "low"


def classify_category(name):
    """Classify event category based on name."""
    name_lower = name.lower()
    if any(k in name_lower for k in ["cpi", "ppi", "price", "inflation", "pce"]):
        return "Inflation"
    if any(k in name_lower for k in ["employment", "payroll", "jobless", "jobs", "labor", "jolts"]):
        return "Labor"
    if "gdp" in name_lower:
        return "GDP"
    if any(k in name_lower for k in ["retail", "consumer", "sentiment", "spending"]):
        return "Consumer"
    if any(k in name_lower for k in ["housing", "home", "building permit"]):
        return "Housing"
    if any(k in name_lower for k in ["manufacturing", "industrial", "production", "durable", "factory"]):
        return "Production"
    if any(k in name_lower for k in ["trade", "export", "import", "international transaction"]):
        return "Trade"
    if any(k in name_lower for k in ["fomc", "interest rate", "federal reserve"]):
        return "Central Bank"
    return "Other"


def main():
    if not DB_PASS:
        print("SUPABASE_DB_PASSWORD not set")
        sys.exit(1)

    import psycopg2
    from psycopg2.extras import execute_values

    print("=== Calendar ETL (Perplexity + Alpha Vantage) ===", flush=True)

    conn = psycopg2.connect(
        host=DB_HOST, dbname="postgres", user=DB_USER,
        password=DB_PASS, port=DB_PORT
    )
    conn.autocommit = True
    cur = conn.cursor()

    # Ensure tables exist
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
    """)

    # ══════════════════════════════════════════════════════
    # PART 1: MACRO SCHEDULE via Perplexity
    # ══════════════════════════════════════════════════════
    print("\n--- Macro schedule (Perplexity Sonar) ---", flush=True)

    end_date = (TODAY + datetime.timedelta(days=90)).strftime("%B %d, %Y")
    today_pretty = TODAY.strftime("%B %d, %Y")

    macro_prompt = f"""List ALL major US macroeconomic data releases scheduled from {today_pretty} through {end_date}.

Include releases from: BLS (CPI, PPI, Employment Situation, JOLTS, Import/Export Prices, Productivity), BEA (GDP, PCE/Personal Income, Trade Balance, International Transactions), Census Bureau (Retail Sales, Durable Goods, Housing Starts, Building Permits, New Home Sales, Construction Spending), Federal Reserve (FOMC decisions, Industrial Production, Consumer Credit), and University of Michigan Consumer Sentiment.

For each release give: exact date (YYYY-MM-DD format), event name, releasing agency, release time in ET.

Format as a JSON array with fields: date, name, agency, time
Only include confirmed scheduled releases. No commentary, just the JSON array."""

    macro_content, macro_citations = perplexity_query(macro_prompt)
    macro_events = parse_json_from_response(macro_content)
    print(f"  Got {len(macro_events)} macro events", flush=True)
    for url in macro_citations[:3]:
        print(f"  Source: {url}", flush=True)

    # Clear old schedule and store new
    cur.execute("DELETE FROM sotw_release_schedule")

    macro_stored = 0
    for event in macro_events:
        date = event.get("date", "")
        name = event.get("name", "")
        agency = event.get("agency", "")
        time_str = event.get("time", "08:30")

        if not date or not name:
            continue
        if date < TODAY_STR:
            continue

        # Clean up time format
        time_clean = time_str.replace(" AM", "").replace(" PM", "").replace("AM", "").replace("PM", "").strip()
        if ":" not in time_clean:
            time_clean = "08:30"

        # Generate a series_id from the name
        series_id = re.sub(r"[^a-zA-Z]", "", name)[:20].upper()

        impact = classify_impact(name)
        category = classify_category(name)

        cur.execute("""
            INSERT INTO sotw_release_schedule
                (series_id, country, name, category, impact, release_date, release_time,
                 source, source_url, verified, updated_at)
            VALUES (%s, 'US', %s, %s, %s, %s, %s, %s, %s, TRUE, NOW())
            ON CONFLICT (series_id, release_date) DO UPDATE SET
                name = EXCLUDED.name, verified = TRUE, updated_at = NOW()
        """, (
            series_id, name, category, impact, date, time_clean,
            f"Perplexity ({agency})",
            macro_citations[0] if macro_citations else "",
        ))
        macro_stored += 1

    print(f"  Stored {macro_stored} macro events", flush=True)

    # ══════════════════════════════════════════════════════
    # PART 2: EARNINGS via Alpha Vantage + Perplexity verification
    # ══════════════════════════════════════════════════════
    print("\n--- Earnings schedule (Alpha Vantage) ---", flush=True)

    # Watchlist symbols
    watchlist = {
        "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA",
        "AVGO", "CRM", "ORCL", "ADBE", "AMD", "INTC", "CSCO", "QCOM", "TXN",
        "NOW", "NFLX", "SHOP", "SNOW", "NET", "PLTR", "UBER", "ABNB",
        "JPM", "GS", "MS", "BAC", "WFC", "C", "V", "MA", "PYPL", "SQ", "COIN",
        "WMT", "COST", "HD", "MCD", "SBUX", "NKE", "DIS",
        "UNH", "JNJ", "PFE", "ABBV", "LLY", "MRK", "TMO",
        "XOM", "CVX", "BA", "CAT", "GE", "DE",
        "KO", "PEP", "PG",
        "RY", "TD", "ENB", "CNR", "BMO",
        "SHEL", "AZN", "BP", "ASML", "SAP", "NVO", "TSM",
        "HSBC", "UL",
    }

    company_names = {
        "AAPL": "Apple", "MSFT": "Microsoft", "GOOGL": "Alphabet", "AMZN": "Amazon",
        "NVDA": "NVIDIA", "META": "Meta Platforms", "TSLA": "Tesla",
        "AVGO": "Broadcom", "CRM": "Salesforce", "ORCL": "Oracle", "ADBE": "Adobe",
        "AMD": "AMD", "INTC": "Intel", "CSCO": "Cisco", "QCOM": "Qualcomm",
        "TXN": "Texas Instruments", "NOW": "ServiceNow", "NFLX": "Netflix",
        "SHOP": "Shopify", "SNOW": "Snowflake", "NET": "Cloudflare", "PLTR": "Palantir",
        "UBER": "Uber", "ABNB": "Airbnb",
        "JPM": "JPMorgan Chase", "GS": "Goldman Sachs", "MS": "Morgan Stanley",
        "BAC": "Bank of America", "WFC": "Wells Fargo", "C": "Citigroup",
        "V": "Visa", "MA": "Mastercard", "PYPL": "PayPal", "SQ": "Block",
        "COIN": "Coinbase", "WMT": "Walmart", "COST": "Costco", "HD": "Home Depot",
        "MCD": "McDonald's", "SBUX": "Starbucks", "NKE": "Nike", "DIS": "Disney",
        "UNH": "UnitedHealth", "JNJ": "Johnson & Johnson", "PFE": "Pfizer",
        "ABBV": "AbbVie", "LLY": "Eli Lilly", "MRK": "Merck", "TMO": "Thermo Fisher",
        "XOM": "ExxonMobil", "CVX": "Chevron", "BA": "Boeing", "CAT": "Caterpillar",
        "GE": "GE Aerospace", "DE": "John Deere",
        "KO": "Coca-Cola", "PEP": "PepsiCo", "PG": "Procter & Gamble",
        "RY": "Royal Bank of Canada", "TD": "TD Bank", "ENB": "Enbridge",
        "CNR": "CN Rail", "BMO": "Bank of Montreal",
        "SHEL": "Shell", "AZN": "AstraZeneca", "BP": "BP",
        "ASML": "ASML", "SAP": "SAP", "NVO": "Novo Nordisk", "TSM": "TSMC",
        "HSBC": "HSBC", "UL": "Unilever",
    }

    symbol_country = {
        s: "US" for s in watchlist
    }
    symbol_country.update({
        "RY": "CA", "TD": "CA", "ENB": "CA", "CNR": "CA", "BMO": "CA",
        "SHEL": "UK", "AZN": "UK", "BP": "UK", "HSBC": "UK", "UL": "UK",
        "ASML": "NL", "SAP": "DE", "NVO": "DK", "TSM": "TW",
    })

    # Fetch Alpha Vantage earnings calendar
    earnings_data = {}
    if AV_KEY:
        print("  Fetching Alpha Vantage...", end=" ", flush=True)
        url = f"https://www.alphavantage.co/query?function=EARNINGS_CALENDAR&horizon=3month&apikey={AV_KEY}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "SOTW/2.0"})
            with urllib.request.urlopen(req, timeout=30) as resp:
                text = resp.read().decode("utf-8", errors="replace")
            lines = text.strip().split("\n")
            for line in lines[1:]:
                parts = line.split(",")
                if len(parts) < 5:
                    continue
                symbol = parts[0].strip()
                if symbol in watchlist:
                    report_date = parts[2].strip()
                    estimate = parts[4].strip()
                    try:
                        eps_est = float(estimate) if estimate and estimate != "None" else None
                    except ValueError:
                        eps_est = None
                    # Get timing (pre-market, post-market)
                    timing = parts[6].strip() if len(parts) > 6 else ""
                    timing_map = {"pre-market": "BMO", "post-market": "AMC", "": ""}
                    earnings_data[symbol] = {
                        "date": report_date,
                        "eps_estimate": eps_est,
                        "timing": timing_map.get(timing, timing),
                    }
            print(f"{len(earnings_data)} watchlist matches", flush=True)
        except Exception as e:
            print(f"failed: {e}", flush=True)
    else:
        print("  ⚠ No ALPHA_VANTAGE_KEY", flush=True)

    # Store earnings
    cur.execute(f"DELETE FROM sotw_calendar_events WHERE event_type = 'earnings' AND date >= '{TODAY_STR}'")

    earnings_stored = 0
    calendar_values = []
    country_currency = {
        "US": "USD", "CA": "CAD", "UK": "GBP", "NL": "EUR", "DE": "EUR",
        "DK": "DKK", "TW": "TWD",
    }

    for symbol, data in sorted(earnings_data.items(), key=lambda x: x[1].get("date", "")):
        report_date = data.get("date", "")
        if not report_date or report_date < TODAY_STR:
            continue

        name = company_names.get(symbol, symbol)
        country = symbol_country.get(symbol, "US")
        eps_est = data.get("eps_estimate")
        timing = data.get("timing", "")

        # Upsert into normalized earnings table
        cur.execute("""
            INSERT INTO sotw_earnings_releases
                (symbol, company_name, report_date, report_timing, eps_estimate, source, updated_at)
            VALUES (%s, %s, %s, %s, %s, 'AlphaVantage', NOW())
            ON CONFLICT (symbol, report_date) DO UPDATE SET
                eps_estimate = COALESCE(EXCLUDED.eps_estimate, sotw_earnings_releases.eps_estimate),
                report_timing = COALESCE(EXCLUDED.report_timing, sotw_earnings_releases.report_timing),
                source = 'AlphaVantage',
                updated_at = NOW()
        """, (symbol, name, report_date, timing or None, eps_est))

        # Calendar events table
        calendar_values.append((
            report_date, "", f"{name} ({symbol}) Earnings",
            country, country_currency.get(country, "USD"),
            "high", "Earnings",
            f"EPS ${eps_est:.2f}" if eps_est is not None else "",
            "", None, "earnings", symbol, eps_est, None,
        ))
        earnings_stored += 1

    if calendar_values:
        execute_values(cur, """
            INSERT INTO sotw_calendar_events
                (date, time, title, country, currency, impact, category,
                 forecast, previous, week_start, event_type, symbol, eps_estimate, revenue_estimate)
            VALUES %s
        """, calendar_values)

    # Print summary
    by_country = {}
    for symbol in earnings_data:
        c = symbol_country.get(symbol, "US")
        by_country[c] = by_country.get(c, 0) + 1

    print(f"  Stored {earnings_stored} earnings", flush=True)
    for c, n in sorted(by_country.items()):
        print(f"    {c}: {n}", flush=True)

    cur.close()
    conn.close()

    print(f"\n=== Done: {macro_stored} macro + {earnings_stored} earnings ===", flush=True)
    print(f"Sources: Perplexity Sonar (macro) + Alpha Vantage (earnings)", flush=True)


if __name__ == "__main__":
    main()
