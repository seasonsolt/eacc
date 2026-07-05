# e-acc.ai SEO Replan

## Source Lessons

This plan applies the local SEO notes from the Ge Fei article collection to the current `e-acc.ai` site. The most relevant patterns are:

- Start from real search demand, not from a homepage concept. Each new page should answer a keyword or search intent that a real user would type.
- Keep existing URLs stable. The current homepage at `/` should remain live; new SEO surfaces should be added under new paths.
- Use TDH: every page needs a focused `title`, `description`, one clear `h1`, and supporting `h2`/`h3` headings that map to the page's search intent.
- Build a crawlable tree. The homepage links to section hubs, hubs link to detail pages, detail pages link back upward and sideways to related pages.
- Internal links matter. New pages should appear in the homepage or a hub for at least the launch window, and old pages should link to new related pages.
- Programmatic SEO only works when the page is useful. Structured data plus a template can create many pages, but each page must answer a distinct demand.
- Multilingual SEO should usually use subdirectories for a new site, not subdomains. Add languages only after the English structure has proven demand.

## Current Site Diagnosis

The current production site in `site/` is a polished single-page tracker with:

- One indexable URL: `/`
- One sitemap entry
- No section hubs
- No keyword-specific landing pages
- No crawlable archive for timeline events or metric entries
- Newsletter forms still using a Buttondown placeholder
- Strong data assets in `site/data/timeline.json` and `site/data/metrics.json`
- A gateway product concept in `gateway/` that is not yet represented clearly on the public site

The biggest SEO issue is not visual quality. It is that the site gives Google almost no page inventory and no keyword hierarchy.

## Repositioning

Make `e-acc.ai` a focused site for tracking AI acceleration through measurable indicators:

> e-acc.ai tracks AI acceleration: frontier model releases, AI token usage, inference price collapse, compute buildouts, and effective accelerationism.

This keeps the current identity but turns it into a search-friendly resource.

Primary audience:

- AI builders tracking model releases and cost changes
- Developers comparing AI API economics
- People searching what e/acc means
- Investors/researchers looking for AI acceleration timelines
- Future users of the API gateway/token tracker

## Keyword Clusters

These are planning clusters, not final validated keyword targets. Validate with GSC, Semrush, Ahrefs, Google autocomplete, and competitor pages before writing at scale.

### Cluster 1: e/acc Definition

Primary page:

- `/what-is-eacc/`

Supporting pages:

- `/what-is-effective-accelerationism/`
- `/eacc-vs-ai-safety/`
- `/eacc-glossary/`

Search intent:

- Explain the term
- Give origin and timeline
- Compare with adjacent movements
- Answer beginner questions

### Cluster 2: AI Acceleration Timeline

Primary page:

- `/ai-acceleration-timeline/`

Supporting pages:

- `/ai-model-release-timeline/`
- `/frontier-ai-models/`
- `/ai-compute-timeline/`
- `/ai-policy-timeline/`

Programmatic detail pages:

- `/ai-acceleration-timeline/2026/claude-fable-5/`
- `/ai-acceleration-timeline/2025/gpt-5/`
- `/ai-acceleration-timeline/2024/openai-o1/`

Search intent:

- Find what shipped, when, why it mattered, and source links.

### Cluster 3: AI Token Usage

Primary page:

- `/ai-token-usage/`

Supporting pages:

- `/tokens-per-second/`
- `/ai-token-counter/`
- `/how-many-ai-tokens-are-used-per-day/`
- `/token-sacrifice-tracker/`

Search intent:

- Understand AI token volume
- Convert rates into daily/monthly/yearly numbers
- See sourced estimates

### Cluster 4: AI API Price Tracker

Primary page:

- `/ai-api-price-tracker/`

Supporting pages:

- `/gpt-4-price-history/`
- `/price-of-intelligence/`
- `/ai-model-cost-comparison/`
- `/cheapest-gpt-4-class-model/`

