import { once } from "node:events";
import { Request, Response } from "express";
import {
  ProviderId,
  ProxyEndpoint,
  buildTargetUrl,
  detectProviderFromModel,
  extractApiKey,
  prepareRequestBodyForProvider,
  resolveProviderForRequest,
  transformRequestHeaders
} from "./providers";
import { StatsStore, TokenUsage } from "./stats";

const RESPONSE_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "content-encoding",
  "content-length"
]);

export function createProxyHandler(stats: StatsStore, endpoint: ProxyEndpoint) {
  return async (req: Request, res: Response): Promise<void> => {
    const start = Date.now();
    const endpointLabel = endpoint.replace(/^\/v1\//, "");
    const apiKey = extractApiKey(req.headers);
    const requestBody = isObject(req.body) ? req.body : {};
    const model =
      typeof requestBody.model === "string" && requestBody.model
        ? requestBody.model
        : "unknown";
    const queryProvider =
      typeof req.query.provider === "string" ? req.query.provider : undefined;

    let provider: ProviderId = "custom";

    try {
      const resolution = resolveProviderForRequest({
        model: typeof requestBody.model === "string" ? requestBody.model : undefined,
        headers: req.headers,
        endpoint,
        queryProvider
      });

      if (!resolution) {
        res.status(400).json({
          error:
            "Unable to resolve provider from model. Use a known model prefix or X-Target-URL."
        });
        return;
      }

      provider = resolution.provider;
      const queryString = extractQueryString(req.originalUrl);
      const targetUrl = buildTargetUrl(resolution, endpoint, queryString);
      const upstreamHeaders = transformRequestHeaders(req.headers, provider);

      let outboundBody: string | undefined;
      if (req.method !== "GET") {
        const prepared = prepareRequestBodyForProvider(provider, endpoint, requestBody);
        outboundBody = JSON.stringify(prepared);
        if (!upstreamHeaders.has("content-type")) {
          upstreamHeaders.set("content-type", "application/json");
        }
      }

      const upstream = await fetch(targetUrl, {
        method: req.method,
        headers: upstreamHeaders,
        body: outboundBody
      });

      const streamRequested = requestBody.stream === true;
      const responseContentType = upstream.headers.get("content-type") ?? "";
      const responseIsStream =
        streamRequested || responseContentType.includes("text/event-stream");

      res.status(upstream.status);
      copyResponseHeaders(upstream.headers, res);

      if (responseIsStream && upstream.body) {
        const usage = await pipeStreamAndCaptureUsage(upstream.body, res, provider);
        setImmediate(() => {
          stats.recordRequest({
            provider,
            model,
            endpoint: endpointLabel,
            usage,
            latencyMs: Date.now() - start,
            statusCode: upstream.status,
            stream: true,
            apiKey,
            error: upstream.status >= 400 ? upstream.statusText : null
          });
        });
        return;
      }

      const buffer = Buffer.from(await upstream.arrayBuffer());
      res.end(buffer);
      const usage = parseUsageFromBody(buffer, responseContentType, provider);
      const error = upstream.status >= 400 ? readErrorMessage(buffer) : null;

      setImmediate(() => {
        stats.recordRequest({
          provider,
          model,
          endpoint: endpointLabel,
          usage,
          latencyMs: Date.now() - start,
          statusCode: upstream.status,
          stream: false,
          apiKey,
          error
        });
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown upstream failure";

      if (!res.headersSent) {
        res.status(502).json({
          error: "Upstream request failed",
          details: errorMessage
        });
      } else {
        res.end();
      }

      setImmediate(() => {
        stats.recordRequest({
          provider: detectProviderFromModel(model) ?? provider,
          model,
          endpoint: endpointLabel,
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
          latencyMs: Date.now() - start,
          statusCode: 502,
          stream: Boolean(requestBody.stream),
          apiKey,
          error: errorMessage
        });
      });
    }
  };
}

async function pipeStreamAndCaptureUsage(
  body: ReadableStream<Uint8Array>,
  res: Response,
  provider: ProviderId
): Promise<TokenUsage | undefined> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const parser = new SseUsageParser(provider);

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      if (!value) {
        continue;
      }

      const chunkBuffer = Buffer.from(value);
      const canContinue = res.write(chunkBuffer);
      parser.push(decoder.decode(value, { stream: true }));

      if (!canContinue) {
        await once(res, "drain");
      }
    }

    parser.push(decoder.decode());
    parser.flush();
    res.end();
    return parser.getUsage();
  } catch (error) {
    parser.flush();
    if (!res.writableEnded) {
      res.end();
    }
    const usage = parser.getUsage();
    if (usage) {
      return usage;
    }
    if (error instanceof Error) {
      console.warn("Stream proxy ended with error:", error.message);
    }
    return undefined;
  }
}

class SseUsageParser {
  private buffer = "";
  private usage: TokenUsage | undefined;

  constructor(private readonly provider: ProviderId) {}

  push(chunk: string): void {
    if (!chunk) {
      return;
    }
    this.buffer += chunk.replace(/\r\n/g, "\n");
    this.processBlocks(false);
  }

