import { IncomingHttpHeaders } from "node:http";

export type ProviderId =
  | "openai"
  | "anthropic"
  | "google"
  | "qwen"
  | "deepseek"
  | "together"
  | "custom";

export type ProxyEndpoint =
  | "/v1/chat/completions"
  | "/v1/embeddings"
  | "/v1/images/generations"
  | "/v1/models";

export interface ProviderResolution {
  provider: ProviderId;
  customTargetUrl?: string;
}

interface ProviderConfig {
  baseUrl: string;
  endpointMap?: Partial<Record<ProxyEndpoint, string>>;
}

const PROVIDER_CONFIG: Record<Exclude<ProviderId, "custom">, ProviderConfig> = {
  openai: {
    baseUrl: "https://api.openai.com/v1"
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com/v1",
    endpointMap: {
      "/v1/chat/completions": "/messages"
    }
  },
  google: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai"
  },
  qwen: {
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1"
  },
  deepseek: {
    baseUrl: "https://api.deepseek.com/v1"
  },
  together: {
    baseUrl: "https://api.together.ai/v1"
  }
};

const OPENAI_MODEL_PREFIXES = [
  "gpt-",
  "o1-",
  "o3-",
  "dall-e-",
  "text-embedding-"
];

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length"
]);

export function resolveProviderForRequest(params: {
  model?: string;
  headers: IncomingHttpHeaders;
  endpoint: ProxyEndpoint;
  queryProvider?: string;
}): ProviderResolution | null {
  const explicitProvider = parseProviderName(params.queryProvider);
  if (explicitProvider) {
    return { provider: explicitProvider };
  }

  const byModel = detectProviderFromModel(params.model);
  if (byModel) {
    return { provider: byModel };
  }

  const targetHeader = firstHeaderValue(params.headers["x-target-url"]);
  if (targetHeader) {
    return { provider: "custom", customTargetUrl: targetHeader };
  }

  if (params.endpoint === "/v1/models") {
    return { provider: inferProviderFromAuth(params.headers) };
  }

  return null;
}

export function buildTargetUrl(
  resolution: ProviderResolution,
  endpoint: ProxyEndpoint,
  queryString: string
): string {
  const suffix = endpointToProviderPath(endpoint, resolution.provider);
  const cleanQuery = queryString.startsWith("?")
    ? queryString.slice(1)
    : queryString;

  if (resolution.provider === "custom") {
    if (!resolution.customTargetUrl) {
      throw new Error("Custom provider missing X-Target-URL");
    }
    const url = new URL(resolution.customTargetUrl);
    url.pathname = joinPath(url.pathname, suffix);
    if (cleanQuery) {
      url.search = cleanQuery;
    }
    return url.toString();
  }

  const config = PROVIDER_CONFIG[resolution.provider];
  const url = new URL(config.baseUrl);
  url.pathname = joinPath(url.pathname, suffix);
  if (cleanQuery) {
    url.search = cleanQuery;
  }
  return url.toString();
}

export function transformRequestHeaders(
  headers: IncomingHttpHeaders,
  provider: ProviderId
): Headers {
  const outgoing = new Headers();

  for (const [name, value] of Object.entries(headers)) {
    if (value === undefined) {
      continue;
    }
    const lower = name.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lower)) {
      continue;
    }
    const normalizedValue = Array.isArray(value) ? value.join(", ") : value;
    outgoing.set(name, normalizedValue);
  }

  if (provider === "anthropic") {
    const key = readBearerToken(outgoing.get("authorization"));
    if (key) {
      outgoing.delete("authorization");
      outgoing.set("x-api-key", key);
    }
    if (!outgoing.has("anthropic-version")) {
      outgoing.set("anthropic-version", "2023-06-01");
    }
  }

  if (provider === "google") {
    const key = readBearerToken(outgoing.get("authorization"));
    if (key) {
      outgoing.delete("authorization");
      outgoing.set("x-goog-api-key", key);
    }
  }

  return outgoing;
}

export function prepareRequestBodyForProvider(
  provider: ProviderId,
  endpoint: ProxyEndpoint,
  body: unknown
): unknown {
  if (
    provider === "anthropic" &&
    endpoint === "/v1/chat/completions" &&
    isObject(body)
  ) {
    if (looksLikeAnthropicNative(body)) {
      return body;
    }
    return transformOpenAIToAnthropic(body);
  }
  return body;
}

