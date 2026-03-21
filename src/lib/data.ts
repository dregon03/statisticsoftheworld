// Multi-source data layer: World Bank + IMF WEO + WHO
// Uses whichever source has the most recent data for each indicator type.
// Docs:
//   World Bank: https://datahelpdesk.worldbank.org/knowledgebase/articles/898581
//   IMF WEO: https://www.imf.org/external/datamapper/api/v1/
//   WHO GHO: https://ghoapi.azureedge.net/api/

export interface CountryData {
  id: string;
  iso2: string;
  name: string;
  region: string;
  incomeLevel: string;
  capitalCity: string;
  longitude: string;
  latitude: string;
}

export interface Indicator {
  id: string;
  label: string;
  category: string;
  format: 'number' | 'percent' | 'currency' | 'years' | 'ratio' | 'index';
  decimals?: number;
  source?: 'wb' | 'imf' | 'who';
  description?: string;
}


// ============================================================
// 400+ INDICATORS across 25 categories
// Sources: World Bank (wb), IMF (imf), WHO (who)
// ============================================================
export const INDICATORS: Indicator[] = [

  // ── ECONOMY — GDP & NATIONAL ACCOUNTS (30) ──────────────────
  // IMF has the most current GDP data (includes current year estimates)
  { id: 'IMF.NGDPD', label: 'GDP (Current USD, Billions)', category: 'Economy', format: 'currency', source: 'imf', description: 'IMF World Economic Outlook' },
  { id: 'IMF.NGDP_RPCH', label: 'Real GDP Growth (%)', category: 'Economy', format: 'percent', decimals: 1, source: 'imf' },
  { id: 'IMF.NGDPDPC', label: 'GDP per Capita (USD)', category: 'Economy', format: 'currency', source: 'imf' },
  { id: 'IMF.PPPGDP', label: 'GDP, PPP (Billions Intl $)', category: 'Economy', format: 'currency', source: 'imf' },
  { id: 'IMF.PPPPC', label: 'GDP per Capita, PPP (Intl $)', category: 'Economy', format: 'currency', source: 'imf' },
  { id: 'IMF.PPPSH', label: 'Share of World GDP, PPP (%)', category: 'Economy', format: 'percent', decimals: 2, source: 'imf' },
  { id: 'NY.GNP.MKTP.CD', label: 'GNI (Current USD)', category: 'Economy', format: 'currency' },
  { id: 'NY.GNP.PCAP.CD', label: 'GNI per Capita (USD)', category: 'Economy', format: 'currency' },
  { id: 'NY.GNP.PCAP.PP.CD', label: 'GNI per Capita, PPP (USD)', category: 'Economy', format: 'currency' },
  { id: 'NV.IND.TOTL.ZS', label: 'Industry Value Added (% of GDP)', category: 'Economy', format: 'percent', decimals: 1 },
  { id: 'NV.SRV.TOTL.ZS', label: 'Services Value Added (% of GDP)', category: 'Economy', format: 'percent', decimals: 1 },
  { id: 'NV.AGR.TOTL.ZS', label: 'Agriculture Value Added (% of GDP)', category: 'Economy', format: 'percent', decimals: 1 },
  { id: 'NE.CON.GOVT.ZS', label: 'Government Consumption (% of GDP)', category: 'Economy', format: 'percent', decimals: 1 },
  { id: 'NE.CON.PRVT.ZS', label: 'Household Consumption (% of GDP)', category: 'Economy', format: 'percent', decimals: 1 },
  { id: 'NE.GDI.TOTL.ZS', label: 'Gross Capital Formation (% of GDP)', category: 'Economy', format: 'percent', decimals: 1 },
  { id: 'NY.GNS.ICTR.ZS', label: 'Gross Savings (% of GNI)', category: 'Economy', format: 'percent', decimals: 1 },
  { id: 'NY.GDP.DEFL.KD.ZG', label: 'GDP Deflator (%)', category: 'Economy', format: 'percent', decimals: 1 },
  { id: 'SL.GDP.PCAP.EM.KD', label: 'GDP per Person Employed (USD)', category: 'Economy', format: 'currency' },
  { id: 'NV.IND.MANF.ZS', label: 'Manufacturing Value Added (% of GDP)', category: 'Economy', format: 'percent', decimals: 1 },
  { id: 'NV.MNF.TECH.ZS.UN', label: 'Medium/High-Tech Manufacturing (% of total)', category: 'Economy', format: 'percent', decimals: 1 },
  { id: 'NY.ADJ.NNTY.PC.CD', label: 'Adjusted Net National Income per Capita (USD)', category: 'Economy', format: 'currency' },
  { id: 'NY.ADJ.SVNG.GN.ZS', label: 'Adjusted Net Savings (% of GNI)', category: 'Economy', format: 'percent', decimals: 1 },
  { id: 'NE.RSB.GNFS.ZS', label: 'External Balance on Goods & Services (% of GDP)', category: 'Economy', format: 'percent', decimals: 1 },
  { id: 'NY.GDP.COAL.RT.ZS', label: 'Coal Rents (% of GDP)', category: 'Economy', format: 'percent', decimals: 2 },
  { id: 'NY.GDP.MINR.RT.ZS', label: 'Mineral Rents (% of GDP)', category: 'Economy', format: 'percent', decimals: 2 },
  { id: 'NY.GDP.PETR.RT.ZS', label: 'Oil Rents (% of GDP)', category: 'Economy', format: 'percent', decimals: 2 },
  { id: 'NY.GDP.NGAS.RT.ZS', label: 'Natural Gas Rents (% of GDP)', category: 'Economy', format: 'percent', decimals: 2 },
  { id: 'NY.GDP.TOTL.RT.ZS', label: 'Total Natural Resources Rents (% of GDP)', category: 'Economy', format: 'percent', decimals: 1 },
  { id: 'NY.GDP.FRST.RT.ZS', label: 'Forest Rents (% of GDP)', category: 'Economy', format: 'percent', decimals: 2 },
  { id: 'NV.IND.TOTL.CD', label: 'Industry Value Added (Current USD)', category: 'Economy', format: 'currency' },

  // ── FISCAL & MONETARY (18) ──────────────────────────────────
  // IMF has the most current inflation + fiscal data
  { id: 'IMF.PCPIPCH', label: 'Inflation, Consumer Prices (%)', category: 'Fiscal & Monetary', format: 'percent', decimals: 1, source: 'imf' },
  { id: 'IMF.GGXWDG_NGDP', label: 'Govt Gross Debt (% of GDP)', category: 'Fiscal & Monetary', format: 'percent', decimals: 1, source: 'imf' },
  { id: 'IMF.GGXCNL_NGDP', label: 'Fiscal Balance (% of GDP)', category: 'Fiscal & Monetary', format: 'percent', decimals: 1, source: 'imf' },
  { id: 'IMF.BCA_NGDPD', label: 'Current Account Balance (% of GDP)', category: 'Fiscal & Monetary', format: 'percent', decimals: 1, source: 'imf' },
  { id: 'IMF.NI_GDP', label: 'Total Investment (% of GDP)', category: 'Fiscal & Monetary', format: 'percent', decimals: 1, source: 'imf' },
  { id: 'IMF.NGS_GDP', label: 'Gross National Savings (% of GDP)', category: 'Fiscal & Monetary', format: 'percent', decimals: 1, source: 'imf' },
  { id: 'IMF.LUR', label: 'Unemployment Rate (%)', category: 'Fiscal & Monetary', format: 'percent', decimals: 1, source: 'imf' },
  { id: 'FP.CPI.TOTL.ZG', label: 'Inflation, CPI (%, World Bank)', category: 'Fiscal & Monetary', format: 'percent', decimals: 1 },
  { id: 'FR.INR.RINR', label: 'Real Interest Rate (%)', category: 'Fiscal & Monetary', format: 'percent', decimals: 1 },
  { id: 'FR.INR.LEND', label: 'Lending Interest Rate (%)', category: 'Fiscal & Monetary', format: 'percent', decimals: 1 },
  { id: 'FR.INR.DPST', label: 'Deposit Interest Rate (%)', category: 'Fiscal & Monetary', format: 'percent', decimals: 1 },
  { id: 'GC.DOD.TOTL.GD.ZS', label: 'Government Debt (% of GDP)', category: 'Fiscal & Monetary', format: 'percent', decimals: 1 },
  { id: 'GC.REV.XGRT.GD.ZS', label: 'Government Revenue (% of GDP)', category: 'Fiscal & Monetary', format: 'percent', decimals: 1 },
  { id: 'GC.XPN.TOTL.GD.ZS', label: 'Government Expenditure (% of GDP)', category: 'Fiscal & Monetary', format: 'percent', decimals: 1 },
  { id: 'GC.TAX.TOTL.GD.ZS', label: 'Tax Revenue (% of GDP)', category: 'Fiscal & Monetary', format: 'percent', decimals: 1 },
  { id: 'GC.TAX.GSRV.RV.ZS', label: 'Taxes on Goods & Services (% of revenue)', category: 'Fiscal & Monetary', format: 'percent', decimals: 1 },
  { id: 'GC.TAX.INTT.RV.ZS', label: 'Taxes on International Trade (% of revenue)', category: 'Fiscal & Monetary', format: 'percent', decimals: 1 },
  { id: 'GC.TAX.YPKG.RV.ZS', label: 'Taxes on Income, Profits & Capital Gains (% of rev)', category: 'Fiscal & Monetary', format: 'percent', decimals: 1 },
  { id: 'GC.NFN.TOTL.GD.ZS', label: 'Net Investment in Nonfinancial Assets (% of GDP)', category: 'Fiscal & Monetary', format: 'percent', decimals: 1 },
  { id: 'FI.RES.TOTL.CD', label: 'Total Reserves incl. Gold (USD)', category: 'Fiscal & Monetary', format: 'currency' },
  { id: 'FI.RES.TOTL.MO', label: 'Total Reserves (months of imports)', category: 'Fiscal & Monetary', format: 'number', decimals: 1 },
  { id: 'PA.NUS.FCRF', label: 'Official Exchange Rate (per USD)', category: 'Fiscal & Monetary', format: 'number', decimals: 2 },
  { id: 'PA.NUS.PPP', label: 'PPP Conversion Factor', category: 'Fiscal & Monetary', format: 'number', decimals: 2 },
  { id: 'FM.LBL.BMNY.GD.ZS', label: 'Broad Money (% of GDP)', category: 'Fiscal & Monetary', format: 'percent', decimals: 1 },

  // ── TRADE (15) ──────────────────────────────────────────────
  { id: 'NE.TRD.GNFS.ZS', label: 'Trade (% of GDP)', category: 'Trade', format: 'percent', decimals: 1 },
  { id: 'NE.EXP.GNFS.ZS', label: 'Exports of Goods & Services (% of GDP)', category: 'Trade', format: 'percent', decimals: 1 },
  { id: 'NE.IMP.GNFS.ZS', label: 'Imports of Goods & Services (% of GDP)', category: 'Trade', format: 'percent', decimals: 1 },
  { id: 'NE.EXP.GNFS.CD', label: 'Exports of Goods & Services (USD)', category: 'Trade', format: 'currency' },
  { id: 'NE.IMP.GNFS.CD', label: 'Imports of Goods & Services (USD)', category: 'Trade', format: 'currency' },
  { id: 'TX.VAL.MRCH.CD.WT', label: 'Merchandise Exports (USD)', category: 'Trade', format: 'currency' },
  { id: 'TM.VAL.MRCH.CD.WT', label: 'Merchandise Imports (USD)', category: 'Trade', format: 'currency' },
  { id: 'BX.KLT.DINV.WD.GD.ZS', label: 'FDI Inflows (% of GDP)', category: 'Trade', format: 'percent', decimals: 1 },
  { id: 'BM.KLT.DINV.WD.GD.ZS', label: 'FDI Outflows (% of GDP)', category: 'Trade', format: 'percent', decimals: 1 },
  { id: 'BX.KLT.DINV.CD.WD', label: 'FDI Net Inflows (USD)', category: 'Trade', format: 'currency' },
  { id: 'BX.TRF.PWKR.CD.DT', label: 'Personal Remittances Received (USD)', category: 'Trade', format: 'currency' },
  { id: 'BX.TRF.PWKR.DT.GD.ZS', label: 'Personal Remittances Received (% of GDP)', category: 'Trade', format: 'percent', decimals: 1 },
  { id: 'TX.VAL.TECH.MF.ZS', label: 'High-Tech Exports (% of manufactured)', category: 'Trade', format: 'percent', decimals: 1 },
  { id: 'BN.CAB.XOKA.GD.ZS', label: 'Current Account Balance (% of GDP)', category: 'Trade', format: 'percent', decimals: 1 },
  { id: 'BN.CAB.XOKA.CD', label: 'Current Account Balance (USD)', category: 'Trade', format: 'currency' },

  // ── EXTERNAL DEBT (10) ──────────────────────────────────────
  { id: 'DT.DOD.DECT.GN.ZS', label: 'External Debt (% of GNI)', category: 'External Debt', format: 'percent', decimals: 1 },
  { id: 'DT.DOD.DECT.CD', label: 'External Debt Stocks (USD)', category: 'External Debt', format: 'currency' },
  { id: 'DT.TDS.DECT.GN.ZS', label: 'Total Debt Service (% of GNI)', category: 'External Debt', format: 'percent', decimals: 1 },
  { id: 'DT.DOD.PVLX.CD', label: 'Present Value of External Debt (USD)', category: 'External Debt', format: 'currency' },
  { id: 'DT.DOD.DIMF.CD', label: 'Use of IMF Credit (USD)', category: 'External Debt', format: 'currency' },
  { id: 'DT.ODA.ODAT.GN.ZS', label: 'Net ODA Received (% of GNI)', category: 'External Debt', format: 'percent', decimals: 1 },
  { id: 'DT.ODA.ODAT.CD', label: 'Net ODA Received (USD)', category: 'External Debt', format: 'currency' },

  // ── FINANCE (14) ────────────────────────────────────────────
  { id: 'FS.AST.DOMS.GD.ZS', label: 'Domestic Credit by Financial Sector (% of GDP)', category: 'Finance', format: 'percent', decimals: 1 },
  { id: 'FS.AST.PRVT.GD.ZS', label: 'Domestic Credit to Private Sector (% of GDP)', category: 'Finance', format: 'percent', decimals: 1 },
  { id: 'CM.MKT.LCAP.GD.ZS', label: 'Stock Market Capitalization (% of GDP)', category: 'Finance', format: 'percent', decimals: 1 },
  { id: 'CM.MKT.LCAP.CD', label: 'Stock Market Capitalization (USD)', category: 'Finance', format: 'currency' },
  { id: 'CM.MKT.TRAD.GD.ZS', label: 'Stock Market Turnover (% of GDP)', category: 'Finance', format: 'percent', decimals: 1 },
  { id: 'CM.MKT.LDOM.NO', label: 'Listed Domestic Companies', category: 'Finance', format: 'number' },
  { id: 'FB.BNK.CAPA.ZS', label: 'Bank Capital to Assets Ratio (%)', category: 'Finance', format: 'percent', decimals: 1 },
  { id: 'FB.AST.NPER.ZS', label: 'Bank Nonperforming Loans (%)', category: 'Finance', format: 'percent', decimals: 1 },
  { id: 'FX.OWN.TOTL.ZS', label: 'Account Ownership at Financial Institution (%)', category: 'Finance', format: 'percent', decimals: 1 },
  { id: 'FX.OWN.TOTL.FE.ZS', label: 'Account Ownership, Female (%)', category: 'Finance', format: 'percent', decimals: 1 },
  { id: 'FX.OWN.TOTL.MA.ZS', label: 'Account Ownership, Male (%)', category: 'Finance', format: 'percent', decimals: 1 },
  { id: 'IC.FRM.BNKS.ZS', label: 'Firms Using Banks to Finance Investment (%)', category: 'Finance', format: 'percent', decimals: 1 },

  // ── BUSINESS ENVIRONMENT (12) ───────────────────────────────
  { id: 'IC.ELC.DURS', label: 'Time to Get Electricity (days)', category: 'Business Environment', format: 'number', decimals: 0 },

  // ── PEOPLE & DEMOGRAPHICS (25) ─────────────────────────────
  { id: 'SP.POP.TOTL', label: 'Population', category: 'People', format: 'number' },
  { id: 'SP.POP.GROW', label: 'Population Growth (%)', category: 'People', format: 'percent', decimals: 1 },
  { id: 'EN.POP.DNST', label: 'Population Density (per km²)', category: 'People', format: 'number', decimals: 0 },
  { id: 'AG.SRF.TOTL.K2', label: 'Surface Area (sq km)', category: 'People', format: 'number', decimals: 0 },
  { id: 'AG.LND.TOTL.K2', label: 'Land Area (sq km)', category: 'People', format: 'number', decimals: 0 },
  { id: 'SP.URB.TOTL.IN.ZS', label: 'Urban Population (%)', category: 'People', format: 'percent', decimals: 1 },
  { id: 'SP.URB.TOTL', label: 'Urban Population (total)', category: 'People', format: 'number' },
  { id: 'SP.RUR.TOTL.ZS', label: 'Rural Population (%)', category: 'People', format: 'percent', decimals: 1 },
  { id: 'SP.DYN.LE00.IN', label: 'Life Expectancy at Birth', category: 'People', format: 'years', decimals: 1 },
  { id: 'SP.DYN.LE00.MA.IN', label: 'Life Expectancy, Male', category: 'People', format: 'years', decimals: 1 },
  { id: 'SP.DYN.LE00.FE.IN', label: 'Life Expectancy, Female', category: 'People', format: 'years', decimals: 1 },
  { id: 'SP.DYN.TFRT.IN', label: 'Fertility Rate (births per woman)', category: 'People', format: 'number', decimals: 1 },
  { id: 'SP.DYN.CBRT.IN', label: 'Birth Rate (per 1,000)', category: 'People', format: 'number', decimals: 1 },
  { id: 'SP.DYN.CDRT.IN', label: 'Death Rate (per 1,000)', category: 'People', format: 'number', decimals: 1 },
  { id: 'SM.POP.NETM', label: 'Net Migration', category: 'People', format: 'number' },
  { id: 'SP.POP.0014.TO.ZS', label: 'Population Ages 0–14 (%)', category: 'People', format: 'percent', decimals: 1 },
  { id: 'SP.POP.1564.TO.ZS', label: 'Population Ages 15–64 (%)', category: 'People', format: 'percent', decimals: 1 },
  { id: 'SP.POP.65UP.TO.ZS', label: 'Population Ages 65+ (%)', category: 'People', format: 'percent', decimals: 1 },
  { id: 'SP.POP.DPND', label: 'Age Dependency Ratio (%)', category: 'People', format: 'percent', decimals: 1 },
  { id: 'SP.POP.DPND.OL', label: 'Old-Age Dependency Ratio (%)', category: 'People', format: 'percent', decimals: 1 },
  { id: 'SP.POP.DPND.YG', label: 'Youth Dependency Ratio (%)', category: 'People', format: 'percent', decimals: 1 },
  { id: 'SP.DYN.AMRT.MA', label: 'Mortality Rate, Adult Male (per 1,000)', category: 'People', format: 'number', decimals: 1 },
  { id: 'SP.DYN.AMRT.FE', label: 'Mortality Rate, Adult Female (per 1,000)', category: 'People', format: 'number', decimals: 1 },

  // ── LABOR (18) ──────────────────────────────────────────────
  { id: 'SL.TLF.TOTL.IN', label: 'Total Labor Force', category: 'Labor', format: 'number' },
  { id: 'SL.TLF.CACT.ZS', label: 'Labor Force Participation (%)', category: 'Labor', format: 'percent', decimals: 1 },
  { id: 'SL.TLF.CACT.FE.ZS', label: 'Female Labor Force Participation (%)', category: 'Labor', format: 'percent', decimals: 1 },
  { id: 'SL.TLF.CACT.MA.ZS', label: 'Male Labor Force Participation (%)', category: 'Labor', format: 'percent', decimals: 1 },
  { id: 'SL.UEM.TOTL.ZS', label: 'Unemployment (%)', category: 'Labor', format: 'percent', decimals: 1 },
  { id: 'SL.UEM.TOTL.FE.ZS', label: 'Female Unemployment (%)', category: 'Labor', format: 'percent', decimals: 1 },
  { id: 'SL.UEM.TOTL.MA.ZS', label: 'Male Unemployment (%)', category: 'Labor', format: 'percent', decimals: 1 },
  { id: 'SL.UEM.1524.ZS', label: 'Youth Unemployment (%)', category: 'Labor', format: 'percent', decimals: 1 },
  { id: 'SL.AGR.EMPL.ZS', label: 'Employment in Agriculture (%)', category: 'Labor', format: 'percent', decimals: 1 },
  { id: 'SL.IND.EMPL.ZS', label: 'Employment in Industry (%)', category: 'Labor', format: 'percent', decimals: 1 },
  { id: 'SL.SRV.EMPL.ZS', label: 'Employment in Services (%)', category: 'Labor', format: 'percent', decimals: 1 },
  { id: 'SL.TLF.CACT.NE.ZS', label: 'Self-Employed (%)', category: 'Labor', format: 'percent', decimals: 1 },
  { id: 'SL.EMP.VULN.ZS', label: 'Vulnerable Employment (%)', category: 'Labor', format: 'percent', decimals: 1 },
  { id: 'SL.EMP.WORK.ZS', label: 'Wage & Salaried Workers (% of total)', category: 'Labor', format: 'percent', decimals: 1 },
  { id: 'SL.TLF.PART.ZS', label: 'Part-Time Employment (%)', category: 'Labor', format: 'percent', decimals: 1 },
  { id: 'SL.EMP.MPYR.ZS', label: 'Employers (% of total employment)', category: 'Labor', format: 'percent', decimals: 1 },
  { id: 'SL.TLF.TOTL.FE.ZS', label: 'Labor Force, Female (% of total)', category: 'Labor', format: 'percent', decimals: 1 },

  // ── EDUCATION (18) ──────────────────────────────────────────
  { id: 'SE.XPD.TOTL.GD.ZS', label: 'Education Spending (% of GDP)', category: 'Education', format: 'percent', decimals: 1 },
  { id: 'SE.XPD.TOTL.GB.ZS', label: 'Education Spending (% of govt expenditure)', category: 'Education', format: 'percent', decimals: 1 },
  { id: 'SE.ADT.LITR.ZS', label: 'Adult Literacy Rate (%)', category: 'Education', format: 'percent', decimals: 1 },
  { id: 'SE.ADT.LITR.FE.ZS', label: 'Female Literacy Rate (%)', category: 'Education', format: 'percent', decimals: 1 },
  { id: 'SE.ADT.LITR.MA.ZS', label: 'Male Literacy Rate (%)', category: 'Education', format: 'percent', decimals: 1 },
  { id: 'SE.ADT.1524.LT.ZS', label: 'Youth Literacy Rate (%)', category: 'Education', format: 'percent', decimals: 1 },
  { id: 'SE.PRM.ENRR', label: 'Primary School Enrollment (%)', category: 'Education', format: 'percent', decimals: 1 },
  { id: 'SE.SEC.ENRR', label: 'Secondary School Enrollment (%)', category: 'Education', format: 'percent', decimals: 1 },
  { id: 'SE.TER.ENRR', label: 'Tertiary School Enrollment (%)', category: 'Education', format: 'percent', decimals: 1 },
  { id: 'SE.PRM.CMPT.ZS', label: 'Primary Completion Rate (%)', category: 'Education', format: 'percent', decimals: 1 },
  { id: 'SE.SEC.CMPT.LO.ZS', label: 'Lower Secondary Completion Rate (%)', category: 'Education', format: 'percent', decimals: 1 },
  { id: 'SE.PRM.UNER', label: 'Out-of-School Children, Primary', category: 'Education', format: 'number' },
  { id: 'SE.PRM.UNER.FE', label: 'Out-of-School Girls, Primary', category: 'Education', format: 'number' },
  { id: 'SE.PRM.TCHR', label: 'Primary School Teachers', category: 'Education', format: 'number' },
  { id: 'SE.SEC.TCHR', label: 'Secondary School Teachers', category: 'Education', format: 'number' },
  { id: 'SE.PRM.ENRL.TC.ZS', label: 'Pupil-Teacher Ratio, Primary', category: 'Education', format: 'number', decimals: 0 },
  { id: 'SE.SEC.ENRL.TC.ZS', label: 'Pupil-Teacher Ratio, Secondary', category: 'Education', format: 'number', decimals: 0 },
  { id: 'SE.XPD.PRIM.ZS', label: 'Expenditure per Student, Primary (% of GDP/cap)', category: 'Education', format: 'percent', decimals: 1 },

  // ── HEALTH (25) ─────────────────────────────────────────────
  { id: 'SH.XPD.CHEX.GD.ZS', label: 'Health Spending (% of GDP)', category: 'Health', format: 'percent', decimals: 1 },
  { id: 'SH.XPD.CHEX.PC.CD', label: 'Health Spending per Capita (USD)', category: 'Health', format: 'currency' },
  { id: 'SH.XPD.GHED.GD.ZS', label: 'Government Health Spending (% of GDP)', category: 'Health', format: 'percent', decimals: 1 },
  { id: 'SH.XPD.OOPC.CH.ZS', label: 'Out-of-Pocket Health Spending (% of total)', category: 'Health', format: 'percent', decimals: 1 },
  { id: 'SH.MED.PHYS.ZS', label: 'Physicians (per 1,000 people)', category: 'Health', format: 'number', decimals: 1 },
  { id: 'SH.MED.NUMW.P3', label: 'Nurses & Midwives (per 1,000)', category: 'Health', format: 'number', decimals: 1 },
  { id: 'SH.MED.BEDS.ZS', label: 'Hospital Beds (per 1,000)', category: 'Health', format: 'number', decimals: 1 },
  { id: 'SH.DYN.MORT', label: 'Infant Mortality (per 1,000 live births)', category: 'Health', format: 'number', decimals: 1 },
  { id: 'SH.DYN.NMRT', label: 'Neonatal Mortality (per 1,000)', category: 'Health', format: 'number', decimals: 1 },
  { id: 'SH.STA.MMRT', label: 'Maternal Mortality (per 100,000)', category: 'Health', format: 'number', decimals: 0 },
  { id: 'SH.DYN.MORT.FE', label: 'Under-5 Mortality, Female (per 1,000)', category: 'Health', format: 'number', decimals: 1 },
  { id: 'SH.DYN.MORT.MA', label: 'Under-5 Mortality, Male (per 1,000)', category: 'Health', format: 'number', decimals: 1 },
  { id: 'SH.DTH.COMM.ZS', label: 'Cause of Death, Communicable (%)', category: 'Health', format: 'percent', decimals: 1 },
  { id: 'SH.DTH.NCOM.ZS', label: 'Cause of Death, Non-Communicable (%)', category: 'Health', format: 'percent', decimals: 1 },
  { id: 'SH.DTH.INJR.ZS', label: 'Cause of Death, Injury (%)', category: 'Health', format: 'percent', decimals: 1 },
  { id: 'SH.IMM.MEAS', label: 'Measles Immunization (% of children)', category: 'Health', format: 'percent', decimals: 1 },
  { id: 'SH.IMM.IDPT', label: 'DPT Immunization (% of children)', category: 'Health', format: 'percent', decimals: 1 },
  { id: 'SH.HIV.INCD.TL.P3', label: 'HIV Incidence (per 1,000)', category: 'Health', format: 'number', decimals: 2 },
  { id: 'SH.TBS.INCD', label: 'Tuberculosis Incidence (per 100,000)', category: 'Health', format: 'number', decimals: 0 },
  { id: 'SH.STA.STNT.ZS', label: 'Stunting, Children Under 5 (%)', category: 'Health', format: 'percent', decimals: 1 },
  { id: 'SH.STA.OWGH.ZS', label: 'Overweight, Children Under 5 (%)', category: 'Health', format: 'percent', decimals: 1 },
  { id: 'SH.PRV.SMOK.MA', label: 'Smoking Prevalence, Males (%)', category: 'Health', format: 'percent', decimals: 1 },
  { id: 'SH.PRV.SMOK.FE', label: 'Smoking Prevalence, Females (%)', category: 'Health', format: 'percent', decimals: 1 },
  { id: 'SH.STA.SUIC.P5', label: 'Suicide Mortality Rate (per 100,000)', category: 'Health', format: 'number', decimals: 1 },
  { id: 'SH.ALC.PCAP.LI', label: 'Alcohol Consumption (liters per capita)', category: 'Health', format: 'number', decimals: 1 },

  // ── ENERGY & ENVIRONMENT (20) ──────────────────────────────
  { id: 'EN.GHG.CO2.PC.CE.AR5', label: 'CO₂ Emissions (tonnes per capita)', category: 'Energy & Environment', format: 'number', decimals: 1 },
  { id: 'EN.GHG.CO2.MT.CE.AR5', label: 'CO₂ Emissions (total kilotonnes)', category: 'Energy & Environment', format: 'number', decimals: 0 },
  { id: 'EG.USE.PCAP.KG.OE', label: 'Energy Use (kg oil eq. per capita)', category: 'Energy & Environment', format: 'number', decimals: 0 },
  { id: 'EG.USE.ELEC.KH.PC', label: 'Electric Power Consumption (kWh per capita)', category: 'Energy & Environment', format: 'number', decimals: 0 },
  { id: 'EG.ELC.RNEW.ZS', label: 'Renewable Electricity Output (%)', category: 'Energy & Environment', format: 'percent', decimals: 1 },
  { id: 'EG.FEC.RNEW.ZS', label: 'Renewable Energy Consumption (%)', category: 'Energy & Environment', format: 'percent', decimals: 1 },
  { id: 'EG.ELC.ACCS.ZS', label: 'Access to Electricity (%)', category: 'Energy & Environment', format: 'percent', decimals: 1 },
  { id: 'EG.CFT.ACCS.ZS', label: 'Access to Clean Fuels for Cooking (%)', category: 'Energy & Environment', format: 'percent', decimals: 1 },
  { id: 'EN.ATM.PM25.MC.M3', label: 'PM2.5 Air Pollution (µg/m³)', category: 'Energy & Environment', format: 'number', decimals: 1 },
  { id: 'AG.LND.FRST.ZS', label: 'Forest Area (%)', category: 'Energy & Environment', format: 'percent', decimals: 1 },
  { id: 'AG.LND.FRST.K2', label: 'Forest Area (sq km)', category: 'Energy & Environment', format: 'number', decimals: 0 },
  { id: 'AG.LND.ARBL.ZS', label: 'Arable Land (%)', category: 'Energy & Environment', format: 'percent', decimals: 1 },
  { id: 'ER.PTD.TOTL.ZS', label: 'Terrestrial Protected Areas (%)', category: 'Energy & Environment', format: 'percent', decimals: 1 },
  { id: 'ER.MRN.PTMR.ZS', label: 'Marine Protected Areas (%)', category: 'Energy & Environment', format: 'percent', decimals: 1 },
  { id: 'SH.H2O.BASW.ZS', label: 'Access to Basic Drinking Water (%)', category: 'Energy & Environment', format: 'percent', decimals: 1 },
  { id: 'SH.STA.BASS.ZS', label: 'Access to Basic Sanitation (%)', category: 'Energy & Environment', format: 'percent', decimals: 1 },

  // ── AGRICULTURE & FOOD (12) ─────────────────────────────────
  { id: 'AG.LND.AGRI.ZS', label: 'Agricultural Land (%)', category: 'Agriculture', format: 'percent', decimals: 1 },
  { id: 'AG.YLD.CREL.KG', label: 'Cereal Yield (kg per hectare)', category: 'Agriculture', format: 'number', decimals: 0 },
  { id: 'AG.PRD.FOOD.XD', label: 'Food Production Index (2014–2016=100)', category: 'Agriculture', format: 'number', decimals: 1 },
  { id: 'AG.PRD.CROP.XD', label: 'Crop Production Index (2014–2016=100)', category: 'Agriculture', format: 'number', decimals: 1 },
  { id: 'AG.PRD.LVSK.XD', label: 'Livestock Production Index (2014–2016=100)', category: 'Agriculture', format: 'number', decimals: 1 },
  { id: 'AG.LND.CREL.HA', label: 'Land Under Cereal Production (hectares)', category: 'Agriculture', format: 'number', decimals: 0 },
  { id: 'ER.FSH.CAPT.MT', label: 'Total Fisheries Production (metric tonnes)', category: 'Agriculture', format: 'number', decimals: 0 },
  { id: 'AG.CON.FERT.ZS', label: 'Fertilizer Consumption (kg per hectare)', category: 'Agriculture', format: 'number', decimals: 1 },
  { id: 'SN.ITK.DEFC.ZS', label: 'Prevalence of Undernourishment (%)', category: 'Agriculture', format: 'percent', decimals: 1 },
  { id: 'AG.LND.IRIG.AG.ZS', label: 'Agricultural Irrigated Land (%)', category: 'Agriculture', format: 'percent', decimals: 1 },
  { id: 'ER.H2O.FWTL.ZS', label: 'Annual Freshwater Withdrawals (% of internal)', category: 'Agriculture', format: 'percent', decimals: 1 },

  // ── TECHNOLOGY & INNOVATION (14) ────────────────────────────
  { id: 'IT.NET.USER.ZS', label: 'Internet Users (%)', category: 'Technology', format: 'percent', decimals: 1 },
  { id: 'IT.CEL.SETS.P2', label: 'Mobile Subscriptions (per 100 people)', category: 'Technology', format: 'number', decimals: 0 },
  { id: 'IT.NET.BBND.P2', label: 'Fixed Broadband Subscriptions (per 100)', category: 'Technology', format: 'number', decimals: 1 },
  { id: 'IT.NET.SECR.P6', label: 'Secure Internet Servers (per million)', category: 'Technology', format: 'number', decimals: 1 },
  { id: 'GB.XPD.RSDV.GD.ZS', label: 'R&D Spending (% of GDP)', category: 'Technology', format: 'percent', decimals: 2 },
  { id: 'IP.PAT.RESD', label: 'Patent Applications, Residents', category: 'Technology', format: 'number' },
  { id: 'IP.PAT.NRES', label: 'Patent Applications, Non-Residents', category: 'Technology', format: 'number' },
  { id: 'IP.JRN.ARTC.SC', label: 'Scientific Journal Articles', category: 'Technology', format: 'number' },
  { id: 'TX.VAL.TECH.CD', label: 'High-Technology Exports (USD)', category: 'Technology', format: 'currency' },
  { id: 'BX.GSR.CCIS.ZS', label: 'ICT Service Exports (% of service exports)', category: 'Technology', format: 'percent', decimals: 1 },
  { id: 'BX.GSR.CCIS.CD', label: 'ICT Service Exports (USD)', category: 'Technology', format: 'currency' },
  { id: 'IP.IDS.RSCT', label: 'Industrial Design Applications, Resident', category: 'Technology', format: 'number' },
  { id: 'SP.POP.SCIE.RD.P6', label: 'Researchers in R&D (per million)', category: 'Technology', format: 'number', decimals: 0 },

  // ── INFRASTRUCTURE (12) ─────────────────────────────────────
  { id: 'IS.AIR.PSGR', label: 'Air Transport, Passengers Carried', category: 'Infrastructure', format: 'number' },
  { id: 'IS.AIR.GOOD.MT.K1', label: 'Air Transport, Freight (million ton-km)', category: 'Infrastructure', format: 'number', decimals: 1 },
  { id: 'IS.SHP.GOOD.TU', label: 'Container Port Traffic (TEU)', category: 'Infrastructure', format: 'number' },
  { id: 'IS.RRS.TOTL.KM', label: 'Rail Lines (total km)', category: 'Infrastructure', format: 'number', decimals: 0 },
  { id: 'IS.RRS.PASG.KM', label: 'Railways, Passengers (million km)', category: 'Infrastructure', format: 'number', decimals: 0 },
  { id: 'IS.RRS.GOOD.MT.K6', label: 'Railways, Goods (million ton-km)', category: 'Infrastructure', format: 'number', decimals: 0 },
  { id: 'LP.LPI.OVRL.XQ', label: 'Logistics Performance Index (1–5)', category: 'Infrastructure', format: 'index', decimals: 2 },
  { id: 'EG.ELC.PETR.ZS', label: 'Electricity from Oil (%)', category: 'Infrastructure', format: 'percent', decimals: 1 },
  { id: 'EG.ELC.NUCL.ZS', label: 'Electricity from Nuclear (%)', category: 'Infrastructure', format: 'percent', decimals: 1 },

  // ── GENDER (12) ─────────────────────────────────────────────
  { id: 'SG.GEN.PARL.ZS', label: 'Women in Parliament (%)', category: 'Gender', format: 'percent', decimals: 1 },
  { id: 'SL.TLF.CACT.FE.NE.ZS', label: 'Female Labor Force Participation, 15+ (%)', category: 'Gender', format: 'percent', decimals: 1 },
  { id: 'SL.EMP.WORK.FE.ZS', label: 'Female Wage & Salaried Workers (%)', category: 'Gender', format: 'percent', decimals: 1 },
  { id: 'SE.PRM.GINT.FE.ZS', label: 'Girls Out-of-School Rate (%)', category: 'Gender', format: 'percent', decimals: 1 },
  { id: 'SP.ADO.TFRT', label: 'Adolescent Fertility Rate (per 1,000)', category: 'Gender', format: 'number', decimals: 1 },
  { id: 'SG.VAW.REAS.ZS', label: 'Women Who Believe Husband Can Beat Wife (%)', category: 'Gender', format: 'percent', decimals: 1 },
  { id: 'SE.PRM.GINT.ZS', label: 'Gender Parity Index, Primary', category: 'Gender', format: 'ratio', decimals: 2 },
  { id: 'SE.ENR.SECO.FM.ZS', label: 'Gender Parity Index, Secondary', category: 'Gender', format: 'ratio', decimals: 2 },

  // ── GOVERNANCE (10) ─────────────────────────────────────────
  { id: 'CC.EST', label: 'Control of Corruption', category: 'Governance', format: 'number', decimals: 2 },
  { id: 'GE.EST', label: 'Government Effectiveness', category: 'Governance', format: 'number', decimals: 2 },
  { id: 'PV.EST', label: 'Political Stability', category: 'Governance', format: 'number', decimals: 2 },
  { id: 'RQ.EST', label: 'Regulatory Quality', category: 'Governance', format: 'number', decimals: 2 },
  { id: 'RL.EST', label: 'Rule of Law', category: 'Governance', format: 'number', decimals: 2 },
  { id: 'VA.EST', label: 'Voice & Accountability', category: 'Governance', format: 'number', decimals: 2 },
  { id: 'CC.PER.RNK', label: 'Control of Corruption (percentile rank)', category: 'Governance', format: 'percent', decimals: 1 },
  { id: 'GE.PER.RNK', label: 'Government Effectiveness (percentile rank)', category: 'Governance', format: 'percent', decimals: 1 },
  { id: 'RL.PER.RNK', label: 'Rule of Law (percentile rank)', category: 'Governance', format: 'percent', decimals: 1 },
  { id: 'PV.PER.RNK', label: 'Political Stability (percentile rank)', category: 'Governance', format: 'percent', decimals: 1 },

  // ── MILITARY (6) ────────────────────────────────────────────
  { id: 'MS.MIL.XPND.GD.ZS', label: 'Military Spending (% of GDP)', category: 'Military', format: 'percent', decimals: 1 },
  { id: 'MS.MIL.XPND.CD', label: 'Military Expenditure (USD)', category: 'Military', format: 'currency' },
  { id: 'MS.MIL.TOTL.P1', label: 'Armed Forces Personnel', category: 'Military', format: 'number' },
  { id: 'MS.MIL.TOTL.TF.ZS', label: 'Armed Forces (% of labor force)', category: 'Military', format: 'percent', decimals: 1 },
  { id: 'MS.MIL.XPND.ZS', label: 'Military Spending (% of govt expenditure)', category: 'Military', format: 'percent', decimals: 1 },
  { id: 'VC.IHR.PSRC.P5', label: 'Intentional Homicides (per 100,000)', category: 'Military', format: 'number', decimals: 1 },

  // ── POVERTY & INEQUALITY (12) ──────────────────────────────
  { id: 'SI.POV.DDAY', label: 'Poverty at $2.15/day (%)', category: 'Poverty & Inequality', format: 'percent', decimals: 1 },
  { id: 'SI.POV.LMIC', label: 'Poverty at $3.65/day (%)', category: 'Poverty & Inequality', format: 'percent', decimals: 1 },
  { id: 'SI.POV.UMIC', label: 'Poverty at $6.85/day (%)', category: 'Poverty & Inequality', format: 'percent', decimals: 1 },
  { id: 'SI.POV.NAHC', label: 'Poverty Headcount, National (%)', category: 'Poverty & Inequality', format: 'percent', decimals: 1 },
  { id: 'SI.POV.GINI', label: 'Gini Index', category: 'Poverty & Inequality', format: 'number', decimals: 1 },
  { id: 'SI.DST.10TH.10', label: 'Income Share, Top 10%', category: 'Poverty & Inequality', format: 'percent', decimals: 1 },
  { id: 'SI.DST.FRST.10', label: 'Income Share, Bottom 10%', category: 'Poverty & Inequality', format: 'percent', decimals: 1 },
  { id: 'SI.DST.05TH.20', label: 'Income Share, Top 20%', category: 'Poverty & Inequality', format: 'percent', decimals: 1 },
  { id: 'SI.DST.FRST.20', label: 'Income Share, Bottom 20%', category: 'Poverty & Inequality', format: 'percent', decimals: 1 },
  { id: 'SI.SPR.PCAP.ZG', label: 'Shared Prosperity Premium (%)', category: 'Poverty & Inequality', format: 'percent', decimals: 1 },
  { id: 'SI.SPR.PCAP', label: 'Survey Mean Consumption (2017 PPP $ per day)', category: 'Poverty & Inequality', format: 'number', decimals: 2 },
  { id: 'SI.POV.GAPS', label: 'Poverty Gap at $2.15/day (%)', category: 'Poverty & Inequality', format: 'percent', decimals: 1 },

  // ── SOCIAL PROTECTION (8) ──────────────────────────────────
  { id: 'per_si_allsi.cov_pop_tot', label: 'Social Insurance Coverage (%)', category: 'Social Protection', format: 'percent', decimals: 1 },
  { id: 'per_sa_allsa.cov_pop_tot', label: 'Social Assistance Coverage (%)', category: 'Social Protection', format: 'percent', decimals: 1 },
  { id: 'per_lm_alllm.cov_pop_tot', label: 'Labor Market Programs Coverage (%)', category: 'Social Protection', format: 'percent', decimals: 1 },
  { id: 'per_allsp.cov_pop_tot', label: 'Social Protection Coverage (%)', category: 'Social Protection', format: 'percent', decimals: 1 },
  { id: 'HD.HCI.OVRL', label: 'Human Capital Index (0–1)', category: 'Social Protection', format: 'index', decimals: 2 },
  { id: 'HD.HCI.OVRL.FE', label: 'Human Capital Index, Female', category: 'Social Protection', format: 'index', decimals: 2 },
  { id: 'HD.HCI.OVRL.MA', label: 'Human Capital Index, Male', category: 'Social Protection', format: 'index', decimals: 2 },
  { id: 'HD.HCI.LAYS', label: 'Learning-Adjusted Years of School', category: 'Social Protection', format: 'years', decimals: 1 },

  // ── TOURISM (6) ─────────────────────────────────────────────
  { id: 'ST.INT.ARVL', label: 'International Tourism, Arrivals', category: 'Tourism', format: 'number' },
  { id: 'ST.INT.DPRT', label: 'International Tourism, Departures', category: 'Tourism', format: 'number' },
  { id: 'ST.INT.RCPT.CD', label: 'Tourism Receipts (USD)', category: 'Tourism', format: 'currency' },
  { id: 'ST.INT.XPND.CD', label: 'Tourism Expenditures (USD)', category: 'Tourism', format: 'currency' },
  { id: 'ST.INT.RCPT.XP.ZS', label: 'Tourism Receipts (% of total exports)', category: 'Tourism', format: 'percent', decimals: 1 },
  { id: 'ST.INT.TRNR.CD', label: 'International Tourism, Transport Services (USD)', category: 'Tourism', format: 'currency' },

  // ── URBAN DEVELOPMENT (8) ──────────────────────────────────
  { id: 'SP.URB.GROW', label: 'Urban Population Growth (%)', category: 'Urban Development', format: 'percent', decimals: 1 },
  { id: 'EN.URB.LCTY', label: 'Population in Largest City', category: 'Urban Development', format: 'number' },
  { id: 'EN.URB.LCTY.UR.ZS', label: 'Population in Largest City (% of urban)', category: 'Urban Development', format: 'percent', decimals: 1 },
  { id: 'EN.URB.MCTY.TL.ZS', label: 'Population in Agglomerations >1M (% of total)', category: 'Urban Development', format: 'percent', decimals: 1 },
  { id: 'EN.POP.SLUM.UR.ZS', label: 'Population in Slums (% of urban)', category: 'Urban Development', format: 'percent', decimals: 1 },
  { id: 'SP.RUR.TOTL.ZG', label: 'Rural Population Growth (%)', category: 'Urban Development', format: 'percent', decimals: 1 },
  { id: 'SH.H2O.SMDW.ZS', label: 'Access to Safely Managed Drinking Water (%)', category: 'Urban Development', format: 'percent', decimals: 1 },
  { id: 'SH.STA.SMSS.ZS', label: 'Access to Safely Managed Sanitation (%)', category: 'Urban Development', format: 'percent', decimals: 1 },

  // ── PRIVATE SECTOR & ENTERPRISE (8) ────────────────────────
  { id: 'IC.FRM.CORR.ZS', label: 'Firms Expected to Pay Bribes (%)', category: 'Private Sector', format: 'percent', decimals: 1 },
  { id: 'IC.FRM.FEMO.ZS', label: 'Firms with Female Top Manager (%)', category: 'Private Sector', format: 'percent', decimals: 1 },
  { id: 'IC.FRM.FEMM.ZS', label: 'Firms with Female Participation in Ownership (%)', category: 'Private Sector', format: 'percent', decimals: 1 },
  { id: 'IC.FRM.TRNG.ZS', label: 'Firms Offering Training (%)', category: 'Private Sector', format: 'percent', decimals: 1 },
  { id: 'IC.FRM.DURS', label: 'Average Firm Age (years)', category: 'Private Sector', format: 'years', decimals: 0 },
  { id: 'IC.FRM.CMPU.ZS', label: 'Firms Using Computers (%)', category: 'Private Sector', format: 'percent', decimals: 1 },
];

