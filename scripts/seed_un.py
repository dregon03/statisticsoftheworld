"""
Seed UN National Accounts data (GDP, GDP per capita, GDP growth) into Supabase.
Downloads Excel files from UN Statistics Division and maps to our ISO3 country codes.
"""
import openpyxl
import psycopg2
import urllib.request
import os
import tempfile

DB = dict(
    host="db.seyrycaldytfjvvkqopu.supabase.co",
    port=5432, dbname="postgres", user="postgres",
    password="", sslmode="require",
)

# UN file IDs -> our indicator IDs and which row to extract
UN_FILES = {
    2: {  # GDP in USD
        "indicator_id": "UN.GDP",
        "row_name": "Gross Domestic Product (GDP)",
        "filename": "un_gdp_usd.xlsx",
    },
    9: {  # Per Capita GDP in USD
        "indicator_id": "UN.GDPPC",
        "row_name": None,  # 2-column format, every row is the indicator
        "filename": "un_gdp_percap.xlsx",
    },
    16: {  # Growth Rate of GDP
        "indicator_id": "UN.GDPGR",
        "row_name": "Gross Domestic Product (GDP)",
        "filename": "un_gdp_growth.xlsx",
    },
    24: {  # GNI in USD
        "indicator_id": "UN.GNI",
        "row_name": None,  # 2-column format
        "filename": "un_gni_usd.xlsx",
    },
    27: {  # Per Capita GNI in USD
        "indicator_id": "UN.GNIPC",
        "row_name": None,  # 2-column format
        "filename": "un_gnipc.xlsx",
    },
}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)


def download_file(file_id, filename):
    filepath = os.path.join(PROJECT_DIR, filename)
    if os.path.exists(filepath):
        print(f"  Using cached {filename}")
        return filepath
    url = f"https://unstats.un.org/unsd/amaapi/api/file/{file_id}"
    print(f"  Downloading {url}...")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=120) as resp:
        with open(filepath, "wb") as f:
            f.write(resp.read())
    return filepath


def parse_excel(filepath, row_name):
    """Parse UN Excel file, return list of (country_name, value, year).
    Handles two formats:
      - 3-col header (CountryID, Country, IndicatorName, year...): filter by row_name
      - 2-col header (CountryID, Country, year...): every row is the indicator
    """
    wb = openpyxl.load_workbook(filepath, read_only=True)
    ws = wb.active

    headers = None
    has_indicator_col = False
    data_start_col = 2
    results = []

    for i, row in enumerate(ws.iter_rows(values_only=True)):
        vals = list(row)
        if i == 2:  # Header row
            headers = vals
            # Check if 3rd column is a string (IndicatorName) or a year number
            if isinstance(vals[2], str) and not vals[2].isdigit():
                has_indicator_col = True
                data_start_col = 3
            else:
                has_indicator_col = False
                data_start_col = 2
        elif i > 2:
            if has_indicator_col:
                indicator = vals[2]
                if not isinstance(indicator, str) or indicator.strip() != row_name:
                    continue
            country = vals[1]
            if not country or not isinstance(country, str):
                continue
            # Find most recent non-None value
            for col_idx in range(len(vals) - 1, data_start_col - 1, -1):
                if vals[col_idx] is not None:
                    try:
                        year = int(headers[col_idx])
                        value = float(vals[col_idx])
                        results.append((country, value, year))
                    except (ValueError, TypeError):
                        pass
                    break

    wb.close()
    return results


