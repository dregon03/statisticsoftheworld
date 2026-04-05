import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCountry, getAllIndicatorsForCountry, INDICATORS, formatValue } from '@/lib/data';
import Flag from '../../Flag';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

// ─── Expert editorial for top comparison pages ──────────
const COMPARISON_EDITORIAL: Record<string, string> = {
  'united-states-vs-china': 'The United States and China are the two largest economies in the world, together accounting for over 40% of global GDP. The US leads in nominal terms with an economy driven by technology, financial services, and consumer spending, while China — the world\'s manufacturing powerhouse — has closed the gap dramatically over the past three decades and surpasses the US in purchasing power parity (PPP) terms. The economic rivalry between these two nations shapes global trade policy, technology competition, and geopolitical alignment.',
  'united-states-vs-japan': 'The United States and Japan represent the world\'s first and fourth largest economies. Japan\'s GDP peaked relative to the US in the early 1990s at roughly 70% of American output, but decades of deflation, demographic decline, and stagnant growth have widened the gap. Japan remains a global leader in automotive manufacturing, robotics, and electronics, while the US dominates in technology, financial services, and higher education. Japan\'s government debt exceeds 250% of GDP — the highest in the developed world — yet it borrows at near-zero interest rates due to domestic savings and central bank policy.',
  'united-states-vs-germany': 'The United States and Germany are the largest economies in the Americas and Europe respectively. Germany\'s export-driven economy — built on automotive engineering, industrial machinery, and chemicals — contrasts with America\'s more consumption-driven model. Germany consistently runs a large trade surplus while the US runs a deficit. However, Germany faces structural challenges: an aging population, dependence on Russian energy (a vulnerability exposed by the Ukraine war), and a manufacturing sector under pressure from Chinese competition and the electric vehicle transition.',
  'united-states-vs-india': 'The United States and India represent the world\'s largest established economy and its fastest-growing major economy. India\'s GDP growth rate consistently outpaces the US by 3-4 percentage points, driven by a young population, rapid urbanization, and a booming technology services sector. However, India\'s GDP per capita remains roughly one-fiftieth of America\'s, reflecting the enormous development gap that persists despite decades of growth. India overtook the UK as the world\'s fifth-largest economy in 2022 and is projected to become the third-largest by the early 2030s.',
  'china-vs-india': 'China and India — the world\'s two most populous nations — offer a fascinating economic comparison. China\'s economy is roughly five times larger than India\'s in nominal terms, reflecting China\'s 20-year head start in economic reform (1978 vs 1991) and its more aggressive industrialization strategy. China\'s GDP per capita is about five times India\'s. However, India\'s growth rate now exceeds China\'s, and its younger demographic profile suggests stronger long-term growth potential. China faces the "middle-income trap" risk with an aging population, while India\'s demographic dividend is just beginning.',
  'united-states-vs-united-kingdom': 'The United States and United Kingdom share deep economic ties — the UK is one of America\'s largest foreign investors, and London and New York are the world\'s two dominant financial centers. The US economy is roughly seven times larger than the UK\'s, and GDP per capita is about 50% higher. The UK has faced unique economic headwinds since Brexit, including reduced trade access to the European single market and labor shortages in key sectors. Both countries share a services-dominated economic structure, with financial services, technology, and professional services driving growth.',
  'germany-vs-france': 'Germany and France are the two largest economies in the European Union and the political core of European integration. Germany\'s economy is about 30% larger, driven by industrial exports, while France has a more balanced economy with stronger services and agricultural sectors. France maintains a larger military and nuclear deterrent, while Germany has traditionally relied on NATO. Both countries face similar demographic challenges — aging populations and low fertility rates — but differ in labor market flexibility, with France historically having higher unemployment and stronger worker protections.',
  'japan-vs-south-korea': 'Japan and South Korea share remarkable economic parallels: both are highly developed East Asian economies built on export-oriented manufacturing, with strong automotive and electronics sectors. Japan\'s economy is roughly three times larger, but South Korea has grown much faster over the past three decades, narrowing the per-capita income gap significantly. South Korea now leads in semiconductor manufacturing (Samsung, SK Hynix) and has a younger population, while Japan has deeper capital markets and more diversified industrial conglomerates. Both countries face severe demographic headwinds — South Korea\'s fertility rate (below 0.8) is now lower than Japan\'s.',
  'india-vs-brazil': 'India and Brazil are the largest economies in South Asia and South America respectively, and both are key members of the BRICS group. India\'s economy has pulled significantly ahead — roughly three times larger than Brazil\'s in nominal terms — driven by its massive population advantage (1.4 billion vs 215 million) and sustained high growth rates. However, Brazil\'s GDP per capita is roughly twice India\'s, reflecting higher average living standards. Brazil\'s economy is more dependent on commodity exports (soybeans, iron ore, oil), while India\'s growth is driven by services, technology, and a large domestic consumer market.',
  'united-states-vs-russia': 'The economic gap between the United States and Russia is far larger than Cold War-era comparisons might suggest. The US economy is roughly 15 times larger than Russia\'s in nominal terms — Russia\'s GDP is comparable to Italy\'s or South Korea\'s despite having the world\'s largest landmass and vast natural resources. Russia\'s economy is heavily dependent on oil and gas exports, which account for roughly 40% of government revenue. Western sanctions following the 2022 invasion of Ukraine have further isolated Russia from global financial markets, though energy exports to Asia have partially offset the impact.',
  'united-states-vs-canada': 'The United States and Canada share the world\'s longest undefended border and one of the deepest bilateral trading relationships on Earth. The US economy is roughly 12 times larger than Canada\'s, but Canada\'s GDP per capita is competitive — about 75% of the American level. Canada\'s economy is more resource-dependent (oil, minerals, timber) while the US is more diversified. Both countries face similar demographic trends, though Canada has used immigration more aggressively to offset aging, with the highest immigration rate per capita in the G7.',
  'united-states-vs-mexico': 'The United States and Mexico are bound by USMCA (formerly NAFTA), one of the world\'s largest free trade agreements. The US economy is roughly 20 times Mexico\'s, but Mexico has become America\'s largest trading partner, surpassing China in 2023. Mexico\'s manufacturing sector has boomed through nearshoring as companies diversify supply chains away from China. Despite strong trade ties, a massive GDP per capita gap persists — the average American earns roughly five times more than the average Mexican.',
  'united-states-vs-australia': 'The United States and Australia are close allies with English-speaking, services-dominated economies. Australia\'s GDP per capita often exceeds most European nations, driven by mineral exports (iron ore, coal, natural gas) and a strong services sector. Australia avoided recession for nearly 30 consecutive years before COVID-19, one of the longest growth streaks in economic history. Both countries face housing affordability crises, but Australia\'s is more severe relative to incomes.',
  'united-kingdom-vs-france': 'The United Kingdom and France are Europe\'s second and third largest economies with remarkably similar GDP levels — they frequently trade places in the rankings depending on exchange rate movements. France has higher productivity per hour worked, while the UK has lower unemployment and a more flexible labor market. Post-Brexit, the UK\'s growth trajectory has diverged from France\'s, with higher inflation and greater trade friction with the EU. Both maintain nuclear arsenals and permanent UN Security Council seats.',
  'india-vs-pakistan': 'India and Pakistan share a contentious history since partition in 1947, and the economic divergence has widened dramatically. India\'s economy is now roughly 10 times larger than Pakistan\'s, driven by IT services, manufacturing, and a growing consumer market. Pakistan has struggled with chronic fiscal deficits, high inflation, and political instability, requiring multiple IMF bailout programs. India\'s GDP growth consistently outpaces Pakistan\'s by 3-4 percentage points annually.',
  'brazil-vs-argentina': 'Brazil and Argentina are South America\'s two largest economies with a long history of economic rivalry. Brazil\'s economy is roughly four times Argentina\'s, driven by agriculture (world\'s largest soybean and beef exporter), mining, and a diversified industrial base. Argentina has been plagued by recurring debt crises, hyperinflation, and currency devaluations — experiencing its worst economic crisis in 2024 before radical reform measures. Both countries are major agricultural exporters but have taken very different economic policy approaches.',
  'south-korea-vs-australia': 'South Korea and Australia represent different paths to high-income status. South Korea achieved it through industrial policy, export-driven manufacturing (Samsung, Hyundai, LG), and massive investment in education and R&D. Australia achieved it through natural resource abundance, immigration, and strong institutions. South Korea\'s GDP per capita has nearly caught Australia\'s despite having no natural resource wealth. South Korea works the longest hours in the OECD while Australia has one of the better work-life balances.',
  'indonesia-vs-brazil': 'Indonesia and Brazil are two of the largest emerging market economies, with combined populations exceeding 500 million. Both are major commodity exporters — Indonesia leads in palm oil, nickel, and tin, while Brazil dominates soybeans, iron ore, and coffee. Indonesia\'s economy has grown more consistently, averaging 5% annually, while Brazil has experienced more volatile boom-bust cycles. Indonesia\'s demographic advantage (younger population, lower dependency ratio) suggests stronger long-term growth potential.',
  'turkey-vs-mexico': 'Turkey and Mexico are strategically positioned as bridges between economic blocs — Turkey between Europe and Asia, Mexico between North and South America. Both have large, young populations and manufacturing-oriented economies integrated into regional supply chains. Turkey has faced higher inflation and currency volatility (the lira lost over 80% of its value against the dollar between 2018 and 2024), while Mexico has maintained more monetary stability. Both are benefiting from nearshoring trends as companies diversify away from China.',
  'united-states-vs-france': 'The United States and France are the world\'s largest and seventh-largest economies respectively. France\'s economy is more state-directed than America\'s, with higher government spending as a share of GDP, a more generous welfare state, and stronger labor protections. France leads in aerospace (Airbus), luxury goods (LVMH), and nuclear energy (generating ~70% of its electricity from nuclear), while the US dominates in technology, finance, and defense. GDP per capita in the US is roughly 40% higher than France\'s, though the French work fewer hours and enjoy longer vacations.',
  'united-states-vs-south-korea': 'The United States and South Korea are close economic and military allies. South Korea\'s transformation from one of the world\'s poorest countries in 1960 to a high-income OECD member is one of the most remarkable development stories in history. South Korea\'s economy is driven by semiconductor manufacturing (Samsung, SK Hynix), automotive (Hyundai, Kia), and shipbuilding — it is the world\'s leading memory chip producer. The US economy is roughly 14 times larger in nominal terms, but South Korea punches well above its weight in manufacturing, R&D spending (4.8% of GDP, among the world\'s highest), and education.',
  'china-vs-japan': 'China overtook Japan as the world\'s second-largest economy in 2010, ending Japan\'s 42-year run in that position. The reversal was dramatic: in 2000, Japan\'s GDP was nearly three times China\'s; by 2025, China\'s GDP exceeds Japan\'s by a factor of four. China\'s growth has been driven by manufacturing exports, infrastructure investment, and urbanization, while Japan has struggled with deflation and demographic decline. Japan\'s population has been shrinking since 2008, while China\'s began declining in 2022 — China may be entering its own "Japan scenario" of aging-driven stagnation.',
  'china-vs-russia': 'China and Russia are the world\'s second and eleventh largest economies, bound by a "no limits" strategic partnership declared in 2022. Their economic relationship is highly asymmetric: China\'s economy is roughly 10 times Russia\'s, and Russia has become increasingly dependent on China as a buyer of oil and gas following Western sanctions. China is Russia\'s largest trading partner, while Russia ranks outside China\'s top five. Russia exports primarily energy and raw materials to China and imports manufactured goods — a classic commodity-dependent relationship that mirrors Russia\'s economic structure globally.',
  'china-vs-germany': 'China and Germany are the world\'s largest and third-largest economies respectively, and their economic relationship is uniquely intertwined. Germany\'s automotive industry (Volkswagen, BMW, Mercedes-Benz) generates roughly a third of its profits from China, making it more exposed to Chinese economic slowdowns than any other Western economy. China\'s industrial policy has targeted exactly the sectors where Germany excels — automotive, machinery, chemicals — creating direct competitive pressure. Germany runs a trade deficit with China, importing consumer electronics and intermediate goods while exporting cars and industrial equipment.',
  'china-vs-united-kingdom': 'China and the United Kingdom represent contrasting economic models: China\'s state-directed, investment-heavy model versus the UK\'s market-driven, services-dominated approach. China\'s economy is roughly six times larger than the UK\'s in nominal terms and growing much faster, but the UK\'s GDP per capita remains about three times higher. The UK was an early Western advocate for Chinese investment (welcoming Huawei and Chinese infrastructure deals) but has since reversed course on security grounds. Both countries are major global financial centers — London and Hong Kong (part of China) rank among the world\'s top three.',
  'china-vs-brazil': 'China and Brazil are two of the five BRICS nations and major trading partners. China is Brazil\'s largest trading partner, purchasing roughly a third of Brazil\'s exports — primarily soybeans, iron ore, crude oil, and beef. The relationship is heavily commodity-based: Brazil ships raw materials to China and imports manufactured goods, electronics, and machinery. China\'s economy is roughly eight times larger than Brazil\'s. Brazil\'s growth has been volatile (recession in 2015-16, COVID crash in 2020), while China has maintained more consistent expansion, though its growth rate has slowed from double digits to around 5%.',
  'japan-vs-germany': 'Japan and Germany are the world\'s fourth and third largest economies — remarkably similar in GDP, both export-driven manufacturing powerhouses, and both facing severe demographic challenges. Japan\'s population peaked in 2008 and Germany\'s working-age population is declining despite immigration. Both countries have world-class automotive industries (Toyota, Honda, Nissan vs. Volkswagen, BMW, Mercedes), strong mittelstand/SME manufacturing sectors, and cultures that prize engineering excellence. Germany\'s recent energy crisis (losing cheap Russian gas) mirrors Japan\'s post-Fukushima energy challenges — both had to rapidly restructure their energy systems.',
  'japan-vs-india': 'Japan and India represent aging wealth versus youthful growth. Japan\'s economy was built during the postwar miracle of 1950-1990 and has since stagnated, while India is in the early stages of its own transformation. India\'s population (1.4 billion) dwarfs Japan\'s (125 million), but Japan\'s GDP per capita is roughly 30 times higher. Japan is one of India\'s largest foreign investors and development aid donors, and the two countries have deepened strategic ties as a counterweight to China. India\'s IT services sector exports heavily to Japan, and Japanese companies like Suzuki dominate India\'s automotive market.',
  'germany-vs-united-kingdom': 'Germany and the United Kingdom are Europe\'s first and third largest economies, with fundamentally different economic structures. Germany\'s economy is manufacturing and export-driven (automotive, chemicals, machinery account for 20%+ of GDP), while the UK is services-dominated (financial services, professional services, creative industries account for 80%+ of GDP). Pre-Brexit, the UK was one of Germany\'s largest trading partners within the EU single market; trade friction has increased since. Germany runs a consistent trade surplus while the UK runs a deficit. Both have world-class universities but take different approaches to industrial policy.',
  'germany-vs-italy': 'Germany and Italy are the eurozone\'s first and third largest economies, but the gap has widened significantly since the creation of the euro. Italy\'s GDP has barely grown in real terms since 2000, while Germany\'s has expanded by roughly 30%. Italy\'s challenges include low productivity growth, an aging population, high government debt (140%+ of GDP), a rigid labor market, and a persistent north-south economic divide. Germany\'s competitive advantage in manufacturing has been reinforced by the euro — a currency that is weaker than the Deutschmark would be, making German exports more competitive.',
  'france-vs-italy': 'France and Italy are the eurozone\'s second and third largest economies with deep historical and cultural ties. France\'s economy has outperformed Italy\'s dramatically since 2000 — French GDP per capita is now roughly 20% higher. France has stronger institutions, higher productivity growth, and has been more successful at attracting foreign investment and building global champion companies (LVMH, TotalEnergies, L\'Oréal). Italy struggles with bureaucratic inefficiency, an aging population, and a dual economy: the prosperous industrial north and the lagging agrarian south. Both countries are major tourist destinations — France leads globally with 90M+ visitors annually.',
  'france-vs-spain': 'France and Spain are major EU economies with strong trade links. France\'s GDP is roughly 70% larger than Spain\'s, reflecting higher productivity and a more diversified industrial base. Spain\'s economy is more tourism-dependent (tourism accounts for ~12% of GDP, twice France\'s share), which made it more vulnerable to the COVID-19 pandemic. Spain suffered a deeper housing crisis in 2008-2012 and has higher structural unemployment, particularly among youth (30%+). Both countries have large agricultural sectors and compete in wine, olive oil, and food exports.',
  'india-vs-indonesia': 'India and Indonesia are the two largest economies in South and Southeast Asia respectively, with a combined population exceeding 1.7 billion. India\'s economy is roughly three times larger, but Indonesia has higher GDP per capita. Both countries are experiencing rapid urbanization and industrialization, with young populations providing a demographic dividend. India\'s economy is more services-oriented (IT, financial services), while Indonesia\'s is more natural resources-dependent (palm oil, coal, nickel). Indonesia is the world\'s largest nickel producer, critical for electric vehicle batteries.',
  'india-vs-bangladesh': 'India and Bangladesh share a 4,096 km border and complex economic ties. Bangladesh\'s garment industry — the world\'s second largest after China — was built partly on relocating from more expensive Indian production. Bangladesh has achieved remarkable economic growth, averaging 6-7% annually, and overtook India in GDP per capita (in PPP terms) briefly in 2020, a symbolic milestone given that Bangladesh was one of the world\'s poorest countries at independence in 1971. India\'s economy is roughly 10 times larger overall, but Bangladesh outperforms India on several human development indicators including life expectancy and female labor force participation.',
  'brazil-vs-mexico': 'Brazil and Mexico are Latin America\'s two largest economies with fundamentally different growth models. Mexico\'s economy is deeply integrated with the United States through USMCA (formerly NAFTA), with 80%+ of its exports going north. Brazil\'s trade is more diversified, with China as its largest partner. Mexico\'s proximity to the US has made it a nearshoring magnet, while Brazil\'s growth depends more on commodity cycles and domestic consumption. Mexico has maintained more macroeconomic stability with lower inflation and a floating currency, while Brazil has higher interest rates and more volatile growth.',
  'canada-vs-australia': 'Canada and Australia are remarkably similar: both are large, resource-rich, English-speaking Commonwealth nations with small populations relative to their landmass (38M and 26M respectively). Both rely heavily on commodity exports — Canada on oil, natural gas, and timber; Australia on iron ore, coal, and LNG. Both have used immigration to drive population growth and offset aging. Australia has the edge in recent economic performance, having avoided recession for 28 consecutive years before COVID. Canada\'s economy is more closely tied to the US (its largest trading partner by far), while Australia\'s trade is increasingly oriented toward Asia, especially China.',
  'canada-vs-mexico': 'Canada and Mexico are the United States\' two USMCA partners, but their economies are strikingly different. Canada is a high-income economy with GDP per capita roughly four times Mexico\'s, extensive social safety nets, and universal healthcare. Mexico has a much larger and younger population (130M vs 38M), lower labor costs, and faster GDP growth potential. Both economies are heavily dependent on US trade, but Mexico has surpassed Canada as America\'s top trading partner. Canada\'s economy is more resource-driven, while Mexico has become a manufacturing hub, particularly in automotive and aerospace.',
  'russia-vs-india': 'Russia and India maintain a strategic partnership that dates back to the Soviet era, though the economic dimension has grown dramatically since 2022 as Russia pivoted to Asian markets following Western sanctions. India has become Russia\'s largest buyer of seaborne crude oil, purchasing at discount prices. Russia\'s economy is roughly one-third the size of India\'s in PPP terms, and heavily commodity-dependent. India\'s economy is more diversified, younger, and faster-growing. Russia\'s GDP per capita is still higher, but India is closing the gap. Both are members of BRICS and the Shanghai Cooperation Organisation.',
  'russia-vs-brazil': 'Russia and Brazil are two BRICS economies with commodity-dependent growth models but very different trajectories. Russia\'s economy has been constrained by Western sanctions, capital flight, and isolation from global financial markets since 2022, while Brazil\'s has benefited from strong commodity prices and growing trade with China. Both countries are major energy producers — Russia leads in natural gas and is a top oil exporter, while Brazil\'s pre-salt oil discoveries have made it a significant crude producer. Brazil\'s economy is roughly 30% larger than Russia\'s in nominal dollar terms.',
  'italy-vs-spain': 'Italy and Spain are the eurozone\'s third and fourth largest economies with Mediterranean economic structures: strong tourism, significant agriculture, and manufacturing concentrated in specific regions. Italy\'s economy is about 40% larger, with a stronger industrial base in northern Italy (automotive, fashion, machinery). Spain has recovered more strongly from the 2008 financial crisis, achieving faster GDP growth through labor market reforms. Both struggle with high youth unemployment, though Spain\'s rate is higher. Spain has become Europe\'s solar energy leader, while Italy leads in luxury manufacturing.',
  'italy-vs-netherlands': 'Italy and the Netherlands offer a striking contrast in European economic models. The Netherlands, with only 17 million people, has a GDP per capita roughly 70% higher than Italy\'s 59 million, driven by an extraordinarily open and trade-dependent economy. The Netherlands hosts Europe\'s largest port (Rotterdam) and serves as the European headquarters for many multinational corporations due to favorable tax policies. Italy\'s manufacturing sector is larger in absolute terms, particularly in fashion, automotive, and food, but lower productivity growth has held back per-capita income.',
  'australia-vs-new-zealand': 'Australia and New Zealand are close allies with deeply integrated economies under the Closer Economic Relations agreement. Australia\'s economy is roughly eight times larger, but both share similar economic structures: commodity-dependent (mining for Australia, dairy and agriculture for NZ), services-heavy, and immigration-driven. New Zealand\'s GDP per capita is about 70% of Australia\'s, and many New Zealanders migrate to Australia for higher wages. Both countries have strong institutions, low corruption, and high quality of life, consistently ranking near the top of global livability indices.',
  'saudi-arabia-vs-uae': 'Saudi Arabia and the UAE are the Gulf\'s two largest economies, but with different diversification strategies. Saudi Arabia — the larger economy by roughly 3x — remains more oil-dependent, with petroleum still accounting for ~40% of GDP and 60%+ of government revenue. Vision 2030 aims to change this through tourism (NEOM, Red Sea projects), entertainment, and technology. The UAE, particularly Dubai, has diversified more successfully into finance, logistics, tourism, and real estate. The UAE\'s GDP per capita exceeds Saudi Arabia\'s, partly because its population is smaller and its economy is more services-oriented.',
  'saudi-arabia-vs-iran': 'Saudi Arabia and Iran are the Gulf\'s largest economies and bitter geopolitical rivals. Saudi Arabia\'s GDP is roughly three times Iran\'s in nominal terms, a gap dramatically widened by US sanctions on Iran since 2018. Iran\'s economy has been severely constrained by isolation from the global financial system, hyperinflation, and currency collapse — the rial lost 80%+ of its value. Despite these challenges, Iran has a more diversified manufacturing base and a larger population (88M vs 35M). Saudi Arabia\'s economy is more oil-concentrated but benefits from massive sovereign wealth (the Public Investment Fund manages $900B+).',
  'nigeria-vs-south-africa': 'Nigeria and South Africa are Africa\'s two largest economies, competing for continental economic leadership. Nigeria\'s economy is larger in nominal GDP terms, driven by oil exports and a massive population (220M, Africa\'s largest). South Africa is more industrialized and diversified, with a stronger financial sector, mining industry (gold, platinum, diamonds), and manufacturing base. South Africa\'s GDP per capita is roughly three times Nigeria\'s, but both countries face severe challenges: Nigeria with infrastructure deficits and insecurity, South Africa with 30%+ unemployment and persistent inequality from the apartheid legacy.',
  'nigeria-vs-kenya': 'Nigeria and Kenya are West and East Africa\'s largest economies respectively. Nigeria\'s GDP is roughly five times Kenya\'s, driven by oil exports and a population of 220 million (vs Kenya\'s 55 million). However, Kenya has emerged as East Africa\'s technology and financial hub, with innovations like M-Pesa mobile money and a thriving startup ecosystem in Nairobi. Kenya\'s economy is more diversified (agriculture, tourism, services, technology) and less volatile than Nigeria\'s oil-dependent model. Kenya\'s GDP per capita is comparable to Nigeria\'s despite the overall size gap.',
  'singapore-vs-switzerland': 'Singapore and Switzerland are two of the world\'s wealthiest small nations, both serving as global financial centers and wealth management hubs. Switzerland\'s economy is roughly five times larger, but Singapore\'s GDP per capita is comparable or higher. Both are trade-dependent, politically stable, and attract global talent through favorable business environments. Switzerland\'s economy is built on finance, pharmaceuticals (Roche, Novartis), precision manufacturing (watches, machinery), and food (Nestlé). Singapore dominates Asian trade finance, semiconductor logistics, and serves as the gateway to Southeast Asian markets.',
  'united-states-vs-brazil': 'The United States and Brazil are the largest economies in North and South America respectively. The US economy is roughly 15 times larger, but Brazil is a critical global commodity supplier — the world\'s top exporter of soybeans, coffee, sugar, and orange juice, and a major producer of iron ore and beef. Brazil\'s economy is more vulnerable to commodity price swings, while the US is diversified across technology, finance, healthcare, and manufacturing. Both countries face significant inequality challenges, though Brazil\'s Gini coefficient is considerably higher.',
  'united-kingdom-vs-canada': 'The United Kingdom and Canada share deep Commonwealth ties, similar legal systems, and English-speaking business cultures. Both economies are services-heavy, with strong financial sectors (London and Toronto). The UK\'s economy is roughly 40% larger than Canada\'s, but Canada\'s GDP per capita is competitive due to its smaller population and resource wealth. Canada\'s economy benefits from proximity to the US market and vast natural resources (oil sands, minerals, timber), while the UK is more globally oriented, with London serving as Europe\'s financial capital even post-Brexit.',
  'united-kingdom-vs-australia': 'The United Kingdom and Australia are longstanding allies with economies of similar size — Australia\'s GDP has occasionally exceeded the UK\'s depending on exchange rates. The UK economy is services-dominated, centered on London\'s financial sector, while Australia\'s is more resource-dependent (iron ore, coal, LNG comprise a large share of exports). Australia\'s GDP per capita consistently exceeds the UK\'s. Post-Brexit, the two countries signed a free trade agreement (AUKFTA) in 2021, reflecting a strategic pivot toward Indo-Pacific economic engagement.',
  'south-korea-vs-japan': 'South Korea and Japan are East Asia\'s most advanced economies outside China, with parallel development stories but different timescales. Japan industrialized first, reaching high-income status by the 1970s, while South Korea\'s transformation came later but was faster. South Korea\'s semiconductor industry (Samsung, SK Hynix) has surpassed Japan\'s, and Korean cultural exports (K-pop, Korean cinema) now rival Japan\'s soft power. Historical tensions over World War II-era issues periodically strain their economic relationship, including a 2019 trade dispute over export controls on semiconductor materials.',
  'turkey-vs-brazil': 'Turkey and Brazil are major emerging market economies with populations of 85 million and 215 million respectively. Both have experienced significant currency depreciation — the Turkish lira and Brazilian real have lost substantial value against the dollar since 2020. Turkey\'s economy is more manufacturing-oriented with strong textile and automotive sectors integrated into European supply chains, while Brazil is a commodity powerhouse. Both face high inflation relative to advanced economies and have used aggressive interest rate policy to manage price pressures.',
  'united-states-vs-italy': 'The United States and Italy are the world\'s first and eighth largest economies. Italy\'s economic stagnation since the early 2000s stands in stark contrast to America\'s technology-driven growth — Italy\'s real GDP per capita has barely changed in two decades while America\'s has grown by over 30%. Italy excels in luxury manufacturing (fashion, automotive, food), tourism (5th most visited country), and retains the eurozone\'s second-largest manufacturing sector. The US has a GDP per capita roughly twice Italy\'s, driven by higher productivity in technology and services.',
  'united-states-vs-spain': 'The United States and Spain represent very different economic scales and structures. The US economy is roughly 20 times larger, with a diversified, innovation-driven model. Spain\'s economy is heavily tourism-dependent (12% of GDP), more exposed to Eurozone monetary policy, and still recovering from the severe 2008 housing crisis that saw unemployment peak at 27%. Spain has emerged as a leader in renewable energy, particularly solar and wind, and has a competitive agricultural sector. US GDP per capita is roughly twice Spain\'s.',
  'china-vs-south-korea': 'China and South Korea have deep economic interdependence despite geopolitical tensions. South Korea exports heavily to China (roughly 25% of total exports), particularly semiconductors, displays, and petrochemicals. China\'s economy is roughly 12 times larger, but South Korea\'s GDP per capita is about three times higher. South Korea\'s technological sophistication — led by Samsung and SK Hynix in semiconductors — represents exactly the capability China is trying to build domestically, creating both commercial opportunity and strategic rivalry as the US-China tech competition intensifies.',
  'china-vs-indonesia': 'China and Indonesia are the world\'s second and sixteenth largest economies, with a growing economic partnership. China is Indonesia\'s largest trading partner and a major investor in Indonesian infrastructure (high-speed rail) and mining. Indonesia\'s vast nickel reserves — critical for EV batteries — have attracted massive Chinese investment. China\'s economy is roughly 12 times larger, but Indonesia has a much younger population and faster population growth. Indonesia\'s economy is more domestically driven, with private consumption accounting for over 50% of GDP.',
  'india-vs-japan': 'India and Japan represent contrasting economic narratives: India\'s rapid growth and demographic dividend versus Japan\'s technological maturity and demographic decline. India\'s economy has surpassed Japan\'s in PPP terms and is closing the gap in nominal terms. Japan is one of India\'s largest foreign investors, with Japanese companies heavily invested in India\'s automotive (Suzuki, Honda), electronics, and infrastructure sectors. The two countries have deepened strategic and economic ties, with Japan providing critical development financing for India\'s bullet train and metro projects.',
  'india-vs-united-kingdom': 'India overtook the United Kingdom as the world\'s fifth-largest economy in 2022, a symbolically significant milestone given that India was a British colony until 1947. India\'s economy is now roughly 10% larger in nominal terms and growing 3-4x faster. However, the UK\'s GDP per capita remains roughly 20 times India\'s, reflecting fundamentally different development stages. The UK has a large Indian diaspora (1.8 million) that contributes significantly to bilateral trade and investment. India\'s IT services sector has transformed the UK\'s technology landscape, with major outsourcing relationships.',
  'japan-vs-united-kingdom': 'Japan and the United Kingdom are the world\'s fourth and sixth largest economies with surprising economic parallels. Both are island nations with aging populations, large financial sectors, and economies that punch above their demographic weight. Japan\'s economy is roughly 40% larger than the UK\'s, driven by manufacturing (Toyota, Sony, Panasonic), while the UK is more services-oriented. Both have central banks that have experimented with unconventional monetary policy — the Bank of Japan pioneered quantitative easing in 2001, and the Bank of England adopted it in 2009.',
  'japan-vs-france': 'Japan and France are the world\'s fourth and seventh largest economies with different economic structures but similar GDP levels. Japan\'s economy is manufacturing-heavy (automotive, electronics, robotics), while France balances manufacturing with strong luxury goods, aerospace, and agricultural sectors. Both countries have large government sectors and high levels of government debt, though Japan\'s (250%+ of GDP) dwarfs France\'s (110%). Both face aging populations and low fertility rates, creating long-term fiscal pressure on pension and healthcare systems.',
  'germany-vs-japan': 'Germany and Japan are the world\'s third and fourth largest economies — two manufacturing superpowers with remarkably parallel economic histories. Both rebuilt from devastation after World War II into export champions, both face severe demographic decline, and both have struggled with economic stagnation in the 2020s. Germany\'s automotive industry competes directly with Japan\'s globally, and both countries are navigating the costly transition from internal combustion to electric vehicles. Japan\'s government debt is higher (250% vs 65% of GDP), but Germany\'s economy has been more affected by the energy crisis following Russia\'s invasion of Ukraine.',
  'germany-vs-china': 'Germany and China have a uniquely intertwined economic relationship that has become a strategic vulnerability for Germany. German automakers generate a third of their global profits in China, German chemicals and machinery companies depend on Chinese demand, and China is Germany\'s largest single-country trading partner. However, China\'s rise as a competitor in exactly the sectors Germany dominates — automotive, machinery, green technology — threatens to undermine Germany\'s export model. The EU-China EV tariff dispute directly affects German manufacturers who produce in China for global markets.',
  'germany-vs-india': 'Germany and India represent Europe\'s industrial powerhouse and Asia\'s fastest-growing major economy. Germany\'s economy is roughly 30% larger in nominal terms, but India\'s has been growing 4-5x faster and will likely overtake Germany within the next decade. German companies like Bosch, Siemens, and Volkswagen have significant operations in India, attracted by its young workforce and growing consumer market. India\'s IT and software services sector has no German equivalent — Germany\'s economy remains more hardware and manufacturing-oriented.',
  'indonesia-vs-india': 'Indonesia and India are the two largest democracies in South and Southeast Asia, with combined populations exceeding 1.7 billion. India\'s economy is roughly five times larger, but Indonesia\'s GDP per capita is higher, reflecting its smaller but wealthier population. Both countries have young demographics, growing middle classes, and large domestic consumer markets. Indonesia is more natural resource-rich (palm oil, nickel, tin, coal), while India has a larger and more sophisticated services sector. Both are benefiting from supply chain diversification away from China.',
  'indonesia-vs-mexico': 'Indonesia and Mexico are two of the largest emerging market economies, positioned as manufacturing alternatives to China in their respective regions. Both have populations exceeding 130 million and GDP levels within a similar range. Mexico\'s economy benefits from USMCA and proximity to the US, while Indonesia leverages its position in ASEAN and its vast natural resource base. Mexico\'s manufacturing sector is more integrated into US supply chains (automotive, electronics), while Indonesia is focusing on downstream processing of its mineral wealth, particularly nickel for EV batteries.',
  'russia-vs-united-states': 'Russia\'s economy is roughly one-fifteenth the size of America\'s in nominal terms — a gap that has widened dramatically since the Soviet collapse in 1991. Despite being the world\'s largest country by area, with massive reserves of oil, natural gas, minerals, and timber, Russia\'s economy has never successfully diversified beyond natural resources. The US leads in virtually every economic category: technology, finance, services, advanced manufacturing. Western sanctions since 2022 have further constrained Russia\'s economic potential, though Russian energy exports to China and India have partially offset the impact.',
  'russia-vs-germany': 'Russia and Germany had deep economic ties centered on energy — Germany imported roughly 55% of its natural gas from Russia before the 2022 invasion of Ukraine. The severing of this relationship forced Germany to find alternative energy sources at much higher cost, contributing to a manufacturing recession. Russia\'s economy is roughly a quarter of Germany\'s in nominal terms, despite having twice the population. Germany\'s economy is diversified and technology-intensive, while Russia remains commodity-dependent. The Nord Stream pipeline saga symbolizes the rise and fall of their economic interdependence.',
  'mexico-vs-indonesia': 'Mexico and Indonesia compete as the leading "China+1" manufacturing destinations. Mexico offers proximity to the US market and USMCA trade benefits, while Indonesia offers lower labor costs, abundant natural resources, and access to ASEAN\'s 680 million consumers. Both have large young populations (~130M each) and growing middle classes. Mexico\'s automotive and aerospace sectors are more developed, while Indonesia leads in minerals processing and palm oil. Both economies have achieved more macro stability than in previous decades, with moderate inflation and floating exchange rates.',
  'mexico-vs-argentina': 'Mexico and Argentina are Latin America\'s second and third largest economies with strikingly different economic trajectories. Mexico has maintained more macroeconomic stability, with lower inflation, a credible central bank, and deepening US trade integration. Argentina has experienced recurring crises — debt defaults in 2001 and 2020, triple-digit inflation in 2023-2024, and radical economic restructuring. Mexico\'s economy is roughly twice Argentina\'s in nominal terms. Mexico\'s growth model is manufacturing-for-export (primarily to the US), while Argentina\'s is agricultural exports (soybeans, beef, wine) with a larger but troubled industrial sector.',
  'south-korea-vs-germany': 'South Korea and Germany are two of the world\'s leading industrial exporters, with economies of comparable size on a per-capita basis. Germany\'s GDP is roughly four times larger overall, but South Korea invests a higher share of GDP in R&D (4.8% vs 3.1%). South Korea leads in semiconductor manufacturing and consumer electronics, while Germany dominates in automotive, chemicals, and industrial machinery. Both face severe demographic challenges — South Korea\'s fertility rate (below 0.8) is the world\'s lowest, even worse than Germany\'s. Both economies are heavily export-dependent and vulnerable to global trade slowdowns.',
  'south-korea-vs-united-kingdom': 'South Korea and the United Kingdom have remarkably similar-sized economies, though they achieve their GDP through very different means. South Korea\'s economy is manufacturing-heavy (semiconductors, automotive, shipbuilding, displays), while the UK is services-dominated (financial services, professional services, creative industries). South Korea\'s GDP per capita has nearly reached the UK\'s level — a remarkable achievement for a country that was poorer than many African nations in 1960. Both countries have strong cultural export industries: Korean Wave (Hallyu) and British creative industries.',
  'poland-vs-germany': 'Poland and Germany share a 467 km border and deep economic integration. Germany is Poland\'s largest trading partner, and many German companies have established manufacturing operations in Poland to take advantage of lower labor costs while remaining within the EU single market. Poland\'s economy has been one of Europe\'s fastest-growing — the only EU country that avoided recession during the 2008 financial crisis. Germany\'s GDP is roughly seven times Poland\'s, but Poland\'s GDP per capita has been converging rapidly, doubling in real terms since EU accession in 2004.',
  'poland-vs-united-kingdom': 'Poland and the United Kingdom have a unique economic relationship shaped by migration — an estimated 900,000 Poles live in the UK, making them the largest non-British national group. Brexit has altered this dynamic, with new immigration restrictions affecting labor flows. The UK\'s economy is roughly four times Poland\'s, but Poland has been growing faster and closing the gap. Poland\'s manufacturing sector has boomed as a nearshoring destination within the EU, while the UK\'s economy is more services-focused. Both countries maintain relatively low unemployment by European standards.',
  'thailand-vs-vietnam': 'Thailand and Vietnam represent two generations of Southeast Asian industrialization. Thailand industrialized earlier (1980s-1990s) and achieved middle-income status, but has struggled with the "middle-income trap" — growth has slowed as wages rose but productivity gains stalled. Vietnam is following a similar export-led manufacturing path but at an earlier stage, with lower wages attracting factory investment from companies diversifying away from China. Vietnam\'s economy has been growing 2-3 percentage points faster than Thailand\'s annually. Thailand has a more developed tourism sector and financial system.',
  'thailand-vs-indonesia': 'Thailand and Indonesia are ASEAN\'s second and largest economies respectively. Indonesia\'s economy is roughly four times Thailand\'s, driven by its much larger population (275M vs 72M). Thailand has higher GDP per capita and more advanced manufacturing, particularly in automotive (the "Detroit of Asia" producing 2M+ cars annually) and electronics. Indonesia\'s economy is more resource-dependent and domestically driven. Both countries are major tourist destinations and compete for foreign manufacturing investment within the region.',
  'philippines-vs-vietnam': 'The Philippines and Vietnam are fast-growing Southeast Asian economies with similar population sizes (~110M each) but divergent growth models. Vietnam has pursued aggressive export-led industrialization, becoming a major manufacturing hub for Samsung, Apple suppliers, and Nike. The Philippines\' growth is more services-driven, with business process outsourcing (BPO/call centers) employing over 1.3 million workers and remittances from overseas workers contributing ~10% of GDP. Vietnam\'s GDP has recently overtaken the Philippines\', and its manufacturing sector is significantly larger.',
  'philippines-vs-indonesia': 'The Philippines and Indonesia are Southeast Asia\'s two largest archipelago nations with combined populations exceeding 400 million. Indonesia\'s economy is roughly four times larger, with greater natural resource wealth and a more diversified industrial base. The Philippines has a stronger English-speaking workforce, making it the world\'s top destination for business process outsourcing. Both countries have young populations with large domestic consumer markets. Indonesia\'s mineral wealth (nickel, tin, palm oil) gives it advantages in commodity-driven growth, while the Philippines relies more on services and remittances.',
  'egypt-vs-saudi-arabia': 'Egypt and Saudi Arabia are the Arab world\'s most populous and richest nations respectively. Saudi Arabia\'s economy is roughly three times Egypt\'s in nominal terms, driven by oil wealth, while Egypt\'s 105 million population (the largest in the Arab world) dwarfs Saudi Arabia\'s 35 million. Egypt struggles with high inflation, currency devaluation, and dependence on IMF financing, while Saudi Arabia invests its oil revenue in ambitious economic diversification projects. Egypt is a major recipient of Gulf investment, particularly in real estate, tourism, and the new administrative capital.',
  'egypt-vs-nigeria': 'Egypt and Nigeria are Africa\'s second and largest economies, both facing substantial economic challenges. Nigeria has a much larger population (220M vs 105M) and is more oil-dependent, while Egypt\'s economy is more diversified across tourism, Suez Canal revenues, remittances, and manufacturing. Both countries have experienced high inflation and currency crises in recent years. Egypt\'s strategic position controlling the Suez Canal gives it geopolitical leverage, while Nigeria\'s vast oil reserves and young population represent unrealized economic potential.',
  'israel-vs-uae': 'Israel and the UAE normalized diplomatic relations through the Abraham Accords in 2020, opening new economic corridors between two of the Middle East\'s most dynamic economies. Israel\'s GDP per capita is among the world\'s highest, driven by a world-class technology sector (often called "Startup Nation" — more startups per capita than any other country). The UAE\'s economy is more diversified across oil, finance, logistics, and tourism. Trade between the two countries has grown rapidly since normalization, particularly in technology, cybersecurity, and financial services.',
  'israel-vs-saudi-arabia': 'Israel and Saudi Arabia lack formal diplomatic relations but share growing economic and security interests. Israel\'s economy is technology-driven with the highest venture capital investment per capita globally, while Saudi Arabia\'s is being transformed by Vision 2030\'s massive spending on diversification projects (NEOM, Red Sea tourism, entertainment). Saudi Arabia\'s economy is roughly five times Israel\'s in nominal terms, but Israel\'s GDP per capita is significantly higher. Both countries are pivoting toward technology and innovation as future growth engines.',
  'vietnam-vs-indonesia': 'Vietnam and Indonesia compete for foreign manufacturing investment in Southeast Asia. Vietnam\'s smaller economy has attracted disproportionate factory investment due to lower wages, better infrastructure in industrial zones, and aggressive trade agreements (CPTPP, EU-Vietnam FTA). Indonesia counters with its massive domestic market (275M people), abundant natural resources, and growing downstream processing industry. Vietnam\'s economy has been growing faster, but Indonesia\'s is roughly four times larger overall. Both countries are benefiting from the "China+1" diversification strategy pursued by global manufacturers.',
  'vietnam-vs-india': 'Vietnam and India are two of Asia\'s fastest-growing economies, both benefiting from manufacturing diversification away from China. Vietnam\'s economy is much smaller (roughly one-tenth of India\'s) but has attracted outsized foreign investment relative to its size, particularly from Samsung, which accounts for roughly 20% of Vietnam\'s total exports. India has a far larger domestic market and a stronger services sector (IT, financial services), while Vietnam has executed export-led manufacturing more effectively. Both countries have young populations and significant growth potential.',
  'pakistan-vs-bangladesh': 'Pakistan and Bangladesh were a single country until 1971, and their economic divergence since is striking. Bangladesh\'s GDP per capita now exceeds Pakistan\'s — a reversal that would have seemed impossible in 1971 when Bangladesh (then East Pakistan) was considerably poorer. Bangladesh\'s garment industry (world\'s second largest) and robust NGO sector have driven consistent growth, while Pakistan has faced political instability, chronic fiscal deficits, and security challenges. Bangladesh outperforms Pakistan on most human development indicators, including life expectancy, female literacy, and child mortality.',
  'pakistan-vs-nigeria': 'Pakistan and Nigeria are two of the world\'s most populous countries (230M and 220M respectively) with similar GDP levels, making for a natural comparison. Both face governance challenges, security issues, and high population growth rates. Nigeria\'s economy is more oil-dependent, while Pakistan has a more diversified manufacturing and textile sector. Both countries have large informal economies not fully captured in official GDP statistics. Pakistan\'s economy has been constrained by chronic current account deficits and IMF bailouts, while Nigeria struggles with infrastructure gaps and oil revenue management.',
  'switzerland-vs-norway': 'Switzerland and Norway are two of Europe\'s wealthiest non-EU nations, both with GDP per capita exceeding $80,000. Norway\'s wealth is built on North Sea oil and the world\'s largest sovereign wealth fund ($1.6T+), while Switzerland\'s comes from financial services, pharmaceuticals, precision manufacturing, and a tradition of political neutrality that attracts global capital. Both countries have chosen to remain outside the EU, though Norway participates in the European Economic Area. Switzerland has a more diversified economy, while Norway is more dependent on energy exports.',
  'switzerland-vs-germany': 'Switzerland and Germany share a language and cultural ties, but their economic models differ significantly. Switzerland\'s GDP per capita is roughly twice Germany\'s, driven by high-value sectors: pharmaceuticals (Roche, Novartis), wealth management, precision instruments, and food (Nestlé, the world\'s largest food company). Germany\'s economy is much larger overall (roughly five times Switzerland\'s GDP) and more manufacturing-intensive. Switzerland benefits from political neutrality, low taxes, and a strong franc that attracts global wealth. Germany\'s export model depends on the euro being weaker than a hypothetical Deutschmark would be.',
  'netherlands-vs-belgium': 'The Netherlands and Belgium are neighboring Benelux economies with deep trade integration. The Netherlands\' economy is roughly twice Belgium\'s, with a higher GDP per capita driven by Europe\'s largest port (Rotterdam), a favorable business tax environment, and agricultural exports (world\'s second-largest agricultural exporter after the US, remarkably, from a tiny landmass). Belgium hosts the EU and NATO headquarters, giving it an outsized institutional role. Both are highly open, trade-dependent economies with similar living standards and welfare state models.',
  'sweden-vs-norway': 'Sweden and Norway are Scandinavian neighbors with similar welfare state models but different economic foundations. Norway\'s economy is built on North Sea oil and a $1.6T sovereign wealth fund — it has essentially saved its resource wealth for future generations. Sweden\'s economy is more diversified, with global companies in automotive (Volvo), telecommunications (Ericsson), furniture (IKEA), and music streaming (Spotify). Sweden\'s GDP is slightly larger overall, but Norway\'s GDP per capita is 20-30% higher due to its smaller population and oil wealth. Both rank among the world\'s highest on quality of life indices.',
  'argentina-vs-colombia': 'Argentina and Colombia are South America\'s third and fourth largest economies. Argentina\'s economy is roughly 40% larger, but has been far more volatile — experiencing multiple debt defaults, hyperinflation (100%+ in 2023), and dramatic policy swings. Colombia has maintained more macro stability, with lower inflation, a floating exchange rate, and gradual economic opening. Colombia\'s economy is driven by oil exports, coal, coffee, and a growing services sector. Argentina has a more diversified but troubled industrial base, with strong agricultural exports (beef, soybeans, wine) partially offset by chronic policy mismanagement.',
  'chile-vs-argentina': 'Chile and Argentina are Andean neighbors with dramatically different economic trajectories despite similar resource endowments. Chile has been Latin America\'s economic success story: stable macroeconomic policy, open trade (FTAs with 65+ countries), copper wealth managed through sovereign funds, and the region\'s highest GDP per capita. Argentina\'s economy is larger overall (roughly twice Chile\'s GDP) but has been plagued by recurring crises, currency collapses, and 100%+ inflation. Chile\'s economy is copper-dependent (the world\'s largest producer), while Argentina\'s is more diversified across agriculture, manufacturing, and energy.',
  'kenya-vs-ethiopia': 'Kenya and Ethiopia are East Africa\'s two largest economies with combined populations exceeding 170 million. Ethiopia\'s economy has been one of Africa\'s fastest-growing, averaging over 9% GDP growth annually from 2010-2019, driven by large-scale infrastructure investment and manufacturing zones. However, a devastating civil war (2020-2022) severely disrupted Ethiopia\'s economic trajectory. Kenya has grown more steadily at 5-6% annually, with a more diversified economy spanning agriculture (tea, flowers), tourism, financial services, and technology (Nairobi is "Silicon Savannah"). Kenya\'s GDP per capita is roughly twice Ethiopia\'s.',
  'south-africa-vs-egypt': 'South Africa and Egypt are Africa\'s second and third largest economies (after Nigeria), representing the continent\'s southern and northern economic anchors. South Africa has a more developed financial sector, the continent\'s only truly modern stock exchange (JSE), and a strong mining industry (gold, platinum, diamonds). Egypt\'s economy benefits from the Suez Canal, tourism, and remittances from millions of Egyptians working in the Gulf. Both countries face high unemployment and political challenges. South Africa\'s GDP per capita is higher, but load-shedding (power outages) has severely constrained its economic growth.',
};