Programmatic detail pages:

- `/ai-api-price-tracker/gpt-4/`
- `/ai-api-price-tracker/gpt-4o/`
- `/ai-api-price-tracker/gemini-2-flash-lite/`

Search intent:

- Compare model cost over time
- Understand how much cheaper inference became
- Find current and historical model prices

### Cluster 5: AI API Gateway

Primary page:

- `/ai-api-gateway/`

Supporting pages:

- `/openai-compatible-api-gateway/`
- `/ai-token-tracking-api/`
- `/bring-your-own-api-key-ai-gateway/`
- `/ai-api-usage-dashboard/`

Search intent:

- Find a practical gateway/proxy
- Understand provider routing
- Track API usage and token burn

This cluster connects SEO to the existing `gateway/` codebase and should become the commercial/product path.

## Information Architecture

Recommended first version:

```text
/
/what-is-eacc/
/ai-acceleration-timeline/
/ai-acceleration-timeline/{year}/{slug}/
/ai-token-usage/
/ai-api-price-tracker/
/ai-api-price-tracker/{model-slug}/
/ai-api-gateway/
/glossary/
/glossary/{term}/
/subscribe/
```

Homepage role:

- Keep the current memorable counter and CRT identity.
- Add clear links to the main hubs above the fold or immediately below the hero.
- Add a latest pages/events block so new pages get internal links from `/`.
- Reduce manifesto text on `/`; move deeper explanation to `/what-is-eacc/`.

Hub page role:

- Target one main keyword.
- Explain the topic.
- Include the relevant tool/chart/table.
- Link to every child page.
- Link sideways to related hubs.

Detail page role:

- Target one narrow intent.
- Use one template, populated by structured data.
- Link back to parent hub and related entries.
- Include source links and last-updated date.

## Page Templates

### Definition Page Template

Use for `/what-is-eacc/` and glossary pages.

- `title`: `What Is e/acc? Effective Accelerationism Explained`
- `description`: `A clear explanation of e/acc, effective accelerationism, its origin, beliefs, timeline, and relationship to AI progress.`
- `h1`: `What Is e/acc?`
- `h2`: Short definition
- `h2`: Origin
- `h2`: Core beliefs
- `h2`: Timeline
- `h2`: e/acc vs AI safety
- `h2`: Related terms
- `h2`: Sources

### Timeline Hub Template

Use for `/ai-acceleration-timeline/`.

- `title`: `AI Acceleration Timeline: Frontier Models, Compute, Policy, and Culture`
- `description`: `A sourced timeline of AI acceleration: model releases, compute buildouts, price drops, policy events, and e/acc culture.`
- `h1`: `AI Acceleration Timeline`
- Filters: model, compute, policy, culture
- Latest events
- Year sections
- Internal links to event detail pages
- JSON-LD: `ItemList` or `CollectionPage`

### Event Detail Template

Use for timeline generated pages.

- `title`: `{Event Title}: Why It Mattered for AI Acceleration`
- `description`: `{One-sentence summary of the event and its importance.}`
- `h1`: `{Event Title}`
- Date
- Category
- Why it mattered
- What changed
- Source
- Related events
- Parent link to timeline

### Price Tracker Template

Use for `/ai-api-price-tracker/`.

- `title`: `AI API Price Tracker: How Fast Intelligence Is Getting Cheaper`
- `description`: `Track AI API prices over time and compare the cost of GPT-4-class intelligence from 2023 to today.`
- `h1`: `AI API Price Tracker`
- Chart
- Current cheapest GPT-4-class model
- Historical price table
- Methodology
- Related model pages
- Sources

### Gateway Product Template

Use for `/ai-api-gateway/`.

- `title`: `AI API Gateway for OpenAI, Anthropic, Gemini, DeepSeek, and More`
- `description`: `An OpenAI-compatible AI API gateway that routes model calls, tracks token usage, and exposes live usage stats.`
- `h1`: `AI API Gateway`
- Problem
- Supported providers
- Token tracking
- Example request
- Dashboard/API endpoints
- Roadmap or waitlist
- Related token/price pages

