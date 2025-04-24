// ui_controls.js
export function setupControls(yearSlider, metricSelect, rerender, minYear, maxYear, defaultYear) {
  yearSlider
    .attr("min", minYear)
    .attr("max", maxYear)
    .attr("value", defaultYear)
    .attr("step", 1)
    .on("input", rerender);

  metricSelect.on("change", rerender);

  // If you want to populate metricSelect programmatically, do it here:
  if (metricSelect.empty()) {
    d3.select("#subtitle").insert("select", "#yearSlider")
      .attr("id", "metricSelect")
      .selectAll("option")
      .data([
        {value: "grad", label: "Graduation Rate"},
        {value: "salary", label: "Average Salary"}
      ])
      .enter()
      .append("option")
      .attr("value", d => d.value)
      .text(d => d.label);
  }
}
