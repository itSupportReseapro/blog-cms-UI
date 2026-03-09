"use client";

import React, { useEffect, useRef, useState } from "react";
import "./RichEditor.css";

import { defaultDoc, normalizeDoc, docToHTML } from "./core";

import {
  getSelectionOffsets,
  setSelectionOffsets,
} from "./selection-dom";

import {
  indentBlock,
  toggleInlineMark,
  setBlockType,
  toggleList,
  setAlign,
  setColor,
} from "./commands";

/* ---------------- HTML helpers ---------------- */

function docToEditableHTML(doc) {
  const d = normalizeDoc(doc);

  return d.content
    .map((b) => {
      const text = (b.content || []).map((r) => r.text || "").join("");

      if (b.type === "h") {
        const lvl = b.level || 2;
        return `<h${lvl}>${text}</h${lvl}>`;
      }

      return `<p>${text}</p>`;
    })
    .join("");
}

function htmlToDoc(html) {

  const parser = new DOMParser();
  const dom = parser.parseFromString(html, "text/html");
  const blocks = [];

  dom.body.childNodes.forEach((node) => {

    const text = node.textContent || "";

    if (node.nodeName === "H1")
      blocks.push({ type: "h", level: 1, content: [{ text }] });

    else if (node.nodeName === "H2")
      blocks.push({ type: "h", level: 2, content: [{ text }] });

    else if (node.nodeName === "H3")
      blocks.push({ type: "h", level: 3, content: [{ text }] });

    else
      blocks.push({ type: "p", content: [{ text }] });

  });

  return normalizeDoc({
    type: "doc",
    content: blocks.length ? blocks : [{ type: "p", content: [{ text: "" }] }]
  });
}

/* ---------------- Toolbar UI ---------------- */

function Btn({ onClick, children, title }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="re-btn"
    >
      {children}
    </button>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="re-select"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Group({ children }) {
  return <div className="re-group">{children}</div>;
}

/* ---------------- Editor ---------------- */

export default function RichEditor({
  value,
  onChange,
  onHTMLChange,
  placeholder = "Write…",
  disabled = false,
  className,
  style,
}) {

  const rootRef = useRef(null);

  const [doc, setDoc] = useState(() =>
    normalizeDoc(value || defaultDoc())
  );

  const docRef = useRef(doc);

  useEffect(() => {
    docRef.current = doc;
  }, [doc]);

  const historyRef = useRef({
    undo: [],
    redo: []
  });

  const selectionRef = useRef({ from: 0, to: 0 });

  const emitDoc = (nextDoc) => {

    const normalized = normalizeDoc(nextDoc);

    docRef.current = normalized;
    setDoc(normalized);

    if (onChange) onChange(normalized);
    if (onHTMLChange) onHTMLChange(docToHTML(normalized));
  };

  const pushHistory = (prev) => {

    const h = historyRef.current;

    h.undo.push(prev);

    if (h.undo.length > 100)
      h.undo.shift();

    h.redo = [];
  };

  const applyTx = (tx) => {

    const el = rootRef.current;
    if (!el) return;

    const sel = selectionRef.current;
    const prev = docRef.current;

    const result = tx(prev, sel);

    const next = result?.doc || prev;

    pushHistory(prev);

    el.innerHTML = docToEditableHTML(next);

    emitDoc(next);
  };

  const scheduleSyncFromDOM = () => {

    const el = rootRef.current;
    if (!el) return;

    const next = htmlToDoc(el.innerHTML);

    pushHistory(docRef.current);

    emitDoc(next);
  };

  const undo = () => {

    const el = rootRef.current;
    const h = historyRef.current;

    const prev = h.undo.pop();

    if (!prev) return;

    h.redo.push(docRef.current);

    el.innerHTML = docToEditableHTML(prev);

    emitDoc(prev);
  };

  const redo = () => {

    const el = rootRef.current;
    const h = historyRef.current;

    const next = h.redo.pop();

    if (!next) return;

    h.undo.push(docRef.current);

    el.innerHTML = docToEditableHTML(next);

    emitDoc(next);
  };

  const onKeyDown = (e) => {

    const mod = e.ctrlKey || e.metaKey;

    if (mod && e.key === "z") {
      e.preventDefault();
      undo();
    }

    if (mod && e.key === "y") {
      e.preventDefault();
      redo();
    }

    if (e.key === "Tab") {
      e.preventDefault();
      applyTx((d, s) => indentBlock(d, s, 1));
    }
  };

  return (
    <div
      className={`re-wrapper ${className || ""}`}
      style={style}
    >

      <div className="re-toolbar">

        <Group>
          <Btn onClick={undo}>↶</Btn>
          <Btn onClick={redo}>↷</Btn>
        </Group>

        <Group>
          <Btn onClick={() => applyTx((d, s) => toggleInlineMark(d, s, "b"))}>B</Btn>
          <Btn onClick={() => applyTx((d, s) => toggleInlineMark(d, s, "i"))}>I</Btn>
          <Btn onClick={() => applyTx((d, s) => toggleInlineMark(d, s, "u"))}>U</Btn>
        </Group>

        <Group>
          <Select
            value="p"
            onChange={(v) => {
              if (v === "p") applyTx((d, s) => setBlockType(d, s, "p"));
              if (v === "h1") applyTx((d, s) => setBlockType(d, s, "h", 1));
              if (v === "h2") applyTx((d, s) => setBlockType(d, s, "h", 2));
              if (v === "ul") applyTx((d, s) => toggleList(d, s, "ul"));
            }}
            options={[
              { value: "p", label: "Paragraph" },
              { value: "h1", label: "Heading 1" },
              { value: "h2", label: "Heading 2" },
              { value: "ul", label: "Bullets" },
            ]}
          />
        </Group>

      </div>

      <div
        ref={rootRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={scheduleSyncFromDOM}
        onBlur={scheduleSyncFromDOM}
        onKeyDown={onKeyDown}
        className={`re-editor ${disabled ? "disabled" : ""}`}
        data-placeholder={placeholder}
      />

    </div>
  );
}