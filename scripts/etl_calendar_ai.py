#!/usr/bin/env python3
"""
ETL: Economic Calendar powered by Gemini 2.5 Pro (Google Search grounding)

Architecture:
  - Small, focused Gemini queries per region + time window
  - Google Search grounding ensures real-time accuracy
  - Explicit government shutdown context for US releases
  - DeepSeek V3.2 (via OpenRouter) for JSON parsing fallback

Queries (sequential):
  1. US macro this week
  2. US macro next 3 weeks
  3. EU/Eurozone + UK macro
  4. Japan + China macro
  5. Canada + Australia macro
  6. Earnings (all regions, 2 weeks at a time)
  7. Past event outcomes

Schedule: Daily 7 AM UTC
Cost: ~$0.10-0.15/day
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
GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "")
OPENROUTER_KEY = os.environ.get("OPENROUTER_API_KEY", "")
FINNHUB_KEY = os.environ.get("FINNHUB_KEY", "")

TODAY = datetime.date.today()
TODAY_FMT = TODAY.strftime("%B %d, %Y")


def call_gemini(prompt, max_tokens=8192):
    """Call Gemini 2.5 Pro with Google Search grounding."""
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key={GEMINI_KEY}"
        req = urllib.request.Request(
            url,
            data=json.dumps({
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.1, "maxOutputTokens": max_tokens},
                "tools": [{"google_search": {}}],
            }).encode(),
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=180) as resp:
            result = json.loads(resp.read())
        text = ""
        for part in result.get("candidates", [{}])[0].get("content", {}).get("parts", []):
            if "text" in part:
                text += part["text"]
        return text
    except Exception as e:
        print(f"    Gemini error: {e}")
        return ""


def call_deepseek(prompt):
    """Call DeepSeek V3.2 via OpenRouter for parsing."""
    try:
        req = urllib.request.Request(
            "https://openrouter.ai/api/v1/chat/completions",
            data=json.dumps({
                "model": "deepseek/deepseek-v3.2",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.0,
                "max_tokens": 4096,
            }).encode(),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {OPENROUTER_KEY}",
                "HTTP-Referer": "https://statisticsoftheworld.com",
            },
        )
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read())
        return result["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"    DeepSeek error: {e}")
        return ""


def extract_json(text):
    """Extract JSON array from AI response."""
    if not text.strip():
        return []
    cleaned = re.sub(r"```json\s*", "", text)
    cleaned = re.sub(r"```\s*", "", cleaned).strip()
    # Try direct parse
    try:
        result = json.loads(cleaned)
        if isinstance(result, list):
            return result
    except json.JSONDecodeError:
        pass
    # Try regex extract
    match = re.search(r"\[.*\]", cleaned, re.DOTALL)
    if match:
        try:
            result = json.loads(match.group())
            if isinstance(result, list):
                return result
        except json.JSONDecodeError:
            pass
    # DeepSeek fallback
    print("    -> Using DeepSeek V3.2 to fix JSON...")
    fixed = call_deepseek(f"Extract the JSON array from this text. Return ONLY a valid JSON array.\n\n{text[:5000]}")
    cleaned2 = re.sub(r"```json\s*", "", fixed)
    cleaned2 = re.sub(r"```\s*", "", cleaned2).strip()
    try:
        return json.loads(cleaned2)
    except json.JSONDecodeError:
        return []


def query(label, prompt):
    """Run a Gemini query, extract JSON, print progress."""
    print(f"  [{label}]...", end="", flush=True)
    raw = call_gemini(prompt)
    events = extract_json(raw)
    print(f" {len(events)} events", flush=True)
    time.sleep(2)  # Rate limit
    return events


# ═══════════════════════════════════════════════════════════
# PROMPTS
# ═══════════════════════════════════════════════════════════

def prompt_us_macro(start, end):
    return f"""Today is {TODAY_FMT}. List ALL confirmed US economic data releases from {start} to {end}.

CRITICAL: The US government had lapses in federal appropriations in 2025-2026. Many releases have been DELAYED and RESCHEDULED. Search these official sources for CURRENT dates:
- BLS: bls.gov/schedule/2026/ and bls.gov/bls/2025-lapse-revised-release-dates.htm
- BEA: bea.gov/news/schedule
- Census: census.gov/economic-indicators/calendar-listview.html
- Federal Reserve: federalreserve.gov/monetarypolicy/fomccalendars.htm

DO NOT use pre-shutdown dates. Only use the CURRENT confirmed schedule.

