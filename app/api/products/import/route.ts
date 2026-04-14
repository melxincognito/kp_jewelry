import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import * as XLSX from "xlsx";

// Expected column headers (case-insensitive, trimmed)
const REQUIRED = ["name", "sellingprice", "costmxn", "purchasedate", "wholesaleprice", "jewelrytype"];

const JEWELRY_TYPES = new Set([
  "NECKLACE", "BRACELET", "RING", "EARRING", "CHARM", "NOSE_RING", "CLIP", "OTHER",
]);

function normalizeType(raw: string): string | null {
  const upper = raw.toUpperCase().replace(/\s+/g, "_");
  // Handle common aliases
  const aliases: Record<string, string> = {
    NOSE_RING: "NOSE_RING",
    NOSERING: "NOSE_RING",
    NECKLACE: "NECKLACE",
    BRACELET: "BRACELET",
    RING: "RING",
    EARRING: "EARRING",
    EARRINGS: "EARRING",
    CHARM: "CHARM",
    CHARMS: "CHARM",
    CLIP: "CLIP",
    OTHER: "OTHER",
  };
  return aliases[upper] ?? (JEWELRY_TYPES.has(upper) ? upper : null);
}

function parseDate(raw: unknown): string | null {
  if (!raw) return null;
  // Excel date serial number
  if (typeof raw === "number") {
    const date = XLSX.SSF.parse_date_code(raw);
    if (date) {
      const m = String(date.m).padStart(2, "0");
      const d = String(date.d).padStart(2, "0");
      return `${date.y}-${m}-${d}`;
    }
  }
  const str = String(raw).trim();
  // Accept YYYY-MM-DD or MM/DD/YYYY
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const [m, d, y] = str.split("/");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().split("T")[0];
  return null;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const allowedTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
    "application/csv",
  ];
  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
    return NextResponse.json({ error: "File must be .xlsx, .xls, or .csv" }, { status: 415 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  if (rows.length === 0) {
    return NextResponse.json({ error: "Spreadsheet is empty" }, { status: 400 });
  }

  // Normalize header keys to lowercase no-spaces for comparison
  const normalizeKey = (k: string) => k.toLowerCase().replace(/[\s_-]/g, "");

  const results: { row: number; name: string; status: "created" | "error"; error?: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const rawRow = rows[i];
    const row: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rawRow)) {
      row[normalizeKey(k)] = v;
    }

    const rowNum = i + 2; // +2 because row 1 is headers
    const name = String(row["name"] ?? "").trim();
    if (!name) {
      results.push({ row: rowNum, name: "(blank)", status: "error", error: "Name is required" });
      continue;
    }

    // Check required fields
    const missing = REQUIRED.filter((f) => {
      const val = row[f.replace(/\s/g, "")];
      return val === "" || val === null || val === undefined;
    });
    if (missing.length > 0) {
      results.push({ row: rowNum, name, status: "error", error: `Missing required fields: ${missing.join(", ")}` });
      continue;
    }

    const jewelryType = normalizeType(String(row["jewelrytype"] ?? ""));
    if (!jewelryType) {
      results.push({ row: rowNum, name, status: "error", error: `Invalid jewelry type: "${row["jewelrytype"]}"` });
      continue;
    }

    const purchaseDate = parseDate(row["purchasedate"]);
    if (!purchaseDate) {
      results.push({ row: rowNum, name, status: "error", error: `Invalid purchase date: "${row["purchasedate"]}"` });
      continue;
    }

    const costMXN = parseFloat(String(row["costmxn"]));
    const wholesalePrice = parseFloat(String(row["wholesaleprice"]));
    const sellingPrice = parseFloat(String(row["sellingprice"]));
    const exchangeRate = parseFloat(String(row["exchangerate"] ?? "0")) || 0;
    const costUSD = exchangeRate > 0 ? costMXN / exchangeRate : parseFloat(String(row["costusd"] ?? "0")) || 0;
    const shippingFees = parseFloat(String(row["shippingfees"] ?? "0")) || 0;
    const quantity = parseInt(String(row["quantity"] ?? "1"), 10) || 1;
    const sku = String(row["sku"] ?? "").trim() || null;
    const description = String(row["description"] ?? "").trim() || null;
    const stylesRaw = String(row["styles"] ?? "").trim();
    const styles = stylesRaw ? stylesRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];

    if (isNaN(costMXN) || costMXN <= 0) {
      results.push({ row: rowNum, name, status: "error", error: "costMXN must be a positive number" });
      continue;
    }
    if (isNaN(wholesalePrice) || wholesalePrice <= 0) {
      results.push({ row: rowNum, name, status: "error", error: "wholesalePrice must be a positive number" });
      continue;
    }
    if (isNaN(sellingPrice) || sellingPrice <= 0) {
      results.push({ row: rowNum, name, status: "error", error: "sellingPrice must be a positive number" });
      continue;
    }

    // Check SKU uniqueness if provided
    if (sku) {
      const existing = await db.product.findFirst({ where: { sku } });
      if (existing) {
        results.push({ row: rowNum, name, status: "error", error: `SKU "${sku}" is already in use` });
        continue;
      }
    }

    try {
      await db.product.create({
        data: {
          name,
          sku,
          description,
          images: "[]",
          costMXN,
          costUSD,
          exchangeRate: exchangeRate || 1,
          purchaseDate: new Date(purchaseDate),
          shippingFees,
          wholesalePrice,
          sellingPrice,
          jewelryType,
          styles: JSON.stringify(styles),
          quantity,
          status: "AVAILABLE",
        },
      });
      results.push({ row: rowNum, name, status: "created" });
    } catch {
      results.push({ row: rowNum, name, status: "error", error: "Database error — check for duplicate SKU" });
    }
  }

  const created = results.filter((r) => r.status === "created").length;
  const errors = results.filter((r) => r.status === "error").length;
  return NextResponse.json({ created, errors, results }, { status: 200 });
}
