#!/usr/bin/env python3
"""
Fetch sector + market cap for all tracked stocks via Yahoo Finance.
Stores in sotw_stock_profiles table. Run weekly.
"""

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

# Import ticker lists from fetch_sp500_quotes
SP500 = [
    "AAPL","ABBV","ABT","ACN","ADBE","ADI","ADM","ADP","ADSK","AEE","AEP","AES","AFL","AIG","AIZ",
    "AJG","AKAM","ALB","ALGN","ALK","ALL","ALLE","AMAT","AMCR","AMD","AME","AMGN","AMP","AMT","AMZN",
    "ANET","ANSS","AON","AOS","APA","APD","APH","APTV","ARE","ATO","ATVI","AVB","AVGO","AVY","AWK",
    "AXP","AZO","BA","BAC","BAX","BBWI","BBY","BDX","BEN","BF.B","BIIB","BIO","BK","BKNG","BKR",
    "BLK","BMY","BR","BRK.B","BRO","BSX","BWA","BXP","C","CAG","CAH","CARR","CAT","CB","CBOE",
    "CBRE","CCI","CCL","CDAY","CDNS","CDW","CE","CEG","CF","CFG","CHD","CHRW","CHTR","CI","CINF",
    "CL","CLX","CMA","CMCSA","CME","CMG","CMI","CMS","CNC","CNP","COF","COO","COP","COST","CPB",
    "CPRT","CPT","CRL","CRM","CSCO","CSGP","CSX","CTAS","CTLT","CTRA","CTSH","CTVA","CVS","CVX",
    "CZR","D","DAL","DD","DE","DFS","DG","DGX","DHI","DHR","DIS","DISH","DLR","DLTR","DOV",
    "DOW","DPZ","DRI","DTE","DUK","DVA","DVN","DXC","DXCM","EA","EBAY","ECL","ED","EFX","EIX",
    "EL","EMN","EMR","ENPH","EOG","EPAM","EQIX","EQR","EQT","ESS","ETN","ETR","EVRG","EW","EXC",
    "EXPD","EXPE","EXR","F","FANG","FAST","FBHS","FCX","FDS","FDX","FE","FFIV","FIS","FISV",
    "FITB","FLT","FMC","FOX","FOXA","FRC","FRT","FTNT","FTV","GD","GE","GILD","GIS","GL","GLW",
    "GM","GNRC","GOOG","GOOGL","GPC","GPN","GRMN","GS","GWW","HAL","HAS","HBAN","HCA","HD",
    "HOLX","HON","HPE","HPQ","HRL","HSIC","HST","HSY","HUM","HWM","IBM","ICE","IDXX","IEX",
    "IFF","ILMN","INCY","INTC","INTU","INVH","IP","IPG","IQV","IR","IRM","ISRG","IT","ITW",
    "IVZ","J","JBHT","JCI","JKHY","JNJ","JNPR","JPM","K","KDP","KEY","KEYS","KHC","KIM",
    "KLAC","KMB","KMI","KMX","KO","KR","L","LDOS","LEN","LH","LHX","LIN","LKQ","LLY",
    "LMT","LNC","LNT","LOW","LRCX","LUMN","LUV","LVS","LW","LYB","LYV","MA","MAA","MAR",
    "MAS","MCD","MCHP","MCK","MCO","MDLZ","MDT","MET","META","MGM","MHK","MKC","MKTX",
    "MLM","MMC","MMM","MNST","MO","MOH","MOS","MPC","MPWR","MRK","MRNA","MRO","MS","MSCI",
    "MSFT","MSI","MTB","MTCH","MTD","MU","NCLH","NDAQ","NDSN","NEE","NEM","NFLX","NI","NKE",
    "NOC","NOW","NRG","NSC","NTAP","NTRS","NUE","NVDA","NVR","NWL","NWS","NWSA","NXPI","O",
    "ODFL","OGN","OKE","OMC","ON","ORCL","ORLY","OTIS","OXY","PARA","PAYC","PAYX","PCAR",
    "PCG","PEAK","PEG","PEP","PFE","PFG","PG","PGR","PH","PHM","PKG","PKI","PLD","PM",
    "PNC","PNR","PNW","POOL","PPG","PPL","PRU","PSA","PSX","PTC","PVH","PWR","PXD","PYPL",
    "QCOM","QRVO","RCL","RE","REG","REGN","RF","RHI","RJF","RL","RMD","ROK","ROL","ROP",
    "ROST","RSG","RTX","SBAC","SBNY","SBUX","SCHW","SEE","SHW","SIVB","SJM","SLB","SNA",
    "SNPS","SO","SPG","SPGI","SRE","STE","STT","STX","STZ","SWK","SWKS","SYF","SYK","SYY",
    "T","TAP","TDG","TDY","TECH","TEL","TER","TFC","TFX","TGT","TMO","TMUS","TPR","TRGP",
    "TRMB","TROW","TRV","TSCO","TSLA","TSN","TT","TTWO","TXN","TXT","TYL","UAL","UDR",
    "UHS","ULTA","UNH","UNP","UPS","URI","USB","V","VFC","VICI","VLO","VMC","VNO","VRSK",
    "VRSN","VRTX","VTR","VTRS","VZ","WAB","WAT","WBA","WBD","WDC","WEC","WELL","WFC",
    "WHR","WM","WMB","WMT","WRB","WRK","WST","WTW","WY","WYNN","XEL","XOM","XRAY","XYL",
    "YUM","ZBH","ZBRA","ZION","ZTS",
]

