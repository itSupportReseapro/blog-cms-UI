// components/pdp-table/TableDesktop.js
"use client";

import { normalizeCellValue } from "./utils";

export default function TableDesktop({
  columns,
  rows,
  visibleColumns,
  columnWidths,
  initResize,

  selectable,
  selectedKeys,
  onSelectRow,
  onSelectPage,
  getRowKey,
  pageIndexOffset,

  sortConfig,
  onSort,

  enableFilters,
  appliedFilters,
  onOpenFilter,

  showActions,
  actions,

  showStatusDot,
  highlightStatusCells,
  statusField,
  statusTrueValues,

  // icon pack
  icons,
}) {
  const allPageSelected =
    selectable &&
    rows.length > 0 &&
    rows.every((r) => selectedKeys.includes(getRowKey(r)));

  const isStatusTrue = (v) => statusTrueValues.includes(v);

  const sortNode = (colField) => {
    const isSorted = sortConfig?.key === colField && Boolean(sortConfig?.direction);
    if (!isSorted) return icons?.sortNone ?? "↕";
    return sortConfig.direction === "asc"
      ? (icons?.sortAsc ?? "▲")
      : (icons?.sortDesc ?? "▼");
  };

  const filterNode = (colField) => {
    const isFiltered = Boolean(appliedFilters?.[colField]);
    if (isFiltered) return icons?.filterActive ?? icons?.filter ?? "⛃";
    return icons?.filter ?? "⛃";
  };

  return (
    <table className="pdp-table">
      <thead>
        <tr>
          {selectable && (
            <th className="pdp-th" style={{ width: 44, textAlign: "center" }}>
              <input
                type="checkbox"
                checked={Boolean(allPageSelected)}
                onChange={(e) => onSelectPage(e.target.checked)}
                aria-label="Select page"
              />
            </th>
          )}

          <th className="pdp-th" style={{ width: 74 }}>
            Sl No.
          </th>

          {columns.map((col) => {
            if (!visibleColumns?.[col.field]) return null;

            const isSorted = sortConfig?.key === col.field && Boolean(sortConfig?.direction);
            const isFiltered = Boolean(appliedFilters?.[col.field]);

            return (
              <th
                key={col.field}
                className={`pdp-th ${isSorted ? "pdp-hasSort" : ""} ${
                  isFiltered ? "pdp-hasFilter" : ""
                }`}
                style={{
                  width: columnWidths?.[col.field] ?? col.width ?? 150,
                  minWidth: col.minWidth ?? 100,
                }}
              >
                {/* IMPORTANT: no layout shift (icons area reserved) */}
                <div
                  className="pdp-headerCell"
                  data-active={isSorted || isFiltered ? "1" : "0"}
                >
                  <span className="pdp-headerLabel" title={col.label}>
                    {col.label}
                  </span>

                  <div className="pdp-headerActions">
                    {/* Sort icon only visible on hover/active (CSS), but space is reserved always */}
                    {col.sortable !== false && (
                      <button
                        type="button"
                        className="pdp-iconBtn"
                        onClick={() => onSort(col.field)}
                        title="Sort"
                        aria-label={`Sort ${col.label}`}
                      >
                        {sortNode(col.field)}
                      </button>
                    )}

                    {/* Filter icon only visible on hover/active (CSS), but space is reserved always */}
                    {enableFilters && col.filterable !== false && (
                      <button
                        type="button"
                        className={`pdp-iconBtn ${isFiltered ? "pdp-filterActiveBtn" : ""}`}
                        onClick={() => onOpenFilter(col.field)}
                        title={isFiltered ? "Filter applied" : "Filter"}
                        aria-label={`Filter ${col.label}`}
                      >
                        {filterNode(col.field)}
                        {isFiltered ? <span className="pdp-iconBadge" /> : null}
                      </button>
                    )}

                    {/* Resizer */}
                    {initResize ? (
                      <div
                        className="pdp-resizer"
                        onMouseDown={(e) => initResize(e, col.field)}
                        aria-hidden="true"
                      />
                    ) : null}
                  </div>
                </div>
              </th>
            );
          })}

          {showActions && actions?.length ? (
            <th className="pdp-th" style={{ width: 100, textAlign: "center" }}>
              Actions
            </th>
          ) : null}
        </tr>
      </thead>

      <tbody>
        {rows.length ? (
          rows.map((row, idx) => {
            const k = getRowKey(row) ?? idx;

            return (
              <tr key={k} className="pdp-tr">
                {selectable && (
                  <td className="pdp-td" style={{ textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={selectedKeys.includes(k)}
                      onChange={() => onSelectRow(row)}
                      aria-label="Select row"
                    />
                  </td>
                )}

                <td className="pdp-td">
                  {showStatusDot && (
                    <span
                      className={`pdp-statusDot ${
                        isStatusTrue(row?.[statusField]) ? "pdp-active" : "pdp-inactive"
                      }`}
                    />
                  )}
                  {pageIndexOffset + idx + 1}
                </td>

                {columns.map((col) => {
                  if (!visibleColumns?.[col.field]) return null;

                  const raw = row?.[col.field];

                  if (highlightStatusCells && (col.field === statusField || col.type === "status")) {
                    const isOn = isStatusTrue(raw);
                    return (
                      <td
                        key={col.field}
                        className={`pdp-td ${isOn ? "pdp-activeCell" : "pdp-inactiveCell"}`}
                        title={isOn ? "Active" : "Inactive"}
                      >
                        {isOn ? "Active" : "Inactive"}
                      </td>
                    );
                  }

                  const content = col.render
                    ? col.render(raw, row)
                    : normalizeCellValue(col, raw, { statusField, statusTrueValues });

                  return (
                    <td key={col.field} className="pdp-td" title={String(content ?? "")}>
                      {content}
                    </td>
                  );
                })}

                {showActions && actions?.length ? (
                  <td className="pdp-td">
                    <div className="pdp-actionRow">
                      {actions.map((a) => (
                        <button
                          key={a.key}
                          type="button"
                          className="pdp-actionBtn"
                          onClick={() => a.onClick(row)}
                          title={a.label}
                          aria-label={a.label}
                        >
                          {/* icon if provided, else label */}
                          {a.icon ? a.icon : a.label}
                        </button>
                      ))}
                    </div>
                  </td>
                ) : null}
              </tr>
            );
          })
        ) : (
          <tr>
            <td className="pdp-td" colSpan={999}>
              No matching records found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
