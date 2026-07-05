// /what-is-eacc — the concept hub. Target cluster: "what is e/acc",
// "e/acc meaning", "effective accelerationism explained", "e/acc vs d/acc".

const FAQ = [
  {
    q: "What does e/acc stand for?",
    a: "e/acc is short for effective accelerationism — a pro-technology movement holding that accelerating technological progress, especially AI, is the best path for civilization. The name is a deliberate riff on effective altruism (EA), whose caution about AI risk e/acc explicitly rejects.",
  },
  {
    q: "Who started e/acc?",
    a: "A pseudonymous group on Twitter/X: @zestular authored the founding newsletter post on May 31, 2022, together with @BasedBeffJezos, @bayeslord and @creatine_cycle. Forbes later identified @BasedBeffJezos as Guillaume Verdon, a former Google quantum computing engineer.",
  },
  {
    q: "What do e/acc people actually believe?",
    a: "That growth and technological capability are moral goods; that building is how problems get solved; that intelligence and energy use should expand up the Kardashev scale; and that slowing AI development costs more lives and prosperity than it protects.",
  },
  {
    q: "What is the difference between e/acc and d/acc?",
    a: "d/acc — defensive or decentralized accelerationism, proposed by Vitalik Buterin in 2023 — agrees technology should advance but wants differential acceleration: prioritize defensive, decentralizing technologies over raw capability. e/acc generally rejects that filtering as decel in disguise.",
  },
  {
    q: "Is e/acc the same as the Techno-Optimist Manifesto?",
    a: "No, but they rhyme. Marc Andreessen's 2023 manifesto endorsed many e/acc themes — techno-capital, abundance, anti-doom — and cited e/acc figures, which pushed the movement into mainstream venture discourse.",
  },
  {
    q: "Is e/acc a real organization?",
    a: "No. It has no formal structure, membership, or leadership — it is a banner people put in their bio. That is part of the design: it spreads as a meme, not as an institution.",
  },
];

const body = `
        <div class="readme prose">
          <p class="prose-lead">
            <strong>Effective accelerationism (e/acc)</strong> is the position that technological
            progress — artificial intelligence above all — should be accelerated rather than
            restrained: growth is a moral good, building is how problems get solved, and
            civilization's trajectory should bend up the Kardashev gradient, toward commanding
            more energy and more intelligence.
          </p>

          <h2>e/acc meaning: the short version</h2>
          <p>
            The name parodies <em>effective altruism</em>. Where EA's AI wing argues for caution,
            alignment research and slowdowns, e/acc argues the opposite: the expected cost of
            slowing AI — in unsolved disease, poverty and stagnation — exceeds its risks. The
            movement's aesthetic is thermodynamic: life and intelligence are engines for
            dissipating energy gradients, and the universe "wants" more of both. Accelerate is
            both the diagnosis and the prescription.
          </p>

          <h2>Origins: a pseudonymous newsletter, May 2022</h2>
          <p>
            e/acc began as a
            <a href="https://effectiveaccelerationism.substack.com/p/repost-effective-accelerationism" target="_blank" rel="noopener">newsletter post published on May 31, 2022</a>
            by four pseudonymous accounts — @zestular, @BasedBeffJezos, @bayeslord and
            @creatine_cycle — part physics riff, part meme, part reaction to AI-safety pessimism.
            In December 2023, Forbes identified @BasedBeffJezos as
            <strong>Guillaume Verdon</strong>, a former Google quantum computing engineer who went
            on to found the hardware startup Extropic.
          </p>

          <h2>Core beliefs</h2>
          <ul>
            <li><strong>Techno-capital acceleration:</strong> markets plus technology form a self-improving engine that reliably converts energy into order, wealth and intelligence.</li>
            <li><strong>Kardashev climbing:</strong> civilization should measure itself by the energy it commands — planetary, stellar, galactic — and act accordingly.</li>
            <li><strong>Anti-doom:</strong> catastrophic-risk narratives are treated as poorly calibrated and as cover for regulatory capture by incumbents.</li>
            <li><strong>Building over permission:</strong> ship first; legitimacy comes from working artifacts, not credentials or committees.</li>
          </ul>

          <h2>e/acc vs EA, d/acc and the decels</h2>
          <p>
            <strong>vs effective altruism:</strong> EA's AI-safety wing wants to slow down at the
            frontier; e/acc holds that deceleration is the actual existential risk.
            <strong>vs d/acc:</strong> Vitalik Buterin's defensive accelerationism (2023) accepts
            acceleration but wants it aimed — defense, decentralization, biosecurity first; e/acc
            mostly reads the filtering as decel with better branding.
            <strong>vs doomers/decels:</strong> the catch-all label for pause advocates; the
            disagreement is total.
          </p>

          <h2>Key people and moments</h2>
          <p>
            Guillaume Verdon (@BasedBeffJezos) remains the movement's face. Marc Andreessen's
            <a href="https://a16z.com/the-techno-optimist-manifesto/" target="_blank" rel="noopener">Techno-Optimist Manifesto</a>
            (October 2023) carried e/acc themes into mainstream venture discourse, and investors
            like Garry Tan wore the suffix publicly. The 2024 U.S. election cycle pulled several
            e/acc-aligned positions — deregulation, energy expansion, open-source AI — into
            actual policy debate. The full sequence lives on our
            <a href="./timeline">AI acceleration timeline</a>.
          </p>

          <h2>Criticism</h2>
          <p>
            Critics call e/acc a vibe more than a philosophy: thin on mechanism, dismissive of
            genuine alignment problems, and convenient for whoever is currently selling compute.
            Wikipedia files it under fringe movements; AI-safety researchers note that "the
            universe wants entropy dissipated" is not a safety argument. e/acc's usual reply:
            the burden of proof sits with whoever wants to stop the only process that has ever
            reliably reduced poverty.
          </p>

          <h2>Frequently asked questions</h2>
          <dl class="faq">
${FAQ.map(
  ({ q, a }) => `            <dt>${q}</dt>
            <dd>${a}</dd>`
).join("\n")}
          </dl>

          <h2>Watch the acceleration itself</h2>
          <p>
            This site is an instrument panel, not a membership card: a
            <a href="./">live token-burn counter</a>, the
            <a href="./timeline">frontier release timeline</a> and a
            <a href="./calculator">token cost calculator</a>. Draw your own conclusions —
            preferably from data.
          </p>
        </div>`;

export default {
  slug: "what-is-eacc",
  title: "What is e/acc? Effective Accelerationism, Explained | e-acc.ai",
  description:
    "e/acc (effective accelerationism) explained: what it means, who started it, core beliefs, e/acc vs d/acc and EA, key people, criticism — with sources and a live timeline.",
  h1Cmd: "$ cat what-is-eacc.md",
  h1Text: "What is e/acc — effective accelerationism, explained",
  keyword: "e/acc",
  jsonLd: [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  ],
  body,
};
