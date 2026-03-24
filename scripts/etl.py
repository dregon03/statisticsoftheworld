#!/usr/bin/env python3
"""
Unified ETL pipeline for Statistics of the World.
Fetches data from IMF, World Bank, and UN, writes to Supabase.

Usage:
  python3 scripts/etl.py --source all --table staging   # ETL to staging
  python3 scripts/etl.py --source imf --table main       # Just IMF to main
  python3 scripts/etl.py --promote                        # Copy staging -> main
  python3 scripts/etl.py --source all --table main        # Direct to main (prod)

Cron: Runs monthly via GitHub Actions (.github/workflows/etl.yml)
"""

import argparse
import json
import os
import socket
import sys
import time
import datetime
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

WB_BASE = "https://api.worldbank.org/v2"
IMF_BASE = "https://www.imf.org/external/datamapper/api/v1"
UN_BASE = "https://unstats.un.org/unsd/amaapi/api/file"

# ============================================================
# IMF INDICATORS
# ============================================================

IMF_INDICATORS = {
    "IMF.NGDPD": "NGDPD", "IMF.NGDP_RPCH": "NGDP_RPCH", "IMF.NGDPDPC": "NGDPDPC",
    "IMF.PPPGDP": "PPPGDP", "IMF.PPPPC": "PPPPC", "IMF.PPPSH": "PPPSH",
    "IMF.PCPIPCH": "PCPIPCH", "IMF.GGXWDG_NGDP": "GGXWDG_NGDP",
    "IMF.GGXCNL_NGDP": "GGXCNL_NGDP", "IMF.BCA_NGDPD": "BCA_NGDPD",
    "IMF.NI_GDP": "NI_GDP", "IMF.NGS_GDP": "NGS_GDP", "IMF.LUR": "LUR",
}

# ============================================================
# WORLD BANK INDICATORS (307 total)
# ============================================================

