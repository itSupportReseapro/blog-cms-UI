// src/index.js

// Main component
export { default as RichEditor } from "./RichEditor";

// Sub-components & UI
export { default as Toolbar } from "./components/toolbar/Toolbar";
export { default as ToolbarButton } from "./components/toolbar/ToolbarButton";
export { default as ToolbarSelect } from "./components/toolbar/ToolbarSelect";
export { default as ToolbarGroup } from "./components/toolbar/ToolbarGroup";
export { default as Editor } from "./components/Editor";
export { default as EditorFooter } from "./components/EditorFooter";
export { default as LinkModal } from "./components/modals/LinkModal";
export { default as LinkPopup } from "./components/modals/LinkPopup";
export { default as TablePopup } from "./components/modals/TablePopup";

// Media, Equation, & Symbol sub-components
export { default as ImageModal } from "./components/modals/ImageModal";
export { default as ImageToolbar } from "./components/modals/ImageToolbar";
export { default as EquationModal } from "./components/modals/EquationModal";
export { default as EquationPalette } from "./components/modals/EquationPalette";
export { default as EquationCanvas } from "./components/modals/EquationCanvas";
export { default as SymbolPopup } from "./components/modals/SymbolPopup";
export { EquationView, MathNode } from "./math/renderMathML";

// Custom hooks
export { default as useRichEditorState } from "./hooks/useRichEditorState";
export { default as useRichEditorHistory } from "./hooks/useRichEditorHistory";
export { default as useRichEditorUI } from "./hooks/useRichEditorUI";

// Core Utilities
export {
  docToHTML,
  docToPlainText,
  defaultDoc,
  normalizeDoc,
  blockToPlainText,
  blockToIndexText,
  OBJECT_REPLACEMENT_CHAR,
} from "./core/core";
export { docToEditableHTML, htmlToDoc } from "./core/conversion";
export { findContainingBlock, getLinkHrefInRange, getLinkRangeAtPos } from "./utils/helpers";
export { getSelectionOffsets, setSelectionOffsets, getRangeRectSafe } from "./utils/selection-dom";
export {
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
