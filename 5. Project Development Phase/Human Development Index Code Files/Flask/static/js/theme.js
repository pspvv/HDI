(function () {
  const storageKey = "hdi-theme";
  const root = document.documentElement;

  function applyTheme(theme) {
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(storageKey, theme);
    updateToggleIcon(theme);
  }

  function updateToggleIcon(theme) {
    const sun = document.getElementById("icon-sun");
    const moon = document.getElementById("icon-moon");
    if (!sun || !moon) return;
    if (theme === "dark") {
      sun.classList.remove("hidden");
      moon.classList.add("hidden");
    } else {
      sun.classList.add("hidden");
      moon.classList.remove("hidden");
    }
  }

  function initTheme() {
    const saved = localStorage.getItem(storageKey);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    const toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const next = root.classList.contains("dark") ? "light" : "dark";
        applyTheme(next);
      });
    }
  });
})();
