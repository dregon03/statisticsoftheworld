#!/usr/bin/env python3
"""
Monitor Supabase database health and usage.
Reports table sizes, row counts, and alerts on issues.
"""

import os
import socket
import sys

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "db.seyrycaldytfjvvkqopu.supabase.co")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")

# Supabase Pro limit: 8 GB database size
DB_SIZE_WARN_GB = 6.0


def main():
    import psycopg2

    if not DB_PASS:
        print("❌ SUPABASE_DB_PASSWORD not set")
        sys.exit(1)

    conn = psycopg2.connect(
        host=DB_HOST, dbname="postgres", user=os.environ.get("SUPABASE_DB_USER", "postgres"),
        password=DB_PASS, port=int(os.environ.get("SUPABASE_DB_PORT", "5432"))
    )
    cur = conn.cursor()

    # Total DB size
    cur.execute("SELECT pg_database_size('postgres')")
    db_size_bytes = cur.fetchone()[0]
    db_size_gb = db_size_bytes / (1024 ** 3)

    print(f"═══ Supabase Health Check ═══")
    print(f"Database size: {db_size_gb:.2f} GB / 8 GB ({db_size_gb/8*100:.0f}%)")

    if db_size_gb > DB_SIZE_WARN_GB:
        print(f"::warning::Database size {db_size_gb:.2f} GB exceeds {DB_SIZE_WARN_GB} GB warning threshold!")

    # Table-level sizes and row counts
    cur.execute("""
        SELECT
            relname AS table_name,
            n_live_tup AS row_count,
            pg_total_relation_size(relid) AS total_bytes
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
        AND relname LIKE 'sotw_%'
        ORDER BY pg_total_relation_size(relid) DESC
    """)
    tables = cur.fetchall()

    print("\nTable breakdown:")
    print(f"  {'Table':<35} {'Rows':>10} {'Size':>10}")
    print(f"  {'─'*35} {'─'*10} {'─'*10}")
    for name, rows, size_bytes in tables:
        size_mb = size_bytes / (1024 ** 2)
        size_str = f"{size_mb:.1f} MB" if size_mb >= 1 else f"{size_bytes/1024:.0f} KB"
        print(f"  {name:<35} {rows:>10,} {size_str:>10}")

    # Check for stale data (indicators not updated in 14+ days)
    cur.execute("""
        SELECT COUNT(*) FROM sotw_indicators
        WHERE year::int < EXTRACT(YEAR FROM NOW()) - 2
    """)
    stale = cur.fetchone()[0]
    if stale > 0:
        print(f"\n  ℹ {stale} indicators have data older than 2 years (may need refresh)")

    # Check narrative freshness
    cur.execute("""
        SELECT COUNT(*) FROM sotw_country_narratives
        WHERE generated_at < NOW() - INTERVAL '60 days'
    """)
    old_narratives = cur.fetchone()[0]
    if old_narratives > 0:
        print(f"  ℹ {old_narratives} country narratives are older than 60 days")

    # Check prediction market health
    cur.execute("""
        SELECT COUNT(*) FROM sotw_predictions WHERE active = TRUE
    """)
    result = cur.fetchone()
    active_predictions = result[0] if result else 0
    print(f"\n  Active predictions: {active_predictions}")

    cur.close()
    conn.close()
    print("\n═══ Done ═══")


if __name__ == "__main__":
    main()
