#!/usr/bin/env python3
"""
Generate static stock profiles using Finnhub API (sequential, rate-limited).
Finnhub free tier: 60 calls/min. We do ~55/min to be safe.
"""

import json
import sys
import time
import urllib.request

FINNHUB_KEY = "d6vl62hr01qiiutc8p6gd6vl62hr01qiiutc8p70"

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

NASDAQ100_EXTRA = [
    "ABNB","APP","ARM","ASML","AZN","CCEP","CRWD","DASH","DDOG","GEHC","GFS",
    "LULU","MDB","MELI","MRVL","PANW","PDD","SMCI","SPLK","TEAM","TTD","WDAY","ZS",
]

# Finnhub industry → GICS-like sector mapping
SECTOR_MAP = {
    "Technology": "Technology",
    "Semiconductors": "Technology",
    "Media": "Communication Services",
    "Telecommunication": "Communication Services",
    "Retail": "Consumer Cyclical",
    "Automobiles": "Consumer Cyclical",
    "Luxury Goods": "Consumer Cyclical",
    "Apparel": "Consumer Cyclical",
    "Home Furnishings": "Consumer Cyclical",
    "Travel & Leisure": "Consumer Cyclical",
    "Textiles": "Consumer Cyclical",
    "Auto Components": "Consumer Cyclical",
    "Banking": "Financial Services",
    "Financial Services": "Financial Services",
    "Insurance": "Financial Services",
    "Diversified Financial": "Financial Services",
    "Pharmaceuticals": "Healthcare",
    "Biotechnology": "Healthcare",
    "Healthcare": "Healthcare",
    "Health Care": "Healthcare",
    "Medical Devices": "Healthcare",
    "Healthcare Plans": "Healthcare",
    "Industrial": "Industrials",
    "Industrials": "Industrials",
    "Aerospace & Defense": "Industrials",
    "Construction": "Industrials",
    "Transportation": "Industrials",
    "Machinery": "Industrials",
    "Electrical Equipment": "Industrials",
    "Environmental Services": "Industrials",
    "Professional Services": "Industrials",
    "Building": "Industrials",
    "Food & Beverage": "Consumer Defensive",
    "Tobacco": "Consumer Defensive",
    "Consumer Products": "Consumer Defensive",
    "Household Products": "Consumer Defensive",
    "Packaging": "Consumer Defensive",
    "Food Products": "Consumer Defensive",
    "Oil & Gas": "Energy",
    "Energy": "Energy",
    "Utilities": "Utilities",
    "REITs": "Real Estate",
    "Real Estate": "Real Estate",
    "Chemicals": "Basic Materials",
    "Metals & Mining": "Basic Materials",
    "Mining": "Basic Materials",
    "Paper & Forest Products": "Basic Materials",
    "Agricultural Inputs": "Basic Materials",
    "Communications": "Communication Services",
    "Airlines": "Industrials",
}


def fetch_profile(ticker):
    """Fetch profile from Finnhub."""
    url = f"https://finnhub.io/api/v1/stock/profile2?symbol={ticker}&token={FINNHUB_KEY}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
        if data and data.get("ticker"):
            industry = data.get("finnhubIndustry", "Other")
            sector = SECTOR_MAP.get(industry, industry)
            return {
                "sector": sector,
                "industry": industry,
                "marketCap": int(data.get("marketCapitalization", 0) * 1_000_000),
            }
    except urllib.error.HTTPError as e:
        if e.code == 429:
            return "RATE_LIMITED"
    except Exception:
        pass
    return None


def main():
    # Try to load existing partial file
    out_path = "public/data/stock_profiles.json"
    try:
        with open(out_path) as f:
            profiles = json.load(f)
        print(f"Loaded {len(profiles)} existing profiles")
    except Exception:
        profiles = {}

    all_tickers = list(dict.fromkeys(SP500 + NASDAQ100_EXTRA))
    remaining = [t for t in all_tickers if t not in profiles]
    print(f"Need to fetch {len(remaining)} more profiles (of {len(all_tickers)} total)...")

    failed = []
    count = 0

    for i, ticker in enumerate(remaining):
        result = fetch_profile(ticker)

        if result == "RATE_LIMITED":
            print(f"  [{i+1}/{len(remaining)}] Rate limited at {ticker} — waiting 60s...")
            time.sleep(60)
            result = fetch_profile(ticker)

        if result and result != "RATE_LIMITED":
            profiles[ticker] = result
            count += 1
        else:
            failed.append(ticker)

        if (i + 1) % 50 == 0:
            print(f"  [{i+1}/{len(remaining)}] {count} new profiles ({len(profiles)} total)")
            # Save intermediate results
            with open(out_path, "w") as f:
                json.dump(dict(sorted(profiles.items(), key=lambda x: x[1]["marketCap"], reverse=True)), f, indent=2)

        # 1.1s between requests = ~55/min (safe under 60/min limit)
        time.sleep(1.1)

    # Final save
    profiles = dict(sorted(profiles.items(), key=lambda x: x[1]["marketCap"], reverse=True))
    with open(out_path, "w") as f:
        json.dump(profiles, f, indent=2)

    print(f"\nDone: {len(profiles)} total profiles saved to {out_path}")
    if failed:
        print(f"Failed ({len(failed)}): {', '.join(sorted(failed))}")

    sectors = {}
    for p in profiles.values():
        s = p["sector"]
        sectors[s] = sectors.get(s, 0) + 1
    print("\nBy sector:")
    for s, c in sorted(sectors.items(), key=lambda x: -x[1]):
        print(f"  {s}: {c}")


if __name__ == "__main__":
    main()
