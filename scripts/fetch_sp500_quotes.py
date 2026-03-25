#!/usr/bin/env python3
"""
Fetch live quotes for major stock indices via Yahoo Finance batch download.

Covers: S&P 500, Nasdaq 100, Russell 1000 (top ~500 beyond S&P), TSX 60, FTSE 100
~1,200 unique tickers, fetched in one yf.download() call (~15-20 seconds).
Stores as YF.STOCK.{TICKER} in sotw_live_quotes.

Modes:
  --once     Single fetch (default)
  --loop     Continuous loop every 30 seconds
"""

import argparse
import datetime
import os
import time
import io
import contextlib
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

QUOTES_TABLE = "sotw_live_quotes"

# ═══════════════════════════════════════════════════════════
# TICKER LISTS BY INDEX
# ═══════════════════════════════════════════════════════════

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
    "EL","EMN","EMR","ENPH","EOG","EPAM","EQIX","EQR","EQT","ESS","ETN","ETR","EVRG","EW",
    "EXC","EXPD","EXPE","EXR","F","FANG","FAST","FBHS","FCX","FDS","FDX","FE","FFIV","FIS","FISV",
    "FITB","FLT","FMC","FOX","FOXA","FRC","FRT","FTNT","FTV","GD","GE","GILD","GIS","GL","GLW",
    "GM","GNRC","GOOG","GOOGL","GPC","GPN","GRMN","GS","GWW","HAL","HAS","HBAN","HCA","HD","HOLX",
    "HON","HPE","HPQ","HRL","HSIC","HST","HSY","HUM","HWM","IBM","ICE","IDXX","IEX","IFF","ILMN",
    "INCY","INTC","INTU","INVH","IP","IPG","IQV","IR","IRM","ISRG","IT","ITW","IVZ","J","JBHT",
    "JCI","JKHY","JNJ","JNPR","JPM","K","KDP","KEY","KEYS","KHC","KIM","KLAC","KMB","KMI","KMX",
    "KO","KR","L","LDOS","LEN","LH","LHX","LIN","LKQ","LLY","LMT","LNC","LNT","LOW","LRCX",
    "LUMN","LUV","LVS","LW","LYB","LYV","MA","MAA","MAR","MAS","MCD","MCHP","MCK","MCO","MDLZ",
    "MDT","MET","META","MGM","MHK","MKC","MKTX","MLM","MMC","MMM","MNST","MO","MOH","MOS","MPC",
    "MPWR","MRK","MRNA","MRO","MS","MSCI","MSFT","MSI","MTB","MTCH","MTD","MU","NCLH","NDAQ",
    "NDSN","NEE","NEM","NFLX","NI","NKE","NOC","NOW","NRG","NSC","NTAP","NTRS","NUE","NVDA",
    "NVR","NWL","NWS","NWSA","NXPI","O","ODFL","OGN","OKE","OMC","ON","ORCL","ORLY","OTIS","OXY",
    "PARA","PAYC","PAYX","PCAR","PCG","PEAK","PEG","PEP","PFE","PFG","PG","PGR","PH","PHM","PKG",
    "PKI","PLD","PM","PNC","PNR","PNW","POOL","PPG","PPL","PRU","PSA","PSX","PTC","PVH","PWR",
    "PXD","PYPL","QCOM","QRVO","RCL","RE","REG","REGN","RF","RHI","RJF","RL","RMD","ROK","ROL",
    "ROP","ROST","RSG","RTX","SBAC","SBNY","SBUX","SCHW","SEE","SHW","SIVB","SJM","SLB","SNA",
    "SNPS","SO","SPG","SPGI","SRE","STE","STT","STX","STZ","SWK","SWKS","SYF","SYK","SYY",
    "T","TAP","TDG","TDY","TECH","TEL","TER","TFC","TFX","TGT","TJX","TMO","TMUS","TPR","TRGP",
    "TRMB","TROW","TRV","TSCO","TSLA","TSN","TT","TTWO","TXN","TXT","TYL","UAL","UDR","UHS",
    "ULTA","UNH","UNP","UPS","URI","USB","V","VFC","VICI","VLO","VMC","VNO","VRSK","VRSN","VRTX",
    "VTR","VTRS","VZ","WAB","WAT","WBA","WBD","WDC","WEC","WELL","WFC","WHR","WM","WMB","WMT",
    "WRB","WRK","WST","WTW","WY","WYNN","XEL","XOM","XRAY","XYL","YUM","ZBH","ZBRA","ZION","ZTS",
]

