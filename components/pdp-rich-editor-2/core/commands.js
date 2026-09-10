// components/pdp-rich-editor/commands.js

import {
  cloneDoc,
  normalizeDoc,
  ensureSelection,
  splitDocAtTextOffset,
  docToPlainText,
  docToIndexedText,
  blockToIndexText,
  normalizeMarks,
  mergeAdjacentRuns,
  isInlineEquation,
  inlineNodeIndexLength,
} from "./core";
import { createTable } from "../table/createTable";

/** ---------- helpers ---------- */

function hasInlineContent(block) {
  return Array.isArray(block?.content);
}

function hasTableRows(block) {
  return block?.type === "table" && Array.isArray(block?.rows);
}

function getRunsLength(runs) {
  return Array.isArray(runs)
    ? runs.reduce(
        (total, node) =>
          total + inlineNodeIndexLength(node),
        0
      )
    : 0;
}

function getInlineLength(block) {
  if (!hasInlineContent(block)) return 0;
  return getRunsLength(block.content);
}

function flattenRunsFromArray(runs) {
  if (!Array.isArray(runs)) return [];

  let pos = 0;
  const spans = [];
  for (let ri = 0; ri < runs.length; ri++) {
    const len = inlineNodeIndexLength(runs[ri]);
    spans.push({ runIndex: ri, start: pos, end: pos + len });
    pos += len;
  }
  return spans;
}

function flattenRuns(block) {
  return hasInlineContent(block) ? flattenRunsFromArray(block.content) : [];
}

function cloneRuns(runs) {
  return Array.isArray(runs) ? runs.map((r) => ({ ...r })) : [{ text: "" }];
}

function walkTableCells(block, visitor) {
  if (!hasTableRows(block)) return;

  const rows = block.rows || [];
  let pos = 0;

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const cells = Array.isArray(rows[rowIndex]?.cells) ? rows[rowIndex].cells : [];
    for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
      const cell = cells[cellIndex] || { content: [{ text: "" }] };
      const length = getRunsLength(cell.content);
      const start = pos;
      const end = start + length;
      visitor({ rowIndex, cellIndex, cell, start, end, length });
      pos = end;
      if (cellIndex !== cells.length - 1) pos += 1; // table cell separator
    }
    if (rowIndex !== rows.length - 1) pos += 1; // table row separator
  }
}

/**
 * Mark behavior:
 * - color/background/fontSize: replace existing value
 * - a: replace existing link
 * - b/i/u/sup/sub/s: toggle that mark
 */
function setMark(run, mark, on) {
  const next = { ...run };
  const marks = Array.isArray(next.marks) ? [...next.marks] : [];

  let base;
  if (mark.type === "color") base = marks.filter((m) => m.type !== "color");
  else if (mark.type === "background") base = marks.filter((m) => m.type !== "background");
  else if (mark.type === "fontSize") base = marks.filter((m) => m.type !== "fontSize");
  else if (mark.type === "a") base = marks.filter((m) => m.type !== "a");
  else base = marks.filter((m) => m.type !== mark.type);

  if (on) base.push(mark);

  next.marks = normalizeMarks(base);
  return next;
}

function applyMarkRangeToRuns(runs, fromInner, toInner, mark, forceOn) {
  const sourceRuns = cloneRuns(runs);
  const spans = flattenRunsFromArray(sourceRuns);
  const nextRuns = [];

  for (const sp of spans) {
    const run = sourceRuns[sp.runIndex];
    const a = sp.start;
    const c = sp.end;

    if (toInner <= a || fromInner >= c) {
      nextRuns.push(run);
      continue;
    }

    const leftCut = Math.max(fromInner, a) - a;
    const rightCut = c - Math.min(toInner, c);

    const text = String(run.text || "");
    const leftText = text.slice(0, leftCut);
    const midText = text.slice(leftCut, text.length - rightCut);
    const rightText = text.slice(text.length - rightCut);

    const baseMarks = run.marks;

    if (leftText) nextRuns.push({ text: leftText, marks: baseMarks });
    nextRuns.push(setMark({ text: midText, marks: baseMarks }, mark, forceOn));
    if (rightText) nextRuns.push({ text: rightText, marks: baseMarks });
  }

  const merged = mergeAdjacentRuns(nextRuns);
  return merged.length ? merged : [{ text: "" }];
}

