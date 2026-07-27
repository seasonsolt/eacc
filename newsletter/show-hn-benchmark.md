<!--
Show HN + X copy for the /benchmark launch.
Every number here is computed from site/data/benchmark.json (DeepSWE by
Datacurve, generated 2026-06-20) — re-verify after each data refresh.
HN rules: title <= 80 chars, no hype words, the URL does the talking.
Post from the account that owns the site; be present in the thread.
-->

# Show HN

**Title** (77 chars — pick one)

```
Show HN: Coding-agent benchmark plotted as capability vs cost per task
```

Alternates:
- `Show HN: The reasoning-effort knob moves coding scores more than switching vendors`
- `Show HN: I charted agentic coding benchmarks against dollars per task`

**URL**

```
https://e-acc.ai/benchmark
```

**First comment** (post immediately after submitting)

```
I kept seeing coding-agent leaderboards ranked by score alone, which makes the
top of the table look like an easy choice. It isn't: the same model at a
different reasoning effort is a different product, at a different price.

So I plotted pass@1 against mean cost per task (log x) and highlighted the
Pareto frontier — the configurations where nothing else is both cheaper and
better. The thing that jumped out:

- gpt-5-5 at medium: 48.0% at $2.34/task
- gpt-5-5 at xhigh:  70.0% at $6.61/task

Same model. 22 points of pass rate, 2.8x the bill. For comparison, in the
$3-5/task band the spread between *different vendors* is about the same size
(62.0% down to 40.3%). The effort knob is doing as much work as the model
choice, and I almost never see it discussed that way.

Other things the chart makes obvious: claude-opus-4-7 pays 7.8x more going
medium -> max for a 22.6 point gain, and best value above 50% is gpt-5-5 high
at ~13.9 points per dollar.

Credit where it's due: the underlying numbers are the public DeepSWE
leaderboard by Datacurve (https://deepswe.datacurve.ai/), 113 agentic tasks,
pass@1 over repeated runs with 95% CIs, generated 2026-06-20. I did not run
these — I cite them. I picked this leaderboard because I ran my own agentic
evals against a private ~1M-line polyglot repo (Java/Go/Python/Vue/React/
Next.js) and the ordering matched, so it's the closest public reference to
what I see on real production code.

The page is static, no tracking beyond Cloudflare's aggregate analytics, and
the data is also at /api/benchmark.json (CORS open, attribution included) if
you want to plot it differently.
```

---

# X / Twitter

```
Coding-agent leaderboards rank by score. That hides the real decision.

Same model, different reasoning effort:
· gpt-5-5 medium → 48.0% @ $2.34/task
· gpt-5-5 xhigh  → 70.0% @ $6.61/task

22 points, 2.8x the bill. Across *vendors* in the $3-5 band the spread is
about the same.

Charted vs cost, Pareto frontier marked:
https://e-acc.ai/benchmark

(numbers: DeepSWE leaderboard by @datacurve — I cite, don't own)
```

---

## Timing & etiquette

- **Best window**: weekday 08:00–10:00 US Eastern (13:00–15:00 UTC).
- **Do not** post the same day as another Show HN of yours.
- Be in the thread for the first two hours; the top comment is often "how were
  these measured?" — the answer is the METHOD section and the Datacurve link.
- If someone points out the data is Datacurve's, agree immediately and loudly:
  that framing is already on the page, in the API payload, and in llms.txt.
- Refresh the data first (`node gen/fetch-benchmark.mjs`) so the page and this
  copy agree on the generated date.
