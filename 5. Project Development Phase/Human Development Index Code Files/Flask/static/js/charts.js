window.HDICharts = {
  destroy(chart) {
    if (chart) chart.destroy();
  },

  getThemeColors() {
    const dark = document.documentElement.classList.contains("dark");
    return {
      text: dark ? "#e2e8f0" : "#334155",
      grid: dark ? "rgba(148,163,184,0.12)" : "rgba(148,163,184,0.25)",
      tooltipBg: dark ? "#1e293b" : "#ffffff",
    };
  },

  createRadialChart(canvasId, score, color) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    const pct = Math.round(score * 100);
    return new Chart(ctx, {
      type: "doughnut",
      data: {
        datasets: [{
          data: [pct, 100 - pct],
          backgroundColor: [color, "rgba(148,163,184,0.15)"],
          borderWidth: 0,
          circumference: 270,
          rotation: 225,
        }],
      },
      options: {
        cutout: "78%",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
      },
    });
  },

  createComponentBarChart(canvasId, components) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    const theme = this.getThemeColors();
    return new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Health", "Education", "Income"],
        datasets: [{
          label: "Component Index",
          data: [
            components.life_expectancy_index * 100,
            components.education_index * 100,
            components.income_index * 100,
          ],
          backgroundColor: [
            "rgba(16, 185, 129, 0.75)",
            "rgba(59, 130, 246, 0.75)",
            "rgba(245, 158, 11, 0.75)",
          ],
          borderRadius: 10,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { color: theme.text, callback: (v) => v + "%" },
            grid: { color: theme.grid },
          },
          x: {
            ticks: { color: theme.text },
            grid: { display: false },
          },
        },
        plugins: {
          legend: { display: false },
        },
      },
    });
  },

  createRadarChart(canvasId, components) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    const theme = this.getThemeColors();
    return new Chart(ctx, {
      type: "radar",
      data: {
        labels: ["Health", "Education", "Income"],
        datasets: [{
          label: "Development Profile",
          data: [
            components.life_expectancy_index,
            components.education_index,
            components.income_index,
          ],
          backgroundColor: "rgba(99, 102, 241, 0.25)",
          borderColor: "#6366f1",
          pointBackgroundColor: "#6366f1",
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 1,
            ticks: { display: false, stepSize: 0.2 },
            grid: { color: theme.grid },
            pointLabels: { color: theme.text, font: { size: 12 } },
          },
        },
        plugins: { legend: { display: false } },
      },
    });
  },

  createBatchChart(canvasId, predictions) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    const theme = this.getThemeColors();
    const labels = predictions.map((p) => p.label);
    const scores = predictions.map((p) => p.hdi_score);
    const colors = predictions.map((p) => p.color + "cc");

    return new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "HDI Score",
          data: scores,
          backgroundColor: colors,
          borderRadius: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: labels.length > 6 ? "y" : "x",
        scales: {
          y: {
            beginAtZero: true,
            max: 1,
            ticks: { color: theme.text },
            grid: { color: theme.grid },
          },
          x: {
            ticks: { color: theme.text, maxRotation: 45 },
            grid: { display: false },
          },
        },
        plugins: { legend: { display: false } },
      },
    });
  },
};
