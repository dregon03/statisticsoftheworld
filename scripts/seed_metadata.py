#!/usr/bin/env python3
"""
Seed indicator metadata from World Bank and IMF API documentation.
Pulls descriptions, source info, and methodology notes.

Usage:
  python3 scripts/seed_metadata.py
"""

import json
import time
import psycopg2
import urllib.request
import os
import socket

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "db.seyrycaldytfjvvkqopu.supabase.co")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")

DB = dict(
    host=DB_HOST, port=int(os.environ.get("SUPABASE_DB_PORT", "5432")), dbname="postgres", user=os.environ.get("SUPABASE_DB_USER", "postgres"),
    password=DB_PASS, sslmode="require",
)

WB_BASE = "https://api.worldbank.org/v2"


def fetch_json(url):
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (StatisticsOfTheWorld)",
        "Accept": "application/json",
    })
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read())


# IMF indicator metadata (manually curated — IMF doesn't have a metadata API)
IMF_META = {
    "IMF.NGDPD": {
        "description": "Gross domestic product, current prices. GDP is the total value of all final goods and services produced within a country in a given year, expressed in current U.S. dollars.",
        "methodology": "Compiled from national accounts data reported by member countries. Estimates are based on national accounts statistics and may include adjustments for consistency. Values are expressed in billions of U.S. dollars at market exchange rates.",
        "unit": "Billions of current U.S. dollars",
        "source_name": "IMF World Economic Outlook",
        "source_url": "https://www.imf.org/en/Publications/WEO",
    },
    "IMF.NGDP_RPCH": {
        "description": "Annual percentage change of real GDP. Measures the rate of economic growth adjusted for inflation, reflecting the actual increase in the volume of goods and services produced.",
        "methodology": "Calculated as the percentage change in GDP at constant prices from one year to the next. Based on national accounts data with adjustments for comparability.",
        "unit": "Annual percent change",
        "source_name": "IMF World Economic Outlook",
        "source_url": "https://www.imf.org/en/Publications/WEO",
    },
    "IMF.NGDPDPC": {
        "description": "GDP per capita at current prices. Total GDP divided by total population, expressed in current U.S. dollars. A basic measure of average economic output per person.",
        "methodology": "GDP in current U.S. dollars divided by midyear population estimates. Does not account for differences in cost of living across countries.",
        "unit": "Current U.S. dollars per person",
        "source_name": "IMF World Economic Outlook",
        "source_url": "https://www.imf.org/en/Publications/WEO",
    },
    "IMF.PPPGDP": {
        "description": "GDP based on purchasing power parity (PPP). Adjusts GDP to account for price differences across countries, providing a more accurate comparison of economic size and living standards.",
        "methodology": "Uses PPP exchange rates from the International Comparison Program (ICP) to convert GDP to a common currency. PPP rates equalize the purchasing power of different currencies by accounting for the cost of a standard basket of goods.",
        "unit": "Billions of international dollars",
        "source_name": "IMF World Economic Outlook",
        "source_url": "https://www.imf.org/en/Publications/WEO",
    },
    "IMF.PPPPC": {
        "description": "GDP per capita based on purchasing power parity. GDP-PPP divided by population. Provides a more meaningful comparison of average living standards across countries than nominal GDP per capita.",
        "methodology": "GDP at PPP exchange rates divided by midyear population. PPP conversion factors from the International Comparison Program.",
        "unit": "International dollars per person",
        "source_name": "IMF World Economic Outlook",
        "source_url": "https://www.imf.org/en/Publications/WEO",
    },
    "IMF.PPPSH": {
        "description": "A country's GDP based on PPP as a share of world total. Shows the relative size of an economy in the global context, adjusted for price level differences.",
        "methodology": "Country GDP-PPP divided by world GDP-PPP, expressed as a percentage.",
        "unit": "Percent of world total",
        "source_name": "IMF World Economic Outlook",
        "source_url": "https://www.imf.org/en/Publications/WEO",
    },
    "IMF.PCPIPCH": {
        "description": "Inflation, average consumer prices. Annual percentage change in the cost to the average consumer of acquiring a basket of goods and services.",
        "methodology": "Based on Consumer Price Index (CPI) data reported by national statistical offices. Measures the year-over-year change in the average level of consumer prices.",
        "unit": "Annual percent change",
        "source_name": "IMF World Economic Outlook",
        "source_url": "https://www.imf.org/en/Publications/WEO",
    },
    "IMF.GGXWDG_NGDP": {
        "description": "General government gross debt as a percentage of GDP. Covers all liabilities that require payment of interest and/or principal by the debtor to the creditor at a date or dates in the future.",
        "methodology": "Gross debt consists of all liabilities requiring future payment of interest/principal. Includes debt held by all levels of government. Expressed as a share of GDP.",
        "unit": "Percent of GDP",
        "source_name": "IMF World Economic Outlook",
        "source_url": "https://www.imf.org/en/Publications/WEO",
    },
    "IMF.GGXCNL_NGDP": {
        "description": "General government net lending/borrowing as a percentage of GDP. A positive value indicates a fiscal surplus; negative indicates a deficit.",
        "methodology": "Revenue minus expenditure minus net acquisition of nonfinancial assets, as a percentage of GDP. A comprehensive measure of the fiscal balance.",
        "unit": "Percent of GDP",
        "source_name": "IMF World Economic Outlook",
        "source_url": "https://www.imf.org/en/Publications/WEO",
    },
    "IMF.BCA_NGDPD": {
        "description": "Current account balance as a percentage of GDP. The sum of net exports, net primary income, and net secondary income. A positive value means the country earns more from abroad than it spends.",
        "methodology": "Based on balance of payments data. Includes trade balance, net income from abroad, and net current transfers.",
        "unit": "Percent of GDP",
        "source_name": "IMF World Economic Outlook",
        "source_url": "https://www.imf.org/en/Publications/WEO",
    },
    "IMF.NI_GDP": {
        "description": "Total investment as a percentage of GDP. Includes both public and private gross fixed capital formation and changes in inventories.",
        "methodology": "Total investment (gross capital formation) as a share of GDP. Based on national accounts data.",
        "unit": "Percent of GDP",
        "source_name": "IMF World Economic Outlook",
        "source_url": "https://www.imf.org/en/Publications/WEO",
    },
    "IMF.NGS_GDP": {
        "description": "Gross national savings as a percentage of GDP. The aggregate of savings by households, businesses, and government.",
        "methodology": "GDP minus total consumption plus net income from abroad. Represents the portion of national income not consumed.",
        "unit": "Percent of GDP",
        "source_name": "IMF World Economic Outlook",
        "source_url": "https://www.imf.org/en/Publications/WEO",
    },
    "IMF.LUR": {
        "description": "Unemployment rate. The share of the labor force that is without work but available for and seeking employment.",
        "methodology": "Number of unemployed persons divided by the total labor force. Based on ILO definitions where available, supplemented by national definitions.",
        "unit": "Percent of total labor force",
        "source_name": "IMF World Economic Outlook",
        "source_url": "https://www.imf.org/en/Publications/WEO",
    },
}