WB_INDICATORS = [
    # WB equivalents for multi-source comparison (PRIORITY — fetch first)
    "NY.GDP.MKTP.CD","NY.GDP.PCAP.CD","NY.GDP.MKTP.KD.ZG",
    "NY.GDP.MKTP.PP.CD","NY.GDP.PCAP.PP.CD",
    # Core WB indicators
    "NY.GNP.MKTP.CD","NY.GNP.PCAP.CD","NY.GNP.PCAP.PP.CD",
    "NV.IND.TOTL.ZS","NV.SRV.TOTL.ZS","NV.AGR.TOTL.ZS",
    "NE.CON.GOVT.ZS","NE.CON.PRVT.ZS","NE.GDI.TOTL.ZS",
    "NY.GNS.ICTR.ZS","NY.GDP.DEFL.KD.ZG","SL.GDP.PCAP.EM.KD",
    "NV.IND.MANF.ZS","NV.MNF.TECH.ZS.UN","NY.ADJ.NNTY.PC.CD",
    "NY.ADJ.SVNG.GN.ZS","NE.RSB.GNFS.ZS",
    "NY.GDP.COAL.RT.ZS","NY.GDP.MINR.RT.ZS","NY.GDP.PETR.RT.ZS",
    "NY.GDP.NGAS.RT.ZS","NY.GDP.TOTL.RT.ZS","NY.GDP.FRST.RT.ZS","NV.IND.TOTL.CD",
    "FP.CPI.TOTL.ZG","FR.INR.RINR","FR.INR.LEND","FR.INR.DPST",
    "GC.DOD.TOTL.GD.ZS","GC.REV.XGRT.GD.ZS","GC.XPN.TOTL.GD.ZS",
    "GC.TAX.TOTL.GD.ZS","GC.TAX.GSRV.RV.ZS","GC.TAX.INTT.RV.ZS",
    "GC.TAX.YPKG.RV.ZS","GC.BAL.CASH.GD.ZS","GC.NFN.TOTL.GD.ZS",
    "FI.RES.TOTL.CD","FI.RES.TOTL.MO","PA.NUS.FCRF","PA.NUS.PPP","FM.LBL.BMNY.GD.ZS",
    "NE.TRD.GNFS.ZS","NE.EXP.GNFS.ZS","NE.IMP.GNFS.ZS",
    "NE.EXP.GNFS.CD","NE.IMP.GNFS.CD","TX.VAL.MRCH.CD.WT","TM.VAL.MRCH.CD.WT",
    "BX.KLT.DINV.WD.GD.ZS","BM.KLT.DINV.WD.GD.ZS","BX.KLT.DINV.CD.WD",
    "BX.TRF.PWKR.CD.DT","BX.TRF.PWKR.DT.GD.ZS","TX.VAL.TECH.MF.ZS",
    "BN.CAB.XOKA.GD.ZS","BN.CAB.XOKA.CD",
    "DT.DOD.DECT.GN.ZS","DT.DOD.DECT.CD","DT.TDS.DECT.GN.ZS",
    "DT.DOD.DLTT.CD","DT.DOD.DSTT.CD","DT.DOD.PVLX.CD",
    "DT.INT.DECT.GN.ZS","DT.DOD.DIMF.CD","DT.ODA.ODAT.GN.ZS","DT.ODA.ODAT.CD",
    "FS.AST.DOMS.GD.ZS","FS.AST.PRVT.GD.ZS","CM.MKT.LCAP.GD.ZS",
    "CM.MKT.LCAP.CD","CM.MKT.TRAD.GD.ZS","CM.MKT.LDOM.NO",
    "FB.BNK.CAPA.ZS","FB.AST.NPER.ZS",
    "FX.OWN.TOTL.ZS","FX.OWN.TOTL.FE.ZS","FX.OWN.TOTL.MA.ZS",
    "IC.FRM.BNKS.ZS","IC.CRD.INFO.XQ","IC.LGL.CRED.XQ",
    "IC.BUS.EASE.XQ","IC.REG.DURS","IC.REG.PROC","IC.REG.COST.PC.ZS",
    "IC.TAX.TOTL.CP.ZS","IC.TAX.DURS","IC.TAX.PAYM",
    "IC.EXP.DURS","IC.IMP.DURS","IC.PRP.DURS","IC.ELC.DURS","IC.CNS.DURS",
    "SP.POP.TOTL","SP.POP.GROW","EN.POP.DNST","AG.SRF.TOTL.K2","AG.LND.TOTL.K2",
    "SP.URB.TOTL.IN.ZS","SP.URB.TOTL","SP.RUR.TOTL.ZS",
    "SP.DYN.LE00.IN","SP.DYN.LE00.MA.IN","SP.DYN.LE00.FE.IN",
    "SP.DYN.TFRT.IN","SP.DYN.CBRT.IN","SP.DYN.CDRT.IN","SM.POP.NETM",
    "SP.POP.0014.TO.ZS","SP.POP.1564.TO.ZS","SP.POP.65UP.TO.ZS",
    "SP.POP.DPND","SP.POP.DPND.OL","SP.POP.DPND.YG",
    "SM.POP.REFG","SM.POP.REFG.OR","SP.DYN.AMRT.MA","SP.DYN.AMRT.FE",
    "SL.TLF.TOTL.IN","SL.TLF.CACT.ZS","SL.TLF.CACT.FE.ZS","SL.TLF.CACT.MA.ZS",
    "SL.UEM.TOTL.ZS","SL.UEM.TOTL.FE.ZS","SL.UEM.TOTL.MA.ZS",
    "SL.UEM.1524.ZS","SL.UEM.LTRM.ZS",
    "SL.AGR.EMPL.ZS","SL.IND.EMPL.ZS","SL.SRV.EMPL.ZS",
    "SL.TLF.CACT.NE.ZS","SL.EMP.VULN.ZS","SL.EMP.WORK.ZS",
    "SL.TLF.PART.ZS","SL.EMP.MPYR.ZS","SL.TLF.TOTL.FE.ZS",
    "SE.XPD.TOTL.GD.ZS","SE.XPD.TOTL.GB.ZS",
    "SE.ADT.LITR.ZS","SE.ADT.LITR.FE.ZS","SE.ADT.LITR.MA.ZS","SE.ADT.1524.LT.ZS",
    "SE.PRM.ENRR","SE.SEC.ENRR","SE.TER.ENRR",
    "SE.PRM.CMPT.ZS","SE.SEC.CMPT.LO.ZS",
    "SE.PRM.UNER","SE.PRM.UNER.FE","SE.PRM.TCHR","SE.SEC.TCHR",
    "SE.PRM.ENRL.TC.ZS","SE.SEC.ENRL.TC.ZS","SE.XPD.PRIM.ZS",
    "SH.XPD.CHEX.GD.ZS","SH.XPD.CHEX.PC.CD","SH.XPD.GHED.GD.ZS","SH.XPD.OOPC.CH.ZS",
    "SH.MED.PHYS.ZS","SH.MED.NUMW.P3","SH.MED.BEDS.ZS",
    "SH.DYN.MORT","SH.DYN.NMRT","SH.STA.MMRT","SH.DYN.MORT.FE","SH.DYN.MORT.MA",
    "SH.DTH.COMM.ZS","SH.DTH.NCOM.ZS","SH.DTH.INJR.ZS",
    "SH.IMM.MEAS","SH.IMM.IDPT","SH.HIV.INCD.TL.P3","SH.TBS.INCD",
    "SH.STA.STNT.ZS","SH.STA.OWGH.ZS","SH.PRV.SMOK.MA","SH.PRV.SMOK.FE",
    "SH.STA.SUIC.P5","SH.ALC.PCAP.LI",
    "EN.GHG.CO2.PC.CE.AR5","EN.GHG.CO2.MT.CE.AR5","EN.ATM.CO2E.GD.PP.KD",
    "EG.USE.PCAP.KG.OE","EG.USE.ELEC.KH.PC",
    "EG.ELC.RNEW.ZS","EG.FEC.RNEW.ZS","EG.ELC.ACCS.ZS","EG.CFT.ACCS.ZS",
    "EN.ATM.PM25.MC.M3","AG.LND.FRST.ZS","AG.LND.FRST.K2","AG.LND.ARBL.ZS",
    "ER.PTD.TOTL.ZS","ER.MRN.PTMR.ZS",
    "SH.H2O.BASW.ZS","SH.STA.BASS.ZS",
    "EN.ATM.METH.KT.CE","EN.ATM.NOXE.KT.CE","EN.ATM.GHGO.KT.CE",
    "AG.LND.AGRI.ZS","AG.YLD.CREL.KG",
    "AG.PRD.FOOD.XD","AG.PRD.CROP.XD","AG.PRD.LVSK.XD",
    "AG.LND.CREL.HA","ER.FSH.CAPT.MT","AG.CON.FERT.ZS",
    "SN.ITK.DEFC.ZS","SN.ITK.DFCT","AG.LND.IRIG.AG.ZS","ER.H2O.FWTL.ZS",
    "IT.NET.USER.ZS","IT.CEL.SETS.P2","IT.NET.BBND.P2","IT.NET.SECR.P6",
    "GB.XPD.RSDV.GD.ZS","IP.PAT.RESD","IP.PAT.NRES","IP.TMK.TOTL",
    "IP.JRN.ARTC.SC","TX.VAL.TECH.CD","BX.GSR.CCIS.ZS","BX.GSR.CCIS.CD",
    "IP.IDS.RSCT","SP.POP.SCIE.RD.P6",
    "IS.AIR.PSGR","IS.AIR.GOOD.MT.K1","IS.SHP.GOOD.TU",
    "IS.RRS.TOTL.KM","IS.RRS.PASG.KM","IS.RRS.GOOD.MT.K6",
    "IS.VEH.NVEH.P3","IS.ROD.TOTL.KM","IS.ROD.PAVE.ZS",
    "LP.LPI.OVRL.XQ","EG.ELC.PETR.ZS","EG.ELC.NUCL.ZS",
    "SG.GEN.PARL.ZS","SL.TLF.CACT.FE.NE.ZS","SL.EMP.WORK.FE.ZS",
    "SE.ENR.PRFM.FE.ZS","SE.PRM.GINT.FE.ZS","SP.ADO.TFRT",
    "IC.REG.COST.PC.FE.ZS","SG.VAW.REAS.ZS","SG.OWN.HOUS.FE.ZS",
    "SG.LAW.NODC.HR","SE.PRM.GINT.ZS","SE.ENR.SECO.FM.ZS",
    "CC.EST","GE.EST","PV.EST","RQ.EST","RL.EST","VA.EST",
    "CC.PER.RNK","GE.PER.RNK","RL.PER.RNK","PV.PER.RNK",
    "MS.MIL.XPND.GD.ZS","MS.MIL.XPND.CD","MS.MIL.TOTL.P1",
    "MS.MIL.TOTL.TF.ZS","MS.MIL.XPND.ZS","VC.IHR.PSRC.P5",
    "SI.POV.DDAY","SI.POV.LMIC","SI.POV.UMIC","SI.POV.NAHC",
    "SI.POV.GINI","SI.DST.10TH.10","SI.DST.FRST.10",
    "SI.DST.05TH.20","SI.DST.FRST.20",
    "SI.SPR.PCAP.ZG","SI.SPR.PCAP","SI.POV.GAPS",
    "per_si_allsi.cov_pop_tot","per_sa_allsa.cov_pop_tot",
    "per_lm_alllm.cov_pop_tot","per_allsp.cov_pop_tot",
    "HD.HCI.OVRL","HD.HCI.OVRL.FE","HD.HCI.OVRL.MA","HD.HCI.LAYS",
    "ST.INT.ARVL","ST.INT.DPRT","ST.INT.RCPT.CD",
    "ST.INT.XPND.CD","ST.INT.RCPT.XP.ZS","ST.INT.TRNR.CD",
    "SP.URB.GROW","EN.URB.LCTY","EN.URB.LCTY.UR.ZS",
    "EN.URB.MCTY.TL.ZS","EN.POP.SLUM.UR.ZS","SP.RUR.TOTL.ZG",
    "SH.H2O.SMDW.ZS","SH.STA.SMSS.ZS",
    "IC.FRM.CORR.ZS","IC.FRM.FEMO.ZS","IC.FRM.FEMM.ZS",
    "IC.FRM.ISOC.ZS","IC.FRM.TRNG.ZS","IC.FRM.INFM.ZS","IC.FRM.DURS","IC.FRM.CMPU.ZS",
]

