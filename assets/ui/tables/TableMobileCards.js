'use client';

import StatusBadge from './StatusBadge';
import ActionMenu from './ActionMenu';

const TableMobileCards = ({
  columns,
  data = [],
  onActionExecute,
  actions = [],
  statusColumnKey = 'status',
  rowKey = 'id'
}) => {
  const getRowKey = (row) => row[rowKey];

  if (!data.length) {
    return (
      <div className="mobile-empty-state">
        No data available
      </div>
    );
  }

  return (
    <div className="cards-list">
      {data.map((row, idx) => (
        <div key={getRowKey(row) || idx} className="card-item">
          <div className="card-header">
            <span className="card-header-sn">SN: {idx + 1}</span>
            {onActionExecute && (
              <ActionMenu
                row={row}
                onActionExecute={onActionExecute}
                actions={actions}
              />
            )}
          </div>

          <div className="card-body">
            {columns.map((col) => (
              <div key={col.key} className="card-row">
                <span className="card-label">{col.label}</span>
                <span className="card-value">
                  {col.render ? (
                    col.render(row)
                  ) : col.key === statusColumnKey ? (
                    <StatusBadge status={row[col.key]} />
                  ) : (
                    row[col.key] ?? '-'
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableMobileCards;
