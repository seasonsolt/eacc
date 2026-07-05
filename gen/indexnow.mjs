// Submit every sitemap URL to IndexNow (Bing, Yandex, Seznam, Naver …).
// Run after each deploy that adds or changes pages: node gen/indexnow.mjs
// Google ignores IndexNow — use Search Console for Google.
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const siteDir = join(dirname(fileURLToPath(import.meta.url)), "..", "site");
const HOST = "e-acc.ai";

const keyFile = readdirSync(siteDir).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) {
  console.error("no IndexNow key file (site/<32-hex>.txt) found");
  process.exit(1);
}
const key = keyFile.replace(".txt", "");

const sitemap = readFileSync(join(siteDir, "sitemap.xml"), "utf8");
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOST,
    key,
    keyLocation: `https://${HOST}/${keyFile}`,
    urlList,
  }),
});

console.log(`submitted ${urlList.length} urls → HTTP ${res.status} ${res.statusText}`);
if (!res.ok && res.status !== 202) {
  console.error(await res.text());
  process.exit(1);
}
