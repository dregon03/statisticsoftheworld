#!/usr/bin/env python3
"""
International Organizations ETL for Statistics of the World.
Fetches data from WHO, UNESCO, FAO — all free, no API key required.

Sources:
  - WHO Global Health Observatory (GHO): 3000+ health indicators
  - World Bank (additional indicators not in main ETL)

Usage:
  python scripts/etl_intl_orgs.py                    # All sources
  python scripts/etl_intl_orgs.py --source who        # WHO only
  python scripts/etl_intl_orgs.py --source wb_extra    # Additional WB indicators
"""

import argparse
import json
import os
import socket
import sys
import time
import psycopg2
import urllib.request

# ============================================================
# CONFIG
# ============================================================

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "db.seyrycaldytfjvvkqopu.supabase.co")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")

DB = dict(
    host=DB_HOST, port=int(os.environ.get("SUPABASE_DB_PORT", "5432")), dbname="postgres", user=os.environ.get("SUPABASE_DB_USER", "postgres"),
    password=DB_PASS, sslmode="require",
    options="-c statement_timeout=0",
)

HISTORY_TABLE = "sotw_indicators_history"
LATEST_TABLE = "sotw_indicators"
META_TABLE = "sotw_indicator_meta"

# ============================================================
# WHO GHO INDICATORS — curated list of most useful health indicators
# Format: (GHO_code, sotw_id, label, unit, category)
# ============================================================

