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
  return "";
}

/** ---------- MARKS WRAPPING ---------- */

export function marksWrap(html, marks) {
  const link = marks.find((m) => m.type === "a" && m.href);
  const color = marks.find((m) => m.type === "color" && m.value);
  const others = marks.filter((m) => m.type !== "a" && m.type !== "color");

  let out = html;

  for (const m of others) {
    if (m.type === "b") out = `<strong>${out}</strong>`;
    if (m.type === "i") out = `<em>${out}</em>`;
    if (m.type === "u") out = `<u>${out}</u>`;
    if (m.type === "s") out = `<s>${out}</s>`;
    if (m.type === "sup") out = `<sup>${out}</sup>`;
    if (m.type === "sub") out = `<sub>${out}</sub>`;
  }

  if (color?.value) out = `<span style="color:${escapeAttr(color.value)};">${out}</span>`;
  if (link?.href) {
    out = `<a href="${escapeAttr(link.href)}" target="_blank" rel="noopener noreferrer">${out}</a>`;
  }
  return out;
}

/** ---------- DOC TO EDITABLE HTML ---------- */

export function docToEditableHTML(doc) {
  const d = normalizeDoc(doc);

  const inlineRuns = (runs) =>
    (runs || [])
      .map((r) => {
        const text = escapeHtml(r.text ?? "");
        const marks = Array.isArray(r.marks) ? r.marks : [];
        // ZWSP keeps caret alive, selection-dom ignores it
        return marksWrap(text === "" ? "\u200B" : text, marks);
      })
      .join("");

  const blocks = [];
  let i = 0;

  while (i < d.content.length) {
    const b = d.content[i];

    if (b.type === "table") {
      const rows = (b.rows || []).map((row) => {
        const cells = (row.cells || []).map((cell) => {
          const inner = inlineRuns(cell.content) || "<br/>";
          return `<td contentEditable="true" style="border: 1px solid #ccc; padding: 8px; min-width: 50px;">${inner}</td>`;
        }).join("");
        return `<tr>${cells}</tr>`;
      }).join("");
      blocks.push(`<table style="border-collapse: collapse; width: 100%; border: 1px solid #ccc;"><tbody>${rows}</tbody></table>`);
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
          m.type === "a" ? `a:${m.href || ""}` : m.type === "color" ? `color:${m.value || ""}` : m.type
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
        blocks.push({ type: "table", rows });
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
    else blocks.push({ type: "p", align, indent, content: runs });
  }

  return normalizeDoc({
    type: "doc",
    content: blocks.length ? blocks : [{ type: "p", align: "left", indent: 0, content: [{ text: "" }] }],
  });
}
