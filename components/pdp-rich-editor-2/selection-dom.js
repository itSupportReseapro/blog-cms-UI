// components/pdp-rich-editor-2/selection-dom.js

/**
 * Map DOM selection <-> absolute model offsets.
 *
 * IMPORTANT:
 * Model indexing = blockText + '
' + blockText + ...
 * Blocks: <p>, <h1>, <h2>, <h3>, <li>, and table cells with '	' / '
' separators.
 * Lists: each direct <li> is its own block.
 *
 * ALSO IMPORTANT:
 * The editor DOM may contain ZWSP (​) or NBSP ( ) as caret helpers.
 * These MUST NOT affect model offsets.
 */

const IGNORE_RE = /[​ ]/g;

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
  const segments = getSegments(rootEl);
  if (!segments.length) return;

  const absToPoint = (abs) => {
    let pos = Math.max(0, Number.isFinite(abs) ? abs : 0);

    for (const seg of segments) {
      const len = seg.length;
      if (pos <= len) return { node: seg.node, innerOffset: pos };

      pos -= len;
      if (seg.sepAfter) {
        if (pos <= seg.sepAfter) return { node: seg.node, innerOffset: len };
        pos -= seg.sepAfter;
      }
    }

    const last = segments[segments.length - 1];
    return { node: last.node, innerOffset: last.length };
  };

  const resolveTextNodeAt = (blockEl, innerOffset) => {
    const walker = document.createTreeWalker(blockEl, NodeFilter.SHOW_TEXT, null);
    let remaining = Math.max(0, innerOffset);

    while (walker.nextNode()) {
      const t = walker.currentNode;
      const raw = t.nodeValue || "";
      const clen = cleanLen(raw);

      if (remaining <= clen) {
        const realOffset = cleanOffsetToRealOffset(raw, remaining);
        return { node: t, offset: realOffset };
      }

      remaining -= clen;
    }

    const tn = document.createTextNode("");
    blockEl.appendChild(tn);
    return { node: tn, offset: 0 };
  };

  const a = absToPoint(from);
  const b = absToPoint(to);
  if (!a.node || !b.node) return;

  const pA = resolveTextNodeAt(a.node, a.innerOffset);
  const pB = resolveTextNodeAt(b.node, b.innerOffset);

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

function isBlockNode(el) {
  const t = el?.tagName?.toLowerCase();
  return t === "p" || t === "h1" || t === "h2" || t === "h3" || t === "pre" || t === "li" || t === "td" || t === "th";
}

function getSegments(rootEl) {
  const segments = [];
  const topChildren = Array.from(rootEl.children || []);

  for (let i = 0; i < topChildren.length; i++) {
    const child = topChildren[i];
    const tag = child.tagName?.toLowerCase();
    const isLastTopLevel = i === topChildren.length - 1;

    if (tag === "ul" || tag === "ol") {
      const lis = Array.from(child.querySelectorAll(":scope > li"));
      for (let liIndex = 0; liIndex < lis.length; liIndex++) {
        const li = lis[liIndex];
        const isLastLi = liIndex === lis.length - 1;
        segments.push({
          node: li,
          length: getBlockTextLength(li),
          sepAfter: !isLastLi ? 1 : (!isLastTopLevel ? 1 : 0),
        });
      }
      continue;
    }

    if (tag === "table") {
      const rows = Array.from(child.querySelectorAll(":scope > tbody > tr, :scope > tr"));
      for (let ri = 0; ri < rows.length; ri++) {
        const cells = Array.from(rows[ri].querySelectorAll(":scope > td, :scope > th"));
        for (let ci = 0; ci < cells.length; ci++) {
          const isLastCell = ci === cells.length - 1;
          const isLastRow = ri === rows.length - 1;
          let sepAfter = 0;
          if (!isLastCell) sepAfter = 1; // tab
          else if (!isLastRow) sepAfter = 1; // row newline
          else if (!isLastTopLevel) sepAfter = 1; // block newline after table

          segments.push({
            node: cells[ci],
            length: getBlockTextLength(cells[ci]),
            sepAfter,
          });
        }
      }
      continue;
    }

    if (isBlockNode(child)) {
      segments.push({
        node: child,
        length: getBlockTextLength(child),
        sepAfter: !isLastTopLevel ? 1 : 0,
      });
    }
  }

  return segments;
}

