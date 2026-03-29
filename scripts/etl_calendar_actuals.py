#!/usr/bin/env python3
"""
ETL: Fetch actual results for economic events and earnings that just happened.

Checks for macro events and earnings from today/yesterday that don't have
actuals yet, then asks Gemini to search for the released data.

Schedule: 5x/day weekdays — 8:45AM, 9AM, 10:15AM, 3PM, 5PM ET
Cost: ~$0.01-0.05 per run (only when there are events to check)
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
GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "")
FINNHUB_KEY = os.environ.get("FINNHUB_KEY", "")

NOW = datetime.datetime.utcnow()
TODAY = NOW.date()


def call_gemini(prompt, retries=3):
    """Call Gemini 2.5 Pro with Google Search grounding. Retries on 429."""
    import time as _time
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key={GEMINI_KEY}"
    for attempt in range(retries):
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps({
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.1, "maxOutputTokens": 4096},
                    "tools": [{"google_search": {}}],
                }).encode(),
                headers={"Content-Type": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=120) as resp:
                result = json.loads(resp.read())
            text = ""
            for part in result.get("candidates", [{}])[0].get("content", {}).get("parts", []):
                if "text" in part:
                    text += part["text"]
            return text
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < retries - 1:
                wait = 10 * (attempt + 1)
                print(f"  Gemini 429, retrying in {wait}s...", flush=True)
                _time.sleep(wait)
                continue
            print(f"  Gemini error: {e}")
            return ""
        except Exception as e:
            print(f"  Gemini error: {e}")
            return ""
    return ""


def extract_json(text):
    """Extract JSON array from AI response."""
    if not text.strip():
        return []
    cleaned = re.sub(r"```json\s*", "", text)
    cleaned = re.sub(r"```\s*", "", cleaned).strip()
    try:
        result = json.loads(cleaned)
        if isinstance(result, list):
            return result
    except json.JSONDecodeError:
        pass
    match = re.search(r"\[.*\]", cleaned, re.DOTALL)
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

    print(f"=== Calendar Actuals ({NOW.strftime('%Y-%m-%d %H:%M UTC')}) ===", flush=True)

    conn = psycopg2.connect(host=DB_HOST, dbname="postgres", user=DB_USER, password=DB_PASS, port=DB_PORT)
    conn.autocommit = True
    cur = conn.cursor()

    # Add forecast column if missing
    try:
        cur.execute("ALTER TABLE sotw_release_schedule ADD COLUMN IF NOT EXISTS forecast TEXT")
    except Exception:
        pass

    # Ensure columns exist
    for col in ["actual", "outcome", "eps_actual", "revenue_actual"]:
        try:
            cur.execute(f"ALTER TABLE sotw_calendar_events ADD COLUMN IF NOT EXISTS {col} TEXT")
        except Exception:
            pass

    # Find events from last 5 days that have no actual yet
    # (covers weekends — Friday events checked on Monday)
    lookback = (TODAY - datetime.timedelta(days=5)).strftime("%Y-%m-%d")
    today_str = TODAY.strftime("%Y-%m-%d")

    cur.execute("""
        SELECT series_id, name, country, release_date, release_time
        FROM sotw_release_schedule
        WHERE release_date >= %s AND release_date <= %s AND actual IS NULL
        ORDER BY release_date ASC, release_time ASC
    """, (lookback, today_str))
    pending = cur.fetchall()

    if not pending:
        print("  No events need actuals", flush=True)
        cur.close()
        conn.close()
        return

    # Filter: only events whose release time has passed (with 30 min buffer)
    events_to_check = []
    for sid, name, country, release_date, release_time in pending:
        date_str = release_date.isoformat() if hasattr(release_date, 'isoformat') else str(release_date)

        # If yesterday's event, always check
        if date_str < today_str:
            events_to_check.append((sid, name, country, date_str, release_time))
            continue

        # For today's events, check if release time has passed
        if release_time:
            try:
                # Parse time like "08:30" — assume ET (UTC-4 or UTC-5)
                parts = release_time.split(":")
                hour, minute = int(parts[0]), int(parts[1]) if len(parts) > 1 else 0
                # Convert ET to UTC (add 4 hours for EDT)
                utc_hour = hour + 4
                release_utc = datetime.datetime(TODAY.year, TODAY.month, TODAY.day, utc_hour, minute)
                # Only check if at least 30 minutes have passed since release
                if NOW >= release_utc + datetime.timedelta(minutes=30):
                    events_to_check.append((sid, name, country, date_str, release_time))
            except (ValueError, IndexError):
                # Can't parse time, check anyway if it's past noon UTC
                if NOW.hour >= 12:
                    events_to_check.append((sid, name, country, date_str, release_time))
        else:
            # No time specified, check if it's past noon UTC
            if NOW.hour >= 14:
                events_to_check.append((sid, name, country, date_str, release_time))

    if not events_to_check:
        print("  No events ready for actuals yet", flush=True)
        cur.close()
        conn.close()
        return

    print(f"  Checking {len(events_to_check)} events for actuals...", flush=True)

    # Ask Gemini to find the actual released data
    event_list = "\n".join(
        f"- {name} ({country}) released on {date}" + (f" at {time} ET" if time else "")
        for _, name, country, date, time in events_to_check
    )

    prompt = f"""These economic data releases should have been published already. Search for the actual released numbers.