// ─── Country slug → ISO3 mapping ────────────────────────
const SLUG_TO_ID: Record<string, string> = {
  'united-states': 'USA', 'china': 'CHN', 'japan': 'JPN', 'germany': 'DEU',
  'united-kingdom': 'GBR', 'france': 'FRA', 'india': 'IND', 'brazil': 'BRA',
  'canada': 'CAN', 'australia': 'AUS', 'south-korea': 'KOR', 'mexico': 'MEX',
  'russia': 'RUS', 'italy': 'ITA', 'spain': 'ESP', 'indonesia': 'IDN',
  'netherlands': 'NLD', 'turkey': 'TUR', 'switzerland': 'CHE', 'saudi-arabia': 'SAU',
  'argentina': 'ARG', 'south-africa': 'ZAF', 'nigeria': 'NGA', 'singapore': 'SGP',
  'israel': 'ISR', 'norway': 'NOR', 'sweden': 'SWE', 'egypt': 'EGY',
  'poland': 'POL', 'thailand': 'THA', 'vietnam': 'VNM', 'ireland': 'IRL',
  'philippines': 'PHL', 'malaysia': 'MYS', 'pakistan': 'PAK', 'chile': 'CHL',
  'colombia': 'COL', 'bangladesh': 'BGD', 'uae': 'ARE', 'new-zealand': 'NZL',
  'portugal': 'PRT', 'greece': 'GRC', 'czech-republic': 'CZE', 'romania': 'ROU',
  'denmark': 'DNK', 'finland': 'FIN', 'austria': 'AUT', 'belgium': 'BEL',
  'kenya': 'KEN', 'ethiopia': 'ETH', 'iran': 'IRN', 'iraq': 'IRQ',
};

