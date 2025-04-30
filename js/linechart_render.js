// linechart_render.js with dual-metric support and dynamic dual Y-axes

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { METRICS } from "./metrics.js";

let selectedDistricts = [];
let selectedMetricCol = METRICS[0].col;
let selectedSecondaryCol = null;

export function renderLineChart(data) {
  const margin = { top: 40, right: 80, bottom: 60, left: 60 };
  const width = 700 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#lineChart")
    .append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "auto")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  const trendSelect = d3.select("#trendMetricSelect");
  const secondarySelect = d3.select("#secondaryTrendMetricSelect");
  const districtSelect = d3.select("#districtSelect")
    .attr("multiple", true)
    .attr("size", 6);

  trendSelect.selectAll("option")
    .data(METRICS)
    .enter()
    .append("option")
    .attr("value", d => d.col)
    .text(d => d.label);
  trendSelect.property("value", selectedMetricCol);

  secondarySelect.selectAll("option")
    .data([{ label: "(none)", col: null }, ...METRICS])
    .enter()
    .append("option")
    .attr("value", d => d.col)
    .text(d => d.label);

  function updateDistrictDropdown(metricCol) {
    const districtMap = new Map();

    data.forEach(d => {
      const code = d["District Code"]?.toString().padStart(8, "0");
      const name = d["District Name"]?.trim();
      const val = d[metricCol];
      const isValid = val && !isNaN(parseFloat(val.toString().replace(/[%$,]/g, "").trim()));
      if (code && name && isValid && !districtMap.has(code)) {
        districtMap.set(code, name);
      }
    });

    const districtList = Array.from(districtMap.entries()).sort((a, b) => a[1].localeCompare(b[1]));
    districtSelect.selectAll("option").remove();
    districtSelect.selectAll("option")
      .data(districtList)
      .enter()
      .append("option")
      .attr("value", d => d[0])
      .text(d => d[1]);

    if (selectedDistricts.length > 0) {
      districtSelect.selectAll("option").property("selected", d => selectedDistricts.includes(d[0]));
    } else {
      selectedDistricts = districtList.slice(0, 2).map(d => d[0]);
      districtSelect.selectAll("option").property("selected", d => selectedDistricts.includes(d[0]));
    }

    return districtList.map(d => d[0]);
  }

  const districts = updateDistrictDropdown(selectedMetricCol);

  districtSelect.on("change", function () {
    selectedDistricts = Array.from(this.selectedOptions).map(opt => opt.value);
    update(selectedDistricts);
  });

  trendSelect.on("change", function () {
    selectedMetricCol = this.value;
    updateDistrictDropdown(selectedMetricCol);
    update(selectedDistricts);
  });

  secondarySelect.on("change", function () {
    selectedSecondaryCol = this.value || null;
    update(selectedDistricts);
  });

  function update(districtCodes) {
    svg.selectAll("*").remove();
    // Append legends for both metric sets
    svg.selectAll(".legend-label")
      .data([...primarySeries.map(s => ({ ...s, side: "left" })), ...secondarySeries.map(s => ({ ...s, side: "right" }))])
      .enter()
      .append("text")
      .attr("class", "legend-label")
      .attr("x", width + 10)
      .attr("y", (d, i) => i * 20)
      .style("fill", d => d.color)
      .style("font-size", "0.85rem")
      .text(d => `${d.name}${d.side === "right" ? " (2)" : ""}`);

    if (districtCodes.length === 0) return;

    const primaryMeta = METRICS.find(m => m.col === selectedMetricCol);
    const secondaryMeta = METRICS.find(m => m.col === selectedSecondaryCol);

    const allYears = Array.from(new Set(data.map(d => +d.Year))).sort();
    const lineGenerator = metric => d3.line()
      .x(d => xScale(d.year))
      .y(d => metric === "primary" ? yLeftScale(d.value) : yRightScale(d.value))
      .curve(d3.curveMonotoneX);

    const seriesByMetric = (metricCol, metricKey) => districtCodes.map((code, i) => {
      const filtered = data.filter(d => d["District Code"]?.toString().padStart(8, "0") === code);
      const name = filtered[0]?.["District Name"] ?? `District ${code}`;

      return {
        name,
        color: colorScale(i + (metricKey === "secondary" ? 5 : 0)),
        values: filtered.map(d => ({
          year: +d.Year,
          value: parseFloat(d[metricCol]?.toString().replace(/[%$,]/g, "").trim())
        })).filter(d => !isNaN(d.value)).sort((a, b) => a.year - b.year)
      };
    });

    const primarySeries = seriesByMetric(selectedMetricCol, "primary");
    const secondarySeries = selectedSecondaryCol ? seriesByMetric(selectedSecondaryCol, "secondary") : [];

    const xScale = d3.scaleLinear().domain(d3.extent(allYears)).range([0, width]);
    const yLeftScale = d3.scaleLinear()
      .domain(d3.extent(primarySeries.flatMap(s => s.values.map(v => v.value))))
      .range([height, 0]);

    let yRightScale = null;
    if (secondarySeries.length > 0) {
      yRightScale = d3.scaleLinear()
        .domain(d3.extent(secondarySeries.flatMap(s => s.values.map(v => v.value))))
        .range([height, 0]);
    }

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    svg.append("g").call(d3.axisLeft(yLeftScale));

    if (yRightScale) {
      svg.append("g")
        .attr("transform", `translate(${width},0)`)
        .call(d3.axisRight(yRightScale));
    }

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("font-size", "17px")
      .attr("font-weight", "bold")
      .attr("fill", "#2b97e0")
      .text(`Trend Over Time: ${primaryMeta.label}${secondaryMeta ? " & " + secondaryMeta.label : ""}`);

    const tooltip = d3.select("#lineChart-tooltip");
    if (tooltip.empty()) {
      d3.select("body").append("div")
        .attr("id", "lineChart-tooltip")
        .style("position", "absolute")
        .style("display", "none")
        .style("background", "#222")
        .style("color", "#fff")
        .style("padding", "6px 10px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("font-size", "0.85rem")
        .style("z-index", "999");
    }

    [...primarySeries.map(s => ({ ...s, key: "primary" })), ...secondarySeries.map(s => ({ ...s, key: "secondary" }))]
      .forEach(series => {
        const scale = series.key === "primary" ? yLeftScale : yRightScale;
        const meta = series.key === "primary" ? primaryMeta : secondaryMeta;

        svg.append("path")
          .datum(series.values)
          .attr("fill", "none")
          .attr("stroke", series.color)
          .attr("stroke-width", 2)
          .attr("d", lineGenerator(series.key));

        svg.selectAll(null)
          .data(series.values)
          .enter()
          .append("circle")
          .attr("cx", d => xScale(d.year))
          .attr("cy", d => scale(d.value))
          .attr("r", 4)
          .attr("fill", series.color)
          .on("mouseover", function (event, d) {
            d3.select(this).attr("r", 6);
            d3.select("#lineChart-tooltip")
              .html(`${series.name}<br>Year: ${d.year}<br>${meta.label}: ${meta.format(d.value)}`)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 20) + "px")
              .style("display", "inline-block");
          })
          .on("mouseout", function () {
            d3.select(this).attr("r", 4);
            d3.select("#lineChart-tooltip").style("display", "none");
          });
      });
  }

  update(selectedDistricts.length ? selectedDistricts : districts.slice(0, 2));
}