# ============================================================
# UN FILES
# ============================================================

UN_FILES = {
    2:  {"id": "UN.GDP",   "row": "Gross Domestic Product (GDP)", "file": "un_gdp_usd.xlsx"},
    9:  {"id": "UN.GDPPC", "row": None, "file": "un_gdp_percap.xlsx"},
    16: {"id": "UN.GDPGR", "row": "Gross Domestic Product (GDP)", "file": "un_gdp_growth.xlsx"},
    24: {"id": "UN.GNI",   "row": None, "file": "un_gni_usd.xlsx"},
    27: {"id": "UN.GNIPC", "row": None, "file": "un_gnipc.xlsx"},
}

UN_NAME_ALIASES = {
    "Bolivia (Plurinational State of)": "BOL", "Brunei Darussalam": "BRN",
    "Cabo Verde": "CPV", "China, Hong Kong SAR": "HKG", "China, Macao SAR": "MAC",
    "Congo": "COG", "Czechia": "CZE", "Cote d'Ivoire": "CIV",
    "C\u00f4te d'Ivoire": "CIV", "D.P.R. of Korea": "PRK",
    "Democratic Republic of the Congo": "COD", "D.R. of the Congo": "COD",
    "Egypt": "EGY", "Eswatini": "SWZ", "Gambia": "GMB",
    "Iran (Islamic Republic of)": "IRN", "Korea, Republic of": "KOR",
    "Kyrgyzstan": "KGZ", "Lao People's DR": "LAO",
    "Micronesia (Federated States of)": "FSM", "Micronesia (FS of)": "FSM",
    "Moldova, Republic of": "MDA", "Netherlands (Kingdom of the)": "NLD",
    "North Macedonia": "MKD", "Republic of Korea": "KOR",
    "Russian Federation": "RUS", "Slovakia": "SVK",
    "Syria": "SYR", "Syrian Arab Republic": "SYR",
    "Taiwan Province of China": "TWN", "China, Taiwan Province of": "TWN",
    "Tanzania, United Republic of": "TZA", "United Republic of Tanzania": "TZA",
    "U.R. of Tanzania: Mainland": "TZA",
    "T\u00fcrkiye": "TUR", "Turkiye": "TUR", "Turkey": "TUR",
    "United Kingdom": "GBR", "United States": "USA", "Viet Nam": "VNM",
    "Venezuela (Bolivarian Republic of)": "VEN", "State of Palestine": "PSE",
    "Curacao": "CUW", "Cura\u00e7ao": "CUW",
    "Saint Kitts and Nevis": "KNA", "Saint Lucia": "LCA",
    "Saint Vincent and the Grenadines": "VCT", "Sao Tome and Principe": "STP",
    "Sint Maarten (Dutch part)": "SXM", "Timor-Leste": "TLS",
    "Zanzibar": None, "Czechoslovakia (Former)": None, "USSR (Former)": None,
    "Yugoslav SFR (Former)": None, "Yugoslavia (Former)": None,
    "Ethiopia (Former)": None, "Yemen Arab Republic (Former)": None,
    "Yemen Democratic (Former)": None,
}