WHO_INDICATORS = [
    # Life expectancy & mortality
    ("WHOSIS_000001", "WHO.LIFE_EXP", "Life Expectancy at Birth (WHO)", "Years", "Health"),
    ("WHOSIS_000002", "WHO.LIFE_EXP_60", "Life Expectancy at Age 60 (WHO)", "Years", "Health"),
    ("WHOSIS_000004", "WHO.HALE", "Healthy Life Expectancy (HALE)", "Years", "Health"),
    ("MDG_0000000001", "WHO.IMR", "Infant Mortality Rate (WHO)", "Per 1,000 live births", "Health"),
    ("MDG_0000000007", "WHO.U5MR", "Under-5 Mortality Rate (WHO)", "Per 1,000 live births", "Health"),
    ("WHOSIS_000003", "WHO.NEONATAL_MR", "Neonatal Mortality Rate", "Per 1,000 live births", "Health"),
    ("MORT_MATERNALNUM", "WHO.MATERNAL_DEATHS", "Maternal Deaths", "Number", "Health"),

    # Disease burden
    ("MDG_0000000020", "WHO.TB_INCIDENCE", "Tuberculosis Incidence", "Per 100,000", "Health"),
    ("MDG_0000000022", "WHO.TB_MORTALITY", "Tuberculosis Mortality", "Per 100,000", "Health"),
    ("HIV_0000000001", "WHO.HIV_PREVALENCE", "People Living with HIV", "Number", "Health"),
    ("MALARIA_EST_DEATHS", "WHO.MALARIA_DEATHS", "Malaria Deaths (estimated)", "Number", "Health"),
    ("MALARIA_EST_INCIDENCE", "WHO.MALARIA_INCIDENCE", "Malaria Incidence", "Per 1,000 at risk", "Health"),
    ("NCD_BMI_30A", "WHO.OBESITY", "Obesity Prevalence (BMI >= 30)", "Percent", "Health"),
    ("NCD_HYP_PREVALENCE_A", "WHO.HYPERTENSION", "Hypertension Prevalence (age-standardized)", "Percent", "Health"),
    ("NCD_GLUC_04", "WHO.DIABETES", "Diabetes Prevalence (age-standardized)", "Percent", "Health"),

    # Immunization
    ("WHS4_100", "WHO.DTP3", "DTP3 Immunization Coverage (%)", "Percent", "Health"),
    ("WHS8_110", "WHO.MEASLES_VAX", "Measles Immunization Coverage (%)", "Percent", "Health"),
    ("WHS4_117", "WHO.HBV3", "Hepatitis B Immunization Coverage (%)", "Percent", "Health"),

    # Health workforce
    ("HWF_0001", "WHO.PHYSICIANS", "Physicians (total)", "Number", "Health"),
    ("HWF_0006", "WHO.NURSES", "Nursing and Midwifery Personnel (total)", "Number", "Health"),
    ("HWF_0008", "WHO.DENTISTS", "Dentists (total)", "Number", "Health"),
    ("HWF_0009", "WHO.PHARMACISTS", "Pharmacists (total)", "Number", "Health"),

    # Risk factors
    ("SA_0000001688", "WHO.TOBACCO", "Tobacco Use Prevalence (%)", "Percent", "Health"),
    ("SA_0000001462", "WHO.ALCOHOL", "Alcohol Consumption (liters per capita)", "Liters", "Health"),

    # Water & Sanitation
    ("WSH_WATER_BASIC", "WHO.BASIC_WATER", "Basic Drinking Water Services (%)", "Percent", "Health"),
    ("WSH_SANITATION_BASIC", "WHO.BASIC_SANITATION", "Basic Sanitation Services (%)", "Percent", "Health"),

    # Air quality
    ("SDGPM25", "WHO.PM25", "PM2.5 Air Pollution (WHO)", "ug/m3", "Energy & Environment"),
    ("SDGAIRBOD", "WHO.AIR_DEATHS", "Deaths from Ambient Air Pollution", "Per 100,000", "Energy & Environment"),

    # Nutrition
    ("NUTRITION_WH_2", "WHO.CHILD_WASTING", "Child Wasting Prevalence (<5 years)", "Percent", "Health"),
    ("NUTRITION_HA_2", "WHO.CHILD_STUNTING", "Child Stunting Prevalence (<5 years)", "Percent", "Health"),
    ("NUTRITION_WA_2", "WHO.CHILD_UNDERWEIGHT", "Child Underweight Prevalence (<5 years)", "Percent", "Health"),

    # Suicide
    ("MH_12", "WHO.SUICIDE_RATE", "Suicide Rate (age-standardized)", "Per 100,000", "Health"),

    # UHC
    ("UHC_INDEX_REPORTED", "WHO.UHC_INDEX", "Universal Health Coverage Index", "Index (0-100)", "Health"),

    # Road safety
    ("RS_196", "WHO.ROAD_DEATHS", "Road Traffic Death Rate", "Per 100,000", "Health"),

    # Health expenditure
    ("GHED_CHE_pc_US_SHA2011", "WHO.HEALTH_SPEND_PC", "Health Expenditure per Capita (USD)", "USD", "Health"),
    ("GHED_CHE_GDP_SHA2011", "WHO.HEALTH_SPEND_GDP", "Health Expenditure (% of GDP)", "Percent", "Health"),
]

# WHO uses ISO3 alpha-3 codes (same as SOTW)
# But we need to filter for Dim1 = "BTSX" (both sexes) where applicable

# ============================================================
# Additional World Bank indicators NOT in main ETL
# These extend coverage in labor, agriculture, infrastructure
# ============================================================

