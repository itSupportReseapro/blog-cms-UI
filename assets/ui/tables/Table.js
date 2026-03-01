'use client';

import React, { useState, useMemo } from 'react';
import { useTable } from '@/context/TableContext';
import StatusBadge from './StatusBadge';
import ActionMenu from './ActionMenu';
import './Table.css';

const Table = ({ 
  data = [], 
  totalItems = 0,
  onActionExecute = null,
  statusColumnKey = 'status',
  columns: columnsOverride = null
}) => {
  const contextConfig = useTable();
  const contextColumns = columnsOverride || contextConfig.columns;
  const { pageSize, rowsPerPageOptions } = contextConfig;
  
  // Use passed columns or context columns
  const columns = contextColumns;
  
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Sort data
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

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  // Calculate pagination info
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(currentPage * rowsPerPage, sortedData.length);

  const handleSort = (columnKey) => {
    setSortConfig(prev => ({
      key: columnKey,
      direction: prev.key === columnKey && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  const renderHeaderCell = (column) => {
    if (!column.sortable) {
      return <th key={column.key}>{column.label}</th>;
    }

    const isSorted = sortConfig.key === column.key;
    const SortIcon = isSorted
      ? sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
      : ' ⇅';

    return (
      <th
        key={column.key}
        onClick={() => handleSort(column.key)}
        style={{ cursor: 'pointer', userSelect: 'none' }}
        className="sortable-header"
      >
        {column.label}
        <span className="sort-icon">{SortIcon}</span>
      </th>
    );
  };

  const renderCellValue = (row, column) => {
    const value = row[column.key];

    // Special handling for status column
    if (column.key === statusColumnKey) {
      return <StatusBadge status={value} />;
    }

    // Format dates
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      const date = new Date(value);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    return value ?? '-';
  };

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(column => renderHeaderCell(column))}
            {onActionExecute && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length > 0 ? (
            paginatedData.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className="table-body-row">
                {columns.map(column => (
                  <td key={`${row.id}-${column.key}`}>
                    {renderCellValue(row, column)}
                  </td>
                ))}
                {onActionExecute && (
                  <td className="action-cell">
                    <ActionMenu row={row} onActionExecute={onActionExecute} />
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (onActionExecute ? 1 : 0)} className="empty-state">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {paginatedData.length > 0 && (
        <div className="table-footer">
          <div className="pagination-info">
            Showing {startIndex} to {endIndex} of {sortedData.length} items
          </div>

          <div className="pagination-controls">
            <div className="rows-per-page">
              <label htmlFor="rows-select">Rows per page:</label>
              <select
                id="rows-select"
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
              >
                {rowsPerPageOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="page-navigation">
              <button
                className="nav-button"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                ← Prev
              </button>

              <span className="page-indicator">
                Page {currentPage} of {totalPages}
              </span>

              <button
                className="nav-button"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