# ============================================================
# HELPERS
# ============================================================

def fetch_json(url):
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (StatisticsOfTheWorld ETL)",
        "Accept": "application/json",
    })
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read())


def upsert(cur, table, ind_id, country_id, value, year, source):
    cur.execute(f"""
        INSERT INTO {table} (id, country_id, value, year, source)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (id, country_id) DO UPDATE SET
            value = EXCLUDED.value, year = EXCLUDED.year,
            source = EXCLUDED.source, updated_at = NOW()
    """, (ind_id, country_id, value, year, source))


def batch_upsert(cur, table, rows):
    """Upsert multiple rows in one SQL statement. 31,000 round-trips → 156."""
    if not rows:
        return
    from psycopg2.extras import execute_values
    execute_values(cur,
        f"INSERT INTO {table} (id, country_id, value, year, source) VALUES %s "
        f"ON CONFLICT (id, country_id) DO UPDATE SET "
        f"value=EXCLUDED.value, year=EXCLUDED.year, source=EXCLUDED.source, updated_at=NOW()",
        rows, page_size=500)


def log_run(cur, source, table, status="running"):
    cur.execute("""
        INSERT INTO sotw_etl_runs (source, target_table, status)
        VALUES (%s, %s, %s) RETURNING id
    """, (source, table, status))
    return cur.fetchone()[0]


