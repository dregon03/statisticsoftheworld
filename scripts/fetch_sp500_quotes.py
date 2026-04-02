#!/usr/bin/env python3
"""
Fetch live quotes for major stock indices via yfinance.

Covers: S&P 500, Nasdaq 100, TSX 60, FTSE 100
~660 unique tickers, fetched via yfinance.download() in batches.
Stores as YF.STOCK.{TICKER} in sotw_live_quotes.

Modes:
  --once     Single fetch (default)
  --loop     Continuous loop (default 30s for near real-time during market hours)

Requirements: pip install yfinance psycopg2-binary
"""

import argparse
import datetime
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

QUOTES_TABLE = "sotw_live_quotes"

# ═══════════════════════════════════════════════════════════
# TICKER LISTS BY INDEX
# ═══════════════════════════════════════════════════════════

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

INDICES = {
    "sp500": SP500,
    "nasdaq100": NASDAQ100,
    "tsx60": TSX60,
    "ftse100": FTSE100,
}


def get_all_unique_tickers():
    all_tickers = set()
    for tickers in INDICES.values():
        all_tickers.update(tickers)
    return sorted(all_tickers)


def yf_ticker(t):
    """Convert our ticker format to yfinance format (BRK.B -> BRK-B)."""
    return t.replace("BRK.B", "BRK-B").replace("BF.B", "BF-B")


def our_ticker(t):
    """Convert yfinance format back to our format (BRK-B -> BRK.B)."""
    return t.replace("BRK-B", "BRK.B").replace("BF-B", "BF.B")


def fetch_once(conn):
    """Fetch all stock quotes using yfinance and store in DB.

    Uses Ticker.fast_info for each ticker to get accurate lastPrice and
    previousClose, fetched in parallel via yfinance's built-in threading.
    """
    cur = conn.cursor()
    all_tickers = get_all_unique_tickers()
    count = 0
    errors = 0

    # Use yf.Tickers for batch creation, then fast_info for accurate live data
    batch_size = 50
    for i in range(0, len(all_tickers), batch_size):
        batch = all_tickers[i:i + batch_size]

        for t in batch:
            try:
                yf_t = yf_ticker(t)
                ticker_obj = yf.Ticker(yf_t)
                info = ticker_obj.fast_info

                price = float(info.get("lastPrice", 0) or 0)
                prev = float(info.get("previousClose", 0) or 0)

                if price <= 0:
                    errors += 1
                    continue

                change = price - prev
                change_pct = ((price / prev) - 1) * 100 if prev > 0 else 0
                sotw_id = f"YF.STOCK.{t}"

                cur.execute(f"""
                    INSERT INTO {QUOTES_TABLE} (id, label, price, previous_close, change, change_pct, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, NOW())
                    ON CONFLICT (id) DO UPDATE SET
                        price = EXCLUDED.price,
                        previous_close = EXCLUDED.previous_close,
                        change = EXCLUDED.change,
                        change_pct = EXCLUDED.change_pct,
                        updated_at = NOW()
                """, (sotw_id, t, round(price, 4), round(prev, 4), round(change, 4), round(change_pct, 4)))
                count += 1
            except Exception as e:
                errors += 1

        # Commit after each batch
        conn.commit()

    return count, errors


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--loop", action="store_true")
    parser.add_argument("--interval", type=int, default=30, help="Seconds between fetches (default 30)")
    parser.add_argument("--duration", type=int, default=19800, help="Max runtime in seconds (default 5.5h)")
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
        print(f"Updated {count} stock quotes ({errors} errors)")
        conn.close()
        return

    print(f"=== Stock quotes loop (every {args.interval}s, max {args.duration}s) ===", flush=True)
    iteration = 0
    max_runtime = args.duration
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
            print(f"  [{now.strftime('%H:%M:%S')}] #{iteration}: {count} stocks ({errors} errors) in {elapsed:.1f}s", flush=True)
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
