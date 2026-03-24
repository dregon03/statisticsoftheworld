#!/usr/bin/env python3
"""
ETL: UN COMTRADE v2 trade data → Supabase

Dynamically discovers all countries with trade data from COMTRADE v2,
then processes a rotating daily batch (~24 countries/day). All 170+
countries are refreshed every 7 days.

API: https://comtradeapi.un.org/data/v1/get/C/A/HS
Key: Free tier, ~1 req/2s rate limit
Data: 2024/2023 bilateral trade (exports, imports, partners, commodities)

Schedule: Daily (7 AM UTC), rotating batches.
Runtime: ~10-15 minutes per batch (~24 countries).
"""

import argparse
import datetime
import json
import os
import sys
import time
import urllib.request
import urllib.error

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "db.seyrycaldytfjvvkqopu.supabase.co")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")
COMTRADE_KEY = os.environ.get("COMTRADE_API_KEY", "")

V2_BASE = "https://comtradeapi.un.org/data/v1"

# Some COMTRADE codes differ from standard ISO3 — map them
COMTRADE_ISO_OVERRIDES = {
    "S19": "TWN",  # COMTRADE uses S19 for Chinese Taipei
    "EUR": None,   # EU aggregate, skip
}

# COMTRADE reporter codes differ from ISO numeric for some countries
# These are manually verified overrides where getDA returns wrong ISO
COMTRADE_CODE_FIXES = {
    "FRA": 251,  # COMTRADE uses 251 not 250 for France
    "NOR": 579,  # COMTRADE uses 579 not 578
    "CHE": 757,  # COMTRADE uses 757 not 756
    "IND": 699,  # COMTRADE uses 699 not 356 sometimes
}