def finish_run(cur, run_id, rows, indicators, errors, status="completed"):
    cur.execute("""
        UPDATE sotw_etl_runs SET finished_at = NOW(), rows_updated = %s,
            indicators_count = %s, errors = %s, status = %s
        WHERE id = %s
    """, (rows, indicators, errors, status, run_id))


# ============================================================
# ETL: IMF
# ============================================================

def etl_imf(cur, table, valid_countries, conn=None):
    print("ETL: IMF indicators...")
    year = datetime.datetime.now().year
    total = 0
    errors = []

    for sotw_id, imf_id in IMF_INDICATORS.items():
        try:
            data = fetch_json(f"{IMF_BASE}/{imf_id}?periods={year},{year-1},{year-2}")
            values = data.get("values", {}).get(imf_id, {})
        except Exception as e:
            errors.append(f"IMF {sotw_id}: {e}")
            continue

        rows = []
        for country_code, year_data in values.items():
            if country_code not in valid_countries:
                continue
            for yr in [year, year - 1, year - 2]:
                val = year_data.get(str(yr))
                if val is not None:
                    rows.append((sotw_id, country_code, val, yr, "imf"))
                    break
        batch_upsert(cur, table, rows)
        total += len(rows)
        if conn:
            conn.commit()
        print(f"  {sotw_id}: {count} countries")
        time.sleep(1)

    return total, errors


