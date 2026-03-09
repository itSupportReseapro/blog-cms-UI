// components/pdp-rich-editor/selection-dom.js

/**
 * Map DOM selection <-> absolute model offsets.
 *
 * IMPORTANT:
 * Model indexing = blockText + '\n' + blockText + ...
 * Blocks: <p>, <h1>, <h2>, <h3>, <li>
 * Lists: each direct <li> is its own block.
 *
 * ALSO IMPORTANT:
 * The editor DOM may contain ZWSP (\u200B) or NBSP (\u00A0) as caret helpers.
 * These MUST NOT affect model offsets.
 */

const IGNORE_RE = /[\u200B\u00A0]/g;

function cleanText(s) {
  return String(s || "").replace(IGNORE_RE, "");
}

function cleanLen(s) {
  return cleanText(s).length;
}

export function getSelectionOffsets(rootEl) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return { from: 0, to: 0 };

  const r = sel.getRangeAt(0);
  const from = pointToAbs(rootEl, r.startContainer, r.startOffset);
  const to = pointToAbs(rootEl, r.endContainer, r.endOffset);

  return normalize(from, to);
}

export function setSelectionOffsets(rootEl, from, to) {
  const blocks = getBlockElements(rootEl);
  if (!blocks.length) return;

  const lengths = blocks.map((b) => getBlockTextLength(b));

  const absToPoint = (abs) => {
    let pos = Math.max(0, Number.isFinite(abs) ? abs : 0);

    for (let i = 0; i < blocks.length; i++) {
      const len = lengths[i];

      // inside block
      if (pos <= len) return { blockIndex: i, innerOffset: pos };

      // skip block + newline (except after last)
      pos -= len;
      if (i !== blocks.length - 1) pos -= 1;

      if (pos < 0) return { blockIndex: i, innerOffset: len };
    }

    return {
      blockIndex: blocks.length - 1,
      innerOffset: lengths[lengths.length - 1],
    };
  };

  const resolveTextNodeAt = (blockEl, innerOffset) => {
    // Walk text nodes, but count only "clean" characters
    const walker = document.createTreeWalker(blockEl, NodeFilter.SHOW_TEXT, null);

    let remaining = Math.max(0, innerOffset);

    while (walker.nextNode()) {
      const t = walker.currentNode;
      const raw = t.nodeValue || "";
      const cleaned = cleanText(raw);
      const clen = cleaned.length;

      if (remaining <= clen) {
        // Convert "clean offset" -> real node offset (skip ignored chars)
        const realOffset = cleanOffsetToRealOffset(raw, remaining);
        return { node: t, offset: realOffset };
      }

      remaining -= clen;
    }

    // ensure a text node exists
    const tn = document.createTextNode("");
    blockEl.appendChild(tn);
    return { node: tn, offset: 0 };
  };

  const a = absToPoint(from);
  const b = absToPoint(to);

  const aBlock = blocks[a.blockIndex];
  const bBlock = blocks[b.blockIndex];
  if (!aBlock || !bBlock) return;

  const pA = resolveTextNodeAt(aBlock, a.innerOffset);
  const pB = resolveTextNodeAt(bBlock, b.innerOffset);

  const sel = window.getSelection();
  if (!sel) return;

  const range = document.createRange();
  range.setStart(pA.node, pA.offset);
  range.setEnd(pB.node, pB.offset);

  sel.removeAllRanges();
  sel.addRange(range);
}

export function getRangeRectSafe(rootEl) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;

  const r = sel.getRangeAt(0);
  if (!rootEl.contains(r.startContainer) || !rootEl.contains(r.endContainer)) return null;

  const rects = r.getClientRects();
  return rects && rects.length ? rects[0] : r.getBoundingClientRect();
}

/* ----------------- internals ----------------- */

function normalize(a, b) {
  let from = Number.isFinite(a) ? a : 0;
  let to = Number.isFinite(b) ? b : 0;
  if (from > to) [from, to] = [to, from];
  return { from, to };
}

function getBlockElements(rootEl) {
  const out = [];

  for (const child of Array.from(rootEl.children || [])) {
    const tag = child.tagName?.toLowerCase();

    if (tag === "ul" || tag === "ol") {
      const lis = Array.from(child.querySelectorAll(":scope > li"));
      for (const li of lis) out.push(li);
      continue;
    }

    out.push(child);
  }

  return out.filter((el) => {
    const t = el.tagName?.toLowerCase();
    return t === "p" || t === "h1" || t === "h2" || t === "h3" || t === "li";
  });
}

function findContainingBlock(rootEl, node) {
  let cur = node;

  while (cur && cur !== rootEl) {
    if (cur.nodeType === Node.ELEMENT_NODE) {
      const tag = cur.tagName?.toLowerCase();
      if (tag === "p" || tag === "h1" || tag === "h2" || tag === "h3" || tag === "li") return cur;
    }
    cur = cur.parentNode;
  }

  return null;
}

function getBlockTextLength(blockEl) {
  // Count block text by walking text nodes and ignoring ZWSP/NBSP
  const walker = document.createTreeWalker(blockEl, NodeFilter.SHOW_TEXT, null);
  let len = 0;
  while (walker.nextNode()) {
    len += cleanLen(walker.currentNode.nodeValue || "");
  }
  return len;
}

function getOffsetWithinElementClean(el, node, nodeOffset) {
  // Offset within block ignoring ZWSP/NBSP
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  let offset = 0;

  while (walker.nextNode()) {
    const t = walker.currentNode;
    const raw = t.nodeValue || "";

    if (t === node) {
      // Convert real nodeOffset -> clean offset
      const cleanOff = realOffsetToCleanOffset(raw, nodeOffset);
      return offset + cleanOff;
    }

    offset += cleanLen(raw);
  }

  return offset;
}

function pointToAbs(rootEl, container, offset) {
  const blocks = getBlockElements(rootEl);
  if (!blocks.length) return 0;

  const lengths = blocks.map((b) => getBlockTextLength(b));

  const starts = [];
  let sum = 0;
  for (let i = 0; i < lengths.length; i++) {
    starts[i] = sum;
    sum += lengths[i];
    if (i !== lengths.length - 1) sum += 1; // newline
  }

  const bEl = findContainingBlock(rootEl, container);
  if (!bEl) return 0;

  const bi = blocks.indexOf(bEl);
  if (bi < 0) return 0;

  const inner =
    container.nodeType === Node.TEXT_NODE
      ? getOffsetWithinElementClean(bEl, container, offset)
      : getOffsetWithinElementClean(bEl, container, 0);

  return starts[bi] + inner;
}

/**
 * Convert:
 * - real offset (counts all chars) -> clean offset (ignores ZWSP/NBSP)
 */
function realOffsetToCleanOffset(raw, realOffset) {
  const upto = String(raw || "").slice(0, Math.max(0, realOffset));
  return cleanLen(upto);
}

/**
 * Convert:
 * - clean offset -> real offset inside that text node
 */
function cleanOffsetToRealOffset(raw, cleanOffset) {
  const s = String(raw || "");
  let cleanCount = 0;

  for (let i = 0; i <= s.length; i++) {
    if (cleanCount >= cleanOffset) return i;
    const ch = s[i];
    if (ch == null) break;
    if (ch === "\u200B" || ch === "\u00A0") continue;
    cleanCount++;
  }

  return s.length;
}