Known recurring releases (include if in date range):
- Initial Jobless Claims: every Thursday, 8:30 AM ET
- Conference Board Consumer Confidence: last Tuesday of month, 10:00 AM
- Michigan Consumer Sentiment: preliminary ~2nd Friday, final ~4th Friday, 10:00 AM
- ISM Manufacturing PMI: 1st business day of month, 10:00 AM
- ISM Services PMI: 3rd business day of month, 10:00 AM
- Nonfarm Payrolls: 1st Friday of month, 8:30 AM
- S&P Global Flash PMI: ~3rd week of month

Other indicators: CPI, PPI, GDP, PCE, Retail Sales, FOMC, Durable Goods, Housing Starts, Building Permits, New/Existing Home Sales, JOLTS, Import/Export Prices, Trade Balance, Personal Income/Spending, Factory Orders, Construction Spending, Productivity, Fed regional indices (Richmond, Dallas, Chicago, Philly)

For each event also include the consensus forecast/expectation if available (e.g. "3.1%", "228K", "+0.4%", "50.5").

JSON array: [{{"date":"YYYY-MM-DD","time":"HH:MM","name":"full official name","impact":"high/medium/low","category":"Inflation/Labor/GDP/Central Bank/Consumer/Housing/Production/Trade/Other","forecast":"consensus expectation or empty string","detail":"one sentence explaining what this indicator measures and why it matters"}}]

Return ONLY a JSON array. No commentary."""


def prompt_eu_uk_macro(start, end):
    return f"""Today is {TODAY_FMT}. List ALL confirmed economic releases for Eurozone/EU and UK from {start} to {end}.

Search: ecb.europa.eu/press/calendars, ons.gov.uk/releasecalendar, pmi.spglobal.com/Public/Release/ReleaseDates, bankofengland.co.uk

Eurozone: ECB decision, HICP Flash + Final, GDP, PMI (Flash + Final), German IFO, ZEW, Industrial Production, Retail Sales, Unemployment, Consumer Confidence, German GfK
UK: BOE decision, CPI, GDP, PMI (Flash + Final), Retail Sales, Employment, GfK Consumer Confidence

For each event also include the consensus forecast/expectation if available.

JSON array: [{{"date":"YYYY-MM-DD","time":"HH:MM","name":"full name","country":"EU/DE/FR/IT/UK","impact":"high/medium/low","category":"...","forecast":"consensus or empty","detail":"one sentence explaining what this indicator measures and why it matters"}}]

Return ONLY JSON array."""


def prompt_asia_macro(start, end):
    return f"""Today is {TODAY_FMT}. List ALL confirmed economic releases for Japan, China, and South Korea from {start} to {end}.

Search: boj.or.jp/en/about/calendar, pmi.spglobal.com/Public/Release/ReleaseDates

Japan: BOJ decision, CPI (National + Tokyo), GDP, PMI, Tankan, Industrial Production, Retail Sales, Unemployment
China: PBoC LPR, Caixin PMI (Mfg + Services), NBS PMI, GDP, Trade Balance, CPI, PPI, Industrial Production, Retail Sales

For each event also include the consensus forecast/expectation if available.

JSON array: [{{"date":"YYYY-MM-DD","time":"HH:MM","name":"full name","country":"JP/CN/KR","impact":"high/medium/low","category":"...","forecast":"consensus or empty","detail":"one sentence explaining what this indicator measures and why it matters"}}]

Return ONLY JSON array."""


def prompt_other_macro(start, end):
    return f"""Today is {TODAY_FMT}. List ALL confirmed economic releases for Canada and Australia from {start} to {end}.

Search: bankofcanada.ca, rba.gov.au/schedules-events

Canada: BOC decision, CPI, GDP, Employment Change, Retail Sales, Trade Balance
Australia: RBA decision, CPI, Employment, Retail Sales, Trade Balance

For each event also include the consensus forecast/expectation if available.

JSON array: [{{"date":"YYYY-MM-DD","time":"HH:MM","name":"full name","country":"CA/AU","impact":"high/medium/low","category":"...","forecast":"consensus or empty","detail":"one sentence explaining what this indicator measures and why it matters"}}]

Return ONLY JSON array."""


def prompt_earnings(start, end):
    return f"""Today is {TODAY_FMT}. Search earnings calendars (Yahoo Finance, Nasdaq, Earnings Whispers, TipRanks) for all notable company earnings confirmed from {start} to {end}.

Include any company with market cap over $10 billion reporting in this window. Also check these specific tickers: AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA, JPM, GS, MS, BAC, WFC, NFLX, NKE, COST, WMT, HD, UNH, JNJ, LLY, PFE, XOM, CVX, BA, V, MA, CRM, ORCL, ADBE, AMD, AVGO, CSCO, PEP, KO, PG, DIS, MCD, UBER, PLTR, GME, LULU, DLTR, CHWY, CCL, MU, FDX, ACN, KBH

