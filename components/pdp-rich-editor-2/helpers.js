import { normalizeDoc } from "./core";

export function findContainingBlock(rootEl, node) {
  let cur = node;
  while (cur && cur !== rootEl) {
    if (cur.nodeType === Node.ELEMENT_NODE) {
      const tag = cur.tagName?.toLowerCase();
      if (tag === "p" || tag === "h1" || tag === "h2" || tag === "h3" || tag === "pre" || tag === "li" || tag === "td" || tag === "th") return cur;
    }
    cur = cur.parentNode;
  }
  return null;
}

function walkRunsWithOffsets(doc, visitor) {
  const d = normalizeDoc(doc);
  let abs = 0;

  for (let bi = 0; bi < d.content.length; bi++) {
    const blk = d.content[bi];

    if (blk.type === "table") {
      const rows = Array.isArray(blk.rows) ? blk.rows : [];
      for (let ri = 0; ri < rows.length; ri++) {
        const cells = Array.isArray(rows[ri]?.cells) ? rows[ri].cells : [];
        for (let ci = 0; ci < cells.length; ci++) {
          const runs = Array.isArray(cells[ci]?.content) ? cells[ci].content : [];
          for (const run of runs) {
            const start = abs;
            const end = start + (run.text?.length || 0);
            visitor(run, start, end, { blockIndex: bi, rowIndex: ri, cellIndex: ci });
            abs = end;
          }
          if (ci !== cells.length - 1) abs += 1; // tab
        }
        if (ri !== rows.length - 1) abs += 1; // row newline
      }
    } else {
      const runs = Array.isArray(blk.content) ? blk.content : [];
      for (const run of runs) {
        const start = abs;
        const end = start + (run.text?.length || 0);
        visitor(run, start, end, { blockIndex: bi });
        abs = end;
      }
    }

    if (bi !== d.content.length - 1) abs += 1; // block newline
  }
}

export function getLinkHrefInRange(doc, selection) {
  const a = Number.isFinite(selection?.from) ? selection.from : 0;
  const b = Number.isFinite(selection?.to) ? selection.to : 0;
  const from = Math.max(0, Math.min(a, b));
  const to = Math.max(0, Math.max(a, b));
  if (from === to) return "";

  let href = "";
  walkRunsWithOffsets(doc, (run, runStart, runEnd) => {
    if (href) return;
    const overlapA = Math.max(from, runStart);
    const overlapB = Math.min(to, runEnd);
    if (overlapB > overlapA) {
      href = (run.marks || []).find((m) => m.type === "a" && m.href)?.href || "";
    }
  });

  return href;
}

export function getLinkRangeAtPos(doc, pos) {
  const items = [];
  walkRunsWithOffsets(doc, (run, start, end) => {
    const href = (run.marks || []).find((m) => m.type === "a" && m.href)?.href || "";
    if (!href || end <= start) return;
    items.push({ href, start, end });
  });

  const p = Number.isFinite(pos) ? pos : 0;
  const idx = items.findIndex((item) => p >= item.start && p <= item.end);
  if (idx < 0) return null;

  let from = items[idx].start;
  let to = items[idx].end;
  const href = items[idx].href;

  for (let i = idx - 1; i >= 0; i--) {
    if (items[i].href !== href) break;
    if (items[i].end !== from) break;
    from = items[i].start;
  }

  for (let i = idx + 1; i < items.length; i++) {
    if (items[i].href !== href) break;
    if (items[i].start !== to) break;
    to = items[i].end;
  }

  return { from, to, href };
}

export function j(x) {
  try {
    return JSON.stringify(x);
  } catch {
    return String(x);
  }
}

export function logEvent(name, extra = {}, DEBUG = true) {
  if (!DEBUG) return;
  console.log(`
🧪 [RICH-EDITOR] ${name}`);
  console.log("extra   :", j(extra));
}
