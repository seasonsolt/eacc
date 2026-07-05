// Token estimation and cost math for the calculator page.
// Pure module: imported by the browser page script and by node tests.
// Heuristics are for English text: ~0.75 words per token, ~4 chars per token.

const WORDS_PER_TOKEN = 0.75;
const CHARS_PER_TOKEN = 4;

export function tokensFromWords(words) {
  if (!Number.isFinite(words) || words <= 0) return 0;
  return Math.ceil(words / WORDS_PER_TOKEN);
}

export function tokensFromChars(chars) {
  if (!Number.isFinite(chars) || chars <= 0) return 0;
  return Math.ceil(chars / CHARS_PER_TOKEN);
}

// Text estimate: take the larger of the word-based and char-based estimates —
// prose tracks the word path, code/dense text tracks the char path.
export function tokensFromText(text) {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const words = trimmed.split(/\s+/).length;
  return Math.max(tokensFromWords(words), tokensFromChars(trimmed.length));
}

export function cost({ inputTokens = 0, outputTokens = 0, model }) {
  if (
    !model ||
    !Number.isFinite(model.input_usd_per_mtok) ||
    !Number.isFinite(model.output_usd_per_mtok)
  ) {
    throw new TypeError("cost() needs a model with input/output usd_per_mtok");
  }
  const input = (Math.max(0, inputTokens) / 1_000_000) * model.input_usd_per_mtok;
  const output = (Math.max(0, outputTokens) / 1_000_000) * model.output_usd_per_mtok;
  return { input, output, total: input + output };
}

// $8.00 / $0.50 above a cent; more significant digits as values shrink.
export function formatUSD(value) {
  if (!Number.isFinite(value) || value === 0) return "$0.00";
  if (value >= 0.1) return `$${value.toFixed(2)}`;
  if (value >= 0.0001) return `$${Number(value.toPrecision(3))}`;
  return `$${Number(value.toPrecision(2))}`;
}