function applyMarkRangeToBlock(block, fromInner, toInner, mark, forceOn) {
  if (hasInlineContent(block)) {
    return {
      ...block,
      content: applyMarkRangeToRuns(block.content, fromInner, toInner, mark, forceOn),
    };
  }

  if (!hasTableRows(block)) return block;

  const nextBlock = {
    ...block,
    rows: (block.rows || []).map((row) => ({
      ...row,
      cells: (row.cells || []).map((cell) => ({
        ...cell,
        content: cloneRuns(cell.content),
      })),
    })),
  };

  walkTableCells(nextBlock, ({ rowIndex, cellIndex, cell, start, end }) => {
    const overlapA = Math.max(fromInner, start);
    const overlapB = Math.min(toInner, end);
    if (overlapB <= overlapA) return;

    const relFrom = overlapA - start;
    const relTo = overlapB - start;
    nextBlock.rows[rowIndex].cells[cellIndex] = {
      ...cell,
      content: applyMarkRangeToRuns(cell.content, relFrom, relTo, mark, forceOn),
    };
  });

  return nextBlock;
}

function runHasMark(run, type) {
  const marks = run.marks || [];
  return marks.some((m) => m.type === type);
}

function rangeHasAllMarkInRuns(runs, fromInner, toInner, type) {
  if (toInner <= fromInner) return false;
  const spans = flattenRunsFromArray(runs);
  let foundOverlap = false;

  for (const sp of spans) {
    const run = runs[sp.runIndex];
    const a = sp.start;
    const c = sp.end;
    const overlapA = Math.max(fromInner, a);
    const overlapC = Math.min(toInner, c);
    if (overlapC <= overlapA) continue;
    foundOverlap = true;
    if (!runHasMark(run, type)) return false;
  }

  return foundOverlap;
}

function rangeHasAllMark(block, fromInner, toInner, type) {
  if (hasInlineContent(block)) {
    return rangeHasAllMarkInRuns(block.content || [], fromInner, toInner, type);
  }

  if (!hasTableRows(block) || toInner <= fromInner) return false;

  let foundOverlap = false;
  let allMarked = true;

  walkTableCells(block, ({ cell, start, end }) => {
    if (!allMarked) return;
    const overlapA = Math.max(fromInner, start);
    const overlapB = Math.min(toInner, end);
    if (overlapB <= overlapA) return;
    foundOverlap = true;
    const relFrom = overlapA - start;
    const relTo = overlapB - start;
    if (!rangeHasAllMarkInRuns(cell.content || [], relFrom, relTo, type)) {
      allMarked = false;
    }
  });

  return foundOverlap && allMarked;
}

function forEachSelectedBlock(doc, selection, visitor) {
  const start = splitDocAtTextOffset(doc, selection.from, false);
  const end = splitDocAtTextOffset(doc, selection.to, true);

  for (let bi = start.blockIndex; bi <= end.blockIndex; bi++) {
    const block = doc.content[bi];
    if (!block) continue;

    const blockText = block.type === "table" ? docToPlainText({ type: "doc", content: [block] }) : "";
    const blockLen = hasInlineContent(block) ? getInlineLength(block) : blockText.length;
    const fromInner = bi === start.blockIndex ? start.innerOffset : 0;
    const toInner = bi === end.blockIndex ? end.innerOffset : blockLen;

    visitor(block, bi, fromInner, toInner, blockLen);
  }
}

