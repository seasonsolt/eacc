// /benchmark — cited coding-agent benchmark: capability vs cost.
// The numbers are DeepSWE's (Datacurve). We cite with attribution and add
// the one thing we can add honestly: our own agreement from private runs.

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const bench = JSON.parse(readFileSync(join(root, "site", "data", "benchmark.json"), "utf8"));
const registry = JSON.parse(readFileSync(join(root, "site", "data", "models.json"), "utf8"));

const esc = (s) =>
  String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

// link a benchmark model id to our pricing page when we track that model
const slugFor = (model) => {
  const norm = model.toLowerCase().replace(/[^a-z0-9]/g, "");
  const hit = registry.models.find((m) => m.slug.replace(/-/g, "") === norm);
  return hit ? hit.slug : null;
};

// ── Pareto frontier: no run is both cheaper and better ────────────────────
const byCost = [...bench.runs].sort((a, b) => a.mean_cost_usd - b.mean_cost_usd);
const frontier = new Set();
let best = -Infinity;
for (const r of byCost) {
  if (r.pass_at_1 > best) {
    best = r.pass_at_1;
    frontier.add(r);
  }
}

// ── scatter: pass@1 vs cost, log-x ────────────────────────────────────────
const W = 760;
const H = 420;
const PAD = { top: 24, right: 28, bottom: 46, left: 52 };
const costs = bench.runs.map((r) => r.mean_cost_usd).filter((c) => c > 0);
const xMin = Math.log10(Math.min(...costs) * 0.8);
const xMax = Math.log10(Math.max(...costs) * 1.15);
const x = (c) => PAD.left + ((Math.log10(c) - xMin) / (xMax - xMin)) * (W - PAD.left - PAD.right);
const y = (p) => PAD.top + (1 - p / 0.8) * (H - PAD.top - PAD.bottom);

const gridlines = [0, 0.2, 0.4, 0.6, 0.8]
  .map(
    (p) => `      <line x1="${PAD.left}" y1="${y(p).toFixed(1)}" x2="${W - PAD.right}" y2="${y(p).toFixed(1)}" stroke="#0d2d1c" stroke-width="1"/>
      <text x="${PAD.left - 8}" y="${(y(p) + 4).toFixed(1)}" text-anchor="end" fill="#7da68a" font-size="11">${Math.round(p * 100)}%</text>`
  )
  .join("\n");

const xticks = [1, 2, 5, 10, 20]
  .filter((c) => Math.log10(c) >= xMin && Math.log10(c) <= xMax)
  .map(
    (c) => `      <text x="${x(c).toFixed(1)}" y="${H - 22}" text-anchor="middle" fill="#7da68a" font-size="11">$${c}</text>`
  )
  .join("\n");

const frontierPath = byCost
  .filter((r) => frontier.has(r))
  .map((r, i) => `${i === 0 ? "M" : "L"}${x(r.mean_cost_usd).toFixed(1)},${y(r.pass_at_1).toFixed(1)}`)
  .join(" ");

const dots = bench.runs
  .map((r) => {
    const on = frontier.has(r);
    return `      <circle cx="${x(r.mean_cost_usd).toFixed(1)}" cy="${y(r.pass_at_1).toFixed(1)}" r="${on ? 5 : 3.5}" fill="${on ? "#33ff66" : "#1e5c38"}"${on ? ' stroke="#a4ffc0" stroke-width="1"' : ""}><title>${esc(r.model)} ${esc(r.effort || "")} — ${(r.pass_at_1 * 100).toFixed(1)}% @ $${r.mean_cost_usd}</title></circle>`;
  })
  .join("\n");

const labels = byCost
  .filter((r) => frontier.has(r))
  .map(
    (r) =>
      `      <text x="${(x(r.mean_cost_usd) + 8).toFixed(1)}" y="${(y(r.pass_at_1) - 7).toFixed(1)}" fill="#c2dfc9" font-size="10.5">${esc(r.model)}${r.effort ? ` <tspan fill="#7da68a">${esc(r.effort)}</tspan>` : ""}</text>`
  )
  .join("\n");

const rows = bench.runs
  .map((r) => {
    const slug = slugFor(r.model);
    const name = slug ? `<a href="./pricing/${slug}">${esc(r.model)}</a>` : esc(r.model);
    return `            <tr${frontier.has(r) ? ' class="calc-cheapest"' : ""}>
              <td>${name}</td>
              <td>${esc(r.effort || "—")}</td>
              <td class="calc-total">${(r.pass_at_1 * 100).toFixed(1)}%</td>
              <td>${(r.ci_lo * 100).toFixed(0)}–${(r.ci_hi * 100).toFixed(0)}%</td>
              <td>${(r.pass_at_4 * 100).toFixed(1)}%</td>
              <td>$${r.mean_cost_usd.toFixed(2)}</td>
              <td>${r.median_agent_steps ?? "—"}</td>
            </tr>`;
  })
  .join("\n");