export function extractApiKey(headers: IncomingHttpHeaders): string | undefined {
  const authHeader = firstHeaderValue(headers.authorization);
  const bearer = readBearerToken(authHeader);
  if (bearer) {
    return bearer;
  }
  return (
    firstHeaderValue(headers["x-api-key"]) ??
    firstHeaderValue(headers["x-goog-api-key"])
  );
}

export function detectProviderFromModel(model?: string): ProviderId | null {
  if (!model) {
    return null;
  }

  const normalized = model.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if (OPENAI_MODEL_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return "openai";
  }
  if (normalized.startsWith("claude-")) {
    return "anthropic";
  }
  if (normalized.startsWith("gemini-") || normalized.startsWith("models/gemini-")) {
    return "google";
  }
  if (normalized.startsWith("qwen-")) {
    return "qwen";
  }
  if (normalized.startsWith("deepseek-")) {
    return "deepseek";
  }
  if (normalized.startsWith("llama-") || normalized.startsWith("meta-")) {
    return "together";
  }
  return null;
}

function endpointToProviderPath(
  endpoint: ProxyEndpoint,
  provider: ProviderId
): string {
  if (provider === "custom") {
    return endpoint;
  }

  const config = PROVIDER_CONFIG[provider];
  const mapped = config.endpointMap?.[endpoint];
  if (mapped) {
    return mapped;
  }
  return endpoint.replace(/^\/v1/, "");
}

function parseProviderName(input?: string): Exclude<ProviderId, "custom"> | null {
  if (!input) {
    return null;
  }
  const normalized = input.trim().toLowerCase();
  if (normalized === "openai") {
    return "openai";
  }
  if (normalized === "anthropic" || normalized === "claude") {
    return "anthropic";
  }
  if (normalized === "google" || normalized === "gemini") {
    return "google";
  }
  if (normalized === "qwen" || normalized === "dashscope") {
    return "qwen";
  }
  if (normalized === "deepseek") {
    return "deepseek";
  }
  if (
    normalized === "together" ||
    normalized === "meta" ||
    normalized === "llama"
  ) {
    return "together";
  }
  return null;
}

function inferProviderFromAuth(headers: IncomingHttpHeaders): Exclude<ProviderId, "custom"> {
  const auth = firstHeaderValue(headers.authorization);
  const token = readBearerToken(auth) ?? "";
  const normalized = token.toLowerCase();

  if (normalized.startsWith("sk-ant")) {
    return "anthropic";
  }
  if (normalized.startsWith("ai")) {
    return "google";
  }
  if (normalized.startsWith("sk-deepseek")) {
    return "deepseek";
  }
  return "openai";
}

function firstHeaderValue(
  value: string | string[] | undefined
): string | undefined {
  if (!value) {
    return undefined;
  }
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function readBearerToken(authHeader: string | null | undefined): string | undefined {
  if (!authHeader) {
    return undefined;
  }
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return undefined;
  }
  return match[1].trim();
}

function joinPath(basePath: string, appendPath: string): string {
  if (!appendPath) {
    return basePath || "/";
  }
  if (basePath.endsWith("/") && appendPath.startsWith("/")) {
    return `${basePath}${appendPath.slice(1)}`;
  }
  if (!basePath.endsWith("/") && !appendPath.startsWith("/")) {
    return `${basePath}/${appendPath}`;
  }
  return `${basePath}${appendPath}`;
}

function looksLikeAnthropicNative(body: Record<string, unknown>): boolean {
  if (body.anthropic_version !== undefined) {
    return true;
  }
  if (!Array.isArray(body.messages)) {
    return false;
  }

  const openAiOnlyKeys = [
    "frequency_penalty",
    "presence_penalty",
    "response_format",
    "n",
    "logit_bias",
    "stream_options",
    "parallel_tool_calls",
    "max_completion_tokens"
  ];
  for (const key of openAiOnlyKeys) {
    if (key in body) {
      return false;
    }
  }

  for (const message of body.messages) {
    if (isObject(message) && message.role === "system") {
      return false;
    }
  }

  return "max_tokens" in body;
}