def seed_wb_metadata(cur):
    """Fetch metadata for all World Bank indicators from the API."""
    print("Fetching World Bank indicator metadata...")

    # Get all WB indicator IDs from our existing data
    cur.execute("SELECT DISTINCT id FROM sotw_indicators WHERE source = 'wb'")
    wb_ids = [r[0] for r in cur.fetchall()]
    print(f"  {len(wb_ids)} WB indicators to fetch metadata for")

    count = 0
    for i, ind_id in enumerate(wb_ids):
        try:
            data = fetch_json(f"{WB_BASE}/indicator/{ind_id}?format=json")
            if not data or len(data) < 2 or not data[1]:
                continue

            info = data[1][0]
            description = info.get("sourceNote", "")
            source_name = info.get("source", {}).get("value", "World Bank")
            source_org = info.get("sourceOrganization", "")
            unit = info.get("unit", "")

            # Build methodology from source organization info
            methodology = ""
            if source_org:
                methodology = f"Data compiled by {source_org}."
            if info.get("sourceNote"):
                # Extract limitations if description mentions caveats
                limitations = ""
                note = info["sourceNote"]
                if "limitation" in note.lower() or "caveat" in note.lower() or "caution" in note.lower():
                    limitations = note

            cur.execute("""
                INSERT INTO sotw_indicator_meta (id, description, methodology, source_name, source_url, unit)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    description = EXCLUDED.description,
                    methodology = EXCLUDED.methodology,
                    source_name = EXCLUDED.source_name,
                    source_url = EXCLUDED.source_url,
                    unit = EXCLUDED.unit,
                    last_updated = NOW()
            """, (
                ind_id,
                description[:2000] if description else None,
                methodology[:2000] if methodology else None,
                f"World Bank - {source_name}",
                f"https://data.worldbank.org/indicator/{ind_id}",
                unit or None,
            ))
            count += 1

        except Exception as e:
            if "404" not in str(e):
                print(f"  SKIP {ind_id}: {e}")
            continue

        if (i + 1) % 50 == 0:
            print(f"  Progress: {i+1}/{len(wb_ids)} indicators")
        time.sleep(0.3)

    print(f"  World Bank metadata: {count} indicators")
    return count


def seed_imf_metadata(cur):
    """Insert curated IMF indicator metadata."""
    print("Inserting IMF indicator metadata...")
    count = 0
    for ind_id, meta in IMF_META.items():
        cur.execute("""
            INSERT INTO sotw_indicator_meta (id, description, methodology, source_name, source_url, unit)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                description = EXCLUDED.description,
                methodology = EXCLUDED.methodology,
                source_name = EXCLUDED.source_name,
                source_url = EXCLUDED.source_url,
                unit = EXCLUDED.unit,
                last_updated = NOW()
        """, (
            ind_id,
            meta.get("description"),
            meta.get("methodology"),
            meta.get("source_name"),
            meta.get("source_url"),
            meta.get("unit"),
        ))
        count += 1

    print(f"  IMF metadata: {count} indicators")
    return count


def update_coverage(cur):
    """Update coverage_start and coverage_end from historical data."""
    print("Updating coverage ranges from historical data...")
    cur.execute("""
        UPDATE sotw_indicator_meta m SET
            coverage_start = sub.min_year,
            coverage_end = sub.max_year
        FROM (
            SELECT id, MIN(year) as min_year, MAX(year) as max_year
            FROM sotw_indicators_history
            WHERE value IS NOT NULL
            GROUP BY id
        ) sub
        WHERE m.id = sub.id
    """)
    print(f"  Updated coverage for {cur.rowcount} indicators")


def main():
    conn = psycopg2.connect(**DB)
    cur = conn.cursor()

    seed_imf_metadata(cur)
    conn.commit()

    seed_wb_metadata(cur)
    conn.commit()

    update_coverage(cur)
    conn.commit()

    cur.execute("SELECT COUNT(*) FROM sotw_indicator_meta")
    print(f"\nTotal indicator metadata rows: {cur.fetchone()[0]}")

    conn.close()


if __name__ == "__main__":
    main()
