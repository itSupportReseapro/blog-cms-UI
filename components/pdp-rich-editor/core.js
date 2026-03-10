// components/pdp-rich-editor/core.js

export function defaultDoc() {
  return {
    type: "doc",
    content: [{ type: "p", align: "left", indent: 0, content: [{ text: "" }] }],
  };
}

export function cloneDoc(doc) {
  return JSON.parse(JSON.stringify(doc || defaultDoc()));
}

export function ensureSelection(sel) {
  const s = sel && typeof sel === "object" ? sel : { from: 0, to: 0 };
  let from = Number.isFinite(s.from) ? s.from : 0;
  let to = Number.isFinite(s.to) ? s.to : from;
  if (from > to) [from, to] = [to, from];
  return { from, to };
}

/** ---------- helpers ---------- */

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function normalizeAlign(a) {
  const x = String(a || "left").toLowerCase();
  if (x === "center" || x === "right" || x === "justify") return x;
  return "left";
}

function normalizeColor(c) {
  const s = String(c || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(s)) return s.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(s)) {
    const r = s[1], g = s[2], b = s[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return "";
}

export function marksKey(m) {
  if (!m || !m.type) return "";
  if (m.type === "a") return `a:${String(m.href || "")}`;
  if (m.type === "color") return `color:${String(m.value || "")}`;
  return String(m.type);
}

export function normalizeMarks(marks) {
  if (!Array.isArray(marks) || !marks.length) return undefined;

  // Dedup by marksKey (NOT by type)
  const map = new Map();

  for (const m of marks) {
    if (!m || !m.type) continue;

    if (
      m.type === "b" ||
      m.type === "i" ||
      m.type === "u" ||
      m.type === "sup" ||
      m.type === "sub" ||
      m.type === "s"
    ) {
      map.set(m.type, { type: m.type });
      continue;
    }

    if (m.type === "a") {
      const href = typeof m.href === "string" ? m.href.trim() : "";
      if (!href) continue;
      map.set(`a:${href}`, { type: "a", href });
      continue;
    }

    if (m.type === "color") {
      const val = normalizeColor(m.value);
      if (!val) continue;
      map.set(`color:${val}`, { type: "color", value: val });
      continue;
    }
  }

  const out = [...map.values()].sort((a, b) => marksKey(a).localeCompare(marksKey(b)));
  return out.length ? out : undefined;
}

function sameMarks(a, b) {
  const am = a.marks || [];
  const bm = b.marks || [];
  if (am.length !== bm.length) return false;
  const norm = (arr) => arr.map(marksKey).sort().join("|");
  return norm(am) === norm(bm);
}

/**
 * IMPORTANT:
 * - Merge adjacent runs first.
 * - Then remove empty runs (stable mark boundaries).
 */
export function mergeAdjacentRuns(runs) {
  const out = [];

  for (const r of runs || []) {
    const run = {
      text: String(r?.text ?? ""),
      marks: Array.isArray(r?.marks) ? normalizeMarks(r.marks) : undefined,
    };

    if (!out.length) out.push(run);
    else {
      const last = out[out.length - 1];
      if (sameMarks(last, run)) last.text += run.text;
      else out.push(run);
    }
  }

  const cleaned = out.filter((r) => String(r.text || "") !== "");
  return cleaned.length ? cleaned : [{ text: "" }];
}

/** ---------- doc normalize ---------- */

export function normalizeDoc(doc) {
  const d = doc && doc.type === "doc" ? cloneDoc(doc) : defaultDoc();

  if (!Array.isArray(d.content) || d.content.length === 0) {
    d.content = [{ type: "p", align: "left", indent: 0, content: [{ text: "" }] }];
  }

  for (const blk of d.content) {
    if (!["p", "h", "li", "table"].includes(blk.type)) blk.type = "p";

    blk.align = normalizeAlign(blk.align);

    if (blk.type === "h") {
      if (![1, 2, 3].includes(blk.level)) blk.level = 2;
    } else {
      delete blk.level;
    }

    if (blk.type === "li") {
      blk.list = blk.list === "ol" ? "ol" : "ul";
      blk.indent = Number.isFinite(blk.indent) ? clamp(blk.indent, 0, 8) : 0;
    } else {
      delete blk.list;
      if (blk.type !== "table") {
        blk.indent = Number.isFinite(blk.indent) ? clamp(blk.indent, 0, 8) : 0;
      }
    }

    if (blk.type === "table") {
      // Normalize table structure
      blk.rows = Array.isArray(blk.rows) ? blk.rows : [];
      if (blk.rows.length === 0) {
        blk.rows = [
          { cells: [{ content: [{ text: "" }] }, { content: [{ text: "" }] }] },
          { cells: [{ content: [{ text: "" }] }, { content: [{ text: "" }] }] },
        ];
      }
      for (const row of blk.rows) {
        row.cells = Array.isArray(row.cells) ? row.cells : [];
        for (const cell of row.cells) {
          if (!Array.isArray(cell.content) || cell.content.length === 0) cell.content = [{ text: "" }];
          cell.content = mergeAdjacentRuns(
            cell.content.map((run) => ({
              text: typeof run?.text === "string" ? run.text : "",
              marks: Array.isArray(run?.marks) ? normalizeMarks(run.marks) : undefined,
            }))
          );
          if (!cell.content.length) cell.content = [{ text: "" }];
        }
      }
    } else {
      delete blk.rows;
      if (!Array.isArray(blk.content) || blk.content.length === 0) blk.content = [{ text: "" }];

      blk.content = mergeAdjacentRuns(
        blk.content.map((run) => ({
          text: typeof run?.text === "string" ? run.text : "",
          marks: Array.isArray(run?.marks) ? normalizeMarks(run.marks) : undefined,
        }))
      );

      if (!blk.content.length) blk.content = [{ text: "" }];
    }
  }

  return d;
}

export function docToPlainText(doc) {
  const d = normalizeDoc(doc);
  return d.content.map((b) => {
    if (b.type === "table") {
      return b.rows.map((row) => row.cells.map((cell) => cell.content.map((r) => r.text).join("")).join("\t")).join("\n");
    }
    return b.content.map((r) => r.text).join("");
  }).join("\n");
}

/** ---------- HTML ---------- */

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function escapeAttr(s) {
  return escapeHtml(String(s));
}

export function docToHTML(doc) {
  const d = normalizeDoc(doc);

  const wrapInline = (run) => {
    let html = escapeHtml(run.text ?? "");
    const marks = run.marks || [];

    const link = marks.find((m) => m.type === "a" && m.href);
    const color = marks.find((m) => m.type === "color" && m.value);
    const others = marks.filter((m) => m.type !== "a" && m.type !== "color");

    for (const m of others) {
      if (m.type === "b") html = `<strong>${html}</strong>`;
      if (m.type === "i") html = `<em>${html}</em>`;
      if (m.type === "u") html = `<u>${html}</u>`;
      if (m.type === "s") html = `<s>${html}</s>`;
      if (m.type === "sup") html = `<sup>${html}</sup>`;
      if (m.type === "sub") html = `<sub>${html}</sub>`;
    }

    if (color?.value) html = `<span style="color:${escapeAttr(color.value)};">${html}</span>`;
    if (link?.href) {
      html = `<a href="${escapeAttr(
        link.href
      )}" target="_blank" rel="noopener noreferrer">${html}</a>`;
    }

    return html;
  };

  const blocks = [];
  let i = 0;

  while (i < d.content.length) {
    const b = d.content[i];

    // table
    if (b.type === "table") {
      const rows = (b.rows || []).map((row) => {
        const cells = (row.cells || []).map((cell) => {
          const inner = cell.content.map(wrapInline).join("") || "<br/>";
          return `<td style="border: 1px solid #ccc; padding: 8px;">${inner}</td>`;
        }).join("");
        return `<tr>${cells}</tr>`;
      }).join("");
      blocks.push(`<table style="border-collapse: collapse; width: 100%; border: 1px solid #ccc;"><tbody>${rows}</tbody></table>`);
      i++;
      continue;
    }

    // list group
    if (b.type === "li") {
      const listType = b.list === "ol" ? "ol" : "ul";
      const items = [];
      let j = i;

      while (
        j < d.content.length &&
        d.content[j].type === "li" &&
        (d.content[j].list === "ol" ? "ol" : "ul") === listType
      ) {
        const li = d.content[j];
        const align = li.align || "left";
        const indent = Number.isFinite(li.indent) ? li.indent : 0;
        const ml = indent ? `margin-left:${indent * 24}px;` : "";
        const inner = li.content.map(wrapInline).join("") || "<br/>";
        items.push(`<li style="text-align:${align};${ml}">${inner}</li>`);
        j++;
      }

      blocks.push(`<${listType}>${items.join("")}</${listType}>`);
      i = j;
      continue;
    }

    // paragraph / heading
    const align = b.align || "left";
    const indent = Number.isFinite(b.indent) ? b.indent : 0;
    const ml = indent ? `margin-left:${indent * 24}px;` : "";
    const inner = b.content.map(wrapInline).join("") || "<br/>";

    if (b.type === "h") {
      const lvl = [1, 2, 3].includes(b.level) ? b.level : 2;
      blocks.push(`<h${lvl} style="text-align:${align};${ml}">${inner}</h${lvl}>`);
    } else {
      blocks.push(`<p style="text-align:${align};${ml}">${inner}</p>`);
    }

    i++;
  }

  return blocks.join("");
}

/**
 * Absolute selection offsets (plain text with '\n' between blocks)
 */
export function docToTextIndexMap(doc) {
  const d = normalizeDoc(doc);
  const starts = [];
  let idx = 0;

  for (let bi = 0; bi < d.content.length; bi++) {
    starts.push(idx);
    const b = d.content[bi];
    let len = 0;
    if (b.type === "table") {
      len = b.rows.reduce((acc, row) => {
        return acc + row.cells.reduce((cellAcc, cell) => {
          return cellAcc + cell.content.reduce((a, r) => a + (r.text?.length || 0), 0);
        }, 0);
      }, 0);
    } else {
      len = b.content.reduce((a, r) => a + (r.text?.length || 0), 0);
    }
    idx += len;
    if (bi !== d.content.length - 1) idx += 1; // newline
  }

  return { starts, total: idx };
}

export function splitDocAtTextOffset(doc, absOffset) {
  const d = normalizeDoc(doc);
  const text = docToPlainText(d);
  const max = text.length;

  let o = absOffset;
  if (o < 0) o = 0;
  if (o > max) o = max;

  const { starts } = docToTextIndexMap(d);

  let blockIndex = d.content.length - 1;
  for (let i = 0; i < starts.length; i++) {
    const s = starts[i];
    const e = i === starts.length - 1 ? max : starts[i + 1] - 1; // exclude newline
    if (o >= s && o <= e) {
      blockIndex = i;
      break;
    }
  }

  const innerOffset = o - starts[blockIndex];
  return { blockIndex, innerOffset };
}