def build_name_to_iso3(cur):
    """Build mapping from UN country names to our ISO3 codes."""
    cur.execute("SELECT id, name FROM sotw_countries")
    db_countries = {name: iso3 for iso3, name in cur.fetchall()}

    # UN uses slightly different names
    aliases = {
        "Bolivia (Plurinational State of)": "BOL",
        "Brunei Darussalam": "BRN",
        "Cabo Verde": "CPV",
        "China, Hong Kong SAR": "HKG",
        "China, Macao SAR": "MAC",
        "Congo": "COG",
        "Czechia": "CZE",
        "Cote d'Ivoire": "CIV",
        "D.P.R. of Korea": "PRK",
        "Democratic Republic of the Congo": "COD",
        "Egypt": "EGY",
        "Eswatini": "SWZ",
        "Gambia": "GMB",
        "Iran (Islamic Republic of)": "IRN",
        "Korea, Republic of": "KOR",
        "Kyrgyzstan": "KGZ",
        "Lao People's DR": "LAO",
        "Micronesia (Federated States of)": "FSM",
        "Moldova, Republic of": "MDA",
        "Netherlands (Kingdom of the)": "NLD",
        "North Macedonia": "MKD",
        "Republic of Korea": "KOR",
        "Russian Federation": "RUS",
        "Slovakia": "SVK",
        "Syria": "SYR",
        "Syrian Arab Republic": "SYR",
        "Taiwan Province of China": "TWN",
        "Tanzania, United Republic of": "TZA",
        "Turkiye": "TUR",
        "Turkey": "TUR",
        "U.R. of Tanzania: Mainland": "TZA",
        "United Kingdom": "GBR",
        "United Republic of Tanzania": "TZA",
        "United States": "USA",
        "Viet Nam": "VNM",
        "Venezuela (Bolivarian Republic of)": "VEN",
        "State of Palestine": "PSE",
        "China, Taiwan Province of": "TWN",
        "D.R. of the Congo": "COD",
        "Micronesia (FS of)": "FSM",
        "Saint Kitts and Nevis": "KNA",
        "Saint Lucia": "LCA",
        "Saint Vincent and the Grenadines": "VCT",
        "Sao Tome and Principe": "STP",
        "Sint Maarten (Dutch part)": "SXM",
        "Timor-Leste": "TLS",
        "C\u00f4te d'Ivoire": "CIV",
        "Cote d'Ivoire": "CIV",
        "T\u00fcrkiye": "TUR",
        "Turkiye": "TUR",
        "Curacao": "CUW",
        "Cura\u00e7ao": "CUW",
        "Zanzibar": None,  # Part of Tanzania
        "Czechoslovakia (Former)": None,
        "USSR (Former)": None,
        "Yugoslav SFR (Former)": None,
        "Ethiopia (Former)": None,
    }

    def lookup(name):
        if name in db_countries:
            return db_countries[name]
        if name in aliases:
            return aliases[name]  # May be None for former/invalid countries
        # Fuzzy: try partial match
        for db_name, iso3 in db_countries.items():
            if name.lower() in db_name.lower() or db_name.lower() in name.lower():
                return iso3
        return None

    return lookup


def main():
    conn = psycopg2.connect(**DB)
    cur = conn.cursor()
    lookup = build_name_to_iso3(cur)

    for file_id, config in UN_FILES.items():
        ind_id = config["indicator_id"]
        row_name = config["row_name"]
        filename = config["filename"]

        print(f"\nProcessing {ind_id} ({row_name})...")
        filepath = download_file(file_id, filename)
        data = parse_excel(filepath, row_name)
        print(f"  Parsed {len(data)} countries from Excel")

        count = 0
        skipped = []
        for country_name, value, year in data:
            iso3 = lookup(country_name)
            if not iso3:
                skipped.append(country_name)
                continue
            cur.execute("""
                INSERT INTO sotw_indicators (id, country_id, value, year, source)
                VALUES (%s, %s, %s, %s, 'un')
                ON CONFLICT (id, country_id) DO UPDATE SET
                    value = EXCLUDED.value, year = EXCLUDED.year, updated_at = NOW()
            """, (ind_id, iso3, value, year))
            count += 1

        conn.commit()
        print(f"  Seeded {count} countries")
        if skipped:
            print(f"  Skipped {len(skipped)}: {skipped[:10]}...")

    # Summary
    cur.execute("SELECT id, COUNT(*) FROM sotw_indicators WHERE source = 'un' GROUP BY id ORDER BY id")
    print("\nUN data summary:")
    for row in cur.fetchall():
        print(f"  {row[0]}: {row[1]} countries")

    conn.close()
    print("\nDone!")


if __name__ == "__main__":
    main()
