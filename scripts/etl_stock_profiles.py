#!/usr/bin/env python3
"""
Fetch sector + market cap for all tracked stocks via Yahoo Finance.
Stores in sotw_stock_profiles table AND writes static JSON fallback.
Run weekly via cron.
"""

import json
import os
import time
import psycopg2

try:
    import yfinance as yf
except ImportError:
    print("ERROR: pip install yfinance")
    exit(1)

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "db.seyrycaldytfjvvkqopu.supabase.co")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")
DB = dict(
    host=DB_HOST, port=int(os.environ.get("SUPABASE_DB_PORT", "5432")), dbname="postgres",
    user=os.environ.get("SUPABASE_DB_USER", "postgres"), password=DB_PASS, sslmode="require",
)

PROFILES_TABLE = "sotw_stock_profiles"

SP500 = [
    "A","AAPL","ABBV","ABNB","ABT","ACGL","ACN","ADBE","ADI","ADM","ADP","ADSK","AEE","AEP","AES",
    "AFL","AIG","AIZ","AJG","AKAM","ALB","ALGN","ALL","ALLE","AMAT","AMCR","AMD","AME","AMGN","AMP",
    "AMT","AMZN","ANET","AON","AOS","APA","APD","APH","APO","APP","APTV","ARE","ARES","ATO","AVB",
    "AVGO","AVY","AWK","AXON","AXP","AZO","BA","BAC","BALL","BAX","BBY","BDX","BEN","BF.B","BG",
    "BIIB","BK","BKNG","BKR","BLDR","BLK","BMY","BR","BRK.B","BRO","BSX","BX","BXP","C","CAG",
    "CAH","CARR","CAT","CB","CBOE","CBRE","CCI","CCL","CDNS","CDW","CEG","CF","CFG","CHD","CHRW",
    "CHTR","CI","CIEN","CINF","CL","CLX","CMCSA","CME","CMG","CMI","CMS","CNC","CNP","COF","COHR",
    "COIN","COO","COP","COR","COST","CPAY","CPB","CPRT","CPT","CRH","CRL","CRM","CRWD","CSCO","CSGP",
    "CSX","CTAS","CTRA","CTSH","CTVA","CVNA","CVS","CVX","D","DAL","DASH","DD","DDOG","DE","DECK",
    "DELL","DG","DGX","DHI","DHR","DIS","DLR","DLTR","DOC","DOV","DOW","DPZ","DRI","DTE","DUK",
    "DVA","DVN","DXCM","EA","EBAY","ECL","ED","EFX","EG","EIX","EL","ELV","EME","EMR","EOG",
    "EPAM","EQIX","EQR","EQT","ERIE","ES","ESS","ETN","ETR","EVRG","EW","EXC","EXE","EXPD","EXPE",
    "EXR","F","FANG","FAST","FCX","FDS","FDX","FE","FFIV","FICO","FIS","FISV","FITB","FIX","FOX",
    "FOXA","FRT","FSLR","FTNT","FTV","GD","GDDY","GE","GEHC","GEN","GEV","GILD","GIS","GL","GLW",
    "GM","GNRC","GOOG","GOOGL","GPC","GPN","GRMN","GS","GWW","HAL","HAS","HBAN","HCA","HD","HIG",
    "HII","HLT","HOLX","HON","HOOD","HPE","HPQ","HRL","HSIC","HST","HSY","HUBB","HUM","HWM","IBKR",
    "IBM","ICE","IDXX","IEX","IFF","INCY","INTC","INTU","INVH","IP","IQV","IR","IRM","ISRG","IT",
    "ITW","IVZ","J","JBHT","JBL","JCI","JKHY","JNJ","JPM","KDP","KEY","KEYS","KHC","KIM","KKR",
    "KLAC","KMB","KMI","KO","KR","KVUE","L","LDOS","LEN","LH","LHX","LII","LIN","LITE","LLY",
    "LMT","LNT","LOW","LRCX","LULU","LUV","LVS","LYB","LYV","MA","MAA","MAR","MAS","MCD","MCHP",
    "MCK","MCO","MDLZ","MDT","MET","META","MGM","MKC","MLM","MMM","MNST","MO","MOS","MPC","MPWR",
    "MRK","MRNA","MRSH","MS","MSCI","MSFT","MSI","MTB","MTD","MU","NCLH","NDAQ","NDSN","NEE","NEM",
    "NFLX","NI","NKE","NOC","NOW","NRG","NSC","NTAP","NTRS","NUE","NVDA","NVR","NWS","NWSA","NXPI",
    "O","ODFL","OKE","OMC","ON","ORCL","ORLY","OTIS","OXY","PANW","PAYX","PCAR","PCG","PEG","PEP",
    "PFE","PFG","PG","PGR","PH","PHM","PKG","PLD","PLTR","PM","PNC","PNR","PNW","PODD","POOL",
    "PPG","PPL","PRU","PSA","PSKY","PSX","PTC","PWR","PYPL","Q","QCOM","RCL","REG","REGN","RF",
    "RJF","RL","RMD","ROK","ROL","ROP","ROST","RSG","RTX","RVTY","SATS","SBAC","SBUX","SCHW","SHW",
    "SJM","SLB","SMCI","SNA","SNDK","SNPS","SO","SOLV","SPG","SPGI","SRE","STE","STLD","STT","STX",
    "STZ","SW","SWK","SWKS","SYF","SYK","SYY","T","TAP","TDG","TDY","TECH","TEL","TER","TFC",
    "TGT","TJX","TKO","TMO","TMUS","TPL","TPR","TRGP","TRMB","TROW","TRV","TSCO","TSLA","TSN","TT",
    "TTD","TTWO","TXN","TXT","TYL","UAL","UBER","UDR","UHS","ULTA","UNH","UNP","UPS","URI","USB",
    "V","VICI","VLO","VLTO","VMC","VRSK","VRSN","VRT","VRTX","VST","VTR","VTRS","VZ","WAB","WAT",
    "WBD","WDAY","WDC","WEC","WELL","WFC","WM","WMB","WMT","WRB","WSM","WST","WTW","WY","WYNN",
    "XEL","XOM","XYL","XYZ","YUM","ZBH","ZBRA","ZTS",
]

