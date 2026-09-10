import { createId, createTableCell, createTableRow } from "./createTable";
import { buildTableGrid, getGridDimensions } from "./tableGrid";

export function normalizeTable(table) {
  if (!table || typeof table !== "object") return null;

  const tableId = table.id || createId("table");
  const attrs = {
    width: "100%",
    alignment: "left",
    layout: "fixed",
    theme: "blue",
    caption: "",
    headerRows: 1,
    headerColumns: 0,
    borderCollapse: true,
    ...table.attrs,
  };

  const rawRows = Array.isArray(table.rows) ? table.rows : [];
  const normalizedRows = rawRows.map((row, rIdx) => {
    const rowId = row.id || createId("row");
    const rawCells = Array.isArray(row.cells) ? row.cells : [];
    const normalizedCells = rawCells.map((cell) => {
      const cellId = cell.id || createId("cell");
      const isHeader = cell.type === "tableHeader" || (attrs.headerRows > 0 && rIdx < attrs.headerRows);
      const cellAttrs = {
        rowSpan: 1,
        colSpan: 1,
        width: null,
        minWidth: 84,
        minHeight: null,
        textAlign: "left",
        verticalAlign: "top",
        backgroundColor: isHeader ? "#dbeafe" : "#ffffff",
        borderColor: "#cbd5e1",
        borderWidth: 1,
        borderStyle: "solid",
        paddingTop: 10,
        paddingRight: 14,
        paddingBottom: 10,
        paddingLeft: 14,
        ...(cell.attrs || {}),
      };

      const rawContent = Array.isArray(cell.content) && cell.content.length > 0 ? cell.content : [{ text: "" }];

      return {
        id: cellId,
        type: isHeader ? "tableHeader" : "tableCell",
        attrs: cellAttrs,
        content: rawContent,
      };
    });

    return {
      id: rowId,
      type: "tableRow",
      attrs: { minHeight: null, ...(row.attrs || {}) },
      cells: normalizedCells.length > 0 ? normalizedCells : [createTableCell()],
    };
  });

  const res = {
    id: tableId,
    type: "table",
    attrs,
    rows: normalizedRows.length > 0 ? normalizedRows : [createTableRow(2, true), createTableRow(2, false)],
  };

  return res;
}
