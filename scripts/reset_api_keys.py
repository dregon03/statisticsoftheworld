#!/usr/bin/env python3
"""
Reset daily API key usage counters.
Runs daily at midnight UTC via GitHub Actions.
"""

import os
import socket
import sys

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "db.seyrycaldytfjvvkqopu.supabase.co")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")


def main():
    import psycopg2

    if not DB_PASS:
        print("❌ SUPABASE_DB_PASSWORD not set")
        sys.exit(1)

    conn = psycopg2.connect(
        host=DB_HOST, dbname="postgres", user=os.environ.get("SUPABASE_DB_USER", "postgres"),
        password=DB_PASS, port=int(os.environ.get("SUPABASE_DB_PORT", "5432"))
    )
    conn.autocommit = True
    cur = conn.cursor()

    # Reset daily counters
    cur.execute("""
        UPDATE sotw_api_keys
        SET requests_today = 0
        WHERE requests_today > 0
    """)
    reset_count = cur.rowcount

    # Deactivate keys that haven't been used in 90 days
    cur.execute("""
        UPDATE sotw_api_keys
        SET active = FALSE
        WHERE active = TRUE
        AND last_used_at IS NOT NULL
        AND last_used_at < NOW() - INTERVAL '90 days'
    """)
    deactivated = cur.rowcount

    # Report usage stats
    cur.execute("""
        SELECT tier, COUNT(*), SUM(requests_total)
        FROM sotw_api_keys
        WHERE active = TRUE
        GROUP BY tier
    """)
    stats = cur.fetchall()

    cur.close()
    conn.close()

    print(f"✓ Reset {reset_count} API key daily counters")
    if deactivated:
        print(f"  Deactivated {deactivated} dormant keys (90+ days unused)")
    if stats:
        print("  Active keys by tier:")
        for tier, count, total_req in stats:
            print(f"    {tier}: {count} keys, {total_req or 0} total requests")


if __name__ == "__main__":
    main()
