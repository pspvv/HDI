document.addEventListener("DOMContentLoaded", () => {
  const radialEl = document.getElementById("result-radial-chart");
  const barEl = document.getElementById("result-bar-chart");
  const radarEl = document.getElementById("result-radar-chart");

  if (!radialEl) return;

  const score = parseFloat(radialEl.dataset.score);
  const color = radialEl.dataset.color;
  const components = {
    life_expectancy_index: parseFloat(radialEl.dataset.health),
    education_index: parseFloat(radialEl.dataset.education),
    income_index: parseFloat(radialEl.dataset.income),
  };

  HDICharts.createRadialChart("result-radial-chart", score, color);
  HDICharts.createComponentBarChart("result-bar-chart", components);
  HDICharts.createRadarChart("result-radar-chart", components);

  document.querySelectorAll(".progress-bar").forEach((bar) => {
    requestAnimationFrame(() => {
      bar.style.width = bar.dataset.width;
    });
  });
});