// All unique categories in display order
export const CATEGORIES = [
  'Economy', 'Fiscal & Monetary', 'Trade', 'External Debt', 'Finance',
  'Business Environment', 'Private Sector',
  'People', 'Labor', 'Education', 'Health',
  'Energy & Environment', 'Agriculture', 'Technology', 'Infrastructure',
  'Gender', 'Governance', 'Military', 'Poverty & Inequality',
  'Social Protection', 'Tourism', 'Urban Development',
];

// ============================================================
// DATA FETCHING — All data from Supabase (seeded from IMF + World Bank)
// Tables: sotw_countries, sotw_indicators
// ============================================================

import { supabase } from './supabase';

// IMF stores GDP in billions — multiply by 1e9 for proper formatting
const IMF_BILLIONS = new Set(['IMF.NGDPD', 'IMF.PPPGDP']);

function adjustValue(indicatorId: string, value: number | null): number | null {
  if (value === null) return null;
  if (IMF_BILLIONS.has(indicatorId)) return value * 1e9;
  return value;
}

export async function getCountries(): Promise<CountryData[]> {
  const { data, error } = await supabase
    .from('sotw_countries')
    .select('id, iso2, name, region, income_level, capital_city, longitude, latitude')
    .order('name');
  if (error || !data) return [];
  return data.map((c) => ({
    id: c.id,
    iso2: c.iso2 || c.id.toLowerCase().slice(0, 2),
    name: c.name,
    region: c.region,
    incomeLevel: c.income_level,
    capitalCity: c.capital_city,
    longitude: c.longitude ? String(c.longitude) : '',
    latitude: c.latitude ? String(c.latitude) : '',
  }));
}

