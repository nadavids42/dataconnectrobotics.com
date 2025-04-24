// metrics.js
export function buildMetricLookups(allData, selectedYear) {
  const gradByCode = {};
  const salaryByCode = {};

  allData.forEach(d => {
    const code = d["District Code"].toString().trim().padStart(8, "0");
    if (+d["Year"] === selectedYear) {
      // Make sure these match your cleaned_data.csv column names
      let grad = d["grad_% Graduated"];
      let salary = d["sal_Average Salary"];

      if (typeof grad === "string") grad = grad.replace("%", "").trim();
      if (typeof salary === "string") salary = salary.replace("$", "").replace(",", "").trim();

      grad = parseFloat(grad);
      salary = parseFloat(salary);

      if (!isNaN(grad)) gradByCode[code] = grad;
      if (!isNaN(salary)) salaryByCode[code] = salary;
    }
  });

  return { gradByCode, salaryByCode };
}