const top = bench.runs[0];
const cheapestOnFrontier = byCost.find((r) => frontier.has(r) && r.pass_at_1 > 0.4);
const spread = (top.mean_cost_usd / (cheapestOnFrontier?.mean_cost_usd || top.mean_cost_usd)).toFixed(1);

const body = `
        <p class="panel-lead">
          How well do frontier models actually <em>finish real engineering tasks</em>, and what does each
          attempt cost? The numbers below are the public
          <a href="${esc(bench.source.homepage)}" target="_blank" rel="noopener">${esc(bench.source.name)}</a>
          leaderboard by <strong>${esc(bench.source.owner)}</strong> — ${bench.n_tasks_in_set} agentic
          tasks, pass@1 over repeated runs with 95% confidence intervals, generated
          ${esc(bench.generated_at.slice(0, 10))}. <strong>All figures belong to ${esc(bench.source.owner)}</strong>;
          we cite them, we don't own them.
        </p>
        <p class="panel-lead">
          Why cite this one: we ran our own agentic evaluations against a private ~1M-line polyglot
          repository (Java, Go, Python, Vue, React, Next.js) and <strong>our ordering agrees with
          theirs</strong> — so this is the closest public, reproducible reference to what we see on
          real production code. Prices per model live on <a href="./pricing">our pricing pages</a>.
        </p>

        <h2 class="panel-title">
          <span class="panel-cmd" aria-hidden="true">$ plot pass@1 --vs cost --log</span>
          <span class="panel-name">Capability versus cost per task</span>
        </h2>
        <figure class="chart-frame">
          <div class="price-chart" role="img" aria-label="Scatter plot: agentic task pass rate versus average cost per task, log scale. The Pareto frontier runs from cheap low-scoring configurations up to ${esc(top.model)} at ${(top.pass_at_1 * 100).toFixed(0)} percent.">
            <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
${gridlines}
${xticks}
              <text x="${(W / 2).toFixed(0)}" y="${H - 6}" text-anchor="middle" fill="#7da68a" font-size="11">mean cost per task (log)</text>
              <path d="${frontierPath}" fill="none" stroke="#33ff66" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.55"/>
${dots}
${labels}
            </svg>
          </div>
          <figcaption class="chart-caption">
            Filled dots are the Pareto frontier — no other configuration is both cheaper and better.
            Source: ${esc(bench.source.name)} (${esc(bench.source.owner)}), data generated ${esc(bench.generated_at.slice(0, 10))}.
          </figcaption>
        </figure>

        <h2 class="panel-title">
          <span class="panel-cmd" aria-hidden="true">$ sort -k pass@1 --desc</span>
          <span class="panel-name">Full leaderboard — ${bench.runs.length} configurations</span>
        </h2>
        <table class="calc-table">
          <thead>
            <tr>
              <th scope="col">model</th>
              <th scope="col">effort</th>
              <th scope="col">pass@1</th>
              <th scope="col">95% CI</th>
              <th scope="col">pass@4</th>
              <th scope="col">cost/task</th>
              <th scope="col">steps</th>
            </tr>
          </thead>
          <tbody>
${rows}
          </tbody>
        </table>

        <h2 class="panel-title">
          <span class="panel-cmd" aria-hidden="true">$ cat METHOD</span>
          <span class="panel-name">What the numbers mean</span>
        </h2>
        <div class="readme">
          <p>${esc(bench.unit)}</p>
          <p>${esc(bench.scope)}</p>
          <p>
            Reasoning effort is a per-run setting, not a different model — the same model at
            <code>max</code> and <code>medium</code> is two rows here, and the gap between them is
            often larger than the gap between vendors. That is the practical lesson:
            <strong>effort tuning moves both score and bill more than model choice does</strong>,
            and at the top of the range you pay roughly ${spread}× more per task than the cheapest
            frontier-quality configuration.
          </p>
          <p class="readme-links">
            <a href="${esc(bench.source.homepage)}" target="_blank" rel="noopener">${esc(bench.source.name)} leaderboard by ${esc(bench.source.owner)} (original source)</a>
            <a href="./pricing">our LLM API pricing comparison</a>
            <a href="./calculator">token cost calculator</a>
          </p>
        </div>`;

export default {
  slug: "benchmark",
  title: "AI Coding Agent Benchmark: Score vs Cost per Task | e-acc.ai",
  description: `Coding-agent benchmark as capability versus cost: ${bench.runs.length} configurations over ${bench.n_tasks_in_set} agentic tasks, pass@1 with CIs. Data cited from DeepSWE by Datacurve.`,
  h1Cmd: "$ eacc bench --agentic",
  h1Text: "AI coding agent benchmark — capability versus cost per task",
  keyword: "benchmark",
  jsonLd: [],
  body,
};
