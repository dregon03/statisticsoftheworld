import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { SnapshotPDFData, CountryRow } from './pdfTypes';

export type { SnapshotPDFData } from './pdfTypes';

// ─── Colors (professional light theme) ──────────────────
const NAVY: RGB = [13, 27, 42];
const BLUE: RGB = [37, 99, 235];
const BLACK: RGB = [17, 24, 39];
const DARK: RGB = [55, 65, 81];
const GRAY: RGB = [107, 114, 128];
const LIGHT_GRAY: RGB = [229, 231, 235];
const TABLE_HEADER: RGB = [30, 58, 95];
const TABLE_ALT: RGB = [248, 250, 252];
const WHITE: RGB = [255, 255, 255];
const EMERALD: RGB = [5, 150, 105];
const RED: RGB = [220, 38, 38];
const AMBER: RGB = [217, 119, 6];
const PURPLE: RGB = [124, 58, 237];

type RGB = [number, number, number];

const MARGIN = 40;
const PAGE_W = 595.28; // A4 width in pt
const PAGE_H = 841.89; // A4 height in pt
const CONTENT_W = PAGE_W - MARGIN * 2;

// ─── Format helpers ─────────────────────────────────────
function fmtCurrency(n: number): string {
  if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

function fmtNumber(n: number): string {
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toLocaleString();
}

// ─── Page management ────────────────────────────────────
function addPageNumber(doc: jsPDF) {
  const n = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(String(n), PAGE_W / 2, PAGE_H - 25, { align: 'center' });
}

function addFooter(doc: jsPDF, left: string) {
  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.text(left, MARGIN, PAGE_H - 25);
  doc.text('statisticsoftheworld.com', PAGE_W - MARGIN, PAGE_H - 25, { align: 'right' });
  addPageNumber(doc);
}

function newPage(doc: jsPDF, chapterFooter: string): number {
  doc.addPage();
  addFooter(doc, chapterFooter);
  return MARGIN;
}

function needsNewPage(y: number, needed: number, doc: jsPDF, footer: string): number {
  if (y + needed > PAGE_H - 60) {
    return newPage(doc, footer);
  }
  return y;
}

// ─── Reusable drawing functions ─────────────────────────

function drawChapterPage(doc: jsPDF, num: number, title: string, subtitle: string, narrative: string): number {
  doc.addPage();

  // Navy top band
  doc.setFillColor(13, 27, 42);
  doc.rect(0, 0, PAGE_W, 120, 'F');

  // Blue accent line
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 120, PAGE_W, 3, 'F');

  // Chapter number
  doc.setFontSize(11);
  doc.setTextColor(100, 160, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(`CHAPTER ${String(num).padStart(2, '0')}`, MARGIN, 50);

  // Title on navy
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(title, CONTENT_W);
  doc.text(titleLines, MARGIN, 78);

  // Subtitle on navy
  doc.setFontSize(10);
  doc.setTextColor(148, 180, 220);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, MARGIN, 78 + titleLines.length * 12 + 8);

  let y = 140;

  // Narrative
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'normal');
  const narLines = doc.splitTextToSize(narrative, CONTENT_W);
  doc.text(narLines, MARGIN, y);
  y += narLines.length * 14 + 12;

  const footer = `Chapter ${num}: ${title}`;
  addFooter(doc, footer);

  return y;
}

function drawSectionLabel(doc: jsPDF, label: string, y: number): number {
  doc.setFontSize(9);
  doc.setTextColor(...BLUE);
  doc.setFont('helvetica', 'bold');
  doc.text(label.toUpperCase(), MARGIN, y);
  // Underline
  doc.setDrawColor(...LIGHT_GRAY);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y + 3, PAGE_W - MARGIN, y + 3);
  return y + 12;
}