Only include companies CONFIRMED to report in this date range.

For each company, include consensus EPS and revenue estimates if available.

JSON array: [{{"date":"YYYY-MM-DD","time":"BMO/AMC","name":"Company Name Earnings","symbol":"TICKER","country":"US/NL/TW/etc","impact":"high/medium","detail":"one sentence on what the company does and why this report matters","eps_estimate":"consensus EPS or empty","revenue_estimate":"consensus revenue or empty"}}]

Return ONLY JSON array."""


def main():
    if not DB_PASS:
        print("SUPABASE_DB_PASSWORD not set")
        sys.exit(1)

    import psycopg2
    from psycopg2.extras import execute_values

    print("=== Calendar ETL (Gemini 2.5 Pro + Google Search) ===", flush=True)
    print(f"  Today: {TODAY_FMT}", flush=True)

    conn = psycopg2.connect(host=DB_HOST, dbname="postgres", user=DB_USER, password=DB_PASS, port=DB_PORT)
    conn.autocommit = True
    cur = conn.cursor()

    # Ensure tables
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
    for col, typ in [("actual", "TEXT"), ("outcome", "TEXT"), ("detail", "TEXT"), ("forecast", "TEXT")]:
        try:
            cur.execute(f"ALTER TABLE sotw_release_schedule ADD COLUMN IF NOT EXISTS {col} {typ}")
        except Exception:
            pass

    # Date ranges
    dow = TODAY.weekday()
    monday = TODAY - datetime.timedelta(days=dow)
    end_date = monday + datetime.timedelta(days=27)
    mid_date = monday + datetime.timedelta(days=13)

    start_iso = monday.strftime("%Y-%m-%d")
    end_iso = end_date.strftime("%Y-%m-%d")

    w1_start = monday.strftime("%B %d, %Y")
    w1_end = (monday + datetime.timedelta(days=6)).strftime("%B %d, %Y")
    w2_start = (monday + datetime.timedelta(days=7)).strftime("%B %d, %Y")
    w2_end = mid_date.strftime("%B %d, %Y")
    w34_start = (mid_date + datetime.timedelta(days=1)).strftime("%B %d, %Y")
    w34_end = end_date.strftime("%B %d, %Y")
    full_start = w1_start
    full_end = w34_end

    print(f"\n  Range: {full_start} to {full_end}", flush=True)

    # ══════════════════════════════════════════════════════
    # SEQUENTIAL FOCUSED QUERIES
    # ══════════════════════════════════════════════════════
    all_events = []

    # US macro — by week for precision
    for label, s, e in [
        ("US Macro W1", w1_start, w1_end),
        ("US Macro W2", w2_start, w2_end),
        ("US Macro W3-4", w34_start, w34_end),
    ]:
        for ev in query(label, prompt_us_macro(s, e)):
            ev["country"] = "US"
            ev["type"] = "macro"
            all_events.append(ev)

    # EU + UK macro
    for ev in query("EU/UK Macro", prompt_eu_uk_macro(full_start, full_end)):
        ev.setdefault("country", "EU")
        ev["type"] = "macro"
        all_events.append(ev)

    # Asia macro (JP + CN)
    for ev in query("Asia Macro", prompt_asia_macro(full_start, full_end)):
        ev.setdefault("country", "JP")
        ev["type"] = "macro"
        all_events.append(ev)

    # CA + AU macro
    for ev in query("CA/AU Macro", prompt_other_macro(full_start, full_end)):
        ev.setdefault("country", "CA")
        ev["type"] = "macro"
        all_events.append(ev)

    # Earnings — split into 2 halves
    for label, s, e in [
        ("Earnings W1-2", full_start, (mid_date + datetime.timedelta(days=1)).strftime("%B %d, %Y")),
        ("Earnings W3-4", w34_start, w34_end),
    ]:
        for ev in query(label, prompt_earnings(s, e)):
            ev["type"] = "earnings"
            ev.setdefault("country", "US")
            all_events.append(ev)

    total = len(all_events)
    print(f"\n  Total raw: {total} events", flush=True)

    if not all_events:
        print("  No events, keeping existing data")
        cur.close()
        conn.close()
        return

    # ══════════════════════════════════════════════════════
    # STORE
    # ══════════════════════════════════════════════════════
    cur.execute("DELETE FROM sotw_release_schedule WHERE release_date >= %s AND release_date <= %s", (start_iso, end_iso))
    cur.execute("DELETE FROM sotw_calendar_events WHERE event_type = 'earnings' AND date >= %s AND date <= %s", (start_iso, end_iso))

    macro_count = 0
    earnings_count = 0
    earnings_values = []
    seen = set()

    for event in all_events:
        date = event.get("date", "")
        name = event.get("name", "")
        if not date or not name:
            continue
        if date < start_iso or date > end_iso:
            continue

        # Deduplicate
        key = f"{date}|{name[:25].upper()}"
        if key in seen:
            continue
        seen.add(key)

        country = event.get("country", "US")
        event_type = event.get("type", "macro")
        impact = event.get("impact", "medium")
        category = event.get("category", "Other")
        time_str = str(event.get("time", ""))
        symbol = event.get("symbol", "")
        detail = event.get("detail", "")
        forecast = event.get("forecast", "")

        # Clean time
        time_clean = re.sub(r"\s*(AM|PM|ET|EST|EDT|UTC|GMT|BMO|AMC|CET|CEST|JST|CST|AEDT|AEST|BST|KST)\s*", "", time_str, flags=re.IGNORECASE).strip()

        # Series ID
        sid = re.sub(r"[^a-zA-Z0-9]", "", name)[:30].upper()
        if symbol:
            sid = f"EARN_{symbol}"

        if event_type == "earnings" and symbol:
            ccy_map = {
                "US": "USD", "CA": "CAD", "UK": "GBP", "EU": "EUR", "JP": "JPY",
                "CN": "CNY", "AU": "AUD", "NL": "EUR", "DE": "EUR", "DK": "DKK",
                "TW": "TWD", "KR": "KRW", "HK": "HKD",
            }
            # Parse EPS/revenue estimates
            eps_est = event.get("eps_estimate", "")
            rev_est = event.get("revenue_estimate", "")
            eps_val = None
            rev_val = None
            if eps_est:
                try:
                    eps_val = float(re.sub(r"[^0-9.\-]", "", str(eps_est)))
                except (ValueError, TypeError):
                    pass
            if rev_est:
                try:
                    rev_str = str(rev_est).upper()
                    multiplier = 1
                    if "T" in rev_str:
                        multiplier = 1e12
                    elif "B" in rev_str:
                        multiplier = 1e9
                    elif "M" in rev_str:
                        multiplier = 1e6
                    rev_clean = re.sub(r"[^0-9.\-]", "", rev_str)
                    rev_val = float(rev_clean) * multiplier if rev_clean else None
                except (ValueError, TypeError):
                    pass
            earnings_values.append((
                date, time_clean, name, country, ccy_map.get(country, "USD"),
                impact, "Earnings", "", "", None, "earnings", symbol, eps_val, rev_val,
                detail,
            ))
            earnings_count += 1
        else:
            cur.execute("""
                INSERT INTO sotw_release_schedule
                    (series_id, country, name, category, impact, release_date, release_time,
                     source, source_url, detail, forecast, verified, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, 'Gemini Search', '', %s, %s, TRUE, NOW())
                ON CONFLICT (series_id, release_date) DO UPDATE SET
                    name = EXCLUDED.name, country = EXCLUDED.country,
                    category = EXCLUDED.category, impact = EXCLUDED.impact,
                    release_time = EXCLUDED.release_time,
                    detail = COALESCE(EXCLUDED.detail, sotw_release_schedule.detail),
                    forecast = COALESCE(EXCLUDED.forecast, sotw_release_schedule.forecast),
                    verified = TRUE, updated_at = NOW()
            """, (sid, country, name, category, impact, date, time_clean, detail, forecast))
            macro_count += 1

    # Ensure detail column exists on earnings table
    try:
        cur.execute("ALTER TABLE sotw_calendar_events ADD COLUMN IF NOT EXISTS detail TEXT")
    except Exception:
        pass

    if earnings_values:
        execute_values(cur, """
            INSERT INTO sotw_calendar_events
                (date, time, title, country, currency, impact, category,
                 forecast, previous, week_start, event_type, symbol, eps_estimate, revenue_estimate,
                 detail)
            VALUES %s
        """, earnings_values)

    # Summary
    by_country = {}
    for ev in all_events:
        c = ev.get("country", "?")
        by_country[c] = by_country.get(c, 0) + 1

    print(f"\n  Stored: {macro_count} macro + {earnings_count} earnings", flush=True)
    print(f"  By country:", flush=True)
    for c, n in sorted(by_country.items(), key=lambda x: -x[1]):
        print(f"    {c}: {n}", flush=True)

    # Print all events
    sorted_events = sorted(all_events, key=lambda x: x.get("date", ""))
    print(f"\n  Calendar ({len(sorted_events)} events):", flush=True)
    for e in sorted_events:
        if e.get("date", "") < start_iso or e.get("date", "") > end_iso:
            continue
        imp = "H" if e.get("impact") == "high" else "M" if e.get("impact") == "medium" else "L"
        sym = f" ({e.get('symbol','')})" if e.get("symbol") else ""
        t = e.get("type", "macro")[:1].upper()
        print(f"    {e.get('date','')} [{imp}] {e.get('country',''):3s} {t} {e.get('name','')}{sym}", flush=True)

    # ══════════════════════════════════════════════════════
    # PART 2: Outcomes for past events
    # ══════════════════════════════════════════════════════
    print(f"\n--- Fetching outcomes ---", flush=True)

    week_ago = (TODAY - datetime.timedelta(days=7)).strftime("%Y-%m-%d")
    cur.execute("""
        SELECT series_id, name, country, release_date FROM sotw_release_schedule
        WHERE release_date >= %s AND release_date < %s AND outcome IS NULL
        ORDER BY release_date ASC
    """, (week_ago, TODAY.strftime("%Y-%m-%d")))
    past = cur.fetchall()

    if past:
        event_list = "\n".join(f"- {n} ({c}) on {d}" for _, n, c, d in past)
        prompt = f"""For each of these economic releases that already happened, search for the actual result and market reaction.

