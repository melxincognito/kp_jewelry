"use client";

import { useRef, useState, useId } from "react";
import { useRouter } from "next/navigation";
import MuiButton from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";

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

function downloadTemplate() {
  const headers = ["name","sku","description","jewelryType","quantity","costMXN","exchangeRate","costUSD","shippingFees","wholesalePrice","sellingPrice","purchaseDate","styles"];
  const example = ["Cuban Link Necklace","NKL-001","14k gold plated 5mm cuban link","NECKLACE","1","850","17.25","49.28","5.00","55.00","120.00","2026-04-01","Cubano, Gold"];
  const note = ["// jewelryType options:","","NECKLACE | BRACELET | RING | EARRING | CHARM | NOSE_RING | CLIP | OTHER","","","","","","","","","","// comma-separated"];
  const csv = [headers, example, note].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
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
      <MuiButton
        variant="outlined"
        size="small"
        onClick={() => setOpen(true)}
        sx={{
          fontSize: "0.75rem",
          textTransform: "none",
          letterSpacing: "normal",
          borderColor: "divider",
          color: "text.secondary",
          "&:hover": { borderColor: "rgba(122,92,16,0.4)", color: "text.primary" },
        }}
      >
        Import spreadsheet
      </MuiButton>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth aria-labelledby="import-dialog-title">
        <DialogTitle id="import-dialog-title" sx={{ pr: 6 }}>
          Import Inventory from Spreadsheet
          <IconButton
            aria-label="Close import dialog"
            onClick={handleClose}
            size="small"
            sx={{ position: "absolute", right: 16, top: 12, color: "text.secondary" }}
          >
            ×
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Step 1 */}
          <Box>
            <Typography sx={{ fontSize: "0.625rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "primary.main", mb: 1 }}>
              Step 1 — Download the template
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.6, lineHeight: 1.6, mb: 1.5 }}>
              Fill in your items using the exact column headers. Required columns are:{" "}
              <Box component="span" sx={{ fontFamily: "var(--font-geist-mono)", color: "text.secondary" }}>
                name, jewelryType, costMXN, purchaseDate, wholesalePrice, sellingPrice
              </Box>
              . All other columns are optional.
            </Typography>
            <MuiButton
              variant="outlined"
              size="small"
              onClick={downloadTemplate}
              sx={{
                fontSize: "0.75rem",
                textTransform: "none",
                letterSpacing: "normal",
                borderColor: "divider",
                color: "text.secondary",
                "&:hover": { borderColor: "rgba(122,92,16,0.4)", color: "primary.main" },
              }}
            >
              ↓ Download CSV template
            </MuiButton>
          </Box>

          {/* Reference */}
          <Paper sx={{ px: 2, py: 1.5, bgcolor: "#ede9e3", border: "1px solid", borderColor: "divider" }}>
            <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.7, fontWeight: 500, display: "block", mb: 0.5 }}>
              jewelryType accepted values
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: "var(--font-geist-mono)", color: "text.secondary", opacity: 0.5, lineHeight: 1.8 }}>
              NECKLACE · BRACELET · RING · EARRING · CHARM · NOSE_RING · CLIP · OTHER
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.7, fontWeight: 500, display: "block", mt: 1, mb: 0.5 }}>
              purchaseDate format
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: "var(--font-geist-mono)", color: "text.secondary", opacity: 0.5 }}>
              YYYY-MM-DD &nbsp; or &nbsp; MM/DD/YYYY
            </Typography>
          </Paper>

          {/* Step 2 */}
          <Box>
            <Typography sx={{ fontSize: "0.625rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "primary.main", mb: 1 }}>
              Step 2 — Upload your completed file
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.6, mb: 1.5 }}>
              Accepts .xlsx, .xls, or .csv files.
            </Typography>

            <Box
              component="label"
              htmlFor={fileInputId}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                border: "1px dashed",
                borderColor: uploading ? "divider" : "divider",
                borderRadius: 1,
                py: 4,
                cursor: uploading ? "not-allowed" : "pointer",
                opacity: uploading ? 0.5 : 1,
                pointerEvents: uploading ? "none" : "auto",
                "&:hover": { borderColor: "rgba(122,92,16,0.4)", bgcolor: "rgba(122,92,16,0.03)" },
                transition: "all 0.15s",
              }}
            >
              <Typography sx={{ fontSize: "1.5rem", opacity: 0.3 }} aria-hidden="true">⬆</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.5 }}>
                {uploading ? "Processing…" : "Click to choose file"}
              </Typography>
              <input
                ref={fileInputRef}
                id={fileInputId}
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}
                disabled={uploading}
                onChange={handleFileChange}
                aria-describedby={fileError ? `${fileInputId}-error` : undefined}
              />
            </Box>

            {fileError && (
              <Alert id={`${fileInputId}-error`} severity="error" sx={{ mt: 1, fontSize: "0.75rem" }}>
                {fileError}
              </Alert>
            )}
          </Box>

          {/* Results */}
          {response && (
            <Box role="status" aria-live="polite" sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box sx={{ display: "flex", gap: 1.5 }}>
                {response.created > 0 && (
                  <Paper sx={{ flex: 1, p: 1.5, textAlign: "center", bgcolor: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.2)" }}>
                    <Typography sx={{ fontSize: "1.25rem", fontWeight: 500, color: "#059669" }}>{response.created}</Typography>
                    <Typography sx={{ fontSize: "0.625rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(5,150,105,0.7)" }}>Created</Typography>
                  </Paper>
                )}
                {response.errors > 0 && (
                  <Paper sx={{ flex: 1, p: 1.5, textAlign: "center", bgcolor: "rgba(185,28,28,0.08)", border: "1px solid rgba(185,28,28,0.2)" }}>
                    <Typography sx={{ fontSize: "1.25rem", fontWeight: 500, color: "#b91c1c" }}>{response.errors}</Typography>
                    <Typography sx={{ fontSize: "0.625rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(185,28,28,0.7)" }}>Errors</Typography>
                  </Paper>
                )}
              </Box>
              {response.errors > 0 && (
                <Box sx={{ maxHeight: 160, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0.75 }}>
                  <Typography sx={{ fontSize: "0.625rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "text.secondary", opacity: 0.5 }}>
                    Error detail
                  </Typography>
                  {response.results.filter((r) => r.status === "error").map((r) => (
                    <Box key={r.row} sx={{ display: "flex", gap: 1, fontSize: "0.75rem" }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.3, flexShrink: 0 }}>Row {r.row}</Typography>
                      <Typography variant="caption" sx={{ color: "text.primary" }}>{r.name}</Typography>
                      <Typography variant="caption" sx={{ color: "error.main", ml: "auto", flexShrink: 0 }}>{r.error}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <MuiButton
            variant="outlined"
            size="small"
            onClick={handleClose}
            sx={{
              fontSize: "0.75rem",
              textTransform: "none",
              letterSpacing: "normal",
              borderColor: "divider",
              color: "text.secondary",
              "&:hover": { color: "text.primary" },
            }}
          >
            {response?.created ? "Done" : "Cancel"}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