# ============================================================
# ETL: WORLD BANK
# ============================================================

def _fetch_wb_indicator(args):
    """Fetch one WB indicator (runs in thread pool)."""
    ind_id, iso2_to_iso3 = args
    best = {}
    try:
        for page in [1, 2, 3]:
            req = urllib.request.Request(
                f"{WB_BASE}/country/all/indicator/{ind_id}?format=json&mrv=5&per_page=500&page={page}",
                headers={"User-Agent": "Mozilla/5.0 (StatisticsOfTheWorld ETL)", "Accept": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read())
            if not data[1]:
                break
            for d in data[1]:
                iso2 = d["country"]["id"]
                if d["value"] is None:
                    continue
                iso3 = iso2_to_iso3.get(iso2)
                if not iso3:
                    continue
                yr = int(d["date"])
                if iso3 not in best or yr > best[iso3][1]:
                    best[iso3] = (d["value"], yr)
            if data[0].get("pages", 1) <= page:
                break
        return ind_id, best, None
    except Exception as e:
        return ind_id, {}, f"WB {ind_id}: {e}"


def etl_wb(cur, table, iso2_to_iso3, conn=None, wb_batch=-1):
    from concurrent.futures import ThreadPoolExecutor, as_completed

    # Split indicators into batches if requested
    mid = len(WB_INDICATORS) // 2
    if wb_batch == 0:
        indicators = WB_INDICATORS[:mid]
        print(f"ETL: World Bank batch 0 (indicators 1-{mid}, parallel fetch)...")
    elif wb_batch == 1:
        indicators = WB_INDICATORS[mid:]
        print(f"ETL: World Bank batch 1 (indicators {mid+1}-{len(WB_INDICATORS)}, parallel fetch)...")
    else:
        indicators = WB_INDICATORS
        print(f"ETL: World Bank ALL {len(WB_INDICATORS)} indicators (parallel fetch)...")

    total = 0
    errors = []

    tasks = [(ind_id, iso2_to_iso3) for ind_id in indicators]
    done = 0

    with ThreadPoolExecutor(max_workers=10) as pool:
        futures = {pool.submit(_fetch_wb_indicator, t): t[0] for t in tasks}
        for future in as_completed(futures):
            ind_id, best, err = future.result()
            done += 1
            if err:
                errors.append(err)
                continue

            rows = [(ind_id, iso3, value, yr, "wb") for iso3, (value, yr) in best.items()]
            batch_upsert(cur, table, rows)
            count = len(rows)
            total += count

            # Commit after each indicator to avoid statement timeout
            if conn:
                conn.commit()

            if done % 20 == 0 or done == len(indicators):
                print(f"  Progress: {done}/{len(indicators)} indicators, {total} rows", flush=True)

    print(f"  World Bank total: {total} rows ({done}/{len(indicators)} indicators)", flush=True)
    if errors:
        print(f"  Errors ({len(errors)}): {errors[:5]}", flush=True)
    return total, errors


# ============================================================
# ETL: UNITED NATIONS
# ============================================================

def etl_un(cur, table, name_to_iso3, conn=None):
    print("ETL: United Nations indicators...")
    total = 0
    errors = []

    try:
        import openpyxl
    except ImportError:
        errors.append("openpyxl not installed - skipping UN data")
        print("  ERROR: openpyxl not installed")
        return 0, errors

    tmp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".un_cache")
    os.makedirs(tmp_dir, exist_ok=True)

    for file_id, cfg in UN_FILES.items():
        ind_id = cfg["id"]
        row_name = cfg["row"]
        filepath = os.path.join(tmp_dir, cfg["file"])

        # Download if not cached (cache for 24h)
        if not os.path.exists(filepath) or (time.time() - os.path.getmtime(filepath)) > 86400:
            print(f"  Downloading UN file {file_id}...")
            try:
                req = urllib.request.Request(f"{UN_BASE}/{file_id}", headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=120) as resp:
                    with open(filepath, "wb") as f:
                        f.write(resp.read())
            except Exception as e:
                errors.append(f"UN download {file_id}: {e}")
                continue

        # Parse Excel
        try:
            wb = openpyxl.load_workbook(filepath, read_only=True)
            ws = wb.active
            headers = None
            has_indicator_col = False
            data_start_col = 2
            count = 0

            un_rows = []
            for i, row in enumerate(ws.iter_rows(values_only=True)):
                vals = list(row)
                if i == 2:
                    headers = vals
                    if isinstance(vals[2], str) and not str(vals[2]).isdigit():
                        has_indicator_col = True
                        data_start_col = 3
                elif i > 2:
                    if has_indicator_col:
                        indicator = vals[2]
                        if not isinstance(indicator, str) or indicator.strip() != row_name:
                            continue
                    country = vals[1]
                    if not country or not isinstance(country, str):
                        continue

                    # Find most recent value
                    for col_idx in range(len(vals) - 1, data_start_col - 1, -1):
                        if vals[col_idx] is not None:
                            try:
                                yr = int(headers[col_idx])
                                value = float(vals[col_idx])
                                iso3 = name_to_iso3(country)
                                if iso3:
                                    un_rows.append((ind_id, iso3, value, yr, "un"))
                            except (ValueError, TypeError):
                                pass
                            break

            wb.close()
            batch_upsert(cur, table, un_rows)
            count = len(un_rows)
            total += count
            if conn:
                conn.commit()
            print(f"  {ind_id}: {count} countries")
        except Exception as e:
            errors.append(f"UN parse {ind_id}: {e}")

    return total, errors


