#!/usr/bin/env python3
"""
Automated X/Twitter posting for @sotwdata.
Pulls interesting data from SOTW's Supabase database and posts daily.

Usage:
  python3 scripts/post_twitter.py                  # Post one tweet (random type)
  python3 scripts/post_twitter.py --type market     # Market snapshot
  python3 scripts/post_twitter.py --type country    # Country spotlight
  python3 scripts/post_twitter.py --type indicator  # Indicator highlight
  python3 scripts/post_twitter.py --type calendar   # Economic calendar
  python3 scripts/post_twitter.py --dry-run         # Print without posting

Cron: 2x daily via /opt/sotw-etl/run-etl.sh
"""

import argparse
import hashlib
import hmac
import json
import os
import random
import sys
import time
import urllib.parse
import urllib.request
import psycopg2

# ============================================================
# CONFIG
# ============================================================

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "aws-1-ca-central-1.pooler.supabase.com")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")
DB_NAME = "postgres"
DB_USER = os.environ.get("SUPABASE_DB_USER", "postgres.seyrycaldytfjvvkqopu")
DB_PORT = int(os.environ.get("SUPABASE_DB_PORT", "6543"))

# X API OAuth 1.0a credentials
CONSUMER_KEY = os.environ.get("X_CONSUMER_KEY", "")
CONSUMER_SECRET = os.environ.get("X_CONSUMER_SECRET", "")
ACCESS_TOKEN = os.environ.get("X_ACCESS_TOKEN", "")
ACCESS_TOKEN_SECRET = os.environ.get("X_ACCESS_TOKEN_SECRET", "")

SITE_URL = "https://statisticsoftheworld.com"

# ============================================================
# OAUTH 1.0a SIGNING (no external dependencies)
# ============================================================

def percent_encode(s):
    return urllib.parse.quote(str(s), safe="")

def generate_nonce():
    return hashlib.md5(str(time.time()).encode() + os.urandom(16)).hexdigest()

def sign_request(method, url, params, consumer_secret, token_secret):
    """Create OAuth 1.0a signature."""
    sorted_params = "&".join(
        f"{percent_encode(k)}={percent_encode(v)}"
        for k, v in sorted(params.items())
    )
    base_string = f"{method}&{percent_encode(url)}&{percent_encode(sorted_params)}"
    signing_key = f"{percent_encode(consumer_secret)}&{percent_encode(token_secret)}"
    signature = hmac.new(
        signing_key.encode(), base_string.encode(), hashlib.sha1
    ).digest()
    import base64
    return base64.b64encode(signature).decode()

def post_tweet(text):
    """Post a tweet using X API v2 with OAuth 1.0a."""
    url = "https://api.x.com/2/tweets"

    oauth_params = {
        "oauth_consumer_key": CONSUMER_KEY,
        "oauth_nonce": generate_nonce(),
        "oauth_signature_method": "HMAC-SHA1",
        "oauth_timestamp": str(int(time.time())),
        "oauth_token": ACCESS_TOKEN,
        "oauth_version": "1.0",
    }

    signature = sign_request("POST", url, oauth_params, CONSUMER_SECRET, ACCESS_TOKEN_SECRET)
    oauth_params["oauth_signature"] = signature

    auth_header = "OAuth " + ", ".join(
        f'{percent_encode(k)}="{percent_encode(v)}"'
        for k, v in sorted(oauth_params.items())
    )

    body = json.dumps({"text": text}).encode()
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Authorization", auth_header)
    req.add_header("Content-Type", "application/json")

    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read().decode())
            tweet_id = result.get("data", {}).get("id", "unknown")
            print(f"[OK] Posted tweet {tweet_id}: {text[:80]}...")
            return result
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"[ERROR] {e.code}: {error_body}", file=sys.stderr)
        return None

# ============================================================
# DATABASE QUERIES
# ============================================================

def get_db():
    return psycopg2.connect(
        host=DB_HOST, dbname=DB_NAME, user=DB_USER,
        password=DB_PASS, port=DB_PORT
    )

