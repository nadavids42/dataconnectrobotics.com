import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { METRICS } from "./metrics.js";

let selectedDistricts = [];
let selectedPrimaryCol = METRICS[0].col;
let selectedSecondaryCol = null;

export function renderLineChart(data) {
  const margin = { top: 40, right: 150, bottom: 60, left: 60 };
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

  const trendSelect = d3.select("#trendMetricSelect");
  const secondarySelect = d3.select("#secondaryTrendMetricSelect");

  trendSelect.selectAll("option")
    .data(METRICS)
    .enter()
    .append("option")
    .attr("value", d => d.col)
    .text(d => d.label);

  secondarySelect.selectAll("option")
    .data([{ label: "None", col: "" }, ...METRICS])
    .enter()
    .append("option")
    .attr("value", d => d.col)
    .text(d => d.label);

  trendSelect.on("change", function () {
    selectedPrimaryCol = this.value;
    update(selectedDistricts);
  });

  secondarySelect.on("change", function () {
    selectedSecondaryCol = this.value || null;
    update(selectedDistricts);
  });

  const select = d3.select("#districtSelect")
    .attr("multiple", true);

  const allDistricts = Array.from(new Set(data.map(d => d["District Code"]))).sort();

  selectedDistricts = allDistricts.slice(0, 2);

  select.selectAll("option")
    .data(allDistricts)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => {
      const match = data.find(row => row["District Code"] === d);
      return match ? match["District Name"] : d;
    })
    .property("selected", d => selectedDistricts.includes(d));

  select.on("change", function () {
    const chosen = Array.from(this.selectedOptions).map(opt => opt.value);
    if (chosen.length > 3) {
      alert("Please select no more than 3 districts.");
      this.selectedIndex = -1;
      selectedDistricts = [];
      update([]);
    } else {
      selectedDistricts = chosen;
      update(selectedDistricts);
    }
  });

  function update(districtCodes) {
    svg.selectAll("*").remove();

    const primaryMetric = METRICS.find(m => m.col === selectedPrimaryCol);
    const secondaryMetric = METRICS.find(m => m.col === selectedSecondaryCol);

    const filtered = data.filter(d => districtCodes.includes(d["District Code"]));

    const parseVal = raw => typeof raw !== "string" ? parseFloat(raw) : parseFloat(raw.replace(/[%$,]/g, "").trim());

    const primaryColorScale = d3.scaleOrdinal(d3.schemeCategory10);
    const secondaryColorScale = d3.scaleOrdinal(d3.schemeSet2);

    const buildSeries = (col, colorScale) =>
      districtCodes.map((code, i) => {
        const entries = filtered
          .filter(d => d["District Code"] === code)
          .map(d => ({ year: +d.Year, value: parseVal(d[col]), name: d["District Name"] }))
          .filter(d => !isNaN(d.value))
          .sort((a, b) => a.year - b.year);

        return {
          name: entries[0]?.name || code,
          code,
          color: colorScale(i),
          values: entries
        };
      }).filter(s => s.values.length > 0);

    const primarySeries = buildSeries(selectedPrimaryCol, primaryColorScale);
    const secondarySeries = selectedSecondaryCol ? buildSeries(selectedSecondaryCol, secondaryColorScale) : [];

    const allYears = [...primarySeries, ...secondarySeries].flatMap(s => s.values.map(v => v.year));
    const allPrimaryVals = primarySeries.flatMap(s => s.values.map(v => v.value));
    const allSecondaryVals = secondarySeries.flatMap(s => s.values.map(v => v.value));

    const xScale = d3.scaleLinear().range([0, width]).domain(d3.extent(allYears));
    const yScaleLeft = d3.scaleLinear().range([height, 0]).domain(d3.extent(allPrimaryVals));
    const useRightAxis = secondarySeries.length > 0;
    const yScaleRight = useRightAxis ? d3.scaleLinear().range([height, 0]).domain(d3.extent(allSecondaryVals)) : null;

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxisLeft = d3.axisLeft(yScaleLeft);
    const yAxisRight = yScaleRight ? d3.axisRight(yScaleRight) : null;

    svg.append("g").attr("transform", `translate(0,${height})`).call(xAxis);
    svg.append("g").call(yAxisLeft);
    if (yAxisRight) svg.append("g").attr("transform", `translate(${width},0)`).call(yAxisRight);

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .style("text-anchor", "middle")
      .style("fill", "#ccc")
      .text("Year");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -45)
      .style("text-anchor", "middle")
      .style("fill", "#ccc")
      .text(primaryMetric.label);

    if (secondaryMetric) {
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", width + 55)
        .style("text-anchor", "middle")
        .style("fill", "#ccc")
        .text(secondaryMetric.label);
    }

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("font-size", "17px")
      .attr("font-weight", "bold")
      .attr("fill", "#2b97e0")
      .text(`Trend Over Time: ${primaryMetric.label}${secondaryMetric ? " & " + secondaryMetric.label : ""}`);

    const tooltip = d3.select("#lineChart-tooltip");
    if (tooltip.empty()) {
      d3.select("body")
        .append("div")
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

    const line = scale => d3.line()
      .x(d => xScale(d.year))
      .y(d => scale(d.value))
      .curve(d3.curveMonotoneX);

    primarySeries.forEach(series => {
      svg.append("path")
        .datum(series.values)
        .attr("fill", "none")
        .attr("stroke", series.color)
        .attr("stroke-width", 2)
        .attr("d", line(yScaleLeft));

      svg.selectAll(null)
        .data(series.values)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScaleLeft(d.value))
        .attr("r", 4)
        .attr("fill", series.color)
        .on("mouseover", (event, d) => {
          d3.select("#lineChart-tooltip")
            .html(`${series.name}<br>Year: ${d.year}<br>${primaryMetric.label}: ${primaryMetric.format(d.value)}`)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 20}px`)
            .style("display", "inline-block");
        })
        .on("mouseout", () => d3.select("#lineChart-tooltip").style("display", "none"));
    });

    secondarySeries.forEach(series => {
      svg.append("path")
        .datum(series.values)
        .attr("fill", "none")
        .attr("stroke", series.color)
        .attr("stroke-width", 2)
        .attr("d", line(yScaleRight));

      svg.selectAll(null)
        .data(series.values)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScaleRight(d.value))
        .attr("r", 4)
        .attr("fill", series.color)
        .on("mouseover", (event, d) => {
          d3.select("#lineChart-tooltip")
            .html(`${series.name}<br>Year: ${d.year}<br>${secondaryMetric.label}: ${secondaryMetric.format(d.value)}`)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 20}px`)
            .style("display", "inline-block");
        })
        .on("mouseout", () => d3.select("#lineChart-tooltip").style("display", "none"));
    });

    const legendBox = d3.select("#lineChart-legend");
    legendBox.html("");

    [...primarySeries.map(s => ({ ...s, isSecondary: false })),
     ...secondarySeries.map(s => ({ ...s, isSecondary: true }))]
    .forEach(series => {
      const metricLabel = series.isSecondary ? secondaryMetric.label : primaryMetric.label;
      legendBox.append("div")
        .style("margin-bottom", "4px")
        .html(
          `<span style="display:inline-block;width:12px;height:12px;background:${series.color};margin-right:6px;border-radius:2px;"></span>
           ${series.name} – ${metricLabel}`
        );
    });

    const nativeSelect = document.getElementById("districtSelect");
    if (!window.districtChoices) {
      window.districtChoices = new Choices(nativeSelect, {
        removeItemButton: true,
        shouldSort: false,
        searchResultLimit: 100,
        placeholderValue: 'Search districts...',
        maxItemCount: 3,
      });
    } else {
      window.districtChoices.setChoices(
        Array.from(nativeSelect.options).map(opt => ({
          value: opt.value,
          label: opt.text,
          selected: opt.selected,
          disabled: opt.disabled
        })),
        'value',
        'label',
        true
      );
    }
  }

  update(selectedDistricts);
}