# ============================================================
# PROMOTE: staging -> main
# ============================================================

def promote(conn, cur):
    print("Promoting staging -> main...")
    cur.execute("SELECT COUNT(*) FROM sotw_indicators_staging")
    staging_count = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM sotw_indicators")
    main_count = cur.fetchone()[0]
    print(f"  Staging: {staging_count} rows, Main: {main_count} rows")

    if staging_count < main_count * 0.5:
        print("  ERROR: Staging has <50% of main rows. Aborting promotion.")
        return False

    cur.execute("DELETE FROM sotw_indicators")
    cur.execute("INSERT INTO sotw_indicators SELECT * FROM sotw_indicators_staging")
    conn.commit()
    print(f"  Promoted {staging_count} rows to main table")
    return True


# ============================================================
# MAIN
# ============================================================

def main():
    parser = argparse.ArgumentParser(description="SOTW ETL Pipeline")
    parser.add_argument("--source", choices=["imf", "wb", "un", "all"], default="all")
    parser.add_argument("--table", choices=["main", "staging"], default="staging")
    parser.add_argument("--wb-batch", type=int, default=-1, help="WB batch: 0=first half, 1=second half, -1=all")
    parser.add_argument("--promote", action="store_true", help="Copy staging to main")
    args = parser.parse_args()

    conn = psycopg2.connect(**DB)
    cur = conn.cursor()

    if args.promote:
        promote(conn, cur)
        conn.close()
        return

    table = "sotw_indicators" if args.table == "main" else "sotw_indicators_staging"
    run_id = log_run(cur, args.source, args.table)
    conn.commit()

    # Get valid country IDs
    cur.execute("SELECT id FROM sotw_countries")
    valid_countries = {r[0] for r in cur.fetchall()}

    # Build ISO2->ISO3 mapping for WB
    iso2_to_iso3 = {}
    try:
        data = fetch_json(f"{WB_BASE}/country?format=json&per_page=300")
        for c in data[1]:
            if c["region"]["id"] != "NA":
                iso2_to_iso3[c["iso2Code"]] = c["id"]
    except Exception as e:
        print(f"ERROR building ISO mapping: {e}")

    # Build UN name->ISO3 lookup
    cur.execute("SELECT id, name FROM sotw_countries")
    db_countries = {name: iso3 for iso3, name in cur.fetchall()}

    def name_to_iso3(name):
        if name in db_countries:
            return db_countries[name]
        if name in UN_NAME_ALIASES:
            return UN_NAME_ALIASES[name]
        for db_name, iso3 in db_countries.items():
            if name.lower() in db_name.lower() or db_name.lower() in name.lower():
                return iso3
        return None

    # Seed countries first (always update)
    print("Updating countries...")
    try:
        data = fetch_json(f"{WB_BASE}/country?format=json&per_page=300")
        countries = [c for c in data[1] if c["region"]["id"] != "NA"]
        for c in countries:
            cur.execute("""
                INSERT INTO sotw_countries (id, name, region, income_level, capital_city, longitude, latitude, iso2)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name, region = EXCLUDED.region,
                    income_level = EXCLUDED.income_level, capital_city = EXCLUDED.capital_city,
                    iso2 = EXCLUDED.iso2, updated_at = NOW()
            """, (c["id"], c["name"], c["region"]["value"], c["incomeLevel"]["value"],
                  c["capitalCity"],
                  float(c["longitude"]) if c["longitude"] else None,
                  float(c["latitude"]) if c["latitude"] else None,
                  c["iso2Code"].lower()))
        conn.commit()
        print(f"  {len(countries)} countries updated")
    except Exception as e:
        print(f"  ERROR updating countries: {e}")

    # Run ETL for selected sources
    total_rows = 0
    all_errors = []
    indicators_set = set()

    if args.source in ("imf", "all"):
        rows, errors = etl_imf(cur, table, valid_countries, conn=conn)
        total_rows += rows
        all_errors.extend(errors)
        indicators_set.update(IMF_INDICATORS.keys())
        conn.commit()

    if args.source in ("wb", "all"):
        rows, errors = etl_wb(cur, table, iso2_to_iso3, conn=conn, wb_batch=args.wb_batch)
        total_rows += rows
        all_errors.extend(errors)
        indicators_set.update(WB_INDICATORS)
        conn.commit()

    if args.source in ("un", "all"):
        rows, errors = etl_un(cur, table, name_to_iso3, conn=conn)
        total_rows += rows
        all_errors.extend(errors)
        indicators_set.update(f["id"] for f in UN_FILES.values())
        conn.commit()

    # Finish run log
    finish_run(cur, run_id, total_rows, len(indicators_set),
               all_errors[:50] if all_errors else None,
               "completed" if not all_errors else "completed_with_errors")
    conn.commit()

    # Summary
    print(f"\n{'='*50}")
    print(f"ETL Complete: {args.source} -> {args.table}")
    print(f"  Rows upserted: {total_rows}")
    print(f"  Indicators: {len(indicators_set)}")
    print(f"  Errors: {len(all_errors)}")
    if all_errors:
        for e in all_errors[:10]:
            print(f"    - {e}")
    print(f"{'='*50}")

    # Output JSON summary for test page
    summary = {
        "run_id": run_id,
        "source": args.source,
        "table": args.table,
        "rows_updated": total_rows,
        "indicators_count": len(indicators_set),
        "errors_count": len(all_errors),
        "timestamp": datetime.datetime.now().isoformat(),
    }
    print(f"\nJSON: {json.dumps(summary)}")

    conn.close()


if __name__ == "__main__":
    main()
