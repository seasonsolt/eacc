// Single source of truth for site chrome links.
// Adding a top-level page? Add it here once — layout.mjs renders the header
// and footer from this list, and verify.mjs asserts every entry is reachable
// from every page. That is what stopped /benchmark from being orphaned.
export const NAV = [
  { slug: "what-is-eacc", nav: "e/acc?", footer: "what is e/acc" },
  { slug: "timeline", nav: "timeline", footer: "AI timeline" },
  { slug: "pricing", nav: "pricing", footer: "LLM pricing" },
  { slug: "benchmark", nav: "benchmark", footer: "coding benchmark" },
  { slug: "calculator", nav: "calculator", footer: "token calculator" },
  { slug: "api", nav: "api", footer: "API &amp; RSS" },
];

export const navLinks = (base) =>
  NAV.map((n) => `        <a href="${base}${n.slug}">${n.nav}</a>`).join("\n");

export const footerLinks = (base) =>
  NAV.map((n) => `      <a href="${base}${n.slug}">${n.footer}</a>\n      <span aria-hidden="true">·</span>`).join("\n");
