import { normalizeDoc, docToPlainText } from "./core";

export function findContainingBlock(rootEl, node) {
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

export function getLinkHrefInRange(doc, selection) {
  const d = normalizeDoc(doc);

  const a = Number.isFinite(selection?.from) ? selection.from : 0;
  const b = Number.isFinite(selection?.to) ? selection.to : 0;
  const from = Math.max(0, Math.min(a, b));
  const to = Math.max(0, Math.max(a, b));
  if (from === to) return "";

  let abs = 0;

  for (let bi = 0; bi < d.content.length; bi++) {
    const blk = d.content[bi];

    for (const run of blk.content) {
      const runStart = abs;
      const runEnd = abs + (run.text?.length || 0);

      const overlapA = Math.max(from, runStart);
      const overlapB = Math.min(to, runEnd);

      if (overlapB > overlapA) {
        const href = (run.marks || []).find((m) => m.type === "a" && m.href)?.href;
        if (href) return href;
      }

      abs = runEnd;
    }

    if (bi !== d.content.length - 1) abs += 1;
  }

  return "";
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
  console.log(`\n🧪 [RICH-EDITOR] ${name}`);
  console.log("extra   :", j(extra));
}
