import test from "node:test";
import assert from "node:assert/strict";
import {
  tokensFromWords,
  tokensFromText,
  cost,
  formatUSD,
} from "../site/lib/tokenmath.mjs";

test("tokensFromWords uses the ~0.75 words/token English heuristic", () => {
  assert.equal(tokensFromWords(750), 1000);
  assert.equal(tokensFromWords(75), 100);
  assert.equal(tokensFromWords(1), 2); // ceil, never zero for nonzero input
});

test("tokensFromWords handles zero and garbage", () => {
  assert.equal(tokensFromWords(0), 0);
  assert.equal(tokensFromWords(-5), 0);
  assert.equal(tokensFromWords(NaN), 0);
});

test("tokensFromText estimates from characters and words, whichever is larger", () => {
  // 400 chars of continuous text ≈ 100 tokens via chars/4
  assert.equal(tokensFromText("a".repeat(400)), 100);
  // empty and whitespace-only
  assert.equal(tokensFromText(""), 0);
  assert.equal(tokensFromText("   \n  "), 0);
  // 3 short words: word path says ceil(3/0.75)=4, char path says ceil(11/4)=3 → 4
  assert.equal(tokensFromText("one two six"), 4);
});

test("cost computes input/output/total from per-Mtok prices", () => {
  const model = { input_usd_per_mtok: 5.0, output_usd_per_mtok: 30.0 };
  const c = cost({ inputTokens: 1_000_000, outputTokens: 100_000, model });
  assert.equal(c.input, 5.0);
  assert.equal(c.output, 3.0);
  assert.equal(c.total, 8.0);
});

test("cost handles zero tokens and rejects bad models", () => {
  const model = { input_usd_per_mtok: 1.0, output_usd_per_mtok: 2.0 };
  assert.equal(cost({ inputTokens: 0, outputTokens: 0, model }).total, 0);
  assert.throws(() => cost({ inputTokens: 1, outputTokens: 1, model: {} }), TypeError);
  assert.throws(() => cost({ inputTokens: 1, outputTokens: 1, model: null }), TypeError);
});

test("formatUSD picks precision by magnitude", () => {
  assert.equal(formatUSD(8), "$8.00");
  assert.equal(formatUSD(0.5), "$0.50");
  assert.equal(formatUSD(0.0123), "$0.0123");
  assert.equal(formatUSD(0.000042), "$0.000042");
  assert.equal(formatUSD(0), "$0.00");
});