NASDAQ100 = [
    "AAPL","ABNB","ADBE","ADI","ADP","ADSK","AEP","AMAT","AMD","AMGN","AMZN","ANSS","APP","ARM","ASML",
    "AVGO","AZN","BIIB","BKNG","BKR","CCEP","CDNS","CDW","CEG","CHTR","CMCSA","COST","CPRT","CRWD","CSCO",
    "CSGP","CTAS","CTSH","DASH","DDOG","DLTR","DXCM","EA","EXC","FANG","FAST","FTNT","GEHC","GFS","GILD",
    "GOOG","GOOGL","HON","IDXX","ILMN","INTC","INTU","ISRG","KDP","KHC","KLAC","LIN","LRCX","LULU","MAR",
    "MCHP","MDB","MDLZ","MELI","META","MNST","MRNA","MRVL","MSFT","MU","NFLX","NVDA","NXPI","ODFL","ON",
    "ORLY","PANW","PAYX","PCAR","PDD","PEP","PYPL","QCOM","REGN","ROST","SBUX","SMCI","SNPS","TEAM","TMUS",
    "TSLA","TTD","TTWO","TXN","VRSK","VRTX","WBD","WDAY","XEL","ZS",
]

TSX60 = [
    "ABX.TO","AEM.TO","ATD.TO","BAM.TO","BCE.TO","BMO.TO","BN.TO","BNS.TO","CAE.TO","CCL-B.TO","CCO.TO","CLS.TO","CM.TO","CNQ.TO","CNR.TO",
    "CP.TO","CSU.TO","CTC-A.TO","CVE.TO","DOL.TO","EMA.TO","ENB.TO","FFH.TO","FM.TO","FNV.TO","FSV.TO","FTS.TO","GFL.TO","GIB-A.TO","GIL.TO",
    "H.TO","IFC.TO","IMO.TO","K.TO","L.TO","MFC.TO","MG.TO","MRU.TO","NA.TO","NTR.TO","OTEX.TO","POW.TO","PPL.TO","QSR.TO","RCI-B.TO",
    "RY.TO","SAP.TO","SHOP.TO","SLF.TO","SU.TO","T.TO","TD.TO","TECK-B.TO","TOU.TO","TRI.TO","TRP.TO","WCN.TO","WN.TO","WPM.TO","WSP.TO",
]