export async function getCountry(id: string): Promise<CountryData | null> {
  const { data, error } = await supabase
    .from('sotw_countries')
    .select('id, iso2, name, region, income_level, capital_city, longitude, latitude')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    iso2: data.iso2 || data.id.toLowerCase().slice(0, 2),
    name: data.name,
    region: data.region,
    incomeLevel: data.income_level,
    capitalCity: data.capital_city,
    longitude: data.longitude ? String(data.longitude) : '',
    latitude: data.latitude ? String(data.latitude) : '',
  };
}

export async function getAllIndicatorsForCountry(countryId: string): Promise<Record<string, { year: string; value: number | null }>> {
  const { data, error } = await supabase
    .from('sotw_indicators')
    .select('id, value, year')
    .eq('country_id', countryId);
  if (error || !data) return {};
  const results: Record<string, { year: string; value: number | null }> = {};
  for (const row of data) {
    results[row.id] = { year: String(row.year), value: adjustValue(row.id, row.value) };
  }
  return results;
}

export async function getIndicatorForAllCountries(indicatorId: string): Promise<{ country: string; countryId: string; value: number | null; year: string }[]> {
  const { data, error } = await supabase
    .from('sotw_indicators')
    .select('country_id, value, year, sotw_countries(name, iso2)')
    .eq('id', indicatorId)
    .not('value', 'is', null)
    .order('value', { ascending: false });
  if (error || !data) return [];
  return data.map((row: any) => ({
    country: row.sotw_countries?.name || row.country_id,
    countryId: row.country_id,
    iso2: row.sotw_countries?.iso2 || row.country_id.toLowerCase().slice(0, 2),
    value: adjustValue(indicatorId, row.value),
    year: String(row.year),
  }));
}

