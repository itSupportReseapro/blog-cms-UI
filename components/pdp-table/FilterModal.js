//components/pdp-table/FilterModal.js
"use client";

export default function FilterModal({
  columns,
  filterUI,
  setFilterUI,
  onApply,
  onClearAll,
  onClose,
}) {
  if (!filterUI?.visible) return null;

  const col = columns.find(c => c.field === filterUI.column) || columns[0];
  const type = col?.type || "string";

  const operatorOptions = (() => {
    if (type === "number") return ["greater than", "less than", "equals"];
    if (type === "date") return ["before", "after", "range"];
    return ["contains", "equals", "starts with", "ends with"];
  })();

  const setValue = (v) => setFilterUI((s) => ({ ...s, value: v }));

  return (
    <div className="pdp-modalBackdrop">
      <div className="pdp-modal">
        <h3>Filter Options</h3>

        <div className="pdp-filterGrid">
          <label>
            Column
            <select
              value={filterUI.column}
              onChange={(e) => {
                const field = e.target.value;
                const nextCol = columns.find(c => c.field === field);
                const nextType = nextCol?.type || "string";
                const op =
                  nextType === "number" ? "equals" :
                  nextType === "date" ? "after" :
                  "contains";

                setFilterUI({ visible: true, column: field, operator: op, value: op === "range" ? ["", ""] : "" });
              }}
            >
              {columns.map(c => (
                <option key={c.field} value={c.field}>{c.label}</option>
              ))}
            </select>
          </label>

          <label>
            Operator
            <select
              value={filterUI.operator}
              onChange={(e) => {
                const op = e.target.value;
                setFilterUI((s) => ({
                  ...s,
                  operator: op,
                  value: op === "range" ? ["", ""] : "",
                }));
              }}
            >
              {operatorOptions.map(op => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </label>

          <label>
            Value
            {type === "date" && filterUI.operator === "range" ? (
              <div className="pdp-dateRange">
                <input
                  type="date"
                  value={filterUI.value?.[0] || ""}
                  onChange={(e) => setValue([e.target.value, filterUI.value?.[1] || ""])}
                />
                <span>to</span>
                <input
                  type="date"
                  value={filterUI.value?.[1] || ""}
                  onChange={(e) => setValue([filterUI.value?.[0] || "", e.target.value])}
                />
              </div>
            ) : type === "date" ? (
              <input type="date" value={filterUI.value || ""} onChange={(e) => setValue(e.target.value)} />
            ) : type === "number" ? (
              <input type="number" value={filterUI.value || ""} onChange={(e) => setValue(e.target.value)} />
            ) : (
              <input type="text" value={filterUI.value || ""} onChange={(e) => setValue(e.target.value)} />
            )}
          </label>
        </div>

        <div className="pdp-modalButtons">
          <button type="button" onClick={onClearAll}>Clear All Filters</button>
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="button" onClick={onApply}>Apply</button>
        </div>
      </div>
    </div>
  );
}
