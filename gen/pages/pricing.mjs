// /pricing hub + /pricing/{slug} programmatic pages from the model registry.
// Target clusters: "llm api pricing comparison" (hub), "{model} api pricing" (leaves).
// First test batch per the SEO replan: ship, submit to GSC, expand only on data.

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { cost, formatUSD } from "../../site/lib/tokenmath.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const registry = JSON.parse(readFileSync(join(root, "site", "data", "models.json"), "utf8"));
const models = registry.models;
const updated = registry.updated;

const byInputAsc = [...models].sort((a, b) => a.input_usd_per_mtok - b.input_usd_per_mtok);
const cheapest = byInputAsc[0];
const flagship = [...models].sort((a, b) => b.output_usd_per_mtok - a.output_usd_per_mtok)[0];

// realistic reference workloads, priced at build time
const WORKLOADS = [
  { key: "chat", label: "Chat message (1K in / 500 out)", inputTokens: 1_000, outputTokens: 500 },
  { key: "doc", label: "Long document (100K in / 2K out)", inputTokens: 100_000, outputTokens: 2_000 },
  { key: "agent", label: "Agent session (500K in / 50K out)", inputTokens: 500_000, outputTokens: 50_000 },
];

const workloadCost = (m, w) =>
  cost({ inputTokens: w.inputTokens, outputTokens: w.outputTokens, model: m }).total;

