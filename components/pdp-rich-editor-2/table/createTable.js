export function createId(prefix = "id") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`;
}

export function createTableCell({ header = false, content = "", colSpan = 1, rowSpan = 1, attrs = {} } = {}) {
  const contentArray = Array.isArray(content)
    ? content
    : [{ text: typeof content === "string" ? content : "" }];

  return {
    id: createId("cell"),
    type: header ? "tableHeader" : "tableCell",
    attrs: {
      rowSpan: Math.max(1, parseInt(rowSpan || 1, 10)),
      colSpan: Math.max(1, parseInt(colSpan || 1, 10)),
      width: attrs.width || null,
      minWidth: attrs.minWidth || 84,
      minHeight: attrs.minHeight || null,
      textAlign: attrs.textAlign || "left",
      verticalAlign: attrs.verticalAlign || "top",
      backgroundColor: attrs.backgroundColor || null,
      borderColor: attrs.borderColor || "#000000",
      borderWidth: attrs.borderWidth != null ? attrs.borderWidth : 1,
      borderStyle: attrs.borderStyle || "solid",
      paddingTop: attrs.paddingTop != null ? attrs.paddingTop : 8,
      paddingRight: attrs.paddingRight != null ? attrs.paddingRight : 12,
      paddingBottom: attrs.paddingBottom != null ? attrs.paddingBottom : 8,
      paddingLeft: attrs.paddingLeft != null ? attrs.paddingLeft : 12,
      ...attrs,
    },
    content: contentArray,
  };
}

export function createTableRow(columnCount, header = false) {
  return {
    id: createId("row"),
    type: "tableRow",
    attrs: {
      minHeight: null,
    },
    cells: Array.from({ length: columnCount }, () => createTableCell({ header })),
  };
}

export function createTable({ rows = 2, columns = 2, headerRow = false } = {}) {
  const numRows = typeof rows === "number" && Number.isFinite(rows) ? Math.max(1, rows) : 2;
  const numCols = typeof columns === "number" && Number.isFinite(columns) ? Math.max(1, columns) : 2;
  return {
    id: createId("table"),
    type: "table",
    attrs: {
      width: "100%",
      alignment: "left",
      layout: "fixed",
      theme: "plain",
      caption: "",
      headerRows: headerRow ? 1 : 0,
      headerColumns: 0,
      borderCollapse: true,
    },
    rows: Array.from({ length: numRows }, (_, rowIndex) =>
      createTableRow(numCols, headerRow && rowIndex === 0)
    ),
  };
}
