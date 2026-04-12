//components/pdp-table/TableMobileCards.js
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { normalizeCellValue } from "./utils";
import ThreeDotsIcon from "@/assets/Images/icon/3-dots.svg";

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
  const [openActionMenuKey, setOpenActionMenuKey] = useState(null);
  const listRef = useRef(null);
  const hasVisibleDataColumns = columns.some((col) => visibleColumns?.[col.field]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!openActionMenuKey) {
        return;
      }

      if (listRef.current && !listRef.current.contains(event.target)) {
        setOpenActionMenuKey(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [openActionMenuKey]);

  if (!rows.length) return <div className="pdp-noRecords">No matching records found.</div>;

  return (
    <div className="pdp-cardList" ref={listRef}>
      {rows.map((row, idx) => {
        const key = getRowKey(row) ?? idx;
        const rawStatus = row?.[statusField];
        const isOn = statusTrueValues.includes(rawStatus);
        const rowActions = (actions || []).filter((action) => {
          if (typeof action.condition !== "function") {
            return true;
          }

          return action.condition(row);
        });

        return (
          <div key={key} className="pdp-cardItem">
            <div className="pdp-cardHeader">
              <strong>SN: {pageIndexOffset + idx + 1}</strong>
              <span className={`pdp-cardStatus ${isOn ? "pdp-active" : "pdp-inactive"}`}>
                {isOn ? "Active" : "Inactive"}
              </span>

              {showActions && hasVisibleDataColumns && rowActions.length ? (
                <div className="pdp-cardActions">
                  <div className="pdp-actionMenuWrap">
                    <button
                      type="button"
                      className="pdp-actionKebabBtn"
                      onClick={() =>
                        setOpenActionMenuKey((prev) => (prev === key ? null : key))
                      }
                      aria-label="Row actions"
                      title="Row actions"
                    >
                      <Image src={ThreeDotsIcon} alt="More" width={18} height={18} />
                    </button>

                    {openActionMenuKey === key ? (
                      <div className="pdp-actionMenu" role="menu">
                        {rowActions.map((action) => (
                          <button
                            key={action.key}
                            type="button"
                            className="pdp-actionMenuItem"
                            onClick={() => {
                              action.onClick(row);
                              setOpenActionMenuKey(null);
                            }}
                            role="menuitem"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
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
