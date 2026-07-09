# Measured traffic is ~140 visits/month, not ~2k — the audience thesis is dead

On 2026-07-07 we reconciled two Cloudflare measurement systems that had both
been running for ~4 months (we had wrongly assumed no analytics existed):

- **Zone Overview** (edge/IP-based, bot-inclusive): **1.78k unique visitors /
  30 days**. This is where the "~2k" figure came from — it is real, but it
  counts every unique IP that touches the domain, dominated by crawlers, SEO
  bots, LLM scrapers, and security scanners.
- **Web Analytics** (JS-beacon, real browsers): **~110 visits / 21 days ≈
  ~150/month**. Toggling "exclude bots" moved this by only 10 (100→110),
  because bots don't execute the beacon JS — so this number is essentially
  pure human traffic.

The two reconcile cleanly: **real human visitors are ~150/month; ~91% of the
1.78k gross-IP figure is bots.** (The beacon may undercount ad-blocking
technical visitors, so true humans could be ~200–350/month — still an order of
magnitude below 2k.) The "~2k organic audience" the audience thesis assumed was
a bot-inclusive edge metric measuring the wrong thing; the addressable human
audience is **low hundreds/month at most.**

**Consequence**: the "audience asset" thesis (ADR-0002) is not viable at this
volume. A newsletter funnel over 140 visits/month yields single-digit
subscribers per month even at a generous conversion rate — not an asset worth a
weekly-update treadmill. The homepage has pulled only ~140/month on the e/acc
brand term over four live months, which is a bearish signal about the brand-term
demand the SEO thesis assumed. **ADR-0002's premise is superseded; its strategy
should not be resumed without a fresh, measured traffic base.**

The site's engineering (generator, verify, pages, RSS/API) is sound and cheap to
keep online, but **no further growth investment is justified until a real
traffic source exists.** Open questions recorded for the owner: what `law.e-acc.ai`
and `e-accs.com` are (possible traffic split / redirect leak), the true source
mix (search vs direct) of the 140, and whether the domain is worth more sold than
operated. Do not build new features on a traffic assumption again — measure first.
