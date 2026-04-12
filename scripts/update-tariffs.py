#!/usr/bin/env python3
"""
Tariff Rate ETL Script
Runs weekly via cron. Checks for US tariff rate changes and updates Supabase.

Usage:
  python3 update-tariffs.py          # Check for changes (dry run)
  python3 update-tariffs.py --apply  # Apply changes to database

Cron (weekly, Sundays 6am UTC):
  0 6 * * 0 cd /opt/sotw-etl && python3 update-tariffs.py --apply >> /var/log/sotw-tariffs.log 2>&1
"""

import os
import sys
import json
import datetime
import requests
from typing import Optional

OPENROUTER_KEY = os.environ.get('OPENROUTER_API_KEY', os.environ.get('OPENROUTER_KEY', ''))
MODEL = 'mistralai/mistral-small-3.1-24b-instruct'

# Database connection (direct PostgreSQL — more reliable than REST API for writes)
DB_HOST = os.environ.get('SUPABASE_DB_HOST', 'aws-1-ca-central-1.pooler.supabase.com')
DB_PORT = os.environ.get('SUPABASE_DB_PORT', '6543')
DB_USER = os.environ.get('SUPABASE_DB_USER', 'postgres.seyrycaldytfjvvkqopu')
DB_PASS = os.environ.get('SUPABASE_DB_PASSWORD', '')
DB_NAME = os.environ.get('SUPABASE_DB_NAME', 'postgres')

TARIFF_SOURCES = [
    'https://www.tradecomplianceresourcehub.com/2026/04/08/trump-2-0-tariff-tracker/',
    'https://taxfoundation.org/research/all/federal/trump-tariffs-trade-war/',
    'https://budgetlab.yale.edu/research/state-us-tariffs-april-2-2026',
]

SEARCH_QUERIES = [
    'US tariff rate change 2026 new',
    'Section 122 tariff update expiry extension',
    'Section 301 investigation tariff rate announced',
    'US trade deal bilateral tariff reduction 2026',
]


def log(msg: str):
    print(f"[{datetime.datetime.utcnow().isoformat()}] {msg}")


def get_db_connection():
    """Get PostgreSQL connection."""
    import psycopg2
    return psycopg2.connect(
        host=DB_HOST, port=DB_PORT, user=DB_USER,
        password=DB_PASS, dbname=DB_NAME, sslmode='require',
    )


def get_current_rates() -> dict:
    """Fetch current tariff rates from database."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT country_id, effective_rate, headline_rate, notes, category, legal_authorities, source_url, change_log FROM sotw_tariff_rates")
    cols = ['country_id', 'effective_rate', 'headline_rate', 'notes', 'category', 'legal_authorities', 'source_url', 'change_log']
    rows = [dict(zip(cols, row)) for row in cur.fetchall()]
    cur.close()
    conn.close()
    return {r['country_id']: r for r in rows}


def search_tariff_news() -> str:
    """Search for recent tariff news using web search."""
    # Use a simple search API or scrape — keeping it minimal
    # In production, could use SerpAPI, Brave Search API, etc.
    # For now, we'll use the OpenRouter model with web search context
    results = []
    for query in SEARCH_QUERIES:
        try:
            resp = requests.get(
                'https://api.duckduckgo.com/',
                params={'q': query, 'format': 'json', 'no_html': 1, 't': 'sotw-tariff-bot'},
                timeout=10,
            )
            if resp.ok:
                data = resp.json()
                if data.get('Abstract'):
                    results.append(f"Query: {query}\nResult: {data['Abstract']}")
                for r in (data.get('RelatedTopics') or [])[:3]:
                    if isinstance(r, dict) and r.get('Text'):
                        results.append(r['Text'])
        except Exception as e:
            log(f"Search error for '{query}': {e}")

    return '\n\n'.join(results) if results else ''


def fetch_source_content(url: str) -> str:
    """Fetch and extract text from a tariff source page."""
    try:
        resp = requests.get(url, timeout=30, headers={
            'User-Agent': 'SOTW-Tariff-Bot/1.0 (statisticsoftheworld.com)'
        })
        if not resp.ok:
            return ''
        # Basic HTML to text — just get visible text
        import re
        text = re.sub(r'<[^>]+>', ' ', resp.text)
        text = re.sub(r'\s+', ' ', text)
        # Truncate to avoid token limits
        return text[:8000]
    except Exception as e:
        log(f"Fetch error for {url}: {e}")
        return ''


def detect_changes(current_rates: dict, news_context: str) -> list:
    """Use AI to detect tariff rate changes from news."""
    if not OPENROUTER_KEY:
        log("ERROR: OPENROUTER_KEY not set. Cannot detect changes.")
        return []

    # Build current rates summary
    rates_summary = '\n'.join([
        f"- {cid}: {r['effective_rate']}% effective ({r['category']})"
        for cid, r in sorted(current_rates.items())
    ])

    prompt = f"""You are a US trade policy analyst. Compare the following news/source content against our current tariff rate database. Identify ANY changes to effective tariff rates.

CURRENT DATABASE RATES:
{rates_summary}

RECENT NEWS AND SOURCE CONTENT:
{news_context[:6000]}

INSTRUCTIONS:
1. Look for any country whose effective tariff rate has CHANGED compared to our database.
2. Look for any NEW countries that should be added.
3. Look for any significant legal changes (e.g., Section 122 expired, new Section 301 rates imposed).
4. ONLY report CONFIRMED changes with credible sources. Ignore proposals, threats, and speculation.

