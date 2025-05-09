// scatterplot_render.js
let selectedDistrict = null;  // <-- Track selected district globally

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
    .filter(code => {
      const feature = districts.features.find(f => (f.properties.ORG8CODE?.toString().trim().padStart(8, "0")) === code);
      return feature && feature.properties?.DISTRICT_N && feature.properties.DISTRICT_N !== "Unknown";
    })
    .map(code => ({
      code,
      x: xByCode[code],
      y: yByCode[code],
      name: districts.features.find(f => (f.properties.ORG8CODE?.toString().trim().padStart(8, "0")) === code).properties.DISTRICT_N
    }));

  scatterSvg.selectAll("*").remove();

  const scatterWidth = +scatterSvg.attr("viewBox").split(" ")[2];
  const scatterHeight = +scatterSvg.attr("viewBox").split(" ")[3];
  const margin = { top: 30, right: 30, bottom: 60, left: 70 };

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

  const xExtent = d3.extent(scatterData, d => d.x);
  const yExtent = d3.extent(scatterData, d => d.y);

  const x = d3.scaleLinear().domain([xExtent[0] * 0.97, xExtent[1] * 1.03]).range([margin.left, scatterWidth - margin.right]);
  const y = d3.scaleLinear().domain([yExtent[0] * 0.97, yExtent[1] * 1.03]).range([scatterHeight - margin.bottom, margin.top]);

  // Axes
  const xAxis = d3.axisBottom(x);
  if (xMetricObj.label === "Average Salary") {
    xAxis
    .ticks(6)  // or .tickValues([40000, 50000, 60000, 70000, 80000])
    .tickFormat(d => `$${d / 1000}k`);
  } else {
    xAxis.tickFormat(xMetricObj.format);
  }

scatterSvg.append("g")
  .attr("transform", `translate(0,${scatterHeight - margin.bottom})`)
  .call(xAxis);

  scatterSvg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).tickFormat(yMetricObj.format));

  // Axis labels
  scatterSvg.append("text")
    .attr("x", scatterWidth / 2)
    .attr("y", scatterHeight - 18)
    .attr("text-anchor", "middle")
    .attr("fill", "#ff6600")
    .attr("font-size", "14px")
    .text(xMetricObj.label);

  scatterSvg.append("text")
    .attr("x", -scatterHeight / 2)
    .attr("y", 18)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("fill", "#ff6600")
    .attr("font-size", "14px")
    .text(yMetricObj.label);

  // Trend line calculation
  const n = scatterData.length;
  const sumX = d3.sum(scatterData, d => d.x);
  const sumY = d3.sum(scatterData, d => d.y);
  const sumXY = d3.sum(scatterData, d => d.x * d.y);
  const sumX2 = d3.sum(scatterData, d => d.x * d.x);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const xMin = x.domain()[0];
  const xMax = x.domain()[1];

  const linePoints = [
    { x: xMin, y: slope * xMin + intercept },
    { x: xMax, y: slope * xMax + intercept }
  ];

  scatterSvg.append("line")
    .attr("x1", x(linePoints[0].x))
    .attr("y1", y(linePoints[0].y))
    .attr("x2", x(linePoints[1].x))
    .attr("y2", y(linePoints[1].y))
    .attr("stroke", "#ff6600")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "4 4");

  // Data points
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
    .on("mouseover", function (event, d) {
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
        .style("box-shadow", "0 1px 4px #0002")
        .style("left", (event.pageX + 18) + "px")
        .style("top", (event.pageY - 10) + "px")
        .style("display", "block");
    })
    .on("mousemove", function (event) {
      d3.select("#scatterplot-tooltip")
        .style("left", (event.pageX + 18) + "px")
        .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseleave", function (event, d) {
      d3.select(this).attr("fill", "#009bcd").attr("r", 6);
      d3.select("#scatterplot-tooltip").remove();
    })
    .on("click", function (event, d) {
  const isSame = selectedDistrict === d.code;

  // Clear previous selection if switching
  d3.selectAll("#map g.districts path")
    .attr("stroke", "#333")
    .attr("stroke-width", 1);

  d3.selectAll("circle")
    .attr("fill", "#009bcd")
    .attr("r", 6);

  if (isSame) {
    // Deselect if clicked again
    selectedDistrict = null;
    document.getElementById("info-box").style.display = "none";
    return;
  }

  // Update global selection
  selectedDistrict = d.code;

  // Highlight map
  d3.select(`#map g.districts path[data-code='${d.code}']`)
    .attr("stroke", "#ff6600")
    .attr("stroke-width", 4);

  // Highlight this point
  d3.select(this)
    .attr("fill", "#ff6600")
    .attr("r", 10);

  // Update info box
  const infoBox = document.getElementById("info-box");
  infoBox.innerHTML = `
    <h3 style="margin-top: 0">${d.name || "Unknown District"}</h3>
    <p><strong>District Code:</strong> ${d.code}</p>
    <p><strong>${xMetricObj.label}:</strong> ${xMetricObj.format(d.x)}</p>
    <p><strong>${yMetricObj.label}:</strong> ${yMetricObj.format(d.y)}</p>
  `;
  infoBox.style.display = "block";
});


  // Title
  scatterSvg.append("text")
    .attr("x", scatterWidth / 2)
    .attr("y", margin.top - 12)
    .attr("text-anchor", "middle")
    .attr("font-size", "17px")
    .attr("font-weight", "bold")
    .attr("fill", "#2b97e0")
    .text(`${xMetricObj.label} vs. ${yMetricObj.label} (${selectedYear})`);
}
