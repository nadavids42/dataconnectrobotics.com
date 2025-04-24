// map_render.js
export function renderMap(svg, districts, path, color, getValue, legendDomain, updateLegend, gradByCode, salaryByCode, updateScatterplot, selectedYear, metric) {
  updateLegend(legendDomain, metric);

  svg.selectAll("g.districts path")
    .attr("fill", d => {
      const code = d.properties.ORG8CODE?.toString().padStart(8, "0");
      const val = getValue(code);
      return val ? color(val) : "#ccc";
    })
    .attr("data-code", d => d.properties.ORG8CODE?.toString().padStart(8, "0"))
    .on("mouseover", function(event, d) {
      const code = d.properties.ORG8CODE?.toString().padStart(8, "0");
      d3.select(this).attr("stroke", "#ff6600").attr("stroke-width", 4);
      d3.selectAll(`#scatterplot circle[data-code='${code}']`)
        .attr("fill", "#ff6600")
        .attr("r", 10);
    })
    .on("mouseleave", function(event, d) {
      const code = d.properties.ORG8CODE?.toString().padStart(8, "0");
      d3.select(this).attr("stroke", "#333").attr("stroke-width", 1);
      d3.selectAll(`#scatterplot circle[data-code='${code}']`)
        .attr("fill", "#009bcd")
        .attr("r", 6);
    })
    .on("click", function(event, d) {
      const name = d.properties.DISTRICT_N;
      const code = d.properties.ORG8CODE?.toString().padStart(8, "0");
      const rate = gradByCode[code];
      const salary = salaryByCode[code];
      const infoBox = document.getElementById("info-box");
      infoBox.innerHTML = `
        <h3 style="margin-top: 0">${name || "Unknown District"}</h3>
        <p><strong>District Code:</strong> ${code}</p>
        <p><strong>Graduation Rate:</strong> ${rate !== undefined ? rate.toFixed(1) + "%" : "N/A"}</p>
        <p><strong>Average Salary:</strong> ${salary !== undefined ? "$" + salary.toLocaleString(undefined, {maximumFractionDigits: 0}) : "N/A"}</p>
      `;
      infoBox.style.display = "block";
    });

  svg.selectAll("g.districts path").selectAll("title").remove();

  // --- Update scatterplot as well ---
  updateScatterplot(gradByCode, salaryByCode, selectedYear);
}
