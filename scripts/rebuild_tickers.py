#!/usr/bin/env python3
"""Rebuild tickers.ts with current S&P 500 constituents."""

import urllib.request
import json

# Get current S&P 500
csv_data = urllib.request.urlopen(urllib.request.Request(
    'https://raw.githubusercontent.com/datasets/s-and-p-500-companies/main/data/constituents.csv',
    headers={'User-Agent': 'Mozilla/5.0'}
), timeout=10).read().decode()

sp500_names = {}
for line in csv_data.strip().split('\n')[1:]:
    parts = line.split(',')
    ticker = parts[0]
    name = parts[1].strip('"') if len(parts) > 1 else ticker
    name = name.replace("'", "")  # Remove apostrophes
    sp500_names[ticker] = name

# Override with clean names
sp500_names.update({
    'AAPL': 'Apple', 'MSFT': 'Microsoft', 'GOOGL': 'Alphabet A', 'GOOG': 'Alphabet C',
    'AMZN': 'Amazon', 'NVDA': 'Nvidia', 'META': 'Meta Platforms', 'TSLA': 'Tesla',
    'BRK.B': 'Berkshire Hathaway', 'BF.B': 'Brown-Forman', 'DPZ': 'Dominos Pizza',
    'MCD': 'McDonalds', 'MCO': 'Moodys', 'ORLY': 'OReilly Auto', 'LOW': 'Lowes',
    'SJM': 'J.M. Smucker', 'XYZ': 'Block', 'Q': 'Qnity',
})

tsx_names = {
    'RY.TO': 'Royal Bank', 'TD.TO': 'TD Bank', 'BNS.TO': 'Bank of Nova Scotia',
    'BMO.TO': 'BMO', 'CM.TO': 'CIBC', 'ENB.TO': 'Enbridge', 'CNR.TO': 'CN Rail',
    'CP.TO': 'CP Kansas City', 'TRP.TO': 'TC Energy', 'SU.TO': 'Suncor',
    'CNQ.TO': 'Canadian Natural', 'MFC.TO': 'Manulife', 'SLF.TO': 'Sun Life',
    'BCE.TO': 'BCE', 'T.TO': 'Telus', 'ABX.TO': 'Barrick Gold',
    'NTR.TO': 'Nutrien', 'FNV.TO': 'Franco-Nevada', 'CSU.TO': 'Constellation Software',
    'SHOP.TO': 'Shopify', 'ATD.TO': 'Couche-Tard', 'WCN.TO': 'Waste Connections',
    'IFC.TO': 'Intact Financial', 'QSR.TO': 'Restaurant Brands', 'DOL.TO': 'Dollarama',
    'SAP.TO': 'Saputo', 'GIB-A.TO': 'CGI Group', 'WSP.TO': 'WSP Global',
    'CCO.TO': 'Cameco', 'TRI.TO': 'Thomson Reuters', 'BAM.TO': 'Brookfield AM',
    'BN.TO': 'Brookfield Corp', 'POW.TO': 'Power Corp', 'FFH.TO': 'Fairfax Financial',
    'GWO.TO': 'Great-West Lifeco', 'IAG.TO': 'iA Financial', 'NA.TO': 'National Bank',
    'EMA.TO': 'Emera', 'FTS.TO': 'Fortis', 'AQN.TO': 'Algonquin Power',
    'H.TO': 'Hydro One', 'MG.TO': 'Magna', 'L.TO': 'Loblaw',
    'CTC-A.TO': 'Canadian Tire', 'WPM.TO': 'Wheaton Precious', 'AEM.TO': 'Agnico Eagle',
    'K.TO': 'Kinross Gold', 'FM.TO': 'First Quantum', 'IMO.TO': 'Imperial Oil',
    'CVE.TO': 'Cenovus', 'PPL.TO': 'Pembina Pipeline', 'GFL.TO': 'GFL Environmental',
    'TFII.TO': 'TFI International', 'STN.TO': 'Stantec', 'OTEX.TO': 'Open Text',
    'BB.TO': 'BlackBerry', 'LSPD.TO': 'Lightspeed', 'HSE.TO': 'Husky Energy',
    'IPL.TO': 'Inter Pipeline', 'KEY.TO': 'Keyera',
}

