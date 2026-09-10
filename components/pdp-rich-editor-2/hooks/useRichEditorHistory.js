import { useRef } from "react";
import { normalizeDoc } from "../core/core";
import { docToEditableHTML } from "../core/conversion";
import { setSelectionOffsets } from "../utils/selection-dom";

export default function useRichEditorHistory() {
  const historyRef = useRef({ undo: [], redo: [] });
  const lastHistoryAtRef = useRef(0);

  const pushHistory = (prevDoc, selection = { from: 0, to: 0 }) => {
    const h = historyRef.current;
    h.undo.push({ doc: prevDoc, selection });
    if (h.undo.length > 150) h.undo.shift();
    h.redo = [];
  };

  const undo = (rootRef, docRef, selectionRef, emitDoc, onChange, onHTMLChange) => {
    const el = rootRef.current;
    if (!el) return;

    const h = historyRef.current;
    const item = h.undo.pop();
    if (!item) return;

    const currentSel = selectionRef?.current || { from: 0, to: 0 };
    h.redo.push({ doc: docRef.current, selection: currentSel });
    el.innerHTML = docToEditableHTML(item.doc);

    emitDoc(item.doc, onChange, onHTMLChange);
    if (item.selection) {
      setSelectionOffsets(el, item.selection.from, item.selection.to);
    }
    el.focus();
  };

  const redo = (rootRef, docRef, selectionRef, emitDoc, onChange, onHTMLChange) => {
    const el = rootRef.current;
    if (!el) return;

    const h = historyRef.current;
    const item = h.redo.pop();
    if (!item) return;

    const currentSel = selectionRef?.current || { from: 0, to: 0 };
    h.undo.push({ doc: docRef.current, selection: currentSel });
    el.innerHTML = docToEditableHTML(item.doc);

    emitDoc(item.doc, onChange, onHTMLChange);
    if (item.selection) {
      setSelectionOffsets(el, item.selection.from, item.selection.to);
    }
    el.focus();
  };

  return {
    historyRef,
    lastHistoryAtRef,
    pushHistory,
    undo,
    redo,
  };
}
