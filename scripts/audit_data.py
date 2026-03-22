#!/usr/bin/env python3
"""
Data Quality Audit for Statistics of the World.
Runs a comprehensive set of checks against the database and prints a report.

Usage:
  python scripts/audit_data.py              # Full audit
  python scripts/audit_data.py --quick      # Quick checks only (no API validation)
"""

import os
import sys
import argparse
import psycopg2

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "db.seyrycaldytfjvvkqopu.supabase.co")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")
DB = dict(
    host=DB_HOST, port=5432, dbname="postgres", user="postgres",
    password=DB_PASS, sslmode="require",
)

PASS = "PASS"
FAIL = "FAIL"
WARN = "WARN"

results = []

def check(name, condition, detail=""):
    status = PASS if condition else FAIL
    symbol = "[OK]" if status == PASS else "[FAIL]"
    results.append((status, name, detail))
    msg = f"  {symbol} {name}" + (f" -- {detail}" if detail else "")
    print(msg)
    return condition

def warn(name, condition, detail=""):
    status = PASS if condition else WARN
    symbol = "[OK]" if status == PASS else "[WARN]"
    results.append((status, name, detail))
    msg = f"  {symbol} {name}" + (f" -- {detail}" if detail else "")
    print(msg)
    return condition


def audit_database_health(cur):
    """Check basic database health and data completeness."""
    print("\n=== DATABASE HEALTH ===")

    # Total rows
    cur.execute("SELECT COUNT(*) FROM sotw_countries")
    n_countries = cur.fetchone()[0]
    check("Countries table populated", n_countries >= 200, f"{n_countries} countries")

    cur.execute("SELECT COUNT(*) FROM sotw_indicators")
    n_latest = cur.fetchone()[0]
    check("Latest indicators populated", n_latest >= 10000, f"{n_latest} rows")

    cur.execute("SELECT COUNT(*) FROM sotw_indicators_history")
    n_history = cur.fetchone()[0]
    check("History table populated", n_history >= 100000, f"{n_history} rows")

    cur.execute("SELECT COUNT(*) FROM sotw_indicator_meta")
    n_meta = cur.fetchone()[0]
    check("Indicator metadata populated", n_meta >= 100, f"{n_meta} indicators with metadata")

    # Unique indicators
    cur.execute("SELECT COUNT(DISTINCT id) FROM sotw_indicators")
    n_unique = cur.fetchone()[0]
    check("Sufficient unique indicators", n_unique >= 200, f"{n_unique} unique indicators")

    # Data sources
    cur.execute("SELECT DISTINCT source FROM sotw_indicators_history WHERE source IS NOT NULL ORDER BY source")
    sources = [r[0] for r in cur.fetchall()]
    check("Multiple data sources", len(sources) >= 3, f"{len(sources)} sources: {', '.join(sources)}")


def audit_key_indicators(cur):
    """Check that key macro indicators have sane values for major countries."""
    print("\n=== KEY INDICATOR SANITY CHECKS ===")

    # US GDP should be between 20T and 40T (billions in DB * 1e9)
    cur.execute("SELECT value FROM sotw_indicators WHERE id='IMF.NGDPD' AND country_id='USA'")
    row = cur.fetchone()
    if row:
        usgdp = row[0] * 1e9  # IMF stores in billions
        check("US GDP in sane range ($20T-$40T)", 20e12 <= usgdp <= 40e12, f"${usgdp/1e12:.1f}T")
    else:
        check("US GDP exists", False, "No data found")

    # China GDP
    cur.execute("SELECT value FROM sotw_indicators WHERE id='IMF.NGDPD' AND country_id='CHN'")
    row = cur.fetchone()
    if row:
        cngdp = row[0] * 1e9
        check("China GDP in sane range ($15T-$25T)", 15e12 <= cngdp <= 25e12, f"${cngdp/1e12:.1f}T")

    # US Population should be 320M-360M
    cur.execute("SELECT value FROM sotw_indicators WHERE id='SP.POP.TOTL' AND country_id='USA'")
    row = cur.fetchone()
    if row:
        check("US Population in range (320M-360M)", 320e6 <= row[0] <= 360e6, f"{row[0]/1e6:.0f}M")

    # World population (China + India should each be >1B)
    cur.execute("SELECT value FROM sotw_indicators WHERE id='SP.POP.TOTL' AND country_id='CHN'")
    row = cur.fetchone()
    if row:
        check("China Population > 1B", row[0] > 1e9, f"{row[0]/1e9:.2f}B")

    cur.execute("SELECT value FROM sotw_indicators WHERE id='SP.POP.TOTL' AND country_id='IND'")
    row = cur.fetchone()
    if row:
        check("India Population > 1B", row[0] > 1e9, f"{row[0]/1e9:.2f}B")

    # Life expectancy should be 50-90 for most countries
    cur.execute("SELECT MIN(value), MAX(value), AVG(value) FROM sotw_indicators WHERE id='SP.DYN.LE00.IN' AND value IS NOT NULL")
    row = cur.fetchone()
    if row and row[0]:
        check("Life expectancy min > 40", row[0] > 40, f"min={row[0]:.1f}")
        check("Life expectancy max < 95", row[1] < 95, f"max={row[1]:.1f}")
        check("Life expectancy avg in range (60-80)", 60 <= row[2] <= 80, f"avg={row[2]:.1f}")

    # Inflation should be mostly between -10% and 300% (some countries have hyperinflation)
    cur.execute("SELECT COUNT(*) FROM sotw_indicators WHERE id='IMF.PCPIPCH' AND value > 500")
    row = cur.fetchone()
    warn("No extreme inflation outliers (>500%)", row[0] <= 3, f"{row[0]} countries with >500% inflation")

    # Unemployment should be 0-60%
    cur.execute("SELECT MIN(value), MAX(value) FROM sotw_indicators WHERE id='IMF.LUR' AND value IS NOT NULL")
    row = cur.fetchone()
    if row and row[0]:
        check("Unemployment min >= 0", row[0] >= 0, f"min={row[0]:.1f}%")
        check("Unemployment max < 60", row[1] < 60, f"max={row[1]:.1f}%")


