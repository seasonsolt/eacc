// /eacc-vs-dacc — the comparison page. Target cluster: "e/acc vs d/acc",
// "what is d/acc", "defensive accelerationism", "d/acc meaning".
// Split out of /what-is-eacc, which only had one paragraph on it.

import { EACC_ENTITY } from "../layout.mjs";

const FAQ = [
  {
    q: "What does d/acc stand for?",
    a: "Vitalik Buterin gave the d four readings — defense, decentralization, democracy and differential — and uses them interchangeably. The common thread is that acceleration should be aimed, not uniform: build the technologies that favour defenders, distribute power, and survive contact with adversaries.",
  },
  {
    q: "Is d/acc anti-e/acc?",
    a: "Not by its author's account. Buterin framed d/acc as a subspecies of e/acc rather than its opposite — same optimism about technology, narrower selection of which technologies to push hardest. Much of the e/acc side reads that selection step as deceleration with better branding.",
  },
  {
    q: "Who coined d/acc and when?",
    a: "Vitalik Buterin, in the essay \"My techno-optimism\" published on 27 November 2023 — about a month after Marc Andreessen's Techno-Optimist Manifesto and eighteen months after the founding e/acc newsletter.",
  },
  {
    q: "What is the actual disagreement?",
    a: "Whether direction is a separate variable from speed. d/acc says some technologies reliably improve the world and others do not, and that profit maximization will not sort them for you. e/acc says any committee empowered to sort them becomes the bottleneck, and that the sorting is done better and faster by deployment.",
  },
  {
    q: "Is d/acc the same as AI safety?",
    a: "No. AI-safety and pause arguments are usually about restraining frontier capability until alignment catches up. d/acc is about building more of a particular kind of technology — defensive, decentralizing — rather than building less. It shares e/acc's build-first instinct and the safety camp's belief that direction matters.",
  },
];

const body = `
        <div class="readme prose">
          <p class="prose-lead">
            <strong>e/acc</strong> says accelerate technology, full stop.
            <strong>d/acc</strong> — Vitalik Buterin's defensive, decentralizing,
            democratic, <em>differential</em> accelerationism — says accelerate, but aim.
            Both are pro-technology and anti-stagnation. The whole argument is about whether
            "which technology" is a question you are allowed to ask before shipping.
          </p>

          <h2>The short answer</h2>
          <p>
            e/acc treats technological progress as a single axis and speed as the only
            virtue: the expected cost of slowing down — unsolved disease, poverty, stagnation —
            exceeds the risks of moving fast. d/acc accepts the optimism and rejects the single
            axis. Buterin's claim is that magnitude and direction are different variables, that
            some technologies reliably leave the world better and others reliably do not, and
            that markets will not automatically pick the first kind.
          </p>
          <p>
            Notably, he did not position this as opposition. In
            <a href="https://vitalik.eth.limo/general/2023/11/27/techno_optimism.html" target="_blank" rel="noopener">My techno-optimism</a>
            (27 November 2023) he wrote that "d/acc is a subspecies of e/acc" — just a more
            selective and intentional one.
          </p>

          <h2>What the "d" stands for</h2>
          <ul>
            <li><strong>Defense:</strong> favour technologies that help defenders more than attackers — biodefense over bioweapons capability, resilient infrastructure over brittle centralized systems.</li>
            <li><strong>Decentralization:</strong> avoid architectures whose failure mode is one actor holding the switch.</li>
            <li><strong>Democracy:</strong> keep the ability to steer distributed across many people rather than concentrated in a lab, a firm or a state.</li>
            <li><strong>Differential:</strong> the umbrella idea — accelerate unevenly, on purpose, rather than uniformly.</li>
          </ul>

          <h2>Where the two actually agree</h2>
          <ul>
            <li>Stagnation is a real and underrated danger, not a safe default.</li>
            <li>The future should be built, and built by people who ship.</li>
            <li>Degrowth and blanket pause proposals are the wrong instrument.</li>
            <li>Concentration of AI capability in a few incumbents is bad — though they blame different mechanisms for it.</li>
          </ul>

          <h2>Where they split</h2>
          <p>
            The split is over the <strong>filter</strong>. d/acc requires a step where you
            evaluate a technology's directional effect before pushing it. e/acc's standard
            objection is that this step has no neutral operator: whoever performs it acquires
            veto power, veto power attracts incumbents and regulators, and the result is
            deceleration arriving under a friendlier name. On the e/acc reading, "differential"
            is where <a href="./eacc-glossary#decel">decel</a> gets in.
          </p>
          <p>
            The d/acc reply is that the filter already exists and is currently called
            "whatever is most profitable this quarter" — that declining to choose a direction
            is itself a choice, and a worse-calibrated one.
          </p>

          <h2>A third position: AI safety and the pause camp</h2>
          <p>
            Neither of these is the AI-safety position, though e/acc rhetoric often collapses
            all three. The safety and pause arguments — the 2023 open letter, alignment-first
            research agendas — are about slowing frontier capability until control methods
            mature. d/acc does not ask for less building; it asks for different building.
            That is why d/acc gets attacked from both sides: too permissive for
            <a href="./eacc-glossary#doomer">doomers</a>, too fussy for e/acc.
          </p>

          <h2>Frequently asked questions</h2>
          <dl class="faq">
${FAQ.map(
  ({ q, a }) => `            <dt>${q}</dt>
            <dd>${a}</dd>`
).join("\n")}
          </dl>

          <h2>Keep reading</h2>
          <p class="readme-links">
            <a href="./what-is-eacc">what is e/acc — the full explainer</a>
            <a href="./eacc-glossary">e/acc glossary: decel, doomer, p(doom), technocapital</a>
            <a href="./timeline">the AI acceleration timeline — what actually shipped</a>
            <a href="https://vitalik.eth.limo/general/2023/11/27/techno_optimism.html" target="_blank" rel="noopener">Buterin, My techno-optimism (2023)</a>
            <a href="https://a16z.com/the-techno-optimist-manifesto/" target="_blank" rel="noopener">Andreessen, The Techno-Optimist Manifesto (2023)</a>
          </p>
        </div>`;

export default {
  slug: "eacc-vs-dacc",
  title: "e/acc vs d/acc: Accelerationism's Two Camps | e-acc.ai",
  description:
    "e/acc vs d/acc compared: what Vitalik Buterin's defensive accelerationism proposes, the four meanings of the d, where the two camps agree, and where they split.",
  h1Cmd: "$ diff eacc.md dacc.md",
  h1Text: "e/acc vs d/acc — the two accelerationisms, compared",
  keyword: "d/acc",
  jsonLd: [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      about: EACC_ENTITY,
      mainEntity: FAQ.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  ],
  body,
};