function drawTable(doc: jsPDF, headers: string[], rows: string[][], y: number, opts?: {
  colWidths?: number[];
  valueColor?: RGB;
  maxWidth?: number;
  startX?: number;
}): number {
  const startX = opts?.startX ?? MARGIN;
  const maxWidth = opts?.maxWidth ?? CONTENT_W;
  const valueColor = opts?.valueColor ?? BLUE;

  autoTable(doc, {
    startY: y,
    head: [headers],
    body: rows,
    theme: 'grid',
    margin: { left: startX, right: PAGE_W - startX - maxWidth },
    tableWidth: maxWidth,
    styles: {
      fontSize: 8.5,
      textColor: BLACK,
      cellPadding: { top: 3, bottom: 3, left: 5, right: 5 },
      font: 'helvetica',
      lineColor: LIGHT_GRAY,
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: TABLE_HEADER,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    alternateRowStyles: {
      fillColor: TABLE_ALT,
    },
    columnStyles: {
      0: { cellWidth: 22, halign: 'center', textColor: GRAY, fontStyle: 'bold' },
      [headers.length - 1]: { halign: 'right', textColor: valueColor, fontStyle: 'bold' },
    },
  });

  return (doc as any).lastAutoTable.finalY + 8;
}

function drawTwoColTables(doc: jsPDF, leftTitle: string, leftData: CountryRow[], leftStart: number, leftFmt: (v: number) => string, leftColor: RGB, rightTitle: string, rightData: CountryRow[], rightStart: number, rightFmt: (v: number) => string, rightColor: RGB, y: number): number {
  const colW = (CONTENT_W - 12) / 2;

  // Left title
  doc.setFontSize(8);
  doc.setTextColor(...leftColor);
  doc.setFont('helvetica', 'bold');
  doc.text(leftTitle.toUpperCase(), MARGIN, y);

  // Right title
  doc.setTextColor(...rightColor);
  doc.text(rightTitle.toUpperCase(), MARGIN + colW + 12, y);
  y += 8;

  // Left table
  const leftRows = leftData.map((d, i) => [String(leftStart + i), d.country, leftFmt(d.value!)]);
  autoTable(doc, {
    startY: y,
    head: [['#', 'Country', 'Value']],
    body: leftRows,
    theme: 'grid',
    margin: { left: MARGIN, right: PAGE_W - MARGIN - colW },
    tableWidth: colW,
    styles: { fontSize: 8, textColor: BLACK, cellPadding: { top: 2.5, bottom: 2.5, left: 4, right: 4 }, font: 'helvetica', lineColor: LIGHT_GRAY, lineWidth: 0.3 },
    headStyles: { fillColor: TABLE_HEADER, textColor: WHITE, fontStyle: 'bold', fontSize: 7 },
    alternateRowStyles: { fillColor: TABLE_ALT },
    columnStyles: { 0: { cellWidth: 20, halign: 'center', textColor: GRAY }, 2: { halign: 'right', textColor: leftColor, fontStyle: 'bold' } },
  });
  const leftEnd = (doc as any).lastAutoTable.finalY;

  // Right table
  const rightRows = rightData.map((d, i) => [String(rightStart > 0 ? rightStart + i : rightStart - i), d.country, rightFmt(d.value!)]);
  autoTable(doc, {
    startY: y,
    head: [['#', 'Country', 'Value']],
    body: rightRows,
    theme: 'grid',
    margin: { left: MARGIN + colW + 12, right: MARGIN },
    tableWidth: colW,
    styles: { fontSize: 8, textColor: BLACK, cellPadding: { top: 2.5, bottom: 2.5, left: 4, right: 4 }, font: 'helvetica', lineColor: LIGHT_GRAY, lineWidth: 0.3 },
    headStyles: { fillColor: TABLE_HEADER, textColor: WHITE, fontStyle: 'bold', fontSize: 7 },
    alternateRowStyles: { fillColor: TABLE_ALT },
    columnStyles: { 0: { cellWidth: 20, halign: 'center', textColor: GRAY }, 2: { halign: 'right', textColor: rightColor, fontStyle: 'bold' } },
  });
  const rightEnd = (doc as any).lastAutoTable.finalY;

  return Math.max(leftEnd, rightEnd) + 10;
}

function drawBarChart(doc: jsPDF, rows: { label: string; value: number; display: string }[], maxVal: number, color: RGB, y: number, footer: string): number {
  const barX = MARGIN + 100;
  const barMaxW = CONTENT_W - 100;

  for (const row of rows) {
    y = needsNewPage(y, 16, doc, footer);

    // Label
    doc.setFontSize(8.5);
    doc.setTextColor(...BLACK);
    doc.setFont('helvetica', 'normal');
    doc.text(row.label, MARGIN, y + 5);

    // Bar bg
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(barX, y, barMaxW, 10, 2, 2, 'F');

    // Bar fill
    const barW = Math.max((row.value / maxVal) * barMaxW, 6);
    doc.setFillColor(...color);
    doc.roundedRect(barX, y, barW, 10, 2, 2, 'F');

    // Value
    doc.setFontSize(7);
    doc.setTextColor(...BLACK);
    doc.setFont('helvetica', 'bold');
    const labelX = barW > barMaxW * 0.4 ? barX + barW - 4 : barX + barW + 4;
    const labelAlign = barW > barMaxW * 0.4 ? 'right' : 'left';
    if (barW > barMaxW * 0.4) doc.setTextColor(255, 255, 255);
    doc.text(row.display, labelX, y + 7, { align: labelAlign as any });

    y += 14;
  }
  return y + 4;
}

function drawPullQuote(doc: jsPDF, text: string, y: number, footer: string): number {
  y = needsNewPage(y, 50, doc, footer);

  doc.setFillColor(239, 246, 255); // light blue bg
  const lines = doc.splitTextToSize(text, CONTENT_W - 30);
  const boxH = lines.length * 13 + 16;

  doc.roundedRect(MARGIN, y, CONTENT_W, boxH, 3, 3, 'F');

  // Blue left accent
  doc.setFillColor(...BLUE);
  doc.rect(MARGIN, y, 4, boxH, 'F');

  doc.setFontSize(9.5);
  doc.setTextColor(30, 64, 115);
  doc.setFont('helvetica', 'italic');
  doc.text(lines, MARGIN + 16, y + 14);

  return y + boxH + 10;
}

function drawFactCards(doc: jsPDF, cards: { label: string; value: string; detail: string }[], y: number, footer: string): number {
  y = needsNewPage(y, 55, doc, footer);
  const gap = 8;
  const cardW = (CONTENT_W - gap * (cards.length - 1)) / cards.length;

  for (let i = 0; i < cards.length; i++) {
    const x = MARGIN + i * (cardW + gap);

    // Card border
    doc.setDrawColor(...LIGHT_GRAY);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, cardW, 45, 3, 3, 'S');

    // Light top accent
    doc.setFillColor(...BLUE);
    doc.rect(x, y, cardW, 3, 'F');

    // Label
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'bold');
    doc.text(cards[i].label.toUpperCase(), x + 8, y + 15);

    // Value
    doc.setFontSize(16);
    doc.setTextColor(...NAVY);
    doc.setFont('helvetica', 'bold');
    doc.text(cards[i].value, x + 8, y + 30);

    // Detail
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'normal');
    doc.text(cards[i].detail, x + 8, y + 39);
  }
  return y + 55;
}

