// math/equationAst.js

export function createIdentifierNode(value = "x") {
  return { type: "identifier", value };
}

export function createNumberNode(value = "0") {
  return { type: "number", value: String(value) };
}

export function createOperatorNode(value = "+") {
  return { type: "operator", value };
}

export function createRowNode(children = []) {
  return { type: "row", children };
}

export function createSlotNode(id, label = "") {
  return {
    type: "slot",
    id: id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `slot_${Math.random().toString(36).slice(2, 9)}`),
    label,
  };
}

export function createFractionNode(numerator, denominator) {
  return {
    type: "fraction",
    numerator: numerator || createRowNode([createSlotNode(null, "num")]),
    denominator: denominator || createRowNode([createSlotNode(null, "den")]),
  };
}

export function createSuperscriptNode(base, exponent) {
  return {
    type: "superscript",
    base: base || createRowNode([createSlotNode(null, "base")]),
    exponent: exponent || createRowNode([createSlotNode(null, "exp")]),
  };
}

export function createSubscriptNode(base, subscript) {
  return {
    type: "subscript",
    base: base || createRowNode([createSlotNode(null, "base")]),
    subscript: subscript || createRowNode([createSlotNode(null, "sub")]),
  };
}

export function createSubSuperscriptNode(base, subscript, exponent) {
  return {
    type: "subsup",
    base: base || createRowNode([createSlotNode(null, "base")]),
    subscript: subscript || createRowNode([createSlotNode(null, "sub")]),
    exponent: exponent || createRowNode([createSlotNode(null, "exp")]),
  };
}

export function createSqrtNode(value) {
  return {
    type: "sqrt",
    value: value || createRowNode([createSlotNode(null, "radicand")]),
  };
}

export function createIntegralNode(lower, upper, body) {
  return {
    type: "integral",
    lower: lower || createRowNode([createSlotNode(null, "from")]),
    upper: upper || createRowNode([createSlotNode(null, "to")]),
    body: body || createRowNode([createSlotNode(null, "expr")]),
  };
}

export function createSummationNode(lower, upper, body) {
  return {
    type: "summation",
    lower: lower || createRowNode([createSlotNode(null, "from")]),
    upper: upper || createRowNode([createSlotNode(null, "to")]),
    body: body || createRowNode([createSlotNode(null, "expr")]),
  };
}

export function createMatrixNode(rows = 2, cols = 2) {
  const grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push(createRowNode([createSlotNode(null, `${r + 1},${c + 1}`)]));
    }
    grid.push(row);
  }
  return {
    type: "matrix",
    rows: grid,
  };
}

export function createBracketNode(open = "(", close = ")", body) {
  return {
    type: "bracket",
    open,
    close,
    body: body || createRowNode([createSlotNode(null, "expr")]),
  };
}

/** Helper to extract plain source text from AST for search / indexing */
export function astToPlainText(node) {
  if (!node) return "";
  switch (node.type) {
    case "identifier":
    case "number":
    case "operator":
      return node.value || "";
    case "slot":
      return "?";
    case "row":
      return (node.children || []).map(astToPlainText).join(" ");
    case "fraction":
      return `(${astToPlainText(node.numerator)})/(${astToPlainText(node.denominator)})`;
    case "superscript":
      return `${astToPlainText(node.base)}^(${astToPlainText(node.exponent)})`;
    case "subscript":
      return `${astToPlainText(node.base)}_(${astToPlainText(node.subscript)})`;
    case "subsup":
      return `${astToPlainText(node.base)}_(${astToPlainText(node.subscript)})^(${astToPlainText(node.exponent)})`;
    case "sqrt":
      return `√(${astToPlainText(node.value)})`;
    case "integral":
      return `∫_(${astToPlainText(node.lower)})^(${astToPlainText(node.upper)}) ${astToPlainText(node.body)}`;
    case "summation":
      return `∑_(${astToPlainText(node.lower)})^(${astToPlainText(node.upper)}) ${astToPlainText(node.body)}`;
    case "matrix":
      return `[${(node.rows || []).map((row) => row.map(astToPlainText).join(", ")).join("; ")}]`;
    case "bracket":
      return `${node.open || "("}${astToPlainText(node.body)}${node.close || ")"}`;
    default:
      return "";
  }
}