function mapSelectedBlocks(doc, selection, mapper) {
  forEachSelectedBlock(doc, selection, (block, bi, fromInner, toInner, blockLen) => {
    doc.content[bi] = mapper(block, bi, fromInner, toInner, blockLen);
  });
}

function rewriteRunsInRange(runs, fromInner, toInner, rewriteRun) {
  const sourceRuns = cloneRuns(runs);
  const spans = flattenRunsFromArray(sourceRuns);
  const nextRuns = [];

  for (const sp of spans) {
    const run = sourceRuns[sp.runIndex];
    const a = sp.start;
    const c = sp.end;

    if (toInner <= a || fromInner >= c) {
      nextRuns.push(run);
      continue;
    }

    const leftCut = Math.max(fromInner, a) - a;
    const rightCut = c - Math.min(toInner, c);

    const text = String(run.text || "");
    const leftText = text.slice(0, leftCut);
    const midText = text.slice(leftCut, text.length - rightCut);
    const rightText = text.slice(text.length - rightCut);

    if (leftText) nextRuns.push({ text: leftText, marks: run.marks });
    nextRuns.push(rewriteRun({ text: midText, marks: run.marks || [] }, run));
    if (rightText) nextRuns.push({ text: rightText, marks: run.marks });
  }

  const merged = mergeAdjacentRuns(nextRuns);
  return merged.length ? merged : [{ text: "" }];
}

function rewriteBlockRunsInRange(block, fromInner, toInner, rewriteRun) {
  if (hasInlineContent(block)) {
    return {
      ...block,
      content: rewriteRunsInRange(block.content, fromInner, toInner, rewriteRun),
    };
  }

  if (!hasTableRows(block)) return block;

  const nextBlock = {
    ...block,
    rows: (block.rows || []).map((row) => ({
      ...row,
      cells: (row.cells || []).map((cell) => ({
        ...cell,
        content: cloneRuns(cell.content),
      })),
    })),
  };

  walkTableCells(nextBlock, ({ rowIndex, cellIndex, cell, start, end }) => {
    const overlapA = Math.max(fromInner, start);
    const overlapB = Math.min(toInner, end);
    if (overlapB <= overlapA) return;

    nextBlock.rows[rowIndex].cells[cellIndex] = {
      ...cell,
      content: rewriteRunsInRange(cell.content, overlapA - start, overlapB - start, rewriteRun),
    };
  });

  return nextBlock;
}

/** ---------- COMMANDS ---------- */

export function indentBlock(doc, selection, delta) {
  const d = normalizeDoc(doc);
  const sel = ensureSelection(selection);
  const next = cloneDoc(d);

  const start = splitDocAtTextOffset(next, sel.from, false);
  const end = splitDocAtTextOffset(next, sel.to, true);

  for (let bi = start.blockIndex; bi <= end.blockIndex; bi++) {
    const b = next.content[bi];
    if (!b || b.type === "table") continue;
    const cur = Number.isFinite(b.indent) ? b.indent : 0;
    b.indent = Math.max(0, Math.min(8, cur + delta));
  }

  return { doc: next, selection: sel };
}

export function toggleInlineMark(doc, selection, type) {
  const d = normalizeDoc(doc);
  const sel = ensureSelection(selection);
  const next = cloneDoc(d);

  let { from, to } = sel;

  // collapsed selection: toggle on next character (common editor behavior)
  if (from === to) {
    const len = docToPlainText(next).length;
    to = Math.min(from + 1, len);
    if (to === from) return { doc: next, selection: sel };
  }

  mapSelectedBlocks(next, { from, to }, (block, _bi, fromInner, toInner) => {
    const shouldRemove = rangeHasAllMark(block, fromInner, toInner, type);
    return applyMarkRangeToBlock(block, fromInner, toInner, { type }, !shouldRemove);
  });

  return { doc: next, selection: sel };
}


