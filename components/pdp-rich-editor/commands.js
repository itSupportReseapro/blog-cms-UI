// components/pdp-rich-editor/commands.js

import {
  cloneDoc,
  normalizeDoc,
  ensureSelection,
  splitDocAtTextOffset,
  docToPlainText,
  marksKey,
  normalizeMarks,
  mergeAdjacentRuns,
} from "./core";

/** ---------- helpers ---------- */

function flattenRuns(block) {
  let pos = 0;
  const spans = [];
  for (let ri = 0; ri < block.content.length; ri++) {
    const len = String(block.content[ri].text || "").length;
    spans.push({ runIndex: ri, start: pos, end: pos + len });
    pos += len;
  }
  return spans;
}

/**
 * Mark behavior:
 * - color: replace existing color
 * - a: replace existing link
 * - b/i/u/sup/sub/s: toggle that mark
 */
function setMark(run, mark, on) {
  const next = { ...run };
  const marks = Array.isArray(next.marks) ? [...next.marks] : [];

  let base;
  if (mark.type === "color") base = marks.filter((m) => m.type !== "color");
  else if (mark.type === "a") base = marks.filter((m) => m.type !== "a");
  else base = marks.filter((m) => m.type !== mark.type);

  if (on) base.push(mark);

  next.marks = normalizeMarks(base);
  return next;
}

function applyMarkRangeToBlock(block, fromInner, toInner, mark, forceOn) {
  const b = { ...block, content: block.content.map((r) => ({ ...r })) };
  const spans = flattenRuns(b);
  const nextRuns = [];

  for (const sp of spans) {
    const run = b.content[sp.runIndex];
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

    // mid can be empty in edge cases → keep it; mergeAdjacentRuns cleans after merge
    nextRuns.push(setMark({ text: midText, marks: baseMarks }, mark, forceOn));

    if (rightText) nextRuns.push({ text: rightText, marks: baseMarks });
  }

  b.content = mergeAdjacentRuns(nextRuns);
  if (!b.content.length) b.content = [{ text: "" }];
  return b;
}

function runHasMark(run, type) {
  const marks = run.marks || [];
  return marks.some((m) => m.type === type);
}

function rangeHasAllMark(block, fromInner, toInner, type) {
  if (toInner <= fromInner) return false;
  const spans = flattenRuns(block);

  for (const sp of spans) {
    const run = block.content[sp.runIndex];
    const a = sp.start;
    const c = sp.end;
    const overlapA = Math.max(fromInner, a);
    const overlapC = Math.min(toInner, c);
    if (overlapC <= overlapA) continue;
    if (!runHasMark(run, type)) return false;
  }

  return true;
}

/** ---------- COMMANDS ---------- */

export function indentBlock(doc, selection, delta) {
  const d = normalizeDoc(doc);
  const sel = ensureSelection(selection);
  const next = cloneDoc(d);

  const start = splitDocAtTextOffset(next, sel.from);
  const end = splitDocAtTextOffset(next, sel.to);

  for (let bi = start.blockIndex; bi <= end.blockIndex; bi++) {
    const b = next.content[bi];
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

  const start = splitDocAtTextOffset(next, from);
  const end = splitDocAtTextOffset(next, to);

  for (let bi = start.blockIndex; bi <= end.blockIndex; bi++) {
    const block = next.content[bi];
    const blockLen = block.content.reduce((a, r) => a + String(r.text || "").length, 0);
    const fromInner = bi === start.blockIndex ? start.innerOffset : 0;
    const toInner = bi === end.blockIndex ? end.innerOffset : blockLen;

    const shouldRemove = rangeHasAllMark(block, fromInner, toInner, type);

    next.content[bi] = applyMarkRangeToBlock(
      block,
      fromInner,
      toInner,
      { type },
      shouldRemove ? false : true
    );
  }

  return { doc: next, selection: sel };
}

export function setColor(doc, selection, hex) {
  const d = normalizeDoc(doc);
  const sel = ensureSelection(selection);
  const next = cloneDoc(d);

  const color = String(hex || "").trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(color) && !/^#[0-9a-fA-F]{3}$/.test(color)) {
    return { doc: next, selection: sel };
  }

  if (sel.from === sel.to) return { doc: next, selection: sel };

  const start = splitDocAtTextOffset(next, sel.from);
  const end = splitDocAtTextOffset(next, sel.to);

  for (let bi = start.blockIndex; bi <= end.blockIndex; bi++) {
    const block = next.content[bi];
    const blockLen = block.content.reduce((a, r) => a + String(r.text || "").length, 0);
    const fromInner = bi === start.blockIndex ? start.innerOffset : 0;
    const toInner = bi === end.blockIndex ? end.innerOffset : blockLen;

    next.content[bi] = applyMarkRangeToBlock(
      block,
      fromInner,
      toInner,
      { type: "color", value: color },
      true
    );
  }

  return { doc: next, selection: sel };
}

