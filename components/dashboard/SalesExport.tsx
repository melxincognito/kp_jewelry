"use client";

import { Button } from "@/components/ui/Button";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface SaleRow {
  item: string;
  buyer: string;
  salePrice: number;
  profit: number;
  date: string;
  notes: string;
}

interface Props {
  rows: SaleRow[];
  totalRevenue: number;
  totalProfit: number;
  label: string; // e.g. "Last Month" or "All Time"
}

function filename(label: string, ext: string) {
  const slug = label.toLowerCase().replace(/\s+/g, "-");
  return `kp-jewelers-sales-${slug}.${ext}`;
}

export function SalesExport({ rows, totalRevenue, totalProfit, label }: Props) {
  function downloadExcel() {
    const sheetRows = [
      ["Item", "Buyer", "Sale Price (USD)", "Profit (USD)", "Date", "Notes"],
      ...rows.map((r) => [
        r.item,
        r.buyer,
        r.salePrice,
        r.profit,
        r.date,
        r.notes,
      ]),
      [], // blank separator
      ["", "Total", totalRevenue, totalProfit, "", ""],
    ];

    const ws = utils.aoa_to_sheet(sheetRows);

    // Column widths
    ws["!cols"] = [
      { wch: 28 }, // Item
      { wch: 24 }, // Buyer
      { wch: 16 }, // Sale Price
      { wch: 14 }, // Profit
      { wch: 14 }, // Date
      { wch: 30 }, // Notes
    ];

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Sales");
    writeFile(wb, filename(label, "xlsx"));
  }

  function downloadPDF() {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" });

    const pageW = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("KP Jewelers — Sales Report", 40, 40);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text(
      `${label} · ${rows.length} sales · $${totalRevenue.toFixed(2)} revenue · $${totalProfit.toFixed(2)} profit`,
      40,
      58
    );
    doc.setTextColor(0);

    const tableRows = rows.map((r) => [
      r.item,
      r.buyer,
      `$${r.salePrice.toFixed(2)}`,
      `$${r.profit.toFixed(2)}`,
      r.date,
      r.notes,
    ]);

    // Totals footer row
    tableRows.push([
      { content: `Total (${rows.length} sales)`, colSpan: 2, styles: { fontStyle: "bold" } } as never,
      { content: `$${totalRevenue.toFixed(2)}`, styles: { fontStyle: "bold", textColor: [180, 140, 60] } } as never,
      { content: `$${totalProfit.toFixed(2)}`, styles: { fontStyle: "bold", textColor: [52, 211, 153] } } as never,
      "",
      "",
    ]);

    autoTable(doc, {
      startY: 72,
      head: [["Item", "Buyer", "Sale Price", "Profit", "Date", "Notes"]],
      body: tableRows,
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [30, 30, 30], textColor: 220, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      columnStyles: {
        0: { cellWidth: "auto" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
      },
      margin: { left: 40, right: 40 },
      tableWidth: pageW - 80,
    });

    // Page numbers
    const pageCount = (doc as jsPDF & { internal: { getNumberOfPages(): number } }).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(160);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageW / 2,
        doc.internal.pageSize.getHeight() - 20,
        { align: "center" }
      );
    }

    doc.save(filename(label, "pdf"));
  }

  const disabled = rows.length === 0;

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Export sales data">
      <Button
        size="sm"
        variant="ghost"
        onClick={downloadExcel}
        disabled={disabled}
        aria-label={`Download ${label} sales as Excel spreadsheet`}
      >
        ↓ Excel
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={downloadPDF}
        disabled={disabled}
        aria-label={`Download ${label} sales as PDF`}
      >
        ↓ PDF
      </Button>
    </div>
  );
}
