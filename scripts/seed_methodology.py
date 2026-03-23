#!/usr/bin/env python3
"""
Seed rich methodology content for key indicators.
This provides Wikipedia-depth descriptions, methodology notes, and limitations
for the most important indicators — drives SEO and builds trust.
"""

import os
import socket
import psycopg2

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "db.seyrycaldytfjvvkqopu.supabase.co")
# Force IPv4 (GitHub Actions runners fail on IPv6)
import socket as _socket
_orig_getaddrinfo = _socket.getaddrinfo
def _ipv4_getaddrinfo(host, port, family=0, *args, **kwargs):
    return _orig_getaddrinfo(host, port, _socket.AF_INET, *args, **kwargs)
_socket.getaddrinfo = _ipv4_getaddrinfo
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")
DB = dict(
    host=DB_HOST, port=5432, dbname="postgres", user="postgres",
    password=DB_PASS, sslmode="require",
)

META_TABLE = "sotw_indicator_meta"

# Curated methodology content for key indicators
METHODOLOGY = {
    "IMF.NGDPD": {
        "description": "Gross Domestic Product (GDP) at current prices in US dollars. GDP is the total market value of all final goods and services produced within a country's borders in a given year. This measure uses nominal exchange rates to convert local currency values to US dollars.",
        "methodology": "The IMF compiles GDP data from national statistical agencies and central banks. For the World Economic Outlook (WEO), IMF staff review national accounts data, apply adjustments for methodological differences, and produce forecasts for the current and following years. GDP is calculated using the expenditure approach (C + I + G + NX) or the production approach (sum of value added across sectors). The conversion to US dollars uses the average market exchange rate for the year.",
        "limitations": "Nominal GDP comparisons across countries are affected by exchange rate fluctuations. A country's GDP in USD can change significantly due to currency movements even if real output is stable. GDP also does not capture the informal economy, environmental degradation, income inequality, or unpaid household labor. PPP-adjusted GDP provides more meaningful cross-country comparisons of living standards.",
        "unit": "Current USD, Billions",
        "frequency": "Annual (with IMF forecasts for current + 5 future years)",
    },
    "IMF.NGDPDPC": {
        "description": "GDP per capita is the gross domestic product divided by the midyear population. It provides a rough measure of average economic output per person and is widely used as an indicator of a country's standard of living.",
        "methodology": "Calculated by dividing nominal GDP (in current USD) by the total midyear population. The IMF uses its own GDP estimates and UN population projections. This measure uses market exchange rates for currency conversion.",
        "limitations": "GDP per capita is an average and does not reflect income distribution. A country with high GDP per capita may have significant poverty if wealth is concentrated. It also doesn't account for purchasing power differences between countries. PPP-adjusted GDP per capita (IMF.PPPPC) is generally preferred for standard-of-living comparisons.",
        "unit": "Current USD",
        "frequency": "Annual",
    },
    "IMF.NGDP_RPCH": {
        "description": "Real GDP growth is the annual percentage change in GDP after adjusting for inflation. It measures the actual increase in economic output and is the primary indicator of economic expansion or contraction.",
        "methodology": "Calculated as the percentage change in real GDP (GDP at constant prices) from one year to the next. Real GDP removes the effect of price changes by using a base year's prices (or chain-linked volumes). The IMF calculates this from national accounts data submitted by member countries.",
        "limitations": "GDP growth can be volatile in small economies or commodity-dependent countries. It doesn't capture structural changes in the economy or quality improvements in goods and services. Quarterly GDP data (where available) provides a more timely picture than annual figures.",
        "unit": "Percent change",
        "frequency": "Annual",
    },
    "IMF.PPPPC": {
        "description": "GDP per capita based on purchasing power parity (PPP) in international dollars. PPP adjusts for price differences between countries, making it more suitable for comparing living standards across nations than nominal GDP per capita.",
        "methodology": "PPP conversion factors are derived from the International Comparison Program (ICP), a worldwide statistical partnership coordinated by the World Bank. These factors equalize the purchasing power of different currencies by accounting for price differences of comparable goods and services. The IMF uses ICP benchmark data and extrapolates between benchmark years using relative GDP deflators.",
        "limitations": "PPP estimates are based on price surveys conducted infrequently (every few years). Between surveys, PPP factors are extrapolated, which can introduce errors. The basket of goods used for comparison may not reflect actual consumption patterns in all countries. Despite limitations, PPP is considered the gold standard for cross-country living standard comparisons.",
        "unit": "International Dollars",
        "frequency": "Annual",
    },
    "IMF.PCPIPCH": {
        "description": "The annual percentage change in the Consumer Price Index (CPI). This is the primary measure of inflation, tracking the average change in prices paid by consumers for a basket of goods and services over time.",
        "methodology": "National statistical agencies calculate CPI by tracking prices of a representative basket of consumer goods and services (food, housing, transportation, healthcare, etc.). The basket is weighted by typical household expenditure patterns. The IMF aggregates national CPI data and produces harmonized inflation estimates.",
        "limitations": "CPI may not accurately reflect inflation experienced by all population groups — the elderly, rural populations, or low-income households may face different price changes. Quality improvements in goods (e.g., faster computers at the same price) create measurement challenges. Housing costs and asset prices are often underrepresented in CPI baskets.",
        "unit": "Percent change, annual average",
        "frequency": "Annual",
    },
    "IMF.LUR": {
        "description": "The unemployment rate as a percentage of the total labor force. Measures the share of the labor force that is without work but actively seeking employment and available to work.",
        "methodology": "Most countries follow the International Labour Organization (ILO) definition: unemployed persons are those of working age who are without work, have actively sought work in the past four weeks, and are available to take up work. The labor force includes both employed and unemployed persons. The IMF compiles data from national labor force surveys and administrative records.",
        "limitations": "The unemployment rate can understate labor market weakness because it excludes discouraged workers (who have stopped looking for work), underemployed workers (part-time workers who want full-time work), and the informally employed. Youth unemployment and long-term unemployment rates provide additional important context.",
        "unit": "Percent of labor force",
        "frequency": "Annual",
    },
    "IMF.GGXWDG_NGDP": {
        "description": "Total gross government debt as a percentage of GDP. This indicator measures the total outstanding liabilities of the general government sector, including central, state/provincial, and local governments.",
        "methodology": "Government debt includes all liabilities that require payment of interest and/or principal by the debtor in the future. This includes debt securities, loans, and other accounts payable. The IMF follows the Government Finance Statistics Manual (GFSM 2014) framework. Debt is reported on a gross basis (not netted against government assets).",
        "limitations": "Gross debt overstates fiscal vulnerability for countries with large government assets (e.g., sovereign wealth funds). It also excludes contingent liabilities, public enterprise debt, and unfunded pension obligations, which can be significant. Cross-country comparisons can be affected by different government structures (federal vs. unitary states).",
        "unit": "Percent of GDP",
        "frequency": "Annual",
    },
    "SP.POP.TOTL": {
        "description": "Total population is based on the de facto definition, which counts all residents regardless of legal status or citizenship. It includes all people living in a country, including foreign nationals, but excludes citizens living abroad.",
        "methodology": "Population data comes from national population censuses (typically conducted every 10 years) and inter-censal estimates produced by national statistical offices. The World Bank aggregates data from the United Nations Population Division, which harmonizes national data using demographic methods (cohort-component projection models). Estimates account for undercounting in censuses.",
        "limitations": "Census accuracy varies significantly across countries. Population estimates between census years involve assumptions about fertility, mortality, and migration that may not hold. Some countries have not conducted a census in decades. Refugee populations and undocumented migrants create additional measurement challenges.",
        "unit": "Persons",
        "frequency": "Annual (based on mid-year estimates)",
    },
    "SP.DYN.LE00.IN": {
        "description": "Life expectancy at birth indicates the number of years a newborn infant would live if prevailing patterns of mortality at the time of its birth were to stay the same throughout its life. It is a key indicator of population health and development.",
        "methodology": "Life expectancy is calculated from life tables, which are constructed using age-specific death rates derived from vital registration systems or sample surveys. The World Bank sources this data from the UN Population Division, which uses demographic estimation techniques when vital registration is incomplete. The calculation assumes that current age-specific mortality rates remain constant throughout a person's life.",
        "limitations": "Life expectancy is a period measure and does not predict actual longevity of any individual or cohort. In countries with improving health systems, actual longevity will typically exceed the period life expectancy. The measure can be heavily influenced by infant mortality — countries with high child death rates will have lower life expectancy even if adults who survive childhood live long lives.",
        "unit": "Years",
        "frequency": "Annual",
    },
    "SI.POV.GINI": {
        "description": "The Gini index measures the extent to which the distribution of income among individuals or households within an economy deviates from a perfectly equal distribution. A Gini of 0 represents perfect equality (everyone has the same income), while 100 represents perfect inequality (one person has all the income).",
        "methodology": "The Gini coefficient is calculated from household survey data on income or consumption. The World Bank calculates it from the Lorenz curve, which plots the cumulative share of income against the cumulative share of the population (ranked from poorest to richest). The Gini equals 1 minus twice the area under the Lorenz curve. Data comes from national household surveys harmonized under the World Bank's PovcalNet project.",
        "limitations": "Gini coefficients are not always comparable across countries due to differences in survey methodology (income vs. consumption, gross vs. net income, household vs. individual). The Gini is insensitive to where in the distribution inequality occurs — the same Gini value can result from very different distribution shapes. Survey data may undercount income at the very top (billionaires) and bottom (informal/subsistence economies).",
        "unit": "Index (0-100)",
        "frequency": "Irregular (depends on household survey availability)",
    },
    "SE.ADT.LITR.ZS": {
        "description": "Adult literacy rate is the percentage of people aged 15 and above who can both read and write with understanding a short simple statement about their everyday life.",
        "methodology": "Literacy data comes from population censuses and household surveys. The UNESCO Institute for Statistics (UIS) is the primary source. In some countries, literacy is self-reported; in others, it is tested directly. The World Bank uses UIS estimates, which apply statistical modeling to fill gaps between survey years.",
        "limitations": "The binary literate/illiterate classification is crude — it doesn't capture functional literacy or numeracy levels. Self-reported literacy tends to overstate actual literacy. Many high-income countries no longer collect literacy data because near-universal literacy is assumed, making cross-country comparisons incomplete.",
        "unit": "Percent of population age 15+",
        "frequency": "Irregular",
    },
    "SH.XPD.CHEX.GD.ZS": {
        "description": "Current health expenditure as a percentage of GDP. Includes both public and private spending on health services, medical goods, public health programs, and health administration, but excludes capital investment in health infrastructure.",
        "methodology": "Data is compiled from the WHO Global Health Expenditure Database, which uses the System of Health Accounts (SHA 2011) framework. National health accounts track financial flows from funding sources (government, insurance, out-of-pocket) through financing agents to health care providers and functions.",
        "limitations": "Health spending levels don't directly correlate with health outcomes — the US spends the most on healthcare per capita but ranks poorly on life expectancy among high-income countries. The measure doesn't capture quality of care, access equity, or health system efficiency. Informal healthcare spending and traditional medicine may be underreported.",
        "unit": "Percent of GDP",
        "frequency": "Annual",
    },
    "EN.GHG.CO2.PC.CE.AR5": {
        "description": "Carbon dioxide emissions per capita from the burning of fossil fuels and cement manufacture, measured in metric tons. This is the primary indicator of a country's carbon footprint relative to its population.",
        "methodology": "CO2 emissions are estimated from energy consumption data (fossil fuel combustion) and industrial process data (primarily cement production). The primary data sources are the International Energy Agency (IEA) and the Carbon Dioxide Information Analysis Center (CDIAC). Per capita figures use UN population estimates.",
        "limitations": "Production-based emissions (measured here) don't account for emissions embedded in international trade. A country that imports manufactured goods may have low measured emissions while its consumption drives emissions elsewhere. This measure also excludes other greenhouse gases (methane, N2O) and land-use change emissions.",
        "unit": "Metric tons per capita",
        "frequency": "Annual",
    },
}


