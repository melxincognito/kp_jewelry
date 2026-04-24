/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET } from "@/app/api/health/route";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

jest.mock("@/lib/db", () => ({
  db: {
    $queryRaw: jest.fn().mockResolvedValue([{ health: 1 }]),
  },
}));

jest.mock("@azure/storage-blob", () => ({
  BlobServiceClient: {
    fromConnectionString: jest.fn(() => ({
      getContainerClient: jest.fn(() => ({
        exists: jest.fn().mockResolvedValue(true),
      })),
    })),
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(headers: Record<string, string> = {}, search = ""): NextRequest {
  const url = `http://localhost/api/health${search}`;
  return new NextRequest(url, { headers });
}

/** Set multiple env vars and return a cleanup function. */
function withEnv(vars: Record<string, string>) {
  const original: Record<string, string | undefined> = {};
  for (const key of Object.keys(vars)) {
    original[key] = process.env[key];
    process.env[key] = vars[key];
  }
  return () => {
    for (const key of Object.keys(vars)) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GET /api/health", () => {
  const VALID_KEY = "test-health-key";

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset global fetch before each test
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rates: { USD: 0.058 } }),
    });
  });

  describe("authentication", () => {
    it("returns 401 when HEALTH_API_KEY is set and no key is provided", async () => {
      const cleanup = withEnv({
        HEALTH_API_KEY: VALID_KEY,
        DATABASE_URL: "postgres://",
        AUTH_SECRET: "secret",
        AZURE_STORAGE_CONNECTION_STRING: "DefaultEndpointsProtocol=https;...",
      });

      const res = await GET(makeRequest());
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body.status).toBe("unauthorized");
      cleanup();
    });

    it("returns 401 when a wrong Bearer token is provided", async () => {
      const cleanup = withEnv({ HEALTH_API_KEY: VALID_KEY });

      const res = await GET(makeRequest({ authorization: "Bearer wrong-key" }));
      expect(res.status).toBe(401);
      cleanup();
    });

    it("accepts a valid Bearer token", async () => {
      const cleanup = withEnv({
        HEALTH_API_KEY: VALID_KEY,
        DATABASE_URL: "postgres://",
        AUTH_SECRET: "secret",
        AZURE_STORAGE_CONNECTION_STRING: "DefaultEndpointsProtocol=https;...",
      });

      const res = await GET(makeRequest({ authorization: `Bearer ${VALID_KEY}` }));
      expect(res.status).not.toBe(401);
      cleanup();
    });

    it("accepts a valid ?key= query param", async () => {
      const cleanup = withEnv({
        HEALTH_API_KEY: VALID_KEY,
        DATABASE_URL: "postgres://",
        AUTH_SECRET: "secret",
        AZURE_STORAGE_CONNECTION_STRING: "DefaultEndpointsProtocol=https;...",
      });

      const res = await GET(makeRequest({}, `?key=${VALID_KEY}`));
      expect(res.status).not.toBe(401);
      cleanup();
    });

    it("returns a warning when HEALTH_API_KEY is not set", async () => {
      const cleanup = withEnv({
        DATABASE_URL: "postgres://",
        AUTH_SECRET: "secret",
        AZURE_STORAGE_CONNECTION_STRING: "DefaultEndpointsProtocol=https;...",
      });
      delete process.env.HEALTH_API_KEY;

      const res = await GET(makeRequest());
      const body = await res.json();
      expect(body.warning).toBeTruthy();
      cleanup();
    });
  });

  describe("overall status", () => {
    const allEnv = {
      HEALTH_API_KEY: VALID_KEY,
      DATABASE_URL: "postgres://",
      AUTH_SECRET: "secret",
      AZURE_STORAGE_CONNECTION_STRING: "DefaultEndpointsProtocol=https;...",
    };

    it("returns healthy (200) when all checks pass", async () => {
      const cleanup = withEnv(allEnv);
      const res = await GET(makeRequest({ authorization: `Bearer ${VALID_KEY}` }));
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.status).toBe("healthy");
      cleanup();
    });

    it("returns degraded (200) when only exchangeRateApi fails", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 503, statusText: "Service Unavailable" });

      const cleanup = withEnv(allEnv);
      const res = await GET(makeRequest({ authorization: `Bearer ${VALID_KEY}` }));
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.status).toBe("degraded");
      cleanup();
    });

    it("returns unhealthy (503) when the database check fails", async () => {
      const { db } = require("@/lib/db");
      db.$queryRaw.mockRejectedValueOnce(new Error("Connection refused"));

      const cleanup = withEnv(allEnv);
      const res = await GET(makeRequest({ authorization: `Bearer ${VALID_KEY}` }));
      const body = await res.json();
      expect(res.status).toBe(503);
      expect(body.status).toBe("unhealthy");
      cleanup();
    });
  });

  describe("check details", () => {
    const allEnv = {
      HEALTH_API_KEY: VALID_KEY,
      DATABASE_URL: "postgres://",
      AUTH_SECRET: "secret",
      AZURE_STORAGE_CONNECTION_STRING: "DefaultEndpointsProtocol=https;...",
    };

    it("includes all four check keys in the response", async () => {
      const cleanup = withEnv(allEnv);
      const res = await GET(makeRequest({ authorization: `Bearer ${VALID_KEY}` }));
      const body = await res.json();
      expect(body.checks).toHaveProperty("database");
      expect(body.checks).toHaveProperty("blobStorage");
      expect(body.checks).toHaveProperty("exchangeRateApi");
      expect(body.checks).toHaveProperty("configuration");
      cleanup();
    });

    it("includes responseTimeMs for each check", async () => {
      const cleanup = withEnv(allEnv);
      const res = await GET(makeRequest({ authorization: `Bearer ${VALID_KEY}` }));
      const body = await res.json();
      for (const check of Object.values(body.checks) as { responseTimeMs: unknown }[]) {
        expect(typeof check.responseTimeMs).toBe("number");
      }
      cleanup();
    });

    it("surfaces the error message to authenticated callers", async () => {
      const { db } = require("@/lib/db");
      db.$queryRaw.mockRejectedValueOnce(new Error("Specific internal error"));

      const cleanup = withEnv(allEnv);
      const res = await GET(makeRequest({ authorization: `Bearer ${VALID_KEY}` }));
      const body = await res.json();
      expect(body.checks.database.message).toContain("Specific internal error");
      cleanup();
    });

    it("includes a timestamp in ISO 8601 format", async () => {
      delete process.env.HEALTH_API_KEY;
      const cleanup = withEnv({ DATABASE_URL: "p", AUTH_SECRET: "s", AZURE_STORAGE_CONNECTION_STRING: "c" });

      const res = await GET(makeRequest());
      const body = await res.json();
      expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
      cleanup();
    });
  });
});
