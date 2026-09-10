import { createTable, createTableCell, createTableRow } from "./createTable";
import { normalizeTable } from "./normalizeTable";
import { buildTableGrid, getGridDimensions } from "./tableGrid";

export function findTableById(doc, tableId) {
  if (!doc || !Array.isArray(doc.content)) return { table: null, index: -1 };
  for (let i = 0; i < doc.content.length; i++) {
    const blk = doc.content[i];
    if (blk.type === "table" && (blk.id === tableId || !tableId)) {
      return { table: blk, index: i };
    }
  }
  return { table: null, index: -1 };
}

export function insertTableCommand(doc, selection, { rows = 2, cols = 2, headerRow = true } = {}) {
  const newTable = createTable({ rows, columns: cols, headerRow });
  return newTable;
}

export function insertTableRow(doc, { tableId, rowIndex = 0, position = "below" }) {
  const { table, index } = findTableById(doc, tableId);
  if (!table || index < 0) return doc;

  const grid = buildTableGrid(table);
  const { colCount } = getGridDimensions(grid);

  const insertAt = position === "above" ? rowIndex : rowIndex + 1;
  const isHeader = table.attrs?.headerRows > 0 && insertAt < table.attrs.headerRows;
  const newRow = createTableRow(colCount, isHeader);

  table.rows.splice(insertAt, 0, newRow);
  return doc;
}

export function deleteTableRow(doc, { tableId, rowIndex }) {
  const { table, index } = findTableById(doc, tableId);
  if (!table || index < 0 || table.rows.length <= 1) return doc;

  const targetIndex = Math.max(0, Math.min(rowIndex, table.rows.length - 1));
  table.rows.splice(targetIndex, 1);
  return doc;
}

export function insertTableColumn(doc, { tableId, colIndex = 0, position = "right" }) {
  const { table, index } = findTableById(doc, tableId);
  if (!table || index < 0) return doc;

  const insertAt = position === "left" ? colIndex : colIndex + 1;

  table.rows.forEach((row, rIdx) => {
    const isHeader = (table.attrs?.headerRows > 0 && rIdx === 0) || row.cells[colIndex]?.type === "tableHeader";
    const newCell = createTableCell({ header: isHeader });
    const targetIdx = Math.max(0, Math.min(insertAt, row.cells.length));
    row.cells.splice(targetIdx, 0, newCell);
  });

  return doc;
}

export function deleteTableColumn(doc, { tableId, colIndex }) {
  const { table, index } = findTableById(doc, tableId);
  if (!table || index < 0) return doc;

  if (!table.rows.length || table.rows[0].cells.length <= 1) return doc;

  table.rows.forEach((row) => {
    const targetIdx = Math.max(0, Math.min(colIndex, row.cells.length - 1));
    row.cells.splice(targetIdx, 1);
  });

  return doc;
}

export function mergeTableCells(doc, { tableId, startRow, endRow, startCol, endCol }) {
  const { table, index } = findTableById(doc, tableId);
  if (!table || index < 0) return doc;

  const grid = buildTableGrid(table);
  const mainCellInfo = grid[startRow]?.[startCol];
  if (!mainCellInfo) return doc;

  const mainCell = table.rows[mainCellInfo.originRow]?.cells?.find((c) => c.id === mainCellInfo.cellId);
  if (!mainCell) return doc;

  const rowSpan = endRow - startRow + 1;
  const colSpan = endCol - startCol + 1;
  mainCell.attrs.rowSpan = rowSpan;
  mainCell.attrs.colSpan = colSpan;

  const cellIdsToRemove = new Set();
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const info = grid[r]?.[c];
      if (info && info.cellId !== mainCell.id) {
        cellIdsToRemove.add(info.cellId);
      }
    }
  }

  table.rows.forEach((row) => {
    row.cells = row.cells.filter((c) => !cellIdsToRemove.has(c.id));
  });

  return doc;
}

export function splitTableCell(doc, { tableId, rowIndex, colIndex }) {
  const { table, index } = findTableById(doc, tableId);
  if (!table || index < 0) return doc;

  const grid = buildTableGrid(table);
  const cellInfo = grid[rowIndex]?.[colIndex];
  if (!cellInfo) return doc;

  const targetCell = table.rows[cellInfo.originRow]?.cells?.find((c) => c.id === cellInfo.cellId);
  if (!targetCell) return doc;

  const rowSpan = targetCell.attrs?.rowSpan || 1;
  const colSpan = targetCell.attrs?.colSpan || 1;
  if (rowSpan <= 1 && colSpan <= 1) return doc;

  targetCell.attrs.rowSpan = 1;
  targetCell.attrs.colSpan = 1;

  // Insert replacement single cells into grid positions occupied by span
  for (let r = cellInfo.originRow; r < cellInfo.originRow + rowSpan; r++) {
    for (let c = cellInfo.originColumn; c < cellInfo.originColumn + colSpan; c++) {
      if (r === cellInfo.originRow && c === cellInfo.originColumn) continue;

      const newCell = createTableCell({ header: targetCell.type === "tableHeader" });
      const rowObj = table.rows[r];
      if (rowObj) {
        rowObj.cells.push(newCell);
      }
    }
  }

  return doc;
}

export function deleteTable(doc, { tableId }) {
  if (!doc || !Array.isArray(doc.content)) return doc;
  doc.content = doc.content.filter((b) => !(b.type === "table" && (b.id === tableId || !tableId)));
  return doc;
}

export function setTableTheme(doc, { tableId, theme }) {
  const { table } = findTableById(doc, tableId);
  if (table) {
    table.attrs.theme = theme;
  }
  return doc;
}

export function setTableHeaderColor(doc, { tableId, color }) {
  const { table } = findTableById(doc, tableId);
  if (table && table.rows.length > 0) {
    table.rows[0].cells.forEach((cell) => {
      cell.attrs.backgroundColor = color;
    });
  }
  return doc;
}
