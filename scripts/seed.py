"""
Seed SOTW tables with data from World Bank + IMF APIs.
Run weekly to keep data fresh.
"""

import json
import time
import psycopg2
import urllib.request

DB = dict(
    host="db.seyrycaldytfjvvkqopu.supabase.co",
    port=5432, dbname="postgres", user="postgres",
    password="", sslmode="require",
    options="-c statement_timeout=0",
)

WB = "https://api.worldbank.org/v2"

# IMF indicators to fetch
IMF_INDICATORS = {
    "IMF.NGDPD": "NGDPD",
    "IMF.NGDP_RPCH": "NGDP_RPCH",
    "IMF.NGDPDPC": "NGDPDPC",
    "IMF.PPPGDP": "PPPGDP",
    "IMF.PPPPC": "PPPPC",
    "IMF.PPPSH": "PPPSH",
    "IMF.PCPIPCH": "PCPIPCH",
    "IMF.GGXWDG_NGDP": "GGXWDG_NGDP",
    "IMF.GGXCNL_NGDP": "GGXCNL_NGDP",
    "IMF.BCA_NGDPD": "BCA_NGDPD",
    "IMF.NI_GDP": "NI_GDP",
    "IMF.NGS_GDP": "NGS_GDP",
    "IMF.LUR": "LUR",
}

# World Bank indicators — all 307 non-IMF indicators from data.ts
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


def fetch_json(url, retries=3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json",
            })
            with urllib.request.urlopen(req, timeout=60) as resp:
                return json.loads(resp.read())
        except Exception as e:
            if attempt < retries - 1:
                wait = 2 ** attempt
                print(f"  Retry {attempt + 1}/{retries - 1} for {url[:80]}... (waiting {wait}s): {e}")
                time.sleep(wait)
            else:
                raise


def seed_countries(cur):
    print("Seeding countries...")
    data = fetch_json(f"{WB}/country?format=json&per_page=300")
    countries = [c for c in data[1] if c["region"]["id"] != "NA"]

    for c in countries:
        cur.execute("""
            INSERT INTO sotw_countries (id, name, region, income_level, capital_city, longitude, latitude)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name, region = EXCLUDED.region,
                income_level = EXCLUDED.income_level, capital_city = EXCLUDED.capital_city,
                updated_at = NOW()
        """, (c["id"], c["name"], c["region"]["value"], c["incomeLevel"]["value"],
              c["capitalCity"],
              float(c["longitude"]) if c["longitude"] else None,
              float(c["latitude"]) if c["latitude"] else None))

    print(f"  {len(countries)} countries upserted")


def build_iso2_to_iso3():
    """WB indicator API returns 2-letter codes, but our DB uses 3-letter codes."""
    data = fetch_json(f"{WB}/country?format=json&per_page=300")
    mapping = {}
    for c in data[1]:
        if c["region"]["id"] != "NA":
            mapping[c["iso2Code"]] = c["id"]  # e.g. "US" -> "USA"
    return mapping


def seed_wb_indicator(cur, indicator_id, iso2_to_iso3):
    try:
        # Fetch last 5 years of data to maximize coverage (mrv=1 misses countries with slightly older data)
        pages_data = []
        for page in [1, 2]:
            data = fetch_json(f"{WB}/country/all/indicator/{indicator_id}?format=json&mrv=5&per_page=500&page={page}")
            if data[1]:
                pages_data.extend(data[1])
            if not data[0] or data[0].get("pages", 1) <= page:
                break
    except Exception as e:
        print(f"  SKIP {indicator_id}: {e}")
        return 0

    if not pages_data:
        return 0

    # Keep only the most recent value per country
    best: dict = {}  # iso3 -> (value, year)
    for d in pages_data:
        iso2 = d["country"]["id"]
        if iso2 in WB_AGGREGATES or d["value"] is None:
            continue
        iso3 = iso2_to_iso3.get(iso2)
        if not iso3:
            continue
        year = int(d["date"])
        if iso3 not in best or year > best[iso3][1]:
            best[iso3] = (d["value"], year)

    count = 0
    for iso3, (value, year) in best.items():
        cur.execute("""
            INSERT INTO sotw_indicators (id, country_id, value, year, source)
            VALUES (%s, %s, %s, %s, 'wb')
            ON CONFLICT (id, country_id) DO UPDATE SET
                value = EXCLUDED.value, year = EXCLUDED.year, updated_at = NOW()
        """, (indicator_id, iso3, value, year))
        count += 1
    return count


def seed_imf_indicators(cur):
    print("Seeding IMF indicators...")
    import datetime
    year = datetime.datetime.now().year

    # Get valid country IDs from our DB
    cur.execute("SELECT id FROM sotw_countries")
    valid_countries = {r[0] for r in cur.fetchall()}

    for sotw_id, imf_id in IMF_INDICATORS.items():
        try:
            data = fetch_json(f"https://www.imf.org/external/datamapper/api/v1/{imf_id}?periods={year},{year-1},{year-2}")
            values = data.get("values", {}).get(imf_id, {})
        except Exception as e:
            print(f"  SKIP {sotw_id}: {e}")
            continue

        count = 0
        for country_code, year_data in values.items():
            if country_code not in valid_countries:
                continue
            for yr in [year, year - 1, year - 2]:
                val = year_data.get(str(yr))
                if val is not None:
                    cur.execute("""
                        INSERT INTO sotw_indicators (id, country_id, value, year, source)
                        VALUES (%s, %s, %s, %s, 'imf')
                        ON CONFLICT (id, country_id) DO UPDATE SET
                            value = EXCLUDED.value, year = EXCLUDED.year, updated_at = NOW()
                    """, (sotw_id, country_code, val, yr))
                    count += 1
                    break

        print(f"  {sotw_id}: {count} countries")
        time.sleep(1)


def main():
    conn = psycopg2.connect(**DB)
    cur = conn.cursor()

    seed_countries(cur)
    conn.commit()

    seed_imf_indicators(cur)
    conn.commit()

    print("Building ISO2->ISO3 mapping...")
    iso2_to_iso3 = build_iso2_to_iso3()
    print(f"  {len(iso2_to_iso3)} country mappings")

    print("Seeding World Bank indicators...")
    total = 0
    for i, ind_id in enumerate(WB_INDICATORS):
        count = seed_wb_indicator(cur, ind_id, iso2_to_iso3)
        total += count
        if (i + 1) % 10 == 0:
            conn.commit()
            print(f"  Progress: {i+1}/{len(WB_INDICATORS)} indicators, {total} data points")
        time.sleep(0.5)

    conn.commit()

    cur.execute("SELECT COUNT(*) FROM sotw_countries")
    print(f"\nDone! Countries: {cur.fetchone()[0]}")
    cur.execute("SELECT COUNT(*) FROM sotw_indicators")
    print(f"Data points: {cur.fetchone()[0]}")
    cur.execute("SELECT COUNT(DISTINCT id) FROM sotw_indicators")
    print(f"Unique indicators with data: {cur.fetchone()[0]}")

    conn.close()


if __name__ == "__main__":
    main()
