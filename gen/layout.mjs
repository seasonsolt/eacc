// Shared HTML shell for generated inner pages.
// The homepage (site/index.html) keeps its own hand-written shell; every
// other page is wrapped by layout() so head rules and chrome stay uniform.

const SITE = "https://e-acc.ai";

export function layout({ slug, title, description, h1Cmd, h1Text, jsonLd, body, headExtra = "" }) {
  const canonical = slug === "index" ? `${SITE}/` : `${SITE}/${slug}`;
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
    <link rel="preload" href="./fonts/vt323.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="./fonts/jetbrains-mono-var.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="stylesheet" href="./styles.css" />
${jsonLdBlocks}
${headExtra}  </head>
  <body>
    <div class="crt" aria-hidden="true"></div>

    <header class="statusbar">
      <a class="statusbar-host" href="./">e-acc.ai</a>
      <span class="statusbar-sep" aria-hidden="true">─</span>
      <span class="statusbar-tty" aria-hidden="true">tty1</span>
      <nav class="statusbar-nav" aria-label="Sections">
        <a href="./what-is-eacc">e/acc?</a>
        <a href="./timeline">timeline</a>
        <a href="./calculator">calculator</a>
        <a href="./#subscribe">subscribe</a>
      </nav>
    </header>

    <main>
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="./">~</a> <span aria-hidden="true">/</span> <span>${esc(slug)}</span>
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
          action="https://buttondown.com/api/emails/embed-subscribe/REPLACE_WITH_BUTTONDOWN_USERNAME"
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
      <a href="./">home</a>
      <span aria-hidden="true">·</span>
      <a href="./what-is-eacc">what is e/acc</a>
      <span aria-hidden="true">·</span>
      <a href="./timeline">AI timeline</a>
      <span aria-hidden="true">·</span>
      <a href="./calculator">token calculator</a>
      <span aria-hidden="true">·</span>
      <a href="mailto:hello@e-acc.ai">hello@e-acc.ai</a>
    </footer>
    <script src="./guard.js" defer></script>
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
