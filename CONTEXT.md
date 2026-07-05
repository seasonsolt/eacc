# e-acc.ai — the acceleration terminal

A zero-backend static site that turns organic "e/acc" search traffic into a newsletter
audience, using live AI-acceleration data (releases, prices, token throughput) as the draw.

## Language

### Strategy

**Audience asset**:
The site's reason to exist — an owned audience (newsletter list) built from search
traffic. All pages serve this; monetization follows the audience, never precedes it.
_Avoid_: product, platform, SaaS

**Capacity arbitrage**:
Any scheme that monetizes access to third-party model quota (resale, lending,
subscription-to-API conversion). Permanently banned by ADR-0001.
_Avoid_: token bank, sub2api, quota lending

**Keyword probe**:
A small programmatic page batch (~10 pages) shipped to test whether a template earns
search impressions before scaling it. Expansion requires Search Console evidence.
_Avoid_: bulk rollout, mass generation

**Keyword qualification**:
Making a page eligible to rank: target keyword present in Title, H1 and visible
headings. The first stage of the ranking pipeline, before links and engagement.
_Avoid_: keyword stuffing

### Site concepts

**Altar counter**:
The homepage's live estimate of tokens consumed worldwide since the visitor arrived —
the site's signature element, driven by the token rate in the metrics data.
_Avoid_: token ticker, burn meter

**Acceleration log**:
The curated, sourced timeline of AI events (model / compute / policy / culture) in
`timeline.json`. The homepage log and /timeline page are views of it.
_Avoid_: news feed, changelog

**Frontier event**:
An acceleration-log entry marked `frontier: true` — a frontier-model release. Drives
every days-since metric.

**Days-since metric**:
A live counter of days elapsed since a frontier event, computed client-side at view
time so pages never go stale.

**Price registry**:
`models.json` — the per-model API price table (input/output USD per Mtok, provider,
source). Single source of truth for the calculator and all pricing pages.
_Avoid_: price list, catalog

**Price-of-intelligence series**:
`metrics.json`'s price curve: the cheapest API model matching original GPT-4 over
time. Powers the homepage log-scale chart and the "N× cheaper" headline.

**Weekly update**:
The site's entire operating cadence: edit the three data files, build, verify, push.
Everything regenerates from data; no page is edited by hand except the homepage.
