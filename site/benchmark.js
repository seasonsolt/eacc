// Benchmark scatter interaction: hover/focus a series to isolate it, click a
// legend entry to toggle a vendor. Pure progressive enhancement — the SVG is
// fully rendered server-side and readable with JS off.
(function () {
  "use strict";
  const chart = document.getElementById("bench-chart");
  const readout = document.getElementById("bench-readout");
  if (!chart) return;

  const defaultText = readout ? readout.textContent : "";
  const series = [...chart.querySelectorAll(".bench-series")];

  const activate = (el) => {
    chart.classList.add("is-hovering");
    series.forEach((s) => s.classList.toggle("is-active", s === el));
    if (readout && el) {
      readout.replaceChildren();
      const name = document.createElement("strong");
      name.textContent = el.dataset.model || "";
      readout.append(name);
      for (const entry of (el.dataset.readout || "").split(";").filter(Boolean)) {
        const [effort, pass, cost] = entry.split("|");
        const span = document.createElement("span");
        const eff = document.createElement("span");
        eff.className = "bench-eff";
        eff.textContent = effort;
        span.append(eff, ` ${pass}% · $${cost}`);
        readout.append(span);
      }
    }
  };
  const clear = () => {
    chart.classList.remove("is-hovering");
    series.forEach((s) => s.classList.remove("is-active"));
    if (readout) readout.textContent = defaultText;
  };

  series.forEach((s) => {
    s.addEventListener("mouseenter", () => activate(s));
    s.addEventListener("focusin", () => activate(s));
  });
  chart.addEventListener("mouseleave", clear);
  chart.addEventListener("focusout", (e) => {
    if (!chart.contains(e.relatedTarget)) clear();
  });

  // legend toggles a whole vendor
  document.querySelectorAll(".bench-legend button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const on = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", String(!on));
      series
        .filter((s) => s.dataset.vendor === btn.dataset.vendor)
        .forEach((s) => (s.style.display = on ? "none" : ""));
    });
  });
})();
