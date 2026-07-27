// Refresh site/data/benchmark.json from the public DeepSWE leaderboard.
// Run: node gen/fetch-benchmark.mjs
//
// ATTRIBUTION: the numbers are DeepSWE's (Datacurve), not ours. We cite them
// with credit and a link back; we do not rebrand them. Our own runs on a
// private 1M-line polyglot repo agree with this ranking, which is why we
// cite this leaderboard as the public, reproducible reference.
import { writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const VERSION = "v1.1";
const SOURCE = `https://deepswe.datacurve.ai/artifacts/${VERSION}/leaderboard-live.json`;
const HOMEPAGE = "https://deepswe.datacurve.ai/";
const siteDir = join(dirname(fileURLToPath(import.meta.url)), "..", "site");

const res = await fetch(SOURCE, {
  headers: { accept: "application/json", "user-agent": "e-acc.ai benchmark citation (+https://e-acc.ai/benchmark)" },
});
if (!res.ok) {
  console.error(`fetch failed: HTTP ${res.status}`);
  process.exit(1);
}
const raw = await res.json();

// keep the fields a reader needs; drop internal bookkeeping
const runs = raw.rows
  .map((r) => ({
    model: r.model,
    harness: r.harness,
    effort: r.reasoning_effort,
    pass_at_1: round(r.pass_at_1, 4),
    pass_at_4: round(r.pass_at_4, 4),
    ci_lo: round(r.ci_lo, 4),
    ci_hi: round(r.ci_hi, 4),
    mean_cost_usd: round(r.mean_cost_usd, 2),
    median_agent_steps: r.median_agent_steps ?? null,
    mean_output_tokens: Math.round(r.mean_output_tokens ?? 0),
    median_output_tokens: Math.round(r.median_output_tokens ?? 0),
    n_tasks_attempted: r.n_tasks_attempted,
    n_runs: r.n_runs,
  }))
  .filter((r) => Number.isFinite(r.pass_at_1) && Number.isFinite(r.mean_cost_usd))
  .sort((a, b) => b.pass_at_1 - a.pass_at_1);

const out = {
  _readme:
    "Cited benchmark data. Source: DeepSWE by Datacurve (public leaderboard). We do not own or rebrand these numbers — always keep source/attribution fields when rendering. Refresh with: node gen/fetch-benchmark.mjs",
  source: {
    name: "DeepSWE",
    version: VERSION,
    owner: "Datacurve",
    homepage: HOMEPAGE,
    data_url: SOURCE,
    license_note: "Cited with attribution; all figures belong to Datacurve.",
  },
  fetched_at: new Date().toISOString().slice(0, 10),
  generated_at: raw.generated_at,
  n_tasks_in_set: raw.n_tasks_in_set,
  unit: raw.unit,
  scope: raw.scope,
  runs,
};

const path = join(siteDir, "data", "benchmark.json");
writeFileSync(path, JSON.stringify(out, null, 2) + "\n");
console.log(`  wrote benchmark.json — ${VERSION}: ${runs.length} runs, ${new Set(runs.map((r) => r.model)).size} models, ${raw.n_tasks_in_set} tasks, generated ${raw.generated_at.slice(0, 10)}`);

function round(n, d) {
  return typeof n === "number" ? Number(n.toFixed(d)) : NaN;
}