WB_EXTRA_INDICATORS = [
    # Labor (ILO-sourced via World Bank)
    ("SL.TLF.TOTL.IN", "Labor", "Total Labor Force"),
    ("SL.TLF.TOTL.FE.ZS", "Labor", "Female Labor Force Participation (%)"),
    ("SL.EMP.TOTL.SP.ZS", "Labor", "Employment to Population Ratio (%)"),
    ("SL.EMP.VULN.ZS", "Labor", "Vulnerable Employment (% of total)"),
    ("SL.EMP.SELF.ZS", "Labor", "Self-Employed (% of total)"),
    ("SL.EMP.WORK.ZS", "Labor", "Wage Workers (% of total)"),
    ("SL.AGR.EMPL.ZS", "Labor", "Employment in Agriculture (%)"),
    ("SL.IND.EMPL.ZS", "Labor", "Employment in Industry (%)"),
    ("SL.SRV.EMPL.ZS", "Labor", "Employment in Services (%)"),
    ("SL.UEM.LTRM.ZS", "Labor", "Long-term Unemployment (%)"),
    ("SL.UEM.NEET.ZS", "Labor", "NEET Youth (% not in education, employment, training)"),

    # Agriculture (FAO-sourced via World Bank)
    ("AG.LND.ARBL.ZS", "Agriculture", "Arable Land (% of land area)"),
    ("AG.LND.AGRI.ZS", "Agriculture", "Agricultural Land (% of land area)"),
    ("AG.LND.FRST.ZS", "Agriculture", "Forest Area (% of land area)"),
    ("AG.PRD.CREL.MT", "Agriculture", "Cereal Production (metric tons)"),
    ("AG.YLD.CREL.KG", "Agriculture", "Cereal Yield (kg per hectare)"),
    ("AG.PRD.FOOD.XD", "Agriculture", "Food Production Index"),
    ("AG.PRD.LVSK.XD", "Agriculture", "Livestock Production Index"),
    ("AG.CON.FERT.ZS", "Agriculture", "Fertilizer Consumption (kg per hectare)"),

    # Infrastructure
    ("IS.RRS.TOTL.KM", "Infrastructure", "Rail Lines (total km)"),
    ("IS.RRS.GOOD.MT.K6", "Infrastructure", "Railways Goods Transported (million ton-km)"),
    ("IS.SHP.GOOD.TU", "Infrastructure", "Container Port Traffic (TEU)"),
    ("IS.AIR.PSGR", "Infrastructure", "Air Passengers Carried"),
    ("IS.AIR.GOOD.MT.K1", "Infrastructure", "Air Freight (million ton-km)"),
    ("IT.NET.BBND.P2", "Technology", "Fixed Broadband Subscriptions (per 100)"),
    ("IT.NET.SECR.P6", "Technology", "Secure Internet Servers (per million)"),

    # Gender
    ("SG.GEN.PARL.ZS", "Gender", "Women in Parliament (%)"),
    ("SG.LAW.NODC.HR", "Gender", "Laws Mandating Nondiscrimination (score)"),
    ("SE.ENR.PRIM.FM.ZS", "Gender", "Gender Parity in Primary Education"),
    ("SE.ENR.SECO.FM.ZS", "Gender", "Gender Parity in Secondary Education"),

    # Education (UNESCO-sourced via World Bank)
    ("SE.PRM.ENRR", "Education", "Primary School Enrollment (gross %)"),
    ("SE.SEC.ENRR", "Education", "Secondary School Enrollment (gross %)"),
    ("SE.PRM.CMPT.ZS", "Education", "Primary Completion Rate (%)"),
    ("SE.SEC.CMPT.LO.ZS", "Education", "Lower Secondary Completion Rate (%)"),
    ("SE.PRM.TCHR", "Education", "Primary School Teachers"),
    ("SE.SEC.TCHR", "Education", "Secondary School Teachers"),
    ("SE.PRM.PRSL.ZS", "Education", "Primary School Pupil-Teacher Ratio"),
    ("SE.XPD.PRIM.ZS", "Education", "Education Spending, Primary (% of govt)"),
    ("SE.XPD.SECO.ZS", "Education", "Education Spending, Secondary (% of govt)"),
    ("SE.XPD.TERT.ZS", "Education", "Education Spending, Tertiary (% of govt)"),
]


# ============================================================
# HELPERS
# ============================================================

def fetch_json(url, retries=3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "SOTW-ETL/1.0"})
            resp = urllib.request.urlopen(req, timeout=30)
            return json.loads(resp.read().decode())
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
            else:
                print(f"  FAIL: {url[:80]}... ({e})")
                return None


