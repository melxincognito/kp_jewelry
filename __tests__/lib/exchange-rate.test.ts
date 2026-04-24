import { mxnToUsd, toApiDate, getHistoricalRate } from "@/lib/exchange-rate";

// ── mxnToUsd ─────────────────────────────────────────────────────────────────

describe("mxnToUsd", () => {
  it("converts MXN to USD using the given rate and rounds to 2 decimals", () => {
    // 1000 MXN at 0.05 USD/MXN = $50.00
    expect(mxnToUsd(1000, 0.05)).toBe(50);
  });

  it("rounds to 2 decimal places correctly", () => {
    // 100 MXN at 0.0583 USD/MXN = 5.83 (not 5.830000...001)
    expect(mxnToUsd(100, 0.0583)).toBe(5.83);
  });

  it("returns 0 when amount is 0", () => {
    expect(mxnToUsd(0, 17.5)).toBe(0);
  });
});

// ── toApiDate ─────────────────────────────────────────────────────────────────

describe("toApiDate", () => {
  it("formats a Date object as YYYY-MM-DD", () => {
    expect(toApiDate(new Date("2024-03-15T12:00:00Z"))).toBe("2024-03-15");
  });

  it("accepts an ISO string and returns the date portion", () => {
    expect(toApiDate("2025-07-04T00:00:00.000Z")).toBe("2025-07-04");
  });
});

// ── getHistoricalRate ─────────────────────────────────────────────────────────

describe("getHistoricalRate", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("returns usdPerMxn and mxnPerUsd from the Frankfurter API", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ amount: 1, base: "MXN", date: "2024-01-02", rates: { USD: 0.0588 } }),
    });

    const result = await getHistoricalRate("2024-01-02");

    expect(result.usdPerMxn).toBeCloseTo(0.0588, 4);
    expect(result.mxnPerUsd).toBeCloseTo(1 / 0.0588, 2);
  });

  it("throws when the API returns a non-ok response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: "Not Found",
    });

    await expect(getHistoricalRate("2024-01-01")).rejects.toThrow(
      "Exchange rate lookup failed"
    );
  });

  it("calls the Frankfurter API with the correct date and currency params", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rates: { USD: 0.05 } }),
    });

    await getHistoricalRate("2024-06-01");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("2024-06-01"),
      expect.any(Object)
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("from=MXN"),
      expect.any(Object)
    );
  });
});
