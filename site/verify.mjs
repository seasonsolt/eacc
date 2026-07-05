// Static checks for the e/acc site — the build contract's test suite.
// Run: node gen/build.mjs && node site/verify.mjs
// Asserts over EMITTED files: data schemas, per-page TDH, canonicals,
// the cross-page link graph, sitemap consistency, and form wiring.
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const read = (name) => readFileSync(join(root, name), "utf8");
const SITE = "https://e-acc.ai";

let failures = 0;
let warnings = 0;
const fail = (msg) => {
  failures += 1;
  console.error(`FAIL ${msg}`);
};
const warn = (msg) => {
  warnings += 1;
  console.warn(`WARN ${msg}`);
};
const ok = (msg) => console.log(`  ok ${msg}`);

// ── 1. data files ────────────────────────────────────────────────────────
const EVENT_TYPES = new Set(["model", "policy", "compute", "culture"]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_RE = /^\d{4}-\d{2}$/;

try {
  const timeline = JSON.parse(read("data/timeline.json"));
  if (!Array.isArray(timeline.events) || timeline.events.length === 0) {
    fail("timeline.json: events must be a non-empty array");
  } else {
    timeline.events.forEach((e, i) => {
      const at = `timeline.json events[${i}]`;
      if (!DATE_RE.test(e.date || "")) fail(`${at}: bad date "${e.date}"`);
      if (!EVENT_TYPES.has(e.type)) fail(`${at}: bad type "${e.type}"`);
      if (typeof e.title !== "string" || !e.title) fail(`${at}: title must be a non-empty string`);
      if (typeof e.detail !== "string" || !e.detail) fail(`${at}: detail must be a non-empty string`);
      if (!/^https:\/\//.test(e.source_url || "")) fail(`${at}: source_url must be https`);
    });
    if (!timeline.events.some((e) => e.frontier)) {
      fail("timeline.json: at least one event needs frontier:true (drives the days-since metric)");
    }
    ok(`timeline.json: ${timeline.events.length} events`);
  }
} catch (err) {
  fail(`timeline.json: ${err.message}`);
}

try {
  const metrics = JSON.parse(read("data/metrics.json"));
  if (!(metrics.token_rate?.tokens_per_second > 0)) {
    fail("metrics.json: token_rate.tokens_per_second must be a positive number");
  }
  const pts = metrics.price_series?.points;
  if (!Array.isArray(pts) || pts.length < 2) {
    fail("metrics.json: price_series.points needs >= 2 points");
  } else {
    pts.forEach((p, i) => {
      const at = `metrics.json points[${i}]`;
      if (!MONTH_RE.test(p.date || "")) fail(`${at}: bad date "${p.date}" (want YYYY-MM)`);
      if (!(p.usd_per_mtok > 0)) fail(`${at}: usd_per_mtok must be positive (log scale)`);
      if (!p.model) fail(`${at}: missing model name`);
      if (i > 0 && pts[i - 1].date >= p.date) fail(`${at}: dates must be ascending`);
    });
    ok(`metrics.json: ${pts.length} price points`);
  }
} catch (err) {
  fail(`metrics.json: ${err.message}`);
}

try {
  const registry = JSON.parse(read("data/models.json"));
  const models = registry.models;
  if (!Array.isArray(models) || models.length < 2) {
    fail("models.json: needs >= 2 models");
  } else {
    const slugs = new Set();
    models.forEach((m, i) => {
      const at = `models.json models[${i}]`;
      if (!/^[a-z0-9-]+$/.test(m.slug || "")) fail(`${at}: slug must be url-safe ("${m.slug}")`);
      if (slugs.has(m.slug)) fail(`${at}: duplicate slug "${m.slug}"`);
      slugs.add(m.slug);
      if (!m.name || !m.provider) fail(`${at}: missing name/provider`);
      if (!(m.input_usd_per_mtok > 0) || !(m.output_usd_per_mtok > 0)) {
        fail(`${at}: prices must be positive numbers`);
      }
      if (!/^https:\/\//.test(m.source_url || "")) fail(`${at}: source_url must be https`);
    });
    ok(`models.json: ${models.length} models`);
  }
} catch (err) {
  fail(`models.json: ${err.message}`);
}

// ── 2. per-page TDH, canonical, structured data ──────────────────────────
const pageFiles = readdirSync(root).filter((f) => f.endsWith(".html"));
const pages = new Map(pageFiles.map((f) => [f, read(f)]));
const KEYWORDS = {
  "index.html": "e/acc",
  "what-is-eacc.html": "e/acc",
  "timeline.html": "timeline",
  "calculator.html": "calculator",
};

const titles = new Map();
for (const [file, html] of pages) {
  const at = file.replace(".html", "");

  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  if (!title) fail(`${at}: missing <title>`);
  if (titles.has(title)) fail(`${at}: duplicate title (also on ${titles.get(title)})`);
  titles.set(title, at);
  if (title.length < 40 || title.length > 65) {
    warn(`${at}: title ${title.length} chars — target 50-60`);
  }

  const desc = (html.match(/name="description"\s+content="([^"]*)"/) || [])[1] || "";
  if (!desc) fail(`${at}: missing meta description`);
  else if (desc.length < 120 || desc.length > 175) {
    warn(`${at}: description ${desc.length} chars — target 150-160`);
  }

  const h1s = html.match(/<h1[\s>]/g) || [];
  if (h1s.length !== 1) fail(`${at}: needs exactly one h1, found ${h1s.length}`);
  const h1Text = ((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const keyword = KEYWORDS[file];
  if (keyword) {
    if (!title.toLowerCase().includes(keyword)) fail(`${at}: title missing keyword "${keyword}"`);
    if (!h1Text.toLowerCase().includes(keyword)) fail(`${at}: h1 missing keyword "${keyword}"`);
  } else {
    warn(`${at}: no target keyword declared in verify.mjs KEYWORDS`);
  }

  const expectedCanonical = file === "index.html" ? `${SITE}/` : `${SITE}/${at}`;
  const canonical = (html.match(/rel="canonical" href="([^"]*)"/) || [])[1];
  if (canonical !== expectedCanonical) {
    fail(`${at}: canonical "${canonical}" ≠ expected "${expectedCanonical}"`);
  }

  if (html.includes('class="visually-hidden"')) {
    fail(`${at}: visually-hidden keyword pattern is banned — use visible .panel-name text`);
  }

  if (!/property="og:image" content="[^"]+"/.test(html)) fail(`${at}: missing og:image`);

  for (const [, block] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(block);
    } catch {
      fail(`${at}: unparseable JSON-LD block`);
    }
  }
}
ok(`pages: ${pages.size} html files pass TDH/canonical/structured-data checks`);

// ── 3. link graph: every internal href resolves ──────────────────────────
const ids = new Map(
  [...pages].map(([f, html]) => [f, new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]))])
);
for (const [file, html] of pages) {
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (/^(https?:|mailto:)/.test(href)) continue;
    let target = href;
    let anchor = null;
    const hashAt = target.indexOf("#");
    if (hashAt >= 0) {
      anchor = target.slice(hashAt + 1);
      target = target.slice(0, hashAt);
    }
    target = target.replace(/^\.\//, "");
    // asset references (styles.css, fonts, og.png …) must exist as files
    if (target.includes(".")) {
      try {
        readFileSync(join(root, target));
      } catch {
        fail(`${file}: asset "${href}" does not exist`);
      }
      continue;
    }
    const targetFile = target === "" ? (hashAt === 0 ? file : "index.html") : `${target}.html`;
    if (!pages.has(targetFile)) {
      fail(`${file}: link "${href}" → ${targetFile} does not exist`);
      continue;
    }
    if (anchor && !ids.get(targetFile).has(anchor)) {
      fail(`${file}: link "${href}" → missing anchor #${anchor} in ${targetFile}`);
    }
  }
}
ok("links: every internal href and anchor resolves");

// ── 4. sitemap matches the emitted page set ──────────────────────────────
try {
  const sitemap = read("sitemap.xml");
  const locs = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  const expected = new Set(
    [...pages.keys()].map((f) => (f === "index.html" ? `${SITE}/` : `${SITE}/${f.replace(".html", "")}`))
  );
  for (const url of expected) if (!locs.has(url)) fail(`sitemap: missing ${url}`);
  for (const url of locs) if (!expected.has(url)) fail(`sitemap: lists ${url} which is not an emitted page`);
  ok(`sitemap: ${locs.size} urls checked against page set`);
} catch (err) {
  fail(`sitemap.xml: ${err.message}`);
}

// ── 5. subscribe forms ────────────────────────────────────────────────────
let placeholderSeen = false;
for (const [file, html] of pages) {
  const actions = [...html.matchAll(/action="([^"]+)"/g)].map((m) => m[1]);
  if (actions.length === 0) fail(`${file}: no subscribe form`);
  for (const action of actions) {
    if (action.includes("REPLACE_WITH_BUTTONDOWN_USERNAME")) placeholderSeen = true;
    else if (!action.startsWith("https://buttondown.com/api/emails/embed-subscribe/")) {
      fail(`${file}: unexpected form action "${action}"`);
    }
  }
}
if (placeholderSeen) warn("forms: Buttondown username is still the placeholder — set it before launch");

// ── result ───────────────────────────────────────────────────────────────
console.log(
  failures === 0
    ? `\nPASS (${warnings} warning${warnings === 1 ? "" : "s"})`
    : `\n${failures} FAILURE${failures === 1 ? "" : "S"} (${warnings} warnings)`
);
process.exit(failures === 0 ? 0 : 1);
