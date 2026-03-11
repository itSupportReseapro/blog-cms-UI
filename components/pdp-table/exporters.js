"use client";

import { normalizeCellValue } from "./utils";

function buildExportRows({ rows, columns, visibleColumns, statusField, statusTrueValues }) {
  const cols = columns.filter(c => visibleColumns?.[c.field]);
  return rows.map((row) => {
    const obj = {};
    cols.forEach((col) => {
      const raw = row?.[col.field];
      const val = normalizeCellValue(col, raw, { statusField, statusTrueValues });
      obj[col.label] = typeof val === "string" || typeof val === "number" ? val : String(val ?? "");
    });
    return obj;
  });
}

export async function exportRowsToExcel(opts) {
  const { rows, columns, visibleColumns, fileBaseName, statusField, statusTrueValues } = opts;
  const exportData = buildExportRows({ rows, columns, visibleColumns, statusField, statusTrueValues });

  const xlsx = await import("xlsx");
  const { utils, writeFile } = xlsx;

  const ws = utils.json_to_sheet(exportData);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Data");

  const fileName = `${fileBaseName}_${new Date().toISOString().replace(/[:.]/g, "-")}.xlsx`;
  writeFile(wb, fileName);
}

export async function exportRowsToPDF(opts) {
  const { rows, columns, visibleColumns, fileBaseName, statusField, statusTrueValues, title } = opts;

  const cols = columns.filter(c => visibleColumns?.[c.field]);
  const head = [cols.map(c => c.label)];

  const body = rows.map((row) =>
    cols.map((col) => {
      const raw = row?.[col.field];
      const val = normalizeCellValue(col, raw, { statusField, statusTrueValues });
      return typeof val === "string" || typeof val === "number" ? String(val) : String(val ?? "");
    })
  );

  const jsPDFMod = await import("jspdf");
  await import("jspdf-autotable");

  const doc = new jsPDFMod.jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  if (title) {
    doc.setFontSize(14);
    doc.text(title, 40, 35);
  }

  doc.autoTable({
    head,
    body,
    startY: title ? 50 : 30,
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [37, 99, 235] }, // matches primary
    theme: "grid",
    margin: { left: 40, right: 40 },
  });

  const fileName = `${fileBaseName}_${new Date().toISOString().replace(/[:.]/g, "-")}.pdf`;
  doc.save(fileName);
}