export function setLink(doc, selection, href) {
  const d = normalizeDoc(doc);
  const sel = ensureSelection(selection);
  const next = cloneDoc(d);

  const cleanHref = String(href || "").trim();
  if (!cleanHref) return { doc: next, selection: sel };
  if (sel.from === sel.to) return { doc: next, selection: sel };

  const start = splitDocAtTextOffset(next, sel.from);
  const end = splitDocAtTextOffset(next, sel.to);

  for (let bi = start.blockIndex; bi <= end.blockIndex; bi++) {
    const block = next.content[bi];
    const blockLen = block.content.reduce((a, r) => a + String(r.text || "").length, 0);
    const fromInner = bi === start.blockIndex ? start.innerOffset : 0;
    const toInner = bi === end.blockIndex ? end.innerOffset : blockLen;

    next.content[bi] = applyMarkRangeToBlock(
      block,
      fromInner,
      toInner,
      { type: "a", href: cleanHref },
      true
    );
  }

  return { doc: next, selection: sel };
}

export function unsetLink(doc, selection) {
  const d = normalizeDoc(doc);
  const sel = ensureSelection(selection);
  const next = cloneDoc(d);

  if (sel.from === sel.to) return { doc: next, selection: sel };

  const start = splitDocAtTextOffset(next, sel.from);
  const end = splitDocAtTextOffset(next, sel.to);

  for (let bi = start.blockIndex; bi <= end.blockIndex; bi++) {
    const block = next.content[bi];
    const blockLen = block.content.reduce((a, r) => a + String(r.text || "").length, 0);
    const fromInner = bi === start.blockIndex ? start.innerOffset : 0;
    const toInner = bi === end.blockIndex ? end.innerOffset : blockLen;

    const spans = flattenRuns(block);
    const nextRuns = [];

    for (const sp of spans) {
      const run = block.content[sp.runIndex];
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

      const baseMarks = run.marks || [];
      const withoutLink = baseMarks.filter((m) => m.type !== "a");
      const marks = normalizeMarks(withoutLink);

      if (leftText) nextRuns.push({ text: leftText, marks: run.marks });
      nextRuns.push({ text: midText, marks }); // mid can be empty; merge cleans it
      if (rightText) nextRuns.push({ text: rightText, marks: run.marks });
    }

    next.content[bi] = { ...block, content: mergeAdjacentRuns(nextRuns) };
  }

  return { doc: next, selection: sel };
}

export function setBlockType(doc, selection, type, level) {
  const d = normalizeDoc(doc);
  const sel = ensureSelection(selection);
  const next = cloneDoc(d);

  const start = splitDocAtTextOffset(next, sel.from);
  const end = splitDocAtTextOffset(next, sel.to);

  for (let bi = start.blockIndex; bi <= end.blockIndex; bi++) {
    const b = next.content[bi];
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
  }

  return { doc: next, selection: sel };
}

export function setAlign(doc, selection, align) {
  const d = normalizeDoc(doc);
  const sel = ensureSelection(selection);
  const next = cloneDoc(d);

  const a = ["left", "center", "right", "justify"].includes(align) ? align : "left";

  const start = splitDocAtTextOffset(next, sel.from);
  const end = splitDocAtTextOffset(next, sel.to);

  for (let bi = start.blockIndex; bi <= end.blockIndex; bi++) {
    next.content[bi].align = a;
  }

  return { doc: next, selection: sel };
}

export function toggleList(doc, selection, listType) {
  const d = normalizeDoc(doc);
  const sel = ensureSelection(selection);
  const next = cloneDoc(d);

  const start = splitDocAtTextOffset(next, sel.from);
  const end = splitDocAtTextOffset(next, sel.to);

  const lt = listType === "ol" ? "ol" : "ul";

  let allSame = true;
  for (let bi = start.blockIndex; bi <= end.blockIndex; bi++) {
    const b = next.content[bi];
    if (!(b.type === "li" && (b.list || "ul") === lt)) {
      allSame = false;
      break;
    }
  }

  for (let bi = start.blockIndex; bi <= end.blockIndex; bi++) {
    const b = next.content[bi];
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
    if (b.type !== "li") continue;
    const cur = Number.isFinite(b.indent) ? b.indent : 0;
    b.indent = Math.max(0, Math.min(8, cur + delta));
  }

  return { doc: next, selection: sel };
}