Events:
{event_list}

For each event that HAS been released, provide:
- name: the event name (match exactly from above)
- date: YYYY-MM-DD
- actual: the headline number (e.g. "3.1%", "228K", "+0.4%", "50.3", "175K")
- outcome: one sentence about the result vs expectations and market reaction

Only include events where the data has ACTUALLY been published. If you can't find the actual number, skip it.

Return ONLY a JSON array: [{{"name":"...","date":"YYYY-MM-DD","actual":"...","outcome":"..."}}]"""

    print("  Querying Gemini...", end="", flush=True)
    raw = call_gemini(prompt)
    results = extract_json(raw)
    print(f" {len(results)} results", flush=True)

    updated = 0
    for r in results:
        rname = r.get("name", "")
        rdate = r.get("date", "")
        actual = r.get("actual", "")
        outcome = r.get("outcome", "")
        if not rname or not actual:
            continue

        # Match to stored event
        for sid, name, country, date_str, _ in events_to_check:
            if date_str == rdate or name.lower() in rname.lower() or rname.lower() in name.lower():
                cur.execute("""
                    UPDATE sotw_release_schedule
                    SET actual = %s, outcome = %s, updated_at = NOW()
                    WHERE series_id = %s AND release_date = %s AND actual IS NULL
                """, (actual, outcome, sid, date_str))
                if cur.rowcount > 0:
                    updated += 1
                    print(f"    {date_str} {name[:40]:40s} -> {actual}", flush=True)
                break

    print(f"  Updated {updated} macro events with actuals", flush=True)

    # ══════════════════════════════════════════════════════
    # EARNINGS ACTUALS (via Finnhub earnings calendar — single API call)
    # Updates actuals within minutes of press release
    # Also enriches: eps_estimate, revenue_estimate, time (bmo/amc)
    # ══════════════════════════════════════════════════════
    if FINNHUB_KEY:
        cur.execute("""
            SELECT id, title, symbol, date
            FROM sotw_calendar_events
            WHERE event_type = 'earnings' AND symbol IS NOT NULL
              AND date >= %s AND date <= %s
            ORDER BY date ASC
        """, (yesterday, today_str))
        our_earnings = cur.fetchall()

        if our_earnings:
            print(f"\n  Checking {len(our_earnings)} earnings via Finnhub calendar...", flush=True)

            # Single Finnhub call for the date range
            try:
                furl = f"https://finnhub.io/api/v1/calendar/earnings?from={yesterday}&to={today_str}&token={FINNHUB_KEY}"
                freq = urllib.request.Request(furl)
                with urllib.request.urlopen(freq, timeout=15) as fresp:
                    fdata = json.loads(fresp.read())
                finnhub_events = fdata.get("earningsCalendar", [])
                print(f"  Finnhub returned {len(finnhub_events)} earnings in range", flush=True)
            except Exception as ex:
                print(f"  Finnhub calendar error: {ex}", flush=True)
                finnhub_events = []

            # Build symbol->finnhub lookup
            fh_lookup = {}
            for fe in finnhub_events:
                sym = fe.get("symbol", "")
                if sym:
                    fh_lookup[sym] = fe

            earn_updated = 0
            for eid, title, symbol, edate in our_earnings:
                date_str = edate.isoformat() if hasattr(edate, 'isoformat') else str(edate)
                fe = fh_lookup.get(symbol)
                if not fe:
                    continue

                eps_est = fe.get("epsEstimate")
                eps_actual = fe.get("epsActual")
                rev_est = fe.get("revenueEstimate")
                rev_actual = fe.get("revenueActual")
                hour = fe.get("hour", "")  # "bmo", "amc", or ""

                # Build update
                updates = {}

                # Always update timing if available
                if hour in ("bmo", "amc"):
                    time_str = "BMO" if hour == "bmo" else "AMC"
                    updates["time"] = time_str

                # Update estimates (Finnhub consensus is authoritative)
                if eps_est is not None:
                    updates["eps_estimate"] = round(float(eps_est), 4)
                if rev_est is not None and rev_est > 0:
                    updates["revenue_estimate"] = float(rev_est)

                # Fill actuals if reported
                if eps_actual is not None:
                    # For BMO: available same morning. For AMC: available same evening.
                    # Only fill if the timing makes sense
                    should_fill = False
                    if date_str < today_str:
                        should_fill = True  # Yesterday — always fill
                    elif hour == "bmo" and NOW.hour >= 12:
                        should_fill = True  # BMO today + it's past 8 AM ET
                    elif hour == "amc" and NOW.hour >= 22:
                        should_fill = True  # AMC today + it's past 6 PM ET
                    elif NOW.hour >= 22:
                        should_fill = True  # Late enough for any timing

                    if should_fill:
                        # Short format: "$2.61 (miss $0.09)" — fits table column
                        actual_str = f"${eps_actual:.2f}"
                        if eps_est is not None:
                            surprise = eps_actual - eps_est
                            surprise_pct = (surprise / abs(eps_est) * 100) if eps_est != 0 else 0
                            direction = "beat" if surprise >= 0 else "miss"
                            actual_str += f" ({direction} ${abs(surprise):.2f})"
                            updates["outcome"] = f"{'Beat' if surprise >= 0 else 'Missed'} by ${abs(surprise):.2f} ({abs(surprise_pct):.1f}%)"

                        # Append revenue if available
                        if rev_actual and rev_actual > 0:
                            if rev_actual >= 1e9:
                                actual_str += f" Rev ${rev_actual/1e9:.1f}B"
                            else:
                                actual_str += f" Rev ${rev_actual/1e6:.0f}M"

                        updates["actual"] = actual_str

                if not updates:
                    continue

                set_clauses = ", ".join(f"{k}=%s" for k in updates)
                vals = list(updates.values()) + [eid]

                # Only update actual if not already set
                if "actual" in updates:
                    cur.execute(
                        f"UPDATE sotw_calendar_events SET {set_clauses}, updated_at=NOW() WHERE id=%s AND (actual IS NULL OR actual = '')",
                        vals
                    )
                else:
                    cur.execute(
                        f"UPDATE sotw_calendar_events SET {set_clauses}, updated_at=NOW() WHERE id=%s",
                        vals
                    )

                if cur.rowcount > 0:
                    earn_updated += 1
                    act = updates.get("actual", "")
                    timing = updates.get("time", "")
                    if act:
                        print(f"    {date_str} {symbol:6s} {timing:3s} {act}", flush=True)

            print(f"  Updated {earn_updated} earnings", flush=True)
        else:
            print("  No earnings in range", flush=True)
    else:
        print("  FINNHUB_KEY not set, skipping earnings actuals", flush=True)

    cur.close()
    conn.close()
    print(f"=== Done ===", flush=True)


if __name__ == "__main__":
    main()