export async function getTop10AllIndicators(): Promise<Record<string, { country: string; countryId: string; iso2: string; value: number; year: string }[]>> {
  // Fetch country names + iso2 first (fast, ~217 rows)
  const countries = await getCountries();
  const countryMap = new Map(countries.map(c => [c.id, { name: c.name, iso2: c.iso2 }]));

  // Fetch all indicator data in pages (Supabase default limit is 1000)
  const allRows: { id: string; country_id: string; value: number; year: number }[] = [];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from('sotw_indicators')
      .select('id, country_id, value, year')
      .not('value', 'is', null)
      .range(offset, offset + pageSize - 1);
    if (error || !data || data.length === 0) break;
    allRows.push(...(data as any[]));
    if (data.length < pageSize) break;
  }

  // Group by indicator, sort each group by value descending, take top 10
  const grouped: Record<string, { country: string; countryId: string; iso2: string; value: number; year: string }[]> = {};
  for (const row of allRows) {
    if (!grouped[row.id]) grouped[row.id] = [];
    const c = countryMap.get(row.country_id);
    grouped[row.id].push({
      country: c?.name || row.country_id,
      countryId: row.country_id,
      iso2: c?.iso2 || row.country_id.toLowerCase().slice(0, 2),
      value: adjustValue(row.id, row.value) as number,
      year: String(row.year),
    });
  }
  for (const id of Object.keys(grouped)) {
    grouped[id].sort((a, b) => (b.value || 0) - (a.value || 0));
    grouped[id] = grouped[id].slice(0, 10);
  }
  return grouped;
}

