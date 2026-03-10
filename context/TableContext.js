'use client';

import React, { createContext, useContext } from 'react';

const TableContext = createContext();

export const TableProvider = ({
  columns = [],
  statusBadges = {},
  actions = [
    {
      key: "edit",
      label: "Edit"
    },
    {
      key: "activate",
      label: "Active User",
      condition: (row) => row.role === "Editor"
    },
    {
      key: "deactivate",
      label: "Deactive User",
      condition: (row) => row.role === "Admin"
    },
    {
      key: "details",
      label: "Details"
    },
    {
      key: "remove",
      label: "Remove"
    }
  ],
  pageSize = 10,
  rowsPerPageOptions = [10, 25, 50],
  children
}) => {

  const value = {
    columns,
    statusBadges,
    actions,
    pageSize,
    rowsPerPageOptions
  };

  return (
    <TableContext.Provider value={value}>
      {children}
    </TableContext.Provider>
  );
};

export const useTable = () => {
  const context = useContext(TableContext);

  if (!context) {
    throw new Error('useTable must be used within TableProvider');
  }

  return context;
};