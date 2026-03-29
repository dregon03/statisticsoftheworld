#!/usr/bin/env python3
"""
Automated Bluesky posting for @sotwdata.bsky.social.
Reuses the same data queries as post_twitter.py but posts to Bluesky's AT Protocol.

Usage:
  python3 scripts/post_bluesky.py                  # Post one (random type)
  python3 scripts/post_bluesky.py --type market     # Market snapshot
  python3 scripts/post_bluesky.py --type country    # Country spotlight
  python3 scripts/post_bluesky.py --type indicator  # Indicator highlight
  python3 scripts/post_bluesky.py --type calendar   # Economic calendar
  python3 scripts/post_bluesky.py --dry-run         # Print without posting

Cron: 5x daily via /opt/sotw-etl/run-etl.sh
"""

import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.error

# Reuse tweet generation from post_twitter
sys.path.insert(0, os.path.dirname(__file__))
from post_twitter import (
    get_db, get_market_snapshot, get_country_spotlight,
    get_indicator_highlight, get_calendar_tweet, POST_TYPES, SITE_URL
)

# ============================================================
# BLUESKY CONFIG
# ============================================================

BSKY_HANDLE = os.environ.get("BSKY_HANDLE", "sotwdata.bsky.social")
BSKY_APP_PASSWORD = os.environ.get("BSKY_APP_PASSWORD", "")
BSKY_SERVICE = "https://bsky.social"

# ============================================================
# BLUESKY API (AT Protocol — no external deps)
# ============================================================

def bsky_login():
    """Authenticate and get access token."""
    url = f"{BSKY_SERVICE}/xrpc/com.atproto.server.createSession"
    body = json.dumps({
        "identifier": BSKY_HANDLE,
        "password": BSKY_APP_PASSWORD
    }).encode()
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            return data["accessJwt"], data["did"]
    except urllib.error.HTTPError as e:
        print(f"[ERROR] Bluesky login failed: {e.code} {e.read().decode()}", file=sys.stderr)
        return None, None

def bsky_post(text, token, did):
    """Create a post on Bluesky."""
    url = f"{BSKY_SERVICE}/xrpc/com.atproto.repo.createRecord"

    # Detect URLs in text and create facets for link rendering
    facets = []
    import re
    for match in re.finditer(r'https?://\S+|statisticsoftheworld\.com\S*', text):
        uri = match.group()
        if not uri.startswith("http"):
            uri = "https://" + uri
        facets.append({
            "index": {
                "byteStart": len(text[:match.start()].encode("utf-8")),
                "byteEnd": len(text[:match.end()].encode("utf-8"))
            },
            "features": [{
                "$type": "app.bsky.richtext.facet#link",
                "uri": uri
            }]
        })

    record = {
        "$type": "app.bsky.feed.post",
        "text": text,
        "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime()),
        "langs": ["en"],
    }
    if facets:
        record["facets"] = facets

    body = json.dumps({
        "repo": did,
        "collection": "app.bsky.feed.post",
        "record": record
    }).encode()

    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("Authorization", f"Bearer {token}")

    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read().decode())
            uri = result.get("uri", "unknown")
            print(f"[OK] Bluesky post: {uri}: {text[:80]}...")
            return result
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"[ERROR] Bluesky post failed: {e.code} {error_body}", file=sys.stderr)
        return None

# ============================================================
# MAIN
# ============================================================

def main():
    parser = argparse.ArgumentParser(description="Post to @sotwdata on Bluesky")
    parser.add_argument("--type", choices=list(POST_TYPES.keys()), help="Type of post")
    parser.add_argument("--dry-run", action="store_true", help="Print without posting")
    args = parser.parse_args()

    if not args.dry_run and not BSKY_APP_PASSWORD:
        print("[ERROR] Missing BSKY_APP_PASSWORD env var", file=sys.stderr)
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
        hour = int(time.strftime("%H"))
        if hour < 14:
            post_types = ["market", "calendar", "indicator"]
        else:
            post_types = ["country", "indicator", "calendar"]

    # Generate content (Bluesky allows 300 chars)
    tweet = None
    for ptype in post_types:
        try:
            tweet = POST_TYPES[ptype](cur)
            if tweet and len(tweet) <= 300:
                print(f"[INFO] Generated {ptype} post ({len(tweet)} chars)")
                break
            elif tweet:
                print(f"[WARN] {ptype} post too long ({len(tweet)} chars), trying next")
                tweet = None
        except Exception as e:
            print(f"[WARN] {ptype} failed: {e}")
            continue

    cur.close()
    conn.close()

    if not tweet:
        print("[WARN] No post generated, skipping")
        sys.exit(0)

    if args.dry_run:
        print(f"\n--- DRY RUN ({len(tweet)} chars) ---")
        print(tweet)
        print("--- END ---")
    else:
        token, did = bsky_login()
        if token and did:
            bsky_post(tweet, token, did)

if __name__ == "__main__":
    main()