NASDAQ100 = [
    "AAPL","ABNB","ADBE","ADI","ADP","ADSK","AEP","AMAT","AMD","AMGN","AMZN","ANSS","APP","ARM",
    "ASML","AVGO","AZN","BIIB","BKNG","BKR","CCEP","CDNS","CDW","CEG","CHTR","CMCSA","COST",
    "CPRT","CRWD","CSCO","CSGP","CTAS","CTSH","DASH","DDOG","DLTR","DXCM","EA","EXC","FANG",
    "FAST","FTNT","GEHC","GFS","GILD","GOOG","GOOGL","HON","IDXX","ILMN","INTC","INTU","ISRG",
    "KDP","KHC","KLAC","LIN","LRCX","LULU","MAR","MCHP","MDB","MDLZ","MELI","META","MNST",
    "MRNA","MRVL","MSFT","MU","NFLX","NVDA","NXPI","ODFL","ON","ORLY","PANW","PAYX","PCAR",
    "PDD","PEP","PYPL","QCOM","REGN","ROST","SBUX","SMCI","SNPS","SPLK","TEAM","TMUS","TSLA",
    "TTD","TTWO","TXN","VRSK","VRTX","WBD","WDAY","XEL","ZS",
]

TSX60 = [
    "RY.TO","TD.TO","BNS.TO","BMO.TO","CM.TO","ENB.TO","CNR.TO","CP.TO","TRP.TO","SU.TO",
    "CNQ.TO","MFC.TO","SLF.TO","BCE.TO","T.TO","ABX.TO","NTR.TO","FNV.TO","CSU.TO","SHOP.TO",
    "ATD.TO","WCN.TO","IFC.TO","QSR.TO","DOL.TO","SAP.TO","GIB-A.TO","WSP.TO","CCO.TO","TRI.TO",
    "BAM.TO","BN.TO","POW.TO","FFH.TO","GWO.TO","IAG.TO","NA.TO","EMA.TO","FTS.TO","AQN.TO",
    "H.TO","MG.TO","L.TO","CTC-A.TO","WPM.TO","AEM.TO","K.TO","FM.TO","IMO.TO","CVE.TO",
    "HSE.TO","PPL.TO","IPL.TO","KEY.TO","GFL.TO","TFII.TO","STN.TO","OTEX.TO","BB.TO","LSPD.TO",
]

FTSE100 = [
    "III.L","ADM.L","AAF.L","AAL.L","ANTO.L","AHT.L","ABF.L","AZN.L","AUTO.L","AVV.L",
    "AV.L","BME.L","BA.L","BARC.L","BDEV.L","BEZ.L","BKG.L","BP.L","BATS.L","BLND.L",
    "BT-A.L","BNZL.L","BRBY.L","CCH.L","CPG.L","CNA.L","CRH.L","CRDA.L","DCC.L","DGE.L",
    "DPLM.L","EDV.L","ENT.L","EXPN.L","FCIT.L","FRAS.L","FRES.L","GLEN.L","GSK.L","HLN.L",
    "HLMA.L","HSBA.L","IHG.L","III.L","IMB.L","INF.L","ITV.L","JD.L","KGF.L","LAND.L",
    "LGEN.L","LLOY.L","LSEG.L","MNG.L","MRO.L","MNDI.L","NG.L","NWG.L","NXT.L","OCDO.L",
    "PSON.L","PSH.L","PSN.L","PHNX.L","PRU.L","RKT.L","REL.L","RIO.L","RMV.L","RR.L",
    "RS1.L","RTO.L","SAG.L","SBRY.L","SDR.L","SGE.L","SGRO.L","SHEL.L","SJP.L","SKG.L",
    "SMDS.L","SMIN.L","SMT.L","SN.L","SPX.L","SSE.L","STAN.L","STJ.L","SVT.L","TSCO.L",
    "TW.L","ULVR.L","UTG.L","UU.L","VOD.L","WEIR.L","WPP.L","WTB.L",
]

