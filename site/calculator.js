// Calculator page behavior. Pure math lives in lib/tokenmath.mjs;
// the model registry is inlined into the page at build time.
import { tokensFromWords, tokensFromText, cost, formatUSD } from "./lib/tokenmath.mjs";

const models = JSON.parse(document.getElementById("models-data").textContent);

const textEl = document.getElementById("calc-text");
const wordsEl = document.getElementById("calc-words");
const outputEl = document.getElementById("calc-output");
const verdictEl = document.getElementById("calc-verdict");
const tbody = document.querySelector("#calc-table tbody");

function inputTokens() {
  const text = textEl.value;
  if (text.trim()) return tokensFromText(text);
  return tokensFromWords(Number(wordsEl.value));
}

function render() {
  const inTok = inputTokens();
  const outTok = Math.max(0, Number(outputEl.value) || 0);

  const rows = models
    .map((m) => ({ m, c: cost({ inputTokens: inTok, outputTokens: outTok, model: m }) }))
    .sort((a, b) => a.c.total - b.c.total);

  tbody.replaceChildren(
    ...rows.map(({ m, c }, i) => {
      const tr = document.createElement("tr");
      if (i === 0) tr.className = "calc-cheapest";
      const cells = [
        m.name,
        m.provider,
        `$${m.input_usd_per_mtok}`,
        `$${m.output_usd_per_mtok}`,
        formatUSD(c.total),
      ];
      cells.forEach((text, idx) => {
        const td = document.createElement("td");
        td.textContent = text;
        if (idx === 4) td.className = "calc-total";
        tr.append(td);
      });
      return tr;
    })
  );

  const cheapest = rows[0];
  const dearest = rows[rows.length - 1];
  const ratio = cheapest.c.total > 0 ? Math.round(dearest.c.total / cheapest.c.total) : 0;
  verdictEl.textContent =
    `≈ ${inTok.toLocaleString("en-US")} input tokens + ${outTok.toLocaleString("en-US")} output tokens · ` +
    (cheapest.c.total > 0
      ? `cheapest: ${cheapest.m.name} at ${formatUSD(cheapest.c.total)} — ${ratio}× cheaper than ${dearest.m.name}`
      : "enter some input to price it");

  // typing in the textarea drives the word field, not the other way around
  if (textEl.value.trim()) wordsEl.value = textEl.value.trim().split(/\s+/).length;
}

[textEl, wordsEl, outputEl].forEach((el) => el.addEventListener("input", render));
render();