def get_market_snapshot(cur):
    """Get today's key market movers."""
    targets = ['^GSPC', '^DJI', '^IXIC', 'CL=F', 'GC=F', 'BTC-USD', 'EURUSD=X', '^TNX']
    cur.execute("""
        SELECT id, label, price, change_pct
        FROM sotw_live_quotes
        WHERE id = ANY(%s)
        AND updated_at > NOW() - INTERVAL '24 hours'
        ORDER BY id
    """, (targets,))
    rows = cur.fetchall()
    if not rows:
        return None

    parts = []
    for symbol, label, price, change_pct in rows:
        short = {
            "^GSPC": "S&P 500", "^DJI": "Dow", "^IXIC": "Nasdaq",
            "CL=F": "Oil (WTI)", "GC=F": "Gold", "BTC-USD": "Bitcoin",
            "EURUSD=X": "EUR/USD", "^TNX": "10Y Yield"
        }.get(symbol, label or symbol)

        if change_pct is not None and price is not None:
            sign = "+" if change_pct > 0 else ""
            if symbol == "^TNX":
                parts.append(f"{short}: {price:.2f}%")
            elif symbol == "BTC-USD":
                parts.append(f"{short}: ${price:,.0f} ({sign}{change_pct:.1f}%)")
            elif symbol in ("CL=F", "GC=F"):
                parts.append(f"{short}: ${price:,.2f} ({sign}{change_pct:.1f}%)")
            else:
                parts.append(f"{short}: {price:,.2f} ({sign}{change_pct:.1f}%)")

    if not parts:
        return None

    tweet = "Markets today:\n" + "\n".join(parts)
    tweet += f"\n\nReal-time data at {SITE_URL}/markets"
    return tweet

def get_country_spotlight(cur):
    """Spotlight a random interesting country."""
    cur.execute("""
        SELECT c.id, c.name
        FROM sotw_countries c
        WHERE c.name IS NOT NULL
        AND c.id NOT IN ('WLD', 'EMU', 'EUU', 'SSA', 'MEA', 'SAS', 'EAS', 'LAC', 'NAC')
        ORDER BY RANDOM()
        LIMIT 1
    """)
    row = cur.fetchone()
    if not row:
        return None

    code, name = row

    # Get key indicators for this country
    cur.execute("""
        SELECT m.id, d.value, d.year
        FROM sotw_indicators d
        JOIN sotw_indicator_meta m ON m.id = d.id
        WHERE d.country_id = %s
        AND d.year >= 2022
        AND d.value IS NOT NULL
        ORDER BY d.year DESC
    """, (code,))
    indicators = cur.fetchall()

    if len(indicators) < 2:
        return None

    # Build tweet from available indicators
    facts = []
    seen = set()
    for ind_id, value, year in indicators:
        if ind_id in seen or len(facts) >= 4:
            continue
        seen.add(ind_id)

        iid = ind_id.lower()
        if 'gdp' in iid and 'capita' not in iid and 'growth' not in iid and value > 1e9:
            facts.append(f"GDP: ${value/1e9:.1f}B ({year})")
        elif 'capita' in iid:
            facts.append(f"GDP/capita: ${value:,.0f} ({year})")
        elif 'inflation' in iid or 'cpi' in iid:
            facts.append(f"Inflation: {value:.1f}% ({year})")
        elif 'population' in iid and value > 1e4:
            if value > 1e9:
                facts.append(f"Pop: {value/1e9:.2f}B")
            elif value > 1e6:
                facts.append(f"Pop: {value/1e6:.1f}M")
        elif 'unemployment' in iid:
            facts.append(f"Unemployment: {value:.1f}%")

    if len(facts) < 2:
        return None

    slug = name.lower().replace(" ", "-").replace(",", "").replace("(", "").replace(")", "")
    tweet = f"Country spotlight: {name}\n"
    tweet += " | ".join(facts[:4])
    tweet += f"\n\nFull profile: {SITE_URL}/country/{slug}"
    return tweet

