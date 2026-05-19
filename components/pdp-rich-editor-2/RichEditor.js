// components/pdp-rich-editor-2/RichEditor.js
"use client";
import "./RichEditor.css";
import React, { useEffect, useRef, useState } from "react";
import { defaultDoc, docToPlainText } from "./core";
import { setSelectionOffsets, getRangeRectSafe } from "./selection-dom";

import {
  indentBlock,
  toggleInlineMark,
  setBlockType,
  toggleList,
  setLink,
  unsetLink,
  setAlign,
  setColor,
  setHighlight,
  setFontSize,
  insertTable,
} from "./commands";

import { docToEditableHTML, htmlToDoc, getTableHeaderPresentation } from "./conversion";
import { findContainingBlock, getLinkHrefInRange, getLinkRangeAtPos } from "./helpers";

import useRichEditorState from "./useRichEditorState";
import useRichEditorHistory from "./useRichEditorHistory";
import useRichEditorUI from "./useRichEditorUI";

import Toolbar from "./Toolbar";
import LinkModal from "./LinkModal";
import TablePopup from "./TablePopup";
import Editor from "./Editor";
import EditorFooter from "./EditorFooter";

function countWords(doc) {
  const plainText = docToPlainText(doc);
  return plainText
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

function rgbToHex(value, fallback = "#111827") {
  const s = String(value || "").trim();
  if (!s || s === "transparent" || /^rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)$/i.test(s)) return fallback;
  if (/^#[0-9a-f]{6}$/i.test(s)) return s.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(s)) {
    return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`.toLowerCase();
  }

  const match = s.match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (!match) return fallback;
  const toHex = (n) => Number(n).toString(16).padStart(2, "0");
  return `#${toHex(match[1])}${toHex(match[2])}${toHex(match[3])}`.toLowerCase();
}

function normalizePx(value, fallback = "16px") {
  const s = String(value || "").trim().toLowerCase();
  if (/^\d+(?:\.\d+)?px$/.test(s)) return `${Math.round(parseFloat(s))}px`;
  if (/^\d+(?:\.\d+)?$/.test(s)) return `${Math.round(parseFloat(s))}px`;
  return fallback;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/** ---------- MAIN COMPONENT ---------- */

export default function RichEditor({
  value,
  onChange,
  onHTMLChange,
  placeholder = "Write...",
  disabled = false,
  showFooter = true,
  className,
  style,
}) {
  const emptyActiveMarks = {
    b: false,
    i: false,
    u: false,
    s: false,
    sub: false,
    sup: false,
    a: false,
  };
  const NONE_VALUE = "__none__";

  const editorState = useRichEditorState(value);
  const history = useRichEditorHistory();
  const ui = useRichEditorUI();

  const { rootRef, wrapRef, docRef, selectionRef, selectionSnapshotRef } = editorState;
  const { lastHistoryAtRef, pushHistory } = history;
  const { linkInputRef, tableRowsInputRef, tableColsInputRef } = ui;
  const { setLinkUI, setTableUI } = ui;

  const hoveredTableRef = useRef(null);
  const tableHoverCloseTimerRef = useRef(null);
  const [tableHoverUI, setTableHoverUI] = useState({
    open: false,
    rowIndex: 0,
    colIndex: 0,
    topX: 0,
    topY: 0,
    leftX: 0,
    leftY: 0,
    isHeader: false,
  });
  const [tableMenuOpen, setTableMenuOpen] = useState({ top: false, left: false });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    el.innerHTML = docToEditableHTML(docRef.current);
    Array.from(el.querySelectorAll("table")).forEach((table) => applyTableHeaderPresentation(table));
  }, []);

  useEffect(() => {
    ui.setWordCount(countWords(editorState.doc));
  }, [editorState.doc]);

  useEffect(() => {
    if (ui.linkUI.open) {
      setTimeout(() => linkInputRef.current?.focus(), 0);
    }
  }, [ui.linkUI.open, linkInputRef]);

  useEffect(() => {
    if (ui.tableUI.open) {
      setTimeout(() => tableRowsInputRef.current?.focus(), 0);
    }
  }, [ui.tableUI.open, tableRowsInputRef]);

  useEffect(() => {
    const onDocMouseDown = (event) => {
      const wrap = wrapRef.current;
      if (!wrap?.contains(event.target)) {
        setLinkUI((prev) => ({ ...prev, open: false }));
        setTableUI((prev) => ({ ...prev, open: false }));
        setTableMenuOpen({ top: false, left: false });
      } else if (!event.target?.closest?.(".re-table-plus-wrap") && !event.target?.closest?.(".re-table-action-menu")) {
        setTableMenuOpen({ top: false, left: false });
      }
    };

    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [setLinkUI, setTableUI, wrapRef]);

  const emitDoc = (nextDoc) => editorState.emitDoc(nextDoc, onChange, onHTMLChange);

  const applyTableHeaderPresentation = (table) => {
    if (!table) return;
    const theme = table.getAttribute("data-theme") === "plain" ? "plain" : "blue";
    const headerColor = rgbToHex(table.getAttribute("data-header-color") || table.style.getPropertyValue("--re-table-header-bg") || "#dbeafe", "#dbeafe");
    const header = getTableHeaderPresentation(headerColor, theme);
    table.setAttribute("data-header-color", header.headerColor);
    table.style.setProperty("--re-table-header-bg", header.headerColor);

    const rows = Array.from(table.rows || []);
    rows.forEach((row, rowIndex) => {
      Array.from(row.cells || []).forEach((cell) => {
        if (rowIndex === 0) {
          cell.style.backgroundColor = header.background;
          cell.style.color = header.textColor;
          cell.style.fontWeight = "600";
        } else {
          cell.style.removeProperty("background-color");
          cell.style.removeProperty("color");
          cell.style.removeProperty("font-weight");
        }
      });
    });
  };

  const insertPlainTextAtSelection = (text) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const node = document.createTextNode(String(text || ""));
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  };

  const getActiveCodeElement = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const node = selection.anchorNode?.nodeType === Node.ELEMENT_NODE
      ? selection.anchorNode
      : selection.anchorNode?.parentElement;
    return node?.closest?.("pre, code") || null;
  };

  const syncTableUIFromCell = (cell, table) => {
    const wrap = wrapRef.current;
    const root = rootRef.current;
    if (!wrap || !root || !cell || !table || !root.contains(table)) return;

    const rowEl = cell.parentElement;
    const rows = Array.from(table.rows || []);
    const rowIndex = Math.max(0, rows.indexOf(rowEl));
    const colIndex = Math.max(0, Array.from(rowEl?.children || []).indexOf(cell));
    const wrapRect = wrap.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();
    const tableRect = table.getBoundingClientRect();

    hoveredTableRef.current = table;
    setTableHoverUI({
      open: true,
      rowIndex,
      colIndex,
      topX: clamp(cellRect.left - wrapRect.left + (cellRect.width / 2), 16, Math.max(16, wrapRect.width - 16)),
      topY: Math.max(12, tableRect.top - wrapRect.top),
      leftX: Math.max(12, tableRect.left - wrapRect.left),
      leftY: clamp(cellRect.top - wrapRect.top + (cellRect.height / 2), 16, Math.max(16, wrapRect.height - 16)),
      isHeader: rowIndex === 0 || cell.tagName?.toLowerCase() === "th",
    });
  };

  const getPopupPositionFromRect = (rect, preferred = "bottom") => {
    const wrap = wrapRef.current;
    if (!wrap || !rect) return { x: 16, y: 16 };

    const wrapRect = wrap.getBoundingClientRect();
    const width = 340;
    const rawX = rect.left - wrapRect.left + rect.width / 2 - width / 2;
    const x = clamp(rawX, 8, Math.max(8, wrapRect.width - width - 8));

    const belowY = rect.bottom - wrapRect.top + 10;
    const aboveY = rect.top - wrapRect.top - 126;
    const y = preferred === "top" ? Math.max(8, aboveY) : belowY;

    return { x, y };
  };

  const applyTx = (txFn, opts = {}) => {
    const el = rootRef.current;
    if (!el) return;

    const liveDoc = htmlToDoc(el.innerHTML);
    docRef.current = liveDoc;

    const sel = editorState.getBestSelection();
    selectionRef.current = sel;

    const prev = liveDoc;
    const result = txFn(prev, sel);
    const next = result?.doc ? result.doc : prev;
    const nextSel = result?.selection || sel;

    if (!opts.skipHistory) pushHistory(prev);

    el.innerHTML = docToEditableHTML(next);
    setSelectionOffsets(el, nextSel.from, nextSel.to);

    emitDoc(next);
    el.focus();
    refreshUIFromDOMSelection();
  };

  const undo = () => {
    history.undo(rootRef, docRef, emitDoc, onChange, onHTMLChange);
    refreshUIFromDOMSelection();
  };

  const redo = () => {
    history.redo(rootRef, docRef, emitDoc, onChange, onHTMLChange);
    refreshUIFromDOMSelection();
  };

  function getSelectionInlineMarks(doc, selection) {
    const blocks = Array.isArray(doc?.content) ? doc.content : [];
    let abs = 0;
    const from = Number.isFinite(selection?.from) ? selection.from : 0;
    const to = Number.isFinite(selection?.to) ? selection.to : from;
    const probeStart = Math.min(from, to);
    const probeEnd = Math.max(from, to);

    const checkRuns = (runs = []) => {
      for (const run of runs) {
        const text = String(run?.text || "");
        const start = abs;
        const end = start + text.length;
        abs = end;
        const overlapsRange = probeEnd > probeStart && end > probeStart && start < probeEnd;
        const containsCaret = probeEnd === probeStart && probeStart >= start && probeStart <= end;
        if (overlapsRange || containsCaret) {
          return Array.isArray(run?.marks) ? run.marks : [];
        }
      }
      return null;
    };

    for (let bi = 0; bi < blocks.length; bi++) {
      const block = blocks[bi];
      if (block?.type === "table") {
        const rows = Array.isArray(block.rows) ? block.rows : [];
        for (let ri = 0; ri < rows.length; ri++) {
          const cells = Array.isArray(rows[ri]?.cells) ? rows[ri].cells : [];
          for (let ci = 0; ci < cells.length; ci++) {
            const found = checkRuns(Array.isArray(cells[ci]?.content) ? cells[ci].content : []);
            if (found) return found;
            if (ci !== cells.length - 1) abs += 1;
          }
          if (ri !== rows.length - 1) abs += 1;
        }
      } else {
        const found = checkRuns(Array.isArray(block?.content) ? block.content : []);
        if (found) return found;
      }

      if (bi !== blocks.length - 1) abs += 1;
    }

    return [];
  }

  function refreshUIFromDOMSelection() {
    const el = rootRef.current;
    if (!el) return;

    const liveDoc = htmlToDoc(el.innerHTML);
    const selOff = editorState.getBestSelection();
    const rect = getRangeRectSafe(el);

    selectionRef.current = selOff;

    if (selOff.from !== selOff.to) {
      selectionSnapshotRef.current = { ...selOff, rect };
    }

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      ui.setActiveMarks(emptyActiveMarks);
      ui.setColorState(NONE_VALUE);
      ui.setHighlightState(NONE_VALUE);
      ui.setFontSizeState("16px");
      return;
    }

    const r = sel.getRangeAt(0);
    const blockEl = findContainingBlock(el, r.startContainer);
    if (!blockEl) {
      ui.setActiveMarks(emptyActiveMarks);
      return;
    }

    const tag = blockEl.tagName.toLowerCase();

    if (tag === "h1") ui.setFormat("h1");
    else if (tag === "h2") ui.setFormat("h2");
    else if (tag === "h3") ui.setFormat("h3");
    else if (tag === "pre") ui.setFormat("code");
    else if (tag === "li") {
      const p = blockEl.parentElement?.tagName?.toLowerCase();
      ui.setFormat(p === "ol" ? "ol" : "ul");
    } else ui.setFormat("p");

    const a = (
      blockEl.style?.textAlign || blockEl.closest?.("p, h1, h2, h3, li")?.style?.textAlign || "left"
    ).toLowerCase();
    ui.setAlignState(["left", "center", "right", "justify"].includes(a) ? a : "left");

    const startEl = r.startContainer.nodeType === Node.ELEMENT_NODE
      ? r.startContainer
      : r.startContainer.parentElement;

    const hasAncestor = (selector) => {
      const match = startEl?.closest?.(selector);
      return !!(match && el.contains(match));
    };

    const currentMarks = getSelectionInlineMarks(liveDoc, selOff);
    const colorMark = currentMarks.find((mark) => mark.type === "color" && mark.value)?.value || NONE_VALUE;
    const backgroundMark = currentMarks.find((mark) => mark.type === "background" && mark.value)?.value || NONE_VALUE;
    const fontSizeMark = currentMarks.find((mark) => mark.type === "fontSize" && mark.value)?.value || null;

    ui.setActiveMarks({
      b: hasAncestor("strong,b") || currentMarks.some((mark) => mark.type === "b"),
      i: hasAncestor("em,i") || currentMarks.some((mark) => mark.type === "i"),
      u: hasAncestor("u") || currentMarks.some((mark) => mark.type === "u"),
      s: hasAncestor("s,strike") || currentMarks.some((mark) => mark.type === "s"),
      sub: hasAncestor("sub") || currentMarks.some((mark) => mark.type === "sub"),
      sup: hasAncestor("sup") || currentMarks.some((mark) => mark.type === "sup"),
      a: hasAncestor("a") || currentMarks.some((mark) => mark.type === "a"),
    });

    const styledElement = startEl?.nodeType === Node.ELEMENT_NODE ? startEl : blockEl;
    const computed = styledElement ? window.getComputedStyle(styledElement) : null;
    ui.setColorState(colorMark);
    ui.setHighlightState(backgroundMark);
    ui.setFontSizeState(fontSizeMark || normalizePx(computed?.fontSize || "16px"));
  }

  const openLinkModal = () => {
    const el = rootRef.current;
    if (!el) return;

    const liveDoc = htmlToDoc(el.innerHTML);
    docRef.current = liveDoc;

    const liveSel = editorState.isSelectionInside()
      ? editorState.getLiveSelection()
      : editorState.getBestSelection();

    let selOff = liveSel;
    let href = "";

    if (selOff.from === selOff.to) {
      const linkAtCaret = getLinkRangeAtPos(liveDoc, selOff.from);
      if (!linkAtCaret) return;
      selOff = { from: linkAtCaret.from, to: linkAtCaret.to };
      href = linkAtCaret.href;
    } else {
      href = getLinkHrefInRange(liveDoc, selOff);
    }

    selectionRef.current = selOff;
    setSelectionOffsets(el, selOff.from, selOff.to);

    const rect = getRangeRectSafe(el) || selectionSnapshotRef.current?.rect;
    const pos = getPopupPositionFromRect(rect, "bottom");

    ui.setLinkUI({ open: true, href: String(href || ""), x: pos.x, y: pos.y });

    setTimeout(() => {
      const el2 = rootRef.current;
      if (el2) setSelectionOffsets(el2, selOff.from, selOff.to);
    }, 0);
  };

  const applyLinkFromModal = () => {
    const href = String(ui.linkUI.href || "").trim();
    if (!href) return;

    const savedSel = selectionRef.current;
    applyTx((d) => setLink(d, savedSel, href));
    ui.setLinkUI({ open: false, href: "", x: 0, y: 0 });
  };

  const removeLinkFromModal = () => {
    const savedSel = selectionRef.current;
    applyTx((d) => unsetLink(d, savedSel));
    ui.setLinkUI({ open: false, href: "", x: 0, y: 0 });
  };

  const openTablePopup = () => {
    const el = rootRef.current;
    const wrap = wrapRef.current;
    if (!el || !wrap) return;

    let rect = getRangeRectSafe(el);
    if (!rect) rect = selectionSnapshotRef.current?.rect;
    if (!rect) return;

    const wrapRect = wrap.getBoundingClientRect();
    const x = rect.left - wrapRect.left;
    const y = rect.bottom - wrapRect.top + 8;

    ui.setTableUI({ open: true, rows: 2, cols: 2, x, y });
    el.focus();
  };

  const insertTableWithDimensions = () => {
    const rows = Math.max(1, Math.min(20, ui.tableUI.rows || 2));
    const cols = Math.max(1, Math.min(20, ui.tableUI.cols || 2));
    applyTx((d, s) => insertTable(d, s, rows, cols));
    ui.setTableUI({ open: false, rows: 2, cols: 2, x: 0, y: 0 });
  };

  const scheduleTableHoverClose = () => {
    clearTimeout(tableHoverCloseTimerRef.current);
    tableHoverCloseTimerRef.current = setTimeout(() => {
      hoveredTableRef.current = null;
      setTableHoverUI((prev) => ({ ...prev, open: false }));
      setTableMenuOpen({ top: false, left: false });
      }, 120);
  };

  const updateTableHoverUIFromTarget = (target) => {
    const root = rootRef.current;
    if (!root) return;

    if (target?.closest?.(".re-table-plus-wrap") || target?.closest?.(".re-table-action-menu")) return;

    const cell = target?.closest?.("td,th");
    const table = cell?.closest?.("table");
    if (!cell || !table || !root.contains(table)) {
      scheduleTableHoverClose();
      return;
    }

    clearTimeout(tableHoverCloseTimerRef.current);
    syncTableUIFromCell(cell, table);
  };

  const refreshTableHoverAfterMutation = () => {
    const table = hoveredTableRef.current;
    if (!table) return;

    const rows = Array.from(table.rows || []);
    const rowEl = rows[tableHoverUI.rowIndex] || rows[0];
    const cell = rowEl?.cells?.[tableHoverUI.colIndex] || rowEl?.cells?.[0];
    if (!rowEl || !cell) return;
    syncTableUIFromCell(cell, table);
  };

  const applyTableDomMutation = (mutator) => {
    const root = rootRef.current;
    const table = hoveredTableRef.current;
    if (!root || !table || !root.contains(table)) return;

    mutator(table, tableHoverUI.rowIndex, tableHoverUI.colIndex);
    applyTableHeaderPresentation(table);
    root.focus();
    setTableMenuOpen({ top: false, left: false });
    handleScheduleSyncFromDOM();
    setTimeout(refreshTableHoverAfterMutation, 0);
  };

  const addTableRow = (position = "below") => {
    applyTableDomMutation((table, rowIndex) => {
      const rows = Array.from(table.rows || []);
      const safeIndex = Math.max(0, Math.min(rowIndex, rows.length - 1));
      const referenceRow = rows[safeIndex] || rows[rows.length - 1];
      const cellCount = Math.max(1, referenceRow?.cells?.length || 1);
      const insertIndex = position === "above" ? safeIndex : Math.min(safeIndex + 1, rows.length);
      const newRow = table.insertRow(insertIndex);
      for (let i = 0; i < cellCount; i++) {
        const cell = newRow.insertCell(i);
        cell.textContent = "\u200B";
      }
    });
  };

  const removeTableRow = () => {
    applyTableDomMutation((table, rowIndex) => {
      if ((table.rows || []).length <= 1) return;
      table.deleteRow(Math.max(0, Math.min(rowIndex, table.rows.length - 1)));
    });
  };

  const addTableColumn = (position = "right") => {
    applyTableDomMutation((table, _rowIndex, colIndex) => {
      Array.from(table.rows || []).forEach((row, rowIndex) => {
        const insertAt = position === "left" ? Math.max(0, colIndex) : Math.min(colIndex + 1, row.cells.length);
        const cell = row.insertCell(insertAt);
        if (rowIndex === 0) {
          const th = document.createElement("th");
          th.contentEditable = "true";
          th.textContent = "\u200B";
          row.replaceChild(th, cell);
        } else {
          cell.textContent = "\u200B";
        }
      });
    });
  };

  const removeTableColumn = () => {
    applyTableDomMutation((table, _rowIndex, colIndex) => {
      const rows = Array.from(table.rows || []);
      if (!rows.length || rows[0].cells.length <= 1) return;
      rows.forEach((row) => row.deleteCell(Math.max(0, Math.min(colIndex, row.cells.length - 1))));
    });
  };

  const setHoveredTableTheme = (theme) => {
    applyTableDomMutation((table) => {
      table.setAttribute("data-theme", theme === "plain" ? "plain" : "blue");
    });
  };

  const setHoveredTableHeaderColor = (color) => {
    applyTableDomMutation((table) => {
      const safeColor = rgbToHex(color, "#dbeafe");
      table.setAttribute("data-header-color", safeColor);
      table.style.setProperty("--re-table-header-bg", safeColor);
    });
  };

  const onKeyDown = (e) => {
    if (disabled) return;

    const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
    const mod = isMac ? e.metaKey : e.ctrlKey;

    if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
      e.preventDefault();
      undo();
      return;
    }
    if ((mod && e.key.toLowerCase() === "y") || (mod && e.key.toLowerCase() === "z" && e.shiftKey)) {
      e.preventDefault();
      redo();
      return;
    }

    if (e.key === "Tab") {
      const codeEl = getActiveCodeElement();
      if (codeEl) {
        e.preventDefault();
        insertPlainTextAtSelection("	");
        setTimeout(handleScheduleSyncFromDOM, 0);
        return;
      }

      e.preventDefault();
      applyTx((d, s) => indentBlock(d, s, e.shiftKey ? -1 : 1));
    }
  };

  const handleFormatChange = (v) => {
    ui.setFormat(v);
    if (v === "p") applyTx((d, s) => setBlockType(d, s, "p"));
    else if (v === "h1") applyTx((d, s) => setBlockType(d, s, "h", 1));
    else if (v === "h2") applyTx((d, s) => setBlockType(d, s, "h", 2));
    else if (v === "h3") applyTx((d, s) => setBlockType(d, s, "h", 3));
    else if (v === "code") applyTx((d, s) => setBlockType(d, s, "code"));
    else if (v === "ul") applyTx((d, s) => toggleList(d, s, "ul"));
    else if (v === "ol") applyTx((d, s) => toggleList(d, s, "ol"));
  };

  const handleAlignChange = (v) => {
    ui.setAlignState(v);
    applyTx((d, s) => setAlign(d, s, v));
  };

  const handleColorChange = (v) => {
    ui.setColorState(v);
    applyTx((d, s) => setColor(d, s, v));
  };

  const handleHighlightChange = (v) => {
    ui.setHighlightState(v);
    applyTx((d, s) => setHighlight(d, s, v));
  };

  const handleFontSizeChange = (v) => {
    ui.setFontSizeState(v);
    applyTx((d, s) => setFontSize(d, s, v));
  };

  const handleScheduleSyncFromDOM = () => {
    const el = rootRef.current;
    if (!el) return;

    const prev = docRef.current || defaultDoc();
    const next = htmlToDoc(el.innerHTML);
    const prevJson = JSON.stringify(prev);
    const nextJson = JSON.stringify(next);

    if (prevJson === nextJson) {
      refreshUIFromDOMSelection();
      return;
    }

    const now = Date.now();
    if (now - lastHistoryAtRef.current > 1000) {
      pushHistory(prev);
      lastHistoryAtRef.current = now;
    }

    emitDoc(next);
    ui.setWordCount(countWords(next));
    refreshUIFromDOMSelection();
  };

  const handleBlur = () => {
    handleScheduleSyncFromDOM();
    ui.setWordCount(editorState.calculateWordCount());
  };

  return (
    <div
      ref={wrapRef}
      className={["re-wrap", className].filter(Boolean).join(" ")}
      style={style}
      onMouseMove={(event) => updateTableHoverUIFromTarget(event.target)}
      onMouseLeave={scheduleTableHoverClose}
      onClick={(e) => {
        const a = e.target?.closest?.("a");
        if (!a) return;

        const wantsOpen = e.ctrlKey || e.metaKey;
        e.preventDefault();
        e.stopPropagation();
        if (!wantsOpen) return;
        const href = a.getAttribute("href") || "";
        if (href) window.open(href, "_blank", "noopener,noreferrer");
      }}
    >
      <Toolbar
        disabled={disabled}
        format={ui.format}
        align={ui.align}
        color={ui.color}
        highlight={ui.highlight}
        fontSize={ui.fontSize}
        activeMarks={ui.activeMarks}
        onCaptureSelection={editorState.captureSelectionSnapshot}
        onUndo={undo}
        onRedo={redo}
        onToggleMark={(mark) => applyTx((d, s) => toggleInlineMark(d, s, mark))}
        onIndent={(amount) => applyTx((d, s) => indentBlock(d, s, amount))}
        onInsertTable={openTablePopup}
        onOpenLink={openLinkModal}
        onFormatChange={handleFormatChange}
        onAlignChange={handleAlignChange}
        onColorChange={handleColorChange}
        onHighlightChange={handleHighlightChange}
        onFontSizeChange={handleFontSizeChange}
      />

      <Editor
        rootRef={rootRef}
        placeholder={placeholder}
        disabled={disabled}
        onInput={handleScheduleSyncFromDOM}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
        onKeyUp={(event) => {
          refreshUIFromDOMSelection();
          const activeCell = event?.target?.closest?.("td,th");
          const activeTable = activeCell?.closest?.("table");
          if (activeCell && activeTable) syncTableUIFromCell(activeCell, activeTable);
        }}
        onMouseUp={(event) => {
          refreshUIFromDOMSelection();
          updateTableHoverUIFromTarget(event.target);
        }}
        onPaste={(event) => {
          if (disabled) return;
          const codeEl = event.target?.closest?.("pre,code") || getActiveCodeElement();
          if (codeEl) {
            event.preventDefault();
            const text = event.clipboardData?.getData("text/plain") || "";
            insertPlainTextAtSelection(text.replace(/\r\n?/g, "\n"));
          }
          setTimeout(handleScheduleSyncFromDOM, 0);
        }}
      />

      {tableHoverUI.open ? (
        <>
          <div
            className="re-table-plus-wrap re-table-plus-wrap--top"
            style={{ left: tableHoverUI.topX, top: tableHoverUI.topY }}
            onMouseEnter={() => clearTimeout(tableHoverCloseTimerRef.current)}
            onMouseLeave={scheduleTableHoverClose}
            onMouseDown={(event) => event.preventDefault()}
          >
            <button
              type="button"
              className={["re-table-plus-trigger", tableMenuOpen.top ? "is-open" : ""].filter(Boolean).join(" ")}
              title="Column options"
              aria-label="Column options"
              onClick={() => {
                setTableMenuOpen((prev) => ({ top: !prev.top, left: false }));
              }}
            >
              +
            </button>
            {tableMenuOpen.top ? (
              <div className="re-table-action-menu re-table-action-menu--top">
                <button type="button" className="re-table-action-menu__item" onClick={() => addTableColumn("left")}><span className="re-table-action-menu__icon">↤</span><span>Add column left</span></button>
                <button type="button" className="re-table-action-menu__item" onClick={() => addTableColumn("right")}><span className="re-table-action-menu__icon">↦</span><span>Add column right</span></button>
                <button type="button" className="re-table-action-menu__item" onClick={removeTableColumn}><span className="re-table-action-menu__icon">🗑</span><span>Remove column</span></button>
                <button type="button" className="re-table-action-menu__item" onClick={() => setHoveredTableTheme("blue")}><span className="re-table-action-menu__icon">🔷</span><span>Blue table theme</span></button>
                <button type="button" className="re-table-action-menu__item" onClick={() => setHoveredTableTheme("plain")}><span className="re-table-action-menu__icon">⬜</span><span>Plain table theme</span></button>
                <div className="re-table-action-menu__section">
                  <div className="re-table-action-menu__section-title"><span className="re-table-action-menu__icon">🎨</span><span>Header colors</span></div>
                  {[
                    { value: "#dbeafe", label: "Blue" },
                    { value: "#dcfce7", label: "Green" },
                    { value: "#fef3c7", label: "Gold" },
                    { value: "#fee2e2", label: "Rose" },
                    { value: "#ede9fe", label: "Lavender" },
                    { value: "#e0f2fe", label: "Sky" },
                  ].map((option) => (
                    <button key={option.value} type="button" className="re-table-action-menu__item re-table-action-menu__item--color" onClick={() => setHoveredTableHeaderColor(option.value)}>
                      <span className="re-table-action-menu__icon">🎨</span>
                      <span>{option.label}</span>
                      <span className="re-color-dot" style={{ backgroundColor: option.value }} aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div
            className="re-table-plus-wrap re-table-plus-wrap--left"
            style={{ left: tableHoverUI.leftX, top: tableHoverUI.leftY }}
            onMouseEnter={() => clearTimeout(tableHoverCloseTimerRef.current)}
            onMouseLeave={scheduleTableHoverClose}
            onMouseDown={(event) => event.preventDefault()}
          >
            <button
              type="button"
              className={["re-table-plus-trigger", tableMenuOpen.left ? "is-open" : ""].filter(Boolean).join(" ")}
              title="Row options"
              aria-label="Row options"
              onClick={() => {
                setTableMenuOpen((prev) => ({ top: false, left: !prev.left }));
              }}
            >
              +
            </button>
            {tableMenuOpen.left ? (
              <div className="re-table-action-menu re-table-action-menu--left">
                <button type="button" className="re-table-action-menu__item" onClick={() => addTableRow("above")}><span className="re-table-action-menu__icon">↑</span><span>Add row above</span></button>
                <button type="button" className="re-table-action-menu__item" onClick={() => addTableRow("below")}><span className="re-table-action-menu__icon">↓</span><span>Add row below</span></button>
                <button type="button" className="re-table-action-menu__item" onClick={removeTableRow}><span className="re-table-action-menu__icon">🗑</span><span>Remove row</span></button>
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {showFooter ? <EditorFooter wordCount={ui.wordCount} /> : null}

      <LinkModal
        linkUI={ui.linkUI}
        linkInputRef={linkInputRef}
        onHrefChange={(href) => ui.setLinkUI((x) => ({ ...x, href }))}
        onApply={applyLinkFromModal}
        onRemove={removeLinkFromModal}
        onClose={() => ui.setLinkUI({ open: false, href: "", x: 0, y: 0 })}
      />

      <TablePopup
        tableUI={ui.tableUI}
        tableRowsInputRef={tableRowsInputRef}
        tableColsInputRef={tableColsInputRef}
        onRowsChange={(rows) => ui.setTableUI((x) => ({ ...x, rows }))}
        onColsChange={(cols) => ui.setTableUI((x) => ({ ...x, cols }))}
        onInsert={insertTableWithDimensions}
        onClose={() => ui.setTableUI({ open: false, rows: 2, cols: 2, x: 0, y: 0 })}
      />
    </div>
  );
}
