// components/pdp-rich-editor/index.js

export { default as RichEditor } from "./RichEditor";
export { docToHTML, docToPlainText, defaultDoc } from "./core";

// optional: expose selection helpers
export { getSelectionOffsets, setSelectionOffsets, getRangeRectSafe } from "./selection-dom";