# Dev.to Article: Visualizing Global Inflation With JavaScript — From API to Chart in 30 Minutes

**Platform**: dev.to
**Type**: Article
**Status**: Ready to post
**Tags**: javascript, webdev, dataviz, api, tutorial
**Pre-post check**: Search dev.to for "statisticsoftheworld" — if already posted recently, SKIP

---

# Visualizing Global Inflation With JavaScript — From API to Chart in 30 Minutes

Inflation has been the headline economic story of the last few years. I wanted to build a quick visualization showing which countries have the highest and lowest inflation right now — and how it compares to the global average.

Here's a minimal approach using vanilla JavaScript and Chart.js.

## Getting the Data

I needed inflation rates for every country, sorted from highest to lowest. The IMF publishes this in their World Economic Outlook, but parsing their SDMX-JSON format is... not fun.

Instead, I used [Statistics of the World's ranking endpoint](https://statisticsoftheworld.com/api-docs) which returns pre-sorted data:

```javascript
async function getInflationData() {
  const res = await fetch(
    'https://statisticsoftheworld.com/api/v2/ranking/inflation-rate'
  );
  const data = await res.json();
  
  // data is already sorted highest to lowest
  // Each item: { country: "Venezuela", countryId: "VEN", value: 350.2, year: 2026 }
  return data;
}
```

No API key needed for basic requests. The data comes back clean — no null values mixed in, no weird country code mapping needed.

## The Visualization

I wanted three views:
1. Top 10 highest inflation (the crisis countries)
2. Bottom 10 lowest (deflation or near-zero)
3. Distribution histogram

### Top/Bottom 10 Bar Chart

```html
<canvas id="inflationChart" width="800" height="400"></canvas>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>
async function render() {
  const data = await getInflationData();
  
  const top10 = data.slice(0, 10);
  const bottom10 = data.slice(-10).reverse();
  const combined = [...top10, ...bottom10];
  
  new Chart(document.getElementById('inflationChart'), {
    type: 'bar',
    data: {
      labels: combined.map(d => d.country),
      datasets: [{
        label: `Inflation Rate (${data[0].year})`,
        data: combined.map(d => d.value),
        backgroundColor: combined.map(d => 
          d.value > 10 ? '#ef4444' : 
          d.value > 3 ? '#f59e0b' : 
          d.value > 0 ? '#22c55e' : '#3b82f6'
        ),
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        title: { display: true, text: 'Inflation: Highest & Lowest Countries' }
      }
    }
  });
}

render();
</script>
```

### Adding Context: Global Average Line

```javascript
const avg = data.reduce((s, d) => s + d.value, 0) / data.length;

// Add as annotation
options: {
  plugins: {
    annotation: {
      annotations: {
        avgLine: {
          type: 'line',
          xMin: avg, xMax: avg,
          borderColor: '#6366f1',
          borderWidth: 2,
          label: {
            content: `World Avg: ${avg.toFixed(1)}%`,
            display: true
          }
        }
      }
    }
  }
}
```

## What the Data Shows (2026)

Running this with live data reveals some interesting patterns:

- **Hyperinflation** is concentrated in a handful of countries (Venezuela, Zimbabwe, Sudan, Argentina) where currency crises and political instability dominate
- **Deflation** is hitting some export-dependent economies, particularly in East Asia, as the US tariff regime reshuffles global trade flows
- **The "2% club"** (countries near central bank targets) is smaller than you'd think — most countries are either well above or below target
- **The global average** is misleadingly high because it's skewed by outliers — the median is a much better measure of "typical" inflation

## Going Further

A few extensions if you want to make this more useful:

**Historical comparison**: The API also provides time-series data, so you can show how a country's inflation evolved:

```javascript
const history = await fetch(
  'https://statisticsoftheworld.com/api/v2/history?indicator=inflation-rate&country=ARG'
);
// Returns yearly inflation for Argentina going back 20+ years
```

**Regional breakdown**: Color-code by continent to see patterns — Sub-Saharan Africa and South America have systematically higher inflation than East Asia and Northern Europe.

You can explore the full interactive version at [statisticsoftheworld.com/inflation-by-country](https://statisticsoftheworld.com/inflation-by-country) — it shows all 218 countries with sortable tables and per-country drill-downs.

## The Code

Full source for this visualization is under 100 lines. The hardest part of data visualization is usually getting clean data — once you have a sorted array of `{country, value}` objects, the charting is straightforward.

---

What economic data are you visualizing? I'd love to see what people build with this.