function transformOpenAIToAnthropic(body: Record<string, unknown>): Record<string, unknown> {
  const inputMessages = Array.isArray(body.messages) ? body.messages : [];
  const anthropicMessages: Array<Record<string, unknown>> = [];
  const systemParts: string[] = [];

  for (const rawMessage of inputMessages) {
    if (!isObject(rawMessage)) {
      continue;
    }

    const role = typeof rawMessage.role === "string" ? rawMessage.role : "user";
    if (role === "system") {
      const text = toPlainText(rawMessage.content);
      if (text) {
        systemParts.push(text);
      }
      continue;
    }

    anthropicMessages.push({
      role: role === "assistant" ? "assistant" : "user",
      content: convertMessageContent(rawMessage.content)
    });
  }

  const transformed: Record<string, unknown> = {
    model: body.model,
    messages: anthropicMessages,
    max_tokens: toSafeNumber(
      body.max_tokens ?? body.max_completion_tokens ?? 1024
    ),
    stream: Boolean(body.stream)
  };

  if (systemParts.length > 0) {
    transformed.system = systemParts.join("\n\n");
  }
  if (body.temperature !== undefined) {
    transformed.temperature = body.temperature;
  }
  if (body.top_p !== undefined) {
    transformed.top_p = body.top_p;
  }
  if (body.top_k !== undefined) {
    transformed.top_k = body.top_k;
  }
  if (typeof body.stop === "string") {
    transformed.stop_sequences = [body.stop];
  } else if (Array.isArray(body.stop)) {
    transformed.stop_sequences = body.stop;
  }

  if (Array.isArray(body.tools)) {
    const mappedTools = mapOpenAITools(body.tools);
    if (mappedTools.length > 0) {
      transformed.tools = mappedTools;
    }
  }

  if (body.tool_choice !== undefined) {
    transformed.tool_choice = mapToolChoice(body.tool_choice);
  }

  return transformed;
}

function convertMessageContent(content: unknown): unknown {
  if (typeof content === "string") {
    return content;
  }
  if (!Array.isArray(content)) {
    return content === undefined ? "" : String(content);
  }

  const blocks: Array<Record<string, unknown>> = [];
  for (const part of content) {
    if (typeof part === "string") {
      blocks.push({ type: "text", text: part });
      continue;
    }
    if (!isObject(part)) {
      continue;
    }

    const type = typeof part.type === "string" ? part.type : "";
    if (type === "text" || type === "input_text") {
      blocks.push({
        type: "text",
        text:
          typeof part.text === "string"
            ? part.text
            : typeof part.input_text === "string"
              ? part.input_text
              : ""
      });
      continue;
    }

    if (type === "image_url") {
      const imageUrl = isObject(part.image_url) ? part.image_url.url : undefined;
      if (typeof imageUrl === "string") {
        blocks.push({ type: "text", text: `[image] ${imageUrl}` });
      }
      continue;
    }

    if (type === "tool_use" || type === "tool_result" || type === "image") {
      blocks.push(part);
      continue;
    }

    if (typeof part.text === "string") {
      blocks.push({ type: "text", text: part.text });
      continue;
    }

    blocks.push({ type: "text", text: JSON.stringify(part) });
  }

  return blocks.length > 0 ? blocks : "";
}

function mapOpenAITools(
  tools: unknown[]
): Array<Record<string, unknown>> {
  const mapped: Array<Record<string, unknown>> = [];

  for (const tool of tools) {
    if (!isObject(tool)) {
      continue;
    }

    if (tool.type === "function" && isObject(tool.function)) {
      mapped.push({
        name: tool.function.name,
        description: tool.function.description,
        input_schema: tool.function.parameters ?? {
          type: "object",
          properties: {}
        }
      });
      continue;
    }

    if (
      typeof tool.name === "string" &&
      isObject(tool.input_schema)
    ) {
      mapped.push({
        name: tool.name,
        description: tool.description,
        input_schema: tool.input_schema
      });
    }
  }

  return mapped;
}

function mapToolChoice(toolChoice: unknown): unknown {
  if (typeof toolChoice === "string") {
    if (toolChoice === "required") {
      return { type: "any" };
    }
    return { type: "auto" };
  }

  if (!isObject(toolChoice)) {
    return { type: "auto" };
  }

  if (toolChoice.type === "function" && isObject(toolChoice.function)) {
    return {
      type: "tool",
      name: toolChoice.function.name
    };
  }

  if (typeof toolChoice.type === "string") {
    return toolChoice;
  }

  return { type: "auto" };
}

function toPlainText(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }
  if (!Array.isArray(content)) {
    return "";
  }
  const parts: string[] = [];
  for (const item of content) {
    if (typeof item === "string") {
      parts.push(item);
      continue;
    }
    if (isObject(item) && typeof item.text === "string") {
      parts.push(item.text);
    }
  }
  return parts.join("\n");
}

function toSafeNumber(value: unknown): number {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) {
    return 0;
  }
  return Math.max(0, Math.floor(num));
}

function isObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null;
}
