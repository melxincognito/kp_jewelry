import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { BlobServiceClient } from "@azure/storage-blob";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CheckStatus = "pass" | "fail";

interface CheckResult {
  status: CheckStatus;
  responseTimeMs: number;
  message?: string; // only included for authenticated callers
}

interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  checks?: Record<string, CheckResult>;
  warning?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Run a check and capture its duration. Returns sanitized result. */
async function timed(
  fn: () => Promise<void>,
  authenticated: boolean,
): Promise<CheckResult> {
  const start = Date.now();
  try {
    await fn();
    return { status: "pass", responseTimeMs: Date.now() - start };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      status: "fail",
      responseTimeMs: Date.now() - start,
      // Only surface the raw error to authenticated callers to avoid
      // leaking internal connection strings or service details publicly.
      ...(authenticated ? { message } : { message: "Check failed" }),
    };
  }
}

/** Validate the Authorization header or ?key= query param against HEALTH_API_KEY. */
function isAuthenticated(req: NextRequest): boolean {
  const apiKey = process.env.HEALTH_API_KEY;
  if (!apiKey) return false; // key not configured — no one can authenticate

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7) === apiKey;
  }

  const queryKey = req.nextUrl.searchParams.get("key");
  return queryKey === apiKey;
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

async function checkDatabase(): Promise<void> {
  // Lightweight probe — no table scan, just validates the connection.
  await db.$queryRaw`SELECT 1 AS health`;
}

async function checkBlobStorage(): Promise<void> {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("AZURE_STORAGE_CONNECTION_STRING is not configured");
  }
  const client = BlobServiceClient.fromConnectionString(connectionString);
  const container = client.getContainerClient("product-images");
  const exists = await container.exists();
  if (!exists) throw new Error("Container 'product-images' does not exist");
}

async function checkExchangeRateApi(): Promise<void> {
  // Use a fixed past date so weekend/ECB-holiday gaps never cause false failures.
  const res = await fetch(
    "https://api.frankfurter.app/2024-01-02?from=MXN&to=USD&amount=1",
    { signal: AbortSignal.timeout(5000) }, // 5 s hard timeout
  );
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (!data?.rates?.USD) {
    throw new Error("Unexpected response shape from Frankfurter API");
  }
}

function checkConfiguration(): void {
  const required = [
    "DATABASE_URL",
    "AUTH_SECRET",
    "AZURE_STORAGE_CONNECTION_STRING",
    "HEALTH_API_KEY",
  ];
  const missing = required.filter((v) => !process.env[v]);
  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const authenticated = isAuthenticated(req);
  const apiKeyConfigured = !!process.env.HEALTH_API_KEY;

  // If HEALTH_API_KEY is set but the caller isn't authenticated, return a
  // minimal 401 — don't leak which services are up or down.
  if (apiKeyConfigured && !authenticated) {
    return NextResponse.json(
      { status: "unauthorized", timestamp: new Date().toISOString() },
      { status: 401 },
    );
  }

  // Run all checks concurrently to keep response time low.
  const [database, blobStorage, exchangeRateApi, configuration] =
    await Promise.all([
      timed(checkDatabase, authenticated),
      timed(checkBlobStorage, authenticated),
      timed(checkExchangeRateApi, authenticated),
      timed(async () => checkConfiguration(), authenticated),
    ]);

  const checks = { database, blobStorage, exchangeRateApi, configuration };

  // Determine overall status:
  //   unhealthy  — any critical service is down (db, blob, config)
  //   degraded   — only non-critical services are down (exchange rate API)
  //   healthy    — everything passes
  const criticalFailed = [database, blobStorage, configuration].some(
    (c) => c.status === "fail",
  );
  const anyFailed = Object.values(checks).some((c) => c.status === "fail");

  const overallStatus = criticalFailed
    ? "unhealthy"
    : anyFailed
      ? "degraded"
      : "healthy";

  const body: HealthResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks,
    ...(!apiKeyConfigured
      ? {
          warning:
            "HEALTH_API_KEY is not set. Set it to restrict access to this endpoint.",
        }
      : {}),
  };

  // 200 for healthy/degraded (site is usable), 503 for unhealthy.
  const httpStatus = overallStatus === "unhealthy" ? 503 : 200;
  return NextResponse.json(body, { status: httpStatus });
}
