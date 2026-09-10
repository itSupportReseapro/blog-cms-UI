export function getTableSelectionBounds(selection) {
  if (!selection || !selection.anchor || !selection.focus) {
    return null;
  }

  return {
    startRow: Math.min(selection.anchor.rowIndex, selection.focus.rowIndex),
    endRow: Math.max(selection.anchor.rowIndex, selection.focus.rowIndex),
    startColumn: Math.min(selection.anchor.columnIndex, selection.focus.columnIndex),
    endColumn: Math.max(selection.anchor.columnIndex, selection.focus.columnIndex),
  };
}

export function isCellSelected(selection, rowIndex, colIndex) {
  const bounds = getTableSelectionBounds(selection);
  if (!bounds) return false;
  return (
    rowIndex >= bounds.startRow &&
    rowIndex <= bounds.endRow &&
    colIndex >= bounds.startColumn &&
    colIndex <= bounds.endColumn
  );
}