## Programmatic SEO Plan

Start with small, high-quality batches. Do not publish hundreds of thin pages at once.

Batch 1:

- Generate one detail page for each event in `site/data/timeline.json`.
- Generate one detail page for each model in `site/data/metrics.json`.
- Add all generated URLs to `sitemap.xml`.
- Link latest 5 generated pages from the homepage.
- Link all generated pages from their hub pages.

Batch 2:

- Add glossary pages for recurring terms: `e/acc`, `frontier model`, `tokens per second`, `inference`, `context window`, `compute`, `API token`.
- Add related links between glossary, timeline, price, and token pages.

Batch 3:

- Add multilingual subdirectories only for proven pages:
  - `/zh/what-is-eacc/`
  - `/ja/what-is-eacc/`
  - `/ko/what-is-eacc/`
  - `/es/what-is-eacc/`

Use `hreflang` and language-specific canonical URLs when multilingual pages ship.

## Internal Linking Rules

- Homepage links to all main hubs.
- Homepage has a "latest acceleration events" list sourced from `timeline.json`.
- Each hub links to all child pages.
- Each child page links to its parent hub, homepage, and 3 related pages.
- Every new page must be reachable within 3 clicks from `/`.
- Use descriptive anchor text, not generic "read more".
- Keep a visible footer with the main hubs, glossary, subscribe, and gateway.

## Technical SEO

Add or verify:

- Unique canonical URL on every page
- Unique `title` and `description`
- One `h1` per page
- Logical `h2`/`h3` hierarchy
- `sitemap.xml` generated from route data
- `robots.txt` points to sitemap
- Open Graph tags per page
- `Article`, `WebPage`, `CollectionPage`, or `SoftwareApplication` JSON-LD where appropriate
- 404 page with links back to hubs
- Last-updated dates on data-driven pages
- Source links for claims and metrics

Avoid:

- Changing existing `/`
- Publishing pages that only swap a model name into mostly identical copy
- Making pages that are not linked internally
- Depending only on JavaScript for critical page content

## Content Style

The current site has a strong terminal/movement voice. Keep it for brand memory, but make SEO pages clearer and less cryptic.

Recommended balance:

- Homepage: expressive, memorable, data-forward
- Hubs: clear, useful, lightly branded
- Detail pages: factual, sourced, concise
- Gateway pages: practical and developer-focused

## Rollout

### Phase 1: Foundation

- Keep `/` but add hub navigation and latest pages.
- Create `/what-is-eacc/`, `/ai-acceleration-timeline/`, `/ai-token-usage/`, `/ai-api-price-tracker/`, `/ai-api-gateway/`.
- Replace Buttondown placeholder or remove inactive forms.
- Update sitemap.

### Phase 2: Data Pages

- Generate timeline event pages from `timeline.json`.
- Generate model price pages from `metrics.json`.
- Add source and methodology sections.
- Add related links.

### Phase 3: Gateway Product SEO

- Create developer docs-style content for the gateway.
- Add example OpenAI SDK configuration.
- Add stats API documentation.
- Add a waitlist or working signup.

### Phase 4: Measure and Expand

- Submit sitemap to Google Search Console.
- Track impressions and indexed pages.
- Adjust titles, headings, and internal links based on GSC queries.
- Add multilingual pages only after English pages show impressions.

## First Implementation Slice

Build these files/routes first:

- `/what-is-eacc/`
- `/ai-acceleration-timeline/`
- `/ai-api-price-tracker/`
- `/ai-api-gateway/`
- Generated sitemap with all five URLs
- Homepage section linking to the four new hubs

This is small enough to ship quickly, but large enough to change the site from a one-page brand artifact into a crawlable SEO structure.