export function setFontSize(doc, selection, size) {
  const d = normalizeDoc(doc);
  const sel = ensureSelection(selection);
  const next = cloneDoc(d);

  const fontSize = String(size || "").trim().toLowerCase();
  if (!/^\d+(?:\.\d+)?px$/.test(fontSize)) {
    return { doc: next, selection: sel };
  }

  if (sel.from === sel.to) return { doc: next, selection: sel };

  mapSelectedBlocks(next, sel, (block, _bi, fromInner, toInner) => (
    applyMarkRangeToBlock(block, fromInner, toInner, { type: "fontSize", value: fontSize }, true)
  ));

  return { doc: next, selection: sel };
}

export function setColor(doc, selection, hex) {
  const d = normalizeDoc(doc);
  const sel = ensureSelection(selection);
  const next = cloneDoc(d);

  const color = String(hex || "").trim();
  const shouldRemove = !color || color === "__none__";
  if (!shouldRemove && !/^#[0-9a-fA-F]{6}$/.test(color) && !/^#[0-9a-fA-F]{3}$/.test(color)) {
    return { doc: next, selection: sel };
  }

  if (sel.from === sel.to) return { doc: next, selection: sel };

  mapSelectedBlocks(next, sel, (block, _bi, fromInner, toInner) => (
    applyMarkRangeToBlock(block, fromInner, toInner, { type: "color", value: color }, !shouldRemove)
  ));

  return { doc: next, selection: sel };
}


export function setHighlight(doc, selection, hex) {
  const d = normalizeDoc(doc);
  const sel = ensureSelection(selection);
  const next = cloneDoc(d);

  const color = String(hex || "").trim();
  const shouldRemove = !color || color === "__none__";
  if (!shouldRemove && !/^#[0-9a-fA-F]{6}$/.test(color) && !/^#[0-9a-fA-F]{3}$/.test(color)) {
    return { doc: next, selection: sel };
  }

  if (sel.from === sel.to) return { doc: next, selection: sel };

  mapSelectedBlocks(next, sel, (block, _bi, fromInner, toInner) => (
    applyMarkRangeToBlock(block, fromInner, toInner, { type: "background", value: color }, !shouldRemove)
  ));

  return { doc: next, selection: sel };
}

export function setLink(doc, selection, href) {
  const d = normalizeDoc(doc);
  const sel = ensureSelection(selection);
  const next = cloneDoc(d);

  const cleanHref = String(href || "").trim();
  if (!cleanHref) return { doc: next, selection: sel };
  if (sel.from === sel.to) return { doc: next, selection: sel };
  const linkColor = "#2563eb";

  mapSelectedBlocks(next, sel, (block, _bi, fromInner, toInner) => {
    const withLink = applyMarkRangeToBlock(block, fromInner, toInner, { type: "a", href: cleanHref }, true);
    return applyMarkRangeToBlock(withLink, fromInner, toInner, { type: "color", value: linkColor }, true);
  });

  return { doc: next, selection: sel };
}

export function unsetLink(doc, selection) {
  const d = normalizeDoc(doc);
  const sel = ensureSelection(selection);
  const next = cloneDoc(d);
  const linkColor = "#2563eb";

  if (sel.from === sel.to) return { doc: next, selection: sel };

  mapSelectedBlocks(next, sel, (block, _bi, fromInner, toInner) => (
    rewriteBlockRunsInRange(block, fromInner, toInner, (midRun) => {
      const baseMarks = midRun.marks || [];
      const hadLink = baseMarks.some((m) => m.type === "a");
      const withoutLink = baseMarks.filter((m) => {
        if (m.type === "a") return false;
        if (hadLink && m.type === "color" && String(m.value || "").toLowerCase() === linkColor) return false;
        return true;
      });
      return { ...midRun, marks: normalizeMarks(withoutLink) };
    })
  ));

  return { doc: next, selection: sel };
}