// ─── Top 50 comparison pairs ────────────────────────────
const PAIRS: [string, string][] = [
  ['united-states', 'china'], ['united-states', 'japan'], ['united-states', 'germany'],
  ['united-states', 'united-kingdom'], ['united-states', 'india'], ['united-states', 'canada'],
  ['united-states', 'russia'], ['united-states', 'brazil'], ['united-states', 'australia'],
  ['united-states', 'mexico'], ['united-states', 'france'], ['united-states', 'south-korea'],
  ['china', 'india'], ['china', 'japan'], ['china', 'russia'], ['china', 'germany'],
  ['china', 'united-kingdom'], ['china', 'brazil'],
  ['japan', 'germany'], ['japan', 'south-korea'], ['japan', 'india'],
  ['germany', 'france'], ['germany', 'united-kingdom'], ['germany', 'italy'],
  ['united-kingdom', 'france'], ['united-kingdom', 'canada'], ['united-kingdom', 'australia'],
  ['france', 'italy'], ['france', 'spain'],
  ['india', 'brazil'], ['india', 'pakistan'], ['india', 'indonesia'], ['india', 'bangladesh'],
  ['brazil', 'mexico'], ['brazil', 'argentina'],
  ['canada', 'australia'], ['canada', 'mexico'],
  ['south-korea', 'japan'], ['south-korea', 'australia'],
  ['russia', 'india'], ['russia', 'brazil'],
  ['italy', 'spain'], ['italy', 'netherlands'],
  ['australia', 'new-zealand'],
  ['turkey', 'mexico'], ['turkey', 'brazil'],
  ['saudi-arabia', 'uae'], ['saudi-arabia', 'iran'],
  ['nigeria', 'south-africa'], ['nigeria', 'kenya'],
  ['singapore', 'switzerland'],
  // Added: high-volume missing pairs
  ['united-states', 'italy'], ['united-states', 'spain'],
  ['china', 'south-korea'], ['china', 'indonesia'],
  ['india', 'russia'], ['india', 'japan'], ['india', 'united-kingdom'],
  ['japan', 'united-kingdom'], ['japan', 'france'],
  ['germany', 'japan'], ['germany', 'china'], ['germany', 'india'],
  ['indonesia', 'india'], ['indonesia', 'brazil'], ['indonesia', 'mexico'],
  ['russia', 'united-states'], ['russia', 'germany'],
  ['mexico', 'indonesia'], ['mexico', 'argentina'],
  ['south-korea', 'germany'], ['south-korea', 'united-kingdom'],
  ['poland', 'germany'], ['poland', 'united-kingdom'],
  ['thailand', 'vietnam'], ['thailand', 'indonesia'],
  ['philippines', 'vietnam'], ['philippines', 'indonesia'],
  ['egypt', 'saudi-arabia'], ['egypt', 'nigeria'],
  ['israel', 'uae'], ['israel', 'saudi-arabia'],
  ['vietnam', 'indonesia'], ['vietnam', 'india'],
  ['pakistan', 'bangladesh'], ['pakistan', 'nigeria'],
  ['switzerland', 'norway'], ['switzerland', 'germany'],
  ['netherlands', 'belgium'], ['sweden', 'norway'],
  ['argentina', 'colombia'], ['chile', 'argentina'],
  ['kenya', 'ethiopia'], ['south-africa', 'egypt'],
];

