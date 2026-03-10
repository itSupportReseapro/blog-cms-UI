//components/pdp-table/TableMobileCards.js
"use client";

import { normalizeCellValue } from "./utils";

export default function TableMobileCards({
  columns,
  rows,
  visibleColumns,
  getRowKey,
  pageIndexOffset,
  showActions,
  actions,
  statusField,
  statusTrueValues,
}) {
  if (!rows.length) return <div className="pdp-noRecords">No matching records found.</div>;

  return (
    <div className="pdp-cardList">
      {rows.map((row, idx) => {
        const key = getRowKey(row) ?? idx;
        const rawStatus = row?.[statusField];
        const isOn = statusTrueValues.includes(rawStatus);

        return (
          <div key={key} className="pdp-cardItem">
            <div className="pdp-cardHeader">
              <strong>SN: {pageIndexOffset + idx + 1}</strong>
              <span className={`pdp-cardStatus ${isOn ? "pdp-active" : "pdp-inactive"}`}>
                {isOn ? "Active" : "Inactive"}
              </span>

              {showActions && actions?.length ? (
                <div className="pdp-cardActions">
                  {actions.map(a => (
                    <button key={a.key} type="button" onClick={() => a.onClick(row)} title={a.label}>
                      {a.icon ? a.icon : a.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="pdp-cardBody">
              {columns.map((col) => {
                if (!visibleColumns?.[col.field]) return null;

                const raw = row?.[col.field];
                const content = col.render
                  ? col.render(raw, row)
                  : normalizeCellValue(col, raw, { statusField, statusTrueValues });

                return (
                  <div key={col.field} className="pdp-cardRow">
                    <span className="pdp-cardLabel">{col.label}</span>
                    <span className="pdp-cardValue">{content}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
