#!/usr/bin/env python3
"""
Fetch live commodity futures from Chinese exchanges via Sina Finance API.
Free, no API key, real-time during Chinese market hours (9:00-15:00 CST).

Covers: SHFE (Shanghai), DCE (Dalian), ZCE (Zhengzhou)
Stores as SINA.{SYMBOL} in sotw_live_quotes.
"""

import os
import re
import psycopg2
import urllib.request

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "db.seyrycaldytfjvvkqopu.supabase.co")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")
DB = dict(
    host=DB_HOST, port=int(os.environ.get("SUPABASE_DB_PORT", "5432")), dbname="postgres",
    user=os.environ.get("SUPABASE_DB_USER", "postgres"), password=DB_PASS, sslmode="require",
)

QUOTES_TABLE = "sotw_live_quotes"

# Chinese commodity futures — continuous contracts (0 = main/continuous)
SYMBOLS = {
    # SHFE — Shanghai Futures Exchange (Metals + Energy)
    "CU0": ("SINA.COPPER", "Copper (SHFE)"),
    "AL0": ("SINA.ALUMINUM", "Aluminum (SHFE)"),
    "NI0": ("SINA.NICKEL", "Nickel (SHFE)"),
    "ZN0": ("SINA.ZINC", "Zinc (SHFE)"),
    "SN0": ("SINA.TIN", "Tin (SHFE)"),
    "PB0": ("SINA.LEAD", "Lead (SHFE)"),
    "RB0": ("SINA.REBAR", "Rebar Steel (SHFE)"),
    "HC0": ("SINA.HOT_COIL", "Hot Coil Steel (SHFE)"),
    "SS0": ("SINA.STAINLESS", "Stainless Steel (SHFE)"),
    "SC0": ("SINA.CRUDE_CN", "Crude Oil (SHFE)"),
    "FU0": ("SINA.FUEL_OIL", "Fuel Oil (SHFE)"),
    "BU0": ("SINA.BITUMEN", "Bitumen (SHFE)"),
    "RU0": ("SINA.RUBBER", "Rubber (SHFE)"),
    # DCE — Dalian Commodity Exchange
    "I0": ("SINA.IRON_ORE_CN", "Iron Ore (DCE)"),
    "J0": ("SINA.COKING_COAL", "Coking Coal (DCE)"),
    "JM0": ("SINA.COKE", "Coke (DCE)"),
    "P0": ("SINA.PALM_OIL", "Palm Oil (DCE)"),
    "Y0": ("SINA.SOY_OIL_CN", "Soybean Oil (DCE)"),
    "M0": ("SINA.SOY_MEAL_CN", "Soybean Meal (DCE)"),
    "C0": ("SINA.CORN_CN", "Corn (DCE)"),
    "EG0": ("SINA.ETHYLENE_GLYCOL", "Ethylene Glycol (DCE)"),
    "PP0": ("SINA.POLYPROPYLENE", "Polypropylene (DCE)"),
    "L0": ("SINA.POLYETHYLENE", "Polyethylene (DCE)"),
    "V0": ("SINA.PVC", "PVC (DCE)"),
    "LH0": ("SINA.HOGS_CN", "Live Hogs (DCE)"),
    # ZCE — Zhengzhou Commodity Exchange
    "CF0": ("SINA.COTTON_CN", "Cotton (ZCE)"),
    "SR0": ("SINA.SUGAR_CN", "Sugar (ZCE)"),
    "MA0": ("SINA.METHANOL", "Methanol (ZCE)"),
    "UR0": ("SINA.UREA", "Urea (ZCE)"),
    "SA0": ("SINA.SODA_ASH", "Soda Ash (ZCE)"),
    "FG0": ("SINA.GLASS", "Glass (ZCE)"),
    "AP0": ("SINA.APPLE", "Apple (ZCE)"),
    "PK0": ("SINA.PEANUT", "Peanut (ZCE)"),
}


def fetch_china_quotes():
    """Fetch all Chinese commodity quotes from Sina Finance API."""
    # Build the symbol list for Sina API
    sina_syms = ",".join(f"nf_{sym}" for sym in SYMBOLS)
    url = f"https://hq.sinajs.cn/rn=1&list={sina_syms}"

    req = urllib.request.Request(url, headers={
        "Referer": "https://finance.sina.com.cn",
        "User-Agent": "Mozilla/5.0",
    })

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = resp.read().decode("gbk", errors="replace")
    except Exception as e:
        print(f"Error fetching Sina data: {e}")
        return []

    results = []
    for line in raw.strip().split("\n"):
        if "=" not in line:
            continue
        sym_part = line.split("=")[0].replace("var hq_str_nf_", "").strip()
        data_part = line.split('"')[1] if '"' in line else ""
        fields = data_part.split(",")

        if sym_part not in SYMBOLS or len(fields) < 9:
            continue

        sotw_id, label = SYMBOLS[sym_part]

        try:
            # Sina fields: 0=name, 1=?, 2=?, 3=open, 4=high, 5=low, 6=close/last, 7=?, 8=prev_close
            price = float(fields[6]) if fields[6] else 0
            prev_close = float(fields[8]) if fields[8] else 0

            if price <= 0:
                continue

            change = price - prev_close if prev_close > 0 else 0
            change_pct = ((price / prev_close) - 1) * 100 if prev_close > 0 else 0

            results.append((sotw_id, label, price, prev_close, change, change_pct))
        except (ValueError, IndexError):
            continue

    return results


def main():
    quotes = fetch_china_quotes()
    if not quotes:
        print("No quotes fetched (Chinese markets may be closed)")
        return

    conn = psycopg2.connect(**DB)
    cur = conn.cursor()

    for sotw_id, label, price, prev_close, change, change_pct in quotes:
        cur.execute(f"""
            INSERT INTO {QUOTES_TABLE} (id, label, price, previous_close, change, change_pct, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
            ON CONFLICT (id) DO UPDATE SET
                price = EXCLUDED.price,
                previous_close = EXCLUDED.previous_close,
                change = EXCLUDED.change,
                change_pct = EXCLUDED.change_pct,
                updated_at = NOW()
        """, (sotw_id, label, round(price, 4), round(prev_close, 4), round(change, 4), round(change_pct, 4)))

    conn.commit()
    conn.close()
    print(f"Updated {len(quotes)} Chinese commodity quotes")


if __name__ == "__main__":
    if not DB_PASS:
        print("ERROR: set SUPABASE_DB_PASSWORD")
        exit(1)
    main()
