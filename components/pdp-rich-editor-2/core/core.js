// components/pdp-rich-editor/core.js
import { normalizeTable } from "../table/normalizeTable";
import { astToMathMLHTML } from "../math/renderMathML";

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

  const rgb = s.match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*[\d.]+)?\)$/i);
  if (rgb) {
    const toHex = (n) => Number(n).toString(16).padStart(2, "0");
    return `#${toHex(rgb[1])}${toHex(rgb[2])}${toHex(rgb[3])}`.toLowerCase();
  }

  const named = {
    black: "#111827",
    red: "#ef4444",
    orange: "#f59e0b",
    green: "#22c55e",
    blue: "#3b82f6",
    purple: "#a855f7",
    white: "#ffffff",
  };

  return named[s.toLowerCase()] || "";
}

function normalizeFontSize(size) {
  const s = String(size || "").trim().toLowerCase();
  if (!s) return "";

  if (/^\d+(?:\.\d+)?px$/.test(s)) return s;
  if (/^\d+(?:\.\d+)?$/.test(s)) return `${Math.round(Number(s))}px`;

  const pt = s.match(/^(\d+(?:\.\d+)?)pt$/);
  if (pt) return `${Math.round(Number(pt[1]) * 96 / 72)}px`;

  return "";
}

export const OBJECT_REPLACEMENT_CHAR = "\uFFFC";

export function isInlineEquation(node) {
  return Boolean(
    node &&
    typeof node === "object" &&
    node.type === "equation"
  );
}

export function inlineNodeIndexLength(node) {
  if (isInlineEquation(node)) return 1;
  return String(node?.text || "").length;
}

export function inlineContentToIndexText(content) {
  if (!Array.isArray(content)) return "";

  return content
    .map((node) =>
      isInlineEquation(node)
        ? OBJECT_REPLACEMENT_CHAR
        : String(node?.text || "")
    )
    .join("");
}

export function inlineContentToPlainText(content) {
  if (!Array.isArray(content)) return "";

  return content
    .map((node) =>
      isInlineEquation(node)
        ? String(node.source || "")
        : String(node?.text || "")
    )
    .join("");
}

export function blockToIndexText(block) {
  if (!block || typeof block !== "object") return "";

  if (block.type === "image" || block.type === "equation") {
    return OBJECT_REPLACEMENT_CHAR;
  }

  if (block.type === "table") {
    return (block.rows || [])
      .map((row) =>
        (row.cells || [])
          .map((cell) =>
            inlineContentToIndexText(cell.content)
          )
          .join("\t")
      )
      .join("\n");
  }

  return inlineContentToIndexText(block.content);
}

export function blockToPlainText(block) {
  if (!block || typeof block !== "object") return "";

  if (block.type === "image") {
    return [block.alt, block.caption]
      .filter(Boolean)
      .join(" ");
  }

  // Keeps compatibility with old documents.
  if (block.type === "equation") {
    return String(block.source || "");
  }

  if (block.type === "table") {
    return (block.rows || [])
      .map((row) =>
        (row.cells || [])
          .map((cell) =>
            inlineContentToPlainText(cell.content)
          )
          .join("\t")
      )
      .join("\n");
  }

  return inlineContentToPlainText(block.content);
}

