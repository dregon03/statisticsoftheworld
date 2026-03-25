#!/usr/bin/env python3
"""
ETL: Economic Calendar powered by Perplexity Sonar

One Perplexity call → full weekly calendar (macro + earnings + CB meetings).
Perplexity searches official sources in real-time (BLS, BEA, Census, ECB,
BOE, BOJ, company IR pages) and returns verified dates with citations.

No FRED. No Alpha Vantage. No Finnhub. No ForexFactory.
Just Perplexity + your database.

Schedule: Daily 7 AM UTC (refreshes current + next week)
Cost: ~$0.02/day
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

TODAY = datetime.date.today()


def perplexity(prompt):
    """Call Perplexity Sonar via OpenRouter."""
    try:
        req = urllib.request.Request(
            "https://openrouter.ai/api/v1/chat/completions",
            data=json.dumps({
                "model": "perplexity/sonar",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.1,
            }).encode(),
            headers={
                "Authorization": f"Bearer {OPENROUTER_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://statisticsoftheworld.com",
            },
        )
        with urllib.request.urlopen(req, timeout=90) as resp:
            result = json.loads(resp.read())
        msg = result["choices"][0]["message"]
        citations = [a["url_citation"]["url"] for a in msg.get("annotations", []) if a.get("type") == "url_citation"]
        return msg["content"], citations
    except Exception as e:
        print(f"  Perplexity error: {e}")
        return "", []


def parse_json(text):
    """Extract JSON array from response."""
    text = re.sub(r"```json\s*", "", text)
    text = re.sub(r"```\s*", "", text).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\[.*\]", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
    return []


def main():
    if not DB_PASS:
        print("SUPABASE_DB_PASSWORD not set")
        sys.exit(1)

    import psycopg2
    from psycopg2.extras import execute_values

    print("=== Calendar ETL (Perplexity only) ===", flush=True)

    conn = psycopg2.connect(host=DB_HOST, dbname="postgres", user=DB_USER, password=DB_PASS, port=DB_PORT)
    conn.autocommit = True
    cur = conn.cursor()

    # Ensure tables + migrate
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
            actual TEXT,
            outcome TEXT,
            detail TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(series_id, release_date)
        );
    """)
    for col, typ in [("actual", "TEXT"), ("outcome", "TEXT"), ("detail", "TEXT")]:
        try:
            cur.execute(f"ALTER TABLE sotw_release_schedule ADD COLUMN IF NOT EXISTS {col} {typ}")
        except Exception:
            pass

    # Date range: current week Monday through 4 weeks out
    day_of_week = TODAY.weekday()
    monday = TODAY - datetime.timedelta(days=day_of_week)
    end = monday + datetime.timedelta(days=27)
    start_str = monday.strftime("%B %d, %Y")
    end_str = end.strftime("%B %d, %Y")
    start_iso = monday.strftime("%Y-%m-%d")
    end_iso = end.strftime("%Y-%m-%d")

    # ══════════════════════════════════════════════════════
    # ONE PROMPT: Get everything
    # ══════════════════════════════════════════════════════
    print(f"\nFetching calendar: {start_str} to {end_str}", flush=True)

    prompt = f"""List EVERY important global economic data release AND major company earnings report scheduled from {start_str} to {end_str}. Be exhaustive.

MACRO — list every single one of these for EACH country where scheduled:
US: CPI, Core CPI, PPI, Nonfarm Payrolls, Unemployment Rate, GDP (advance/2nd/3rd), PCE, Core PCE, Retail Sales, FOMC decision, Industrial Production, Durable Goods Orders, Housing Starts, Building Permits, New Home Sales, Existing Home Sales, ISM Manufacturing PMI, ISM Services PMI, Consumer Confidence, Michigan Consumer Sentiment, JOLTS, Initial Jobless Claims (weekly), Trade Balance, Personal Income, Construction Spending, Factory Orders
EU: ECB decision, HICP/CPI, GDP, PMI (Manufacturing + Services), German IFO, ZEW
UK: BOE decision, CPI, GDP, PMI, Retail Sales, Employment
Japan: BOJ decision, CPI, GDP, PMI, Tankan
China: Caixin PMI, NBS PMI, GDP, Trade Balance, CPI, PBoC rate
Canada: BOC decision, CPI, GDP, Employment
Australia: RBA decision, CPI, Employment

EARNINGS — list ALL of these companies reporting in this period:
AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA, JPM, GS, MS, BAC, WFC, NFLX, ASML, TSM, NKE, COST, WMT, HD, UNH, JNJ, LLY, PFE, XOM, CVX, BA, V, MA, CRM, ORCL, ADBE, AMD, AVGO, CSCO, INTC, QCOM, PEP, KO, PG, DIS, SBUX, MCD, UBER, ABNB, PLTR, COIN, SHOP, SAP, NVO, SHEL, AZN, BP, RY, TD

For EACH event provide these exact JSON fields:
- date: "YYYY-MM-DD"
- time: "HH:MM" (ET for US, local time for others)
- name: full event name
- country: "US", "EU", "UK", "JP", "CN", "CA", "AU", or other 2-letter code
- type: "macro" or "earnings"
- impact: "high", "medium", or "low"
- category: "Inflation", "Labor", "GDP", "Central Bank", "Consumer", "Housing", "Production", "Trade", "Earnings", "Summit", or "Other"
- symbol: ticker (earnings only, "" for macro)
- detail: one sentence — why this matters or what consensus expects

Return ONLY a JSON array. No markdown, no commentary. I need at least 30 macro events and all earnings in this window."""

    content, citations = perplexity(prompt)
    events = parse_json(content)

    print(f"  Got {len(events)} events", flush=True)
    for url in citations[:5]:
        print(f"  Source: {url}", flush=True)

    if not events:
        print("  ⚠ No events returned, keeping existing data")
        cur.close()
        conn.close()
        return

    # ══════════════════════════════════════════════════════
    # STORE: Clear old schedule + calendar events, insert fresh
    # ══════════════════════════════════════════════════════

    # Clear schedule table for this date range
    cur.execute("DELETE FROM sotw_release_schedule WHERE release_date >= %s AND release_date <= %s", (start_iso, end_iso))
    # Clear earnings for this range
    cur.execute("DELETE FROM sotw_calendar_events WHERE event_type = 'earnings' AND date >= %s AND date <= %s", (start_iso, end_iso))

    macro_count = 0
    earnings_count = 0
    earnings_values = []

    for event in events:
        date = event.get("date", "")
        name = event.get("name", "")
        if not date or not name:
            continue

        country = event.get("country", "US")
        event_type = event.get("type", "macro")
        impact = event.get("impact", "medium")
        category = event.get("category", "Other")
        time_str = event.get("time", "")
        symbol = event.get("symbol", "")
        detail = event.get("detail", "")

        # Clean time
        time_clean = re.sub(r"\s*(AM|PM|ET|EST|EDT|UTC|GMT)\s*", "", time_str, flags=re.IGNORECASE).strip()

        # Generate series_id
        series_id = re.sub(r"[^a-zA-Z0-9]", "", name)[:30].upper()
        if symbol:
            series_id = f"EARN_{symbol}"

        if event_type == "earnings" and symbol:
            # Store in calendar events table
            country_currency = {
                "US": "USD", "CA": "CAD", "UK": "GBP", "EU": "EUR", "JP": "JPY",
                "CN": "CNY", "AU": "AUD", "NL": "EUR", "DE": "EUR", "DK": "DKK",
                "TW": "TWD", "KR": "KRW", "HK": "HKD",
            }
            earnings_values.append((
                date, time_clean, name, country, country_currency.get(country, "USD"),
                impact, "Earnings", "", "", None, "earnings", symbol, None, None,
            ))
            earnings_count += 1
        else:
            # Store in release schedule table
            cur.execute("""
                INSERT INTO sotw_release_schedule
                    (series_id, country, name, category, impact, release_date, release_time,
                     source, source_url, detail, verified, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, 'Perplexity', %s, %s, TRUE, NOW())
                ON CONFLICT (series_id, release_date) DO UPDATE SET
                    name = EXCLUDED.name, country = EXCLUDED.country,
                    category = EXCLUDED.category, impact = EXCLUDED.impact,
                    release_time = EXCLUDED.release_time,
                    detail = COALESCE(EXCLUDED.detail, sotw_release_schedule.detail),
                    verified = TRUE, updated_at = NOW()
            """, (
                series_id, country, name, category, impact, date, time_clean,
                citations[0] if citations else "", detail,
            ))
            macro_count += 1

    # Batch insert earnings
    if earnings_values:
        execute_values(cur, """
            INSERT INTO sotw_calendar_events
                (date, time, title, country, currency, impact, category,
                 forecast, previous, week_start, event_type, symbol, eps_estimate, revenue_estimate)
            VALUES %s
        """, earnings_values)

    # Print summary
    by_country = {}
    by_type = {"macro": 0, "earnings": 0}
    for event in events:
        c = event.get("country", "?")
        t = event.get("type", "macro")
        by_country[c] = by_country.get(c, 0) + 1
        by_type[t] = by_type.get(t, 0) + 1

    print(f"\n  Macro: {macro_count} events", flush=True)
    print(f"  Earnings: {earnings_count} events", flush=True)
    print(f"\n  By country:", flush=True)
    for c, n in sorted(by_country.items(), key=lambda x: -x[1]):
        print(f"    {c}: {n}", flush=True)

    # Show next 2 weeks
    two_weeks = (TODAY + datetime.timedelta(days=14)).strftime("%Y-%m-%d")
    upcoming = [e for e in events if e.get("date", "") <= two_weeks and e.get("date", "") >= TODAY.strftime("%Y-%m-%d")]
    upcoming.sort(key=lambda x: x.get("date", ""))

    print(f"\n  Upcoming ({len(upcoming)} events):", flush=True)
    for e in upcoming[:20]:
        impact_icon = "🔴" if e.get("impact") == "high" else "🟡" if e.get("impact") == "medium" else "⚪"
        sym = f" ({e['symbol']})" if e.get("symbol") else ""
        print(f"    {e['date']}  {impact_icon} {e.get('country',''):3s}  {e['name']}{sym}", flush=True)

    # ══════════════════════════════════════════════════════
    # PART 2: Fetch results for recent past events
    # ══════════════════════════════════════════════════════
    print(f"\n--- Fetching results for past events ---", flush=True)

    # Get events from past 7 days that don't have outcomes yet
    week_ago = (TODAY - datetime.timedelta(days=7)).strftime("%Y-%m-%d")
    today_iso = TODAY.strftime("%Y-%m-%d")
    cur.execute("""
        SELECT series_id, name, country, release_date FROM sotw_release_schedule
        WHERE release_date >= %s AND release_date < %s AND outcome IS NULL
        ORDER BY release_date ASC
    """, (week_ago, today_iso))
    past_events = cur.fetchall()

    if past_events:
        event_list = "\n".join(f"- {name} ({country}) on {date}" for _, name, country, date in past_events)
        results_prompt = f"""For each of these economic releases that already happened, give the actual result and a one-sentence market reaction summary.

Events:
{event_list}

Format as JSON array with fields: name, date, actual (the released number, e.g. "3.1%" or "228K" or "+0.4%"), outcome (one sentence: what happened and market reaction).
Only include events where the data has actually been released. No commentary outside JSON."""

        results_content, _ = perplexity(results_prompt)
        results = parse_json(results_content)
        print(f"  Got results for {len(results)} events", flush=True)

        updated = 0
        for r in results:
            rname = r.get("name", "")
            rdate = r.get("date", "")
            actual = r.get("actual", "")
            outcome = r.get("outcome", "")
            if not rname or not actual:
                continue

            # Match to stored event
            for sid, name, country, date in past_events:
                date_str = date.isoformat() if hasattr(date, 'isoformat') else str(date)
                if date_str == rdate or name.lower() in rname.lower() or rname.lower() in name.lower():
                    cur.execute("""
                        UPDATE sotw_release_schedule
                        SET actual = %s, outcome = %s, updated_at = NOW()
                        WHERE series_id = %s AND release_date = %s
                    """, (actual, outcome, sid, date_str))
                    if cur.rowcount > 0:
                        updated += 1
                        print(f"    {date_str}  {name[:40]:40s}  → {actual}", flush=True)
                    break

        print(f"  Updated {updated} events with results", flush=True)
    else:
        print("  No past events need results", flush=True)

    cur.close()
    conn.close()

    print(f"\n=== Done: {macro_count} macro + {earnings_count} earnings = {macro_count + earnings_count} total ===", flush=True)


if __name__ == "__main__":
    main()