// ============================================================
// MULTI-SOURCE INDICATORS
// Same metric reported by different organizations
// ============================================================

export interface MultiSourceGroup {
  label: string;
  sources: { id: string; org: string; year?: string }[];
}

export const MULTI_SOURCE: Record<string, MultiSourceGroup> = {
  // === GDP & NATIONAL ACCOUNTS (IMF forecasts vs WB/UN actuals) ===
  'IMF.NGDPD': {
    label: 'GDP (Nominal)',
    sources: [
      { id: 'IMF.NGDPD', org: 'IMF' },
      { id: 'NY.GDP.MKTP.CD', org: 'World Bank' },
      { id: 'UN.GDP', org: 'United Nations' },
    ],
  },
  'IMF.NGDPDPC': {
    label: 'GDP per Capita',
    sources: [
      { id: 'IMF.NGDPDPC', org: 'IMF' },
      { id: 'NY.GDP.PCAP.CD', org: 'World Bank' },
      { id: 'UN.GDPPC', org: 'United Nations' },
    ],
  },
  'IMF.NGDP_RPCH': {
    label: 'Real GDP Growth',
    sources: [
      { id: 'IMF.NGDP_RPCH', org: 'IMF' },
      { id: 'NY.GDP.MKTP.KD.ZG', org: 'World Bank' },
      { id: 'UN.GDPGR', org: 'United Nations' },
    ],
  },
  'IMF.PPPGDP': {
    label: 'GDP, PPP',
    sources: [
      { id: 'IMF.PPPGDP', org: 'IMF' },
      { id: 'NY.GDP.MKTP.PP.CD', org: 'World Bank' },
    ],
  },
  'IMF.PPPPC': {
    label: 'GDP per Capita, PPP',
    sources: [
      { id: 'IMF.PPPPC', org: 'IMF' },
      { id: 'NY.GDP.PCAP.PP.CD', org: 'World Bank' },
    ],
  },
  // === GNI (WB vs UN) ===
  'NY.GNP.MKTP.CD': {
    label: 'GNI (Current USD)',
    sources: [
      { id: 'NY.GNP.MKTP.CD', org: 'World Bank' },
      { id: 'UN.GNI', org: 'United Nations' },
    ],
  },
  'NY.GNP.PCAP.CD': {
    label: 'GNI per Capita',
    sources: [
      { id: 'NY.GNP.PCAP.CD', org: 'World Bank' },
      { id: 'UN.GNIPC', org: 'United Nations' },
    ],
  },
  // === FISCAL & MONETARY ===
  'IMF.PCPIPCH': {
    label: 'Inflation (CPI)',
    sources: [
      { id: 'IMF.PCPIPCH', org: 'IMF' },
      { id: 'FP.CPI.TOTL.ZG', org: 'World Bank' },
    ],
  },
  'IMF.LUR': {
    label: 'Unemployment Rate',
    sources: [
      { id: 'IMF.LUR', org: 'IMF' },
      { id: 'SL.UEM.TOTL.ZS', org: 'World Bank (ILO)' },
    ],
  },
  'IMF.GGXWDG_NGDP': {
    label: 'Government Debt (% of GDP)',
    sources: [
      { id: 'IMF.GGXWDG_NGDP', org: 'IMF' },
      { id: 'GC.DOD.TOTL.GD.ZS', org: 'World Bank' },
    ],
  },
  'IMF.BCA_NGDPD': {
    label: 'Current Account Balance',
    sources: [
      { id: 'IMF.BCA_NGDPD', org: 'IMF' },
      { id: 'BN.CAB.XOKA.GD.ZS', org: 'World Bank' },
    ],
  },
  'IMF.NI_GDP': {
    label: 'Total Investment (% of GDP)',
    sources: [
      { id: 'IMF.NI_GDP', org: 'IMF' },
      { id: 'NE.GDI.TOTL.ZS', org: 'World Bank' },
    ],
  },
  'IMF.NGS_GDP': {
    label: 'Gross National Savings',
    sources: [
      { id: 'IMF.NGS_GDP', org: 'IMF' },
      { id: 'NY.GNS.ICTR.ZS', org: 'World Bank' },
    ],
  },
};

