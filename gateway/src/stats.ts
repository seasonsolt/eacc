import Database from "better-sqlite3";
import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import { getRankForTokens, RankResult } from "./ranks";

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface RequestRecordInput {
  provider: string;
  model: string;
  endpoint: string;
  usage?: Partial<TokenUsage> | null;
  latencyMs: number;
  statusCode: number;
  stream: boolean;
  apiKey?: string;
  error?: string | null;
}

export interface HourlyStat {
  hour: string;
  tokens: number;
  requests: number;
}

export interface DailyStat {
  day: string;
  tokens: number;
  requests: number;
}

export interface StatsSnapshot {
  totalTokens: number;
  totalRequests: number;
  tokensToday: number;
  requestsToday: number;
  byModel: Record<string, { tokens: number; requests: number }>;
  byProvider: Record<string, { tokens: number; requests: number }>;
  hourly: HourlyStat[];
  rank: RankResult;
}

interface TotalsRow {
  totalTokens: number;
  totalRequests: number;
}

interface AggregateRow {
  key: string;
  tokens: number;
  requests: number;
}

export class StatsStore {
  private readonly db: Database.Database;
  private readonly events = new EventEmitter();

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("synchronous = NORMAL");
    this.initSchema();
  }

  private initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        input_tokens INTEGER DEFAULT 0,
        output_tokens INTEGER DEFAULT 0,
        total_tokens INTEGER DEFAULT 0,
        latency_ms INTEGER DEFAULT 0,
        status_code INTEGER DEFAULT 200,
        stream INTEGER DEFAULT 0,
        api_key_hash TEXT,
        error TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_requests_timestamp ON requests(timestamp);
      CREATE INDEX IF NOT EXISTS idx_requests_provider ON requests(provider);
      CREATE INDEX IF NOT EXISTS idx_requests_model ON requests(model);
    `);
  }

  recordRequest(input: RequestRecordInput): void {
    const usage = input.usage ?? {};
    const inputTokens = this.toSafeInt(usage.inputTokens ?? 0);
    const outputTokens = this.toSafeInt(usage.outputTokens ?? 0);
    const totalTokens = this.toSafeInt(
      usage.totalTokens ?? inputTokens + outputTokens
    );
    const timestamp = new Date().toISOString();
    const apiKeyHash = input.apiKey ? hashApiKeyPrefix(input.apiKey) : null;

    const insert = this.db.prepare(`
      INSERT INTO requests (
        timestamp,
        provider,
        model,
        endpoint,
        input_tokens,
        output_tokens,
        total_tokens,
        latency_ms,
        status_code,
        stream,
        api_key_hash,
        error
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      timestamp,
      input.provider,
      input.model,
      input.endpoint,
      inputTokens,
      outputTokens,
      totalTokens,
      this.toSafeInt(input.latencyMs),
      this.toSafeInt(input.statusCode),
      input.stream ? 1 : 0,
      apiKeyHash,
      input.error ?? null
    );

    this.events.emit("update");
  }

  getTotalTokens(): number {
    const totals = this.getAllTimeTotals();
    return totals.totalTokens;
  }

  getStats(): StatsSnapshot {
    const allTime = this.getAllTimeTotals();
    const today = this.getTodayTotals();
    const rank = getRankForTokens(allTime.totalTokens);

    return {
      totalTokens: allTime.totalTokens,
      totalRequests: allTime.totalRequests,
      tokensToday: today.totalTokens,
      requestsToday: today.totalRequests,
      byModel: this.getByDimension("model"),
      byProvider: this.getByDimension("provider"),
      hourly: this.getHourlyStats(),
      rank
    };
  }

  getHistory(days: number): DailyStat[] {
    const safeDays = Math.max(1, Math.min(365, Math.floor(days)));
    const sinceExpr = `-${safeDays - 1} days`;
    const query = this.db.prepare(`
      SELECT
        date(timestamp) AS day,
        COALESCE(SUM(total_tokens), 0) AS tokens,
        COUNT(*) AS requests
      FROM requests
      WHERE julianday(timestamp) >= julianday('now', ?)
      GROUP BY day
      ORDER BY day ASC
    `);

    const rows = query.all(sinceExpr) as Array<{
      day: string;
      tokens: number;
      requests: number;
    }>;

    return rows.map((row) => ({
      day: row.day,
      tokens: this.toSafeInt(row.tokens),
      requests: this.toSafeInt(row.requests)
    }));
  }

  subscribe(listener: () => void): () => void {
    this.events.on("update", listener);
    return () => {
      this.events.off("update", listener);
    };
  }

  private getAllTimeTotals(): TotalsRow {
    const query = this.db.prepare(`
      SELECT
        COALESCE(SUM(total_tokens), 0) AS totalTokens,
        COUNT(*) AS totalRequests
      FROM requests
    `);
    const row = query.get() as TotalsRow | undefined;
    return {
      totalTokens: this.toSafeInt(row?.totalTokens ?? 0),
      totalRequests: this.toSafeInt(row?.totalRequests ?? 0)
    };
  }

  private getTodayTotals(): TotalsRow {
    const query = this.db.prepare(`
      SELECT
        COALESCE(SUM(total_tokens), 0) AS totalTokens,
        COUNT(*) AS totalRequests
      FROM requests
      WHERE date(timestamp) = date('now')
    `);
    const row = query.get() as TotalsRow | undefined;
    return {
      totalTokens: this.toSafeInt(row?.totalTokens ?? 0),
      totalRequests: this.toSafeInt(row?.totalRequests ?? 0)
    };
  }

  private getByDimension(
    dimension: "model" | "provider"
  ): Record<string, { tokens: number; requests: number }> {
    const query = this.db.prepare(`
      SELECT
        ${dimension} AS key,
        COALESCE(SUM(total_tokens), 0) AS tokens,
        COUNT(*) AS requests
      FROM requests
      GROUP BY ${dimension}
      ORDER BY tokens DESC
      LIMIT 200
    `);
    const rows = query.all() as AggregateRow[];
    const output: Record<string, { tokens: number; requests: number }> = {};

    for (const row of rows) {
      output[row.key] = {
        tokens: this.toSafeInt(row.tokens),
        requests: this.toSafeInt(row.requests)
      };
    }

    return output;
  }

  private getHourlyStats(): HourlyStat[] {
    const query = this.db.prepare(`
      SELECT
        strftime('%Y-%m-%dT%H:00:00Z', timestamp) AS hour,
        COALESCE(SUM(total_tokens), 0) AS tokens,
        COUNT(*) AS requests
      FROM requests
      WHERE julianday(timestamp) >= julianday('now', '-24 hours')
      GROUP BY hour
      ORDER BY hour ASC
    `);
    const rows = query.all() as HourlyStat[];

    return rows.map((row) => ({
      hour: row.hour,
      tokens: this.toSafeInt(row.tokens),
      requests: this.toSafeInt(row.requests)
    }));
  }

  private toSafeInt(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }
    return Math.max(0, Math.floor(value));
  }
}

function hashApiKeyPrefix(apiKey: string): string {
  return createHash("sha256").update(apiKey).digest("hex").slice(0, 8);
}
