#!/usr/bin/env python3
"""
Generate static stock profiles JSON for treemap fallback.
Fetches sector, industry, and market cap from Yahoo Finance.
"""

import json
import time
import sys

try:
    import yfinance as yf
except ImportError:
    print("ERROR: pip install yfinance")
    sys.exit(1)

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
    "T","TAP","TDG","TDY","TECH","TEL","TER","TFC","TFX","TGT","TJX","TMO","TMUS","TPR","TRGP",
    "TRMB","TROW","TRV","TSCO","TSLA","TSN","TT","TTWO","TXN","TXT","TYL","UAL","UDR","UHS",
    "ULTA","UNH","UNP","UPS","URI","USB","V","VFC","VICI","VLO","VMC","VNO","VRSK","VRSN","VRTX",
    "VTR","VTRS","VZ","WAB","WAT","WBA","WBD","WDC","WEC","WELL","WFC","WHR","WM","WMB","WMT",
    "WRB","WRK","WST","WTW","WY","WYNN","XEL","XOM","XRAY","XYL","YUM","ZBH","ZBRA","ZION","ZTS",
]

NASDAQ100_EXTRA = [
    "ABNB","APP","ARM","ASML","AZN","CCEP","CRWD","DASH","DDOG","GEHC","GFS",
    "LULU","MDB","MELI","MRVL","PANW","PDD","SMCI","SPLK","TEAM","TTD","WDAY","ZS",
]

def main():
    all_tickers = list(set(SP500 + NASDAQ100_EXTRA))
    all_tickers.sort()
    profiles = {}
    failed = []

    for i, ticker in enumerate(all_tickers):
        try:
            t = yf.Ticker(ticker)
            info = t.info
            sector = info.get('sector', '')
            industry = info.get('industry', '')
            market_cap = info.get('marketCap', 0)

            if sector or market_cap:
                profiles[ticker] = {
                    "sector": sector,
                    "industry": industry,
                    "marketCap": market_cap
                }
                print(f"[{i+1}/{len(all_tickers)}] {ticker}: {sector} / {industry} / ${market_cap:,.0f}")
            else:
                failed.append(ticker)
                print(f"[{i+1}/{len(all_tickers)}] {ticker}: NO DATA")
        except Exception as e:
            failed.append(ticker)
            print(f"[{i+1}/{len(all_tickers)}] {ticker}: ERROR {e}")

        time.sleep(0.3)

    out_path = "public/data/stock_profiles.json"
    with open(out_path, "w") as f:
        json.dump(profiles, f, indent=2)

    print(f"\nDone: {len(profiles)} profiles saved to {out_path}")
    if failed:
        print(f"Failed ({len(failed)}): {', '.join(failed)}")

if __name__ == "__main__":
    main()