Events:
{event_list}

JSON array: [{{"name":"event name","date":"YYYY-MM-DD","actual":"3.1%","outcome":"one sentence summary"}}]
Only include events where data was actually released. Return ONLY JSON array."""

        results = query("Outcomes", prompt)
        updated = 0
        for r in results:
            rname = r.get("name", "")
            actual = r.get("actual", "")
            outcome = r.get("outcome", "")
            rdate = r.get("date", "")
            if not rname or not actual:
                continue
            for sid, name, country, date in past:
                ds = date.isoformat() if hasattr(date, 'isoformat') else str(date)
                if ds == rdate or name.lower() in rname.lower() or rname.lower() in name.lower():
                    cur.execute("""
                        UPDATE sotw_release_schedule SET actual=%s, outcome=%s, updated_at=NOW()
                        WHERE series_id=%s AND release_date=%s
                    """, (actual, outcome, sid, ds))
                    if cur.rowcount > 0:
                        updated += 1
                        print(f"    {ds}  {name[:35]:35s} -> {actual}", flush=True)
                    break
        print(f"  Updated {updated} events", flush=True)
    else:
        print("  No past events need results", flush=True)

    # ══════════════════════════════════════════════════════
    # PART 3: Finnhub EPS enrichment for earnings
    # Overwrites AI-generated EPS estimates with real analyst consensus
    # ══════════════════════════════════════════════════════
    if FINNHUB_KEY:
        print(f"\n--- Finnhub EPS enrichment ---", flush=True)
        cur.execute("""
            SELECT id, symbol FROM sotw_calendar_events
            WHERE event_type = 'earnings' AND symbol IS NOT NULL
              AND date >= %s AND date <= %s
            ORDER BY date ASC
        """, (start_iso, end_iso))
        earn_rows = cur.fetchall()
        finnhub_updated = 0
        for eid, symbol in earn_rows:
            try:
                furl = f"https://finnhub.io/api/v1/stock/earnings?symbol={symbol}&token={FINNHUB_KEY}"
                freq = urllib.request.Request(furl)
                with urllib.request.urlopen(freq, timeout=10) as fresp:
                    fdata = json.loads(fresp.read())
                if not fdata:
                    continue
                # Prefer upcoming (no actual yet), else use most recent
                upcoming = [d for d in fdata if d.get("actual") is None and d.get("estimate") is not None]
                best = upcoming[0] if upcoming else fdata[0]
                eps_est = best.get("estimate")
                if eps_est is not None:
                    cur.execute("UPDATE sotw_calendar_events SET eps_estimate=%s, updated_at=NOW() WHERE id=%s",
                                (round(float(eps_est), 2), eid))
                    if cur.rowcount > 0:
                        finnhub_updated += 1
                time.sleep(0.35)  # Finnhub: 60 req/min
            except Exception:
                pass
        print(f"  Updated {finnhub_updated} earnings with Finnhub EPS", flush=True)
    else:
        print("\n  FINNHUB_KEY not set, skipping EPS enrichment", flush=True)

    cur.close()
    conn.close()
    print(f"\n=== Done: {macro_count} macro + {earnings_count} earnings ===", flush=True)


if __name__ == "__main__":
    main()
