// load_data.js
export function loadData() {
  return Promise.all([
    d3.json("/data/SchoolDistricts_poly.geojson"),
    d3.csv("/data/Cleaned_data.csv")
  ]);
}
