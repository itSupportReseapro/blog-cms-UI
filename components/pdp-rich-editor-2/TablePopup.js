import { useEffect } from "react";

export default function TablePopup({
  tableUI,
  tableRowsInputRef,
  tableColsInputRef,
  onRowsChange,
  onColsChange,
  onInsert,
  onClose,
}) {
  useEffect(() => {
    if (tableUI.open) {
      setTimeout(() => tableRowsInputRef.current?.focus(), 0);
    }
  }, [tableUI.open, tableRowsInputRef]);

  if (!tableUI.open) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: tableUI.x,
        top: tableUI.y,
      }}
      className="re-table-pop"
      onMouseDownCapture={(e) => {
        if (e.target.tagName === "INPUT") {
          e.stopPropagation();
        } else {
          e.preventDefault();
        }
      }}
    >
      <div className="re-table-inputs">
        <div className="re-table-input-group">
          <label className="re-table-label">Rows:</label>
          <input
            ref={tableRowsInputRef}
            type="number"
            min="1"
            max="20"
            value={tableUI.rows}
            onChange={(e) => {
              const num = parseInt(e.target.value, 10);
              const val = Number.isFinite(num) ? Math.max(1, Math.min(20, num)) : tableUI.rows;
              onRowsChange(val);
            }}
            className="re-table-input"
          />
        </div>
        <div className="re-table-input-group">
          <label className="re-table-label">Cols:</label>
          <input
            ref={tableColsInputRef}
            type="number"
            min="1"
            max="20"
            value={tableUI.cols}
            onChange={(e) => {
              const num = parseInt(e.target.value, 10);
              const val = Number.isFinite(num) ? Math.max(1, Math.min(20, num)) : tableUI.cols;
              onColsChange(val);
            }}
            className="re-table-input"
          />
        </div>
      </div>

      <div className="re-table-actions">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onInsert}
          className="re-link-apply-btn"
        >
          Insert
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onClose}
          className="re-link-secondary-btn"
        >
          Close
        </button>
      </div>
    </div>
  );
}
