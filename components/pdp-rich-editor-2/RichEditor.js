// components/pdp-rich-editor/RichEditor.js
"use client";
import "./RichEditor.css";
import React, { useEffect, useRef, useState } from "react";
import { defaultDoc, docToPlainText, docToIndexedText, inlineNodeIndexLength } from "./core/core";
import { getSelectionOffsets, setSelectionOffsets, getRangeRectSafe } from "./utils/selection-dom";

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
  insertImage,
  insertEquation,
  insertText,
  updateAtomicBlock,
  removeAtomicBlock,
} from "./core/commands";

import { docToEditableHTML, htmlToDoc, getTableHeaderPresentation } from "./core/conversion";
import {
  insertTableRow as txInsertTableRow,
  deleteTableRow as txDeleteTableRow,
  insertTableColumn as txInsertTableColumn,
  deleteTableColumn as txDeleteTableColumn,
  deleteTable as txDeleteTable,
  setTableTheme as txSetTableTheme,
  setTableHeaderColor as txSetTableHeaderColor,
  mergeTableCells as txMergeTableCells,
  splitTableCell as txSplitTableCell,
} from "./table/tableCommands";

import useRichEditorState from "./hooks/useRichEditorState";
import useRichEditorHistory from "./hooks/useRichEditorHistory";
import useRichEditorUI from "./hooks/useRichEditorUI";

