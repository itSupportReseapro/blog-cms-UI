'use client';

import React, { useState, useMemo } from 'react';
import { useTable } from '@/context/TableContext';
import StatusBadge from './StatusBadge';
import ActionMenu from './ActionMenu';
import './Table.css';

const Table = ({
  data = [],
  onActionExecute = null,
  statusColumnKey = 'status',
  columns: columnsOverride = null
}) => {

  const contextConfig = useTable();
  const contextColumns = columnsOverride || contextConfig.columns;
  const { pageSize, rowsPerPageOptions } = contextConfig;

  const columns = contextColumns;

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
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

  const startIndex =
    sortedData.length === 0
      ? 0
      : (currentPage - 1) * rowsPerPage + 1;

  const endIndex = Math.min(
    currentPage * rowsPerPage,
    sortedData.length
  );

  const handleSort = (key) => {

    setSortConfig(prev => ({
      key,
      direction:
        prev.key === key && prev.direction === 'asc'
          ? 'desc'
          : 'asc'
    }));

    setCurrentPage(1);

  };

  const handleRowsPerPageChange = (e) => {

    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);

  };

  /* ================= RENDER ================= */

  return (

    <div className="table-wrapper">

      <table className="data-table">

        <thead>

          <tr>

            {columns.map(column => (

              <th
                key={column.key}
                onClick={
                  column.sortable
                    ? () => handleSort(column.key)
                    : undefined
                }
                className={
                  column.sortable
                    ? 'sortable-header'
                    : ''
                }
              >
                {column.label}
              </th>

            ))}

            {onActionExecute && <th>Action</th>}

          </tr>

        </thead>

        <tbody>

          {paginatedData.length > 0 ? (

            paginatedData.map((row, index) => (

              <tr key={row.id || index}>

                {columns.map(column => (

                  <td key={`${row.id}-${column.key}`}>

                    {/* Custom Render Support */}

                    {column.render ? (

                      column.render(row)

                    ) : column.key === statusColumnKey ? (

                      <StatusBadge status={row[column.key]} />

                    ) : (

                      row[column.key] ?? "-"

                    )}

                  </td>

                ))}

                {onActionExecute && (

                  <td>

                    <ActionMenu
                      row={row}
                      onActionExecute={onActionExecute}
                    />

                  </td>

                )}

              </tr>

            ))

          ) : (

            <tr>

              <td
                colSpan={
                  columns.length +
                  (onActionExecute ? 1 : 0)
                }
                className="empty-state"
              >

                No data available

              </td>

            </tr>

          )}

        </tbody>

      </table>

      {/* ================= PAGINATION ================= */}

      {paginatedData.length > 0 && (

        <div className="table-footer">

          <div className="footer-left">

            Showing {startIndex} to {endIndex} of {sortedData.length} items

          </div>

          <div className="footer-center">

            <button
              className="footer-nav-btn"
              onClick={() =>
                setCurrentPage(
                  Math.max(1, currentPage - 1)
                )
              }
              disabled={currentPage === 1}
            >
              &lt; Prev
            </button>

            <span className="footer-page-number">

              {currentPage}

            </span>

            <button
              className="footer-nav-btn"
              onClick={() =>
                setCurrentPage(
                  Math.min(totalPages, currentPage + 1)
                )
              }
              disabled={currentPage === totalPages}
            >
              Next &gt;
            </button>

          </div>

          <div className="footer-right">

            <span>Items per Page</span>

            <select
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

        </div>

      )}

    </div>

  );

};

export default Table;