#!/usr/bin/env python3
"""
ETL: UN COMTRADE v2 trade data → Supabase

Uses the authenticated COMTRADE v2 API to fetch bilateral trade data
(partners + commodities) for 50 countries and cache in sotw_trade_cache.

API: https://comtradeapi.un.org/data/v1/get/C/A/HS
Key: Free tier, ~1 req/2s rate limit
Data: 2024 bilateral trade (exports, imports, partners, commodities)

Schedule: Monthly (1st of month).
Runtime: ~3-5 minutes (2s delay between requests).
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "db.seyrycaldytfjvvkqopu.supabase.co")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")
COMTRADE_KEY = os.environ.get("COMTRADE_API_KEY", "")

V2_BASE = "https://comtradeapi.un.org/data/v1/get/C/A/HS"

# Top 50 countries by trade volume — ISO3 → COMTRADE numeric code
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


def fetch_v2(reporter_code, cmd_code="TOTAL"):
    """Fetch bilateral trade from COMTRADE v2 (exports+imports combined)."""
    url = (
        f"{V2_BASE}?reporterCode={reporter_code}"
        f"&period=2024,2023"
        f"&flowCode=X,M"
        f"&cmdCode={cmd_code}"
        f"&includeDesc=true"
        f"&subscription-key={COMTRADE_KEY}"
    )
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "SOTW/2.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
            return data.get("data", [])
    except urllib.error.HTTPError as e:
        if e.code == 429:
            print("rate-limited, waiting 5s...", end=" ", flush=True)
            time.sleep(5)
            # Retry once
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "SOTW/2.0"})
                with urllib.request.urlopen(req, timeout=30) as resp:
                    data = json.loads(resp.read())
                    return data.get("data", [])
            except Exception:
                return []
        print(f"HTTP {e.code}", end=" ", flush=True)
        return []
    except Exception as e:
        print(f"error: {e}", end=" ", flush=True)
        return []


def process_country(records):
    """Split combined X+M records into structured trade data."""
    if not records:
        return None

    # Detect the latest year in the data
    years = set(r.get("refYear") or r.get("period") for r in records)
    year = max(years) if years else 2024

    # Filter to latest year only
    latest = [r for r in records if (r.get("refYear") or r.get("period")) == year]

    exports = [r for r in latest if r.get("flowCode") == "X"]
    imports = [r for r in latest if r.get("flowCode") == "M"]

    # Total (partnerCode=0 = World)
    total_exports = sum(r.get("primaryValue", 0) or 0 for r in exports if r.get("partnerCode") == 0)
    total_imports = sum(r.get("primaryValue", 0) or 0 for r in imports if r.get("partnerCode") == 0)

    # If no World aggregate, sum individual partners
    if total_exports == 0:
        total_exports = sum(r.get("primaryValue", 0) or 0 for r in exports if r.get("partnerCode", 0) != 0)
    if total_imports == 0:
        total_imports = sum(r.get("primaryValue", 0) or 0 for r in imports if r.get("partnerCode", 0) != 0)

    def top_partners(flow_records):
        partners = [r for r in flow_records if r.get("partnerCode", 0) != 0 and r.get("primaryValue")]
        partners.sort(key=lambda r: r["primaryValue"], reverse=True)
        return [
            {
                "name": r.get("partnerDesc") or f"Code {r.get('partnerCode')}",
                "iso": r.get("partnerISO") or "",
                "value": r["primaryValue"],
            }
            for r in partners[:15]
        ]

    return {
        "year": year,
        "totalExports": total_exports,
        "totalImports": total_imports,
        "tradeBalance": total_exports - total_imports,
        "topExportPartners": top_partners(exports),
        "topImportPartners": top_partners(imports),
    }


def process_commodities(records):
    """Extract top export/import commodities from AG2 data."""
    if not records:
        return [], []

    years = set(r.get("refYear") or r.get("period") for r in records)
    year = max(years) if years else 2024
    latest = [r for r in records if (r.get("refYear") or r.get("period")) == year]

    exports = [r for r in latest if r.get("flowCode") == "X" and r.get("primaryValue")]
    imports = [r for r in latest if r.get("flowCode") == "M" and r.get("primaryValue")]

    def top_commodities(flow_records):
        flow_records.sort(key=lambda r: r["primaryValue"], reverse=True)
        return [
            {
                "code": r.get("cmdCode", ""),
                "name": (r.get("cmdDesc") or "").split(";")[0].strip()[:60],
                "value": r["primaryValue"],
            }
            for r in flow_records[:15]
        ]

    return top_commodities(exports), top_commodities(imports)


def main():
    import psycopg2

    if not DB_PASS:
        print("❌ SUPABASE_DB_PASSWORD not set")
        sys.exit(1)

    if not COMTRADE_KEY:
        print("❌ COMTRADE_API_KEY not set")
        sys.exit(1)

    print("═══ COMTRADE v2 Trade Data ETL ═══", flush=True)

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
    print("✓ Table ready", flush=True)

    fetched = 0
    for iso3, code in COUNTRY_CODES.items():
        print(f"  {iso3}...", end=" ", flush=True)

        # 1. Partners (exports+imports combined)
        partner_records = fetch_v2(code, "TOTAL")
        time.sleep(2)

        # 2. Commodities (exports+imports combined)
        commodity_records = fetch_v2(code, "AG2")
        time.sleep(2)

        trade_data = process_country(partner_records)
        if not trade_data:
            print("no data", flush=True)
            continue

        export_commodities, import_commodities = process_commodities(commodity_records)
        trade_data["topExportCommodities"] = export_commodities
        trade_data["topImportCommodities"] = import_commodities

        cur.execute("""
            INSERT INTO sotw_trade_cache (country_id, data, updated_at)
            VALUES (%s, %s, NOW())
            ON CONFLICT (country_id) DO UPDATE SET
                data = EXCLUDED.data, updated_at = NOW()
        """, (iso3, json.dumps(trade_data)))

        fetched += 1
        year = trade_data["year"]
        exp = trade_data["totalExports"]
        imp = trade_data["totalImports"]
        print(f"✓ {year} exports=${exp/1e9:.1f}B imports=${imp/1e9:.1f}B", flush=True)

    cur.close()
    conn.close()
    print(f"\n✓ Cached trade data for {fetched}/{len(COUNTRY_CODES)} countries", flush=True)
    print("═══ Done ═══")


if __name__ == "__main__":
    main()
