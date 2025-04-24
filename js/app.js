// app.js
import { loadData } from './load_data.js';
import { METRICS, buildLookupByCode } from './metrics.js';
import { renderMap } from './map_render.js';
import { updateScatterplot } from './scatterplot_render.js';
import { setupControls } from './ui_controls.js';

loadData().then(([districts, allData, massDistricts]) => {
  const width = 800;
  const height = 600;
  const scatterWidth = 480;
  const scatterHeight = 480;
  const defaultYear = 2021;

  const svg = d3.select("#map").append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .classed("responsive-svg", true);

  const scatterSvg = d3.select("#scatterplot").append("svg")
    .attr("viewBox", `0 0 ${scatterWidth} ${scatterHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .classed("responsive-svg", true);

  const metricSelect = d3.select("#metricSelect");
  const xMetricSelect = d3.select("#xMetricSelect");
  const yMetricSelect = d3.select("#yMetricSelect");
  const yearSlider = d3.select("#yearSlider");
  const yearValueLabel = d3.select("#yearValue");
  const subtitle = d3.select("#subtitle");
  const allYears = Array.from(new Set(allData.map(d => +d["Year"]))).sort();
  const minYear = d3.min(allYears);
  const maxYear = d3.max(allYears);

  const projection = d3.geoMercator().fitSize([width, height], districts);
  const path = d3.geoPath().projection(projection);

  // --- Add Massachusetts Districts GeoJSON Layer (outline, below main layer) ---
  svg.append("g").attr("class", "ma-districts")
    .selectAll("path")
    .data(massDistricts.features)
    .enter().append("path")
    .attr("d", path)
    .attr("fill", "none")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1.5)
    .attr("pointer-events", "none"); // Keeps map interactions above

  svg.append("g").attr("class", "districts")
    .selectAll("path")
    .data(districts.features)
    .enter().append("path")
    .attr("d", path)
    .attr("stroke", "#333");

  const defs = svg.append("defs");
  const legendGradient = defs.append("linearGradient").attr("id", "legend-gradient");
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - 300 - 40}, ${height - 40})`);

  legend.append("rect")
    .attr("width", 300)
    .attr("height", 10)
    .style("fill", "url(#legend-gradient)")
    .style("stroke", "#aaa");

  const legendTitle = legend.append("text")
    .attr("x", 0)
    .attr("y", -5)
    .style("fill", "#eee");

  const legendLabels = legend.selectAll("text.labels")
    .data([0, 0, 0])
    .enter().append("text")
    .attr("class", "labels")
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .style("fill", "#eee");

  function updateLegend(domain, metricObj) {
    legendGradient.selectAll("stop").remove();
    if (metricObj && metricObj.legend === "percent") {
      legendGradient.selectAll("stop")
        .data(d3.range(50, 101))
        .enter().append("stop")
        .attr("offset", d => `${((d - 50) / 50) * 100}%`)
        .attr("stop-color", d => d3.interpolateBlues((d - 50) / 50));
      legendTitle.text(metricObj.label);
      legendLabels.data([50, 75, 100])
        .attr("x", d => (d - 50) / 50 * 300)
        .text(d => `${d}%`);
    } else if (metricObj && metricObj.legend === "dollars") {
      const [minS, maxS] = domain;
      legendGradient.selectAll("stop")
        .data(d3.range(minS, maxS + 1, (maxS - minS) / 100))
        .enter().append("stop")
        .attr("offset", s => `${((s - minS) / (maxS - minS)) * 100}%`)
        .attr("stop-color", s => d3.interpolateGreens((s - minS) / (maxS - minS)));
      legendTitle.text(metricObj.label);
      legendLabels.data([minS, Math.round((minS + maxS) / 2), maxS])
        .attr("x", (d, i) => i === 0 ? 0 : (i === 1 ? 150 : 300))
        .text(d => "$" + d.toLocaleString(undefined, {maximumFractionDigits: 0}));
    } else if (metricObj) {
      // For other metrics (MCAS/SAT/etc)
      const [minS, maxS] = domain;
      legendGradient.selectAll("stop")
        .data(d3.range(minS, maxS + 1, (maxS - minS) / 100))
        .enter().append("stop")
        .attr("offset", s => `${((s - minS) / (maxS - minS)) * 100}%`)
        .attr("stop-color", s => d3.interpolateOranges((s - minS) / (maxS - minS)));
      legendTitle.text(metricObj.label);
      legendLabels.data([minS, Math.round((minS + maxS) / 2), maxS])
        .attr("x", (d, i) => i === 0 ? 0 : (i === 1 ? 150 : 300))
        .text(d => d3.format(".0f")(d));
    }
  }

  function rerender() {
    const selectedYear = +yearSlider.node().value || defaultYear;
    yearValueLabel.text(selectedYear);

    // Get selected metrics
    const mapMetricKey = metricSelect.node().value;
    const xMetricKey = xMetricSelect.node().value;
    const yMetricKey = yMetricSelect.node().value;

    const mapMetricObj = METRICS.find(m => m.key === mapMetricKey);
    const xMetricObj = METRICS.find(m => m.key === xMetricKey);
    const yMetricObj = METRICS.find(m => m.key === yMetricKey);

    subtitle.text(`${mapMetricObj.label} (${selectedYear})`);

    // Build lookup tables
    const mapByCode = buildLookupByCode(allData, mapMetricObj.col, selectedYear);
    const xByCode = buildLookupByCode(allData, xMetricObj.col, selectedYear);
    const yByCode = buildLookupByCode(allData, yMetricObj.col, selectedYear);

    // Color scales by metric type
    let domain = d3.extent(Object.values(mapByCode).filter(v => v != null));
    if (mapMetricObj.legend === "percent") domain = [50, 100];
    else if (mapMetricObj.legend === "dollars") {
      domain = [
        Math.floor(domain[0] / 1000) * 1000,
        Math.ceil(domain[1] / 1000) * 1000
      ];
    }
    const color =
      mapMetricObj.legend === "percent"
        ? d3.scaleQuantize().domain(domain).range(d3.schemeBlues[7])
        : mapMetricObj.legend === "dollars"
        ? d3.scaleQuantize().domain(domain).range(d3.schemeGreens[7])
        : d3.scaleQuantize().domain(domain).range(d3.schemeOranges[7]);

    // Render map
    renderMap(
      svg,
      districts,
      path,
      color,
      code => mapByCode[code],
      domain,
      d => updateLegend(domain, mapMetricObj),
      mapByCode,
      xByCode, // for info-box
      yByCode, // for info-box
      mapMetricObj,
      xMetricObj,
      yMetricObj,
      selectedYear
    );

    // Render scatterplot
    updateScatterplot(
      scatterSvg,
      xByCode,
      yByCode,
      xMetricObj,
      yMetricObj,
      selectedYear,
      districts
    );
  }

  setupControls(metricSelect, xMetricSelect, yMetricSelect, yearSlider, rerender, minYear, maxYear, defaultYear, METRICS);
  rerender();
});