export function marksKey(m) {
  if (!m || !m.type) return "";
  if (m.type === "a") return `a:${String(m.href || "")}`;
  if (m.type === "color") return `color:${String(m.value || "")}`;
  if (m.type === "background") return `background:${String(m.value || "")}`;
  if (m.type === "fontSize") return `fontSize:${String(m.value || "")}`;
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

    if (m.type === "background") {
      const val = normalizeColor(m.value);
      if (!val) continue;
      map.set(`background:${val}`, { type: "background", value: val });
      continue;
    }

    if (m.type === "fontSize") {
      const val = normalizeFontSize(m.value);
      if (!val) continue;
      map.set(`fontSize:${val}`, { type: "fontSize", value: val });
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

  for (const item of runs || []) {
    if (isInlineEquation(item)) {
      out.push({
        type: "equation",
        id: String(item.id || generateRandomId("eq")),
        display: "inline",
        source: String(item.source || ""),
        ast:
          item.ast && typeof item.ast === "object"
            ? item.ast
            : {
                type: "row",
                children: [],
              },
      });

      continue;
    }

    const run = {
      text: String(item?.text ?? ""),
      marks: Array.isArray(item?.marks)
        ? normalizeMarks(item.marks)
        : undefined,
    };

    const last = out[out.length - 1];

    if (
      last &&
      !isInlineEquation(last) &&
      sameMarks(last, run)
    ) {
      last.text += run.text;
    } else {
      out.push(run);
    }
  }

  const cleaned = out.filter(
    (item) =>
      isInlineEquation(item) ||
      String(item.text || "") !== ""
  );

  return cleaned.length ? cleaned : [{ text: "" }];
}

/** ---------- doc normalize ---------- */

const ALLOWED_BLOCKS = ["p", "h", "li", "table", "code", "image", "equation"];

function generateRandomId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeDoc(doc) {
  const d = doc && doc.type === "doc" ? cloneDoc(doc) : defaultDoc();

  if (!Array.isArray(d.content) || d.content.length === 0) {
    d.content = [{ type: "p", align: "left", indent: 0, content: [{ text: "" }] }];
  }

  for (const blk of d.content) {
    if (!ALLOWED_BLOCKS.includes(blk.type)) blk.type = "p";

    blk.align = normalizeAlign(blk.align);

    if (blk.type === "image") {
      blk.id = String(blk.id || generateRandomId("img"));
      blk.src = String(blk.src || "");
      blk.alt = String(blk.alt || "");
      blk.title = String(blk.title || "");
      blk.caption = String(blk.caption || "");

      blk.width = Number.isFinite(Number(blk.width))
        ? Math.max(80, Number(blk.width))
        : 600;

      blk.height = Number.isFinite(Number(blk.height))
        ? Math.max(40, Number(blk.height))
        : null;

      blk.align = ["left", "center", "right"].includes(blk.align)
        ? blk.align
        : "center";

      blk.wrap = ["inline", "break-text", "square-left", "square-right"].includes(blk.wrap)
        ? blk.wrap
        : "break-text";

      delete blk.content;
      delete blk.rows;
      delete blk.level;
      delete blk.list;
      continue;
    }

    if (blk.type === "equation") {
      blk.id = String(blk.id || generateRandomId("eq"));
      blk.display = blk.display === "inline" ? "inline" : "block";
      blk.source = String(blk.source || "");
      blk.ast =
        blk.ast && typeof blk.ast === "object"
          ? blk.ast
          : { type: "row", children: [] };

      delete blk.content;
      delete blk.rows;
      delete blk.level;
      delete blk.list;
      continue;
    }

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
      if (blk.type === "code") {
        blk.align = "left";
        blk.indent = 0;
      } else if (blk.type !== "table") {
        blk.indent = Number.isFinite(blk.indent) ? clamp(blk.indent, 0, 8) : 0;
      }
    }

    if (blk.type === "table") {
      const normalizedT = normalizeTable(blk);
      Object.assign(blk, normalizedT);
    } else {
      delete blk.rows;
      delete blk.theme;
      delete blk.headerColor;
      if (!Array.isArray(blk.content) || blk.content.length === 0) blk.content = [{ text: "" }];

      blk.content = mergeAdjacentRuns(
        blk.content.map((node) => {
          if (isInlineEquation(node)) {
            return {
              type: "equation",
              id: String(node.id || generateRandomId("eq")),
              display: "inline",
              source: String(node.source || ""),
              ast:
                node.ast && typeof node.ast === "object"
                  ? node.ast
                  : {
                      type: "row",
                      children: [],
                    },
            };
          }

          return {
            text:
              typeof node?.text === "string"
                ? node.text
                : "",
            marks: Array.isArray(node?.marks)
              ? normalizeMarks(node.marks)
              : undefined,
          };
        })
      );

      if (!blk.content.length) blk.content = [{ text: "" }];
    }
  }

  return d;
}

export function docToPlainText(doc) {
  const d = normalizeDoc(doc);
  return d.content.map((b) => blockToPlainText(b)).join("\n");
}

export function docToIndexedText(doc) {
  const d = normalizeDoc(doc);
  return d.content.map((b) => blockToIndexText(b)).join("\n");
}

/**
 * Absolute selection offsets (using blockToIndexText with '\n' between blocks)
 */
export function docToTextIndexMap(doc) {
  const d = normalizeDoc(doc);
  const starts = [];
  let idx = 0;

  for (let bi = 0; bi < d.content.length; bi++) {
    starts.push(idx);
    const b = d.content[bi];
    idx += blockToIndexText(b).length;
    if (bi !== d.content.length - 1) idx += 1; // newline
  }

  return { starts, total: idx };
}