Respond ONLY in this JSON format (empty array if no changes):
[
  {{
    "country_id": "ISO3 code",
    "old_rate": 10,
    "new_rate": 15,
    "reason": "Brief explanation of what changed",
    "legal_authority": "Section 122/232/301/etc",
    "source": "URL or publication name",
    "confidence": "high/medium/low"
  }}
]

If there are no confirmed changes, respond with: []"""

    try:
        resp = requests.post(
            'https://openrouter.ai/api/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {OPENROUTER_KEY}',
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://statisticsoftheworld.com',
            },
            json={
                'model': MODEL,
                'messages': [{'role': 'user', 'content': prompt}],
                'max_tokens': 1000,
                'temperature': 0.1,  # Low temperature for factual accuracy
            },
            timeout=30,
        )

        if not resp.ok:
            log(f"AI API error: {resp.status_code} {resp.text[:200]}")
            return []

        content = resp.json().get('choices', [{}])[0].get('message', {}).get('content', '').strip()

        # Extract JSON from response
        import re
        json_match = re.search(r'\[.*\]', content, re.DOTALL)
        if json_match:
            changes = json.loads(json_match.group())
            # Filter to high/medium confidence only
            return [c for c in changes if c.get('confidence') in ('high', 'medium')]
        return []

    except Exception as e:
        log(f"AI detection error: {e}")
        return []


def apply_changes(changes: list, current_rates: dict):
    """Apply verified changes to database."""
    conn = get_db_connection()
    cur = conn.cursor()

    for change in changes:
        cid = change['country_id']
        new_rate = change['new_rate']
        reason = change['reason']
        source = change.get('source', '')

        old_entry = current_rates.get(cid)
        if not old_entry:
            log(f"  SKIP: {cid} not in database (would need manual add)")
            continue

        old_rate = float(old_entry['effective_rate'])
        if abs(old_rate - new_rate) < 0.1:
            log(f"  SKIP: {cid} rate unchanged ({old_rate}%)")
            continue

        # Build change log entry
        change_entry = {
            'date': datetime.date.today().isoformat(),
            'old_rate': old_rate,
            'new_rate': new_rate,
            'reason': reason,
            'source': source,
        }

        existing_log = old_entry.get('change_log', [])
        if isinstance(existing_log, str):
            existing_log = json.loads(existing_log)
        if existing_log is None:
            existing_log = []
        existing_log.append(change_entry)

        # Determine new category
        if new_rate >= 30:
            category = 'max'
        elif new_rate >= 20:
            category = 'high'
        elif new_rate > 10:
            category = 'medium'
        elif new_rate >= 8:
            category = 'baseline'
        else:
            category = 'low'

        new_notes = f"{reason} (updated {datetime.date.today().isoformat()}). Previous rate: {old_rate}%. Source: {source}"

        try:
            cur.execute("""
                UPDATE sotw_tariff_rates SET
                    effective_rate = %s, notes = %s, category = %s,
                    last_changed = NOW(), last_verified = NOW(),
                    change_log = %s::jsonb, source_url = %s
                WHERE country_id = %s
            """, (new_rate, new_notes, category, json.dumps(existing_log), source, cid))
            log(f"  UPDATED: {cid} {old_rate}% → {new_rate}% ({reason})")
        except Exception as e:
            log(f"  ERROR updating {cid}: {e}")

    conn.commit()
    cur.close()
    conn.close()


def update_verified_timestamp(current_rates: dict):
    """Mark all rates as verified (even if unchanged)."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("UPDATE sotw_tariff_rates SET last_verified = NOW()")
    conn.commit()
    affected = cur.rowcount
    cur.close()
    conn.close()
    log(f"Marked {affected} rates as verified.")


def main():
    apply = '--apply' in sys.argv
    log(f"=== Tariff Rate ETL {'(APPLY MODE)' if apply else '(DRY RUN)'} ===")

    # 1. Get current rates
    log("Fetching current rates from Supabase...")
    current_rates = get_current_rates()
    log(f"  Found {len(current_rates)} countries in database.")

    # 2. Gather news context
    log("Searching for tariff news...")
    news = search_tariff_news()

    log("Fetching source pages...")
    for url in TARIFF_SOURCES[:2]:  # Limit to avoid rate limits
        content = fetch_source_content(url)
        if content:
            news += f"\n\nSOURCE ({url}):\n{content[:3000]}"

    if not news:
        log("No news context found. Updating verified timestamps only.")
        if apply:
            update_verified_timestamp(current_rates)
        return

    log(f"  Gathered {len(news)} chars of context.")

    # 3. Detect changes
    log("Running AI change detection...")
    changes = detect_changes(current_rates, news)

    if not changes:
        log("No tariff rate changes detected.")
        if apply:
            update_verified_timestamp(current_rates)
        return

    log(f"Detected {len(changes)} potential change(s):")
    for c in changes:
        log(f"  {c['country_id']}: {c.get('old_rate', '?')}% → {c['new_rate']}% "
            f"({c['reason']}) [confidence: {c.get('confidence', '?')}]")

    # 4. Apply if in apply mode
    if apply:
        log("Applying changes...")
        apply_changes(changes, current_rates)
        update_verified_timestamp(current_rates)
    else:
        log("DRY RUN — no changes applied. Use --apply to write to database.")

    log("=== Done ===")


if __name__ == '__main__':
    main()
