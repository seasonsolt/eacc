// Static site generator. Run: node gen/build.mjs
// Reads page modules + data, emits site/<slug>.html and site/sitemap.xml.
// The homepage (site/index.html) is hand-written and NOT touched here.
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { layout } from "./layout.mjs";

import whatIsEacc from "./pages/what-is-eacc.mjs";
import timeline from "./pages/timeline.mjs";
import calculator from "./pages/calculator.mjs";
import pricing from "./pages/pricing.mjs";
import api from "./pages/api.mjs";

const pages = [whatIsEacc, timeline, calculator, ...pricing, api];
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const siteDir = join(root, "site");
const SITE = "https://e-acc.ai";

for (const page of pages) {
  const html = layout(page);
  const outPath = join(siteDir, `${page.slug}.html`);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html);
  console.log(`  built ${page.slug}.html (${html.length} bytes)`);
}

// ── RSS feed + JSON API endpoints (eacc#2, eacc#3) ───────────────────────
const timelineData = JSON.parse(readFileSync(join(siteDir, "data", "timeline.json"), "utf8"));
const sortedEvents = [...timelineData.events].sort((a, b) => b.date.localeCompare(a.date));
const escXml = (s) =>
  String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const rfc822 = (ymd) => new Date(`${ymd}T00:00:00Z`).toUTCString();
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const rssItems = sortedEvents
  .map(
    (e) => `    <item>
      <title>${escXml(e.frontier ? `[frontier] ${e.title}` : e.title)}</title>
      <link>${escXml(e.source_url)}</link>
      <guid isPermaLink="false">e-acc.ai:${e.date}:${slugify(e.title)}</guid>
      <pubDate>${rfc822(e.date)}</pubDate>
      <description>${escXml(e.detail)}</description>
      <category>${e.type}</category>
    </item>`
  )
  .join("\n");

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>e/acc — the acceleration log</title>
    <link>${SITE}/timeline</link>
    <description>Frontier model releases, compute buildouts and culture moments — the AI acceleration, dated and sourced. Updated weekly by e-acc.ai.</description>
    <language>en</language>
    <lastBuildDate>${rfc822(timelineData.updated)}</lastBuildDate>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>
`;
writeFileSync(join(siteDir, "feed.xml"), feed);
console.log(`  built feed.xml (${sortedEvents.length} items)`);

mkdirSync(join(siteDir, "api"), { recursive: true });
const apiEnvelope = {
  version: 1,
  updated: timelineData.updated,
  docs: `${SITE}/api`,
  events: sortedEvents,
};
writeFileSync(join(siteDir, "api", "timeline.json"), JSON.stringify(apiEnvelope, null, 2) + "\n");
const latestFrontier = sortedEvents.find((e) => e.frontier);
writeFileSync(
  join(siteDir, "api", "latest-frontier.json"),
  JSON.stringify({ version: 1, updated: timelineData.updated, docs: `${SITE}/api`, event: latestFrontier }, null, 2) + "\n"
);
console.log("  built api/timeline.json + api/latest-frontier.json");

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
