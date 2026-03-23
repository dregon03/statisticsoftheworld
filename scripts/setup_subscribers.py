#!/usr/bin/env python3
"""Create the sotw_subscribers table if it doesn't exist."""

import os
import socket
import sys

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "db.seyrycaldytfjvvkqopu.supabase.co")
# Force IPv4 (GitHub Actions runners fail on IPv6)
import socket as _socket
_orig_getaddrinfo = _socket.getaddrinfo
def _ipv4_getaddrinfo(host, port, family=0, *args, **kwargs):
    return _orig_getaddrinfo(host, port, _socket.AF_INET, *args, **kwargs)
_socket.getaddrinfo = _ipv4_getaddrinfo
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")


def main():
    import psycopg2

    if not DB_PASS:
        print("SUPABASE_DB_PASSWORD not set")
        sys.exit(1)

    # Use connection string with sslmode to force IPv4 via TCP
    dsn = f"postgresql://postgres:{DB_PASS}@{DB_HOST}:5432/postgres?sslmode=require&options=-c%20statement_timeout%3D30000"
    conn = psycopg2.connect(dsn)
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
    print(f"sotw_subscribers table ready ({count} active subscribers)")


if __name__ == "__main__":
    main()
