#!/usr/bin/env python3
"""Create the sotw_subscribers table if it doesn't exist."""

import os
import sys

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "db.seyrycaldytfjvvkqopu.supabase.co")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")


def main():
    import psycopg2

    if not DB_PASS:
        print("❌ SUPABASE_DB_PASSWORD not set")
        sys.exit(1)

    conn = psycopg2.connect(
        host=DB_HOST, dbname="postgres", user="postgres",
        password=DB_PASS, port=5432
    )
    conn.autocommit = True
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS sotw_subscribers (
            email TEXT PRIMARY KEY,
            subscribed_at TIMESTAMPTZ DEFAULT NOW(),
            active BOOLEAN DEFAULT TRUE
        );
    """)

    cur.execute("SELECT COUNT(*) FROM sotw_subscribers WHERE active = TRUE")
    count = cur.fetchone()[0]

    cur.close()
    conn.close()
    print(f"✓ sotw_subscribers table ready ({count} active subscribers)")


if __name__ == "__main__":
    main()
