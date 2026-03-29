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

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "db.seyrycaldytfjvvkqopu.supabase.co")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PORT = 5432

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
    cur.execute("""
        SELECT symbol, name, price, change_percent
        FROM live_quotes
        WHERE symbol IN ('^GSPC', '^DJI', '^IXIC', 'CL=F', 'GC=F', 'BTC-USD', 'EURUSD=X', '^TNX')
        AND updated_at > NOW() - INTERVAL '24 hours'
        ORDER BY symbol
    """)
    rows = cur.fetchall()
    if not rows:
        return None

    parts = []
    for symbol, name, price, change_pct in rows:
        short = {
            "^GSPC": "S&P 500", "^DJI": "Dow", "^IXIC": "Nasdaq",
            "CL=F": "Oil (WTI)", "GC=F": "Gold", "BTC-USD": "Bitcoin",
            "EURUSD=X": "EUR/USD", "^TNX": "10Y Yield"
        }.get(symbol, name or symbol)

        if change_pct is not None:
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
        SELECT DISTINCT d.country_code, c.name
        FROM data d
        JOIN countries c ON c.code = d.country_code
        WHERE d.year >= 2023
        AND c.name IS NOT NULL
        AND d.country_code NOT IN ('WLD', 'EMU', 'EUU', 'SSA', 'MEA', 'SAS', 'EAS', 'LAC', 'NAC')
        GROUP BY d.country_code, c.name
        HAVING COUNT(DISTINCT d.indicator_code) > 20
        ORDER BY RANDOM()
        LIMIT 1
    """)
    row = cur.fetchone()
    if not row:
        return None

    code, name = row

    # Get key indicators
    cur.execute("""
        SELECT i.name, d.value, d.year
        FROM data d
        JOIN indicators i ON i.code = d.indicator_code
        WHERE d.country_code = %s
        AND d.indicator_code IN (
            'NY.GDP.MKTP.CD', 'NY.GDP.PCAP.CD', 'FP.CPI.TOTL.ZG',
            'SP.POP.TOTL', 'NE.TRD.GNFS.ZS', 'SL.UEM.TOTL.ZS'
        )
        AND d.year >= 2022
        ORDER BY d.year DESC, i.name
    """)
    indicators = cur.fetchall()

    if len(indicators) < 2:
        return None

    # Build tweet
    facts = []
    seen = set()
    for ind_name, value, year in indicators:
        if ind_name in seen:
            continue
        seen.add(ind_name)

        short = ind_name.replace("GDP (current US$)", "GDP")\
                        .replace("GDP per capita (current US$)", "GDP/capita")\
                        .replace("Inflation, consumer prices (annual %)", "Inflation")\
                        .replace("Population, total", "Population")\
                        .replace("Trade (% of GDP)", "Trade/GDP")\
                        .replace("Unemployment, total (% of total labor force) (modeled ILO estimate)", "Unemployment")

        if "GDP" in ind_name and "per" not in ind_name.lower() and value > 1e9:
            facts.append(f"GDP: ${value/1e9:.1f}B ({year})")
        elif "per capita" in ind_name.lower():
            facts.append(f"GDP/capita: ${value:,.0f} ({year})")
        elif "Inflation" in ind_name:
            facts.append(f"Inflation: {value:.1f}% ({year})")
        elif "Population" in ind_name:
            if value > 1e9:
                facts.append(f"Pop: {value/1e9:.2f}B")
            elif value > 1e6:
                facts.append(f"Pop: {value/1e6:.1f}M")
            else:
                facts.append(f"Pop: {value/1e3:.0f}K")
        elif "Unemployment" in ind_name:
            facts.append(f"Unemployment: {value:.1f}%")
        elif "Trade" in ind_name:
            facts.append(f"Trade/GDP: {value:.0f}%")

    if len(facts) < 2:
        return None

    slug = name.lower().replace(" ", "-").replace(",", "").replace("(", "").replace(")", "")
    tweet = f"Country spotlight: {name}\n"
    tweet += " | ".join(facts[:4])
    tweet += f"\n\nFull profile: {SITE_URL}/country/{slug}"
    return tweet

def get_indicator_highlight(cur):
    """Highlight an interesting indicator comparison."""
    comparisons = [
        {
            "indicator": "FP.CPI.TOTL.ZG",
            "title": "Global inflation snapshot",
            "desc": "CPI inflation rates",
            "unit": "%",
            "page": "heatmap"
        },
        {
            "indicator": "NY.GDP.MKTP.KD.ZG",
            "title": "GDP growth leaders",
            "desc": "Real GDP growth",
            "unit": "%",
            "page": "rankings"
        },
        {
            "indicator": "BN.CAB.XOKA.CD",
            "title": "Current account balances",
            "desc": "Current account balance",
            "unit": "USD",
            "page": "rankings"
        },
    ]

    comp = random.choice(comparisons)

    cur.execute("""
        SELECT c.name, d.value, d.year
        FROM data d
        JOIN countries c ON c.code = d.country_code
        WHERE d.indicator_code = %s
        AND d.year >= 2023
        AND c.name IS NOT NULL
        AND d.country_code NOT IN ('WLD', 'EMU', 'EUU', 'SSA', 'MEA', 'SAS', 'EAS', 'LAC', 'NAC')
        AND d.value IS NOT NULL
        ORDER BY d.value DESC
        LIMIT 5
    """)
    top = cur.fetchall()

    cur.execute("""
        SELECT c.name, d.value, d.year
        FROM data d
        JOIN countries c ON c.code = d.country_code
        WHERE d.indicator_code = %s
        AND d.year >= 2023
        AND c.name IS NOT NULL
        AND d.country_code NOT IN ('WLD', 'EMU', 'EUU', 'SSA', 'MEA', 'SAS', 'EAS', 'LAC', 'NAC')
        AND d.value IS NOT NULL
        ORDER BY d.value ASC
        LIMIT 3
    """)
    bottom = cur.fetchall()

    if len(top) < 3:
        return None

    tweet = f"{comp['title']} ({top[0][2]}):\n"
    for name, value, year in top[:5]:
        if comp["unit"] == "%":
            tweet += f"  {name}: {value:.1f}%\n"
        elif comp["unit"] == "USD" and abs(value) > 1e9:
            tweet += f"  {name}: ${value/1e9:.1f}B\n"
        else:
            tweet += f"  {name}: {value:,.0f}\n"

    tweet += f"\nExplore all 218 countries: {SITE_URL}/{comp['page']}"

    if len(tweet) > 280:
        # Trim to top 3
        tweet = f"{comp['title']} ({top[0][2]}):\n"
        for name, value, year in top[:3]:
            if comp["unit"] == "%":
                tweet += f"  {name}: {value:.1f}%\n"
            else:
                tweet += f"  {name}: {value:,.0f}\n"
        tweet += f"\n{SITE_URL}/{comp['page']}"

    return tweet

def get_calendar_tweet(cur):
    """Tweet about today's economic releases."""
    cur.execute("""
        SELECT country, event, actual, forecast, previous
        FROM calendar
        WHERE date = CURRENT_DATE
        AND actual IS NOT NULL
        ORDER BY impact DESC, event
        LIMIT 5
    """)
    rows = cur.fetchall()

    if not rows:
        return None

    tweet = "Economic data released today:\n"
    for country, event, actual, forecast, previous in rows:
        line = f"  {country}: {event} = {actual}"
        if forecast:
            line += f" (est. {forecast})"
        tweet += line + "\n"

    tweet += f"\nFull calendar: {SITE_URL}/calendar"

    if len(tweet) > 280:
        tweet = "Economic data released today:\n"
        for country, event, actual, forecast, previous in rows[:3]:
            tweet += f"  {country}: {event} = {actual}\n"
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
