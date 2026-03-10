// components/pdp-rich-editor/RichEditor.js
"use client";
import "./RichEditor.css";
import React, { useEffect } from "react";
import { defaultDoc, docToHTML } from "./core";
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
  insertTable,
} from "./commands";

import { docToEditableHTML, htmlToDoc } from "./conversion";
import { findContainingBlock, getLinkHrefInRange, logEvent } from "./helpers";

import useRichEditorState from "./useRichEditorState";
import useRichEditorHistory from "./useRichEditorHistory";
import useRichEditorUI from "./useRichEditorUI";

import Toolbar from "./Toolbar";
import LinkPopup from "./LinkPopup";
import TablePopup from "./TablePopup";
import Editor from "./Editor";
import EditorFooter from "./EditorFooter";


/** ---------- MAIN COMPONENT ---------- */

export default function RichEditor({
  value,
  onChange,
  onHTMLChange,
  placeholder = "Write…",
  disabled = false,
  className,
  style,
}) {
  // State management
  const editorState = useRichEditorState(value);
  const history = useRichEditorHistory();
  const ui = useRichEditorUI();

  const { rootRef, wrapRef, docRef, selectionRef, selectionSnapshotRef, debounceTimerRef, lastEmittedRef } = editorState;
  const { historyRef, lastHistoryAtRef, pushHistory } = history;
  const { linkInputRef, tableRowsInputRef, tableColsInputRef } = ui;

  // Initialize DOM
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    el.innerHTML = docToEditableHTML(docRef.current);
  }, []);

  // Focus link input when popup opens
  useEffect(() => {
    if (ui.linkUI.open) {
      setTimeout(() => linkInputRef.current?.focus(), 0);
    }
  }, [ui.linkUI.open, linkInputRef]);

  // Focus table input when popup opens
  useEffect(() => {
    if (ui.tableUI.open) {
      setTimeout(() => tableRowsInputRef.current?.focus(), 0);
    }
  }, [ui.tableUI.open, tableRowsInputRef]);

  const emitDoc = (nextDoc) => {
    return editorState.emitDoc(nextDoc, onChange, onHTMLChange);
  };

  const applyTx = (txFn, opts = {}) => {
    const el = rootRef.current;
    if (!el) return;

    const sel = editorState.getBestSelection();
    selectionRef.current = sel;

    const prev = docRef.current;
    const result = txFn(prev, sel);
    const next = result?.doc ? result.doc : prev;
    const nextSel = result?.selection || sel;

    if (!opts.skipHistory) pushHistory(prev);

    el.innerHTML = docToEditableHTML(next);
    setSelectionOffsets(el, nextSel.from, nextSel.to);

    emitDoc(next);
    el.focus();
  };

  const undo = () => {
    history.undo(rootRef, docRef, emitDoc, onChange, onHTMLChange);
  };

  const redo = () => {
    history.redo(rootRef, docRef, emitDoc, onChange, onHTMLChange);
  };

  const refreshUIFromDOMSelection = () => {
    const el = rootRef.current;
    if (!el) return;

    const selOff = editorState.getBestSelection();
    const rect = getRangeRectSafe(el);

    selectionRef.current = selOff;

    if (selOff.from !== selOff.to) {
      selectionSnapshotRef.current = { ...selOff, rect };
    }

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const r = sel.getRangeAt(0);
    const blockEl = findContainingBlock(el, r.startContainer);
    if (!blockEl) return;

    const tag = blockEl.tagName.toLowerCase();

    if (tag === "h1") ui.setFormat("h1");
    else if (tag === "h2") ui.setFormat("h2");
    else if (tag === "h3") ui.setFormat("h3");
    else if (tag === "li") {
      const p = blockEl.parentElement?.tagName?.toLowerCase();
      ui.setFormat(p === "ol" ? "ol" : "ul");
    } else ui.setFormat("p");

    const a = (blockEl.style?.textAlign || "left").toLowerCase();
    ui.setAlignState(["left", "center", "right", "justify"].includes(a) ? a : "left");
  };

  const openLinkPopup = () => {
    const el = rootRef.current;
    const wrap = wrapRef.current;
    if (!el || !wrap) return;

    const selOff = editorState.getBestSelection();
    if (selOff.from === selOff.to) return;

    let rect = getRangeRectSafe(el);
    if (!rect) rect = selectionSnapshotRef.current.rect;
    if (!rect) return;

    selectionRef.current = selOff;

    const href = getLinkHrefInRange(docRef.current, selOff);

    const wrapRect = wrap.getBoundingClientRect();
    const x = rect.left - wrapRect.left;
    const y = rect.bottom - wrapRect.top + 8;

    ui.setLinkUI({ open: true, href: String(href || ""), x, y });

    setSelectionOffsets(el, selOff.from, selOff.to);
    setTimeout(() => {
      const el2 = rootRef.current;
      if (el2) setSelectionOffsets(el2, selOff.from, selOff.to);
    }, 0);
  };

  const applyLinkFromPopup = () => {
    const href = String(ui.linkUI.href || "").trim();
    if (!href) return;

    const savedSel = selectionRef.current;
    applyTx((d) => setLink(d, savedSel, href));
    ui.setLinkUI({ open: false, href: "", x: 0, y: 0 });
  };

  const removeLinkFromPopup = () => {
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

  const handleScheduleSyncFromDOM = () => {
    editorState.scheduleSyncFromDOM(onChange, onHTMLChange);
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
      onClick={(e) => {
        const a = e.target?.closest?.("a");
        if (!a) return;

        e.preventDefault();
        e.stopPropagation();
        const href = a.getAttribute("href") || "";
        if (href) window.open(href, "_blank", "noopener,noreferrer");
      }}
    >
      <Toolbar
        disabled={disabled}
        format={ui.format}
        align={ui.align}
        color={ui.color}
        onCaptureSelection={editorState.captureSelectionSnapshot}
        onUndo={undo}
        onRedo={redo}
        onToggleMark={(mark) => applyTx((d, s) => toggleInlineMark(d, s, mark))}
        onSetBlockType={(type, level) => applyTx((d, s) => setBlockType(d, s, type, level))}
        onToggleList={(type) => applyTx((d, s) => toggleList(d, s, type))}
        onSetAlign={(alignment) => applyTx((d, s) => setAlign(d, s, alignment))}
        onIndent={(amount) => applyTx((d, s) => indentBlock(d, s, amount))}
        onInsertTable={openTablePopup}
        onSetColor={(col) => applyTx((d, s) => setColor(d, s, col))}
        onOpenLink={openLinkPopup}
        onFormatChange={handleFormatChange}
        onAlignChange={handleAlignChange}
        onColorChange={handleColorChange}
      />

      <Editor
        rootRef={rootRef}
        placeholder={placeholder}
        disabled={disabled}
        onInput={handleScheduleSyncFromDOM}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
        onKeyUp={refreshUIFromDOMSelection}
        onMouseUp={refreshUIFromDOMSelection}
        onPaste={() => {
          if (disabled) return;
          setTimeout(handleScheduleSyncFromDOM, 0);
        }}
      />

      <EditorFooter wordCount={ui.wordCount} />

      <LinkPopup
        linkUI={ui.linkUI}
        linkInputRef={linkInputRef}
        onHrefChange={(href) => ui.setLinkUI((x) => ({ ...x, href }))}
        onApply={applyLinkFromPopup}
        onRemove={removeLinkFromPopup}
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
