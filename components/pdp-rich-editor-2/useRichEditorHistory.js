import { useRef } from "react";
import { normalizeDoc } from "./core";
import { docToEditableHTML } from "./conversion";
import { setSelectionOffsets } from "./selection-dom";

export default function useRichEditorHistory() {
  const historyRef = useRef({ undo: [], redo: [] });
  const lastHistoryAtRef = useRef(0);

  const pushHistory = (prevDoc) => {
    const h = historyRef.current;
    h.undo.push(prevDoc);
    if (h.undo.length > 150) h.undo.shift();
    h.redo = [];
  };

  const undo = (rootRef, docRef, emitDoc, onChange, onHTMLChange) => {
    const el = rootRef.current;
    if (!el) return;

    const h = historyRef.current;
    const prev = h.undo.pop();
    if (!prev) return;

    h.redo.push(docRef.current);
    el.innerHTML = docToEditableHTML(prev);

    emitDoc(prev, onChange, onHTMLChange);
    el.focus();
  };

  const redo = (rootRef, docRef, emitDoc, onChange, onHTMLChange) => {
    const el = rootRef.current;
    if (!el) return;

    const h = historyRef.current;
    const nxt = h.redo.pop();
    if (!nxt) return;

    h.undo.push(docRef.current);
    el.innerHTML = docToEditableHTML(nxt);

    emitDoc(nxt, onChange, onHTMLChange);
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
