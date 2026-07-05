# Never monetize provider-controlled quota (no capacity arbitrage)

Three product ideas were evaluated and rejected on the same day (2026-07-05): ATB (a
lending/collateral protocol over LLM API quota), a sub2api-style gateway (converting
consumer subscriptions into API endpoints), and reselling surplus tokens/credits. All
three die on the same wall: **API quota and subscription allowances are non-transferable
IOUs that the provider can freeze at will — usable, not sellable.** Bare resale of access
violates OpenAI/Anthropic ToS (account bans, payment-rail risk, cat-and-mouse against
private-API changes); the only legal "sell capacity" variant — self-hosting open-weight
inference — is a commodity price war against Together/Fireworks/DeepInfra that a
2k-visits/month site cannot win.

**Decision**: this project will never build products whose value is arbitraging access
to third-party model capacity, in any variant. A real product that *consumes* tokens
from our own commercial account and charges for genuine added value remains permitted.
If a future idea smells like "I have access/quota, let me arbitrage it" — reread this
ADR before writing any code.
