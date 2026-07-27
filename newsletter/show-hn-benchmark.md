<!--
Show HN + X copy for the /benchmark launch.
Every number here is computed from site/data/benchmark.json — DeepSWE v1.1
by Datacurve, generated 2026-07-25, 50 configurations / 18 models / 113 tasks.
Re-verify after each `node gen/fetch-benchmark.mjs` refresh.
HN rules: title <= 80 chars, no hype words, let the URL do the talking.
Post from the account that owns the site; be present in the thread.
-->

# Show HN

**Title** (69 chars — pick one)

```
Show HN: Coding agent benchmarks plotted against dollars per task
```

Alternates:
- `Show HN: The reasoning-effort setting matters more than which model you pick`
- `Show HN: 50 coding-agent configurations charted as capability vs cost`

**URL**

```
https://e-acc.ai/benchmark
```

**First comment** (post immediately after submitting)

```
Coding-agent leaderboards rank by score, which makes the top row look like the
obvious pick. It isn't — the same model at a different reasoning effort is
effectively a different product at a different price, and nobody plots that.

So I charted pass@1 against mean cost per task (log x) across 50
configurations and marked the Pareto frontier — the runs where nothing else is
both cheaper and better.

Two things fall out of it.

1. Effort moves more than vendor choice. gpt-5-5 at low effort scores 27.0% at
   $1.20/task; the same model at xhigh scores 67.0% at $7.23. Forty points of
   pass rate, 6x the bill, one model. gpt-5-6-terra goes 35.1% -> 69.6% for
   8.5x. If you haven't tuned effort, comparing vendors is comparing noise.

2. The top of the table is expensive per point. claude-opus-5 at max leads at
   73.7% but costs $11.84/task. gpt-5-6-sol at medium gets 61.1% for $1.86 —
   6.4x cheaper for 12.6 points less. Which of those is "best" depends entirely
   on whether a failed attempt costs you more than $10 of human time.

Credit where it's due: the numbers are the public DeepSWE leaderboard (v1.1) by
Datacurve — https://deepswe.datacurve.ai/ — 113 agentic tasks, pass@1 over
repeated runs with 95% CIs, generated 2026-07-25. I did not run them, I cite
them. I picked this leaderboard because I ran my own agentic evals against a
private ~1M-line polyglot repo (Java/Go/Python/Vue/React/Next.js) and the
ordering matched, so it's the closest public reference to what I see on real
production code.

Static page, no tracking beyond Cloudflare's aggregate analytics. Data is also
at /api/benchmark.json (CORS open, attribution travels with it) if you'd rather
plot it yourself.
```

---

# X / Twitter

```
Coding-agent leaderboards rank by score. That hides the actual decision.

Same model, different reasoning effort:
· gpt-5-5 low   → 27.0% @ $1.20/task
· gpt-5-5 xhigh → 67.0% @ $7.23/task

40 points, 6x the bill. Tune effort before you switch vendors.

50 configs charted vs cost, Pareto frontier marked:
https://e-acc.ai/benchmark

(numbers: DeepSWE v1.1 by @datacurve — I cite, don't own)
```

---

## Timing & etiquette

- **Best window**: weekday 08:00–10:00 US Eastern (13:00–15:00 UTC).
- **Do not** post the same day as another Show HN of yours.
- Be in the thread for the first two hours. The likely top comment is "how were
  these measured?" — answer with the METHOD section and the Datacurve link.
- If someone notes the data is Datacurve's, agree immediately and loudly: that
  framing is already on the page, in the API payload, and in llms.txt.
- Refresh first (`node gen/fetch-benchmark.mjs`) and re-check these numbers, so
  the post and the page never disagree.