def audit_financial_data(cur):
    """Check financial market data integrity."""
    print("\n=== FINANCIAL DATA CHECKS ===")

    # S&P 500 should be 4000-8000 range (as of 2025-2026)
    cur.execute("SELECT value FROM sotw_indicators WHERE id='YF.IDX.USA' AND country_id='USA'")
    row = cur.fetchone()
    if row:
        check("S&P 500 in range (3000-10000)", 3000 <= row[0] <= 10000, f"{row[0]:.0f}")
    else:
        check("S&P 500 data exists", False, "No data found")

    # Gold should be $1500-$4000
    cur.execute("SELECT value FROM sotw_indicators WHERE id='YF.GOLD' AND country_id='WLD'")
    row = cur.fetchone()
    if row:
        check("Gold price in range ($1500-$5500)", 1500 <= row[0] <= 5500, f"${row[0]:.0f}")

    # Oil should be $30-$150
    cur.execute("SELECT value FROM sotw_indicators WHERE id='YF.CRUDE_OIL' AND country_id='WLD'")
    row = cur.fetchone()
    if row:
        check("WTI Crude in range ($30-$150)", 30 <= row[0] <= 150, f"${row[0]:.2f}")

    # EUR/USD should be 0.8-1.5
    cur.execute("SELECT value FROM sotw_indicators WHERE id='YF.FX.EUR' AND value IS NOT NULL LIMIT 1")
    row = cur.fetchone()
    if row:
        check("EUR/USD in range (0.8-1.5)", 0.8 <= row[0] <= 1.5, f"{row[0]:.4f}")

    # Check no duplicate country mappings (the bug that caused S&P 500 issue)
    cur.execute("""
        SELECT id, country_id, COUNT(*) as cnt
        FROM sotw_indicators
        WHERE id LIKE 'YF.IDX.%'
        GROUP BY id, country_id
        HAVING COUNT(*) > 1
    """)
    dupes = cur.fetchall()
    check("No duplicate stock index mappings", len(dupes) == 0,
          f"{len(dupes)} duplicates" if dupes else "")

    # Fed Funds rate should be 0-10%
    cur.execute("SELECT value FROM sotw_indicators WHERE id='FRED.FEDFUNDS' AND country_id='USA'")
    row = cur.fetchone()
    if row:
        check("Fed Funds rate in range (0-10%)", 0 <= row[0] <= 10, f"{row[0]:.2f}%")


def audit_data_freshness(cur):
    """Check that data is reasonably recent."""
    print("\n=== DATA FRESHNESS ===")

    # Check latest year for key indicators
    indicators = [
        ("IMF.NGDPD", "GDP", 2023),
        ("SP.POP.TOTL", "Population", 2022),
        ("SP.DYN.LE00.IN", "Life Expectancy", 2020),
        ("IMF.PCPIPCH", "Inflation", 2023),
        ("YF.IDX.USA", "S&P 500", 2024),
    ]
    for ind_id, label, min_year in indicators:
        cur.execute(f"SELECT MAX(year) FROM sotw_indicators WHERE id='{ind_id}' AND value IS NOT NULL")
        row = cur.fetchone()
        if row and row[0]:
            check(f"{label} data is recent (>={min_year})", row[0] >= min_year, f"latest year: {row[0]}")
        else:
            check(f"{label} data exists", False)


