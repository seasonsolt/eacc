// Shared HTML shell for generated inner pages.
// The homepage (site/index.html) keeps its own hand-written shell; every
// other page is wrapped by layout() so head rules and chrome stay uniform.

const SITE = "https://e-acc.ai";

import { navLinks, footerLinks } from "./nav.mjs";

// The entity this site is about. Attached as `about` on the concept pages and
// mirrored by hand in site/index.html, so Google can tie the spellings people
// actually type — e/acc, eacc, e-acc — to one Wikidata subject instead of
// guessing. "eacc" alone is ambiguous (Kenya's anti-corruption commission owns
// that SERP); the sameAs links are what disambiguate us.
export const EACC_ENTITY = {
  "@type": "Thing",
  name: "Effective accelerationism",
  alternateName: ["e/acc", "eacc", "e-acc", "E/ACC"],
  sameAs: [
    "https://en.wikipedia.org/wiki/Effective_accelerationism",
    "https://www.wikidata.org/wiki/Q123509272",
    "https://effectiveaccelerationism.substack.com/p/repost-effective-accelerationism",
  ],
};

export function layout({ slug, title, description, h1Cmd, h1Text, jsonLd, body, headExtra = "" }) {
  const canonical = slug === "index" ? `${SITE}/` : `${SITE}/${slug}`;
  // nested slugs (pricing/gpt-5-5) load shared assets from the site root
  const depth = slug.split("/").length - 1;
  const base = depth === 0 ? "./" : "../".repeat(depth);
  const crumbs = slug.split("/");
  const breadcrumb = crumbs
    .map((part, i) =>
      i === crumbs.length - 1
        ? `<span>${esc(part)}</span>`
        : `<a href="${base}${esc(crumbs.slice(0, i + 1).join("/"))}">${esc(part)}</a> <span aria-hidden="true">/</span> `
    )
    .join("");
  const jsonLdBlocks = (Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [])
    .map((obj) => `    <script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n    </script>`)
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${SITE}/og.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="preload" href="${base}fonts/vt323.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="${base}fonts/jetbrains-mono-var.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="stylesheet" href="${base}styles.css" />
    <link rel="icon" href="${base}favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="${base}favicon-32.png" sizes="32x32" type="image/png" />
    <link rel="apple-touch-icon" href="${base}apple-touch-icon.png" />
    <link rel="alternate" type="application/rss+xml" title="e/acc — the acceleration log" href="${base}feed.xml" />
${jsonLdBlocks}
${headExtra}  </head>
  <body>
    <div class="crt" aria-hidden="true"></div>

    <header class="statusbar">
      <a class="statusbar-host" href="${base}">e-acc.ai</a>
      <span class="statusbar-sep" aria-hidden="true">─</span>
      <span class="statusbar-tty" aria-hidden="true">tty1</span>
      <nav class="statusbar-nav" aria-label="Sections">
${navLinks(base)}
      </nav>
    </header>

    <main>
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="${base}">~</a> <span aria-hidden="true">/</span> ${breadcrumb}
      </nav>

      <section class="panel page-panel">
        <h1 class="panel-title page-h1">
          <span class="panel-cmd" aria-hidden="true">${esc(h1Cmd)}</span>
          <span class="panel-name">${esc(h1Text)}</span>
        </h1>
${body}
      </section>

      <section class="panel panel-cta" id="subscribe" aria-labelledby="subscribe-title">
        <h2 class="panel-title" id="subscribe-title">
          <span class="panel-cmd" aria-hidden="true">&gt; subscribe --weekly</span>
          <span class="panel-name">The weekly e/acc newsletter</span>
        </h2>
        <p class="cta-lead">One email a week: what accelerated.</p>
        <p class="cta-sub">
          Frontier releases, price drops, compute buildouts — the week's acceleration in five minutes,
          sourced and numeric. Free.
        </p>
        <form
          class="subscribe-main"
          action="https://buttondown.com/api/emails/embed-subscribe/SAC-1988"
          method="post"
          target="_blank"
        >
          <div class="prompt-row">
            <input
              type="email"
              name="email"
              required
              placeholder="you@domain.com"
              autocomplete="email"
              aria-label="Email address"
            />
            <button type="submit">RUN</button>
          </div>
        </form>
      </section>
    </main>

    <footer class="site-footer">
      <a href="${base}">home</a>
      <span aria-hidden="true">·</span>
${footerLinks(base)}
      <a href="mailto:hello@e-acc.ai">hello@e-acc.ai</a>
    </footer>
    <script src="${base}guard.js" defer></script>
  </body>
</html>
`;
}

export function esc(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