// ─── Indicators to compare ──────────────────────────────
const COMPARE_INDICATORS = [
  { id: 'IMF.NGDPD', label: 'GDP (USD)', rankSlug: 'gdp' },
  { id: 'IMF.NGDPDPC', label: 'GDP per Capita', rankSlug: 'gdp-per-capita' },
  { id: 'IMF.NGDP_RPCH', label: 'GDP Growth (%)', rankSlug: 'gdp-growth' },
  { id: 'IMF.PPPPC', label: 'GDP per Capita (PPP)', rankSlug: 'gdp-per-capita-ppp' },
  { id: 'SP.POP.TOTL', label: 'Population', rankSlug: 'population' },
  { id: 'SP.DYN.LE00.IN', label: 'Life Expectancy', rankSlug: 'life-expectancy' },
  { id: 'IMF.PCPIPCH', label: 'Inflation (%)', rankSlug: 'inflation-rate' },
  { id: 'IMF.LUR', label: 'Unemployment (%)', rankSlug: 'unemployment-rate' },
  { id: 'IMF.GGXWDG_NGDP', label: 'Govt Debt (% GDP)', rankSlug: 'government-debt' },
  { id: 'SP.DYN.TFRT.IN', label: 'Fertility Rate', rankSlug: 'fertility-rate' },
  { id: 'SI.POV.GINI', label: 'Gini Index', rankSlug: 'gini-index' },
  { id: 'EN.GHG.CO2.PC.CE.AR5', label: 'CO₂ per Capita (t)', rankSlug: 'co2-emissions' },
];

