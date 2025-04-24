// ui_controls.js
export function setupControls(
  metricSelect,
  xMetricSelect,
  yMetricSelect,
  yearSlider,
  rerender,
  minYear,
  maxYear,
  defaultYear,
  METRICS
) {
  // Populate all three dropdowns with metric options
  [metricSelect, xMetricSelect, yMetricSelect].forEach(select => {
    select.selectAll("option").remove();
    select.selectAll("option")
      .data(METRICS)
      .enter().append("option")
      .attr("value", d => d.key)
      .text(d => d.label);
  });

  // Set initial values (customize as needed)
  metricSelect.property("value", "grad");
  xMetricSelect.property("value", "salary");
  yMetricSelect.property("value", "grad");

  yearSlider
    .attr("min", minYear)
    .attr("max", maxYear)
    .attr("value", defaultYear)
    .attr("step", 1)
    .on("input", rerender);

  metricSelect.on("change", rerender);
  xMetricSelect.on("change", rerender);
  yMetricSelect.on("change", rerender);
}