ftse_names = {
    'III.L': '3i Group', 'ADM.L': 'Admiral Group', 'AAF.L': 'Airtel Africa',
    'AAL.L': 'Anglo American', 'ANTO.L': 'Antofagasta', 'AHT.L': 'Ashtead',
    'ABF.L': 'Assoc British Foods', 'AZN.L': 'AstraZeneca', 'AUTO.L': 'Auto Trader',
    'AVV.L': 'AVEVA', 'AV.L': 'Aviva', 'BME.L': 'B&M European',
    'BA.L': 'BAE Systems', 'BARC.L': 'Barclays', 'BDEV.L': 'Barratt Dev',
    'BEZ.L': 'Beazley', 'BKG.L': 'Berkeley Group', 'BP.L': 'BP',
    'BATS.L': 'Brit American Tobacco', 'BLND.L': 'British Land', 'BT-A.L': 'BT Group',
    'BNZL.L': 'Bunzl', 'BRBY.L': 'Burberry', 'CCH.L': 'Coca-Cola HBC',
    'CPG.L': 'Compass Group', 'CNA.L': 'Centrica', 'CRH.L': 'CRH',
    'CRDA.L': 'Croda', 'DCC.L': 'DCC', 'DGE.L': 'Diageo',
    'DPLM.L': 'Diploma', 'EDV.L': 'Endeavour Mining', 'ENT.L': 'Entain',
    'EXPN.L': 'Experian', 'FCIT.L': 'F&C Inv Trust', 'FRAS.L': 'Frasers Group',
    'FRES.L': 'Fresnillo', 'GLEN.L': 'Glencore', 'GSK.L': 'GSK',
    'HLN.L': 'Haleon', 'HLMA.L': 'Halma', 'HSBA.L': 'HSBC',
    'IHG.L': 'InterContinental Hotels', 'IMB.L': 'Imperial Brands', 'INF.L': 'Informa',
    'ITV.L': 'ITV', 'JD.L': 'JD Sports', 'KGF.L': 'Kingfisher',
    'LAND.L': 'Land Securities', 'LGEN.L': 'Legal & General', 'LLOY.L': 'Lloyds Banking',
    'LSEG.L': 'London Stock Exchange', 'MNG.L': 'M&G', 'MRO.L': 'Melrose Industries',
    'MNDI.L': 'Mondi', 'NG.L': 'National Grid', 'NWG.L': 'NatWest',
    'NXT.L': 'Next', 'OCDO.L': 'Ocado', 'PSON.L': 'Pearson',
    'PSH.L': 'Pershing Square', 'PSN.L': 'Persimmon', 'PHNX.L': 'Phoenix Group',
    'PRU.L': 'Prudential', 'RKT.L': 'Reckitt', 'REL.L': 'RELX',
    'RIO.L': 'Rio Tinto', 'RMV.L': 'Rightmove', 'RR.L': 'Rolls-Royce',
    'RS1.L': 'RS Group', 'RTO.L': 'Rentokil Initial', 'SAG.L': 'Sage Group',
    'SBRY.L': 'Sainsburys', 'SDR.L': 'Schroders', 'SGE.L': 'Sage Group',
    'SGRO.L': 'Segro', 'SHEL.L': 'Shell', 'SJP.L': 'St James Place',
    'SKG.L': 'Smurfit Kappa', 'SMDS.L': 'Smith DS', 'SMIN.L': 'Smiths Group',
    'SMT.L': 'Scottish Mortgage', 'SN.L': 'Smith & Nephew', 'SPX.L': 'Spirax-Sarco',
    'SSE.L': 'SSE', 'STAN.L': 'Standard Chartered', 'STJ.L': 'St James Place',
    'SVT.L': 'Severn Trent', 'TSCO.L': 'Tesco', 'TW.L': 'Taylor Wimpey',
    'ULVR.L': 'Unilever', 'UTG.L': 'Unite Group', 'UU.L': 'United Utilities',
    'VOD.L': 'Vodafone', 'WEIR.L': 'Weir Group', 'WPP.L': 'WPP', 'WTB.L': 'Whitbread',
}

