import express, { NextFunction, Request, Response } from "express";
import { createProxyHandler } from "./proxy";
import { errorHandler, requestLogger } from "./middleware";
import { StatsStore } from "./stats";

const port = toPositiveInt(process.env.PORT, 4000);
const dbPath = process.env.DB_PATH ?? "gateway.db";
const stats = new StatsStore(dbPath);

const app = express();
app.disable("x-powered-by");

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type, X-Target-URL, X-API-Key, X-Goog-Api-Key"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json({ limit: "15mb" }));
app.use(requestLogger);

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    totalSacrificed: stats.getTotalTokens()
  });
});

app.get("/api/stats", (_req: Request, res: Response) => {
  res.json(stats.getStats());
});

app.get("/api/stats/history", (req: Request, res: Response) => {
  const requestedDays =
    typeof req.query.days === "string" ? Number.parseInt(req.query.days, 10) : 30;
  const days = Number.isFinite(requestedDays)
    ? Math.max(1, Math.min(365, requestedDays))
    : 30;

  res.json({
    days,
    data: stats.getHistory(days)
  });
});

app.get("/api/stats/live", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (event: string, payload: unknown) => {
    if (res.writableEnded) {
      return;
    }
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  send("snapshot", stats.getStats());

  const unsubscribe = stats.subscribe(() => {
    send("update", stats.getStats());
  });

  const heartbeat = setInterval(() => {
    if (!res.writableEnded) {
      res.write(": keep-alive\n\n");
    }
  }, 15_000);

  req.on("close", () => {
    clearInterval(heartbeat);
    unsubscribe();
    if (!res.writableEnded) {
      res.end();
    }
  });
});

app.post("/v1/chat/completions", createProxyHandler(stats, "/v1/chat/completions"));
app.post("/v1/embeddings", createProxyHandler(stats, "/v1/embeddings"));
app.post(
  "/v1/images/generations",
  createProxyHandler(stats, "/v1/images/generations")
);
app.get("/v1/models", createProxyHandler(stats, "/v1/models"));

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`EACC gateway listening on port ${port}`);
});

function toPositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}
