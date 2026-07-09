# Measured traffic is ~140 visits/month, not ~2k — the audience thesis is dead

On 2026-07-07 we finally read Cloudflare Web Analytics (it had been recording
via automatic setup for ~4 months; we had wrongly assumed no analytics existed).
Reality for **e-acc.ai**, bots excluded, last 21 days: **100 visits, 170 page
views** — roughly **140 visits / 240 page views per month**. The "~2k organic
visits/month" figure that ADR-0002 and the entire SEO replan were built on was
never measured; it was a guess from domain history and e/acc term popularity,
and it is off by ~14×.

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
