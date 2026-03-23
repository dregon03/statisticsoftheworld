#!/usr/bin/env python3
"""
ETL: Polymarket prediction markets → Supabase

Fetches all active markets from Polymarket's Gamma API,
filters to economics/politics/geopolitics, and upserts into
sotw_predictions table.

Schedule: Every 15 minutes via GitHub Actions or Vercel cron.
Runtime: ~30-60 seconds (paginated fetch of 30K+ markets, filter to ~1K).

Usage:
  python scripts/etl_polymarket.py
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error
import urllib.parse

# ── Config ──────────────────────────────────────────────
GAMMA_API = "https://gamma-api.polymarket.com"
PAGE_SIZE = 100
MAX_PAGES = 80  # 8,000 markets max (covers top by volume + liquidity)

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "db.seyrycaldytfjvvkqopu.supabase.co")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PORT = 5432


# ── Category classification ─────────────────────────────
CATEGORY_KEYWORDS = {
    "Central Banks & Rates": ["fed ", "federal reserve", "interest rate", "rate cut", "rate hike",
                               "bank of canada", "ecb rate", "bank of japan", "bank of england",
                               "central bank", "monetary policy", "fomc"],
    "Recession & Growth": ["recession", "gdp", "economic growth", "depression"],
    "Inflation & Prices": ["inflation", "cpi ", "consumer price", "deflation", "gas price",
                           "gas hit", "gasoline"],
    "Elections & Politics": ["election", "president", "prime minister", "parliament", "governor",
                             "senate", "congress", "nominee", "inauguration", "mayor",
                             "democratic", "republican", "labour party", "tory", "conservative party"],
    "Geopolitics & Conflict": ["russia", "ukraine", "china", "taiwan", "ceasefire", "nato",
                                "invasion", "military", "sanctions", "troops", "missile",
                                "netanyahu", "iran", "israel", "houthi", "north korea", "gaza",
                                "lebanon", "hezbollah", "hamas"],
    "Trade & Tariffs": ["tariff", "trade war", "wto", "nafta", "usmca", "customs", "import duty"],
    "Crypto & Markets": ["bitcoin", "btc", "ethereum", "eth ", "crypto", "solana", "hype",
                          "s&p", "stock market", "dow jones", "nasdaq", "treasury",
                          "google dip", "apple dip", "tesla dip", "nvidia"],
    "Global Events": ["who ", "united nations", "g7 ", "g20 ", "brics", "imf ", "world bank",
                       "climate", "pandemic", "pope"],
    "Currency & FX": ["usd", "eur", "exchange rate", "dollar", "peso", "yen ", "yuan"],
    "Oil & Energy": ["oil", "crude", "opec", "brent", "natural gas", "energy price", "petroleum"],
}

EXCLUDE_KEYWORDS = [
    "nba", "nfl", "mlb", "nhl", "mls", "ufc", "pga", "atp", "wta", "epl",
    "serie a", "la liga", "bundesliga", "ligue 1", "premier league",
    "champions league", "fifa world cup",
    "goalscorer", "rebounds", "assists", "touchdown", "strikeout",
    "set 1 winner", "match winner", "o/u ", "over/under",
    "temperature", "weather", "rain", "snow",
    "eurovision", "grammy", "oscar", "emmy",
    "top 10 at", "top 20 at", "top 5 at",
    "anytime scorer", "first scorer", "last scorer",
]


def categorize(question: str) -> str | None:
    q = question.lower()
    if any(kw in q for kw in EXCLUDE_KEYWORDS):
        return None
    for cat, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in q for kw in keywords):
            return cat
    return None


def fetch_page(offset: int, order: str = "volume") -> list:
    url = f"{GAMMA_API}/markets?active=true&closed=false&limit={PAGE_SIZE}&offset={offset}&order={order}&ascending=false"
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
            return data if isinstance(data, list) else []
    except Exception as e:
        print(f"  ⚠ fetch error at offset={offset}: {e}")
        return []


def parse_market(m: dict, event_slug: str | None = None) -> dict | None:
    """Parse a Polymarket market object.

    event_slug: if this market came from an /events response, pass the
                parent event's slug so the URL resolves correctly on
                polymarket.com. Individual market slugs often 404.
    """
    if not m or not m.get("question") or m.get("closed"):
        return None

    category = categorize(m["question"])
    if not category:
        return None

    try:
        prices_raw = m.get("outcomePrices", "[]")
        prices = json.loads(prices_raw) if isinstance(prices_raw, str) else prices_raw
        outcome_prices = [float(p) for p in (prices or [])]
    except:
        return None

    try:
        outcomes_raw = m.get("outcomes", '["Yes","No"]')
        outcomes = json.loads(outcomes_raw) if isinstance(outcomes_raw, str) else outcomes_raw
    except:
        outcomes = ["Yes", "No"]

    volume = float(m.get("volume", 0) or 0)
    liquidity = float(m.get("liquidity", 0) or 0)

    if liquidity < 50:
        return None

    probability = outcome_prices[0] if outcome_prices else 0

    # Filter out noise: sub-markets at extreme probabilities are uninteresting
    # "11 Fed rate cuts" at 0.5% or "Will X happen" at 99.5% are not useful
    # Exception: very high volume markets (>$1M) are interesting even at extremes
    if volume < 1_000_000:
        if probability < 0.03 or probability > 0.97:
            return None

    # Use event slug for URL; fall back to Polymarket search if no event slug
    if event_slug:
        market_url = f"https://polymarket.com/event/{event_slug}"
    else:
        q_encoded = urllib.parse.quote(m["question"][:80])
        market_url = f"https://polymarket.com/markets?_q={q_encoded}"

    return {
        "market_id": str(m.get("id", m.get("slug", ""))),
        "question": m["question"],
        "slug": m.get("slug", ""),
        "probability": outcome_prices[0] if outcome_prices else 0,
        "outcomes": json.dumps(outcomes),
        "outcome_prices": json.dumps(outcome_prices),
        "volume": volume,
        "volume_24h": float(m.get("volume24hr", 0) or 0),
        "liquidity": liquidity,
        "end_date": m.get("endDate"),
        "category": category,
        "image": m.get("image", ""),
        "url": market_url,
    }


def main():
    import psycopg2

    if not DB_PASS:
        print("❌ SUPABASE_DB_PASSWORD not set")
        sys.exit(1)

    print("═══ Polymarket ETL ═══")

    # ── 1. Create table if not exists ────────────────────
    conn = psycopg2.connect(host=DB_HOST, dbname=DB_NAME, user=DB_USER, password=DB_PASS, port=DB_PORT)
    conn.autocommit = True
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS sotw_predictions (
            market_id TEXT PRIMARY KEY,
            question TEXT NOT NULL,
            slug TEXT,
            probability REAL,
            outcomes JSONB,
            outcome_prices JSONB,
            volume REAL DEFAULT 0,
            volume_24h REAL DEFAULT 0,
            liquidity REAL DEFAULT 0,
            end_date TIMESTAMPTZ,
            category TEXT,
            image TEXT,
            url TEXT,
            active BOOLEAN DEFAULT TRUE,
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_predictions_category ON sotw_predictions(category);
        CREATE INDEX IF NOT EXISTS idx_predictions_volume ON sotw_predictions(volume DESC);
        CREATE INDEX IF NOT EXISTS idx_predictions_active ON sotw_predictions(active);
    """)
    print("✓ Table ready")

    # ── 2. Fetch markets from Polymarket ─────────────────
    all_markets = {}
    total_fetched = 0

    # Fetch by volume (top markets)
    print("Fetching by volume...")
    for page in range(MAX_PAGES // 2):
        offset = page * PAGE_SIZE
        markets = fetch_page(offset, "volume")
        if not markets:
            break
        for m in markets:
            parsed = parse_market(m)
            if parsed:
                all_markets[parsed["market_id"]] = parsed
        total_fetched += len(markets)
        if len(markets) < PAGE_SIZE:
            break

    print(f"  Fetched {total_fetched} by volume → {len(all_markets)} relevant")

    # Fetch by liquidity (catches different markets)
    print("Fetching by liquidity...")
    liq_fetched = 0
    for page in range(MAX_PAGES // 2):
        offset = page * PAGE_SIZE
        markets = fetch_page(offset, "liquidity")
        if not markets:
            break
        for m in markets:
            parsed = parse_market(m)
            if parsed:
                all_markets[parsed["market_id"]] = parsed
        liq_fetched += len(markets)
        if len(markets) < PAGE_SIZE:
            break

    print(f"  Fetched {liq_fetched} by liquidity → {len(all_markets)} relevant total")

    # ── 3. Fetch events (for nested markets) ─────────────
    # Event slug is what polymarket.com/event/{slug} resolves to.
    # Individual market slugs within a grouped event often 404.
    print("Fetching events...")
    event_slug_map = {}  # market_id → event_slug
    try:
        for evt_offset in range(0, 500, 100):
            url = f"{GAMMA_API}/events?active=true&closed=false&limit=100&offset={evt_offset}&order=volume&ascending=false"
            req = urllib.request.Request(url, headers={"Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=30) as resp:
                events = json.loads(resp.read())
                if not isinstance(events, list) or len(events) == 0:
                    break
                for event in events:
                    evt_slug = event.get("slug", "")
                    for m in (event.get("markets") or []):
                        mid = str(m.get("id", m.get("slug", "")))
                        event_slug_map[mid] = evt_slug
                        parsed = parse_market(m, event_slug=evt_slug)
                        if parsed:
                            all_markets[parsed["market_id"]] = parsed
                if len(events) < 100:
                    break
    except Exception as e:
        print(f"  ⚠ Events fetch error: {e}")

    # Fix URLs for markets that were fetched from /markets but
    # also appear in events — replace with the correct event slug
    for mid, evt_slug in event_slug_map.items():
        if mid in all_markets and evt_slug:
            all_markets[mid]["url"] = f"https://polymarket.com/event/{evt_slug}"

    print(f"  Total relevant markets: {len(all_markets)}")

    # ── 4. Upsert into Supabase ──────────────────────────
    print("Upserting to Supabase...")
    upserted = 0
    for market in all_markets.values():
        try:
            cur.execute("""
                INSERT INTO sotw_predictions (market_id, question, slug, probability, outcomes,
                    outcome_prices, volume, volume_24h, liquidity, end_date, category, image, url, active, updated_at)
                VALUES (%(market_id)s, %(question)s, %(slug)s, %(probability)s, %(outcomes)s,
                    %(outcome_prices)s, %(volume)s, %(volume_24h)s, %(liquidity)s, %(end_date)s,
                    %(category)s, %(image)s, %(url)s, TRUE, NOW())
                ON CONFLICT (market_id) DO UPDATE SET
                    probability = EXCLUDED.probability,
                    outcome_prices = EXCLUDED.outcome_prices,
                    volume = EXCLUDED.volume,
                    volume_24h = EXCLUDED.volume_24h,
                    liquidity = EXCLUDED.liquidity,
                    active = TRUE,
                    updated_at = NOW()
            """, market)
            upserted += 1
        except Exception as e:
            print(f"  ⚠ Upsert error for {market['market_id']}: {e}")

    # ── 5. Cleanup expired & stale markets ─────────────
    # Delete markets whose end_date has passed
    cur.execute("""
        DELETE FROM sotw_predictions
        WHERE end_date IS NOT NULL
        AND end_date < NOW()
    """)
    expired_count = cur.rowcount
    if expired_count:
        print(f"  Deleted {expired_count} expired markets (past end_date)")

    # Mark markets not refreshed in this run as inactive
    cur.execute("""
        UPDATE sotw_predictions
        SET active = FALSE
        WHERE updated_at < NOW() - INTERVAL '2 hours'
        AND active = TRUE
    """)
    stale_count = cur.rowcount
    if stale_count:
        print(f"  Marked {stale_count} stale markets inactive")

    # Delete inactive markets older than 7 days (no longer on Polymarket)
    cur.execute("""
        DELETE FROM sotw_predictions
        WHERE active = FALSE
        AND updated_at < NOW() - INTERVAL '7 days'
    """)
    purged_count = cur.rowcount
    if purged_count:
        print(f"  Purged {purged_count} inactive markets (>7 days old)")

    # Category counts
    cur.execute("""
        SELECT category, COUNT(*) FROM sotw_predictions
        WHERE active = TRUE
        GROUP BY category ORDER BY COUNT(*) DESC
    """)
    cats = cur.fetchall()

    cur.close()
    conn.close()

    print(f"\n✓ Upserted {upserted} markets")
    print("\nCategory breakdown:")
    total = 0
    for cat, count in cats:
        print(f"  {cat}: {count}")
        total += count
    print(f"  TOTAL: {total}")
    print("\n═══ Done ═══")


if __name__ == "__main__":
    main()