export function splitDocAtTextOffset(doc, absOffset, isEnd = false) {
  const d = normalizeDoc(doc);
  const text = docToIndexedText(d);
  const max = text.length;

  let o = absOffset;
  if (o < 0) o = 0;
  if (o > max) o = max;

  const { starts } = docToTextIndexMap(d);

  let blockIndex = d.content.length - 1;
  for (let i = 0; i < starts.length; i++) {
    const s = starts[i];
    const nextStart = i === starts.length - 1 ? max + 1 : starts[i + 1];
    if (isEnd ? (o > s && o <= nextStart) : (o >= s && o < nextStart)) {
      blockIndex = i;
      break;
    }
  }

  const block = d.content[blockIndex];
  const blockLen = blockToIndexText(block).length;
  const rawInner = o - starts[blockIndex];
  const innerOffset = Math.max(0, Math.min(rawInner, blockLen));

  return { blockIndex, innerOffset };
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

  const wrapInline = (node) => {
    if (isInlineEquation(node)) {
      const display = node.display === "block" ? "block" : "inline";
      const mathHTML = astToMathMLHTML(node.ast);
      return `<span class="re-equation-block re-equation-block--${display}"><math xmlns="http://www.w3.org/1998/Math/MathML" display="${display}">${mathHTML}</math></span>`;
    }

    let html = escapeHtml(node.text ?? "");
    const marks = node.marks || [];

    const link = marks.find((m) => m.type === "a" && m.href);
    const color = marks.find((m) => m.type === "color" && m.value);
    const background = marks.find((m) => m.type === "background" && m.value);
    const fontSize = marks.find((m) => m.type === "fontSize" && m.value);
    const others = marks.filter((m) => m.type !== "a" && m.type !== "color" && m.type !== "background" && m.type !== "fontSize");

    for (const m of others) {
      if (m.type === "b") html = `<strong>${html}</strong>`;
      if (m.type === "i") html = `<em>${html}</em>`;
      if (m.type === "u") html = `<u>${html}</u>`;
      if (m.type === "s") html = `<s>${html}</s>`;
      if (m.type === "sup") html = `<sup>${html}</sup>`;
      if (m.type === "sub") html = `<sub>${html}</sub>`;
    }

    const inlineStyles = [];
    if (color?.value) inlineStyles.push(`color:${escapeAttr(color.value)}`);
    if (background?.value) inlineStyles.push(`background-color:${escapeAttr(background.value)}`);
    if (fontSize?.value) inlineStyles.push(`font-size:${escapeAttr(fontSize.value)}`);
    if (inlineStyles.length) html = `<span style="${inlineStyles.join(";")};">${html}</span>`;
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

    // image
    if (b.type === "image") {
      const align = ["left", "center", "right"].includes(b.align) ? b.align : "center";
      const width = Math.max(80, Number(b.width) || 600);
      blocks.push(
        `<figure class="re-image-block re-image-block--${align}"><img src="${escapeAttr(
          b.src
        )}" alt="${escapeAttr(b.alt || "")}" width="${width}"/>${
          b.caption ? `<figcaption>${escapeHtml(b.caption)}</figcaption>` : ""
        }</figure>`
      );
      i++;
      continue;
    }

    // equation
    if (b.type === "equation") {
      const display = b.display === "inline" ? "inline" : "block";
      const mathHTML = astToMathMLHTML(b.ast);
      blocks.push(
        `<div class="re-equation-block re-equation-block--${display}"><math xmlns="http://www.w3.org/1998/Math/MathML" display="${display}">${mathHTML}</math></div>`
      );
      i++;
      continue;
    }

    // table
    if (b.type === "table") {
      const theme = b.attrs?.theme || (b.theme === "plain" ? "plain" : "blue");
      const tableId = b.id || "";
      const rows = (b.rows || []).map((row, rIdx) => {
        const rowId = row.id || "";
        const cells = (row.cells || []).map((cell, cIdx) => {
          const cellId = cell.id || "";
          const tag = cell.type === "tableHeader" ? "th" : "td";
          const rowSpan = cell.attrs?.rowSpan || 1;
          const colSpan = cell.attrs?.colSpan || 1;
          const inner = (Array.isArray(cell.content) ? cell.content : []).map(wrapInline).join("") || "<br/>";

          const styles = [
            cell.attrs?.width ? `width:${escapeAttr(cell.attrs.width)}` : null,
            cell.attrs?.minWidth ? `min-width:${cell.attrs.minWidth}px` : null,
            cell.attrs?.textAlign ? `text-align:${escapeAttr(cell.attrs.textAlign)}` : null,
            cell.attrs?.verticalAlign ? `vertical-align:${escapeAttr(cell.attrs.verticalAlign)}` : null,
            cell.attrs?.backgroundColor ? `background-color:${escapeAttr(cell.attrs.backgroundColor)}` : null,
          ].filter(Boolean).join(";");

          return `<${tag} data-cell-id="${escapeAttr(cellId)}" data-row-index="${rIdx}" data-column-index="${cIdx}" rowspan="${rowSpan}" colspan="${colSpan}" style="${styles}">${inner}</${tag}>`;
        }).join("");
        return `<tr data-row-id="${escapeAttr(rowId)}">${cells}</tr>`;
      }).join("");
      blocks.push(`<table class="re-content-table" data-table-id="${escapeAttr(tableId)}" data-theme="${theme}"><tbody>${rows}</tbody></table>`);
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
        const inner = (Array.isArray(li.content) ? li.content : []).map(wrapInline).join("") || "<br/>";
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
    const inner = (Array.isArray(b.content) ? b.content : []).map(wrapInline).join("") || "<br/>";

    if (b.type === "h") {
      const lvl = [1, 2, 3].includes(b.level) ? b.level : 2;
      blocks.push(`<h${lvl} style="text-align:${align};${ml}">${inner}</h${lvl}>`);
    } else if (b.type === "code") {
      blocks.push(`<pre class="re-code-block">${inner}</pre>`);
    } else {
      blocks.push(`<p style="text-align:${align};${ml}">${inner}</p>`);
    }

    i++;
  }

  return blocks.join("");
}