def main():
    conn = psycopg2.connect(**DB)
    cur = conn.cursor()

    updated = 0
    for ind_id, content in METHODOLOGY.items():
        cur.execute(f"""
            UPDATE {META_TABLE} SET
                description = COALESCE(%s, description),
                methodology = COALESCE(%s, methodology),
                limitations = COALESCE(%s, limitations),
                unit = COALESCE(%s, unit),
                frequency = COALESCE(%s, frequency),
                last_updated = NOW()
            WHERE id = %s
        """, (
            content.get("description"),
            content.get("methodology"),
            content.get("limitations"),
            content.get("unit"),
            content.get("frequency"),
            ind_id,
        ))

        if cur.rowcount == 0:
            # Insert if not exists
            cur.execute(f"""
                INSERT INTO {META_TABLE} (id, description, methodology, limitations, unit, frequency, source_name)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    description = EXCLUDED.description,
                    methodology = EXCLUDED.methodology,
                    limitations = EXCLUDED.limitations,
                    unit = EXCLUDED.unit,
                    frequency = EXCLUDED.frequency,
                    last_updated = NOW()
            """, (
                ind_id,
                content.get("description"),
                content.get("methodology"),
                content.get("limitations"),
                content.get("unit"),
                content.get("frequency"),
                "IMF" if ind_id.startswith("IMF.") else "World Bank",
            ))

        updated += 1

    conn.commit()
    conn.close()
    print(f"Updated methodology for {updated} indicators")


if __name__ == "__main__":
    main()
