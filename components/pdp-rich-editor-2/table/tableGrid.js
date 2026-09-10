export function buildTableGrid(table) {
  const grid = [];
  if (!table || !Array.isArray(table.rows)) return grid;

  table.rows.forEach((row, rowIndex) => {
    if (!grid[rowIndex]) {
      grid[rowIndex] = [];
    }

    let logicalColumn = 0;

    (row.cells || []).forEach((cell) => {
      while (grid[rowIndex][logicalColumn]) {
        logicalColumn += 1;
      }

      const rowSpan = Math.max(1, Number(cell.attrs?.rowSpan) || 1);
      const colSpan = Math.max(1, Number(cell.attrs?.colSpan) || 1);

      for (let rowOffset = 0; rowOffset < rowSpan; rowOffset += 1) {
        const targetRow = rowIndex + rowOffset;
        if (!grid[targetRow]) {
          grid[targetRow] = [];
        }

        for (let columnOffset = 0; columnOffset < colSpan; columnOffset += 1) {
          grid[targetRow][logicalColumn + columnOffset] = {
            cellId: cell.id,
            originRow: rowIndex,
            originColumn: logicalColumn,
            cellObj: cell,
            isOrigin: rowOffset === 0 && columnOffset === 0,
          };
        }
      }

      logicalColumn += colSpan;
    });
  });

  return grid;
}

export function getGridDimensions(grid) {
  const rowCount = grid.length;
  let colCount = 0;
  grid.forEach((row) => {
    if (row && row.length > colCount) colCount = row.length;
  });
  return { rowCount, colCount };
}