def get_indicator_highlight(cur):
    """Highlight top countries for a random indicator."""
    cur.execute("""
        SELECT DISTINCT d.id
        FROM sotw_indicators d
        WHERE d.year >= 2023 AND d.value IS NOT NULL
        GROUP BY d.id
        HAVING COUNT(DISTINCT d.country_id) > 50
        ORDER BY RANDOM()
        LIMIT 1
    """)
    row = cur.fetchone()
    if not row:
        return None

    ind_id = row[0]

    # Get top 5 countries for this indicator
    cur.execute("""
        SELECT c.name, d.value, d.year
        FROM sotw_indicators d
        JOIN sotw_countries c ON c.id = d.country_id
        WHERE d.id = %s
        AND d.year >= 2023
        AND c.name IS NOT NULL
        AND d.value IS NOT NULL
        AND d.country_id NOT IN ('WLD', 'EMU', 'EUU', 'SSA', 'MEA', 'SAS', 'EAS', 'LAC', 'NAC')
        ORDER BY d.value DESC
        LIMIT 5
    """, (ind_id,))
    top = cur.fetchall()

    if len(top) < 3:
        return None

    # Format indicator name
    title = ind_id.replace("_", " ").replace(".", " ").title()
    if len(title) > 40:
        title = title[:37] + "..."

    tweet = f"Top 5 by {title} ({top[0][2]}):\n"
    for name, value, year in top:
        if abs(value) > 1e9:
            tweet += f"  {name}: ${value/1e9:.1f}B\n"
        elif abs(value) > 1e6:
            tweet += f"  {name}: ${value/1e6:.1f}M\n"
        elif abs(value) < 100:
            tweet += f"  {name}: {value:.1f}%\n"
        else:
            tweet += f"  {name}: {value:,.0f}\n"

    tweet += f"\n{SITE_URL}/rankings"

    if len(tweet) > 280:
        tweet = f"Top 3 by {title} ({top[0][2]}):\n"
        for name, value, year in top[:3]:
            if abs(value) > 1e9:
                tweet += f"  {name}: ${value/1e9:.1f}B\n"
            elif abs(value) < 100:
                tweet += f"  {name}: {value:.1f}%\n"
            else:
                tweet += f"  {name}: {value:,.0f}\n"
        tweet += f"\n{SITE_URL}/rankings"

    return tweet

def get_calendar_tweet(cur):
    """Tweet about today's economic releases."""
    cur.execute("""
        SELECT country, title, actual, forecast, previous
        FROM sotw_calendar_events
        WHERE date = CURRENT_DATE
        AND actual IS NOT NULL
        ORDER BY impact DESC, title
        LIMIT 5
    """)
    rows = cur.fetchall()

    if not rows:
        return None

    tweet = "Economic data released today:\n"
    for country, title, actual, forecast, previous in rows:
        line = f"  {country}: {title} = {actual}"
        if forecast:
            line += f" (est. {forecast})"
        tweet += line + "\n"

    tweet += f"\nFull calendar: {SITE_URL}/calendar"

    if len(tweet) > 280:
        tweet = "Economic data released today:\n"
        for country, title, actual, forecast, previous in rows[:3]:
            tweet += f"  {country}: {title} = {actual}\n"
        tweet += f"\n{SITE_URL}/calendar"

    return tweet

# ============================================================
# MAIN
# ============================================================

POST_TYPES = {
    "market": get_market_snapshot,
    "country": get_country_spotlight,
    "indicator": get_indicator_highlight,
    "calendar": get_calendar_tweet,
}

def main():
    parser = argparse.ArgumentParser(description="Post to @sotwdata on X")
    parser.add_argument("--type", choices=list(POST_TYPES.keys()), help="Type of post")
    parser.add_argument("--dry-run", action="store_true", help="Print without posting")
    args = parser.parse_args()

    # Validate credentials
    if not args.dry_run and not all([CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET]):
        print("[ERROR] Missing X API credentials. Set X_CONSUMER_KEY, X_CONSUMER_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET", file=sys.stderr)
        sys.exit(1)

    # Connect to DB
    try:
        conn = get_db()
        cur = conn.cursor()
    except Exception as e:
        print(f"[ERROR] DB connection failed: {e}", file=sys.stderr)
        sys.exit(1)

    # Pick post type
    if args.type:
        post_types = [args.type]
    else:
        # Rotate: weekday mornings = market, afternoons = country/indicator
        hour = int(time.strftime("%H"))  # UTC
        if hour < 14:
            post_types = ["market", "calendar", "indicator"]
        else:
            post_types = ["country", "indicator", "calendar"]

    # Try each type until one succeeds
    tweet = None
    for ptype in post_types:
        try:
            tweet = POST_TYPES[ptype](cur)
            if tweet and len(tweet) <= 280:
                print(f"[INFO] Generated {ptype} tweet ({len(tweet)} chars)")
                break
            elif tweet:
                print(f"[WARN] {ptype} tweet too long ({len(tweet)} chars), trying next")
                tweet = None
        except Exception as e:
            print(f"[WARN] {ptype} failed: {e}")
            continue

    cur.close()
    conn.close()

    if not tweet:
        print("[WARN] No tweet generated, skipping")
        sys.exit(0)

    if args.dry_run:
        print(f"\n--- DRY RUN ({len(tweet)} chars) ---")
        print(tweet)
        print("--- END ---")
    else:
        post_tweet(tweet)

if __name__ == "__main__":
    main()