export function setBlockType(doc, selection, type, level) {
  const d = normalizeDoc(doc);
  const sel = ensureSelection(selection);
  const next = cloneDoc(d);

  const start = splitDocAtTextOffset(next, sel.from, false);
  const end = splitDocAtTextOffset(next, sel.to, true);

  for (let bi = start.blockIndex; bi <= end.blockIndex; bi++) {
    const b = next.content[bi];
    if (!b || !hasInlineContent(b)) continue;

    const base = {
      align: b.align || "left",
      indent: Number.isFinite(b.indent) ? b.indent : 0,
      content: b.content,
    };

    if (type === "p") next.content[bi] = { type: "p", ...base };

    if (type === "h") {
      const lvl = [1, 2, 3].includes(level) ? level : 2;
      next.content[bi] = { type: "h", level: lvl, ...base };
    }

    if (type === "code") {
      next.content[bi] = {
        type: "code",
        align: "left",
        indent: 0,
        content: b.content,
      };
    }
  }

  return { doc: next, selection: sel };
}

export function setAlign(doc, selection, align) {
  const d = normalizeDoc(doc);
  const sel = ensureSelection(selection);
  const next = cloneDoc(d);

  const a = ["left", "center", "right", "justify"].includes(align) ? align : "left";

  const start = splitDocAtTextOffset(next, sel.from, false);
  const end = splitDocAtTextOffset(next, sel.to, true);

  for (let bi = start.blockIndex; bi <= end.blockIndex; bi++) {
    const block = next.content[bi];
    if (!block || block.type === "table") continue;
    block.align = a;
  }

  return { doc: next, selection: sel };
}

export function toggleList(doc, selection, listType) {
  const d = normalizeDoc(doc);
  const sel = ensureSelection(selection);
  const next = cloneDoc(d);

  const start = splitDocAtTextOffset(next, sel.from, false);
  const end = splitDocAtTextOffset(next, sel.to, true);

  const lt = listType === "ol" ? "ol" : "ul";

  let allSame = true;
  for (let bi = start.blockIndex; bi <= end.blockIndex; bi++) {
    const b = next.content[bi];
    if (!b || !hasInlineContent(b) || !(b.type === "li" && (b.list || "ul") === lt)) {
      allSame = false;
      break;
    }
  }

  for (let bi = start.blockIndex; bi <= end.blockIndex; bi++) {
    const b = next.content[bi];
    if (!b || !hasInlineContent(b)) continue;

    if (allSame) {
      next.content[bi] = {
        type: "p",
        align: b.align || "left",
        indent: Number.isFinite(b.indent) ? b.indent : 0,
        content: b.content,
      };
    } else {
      next.content[bi] = {
        type: "li",
        list: lt,
        indent: 0,
        align: b.align || "left",
        content: b.content,
      };
    }
  }

  return { doc: next, selection: sel };
}

export function indentList(doc, selection, delta) {
  const d = normalizeDoc(doc);
  const sel = ensureSelection(selection);
  const next = cloneDoc(d);

  const start = splitDocAtTextOffset(next, sel.from);
  const end = splitDocAtTextOffset(next, sel.to);

  for (let bi = start.blockIndex; bi <= end.blockIndex; bi++) {
    const b = next.content[bi];
    if (b?.type !== "li") continue;
    const cur = Number.isFinite(b.indent) ? b.indent : 0;
    b.indent = Math.max(0, Math.min(8, cur + delta));
  }

  return { doc: next, selection: sel };
}

export function insertTable(doc, selection, rows = 2, cols = 2) {
  const d = normalizeDoc(doc);
  const sel = ensureSelection(selection);
  const next = cloneDoc(d);

  const numRows = typeof rows === "number" && Number.isFinite(rows) ? Math.max(1, rows) : 2;
  const numCols = typeof cols === "number" && Number.isFinite(cols) ? Math.max(1, cols) : 2;

  const start = splitDocAtTextOffset(next, sel.from);
  const tableBlock = createTable({ rows: numRows, columns: numCols, headerRow: false });

  const insertIndex = Math.min(start.blockIndex + 1, next.content.length);
  next.content.splice(insertIndex, 0, tableBlock);

  return { doc: next, selection: sel };
}

