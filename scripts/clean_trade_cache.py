#!/usr/bin/env python3
"""One-time cleanup: deduplicate partner/commodity lists in sotw_trade_cache."""
import json, os, sys

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "aws-1-ca-central-1.pooler.supabase.com")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")
if not DB_PASS:
    print("SUPABASE_DB_PASSWORD not set"); sys.exit(1)

import psycopg2
conn = psycopg2.connect(
    host=DB_HOST, port=int(os.environ.get("SUPABASE_DB_PORT", "6543")),
    dbname="postgres", user=os.environ.get("SUPABASE_DB_USER", "postgres.seyrycaldytfjvvkqopu"),
    password=DB_PASS,
)
conn.autocommit = True
cur = conn.cursor()
cur.execute("SELECT country_id, data FROM sotw_trade_cache")
rows = cur.fetchall()
print(f"Total cached countries: {len(rows)}", flush=True)

fixed = 0
for country_id, data in rows:
    if not data:
        continue
    changed = False
    for key in ["topExportPartners", "topImportPartners"]:
        partners = data.get(key, [])
        if not partners: continue
        seen = {}
        for p in partners:
            name = p.get("name", "")
            if name not in seen or (p.get("value", 0) or 0) > (seen[name].get("value", 0) or 0):
                seen[name] = p
        deduped = sorted(seen.values(), key=lambda x: -(x.get("value", 0) or 0))[:15]
        if len(deduped) < len(partners):
            data[key] = deduped
            changed = True
    for key in ["topExportCommodities", "topImportCommodities"]:
        items = data.get(key, [])
        if not items: continue
        seen = {}
        for c in items:
            code = c.get("code", "")
            if code not in seen or (c.get("value", 0) or 0) > (seen[code].get("value", 0) or 0):
                seen[code] = c
        deduped = sorted(seen.values(), key=lambda x: -(x.get("value", 0) or 0))[:15]
        if len(deduped) < len(items):
            data[key] = deduped
            changed = True
    if changed:
        cur.execute("UPDATE sotw_trade_cache SET data = %s, updated_at = NOW() WHERE country_id = %s",
                    (json.dumps(data), country_id))
        fixed += 1
        print(f"  Fixed {country_id}", flush=True)

cur.close(); conn.close()
print(f"\nCleaned {fixed} / {len(rows)} countries", flush=True)