function slugToName(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return PAIRS.map(([a, b]) => ({ slug: `${a}-vs-${b}` }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [slugA, slugB] = slug.split('-vs-');
  if (!slugA || !slugB || !SLUG_TO_ID[slugA] || !SLUG_TO_ID[slugB]) {
    return { title: 'Not Found' };
  }

  const nameA = slugToName(slugA);
  const nameB = slugToName(slugB);

  return {
    title: `${nameA} vs ${nameB} — Economy Compared (2026)`,
    description: `${nameA} vs ${nameB}: GDP, population, inflation, unemployment, debt, life expectancy, and 400+ indicators compared. Interactive charts with IMF & World Bank data. Updated ${new Date().getFullYear()}.`,
    alternates: { canonical: `https://statisticsoftheworld.com/compare/${slug}` },
    openGraph: {
      title: `${nameA} vs ${nameB} — Economy & Data Compared`,
      description: `Side-by-side comparison of ${nameA} and ${nameB} across 12 key indicators.`,
      siteName: 'Statistics of the World',
    },
  };
}

export default async function ComparisonPage({ params }: Props) {
  const { slug } = await params;
  const parts = slug.split('-vs-');
  if (parts.length !== 2) notFound();
  const [slugA, slugB] = parts;
  const idA = SLUG_TO_ID[slugA];
  const idB = SLUG_TO_ID[slugB];
  if (!idA || !idB) notFound();

  const [countryA, countryB, dataA, dataB] = await Promise.all([
    getCountry(idA),
    getCountry(idB),
    getAllIndicatorsForCountry(idA),
    getAllIndicatorsForCountry(idB),
  ]);

  if (!countryA || !countryB) notFound();

  // Build comparison rows
  const rows = COMPARE_INDICATORS.map(ci => {
    const ind = INDICATORS.find(i => i.id === ci.id);
    const valA = dataA[ci.id]?.value ?? null;
    const valB = dataB[ci.id]?.value ?? null;
    const fmtA = valA !== null && ind ? formatValue(valA, ind.format, ind.decimals) : 'N/A';
    const fmtB = valB !== null && ind ? formatValue(valB, ind.format, ind.decimals) : 'N/A';

    // Determine "winner" — higher is better for most, except inflation/unemployment/debt/gini
    const lowerIsBetter = ['IMF.PCPIPCH', 'IMF.LUR', 'IMF.GGXWDG_NGDP', 'SI.POV.GINI', 'EN.GHG.CO2.PC.CE.AR5'].includes(ci.id);
    let winner: 'A' | 'B' | 'tie' = 'tie';
    if (valA !== null && valB !== null) {
      if (lowerIsBetter) winner = valA < valB ? 'A' : valA > valB ? 'B' : 'tie';
      else winner = valA > valB ? 'A' : valA < valB ? 'B' : 'tie';
    }

    return { ...ci, valA, valB, fmtA, fmtB, winner, ind };
  });

  // Narrative
  const gdpA = dataA['IMF.NGDPD']?.value;
  const gdpB = dataB['IMF.NGDPD']?.value;
  const popA = dataA['SP.POP.TOTL']?.value;
  const popB = dataB['SP.POP.TOTL']?.value;
  const gdpRatio = gdpA && gdpB ? (Math.max(gdpA, gdpB) / Math.min(gdpA, gdpB)).toFixed(1) : null;
  const winsA = rows.filter(r => r.winner === 'A').length;
  const winsB = rows.filter(r => r.winner === 'B').length;

  // FAQ for comparison queries
  const gdpAFmt = gdpA ? formatValue(gdpA, 'currency') : null;
  const gdpBFmt = gdpB ? formatValue(gdpB, 'currency') : null;
  const compFaqs = [
    ...(gdpAFmt && gdpBFmt ? [{
      q: `Which has a larger economy, ${countryA.name} or ${countryB.name}?`,
      a: `${gdpA! > gdpB! ? countryA.name : countryB.name} has the larger economy with a GDP of ${gdpA! > gdpB! ? gdpAFmt : gdpBFmt}, compared to ${gdpA! > gdpB! ? countryB.name : countryA.name}'s ${gdpA! > gdpB! ? gdpBFmt : gdpAFmt}${gdpRatio ? ` (${gdpRatio}x larger)` : ''}. Source: IMF World Economic Outlook.`,
    }] : []),
    ...(popA && popB ? [{
      q: `Which country has a larger population, ${countryA.name} or ${countryB.name}?`,
      a: `${popA > popB ? countryA.name : countryB.name} has a larger population at ${formatValue(Math.max(popA, popB), 'number')}, compared to ${popA > popB ? countryB.name : countryA.name}'s ${formatValue(Math.min(popA, popB), 'number')}. Source: World Bank.`,
    }] : []),
    {
      q: `How do ${countryA.name} and ${countryB.name} compare overall?`,
      a: `Across ${COMPARE_INDICATORS.length} key indicators, ${winsA > winsB ? countryA.name : winsB > winsA ? countryB.name : 'neither country'} leads in ${Math.max(winsA, winsB)} categories. The comparison covers GDP, population, inflation, unemployment, debt, life expectancy, and more. Data from IMF and World Bank.`,
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Dataset',
        name: `${countryA.name} vs ${countryB.name} — Economic Comparison`,
        description: `Side-by-side comparison of ${countryA.name} and ${countryB.name} across ${COMPARE_INDICATORS.length} key indicators including GDP, population, inflation, unemployment, and life expectancy. Data from IMF World Economic Outlook and World Bank.`,
        url: `https://statisticsoftheworld.com/compare/${slug}`,
        license: 'https://creativecommons.org/licenses/by/4.0/',
        creator: [
          { '@type': 'Organization', name: 'IMF', url: 'https://www.imf.org' },
          { '@type': 'Organization', name: 'World Bank', url: 'https://www.worldbank.org' },
        ],
        provider: { '@type': 'Organization', name: 'Statistics of the World', url: 'https://statisticsoftheworld.com' },
        isAccessibleForFree: true,
        dateModified: new Date().toISOString().split('T')[0],
      },
      {
        '@type': 'FAQPage',
        mainEntity: compFaqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
          { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://statisticsoftheworld.com/compare' },
          { '@type': 'ListItem', position: 3, name: `${countryA.name} vs ${countryB.name}` },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />

      <section className="max-w-[900px] mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/compare" className="hover:text-gray-600 transition">Compare</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{countryA.name} vs {countryB.name}</span>
        </nav>

        {/* Hero */}
        <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#0d1b2a] mb-2">
          {countryA.name} vs {countryB.name}
        </h1>
        <p className="text-[15px] text-[#64748b] mb-4">
          Side-by-side economic and demographic comparison · {new Date().getFullYear()} data · Source: IMF & World Bank
        </p>

        {/* Expert editorial (if available) */}
        {COMPARISON_EDITORIAL[slug] && (
          <p className="text-[15px] text-[#374151] leading-[1.8] mb-6 max-w-[800px]">
            {COMPARISON_EDITORIAL[slug]}
          </p>
        )}

        {/* Data summary paragraph */}
        <p className="text-[14px] text-[#475569] leading-relaxed mb-8 max-w-[800px]">
          {gdpAFmt && gdpBFmt ? `${countryA.name} has a GDP of ${gdpAFmt} compared to ${countryB.name}'s ${gdpBFmt}${gdpRatio ? `, making it ${gdpA! > gdpB! ? gdpRatio + 'x larger' : (gdpB! / gdpA!).toFixed(1) + 'x smaller'}` : ''}. ` : ''}
          {popA && popB ? `${countryA.name}'s population is ${formatValue(popA, 'number')} vs ${countryB.name}'s ${formatValue(popB, 'number')}. ` : ''}
          Across {COMPARE_INDICATORS.length} key indicators, {winsA > winsB ? `${countryA.name} leads in ${winsA}` : winsB > winsA ? `${countryB.name} leads in ${winsB}` : 'both countries are evenly matched in'} categories.
          All data sourced from the IMF World Economic Outlook and World Bank World Development Indicators.
        </p>

        {/* Score overview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5 text-center">
            <Flag iso2={countryA.iso2} size={36} />
            <div className="text-[16px] font-bold text-[#0d1b2a] mt-2">{countryA.name}</div>
            <div className="text-[28px] font-extrabold text-[#2563eb]">{winsA}</div>
            <div className="text-[12px] text-[#64748b]">indicators lead</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5 text-center flex flex-col items-center justify-center">
            <div className="text-[14px] text-[#94a3b8] font-bold">VS</div>
            {gdpRatio && (
              <div className="text-[11px] text-[#94a3b8] mt-1">GDP ratio: {gdpRatio}x</div>
            )}
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5 text-center">
            <Flag iso2={countryB.iso2} size={36} />
            <div className="text-[16px] font-bold text-[#0d1b2a] mt-2">{countryB.name}</div>
            <div className="text-[28px] font-extrabold text-[#dc2626]">{winsB}</div>
            <div className="text-[12px] text-[#64748b]">indicators lead</div>
          </div>
        </div>

        {/* Comparison table */}
        <div className="bg-white border border-[#d5dce6] rounded-xl overflow-hidden shadow-sm mb-8">
          <table className="w-full">
            <thead>
              <tr className="bg-[#0d1b2a] text-white">
                <th className="px-5 py-3 text-left text-[13px] font-semibold">Indicator</th>
                <th className="px-5 py-3 text-right text-[13px] font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <Flag iso2={countryA.iso2} size={14} /> {countryA.name}
                  </span>
                </th>
                <th className="px-5 py-3 text-right text-[13px] font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <Flag iso2={countryB.iso2} size={14} /> {countryB.name}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} className={i % 2 === 1 ? 'bg-[#f8fafc]' : ''}>
                  <td className="px-5 py-3">
                    <Link href={`/ranking/${row.rankSlug}`} className="text-[14px] text-[#475569] hover:text-[#2563eb] transition">
                      {row.label}
                    </Link>
                  </td>
                  <td className={`px-5 py-3 text-right font-mono text-[14px] ${row.winner === 'A' ? 'text-[#2563eb] font-bold' : 'text-[#64748b]'}`}>
                    {row.fmtA}
                    {row.winner === 'A' && <span className="ml-1 text-[10px]">✓</span>}
                  </td>
                  <td className={`px-5 py-3 text-right font-mono text-[14px] ${row.winner === 'B' ? 'text-[#dc2626] font-bold' : 'text-[#64748b]'}`}>
                    {row.fmtB}
                    {row.winner === 'B' && <span className="ml-1 text-[10px]">✓</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Narrative */}
        <div className="bg-white border border-[#d5dce6] rounded-xl p-6 mb-8">
          <h2 className="text-[18px] font-bold text-[#0d1b2a] mb-3">Summary</h2>
          <p className="text-[14px] text-[#475569] leading-relaxed">
            {gdpA && gdpB ? (
              <>
                {countryA.name} has a GDP of {formatValue(gdpA, 'currency')} compared to {countryB.name}&apos;s {formatValue(gdpB, 'currency')}, making the {gdpA > gdpB ? 'former' : 'latter'} economy {gdpRatio}x larger.
              </>
            ) : null}
            {' '}
            {popA && popB ? (
              <>
                In terms of population, {countryA.name} has {formatValue(popA, 'number')} people while {countryB.name} has {formatValue(popB, 'number')}.
              </>
            ) : null}
            {' '}
            Across the {COMPARE_INDICATORS.length} indicators compared, {countryA.name} leads in {winsA} and {countryB.name} leads in {winsB}.
          </p>
        </div>

        {/* Cross-links */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Link href={`/country/${idA}`} className="bg-white border border-[#d5dce6] rounded-xl p-4 hover:border-[#2563eb] hover:shadow-md transition group">
            <div className="flex items-center gap-2 mb-1">
              <Flag iso2={countryA.iso2} size={20} />
              <span className="text-[15px] font-bold text-[#0d1b2a] group-hover:text-[#2563eb]">{countryA.name}</span>
            </div>
            <span className="text-[13px] text-[#64748b]">Full country profile with 400+ indicators →</span>
          </Link>
          <Link href={`/country/${idB}`} className="bg-white border border-[#d5dce6] rounded-xl p-4 hover:border-[#2563eb] hover:shadow-md transition group">
            <div className="flex items-center gap-2 mb-1">
              <Flag iso2={countryB.iso2} size={20} />
              <span className="text-[15px] font-bold text-[#0d1b2a] group-hover:text-[#2563eb]">{countryB.name}</span>
            </div>
            <span className="text-[13px] text-[#64748b]">Full country profile with 400+ indicators →</span>
          </Link>
        </div>

        {/* Other comparisons */}
        <div>
          <h2 className="text-[16px] font-semibold text-[#0d1b2a] mb-3">Other Comparisons</h2>
          <div className="flex flex-wrap gap-2">
            {PAIRS.filter(([a, b]) => `${a}-vs-${b}` !== slug).slice(0, 12).map(([a, b]) => (
              <Link
                key={`${a}-${b}`}
                href={`/compare/${a}-vs-${b}`}
                className="text-[13px] px-3 py-1.5 bg-white border border-[#d5dce6] rounded-lg hover:bg-[#f1f5f9] transition text-[#475569]"
              >
                {slugToName(a)} vs {slugToName(b)}
              </Link>
            ))}
          </div>
        </div>

        {/* Cross-links for SEO */}
        <div className="mt-10 space-y-6">
          {/* Country pages */}
          <div>
            <h2 className="text-[16px] font-semibold text-[#0d1b2a] mb-3">Explore These Countries</h2>
            <div className="flex flex-wrap gap-2">
              <Link href={`/country/${slugA}`} className="px-3 py-1.5 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition">
                {countryA.name} — Full Profile →
              </Link>
              <Link href={`/country/${slugB}`} className="px-3 py-1.5 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition">
                {countryB.name} — Full Profile →
              </Link>
            </div>
          </div>

          {/* Related comparisons */}
          <div>
            <h2 className="text-[16px] font-semibold text-[#0d1b2a] mb-3">More Comparisons</h2>
            <div className="flex flex-wrap gap-2">
              {PAIRS
                .filter(([a, b]) => (a === slugA || a === slugB || b === slugA || b === slugB) && `${a}-vs-${b}` !== slug)
                .slice(0, 6)
                .map(([a, b]) => (
                  <Link key={`${a}-vs-${b}`} href={`/compare/${a}-vs-${b}`} className="px-3 py-1.5 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition">
                    {slugToName(a)} vs {slugToName(b)}
                  </Link>
                ))}
            </div>
          </div>

          {/* Top rankings */}
          <div>
            <h2 className="text-[16px] font-semibold text-[#0d1b2a] mb-3">Global Rankings</h2>
            <div className="flex flex-wrap gap-2">
              {[
                { href: '/ranking/gdp', label: 'GDP' },
                { href: '/ranking/gdp-per-capita', label: 'GDP per Capita' },
                { href: '/ranking/population', label: 'Population' },
                { href: '/ranking/inflation-rate', label: 'Inflation' },
                { href: '/ranking/unemployment-rate', label: 'Unemployment' },
                { href: '/ranking/life-expectancy', label: 'Life Expectancy' },
              ].map(r => (
                <Link key={r.href} href={r.href} className="px-3 py-1.5 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition">
                  {r.label} Rankings →
                </Link>
              ))}
            </div>
          </div>

          {/* Compare tool */}
          <div className="text-center pt-4">
            <Link href="/compare" className="text-[14px] text-[#2563eb] hover:underline">
              Compare any two countries →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
