//components/pdp-table/ColumnManagerDropdown.js
"use client";

export default function ColumnManagerDropdown({
  columns,
  visibleColumns,
  onToggle,
  onShowAll,
  onHideAll,
}) {
  return (
    <div className="pdp-columnManager">
      <div className="pdp-columnManagerButtons">
        <button type="button" onClick={onShowAll}>Show All</button>
        <button type="button" onClick={onHideAll}>Hide All</button>
      </div>

      <ul className="pdp-columnManagerList">
        {columns.map((col) => (
          <li key={col.field}>
            <label className="pdp-checkboxRow">
              <input
                type="checkbox"
                checked={Boolean(visibleColumns?.[col.field])}
                onChange={() => onToggle(col.field)}
              />
              <span>{col.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
