#!/usr/bin/env python3
"""
ETL: UN COMTRADE trade data → Supabase

Pre-fetches trade data for top 50 countries and caches in
sotw_trade_cache table. Eliminates live COMTRADE API calls
on every user visit.

Schedule: Weekly (Sunday, after macro data refresh).
Runtime: ~5-10 minutes (rate-limited by COMTRADE API).
"""

import json
import os
import socket
import sys
import time
import urllib.request
import urllib.error

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "db.seyrycaldytfjvvkqopu.supabase.co")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")

# Top 50 countries by trade volume
COUNTRY_CODES = {
    "USA": 842, "CAN": 124, "GBR": 826, "DEU": 276, "FRA": 250,
    "JPN": 392, "CHN": 156, "IND": 356, "BRA": 76, "MEX": 484,
    "KOR": 410, "AUS": 36, "ITA": 380, "ESP": 724, "NLD": 528,
    "CHE": 756, "SWE": 752, "NOR": 578, "DNK": 208, "FIN": 246,
    "AUT": 40, "BEL": 56, "PRT": 620, "IRL": 372, "POL": 616,
    "RUS": 643, "ZAF": 710, "TUR": 792, "ISR": 376, "SAU": 682,
    "ARE": 784, "SGP": 702, "IDN": 360, "THA": 764, "MYS": 458,
    "PHL": 608, "VNM": 704, "NZL": 554, "ARG": 32, "CHL": 152,
    "COL": 170, "PER": 604, "EGY": 818, "NGA": 566, "KEN": 404,
    "MAR": 504, "GHA": 288, "HKG": 344, "TWN": 490, "PAK": 586,
}


def fetch_comtrade(reporter_code, flow_code, cmd_level):
    """Fetch from COMTRADE public API."""
    url = (
        f"https://comtradeapi.un.org/public/v1/preview/C/A/HS"
        f"?reporterCode={reporter_code}&period=2023"
        f"&flowCode={flow_code}&cmdCode={cmd_level}&includeDesc=true"
    )
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "SOTW/1.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
            return data.get("data", [])
    except Exception as e:
        print(f"    ⚠ COMTRADE error: {e}")
        return []


def main():
    import psycopg2

    if not DB_PASS:
        print("❌ SUPABASE_DB_PASSWORD not set")
        sys.exit(1)

    print("═══ COMTRADE Trade Data ETL ═══")

    conn = psycopg2.connect(
        host=DB_HOST, dbname="postgres", user=os.environ.get("SUPABASE_DB_USER", "postgres"),
        password=DB_PASS, port=int(os.environ.get("SUPABASE_DB_PORT", "5432"))
    )
    conn.autocommit = True
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS sotw_trade_cache (
            country_id TEXT NOT NULL,
            data JSONB NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            PRIMARY KEY (country_id)
        );
    """)
    print("✓ Table ready")

    fetched = 0
    for iso3, code in COUNTRY_CODES.items():
        print(f"  Fetching {iso3}...", end=" ", flush=True)

        # Fetch exports + imports by partner (TOTAL) and by commodity (AG2)
        export_partners = fetch_comtrade(code, "X", "TOTAL")
        time.sleep(1)  # Rate limit
        import_partners = fetch_comtrade(code, "M", "TOTAL")
        time.sleep(1)

        if not export_partners and not import_partners:
            print("no data")
            continue

        # Calculate totals
        total_exports = sum(r.get("primaryValue", 0) or 0 for r in export_partners if r.get("partnerCode") == 0)
        total_imports = sum(r.get("primaryValue", 0) or 0 for r in import_partners if r.get("partnerCode") == 0)

        # Top partners (exclude World = code 0)
        top_export_partners = sorted(
            [r for r in export_partners if r.get("partnerCode", 0) != 0 and r.get("primaryValue")],
            key=lambda r: r["primaryValue"], reverse=True
        )[:15]

        top_import_partners = sorted(
            [r for r in import_partners if r.get("partnerCode", 0) != 0 and r.get("primaryValue")],
            key=lambda r: r["primaryValue"], reverse=True
        )[:15]

        trade_data = {
            "year": 2023,
            "totalExports": total_exports,
            "totalImports": total_imports,
            "tradeBalance": total_exports - total_imports,
            "topExportPartners": [
                {"name": r.get("partnerDesc", ""), "value": r["primaryValue"]}
                for r in top_export_partners
            ],
            "topImportPartners": [
                {"name": r.get("partnerDesc", ""), "value": r["primaryValue"]}
                for r in top_import_partners
            ],
        }

        cur.execute("""
            INSERT INTO sotw_trade_cache (country_id, data, updated_at)
            VALUES (%s, %s, NOW())
            ON CONFLICT (country_id) DO UPDATE SET
                data = EXCLUDED.data,
                updated_at = NOW()
        """, (iso3, json.dumps(trade_data)))

        fetched += 1
        print(f"✓ exports=${total_exports/1e9:.1f}B imports=${total_imports/1e9:.1f}B")
        time.sleep(1)  # Be nice to COMTRADE

    cur.close()
    conn.close()
    print(f"\n✓ Cached trade data for {fetched} countries")
    print("═══ Done ═══")


if __name__ == "__main__":
    main()