# All indices and their tickers
INDICES = {
    "sp500": SP500,
    "nasdaq100": NASDAQ100,
    "tsx60": TSX60,
    "ftse100": FTSE100,
}


def get_all_unique_tickers():
    """Combine all index tickers, deduplicated."""
    all_tickers = set()
    for tickers in INDICES.values():
        all_tickers.update(tickers)
    return sorted(all_tickers)


def fetch_once(conn):
    """Batch fetch all stock quotes using yf.download()."""
    cur = conn.cursor()
    all_tickers = get_all_unique_tickers()
    count = 0

    try:
        with contextlib.redirect_stderr(io.StringIO()):
            data = yf.download(all_tickers, period="2d", group_by="ticker", progress=False, threads=True)

        if data.empty:
            return 0, 0

        for symbol in all_tickers:
            try:
                if len(all_tickers) == 1:
                    ticker_data = data
                elif symbol not in data.columns.get_level_values(0):
                    continue
                else:
                    ticker_data = data[symbol]

                if ticker_data.empty or len(ticker_data) < 1:
                    continue

                # Get latest close and previous close
                closes = ticker_data["Close"].dropna()
                if len(closes) < 1:
                    continue

                price = float(closes.iloc[-1])
                prev = float(closes.iloc[-2]) if len(closes) >= 2 else price

                if price <= 0:
                    continue

                change = price - prev
                change_pct = ((price / prev) - 1) * 100 if prev > 0 else 0

                sotw_id = f"YF.STOCK.{symbol}"

                cur.execute(f"""
                    INSERT INTO {QUOTES_TABLE} (id, label, price, previous_close, change, change_pct, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, NOW())
                    ON CONFLICT (id) DO UPDATE SET
                        price = EXCLUDED.price,
                        previous_close = EXCLUDED.previous_close,
                        change = EXCLUDED.change,
                        change_pct = EXCLUDED.change_pct,
                        updated_at = NOW()
                """, (sotw_id, symbol, round(price, 4), round(prev, 4), round(change, 4), round(change_pct, 4)))
                count += 1
            except Exception:
                pass

        conn.commit()
    except Exception as e:
        print(f"  Download error: {e}", flush=True)
        return 0, 1

    return count, 0


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--loop", action="store_true")
    parser.add_argument("--interval", type=int, default=30)
    args = parser.parse_args()

    conn = psycopg2.connect(**DB)
    cur = conn.cursor()
    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS {QUOTES_TABLE} (
            id TEXT PRIMARY KEY, label TEXT,
            price DOUBLE PRECISION, previous_close DOUBLE PRECISION,
            change DOUBLE PRECISION, change_pct DOUBLE PRECISION,
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)
    conn.commit()

    unique = get_all_unique_tickers()
    print(f"Tracking {len(unique)} unique tickers across {len(INDICES)} indices", flush=True)
    for name, tickers in INDICES.items():
        print(f"  {name}: {len(tickers)} tickers", flush=True)

    if not args.loop:
        count, errors = fetch_once(conn)
        print(f"Updated {count} stock quotes")
        conn.close()
        return

    print(f"=== Stock quotes loop (every {args.interval}s) ===", flush=True)
    iteration = 0
    max_runtime = 5.5 * 3600
    start_time = time.time()

    while True:
        if time.time() - start_time >= max_runtime:
            print(f"\nMax runtime reached. Stopping.", flush=True)
            break

        now = datetime.datetime.utcnow()
        start = time.time()
        try:
            count, errors = fetch_once(conn)
            iteration += 1
            elapsed = time.time() - start
            print(f"  [{now.strftime('%H:%M:%S')}] #{iteration}: {count} stocks in {elapsed:.1f}s", flush=True)
        except Exception as e:
            print(f"  [{now.strftime('%H:%M:%S')}] Error: {e}", flush=True)
            try:
                conn.close()
            except Exception:
                pass
            time.sleep(5)
            try:
                conn = psycopg2.connect(**DB)
            except Exception:
                time.sleep(30)
                continue

        elapsed = time.time() - start
        sleep_time = max(0, args.interval - elapsed)
        if sleep_time > 0:
            time.sleep(sleep_time)

    conn.close()
    print(f"=== Done: {iteration} iterations ===", flush=True)


if __name__ == "__main__":
    main()