def fetch_json(url, timeout=30):
    """Fetch JSON with rate-limit retry."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "SOTW/2.0"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        if e.code == 429:
            time.sleep(5)
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "SOTW/2.0"})
                with urllib.request.urlopen(req, timeout=timeout) as resp:
                    return json.loads(resp.read())
            except Exception:
                return None
        return None
    except Exception:
        return None


def discover_countries():
    """Get all countries with trade data from COMTRADE data availability API."""
    countries = {}  # ISO3 -> reporter_code

    for year in [2024, 2023]:
        url = f"{V2_BASE}/getDA/C/A/HS?subscription-key={COMTRADE_KEY}&period={year}"
        data = fetch_json(url)
        if not data:
            continue

        for r in data.get("data", []):
            code = r.get("reporterCode")
            iso = r.get("reporterISO", "")
            if not code or not iso:
                continue

            # Apply overrides
            if iso in COMTRADE_ISO_OVERRIDES:
                iso = COMTRADE_ISO_OVERRIDES[iso]
                if iso is None:
                    continue

            if iso not in countries and len(iso) == 3:
                countries[iso] = code

        time.sleep(2)

    # Apply code fixes
    for iso, code in COMTRADE_CODE_FIXES.items():
        if iso not in countries:
            countries[iso] = code

    return countries


def fetch_trade(reporter_code, cmd_code="TOTAL"):
    """Fetch bilateral trade from COMTRADE v2 (exports+imports combined)."""
    url = (
        f"{V2_BASE}/get/C/A/HS?reporterCode={reporter_code}"
        f"&period=2024,2023"
        f"&flowCode=X,M"
        f"&cmdCode={cmd_code}"
        f"&includeDesc=true"
        f"&subscription-key={COMTRADE_KEY}"
    )
    data = fetch_json(url)
    return data.get("data", []) if data else []


def clean_records(records):
    """Transform: deduplicate and normalize raw COMTRADE records.

    COMTRADE v2 returns multiple rows per partner due to:
    - partner2Code: transit/intermediary trade breakdowns
    - customsCode: C00 (total), C03 (re-imports), C08 (re-exports)

    We filter to direct trade only, then deduplicate by partner,
    keeping the highest value per (flow, partner) pair.
    """
    # 1. Filter to direct trade: partner2Code=0, customsCode=C00
    clean = []
    for r in records:
        val = r.get("primaryValue")
        if val is None:
            continue
        try:
            val = float(val)
        except (ValueError, TypeError):
            continue
        if val <= 0:
            continue

        # Only keep direct trade (no transit breakdowns)
        if r.get("partner2Code", 0) != 0:
            continue
        # Prefer total customs (C00), but accept if customsCode not present
        customs = r.get("customsCode", "C00")
        if customs not in ("C00", None, ""):
            continue

        r["primaryValue"] = val
        clean.append(r)

    # 2. Deduplicate: keep highest value per (flowCode, partnerCode)
    best = {}
    for r in clean:
        key = (r.get("flowCode"), r.get("partnerCode"))
        if key not in best or r["primaryValue"] > best[key]["primaryValue"]:
            best[key] = r

    return list(best.values())


def process_country(records):
    """Split combined X+M records into structured trade data."""
    if not records:
        return None

    # Transform: clean, deduplicate, normalize
    records = clean_records(records)
    if not records:
        return None

    years = set(r.get("refYear") or r.get("period") for r in records)
    year = max(int(y) for y in years if y)

    latest = [r for r in records if int(r.get("refYear") or r.get("period") or 0) == year]

    exports = [r for r in latest if r.get("flowCode") == "X"]
    imports = [r for r in latest if r.get("flowCode") == "M"]

    total_exports = sum(r.get("primaryValue", 0) or 0 for r in exports if r.get("partnerCode") == 0)
    total_imports = sum(r.get("primaryValue", 0) or 0 for r in imports if r.get("partnerCode") == 0)

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

    # Transform: clean and deduplicate commodity records
    records = clean_records(records)
    if not records:
        return [], []

    years = set(r.get("refYear") or r.get("period") for r in records)
    year = max(int(y) for y in years if y)
    latest = [r for r in records if int(r.get("refYear") or r.get("period") or 0) == year]

    def top_commodities(flow_records):
        # Deduplicate by cmdCode (keep highest value per commodity)
        best = {}
        for r in flow_records:
            code = r.get("cmdCode", "")
            if code not in best or (r.get("primaryValue", 0) or 0) > (best[code].get("primaryValue", 0) or 0):
                best[code] = r
        deduped = sorted(best.values(), key=lambda r: r.get("primaryValue", 0) or 0, reverse=True)
        return [
            {
                "code": r.get("cmdCode", ""),
                "name": (r.get("cmdDesc") or "").split(";")[0].strip()[:60],
                "value": r["primaryValue"],
            }
            for r in deduped[:15]
        ]

    return (
        top_commodities([r for r in latest if r.get("flowCode") == "X"]),
        top_commodities([r for r in latest if r.get("flowCode") == "M"]),
    )


def main():
    import psycopg2

    parser = argparse.ArgumentParser(description="COMTRADE v2 Trade ETL")
    parser.add_argument("--batch", type=int, default=-1, help="Batch number (0-6). -1 = auto from day of year")
    parser.add_argument("--total-batches", type=int, default=7, help="Total number of batches")
    args = parser.parse_args()

    if not DB_PASS:
        print("❌ SUPABASE_DB_PASSWORD not set")
        sys.exit(1)
    if not COMTRADE_KEY:
        print("❌ COMTRADE_API_KEY not set")
        sys.exit(1)

    print("═══ COMTRADE v2 Trade Data ETL ═══", flush=True)

    # 1. Discover all available countries
    print("Discovering countries...", end=" ", flush=True)
    all_countries = discover_countries()
    print(f"{len(all_countries)} countries found", flush=True)

    if not all_countries:
        print("❌ No countries discovered from COMTRADE API")
        sys.exit(1)

    # 2. Determine batch
    sorted_countries = sorted(all_countries.items())  # Deterministic order
    batch = args.batch if args.batch >= 0 else datetime.datetime.utcnow().timetuple().tm_yday % args.total_batches
    batch_size = len(sorted_countries) // args.total_batches + 1
    start = batch * batch_size
    end = min(start + batch_size, len(sorted_countries))
    batch_countries = sorted_countries[start:end]

    print(f"Batch {batch}/{args.total_batches - 1}: countries {start + 1}-{end} of {len(sorted_countries)} ({len(batch_countries)} in this batch)", flush=True)

    # 3. Connect to DB
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

    # 4. Fetch and cache
    fetched = 0
    skipped = 0
    for iso3, code in batch_countries:
        print(f"  {iso3}...", end=" ", flush=True)

        partner_records = fetch_trade(code, "TOTAL")
        time.sleep(2)

        commodity_records = fetch_trade(code, "AG2")
        time.sleep(2)

        trade_data = process_country(partner_records)
        if not trade_data:
            print("no data", flush=True)
            skipped += 1
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
        print(f"✓ {year} exports=${exp / 1e9:.1f}B imports=${imp / 1e9:.1f}B", flush=True)

    cur.close()
    conn.close()

    print(f"\n✓ Batch {batch}: cached {fetched} countries, skipped {skipped}", flush=True)
    print(f"  Total available: {len(all_countries)} countries across all batches", flush=True)
    print("═══ Done ═══")


if __name__ == "__main__":
    main()
