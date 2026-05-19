// components/pdp-table/TableDesktop.js
"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { normalizeCellValue } from "./utils";
import ThreeDotsIcon from "@/assets/Images/icon/3-dots.svg";
import BothArrowIcon from "@/assets/Images/icon/both-arrow.svg";
import SortUpIcon from "@/assets/Images/icon/SortUP.svg";
import SortDownIcon from "@/assets/Images/icon/SortDown.svg";
import FilterIcon from "@/assets/Images/icon/filter-icon.svg";

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

  expandableRows,
  getExpandedRows,
  renderExpandedContent,
  headerRows,
  summaryRows,

  // icon pack
  icons,
}) {
  const [openRowKeys, setOpenRowKeys] = useState([]);
  const [openActionMenuKey, setOpenActionMenuKey] = useState(null);
  const [actionMenuPos, setActionMenuPos] = useState({ top: 0, left: 0 });
  const tableRef = useRef(null);
  const actionMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!openActionMenuKey) {
        return;
      }

      // Close menu if click is outside the menu (regardless of whether it's in the table)
      const clickedInsideMenu = actionMenuRef.current?.contains(event.target);

      if (!clickedInsideMenu) {
        setOpenActionMenuKey(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [openActionMenuKey]);

  useEffect(() => {
    const closeMenu = () => setOpenActionMenuKey(null);
    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("resize", closeMenu);

    return () => {
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("resize", closeMenu);
    };
  }, []);

  const allPageSelected =
    selectable &&
    rows.length > 0 &&
    rows.every((r) => selectedKeys.includes(getRowKey(r)));

  const hasActionsColumn = showActions && Boolean(actions?.length);
  const visibleColumnCount = columns.filter((col) => visibleColumns?.[col.field]).length;
  const hasVisibleDataColumns = visibleColumnCount > 0;
  const showSerialColumn = hasVisibleDataColumns;
  const showRowActionsColumn = hasActionsColumn && hasVisibleDataColumns;
  const totalColumnCount =
    visibleColumnCount +
    (showSerialColumn ? 1 : 0) +
    (expandableRows ? 1 : 0) +
    (selectable ? 1 : 0) +
    (showRowActionsColumn ? 1 : 0);

  const isStatusTrue = (v) => statusTrueValues.includes(v);

  const isColumnSorted = (colField) =>
    sortConfig?.key === colField && Boolean(sortConfig?.direction);

  const isColumnFiltered = (colField) => Boolean(appliedFilters?.[colField]);

  const toggleExpandedRow = (rowKey) => {
    setOpenRowKeys((prev) =>
      prev.includes(rowKey)
        ? prev.filter((key) => key !== rowKey)
        : [...prev, rowKey]
    );
  };

  const renderSpanCells = (cells, rowKeyPrefix, isHeader = false) =>
    (cells || []).map((cell, index) => {
      const key = `${rowKeyPrefix}-${index}`;
      const Tag = isHeader ? "th" : "td";
      const className = isHeader ? "pdp-th" : "pdp-td";

      return (
        <Tag
          key={key}
          className={className}
          colSpan={cell?.colSpan || 1}
          rowSpan={cell?.rowSpan || 1}
          style={{ textAlign: cell?.align || "left" }}
        >
          {cell?.content}
        </Tag>
      );
    });

  return (
    <table className="pdp-table" ref={tableRef}>
      <thead>
        {(headerRows || []).map((headerRow, headerIndex) => (
          <tr key={`header-row-${headerIndex}`}>
            {renderSpanCells(headerRow, `header-${headerIndex}`, true)}
          </tr>
        ))}

        <tr>
          {expandableRows ? (
            <th className="pdp-th" style={{ width: 52, textAlign: "center" }}>
              #
            </th>
          ) : null}

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

          {showSerialColumn ? (
            <th className="pdp-th pdp-serialCol" style={{ width: 64, textAlign: "center" }}>
              Sl No.
            </th>
          ) : null}

          {columns.map((col) => {
            if (!visibleColumns?.[col.field]) return null;

            const isSorted = isColumnSorted(col.field);
            const isFiltered = isColumnFiltered(col.field);

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
                        className="pdp-headerIconBtn pdp-sortBtn"
                        onClick={() => onSort(col.field)}
                        title="Sort"
                        aria-label={`Sort ${col.label}`}
                      >
                        {sortConfig?.key === col.field && sortConfig?.direction === "asc" ? (
                          <Image src={SortUpIcon} alt="Sort Ascending" width={13} height={13} />
                        ) : sortConfig?.key === col.field && sortConfig?.direction === "desc" ? (
                          <Image src={SortDownIcon} alt="Sort Descending" width={13} height={13} />
                        ) : (
                          <Image src={BothArrowIcon} alt="Sort" width={13} height={13} />
                        )}
                      </button>
                    )}

                    {/* Filter icon only visible on hover/active (CSS), but space is reserved always */}
                    {enableFilters && col.filterable !== false && (
                      <button
                        type="button"
                        className={`pdp-headerIconBtn pdp-filterBtn ${isFiltered ? "pdp-filterActiveBtn" : ""}`}
                        onClick={() => onOpenFilter(col.field)}
                        title={isFiltered ? "Filter applied" : "Filter"}
                        aria-label={`Filter ${col.label}`}
                      >
                        <Image src={FilterIcon} alt="Filter" width={13} height={13} />
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

          {showRowActionsColumn ? (
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
            const rowActions = (actions || []).filter((action) => {
              if (typeof action.condition !== "function") {
                return true;
              }

              return action.condition(row);
            });

            const isOpen = openRowKeys.includes(k);
            const expandedRows = typeof getExpandedRows === "function" ? getExpandedRows(row) : [];

            return (
              <Fragment key={k}>
                <tr className="pdp-tr">
                  {expandableRows ? (
                    <td className="pdp-td" style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        className="pdp-expandBtn"
                        onClick={() => toggleExpandedRow(k)}
                        aria-label={isOpen ? "Collapse row" : "Expand row"}
                      >
                        {isOpen ? (icons?.collapse ?? "-") : (icons?.expand ?? "+")}
                      </button>
                    </td>
                  ) : null}

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

                  {showSerialColumn ? (
                    <td className="pdp-td pdp-serialCol" style={{ width: 64, textAlign: "center" }}>
                      {showStatusDot && (
                        <span
                          className={`pdp-statusDot ${
                            isStatusTrue(row?.[statusField]) ? "pdp-active" : "pdp-inactive"
                          }`}
                        />
                      )}
                      {pageIndexOffset + idx + 1}
                    </td>
                  ) : null}

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

                  {showRowActionsColumn ? (
                    <td className="pdp-td pdp-actionsCell" style={{ textAlign: "center" }}>
                      <div className="pdp-actionMenuWrap">
                        <button
                          type="button"
                          className="pdp-actionKebabBtn"
                          onClick={(event) => {
                            event.stopPropagation();
                            const buttonRect = event.currentTarget.getBoundingClientRect();
                            const viewportWidth = window.innerWidth;
                            const viewportHeight = window.innerHeight;
                            
                            const estimatedWidth = 170;
                            const estimatedHeight = Math.max(56, rowActions.length * 44 + 16);
                            
                            // Calculate horizontal position (prioritize right alignment, fallback to left)
                            let nextLeft = buttonRect.right - estimatedWidth;
                            
                            // Ensure menu doesn't overflow right edge
                            if (nextLeft + estimatedWidth + 12 > viewportWidth) {
                              nextLeft = viewportWidth - estimatedWidth - 12;
                            }
                            
                            // Ensure menu doesn't overflow left edge
                            if (nextLeft < 12) {
                              nextLeft = 12;
                            }
                            
                            // Calculate vertical position (prefer below, fallback to above)
                            let nextTop = buttonRect.bottom + 8;
                            
                            // Check if fits below
                            const fitsBelow = nextTop + estimatedHeight + 12 <= viewportHeight;
                            if (!fitsBelow) {
                              nextTop = Math.max(12, buttonRect.top - estimatedHeight - 8);
                            }

                            setActionMenuPos({
                              top: nextTop,
                              left: nextLeft,
                            });

                            setOpenActionMenuKey((prev) => (prev === k ? null : k));
                          }}
                          aria-label="Row actions"
                          title="Row actions"
                        >
                          <Image src={ThreeDotsIcon} alt="More" width={18} height={18} />
                        </button>

                        {openActionMenuKey === k && rowActions.length > 0 && typeof document !== "undefined"
                          ? createPortal(
                              <div
                                ref={actionMenuRef}
                                className="pdp-actionMenu pdp-actionMenuFixed"
                                role="menu"
                                style={{ top: actionMenuPos.top, left: actionMenuPos.left }}
                              >
                                {rowActions.map((action) => (
                                  <button
                                    key={action.key}
                                    type="button"
                                    className="pdp-actionMenuItem"
                                    onClick={() => {
                                      action.onClick(row);
                                      setOpenActionMenuKey(null);
                                    }}
                                    role="menuitem"
                                  >
                                    {action.label}
                                  </button>
                                ))}
                              </div>,
                              document.body
                            )
                          : null}
                      </div>
                    </td>
                  ) : null}
                </tr>

                {expandableRows && isOpen ? (
                  <tr className="pdp-expandedRow">
                    <td className="pdp-td" colSpan={totalColumnCount}>
                      {typeof renderExpandedContent === "function" ? (
                        renderExpandedContent(row)
                      ) : expandedRows.length ? (
                        <div className="pdp-subTableWrap">
                          <table className="pdp-subTable">
                            <thead>
                              <tr>
                                {Object.keys(expandedRows[0] || {}).map((cellKey) => (
                                  <th key={cellKey}>{cellKey}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {expandedRows.map((expandedRow, expandedIndex) => (
                                <tr key={`${k}-sub-${expandedIndex}`}>
                                  {Object.keys(expandedRow).map((cellKey) => (
                                    <td key={cellKey}>{expandedRow[cellKey]}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="pdp-emptyExpanded">No additional details available.</div>
                      )}
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })
        ) : (
          <tr>
            <td className="pdp-td" colSpan={totalColumnCount}>
              No matching records found.
            </td>
          </tr>
        )}

        {(summaryRows || []).map((summaryRow, summaryIndex) => (
          <tr key={`summary-row-${summaryIndex}`}>
            {renderSpanCells(summaryRow, `summary-${summaryIndex}`)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