function emptyParagraph() {
  return {
    type: "p",
    align: "left",
    indent: 0,
    content: [{ text: "" }],
  };
}

export function insertBlockAfterSelection(doc, selection, block) {
  const next = cloneDoc(normalizeDoc(doc));
  const sel = ensureSelection(selection);

  const position = splitDocAtTextOffset(next, sel.from);
  const insertAt = position.blockIndex + 1;

  next.content.splice(insertAt, 0, block);

  // Always keep an editable paragraph after an atomic block.
  const followingBlock = next.content[insertAt + 1];

  if (
    !followingBlock ||
    followingBlock.type === "image" ||
    followingBlock.type === "equation" ||
    followingBlock.type === "table"
  ) {
    next.content.splice(insertAt + 1, 0, emptyParagraph());
  }

  return {
    doc: normalizeDoc(next),
    selection: sel,
  };
}

export function insertImage(doc, selection, image) {
  const block = {
    type: "image",
    id: image.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `img_${Math.random().toString(36).slice(2, 9)}`),
    src: String(image.src || ""),
    alt: String(image.alt || ""),
    title: String(image.title || ""),
    caption: String(image.caption || ""),
    width: Number(image.width) || 600,
    height: Number(image.height) || null,
    align: image.align || "center",
    wrap: image.wrap || "break-text",
  };

  if (!block.src) {
    return {
      doc: normalizeDoc(doc),
      selection: ensureSelection(selection),
    };
  }

  return insertBlockAfterSelection(doc, selection, block);
}

function insertInlineNode(content, offset, newNode) {
  const source =
    Array.isArray(content) && content.length
      ? content
      : [{ text: "" }];

  const next = [];
  let currentOffset = 0;
  let inserted = false;

  for (const node of source) {
    const nodeLength = inlineNodeIndexLength(node);
    const nodeEnd = currentOffset + nodeLength;

    if (!inserted && isInlineEquation(node)) {
      if (offset <= currentOffset) {
        next.push(newNode);
        inserted = true;
      }

      next.push(node);

      if (!inserted && offset <= nodeEnd) {
        next.push(newNode);
        inserted = true;
      }

      currentOffset = nodeEnd;
      continue;
    }

    const text = String(node?.text || "");

    if (
      !inserted &&
      offset >= currentOffset &&
      offset <= nodeEnd
    ) {
      const localOffset = Math.max(
        0,
        Math.min(
          text.length,
          offset - currentOffset
        )
      );

      const left = text.slice(0, localOffset);
      const right = text.slice(localOffset);

      if (left) {
        next.push({
          text: left,
          marks: node.marks,
        });
      }

      next.push(newNode);

      if (right) {
        next.push({
          text: right,
          marks: node.marks,
        });
      }

      inserted = true;
    } else {
      next.push({ ...node });
    }

    currentOffset = nodeEnd;
  }

  if (!inserted) {
    next.push(newNode);
  }

  return mergeAdjacentRuns(next);
}

export function insertEquation(
  doc,
  selection,
  equation
) {
  const next = cloneDoc(normalizeDoc(doc));
  const sel = ensureSelection(selection);

  const position = splitDocAtTextOffset(
    next,
    sel.from
  );

  const block = next.content[position.blockIndex];

  const inlineEquation = {
    type: "equation",
    id:
      equation.id ||
      (typeof crypto !== "undefined" &&
      crypto.randomUUID
        ? crypto.randomUUID()
        : `eq_${Math.random()
            .toString(36)
            .slice(2, 9)}`),
    display: "inline",
    source: String(equation.source || ""),
    ast: equation.ast || {
      type: "row",
      children: [],
    },
  };

  if (
    block &&
    Array.isArray(block.content) &&
    block.type !== "code"
  ) {
    block.content = insertInlineNode(
      block.content,
      position.innerOffset,
      inlineEquation
    );

    const caretPosition = sel.from + 1;

    return {
      doc: normalizeDoc(next),
      selection: {
        from: caretPosition,
        to: caretPosition,
      },
    };
  }

  // When the caret is on a table/image block,
  // create a paragraph for the equation.
  const insertAt = Math.min(
    position.blockIndex + 1,
    next.content.length
  );

  next.content.splice(insertAt, 0, {
    type: "p",
    align: "left",
    indent: 0,
    content: [inlineEquation],
  });

  return {
    doc: normalizeDoc(next),
    selection: sel,
  };
}