function findContainingBlock(rootEl, node) {
  let cur = node;

  while (cur && cur !== rootEl) {
    if (cur.nodeType === Node.ELEMENT_NODE && isBlockNode(cur)) return cur;
    cur = cur.parentNode;
  }

  return null;
}

function getFirstBlockFromNode(node) {
  if (!node || node.nodeType !== Node.ELEMENT_NODE) return null;
  if (isBlockNode(node)) return node;

  const tag = node.tagName?.toLowerCase();
  if (tag === "ul" || tag === "ol") {
    return node.querySelector(":scope > li");
  }
  if (tag === "table") {
    return node.querySelector("td, th");
  }

  return node.querySelector("p, h1, h2, h3, pre, li, td, th");
}

function resolveRootPointBlock(rootEl, container, offset) {
  if (container !== rootEl || !Number.isFinite(offset)) return null;

  const childNodes = Array.from(rootEl.childNodes || []);
  if (!childNodes.length) return null;

  const idx = Math.max(0, Math.min(offset, childNodes.length));

  if (idx < childNodes.length) {
    const fromNext = getFirstBlockFromNode(childNodes[idx]);
    if (fromNext) return { blockEl: fromNext, innerOffset: 0 };
  }

  for (let i = idx - 1; i >= 0; i--) {
    const fromPrev = getFirstBlockFromNode(childNodes[i]);
    if (fromPrev) {
      return { blockEl: fromPrev, innerOffset: getBlockTextLength(fromPrev) };
    }
  }

  return null;
}

function getBlockTextLength(blockEl) {
  const walker = document.createTreeWalker(blockEl, NodeFilter.SHOW_TEXT, null);
  let len = 0;
  while (walker.nextNode()) {
    len += cleanLen(walker.currentNode.nodeValue || "");
  }
  return len;
}

function getOffsetWithinElementClean(el, node, nodeOffset) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  let offset = 0;

  while (walker.nextNode()) {
    const t = walker.currentNode;
    const raw = t.nodeValue || "";

    if (t === node) {
      const cleanOff = realOffsetToCleanOffset(raw, nodeOffset);
      return offset + cleanOff;
    }

    offset += cleanLen(raw);
  }

  return offset;
}

function getOffsetWithinPointClean(blockEl, container, nodeOffset) {
  if (container.nodeType === Node.TEXT_NODE) {
    return getOffsetWithinElementClean(blockEl, container, nodeOffset);
  }

  if (container.nodeType === Node.ELEMENT_NODE) {
    try {
      const endOffset = Math.max(0, Math.min(nodeOffset, container.childNodes.length));
      const range = document.createRange();
      range.setStart(blockEl, 0);
      range.setEnd(container, endOffset);
      return cleanLen(range.toString());
    } catch {
      return getOffsetWithinElementClean(blockEl, container, 0);
    }
  }

  return 0;
}

function pointToAbs(rootEl, container, offset) {
  const segments = getSegments(rootEl);
  if (!segments.length) return 0;

  let bEl = findContainingBlock(rootEl, container);
  let inner = 0;

  if (!bEl) {
    const rootPoint = resolveRootPointBlock(rootEl, container, offset);
    if (!rootPoint) return 0;
    bEl = rootPoint.blockEl;
    inner = rootPoint.innerOffset;
  }

  const segmentIndex = segments.findIndex((seg) => seg.node === bEl);
  if (segmentIndex < 0) return 0;

  if (container !== rootEl) {
    inner = getOffsetWithinPointClean(bEl, container, offset);
  }

  let abs = 0;
  for (let i = 0; i < segmentIndex; i++) {
    abs += segments[i].length + segments[i].sepAfter;
  }

  return abs + inner;
}

function realOffsetToCleanOffset(raw, realOffset) {
  const upto = String(raw || "").slice(0, Math.max(0, realOffset));
  return cleanLen(upto);
}

function cleanOffsetToRealOffset(raw, cleanOffset) {
  const s = String(raw || "");
  let cleanCount = 0;

  for (let i = 0; i <= s.length; i++) {
    if (cleanCount >= cleanOffset) return i;
    const ch = s[i];
    if (ch == null) break;
    if (ch === "​" || ch === " ") continue;
    cleanCount++;
  }

  return s.length;
}
