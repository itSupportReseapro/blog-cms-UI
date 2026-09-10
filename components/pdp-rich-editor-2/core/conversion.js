import { normalizeDoc, isInlineEquation } from "./core";
import { createId } from "../table/createTable";
import { astToMathMLHTML } from "../math/renderMathML";

/** ---------- HTML ESCAPING ---------- */

export function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function escapeAttr(s) {
  return escapeHtml(String(s));
}

export function normalizeHexColor(c) {
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

export function normalizeFontSize(size) {
  const s = String(size || "").trim().toLowerCase();
  if (!s) return "";
  if (/^\d+(?:\.\d+)?px$/.test(s)) return s;
  if (/^\d+(?:\.\d+)?$/.test(s)) return `${Math.round(Number(s))}px`;

  const pt = s.match(/^(\d+(?:\.\d+)?)pt$/);
  if (pt) return `${Math.round(Number(pt[1]) * 96 / 72)}px`;

  return "";
}

function hexToRgb(hex) {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return null;
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
}

function mixHex(base, other, ratio = 0.5) {
  const a = hexToRgb(base);
  const b = hexToRgb(other);
  if (!a || !b) return normalizeHexColor(base) || normalizeHexColor(other) || "";
  const t = Math.max(0, Math.min(1, ratio));
  const toHex = (n) => Math.round(n).toString(16).padStart(2, "0");
  return `#${toHex(a.r * (1 - t) + b.r * t)}${toHex(a.g * (1 - t) + b.g * t)}${toHex(a.b * (1 - t) + b.b * t)}`;
}

function pickReadableTextColor(bg) {
  const rgb = hexToRgb(bg);
  if (!rgb) return "#1e3a8a";
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.72 ? "#1e293b" : "#ffffff";
}

export function getTableHeaderPresentation(headerColor, theme = "blue") {
  const safeHeaderColor = normalizeHexColor(headerColor) || "#dbeafe";
  const safeTheme = theme === "plain" ? "plain" : "blue";
  const background = safeTheme === "plain"
    ? mixHex(safeHeaderColor, "#ffffff", 0.42)
    : mixHex(safeHeaderColor, "#ffffff", 0.14);
  return {
    headerColor: safeHeaderColor,
    background,
    textColor: pickReadableTextColor(background),
  };
}

/** ---------- MARKS WRAPPING ---------- */

export function marksWrap(html, marks) {
  const link = marks.find((m) => m.type === "a" && m.href);
  const color = marks.find((m) => m.type === "color" && m.value);
  const background = marks.find((m) => m.type === "background" && m.value);
  const fontSize = marks.find((m) => m.type === "fontSize" && m.value);
  const others = marks.filter((m) => m.type !== "a" && m.type !== "color" && m.type !== "background" && m.type !== "fontSize");

  let out = html;

  for (const m of others) {
    if (m.type === "b") out = `<strong>${out}</strong>`;
    if (m.type === "i") out = `<em>${out}</em>`;
    if (m.type === "u") out = `<u>${out}</u>`;
    if (m.type === "s") out = `<s>${out}</s>`;
    if (m.type === "sup") out = `<sup>${out}</sup>`;
    if (m.type === "sub") out = `<sub>${out}</sub>`;
  }

  const inlineStyles = [];
  if (color?.value) inlineStyles.push(`color:${escapeAttr(color.value)}`);
  if (background?.value) inlineStyles.push(`background-color:${escapeAttr(background.value)}`);
  if (fontSize?.value) inlineStyles.push(`font-size:${escapeAttr(fontSize.value)}`);
  if (inlineStyles.length) out = `<span style="${inlineStyles.join(";")};">${out}</span>`;
  if (link?.href) {
    out = `<a href="${escapeAttr(link.href)}" target="_blank" rel="noopener noreferrer">${out}</a>`;
  }
  return out;
}

/** ---------- DOC TO EDITABLE HTML ---------- */

export function docToEditableHTML(doc) {
  const d = normalizeDoc(doc);
  const INLINE_CARET_GUARD = "\uFEFF";

  const renderRunText = (text) => {
    const value = String(text ?? "");
    if (value === "") return "\u200B";

    return value
      .split("\n")
      .map((part) => escapeHtml(part === "" ? "\u200B" : part))
      .join("<br/>");
  };

  const inlineRuns = (runs) =>
    (runs || [])
      .map((node) => {
        if (isInlineEquation(node)) {
          const astJson = encodeURIComponent(
            JSON.stringify(
              node.ast || {
                type: "row",
                children: [],
              }
            )
          );

          const mathHTML = astToMathMLHTML(
            node.ast
          );

          return (
            `${INLINE_CARET_GUARD}` +
            `<span ` +
              `class="re-equation-block re-equation-block--inline" ` +
              `data-re-node="equation" ` +
              `data-id="${escapeAttr(node.id || "")}" ` +
              `data-display="inline" ` +
              `data-source="${escapeAttr(node.source || "")}" ` +
              `data-equation="${astJson}" ` +
              `contenteditable="false">` +
                `<math ` +
                  `xmlns="http://www.w3.org/1998/Math/MathML" ` +
                  `display="inline">` +
                  `${mathHTML}` +
                `</math>` +
            `</span>` +
            `${INLINE_CARET_GUARD}`
          );
        }

        const text = renderRunText(node.text);
        const marks = Array.isArray(node.marks)
          ? node.marks
          : [];

        return marksWrap(text, marks);
      })
      .join("");

  const blocks = [];
  let i = 0;

  while (i < d.content.length) {
    const b = d.content[i];

    if (b.type === "image") {
      const align = ["left", "center", "right"].includes(b.align) ? b.align : "center";
      const width = Math.max(80, Number(b.width) || 600);
      const wrap = b.wrap || "break-text";

      blocks.push(
        `<figure class="re-image-block re-image-block--${align}" data-re-node="image" data-id="${escapeAttr(
          b.id
        )}" data-src="${escapeAttr(b.src)}" data-alt="${escapeAttr(
          b.alt || ""
        )}" data-caption="${escapeAttr(b.caption || "")}" data-width="${width}" data-align="${align}" data-wrap="${escapeAttr(
          wrap
        )}" contenteditable="false"><img src="${escapeAttr(b.src)}" alt="${escapeAttr(
          b.alt || ""
        )}" width="${width}" draggable="false"/>${
          b.caption ? `<figcaption>${escapeHtml(b.caption)}</figcaption>` : ""
        }</figure>`
      );

      i++;
      continue;
    }

    if (b.type === "equation") {
      const display = b.display === "block" ? "block" : "inline";
      const astJson = encodeURIComponent(JSON.stringify(b.ast || { type: "row", children: [] }));
      const mathHTML = astToMathMLHTML(b.ast);

      blocks.push(
        `<span class="re-equation-block re-equation-block--${display}" data-re-node="equation" data-id="${escapeAttr(
          b.id
        )}" data-display="${display}" data-source="${escapeAttr(
          b.source || ""
        )}" data-equation="${astJson}" contenteditable="false"><math xmlns="http://www.w3.org/1998/Math/MathML" display="${display}">${mathHTML}</math></span>`
      );

      i++;
      continue;
    }

    if (b.type === "table") {
      const theme = b.attrs?.theme || (b.theme === "plain" ? "plain" : "blue");
      const tableId = b.id || createId("table");
      const rows = (b.rows || []).map((row, rIdx) => {
        const rowId = row.id || createId("row");
        const cells = (row.cells || []).map((cell, cIdx) => {
          const cellId = cell.id || createId("cell");
          const inner = inlineRuns(cell.content) || "<br/>";
          const tag = cell.type === "tableHeader" ? "th" : "td";
          const rowSpan = cell.attrs?.rowSpan || 1;
          const colSpan = cell.attrs?.colSpan || 1;

          const styles = [
            cell.attrs?.width ? `width:${escapeAttr(cell.attrs.width)}` : null,
            cell.attrs?.minWidth ? `min-width:${cell.attrs.minWidth}px` : null,
            cell.attrs?.textAlign ? `text-align:${escapeAttr(cell.attrs.textAlign)}` : null,
            cell.attrs?.verticalAlign ? `vertical-align:${escapeAttr(cell.attrs.verticalAlign)}` : null,
            cell.attrs?.backgroundColor ? `background-color:${escapeAttr(cell.attrs.backgroundColor)}` : null,
          ].filter(Boolean).join(";");

          return `<${tag} contentEditable="true" data-cell-id="${escapeAttr(cellId)}" data-row-index="${rIdx}" data-column-index="${cIdx}" rowspan="${rowSpan}" colspan="${colSpan}" style="${styles}">${inner}</${tag}>`;
        }).join("");
        return `<tr data-row-id="${escapeAttr(rowId)}">${cells}</tr>`;
      }).join("");
      blocks.push(`<table class="re-content-table" data-table-id="${escapeAttr(tableId)}" data-theme="${theme}"><tbody>${rows}</tbody></table>`);
      i++;
      continue;
    }

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
        const inner = inlineRuns(li.content) || "<br/>";
        items.push(`<li style="text-align:${align};${ml}">${inner}</li>`);
        j++;
      }

      blocks.push(`<${listType}>${items.join("")}</${listType}>`);
      i = j;
      continue;
    }

    const align = b.align || "left";
    const indent = Number.isFinite(b.indent) ? b.indent : 0;
    const ml = indent ? `margin-left:${indent * 24}px;` : "";
    const inner = inlineRuns(b.content) || "<br/>";

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

/** ---------- EDITABLE HTML TO DOC ---------- */

export function htmlToDoc(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html || "", "text/html");
  const body = doc.body;

  const blocks = [];

  const walkInline = (node, activeMarks = []) => {
    const out = [];

    if (node.nodeType === Node.TEXT_NODE) {
      const raw = node.nodeValue || "";
      const cleaned = raw.replace(/[\u200B\uFEFF]/g, "");
      out.push({
        text: cleaned,
        marks: activeMarks.length ? activeMarks.map((m) => ({ ...m })) : undefined,
      });
      return out;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return out;

    if (node.getAttribute("data-re-node") === "equation") {
      let ast = { type: "row", children: [] };
      const rawAst = node.getAttribute("data-equation");
      if (rawAst) {
        try {
          ast = JSON.parse(decodeURIComponent(rawAst));
        } catch {}
      }

      out.push({
        type: "equation",
        id:
          node.getAttribute("data-id") ||
          (typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `eq_${Math.random().toString(36).slice(2, 9)}`),
        display: "inline",
        source: node.getAttribute("data-source") || "",
        ast,
      });

      return out;
    }

    const tag = node.tagName.toLowerCase();
    let nextMarks = activeMarks;

    const styleColor = normalizeHexColor(node.style?.color || "");
    if (styleColor) nextMarks = [...nextMarks, { type: "color", value: styleColor }];

    const styleBackground = normalizeHexColor(node.style?.backgroundColor || "");
    if (styleBackground) nextMarks = [...nextMarks, { type: "background", value: styleBackground }];

    const styleFontSize = normalizeFontSize(node.style?.fontSize || "");
    if (styleFontSize) nextMarks = [...nextMarks, { type: "fontSize", value: styleFontSize }];

    if (tag === "strong" || tag === "b") nextMarks = [...nextMarks, { type: "b" }];
    if (tag === "em" || tag === "i") nextMarks = [...nextMarks, { type: "i" }];
    if (tag === "u") nextMarks = [...nextMarks, { type: "u" }];
    if (tag === "s" || tag === "strike" || tag === "del") nextMarks = [...nextMarks, { type: "s" }];
    if (tag === "sup") nextMarks = [...nextMarks, { type: "sup" }];
    if (tag === "sub") nextMarks = [...nextMarks, { type: "sub" }];

    if (tag === "a") {
      const href = node.getAttribute("href") || "";
      if (href) nextMarks = [...nextMarks, { type: "a", href }];
    }

    if (tag === "br") {
      out.push({
        text: "\n",
        marks: activeMarks.length ? activeMarks.map((m) => ({ ...m })) : undefined,
      });
      return out;
    }

    for (const child of node.childNodes) out.push(...walkInline(child, nextMarks));
    return out;
  };

  const mergeRuns = (runs) => {
    const key = (marks) =>
      (marks || [])
        .map((m) =>
          m.type === "a"
            ? `a:${m.href || ""}`
            : m.type === "color"
              ? `color:${m.value || ""}`
              : m.type === "fontSize"
                ? `fontSize:${m.value || ""}`
                : m.type === "background"
                  ? `background:${m.value || ""}`
                  : m.type
        )
        .sort()
        .join("|");

    const cleaned = (runs || []).map((node) => {
      if (isInlineEquation(node)) {
        return {
          type: "equation",
          id: node.id,
          display: "inline",
          source: String(node.source || ""),
          ast:
            node.ast || {
              type: "row",
              children: [],
            },
        };
      }

      return {
        text:
          typeof node.text === "string"
            ? node.text
            : "",
        marks:
          Array.isArray(node.marks) &&
          node.marks.length
            ? node.marks
            : undefined,
      };
    });

    const out = [];

    for (const node of cleaned) {
      if (isInlineEquation(node)) {
        out.push(node);
        continue;
      }

      const last = out[out.length - 1];

      if (
        last &&
        !isInlineEquation(last) &&
        key(last.marks) === key(node.marks)
      ) {
        last.text += node.text;
      } else {
        out.push(node);
      }
    }

    const meaningful = out.filter(
      (node) =>
        isInlineEquation(node) ||
        String(node.text || "") !== ""
    );

    return meaningful.length
      ? meaningful
      : [{ text: "" }];
  };

  const pickAlign = (el) => {
    const a = (el.style?.textAlign || "").toLowerCase();
    if (a === "center" || a === "right" || a === "justify") return a;
    return "left";
  };

  const pickIndent = (el) => {
    const ml = (el.style?.marginLeft || "").toLowerCase().trim();
    const px = parseInt(ml.replace("px", ""), 10);
    if (!Number.isFinite(px) || px <= 0) return 0;
    return Math.round(px / 24);
  };

  const getPxAttr = (el, attr) => {
    const v = el.getAttribute(attr);
    if (!v) return null;
    const px = normalizeFontSize(v);
    return px ? parseInt(px, 10) : null;
  };

  const nodes = Array.from(body.childNodes || []);
  let inlineGroup = [];

  const flushInlineGroup = () => {
    if (!inlineGroup.length) return;
    const runs = mergeRuns(inlineGroup.flatMap((n) => walkInline(n)));
    const meaningful = runs.some(
      (r) => isInlineEquation(r) || String(r?.text || "").trim() !== ""
    );
    if (meaningful) {
      blocks.push({ type: "p", align: "left", indent: 0, content: runs });
    }
    inlineGroup = [];
  };

  for (const node of nodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      inlineGroup.push(node);
      continue;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();

      if (tag === "figure" && node.getAttribute("data-re-node") === "image") {
        flushInlineGroup();
        const img = node.querySelector("img");
        if (img?.getAttribute("src")) {
          blocks.push({
            type: "image",
            id: node.getAttribute("data-id") || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `img_${Math.random().toString(36).slice(2, 9)}`),
            src: img.getAttribute("src") || "",
            alt: img.getAttribute("alt") || node.getAttribute("data-alt") || "",
            caption: node.getAttribute("data-caption") || node.querySelector("figcaption")?.textContent || "",
            width: Number(node.getAttribute("data-width")) || Number(img.getAttribute("width")) || 600,
            height: null,
            align: node.getAttribute("data-align") || "center",
            wrap: node.getAttribute("data-wrap") || "break-text",
          });
        }
        continue;
      }

      if (tag === "table") {
        flushInlineGroup();
        const tableId = node.getAttribute("data-table-id") || createId("table");
        const theme = node.getAttribute("data-theme") === "plain" ? "plain" : "blue";

        const rows = [];
        const tableRows = Array.from(node.querySelectorAll(":scope > tbody > tr, :scope > tr"));
        for (const tr of tableRows) {
          const rowId = tr.getAttribute("data-row-id") || createId("row");
          const cells = [];
          const tds = Array.from(tr.querySelectorAll(":scope > td, :scope > th"));
          for (const td of tds) {
            const cellId = td.getAttribute("data-cell-id") || createId("cell");
            const runs = mergeRuns(walkInline(td));
            const cellType = td.tagName.toLowerCase() === "th" ? "tableHeader" : "tableCell";
            const rowSpan = Math.max(1, parseInt(td.getAttribute("rowspan") || "1", 10));
            const colSpan = Math.max(1, parseInt(td.getAttribute("colspan") || "1", 10));

            cells.push({
              id: cellId,
              type: cellType,
              attrs: {
                rowSpan,
                colSpan,
                width: td.style?.width || null,
                minWidth: getPxAttr(td, "data-min-width") || (td.style?.minWidth ? parseInt(td.style.minWidth, 10) : null),
                textAlign: td.style?.textAlign || null,
                verticalAlign: td.style?.verticalAlign || null,
                backgroundColor: normalizeHexColor(td.style?.backgroundColor) || null,
              },
              content: runs,
            });
          }
          rows.push({ id: rowId, type: "tableRow", attrs: { minHeight: null }, cells });
        }

        if (rows.length > 0 && rows[0].cells.length > 0) {
          blocks.push({
            id: tableId,
            type: "table",
            attrs: { width: "100%", alignment: "left", layout: "fixed", theme, caption: "", headerRows: 1, headerColumns: 0 },
            rows,
          });
        }
        continue;
      }

      if (tag === "p" || tag === "h1" || tag === "h2" || tag === "h3" || tag === "pre" || tag === "ul" || tag === "ol") {
        flushInlineGroup();

        if (tag === "ul" || tag === "ol") {
          const listType = tag === "ol" ? "ol" : "ul";
          const lis = Array.from(node.querySelectorAll(":scope > li"));
          for (const li of lis) {
            const align = pickAlign(li);
            const indent = pickIndent(li);
            const runs = mergeRuns(walkInline(li));
            blocks.push({ type: "li", list: listType, align, indent, content: runs });
          }
          continue;
        }

        const align = pickAlign(node);
        const indent = pickIndent(node);
        const runs = mergeRuns(walkInline(node));

        if (tag === "h1") blocks.push({ type: "h", level: 1, align, indent, content: runs });
        else if (tag === "h2") blocks.push({ type: "h", level: 2, align, indent, content: runs });
        else if (tag === "h3") blocks.push({ type: "h", level: 3, align, indent, content: runs });
        else if (tag === "pre") blocks.push({ type: "code", align: "left", indent: 0, content: runs });
        else blocks.push({ type: "p", align, indent, content: runs });
        continue;
      }

      // Inline elements (span, equation spans, a, b, i, etc.) at top-level
      inlineGroup.push(node);
    }
  }

  flushInlineGroup();

  return normalizeDoc({
    type: "doc",
    content: blocks.length ? blocks : [{ type: "p", align: "left", indent: 0, content: [{ text: "" }] }],
  });
}