function esc(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const ratio = (a, b) => {
  const r = a / b;
  return r >= 10 ? Math.round(r) : Math.round(r * 10) / 10;
};

// ── hub: /pricing ─────────────────────────────────────────────────────────
const hubRows = byInputAsc
  .map(
    (m) => `            <tr>
              <td><a href="./pricing/${m.slug}">${esc(m.name)}</a></td>
              <td>${esc(m.provider)}</td>
              <td>$${m.input_usd_per_mtok}</td>
              <td>$${m.output_usd_per_mtok}</td>
              <td class="calc-total">${formatUSD(workloadCost(m, WORKLOADS[0]))}</td>
            </tr>`
  )
  .join("\n");

const hub = {
  slug: "pricing",
  title: "LLM API Pricing Comparison 2026 — All Models | e-acc.ai",
  description: `Compare LLM API pricing across ${models.length} models — GPT-5.5, Claude 5, Gemini 3, DeepSeek — input/output cost per million tokens in one table, verified ${updated}.`,
  h1Cmd: "$ ls -S pricing/",
  h1Text: "LLM API pricing comparison — every major model, one table",
  keyword: "pricing",
  jsonLd: [],
  body: `
        <p class="panel-lead">
          Standard pay-as-you-go API prices for ${models.length} tracked models, cheapest input
          first, verified ${updated}. Every model links to a detail page with worked examples;
          the <a href="./calculator">token cost calculator</a> prices your own prompts, and the
          <a href="./timeline">timeline</a> shows how these prices keep collapsing.
        </p>
        <table class="calc-table">
          <thead>
            <tr>
              <th scope="col">model</th>
              <th scope="col">provider</th>
              <th scope="col">input $/Mtok</th>
              <th scope="col">output $/Mtok</th>
              <th scope="col">chat msg cost</th>
            </tr>
          </thead>
          <tbody>
${hubRows}
          </tbody>
        </table>
        <p class="chart-caption">
          Chat msg = 1K input + 500 output tokens. Standard tier, cache-miss; batch and promo
          discounts excluded. The spread between the cheapest and priciest tracked model is
          ${ratio(workloadCost(flagship, WORKLOADS[0]), workloadCost(cheapest, WORKLOADS[0]))}× on
          the same request.
        </p>`,
};

// ── leaves: /pricing/{slug} ───────────────────────────────────────────────
const leaves = models.map((m) => {
  const siblings = models.filter((s) => s.provider === m.provider && s.slug !== m.slug);
  const others = byInputAsc.filter((s) => s.slug !== m.slug).slice(0, 3);
  const related = [...siblings, ...others]
    .filter((s, i, arr) => arr.findIndex((x) => x.slug === s.slug) === i)
    .slice(0, 3);

  const exampleRows = WORKLOADS.map(
    (w) => `            <tr>
              <td>${esc(w.label)}</td>
              <td>${formatUSD(cost({ inputTokens: w.inputTokens, outputTokens: 0, model: m }).total)}</td>
              <td>${formatUSD(cost({ inputTokens: 0, outputTokens: w.outputTokens, model: m }).total)}</td>
              <td class="calc-total">${formatUSD(workloadCost(m, w))}</td>
            </tr>`
  ).join("\n");

  const isCheapest = m.slug === cheapest.slug;
  const vsCheapest = isCheapest
    ? `${esc(m.name)} is currently the cheapest model we track — every other model costs more per request.`
    : `On the same chat-message workload, ${esc(m.name)} costs ${ratio(
        workloadCost(m, WORKLOADS[0]),
        workloadCost(cheapest, WORKLOADS[0])
      )}× more than ${esc(cheapest.name)} (the cheapest tracked model) — capability, latency and context limits are the other side of that trade.`;

  return {
    slug: `pricing/${m.slug}`,
    title: `${m.name} API Pricing 2026: Cost per Token | e-acc.ai`,
    description: `${m.name} API pricing, verified ${updated}: $${m.input_usd_per_mtok} input / $${m.output_usd_per_mtok} output per million tokens, with worked request costs and comparisons against ${models.length - 1} other models.`,
    h1Cmd: `$ price ${m.slug}`,
    h1Text: `${m.name} API pricing — cost per million tokens`,
    keyword: "pricing",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "e-acc.ai", item: "https://e-acc.ai/" },
          { "@type": "ListItem", position: 2, name: "LLM pricing", item: "https://e-acc.ai/pricing" },
          { "@type": "ListItem", position: 3, name: m.name, item: `https://e-acc.ai/pricing/${m.slug}` },
        ],
      },
    ],
    body: `
        <p class="panel-lead">
          ${esc(m.provider)}'s <strong>${esc(m.name)}</strong> costs
          <strong>$${m.input_usd_per_mtok} per million input tokens</strong> and
          <strong>$${m.output_usd_per_mtok} per million output tokens</strong> on the standard
          API tier (verified ${updated}).${m.note ? ` Note: ${esc(m.note)}` : ""}
          Compare it in the <a href="../pricing">full pricing table</a> or price your own
          prompts in the <a href="../calculator">token cost calculator</a>.
        </p>

        <h2 class="panel-title">
          <span class="panel-cmd" aria-hidden="true">$ cat rates.txt</span>
          <span class="panel-name">${esc(m.name)} price per million tokens</span>
        </h2>
        <table class="calc-table">
          <thead>
            <tr><th scope="col">direction</th><th scope="col">$ / Mtok</th><th scope="col">$ / 1K tokens</th></tr>
          </thead>
          <tbody>
            <tr><td>input (prompt)</td><td>$${m.input_usd_per_mtok}</td><td>${formatUSD(m.input_usd_per_mtok / 1000)}</td></tr>
            <tr><td>output (completion)</td><td>$${m.output_usd_per_mtok}</td><td>${formatUSD(m.output_usd_per_mtok / 1000)}</td></tr>
          </tbody>
        </table>

        <h2 class="panel-title">
          <span class="panel-cmd" aria-hidden="true">$ eacc calc --examples</span>
          <span class="panel-name">What real requests cost on ${esc(m.name)}</span>
        </h2>
        <table class="calc-table">
          <thead>
            <tr><th scope="col">workload</th><th scope="col">input</th><th scope="col">output</th><th scope="col">total</th></tr>
          </thead>
          <tbody>
${exampleRows}
          </tbody>
        </table>

        <h2 class="panel-title">
          <span class="panel-cmd" aria-hidden="true">$ diff --market</span>
          <span class="panel-name">How ${esc(m.name)} pricing compares</span>
        </h2>
        <p>
          ${vsCheapest}
          Output tokens dominate long generations: at $${m.output_usd_per_mtok}/Mtok, a 50K-token
          agent transcript costs ${formatUSD((50_000 / 1_000_000) * m.output_usd_per_mtok)} in
          output alone. Official rate card:
          <a href="${esc(m.source_url)}" target="_blank" rel="noopener">${esc(m.provider)} pricing</a>.
        </p>
        <p class="panel-more">
          Related: ${related
            .map((s) => `<a href="./${s.slug}">${esc(s.name)} pricing</a>`)
            .join(" · ")} · <a href="../timeline">release timeline</a>
        </p>`,
  };
});

export default [hub, ...leaves];
