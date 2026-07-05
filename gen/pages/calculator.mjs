// /calculator — free token cost calculator across the model registry.
// Target cluster: "ai token calculator", "token cost calculator", "llm api cost".
// Model registry is inlined at build time; math lives in site/lib/tokenmath.mjs.

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const registry = JSON.parse(readFileSync(join(root, "site", "data", "models.json"), "utf8"));

const body = `
        <p class="panel-lead">
          Paste text or type a word count, set an expected reply length, and get the API cost
          for every tracked model — ranked cheapest first. Estimates use the standard English
          heuristics (~0.75 words or ~4 characters per token). Prices are standard-tier USD per
          million tokens, verified ${registry.updated}; see also
          <a href="./timeline">what shipped when</a> and
          <a href="./what-is-eacc">why this site exists</a>.
        </p>

        <div class="calc" id="calc">
          <label class="prompt-label" for="calc-text">&gt; estimate --input</label>
          <textarea
            id="calc-text"
            rows="5"
            placeholder="paste your prompt here — or leave empty and use the word count below"
          ></textarea>

          <div class="calc-row">
            <label for="calc-words">input words</label>
            <input type="number" id="calc-words" min="0" step="100" value="1000" />
            <label for="calc-output">expected output tokens</label>
            <input type="number" id="calc-output" min="0" step="100" value="500" />
          </div>

          <p class="calc-verdict" id="calc-verdict" aria-live="polite"></p>

          <table class="calc-table" id="calc-table">
            <thead>
              <tr>
                <th scope="col">model</th>
                <th scope="col">provider</th>
                <th scope="col">input $/Mtok</th>
                <th scope="col">output $/Mtok</th>
                <th scope="col">this request</th>
              </tr>
            </thead>
            <tbody><!-- rendered by calculator.js --></tbody>
          </table>
          <p class="chart-caption">
            Registry updated ${registry.updated}. Cache discounts, batch tiers and promos not
            included — this is the standard pay-as-you-go rate.
          </p>
        </div>

        <script type="application/json" id="models-data">
${JSON.stringify(registry.models, null, 2)}
        </script>
        <script type="module" src="./calculator.js"></script>`;

export default {
  slug: "calculator",
  title: "AI Token Cost Calculator — Price Any Prompt | e-acc.ai",
  description:
    "Free token cost calculator: paste a prompt, get the API cost across GPT-5.5, Claude 5, Gemini 3 and DeepSeek — ranked cheapest first. No login, prices verified weekly.",
  h1Cmd: "$ eacc calc --tokens --usd",
  h1Text: "AI token cost calculator — price any prompt across every major model",
  keyword: "token",
  jsonLd: [],
  body,
};
