import { normalizeDoc } from "./core";

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
      .map((r) => {
        const text = renderRunText(r.text);
        const marks = Array.isArray(r.marks) ? r.marks : [];
        // ZWSP keeps caret alive, selection-dom ignores it
        return marksWrap(text, marks);
      })
      .join("");

  const blocks = [];
  let i = 0;

  while (i < d.content.length) {
    const b = d.content[i];

    if (b.type === "table") {
      const theme = b.theme === "plain" ? "plain" : "blue";
      const header = getTableHeaderPresentation(b.headerColor || "#dbeafe", theme);
      const rows = (b.rows || []).map((row, rowIndex) => {
        const cells = (row.cells || []).map((cell) => {
          const inner = inlineRuns(cell.content) || "<br/>";
          const tag = rowIndex === 0 ? "th" : "td";
          const headerStyle = rowIndex === 0
            ? ` style="background-color:${escapeAttr(header.background)};color:${escapeAttr(header.textColor)};font-weight:600;"`
            : "";
          return `<${tag} contentEditable="true"${headerStyle}>${inner}</${tag}>`;
        }).join("");
        return `<tr>${cells}</tr>`;
      }).join("");
      blocks.push(`<table class="re-content-table" data-theme="${theme}" data-header-color="${header.headerColor}" style="--re-table-header-bg:${header.headerColor};"><tbody>${rows}</tbody></table>`);
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
      blocks.push(`<pre class="re-code-block"><code>${inner}</code></pre>`);
    } else {
      blocks.push(`<p style="text-align:${align};${ml}">${inner}</p>`);
    }

    i++;
  }

  return blocks.join("");
}

/** ---------- HTML TO DOC ---------- */

export function htmlToDoc(html) {
  const parser = new DOMParser();
  const dom = parser.parseFromString(html, "text/html");
  const body = dom.body;

  const blocks = [];

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

  const walkInline = (node, activeMarks = []) => {
    const out = [];

    if (node.nodeType === Node.TEXT_NODE) {
      const raw = node.nodeValue || "";
      const cleaned = raw.replace(/[\u200B\u00A0]/g, "");
      out.push({
        text: cleaned,
        marks: activeMarks.length ? activeMarks.map((m) => ({ ...m })) : undefined,
      });
      return out;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return out;

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

    const cleaned = runs.map((r) => ({
      text: typeof r.text === "string" ? r.text : "",
      marks: Array.isArray(r.marks) && r.marks.length ? r.marks : undefined,
    }));

    if (!cleaned.length) return [{ text: "" }];

    const out = [cleaned[0]];
    for (let i = 1; i < cleaned.length; i++) {
      const last = out[out.length - 1];
      const cur = cleaned[i];
      if (key(last.marks) === key(cur.marks)) last.text += cur.text;
      else out.push(cur);
    }

    if (out.every((x) => x.text === "")) return [{ text: "" }];
    return out;
  };

  const children = Array.from(body.children || []);

  if (!children.length) {
    const runs = mergeRuns(walkInline(body));
    return normalizeDoc({ type: "doc", content: [{ type: "p", align: "left", indent: 0, content: runs }] });
  }

  for (const el of children) {
    const tag = el.tagName.toLowerCase();

    if (tag === "table") {
      const rows = [];
      const theme = el.getAttribute("data-theme") === "plain" ? "plain" : "blue";
      const firstHeaderCell = el.querySelector("tbody tr:first-child th, tbody tr:first-child td, tr:first-child th, tr:first-child td");
      const headerColor = normalizeHexColor(
        el.getAttribute("data-header-color") ||
        el.style.getPropertyValue("--re-table-header-bg") ||
        firstHeaderCell?.style?.backgroundColor ||
        ""
      ) || "#dbeafe";
      const tableRows = Array.from(el.querySelectorAll("tbody tr, tr"));
      for (const tr of tableRows) {
        const cells = [];
        const tds = Array.from(tr.querySelectorAll("td, th"));
        for (const td of tds) {
          const runs = mergeRuns(walkInline(td));
          cells.push({ content: runs });
        }
        rows.push({ cells });
      }
      if (rows.length > 0 && rows[0].cells.length > 0) {
        blocks.push({ type: "table", theme, headerColor, rows });
      }
      continue;
    }

    if (tag === "ul" || tag === "ol") {
      const listType = tag === "ol" ? "ol" : "ul";
      const lis = Array.from(el.querySelectorAll(":scope > li"));
      for (const li of lis) {
        const align = pickAlign(li);
        const indent = pickIndent(li);
        const runs = mergeRuns(walkInline(li));
        blocks.push({ type: "li", list: listType, align, indent, content: runs });
      }
      continue;
    }

    const align = pickAlign(el);
    const indent = pickIndent(el);
    const runs = mergeRuns(walkInline(el));

    if (tag === "h1") blocks.push({ type: "h", level: 1, align, indent, content: runs });
    else if (tag === "h2") blocks.push({ type: "h", level: 2, align, indent, content: runs });
    else if (tag === "h3") blocks.push({ type: "h", level: 3, align, indent, content: runs });
    else if (tag === "pre") blocks.push({ type: "code", align: "left", indent: 0, content: runs });
    else blocks.push({ type: "p", align, indent, content: runs });
  }

  return normalizeDoc({
    type: "doc",
    content: blocks.length ? blocks : [{ type: "p", align: "left", indent: 0, content: [{ text: "" }] }],
  });
}
