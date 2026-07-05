# Zero-dependency generator with committed output, no build step in CI

Pages are generated locally by `gen/build.mjs` (plain Node, zero npm dependencies)
and the emitted HTML is **committed to git**; Cloudflare Pages serves `site/` as-is
with no build command. Alternatives — a CF Pages build step, or a framework (Astro
et al.) — were rejected: the dashboard's build settings were locked by wrangler.toml
quirks, the page count is small (tens, not thousands), and committed output means
deploy == push, diffs are reviewable, and verify.mjs asserts the *exact* bytes that
ship. Trade-off accepted: generated files appear in diffs and must never be edited
by hand (edit `gen/pages/*.mjs` instead; `verify` + the CLAUDE.md rules guard this).