import Toolbar from "./components/toolbar/Toolbar";
import LinkModal from "./components/modals/LinkModal";
import TablePopup from "./components/modals/TablePopup";
import ImageModal, { validateImage } from "./components/modals/ImageModal";
import ImageToolbar from "./components/modals/ImageToolbar";
import EquationModal from "./components/modals/EquationModal";
import SymbolPopup from "./components/modals/SymbolPopup";
import ColorPickerPopup from "./components/modals/ColorPickerPopup";
import Editor from "./components/Editor";
import EditorFooter from "./components/EditorFooter";

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
  onUploadImage,
  placeholder = "Write…",
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
  const { setLinkUI, setTableUI, setImageUI, setEquationUI, setSymbolUI } = ui;

  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [selectedBlockType, setSelectedBlockType] = useState(null);

  const equationInsertSelectionRef = useRef(null);
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
        setSymbolUI((prev) => ({ ...prev, open: false }));
        setTableMenuOpen({ top: false, left: false });
      } else if (!event.target?.closest?.(".re-table-plus-wrap") && !event.target?.closest?.(".re-table-action-menu")) {
        setTableMenuOpen({ top: false, left: false });
      }
    };

    document.addEventListener("mousedown", onDocMouseDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      clearTimeout(tableHoverCloseTimerRef.current);
    };
  }, [setLinkUI, setTableUI, setSymbolUI, wrapRef]);

  const emitDoc = (nextDoc) => editorState.emitDoc(nextDoc, onChange, onHTMLChange);

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

  const uploadAndInsertImage = async (file, metadata = {}) => {
    if (!file) return;

    setImageUI((previous) => ({
      ...previous,
      uploading: true,
      error: "",
    }));

    try {
      validateImage(file);

      let uploaded = null;
      if (typeof onUploadImage === "function") {
        uploaded = await onUploadImage(file);
      } else {
        const objectUrl = URL.createObjectURL(file);
        uploaded = { src: objectUrl, width: 600 };
      }

      applyTx((doc, selection) =>
        insertImage(doc, selection, {
          ...uploaded,
          alt: metadata.alt || "",
          caption: metadata.caption || "",
          width: metadata.width || uploaded.width || 600,
          align: metadata.align || "center",
          wrap: metadata.wrap || "break-text",
        })
      );

      setImageUI({
        open: false,
        file: null,
        src: "",
        alt: "",
        caption: "",
        width: 600,
        align: "center",
        wrap: "break-text",
        uploading: false,
        error: "",
      });
    } catch (error) {
      setImageUI((previous) => ({
        ...previous,
        uploading: false,
        error: error.message || "Image upload failed",
      }));
    }
  };

  const getActiveCodeElement = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const node = selection.anchorNode?.nodeType === Node.ELEMENT_NODE
      ? selection.anchorNode
      : selection.anchorNode?.parentElement;
    return node?.closest?.("pre, code") || null;
  };

  const openEquationModal = () => {
    editorState.captureSelectionSnapshot();

    const savedSelection =
      selectionSnapshotRef.current ||
      selectionRef.current ||
      {
        from: 0,
        to: 0,
      };

    equationInsertSelectionRef.current = {
      from: Number.isFinite(
        savedSelection.from
      )
        ? savedSelection.from
        : 0,

      to: Number.isFinite(
        savedSelection.to
      )
        ? savedSelection.to
        : Number.isFinite(
            savedSelection.from
          )
          ? savedSelection.from
          : 0,
    };

    ui.setEquationUI((previous) => ({
      ...previous,
      open: true,
      editingId: null,
    }));
  };

  const selectEntireEditor = () => {
    const editorElement = rootRef.current;

    if (!editorElement) {
      return false;
    }

    const liveDocument = htmlToDoc(
      editorElement.innerHTML
    );

    const totalLength =
      docToIndexedText(
        liveDocument
      ).length;

    setSelectionOffsets(
      editorElement,
      0,
      totalLength
    );

    const selectedOffsets = {
      from: 0,
      to: totalLength,
    };

    const rect =
      getRangeRectSafe(
        editorElement
      );

    selectionRef.current =
      selectedOffsets;

    selectionSnapshotRef.current = {
      ...selectedOffsets,
      rect,
    };

    /*
     * Clear individually selected image/equation state.
     * Otherwise Backspace may delete only that one object.
     */
    editorElement
      .querySelectorAll(".is-selected")
      .forEach((element) =>
        element.classList.remove(
          "is-selected"
        )
      );

    setSelectedBlockId(null);
    setSelectedBlockType(null);

    return true;
  };

  const isEntireEditorSelected = () => {
    const editorElement = rootRef.current;
    const selection = window.getSelection();

    if (
      !editorElement ||
      !selection ||
      selection.rangeCount === 0 ||
      selection.isCollapsed
    ) {
      return false;
    }

    const liveDocument = htmlToDoc(editorElement.innerHTML);
    const totalLength = docToIndexedText(liveDocument).length;
    const selectedOffsets = getSelectionOffsets(editorElement);

    const isFullByOffsets =
      selectedOffsets.from === 0 &&
      selectedOffsets.to >= Math.max(0, totalLength - 5);

    const range = selection.getRangeAt(0);
    const firstChild = editorElement.firstChild;
    const lastChild = editorElement.lastChild;

    const isFullByDOM =
      Boolean(range) &&
      (range.startContainer === editorElement ||
        (firstChild && (firstChild.contains(range.startContainer) || range.startContainer === firstChild))) &&
      (range.endContainer === editorElement ||
        (lastChild && (lastChild.contains(range.endContainer) || range.endContainer === lastChild)));

    const containsAllNodes =
      Boolean(firstChild) &&
      Boolean(lastChild) &&
      selection.containsNode(firstChild, true) &&
      selection.containsNode(lastChild, true);

    return isFullByOffsets || isFullByDOM || containsAllNodes;
  };

  const clearEntireEditor = () => {
    applyTx(() => ({
      doc: defaultDoc(),
      selection: {
        from: 0,
        to: 0,
      },
    }));

    hoveredTableRef.current = null;
    setSelectedBlockId(null);
    setSelectedBlockType(null);

    setTableHoverUI((previousState) => ({
      ...previousState,
      open: false,
    }));

    setTableMenuOpen({
      top: false,
      left: false,
    });
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

    if (!opts.skipHistory) pushHistory(prev, sel);

    el.innerHTML = docToEditableHTML(next);
    setSelectionOffsets(el, nextSel.from, nextSel.to);

    emitDoc(next);
    el.focus();
    refreshUIFromDOMSelection();
  };

  const undo = () => {
    history.undo(rootRef, docRef, selectionRef, emitDoc, onChange, onHTMLChange);
    refreshUIFromDOMSelection();
  };

  const redo = () => {
    history.redo(rootRef, docRef, selectionRef, emitDoc, onChange, onHTMLChange);
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
      let runAbs = abs;
      let matchedMarks = null;

      for (const run of runs) {
        const len = inlineNodeIndexLength(run);
        const runStart = runAbs;
        const runEnd = runAbs + len;
        runAbs = runEnd;

        const overlaps = probeStart === probeEnd
          ? (probeStart >= runStart && probeStart <= runEnd)
          : (probeStart < runEnd && probeEnd > runStart);

        if (overlaps) {
          const marks = Array.isArray(run?.marks) ? run.marks : [];
          if (matchedMarks === null) {
            matchedMarks = marks;
          } else {
            matchedMarks = matchedMarks.filter((m) =>
              marks.some((rm) => (m.type === "a" ? rm.type === "a" && rm.href === m.href : rm.type === m.type))
            );
          }
        }
      }

      abs = runAbs;
      return matchedMarks;
    };

    for (const b of blocks) {
      if (b.type === "table") {
        for (const r of b.rows || []) {
          for (const c of r.cells || []) {
            const cellMarks = checkRuns(c.content || []);
            if (cellMarks !== null) return cellMarks;
            abs += 1;
          }
          abs += 1;
        }
      } else {
        const blockMarks = checkRuns(b.content || []);
        if (blockMarks !== null) return blockMarks;
      }
      abs += 1;
    }

    return [];
  }

  function refreshUIFromDOMSelection() {
    const root = rootRef.current;
    if (!root) return;

    const sel = editorState.getBestSelection();
    selectionRef.current = sel;

    const curDoc = htmlToDoc(root.innerHTML);
    docRef.current = curDoc;

    const domSel = window.getSelection();
    let currentBlock = null;
    let anchorNode = domSel?.anchorNode;

    if (anchorNode) {
      const el = anchorNode.nodeType === Node.ELEMENT_NODE ? anchorNode : anchorNode.parentElement;
      const bEl = el?.closest("p, h1, h2, h3, pre, li, td, th, figure, [data-re-node]");
      if (bEl) {
        const tag = bEl.tagName.toLowerCase();
        if (tag === "h1") currentBlock = { type: "h1" };
        else if (tag === "h2") currentBlock = { type: "h2" };
        else if (tag === "h3") currentBlock = { type: "h3" };
        else if (tag === "pre") currentBlock = { type: "code" };
        else if (tag === "li") {
          const listTag = bEl.parentElement?.tagName?.toLowerCase();
          currentBlock = { type: listTag === "ol" ? "ol" : "ul" };
        } else {
          currentBlock = { type: "p" };
        }

        const alignVal = bEl.style?.textAlign || "left";
        ui.setAlignState(alignVal);
      }
    }

    ui.setFormat(currentBlock?.type || "p");

    let computedColor = "#111827";
    let computedHighlight = NONE_VALUE;
    let computedFontSize = "16px";

    if (anchorNode) {
      const el = anchorNode.nodeType === Node.ELEMENT_NODE ? anchorNode : anchorNode.parentElement;
      if (el && root.contains(el)) {
        const cs = window.getComputedStyle(el);
        computedColor = rgbToHex(cs.color, "#111827");
        const bg = cs.backgroundColor;
        if (bg && bg !== "transparent" && !/^rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)$/i.test(bg)) {
          computedHighlight = rgbToHex(bg, NONE_VALUE);
        }
        computedFontSize = normalizePx(cs.fontSize, "16px");
      }
    }

    ui.setColorState(computedColor);
    ui.setHighlightState(computedHighlight);
    ui.setFontSizeState(computedFontSize);

    const activeMarks = getSelectionInlineMarks(curDoc, sel);
    ui.setActiveMarks({
      b: activeMarks.some((m) => m.type === "b"),
      i: activeMarks.some((m) => m.type === "i"),
      u: activeMarks.some((m) => m.type === "u"),
      s: activeMarks.some((m) => m.type === "s"),
      sub: activeMarks.some((m) => m.type === "sub"),
      sup: activeMarks.some((m) => m.type === "sup"),
      a: activeMarks.some((m) => m.type === "a"),
    });

    const activeLinkMark = activeMarks.find((m) => m.type === "a");
    if (activeLinkMark?.href) {
      const rect = getRangeRectSafe(root);
      const pos = getPopupPositionFromRect(rect, "bottom");
      ui.setLinkUI({
        open: true,
        href: activeLinkMark.href,
        x: pos.x,
        y: pos.y,
        selection: sel,
      });
    } else {
      ui.setLinkUI((prev) => (prev.open ? { ...prev, open: false } : prev));
    }
  }

  const openLinkModal = () => {
    const sel = editorState.getBestSelection();
    selectionRef.current = sel;
    const rect = getRangeRectSafe(rootRef.current);
    const pos = getPopupPositionFromRect(rect, "bottom");

    const curDoc = htmlToDoc(rootRef.current.innerHTML);
    const activeMarks = getSelectionInlineMarks(curDoc, sel);
    const linkMark = activeMarks.find((m) => m.type === "a");

    ui.setLinkUI({
      open: true,
      href: linkMark?.href || "",
      x: pos.x,
      y: pos.y,
      selection: sel,
    });
  };

  const applyLinkFromModal = (url) => {
    const targetSel = ui.linkUI.selection || editorState.getBestSelection();
    if (url) {
      applyTx((d) => setLink(d, targetSel, url));
    } else {
      applyTx((d) => unsetLink(d, targetSel));
    }
    ui.setLinkUI({ open: false, href: "", x: 0, y: 0, selection: null });
  };

  const removeLinkFromModal = () => {
    const targetSel = ui.linkUI.selection || editorState.getBestSelection();
    applyTx((d) => unsetLink(d, targetSel));
    ui.setLinkUI({ open: false, href: "", x: 0, y: 0, selection: null });
  };

  const openTablePopup = () => {
    const sel = editorState.getBestSelection();
    selectionRef.current = sel;
    const rect = getRangeRectSafe(rootRef.current);
    const pos = getPopupPositionFromRect(rect, "bottom");

    ui.setTableUI({
      open: true,
      rows: 2,
      cols: 2,
      x: pos.x,
      y: pos.y,
    });
  };

  const insertTableWithDimensions = (r, c) => {
    const rows = typeof r === "number" && Number.isFinite(r) ? Math.max(1, r) : (ui.tableUI.rows || 2);
    const cols = typeof c === "number" && Number.isFinite(c) ? Math.max(1, c) : (ui.tableUI.cols || 2);
    applyTx((d, s) => insertTable(d, s, rows, cols));
    ui.setTableUI({ open: false, rows: 2, cols: 2, x: 0, y: 0 });
  };

  const updateTableHoverUIFromTarget = (target) => {
    const root = rootRef.current;
    if (!root || !target) return;

    const cell = target.closest?.("td, th");
    const table = cell?.closest?.("table");

    if (cell && table && root.contains(table)) {
      clearTimeout(tableHoverCloseTimerRef.current);
      syncTableUIFromCell(cell, table);
    }
  };

  const scheduleTableHoverClose = () => {
    tableHoverCloseTimerRef.current = setTimeout(() => {
      if (!tableMenuOpen.top && !tableMenuOpen.left) {
        setTableHoverUI((prev) => ({ ...prev, open: false }));
        hoveredTableRef.current = null;
      }
    }, 150);
  };

  const addTableRow = (position = "below") => {
    const tableId = hoveredTableRef.current?.getAttribute("data-table-id") || null;
    applyTx((doc) => txInsertTableRow(doc, { tableId, rowIndex: tableHoverUI.rowIndex, position }));
    setTableMenuOpen({ top: false, left: false });
  };

  const removeTableRow = () => {
    const tableId = hoveredTableRef.current?.getAttribute("data-table-id") || null;
    applyTx((doc) => txDeleteTableRow(doc, { tableId, rowIndex: tableHoverUI.rowIndex }));
    setTableMenuOpen({ top: false, left: false });
  };

  const addTableColumn = (position = "right") => {
    const tableId = hoveredTableRef.current?.getAttribute("data-table-id") || null;
    applyTx((doc) => txInsertTableColumn(doc, { tableId, colIndex: tableHoverUI.colIndex, position }));
    setTableMenuOpen({ top: false, left: false });
  };

  const removeTableColumn = () => {
    const tableId = hoveredTableRef.current?.getAttribute("data-table-id") || null;
    applyTx((doc) => txDeleteTableColumn(doc, { tableId, colIndex: tableHoverUI.colIndex }));
    setTableMenuOpen({ top: false, left: false });
  };

  const removeEntireTable = () => {
    const tableId = hoveredTableRef.current?.getAttribute("data-table-id") || null;
    applyTx((doc) => txDeleteTable(doc, { tableId }));
    hoveredTableRef.current = null;
    setTableHoverUI((prev) => ({ ...prev, open: false }));
    setTableMenuOpen({ top: false, left: false });
  };

  const setHoveredTableTheme = (theme) => {
    const tableId = hoveredTableRef.current?.getAttribute("data-table-id") || null;
    applyTx((doc) => txSetTableTheme(doc, { tableId, theme }));
    setTableMenuOpen({ top: false, left: false });
  };

  const setHoveredTableHeaderColor = (color) => {
    const tableId = hoveredTableRef.current?.getAttribute("data-table-id") || null;
    applyTx((doc) => txSetTableHeaderColor(doc, { tableId, color }));
    setTableMenuOpen({ top: false, left: false });
  };

  const handleDoubleClick = (event) => {
    const eqEl = event.target?.closest?.('[data-re-node="equation"]');
    if (eqEl) {
      const id = eqEl.getAttribute("data-id");
      const rawAst = eqEl.getAttribute("data-equation");
      const source = eqEl.getAttribute("data-source") || "";
      let ast = { type: "row", children: [] };
      if (rawAst) {
        try {
          ast = JSON.parse(decodeURIComponent(rawAst));
        } catch {}
      }
      ui.setEquationUI({
        open: true,
        editingId: id,
        source,
        ast,
      });
      return;
    }

    const imgEl = event.target?.closest?.('[data-re-node="image"]');
    if (imgEl) {
      const id = imgEl.getAttribute("data-id");
      const src = imgEl.getAttribute("data-src") || "";
      const alt = imgEl.getAttribute("data-alt") || "";
      const caption = imgEl.getAttribute("data-caption") || "";
      const width = Number(imgEl.getAttribute("data-width")) || 600;
      const align = imgEl.getAttribute("data-align") || "center";
      const wrap = imgEl.getAttribute("data-wrap") || "break-text";

      ui.setImageUI({
        open: true,
        file: null,
        src,
        alt,
        caption,
        width,
        align,
        wrap,
        uploading: false,
        error: "",
      });
    }
  };

  const handleClick = (event) => {
    const nodeEl = event.target?.closest?.('[data-re-node="image"], [data-re-node="equation"]');
    const root = rootRef.current;
    if (!root) return;

    root.querySelectorAll(".is-selected").forEach((el) => el.classList.remove("is-selected"));

    if (nodeEl) {
      nodeEl.classList.add("is-selected");
      const id = nodeEl.getAttribute("data-id");
      const nodeType = nodeEl.getAttribute("data-re-node");
      setSelectedBlockId(id);
      setSelectedBlockType(nodeType);
    } else {
      setSelectedBlockId(null);
      setSelectedBlockType(null);
    }
  };

  const onKeyDown = (e) => {
    if (disabled) return;

    const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
    const mod = isMac ? e.metaKey : e.ctrlKey;

    if (mod && e.key.toLowerCase() === "a") {
      e.preventDefault();
      selectEntireEditor();
      refreshUIFromDOMSelection();
      return;
    }

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

    if (
      e.key === "Backspace" ||
      e.key === "Delete"
    ) {
      if (isEntireEditorSelected()) {
        e.preventDefault();
        clearEntireEditor();
        return;
      }

      if (selectedBlockId) {
        e.preventDefault();

        applyTx((doc) =>
          removeAtomicBlock(
            doc,
            selectedBlockId
          )
        );

        setSelectedBlockId(null);
        setSelectedBlockType(null);

        return;
      }
    }

    if (e.key === "Tab") {
      const selection = window.getSelection();
      const currentCell = selection?.anchorNode?.nodeType === Node.ELEMENT_NODE
        ? selection.anchorNode.closest("td,th")
        : selection?.anchorNode?.parentElement?.closest("td,th");
      const currentTable = currentCell?.closest("table");

      if (currentCell && currentTable && rootRef.current?.contains(currentTable)) {
        e.preventDefault();
        const allCells = Array.from(currentTable.querySelectorAll("td, th"));
        const currentIndex = allCells.indexOf(currentCell);

        if (e.shiftKey) {
          if (currentIndex > 0) {
            const prevCell = allCells[currentIndex - 1];
            prevCell.focus();
            const range = document.createRange();
            range.selectNodeContents(prevCell);
            selection.removeAllRanges();
            selection.addRange(range);
            refreshUIFromDOMSelection();
          }
        } else {
          if (currentIndex < allCells.length - 1) {
            const nextCell = allCells[currentIndex + 1];
            nextCell.focus();
            const range = document.createRange();
            range.selectNodeContents(nextCell);
            selection.removeAllRanges();
            selection.addRange(range);
            refreshUIFromDOMSelection();
          } else {
            addTableRow("below");
            setTimeout(() => {
              const updatedCells = Array.from(currentTable.querySelectorAll("td, th"));
              const newCell = updatedCells[allCells.length];
              if (newCell) {
                newCell.focus();
                const range = document.createRange();
                range.selectNodeContents(newCell);
                selection.removeAllRanges();
                selection.addRange(range);
                refreshUIFromDOMSelection();
              }
            }, 10);
          }
        }
        return;
      }

      const codeEl = getActiveCodeElement();
      if (codeEl) {
        e.preventDefault();
        insertPlainTextAtSelection("\t");
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

    const textContent = (el.textContent || "").replace(/[\u200B\u00A0]/g, "").trim();
    const hasMediaOrTable = !!el.querySelector("table, img, iframe, pre, h1, h2, h3, ul, ol, figure, [data-re-node]");

    let next = htmlToDoc(el.innerHTML);
    if (!textContent && !hasMediaOrTable) {
      next = defaultDoc();
    }

    const prev = docRef.current || defaultDoc();
    const prevJson = JSON.stringify(prev);
    const nextJson = JSON.stringify(next);

    if (prevJson === nextJson) {
      refreshUIFromDOMSelection();
      return;
    }

    const now = Date.now();
    if (now - lastHistoryAtRef.current > 1000) {
      pushHistory(prev, selectionRef.current);
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

  const selectedBlock = docRef.current?.content?.find((b) => b.id === selectedBlockId);

  return (
    <div
      ref={wrapRef}
      className={["re-wrap", className].filter(Boolean).join(" ")}
      style={style}
      onMouseMove={(event) => updateTableHoverUIFromTarget(event.target)}
      onMouseLeave={scheduleTableHoverClose}
      onClick={(e) => {
        handleClick(e);

        const a = e.target?.closest?.("a");
        if (!a) return;

        const wantsOpen = e.ctrlKey || e.metaKey;
        e.preventDefault();
        e.stopPropagation();
        if (!wantsOpen) return;
        const href = a.getAttribute("href") || "";
        if (href) window.open(href, "_blank", "noopener,noreferrer");
      }}
      onDoubleClick={handleDoubleClick}
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
        onSetBlockType={(type, level) => applyTx((d, s) => setBlockType(d, s, type, level))}
        onToggleList={(type) => applyTx((d, s) => toggleList(d, s, type))}
        onSetAlign={(alignment) => applyTx((d, s) => setAlign(d, s, alignment))}
        onIndent={(amount) => applyTx((d, s) => indentBlock(d, s, amount))}
        onInsertTable={openTablePopup}
        onInsertImage={() => ui.setImageUI((prev) => ({ ...prev, open: true }))}
        onInsertEquation={openEquationModal}
        onInsertSymbol={() => ui.setSymbolUI((prev) => ({ ...prev, open: true }))}
        onSetColor={(col) => applyTx((d, s) => setColor(d, s, col))}
        onSetHighlight={(col) => applyTx((d, s) => setHighlight(d, s, col))}
        onSetFontSize={(size) => applyTx((d, s) => setFontSize(d, s, size))}
        onOpenLink={openLinkModal}
        onFormatChange={handleFormatChange}
        onAlignChange={handleAlignChange}
        onColorChange={handleColorChange}
        onHighlightChange={handleHighlightChange}
        onFontSizeChange={handleFontSizeChange}
      />

      {selectedBlockType === "image" && selectedBlock ? (
        <ImageToolbar
          block={selectedBlock}
          onUpdate={(updates) => applyTx((d) => updateAtomicBlock(d, selectedBlockId, updates))}
          onDelete={() => {
            applyTx((d) => removeAtomicBlock(d, selectedBlockId));
            setSelectedBlockId(null);
            setSelectedBlockType(null);
          }}
          onClose={() => setSelectedBlockId(null)}
        />
      ) : null}

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

          const imageFile = Array.from(event.clipboardData?.files || []).find((file) =>
            file.type.startsWith("image/")
          );
          if (imageFile) {
            event.preventDefault();
            uploadAndInsertImage(imageFile);
            return;
          }

          const codeEl = event.target?.closest?.("pre,code") || getActiveCodeElement();
          if (codeEl) {
            event.preventDefault();
            const text = event.clipboardData?.getData("text/plain") || "";
            insertPlainTextAtSelection(text.replace(/\r\n?/g, "\n"));
          }
          setTimeout(handleScheduleSyncFromDOM, 0);
        }}
        onDragOver={(e) => {
          if (e.dataTransfer?.types?.includes("Files")) {
            e.preventDefault();
          }
        }}
        onDrop={(e) => {
          const imageFile = Array.from(e.dataTransfer?.files || []).find((file) =>
            file.type.startsWith("image/")
          );
          if (imageFile) {
            e.preventDefault();
            uploadAndInsertImage(imageFile);
          }
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
                <button type="button" className="re-table-action-menu__item re-table-action-menu__item--danger" onClick={removeEntireTable}><span className="re-table-action-menu__icon">❌</span><span>Delete table</span></button>
                <button type="button" className="re-table-action-menu__item" onClick={() => setHoveredTableTheme("blue")}><span className="re-table-action-menu__icon">🔷</span><span>Blue table theme</span></button>
                <button type="button" className="re-table-action-menu__item" onClick={() => setHoveredTableTheme("plain")}><span className="re-table-action-menu__icon">⬜</span><span>Plain table theme</span></button>
                <div className="re-table-action-menu__section" style={{ position: "relative" }}>
                  <div className="re-table-action-menu__section-title"><span className="re-table-action-menu__icon">🎨</span><span>Header & Border 256 RGB Colors</span></div>
                  <button
                    type="button"
                    className="re-table-action-menu__item"
                    onClick={() => {
                      setTableMenuOpen((prev) => ({ ...prev, headerColorPicker: !prev.headerColorPicker }));
                    }}
                  >
                    <span className="re-table-action-menu__icon">🎨</span>
                    <span>Header Color (256 RGB)</span>
                  </button>
                  {tableMenuOpen.headerColorPicker && (
                    <ColorPickerPopup
                      value="#dbeafe"
                      allowNone={true}
                      title="Header Color (256 / RGB)"
                      onChange={(color) => setHoveredTableHeaderColor(color)}
                      onClose={() => setTableMenuOpen((prev) => ({ ...prev, headerColorPicker: false }))}
                      position={{ top: "100%", left: 0 }}
                    />
                  )}
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
                <button type="button" className="re-table-action-menu__item re-table-action-menu__item--danger" onClick={removeEntireTable}><span className="re-table-action-menu__icon">❌</span><span>Delete table</span></button>
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {showFooter ? <EditorFooter wordCount={ui.wordCount} /> : null}

      <SymbolPopup
        open={ui.symbolUI.open}
        onClose={() => ui.setSymbolUI((prev) => ({ ...prev, open: false }))}
        onSelectSymbol={(sym) => applyTx((d, s) => insertText(d, s, sym))}
      />

      <ImageModal
        open={ui.imageUI.open}
        onClose={() => ui.setImageUI((prev) => ({ ...prev, open: false }))}
        onSubmit={(imgData) => applyTx((d, s) => insertImage(d, s, imgData))}
        onUploadImage={onUploadImage}
      />

      <EquationModal
        open={ui.equationUI.open}
        initialEquation={
          ui.equationUI.editingId
            ? {
                id: ui.equationUI.editingId,
                source: ui.equationUI.source,
                ast: ui.equationUI.ast,
                display: "inline",
              }
            : null
        }
        onClose={() => {
          equationInsertSelectionRef.current = null;

          ui.setEquationUI((previous) => ({
            ...previous,
            open: false,
          }));
        }}
        onSubmit={(eqData) => {
          if (ui.equationUI.editingId) {
            applyTx((doc) =>
              updateAtomicBlock(
                doc,
                ui.equationUI.editingId,
                eqData
              )
            );
          } else {
            const savedSelection =
              equationInsertSelectionRef.current;

            applyTx((doc, currentSelection) =>
              insertEquation(
                doc,
                savedSelection ||
                  currentSelection,
                eqData
              )
            );
          }

          equationInsertSelectionRef.current =
            null;
        }}
      />

      <LinkModal
        linkUI={ui.linkUI}
        linkInputRef={linkInputRef}
        onHrefChange={(href) => ui.setLinkUI((x) => ({ ...x, href }))}
        onApply={applyLinkFromModal}
        onRemove={removeLinkFromModal}
        onClose={() => ui.setLinkUI({ open: false, href: "", x: 0, y: 0, selection: null })}
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