# Format helpers
def fmt_entry(k, v):
    if '.' in k or '-' in k:
        return f"'{k}':'{v}'"
    return f"{k}:'{v}'"

def format_section(entries, per_line=6):
    lines = []
    for i in range(0, len(entries), per_line):
        chunk = entries[i:i+per_line]
        lines.append('  ' + ','.join(fmt_entry(k, v) for k, v in chunk) + ',')
    return '\n'.join(lines)

def format_array(tickers, per_line=15):
    lines = []
    for i in range(0, len(tickers), per_line):
        chunk = tickers[i:i+per_line]
        lines.append('  ' + ','.join(f'"{t}"' for t in chunk) + ',')
    return '\n'.join(lines)

# Merge all names
all_names = {}
all_names.update(sp500_names)
all_names.update(tsx_names)
all_names.update(ftse_names)

us = [(k, v) for k, v in sorted(all_names.items()) if '.' not in k]
tsx = [(k, v) for k, v in sorted(all_names.items()) if k.endswith('.TO')]
ftse = [(k, v) for k, v in sorted(all_names.items()) if k.endswith('.L')]

nasdaq100 = [
    "AAPL","ABNB","ADBE","ADI","ADP","ADSK","AEP","AMAT","AMD","AMGN","AMZN","ANSS","APP","ARM",
    "ASML","AVGO","AZN","BIIB","BKNG","BKR","CCEP","CDNS","CDW","CEG","CHTR","CMCSA","COST",
    "CPRT","CRWD","CSCO","CSGP","CTAS","CTSH","DASH","DDOG","DLTR","DXCM","EA","EXC","FANG",
    "FAST","FTNT","GEHC","GFS","GILD","GOOG","GOOGL","HON","IDXX","ILMN","INTC","INTU","ISRG",
    "KDP","KHC","KLAC","LIN","LRCX","LULU","MAR","MCHP","MDB","MDLZ","MELI","META","MNST",
    "MRNA","MRVL","MSFT","MU","NFLX","NVDA","NXPI","ODFL","ON","ORLY","PANW","PAYX","PCAR",
    "PDD","PEP","PYPL","QCOM","REGN","ROST","SBUX","SMCI","SNPS","TEAM","TMUS","TSLA",
    "TTD","TTWO","TXN","VRSK","VRTX","WBD","WDAY","XEL","ZS",
]

output = f"""// Shared ticker lists for S&P 500, NASDAQ 100, TSX 60, FTSE 100

export const COMPANY_NAMES: Record<string, string> = {{
  // S&P 500 / NASDAQ 100
{format_section(us)}
  // TSX 60
{format_section(tsx)}
  // FTSE 100
{format_section(ftse)}
}};

export const SP500 = [
{format_array(sorted(sp500_names.keys()))}
];

export const NASDAQ100 = [
{format_array(nasdaq100, 14)}
];

export const TSX60 = [
{format_array(sorted(tsx_names.keys()), 10)}
];

export const FTSE100 = [
{format_array(sorted(ftse_names.keys()), 10)}
];
"""

with open('src/app/markets/stocks/tickers.ts', 'w', encoding='utf-8') as f:
    f.write(output)

print(f'SP500: {len(sp500_names)}, NASDAQ100: {len(nasdaq100)}, TSX60: {len(tsx_names)}, FTSE100: {len(ftse_names)}')
print(f'Total names: {len(all_names)}')
