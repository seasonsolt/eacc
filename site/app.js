// e/acc acceleration terminal — altar counter, log, price chart.
// All content comes from ./data/*.json; edit those, git push, done.
(function () {
  "use strict";

  const FALLBACK_TOKEN_RATE = 2_000_000_000; // tok/s, used if metrics.json is unreachable

  const TAG_LABELS = { model: "MODEL", culture: "CULTURE", compute: "COMPUTE", policy: "POLICY" };
  const numberFormat = new Intl.NumberFormat("en-US");
  const compactFormat = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

  const state = {
    timeline: null,
    metrics: null,
    arrivedAt: performance.now(),
  };

  // ── altar counter ──────────────────────────────────────────────────────
  function tokenRate() {
    return state.metrics?.token_rate?.tokens_per_second || FALLBACK_TOKEN_RATE;
  }

  function startCounter() {
    const el = document.getElementById("altar-count");
    if (!el) return;

    // at ~2B tok/s a per-frame render is a 10-digit strobe; tick 4x/s and
    // round the display to whole millions so only the leading digits move
    const DISPLAY_STEP = 1_000_000;
    const render = () => {
      const elapsed = (performance.now() - state.arrivedAt) / 1000;
      const value = Math.floor((elapsed * tokenRate()) / DISPLAY_STEP) * DISPLAY_STEP;
      el.textContent = numberFormat.format(value);
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    render();
    setInterval(render, reduced ? 1000 : 250);
  }

  function renderRateLine() {
    if (!state.metrics) return;
    const { tokens_per_second, note, source_url } = state.metrics.token_rate;
    const value = document.getElementById("altar-rate-value");
    const source = document.getElementById("altar-rate-source");
    if (value) value.textContent = `≈ ${compactFormat.format(tokens_per_second)} tok/s`;
    if (source) {
      source.href = source_url;
      source.title = note;
    }
  }

  // ── metrics strip ──────────────────────────────────────────────────────
  function renderMetrics() {
    const daysEl = document.getElementById("metric-days");
    const priceEl = document.getElementById("metric-price");
    const rateEl = document.getElementById("metric-rate");

    if (daysEl && state.timeline) {
      const frontierDates = state.timeline.events
        .filter((e) => e.frontier)
        .map((e) => new Date(e.date + "T00:00:00Z").getTime());
      if (frontierDates.length) {
        const days = Math.max(0, Math.floor((Date.now() - Math.max(...frontierDates)) / 86_400_000));
        daysEl.textContent = String(days);
      }
    }

    if (priceEl && state.metrics) {
      const pts = state.metrics.price_series.points;
      const factor = pts[0].usd_per_mtok / pts[pts.length - 1].usd_per_mtok;
      priceEl.textContent = `${Math.round(factor)}×`;
    }

    if (rateEl) rateEl.textContent = compactFormat.format(tokenRate());
  }

  // ── acceleration log ───────────────────────────────────────────────────
  function renderLog() {
    const list = document.getElementById("log-list");
    if (!list || !state.timeline) return;

    const events = [...state.timeline.events].sort((a, b) => b.date.localeCompare(a.date));

    list.replaceChildren(
      ...events.map((event) => {
        const li = document.createElement("li");
        li.className = "log-entry";
        if (event.frontier) li.dataset.frontier = "true";

        const date = document.createElement("span");
        date.className = "log-date";
        date.textContent = event.date;

        const tag = document.createElement("span");
        tag.className = `log-tag log-tag--${event.type}`;
        tag.textContent = TAG_LABELS[event.type] || event.type.toUpperCase();

        const body = document.createElement("div");
        const title = document.createElement("p");
        title.className = "log-title";
        const link = document.createElement("a");
        link.href = event.source_url;
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = event.title;
        title.append(link);
        const detail = document.createElement("p");
        detail.className = "log-detail";
        detail.textContent = event.detail;
        body.append(title, detail);

        li.append(date, tag, body);
        return li;
      })
    );
  }

  // ── price chart (hand-rolled log-scale SVG) ────────────────────────────
  function renderChart() {
    const host = document.getElementById("price-chart");
    if (!host || !state.metrics) return;

    const points = state.metrics.price_series.points;
    const W = 720;
    const H = 340;
    const PAD = { top: 24, right: 24, bottom: 34, left: 64 };

    const toTime = (ym) => new Date(ym + "-01T00:00:00Z").getTime();
    const t0 = toTime(points[0].date);
    const t1 = toTime(points[points.length - 1].date);
    const span = t1 - t0 || 1; // single-month series must not divide by zero
    // derive the log domain from the data: 0.3 log-units of bottom padding keeps
    // the cheapest point's dot and below-the-line label clear of the year ticks
    const logs = points.map((p) => Math.log10(p.usd_per_mtok));
    const yMax = Math.max(2, Math.ceil(Math.max(...logs)));
    const yMin = Math.floor((Math.min(...logs) - 0.3) * 10) / 10;

    const x = (t) => PAD.left + ((t - t0) / span) * (W - PAD.left - PAD.right);
    const y = (usd) => {
      const v = Math.log10(usd);
      return PAD.top + ((yMax - v) / (yMax - yMin)) * (H - PAD.top - PAD.bottom);
    };

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.setAttribute("aria-hidden", "true");

    const make = (name, attrs, textContent) => {
      const el = document.createElementNS(svgNS, name);
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
      if (textContent !== undefined) el.textContent = textContent;
      return el;
    };

    // glow filter for the phosphor line
    const defs = make("defs", {});
    const filter = make("filter", { id: "phosphor-glow", x: "-30%", y: "-30%", width: "160%", height: "160%" });
    filter.append(make("feGaussianBlur", { stdDeviation: 3, in: "SourceGraphic", result: "blur" }));
    const merge = make("feMerge", {});
    merge.append(make("feMergeNode", { in: "blur" }), make("feMergeNode", { in: "SourceGraphic" }));
    filter.append(merge);
    defs.append(filter);
    svg.append(defs);

    // horizontal gridlines at powers of ten
    for (let p = yMax; p >= Math.ceil(yMin); p -= 1) {
      const gy = y(10 ** p);
      svg.append(
        make("line", { x1: PAD.left, y1: gy, x2: W - PAD.right, y2: gy, stroke: "#0d2d1c", "stroke-width": 1 })
      );
      const label = p >= 0 ? `$${10 ** p}` : `$${(10 ** p).toFixed(-p)}`;
      svg.append(
        make(
          "text",
          { x: PAD.left - 8, y: gy + 4, "text-anchor": "end", fill: "#7da68a", "font-size": 12, "font-family": "inherit" },
          label
        )
      );
    }

    // x-axis year ticks
    const startYear = new Date(t0).getUTCFullYear();
    const endYear = new Date(t1).getUTCFullYear();
    for (let yr = startYear; yr <= endYear; yr += 1) {
      // clamp the first year label to the chart edge (series starts mid-year)
      const tx = Math.max(x(Date.UTC(yr, 0, 1)), PAD.left);
      svg.append(
        make(
          "text",
          { x: tx, y: H - 10, "text-anchor": "middle", fill: "#7da68a", "font-size": 12, "font-family": "inherit" },
          String(yr)
        )
      );
    }

    // the line itself
    const path = points
      .map((p, i) => `${i === 0 ? "M" : "L"}${x(toTime(p.date)).toFixed(1)},${y(p.usd_per_mtok).toFixed(1)}`)
      .join(" ");
    svg.append(
      make("path", {
        d: path,
        fill: "none",
        stroke: "#33ff66",
        "stroke-width": 2.5,
        "stroke-linejoin": "round",
        filter: "url(#phosphor-glow)",
      })
    );

    // data points + model labels, alternating above/below the line
    points.forEach((p, i) => {
      const px = x(toTime(p.date));
      const py = y(p.usd_per_mtok);
      svg.append(make("circle", { cx: px, cy: py, r: 3.5, fill: "#a4ffc0" }));
      const above = i % 2 === 0;
      const anchor = i === points.length - 1 ? "end" : i === 0 ? "start" : "middle";
      svg.append(
        make(
          "text",
          {
            x: px,
            y: above ? py - 12 : py + 20,
            "text-anchor": anchor,
            fill: "#c2dfc9",
            "font-size": 11,
            "font-family": "inherit",
          },
          p.model
        )
      );
    });

    host.replaceChildren(svg);
    // keep the accessible description in sync with the actual data
    const first = points[0];
    const last = points[points.length - 1];
    host.setAttribute(
      "aria-label",
      `Log-scale chart: price of GPT-4-class intelligence falling from $${first.usd_per_mtok} (${first.model}) to $${last.usd_per_mtok} (${last.model}) per million tokens`
    );

    const caption = document.getElementById("price-caption");
    if (caption) {
      caption.textContent = `${state.metrics.price_series.label} · data as of ${state.metrics.updated}`;
    }
  }

  // ── subscribe forms: soft-fail while the Buttondown account is pending ──
  function guardPlaceholderForms() {
    document.querySelectorAll("form[action*='REPLACE_WITH_BUTTONDOWN_USERNAME']").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        let hint = form.querySelector(".prompt-hint");
        if (!hint) {
          hint = document.createElement("p");
          hint.className = "prompt-hint";
          form.append(hint);
        }
        hint.textContent = "// subscriptions open shortly — the altar is still warming up.";
      });
    });
  }

  // ── boot ───────────────────────────────────────────────────────────────
  async function loadJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
    return res.json();
  }

  // one broken renderer (e.g. a hand-edited JSON with a bad shape) must not
  // take down the other sections or the counter's rAF loop
  function safely(label, fn) {
    try {
      fn();
    } catch (err) {
      console.error(`eacc: ${label} failed`, err);
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    startCounter(); // runs on fallback rate until metrics load
    guardPlaceholderForms();

    const [timeline, metrics] = await Promise.allSettled([
      loadJSON("./data/timeline.json"),
      loadJSON("./data/metrics.json"),
    ]);

    if (timeline.status === "fulfilled") {
      state.timeline = timeline.value;
    } else {
      document.getElementById("log-fallback")?.removeAttribute("hidden");
    }
    if (metrics.status === "fulfilled") {
      state.metrics = metrics.value;
    } else {
      document.getElementById("price-fallback")?.removeAttribute("hidden");
      // don't announce a chart that isn't there
      document.getElementById("price-chart")?.setAttribute("aria-hidden", "true");
    }

    safely("rate line", renderRateLine);
    safely("metrics strip", renderMetrics);
    safely("log", renderLog);
    safely("chart", renderChart);
  });
})();
