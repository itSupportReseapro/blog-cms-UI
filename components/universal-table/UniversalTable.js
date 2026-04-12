"use client";

import { useMemo } from "react";
import { PdpTable } from "@/components/pdp-table";
import "./universal-table.css";

function normalizeColumn(column, index) {
  const field = column.field || column.key || column.id || `column_${index}`;
  const label = column.headerName || column.label || field;

  const render = column.render
    ? column.render
    : column.renderCell
      ? (value, row) => column.renderCell({ value, row, field, column })
      : null;

  return {
    ...column,
    field,
    label,
    render,
  };
}

function enrichRows(rows, columns) {
  return (rows || []).map((row) => {
    const nextRow = { ...row };

    columns.forEach((column) => {
      if (typeof column.valueGetter === "function") {
        nextRow[column.field] = column.valueGetter(row?.[column.field], row);
      }
    });

    return nextRow;
  });
}

export default function UniversalTable({
  variant,
  columns = [],
  rows = [],
  data,
  selectable,
  checkboxSelection,
  ...rest
}) {
  const normalizedColumns = useMemo(
    () => columns.map((column, index) => normalizeColumn(column, index)),
    [columns]
  );

  const normalizedRows = useMemo(
    () => enrichRows(data || rows, normalizedColumns),
    [data, rows, normalizedColumns]
  );

  return (
    <PdpTable
      columns={normalizedColumns}
      data={normalizedRows}
      selectable={Boolean(selectable ?? checkboxSelection ?? variant === "sortable")}
      {...rest}
    />
  );
}