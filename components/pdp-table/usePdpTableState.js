//components/pdp-table/usePdpTableState.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { applyFilters, applySearch, compareValues, defaultGetRowKey } from "./utils";

export default function usePdpTableState({
  columns,
  data,
  rowKey = "id",
  pageSizeOptions = [5, 10, 15, 20],
  defaultPageSize,
  defaultSort,
  selectable = false,
  onSelectionChange,
  enableFilters = true,
}) {
  const initialVisible = useMemo(() => {
    const m = {};
    (columns || []).forEach((c) => (m[c.field] = true));
    return m;
  }, [columns]);

  const [visibleColumns, setVisibleColumns] = useState(initialVisible);

  useEffect(() => {
    // if columns change, ensure new columns default to visible
    setVisibleColumns((prev) => {
      const next = { ...prev };
      (columns || []).forEach((c) => {
        if (!(c.field in next)) next[c.field] = true;
      });
      return next;
    });
  }, [columns]);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState(
    defaultSort?.key ? defaultSort : { key: "", direction: "" }
  );

  const [appliedFilters, setAppliedFilters] = useState({});
  const [filterUI, setFilterUI] = useState({
    visible: false,
    column: (columns?.[0]?.field) || "",
    operator: "contains",
    value: "",
  });

  const pageSizeDefault = defaultPageSize ?? pageSizeOptions?.[0] ?? 10;
  const [rowsPerPage, setRowsPerPage] = useState(pageSizeDefault);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedKeys, setSelectedKeys] = useState([]);

  const getRowKey = (row) => defaultGetRowKey(row, rowKey);

  // derived pipeline: search -> filter -> sort -> paginate
  const searched = useMemo(() => {
    return applySearch(data || [], searchQuery, columns || [], visibleColumns);
  }, [data, searchQuery, columns, visibleColumns]);

  const filtered = useMemo(() => {
    if (!enableFilters) return searched;
    return applyFilters(searched, appliedFilters, columns || []);
  }, [searched, appliedFilters, columns, enableFilters]);

  const sorted = useMemo(() => {
    const { key, direction } = sortConfig || {};
    if (!key || !direction) return filtered;

    const col = (columns || []).find((c) => c.field === key);
    const type = col?.type || "string";

    const out = [...filtered];
    out.sort((a, b) => compareValues(a?.[key], b?.[key], direction, type));
    return out;
  }, [filtered, sortConfig, columns]);

  // pagination
  const totalPages = useMemo(() => {
    if (rowsPerPage === "All") return 1;
    const n = Math.ceil(sorted.length / Number(rowsPerPage || 1));
    return n || 1;
  }, [sorted.length, rowsPerPage]);

  useEffect(() => {
    if (rowsPerPage === "All") {
      setCurrentPage(1);
      return;
    }
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (currentPage < 1) setCurrentPage(1);
  }, [rowsPerPage, totalPages, currentPage]);

  const paginated = useMemo(() => {
    if (rowsPerPage === "All") return sorted;
    const size = Number(rowsPerPage);
    const start = (currentPage - 1) * size;
    return sorted.slice(start, start + size);
  }, [sorted, rowsPerPage, currentPage]);

  // selection callback (always sync to current data)
  useEffect(() => {
    if (!selectable || !onSelectionChange) return;
    const keySet = new Set(selectedKeys);
    const selectedRows = (data || []).filter((r) => keySet.has(getRowKey(r)));
    onSelectionChange(selectedRows, selectedKeys);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKeys, data]);

  // helpers
  const toggleColumn = (field) => {
    setVisibleColumns((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const showAllColumns = () => {
    const m = {};
    (columns || []).forEach((c) => (m[c.field] = true));
    setVisibleColumns(m);
  };

  const hideAllColumns = () => {
    const m = {};
    (columns || []).forEach((c) => (m[c.field] = false));
    setVisibleColumns(m);
  };

  const cycleSort = (field) => {
    setSortConfig((prev) => {
      if (prev.key !== field) return { key: field, direction: "asc" };
      if (prev.direction === "asc") return { key: field, direction: "desc" };
      return { key: "", direction: "" }; // clear
    });
    setCurrentPage(1);
  };

  const openFilter = (field) => {
    const col = (columns || []).find(c => c.field === field);
    const type = col?.type || "string";
    // default operator per type
    const operator =
      type === "number" ? "equals" :
      type === "date" ? "after" :
      "contains";

    setFilterUI({ visible: true, column: field, operator, value: operator === "range" ? ["", ""] : "" });
  };

  const applyFilterFromUI = () => {
    const { column, operator, value } = filterUI;
    if (!column) return;

    // remove empty
    const isEmpty =
      value === "" ||
      value === null ||
      value === undefined ||
      (Array.isArray(value) && value.some(v => !v));

    setAppliedFilters((prev) => {
      const next = { ...prev };
      if (isEmpty) {
        delete next[column];
        return next;
      }
      const col = (columns || []).find(c => c.field === column);
      next[column] = { operator, value, type: col?.type || "string" };
      return next;
    });

    setFilterUI((s) => ({ ...s, visible: false }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setAppliedFilters({});
    setCurrentPage(1);
  };

  const setRowsPerPageSafe = (value) => {
    setRowsPerPage(value === "All" ? "All" : Number(value));
    setCurrentPage(1);
  };

  const selectRow = (row) => {
    const k = getRowKey(row);
    setSelectedKeys((prev) =>
      prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]
    );
  };

  const selectPage = (checked) => {
    const pageKeys = paginated.map(getRowKey).filter(Boolean);
    setSelectedKeys((prev) => {
      const set = new Set(prev);
      if (checked) pageKeys.forEach(k => set.add(k));
      else pageKeys.forEach(k => set.delete(k));
      return Array.from(set);
    });
  };

  const clearSelection = () => setSelectedKeys([]);

  return {
    // state
    visibleColumns, searchQuery, sortConfig, appliedFilters,
    rowsPerPage, currentPage, totalPages, selectedKeys, filterUI,

    // data
    searchedRows: searched,
    filteredRows: filtered,
    sortedRows: sorted,
    pageRows: paginated,

    // helpers
    setSearchQuery,
    setCurrentPage,
    setRowsPerPage: setRowsPerPageSafe,
    toggleColumn,
    showAllColumns,
    hideAllColumns,
    cycleSort,
    openFilter,
    setFilterUI,
    applyFilterFromUI,
    clearAllFilters,
    selectRow,
    selectPage,
    clearSelection,

    // row key
    getRowKey,
  };
}
