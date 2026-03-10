import { useEffect, useRef, useState } from "react";
import { normalizeDoc, docToPlainText, defaultDoc, docToHTML } from "./core";
import { docToEditableHTML, htmlToDoc } from "./conversion";
import { getSelectionOffsets, setSelectionOffsets, getRangeRectSafe } from "./selection-dom";

export default function useRichEditorState(value) {
  const rootRef = useRef(null);
  const wrapRef = useRef(null);

  const [doc, setDoc] = useState(() => normalizeDoc(value || defaultDoc()));
  const docRef = useRef(doc);
  
  const selectionRef = useRef({ from: 0, to: 0 });
  const selectionSnapshotRef = useRef({ from: 0, to: 0, rect: null });
  const lastEmittedRef = useRef("");
  const debounceTimerRef = useRef(null);

  // Keep docRef in sync with state
  useEffect(() => {
    docRef.current = doc;
  }, [doc]);

  // Sync with external value prop
  useEffect(() => {
    const next = normalizeDoc(value || defaultDoc());
    const json = JSON.stringify(next);
    if (json === lastEmittedRef.current) return;

    docRef.current = next;
    setDoc(next);

    const el = rootRef.current;
    if (el) {
      el.innerHTML = docToEditableHTML(next);
    }
  }, [value]);

  const isSelectionInside = () => {
    const root = rootRef.current;
    const sel = window.getSelection();
    if (!root || !sel || sel.rangeCount === 0) return false;

    const r = sel.getRangeAt(0);
    return root.contains(r.startContainer) && root.contains(r.endContainer);
  };

  const getLiveSelection = () => {
    const el = rootRef.current;
    if (!el) return { from: 0, to: 0 };
    return getSelectionOffsets(el);
  };

  const getBestSelection = () => {
    const root = rootRef.current;
    if (!root) return { from: 0, to: 0 };

    if (isSelectionInside()) {
      const live = getSelectionOffsets(root);
      if (live.from !== live.to) return live;
    }

    const snap = selectionSnapshotRef.current;
    if (snap && snap.from !== snap.to) return { from: snap.from, to: snap.to };

    return selectionRef.current || { from: 0, to: 0 };
  };

  const captureSelectionSnapshot = () => {
    const el = rootRef.current;
    if (!el) return;
    if (!isSelectionInside()) return;

    const selOff = getSelectionOffsets(el);
    const rect = getRangeRectSafe(el);

    selectionRef.current = selOff;

    if (selOff.from !== selOff.to) {
      selectionSnapshotRef.current = { ...selOff, rect };
    }
  };

  // Track selection changes
  useEffect(() => {
    const onSelChange = () => {
      const root = rootRef.current;
      if (!root) return;
      if (!isSelectionInside()) return;

      const selOff = getSelectionOffsets(root);
      const rect = getRangeRectSafe(root);

      selectionRef.current = selOff;

      if (selOff.from !== selOff.to) {
        selectionSnapshotRef.current = { ...selOff, rect };
      }
    };

    document.addEventListener("selectionchange", onSelChange);
    return () => document.removeEventListener("selectionchange", onSelChange);
  }, []);

  const emitDoc = (nextDoc, onChange, onHTMLChange) => {
    const normalized = normalizeDoc(nextDoc);
    const json = JSON.stringify(normalized);
    lastEmittedRef.current = json;

    docRef.current = normalized;
    setDoc(normalized);

    if (typeof onChange === "function") onChange(normalized);
    if (typeof onHTMLChange === "function") onHTMLChange(docToHTML(normalized));
  };

  const scheduleSyncFromDOM = (onChange, onHTMLChange) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      const el = rootRef.current;
      if (!el) return;

      selectionRef.current = getSelectionOffsets(el);
      const next = htmlToDoc(el.innerHTML);

      emitDoc(next, onChange, onHTMLChange);
    }, 200);
  };

  const calculateWordCount = () => {
    const plainText = docToPlainText(docRef.current);
    const words = plainText
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    return words.length;
  };

  return {
    // Refs
    rootRef,
    wrapRef,
    docRef,
    selectionRef,
    selectionSnapshotRef,
    debounceTimerRef,
    lastEmittedRef,

    // State
    doc,
    setDoc,

    // Methods
    isSelectionInside,
    getLiveSelection,
    getBestSelection,
    captureSelectionSnapshot,
    emitDoc,
    scheduleSyncFromDOM,
    calculateWordCount,
  };
}
