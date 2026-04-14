"use client";

import { useRef, useState, useId } from "react";
import { useRouter } from "next/navigation";

interface ImportResult {
  row: number;
  name: string;
  status: "created" | "error";
  error?: string;
}

interface ImportResponse {
  created: number;
  errors: number;
  results: ImportResult[];
}

// Generates and downloads a filled-out template so the user knows exactly what columns to use
function downloadTemplate() {
  const headers = [
    "name",
    "sku",
    "description",
    "jewelryType",
    "quantity",
    "costMXN",
    "exchangeRate",
    "costUSD",
    "shippingFees",
    "wholesalePrice",
    "sellingPrice",
    "purchaseDate",
    "styles",
  ];

  const example = [
    "Cuban Link Necklace",
    "NKL-001",
    "14k gold plated 5mm cuban link",
    "NECKLACE",
    "1",
    "850",
    "17.25",
    "49.28",
    "5.00",
    "55.00",
    "120.00",
    "2026-04-01",
    "Cubano, Gold",
  ];

  const note = [
    "// jewelryType options:",
    "",
    "NECKLACE | BRACELET | RING | EARRING | CHARM | NOSE_RING | CLIP | OTHER",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "// comma-separated",
  ];

  const csvRows = [headers, example, note];
  const csv = csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "kp_inventory_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function BulkImportButton() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState<ImportResponse | null>(null);
  const [fileError, setFileError] = useState("");
  const fileInputId = useId();
  const dialogId = useId();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file);
  }

  async function uploadFile(file: File) {
    setFileError("");
    setResponse(null);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/products/import", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setFileError(data.error ?? "Import failed");
      } else {
        setResponse(data as ImportResponse);
        if (data.created > 0) router.refresh();
      }
    } catch {
      setFileError("Network error — please try again");
    } finally {
      setUploading(false);
      // Reset so the same file can be re-uploaded after fixing errors
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleClose() {
    setOpen(false);
    setResponse(null);
    setFileError("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs px-3 py-2 border border-[var(--black-border)] text-[var(--white-dim)] hover:border-[var(--gold)]/40 hover:text-[var(--white)] rounded-sm transition-colors"
      >
        Import spreadsheet
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${dialogId}-title`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            aria-hidden="true"
            onClick={handleClose}
          />

          {/* Panel */}
          <div className="relative z-10 w-full max-w-lg bg-[var(--black-card)] border border-[var(--black-border)] rounded-sm flex flex-col gap-0 overflow-hidden">

            {/* Header */}
            <div className="px-5 py-4 border-b border-[var(--black-border)] flex items-center justify-between">
              <h2 id={`${dialogId}-title`} className="text-sm font-medium text-[var(--white)]">
                Import Inventory from Spreadsheet
              </h2>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close import dialog"
                className="text-[var(--white-dim)]/40 hover:text-[var(--white)] transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="px-5 py-5 flex flex-col gap-5">
              {/* Step 1 */}
              <div className="flex flex-col gap-2">
                <p className="text-[10px] tracking-widest uppercase text-[var(--gold)]">
                  Step 1 — Download the template
                </p>
                <p className="text-xs text-[var(--white-dim)]/60 leading-relaxed">
                  Fill in your items using the exact column headers. Required columns are:
                  <span className="font-mono text-[var(--white-dim)]"> name, jewelryType, costMXN, purchaseDate, wholesalePrice, sellingPrice</span>.
                  All other columns are optional.
                </p>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="self-start text-xs px-3 py-2 border border-[var(--black-border)] text-[var(--white-dim)] hover:border-[var(--gold)]/40 hover:text-[var(--gold)] rounded-sm transition-colors"
                >
                  ↓ Download CSV template
                </button>
              </div>

              {/* Accepted values reference */}
              <div className="bg-[var(--black-soft)] border border-[var(--black-border)] rounded-sm px-4 py-3 text-xs text-[var(--white-dim)]/50 flex flex-col gap-1">
                <p className="text-[var(--white-dim)]/70 font-medium mb-1">jewelryType accepted values</p>
                <p className="font-mono leading-relaxed">
                  NECKLACE · BRACELET · RING · EARRING · CHARM · NOSE_RING · CLIP · OTHER
                </p>
                <p className="text-[var(--white-dim)]/70 font-medium mt-2 mb-1">purchaseDate format</p>
                <p className="font-mono">YYYY-MM-DD &nbsp; or &nbsp; MM/DD/YYYY</p>
                <p className="text-[var(--white-dim)]/70 font-medium mt-2 mb-1">styles</p>
                <p className="font-mono">Comma-separated &nbsp; e.g. Cubano, Franco</p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col gap-2">
                <p className="text-[10px] tracking-widest uppercase text-[var(--gold)]">
                  Step 2 — Upload your completed file
                </p>
                <p className="text-xs text-[var(--white-dim)]/60">
                  Accepts .xlsx, .xls, or .csv files.
                </p>

                <label
                  htmlFor={fileInputId}
                  className={[
                    "flex flex-col items-center justify-center gap-2 border border-dashed rounded-sm py-8 cursor-pointer transition-colors",
                    uploading
                      ? "border-[var(--black-border)] opacity-50 pointer-events-none"
                      : "border-[var(--black-border)] hover:border-[var(--gold)]/40 hover:bg-[var(--gold)]/5",
                  ].join(" ")}
                >
                  <span className="text-2xl opacity-30" aria-hidden="true">⬆</span>
                  <span className="text-xs text-[var(--white-dim)]/50">
                    {uploading ? "Processing…" : "Click to choose file"}
                  </span>
                  <input
                    ref={fileInputRef}
                    id={fileInputId}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="sr-only"
                    disabled={uploading}
                    onChange={handleFileChange}
                    aria-describedby={fileError ? `${fileInputId}-error` : undefined}
                  />
                </label>

                {fileError && (
                  <p
                    id={`${fileInputId}-error`}
                    role="alert"
                    className="text-xs text-red-400"
                  >
                    {fileError}
                  </p>
                )}
              </div>

              {/* Results */}
              {response && (
                <div
                  role="status"
                  aria-live="polite"
                  className="flex flex-col gap-3"
                >
                  {/* Summary */}
                  <div className="flex gap-3">
                    {response.created > 0 && (
                      <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-sm px-3 py-2 text-center">
                        <p className="text-lg font-medium text-emerald-400">{response.created}</p>
                        <p className="text-[10px] text-emerald-400/70 uppercase tracking-widest">Created</p>
                      </div>
                    )}
                    {response.errors > 0 && (
                      <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-sm px-3 py-2 text-center">
                        <p className="text-lg font-medium text-red-400">{response.errors}</p>
                        <p className="text-[10px] text-red-400/70 uppercase tracking-widest">Errors</p>
                      </div>
                    )}
                  </div>

                  {/* Error detail */}
                  {response.errors > 0 && (
                    <div className="max-h-40 overflow-y-auto flex flex-col gap-1.5">
                      <p className="text-[10px] text-[var(--white-dim)]/50 uppercase tracking-widest">Error detail</p>
                      {response.results
                        .filter((r) => r.status === "error")
                        .map((r) => (
                          <div key={r.row} className="flex gap-2 text-xs">
                            <span className="text-[var(--white-dim)]/30 shrink-0">Row {r.row}</span>
                            <span className="text-[var(--white-dim)]">{r.name}</span>
                            <span className="text-red-400 ml-auto shrink-0">{r.error}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-[var(--black-border)] flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="text-xs px-4 py-2 border border-[var(--black-border)] text-[var(--white-dim)] hover:text-[var(--white)] rounded-sm transition-colors"
              >
                {response?.created ? "Done" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