FTSE100 = [
    "AAF.L","AAL.L","ABF.L","ADM.L","AHT.L","ANTO.L","AUTO.L","AV.L","AZN.L","BA.L","BARC.L","BATS.L","BEZ.L","BKG.L","BLND.L",
    "BME.L","BNZL.L","BP.L","BRBY.L","BT-A.L","CCH.L","CNA.L","CPG.L","CRDA.L","CRH.L","DCC.L","DGE.L","DPLM.L","EDV.L","ENT.L",
    "EXPN.L","FCIT.L","FERG.L","FLTR.L","FRAS.L","FRES.L","GLEN.L","GSK.L","HIK.L","HLMA.L","HLN.L","HSBA.L","IAG.L","ICG.L","IHG.L",
    "III.L","IMB.L","IMI.L","INF.L","ITRK.L","ITV.L","JD.L","KGF.L","LAND.L","LGEN.L","LLOY.L","LSEG.L","MNDI.L","MNG.L","MRO.L",
    "NG.L","NWG.L","NXT.L","OCDO.L","PHNX.L","PRU.L","PSH.L","PSN.L","PSON.L","REL.L","RIO.L","RKT.L","RMV.L","RR.L","RS1.L",
    "RTO.L","SAG.L","SBRY.L","SDR.L","SGE.L","SGRO.L","SHEL.L","SMIN.L","SMT.L","SN.L","SPX.L","SSE.L","STAN.L","STJ.L","SVT.L",
    "TSCO.L","TW.L","ULVR.L","UTG.L","UU.L","VOD.L","WEIR.L","WPP.L","WTB.L",
]

# Static JSON fallback path (relative to project root when running on server)
STATIC_JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "public", "data", "stock_profiles.json")


def ensure_table(conn):
    with conn.cursor() as cur:
        cur.execute(f"""
            CREATE TABLE IF NOT EXISTS {PROFILES_TABLE} (
                ticker TEXT PRIMARY KEY,
                sector TEXT,
                industry TEXT,
                market_cap BIGINT,
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        """)
        conn.commit()


def fetch_and_store():
    all_tickers = list(dict.fromkeys(SP500 + NASDAQ100 + TSX60 + FTSE100))
    print(f"Total unique tickers to fetch: {len(all_tickers)}")

    conn = psycopg2.connect(**DB)
    ensure_table(conn)

    total = 0
    errors = 0
    profiles_json = {}

    # Load existing static JSON to preserve previous data
    try:
        with open(STATIC_JSON_PATH) as f:
            profiles_json = json.load(f)
        print(f"Loaded {len(profiles_json)} existing static profiles")
    except Exception:
        pass

    batch_size = 50
    for i in range(0, len(all_tickers), batch_size):
        batch = all_tickers[i:i + batch_size]
        batch_num = i // batch_size + 1
        print(f"Batch {batch_num} ({len(batch)} tickers: {batch[0]}..{batch[-1]})...")

        for ticker in batch:
            try:
                t = yf.Ticker(ticker)
                info = t.info
                sector = info.get('sector', '')
                industry = info.get('industry', '')
                market_cap = info.get('marketCap', 0)

                if sector or market_cap:
                    # Store in DB
                    with conn.cursor() as cur:
                        cur.execute(f"""
                            INSERT INTO {PROFILES_TABLE} (ticker, sector, industry, market_cap, updated_at)
                            VALUES (%s, %s, %s, %s, NOW())
                            ON CONFLICT (ticker) DO UPDATE SET
                                sector = EXCLUDED.sector,
                                industry = EXCLUDED.industry,
                                market_cap = EXCLUDED.market_cap,
                                updated_at = NOW()
                        """, (ticker, sector, industry, market_cap))

                    # Also store in static JSON
                    profiles_json[ticker] = {
                        "sector": sector or "Other",
                        "industry": industry or "",
                        "marketCap": market_cap or 0
                    }
                    total += 1
                else:
                    print(f"  {ticker}: no data")
                    errors += 1
            except Exception as e:
                print(f"  {ticker}: {e}")
                errors += 1

            time.sleep(0.3)  # Rate limiting

        conn.commit()

        # Save static JSON after each batch (incremental save)
        try:
            sorted_profiles = dict(sorted(profiles_json.items(), key=lambda x: x[1]["marketCap"], reverse=True))
            with open(STATIC_JSON_PATH, "w") as f:
                json.dump(sorted_profiles, f, indent=2)
        except Exception:
            pass

        print(f"  {total} stored, {errors} errors")

    conn.close()

    # Final save
    sorted_profiles = dict(sorted(profiles_json.items(), key=lambda x: x[1]["marketCap"], reverse=True))
    with open(STATIC_JSON_PATH, "w") as f:
        json.dump(sorted_profiles, f, indent=2)

    print(f"\nDone: {total} profiles in DB, {len(profiles_json)} in static JSON, {errors} errors")


if __name__ == "__main__":
    if not DB_PASS:
        print("ERROR: set SUPABASE_DB_PASSWORD")
        exit(1)
    fetch_and_store()
