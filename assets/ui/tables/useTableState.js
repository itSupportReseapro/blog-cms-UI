'use client';

import { useState, useMemo } from 'react';

export default function useTableState({
  data = [],
  rowKey = 'id',
  defaultPageSize = 10,
  rowsPerPageOptions = [5, 10, 15, 20]
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  /* ================= SORT ================= */
  const sortedData = useMemo(() => {
    let sorted = [...data];

    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        if (typeof aValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      });
    }

    return sorted;
  }, [data, sortConfig]);

  /* ================= PAGINATION ================= */
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = sortedData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(currentPage * rowsPerPage, sortedData.length);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (newSize) => {
    setRowsPerPage(Number(newSize));
    setCurrentPage(1);
  };

  const getRowKey = (row) => row[rowKey];

  const handlePageChange = (newPage) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  return {
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,
    sortConfig,
    setSortConfig,
    handleSort,
    handleRowsPerPageChange,
    handlePageChange,
    sortedData,
    paginatedData,
    totalPages,
    startIndex,
    endIndex,
    getRowKey,
    rowsPerPageOptions
  };
}
