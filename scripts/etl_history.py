#!/usr/bin/env python3
"""
Historical ETL pipeline for Statistics of the World.
Fetches 20+ years of data from IMF + World Bank, writes to sotw_indicators_history.

Usage:
  python3 scripts/etl_history.py                    # Full backfill (all sources)
  python3 scripts/etl_history.py --source imf       # IMF only
  python3 scripts/etl_history.py --source wb        # World Bank only
  python3 scripts/etl_history.py --batch 0          # WB batch 0 (first 50 indicators)
  python3 scripts/etl_history.py --batch 1          # WB batch 1 (next 50)

First run takes ~45 min (WB rate limits). Subsequent runs are incremental.
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
# Force IPv4 (GitHub Actions runners fail on IPv6)
try:
    DB_HOST = socket.getaddrinfo(DB_HOST, 5432, socket.AF_INET)[0][4][0]
except Exception:
    pass
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")

DB = dict(
    host=DB_HOST, port=5432, dbname="postgres", user="postgres",
    password=DB_PASS, sslmode="require",
    options="-c statement_timeout=0",
)

WB_BASE = "https://api.worldbank.org/v2"
IMF_BASE = "https://www.imf.org/external/datamapper/api/v1"

YEAR_START = 2000
YEAR_END = datetime.datetime.now().year + 1  # Include forecasts

TABLE = "sotw_indicators_history"

# ============================================================
# IMF INDICATORS (13 total)
# ============================================================

IMF_INDICATORS = {
    "IMF.NGDPD": "NGDPD", "IMF.NGDP_RPCH": "NGDP_RPCH", "IMF.NGDPDPC": "NGDPDPC",
    "IMF.PPPGDP": "PPPGDP", "IMF.PPPPC": "PPPPC", "IMF.PPPSH": "PPPSH",
    "IMF.PCPIPCH": "PCPIPCH", "IMF.GGXWDG_NGDP": "GGXWDG_NGDP",
    "IMF.GGXCNL_NGDP": "GGXCNL_NGDP", "IMF.BCA_NGDPD": "BCA_NGDPD",
    "IMF.NI_GDP": "NI_GDP", "IMF.NGS_GDP": "NGS_GDP", "IMF.LUR": "LUR",
}

# ============================================================
# WORLD BANK INDICATORS (copied from etl.py)
# ============================================================

WB_INDICATORS = [
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
    # WB equivalents for multi-source comparison
    "NY.GDP.MKTP.CD","NY.GDP.PCAP.CD","NY.GDP.MKTP.KD.ZG",
    "NY.GDP.MKTP.PP.CD","NY.GDP.PCAP.PP.CD",
]

WB_AGGREGATES = {
    '1A','1W','4E','7E','8S','B8','EU','F1','OE','S1','S2','S3','S4',
    'T2','T3','T4','T5','T6','T7','V1','V2','V3','V4','XC','XD','XE',
    'XF','XG','XH','XI','XJ','XL','XM','XN','XO','XP','XQ','XT','XU',
    'XY','Z4','Z7','ZB','ZF','ZG','ZH','ZI','ZJ','ZQ','ZT',
    'AFE','AFW','ARB','CEB','CSS','EAP','EAR','EAS','ECA','ECS',
    'EMU','FCS','HIC','HPC','IBD','IBT','IDA','IDB','IDX','INX',
    'LAC','LCN','LDC','LIC','LMC','LMY','LTE','MEA','MIC','MNA',
    'NAC','OED','OSS','PRE','PSS','PST','SAS','SSA','SSF','SST',
    'TEA','TEC','TLA','TMN','TSA','TSS','UMC','WLD',
}

# ============================================================
# HELPERS
# ============================================================

def fetch_json(url, retries=3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": "Mozilla/5.0 (StatisticsOfTheWorld ETL)",
                "Accept": "application/json",
            })
            with urllib.request.urlopen(req, timeout=60) as resp:
                return json.loads(resp.read())
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
            else:
                raise


def upsert_history(cur, ind_id, country_id, value, year, source):
    cur.execute(f"""
        INSERT INTO {TABLE} (id, country_id, value, year, source)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (id, country_id, year) DO UPDATE SET
            value = EXCLUDED.value,
            source = EXCLUDED.source,
            updated_at = NOW()
    """, (ind_id, country_id, value, year, source))


# ============================================================
# ETL: IMF (all years in one call per indicator)
# ============================================================

def etl_imf(cur, valid_countries):
    print("\n=== IMF Historical ETL ===")
    # IMF API limits period count — batch in chunks of 7 years
    all_years = list(range(YEAR_START, YEAR_END + 1))
    year_batches = [all_years[i:i+7] for i in range(0, len(all_years), 7)]
    total = 0

    for sotw_id, imf_id in IMF_INDICATORS.items():
        count = 0
        for batch in year_batches:
            periods = ",".join(str(y) for y in batch)
            try:
                data = fetch_json(f"{IMF_BASE}/{imf_id}?periods={periods}")
                values = data.get("values", {}).get(imf_id, {})
            except Exception as e:
                print(f"  SKIP {sotw_id} ({batch[0]}-{batch[-1]}): {e}")
                continue

            for country_code, year_data in values.items():
                if country_code not in valid_countries:
                    continue
                for yr_str, val in year_data.items():
                    try:
                        yr = int(yr_str)
                        if yr < YEAR_START or val is None:
                            continue
                        upsert_history(cur, sotw_id, country_code, float(val), yr, "imf")
                        count += 1
                    except (ValueError, TypeError):
                        continue
            time.sleep(0.5)

        total += count
        print(f"  {sotw_id}: {count} data points")
        time.sleep(0.5)

    print(f"  IMF total: {total} rows")
    return total


# ============================================================
# ETL: WORLD BANK (all years, paginated)
# ============================================================

def etl_wb(cur, iso2_to_iso3, batch=None):
    print("\n=== World Bank Historical ETL ===")

    indicators = WB_INDICATORS
    if batch is not None:
        batch_size = 50
        start = batch * batch_size
        end = min(start + batch_size, len(indicators))
        indicators = indicators[start:end]
        print(f"  Batch {batch}: indicators {start}-{end-1} of {len(WB_INDICATORS)}")

    date_range = f"{YEAR_START}:{YEAR_END}"
    total = 0

    for i, ind_id in enumerate(indicators):
        count = 0
        try:
            # Fetch all years for this indicator, paginate
            page = 1
            while True:
                url = f"{WB_BASE}/country/all/indicator/{ind_id}?format=json&date={date_range}&per_page=1000&page={page}"
                data = fetch_json(url)

                if not data or len(data) < 2 or not data[1]:
                    break

                for d in data[1]:
                    if d["value"] is None:
                        continue
                    iso2 = d["country"]["id"]
                    if iso2 in WB_AGGREGATES:
                        continue
                    iso3 = iso2_to_iso3.get(iso2)
                    if not iso3:
                        continue
                    yr = int(d["date"])
                    upsert_history(cur, ind_id, iso3, d["value"], yr, "wb")
                    count += 1

                total_pages = data[0].get("pages", 1)
                if page >= total_pages:
                    break
                page += 1

        except Exception as e:
            print(f"  SKIP {ind_id}: {e}")
            continue

        total += count

        if (i + 1) % 10 == 0:
            print(f"  Progress: {i+1}/{len(indicators)} indicators, {total} rows")

        # Rate limiting — WB allows ~30 req/min
        time.sleep(0.8)

    print(f"  World Bank total: {total} rows")
    return total


# ============================================================
# MAIN
# ============================================================

def main():
    parser = argparse.ArgumentParser(description="SOTW Historical ETL")
    parser.add_argument("--source", choices=["imf", "wb", "all"], default="all")
    parser.add_argument("--batch", type=int, default=None,
                        help="WB batch number (0-based, 50 indicators per batch)")
    args = parser.parse_args()

    conn = psycopg2.connect(**DB)
    cur = conn.cursor()

    # Get valid countries
    cur.execute("SELECT id FROM sotw_countries")
    valid_countries = {r[0] for r in cur.fetchall()}
    print(f"Valid countries: {len(valid_countries)}")

    # Build ISO2->ISO3 mapping for WB
    iso2_to_iso3 = {}
    try:
        data = fetch_json(f"{WB_BASE}/country?format=json&per_page=300")
        for c in data[1]:
            if c["region"]["id"] != "NA":
                iso2_to_iso3[c["iso2Code"]] = c["id"]
        print(f"ISO2->ISO3 mappings: {len(iso2_to_iso3)}")
    except Exception as e:
        print(f"ERROR building ISO mapping: {e}")

    total_rows = 0
    start_time = time.time()

    if args.source in ("imf", "all"):
        rows = etl_imf(cur, valid_countries)
        total_rows += rows
        conn.commit()

    if args.source in ("wb", "all"):
        rows = etl_wb(cur, iso2_to_iso3, batch=args.batch)
        total_rows += rows
        conn.commit()

    elapsed = time.time() - start_time

    # Final stats
    cur.execute(f"SELECT COUNT(*) FROM {TABLE}")
    total_in_table = cur.fetchone()[0]
    cur.execute(f"SELECT COUNT(DISTINCT id) FROM {TABLE}")
    unique_indicators = cur.fetchone()[0]
    cur.execute(f"SELECT MIN(year), MAX(year) FROM {TABLE}")
    min_yr, max_yr = cur.fetchone()

    print(f"\n{'='*50}")
    print(f"Historical ETL Complete")
    print(f"  Rows upserted this run: {total_rows}")
    print(f"  Total rows in table: {total_in_table}")
    print(f"  Unique indicators: {unique_indicators}")
    print(f"  Year range: {min_yr}-{max_yr}")
    print(f"  Elapsed: {elapsed:.0f}s ({elapsed/60:.1f}m)")
    print(f"{'='*50}")

    conn.close()


if __name__ == "__main__":
    main()
