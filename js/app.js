// app.js
import { loadData } from './load_data.js';
import { buildMetricLookups } from './metrics.js';
import { renderMap } from './map_render.js';
import { updateScatterplot } from './scatterplot_render.js';
import { setupControls } from './ui_controls.js';

loadData().then(([districts, allData, massDistricts]) => {
  const width = 800;
  const height = 600;
  const scatterWidth = 480;
  const scatterHeight = 480;
  const margin = {top: 30, right: 30, bottom: 60, left: 70};

  const svg = d3.select("#map").append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .classed("responsive-svg", true);

  const scatterSvg = d3.select("#scatterplot").append("svg")
    .attr("viewBox", `0 0 ${scatterWidth} ${scatterHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .classed("responsive-svg", true);

  const metricSelect = d3.select("#metricSelect");
  const yearSlider = d3.select("#yearSlider");
  const yearValueLabel = d3.select("#yearValue");
  const subtitle = d3.select("#subtitle");
  const allYears = Array.from(new Set(allData.map(d => +d["Year"]))).sort();
  const minYear = d3.min(allYears);
  const maxYear = d3.max(allYears);
  const defaultYear = 2021;

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

  function updateLegend(domain, metric) {
    legendGradient.selectAll("stop").remove();
    if (metric === "grad") {
      legendGradient.selectAll("stop")
        .data(d3.range(50, 101))
        .enter().append("stop")
        .attr("offset", d => `${((d - 50) / 50) * 100}%`)
        .attr("stop-color", d => d3.interpolateBlues((d - 50) / 50));
      legendTitle.text("Graduation Rate");
      legendLabels.data([50, 75, 100])
        .attr("x", d => (d - 50) / 50 * 300)
        .text(d => `${d}%`);
    } else {
      const [minS, maxS] = domain;
      legendGradient.selectAll("stop")
        .data(d3.range(minS, maxS + 1, (maxS - minS) / 100))
        .enter().append("stop")
        .attr("offset", s => `${((s - minS) / (maxS - minS)) * 100}%`)
        .attr("stop-color", s => d3.interpolateGreens((s - minS) / (maxS - minS)));
      legendTitle.text("Average Salary");
      legendLabels.data([minS, Math.round((minS + maxS) / 2), maxS])
        .attr("x", (d, i) => i === 0 ? 0 : (i === 1 ? 150 : 300))
        .text(d => `$${d.toLocaleString(undefined, {maximumFractionDigits: 0})}`);
    }
  }

  function rerender() {
    const selectedYear = +yearSlider.node().value || defaultYear;
    const selectedMetric = metricSelect.node().value;
    subtitle.text(`${metricSelect.node().selectedOptions[0].text}: ${selectedYear}`);
    yearValueLabel.text(selectedYear);

    const { gradByCode, salaryByCode } = buildMetricLookups(allData, selectedYear);

    let color, getValue, legendDomain;
    if (selectedMetric === "grad") {
      color = d3.scaleQuantize().domain([50, 100]).range(d3.schemeBlues[7]);
      getValue = code => gradByCode[code];
      legendDomain = [50, 100];
    } else {
      const salariesThisYear = Object.values(salaryByCode).filter(s => s > 0);
      const minS = Math.floor(d3.min(salariesThisYear) / 1000) * 1000;
      const maxS = Math.ceil(d3.max(salariesThisYear) / 1000) * 1000;
      color = d3.scaleQuantize().domain([minS, maxS]).range(d3.schemeGreens[7]);
      getValue = code => salaryByCode[code];
      legendDomain = [minS, maxS];
    }

    renderMap(svg, districts, path, color, getValue, legendDomain, updateLegend, gradByCode, salaryByCode, updateScatterplot.bind(null, scatterSvg), selectedYear, selectedMetric);
  }

  setupControls(yearSlider, metricSelect, rerender, minYear, maxYear, defaultYear);
  rerender();
});