// Also map WB equivalents back to their group
for (const [key, group] of Object.entries(MULTI_SOURCE)) {
  for (const src of group.sources) {
    if (src.id !== key && !MULTI_SOURCE[src.id]) {
      MULTI_SOURCE[src.id] = group;
    }
  }
}

export async function getMultiSourceData(groupKey: string): Promise<{
  sources: { id: string; org: string }[];
  countries: { countryId: string; country: string; iso2: string; values: Record<string, { value: number | null; year: string }> }[];
}> {
  const group = MULTI_SOURCE[groupKey];
  if (!group) return { sources: [], countries: [] };

  const countries = await getCountries();
  const countryMap = new Map(countries.map(c => [c.id, { name: c.name, iso2: c.iso2 }]));

  // Fetch data for all sources
  const allData: Record<string, Record<string, { value: number | null; year: string }>> = {};
  for (const src of group.sources) {
    const { data } = await supabase
      .from('sotw_indicators')
      .select('country_id, value, year')
      .eq('id', src.id)
      .not('value', 'is', null);
    if (data) {
      for (const row of data) {
        if (!allData[row.country_id]) allData[row.country_id] = {};
        allData[row.country_id][src.id] = {
          value: adjustValue(src.id, row.value),
          year: String(row.year),
        };
      }
    }
  }

  // Build country rows, sorted by first source value
  const primaryId = group.sources[0].id;
  const rows = Object.entries(allData)
    .filter(([cid]) => countryMap.has(cid))
    .map(([cid, values]) => ({
      countryId: cid,
      country: countryMap.get(cid)!.name,
      iso2: countryMap.get(cid)!.iso2,
      values,
    }))
    .sort((a, b) => {
      const aVal = a.values[primaryId]?.value ?? -Infinity;
      const bVal = b.values[primaryId]?.value ?? -Infinity;
      return (bVal as number) - (aVal as number);
    });

  return { sources: group.sources, countries: rows };
}

// ============================================================
// FORMATTING
// ============================================================

export function formatValue(value: number | null, format: string, decimals: number = 0): string {
  if (value === null || value === undefined) return 'N/A';

  switch (format) {
    case 'currency':
      if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
      if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
      if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
      if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
      return `$${value.toFixed(decimals)}`;
    case 'percent':
      return `${value.toFixed(decimals ?? 1)}%`;
    case 'years':
      return `${value.toFixed(decimals ?? 1)} years`;
    case 'ratio':
      return value.toFixed(decimals ?? 2);
    case 'index':
      return value.toFixed(decimals ?? 1);
    case 'number':
    default:
      if (Math.abs(value) >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
      if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
      if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
      if (Math.abs(value) >= 1e3) return new Intl.NumberFormat('en-US', { maximumFractionDigits: decimals ?? 0 }).format(value);
      return value.toFixed(decimals ?? 0);
  }
}

