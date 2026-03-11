import { useRef, useState } from "react";

export default function useRichEditorUI() {
  const linkInputRef = useRef(null);
  const tableRowsInputRef = useRef(null);
  const tableColsInputRef = useRef(null);

  const [linkUI, setLinkUI] = useState({ open: false, href: "", x: 0, y: 0 });
  const [tableUI, setTableUI] = useState({ open: false, rows: 2, cols: 2, x: 0, y: 0 });

  const [format, setFormat] = useState("p");
  const [align, setAlignState] = useState("left");
  const [color, setColorState] = useState("#111111");
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
    wordCount,
    setWordCount,
  };
}
