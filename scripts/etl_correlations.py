#!/usr/bin/env python3
"""
Precompute interesting correlations between indicator pairs.
Stores top 50 correlations in sotw_correlations table.
Run weekly.
"""

import os
import math
import psycopg2

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "db.seyrycaldytfjvvkqopu.supabase.co")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")
DB = dict(
    host=DB_HOST, port=int(os.environ.get("SUPABASE_DB_PORT", "5432")), dbname="postgres",
    user=os.environ.get("SUPABASE_DB_USER", "postgres"), password=DB_PASS, sslmode="require",
)

CORR_TABLE = "sotw_correlations"

# Same as POPULAR_INDICATORS in scatter/page.tsx
INDICATORS = [
    'IMF.NGDPD', 'IMF.NGDPDPC', 'IMF.NGDP_RPCH', 'IMF.PPPPC', 'SP.POP.TOTL',
    'SP.DYN.LE00.IN', 'IMF.PCPIPCH', 'IMF.LUR', 'IMF.GGXWDG_NGDP',
    'SE.XPD.TOTL.GD.ZS', 'SE.ADT.LITR.ZS', 'SH.XPD.CHEX.GD.ZS',
    'SI.POV.GINI', 'IT.NET.USER.ZS', 'EN.GHG.CO2.PC.CE.AR5',
    'MS.MIL.XPND.GD.ZS', 'EG.ELC.RNEW.ZS', 'CC.EST', 'PV.EST',
    'SL.TLF.CACT.ZS', 'GB.XPD.RSDV.GD.ZS', 'NE.TRD.GNFS.ZS',
]

# Obvious/trivial pairs to exclude
TRIVIAL_PAIRS = {
    ('IMF.NGDPD', 'IMF.NGDPDPC'),
    ('IMF.NGDPD', 'IMF.PPPPC'),
    ('IMF.NGDPDPC', 'IMF.PPPPC'),
    ('IMF.NGDPD', 'SP.POP.TOTL'),
}

INDICATOR_LABELS = {
    'IMF.NGDPD': 'GDP (USD)',
    'IMF.NGDPDPC': 'GDP per Capita',
    'IMF.NGDP_RPCH': 'GDP Growth',
    'IMF.PPPPC': 'GDP per Capita (PPP)',
    'SP.POP.TOTL': 'Population',
    'SP.DYN.LE00.IN': 'Life Expectancy',
    'IMF.PCPIPCH': 'Inflation',
    'IMF.LUR': 'Unemployment',
    'IMF.GGXWDG_NGDP': 'Debt/GDP',
    'SE.XPD.TOTL.GD.ZS': 'Education Spending',
    'SE.ADT.LITR.ZS': 'Literacy Rate',
    'SH.XPD.CHEX.GD.ZS': 'Health Spending',
    'SI.POV.GINI': 'Gini Index',
    'IT.NET.USER.ZS': 'Internet Usage',
    'EN.GHG.CO2.PC.CE.AR5': 'CO2 Emissions/Cap',
    'MS.MIL.XPND.GD.ZS': 'Military Spending',
    'EG.ELC.RNEW.ZS': 'Renewable Energy',
    'CC.EST': 'Corruption Control',
    'PV.EST': 'Political Stability',
    'SL.TLF.CACT.ZS': 'Labor Force Participation',
    'GB.XPD.RSDV.GD.ZS': 'R&D Spending',
    'NE.TRD.GNFS.ZS': 'Trade Openness',
}


def pearson_r(x_vals, y_vals):
    """Compute Pearson correlation coefficient."""
    n = len(x_vals)
    if n < 10:
        return None, None, n

    sum_x = sum(x_vals)
    sum_y = sum(y_vals)
    sum_xy = sum(a * b for a, b in zip(x_vals, y_vals))
    sum_x2 = sum(a * a for a in x_vals)
    sum_y2 = sum(b * b for b in y_vals)

    denom = math.sqrt((n * sum_x2 - sum_x ** 2) * (n * sum_y2 - sum_y ** 2))
    if denom == 0:
        return None, None, n

    r = (n * sum_xy - sum_x * sum_y) / denom
    r_squared = r * r
    return r, r_squared, n


def compute_correlations():
    conn = psycopg2.connect(**DB)
    cur = conn.cursor()

    # Create table
    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS {CORR_TABLE} (
            indicator_x TEXT,
            indicator_y TEXT,
            label_x TEXT,
            label_y TEXT,
            r_value REAL,
            r_squared REAL,
            n_countries INT,
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            PRIMARY KEY (indicator_x, indicator_y)
        )
    """)
    conn.commit()

    # Fetch latest value for each indicator per country
    print("Fetching indicator data...")
    indicator_data = {}
    for ind_id in INDICATORS:
        cur.execute("""
            SELECT DISTINCT ON (country_id) country_id, value
            FROM sotw_indicators_history
            WHERE id = %s AND value IS NOT NULL
            ORDER BY country_id, year DESC
        """, (ind_id,))
        indicator_data[ind_id] = {row[0]: row[1] for row in cur.fetchall()}
        print(f"  {ind_id}: {len(indicator_data[ind_id])} countries")

    # Compute all pairs
    results = []
    for i, ind_x in enumerate(INDICATORS):
        for ind_y in INDICATORS[i + 1:]:
            # Skip trivial pairs
            if (ind_x, ind_y) in TRIVIAL_PAIRS or (ind_y, ind_x) in TRIVIAL_PAIRS:
                continue

            # Find countries that have both values
            common = set(indicator_data[ind_x].keys()) & set(indicator_data[ind_y].keys())
            if len(common) < 30:
                continue

            x_vals = [indicator_data[ind_x][c] for c in common]
            y_vals = [indicator_data[ind_y][c] for c in common]

            r, r2, n = pearson_r(x_vals, y_vals)
            if r is not None:
                results.append({
                    'x': ind_x, 'y': ind_y,
                    'label_x': INDICATOR_LABELS.get(ind_x, ind_x),
                    'label_y': INDICATOR_LABELS.get(ind_y, ind_y),
                    'r': r, 'r2': r2, 'n': n,
                })

    # Sort by |r| descending, take top 50
    results.sort(key=lambda x: abs(x['r']), reverse=True)
    top = results[:50]

    # Clear and insert
    cur.execute(f"DELETE FROM {CORR_TABLE}")
    for c in top:
        cur.execute(f"""
            INSERT INTO {CORR_TABLE} (indicator_x, indicator_y, label_x, label_y, r_value, r_squared, n_countries, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
        """, (c['x'], c['y'], c['label_x'], c['label_y'], c['r'], c['r2'], c['n']))

    conn.commit()
    conn.close()

    print(f"\nStored {len(top)} correlations. Top 10:")
    for c in top[:10]:
        sign = "+" if c['r'] > 0 else ""
        print(f"  {c['label_x']} vs {c['label_y']}: r={sign}{c['r']:.3f} (R²={c['r2']:.3f}, n={c['n']})")


if __name__ == "__main__":
    if not DB_PASS:
        print("ERROR: set SUPABASE_DB_PASSWORD")
        exit(1)
    compute_correlations()