export function updateAtomicBlock(
  doc,
  blockId,
  updates
) {
  const next = cloneDoc(normalizeDoc(doc));

  for (
    let blockIndex = 0;
    blockIndex < next.content.length;
    blockIndex++
  ) {
    const block = next.content[blockIndex];

    // Images and legacy top-level objects.
    if (block.id === blockId) {
      next.content[blockIndex] = {
        ...block,
        ...updates,
      };

      return {
        doc: normalizeDoc(next),
      };
    }

    // Inline equations.
    if (Array.isArray(block.content)) {
      const equationIndex =
        block.content.findIndex(
          (node) =>
            isInlineEquation(node) &&
            node.id === blockId
        );

      if (equationIndex >= 0) {
        block.content[equationIndex] = {
          ...block.content[equationIndex],
          ...updates,
          type: "equation",
          display: "inline",
        };

        return {
          doc: normalizeDoc(next),
        };
      }
    }
  }

  return { doc: next };
}

export function removeAtomicBlock(
  doc,
  blockId
) {
  const next = cloneDoc(
    normalizeDoc(doc)
  );

  // Top-level images and old block equations.
  next.content =
    next.content.filter(
      (block) =>
        block.id !== blockId
    );

  // Inline equations inside paragraphs/headings/lists.
  for (const block of next.content) {
    if (!Array.isArray(block.content)) {
      continue;
    }

    block.content =
      block.content.filter(
        (node) =>
          !(
            isInlineEquation(node) &&
            node.id === blockId
          )
      );

    block.content =
      mergeAdjacentRuns(
        block.content
      );
  }

  if (!next.content.length) {
    next.content = [
      emptyParagraph(),
    ];
  }

  return {
    doc: normalizeDoc(next),
  };
}

function insertIntoRuns(runs, offset, text) {
  const source = Array.isArray(runs) && runs.length ? runs : [{ text: "" }];

  const next = [];
  let currentOffset = 0;
  let inserted = false;

  for (const run of source) {
    const runText = String(run.text || "");
    const runEnd = currentOffset + runText.length;

    if (!inserted && offset >= currentOffset && offset <= runEnd) {
      const localOffset = offset - currentOffset;

      const left = runText.slice(0, localOffset);
      const right = runText.slice(localOffset);

      if (left) {
        next.push({
          text: left,
          marks: run.marks,
        });
      }

      next.push({
        text,
        marks: run.marks,
      });

      if (right) {
        next.push({
          text: right,
          marks: run.marks,
        });
      }

      inserted = true;
    } else {
      next.push({ ...run });
    }

    currentOffset = runEnd;
  }

  if (!inserted) {
    next.push({ text });
  }

  return mergeAdjacentRuns(next);
}

export function insertText(doc, selection, text) {
  const next = cloneDoc(normalizeDoc(doc));
  const sel = ensureSelection(selection);

  if (!text) {
    return { doc: next, selection: sel };
  }

  const position = splitDocAtTextOffset(next, sel.from);
  const block = next.content[position.blockIndex];

  if (!block || !Array.isArray(block.content)) {
    return { doc: next, selection: sel };
  }

  block.content = insertIntoRuns(
    block.content,
    position.innerOffset,
    text
  );

  return {
    doc: normalizeDoc(next),
    selection: {
      from: sel.from + text.length,
      to: sel.from + text.length,
    },
  };
}