def upsert_history(cur, ind_id, country_id, value, year, source):
    cur.execute(f"""
        INSERT INTO {HISTORY_TABLE} (id, country_id, value, year, source)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (id, country_id, year) DO UPDATE SET
            value = EXCLUDED.value, source = EXCLUDED.source, updated_at = NOW()
    """, (ind_id, country_id, value, year, source))


def upsert_latest(cur, ind_id, country_id, value, year, source):
    cur.execute(f"""
        INSERT INTO {LATEST_TABLE} (id, country_id, value, year, source)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (id, country_id) DO UPDATE SET
            value = EXCLUDED.value, year = EXCLUDED.year,
            source = EXCLUDED.source, updated_at = NOW()
    """, (ind_id, country_id, value, year, source))


def upsert_meta(cur, ind_id, description, source_name, source_url, unit=None):
    cur.execute(f"""
        INSERT INTO {META_TABLE} (id, description, source_name, source_url, unit)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (id) DO UPDATE SET
            description = EXCLUDED.description,
            source_name = EXCLUDED.source_name,
            source_url = EXCLUDED.source_url,
            unit = COALESCE(EXCLUDED.unit, {META_TABLE}.unit),
            last_updated = NOW()
    """, (ind_id, description, source_name, source_url, unit))


# ============================================================
# ETL: WHO GHO
# ============================================================

def etl_who(cur, valid_countries):
    print("\n=== WHO Global Health Observatory ===")
    total = 0

    for gho_code, sotw_id, label, unit, category in WHO_INDICATORS:
        try:
            url = f"https://ghoapi.azureedge.net/api/{gho_code}"
            data = fetch_json(url)
            if not data or "value" not in data:
                print(f"  SKIP {sotw_id}: no data")
                continue

            records = data["value"]
            count = 0
            latest_by_country = {}

            for rec in records:
                country_id = rec.get("SpatialDim", "")
                spatial_type = rec.get("SpatialDimType", "")
                year = rec.get("TimeDim")
                value = rec.get("NumericValue")
                dim1 = rec.get("Dim1", "")

                # Only country-level data, both sexes where applicable
                if spatial_type != "COUNTRY":
                    continue
                if country_id not in valid_countries:
                    continue
                if value is None:
                    continue
                # For sex-disaggregated indicators, prefer both sexes
                if dim1 and dim1 not in ("BTSX", "TOTL", ""):
                    continue

                try:
                    year = int(year)
                    value = float(value)
                except (ValueError, TypeError):
                    continue

                upsert_history(cur, sotw_id, country_id, round(value, 4), year, "who")
                count += 1

                # Track latest year per country
                if country_id not in latest_by_country or year > latest_by_country[country_id][0]:
                    latest_by_country[country_id] = (year, value)

            # Upsert latest values
            for cid, (yr, val) in latest_by_country.items():
                upsert_latest(cur, sotw_id, cid, round(val, 4), yr, "who")

            cur.connection.commit()

            # Metadata
            upsert_meta(cur, sotw_id, f"{label} — WHO Global Health Observatory.",
                       "WHO", f"https://www.who.int/data/gho/data/indicators/indicator-details/GHO/{gho_code}", unit)
            cur.connection.commit()

            total += count
            countries_count = len(latest_by_country)
            print(f"  {label}: {count} data points, {countries_count} countries")

        except Exception as e:
            cur.connection.rollback()
            print(f"  ERROR {sotw_id}: {e}")

        time.sleep(0.5)  # Be nice to the API

    print(f"  WHO total: {total} data points")
    return total


# ============================================================
# ETL: Additional World Bank indicators
# ============================================================

