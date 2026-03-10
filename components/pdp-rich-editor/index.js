// components/pdp-rich-editor/index.js

// Main component
export { default as RichEditor } from "./RichEditor";

// Sub-components
export { default as Toolbar } from "./Toolbar";
export { default as ToolbarButton } from "./ToolbarButton";
export { default as ToolbarSelect } from "./ToolbarSelect";
export { default as ToolbarGroup } from "./ToolbarGroup";
export { default as Editor } from "./Editor";
export { default as EditorFooter } from "./EditorFooter";
export { default as LinkPopup } from "./LinkPopup";
export { default as TablePopup } from "./TablePopup";

// Custom hooks
export { default as useRichEditorState } from "./useRichEditorState";
export { default as useRichEditorHistory } from "./useRichEditorHistory";
export { default as useRichEditorUI } from "./useRichEditorUI";

// Utilities
export { docToHTML, docToPlainText, defaultDoc, normalizeDoc } from "./core";
export { docToEditableHTML, htmlToDoc } from "./conversion";
export { findContainingBlock, getLinkHrefInRange } from "./helpers";
export { getSelectionOffsets, setSelectionOffsets, getRangeRectSafe } from "./selection-dom";
export { 
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