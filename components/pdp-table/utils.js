//components/pdp-table/utils.js
export function defaultGetRowKey(row, rowKey) {
  if (typeof rowKey === "function") return rowKey(row);
  return row?.[rowKey ?? "id"];
}

export function formatDateDDMMYYYY(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return String(dateString);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}-${mm}-${yy}`;
}

export function normalizeCellValue(col, raw, opts) {
  const { statusField, statusTrueValues } = opts || {};
  if (!col) return raw;

  // status field normalization (your old isActive mapping)
  if (col.field === statusField || col.type === "status") {
    const isOn = statusTrueValues?.includes(raw);
    return isOn ? "Active" : "Inactive";
  }

  if (col.type === "date") return formatDateDDMMYYYY(raw);

  return raw ?? "";
}

export function compareValues(a, b, direction = "asc", type = "string") {
  // nulls last
  const aNil = a === null || a === undefined || a === "";
  const bNil = b === null || b === undefined || b === "";
  if (aNil && bNil) return 0;
  if (aNil) return 1;
  if (bNil) return -1;

  let av = a;
  let bv = b;

  if (type === "number") {
    av = Number(av);
    bv = Number(bv);
    if (Number.isNaN(av) && Number.isNaN(bv)) return 0;
    if (Number.isNaN(av)) return 1;
    if (Number.isNaN(bv)) return -1;
  } else if (type === "date") {
    av = new Date(av).getTime();
    bv = new Date(bv).getTime();
    if (Number.isNaN(av) && Number.isNaN(bv)) return 0;
    if (Number.isNaN(av)) return 1;
    if (Number.isNaN(bv)) return -1;
  } else {
    av = String(av).toLowerCase();
    bv = String(bv).toLowerCase();
  }

  if (av < bv) return direction === "asc" ? -1 : 1;
  if (av > bv) return direction === "asc" ? 1 : -1;
  return 0;
}

export function applyFilters(rows, filters, columns) {
  const byField = Object.entries(filters || {});
  if (!byField.length) return rows;

  const colMap = new Map(columns.map(c => [c.field, c]));

  return rows.filter((row) => {
    for (const [field, f] of byField) {
      const col = colMap.get(field);
      if (!col || !f) continue;

      const raw = row?.[field];
      if (raw === null || raw === undefined) return false;

      const type = f.type || col.type || "string";
      const op = f.operator;
      const val = f.value;

      if (type === "string" || type === "status") {
        const a = String(raw).toLowerCase();
        const b = String(val ?? "").toLowerCase();
        if (op === "contains" && !a.includes(b)) return false;
        if (op === "equals" && a !== b) return false;
        if (op === "starts with" && !a.startsWith(b)) return false;
        if (op === "ends with" && !a.endsWith(b)) return false;
      }

      if (type === "number") {
        const an = Number(raw);
        const bn = Number(val);
        if (Number.isNaN(an) || Number.isNaN(bn)) return false;
        if (op === "greater than" && !(an > bn)) return false;
        if (op === "less than" && !(an < bn)) return false;
        if (op === "equals" && !(an === bn)) return false;
      }

      if (type === "date") {
        const at = new Date(raw).getTime();
        if (Number.isNaN(at)) return false;

        if (op === "before") {
          const bt = new Date(val).getTime();
          if (!(at < bt)) return false;
        } else if (op === "after") {
          const bt = new Date(val).getTime();
          if (!(at > bt)) return false;
        } else if (op === "range") {
          const [start, end] = Array.isArray(val) ? val : ["", ""];
          const st = new Date(start).getTime();
          const et = new Date(end).getTime();
          if (Number.isNaN(st) || Number.isNaN(et)) return false;
          if (!(at >= st && at <= et)) return false;
        }
      }
    }
    return true;
  });
}

export function applySearch(rows, query, columns, visibleColumns) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return rows;

  return rows.filter((row) =>
    columns.some((col) => {
      if (!visibleColumns?.[col.field]) return false;
      const v = row?.[col.field];
      if (v === null || v === undefined) return false;
      return String(v).toLowerCase().includes(q);
    })
  );
}
