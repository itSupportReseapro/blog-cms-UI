'use client';

import React, { useState, useEffect } from 'react';
import useTableState from './useTableState';
import TableDesktop from './TableDesktop';
import TableMobileCards from './TableMobileCards';
import PaginationFooter from './PaginationFooter';
import EmptyState from './EmptyState';
import SkeletonTable from './SkeletonTable';
import './Table.css';

const Table = ({
  data = [],
  columns = [],
  onActionExecute = null,
  actions = [],
  statusColumnKey = 'status',
  rowKey = 'id',
  defaultPageSize = 10,
  rowsPerPageOptions = [10, 25, 50],
  loading = false,
  mobileMode = null,
  breakpoint = 768,
  showFooter = true,
}) => {
  // Mobile responsiveness detection
  const [isMobile, setIsMobile] = useState(
    mobileMode !== null ? mobileMode : typeof window !== 'undefined' && window.innerWidth < breakpoint
  );

  useEffect(() => {
    if (mobileMode !== null) return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMode, breakpoint]);

  // Use custom hook for state management
  const {
    sortedData,
    paginatedData,
    currentPage,
    rowsPerPage,
    totalPages,
    sortConfig,
    handleSort,
    handlePageChange,
    handleRowsPerPageChange,
    startIndex,
    endIndex,
  } = useTableState({
    data,
    defaultPageSize,
    rowKey,
  });

  // Loading state
  if (loading) {
    return (
      <div className="table-wrapper">
        <SkeletonTable columns={columns} />
      </div>
    );
  }

  // Empty state
  if (sortedData.length === 0) {
    return (
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(column => (
                <th key={column.key}>{column.label}</th>
              ))}
              {onActionExecute && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            <EmptyState columns={columns} onActionExecute={onActionExecute} />
          </tbody>
        </table>
      </div>
    );
  }

  // Render table based on device type
  return (
    <div className="table-wrapper">
      {isMobile ? (
        <TableMobileCards
          data={paginatedData}
          columns={columns}
          statusColumnKey={statusColumnKey}
          onActionExecute={onActionExecute}
          actions={actions}
          rowKey={rowKey}
        />
      ) : (
        <TableDesktop
          data={paginatedData}
          columns={columns}
          statusColumnKey={statusColumnKey}
          onActionExecute={onActionExecute}
          actions={actions}
          rowKey={rowKey}
          sortConfig={sortConfig}
          handleSort={handleSort}
        />
      )}

      {showFooter && (
        <PaginationFooter
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={sortedData.length}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}
    </div>
  );
};

export default Table;