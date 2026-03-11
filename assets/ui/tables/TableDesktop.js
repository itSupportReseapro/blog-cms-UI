'use client';

import StatusBadge from './StatusBadge';
import ActionMenu from './ActionMenu';
import EmptyState from './EmptyState';

const TableDesktop = ({
  columns,
  data = [],
  loading = false,
  onActionExecute,
  actions = [],
  statusColumnKey = 'status',
  sortConfig,
  handleSort,
  rowKey = 'id'
}) => {
  const getRowKey = (row) => row[rowKey];

  if (loading) {
    return (
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
          {/* Skeleton rows */}
          {[...Array(8)].map((_, idx) => (
            <tr key={`skeleton-${idx}`}>
              {columns.map(col => (
                <td key={`${idx}-${col.key}`}>
                  <div className="skeleton skeleton-text" />
                </td>
              ))}
              {onActionExecute && (
                <td>
                  <div className="skeleton skeleton-text" />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map(column => (
            <th
              key={column.key}
              onClick={column.sortable ? () => handleSort(column.key) : undefined}
              className={column.sortable ? 'sortable-header' : ''}
              style={{ cursor: column.sortable ? 'pointer' : 'default' }}
            >
              {column.label}
            </th>
          ))}
          {onActionExecute && <th>Action</th>}
        </tr>
      </thead>

      <tbody>
        {data.length > 0 ? (
          data.map((row, index) => (
            <tr key={getRowKey(row) || index}>
              {columns.map(column => (
                <td key={`${getRowKey(row)}-${column.key}`}>
                  {column.render ? (
                    column.render(row)
                  ) : column.key === statusColumnKey ? (
                    <StatusBadge status={row[column.key]} />
                  ) : (
                    row[column.key] ?? '-'
                  )}
                </td>
              ))}
              {onActionExecute && (
                <td>
                  <ActionMenu
                    row={row}
                    onActionExecute={onActionExecute}
                    actions={actions}
                  />
                </td>
              )}
            </tr>
          ))
        ) : (
          <EmptyState columns={columns} onActionExecute={onActionExecute} />
        )}
      </tbody>
    </table>
  );
};

export default TableDesktop;
