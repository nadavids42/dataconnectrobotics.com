export const METRICS = [
  { key: "grad",      label: "Graduation Rate",     col: "grad_% Graduated", legend: "percent", format: d => d == null ? "N/A" : d.toFixed(1) + "%" },
  { key: "salary",    label: "Average Salary",      col: "sal_Average Salary", legend: "dollars", format: d => d == null ? "N/A" : "$" + d3.format(",.0f")(d) },
  { key: "mcas_ela",  label: "MCAS ELA",            col: "mcas_MCAS_Avg. Scaled Score_ELA", legend: "test", format: d => d == null ? "N/A" : d.toFixed(1) },
  { key: "mcas_math", label: "MCAS Math",           col: "mcas_MCAS_Avg. Scaled Score_MATH", legend: "test", format: d => d == null ? "N/A" : d.toFixed(1) },
  { key: "sat_math",  label: "SAT Math Score",      col: "sat_Math", legend: "test", format: d => d == null ? "N/A" : d.toFixed(1) },
  { key: "sat_read",  label: "SAT Reading Score",   col: "sat_Reading_Merged", legend: "test", format: d => d == null ? "N/A" : d.toFixed(1) },
  { key: "expend_pp", label: "Expenditures/Pupil",  col: "expend_In-District Expenditures per Pupil", legend: "dollars", format: d => d == null ? "N/A" : "$" + d3.format(",.0f")(d) }
];

// Universal code-based lookup for any metric/column:
export function buildLookupByCode(allData, colName, selectedYear) {
  const lookup = {};
  allData.forEach(d => {
    const code = d["District Code"].toString().padStart(8, "0");
    if (+d["Year"] === selectedYear) {
      let val = d[colName];
      if (typeof val === "string") {
        val = val.replace("$", "").replace(",", "").replace("%", "").trim();
      }
      val = parseFloat(val);
      if (!isNaN(val)) lookup[code] = val;
    }
  });
  return lookup;
}
