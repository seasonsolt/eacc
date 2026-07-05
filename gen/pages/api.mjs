// /api — docs for the RSS feed and JSON endpoints (eacc#4).
// Target cluster: "ai model releases api", "llm release rss".
// A cite-us surface: tools that embed the data link back here.

const body = `
        <p class="panel-lead">
          The <a href="./timeline">acceleration log</a> is available as a free RSS feed and as
          documented JSON endpoints — for changelogs, dashboards, bots, or a "days since the last
          frontier model" badge. Updated weekly, no key required. If you use it, a link back to
          <strong>e-acc.ai</strong> is appreciated.
        </p>

        <h2 class="panel-title">
          <span class="panel-cmd" aria-hidden="true">$ curl feed.xml</span>
          <span class="panel-name">RSS feed of AI model releases</span>
        </h2>
        <p>
          Subscribe in any reader: <a href="./feed.xml"><code>https://e-acc.ai/feed.xml</code></a>.
          One item per acceleration-log event, newest first; frontier-model releases are tagged
          <code>[frontier]</code> in the title.
        </p>

        <h2 class="panel-title">
          <span class="panel-cmd" aria-hidden="true">$ curl api/timeline.json</span>
          <span class="panel-name">Full timeline JSON endpoint</span>
        </h2>
        <p>
          <a href="./api/timeline.json"><code>https://e-acc.ai/api/timeline.json</code></a> — a
          versioned envelope over every event. CORS is open (<code>Access-Control-Allow-Origin: *</code>),
          so you can fetch it straight from a browser.
        </p>
        <pre class="code-block"><code>{
  "version": 1,
  "updated": "2026-07-05",
  "events": [
    { "date": "2026-06-09", "type": "model", "frontier": true,
      "title": "Claude Fable 5 ships", "detail": "...",
      "source_url": "https://..." }
  ]
}</code></pre>

        <h2 class="panel-title">
          <span class="panel-cmd" aria-hidden="true">$ curl api/latest-frontier.json</span>
          <span class="panel-name">Latest frontier release endpoint</span>
        </h2>
        <p>
          <a href="./api/latest-frontier.json"><code>https://e-acc.ai/api/latest-frontier.json</code></a>
          — just the newest frontier-model release, for a lightweight "days since" badge or bot.
        </p>
        <pre class="code-block"><code>const r = await fetch("https://e-acc.ai/api/latest-frontier.json");
const { event } = await r.json();
const days = Math.floor((Date.now() - Date.parse(event.date)) / 864e5);
console.log(\`\${days} days since \${event.title}\`);</code></pre>

        <h2 class="panel-title">
          <span class="panel-cmd" aria-hidden="true">$ cat NOTES</span>
          <span class="panel-name">Update cadence &amp; stability</span>
        </h2>
        <p>
          Data is refreshed weekly. The <code>version</code> field guards the shape — it only
          bumps on a breaking change, so you can pin against it. See the
          <a href="./timeline">timeline</a> for the human-readable view and
          <a href="./pricing">pricing</a> for model costs.
        </p>`;

export default {
  slug: "api",
  title: "AI Model Release API & RSS Feed — Free JSON | e-acc.ai",
  description:
    "Free API and RSS feed for AI model releases: a versioned JSON timeline, a latest-frontier endpoint, and an RSS feed of frontier launches. CORS-open, no key, updated weekly.",
  h1Cmd: "$ eacc api --docs",
  h1Text: "AI model release API & RSS feed — free, versioned, CORS-open",
  keyword: "api",
  jsonLd: [],
  body,
};