function drawComparisonBox(doc: jsPDF, bigVal: string, suffix: string, label: string, leftName: string, leftVal: string, rightName: string, rightVal: string, y: number, footer: string): number {
  y = needsNewPage(y, 85, doc, footer);

  // Box
  doc.setDrawColor(...LIGHT_GRAY);
  doc.setLineWidth(0.5);
  doc.roundedRect(MARGIN, y, CONTENT_W, 75, 4, 4, 'S');

  // Big number center
  doc.setFontSize(36);
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.text(bigVal + suffix, PAGE_W / 2, y + 25, { align: 'center' });

  // Label
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'normal');
  doc.text(label, PAGE_W / 2, y + 35, { align: 'center' });

  // Divider
  doc.setDrawColor(...LIGHT_GRAY);
  doc.line(PAGE_W / 2, y + 40, PAGE_W / 2, y + 70);

  // Left
  doc.setFontSize(10);
  doc.setTextColor(...BLACK);
  doc.setFont('helvetica', 'bold');
  doc.text(leftName, PAGE_W / 4, y + 52, { align: 'center' });
  doc.setFontSize(14);
  doc.setTextColor(...BLUE);
  doc.text(leftVal, PAGE_W / 4, y + 66, { align: 'center' });

  // Right
  doc.setFontSize(10);
  doc.setTextColor(...BLACK);
  doc.setFont('helvetica', 'bold');
  doc.text(rightName, (PAGE_W * 3) / 4, y + 52, { align: 'center' });
  doc.setFontSize(14);
  doc.setTextColor(...RED);
  doc.text(rightVal, (PAGE_W * 3) / 4, y + 66, { align: 'center' });

  return y + 85;
}

function drawMiniStats(doc: jsPDF, title: string, items: { country: string; value: string }[], y: number, footer: string): number {
  y = needsNewPage(y, 55, doc, footer);

  // Title
  doc.setFontSize(9);
  doc.setTextColor(...BLACK);
  doc.setFont('helvetica', 'bold');
  doc.text(title, MARGIN, y);
  y += 10;

  const itemW = Math.min(CONTENT_W / items.length, 105);
  items.slice(0, 5).forEach((item, i) => {
    const x = MARGIN + i * itemW;

    doc.setDrawColor(...LIGHT_GRAY);
    doc.roundedRect(x, y, itemW - 4, 35, 2, 2, 'S');

    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'normal');
    doc.text(item.country, x + (itemW - 4) / 2, y + 12, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(...NAVY);
    doc.setFont('helvetica', 'bold');
    doc.text(item.value, x + (itemW - 4) / 2, y + 26, { align: 'center' });
  });

  return y + 45;
}

