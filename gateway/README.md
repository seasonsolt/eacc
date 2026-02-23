# EACC Gateway

Transparent AI API Gateway proxy for the e-accs Token Sacrifice Altar.

## What It Does

- OpenAI-compatible proxy routes:
  - `POST /v1/chat/completions`
  - `POST /v1/embeddings`
  - `POST /v1/images/generations`
  - `GET /v1/models`
- Detects provider from model prefix and forwards requests to the right upstream.
- Passes user API keys through directly (never stores plaintext keys).
- Extracts token usage from normal and streaming responses.
- Persists request stats in SQLite.
- Exposes dashboard stats endpoints:
  - `GET /api/stats`
  - `GET /api/stats/history?days=30`
  - `GET /api/stats/live` (SSE)
- Health endpoint:
  - `GET /health`

## Provider Mapping

- `gpt-*`, `o1-*`, `o3-*`, `dall-e-*`, `text-embedding-*` -> OpenAI
- `claude-*` -> Anthropic (header + body transforms)
- `gemini-*`, `models/gemini-*` -> Google (OpenAI-compatible endpoint)
- `qwen-*` -> DashScope
- `deepseek-*` -> DeepSeek
- `llama-*`, `meta-*` -> Together
- fallback -> `X-Target-URL` header is required

## Anthropic Transform

For `claude-*` chat requests:

- `Authorization: Bearer ...` becomes `x-api-key: ...`
- Adds `anthropic-version: 2023-06-01`
- Converts OpenAI chat payload shape to Anthropic Messages API shape when needed

## Setup

```bash
npm install
npm run dev
```

Production:

```bash
npm run build
npm start
```

## Environment

- `PORT` (default: `4000`)
- `DB_PATH` (default: `gateway.db`)

## Example Client Usage

```ts
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "http://localhost:4000/v1",
  apiKey: process.env.OPENAI_API_KEY
});

const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "hello" }]
});

console.log(response.usage);
```
