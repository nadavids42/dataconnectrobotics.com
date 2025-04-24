// scatterplot_render.js
export function updateScatterplot(
  scatterSvg,
  xByCode,
  yByCode,
  xMetricObj,
  yMetricObj,
  selectedYear,
  districts
) {
  const scatterData = Object.keys(xByCode)
    .filter(code => yByCode[code] !== undefined)
    .map(code => ({
      code,
      x: xByCode[code],
      y: yByCode[code],
      name: (districts.features.find(f => (f.properties.ORG8CODE?.toString().trim().padStart(8, "0")) === code) || {}).properties?.DISTRICT_N || "Unknown"
    }));

  scatterSvg.selectAll("*").remove();

  const scatterWidth = +scatterSvg.attr("viewBox").split(" ")[2];
  const scatterHeight = +scatterSvg.attr("viewBox").split(" ")[3];
  const margin = {top: 30, right: 30, bottom: 60, left: 70};

  if (scatterData.length === 0) {
    scatterSvg.append("text")
      .attr("x", scatterWidth / 2)
      .attr("y", scatterHeight / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "#ff6600")
      .attr("font-size", "18px")
      .text("No data available for this year.");
    return;
  }

  // Axes
  const xExtent = d3.extent(scatterData, d => d.x);
  const yExtent = d3.extent(scatterData, d => d.y);

  const x = d3.scaleLinear().domain([xExtent[0]*0.97, xExtent[1]*1.03]).range([margin.left, scatterWidth - margin.right]);
  const y = d3.scaleLinear().domain([yExtent[0]*0.97, yExtent[1]*1.03]).range([scatterHeight - margin.bottom, margin.top]);

  scatterSvg.append("g")
    .attr("transform", `translate(0,${scatterHeight - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(xMetricObj.format));

  scatterSvg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).tickFormat(yMetricObj.format));

  scatterSvg.append("text")
    .attr("x", scatterWidth / 2)
    .attr("y", scatterHeight - 18)
    .attr("text-anchor", "middle")
    .attr("fill", "#222")
    .attr("font-size", "14px")
    .text(xMetricObj.label);

  scatterSvg.append("text")
    .attr("x", -scatterHeight / 2)
    .attr("y", 18)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("fill", "#222")
    .attr("font-size", "14px")
    .text(yMetricObj.label);

  // Points
  scatterSvg.selectAll("circle")
    .data(scatterData)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.x))
    .attr("cy", d => y(d.y))
    .attr("r", 6)
    .attr("fill", "#009bcd")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.2)
    .attr("data-code", d => d.code)
    .on("mouseover", function(event, d) {
      d3.select(this).attr("fill", "#ff6600").attr("r", 10);
      let tooltip = d3.select("#scatterplot-tooltip");
      if (tooltip.empty()) {
        tooltip = d3.select("body").append("div").attr("id", "scatterplot-tooltip");
      }
      tooltip.html(
        `<strong>${d.name}</strong><br>
         ${xMetricObj.label}: ${xMetricObj.format(d.x)}<br>
         ${yMetricObj.label}: ${yMetricObj.format(d.y)}`
      )
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "#fff")
      .style("color", "#222")
      .style("border", "1px solid #ccc")
      .style("border-radius", "6px")
      .style("padding", "7px 11px")
      .style("font-size", "15px")
      .style("box-shadow", "0 1px 4