def audit_data_completeness(cur):
    """Check that major countries have data for key indicators."""
    print("\n=== DATA COMPLETENESS ===")

    major_countries = ['USA', 'CHN', 'JPN', 'DEU', 'GBR', 'FRA', 'IND', 'BRA', 'CAN', 'AUS']
    key_indicators = ['IMF.NGDPD', 'SP.POP.TOTL', 'SP.DYN.LE00.IN', 'IMF.PCPIPCH', 'IMF.LUR']

    for ind_id in key_indicators:
        ind_label = ind_id.split('.')[-1]
        cur.execute(f"""
            SELECT COUNT(DISTINCT country_id)
            FROM sotw_indicators
            WHERE id='{ind_id}' AND country_id IN ({','.join(f"'{c}'" for c in major_countries)})
            AND value IS NOT NULL
        """)
        row = cur.fetchone()
        coverage = row[0] if row else 0
        check(f"{ind_label}: G10 coverage", coverage >= 8, f"{coverage}/{len(major_countries)} countries")


def audit_historical_data(cur):
    """Check historical data integrity."""
    print("\n=== HISTORICAL DATA ===")

    # Check that history table has proper time series
    cur.execute("""
        SELECT id, country_id, COUNT(*) as n_years, MIN(year) as min_yr, MAX(year) as max_yr
        FROM sotw_indicators_history
        WHERE id = 'IMF.NGDPD' AND country_id = 'USA'
        GROUP BY id, country_id
    """)
    row = cur.fetchone()
    if row:
        check("US GDP historical depth", row[2] >= 15, f"{row[2]} years ({row[3]}-{row[4]})")
    else:
        check("US GDP history exists", False)

    # Check for duplicate (id, country_id, year) entries
    cur.execute("""
        SELECT COUNT(*) FROM (
            SELECT id, country_id, year, COUNT(*) as cnt
            FROM sotw_indicators_history
            GROUP BY id, country_id, year
            HAVING COUNT(*) > 1
        ) dupes
    """)
    n_dupes = cur.fetchone()[0]
    check("No duplicate history entries", n_dupes == 0, f"{n_dupes} duplicates" if n_dupes > 0 else "")

    # Check history has reasonable year range
    cur.execute("SELECT MIN(year), MAX(year) FROM sotw_indicators_history")
    row = cur.fetchone()
    if row:
        check("History starts before 2005", row[0] <= 2005, f"earliest: {row[0]}")
        check("History extends to recent years", row[1] >= 2023, f"latest: {row[1]}")

    # Check no null values where they shouldn't be
    cur.execute("SELECT COUNT(*) FROM sotw_indicators_history WHERE year IS NULL OR id IS NULL OR country_id IS NULL")
    n_nulls = cur.fetchone()[0]
    check("No null keys in history", n_nulls == 0, f"{n_nulls} rows with null keys" if n_nulls > 0 else "")


def audit_metadata(cur):
    """Check indicator metadata quality."""
    print("\n=== METADATA QUALITY ===")

    # Check rich methodology exists for key indicators
    cur.execute("SELECT COUNT(*) FROM sotw_indicator_meta WHERE methodology IS NOT NULL AND LENGTH(methodology) > 100")
    n_rich = cur.fetchone()[0]
    check("Rich methodology content", n_rich >= 10, f"{n_rich} indicators with detailed methodology")

    # Check descriptions exist
    cur.execute("SELECT COUNT(*) FROM sotw_indicator_meta WHERE description IS NOT NULL AND LENGTH(description) > 20")
    n_desc = cur.fetchone()[0]
    check("Descriptions populated", n_desc >= 100, f"{n_desc} indicators with descriptions")

    # Check source URLs
    cur.execute("SELECT COUNT(*) FROM sotw_indicator_meta WHERE source_url IS NOT NULL")
    n_urls = cur.fetchone()[0]
    check("Source URLs populated", n_urls >= 50, f"{n_urls} indicators with source URLs")


def main():
    parser = argparse.ArgumentParser(description="SOTW Data Quality Audit")
    parser.add_argument("--quick", action="store_true", help="Quick checks only")
    args = parser.parse_args()

    print("=" * 60)
    print("  STATISTICS OF THE WORLD — DATA QUALITY AUDIT")
    print("=" * 60)

    conn = psycopg2.connect(**DB)
    cur = conn.cursor()

    audit_database_health(cur)
    audit_key_indicators(cur)
    audit_financial_data(cur)
    audit_data_freshness(cur)
    audit_data_completeness(cur)
    audit_historical_data(cur)
    audit_metadata(cur)

    conn.close()

    # Summary
    passes = sum(1 for r in results if r[0] == PASS)
    fails = sum(1 for r in results if r[0] == FAIL)
    warns = sum(1 for r in results if r[0] == WARN)
    total = len(results)

    print(f"\n{'=' * 60}")
    print(f"  AUDIT SUMMARY")
    print(f"  Total checks: {total}")
    print(f"  Passed: {passes}")
    print(f"  Failed: {fails}")
    print(f"  Warnings: {warns}")
    print(f"{'=' * 60}")

    if fails > 0:
        print("\nFAILED CHECKS:")
        for status, name, detail in results:
            if status == FAIL:
                print(f"  [FAIL] {name}: {detail}")
        sys.exit(1)
    else:
        print("\nAll checks passed!")
        sys.exit(0)


if __name__ == "__main__":
    main()
