// Static checks for the e/acc site. Run: node site/verify.mjs
// 1. data JSON parses and matches the expected shape
// 2. internal anchor links resolve to element ids
// 3. Buttondown form action is configured (warning until the account exists)
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const read = (name) => readFileSync(join(root, name), "utf8");

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

// ── 2. internal anchors ──────────────────────────────────────────────────
const html = read("index.html");
const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
for (const [, anchor] of html.matchAll(/href="#([^"]+)"/g)) {
  if (!ids.has(anchor)) fail(`anchor: href="#${anchor}" has no matching id`);
}
ok("anchors: all internal links resolve");

// ── 3. Buttondown form ───────────────────────────────────────────────────
const actions = [...html.matchAll(/action="([^"]+)"/g)].map((m) => m[1]);
if (actions.length !== 2) fail(`forms: expected 2 subscribe forms, found ${actions.length}`);
for (const action of actions) {
  if (action.includes("REPLACE_WITH_BUTTONDOWN_USERNAME")) {
    warn("forms: Buttondown username is still the placeholder — set it before launch");
  } else if (!action.startsWith("https://buttondown.com/api/emails/embed-subscribe/")) {
    fail(`forms: unexpected action "${action}"`);
  }
}

// ── result ───────────────────────────────────────────────────────────────
console.log(
  failures === 0
    ? `\nPASS (${warnings} warning${warnings === 1 ? "" : "s"})`
    : `\n${failures} FAILURE${failures === 1 ? "" : "S"} (${warnings} warnings)`
);
process.exit(failures === 0 ? 0 : 1);
