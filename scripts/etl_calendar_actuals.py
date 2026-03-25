#!/usr/bin/env python3
"""
ETL: Fetch actual results for economic events that just happened.

Runs every 30 minutes. Checks for events scheduled in the last 2 hours
that don't have actuals yet, then asks Gemini to search for the released data.

Schedule: Every 30 minutes during market hours (12:00-22:00 UTC = 7AM-5PM ET)
Cost: ~$0.01-0.03 per run (only when there are events to check)
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

NOW = datetime.datetime.utcnow()
TODAY = NOW.date()


def call_gemini(prompt):
    """Call Gemini 2.5 Pro with Google Search grounding."""
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key={GEMINI_KEY}"
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
    except Exception as e:
        print(f"  Gemini error: {e}")
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

    # Find events from today and yesterday that have no actual yet
    yesterday = (TODAY - datetime.timedelta(days=1)).strftime("%Y-%m-%d")
    today_str = TODAY.strftime("%Y-%m-%d")

    cur.execute("""
        SELECT series_id, name, country, release_date, release_time
        FROM sotw_release_schedule
        WHERE release_date >= %s AND release_date <= %s AND actual IS NULL
        ORDER BY release_date ASC, release_time ASC
    """, (yesterday, today_str))
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

    print(f"  Updated {updated} events with actuals", flush=True)

    cur.close()
    conn.close()
    print(f"=== Done ===", flush=True)


if __name__ == "__main__":
    main()
