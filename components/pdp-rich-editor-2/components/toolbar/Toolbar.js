import { useEffect, useRef, useState } from "react";
import ToolbarButton from "./ToolbarButton";
import ToolbarSelect from "./ToolbarSelect";
import ToolbarGroup from "./ToolbarGroup";
import ColorPickerPopup from "../modals/ColorPickerPopup";
import {
  UndoIcon,
  RedoIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikeThroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  AlignJustifyIcon,
  OutdentIcon,
  IndentIcon,
  InsertTableIcon,
  InsertImageIcon,
  InsertLinkIcon,
  SymbolsIcon,
  OrderedListIcon,
  UnorderedListIcon,
  TextColorIcon,
  BackgroundColorIcon,
} from "../icons";

const FONT_SIZE_OPTIONS = [
  { value: "12px", label: "12 px" },
  { value: "14px", label: "14 px" },
  { value: "16px", label: "16 px" },
  { value: "18px", label: "18 px" },
  { value: "20px", label: "20 px" },
  { value: "24px", label: "24 px" },
  { value: "32px", label: "32 px" },
];

function ColorTrigger({ title, icon: Icon, value, onClick, isOpen }) {
  const isNone = !value || value === "__none__";
  const displayColor = isNone ? "#64748b" : value;

  return (
    <button
      type="button"
      title={title}
      className={["re-btn", "re-color-btn", isOpen ? "re-btn--active" : ""].filter(Boolean).join(" ")}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
        <Icon style={{ width: "16px", height: "16px" }} />
        <span
          style={{
            width: "14px",
            height: "3px",
            borderRadius: "1px",
            backgroundColor: isNone ? "transparent" : displayColor,
            border: isNone ? "1px stroke #ef4444" : "none",
            background: isNone ? "linear-gradient(45deg, transparent 40%, #ef4444 40%, #ef4444 60%, transparent 60%)" : displayColor,
          }}
          aria-hidden="true"
        />
      </div>
    </button>
  );
}

