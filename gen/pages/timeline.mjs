// /timeline — the acceleration log as a standalone page.
// Target cluster: "ai model release timeline", "days since gpt-5 release".
// Timeline data is inlined at build time; a tiny script computes day counts.

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const timeline = JSON.parse(readFileSync(join(root, "site", "data", "timeline.json"), "utf8"));

const TAG_LABELS = { model: "MODEL", culture: "CULTURE", compute: "COMPUTE", policy: "POLICY" };

// The four most recent frontier releases get days-since counter cards.
const counters = timeline.events
  .filter((e) => e.frontier)
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, 4);

const counterCards = counters
  .map(
    (e) => `            <div class="metric">
              <span class="metric-value" data-since="${e.date}">—</span>
              <span class="metric-label">days since ${esc(e.title.replace(/ ships$/, "").replace(/:.*$/, ""))}</span>
            </div>`
  )
  .join("\n");

const logEntries = [...timeline.events]
  .sort((a, b) => b.date.localeCompare(a.date))
  .map(
    (e) => `            <li class="log-entry"${e.frontier ? ' data-frontier="true"' : ""}>
              <span class="log-date">${e.date}</span>
              <span class="log-tag log-tag--${e.type}">${TAG_LABELS[e.type] || e.type.toUpperCase()}</span>
              <div>
                <p class="log-title"><a href="${esc(e.source_url)}" target="_blank" rel="noopener">${esc(e.title)}</a></p>
                <p class="log-detail">${esc(e.detail)}</p>
              </div>
            </li>`
  )
  .join("\n");

const body = `
        <p class="panel-lead">
          Every frontier model release, compute buildout and culture moment since the movement
          got its name — newest first, every entry sourced. Updated weekly. The
          <a href="./">live counters on the homepage</a> run on this same data, and the
          <a href="./calculator">token cost calculator</a> prices the models listed here.
        </p>

        <h2 class="panel-title">
          <span class="panel-cmd" aria-hidden="true">$ uptime --frontier</span>
          <span class="panel-name">Days since the last frontier AI releases</span>
        </h2>
        <div class="metrics-strip">
${counterCards}
        </div>

        <h2 class="panel-title">
          <span class="panel-cmd" aria-hidden="true">$ tail -n ${timeline.events.length} /var/log/acceleration</span>
          <span class="panel-name">The full AI acceleration log, ${timeline.events[timeline.events.length - 1].date.slice(0, 4)}–${timeline.events[0].date.slice(0, 4)}</span>
        </h2>
        <ol class="log-list">
${logEntries}
        </ol>

        <script>
          // day counts are computed client-side so the page never goes stale
          document.querySelectorAll("[data-since]").forEach((el) => {
            const then = new Date(el.dataset.since + "T00:00:00Z").getTime();
            el.textContent = String(Math.max(0, Math.floor((Date.now() - then) / 86400000)));
          });
        </script>`;

function esc(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export default {
  slug: "timeline",
  title: "AI Model Release Timeline & Days-Since Counters | e-acc.ai",
  description:
    "The AI acceleration timeline: every frontier model release from ChatGPT to the Claude 5 family, plus live days-since counters. Sourced, dated, updated weekly.",
  h1Cmd: "$ tail -f /var/log/acceleration",
  h1Text: "The AI acceleration timeline — frontier model releases, dated and sourced",
  keyword: "timeline",
  jsonLd: [],
  body,
};
