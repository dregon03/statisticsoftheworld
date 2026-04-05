import Link from 'next/link';
import { getIndicatorForAllCountries, INDICATORS, formatValue } from '@/lib/data';
import { BLOG_POSTS } from '@/lib/blog-posts';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Flag from '../../Flag';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { getCleanCountryIndicatorUrl } from '@/lib/country-slugs';

// Expert editorial content for top ranking pages — what FedPay does well
const EDITORIAL: Record<string, string[]> = {
  'gdp': [
    'Gross Domestic Product (GDP) measures the total monetary value of all goods and services produced within a country\'s borders in a given year. It is the single most widely used indicator of economic size and is published by the International Monetary Fund (IMF) in their World Economic Outlook, released biannually in April and October. The nominal GDP figures on this page are expressed in current US dollars — meaning they reflect both real output changes and exchange rate movements against the dollar.',
    'The global economy is heavily concentrated: the United States and China together account for over 40% of world GDP, and the top 10 economies produce roughly two-thirds of all global output. This concentration has deepened over the past two decades as the US economy grew through technology-led productivity gains and China industrialized at an unprecedented pace. India, now the fourth or fifth largest economy depending on the data vintage, has emerged as the fastest-growing major economy.',
    'When comparing GDP across countries, it\'s important to understand what the number does and doesn\'t capture. Nominal GDP in US dollars is sensitive to exchange rate fluctuations — a country\'s GDP can shrink in dollar terms even if its domestic economy is growing, simply because its currency weakened. For a fairer cross-country comparison of living standards, economists prefer GDP per capita adjusted for purchasing power parity (PPP). GDP also does not measure wealth distribution, environmental sustainability, or quality of life — a country can have a high GDP while most citizens remain poor.',
  ],
  'population': [
    'Population figures represent the total number of people living within a country\'s borders as of mid-year, based on estimates from the World Bank using United Nations Population Division data. These figures include all residents regardless of citizenship status but exclude refugees not permanently settled. The data is revised annually as countries conduct censuses and update vital statistics.',
    'Global population crossed 8 billion in late 2022 and is projected to reach 8.5 billion by 2030. However, growth rates have slowed dramatically: the world population growth rate has fallen from over 2% in the 1960s to about 0.8% today. This deceleration is driven by falling fertility rates across virtually every region — even sub-Saharan Africa, the last region with high fertility, is now seeing declines. India overtook China as the most populous country in 2023, a milestone that reflects China\'s decades-old one-child policy and its lasting demographic consequences.',
    'Population size alone tells you little about a country\'s economic capacity or quality of life. Nigeria has a larger population than Germany but a fraction of its GDP. What matters for economic analysis is the interaction between population, age structure, and productivity. Countries with large working-age populations (the "demographic dividend") can grow faster if they can productively employ their youth — this is the opportunity facing India, Indonesia, and parts of Africa. Countries with aging populations (Japan, South Korea, much of Europe) face the opposite challenge: shrinking labor forces and rising dependency ratios.',
  ],
  'inflation-rate': [
    'Inflation rate measures the annual percentage change in consumer prices — how much more (or less) expensive a typical basket of goods and services has become compared to the previous year. The figures on this page come from the IMF\'s World Economic Outlook, which compiles consumer price index (CPI) data from national statistical agencies and produces projections for current and future years.',
    'After decades of low and stable inflation in advanced economies, the post-pandemic period brought a global inflation shock. Supply chain disruptions, energy price spikes driven by Russia\'s invasion of Ukraine, and the lingering effects of massive fiscal stimulus combined to push inflation to levels not seen since the 1970s in many countries. Central banks responded with aggressive interest rate hikes — the US Federal Reserve raised rates from near-zero to over 5% in 18 months, and the European Central Bank followed a similar trajectory.',
    'When comparing inflation across countries, context matters enormously. A 3% inflation rate in Switzerland represents a different economic reality than 3% in Turkey, because Switzerland is coming from a baseline of decades of price stability while Turkey has experienced chronic inflation. Similarly, headline inflation numbers can be misleading if driven by volatile food and energy prices — core inflation (excluding food and energy) is often a better guide to underlying price pressures. Countries with inflation consistently above 10% typically have structural fiscal or monetary policy problems that simple interest rate adjustments cannot fix.',
  ],
  'unemployment-rate': [
    'The unemployment rate measures the percentage of the labor force that is actively seeking work but unable to find it. It is perhaps the most politically sensitive economic indicator — high unemployment affects real people\'s lives in ways that abstract GDP numbers don\'t. The figures on this page come from the IMF, which harmonizes data from national labor force surveys to enable cross-country comparison.',
    'Unemployment rates vary enormously across countries, from below 2% in some East Asian and Gulf economies to over 25% in parts of Southern Africa and the Middle East. However, the headline number can be misleading. Countries with very low official unemployment may have high underemployment (people working part-time who want full-time work) or large informal sectors not captured in official statistics. Conversely, some countries with moderate unemployment rates have robust safety nets that allow people to search longer for suitable work rather than accepting the first available job.',
    'Youth unemployment — the unemployment rate for ages 15-24 — is typically two to three times higher than the overall rate, and is one of the most important indicators of social stability. Countries with very high youth unemployment (Southern Europe, North Africa, parts of the Middle East) face long-term risks: a generation that enters adulthood without stable employment develops fewer skills, earns less over their lifetime, and may become politically disaffected. The IMF tracks youth unemployment separately, and we provide dedicated rankings for it on this site.',
  ],
  'gdp-per-capita': [
    'GDP per capita divides a country\'s total GDP by its population, yielding a rough measure of average economic output per person. It is the most commonly used proxy for comparing living standards across countries, though it has significant limitations. The nominal GDP per capita figures on this page are in current US dollars and come from the IMF World Economic Outlook.',
    'The range in GDP per capita across countries is staggering: the richest countries (Luxembourg, Ireland, Switzerland, Norway) report figures above $80,000 per person, while the poorest (Burundi, South Sudan, Central African Republic) fall below $500. This 100x+ gap reflects not just differences in natural resources or geography, but accumulated differences in institutions, education, infrastructure, and governance built over decades or centuries.',
    'Two important caveats apply when interpreting these numbers. First, nominal GDP per capita is distorted by exchange rates and doesn\'t reflect local purchasing power — a salary of $10,000 goes much further in India than in Switzerland. For a fairer comparison, use GDP per capita in purchasing power parity (PPP) terms. Second, GDP per capita is an average, not a measure of how income is distributed. Qatar has one of the highest GDP per capita figures in the world, but most of that GDP accrues to a small citizen population while a large migrant labor force earns far less. The Gini index provides a complementary view of inequality within countries.',
  ],
  'life-expectancy': [
    'Life expectancy at birth estimates the average number of years a newborn would live if current mortality rates persisted throughout their lifetime. It is one of the most powerful single-number summaries of a country\'s health and development status. The data comes from the World Bank, which compiles mortality data from national vital registration systems, censuses, and WHO estimates.',
    'Global average life expectancy has increased dramatically over the past century — from about 47 years in 1950 to over 73 years today — driven primarily by reductions in infant and child mortality, control of infectious diseases, and improvements in nutrition and sanitation. However, the gap between countries remains enormous: life expectancy exceeds 84 years in Japan and Switzerland but falls below 55 in several sub-Saharan African countries.',
    'The COVID-19 pandemic caused the first significant global decline in life expectancy in decades, with particularly severe impacts in Latin America, South Asia, and parts of Eastern Europe. Most countries have since recovered to pre-pandemic levels, though some (notably the United States) have seen slower recovery. Beyond infectious disease, the main determinants of life expectancy differences between countries are access to healthcare, nutrition, environmental quality, and behavioral factors like smoking and alcohol consumption. Life expectancy data is particularly valuable when disaggregated by sex — women live longer than men in virtually every country, with the gap ranging from 2 to 10 years.',
  ],
  'gdp-growth': [
    'Real GDP growth rate measures the annual percentage change in a country\'s economic output after adjusting for inflation. Unlike nominal GDP, which can be inflated by rising prices, real GDP growth isolates actual increases in the quantity of goods and services produced. The IMF publishes both historical growth rates and projections for the current and next several years in their World Economic Outlook.',
    'Global GDP growth has averaged around 3.5% per year over the past two decades, but this average masks enormous variation. Advanced economies typically grow at 1–3%, reflecting their already-high productivity levels and aging workforces. Emerging markets — particularly in South and Southeast Asia — routinely grow at 5–7%, driven by industrialization, urbanization, and catch-up effects. The fastest-growing economies in any given year are often small commodity exporters (like Guyana with its oil boom) or post-conflict recoveries, which can post double-digit growth from a low base.',
    'Sustained GDP growth above 5% for decades is historically rare and transformative. China maintained roughly 10% annual growth from 1980 to 2010 — an unprecedented 30-year run that lifted hundreds of millions out of poverty. India is currently on a similar trajectory at 6–7%. Whether this pace can continue depends on structural factors: demographics, institutional quality, infrastructure investment, and the ability to move up the value chain from low-cost manufacturing to higher-productivity services and technology.',
  ],
  'gdp-ppp': [
    'GDP measured in purchasing power parity (PPP) adjusts for the fact that prices differ dramatically across countries. A dollar buys far more in India or Vietnam than in Switzerland or Norway. PPP-adjusted GDP attempts to measure what each economy can actually buy with its output, making it a fairer basis for comparing economic size and living standards across countries with very different price levels.',
    'The PPP adjustment produces dramatically different rankings than nominal GDP. China\'s economy is substantially larger than America\'s in PPP terms — over $40 trillion versus $30 trillion — even though it trails in nominal dollars. India ranks third by PPP, ahead of Japan and Germany. This reflects the reality that domestic purchasing power in large developing economies is much greater than their dollar-denominated GDP suggests.',
    'PPP data is calculated by the International Comparison Program (ICP), a global statistical initiative coordinated by the World Bank. The ICP conducts price surveys across countries for thousands of goods and services, then computes conversion factors. These surveys are resource-intensive and only conducted every few years (the most recent was 2021), with estimates extrapolated between benchmark years. This means PPP figures carry more uncertainty than nominal GDP — they are estimates, not precise measurements.',
  ],
  'government-debt': [
    'Government debt as a percentage of GDP measures the total stock of government borrowing relative to the size of the economy. It is the most widely used indicator of fiscal sustainability — how much a government owes compared to how much the country produces. The IMF tracks general government gross debt, which includes central, state, and local government obligations.',
    'The global debt landscape has shifted dramatically since the 2008 financial crisis and especially since the COVID-19 pandemic. Advanced economy debt-to-GDP ratios jumped from an average of about 70% before 2008 to over 110% by 2024. Japan leads at over 250% of GDP — a level that would be unsustainable for most countries but is managed by Japan\'s unique combination of domestic savings, a current account surplus, and a central bank that holds roughly half of all government bonds.',
    'Whether high debt is dangerous depends on context. The United States can sustain debt above 120% of GDP because the dollar is the world\'s reserve currency and Treasury securities are considered the safest asset globally. Greece, with similar debt levels, required multiple bailouts because it couldn\'t print its own currency or benefit from safe-haven demand. For emerging markets, debt sustainability thresholds are typically lower — a debt-to-GDP ratio above 60% starts to raise alarm bells because these countries face higher borrowing costs and greater currency risk. The key variables are interest rates, growth rates, and the currency denomination of the debt.',
  ],
  'homicide-rate': [
    'The intentional homicide rate measures the number of unlawful deaths purposefully inflicted by another person per 100,000 population. It is the most internationally comparable crime statistic because, unlike other crimes, homicide has a relatively consistent legal definition across countries and is difficult to conceal — most homicides produce a body that enters official records. The data comes from the UN Office on Drugs and Crime (UNODC) via World Bank compilation.',
    'Latin America and the Caribbean account for roughly 35% of global homicides despite having only 8% of the world\'s population. This concentration is driven by a combination of factors: drug trafficking routes, gang violence, high inequality, weak judicial institutions, and widespread firearm availability. El Salvador, Honduras, Jamaica, and Venezuela have historically reported some of the highest rates in the world, though several of these countries have seen significant declines through aggressive (and sometimes controversial) security policies.',
    'In contrast, East Asia, Western Europe, and Oceania have some of the lowest homicide rates globally — typically below 1 per 100,000. Japan\'s rate is approximately 0.2, reflecting deep social cohesion, strict gun control, and effective policing. When analyzing homicide data, it\'s important to note that some countries may underreport due to weak statistical systems, conflict-related deaths classified separately, or political incentives to minimize crime figures. The data also doesn\'t capture attempted murders or the broader context of violent crime.',
  ],
  'co2-emissions': [
    'CO₂ emissions per capita measure the average amount of carbon dioxide each person in a country is responsible for, expressed in metric tons per year. This metric is essential for climate policy because it normalizes emissions by population — large countries like China and India have high total emissions but moderate per capita figures, while smaller wealthy nations like Qatar and Kuwait have among the highest per-person emissions globally.',
    'The global average is approximately 4.5 metric tons of CO₂ per person per year, but the range is extreme. Gulf states and some small island nations with petrochemical industries can exceed 30 tons per capita. The United States averages around 14 tons — roughly twice the European average and three times the global mean. At the other end, many sub-Saharan African countries emit less than 0.5 tons per capita, reflecting both lower industrialization and limited access to energy.',
    'Per capita emissions are declining in most advanced economies due to the transition from coal to natural gas and renewables, energy efficiency improvements, and the shift from manufacturing to services. However, global total emissions continue to rise because growth in developing countries — particularly India, Southeast Asia, and Africa — more than offsets developed-world reductions. The fundamental tension in climate negotiations remains: historically wealthy nations produced most cumulative emissions, but future emission growth will come predominantly from developing countries seeking the same economic prosperity.',
  ],
  'infant-mortality': [
    'The infant mortality rate — specifically the under-5 mortality rate — measures the number of children who die before reaching age 5 per 1,000 live births. It is one of the most sensitive indicators of a country\'s overall development, reflecting the quality of healthcare, nutrition, sanitation, and maternal health services. The data is compiled by the World Bank from UNICEF, WHO, and national vital registration systems.',
    'Global under-5 mortality has fallen dramatically: from 93 deaths per 1,000 live births in 1990 to approximately 37 in 2023. This decline — saving millions of young lives annually — is one of the great public health achievements of the modern era, driven by oral rehydration therapy for diarrhea, expanded vaccination coverage, insecticide-treated bed nets for malaria, and improved maternal care. However, progress has been uneven: sub-Saharan Africa still accounts for roughly half of all child deaths worldwide.',
    'The countries with the lowest infant mortality rates — Finland, Japan, Singapore, Iceland — have rates below 3 per 1,000, meaning child death before age 5 is statistically rare. The highest rates, exceeding 100 per 1,000 in some cases, are found in conflict-affected states (Somalia, Chad, Central African Republic) where healthcare systems have collapsed. For policymakers, infant mortality serves as a composite indicator: reducing it requires simultaneous improvements in clean water access, vaccination, nutrition, maternal education, and healthcare infrastructure.',
  ],
  'fertility-rate': [
    'The total fertility rate (TFR) estimates the average number of children a woman would bear over her lifetime if current age-specific fertility rates persisted. A TFR of 2.1 is considered "replacement level" — the rate needed to maintain a stable population without migration. Below that, populations shrink over time; above it, they grow. The data comes from the World Bank using UN Population Division estimates.',
    'The global fertility transition is one of the most consequential demographic shifts in human history. In 1960, the average woman worldwide had 5 children; today the global TFR is approximately 2.3 and falling. Every major world region has experienced fertility decline, including sub-Saharan Africa where rates have dropped from 6.7 to about 4.5. The drivers are consistent across cultures: female education, urbanization, access to contraception, declining child mortality (parents need fewer births to achieve desired family size), and the economic shift from agricultural to service economies.',
    'The most immediate consequence of below-replacement fertility is population aging. South Korea\'s TFR has fallen below 0.8 — the lowest ever recorded for any country — creating an acute demographic crisis with a rapidly shrinking workforce and exploding elderly dependency ratio. Japan, Italy, Spain, and much of Eastern Europe face similar trajectories. At the other extreme, Niger\'s TFR above 6.5 means its population will roughly triple by 2050, creating enormous pressure on education, employment, and resources. Fertility data is crucial for long-term economic planning: today\'s birth rates determine tomorrow\'s labor force, consumer markets, and pension obligations.',
  ],
  'health-spending': [
    'Health expenditure as a percentage of GDP measures how much of a country\'s economic output is devoted to healthcare. This includes both public spending (government budgets, social insurance) and private spending (out-of-pocket payments, private insurance). The data comes from the World Bank, which compiles national health accounts following WHO methodology.',
    'The United States is a dramatic outlier: it spends roughly 17% of GDP on healthcare — nearly double the OECD average of 9%. Despite this, the US has lower life expectancy and higher infant mortality than most wealthy nations. This paradox reflects the inefficiency of the US healthcare system, where administrative costs, pharmaceutical pricing, and fragmented insurance markets consume resources without proportionally improving outcomes. In contrast, countries like Japan and South Korea achieve some of the world\'s best health outcomes while spending only 8–9% of GDP.',
    'For developing countries, health spending below 5% of GDP typically signals inadequate healthcare infrastructure. Sub-Saharan African countries often spend 3–4% of GDP on health, resulting in doctor-to-patient ratios far below WHO recommendations and limited access to essential medicines. International health financing — through organizations like Gavi, the Global Fund, and bilateral aid — fills part of this gap, but sustainable improvement requires domestic resource mobilization. The COVID-19 pandemic exposed these disparities: countries with robust health spending weathered the crisis far better than those with underfunded systems.',
  ],
  'education-spending': [
    'Government expenditure on education as a percentage of GDP indicates how much priority a country places on investing in human capital development. This includes spending on schools, universities, teacher salaries, educational materials, and related infrastructure. The data is compiled by the World Bank from national education accounts and UNESCO statistics.',
    'The global average for education spending is approximately 4.5% of GDP, but the range is wide. Nordic countries consistently spend 6–8% of GDP on education and achieve some of the world\'s best educational outcomes, as measured by PISA scores and tertiary attainment. At the other end, several conflict-affected and low-income countries spend less than 2%, resulting in low literacy rates and limited access to secondary education.',
    'Education spending alone does not determine educational quality — how the money is spent matters as much as how much is spent. South Korea and Singapore achieve world-class educational outcomes with moderate spending levels through highly selective teacher recruitment, rigorous curricula, and strong cultural emphasis on education. Meanwhile, some countries with high education budgets show mediocre results due to bureaucratic inefficiency, teacher absenteeism, or curricula misaligned with labor market needs. The most effective education systems combine adequate funding with institutional quality, accountability, and teacher professionalization.',
  ],
  'military-spending': [
    'Military expenditure as a percentage of GDP measures the share of economic output devoted to defense. This includes spending on armed forces, weapons procurement, military research, and related infrastructure. The data primarily comes from the Stockholm International Peace Research Institute (SIPRI) via the World Bank, supplemented by national defense budget disclosures.',
    'Global military spending exceeded $2.4 trillion in 2024, with the United States accounting for roughly 40% of the total. The US spends approximately 3.5% of GDP on defense — more than the next 10 countries combined in absolute terms. NATO members have committed to spending at least 2% of GDP on defense, a target that most European members failed to meet for decades but are now rapidly approaching following Russia\'s invasion of Ukraine. Russia itself spends an estimated 6–8% of GDP on military, though exact figures are unreliable due to off-budget spending and state secrecy.',
    'Military spending trends reflect geopolitical tensions: Middle Eastern countries like Saudi Arabia, Israel, and the UAE consistently spend 4–6% of GDP on defense due to regional security threats. In contrast, Japan maintained spending below 1% of GDP for decades under its post-WWII pacifist constitution, though it has recently increased toward 2%. For developing countries, excessive military spending can crowd out investments in health, education, and infrastructure that drive long-term economic growth — a phenomenon economists call the "guns versus butter" trade-off.',
  ],
  'trade-openness': [
    'Trade openness measures total trade (exports plus imports of goods and services) as a percentage of GDP. It captures how integrated a country is with the global economy. Higher values indicate greater dependence on international trade, while lower values suggest a more domestically oriented economy. The data comes from the World Bank\'s World Development Indicators.',
    'Trade openness varies enormously by country size. Small, open economies like Singapore (trade exceeding 300% of GDP), Luxembourg, and Hong Kong are extremely trade-dependent — their domestic markets are too small to sustain the variety of production their economies support. Large economies like the United States (about 25% of GDP), China (about 37%), and Japan (about 35%) appear less open in percentage terms, but their absolute trade volumes are the largest in the world.',
    'The relationship between trade openness and growth is one of the most studied topics in economics. The consensus is that trade liberalization generally accelerates growth through specialization, technology transfer, and competitive pressure — but the effects are not uniform. Countries that opened their economies while investing in education, infrastructure, and institutional quality (East Asia, Eastern Europe) benefited enormously. Countries that liberalized without these foundations sometimes experienced deindustrialization and rising inequality. The recent trend toward "friend-shoring" and supply chain diversification after the pandemic and geopolitical tensions represents a partial retreat from maximum openness.',
  ],
  'internet-users': [
    'Internet penetration measures the percentage of a country\'s population using the internet, based on surveys and telecommunications data compiled by the International Telecommunication Union (ITU) via the World Bank. "Using the internet" includes access through any device — desktop, mobile, tablet — from any location, whether at home, work, or public facilities.',
    'Global internet penetration crossed 60% in the early 2020s and continues to climb, though deep divides remain. Advanced economies have near-universal access: over 95% in Scandinavia, South Korea, Japan, and the United States. But in much of sub-Saharan Africa and South Asia, penetration remains below 40%, and in the least connected countries (Chad, Central African Republic, South Sudan), fewer than 10% of the population is online.',
    'The digital divide has enormous economic consequences. Countries with high internet penetration benefit from e-commerce, digital financial services, remote work capability, and access to global information — all of which accelerate productivity growth. The pandemic dramatically accelerated digital adoption even in lower-income countries, particularly through mobile internet and mobile money (M-Pesa in Kenya being the canonical example). Mobile broadband has leapfrogged fixed-line infrastructure in most developing countries, making smartphone penetration a better predictor of digital access than traditional internet metrics.',
  ],
  'gini-index': [
    'The Gini index measures income inequality on a scale from 0 (perfect equality, everyone earns the same) to 100 (perfect inequality, one person earns everything). It is the most widely used single-number measure of income distribution, calculated from household survey data compiled by the World Bank. A Gini of 25–30 is typical of egalitarian Nordic societies; 35–40 is common in the United States and China; and 50+ indicates extreme inequality, common in parts of Latin America and sub-Saharan Africa.',
    'South Africa consistently records one of the world\'s highest Gini coefficients — around 63 — reflecting the lasting economic legacy of apartheid, where extreme wealth concentration by racial lines persists decades after political liberation. Brazil, Colombia, and several Central American countries also show Gini values above 50, driven by concentrated land ownership, limited social mobility, and weak public education systems. In contrast, the lowest Gini values (below 30) are found in the Czech Republic, Slovakia, Slovenia, and the Nordic countries, where progressive taxation, strong social safety nets, and accessible education compress the income distribution.',
    'When interpreting Gini data, several caveats apply. First, the index captures income inequality but not wealth inequality, which is typically much more extreme — global wealth inequality is far higher than income inequality. Second, household surveys systematically undercount income at both tails of the distribution: the very poor (who are hard to survey) and the very rich (who underreport). Third, Gini values are not perfectly comparable across countries because survey methodologies differ. Despite these limitations, the Gini index remains the standard benchmark for international inequality comparisons.',
  ],
  'renewable-energy': [
    'Renewable energy consumption as a share of total energy measures how much of a country\'s energy comes from renewable sources: hydroelectric, solar, wind, geothermal, biomass, and marine energy. This metric tracks the energy transition — the shift from fossil fuels to sustainable energy sources. The data comes from the World Bank using International Energy Agency (IEA) methodology.',
    'The global average is approximately 18% renewable, but this masks enormous variation. Iceland leads at nearly 90% (dominated by geothermal and hydroelectric power), followed by Norway (about 70%, almost entirely hydroelectric) and several Latin American countries with large hydropower capacity (Brazil, Paraguay, Costa Rica). At the other end, oil-producing nations like Saudi Arabia, Kuwait, and Trinidad and Tobago derive less than 1% of energy from renewables.',
    'Solar and wind energy have experienced dramatic cost reductions — solar PV costs fell over 90% between 2010 and 2024 — making renewables cost-competitive with or cheaper than fossil fuels in most markets. China dominates global renewable capacity additions, manufacturing over 80% of the world\'s solar panels and installing more renewable capacity annually than the rest of the world combined. Europe has set a 42.5% renewable target for 2030. The key challenges remaining are intermittency (solar and wind don\'t produce when the sun isn\'t shining or wind isn\'t blowing), grid infrastructure, and energy storage — all of which require significant investment to solve at scale.',
  ],
  'air-passengers': [
    'Air transport passengers carried measures the total number of passengers on flights departing from airports in each country, including both domestic and international passengers. A passenger who flies a round trip between two cities counts as two passengers. The data comes from the International Civil Aviation Organization (ICAO) via the World Bank.',
    'The United States dominates global air travel with roughly 900 million passengers per year — more than the next three countries combined. This reflects both the vast geographic distances within the US (making air travel essential for domestic mobility) and the country\'s role as a global travel hub. China has risen to second place as its domestic air travel market has exploded with rising middle-class incomes and massive airport construction. India is the fastest-growing major aviation market, with passenger numbers roughly doubling every decade.',
    'Air passenger volumes are strongly correlated with economic development and GDP per capita. Countries with the highest per-capita air travel are typically wealthy, geographically dispersed nations: the United States, Australia, Canada, and the Nordic countries. The COVID-19 pandemic caused the largest disruption to global aviation in history — international passenger traffic fell by 75% in 2020 — but most markets have recovered to or exceeded pre-pandemic levels. The aviation industry is under increasing pressure to address its carbon footprint, which accounts for roughly 2.5% of global CO₂ emissions.',
  ],
  'youth-unemployment': [
    'Youth unemployment rate measures the percentage of the labor force aged 15–24 that is actively seeking work but unable to find it. It is typically two to three times higher than the overall unemployment rate, reflecting the difficulty young people face entering the labor market for the first time. The data comes from the International Labour Organization (ILO) via the World Bank.',
    'Youth unemployment is one of the most politically consequential economic indicators. Countries with very high rates — above 25% — face risks of social instability, brain drain (as educated youth emigrate for opportunities), and long-term scarring effects (research shows that entering the job market during a recession permanently reduces lifetime earnings). Southern Europe (Spain, Greece, Italy) and North Africa (Tunisia, Egypt) have among the highest rates globally, often exceeding 30%.',
    'The causes of youth unemployment are structural, not just cyclical. Skills mismatches — where education systems produce graduates whose qualifications don\'t match employer needs — are a pervasive problem. Rigid labor markets with strong employment protections for existing workers can create "insider-outsider" dynamics where employers are reluctant to hire young workers. Dual labor markets, where temporary contracts offer lower pay and less security, disproportionately affect youth. Countries that have successfully reduced youth unemployment (Germany with its apprenticeship system, Japan with employer-coordinated hiring) typically have strong institutional bridges between education and employment.',
  ],
  'rd-spending': [
    'Research and development (R&D) expenditure as a percentage of GDP measures how much a country invests in scientific research, technological innovation, and experimental development. This includes spending by government laboratories, universities, and private sector firms. The data comes from the World Bank using UNESCO statistics.',
    'Israel and South Korea consistently lead the world in R&D intensity at 5–6% of GDP — roughly triple the global average. Both countries have innovation-driven economies where technology exports are a dominant source of growth. The United States spends approximately 3.5% of GDP on R&D, with the private sector (particularly tech companies like Amazon, Alphabet, Meta, and pharmaceutical firms) accounting for the majority. China has rapidly increased its R&D spending from under 1% of GDP in 2000 to over 2.5% today, now outspending the EU in absolute terms.',
    'R&D spending is one of the strongest predictors of long-term economic competitiveness. Countries that consistently invest above 2% of GDP in R&D tend to have higher productivity growth, more patent filings, and stronger positions in high-technology industries. However, the effectiveness of R&D spending depends heavily on the institutional environment: strong intellectual property protections, deep capital markets to commercialize inventions, and research universities that collaborate with industry. Simply increasing spending without these supporting institutions — as some Middle Eastern countries have attempted — often produces disappointing results.',
  ],
  'population-over-65': [
    'The share of population aged 65 and above is the standard demographic indicator of population aging. It reflects the combined effects of increasing life expectancy (people live longer) and declining fertility (fewer young people are born to offset the aging population). The data comes from the World Bank using United Nations Population Division estimates.',
    'Japan is the world\'s most aged society, with roughly 30% of its population over 65 — a proportion that will continue to rise toward 40% by 2050. Italy, Germany, Finland, and Portugal all exceed 22%. At the other extreme, sub-Saharan African countries like Niger, Uganda, and Chad have less than 3% of their population over 65, reflecting both high fertility rates and shorter life expectancy.',
    'Population aging creates profound economic challenges. As the ratio of retirees to working-age adults increases, pension and healthcare systems come under strain. Japan spends roughly 10% of GDP on pension payments alone. Immigration can partially offset aging — the United States ages more slowly than Europe or East Asia partly because of sustained immigration inflows. However, even high-immigration countries face long-term aging pressures as global fertility rates converge downward. Automation and AI are increasingly viewed as potential solutions to labor shortages caused by aging, though the transition is uncertain.',
  ],
  'population-under-15': [
    'The share of population under age 15 indicates the youth dependency ratio and demographic momentum of a country. Countries with high proportions of young people face different economic challenges than aging societies: they need to create jobs, build schools, and expand infrastructure to accommodate population growth. The data comes from the World Bank using UN Population Division estimates.',
    'Sub-Saharan Africa has by far the youngest population globally, with many countries having 40–45% of their population under 15. Niger leads at roughly 50% — meaning half the country\'s population is a child. This "youth bulge" can be either a dividend or a disaster: if these young people receive adequate education and the economy creates enough jobs, the resulting demographic dividend can turbocharge growth (as happened in East Asia in the 1970s–1990s). If not, it creates mass youth unemployment, social unrest, and emigration pressure.',
    'In contrast, Japan, South Korea, Italy, and Germany have less than 13% of their population under 15 — a consequence of decades of below-replacement fertility. These societies face the opposite problem: shrinking school enrollments, contracting domestic consumer markets, and an aging workforce that must support a growing number of retirees. The transition from young to old is historically irreversible — no country that has reached below-replacement fertility has sustainably recovered to replacement level.',
  ],
  'gdp-per-capita-ppp': [
    'GDP per capita in purchasing power parity (PPP) terms is widely considered the best single measure for comparing living standards across countries. It adjusts for both population size and local price levels — if a haircut costs $5 in India but $30 in Switzerland, PPP accounts for that difference. The data comes from the IMF World Economic Outlook using conversion factors from the International Comparison Program.',
    'The PPP rankings reveal a different picture of global prosperity than nominal figures. Small, wealthy nations — Luxembourg, Singapore, Ireland, Qatar, Macao — top the list with values exceeding $80,000 per person. Ireland\'s high ranking is partially artificial, inflated by multinational corporations routing profits through the country for tax purposes. Among large economies, the United States leads at roughly $85,000, well ahead of Germany ($68,000) and Japan ($52,000). China, despite having the world\'s largest economy in PPP terms, ranks only around $25,000 per capita.',
    'PPP per capita is particularly useful for assessing actual material living standards. A salary of $30,000 in Vietnam provides a lifestyle comparable to earning $60,000+ in the United States, because housing, food, and services cost a fraction of American prices. However, PPP comparisons become less reliable for internationally traded goods — an iPhone costs roughly the same everywhere, making low-income countries relatively poorer for technology and imported goods than PPP figures suggest.',
  ],
  'tourism-arrivals': [
    'International tourism arrivals measure the number of overnight visitors entering a country in a given year. The data comes from the UN World Tourism Organization (UNWTO) via the World Bank.',
    'France consistently leads with roughly 90 million visitors per year — more than its own population. Spain, the United States, Italy, and Turkey round out the top five. Tourism generates over 10% of global GDP when direct, indirect, and induced effects are counted.',
    'The COVID-19 pandemic devastated international tourism, with arrivals falling 73% in 2020. Recovery has been uneven: European tourism rebounded fastest, while Asian markets recovered more slowly. Climate change poses a long-term threat to tourism patterns: rising sea levels threaten island destinations, extreme heat is making summer Mediterranean travel less attractive, and snow-dependent ski resorts face shorter seasons.',
  ],
  'current-account': [
    'The current account balance measures the net flow of goods, services, income, and transfers between a country and the rest of the world, expressed as a percentage of GDP. A surplus means a country earns more from abroad; a deficit means it spends more. The data comes from the IMF World Economic Outlook.',
    'Germany, China, Japan, and the oil-exporting Gulf states consistently run large surpluses. The United States runs the world\'s largest deficit in absolute terms (roughly $800 billion annually), financing the gap by selling financial assets to foreign investors.',
    'Whether a deficit is problematic depends on context. The US deficit is sustainable because the dollar is the world\'s reserve currency. For emerging markets, persistent deficits financed by short-term foreign borrowing can become dangerous — this was the dynamic behind the 1997 Asian financial crisis. The IMF considers persistent imbalances above 3% of GDP a potential risk indicator.',
  ],
  'poverty-rate': [
    'The international poverty rate measures the share of population living on less than $2.15 per day in 2017 PPP terms — the World Bank\'s "extreme poverty line." This threshold represents the minimum needed to meet basic nutritional needs. The data comes from the World Bank\'s PovcalNet database.',
    'Global extreme poverty has declined from roughly 36% in 1990 to under 9% today — one of the most remarkable achievements in human history, driven primarily by China\'s growth (800 million people lifted above the poverty line). However, poverty reduction has stalled in sub-Saharan Africa, which now accounts for over 60% of the world\'s extreme poor.',
    'The COVID-19 pandemic reversed years of progress, pushing an estimated 70 million additional people into extreme poverty. Measuring poverty through income alone also misses important dimensions: access to healthcare, education, clean water, and social protection can make the real experience of poverty better or worse than the income threshold suggests.',
  ],
  'net-migration': [
    'Net migration measures the difference between immigrants entering and emigrants leaving a country over a five-year period. Positive values indicate net immigration. The data comes from the United Nations Population Division via the World Bank.',
    'The largest net immigration flows go to the United States, Germany, Saudi Arabia, and the UAE. Gulf states have extremely high migration rates — in Qatar and the UAE, foreign workers outnumber citizens by more than 3 to 1.',
    'Migration flows are driven by economic opportunity differentials, conflict, and demographic complementarity. Countries with aging populations actively recruit immigrant workers. The economic effects of immigration are consistently positive in aggregate — immigrants expand the labor force, start businesses, and contribute to innovation — though distributional effects generate political controversy.',
  ],
  'tax-revenue': [
    'Tax revenue as a percentage of GDP measures a government\'s fiscal capacity. This includes income taxes, VAT, corporate taxes, customs duties, and social security contributions. The data comes from the World Bank.',
    'Nordic countries collect 40–50% of GDP in taxes, reflecting comprehensive welfare states. Many developing countries collect less than 15% — below the IMF\'s threshold for funding basic services. Low collection rates reflect large informal economies, weak tax administration, and narrow tax bases.',
    'The relationship between tax revenue and growth is nuanced. High-tax Nordic economies rank among the world\'s most competitive, while low-tax economies like Singapore have also achieved rapid growth. The key variable is not the tax level but the quality of public spending — taxes funding productive investments generate positive returns.',
  ],
  'population-growth': [
    'Population growth rate measures the annual percentage increase in a country\'s total population, reflecting births, deaths, and net migration. The data comes from the World Bank using UN Population Division estimates.',
    'Global population growth has decelerated from over 2% per year in the 1960s to approximately 0.8% today. The fastest-growing populations are in sub-Saharan Africa, where countries like Niger, Chad, and the DRC grow at 3% annually — doubling every 23 years. Many European and East Asian countries now have negative growth rates.',
    'For economists, population growth is a double-edged sword. Moderate growth with a young demographic profile can fuel economic expansion. Rapid growth strains education, healthcare, and employment systems. The most consequential indicator is the dependency ratio: how many non-working-age people each working-age person must support.',
  ],
  'urban-population': [
    'Urban population as a share of total population indicates how urbanized a country is. Urbanization is one of the most powerful structural forces in economic development — when people move from farms to cities, productivity increases and growth accelerates. The data comes from the UN World Urbanization Prospects via the World Bank.',
    'The world crossed 50% urbanization around 2007 and now stands at approximately 57%. Singapore, Hong Kong, and Kuwait are essentially 100% urban, while Burundi, Niger, and Chad remain over 85% rural.',
    'Urbanization drives growth because cities enable specialization, knowledge spillovers, and efficient service delivery. GDP per capita is strongly correlated with urbanization — there is no wealthy, low-urbanization country. However, unmanaged urbanization creates slums, congestion, and strain on infrastructure.',
  ],
  'fdi-inflows': [
    'Foreign direct investment (FDI) inflows as a percentage of GDP measure foreign capital entering a country for long-term business operations. Unlike portfolio investment, FDI represents a lasting commitment. The data comes from UNCTAD via the World Bank.',
    'Small open economies and tax havens often show the highest FDI/GDP ratios — Ireland, Singapore, Luxembourg. For developing countries, healthy FDI inflows (2–5% of GDP) are associated with technology transfer, job creation, and growth.',
    'Geopolitical tensions have redirected FDI flows since 2020 — "friend-shoring" is moving supply chains from China to Vietnam, India, Mexico, and Eastern Europe. The CHIPS Act and similar policies have created massive new semiconductor FDI.',
  ],
  'suicide-rate': [
    'Suicide mortality rate measures deaths by suicide per 100,000 population. Approximately 700,000 people die by suicide annually — more than homicide and armed conflict combined. The data comes from the WHO Global Health Observatory.',
    'South Korea has the highest rate among OECD countries, driven by social pressure, elderly poverty, and mental health stigma. Men die by suicide at roughly three to four times the rate of women in most countries.',
    'Effective prevention includes restricting access to lethal means (particularly pesticides in agricultural countries), school-based mental health programs, and crisis hotlines. South Korea\'s rate has declined since implementing comprehensive prevention policies.',
  ],
  'road-traffic-deaths': [
    'Road traffic death rate measures estimated deaths from road accidents per 100,000 population. Road injuries are the leading cause of death for ages 5–29 globally, killing 1.35 million people per year. The data comes from the WHO.',
    'Africa has the highest rates despite having only 2% of the world\'s vehicles. Libya, Central African Republic, and Zimbabwe report rates above 30 per 100,000 — over ten times Norway, Sweden, or the UK.',
    'High-income countries reduced road deaths through the "safe systems" approach: segregated lanes, speed reduction, vehicle safety standards, and trauma care. Sweden\'s "Vision Zero" framework has been adopted globally.',
  ],
  'corruption-control': [
    'Control of Corruption is one of six Worldwide Governance Indicators from the World Bank. It measures perceptions of public power exercised for private gain. Scores range from -2.5 (highly corrupt) to +2.5 (very clean).',
    'Denmark, Finland, New Zealand, Norway, and Switzerland consistently score above +2.0, sharing independent judiciaries, free press, and transparent procurement. Somalia, South Sudan, and North Korea score below -1.5.',
    'The IMF estimates corruption costs 2% of GDP growth annually. Effective reforms focus on transparency (open budgets), accountability (independent anti-corruption agencies), and economic liberalization (reducing permits that create bribery opportunities).',
  ],
  'forest-area': [
    'Forest area as a percentage of total land area tracks the extent of a country\'s forest cover. Forests are critical for carbon sequestration, biodiversity, water cycling, and the livelihoods of 1.6 billion people. The data comes from the Food and Agriculture Organization (FAO) via the World Bank.',
    'The most forested countries include Suriname (over 95%), Gabon, and several Pacific islands. Large economies with significant forest cover include Brazil (59%), Russia (50%), and Canada (38%). Deforestation is concentrated in the tropics — Brazil, Indonesia, and the Democratic Republic of Congo lose the most forest annually.',
    'Global forest area has declined from 31.6% of land area in 1990 to approximately 31.0% today. While the rate of loss has slowed, net deforestation continues. China and India have actually increased forest cover through massive reforestation programs, partially offsetting tropical losses.',
  ],
  'rule-of-law': [
    'The Rule of Law indicator from the World Bank measures perceptions of the extent to which agents have confidence in and abide by the rules of society: quality of contract enforcement, property rights, the police, and the courts, as well as the likelihood of crime and violence.',
    'Nordic countries, New Zealand, and Switzerland score highest, reflecting institutional strength built over centuries. The lowest-scoring countries are typically conflict-affected or authoritarian states where the rule of law has broken down.',
    'Rule of law is the single strongest institutional predictor of long-term economic development. Countries with strong rule of law attract more investment, have more productive economies, and experience less corruption. The World Bank research shows that a one-standard-deviation improvement in rule of law is associated with a 300% increase in per capita income in the long run.',
  ],
  'air-freight': [
    'Air freight volume measures the total weight of cargo transported by air in million ton-kilometers. While air freight accounts for less than 1% of global trade by volume, it represents over 35% by value — reflecting the high-value, time-sensitive nature of goods that travel by air: electronics, pharmaceuticals, perishable foods, and e-commerce shipments.',
    'The United States, China, and the UAE (driven by Dubai\'s role as a global logistics hub) handle the most air freight. The sector is dominated by dedicated cargo carriers (FedEx, UPS, DHL) and the belly cargo capacity of passenger airlines. COVID-19 temporarily boosted air freight demand as supply chains shifted from sea to air for speed.',
  ],
  'gni': [
    'Gross National Income (GNI) measures the total income earned by a country\'s residents, regardless of where that income is generated. Unlike GDP, which counts economic activity within borders, GNI includes income earned abroad by citizens and excludes income earned domestically by foreigners. The data comes from the World Bank.',
    'For most countries, GNI and GDP are similar. But for countries with large overseas worker populations (Philippines, Mexico — remittances boost GNI above GDP) or countries hosting many multinational headquarters (Ireland, Luxembourg — profits flow out, so GDP exceeds GNI), the difference is significant. Ireland\'s GDP is roughly 60% higher than its GNI due to multinational profit shifting.',
  ],
  'gni-per-capita': [
    'GNI per capita divides gross national income by population, providing a per-person income measure. The World Bank uses GNI per capita as the primary criterion for classifying countries into income groups: low-income (below $1,145), lower-middle ($1,146–$4,515), upper-middle ($4,516–$14,005), and high-income (above $14,005).',
    'These income classifications determine eligibility for concessional lending from the World Bank and other development institutions. When a country crosses the high-income threshold — as South Korea, Chile, and several Gulf states have done — it "graduates" from development assistance eligibility.',
  ],
  'youth-dependency-ratio': [
    'The youth dependency ratio measures the number of people aged 0–14 relative to the working-age population (15–64). A ratio of 50% means there are 50 dependents for every 100 working-age adults. High ratios indicate large youth populations that require education and healthcare investment; low ratios indicate aging societies.',
    'Sub-Saharan Africa has the highest ratios globally, often exceeding 80%, reflecting high fertility rates. Japan and South Korea have the lowest at roughly 20%, reflecting decades of low fertility. The "demographic dividend" occurs when the ratio falls rapidly — fewer dependents per worker means more resources for investment and consumption.',
  ],
  'rule-of-law-percentile': [
    'The Rule of Law Percentile Rank indicates a country\'s position relative to all other countries, on a scale from 0 (weakest) to 100 (strongest). It is derived from the World Bank Worldwide Governance Indicators and aggregates dozens of data sources including surveys, expert assessments, and NGO reports.',
    'Nordic countries and New Zealand consistently score above 95th percentile. Countries below the 10th percentile are typically conflict-affected states with collapsed governance. The percentile format makes it easier to compare across countries than the raw governance score.',
  ],
  'imports': [
    'Total imports of goods and services in current USD measures the value of all products and services a country purchases from abroad. Import volumes reflect domestic demand, exchange rates, and trade policy. The data comes from the World Bank using national accounts and balance of payments data.',
    'The United States is the world\'s largest importer at over $3.5 trillion annually, followed by China, Germany, and Japan. Import composition reveals economic structure: developed countries import more manufactured goods and services, while developing countries import more capital equipment and intermediate goods for their manufacturing sectors.',
  ],
  'household-consumption': [
    'Household final consumption expenditure as a share of GDP measures what portion of economic output is consumed by households — spending on food, housing, transportation, healthcare, education, and other goods and services. The data comes from the World Bank using national accounts methodology.',
    'The United States has one of the highest household consumption shares at roughly 68% of GDP, reflecting its consumer-driven economy. China\'s household consumption share is only about 38% — unusually low even for a developing country — reflecting high savings rates, investment-led growth, and relatively weak social safety nets that discourage spending.',
  ],
};

