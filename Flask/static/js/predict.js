(function () {
  const form = document.getElementById("predict-form");
  if (!form) return;

  const alertBox = document.getElementById("alert-box");
  const loadingOverlay = document.getElementById("loading-overlay");
  const resultsPanel = document.getElementById("dynamic-results");
  const dropzone = document.getElementById("csv-dropzone");
  const csvInput = document.getElementById("csv-file");
  const batchResults = document.getElementById("batch-results");

  let radialChart = null;
  let barChart = null;
  let radarChart = null;
  let batchChart = null;

  const rules = {
    life_expectancy: { min: 0.1, max: 120, label: "Life expectancy" },
    expected_schooling: { min: 0, max: 25, label: "Expected schooling" },
    mean_schooling: { min: 0, max: 25, label: "Mean schooling" },
    gni_per_capita: { min: 0.01, max: Infinity, label: "GNI per capita" },
  };

  function showAlert(message, type) {
    if (!alertBox) return;
    const styles = type === "error"
      ? "bg-red-500/10 border-red-400/40 text-red-700 dark:text-red-300"
      : "bg-emerald-500/10 border-emerald-400/40 text-emerald-700 dark:text-emerald-300";
    alertBox.innerHTML = `
      <div class="alert-enter rounded-xl border px-4 py-3 ${styles} flex items-start gap-3">
        <span class="text-lg">${type === "error" ? "⚠️" : "✅"}</span>
        <p class="text-sm font-medium">${message}</p>
      </div>`;
    alertBox.classList.remove("hidden");
  }

  function hideAlert() {
    if (alertBox) {
      alertBox.classList.add("hidden");
      alertBox.innerHTML = "";
    }
  }

  function setLoading(active) {
    if (loadingOverlay) {
      loadingOverlay.classList.toggle("hidden", !active);
    }
  }

  function validateField(name, value) {
    const rule = rules[name];
    const input = document.getElementById(name);
    const errorEl = document.getElementById(`${name}-error`);
    const num = parseFloat(value);

    if (!value || Number.isNaN(num)) {
      input?.classList.add("invalid");
      if (errorEl) errorEl.textContent = `${rule.label} is required.`;
      return false;
    }
    if (num < rule.min || num > rule.max) {
      input?.classList.add("invalid");
      if (errorEl) {
        errorEl.textContent = rule.max === Infinity
          ? `${rule.label} must be positive.`
          : `${rule.label} must be between ${rule.min} and ${rule.max}.`;
      }
      return false;
    }

    input?.classList.remove("invalid");
    if (errorEl) errorEl.textContent = "";
    return true;
  }

  function validateForm() {
    let valid = true;
    Object.keys(rules).forEach((name) => {
      const field = form.elements[name];
      if (!validateField(name, field.value)) valid = false;
    });
    return valid;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function renderProgressBars(components) {
    const items = [
      { label: "Health Index", value: components.life_expectancy_index, color: "bg-emerald-500" },
      { label: "Education Index", value: components.education_index, color: "bg-blue-500" },
      { label: "Income Index", value: components.income_index, color: "bg-amber-500" },
    ];
    return items.map((item) => `
      <div>
        <div class="flex justify-between text-sm mb-1">
          <span class="text-slate-600 dark:text-slate-300">${item.label}</span>
          <span class="font-semibold text-slate-800 dark:text-slate-100">${Math.round(item.value * 100)}%</span>
        </div>
        <div class="h-2.5 rounded-full bg-slate-200/70 dark:bg-slate-700/70 overflow-hidden">
          <div class="progress-bar h-full rounded-full ${item.color}" style="width: 0%" data-width="${item.value * 100}%"></div>
        </div>
      </div>`).join("");
  }

  function renderDynamicResult(data) {
    if (!resultsPanel) return;
    const { hdi_score, category, color, confidence, input, components } = data;

    resultsPanel.innerHTML = `
      <div class="animate-fade-in-up glass-card rounded-2xl p-6 md:p-8 mt-8">
        <div class="flex flex-col lg:flex-row gap-8">
          <div class="lg:w-1/3 text-center">
            <div class="relative mx-auto w-48 h-48">
              <canvas id="radial-chart"></canvas>
              <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span class="text-4xl font-bold" style="color:${color}">${hdi_score}</span>
                <span class="text-sm text-slate-500 dark:text-slate-400">HDI Score</span>
              </div>
            </div>
            <p class="mt-4 text-xl font-semibold" style="color:${color}">${category} Development</p>
            <div class="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
              <span>Model confidence</span>
              <strong>${confidence}%</strong>
            </div>
          </div>
          <div class="lg:w-2/3 space-y-6">
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="rounded-xl bg-white/50 dark:bg-slate-800/40 p-4 border border-white/30 dark:border-slate-700/50">
                <p class="text-xs uppercase tracking-wide text-slate-500">Life Expectancy</p>
                <p class="text-2xl font-bold text-slate-800 dark:text-white">${input.life_expectancy} yrs</p>
              </div>
              <div class="rounded-xl bg-white/50 dark:bg-slate-800/40 p-4 border border-white/30 dark:border-slate-700/50">
                <p class="text-xs uppercase tracking-wide text-slate-500">Expected Schooling</p>
                <p class="text-2xl font-bold text-slate-800 dark:text-white">${input.expected_schooling} yrs</p>
              </div>
              <div class="rounded-xl bg-white/50 dark:bg-slate-800/40 p-4 border border-white/30 dark:border-slate-700/50">
                <p class="text-xs uppercase tracking-wide text-slate-500">Mean Schooling</p>
                <p class="text-2xl font-bold text-slate-800 dark:text-white">${input.mean_schooling} yrs</p>
              </div>
              <div class="rounded-xl bg-white/50 dark:bg-slate-800/40 p-4 border border-white/30 dark:border-slate-700/50">
                <p class="text-xs uppercase tracking-wide text-slate-500">GNI Per Capita</p>
                <p class="text-2xl font-bold text-slate-800 dark:text-white">${formatCurrency(input.gni_per_capita)}</p>
              </div>
            </div>
            <div class="space-y-3">${renderProgressBars(components)}</div>
          </div>
        </div>
        <div class="grid md:grid-cols-2 gap-6 mt-8">
          <div class="chart-container rounded-xl bg-white/40 dark:bg-slate-800/30 p-4">
            <h4 class="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-200">Component Breakdown</h4>
            <canvas id="bar-chart"></canvas>
          </div>
          <div class="chart-container rounded-xl bg-white/40 dark:bg-slate-800/30 p-4">
            <h4 class="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-200">Development Radar</h4>
            <canvas id="radar-chart"></canvas>
          </div>
        </div>
      </div>`;

    resultsPanel.classList.remove("hidden");
    resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });

    requestAnimationFrame(() => {
      document.querySelectorAll(".progress-bar").forEach((bar) => {
        bar.style.width = bar.dataset.width;
      });

      HDICharts.destroy(radialChart);
      HDICharts.destroy(barChart);
      HDICharts.destroy(radarChart);
      radialChart = HDICharts.createRadialChart("radial-chart", hdi_score, color);
      barChart = HDICharts.createComponentBarChart("bar-chart", components);
      radarChart = HDICharts.createRadarChart("radar-chart", components);
    });
  }

  async function submitPrediction(event) {
    event.preventDefault();
    hideAlert();
    if (!validateForm()) {
      showAlert("Please fix the highlighted fields before submitting.", "error");
      return;
    }

    const payload = {
      life_expectancy: form.elements.life_expectancy.value,
      expected_schooling: form.elements.expected_schooling.value,
      mean_schooling: form.elements.mean_schooling.value,
      gni_per_capita: form.elements.gni_per_capita.value,
    };

    setLoading(true);
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.errors?.[0] || data.error || "Prediction failed.");
      }
      showAlert("Prediction completed successfully!", "success");
      renderDynamicResult(data);
    } catch (error) {
      showAlert(error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  function renderBatchResults(data) {
    if (!batchResults) return;
    const rows = data.predictions.map((p) => `
      <tr class="border-b border-slate-200/60 dark:border-slate-700/60 hover:bg-indigo-500/5 transition-colors">
        <td class="py-3 px-4 font-medium">${p.label}</td>
        <td class="py-3 px-4"><span class="font-bold" style="color:${p.color}">${p.hdi_score}</span></td>
        <td class="py-3 px-4">${p.category}</td>
        <td class="py-3 px-4">${p.confidence}%</td>
      </tr>`).join("");

    batchResults.innerHTML = `
      <div class="animate-fade-in-up glass-card rounded-2xl p-6 mt-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white">Batch Predictions (${data.total})</h3>
          ${data.errors.length ? `<span class="text-sm text-amber-600">${data.errors.length} rows skipped</span>` : ""}
        </div>
        <div class="overflow-x-auto rounded-xl border border-white/20 dark:border-slate-700/50 mb-6">
          <table class="w-full text-sm text-left">
            <thead class="bg-indigo-500/10 text-slate-600 dark:text-slate-300">
              <tr>
                <th class="py-3 px-4">Country / Row</th>
                <th class="py-3 px-4">HDI Score</th>
                <th class="py-3 px-4">Category</th>
                <th class="py-3 px-4">Confidence</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="chart-container rounded-xl bg-white/40 dark:bg-slate-800/30 p-4">
          <canvas id="batch-chart"></canvas>
        </div>
      </div>`;

    batchResults.classList.remove("hidden");
    HDICharts.destroy(batchChart);
    batchChart = HDICharts.createBatchChart("batch-chart", data.predictions);
  }

  async function uploadCsv(file) {
    hideAlert();
    if (!file.name.toLowerCase().endsWith(".csv")) {
      showAlert("Please upload a valid CSV file.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);

    try {
      const response = await fetch("/api/predict/csv", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "CSV processing failed.");
      }
      showAlert(`Processed ${data.total} predictions from CSV.`, "success");
      renderBatchResults(data);
    } catch (error) {
      showAlert(error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  // Country Dropdown Loading and Auto-fill
  const countrySelect = document.getElementById("country_select");
  if (countrySelect) {
    fetch("/api/countries")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.countries) {
          data.countries.forEach((c) => {
            const opt = document.createElement("option");
            opt.value = c.country;
            opt.textContent = c.country;
            opt.dataset.le = c.life_expectancy;
            opt.dataset.eys = c.expected_schooling;
            opt.dataset.mys = c.mean_schooling;
            opt.dataset.gni = c.gni_per_capita;
            countrySelect.appendChild(opt);
          });
        }
      })
      .catch((err) => console.error("Error fetching countries:", err));

    countrySelect.addEventListener("change", () => {
      const opt = countrySelect.options[countrySelect.selectedIndex];
      if (opt && opt.value) {
        form.elements.life_expectancy.value = opt.dataset.le;
        form.elements.expected_schooling.value = opt.dataset.eys;
        form.elements.mean_schooling.value = opt.dataset.mys;
        form.elements.gni_per_capita.value = opt.dataset.gni;

        // Clear previous error styles
        Object.keys(rules).forEach((name) => {
          const input = form.elements[name];
          if (input) {
            input.classList.remove("invalid");
            const errEl = document.getElementById(`${name}-error`);
            if (errEl) errEl.textContent = "";
          }
        });
      }
    });
  }

  form.addEventListener("submit", submitPrediction);
  Object.keys(rules).forEach((name) => {
    const field = form.elements[name];
    field?.addEventListener("blur", () => validateField(name, field.value));
    field?.addEventListener("input", () => {
      if (field.classList.contains("invalid")) validateField(name, field.value);
    });
  });

  if (dropzone && csvInput) {
    dropzone.addEventListener("click", () => csvInput.click());
    csvInput.addEventListener("change", (e) => {
      if (e.target.files[0]) uploadCsv(e.target.files[0]);
    });
    ["dragenter", "dragover"].forEach((evt) => {
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
      });
    });
    ["dragleave", "drop"].forEach((evt) => {
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
      });
    });
    dropzone.addEventListener("drop", (e) => {
      const file = e.dataTransfer.files[0];
      if (file) uploadCsv(file);
    });
  }
})();
