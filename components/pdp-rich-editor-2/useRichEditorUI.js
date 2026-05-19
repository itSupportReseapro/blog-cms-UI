import { useRef, useState } from "react";

export default function useRichEditorUI() {
  const linkInputRef = useRef(null);
  const tableRowsInputRef = useRef(null);
  const tableColsInputRef = useRef(null);

  const [linkUI, setLinkUI] = useState({ open: false, href: "", x: 0, y: 0 });
  const [tableUI, setTableUI] = useState({ open: false, rows: 2, cols: 2, x: 0, y: 0 });

  const [format, setFormat] = useState("p");
  const [align, setAlignState] = useState("left");
  const [color, setColorState] = useState("__none__");
  const [highlight, setHighlightState] = useState("__none__");
  const [fontSize, setFontSizeState] = useState("16px");
  const [activeMarks, setActiveMarks] = useState({
    b: false,
    i: false,
    u: false,
    s: false,
    sub: false,
    sup: false,
    a: false,
  });
  const [wordCount, setWordCount] = useState(0);

  return {
    // Refs
    linkInputRef,
    tableRowsInputRef,
    tableColsInputRef,

    // Link UI
    linkUI,
    setLinkUI,

    // Table UI
    tableUI,
    setTableUI,

    // Format/Alignment
    format,
    setFormat,
    align,
    setAlignState,
    color,
    setColorState,
    highlight,
    setHighlightState,
    fontSize,
    setFontSizeState,
    activeMarks,
    setActiveMarks,
    wordCount,
    setWordCount,
  };
}
