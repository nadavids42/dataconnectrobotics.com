// scatterplot_render.js
export function updateScatterplot(scatterSvg, gradByCode, salaryByCode, selectedYear) {
  // Prepare data
  const scatterData = Object.keys(gradByCode)
    .filter(code => salaryByCode[code] !== undefined)
    .map(code => ({
      code,
      grad: gradByCode[code],
      salary: salaryByCode[code]
    }));

  // Clear plot area
  scatterSvg.selectAll("*").remove();

  const scatterWidth = +scatterSvg.attr("viewBox").split(" ")[2];
  const scatterHeight = +scatterSvg.attr("viewBox").split(" ")[3];
  const margin = {top: 30, right: 30, bottom: 60, left: 70};

  // --- If no data, show message ---
  if (scatterData.length === 0) {
    scatterSvg.append("text")
      .attr("x", scatterWidth / 2)
      .attr("y", scatterHeight / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "#ff6600")
      .attr("font-size", "18px")
      .text("No salary data available for this year.");
    return;
  }

  // Axis domains
  const xExtent = d3.extent(scatterData, d => d.salary);
  const y = d3.scaleLinear().domain([50, 100]).range([scatterHeight - margin.bottom, margin.top]);
  const x = d3.scaleLinear().domain([xExtent[0]*0.97, xExtent[1]*1.03]).range([margin.left, scatterWidth - margin.right]);

  // Axes
  scatterSvg.append("g")
    .attr("transform", `translate(0,${scatterHeight - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d => `$${d3.format(",.0f")(d)}`));
  scatterSvg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).tickFormat(d => `${d}%`));

  scatterSvg.append("text")
    .attr("x", scatterWidth / 2)
    .attr("y", scatterHeight - 18)
    .attr("text-anchor", "middle")
    .attr("fill", "#222")
    .attr("font-size", "14px")
    .text("Average Teacher Salary");

  scatterSvg.append("text")
    .attr("x", -scatterHeight / 2)
    .attr("y", 18)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("fill", "#222")
    .attr("font-size", "14px")
    .text("Graduation Rate (%)");

  // Points
  scatterSvg.selectAll("circle")
    .data(scatterData)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.salary))
    .attr("cy", d => y(d.grad))
    .attr("r", 6)
    .attr("fill", "#009bcd")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.2)
    .attr("data-code", d => d.code);
    // (Add tooltip events here as needed)
    
  scatterSvg.append("text")
    .attr("x", scatterWidth / 2)
    .attr("y", margin.top - 12)
    .attr("text-anchor", "middle")
    .attr("font-size", "17px")
    .attr("font-weight", "bold")
    .attr("fill", "#1a3344")
    .text(`Graduation Rate vs. Salary (${selectedYear})`);
}