  flush(): void {
    this.processBlocks(true);
  }

  getUsage(): TokenUsage | undefined {
    return this.usage;
  }

  private processBlocks(flush: boolean): void {
    while (true) {
      const boundary = this.buffer.indexOf("\n\n");
      if (boundary < 0) {
        break;
      }

      const block = this.buffer.slice(0, boundary);
      this.buffer = this.buffer.slice(boundary + 2);
      this.parseBlock(block);
    }

    if (flush && this.buffer.trim()) {
      this.parseBlock(this.buffer);
      this.buffer = "";
    }
  }

  private parseBlock(block: string): void {
    const lines = block.split("\n");
    const dataLines: string[] = [];

    for (const line of lines) {
      if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trimStart());
      }
    }

    if (dataLines.length === 0) {
      return;
    }

    const payload = dataLines.join("\n").trim();
    if (!payload || payload === "[DONE]") {
      return;
    }

    try {
      const parsed = JSON.parse(payload) as unknown;
      const nextUsage = extractUsage(parsed);
      if (!nextUsage) {
        return;
      }
      this.usage = mergeUsage(this.usage, nextUsage, this.provider);
    } catch {
      // Ignore non-JSON events.
    }
  }
}

function copyResponseHeaders(headers: Headers, res: Response): void {
  headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (RESPONSE_HOP_HEADERS.has(lower)) {
      return;
    }
    res.setHeader(key, value);
  });
}

function parseUsageFromBody(
  body: Buffer,
  contentType: string,
  provider: ProviderId
): TokenUsage | undefined {
  const looksJson =
    contentType.includes("application/json") ||
    contentType.includes("+json") ||
    body.toString("utf8", 0, 1) === "{";

  if (!looksJson) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(body.toString("utf8")) as unknown;
    const usage = extractUsage(parsed);
    if (!usage) {
      return undefined;
    }
    return mergeUsage(undefined, usage, provider);
  } catch {
    return undefined;
  }
}

function extractUsage(payload: unknown, depth = 0): TokenUsage | undefined {
  if (depth > 6 || payload === null || payload === undefined) {
    return undefined;
  }

  const direct = normalizeUsage(payload);
  if (direct) {
    return direct;
  }

  if (typeof payload !== "object") {
    return undefined;
  }

  const record = payload as Record<string, unknown>;
  if ("usage" in record) {
    const fromUsage = normalizeUsage(record.usage);
    if (fromUsage) {
      return fromUsage;
    }
  }

  for (const value of Object.values(record)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        const nested = extractUsage(entry, depth + 1);
        if (nested) {
          return nested;
        }
      }
      continue;
    }
    const nested = extractUsage(value, depth + 1);
    if (nested) {
      return nested;
    }
  }

  return undefined;
}

function normalizeUsage(candidate: unknown): TokenUsage | undefined {
  if (!isObject(candidate)) {
    return undefined;
  }

  const input =
    toNumber(candidate.input_tokens) ??
    toNumber(candidate.prompt_tokens) ??
    toNumber(candidate.inputTokens);
  const output =
    toNumber(candidate.output_tokens) ??
    toNumber(candidate.completion_tokens) ??
    toNumber(candidate.outputTokens);
  const total =
    toNumber(candidate.total_tokens) ??
    toNumber(candidate.totalTokens);

  if (input === undefined && output === undefined && total === undefined) {
    return undefined;
  }

  const resolvedInput = input ?? 0;
  const resolvedOutput = output ?? 0;
  const resolvedTotal = total ?? resolvedInput + resolvedOutput;

  return {
    inputTokens:
      input ?? Math.max(0, resolvedTotal - resolvedOutput),
    outputTokens:
      output ?? Math.max(0, resolvedTotal - resolvedInput),
    totalTokens: Math.max(0, resolvedTotal)
  };
}

function mergeUsage(
  current: TokenUsage | undefined,
  next: TokenUsage,
  provider: ProviderId
): TokenUsage {
  if (!current) {
    return next;
  }

  if (provider === "anthropic") {
    const inputTokens = Math.max(current.inputTokens, next.inputTokens);
    const outputTokens = Math.max(current.outputTokens, next.outputTokens);
    const totalTokens = Math.max(
      current.totalTokens,
      next.totalTokens,
      inputTokens + outputTokens
    );
    return { inputTokens, outputTokens, totalTokens };
  }

  return next.totalTokens >= current.totalTokens ? next : current;
}

function readErrorMessage(buffer: Buffer): string | null {
  try {
    const parsed = JSON.parse(buffer.toString("utf8")) as Record<string, unknown>;
    if (typeof parsed.error === "string") {
      return parsed.error;
    }
    if (isObject(parsed.error) && typeof parsed.error.message === "string") {
      return parsed.error.message;
    }
    return null;
  } catch {
    return null;
  }
}

function extractQueryString(originalUrl: string): string {
  const index = originalUrl.indexOf("?");
  if (index < 0) {
    return "";
  }
  return originalUrl.slice(index + 1);
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.floor(parsed));
    }
  }
  return undefined;
}

function isObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null;
}
