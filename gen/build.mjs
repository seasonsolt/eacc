// Static site generator. Run: node gen/build.mjs
// Reads page modules + data, emits site/<slug>.html and site/sitemap.xml.
// The homepage (site/index.html) is hand-written and NOT touched here.
import { writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { layout } from "./layout.mjs";

import whatIsEacc from "./pages/what-is-eacc.mjs";
import timeline from "./pages/timeline.mjs";
import calculator from "./pages/calculator.mjs";

const pages = [whatIsEacc, timeline, calculator];
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const siteDir = join(root, "site");
const SITE = "https://e-acc.ai";

for (const page of pages) {
  const html = layout(page);
  writeFileSync(join(siteDir, `${page.slug}.html`), html);
  console.log(`  built ${page.slug}.html (${html.length} bytes)`);
}

// sitemap covers the homepage plus every generated page; lastmod tracks the
// newest of the two data files so weekly data pushes refresh it automatically
const dataDates = ["timeline.json", "metrics.json", "models.json"].map(
  (f) => JSON.parse(readFileSync(join(siteDir, "data", f), "utf8")).updated
);
const lastmod = dataDates.sort().at(-1);

const urls = ["", ...pages.map((p) => p.slug)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${SITE}/${u}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
  </url>`
  )
  .join("\n")}
</urlset>
`;
writeFileSync(join(siteDir, "sitemap.xml"), sitemap);
console.log(`  built sitemap.xml (${urls.length} urls, lastmod ${lastmod})`);
console.log("BUILD OK");