NASDAQ100 = [
    "AAPL","ABNB","ADBE","ADI","ADP","ADSK","AEP","AMAT","AMGN","AMZN","ANSS","ARM","ASML",
    "ATVI","AVGO","AZN","BIIB","BKNG","BKR","CDNS","CEG","CHTR","CMCSA","COST","CPRT","CRWD",
    "CSCO","CSGP","CSX","CTAS","CTSH","DASH","DDOG","DLTR","DXCM","EA","EBAY","ENPH","EXC",
    "FANG","FAST","FTNT","GILD","GFS","GOOG","GOOGL","HON","IDXX","ILMN","INTC","INTU","ISRG",
    "KDP","KHC","KLAC","LRCX","LULU","MAR","MCHP","MDB","MDLZ","MELI","META","MNST","MRNA",
    "MRVL","MSFT","MU","NFLX","NVDA","NXPI","ODFL","ON","ORLY","PANW","PAYX","PCAR","PDD",
    "PEP","PYPL","QCOM","REGN","RIVN","ROST","SBUX","SIRI","SNPS","TEAM","TMUS","TSLA",
    "TTD","TTWO","TXN","VRSK","VRTX","WBA","WBD","WDAY","XEL","ZM","ZS",
]

TSX60 = [
    "ABX.TO","AEM.TO","ATD.TO","BAM.TO","BCE.TO","BMO.TO","BN.TO","BNS.TO","CAR-UN.TO",
    "CCO.TO","CM.TO","CNQ.TO","CNR.TO","CP.TO","CSU.TO","CVE.TO","DOL.TO","EMA.TO","ENB.TO",
    "FM.TO","FNV.TO","FTS.TO","GIB-A.TO","GWO.TO","H.TO","IFC.TO","IMO.TO","K.TO","L.TO",
    "MFC.TO","MG.TO","MRU.TO","NA.TO","NTR.TO","OTEX.TO","QSR.TO","RCI-B.TO","RY.TO","SAP.TO",
    "SLF.TO","SNC.TO","SU.TO","T.TO","TD.TO","TFII.TO","TOU.TO","TRI.TO","TRP.TO","WCN.TO",
    "WFG.TO","WN.TO","WSP.TO",
]

FTSE100 = [
    "AAL.L","ABF.L","ADM.L","AHT.L","ANTO.L","AUTO.L","AV.L","AVST.L","AZN.L","BA.L",
    "BARC.L","BATS.L","BKG.L","BNZL.L","BP.L","BRBY.L","BT-A.L","CCH.L","CNA.L","CPG.L",
    "CRDA.L","CRH.L","DCC.L","DGE.L","EDV.L","ENT.L","EXPN.L","FERG.L","FLTR.L","FRES.L",
    "GLEN.L","GSK.L","HIK.L","HL.L","HLMA.L","HSBA.L","IAG.L","IHG.L","III.L","IMB.L",
    "INF.L","ITRK.L","JD.L","KGF.L","LAND.L","LGEN.L","LLOY.L","LSEG.L","MNG.L","MNDI.L",
    "MRO.L","NG.L","NWG.L","NXT.L","PHNX.L","PRU.L","PSH.L","PSN.L","PSON.L","REL.L",
    "RIO.L","RKT.L","RMV.L","RR.L","RS1.L","RTO.L","SBRY.L","SDR.L","SGE.L","SGRO.L",
    "SHEL.L","SKG.L","SMDS.L","SMIN.L","SMT.L","SN.L","SPX.L","SSE.L","STAN.L","STJ.L",
    "SVT.L","TSCO.L","TW.L","ULVR.L","UTG.L","UU.L","VOD.L","WEIR.L","WPP.L","WTB.L",
]


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
    all_tickers = list(set(SP500 + NASDAQ100 + [t.replace('.TO', '') for t in TSX60] + [t.replace('.L', '') for t in FTSE100]))
    # For treemap, we primarily need S&P 500 — others are bonus
    # Use yfinance Tickers to batch-fetch info

    conn = psycopg2.connect(**DB)
    ensure_table(conn)

    batch_size = 50
    total = 0

    for i in range(0, len(SP500), batch_size):
        batch = SP500[i:i + batch_size]
        print(f"Fetching batch {i // batch_size + 1} ({len(batch)} tickers)...")

        for ticker in batch:
            try:
                t = yf.Ticker(ticker)
                info = t.info
                sector = info.get('sector', '')
                industry = info.get('industry', '')
                market_cap = info.get('marketCap', 0)

                if sector or market_cap:
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
                    total += 1
            except Exception as e:
                print(f"  Error fetching {ticker}: {e}")

            time.sleep(0.2)  # Rate limiting

        conn.commit()
        print(f"  Committed batch, {total} profiles stored so far")

    conn.close()
    print(f"Done: {total} stock profiles stored")


if __name__ == "__main__":
    if not DB_PASS:
        print("ERROR: set SUPABASE_DB_PASSWORD")
        exit(1)
    fetch_and_store()