// ═══════════════════════════════════════════════════════════
// MAIN PDF GENERATOR
// ═══════════════════════════════════════════════════════════
export function generateSnapshotPDF(d: SnapshotPDFData) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  let y: number;

  // ─── COVER PAGE ───────────────────────────────────────
  // Full navy background
  doc.setFillColor(13, 27, 42);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

  // Blue accent bar at top
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, PAGE_W, 6, 'F');

  // Report tag
  doc.setFontSize(10);
  doc.setTextColor(120, 170, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('ANNUAL REPORT  ·  APRIL 2026', PAGE_W / 2, 300, { align: 'center' });

  // Title
  doc.setFontSize(44);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('The World in', PAGE_W / 2, 350, { align: 'center' });
  doc.setTextColor(100, 160, 255);
  doc.text('Numbers', PAGE_W / 2, 395, { align: 'center' });

  // Subtitle
  doc.setFontSize(11);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  const coverDesc = doc.splitTextToSize(
    `${d.countries} countries · 440+ indicators · One report\nThe definitive snapshot of the global economy in 2026.`,
    340
  );
  doc.text(coverDesc, PAGE_W / 2, 430, { align: 'center' });

  // Stats row
  const stats = [
    { v: `$${(d.worldGdp / 1e12).toFixed(0)}T`, l: 'GDP' },
    { v: `${(d.worldPop / 1e9).toFixed(1)}B`, l: 'People' },
    { v: `${d.avgInflation.toFixed(1)}%`, l: 'Inflation' },
    { v: `${d.avgLifeExp.toFixed(1)}yr`, l: 'Life Exp' },
  ];
  const sw = 90, sg = 16;
  const sx = (PAGE_W - (stats.length * sw + (stats.length - 1) * sg)) / 2;
  stats.forEach((s, i) => {
    const x = sx + i * (sw + sg);
    doc.setDrawColor(40, 70, 110);
    doc.roundedRect(x, 475, sw, 50, 4, 4, 'S');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(s.v, x + sw / 2, 500, { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(100, 120, 150);
    doc.text(s.l.toUpperCase(), x + sw / 2, 516, { align: 'center' });
  });

  // Org
  doc.setFontSize(9);
  doc.setTextColor(100, 120, 150);
  doc.text('Statistics of the World', PAGE_W / 2, 580, { align: 'center' });
  doc.setFontSize(8);
  doc.text('statisticsoftheworld.com', PAGE_W / 2, 595, { align: 'center' });

  // Bottom bar
  doc.setFillColor(37, 99, 235);
  doc.rect(0, PAGE_H - 4, PAGE_W, 4, 'F');

  // ─── TABLE OF CONTENTS ────────────────────────────────
  doc.addPage();
  y = MARGIN + 10;

  doc.setFontSize(24);
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.text('Contents', MARGIN, y);
  y += 20;

  // Blue line under title
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(2);
  doc.line(MARGIN, y, MARGIN + 60, y);
  y += 20;

  const chapters = [
    [`01`, `The $${(d.worldGdp / 1e12).toFixed(0)} Trillion Economy`, 'Global GDP and economic power'],
    ['02', 'The Growth Race', 'Fastest and slowest growing economies'],
    ['03', 'Rich vs. Poor', 'GDP per capita and the wealth divide'],
    ['04', `${(d.worldPop / 1e9).toFixed(1)}B and Counting`, 'Population and demographics'],
    ['05', 'The Price of Everything', 'Inflation hotspots and deflation'],
    ['06', 'Work & Wages', 'Unemployment and youth joblessness'],
    ['07', 'The Debt Mountain', 'Government debt as % of GDP'],
    ['08', 'Life & Death', 'Life expectancy and mortality'],
    ['09', 'Planet Report', 'CO₂ emissions and renewables'],
    ['10', 'The Digital World', 'Internet, R&D, and innovation'],
    ['11', 'Trade, Power & Security', 'Military spending and trade flows'],
    ['12', 'The Inequality Gap', 'Gini, poverty, and income distribution'],
    ['', 'Methodology & Sources', 'Data sources and important notes'],
  ];

  for (const [num, title, sub] of chapters) {
    doc.setDrawColor(...LIGHT_GRAY);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y + 16, PAGE_W - MARGIN, y + 16);

    doc.setFontSize(8);
    doc.setTextColor(...BLUE);
    doc.setFont('helvetica', 'bold');
    doc.text(num ? `Chapter ${num}` : '', MARGIN, y + 8);

    doc.setFontSize(11);
    doc.setTextColor(...BLACK);
    doc.setFont('helvetica', 'bold');
    doc.text(title, MARGIN + 75, y + 8);

    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'normal');
    doc.text(sub, MARGIN + 75, y + 20);

    y += 32;
  }

  addFooter(doc, 'Contents');

  // ─── CHAPTER 1: GDP ───────────────────────────────────
  const ch1 = `Chapter 1`;
  y = drawChapterPage(doc, 1,
    `The $${(d.worldGdp / 1e12).toFixed(0)} Trillion Economy`,
    'Global GDP and the concentration of economic power',
    `The global economy in 2026 is worth over $${(d.worldGdp / 1e12).toFixed(0)} trillion. Just two countries — the United States and China — account for ${d.usCnShare}% of all output. The top 10 produce ${d.top10GdpShare.toFixed(0)}% of everything. The remaining ${d.gdp.total - 10} nations share what's left.`
  );

  y = drawSectionLabel(doc, 'Top 10 Economies by GDP', y);
  y = drawBarChart(doc, d.gdp.top.slice(0, 10).map(r => ({
    label: r.country,
    value: r.value!,
    display: `${fmtCurrency(r.value!)}  (${(r.value! / d.worldGdp * 100).toFixed(1)}%)`,
  })), d.gdp.top[0].value!, BLUE, y, ch1);

  y = drawPullQuote(doc, "If the world's GDP were compressed into a single day, the United States would earn its share by 7:24 AM. The bottom 100 countries wouldn't start until 11 PM.", y, ch1);

  y = drawFactCards(doc, [
    { label: 'US Economy', value: fmtCurrency(d.usGdp), detail: d.usGdpChange ? `${Number(d.usGdpChange) > 0 ? '+' : ''}${d.usGdpChange}% YoY` : '' },
    { label: 'China Economy', value: fmtCurrency(d.cnGdp), detail: `${(d.cnGdp / d.worldGdp * 100).toFixed(1)}% of world GDP` },
    { label: 'Median GDP/Capita', value: fmtCurrency(d.medianGdpPC), detail: 'Half of countries below this' },
  ], y, ch1);

  // ─── CHAPTER 2: GROWTH ────────────────────────────────
  const ch2 = 'Chapter 2';
  y = drawChapterPage(doc, 2, 'The Growth Race',
    "Who's sprinting, who's crawling, and who's going backwards",
    `The fastest-growing economy, ${d.gdpGrowth.top[0].country}, expands at ${d.gdpGrowth.top[0].value!.toFixed(1)}% per year — doubling in ${Math.round(70 / d.gdpGrowth.top[0].value!)} years. Meanwhile, ${d.gdpGrowth.bottom[0].country} contracts at ${d.gdpGrowth.bottom[0].value!.toFixed(1)}%.`
  );

  y = drawTwoColTables(doc,
    'Fastest Growing', d.gdpGrowth.top.slice(0, 10), 1, v => `+${v.toFixed(1)}%`, EMERALD,
    'Shrinking Economies', d.gdpGrowth.bottom.filter(r => (r.value || 0) < 0).slice(0, 10), d.gdpGrowth.total, v => `${v.toFixed(1)}%`, RED,
    y
  );

  y = drawPullQuote(doc, `${d.gdpGrowth.top[0].country}'s economy is growing ${Math.abs(d.gdpGrowth.top[0].value! / (d.gdpGrowth.bottom[0].value || -1)).toFixed(0)}x faster than ${d.gdpGrowth.bottom[0].country}'s is shrinking.`, y, ch2);

  // ─── CHAPTER 3: RICH VS POOR ──────────────────────────
  const ch3 = 'Chapter 3';
  y = drawChapterPage(doc, 3, 'Rich vs. Poor',
    `GDP per capita: from ${fmtCurrency(d.richestPC)} to ${fmtCurrency(d.poorestPC)}`,
    `A person in ${d.gdpPerCapita.top[0].country} lives in an economy producing ${fmtCurrency(d.richestPC)} per person. Someone in ${d.gdpPerCapita.bottom[0].country} — ${fmtCurrency(d.poorestPC)}. That's a ${d.wealthRatio}x difference.`
  );

  y = drawComparisonBox(doc, String(d.wealthRatio), 'x', 'gap between richest and poorest per capita',
    d.gdpPerCapita.top[0].country, fmtCurrency(d.richestPC),
    d.gdpPerCapita.bottom[0].country, fmtCurrency(d.poorestPC), y, ch3);

  y = drawTwoColTables(doc,
    'Richest per Person', d.gdpPerCapita.top.slice(0, 10), 1, v => fmtCurrency(v), BLUE,
    'Poorest per Person', d.gdpPerCapita.bottom.slice(0, 10), d.gdpPerCapita.total, v => fmtCurrency(v), RED,
    y
  );

  y = drawPullQuote(doc, `A worker in ${d.gdpPerCapita.top[0].country} earns in 3 days what a worker in ${d.gdpPerCapita.bottom[0].country} earns in an entire year.`, y, ch3);

  // ─── CHAPTER 4: POPULATION ────────────────────────────
  const ch4 = 'Chapter 4';
  y = drawChapterPage(doc, 4, `${(d.worldPop / 1e9).toFixed(1)} Billion and Counting`,
    'Population, demographics, and the aging challenge',
    `The world holds ${(d.worldPop / 1e9).toFixed(2)} billion people. India and China account for over a third. The story of 2026 is about age — some nations get younger, others face demographic crises.`
  );

  y = drawSectionLabel(doc, 'Most Populated Countries', y);
  y = drawBarChart(doc, d.population.top.slice(0, 10).map(r => ({
    label: r.country,
    value: r.value!,
    display: `${fmtNumber(r.value!)}  (${(r.value! / d.worldPop * 100).toFixed(1)}%)`,
  })), d.population.top[0].value!, PURPLE, y, ch4);

  y = drawMiniStats(doc, 'Aging World: Most people 65+',
    d.popAges65.top.slice(0, 5).map(r => ({ country: r.country, value: `${r.value!.toFixed(1)}%` })), y, ch4);

  y = drawFactCards(doc, [
    { label: 'Highest Fertility', value: `${d.fertility.top[0].value!.toFixed(1)} births`, detail: d.fertility.top[0].country },
    { label: 'Lowest Fertility', value: `${d.fertility.bottom[0].value!.toFixed(1)} births`, detail: d.fertility.bottom[0].country },
    { label: 'Below Replacement', value: `${d.belowReplacement} countries`, detail: 'Below 2.1 births/woman' },
  ], y, ch4);

  // ─── CHAPTER 5: INFLATION ─────────────────────────────
  const ch5 = 'Chapter 5';
  y = drawChapterPage(doc, 5, 'The Price of Everything',
    'Where inflation is running hot — and where prices are falling',
    `Global average inflation is ${d.avgInflation.toFixed(1)}%. In ${d.inflation.top[0].country}, prices rise at ${d.inflation.top[0].value!.toFixed(0)}% per year. Some countries experience deflation.`
  );

  y = drawSectionLabel(doc, 'Highest Inflation Rates', y);
  y = drawBarChart(doc, d.inflation.top.slice(0, 10).map(r => ({
    label: r.country, value: r.value!, display: `${r.value!.toFixed(1)}%`,
  })), d.inflation.top[0].value!, RED, y, ch5);

  y = drawFactCards(doc, [
    { label: 'Global Average', value: `${d.avgInflation.toFixed(1)}%`, detail: 'Across all countries' },
    { label: 'Highest', value: `${d.inflation.top[0].value!.toFixed(0)}%`, detail: d.inflation.top[0].country },
    { label: 'In Deflation', value: `${d.inflation.data.filter(r => (r.value || 0) < 0).length}`, detail: 'Countries with falling prices' },
  ], y, ch5);

  // ─── CHAPTER 6: EMPLOYMENT ────────────────────────────
  const ch6 = 'Chapter 6';
  y = drawChapterPage(doc, 6, 'Work & Wages',
    'Unemployment, youth joblessness, and the labor market',
    `Global average unemployment is ${d.avgUnemployment.toFixed(1)}%. The burden falls disproportionately on young people.`
  );

  y = drawTwoColTables(doc,
    'Highest Unemployment', d.unemployment.top.slice(0, 10), 1, v => `${v.toFixed(1)}%`, RED,
    'Lowest Unemployment', d.unemployment.bottom.slice(0, 10), d.unemployment.total, v => `${v.toFixed(1)}%`, EMERALD,
    y
  );

  y = drawMiniStats(doc, 'Youth Unemployment Crisis (Ages 15-24)',
    d.youthUnemployment.top.slice(0, 5).map(r => ({ country: r.country, value: `${r.value!.toFixed(1)}%` })), y, ch6);

  // ─── CHAPTER 7: DEBT ──────────────────────────────────
  const ch7 = 'Chapter 7';
  y = drawChapterPage(doc, 7, 'The Debt Mountain',
    'Government debt as a percentage of GDP',
    `${d.totalDebtCountriesOver100} countries have debt exceeding 100% of GDP. ${d.debt.top[0].country} leads at ${d.debt.top[0].value!.toFixed(0)}%.`
  );

  y = drawSectionLabel(doc, 'Highest Government Debt (% of GDP)', y);
  y = drawBarChart(doc, d.debt.top.slice(0, 12).map(r => ({
    label: r.country, value: r.value!, display: `${r.value!.toFixed(0)}%`,
  })), d.debt.top[0].value!, AMBER, y, ch7);

  y = drawPullQuote(doc, `${d.totalDebtCountriesOver100} countries owe more than their entire economic output.`, y, ch7);

  // ─── CHAPTER 8: LIFE & DEATH ──────────────────────────
  const ch8 = 'Chapter 8';
  y = drawChapterPage(doc, 8, 'Life & Death',
    `From ${d.longestLife.toFixed(0)} years in ${d.lifeExp.top[0].country} to ${d.shortestLife.toFixed(0)} in ${d.lifeExp.bottom[0].country}`,
    `A child in ${d.lifeExp.top[0].country} can expect ${d.longestLife.toFixed(0)} years. In ${d.lifeExp.bottom[0].country}, just ${d.shortestLife.toFixed(0)} years. A ${d.lifeGap}-year gap.`
  );

  y = drawComparisonBox(doc, String(d.lifeGap), ' yrs', 'gap in life expectancy',
    d.lifeExp.top[0].country, `${d.longestLife.toFixed(1)} years`,
    d.lifeExp.bottom[0].country, `${d.shortestLife.toFixed(1)} years`, y, ch8);

  y = drawTwoColTables(doc,
    'Longest Life Expectancy', d.lifeExp.top.slice(0, 10), 1, v => `${v.toFixed(1)} yrs`, EMERALD,
    'Shortest Life Expectancy', d.lifeExp.bottom.slice(0, 10), d.lifeExp.total, v => `${v.toFixed(1)} yrs`, RED,
    y
  );

  // ─── CHAPTER 9: PLANET ────────────────────────────────
  const ch9 = 'Chapter 9';
  y = drawChapterPage(doc, 9, 'Planet Report',
    'Carbon emissions, renewable energy, and the race to net zero',
    `${d.co2.top[0].country} emits ${d.co2.top[0].value!.toFixed(1)} tonnes of CO₂ per person. Some countries get over 90% of energy from renewables.`
  );

  y = drawTwoColTables(doc,
    'Highest CO₂ per Capita', d.co2.top.slice(0, 10), 1, v => `${v.toFixed(1)}t`, RED,
    'Most Renewable Energy', d.renewable.top.slice(0, 10), 1, v => `${v.toFixed(0)}%`, EMERALD,
    y
  );

  y = drawMiniStats(doc, 'Lowest Electricity Access',
    d.accessElectricity.bottom.slice(0, 5).map(r => ({ country: r.country, value: `${r.value!.toFixed(0)}%` })), y, ch9);

  // ─── CHAPTER 10: DIGITAL ──────────────────────────────
  const ch10 = 'Chapter 10';
  y = drawChapterPage(doc, 10, 'The Digital World',
    'Internet access, R&D spending, and the innovation economy',
    `${d.internet.top[0].country} leads with ${d.internet.top[0].value!.toFixed(0)}% internet penetration. ${d.internet.bottom[0].country} has just ${d.internet.bottom[0].value!.toFixed(0)}%.`
  );

  y = drawTwoColTables(doc,
    'Highest Internet Penetration', d.internet.top.slice(0, 10), 1, v => `${v.toFixed(0)}%`, BLUE,
    'Lowest Internet Penetration', d.internet.bottom.slice(0, 10), d.internet.total, v => `${v.toFixed(0)}%`, AMBER,
    y
  );

  y = drawMiniStats(doc, 'R&D Spending (% of GDP)',
    d.rdSpending.top.slice(0, 5).map(r => ({ country: r.country, value: `${r.value!.toFixed(2)}%` })), y, ch10);

  // ─── CHAPTER 11: TRADE & POWER ────────────────────────
  const ch11 = 'Chapter 11';
  y = drawChapterPage(doc, 11, 'Trade, Power & Security',
    'Military spending, trade flows, and geopolitical muscle',
    `${d.militaryUSD.top[0].country} spends ${fmtCurrency(d.militaryUSD.top[0].value!)} on defense — more than the next several countries combined.`
  );

  y = drawSectionLabel(doc, 'Military Spending (USD)', y);
  y = drawBarChart(doc, d.militaryUSD.top.slice(0, 8).map(r => ({
    label: r.country, value: r.value!, display: fmtCurrency(r.value!),
  })), d.militaryUSD.top[0].value!, RED, y, ch11);

  y = drawTwoColTables(doc,
    'Most Trade-Open (% of GDP)', d.tradeOpenness.top.slice(0, 8), 1, v => `${v.toFixed(0)}%`, BLUE,
    'Military Spending (% of GDP)', d.militaryPctGDP.top.slice(0, 8), 1, v => `${v.toFixed(1)}%`, AMBER,
    y
  );

  // ─── CHAPTER 12: INEQUALITY ───────────────────────────
  const ch12 = 'Chapter 12';
  y = drawChapterPage(doc, 12, 'The Inequality Gap',
    'Income distribution, poverty, and who gets what',
    `The Gini Index: 0 = perfect equality, 100 = total inequality. ${d.gini.top[0].country} (${d.gini.top[0].value!.toFixed(1)}) vs ${d.gini.bottom[0].country} (${d.gini.bottom[0].value!.toFixed(1)}).`
  );

  y = drawTwoColTables(doc,
    'Most Unequal (Gini)', d.gini.top.slice(0, 10), 1, v => v.toFixed(1), RED,
    'Most Equal (Gini)', d.gini.bottom.slice(0, 10), d.gini.total, v => v.toFixed(1), EMERALD,
    y
  );

  y = drawMiniStats(doc, 'Income Share of the Top 10%',
    d.incomeTop10.top.slice(0, 5).map(r => ({ country: r.country, value: `${r.value!.toFixed(1)}%` })), y, ch12);

  y = drawPullQuote(doc, `In ${d.incomeTop10.top[0]?.country || 'the most unequal countries'}, the richest 10% earn ${d.incomeTop10.top[0]?.value?.toFixed(0) || '45'}% of all income. Same planet, different worlds.`, y, ch12);

  // ─── METHODOLOGY ──────────────────────────────────────
  doc.addPage();
  y = MARGIN;

  doc.setFontSize(22);
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.text('Methodology & Sources', MARGIN, y + 10);
  y += 20;

  doc.setDrawColor(...BLUE);
  doc.setLineWidth(2);
  doc.line(MARGIN, y, MARGIN + 60, y);
  y += 16;

  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'normal');
  const methLines = doc.splitTextToSize('This report uses live data from three authoritative sources. Values reflect the most recently available data for each indicator.', CONTENT_W);
  doc.text(methLines, MARGIN, y);
  y += methLines.length * 14 + 10;

  const sources = [
    ['IMF World Economic Outlook', 'GDP, growth, inflation, unemployment, debt, fiscal balance, PPP. Updated biannually (April & October).'],
    ['World Bank WDI', 'Population, life expectancy, education, health, trade, environment, poverty, inequality. 400+ indicators.'],
    ['WHO Global Health Observatory', 'Health expenditure, mortality, immunization, health workforce. Updated annually.'],
  ];

  for (const [name, desc] of sources) {
    doc.setDrawColor(...LIGHT_GRAY);
    doc.setLineWidth(0.5);
    doc.roundedRect(MARGIN, y, CONTENT_W, 38, 3, 3, 'S');

    doc.setFontSize(10);
    doc.setTextColor(...NAVY);
    doc.setFont('helvetica', 'bold');
    doc.text(name, MARGIN + 8, y + 14);

    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(desc, CONTENT_W - 16);
    doc.text(descLines, MARGIN + 8, y + 26);

    y += 44;
  }

  y += 10;

  // Notes
  const notes = [
    `Coverage: ${d.countries} countries and territories across 440+ indicators.`,
    'Currency: All monetary values in current US dollars unless noted.',
    'Rankings: Based on latest available data (some may be 2024-2025).',
    'Aggregates: Global averages are unweighted unless specifically noted.',
  ];

  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.text('Important Notes', MARGIN, y);
  y += 14;

  for (const note of notes) {
    doc.setFontSize(8.5);
    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'normal');
    doc.text(`•   ${note}`, MARGIN + 4, y);
    y += 14;
  }

  y += 20;

  // CTA
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(1);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 20;

  doc.setFontSize(14);
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.text('This Is Just the Summary', PAGE_W / 2, y, { align: 'center' });
  y += 14;

  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'normal');
  const cta = doc.splitTextToSize(`Behind every number are ${d.countries} country profiles, 440+ indicators, interactive charts, and a free API. No login. No paywall.`, 320);
  doc.text(cta, PAGE_W / 2, y, { align: 'center' });
  y += cta.length * 12 + 10;

  doc.setFontSize(12);
  doc.setTextColor(...BLUE);
  doc.setFont('helvetica', 'bold');
  doc.text('statisticsoftheworld.com', PAGE_W / 2, y, { align: 'center' });
  y += 20;

  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text(`© ${new Date().getFullYear()} Statistics of the World. All data free to use with attribution.`, PAGE_W / 2, y, { align: 'center' });

  addFooter(doc, 'Methodology');

  // ─── SAVE ─────────────────────────────────────────────
  doc.save('SOTW-2026-Global-Economic-Snapshot.pdf');
}
