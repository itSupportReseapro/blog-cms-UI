// components/pdp-table/PdpTable.js
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import "./pdp-table.css";

import usePdpTableState from "./usePdpTableState";
import useColumnResize from "./useColumnResize";

import ColumnManagerDropdown from "./ColumnManagerDropdown";
import FilterModal from "./FilterModal";
import TableDesktop from "./TableDesktop";
import TableMobileCards from "./TableMobileCards";
import PaginationFooter from "./PaginationFooter";
import EmptyState from "./EmptyState";
import SkeletonTable from "./SkeletonTable";

import { exportRowsToExcel, exportRowsToPDF } from "./exporters";
import TableSidebar from "./TableSidebar";
import FilterIcon from "@/assets/Images/icon/filter-icon.svg";
import DownloadIcon from "@/assets/Images/icon/DownloadIcon.svg";
import SearchIcon from "@/assets/Images/icon/search-icon.svg";

export default function PdpTable({
  columns = [],
  data = [],
  rowKey = "id",

  title = "",
  searchEnabled = true,
  searchPlaceholder = "Search...",
  toolbarLeft = null,
  toolbarRight = null,

  pageSizeOptions = [5, 10, 15, 20, "All"],
  defaultPageSize,
  defaultSort,
  enableFilters = true,
  showFilterButton = true,

  selectable = false,
  onSelectionChange,

  showActions = true,
  actions,
  onEdit,
  onDelete,

  showStatusDot = false,
  highlightStatusCells = false,
  statusField = "isActive",
  statusTrueValues = [1, "1", true, "true", "Active"],

  expandableRows = false,
  getExpandedRows,
  renderExpandedContent,
  headerRows = [],
  summaryRows = [],

  mobileMode = "auto",
  breakpoint = 768,

  enableColumnManager = true,
  enableResize = true,
  autoFitColumns = true,

  loading = false,

  exportMode = "currentPage", // "currentPage" | "allFiltered"
  exportFileBaseName,

  theme = "auto", // "auto" | "light" | "dark"
  bodyHeight = 520,

  densityToggle = true,
  defaultDensity = "comfortable", // "comfortable" | "compact"

  sidebarMode = "auto", // "auto" | "always" | "never"
  sidebarColumnThreshold = 12,
  sidebarRowThreshold = 30,

  showToolbar = true,
  showFooter = true,

  icons,
}) {
  // actions
  const resolvedActions = useMemo(() => {
    if (Array.isArray(actions) && actions.length) return actions;
    const out = [];
    if (onEdit) out.push({ key: "edit", label: "Edit", onClick: onEdit, icon: icons?.edit });
    if (onDelete) out.push({ key: "delete", label: "Delete", onClick: onDelete, icon: icons?.delete });
    return out;
  }, [actions, onEdit, onDelete, icons]);

  // state
  const table = usePdpTableState({
    columns,
    data,
    rowKey,
    pageSizeOptions,
    defaultPageSize,
    defaultSort,
    selectable,
    onSelectionChange,
    enableFilters,
  });

  // resize
const resize = useColumnResize({
  columns,
  visibleColumns: table.visibleColumns,
  selectable,
  showActions: showActions && resolvedActions.length > 0,
  autoFitColumns,

  stretchToFill: false,   // ✅ prevents “infinite expand”
  maxColWidth: 260,       // ✅ cap
});

  // responsive
  const [clientWidth, setClientWidth] = useState(null);
  useEffect(() => {
    const update = () => setClientWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const isMobile =
    mobileMode === "cards"
      ? true
      : mobileMode === "table"
      ? false
      : clientWidth !== null
      ? clientWidth <= breakpoint
      : false;

  const pageIndexOffset =
    table.rowsPerPage === "All" ? 0 : (table.currentPage - 1) * Number(table.rowsPerPage);

  const activeFilterCount = Object.keys(table.appliedFilters || {}).length;
  const hasVisibleDataColumns = useMemo(
    () => columns.some((column) => table.visibleColumns?.[column.field]),
    [columns, table.visibleColumns]
  );
  const firstFilterableColumn = useMemo(
    () => columns.find((column) => column.filterable !== false) || columns[0],
    [columns]
  );

  // density
  const [density, setDensity] = useState(defaultDensity);

  // search focus
  const searchRef = useRef(null);

  const clearAllSearchAndFilters = () => {
    table.setSearchQuery("");
    table.clearAllFilters();
  };

  // column manager dropdown
  const [columnManagerOpen, setColumnManagerOpen] = useState(false);
  const cmRef = useRef(null);
  useEffect(() => {
    const onDown = (e) => {
      if (!columnManagerOpen) return;
      if (cmRef.current && !cmRef.current.contains(e.target)) setColumnManagerOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [columnManagerOpen]);

  // export dropdown
  const [exportOpen, setExportOpen] = useState(false);
  const [exportScope, setExportScope] = useState(exportMode);
  const exportRef = useRef(null);

  // keep export scope synced with prop
  useEffect(() => {
    setExportScope(exportMode);
  }, [exportMode]);

  useEffect(() => {
    const onDown = (e) => {
      if (!exportOpen) return;
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [exportOpen]);

  // Sidebar decision
  const shouldUseSidebar =
    sidebarMode === "always"
      ? true
      : sidebarMode === "never"
      ? false
      : columns.length >= sidebarColumnThreshold || table.filteredRows.length >= sidebarRowThreshold;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // never keep dropdowns open when sidebar is enabled
  useEffect(() => {
    if (shouldUseSidebar) {
      setExportOpen(false);
      setColumnManagerOpen(false);
    } else {
      setSidebarOpen(false);
    }
  }, [shouldUseSidebar]);

  const fileBase = exportFileBaseName || title || "table";

  const getExportRows = () => (exportScope === "allFiltered" ? table.sortedRows : table.pageRows);

  const doExportExcel = async () => {
    const rows = getExportRows();
    if (!rows.length) return;
    await exportRowsToExcel({
      rows,
      columns,
      visibleColumns: table.visibleColumns,
      fileBaseName: fileBase,
      statusField,
      statusTrueValues,
    });
  };

  const doExportPDF = async () => {
    const rows = getExportRows();
    if (!rows.length) return;
    await exportRowsToPDF({
      rows,
      columns,
      visibleColumns: table.visibleColumns,
      fileBaseName: fileBase,
      statusField,
      statusTrueValues,
      title,
    });
  };

  return (
    <div className="pdp-root" data-theme={theme} data-density={density}>
      {/* TOOLBAR */}
      {showToolbar && (
        <div className="pdp-toolbar">
          <div className="pdp-toolbarLeft">
            {title ? <h3 className="pdp-title">{title}</h3> : null}
            {toolbarLeft}

            {enableFilters && (activeFilterCount > 0 || table.searchQuery) ? (
              <button
                type="button"
                className="pdp-chip"
                onClick={clearAllSearchAndFilters}
                title="Clear filters & search"
              >
                Filters active • {activeFilterCount} ✕
              </button>
            ) : null}
          </div>

          <div className="pdp-toolbarCenter">
            {searchEnabled ? (
              <div className="pdp-searchWrap">
                <input
                  ref={searchRef}
                  className="pdp-search"
                  type="text"
                  placeholder={searchPlaceholder}
                  value={table.searchQuery}
                  onChange={(e) => table.setSearchQuery(e.target.value)}
                />
                <button
                  type="button"
                  className="pdp-searchBtn"
                  onClick={() => searchRef.current?.focus()}
                  title="Search"
                  aria-label="Search"
                >
                  <Image src={SearchIcon} alt="Search" width={14} height={14} />
                </button>
              </div>
            ) : null}
          </div>

          <div className="pdp-toolbarRight">
            {toolbarRight}

            {showFilterButton && enableFilters && firstFilterableColumn ? (
              <button
                type="button"
                className="pdp-toolbarIconBtn"
                onClick={() => table.openFilter(firstFilterableColumn.field)}
                title="Open filters"
                aria-label="Open filters"
              >
                <Image src={FilterIcon} alt="Filter" width={16} height={16} />
              </button>
            ) : null}

            {densityToggle && (
              <button
                type="button"
                className="pdp-tableBtn"
                onClick={() => setDensity((d) => (d === "comfortable" ? "compact" : "comfortable"))}
                title="Toggle row density"
              >
                <span className="pdp-btnIcon">{icons?.density ?? "≡"}</span>
                {density === "comfortable" ? "Compact" : "Comfortable"}
              </button>
            )}

            {shouldUseSidebar ? (
              <button
                type="button"
                className="pdp-tableBtn"
                onClick={() => setSidebarOpen(true)}
                title="Table controls"
              >
                <span className="pdp-btnIcon">{icons?.controls ?? "☰"}</span>
                Controls
              </button>
            ) : (
              <>
                {/* Export dropdown */}
                <div className="pdp-cmWrap" ref={exportRef}>
                  <button
                    type="button"
                    className="pdp-toolbarIconBtn"
                    onClick={() => setExportOpen((s) => !s)}
                    disabled={loading}
                    title="Export"
                    aria-label="Export"
                  >
                    <Image src={DownloadIcon} alt="Download" width={16} height={16} />
                  </button>

                  {exportOpen && (
                    <div className="pdp-dropdown">
                      <div className="pdp-dropdownSectionTitle">Scope</div>

                      <label className="pdp-radioRow">
                        <input
                          type="radio"
                          name="exportScope"
                          checked={exportScope === "currentPage"}
                          onChange={() => setExportScope("currentPage")}
                        />
                        <span>Current page</span>
                      </label>

                      <label className="pdp-radioRow">
                        <input
                          type="radio"
                          name="exportScope"
                          checked={exportScope === "allFiltered"}
                          onChange={() => setExportScope("allFiltered")}
                        />
                        <span>All filtered</span>
                      </label>

                      <div className="pdp-dropdownDivider" />

                      <button
                        type="button"
                        className="pdp-dropdownItem"
                        disabled={loading || getExportRows().length === 0}
                        onClick={async () => {
                          await doExportExcel();
                          setExportOpen(false);
                        }}
                      >
                        Export Excel
                      </button>

                      <button
                        type="button"
                        className="pdp-dropdownItem"
                        disabled={loading || getExportRows().length === 0}
                        onClick={async () => {
                          await doExportPDF();
                          setExportOpen(false);
                        }}
                      >
                        Export PDF
                      </button>
                    </div>
                  )}
                </div>

                {/* Column manager dropdown */}
                {enableColumnManager && (
                  <div className="pdp-cmWrap" ref={cmRef}>
                    <button
                      type="button"
                      className="pdp-iconBtn"
                      onClick={() => setColumnManagerOpen((s) => !s)}
                      title="Column Manager"
                      aria-label="Column Manager"
                    >
                      ☰
                    </button>

                    {columnManagerOpen && (
                      <ColumnManagerDropdown
                        columns={columns}
                        visibleColumns={table.visibleColumns}
                        onToggle={table.toggleColumn}
                        onShowAll={table.showAllColumns}
                        onHideAll={table.hideAllColumns}
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* BODY */}
      <div className="pdp-body" ref={enableResize ? resize.containerRef : undefined}>
<div className="pdp-tableScroll" style={{ height: bodyHeight }}>
          {loading ? (
            <SkeletonTable
              columns={columns}
              visibleColumns={table.visibleColumns}
              selectable={selectable}
              showActions={showActions && resolvedActions.length > 0}
              rows={8}
            />
          ) : table.filteredRows.length === 0 || !hasVisibleDataColumns ? (
            <EmptyState
              hasFilters={activeFilterCount > 0 || Boolean(table.searchQuery)}
              onClear={clearAllSearchAndFilters}
            />
          ) : isMobile ? (
            <TableMobileCards
              columns={columns}
              rows={table.pageRows}
              visibleColumns={table.visibleColumns}
              getRowKey={table.getRowKey}
              pageIndexOffset={pageIndexOffset}
              showActions={showActions && resolvedActions.length > 0}
              actions={resolvedActions}
              statusField={statusField}
              statusTrueValues={statusTrueValues}
            />
          ) : (
            <TableDesktop
              columns={columns}
              rows={table.pageRows}
              visibleColumns={table.visibleColumns}
              columnWidths={enableResize ? resize.columnWidths : {}}
              initResize={enableResize ? resize.initResize : null}
              selectable={selectable}
              selectedKeys={table.selectedKeys}
              onSelectRow={table.selectRow}
              onSelectPage={table.selectPage}
              getRowKey={table.getRowKey}
              pageIndexOffset={pageIndexOffset}
              sortConfig={table.sortConfig}
              onSort={table.cycleSort}
              enableFilters={enableFilters}
              appliedFilters={table.appliedFilters}
              onOpenFilter={table.openFilter}
              showActions={showActions && resolvedActions.length > 0}
              actions={resolvedActions}
              showStatusDot={showStatusDot}
              highlightStatusCells={highlightStatusCells}
              statusField={statusField}
              statusTrueValues={statusTrueValues}
              expandableRows={expandableRows}
              getExpandedRows={getExpandedRows}
              renderExpandedContent={renderExpandedContent}
              headerRows={headerRows}
              summaryRows={summaryRows}
              icons={icons}
            />
          )}
        </div>
      </div>

      {/* FOOTER (ONLY HERE, NEVER IN TableDesktop) */}
      {showFooter && (
        <PaginationFooter
          pageSizeOptions={pageSizeOptions}
          rowsPerPage={table.rowsPerPage}
          onRowsPerPageChange={table.setRowsPerPage}
          currentPage={table.currentPage}
          totalPages={table.totalPages}
          onPrev={() => table.setCurrentPage(Math.max(1, table.currentPage - 1))}
          onNext={() => table.setCurrentPage(Math.min(table.totalPages, table.currentPage + 1))}
          showingCount={table.pageRows.length}
          totalCount={table.filteredRows.length}
        />
      )}

      {/* FILTER MODAL */}
      <FilterModal
        columns={columns}
        filterUI={table.filterUI}
        setFilterUI={table.setFilterUI}
        onApply={table.applyFilterFromUI}
        onClearAll={table.clearAllFilters}
        onClose={() => table.setFilterUI((s) => ({ ...s, visible: false }))}
      />

      {/* SIDEBAR */}
      {shouldUseSidebar && (
        <TableSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Table Controls">
          <div className="pdp-sidebarSection">
            <div className="pdp-sidebarTitle">Export</div>

            <label className="pdp-radioRow">
              <input
                type="radio"
                name="sidebarExportScope"
                checked={exportScope === "currentPage"}
                onChange={() => setExportScope("currentPage")}
              />
              <span>Current page</span>
            </label>

            <label className="pdp-radioRow">
              <input
                type="radio"
                name="sidebarExportScope"
                checked={exportScope === "allFiltered"}
                onChange={() => setExportScope("allFiltered")}
              />
              <span>All filtered</span>
            </label>

            <div className="pdp-sidebarButtons">
              <button
                type="button"
                className="pdp-tableBtn"
                disabled={loading || getExportRows().length === 0}
                onClick={async () => {
                  await doExportExcel();
                  setSidebarOpen(false);
                }}
              >
                <span className="pdp-btnIcon">{icons?.excel ?? "Excel"}</span>
                
              </button>

              <button
                type="button"
                className="pdp-tableBtn"
                disabled={loading || getExportRows().length === 0}
                onClick={async () => {
                  await doExportPDF();
                  setSidebarOpen(false);
                }}
              >
                <span className="pdp-btnIcon">{icons?.pdf ?? "PDF"}</span>
                
              </button>
            </div>
          </div>

          {enableColumnManager && (
            <div className="pdp-sidebarSection">
              <div className="pdp-sidebarTitle">Columns</div>

              <div className="pdp-columnManagerButtons">
                <button type="button" onClick={table.showAllColumns}>
                  Show All
                </button>
                <button type="button" onClick={table.hideAllColumns}>
                  Hide All
                </button>
              </div>

              <ul className="pdp-columnManagerList">
                {columns.map((col) => (
                  <li key={col.field} className="pdp-checkboxRow">
                    <input
                      type="checkbox"
                      checked={Boolean(table.visibleColumns?.[col.field])}
                      onChange={() => table.toggleColumn(col.field)}
                    />
                    <span>{col.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pdp-sidebarSection">
            <div className="pdp-sidebarTitle">Quick Actions</div>
            <button type="button" className="pdp-tableBtn" onClick={clearAllSearchAndFilters}>
              Clear filters & search
            </button>
          </div>
        </TableSidebar>
      )}
    </div>
  );
}
