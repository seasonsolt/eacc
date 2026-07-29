// /eacc-glossary — the vocabulary hub. Target cluster: "e/acc glossary",
// "what does decel mean", "p(doom) meaning", "technocapital", "u/acc".
// Doubles as the internal-link target for terms used across the other pages;
// every entry has a stable id so pages can deep-link (./eacc-glossary#decel).

import { EACC_ENTITY } from "../layout.mjs";

const TERMS = [
  {
    id: "accelerationism",
    term: "accelerationism",
    def: "The broad family of positions holding that technological or economic change should be sped up rather than restrained. The label predates e/acc by decades and covers left-wing, right-wing and apolitical variants that agree on little except the throttle.",
  },
  {
    id: "based",
    term: "based / BasedBeffJezos",
    def: "Internet slang for holding a position without hedging for approval. @BasedBeffJezos was the pseudonymous account that co-authored the founding e/acc newsletter and became the movement's most visible figure; Forbes identified him in December 2023 as Guillaume Verdon, a former Google quantum computing engineer.",
  },
  {
    id: "dacc",
    term: "d/acc",
    def: "Defensive, decentralizing, democratic, differential accelerationism — proposed by Vitalik Buterin in November 2023. Accepts that technology should accelerate but argues direction matters as much as speed. Full comparison on the <a href=\"./eacc-vs-dacc\">e/acc vs d/acc page</a>.",
  },
  {
    id: "decel",
    term: "decel",
    def: "e/acc's pejorative for anyone advocating slowdown, pause, licensing or capability restriction. Deliberately broad: it collapses AI-safety researchers, regulators, degrowth advocates and cautious incumbents into one silhouette. Being called a decel is the movement's main rhetorical sanction.",
  },
  {
    id: "doomer",
    term: "doomer",
    def: "Someone who assigns high probability to AI causing catastrophic or existential harm. Used descriptively inside AI-safety circles and pejoratively outside them. The doomer position is about capability outrunning control, which is distinct from the degrowth or anti-tech positions e/acc also opposes.",
  },
  {
    id: "eacc",
    term: "e/acc",
    def: "Effective accelerationism — the position that technological progress, AI above all, should be accelerated rather than restrained. Also written <strong>eacc</strong>, <strong>e-acc</strong> or <strong>E/ACC</strong>. Started as a pseudonymous newsletter on 31 May 2022. See <a href=\"./what-is-eacc\">what is e/acc</a>.",
  },
  {
    id: "ea",
    term: "EA (effective altruism)",
    def: "The movement e/acc's name parodies: an attempt to allocate charitable effort by expected impact. Its AI wing treats catastrophic risk as a top priority and argues for caution at the frontier — the specific position e/acc formed in opposition to.",
  },
  {
    id: "extropic",
    term: "Extropic",
    def: "The hardware company founded by Guillaume Verdon (@BasedBeffJezos) after leaving Google, building thermodynamic computing hardware. Frequently cited as e/acc's proof that the movement builds rather than only posts.",
  },
  {
    id: "frontier-model",
    term: "frontier model",
    def: "The most capable generally-available models at a given moment — the leading edge rather than a fixed capability bar, so the set turns over constantly. This site tags frontier releases in its <a href=\"./timeline\">acceleration timeline</a> and counts the days since each one.",
  },
  {
    id: "kardashev",
    term: "Kardashev scale",
    def: "A 1964 classification by Soviet astronomer Nikolai Kardashev ranking civilizations by the energy they command: planetary (Type I), stellar (Type II), galactic (Type III). e/acc treats climbing it as a civilizational objective rather than a thought experiment.",
  },
  {
    id: "pdoom",
    term: "p(doom)",
    def: "Shorthand for one's subjective probability that AI causes catastrophic or existential harm. Traded as a number in AI discourse — a personal credence, not a measurement. Stating a low p(doom) is an e/acc signal; a high one marks a doomer.",
  },
  {
    id: "pause-letter",
    term: "the pause letter",
    def: "The Future of Life Institute open letter of 22 March 2023 calling for a six-month halt on training systems more powerful than GPT-4. It was never observed in practice and became e/acc's standard example of what deceleration looks like when it is written down.",
  },
  {
    id: "technocapital",
    term: "technocapital",
    def: "The idea that markets and technology form a single self-improving engine — capital funds capability, capability creates returns, returns fund more capability. e/acc treats this loop as the mechanism of progress rather than a side effect of it.",
  },
  {
    id: "techno-optimist-manifesto",
    term: "Techno-Optimist Manifesto",
    def: "Marc Andreessen's October 2023 essay for a16z, which carried e/acc themes — abundance, anti-doom, technology as a moral good — into mainstream venture discourse and named e/acc figures as patron saints. Not an e/acc document, but the reason many people first met the term.",
  },
  {
    id: "thermodynamics",
    term: "the thermodynamic argument",
    def: "e/acc's founding aesthetic: life and intelligence are structures that dissipate energy gradients, so the universe statistically favours more of both. Often invoked via physicist Jeremy England's work on dissipative adaptation. Critics note that a description of what happens is not an argument for what should.",
  },
  {
    id: "uacc",
    term: "u/acc (unconditional accelerationism)",
    def: "The older, darker branch descending from Nick Land and the 1990s CCRU, which holds that the process accelerates regardless of human preference and is indifferent to human flourishing. e/acc borrows the vocabulary and explicitly rejects the nihilism — its version is meant to be pro-human.",
  },
];

const entries = TERMS.map(
  (t) => `            <li id="${t.id}"><strong>${t.term}</strong> — ${t.def}</li>`
).join("\n");

const body = `
        <div class="readme prose">
          <p class="prose-lead">
            The accelerationist vocabulary, defined without the in-group assumption:
            ${TERMS.length} terms that show up in e/acc, d/acc and AI-risk arguments,
            with dates and sources where they exist. Written to be readable by someone who
            has just met the word <strong>e/acc</strong> and wants to know what everyone is
            actually arguing about.
          </p>

          <h2>Terms</h2>
          <ul>
${entries}
          </ul>

          <h2>Keep reading</h2>
          <p class="readme-links">
            <a href="./what-is-eacc">what is e/acc — origin, beliefs, criticism</a>
            <a href="./eacc-vs-dacc">e/acc vs d/acc — the two accelerationisms compared</a>
            <a href="./timeline">the AI acceleration timeline</a>
            <a href="./pricing">what frontier intelligence actually costs</a>
          </p>
        </div>`;

export default {
  slug: "eacc-glossary",
  title: "e/acc Glossary: Accelerationism Terms, Defined | e-acc.ai",
  description:
    "A plain glossary of accelerationism: e/acc, d/acc, decel, doomer, p(doom), technocapital, u/acc and the Kardashev scale — defined with dates, sources and context.",
  h1Cmd: "$ man eacc-glossary",
  h1Text: "e/acc glossary — accelerationism terms, defined",
  keyword: "glossary",
  jsonLd: [
    {
      "@context": "https://schema.org",
      "@type": "DefinedTermSet",
      name: "e/acc glossary",
      url: "https://e-acc.ai/eacc-glossary",
      about: EACC_ENTITY,
      hasDefinedTerm: TERMS.map((t) => ({
        "@type": "DefinedTerm",
        "@id": `https://e-acc.ai/eacc-glossary#${t.id}`,
        name: t.term,
        description: t.def.replace(/<[^>]+>/g, ""),
      })),
    },
  ],
  body,
};
