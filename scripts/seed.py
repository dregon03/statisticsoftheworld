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
    password="F4k4klzaLrAJCzev", sslmode="require",
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

# World Bank indicators (all non-IMF ones from data.ts)
WB_INDICATORS = [
    "NY.GNP.MKTP.CD","NY.GNP.PCAP.CD","NY.GNP.PCAP.PP.CD",
    "NV.IND.TOTL.ZS","NV.SRV.TOTL.ZS","NV.AGR.TOTL.ZS",
    "NE.CON.GOVT.ZS","NE.CON.PRVT.ZS","NE.GDI.TOTL.ZS",
    "NY.GNS.ICTR.ZS","NY.GDP.DEFL.KD.ZG","SL.GDP.PCAP.EM.KD",
    "NV.IND.MANF.ZS","NY.ADJ.NNTY.PC.CD","NY.ADJ.SVNG.GN.ZS",
    "NY.GDP.TOTL.RT.ZS","NY.GDP.PETR.RT.ZS","NV.IND.TOTL.CD",
    "FP.CPI.TOTL.ZG","FR.INR.RINR","FR.INR.LEND","FR.INR.DPST",
    "GC.DOD.TOTL.GD.ZS","GC.REV.XGRT.GD.ZS","GC.XPN.TOTL.GD.ZS",
    "GC.TAX.TOTL.GD.ZS","FI.RES.TOTL.CD","PA.NUS.FCRF","FM.LBL.BMNY.GD.ZS",
    "NE.TRD.GNFS.ZS","NE.EXP.GNFS.ZS","NE.IMP.GNFS.ZS",
    "BX.KLT.DINV.WD.GD.ZS","BX.TRF.PWKR.CD.DT","TX.VAL.TECH.MF.ZS",
    "BN.CAB.XOKA.GD.ZS","DT.DOD.DECT.GN.ZS","DT.DOD.DECT.CD",
    "FS.AST.PRVT.GD.ZS","CM.MKT.LCAP.GD.ZS","FX.OWN.TOTL.ZS",
    "SP.POP.TOTL","SP.POP.GROW","EN.POP.DNST","AG.SRF.TOTL.K2",
    "SP.URB.TOTL.IN.ZS","SP.DYN.LE00.IN","SP.DYN.LE00.MA.IN","SP.DYN.LE00.FE.IN",
    "SP.DYN.TFRT.IN","SP.DYN.CBRT.IN","SP.DYN.CDRT.IN",
    "SP.POP.0014.TO.ZS","SP.POP.1564.TO.ZS","SP.POP.65UP.TO.ZS",
    "SL.TLF.TOTL.IN","SL.TLF.CACT.ZS","SL.UEM.TOTL.ZS","SL.UEM.1524.ZS",
    "SL.AGR.EMPL.ZS","SL.IND.EMPL.ZS","SL.SRV.EMPL.ZS",
    "SE.XPD.TOTL.GD.ZS","SE.ADT.LITR.ZS","SE.PRM.ENRR","SE.SEC.ENRR","SE.TER.ENRR",
    "SH.XPD.CHEX.GD.ZS","SH.XPD.CHEX.PC.CD","SH.MED.PHYS.ZS","SH.MED.BEDS.ZS",
    "SH.DYN.MORT","SH.STA.MMRT","SH.IMM.MEAS","SH.TBS.INCD",
    "SH.STA.SUIC.P5","SH.ALC.PCAP.LI",
    "EN.ATM.CO2E.PC","EN.ATM.CO2E.KT","EG.ELC.RNEW.ZS","EG.ELC.ACCS.ZS",
    "EN.ATM.PM25.MC.M3","AG.LND.FRST.ZS","SH.H2O.BASW.ZS",
    "AG.LND.AGRI.ZS","AG.YLD.CREL.KG","SN.ITK.DEFC.ZS",
    "IT.NET.USER.ZS","IT.CEL.SETS.P2","IT.NET.BBND.P2",
    "GB.XPD.RSDV.GD.ZS","IP.PAT.RESD","IP.JRN.ARTC.SC",
    "IS.AIR.PSGR","LP.LPI.OVRL.XQ",
    "SG.GEN.PARL.ZS","SP.ADO.TFRT",
    "CC.EST","GE.EST","PV.EST","RQ.EST","RL.EST","VA.EST",
    "MS.MIL.XPND.GD.ZS","MS.MIL.XPND.CD","MS.MIL.TOTL.P1",
    "SI.POV.DDAY","SI.POV.GINI","SI.DST.10TH.10",
    "ST.INT.ARVL","ST.INT.RCPT.CD",
    "HD.HCI.OVRL","HD.HCI.LAYS",
    "IC.BUS.EASE.XQ","IC.REG.DURS","IC.TAX.TOTL.CP.ZS",
    "VC.IHR.PSRC.P5",
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


def fetch_json(url):
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
    })
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read())


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


def seed_wb_indicator(cur, indicator_id):
    try:
        data = fetch_json(f"{WB}/country/all/indicator/{indicator_id}?format=json&mrv=1&per_page=300")
        if not data[1]:
            return 0
    except Exception as e:
        print(f"  SKIP {indicator_id}: {e}")
        return 0

    count = 0
    for d in data[1]:
        cid = d["country"]["id"]
        if cid in WB_AGGREGATES or d["value"] is None:
            continue
        # Skip if country not in our table (handles 2-letter vs 3-letter mismatch)
        cur.execute("SELECT 1 FROM sotw_countries WHERE id = %s", (cid,))
        if not cur.fetchone():
            continue
        cur.execute("""
            INSERT INTO sotw_indicators (id, country_id, value, year, source)
            VALUES (%s, %s, %s, %s, 'wb')
            ON CONFLICT (id, country_id) DO UPDATE SET
                value = EXCLUDED.value, year = EXCLUDED.year, updated_at = NOW()
        """, (indicator_id, cid, d["value"], int(d["date"])))
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

    print("Seeding World Bank indicators...")
    total = 0
    for i, ind_id in enumerate(WB_INDICATORS):
        count = seed_wb_indicator(cur, ind_id)
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
