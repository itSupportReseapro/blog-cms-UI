//components/pdp-table/PaginationFooter.js
"use client";

export default function PaginationFooter({
  pageSizeOptions,
  rowsPerPage,
  onRowsPerPageChange,
  currentPage,
  totalPages,
  onPrev,
  onNext,
  showingCount,
  totalCount,
}) {
  return (
    <div className="pdp-pagination">
      <div className="pdp-rowsPerPage">
        <span>Rows per Sheet</span>
        <select value={rowsPerPage} onChange={(e) => onRowsPerPageChange(e.target.value)}>
          {pageSizeOptions.map((s) => (
            <option key={String(s)} value={String(s)}>{String(s)}</option>
          ))}
        </select>
      </div>

      <div className="pdp-pageNav">
        <button type="button" onClick={onPrev} disabled={currentPage <= 1}>Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button type="button" onClick={onNext} disabled={currentPage >= totalPages}>Next</button>
      </div>

      <span className="pdp-showingText">
        Showing {showingCount} of {totalCount} rows
      </span>
    </div>
  );
}
