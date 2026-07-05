# CLAUDE.md

e-acc.ai — the e/acc acceleration terminal. Static site (phosphor-CRT aesthetic),
zero dependencies, generated from JSON data and deployed on Cloudflare Pages
(build output directory `site/`, configured in `wrangler.toml`).

## Commands

- `npm run build` — regenerate all pages + sitemap from `site/data/*.json` (`gen/build.mjs`)
- `npm run verify` — full-site contract tests: data schemas, per-page TDH, canonicals,
  cross-page link graph, sitemap consistency (`site/verify.mjs`)
- `npm test` — unit tests for the calculator's pure math module
- `node gen/indexnow.mjs` — push sitemap URLs to IndexNow (Bing/Yandex) after deploys

## Rules

- The homepage (`site/index.html`) is hand-written; all other pages are generated —
  edit `gen/pages/*.mjs` templates, never the emitted `site/*.html`.
- Never change or repurpose an already-indexed URL; new content only ever adds pages.
- Weekly data update = edit `site/data/*.json` → build → verify → push (auto-deploys).
- Run build + verify + test before claiming any change is done.

## Agent skills

### Issue tracker

Issues and PRDs live in GitHub Issues (seasonsolt/eacc) via the `gh` CLI; external PRs are NOT a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical roles use their default strings (needs-triage / needs-info / ready-for-agent / ready-for-human / wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