export default function Toolbar({
  disabled,
  format,
  align,
  color,
  highlight,
  fontSize,
  activeMarks,
  onCaptureSelection,
  onUndo,
  onRedo,
  onToggleMark,
  onSetBlockType,
  onToggleList,
  onSetAlign,
  onIndent,
  onInsertTable,
  onInsertImage,
  onInsertEquation,
  onInsertSymbol,
  onSetColor,
  onSetHighlight,
  onSetFontSize,
  onOpenLink,
  onFormatChange,
  onAlignChange,
  onColorChange,
  onHighlightChange,
  onFontSizeChange,
}) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [highlightPickerOpen, setHighlightPickerOpen] = useState(false);

  const colorGroupRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (colorGroupRef.current && !colorGroupRef.current.contains(e.target)) {
        setColorPickerOpen(false);
        setHighlightPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="re-toolbar">
      <ToolbarGroup>
        <ToolbarButton title="Undo" onBefore={onCaptureSelection} onClick={onUndo} disabled={disabled}>
          <UndoIcon />
        </ToolbarButton>
        <ToolbarButton title="Redo" onBefore={onCaptureSelection} onClick={onRedo} disabled={disabled}>
          <RedoIcon />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton
          title="Bold"
          onBefore={onCaptureSelection}
          onClick={() => onToggleMark("b")}
          disabled={disabled}
          active={activeMarks?.b}
        >
          <BoldIcon />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          onBefore={onCaptureSelection}
          onClick={() => onToggleMark("i")}
          disabled={disabled}
          active={activeMarks?.i}
        >
          <ItalicIcon />
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          onBefore={onCaptureSelection}
          onClick={() => onToggleMark("u")}
          disabled={disabled}
          active={activeMarks?.u}
        >
          <UnderlineIcon />
        </ToolbarButton>
        <ToolbarButton
          title="Strikethrough"
          onBefore={onCaptureSelection}
          onClick={() => onToggleMark("s")}
          disabled={disabled}
          active={activeMarks?.s}
        >
          <StrikeThroughIcon />
        </ToolbarButton>
        <ToolbarButton
          title="Subscript"
          onBefore={onCaptureSelection}
          onClick={() => onToggleMark("sub")}
          disabled={disabled}
          active={activeMarks?.sub}
        >
          <SubscriptIcon />
        </ToolbarButton>
        <ToolbarButton
          title="Superscript"
          onBefore={onCaptureSelection}
          onClick={() => onToggleMark("sup")}
          disabled={disabled}
          active={activeMarks?.sup}
        >
          <SuperscriptIcon />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarSelect
          title="Format"
          value={format}
          onBeforeOpen={onCaptureSelection}
          onChange={onFormatChange}
          options={[
            { value: "p", label: "Paragraph" },
            { value: "h1", label: "Heading 1" },
            { value: "h2", label: "Heading 2" },
            { value: "h3", label: "Heading 3" },
            { value: "code", label: "Code block" },
          ]}
        />

        <ToolbarSelect
          title="Font size"
          value={fontSize}
          onBeforeOpen={onCaptureSelection}
          onChange={onFontSizeChange}
          options={FONT_SIZE_OPTIONS}
          renderValue={(option) => option?.label || "16 px"}
        />
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton
          title="Align Left"
          onBefore={onCaptureSelection}
          onClick={() => onAlignChange("left")}
          disabled={disabled}
          active={align === "left"}
        >
          <AlignLeftIcon />
        </ToolbarButton>
        <ToolbarButton
          title="Align Center"
          onBefore={onCaptureSelection}
          onClick={() => onAlignChange("center")}
          disabled={disabled}
          active={align === "center"}
        >
          <AlignCenterIcon />
        </ToolbarButton>
        <ToolbarButton
          title="Align Right"
          onBefore={onCaptureSelection}
          onClick={() => onAlignChange("right")}
          disabled={disabled}
          active={align === "right"}
        >
          <AlignRightIcon />
        </ToolbarButton>
        <ToolbarButton
          title="Justify"
          onBefore={onCaptureSelection}
          onClick={() => onAlignChange("justify")}
          disabled={disabled}
          active={align === "justify"}
        >
          <AlignJustifyIcon />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton
          title="Bullet List"
          onBefore={onCaptureSelection}
          onClick={() => onToggleList("ul")}
          disabled={disabled}
          active={format === "ul"}
        >
          <UnorderedListIcon />
        </ToolbarButton>
        <ToolbarButton
          title="Numbered List"
          onBefore={onCaptureSelection}
          onClick={() => onToggleList("ol")}
          disabled={disabled}
          active={format === "ol"}
        >
          <OrderedListIcon />
        </ToolbarButton>
        <ToolbarButton title="Outdent" onBefore={onCaptureSelection} onClick={() => onIndent(-1)} disabled={disabled}>
          <OutdentIcon />
        </ToolbarButton>
        <ToolbarButton title="Indent" onBefore={onCaptureSelection} onClick={() => onIndent(1)} disabled={disabled}>
          <IndentIcon />
        </ToolbarButton>
        <ToolbarButton title="Insert Table" onBefore={onCaptureSelection} onClick={onInsertTable} disabled={disabled}>
          <InsertTableIcon />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton
          title="Insert Image"
          onBefore={onCaptureSelection}
          onClick={onInsertImage}
          disabled={disabled}
        >
          <InsertImageIcon />
        </ToolbarButton>

        <ToolbarButton
          title="Insert Equation"
          onBefore={onCaptureSelection}
          onClick={onInsertEquation}
          disabled={disabled}
        >
          <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: "600" }}>ƒx</span>
        </ToolbarButton>

        <ToolbarButton
          title="Insert Symbol"
          onBefore={onCaptureSelection}
          onClick={onInsertSymbol}
          disabled={disabled}
        >
          <SymbolsIcon />
        </ToolbarButton>
      </ToolbarGroup>

      <div ref={colorGroupRef} style={{ display: "inline-flex", gap: "4px" }}>
        <ToolbarGroup style={{ position: "relative" }}>
          <div style={{ position: "relative" }}>
            <ColorTrigger
              title="Text color"
              icon={TextColorIcon}
              value={color}
              isOpen={colorPickerOpen}
              onClick={() => {
                if (typeof onCaptureSelection === "function") onCaptureSelection();
                setHighlightPickerOpen(false);
                setColorPickerOpen((prev) => !prev);
              }}
            />
            {colorPickerOpen && (
              <ColorPickerPopup
                value={color}
                allowNone={false}
                title="Text Color (256 / RGB)"
                onChange={(newCol) => {
                  onColorChange(newCol);
                }}
                onClose={() => setColorPickerOpen(false)}
                position={{ top: "calc(100% + 6px)", left: 0 }}
              />
            )}
          </div>

          <div style={{ position: "relative" }}>
            <ColorTrigger
              title="Background highlight"
              icon={BackgroundColorIcon}
              value={highlight}
              isOpen={highlightPickerOpen}
              onClick={() => {
                if (typeof onCaptureSelection === "function") onCaptureSelection();
                setColorPickerOpen(false);
                setHighlightPickerOpen((prev) => !prev);
              }}
            />
            {highlightPickerOpen && (
              <ColorPickerPopup
                value={highlight}
                allowNone={true}
                title="Highlight Color (256 / RGB)"
                onChange={(newCol) => {
                  onHighlightChange(newCol);
                }}
                onClose={() => setHighlightPickerOpen(false)}
                position={{ top: "calc(100% + 6px)", left: 0 }}
              />
            )}
          </div>

          <ToolbarButton
            title="Link"
            onBefore={onCaptureSelection}
            onClick={onOpenLink}
            disabled={disabled}
            active={activeMarks?.a}
          >
            <InsertLinkIcon />
          </ToolbarButton>
        </ToolbarGroup>
      </div>
    </div>
  );
}