// Slug → Indicator ID mapping for SEO-friendly URLs
const SLUG_MAP: Record<string, { id: string; title: string; description: string }> = {
  'gdp': { id: 'IMF.NGDPD', title: 'GDP by Country', description: 'Gross Domestic Product (nominal USD) rankings for all countries. Data from IMF World Economic Outlook.' },
  'gdp-growth': { id: 'IMF.NGDP_RPCH', title: 'GDP Growth Rate by Country', description: 'Real GDP growth rate (%) rankings. Annual percentage change in real GDP from IMF WEO.' },
  'gdp-per-capita': { id: 'IMF.NGDPDPC', title: 'GDP per Capita by Country', description: 'GDP per capita (current USD) rankings. A measure of economic output per person.' },
  'gdp-ppp': { id: 'IMF.PPPGDP', title: 'GDP (PPP) by Country', description: 'GDP adjusted for purchasing power parity (international dollars). Allows fairer cross-country comparison.' },
  'gdp-per-capita-ppp': { id: 'IMF.PPPPC', title: 'GDP per Capita (PPP) by Country', description: 'GDP per capita adjusted for purchasing power parity. Best measure of living standards.' },
  'inflation-rate': { id: 'IMF.PCPIPCH', title: 'Inflation Rate by Country', description: 'Consumer price inflation (annual %) for all countries. IMF WEO estimates and projections.' },
  'unemployment-rate': { id: 'IMF.LUR', title: 'Unemployment Rate by Country', description: 'Unemployment rate (%) rankings. Percentage of labor force that is unemployed, from IMF.' },
  'government-debt': { id: 'IMF.GGXWDG_NGDP', title: 'Government Debt to GDP by Country', description: 'General government gross debt as a percentage of GDP. Higher values indicate heavier debt burden.' },
  'current-account': { id: 'IMF.BCA_NGDPD', title: 'Current Account Balance by Country', description: 'Current account balance as percentage of GDP. Positive = surplus, negative = deficit.' },
  'population': { id: 'SP.POP.TOTL', title: 'Population by Country', description: 'Total population rankings for all countries. Data from World Bank.' },
  'population-growth': { id: 'SP.POP.GROW', title: 'Population Growth by Country', description: 'Annual population growth rate (%). Includes natural increase and net migration.' },
  'life-expectancy': { id: 'SP.DYN.LE00.IN', title: 'Life Expectancy by Country', description: 'Life expectancy at birth (years). A key measure of health and development.' },
  'fertility-rate': { id: 'SP.DYN.TFRT.IN', title: 'Fertility Rate by Country', description: 'Total fertility rate (births per woman). Below 2.1 indicates declining population without migration.' },
  'co2-emissions': { id: 'EN.ATM.CO2E.PC', title: 'CO₂ Emissions per Capita by Country', description: 'Carbon dioxide emissions per capita (metric tons). Key climate change indicator.' },
  'internet-users': { id: 'IT.NET.USER.ZS', title: 'Internet Users by Country', description: 'Percentage of population using the internet. Measure of digital connectivity.' },
  'health-spending': { id: 'SH.XPD.CHEX.GD.ZS', title: 'Health Spending (% of GDP) by Country', description: 'Current health expenditure as a share of GDP. Reflects national health investment priority.' },
  'education-spending': { id: 'SE.XPD.TOTL.GD.ZS', title: 'Education Spending (% of GDP) by Country', description: 'Government expenditure on education as a share of GDP.' },
  'military-spending': { id: 'MS.MIL.XPND.GD.ZS', title: 'Military Spending (% of GDP) by Country', description: 'Military expenditure as a percentage of GDP.' },
  'trade-openness': { id: 'NE.TRD.GNFS.ZS', title: 'Trade Openness by Country', description: 'Trade (exports + imports) as a percentage of GDP. Higher = more open economy.' },
  'fdi-inflows': { id: 'BX.KLT.DINV.WD.GD.ZS', title: 'FDI Inflows (% of GDP) by Country', description: 'Foreign direct investment net inflows as a share of GDP.' },
  'gini-index': { id: 'SI.POV.GINI', title: 'Gini Index (Inequality) by Country', description: 'Gini coefficient measuring income inequality. 0 = perfect equality, 100 = maximum inequality.' },
  'poverty-rate': { id: 'SI.POV.DDAY', title: 'Poverty Rate by Country', description: 'Population living on less than $2.15/day (%). International poverty line.' },
  'infant-mortality': { id: 'SH.DYN.MORT', title: 'Infant Mortality Rate by Country', description: 'Under-5 mortality rate per 1,000 live births. Key child health indicator.' },
  'urban-population': { id: 'SP.URB.TOTL.IN.ZS', title: 'Urban Population by Country', description: 'Share of population living in urban areas (%).' },
  'renewable-energy': { id: 'EG.FEC.RNEW.ZS', title: 'Renewable Energy by Country', description: 'Renewable energy consumption as a share of total energy consumption (%).' },
  'forest-area': { id: 'AG.LND.FRST.ZS', title: 'Forest Area by Country', description: 'Forest area as a percentage of total land area.' },
  'corruption-control': { id: 'CC.EST', title: 'Control of Corruption by Country', description: 'World Bank governance indicator measuring control of corruption (-2.5 to +2.5).' },
  'rule-of-law': { id: 'RL.EST', title: 'Rule of Law by Country', description: 'World Bank governance indicator measuring rule of law (-2.5 to +2.5).' },
  'tourism-arrivals': { id: 'ST.INT.ARVL', title: 'International Tourism Arrivals by Country', description: 'Number of international tourist arrivals per year.' },
  // High-traffic indicators from GSC data — adding dedicated ranking pages
  'air-passengers': { id: 'IS.AIR.PSGR', title: 'Air Passengers by Country', description: 'Total air transport passengers carried by country. Data from World Bank World Development Indicators.' },
  'air-freight': { id: 'IS.AIR.GOOD.MT.K1', title: 'Air Freight by Country', description: 'Air transport freight in million ton-km by country. Data from World Bank WDI.' },
  'gni': { id: 'NY.GNP.MKTP.CD', title: 'Gross National Income (GNI) by Country', description: 'Gross national income in current USD by country. Data from World Bank WDI.' },
  'gni-per-capita': { id: 'NY.GNP.PCAP.CD', title: 'GNI per Capita by Country', description: 'Gross national income per capita in current USD. Key measure of average income. Data from World Bank.' },
  'homicide-rate': { id: 'VC.IHR.PSRC.P5', title: 'Homicide Rate by Country', description: 'Intentional homicides per 100,000 people by country. Data from World Bank / UNODC.' },
  'youth-dependency-ratio': { id: 'SP.POP.DPND.YG', title: 'Youth Dependency Ratio by Country', description: 'Ratio of younger dependents (ages 0–14) to working-age population (15–64). Data from World Bank.' },
  'rule-of-law-percentile': { id: 'RL.PER.RNK', title: 'Rule of Law Ranking by Country', description: 'Rule of law percentile rank (0–100) from World Bank Worldwide Governance Indicators.' },
  'imports': { id: 'NE.IMP.GNFS.CD', title: 'Total Imports by Country', description: 'Imports of goods and services in current USD by country. Data from World Bank WDI.' },
  'household-consumption': { id: 'NE.CON.PRVT.ZS', title: 'Household Consumption (% of GDP) by Country', description: 'Household final consumption expenditure as a share of GDP. Data from World Bank.' },
  'road-traffic-deaths': { id: 'WHO.ROAD_DEATHS', title: 'Road Traffic Death Rate by Country', description: 'Estimated road traffic death rate per 100,000 population. Data from WHO Global Health Observatory.' },
  'population-under-15': { id: 'SP.POP.0014.TO.ZS', title: 'Population Under 15 by Country', description: 'Share of population ages 0–14 as percentage of total population. Data from World Bank.' },
  'rd-spending': { id: 'GB.XPD.RSDV.GD.ZS', title: 'R&D Spending (% of GDP) by Country', description: 'Research and development expenditure as a share of GDP. Key innovation indicator. Data from World Bank.' },
  'population-over-65': { id: 'SP.POP.65UP.TO.ZS', title: 'Population Over 65 by Country', description: 'Share of population ages 65 and above. Key aging indicator. Data from World Bank.' },
  'youth-unemployment': { id: 'SL.UEM.1524.ZS', title: 'Youth Unemployment Rate by Country', description: 'Unemployment rate for ages 15–24 (%). Data from World Bank / ILO.' },
  'suicide-rate': { id: 'SH.STA.SUIC.P5', title: 'Suicide Rate by Country', description: 'Suicide mortality rate per 100,000 population. Data from World Bank / WHO.' },
  'net-migration': { id: 'SM.POP.NETM', title: 'Net Migration by Country', description: 'Net migration (immigrants minus emigrants) over five-year periods. Data from World Bank / UN.' },
  'tax-revenue': { id: 'GC.TAX.TOTL.GD.ZS', title: 'Tax Revenue (% of GDP) by Country', description: 'Tax revenue as a share of GDP. Reflects government fiscal capacity. Data from World Bank.' },
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const config = SLUG_MAP[slug];
  if (!config) return { title: 'Not Found' };

  const ind = INDICATORS.find(i => i.id === config.id);
  const source = config.id.startsWith('IMF.') ? 'IMF World Economic Outlook'
    : config.id.startsWith('WHO.') ? 'WHO Global Health Observatory'
    : 'World Bank';

  return {
    title: `${config.title} (2026) — Ranked List of 218 Countries`,
    description: `${config.description} Ranked list of 218 countries with interactive charts and historical trends. Data from ${source}. Updated 2026.`,
    alternates: {
      canonical: `https://statisticsoftheworld.com/ranking/${slug}`,
    },
    openGraph: {
      title: `${config.title} (2026) — Ranked List of 218 Countries`,
      description: `${config.description} Compare 218 countries. Source: ${source}.`,
      siteName: 'Statistics of the World',
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(SLUG_MAP).map(slug => ({ slug }));
}

export default async function RankingPage({ params }: Props) {
  const { slug } = await params;
  const config = SLUG_MAP[slug];
  if (!config) notFound();

  const ind = INDICATORS.find(i => i.id === config.id);
  if (!ind) notFound();

  const data = await getIndicatorForAllCountries(config.id);

  // Find related rankings
  const related = Object.entries(SLUG_MAP)
    .filter(([s]) => s !== slug)
    .slice(0, 8);

  const top = data[0];
  const bottom = data[data.length - 1];
  const year = top?.year || 2026;
  const fmtTop = top ? formatValue(top.value, ind.format, ind.decimals) : '';
  const fmtBottom = bottom ? formatValue(bottom.value, ind.format, ind.decimals) : '';

  // Compute median
  const midIdx = Math.floor(data.length / 2);
  const median = data[midIdx];
  const fmtMedian = median ? formatValue(median.value, ind.format, ind.decimals) : '';

  // Build FAQ Q&A pairs from the real data
  const faqs = [
    {
      q: `Which country has the highest ${ind.label.toLowerCase()} in ${year}?`,
      a: top ? `${top.country} has the highest ${ind.label.toLowerCase()} at ${fmtTop} as of ${year}, according to ${ind.source === 'imf' ? 'IMF' : 'World Bank'} data.` : '',
    },
    {
      q: `Which country has the lowest ${ind.label.toLowerCase()} in ${year}?`,
      a: bottom ? `${bottom.country} has the lowest ${ind.label.toLowerCase()} at ${fmtBottom} as of ${year}.` : '',
    },
    {
      q: `How many countries are ranked by ${ind.label.toLowerCase()}?`,
      a: `${data.length} countries have reported data for ${ind.label.toLowerCase()}. The data is sourced from the ${ind.source === 'imf' ? 'IMF World Economic Outlook' : 'World Bank World Development Indicators'}.`,
    },
    {
      q: `What is the median ${ind.label.toLowerCase()} across all countries?`,
      a: median ? `The median ${ind.label.toLowerCase()} is ${fmtMedian} (${median.country}, ranked #${midIdx + 1} out of ${data.length} countries).` : '',
    },
  ].filter(f => f.a);

  // JSON-LD: ItemList + FAQPage + BreadcrumbList + Dataset
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        name: `${config.title} (${year})`,
        description: `Ranked list of ${data.length} countries by ${ind.label.toLowerCase()}. Source: ${ind.source === 'imf' ? 'IMF' : ind.id.startsWith('WHO.') ? 'WHO' : 'World Bank'}.`,
        numberOfItems: data.length,
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        itemListElement: data.slice(0, 20).map((d, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: d.country,
          url: `https://statisticsoftheworld.com${getCleanCountryIndicatorUrl(d.countryId, config.id)}`,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
          { '@type': 'ListItem', position: 2, name: 'Indicators', item: 'https://statisticsoftheworld.com/indicators' },
          { '@type': 'ListItem', position: 3, name: config.title, item: `https://statisticsoftheworld.com/ranking/${slug}` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'Dataset',
        name: `${config.title} — ${year} Rankings`,
        description: `${config.description} Covers ${data.length} countries. Source: ${ind.source === 'imf' ? 'IMF World Economic Outlook' : ind.id.startsWith('WHO.') ? 'WHO Global Health Observatory' : 'World Bank World Development Indicators'}.`,
        url: `https://statisticsoftheworld.com/ranking/${slug}`,
        identifier: config.id,
        license: 'https://creativecommons.org/licenses/by/4.0/',
        temporalCoverage: `${year}`,
        spatialCoverage: { '@type': 'Place', name: 'World' },
        creator: {
          '@type': 'Organization',
          name: ind.source === 'imf' ? 'IMF' : ind.id.startsWith('WHO.') ? 'WHO' : 'World Bank',
          url: ind.source === 'imf' ? 'https://www.imf.org' : ind.id.startsWith('WHO.') ? 'https://www.who.int' : 'https://www.worldbank.org',
        },
        provider: { '@type': 'Organization', name: 'Statistics of the World', url: 'https://statisticsoftheworld.com' },
        isAccessibleForFree: true,
        distribution: {
          '@type': 'DataDownload',
          encodingFormat: 'application/json',
          contentUrl: `https://statisticsoftheworld.com/api/v2/indicator/${encodeURIComponent(config.id)}`,
        },
        keywords: [config.title, 'country rankings', ind.source === 'imf' ? 'IMF' : 'World Bank', 'economic data', `${year}`],
        dateModified: new Date().toISOString().split('T')[0],
      },
    ],
  };

  // Programmatic SEO summary paragraphs
  const top5 = data.slice(0, 5);
  const top10 = data.slice(0, 10);
  const bottom5 = data.slice(-5).reverse();
  const sourceFull = ind.source === 'imf' ? 'IMF World Economic Outlook' : ind.id.startsWith('WHO.') ? 'WHO Global Health Observatory' : 'World Bank World Development Indicators';

  const summaryParagraph = top && bottom ? (
    `In ${year}, ${top.country} leads the world in ${ind.label.toLowerCase()} with ${fmtTop}, ` +
    `followed by ${top5.slice(1, 5).map(d => `${d.country} (${formatValue(d.value, ind.format, ind.decimals)})`).join(', ')}. ` +
    `At the other end, ${bottom.country} ranks last at ${fmtBottom}. ` +
    `The global median is ${fmtMedian} (${median?.country}). ` +
    `This ranking covers ${data.length} countries and is sourced from the ${sourceFull}, one of the most authoritative sources for international economic statistics.`
  ) : '';

  // Second paragraph with distribution context
  const top10Share = ind.format === 'currency' && top10.length > 0
    ? top10.reduce((sum, d) => sum + (d.value || 0), 0)
    : null;
  const totalValue = ind.format === 'currency'
    ? data.reduce((sum, d) => sum + (d.value || 0), 0)
    : null;
  const contextParagraph = top10Share && totalValue && totalValue > 0
    ? `The top 10 countries account for ${((top10Share / totalValue) * 100).toFixed(0)}% of the global total. ` +
      `The top 10 are: ${top10.map((d, i) => `${i + 1}. ${d.country}`).join(', ')}. ` +
      `All data on this page is free to use with attribution. An API endpoint is available at /api/v2/indicator/${encodeURIComponent(config.id)} for programmatic access.`
    : `The top 10 countries are: ${top10.map((d, i) => `${i + 1}. ${d.country}`).join(', ')}. ` +
      `All data is sourced from the ${sourceFull} and updated regularly. Free API access is available for developers and researchers.`;

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />

      <section className="max-w-[1000px] mx-auto px-6 py-10">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/indicators" className="hover:text-gray-600 transition">Indicators</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{config.title}</span>
        </nav>

        <h1 className="text-[28px] font-bold mb-2">{config.title} — {year} World Rankings</h1>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <p className="text-[14px] text-[#64748b] leading-relaxed max-w-[700px]">{config.description}</p>
          <span className="text-[12px] text-[#94a3b8] bg-[#f1f5f9] px-2.5 py-1 rounded-full whitespace-nowrap">
            Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} · Source: {ind.source === 'imf' ? 'IMF' : ind.id.startsWith('WHO.') ? 'WHO' : 'World Bank'}
          </span>
        </div>

        {/* SEO summary paragraphs */}
        {summaryParagraph && (
          <div className="mb-6 max-w-[800px] space-y-3">
            <p className="text-[14px] text-[#475569] leading-relaxed">
              {summaryParagraph}
            </p>
            <p className="text-[14px] text-[#64748b] leading-relaxed">
              {contextParagraph}
            </p>
          </div>
        )}

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="border border-gray-100 rounded-xl p-4">
            <div className="text-[15px] text-gray-400 mb-1">Countries</div>
            <div className="text-[20px] font-bold">{data.length}</div>
          </div>
          {data.length > 0 && (
            <>
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="text-[15px] text-gray-400 mb-1">Highest</div>
                <div className="text-[16px] font-bold text-green-600">{fmtTop}</div>
                <div className="text-[15px] text-gray-400">{top.country}</div>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="text-[15px] text-gray-400 mb-1">Lowest</div>
                <div className="text-[16px] font-bold text-red-500">{fmtBottom}</div>
                <div className="text-[15px] text-gray-400">{bottom.country}</div>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="text-[15px] text-gray-400 mb-1">Latest Year</div>
                <div className="text-[20px] font-bold">{year}</div>
              </div>
            </>
          )}
        </div>

        {/* Rankings table */}
        <div className="border border-gray-100 rounded-xl overflow-hidden mb-8">
          <table className="w-full">
            <caption className="sr-only">{config.title} — {data.length} countries ranked by {ind.label.toLowerCase()} ({year}). Source: {ind.source === 'imf' ? 'IMF' : ind.source === 'who' ? 'WHO' : 'World Bank'}.</caption>
            <thead>
              <tr className="text-left text-[15px] text-gray-400 uppercase border-b border-gray-100 bg-gray-50">
                <th scope="col" className="px-4 py-2.5 w-12">#</th>
                <th scope="col" className="px-4 py-2.5">Country</th>
                <th scope="col" className="px-4 py-2.5 text-right">{ind.label}</th>
                <th className="px-4 py-2.5 w-48 hidden md:table-cell"></th>
                <th className="px-4 py-2.5 text-right w-16">Year</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry, i) => {
                const maxVal = Math.max(...data.map(d => Math.abs(d.value || 0)));
                const barWidth = maxVal > 0 ? (Math.abs(entry.value || 0) / maxVal) * 100 : 0;
                return (
                  <tr key={entry.countryId} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-2 text-gray-300 text-[15px]">{i + 1}</td>
                    <td className="px-4 py-2">
                      <Link href={getCleanCountryIndicatorUrl(entry.countryId, config.id)} className="inline-flex items-center gap-2 text-[15px] text-blue-600 hover:text-blue-800">
                        <Flag iso2={entry.iso2} size={20} />
                        {entry.country}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-[15px]">
                      {formatValue(entry.value, ind.format, ind.decimals)}
                    </td>
                    <td className="px-4 py-2 hidden md:table-cell">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${barWidth}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right text-gray-400 text-[14px]">{entry.year}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Expert editorial content — the FedPay pattern */}
        {EDITORIAL[slug] && (
          <div className="mb-10">
            <h2 className="text-[20px] font-bold mb-4 text-[#0d1b2a]">Understanding {config.title}</h2>
            <div className="space-y-4 max-w-[800px]">
              {EDITORIAL[slug].map((p, i) => (
                <p key={i} className="text-[15px] text-[#374151] leading-[1.8]">{p}</p>
              ))}
            </div>
          </div>
        )}

        {/* FAQ section — visible to users AND crawlers */}
        {faqs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[18px] font-semibold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="border border-gray-100 rounded-xl" open={i === 0}>
                  <summary className="px-4 py-3 cursor-pointer text-[15px] font-medium hover:bg-gray-50 transition">
                    {faq.q}
                  </summary>
                  <p className="px-4 pb-3 text-[14px] text-[#475569] leading-relaxed">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Related rankings */}
        <div>
          <h2 className="text-[16px] font-semibold mb-3">Related Rankings</h2>
          <div className="flex flex-wrap gap-2">
            {related.map(([s, cfg]) => (
              <Link
                key={s}
                href={`/ranking/${s}`}
                className="text-[14px] px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-[#64748b]"
              >
                {cfg.title}
              </Link>
            ))}
          </div>
        </div>

        {/* Related blog articles — cross-link for SEO */}
        {(() => {
          const relatedBlogs = BLOG_POSTS.filter(p => p.indicatorId === config.id).slice(0, 3);
          if (relatedBlogs.length === 0) return null;
          return (
            <div className="mt-6">
              <h2 className="text-[16px] font-semibold mb-3">Related Articles</h2>
              <div className="space-y-2">
                {relatedBlogs.map(bp => (
                  <Link key={bp.slug} href={`/blog/${bp.slug}`} className="block text-[14px] text-[#2563eb] hover:text-[#1d4ed8] hover:underline transition">
                    {bp.title} →
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}
      </section>

      <Footer />
    </main>
  );
}