def build_iso2_to_iso3():
    """Build ISO2 -> ISO3 mapping from World Bank countries API."""
    data = fetch_json("https://api.worldbank.org/v2/country?format=json&per_page=400")
    if not data or len(data) < 2:
        return {}
    mapping = {}
    for c in (data[1] or []):
        iso2 = c.get("iso2Code", "")
        iso3 = c.get("id", "")
        if iso2 and iso3 and len(iso3) == 3:
            mapping[iso2] = iso3
    return mapping


def etl_wb_extra(cur, valid_countries):
    print("\n=== World Bank — Additional Indicators ===")
    total = 0

    # Build ISO2 -> ISO3 mapping (WB API returns ISO2 country codes)
    iso2_to_iso3 = build_iso2_to_iso3()
    print(f"  ISO2->ISO3 mapping: {len(iso2_to_iso3)} countries")

    for wb_id, category, label in WB_EXTRA_INDICATORS:
        try:
            url = f"https://api.worldbank.org/v2/country/all/indicator/{wb_id}?format=json&per_page=20000&date=2000:2026"
            data = fetch_json(url)
            if not data or len(data) < 2:
                print(f"  SKIP {wb_id}: no data")
                continue

            records = data[1] or []
            count = 0
            latest_by_country = {}

            for rec in records:
                iso2 = rec.get("country", {}).get("id", "")
                country_id = iso2_to_iso3.get(iso2, iso2)  # Convert ISO2 -> ISO3
                year = rec.get("date")
                value = rec.get("value")

                if country_id not in valid_countries:
                    continue
                if value is None:
                    continue

                try:
                    year = int(year)
                    value = float(value)
                except (ValueError, TypeError):
                    continue

                upsert_history(cur, wb_id, country_id, round(value, 4), year, "wb")
                count += 1

                if country_id not in latest_by_country or year > latest_by_country[country_id][0]:
                    latest_by_country[country_id] = (year, value)

            for cid, (yr, val) in latest_by_country.items():
                upsert_latest(cur, wb_id, cid, round(val, 4), yr, "wb")

            cur.connection.commit()

            upsert_meta(cur, wb_id, f"{label} — World Bank World Development Indicators.",
                       "World Bank", f"https://data.worldbank.org/indicator/{wb_id}", None)
            cur.connection.commit()

            total += count
            print(f"  {label}: {count} data points, {len(latest_by_country)} countries")

        except Exception as e:
            cur.connection.rollback()
            print(f"  ERROR {wb_id}: {e}")

        time.sleep(0.3)

    print(f"  WB extra total: {total} data points")
    return total


# ============================================================
# MAIN
# ============================================================

def main():
    parser = argparse.ArgumentParser(description="SOTW International Orgs ETL")
    parser.add_argument("--source", choices=["who", "wb_extra", "all"], default="all")
    args = parser.parse_args()

    conn = psycopg2.connect(**DB)
    cur = conn.cursor()

    # Get valid countries
    cur.execute("SELECT id FROM sotw_countries")
    valid_countries = {r[0] for r in cur.fetchall()}
    print(f"Valid countries: {len(valid_countries)}")

    total = 0
    start = time.time()

    if args.source in ("who", "all"):
        total += etl_who(cur, valid_countries)

    if args.source in ("wb_extra", "all"):
        total += etl_wb_extra(cur, valid_countries)

    elapsed = time.time() - start

    # Stats
    cur.execute(f"SELECT COUNT(*) FROM {HISTORY_TABLE}")
    total_history = cur.fetchone()[0]
    cur.execute(f"SELECT COUNT(DISTINCT id) FROM {HISTORY_TABLE}")
    unique = cur.fetchone()[0]

    print(f"\n{'='*50}")
    print(f"International Orgs ETL Complete")
    print(f"  Rows upserted this run: {total}")
    print(f"  Total history rows: {total_history}")
    print(f"  Unique indicators: {unique}")
    print(f"  Elapsed: {elapsed:.0f}s ({elapsed/60:.1f}m)")
    print(f"{'='*50}")

    conn.close()


if __name__ == "__main__":
    main()
