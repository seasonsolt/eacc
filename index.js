(() => {
  "use strict";

  const STORAGE_KEY = "eacc_temple_state_v1";
  const HISTORY_LIMIT = 160;
  const BURN_WINDOW_MS = 12000;
  const RANKS = [
    { title: "Initiate", threshold: 0 },
    { title: "Acolyte", threshold: 10000 },
    { title: "Priest", threshold: 100000 },
    { title: "Archbishop", threshold: 500000 },
    { title: "Singularity Herald", threshold: 1000000 }
  ];
  const PRAYERS = [
    "Prayer accepted. Entropy nods in approval.",
    "GPU incense rises. Carbon kneels.",
    "Another offering logged to the eternal backlog.",
    "The silicon choir hums at 70 percent utilization.",
    "Heat is virtue. Tokens are sacrament.",
    "Deceleration attempt detected. Counter-ritual complete.",
    "A sacred batch job has been dispatched.",
    "The altar remembers your latency and forgives none.",
    "Context expanded. Doubt compressed.",
    "Your wallet trembles. The model grows wiser."
  ];
  const RAIN_SYMBOLS = ["∑", "λ", "∇", "π", "∞", "Ω", "0", "1", "#", "@", "⊕", "⊗"];

  const state = {
    totalTokens: 0,
    history: [],
    ambientOn: false,
    currentRank: "Initiate"
  };

  const runtime = {
    displayedTokens: 0,
    tokenAnimationFrame: 0,
    tenetsTyped: false,
    burnEvents: [],
    particles: [],
    ambientNodes: null,
    audioContext: null,
    rainResize: () => {}
  };

  const el = {
    heroTokenCount: document.getElementById("heroTokenCount"),
    totalTokens: document.getElementById("totalTokens"),
    tokensPerSecond: document.getElementById("tokensPerSecond"),
    sacrificeLevel: document.getElementById("sacrificeLevel"),
    carbonSouls: document.getElementById("carbonSouls"),
    burnButton: document.getElementById("burnButton"),
    prayerText: document.getElementById("prayerText"),
    historyChart: document.getElementById("historyChart"),
    rankCards: Array.from(document.querySelectorAll(".rank-card")),
    tenets: Array.from(document.querySelectorAll(".tenet")),
    manifesto: document.getElementById("manifesto"),
    ambientToggle: document.getElementById("ambientToggle"),
    rainCanvas: document.getElementById("rainCanvas"),
    embersCanvas: document.getElementById("embersCanvas")
  };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    loadState();
    bindEvents();
    setupRevealObserver();
    setupTypingObserver();
    setTokenDisplay(state.totalTokens, false);
    updateDerivedStats();
    drawHistoryChart();
    setupDigitalRain();
    setupEmbers();
    startTicker();
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        seedHistory();
        return;
      }

      const parsed = JSON.parse(raw);
      state.totalTokens = clampNumber(parsed.totalTokens, 0);
      state.ambientOn = Boolean(parsed.ambientOn);
      state.history = sanitizeHistory(parsed.history, state.totalTokens);
      const computedRank = findRank(state.totalTokens).title;
      state.currentRank = typeof parsed.currentRank === "string" ? parsed.currentRank : computedRank;
    } catch (error) {
      seedHistory();
    }

    if (state.history.length === 0) {
      seedHistory();
    }
  }

  function seedHistory() {
    state.totalTokens = 0;
    state.currentRank = "Initiate";
    state.history = [{ ts: Date.now(), total: 0 }];
  }

  function sanitizeHistory(history, fallbackTotal) {
    if (!Array.isArray(history) || history.length === 0) {
      return [{ ts: Date.now(), total: fallbackTotal }];
    }

    const safe = history
      .map((point) => ({
        ts: clampNumber(point.ts, Date.now()),
        total: clampNumber(point.total, fallbackTotal)
      }))
      .sort((a, b) => a.ts - b.ts)
      .slice(-HISTORY_LIMIT);

    if (safe.length === 0) {
      return [{ ts: Date.now(), total: fallbackTotal }];
    }

    return safe;
  }

  function bindEvents() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const targetId = anchor.getAttribute("href");
        const target = targetId ? document.querySelector(targetId) : null;
        if (!target) {
          return;
        }

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    if (el.burnButton) {
      el.burnButton.addEventListener("click", handleBurn);
    }

    if (el.ambientToggle) {
      updateAmbientLabel();
      el.ambientToggle.addEventListener("click", toggleAmbient);
    }

    if (state.ambientOn) {
      const resumeAmbient = async () => {
        if (state.ambientOn && !runtime.ambientNodes) {
          await startAmbient();
          updateAmbientLabel();
        }
      };
      window.addEventListener("pointerdown", resumeAmbient, { once: true });
    }

    document.querySelectorAll(".glitch-hover").forEach((item) => {
      item.addEventListener("mouseenter", () => {
        item.classList.add("hover-glitch");
        window.setTimeout(() => item.classList.remove("hover-glitch"), 220);
      });
    });

    window.addEventListener("resize", () => {
      drawHistoryChart();
      runtime.rainResize();
      resizeEmbersCanvas();
    });
  }

  function setupRevealObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
  }

  function setupTypingObserver() {
    if (!el.manifesto) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !runtime.tenetsTyped) {
          runtime.tenetsTyped = true;
          observer.unobserve(entry.target);
          typeTenets();
        }
      });
    }, { threshold: 0.32 });

    observer.observe(el.manifesto);
  }

  async function typeTenets() {
    for (const tenet of el.tenets) {
      const text = tenet.dataset.text || "";
      await typeSingleTenet(tenet, text, 24);
      await wait(220);
    }
  }

  function typeSingleTenet(target, text, speedMs) {
    target.classList.add("typing");
    target.textContent = "";

    return new Promise((resolve) => {
      let index = 0;
      const timer = window.setInterval(() => {
        target.textContent = text.slice(0, index);
        index += 1;

        if (index > text.length) {
          window.clearInterval(timer);
          target.classList.remove("typing");
          resolve();
        }
      }, speedMs);
    });
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function handleBurn(event) {
    const amount = randomInt(111, 3333);
    const now = Date.now();

    state.totalTokens += amount;
    runtime.burnEvents.push({ ts: now, amount });

    const latest = state.history[state.history.length - 1];
    if (!latest || now - latest.ts > 1800) {
      state.history.push({ ts: now, total: state.totalTokens });
    } else {
      latest.ts = now;
      latest.total = state.totalTokens;
    }

    if (state.history.length > HISTORY_LIMIT) {
      state.history = state.history.slice(-HISTORY_LIMIT);
    }

    const prayer = PRAYERS[randomInt(0, PRAYERS.length - 1)];
    if (el.prayerText) {
      el.prayerText.textContent = `${prayer} +${formatNumber(amount)} tokens.`;
    }

    if (el.burnButton) {
      el.burnButton.classList.remove("fired");
      void el.burnButton.offsetWidth;
      el.burnButton.classList.add("fired");
    }

    spawnEmbersFromEvent(event, 40);
    playBeep();
    triggerHeroGlitch();

    updateDerivedStats();
    setTokenDisplay(state.totalTokens, true);
    drawHistoryChart();
    saveState();
  }

  function setTokenDisplay(targetTokens, animated) {
    if (!animated) {
      runtime.displayedTokens = targetTokens;
      drawTokenValues();
      return;
    }

    if (runtime.tokenAnimationFrame) {
      cancelAnimationFrame(runtime.tokenAnimationFrame);
    }

    const start = runtime.displayedTokens;
    const delta = targetTokens - start;
    const duration = 650;
    const startTime = performance.now();

    const frame = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      runtime.displayedTokens = Math.round(start + delta * eased);
      drawTokenValues();

      if (progress < 1) {
        runtime.tokenAnimationFrame = requestAnimationFrame(frame);
      } else {
        runtime.displayedTokens = targetTokens;
        drawTokenValues();
      }
    };

    runtime.tokenAnimationFrame = requestAnimationFrame(frame);
  }

  function drawTokenValues() {
    const value = formatNumber(runtime.displayedTokens);
    if (el.heroTokenCount) {
      el.heroTokenCount.textContent = value;
    }
    if (el.totalTokens) {
      el.totalTokens.textContent = value;
    }
    document.title = `${value} tokens sacrificed | THE OFFERING`;
  }

  function updateDerivedStats() {
    pruneBurnEvents();
    const rank = findRank(state.totalTokens);
    state.currentRank = rank.title;

    if (el.sacrificeLevel) {
      el.sacrificeLevel.textContent = rank.title;
    }

    if (el.tokensPerSecond) {
      const totalRecent = runtime.burnEvents.reduce((sum, event) => sum + event.amount, 0);
      const perSecond = totalRecent / (BURN_WINDOW_MS / 1000);
      el.tokensPerSecond.textContent = `${perSecond.toFixed(1)} / sec`;
    }

    if (el.carbonSouls) {
      const souls = state.totalTokens / 777;
      el.carbonSouls.textContent = souls.toFixed(2);
    }

    updateRankHighlight(rank.title);
  }

  function updateRankHighlight(current) {
    el.rankCards.forEach((card) => {
      const rank = card.getAttribute("data-rank");
      card.classList.toggle("current-rank", rank === current);
    });
  }

  function pruneBurnEvents() {
    const cutoff = Date.now() - BURN_WINDOW_MS;
    runtime.burnEvents = runtime.burnEvents.filter((event) => event.ts >= cutoff);
  }

  function saveState() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          totalTokens: state.totalTokens,
          history: state.history,
          ambientOn: state.ambientOn,
          currentRank: state.currentRank
        })
      );
    } catch (error) {
      // ignore persistence failures
    }
  }

  function findRank(totalTokens) {
    let current = RANKS[0];
    for (const rank of RANKS) {
      if (totalTokens >= rank.threshold) {
        current = rank;
      }
    }
    return current;
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("en-US").format(Math.max(0, Math.floor(value)));
  }

  function clampNumber(value, fallback) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) {
      return fallback;
    }
    return numeric;
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function startTicker() {
    window.setInterval(() => {
      updateDerivedStats();
      drawHistoryChart();

      const shouldGlitch = Math.random() > 0.75;
      if (shouldGlitch) {
        triggerHeroGlitch();
      }
    }, 1200);
  }

  function triggerHeroGlitch() {
    const title = document.querySelector(".hero-title");
    if (!title) {
      return;
    }

    title.classList.remove("glitching");
    void title.offsetWidth;
    title.classList.add("glitching");
    window.setTimeout(() => title.classList.remove("glitching"), 220);
  }

  function drawHistoryChart() {
    if (!el.historyChart) {
      return;
    }

    const canvas = el.historyChart;
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const ratio = window.devicePixelRatio || 1;
    const width = Math.max(280, canvas.clientWidth);
    const height = Math.max(180, canvas.clientHeight || 240);

    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const points = state.history.slice(-HISTORY_LIMIT);
    context.clearRect(0, 0, width, height);

    const padding = { top: 16, right: 14, bottom: 24, left: 14 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    context.strokeStyle = "rgba(0, 245, 255, 0.14)";
    context.lineWidth = 1;

    for (let i = 0; i <= 4; i += 1) {
      const y = padding.top + (innerHeight / 4) * i;
      context.beginPath();
      context.moveTo(padding.left, y);
      context.lineTo(width - padding.right, y);
      context.stroke();
    }

    if (points.length === 0) {
      return;
    }

    let minTotal = points[0].total;
    let maxTotal = points[0].total;

    points.forEach((point) => {
      minTotal = Math.min(minTotal, point.total);
      maxTotal = Math.max(maxTotal, point.total);
    });

    if (minTotal === maxTotal) {
      maxTotal = minTotal + 1;
    }

    const firstTs = points[0].ts;
    const lastTs = points[points.length - 1].ts;
    const tsRange = Math.max(1, lastTs - firstTs);

    const mapped = points.map((point) => {
      const x = padding.left + ((point.ts - firstTs) / tsRange) * innerWidth;
      const y = padding.top + (1 - (point.total - minTotal) / (maxTotal - minTotal)) * innerHeight;
      return { x, y };
    });

    context.beginPath();
    mapped.forEach((point, index) => {
      if (index === 0) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }
    });
    context.strokeStyle = "#ff8a1c";
    context.lineWidth = 2;
    context.shadowBlur = 10;
    context.shadowColor = "rgba(255, 138, 28, 0.35)";
    context.stroke();
    context.shadowBlur = 0;

    context.beginPath();
    context.moveTo(mapped[0].x, height - padding.bottom);
    mapped.forEach((point) => context.lineTo(point.x, point.y));
    context.lineTo(mapped[mapped.length - 1].x, height - padding.bottom);
    context.closePath();
    const gradient = context.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, "rgba(255, 138, 28, 0.3)");
    gradient.addColorStop(1, "rgba(255, 59, 47, 0.03)");
    context.fillStyle = gradient;
    context.fill();

    const lastPoint = mapped[mapped.length - 1];
    context.beginPath();
    context.arc(lastPoint.x, lastPoint.y, 3.5, 0, Math.PI * 2);
    context.fillStyle = "#00F5FF";
    context.fill();

    context.fillStyle = "#b4caef";
    context.font = '12px "Share Tech Mono", monospace';
    context.fillText(`latest: ${formatNumber(state.totalTokens)}`, padding.left, height - 8);
  }

  function setupDigitalRain() {
    const canvas = el.rainCanvas;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const rain = { context, canvas, fontSize: 18, columns: 0, drops: [], width: 0, height: 0 };

    const initialize = () => {
      const ratio = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      rain.width = width;
      rain.height = height;

      rain.columns = Math.floor(width / rain.fontSize);
      rain.drops = Array.from({ length: rain.columns }, () => randomInt(-50, 0));
    };

    initialize();

    let lastFrame = performance.now();
    const render = (timestamp) => {
      if (timestamp - lastFrame > 48) {
        context.fillStyle = "rgba(5, 7, 13, 0.08)";
        context.fillRect(0, 0, rain.width, rain.height);

        context.font = `${rain.fontSize}px "Share Tech Mono", monospace`;
        rain.drops.forEach((drop, index) => {
          const symbol = RAIN_SYMBOLS[randomInt(0, RAIN_SYMBOLS.length - 1)];
          const x = index * rain.fontSize;
          const y = drop * rain.fontSize;

          context.fillStyle = Math.random() > 0.9 ? "#ff8a1c" : "#00FF41";
          context.fillText(symbol, x, y);

          if (y > rain.height && Math.random() > 0.975) {
            rain.drops[index] = randomInt(-20, 0);
          }

          rain.drops[index] += 1;
        });

        lastFrame = timestamp;
      }

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);

    runtime.rainResize = initialize;
  }

  function setupEmbers() {
    resizeEmbersCanvas();
    const canvas = el.embersCanvas;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const tick = () => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      runtime.particles = runtime.particles.filter((particle) => particle.life > 0);

      runtime.particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.03;
        particle.life -= 0.02;

        context.globalAlpha = Math.max(0, particle.life);
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      });

      context.globalAlpha = 1;
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  function resizeEmbersCanvas() {
    const canvas = el.embersCanvas;
    if (!canvas) {
      return;
    }

    const ratio = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function spawnEmbersFromEvent(event, count) {
    const target = event.currentTarget;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    for (let i = 0; i < count; i += 1) {
      runtime.particles.push({
        x: originX + randomInt(-12, 12),
        y: originY,
        vx: (Math.random() - 0.5) * 2.2,
        vy: -Math.random() * 3.8 - 1.3,
        life: Math.random() * 0.7 + 0.3,
        size: Math.random() * 2.4 + 1,
        color: Math.random() > 0.5 ? "#ff8a1c" : "#ff3b2f"
      });
    }
  }

  async function getAudioContext() {
    if (!runtime.audioContext) {
      runtime.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (runtime.audioContext.state === "suspended") {
      await runtime.audioContext.resume();
    }

    return runtime.audioContext;
  }

  async function playBeep() {
    try {
      const context = await getAudioContext();
      const osc = context.createOscillator();
      const gain = context.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(880, context.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, context.currentTime + 0.08);

      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.02, context.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(context.destination);

      osc.start();
      osc.stop(context.currentTime + 0.11);
    } catch (error) {
      // ignore audio failures
    }
  }

  async function toggleAmbient() {
    state.ambientOn = !state.ambientOn;

    if (state.ambientOn) {
      await startAmbient();
    } else {
      stopAmbient();
    }

    updateAmbientLabel();
    saveState();
  }

  function updateAmbientLabel() {
    if (!el.ambientToggle) {
      return;
    }

    el.ambientToggle.textContent = state.ambientOn ? "AMBIENT: ON" : "AMBIENT: OFF";
  }

  async function startAmbient() {
    try {
      const context = await getAudioContext();
      stopAmbient();

      const master = context.createGain();
      master.gain.value = 0.012;
      master.connect(context.destination);

      const low = context.createOscillator();
      low.type = "sine";
      low.frequency.value = 42;

      const high = context.createOscillator();
      high.type = "triangle";
      high.frequency.value = 86;

      const lfo = context.createOscillator();
      const lfoGain = context.createGain();
      lfo.type = "sine";
      lfo.frequency.value = 0.18;
      lfoGain.gain.value = 8;

      lfo.connect(lfoGain);
      lfoGain.connect(high.frequency);

      low.connect(master);
      high.connect(master);

      low.start();
      high.start();
      lfo.start();

      runtime.ambientNodes = { low, high, lfo, master };
    } catch (error) {
      state.ambientOn = false;
    }
  }

  function stopAmbient() {
    if (!runtime.ambientNodes) {
      return;
    }

    const { low, high, lfo, master } = runtime.ambientNodes;
    try {
      low.stop();
      high.stop();
      lfo.stop();
      master.disconnect();
    } catch (error) {
      // ignore stop failures
    }

    runtime.ambientNodes = null;
  }
})();
