import Image from "next/image";
import ToolbarButton from "./ToolbarButton";
import ToolbarSelect from "./ToolbarSelect";
import ToolbarGroup from "./ToolbarGroup";

import UndoIcon from "./assets/icons/undo-icon.svg";
import RedoIcon from "./assets/icons/redo-icon.svg";
import BoldIcon from "./assets/icons/bold-icon.svg";
import ItalicIcon from "./assets/icons/itallic-icon.svg";
import UnderlineIcon from "./assets/icons/underline-icon.svg";
import SubscriptIcon from "./assets/icons/subscript-icon.svg";
import SuperscriptIcon from "./assets/icons/superscript-icon.svg";
import StrikeIcon from "./assets/icons/strike-icon.svg";
import ParagraphIcon from "./assets/icons/paragraph-icon.svg";
import Heading1Icon from "./assets/icons/heading1-icon.svg";
import Heading2Icon from "./assets/icons/heading2-icon.svg";
import Heading3Icon from "./assets/icons/heading3-icon.svg";
import BulletListIcon from "./assets/icons/bullet-list-points-icon.svg";
import NumberListIcon from "./assets/icons/bullet-list-num-icon.svg";
import AlignLeftIcon from "./assets/icons/align-left-icon.svg";
import AlignCenterIcon from "./assets/icons/align-center-icon.svg";
import AlignRightIcon from "./assets/icons/align-right-icon.svg";
import JustifyIcon from "./assets/icons/justify-icon.svg";
import IncreaseIndentIcon from "./assets/icons/inc-indent-icon.svg";
import DecreaseIndentIcon from "./assets/icons/dec-indent-icon.svg";
import TableIcon from "./assets/icons/table-icon.svg";
import HyperlinkIcon from "./assets/icons/hyperlink-icon.svg";

function ToolbarIcon({ src, alt }) {
  return <Image src={src} alt={alt} width={14} height={14} className="re-btn__icon" />;
}

function SelectIconValue({ icon, label }) {
  return (
    <span className="re-select__icon-value">
      <ToolbarIcon src={icon} alt="" />
      <span>{label}</span>
    </span>
  );
}

const COLOR_OPTIONS = [
  { value: "__none__", label: "None" },
  { value: "#111827", label: "Black" },
  { value: "#ef4444", label: "Red" },
  { value: "#f59e0b", label: "Orange" },
  { value: "#22c55e", label: "Green" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#a855f7", label: "Purple" },
];

const HIGHLIGHT_OPTIONS = [
  { value: "__none__", label: "None" },
  { value: "#fef3c7", label: "Yellow" },
  { value: "#dcfce7", label: "Mint" },
  { value: "#fee2e2", label: "Rose" },
  { value: "#dbeafe", label: "Sky" },
  { value: "#ede9fe", label: "Lavender" },
];

const FONT_SIZE_OPTIONS = [
  { value: "12px", label: "12 px" },
  { value: "14px", label: "14 px" },
  { value: "16px", label: "16 px" },
  { value: "18px", label: "18 px" },
  { value: "20px", label: "20 px" },
  { value: "24px", label: "24 px" },
  { value: "32px", label: "32 px" },
];

function ColorOption(option, isSelected = false) {
  const isNone = option?.value === "__none__";

  return (
    <span className="re-color-option">
      <span
        className={["re-color-dot", isNone ? "re-color-dot--none" : ""].filter(Boolean).join(" ")}
        style={isNone ? undefined : { backgroundColor: option.value }}
        aria-hidden="true"
      />
      <span>{option.label}</span>
      {isSelected ? <span className="re-color-check">{"\u2713"}</span> : null}
    </span>
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
  onIndent,
  onInsertTable,
  onOpenLink,
  onFormatChange,
  onAlignChange,
  onColorChange,
  onHighlightChange,
  onFontSizeChange,
}) {
  return (
    <div className="re-toolbar">
      <ToolbarGroup>
        <ToolbarButton title="Undo" onBefore={onCaptureSelection} onClick={onUndo} disabled={disabled}>
          <ToolbarIcon src={UndoIcon} alt="Undo" />
        </ToolbarButton>
        <ToolbarButton title="Redo" onBefore={onCaptureSelection} onClick={onRedo} disabled={disabled}>
          <ToolbarIcon src={RedoIcon} alt="Redo" />
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
          <ToolbarIcon src={BoldIcon} alt="Bold" />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          onBefore={onCaptureSelection}
          onClick={() => onToggleMark("i")}
          disabled={disabled}
          active={activeMarks?.i}
        >
          <ToolbarIcon src={ItalicIcon} alt="Italic" />
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          onBefore={onCaptureSelection}
          onClick={() => onToggleMark("u")}
          disabled={disabled}
          active={activeMarks?.u}
        >
          <ToolbarIcon src={UnderlineIcon} alt="Underline" />
        </ToolbarButton>
        <ToolbarButton
          title="Subscript"
          onBefore={onCaptureSelection}
          onClick={() => onToggleMark("sub")}
          disabled={disabled}
          active={activeMarks?.sub}
        >
          <ToolbarIcon src={SubscriptIcon} alt="Subscript" />
        </ToolbarButton>
        <ToolbarButton
          title="Superscript"
          onBefore={onCaptureSelection}
          onClick={() => onToggleMark("sup")}
          disabled={disabled}
          active={activeMarks?.sup}
        >
          <ToolbarIcon src={SuperscriptIcon} alt="Superscript" />
        </ToolbarButton>
        <ToolbarButton
          title="Strikethrough"
          onBefore={onCaptureSelection}
          onClick={() => onToggleMark("s")}
          disabled={disabled}
          active={activeMarks?.s}
        >
          <ToolbarIcon src={StrikeIcon} alt="Strikethrough" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarSelect
          title="Format"
          value={format}
          onBeforeOpen={onCaptureSelection}
          disabled={disabled}
          onChange={onFormatChange}
          options={[
            { value: "p", label: "Paragraph", icon: ParagraphIcon },
            { value: "h1", label: "Heading 1", icon: Heading1Icon },
            { value: "h2", label: "Heading 2", icon: Heading2Icon },
            { value: "h3", label: "Heading 3", icon: Heading3Icon },
            { value: "code", label: "Code block", icon: ParagraphIcon },
            { value: "ul", label: "Bullets", icon: BulletListIcon },
            { value: "ol", label: "Numbered", icon: NumberListIcon },
          ]}
          renderValue={(option) => <SelectIconValue icon={option?.icon || ParagraphIcon} label={option?.label || "Paragraph"} />}
          renderOption={(option, isSelected) => (
            <span className="re-select__icon-option">
              <ToolbarIcon src={option.icon} alt="" />
              <span>{option.label}</span>
              {isSelected ? <span className="re-color-check">{"\u2713"}</span> : null}
            </span>
          )}
        />

        <ToolbarSelect
          title="Font size"
          value={fontSize}
          onBeforeOpen={onCaptureSelection}
          disabled={disabled}
          onChange={onFontSizeChange}
          options={FONT_SIZE_OPTIONS}
          renderValue={(option) => (
            <span className="re-select__icon-value">
              <span className="re-text-icon">T</span>
              <span>{option?.label || "16 px"}</span>
            </span>
          )}
          renderOption={(option, isSelected) => (
            <span className="re-select__icon-option">
              <span className="re-text-icon">T</span>
              <span>{option.label}</span>
              {isSelected ? <span className="re-color-check">{"\u2713"}</span> : null}
            </span>
          )}
        />
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarSelect
          title="Align"
          value={align}
          onBeforeOpen={onCaptureSelection}
          disabled={disabled}
          onChange={onAlignChange}
          options={[
            { value: "left", label: "Align Left", icon: AlignLeftIcon },
            { value: "center", label: "Align Center", icon: AlignCenterIcon },
            { value: "right", label: "Align Right", icon: AlignRightIcon },
            { value: "justify", label: "Justify", icon: JustifyIcon },
          ]}
          renderValue={(option) => <SelectIconValue icon={option?.icon || AlignLeftIcon} label={option?.label || "Align Left"} />}
          renderOption={(option, isSelected) => (
            <span className="re-select__icon-option">
              <ToolbarIcon src={option.icon} alt="" />
              <span>{option.label}</span>
              {isSelected ? <span className="re-color-check">{"\u2713"}</span> : null}
            </span>
          )}
        />
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton title="Indent" onBefore={onCaptureSelection} onClick={() => onIndent(1)} disabled={disabled}>
          <ToolbarIcon src={IncreaseIndentIcon} alt="Indent" />
        </ToolbarButton>
        <ToolbarButton title="Outdent" onBefore={onCaptureSelection} onClick={() => onIndent(-1)} disabled={disabled}>
          <ToolbarIcon src={DecreaseIndentIcon} alt="Outdent" />
        </ToolbarButton>
        <ToolbarButton title="Insert Table" onBefore={onCaptureSelection} onClick={onInsertTable} disabled={disabled}>
          <ToolbarIcon src={TableIcon} alt="Insert table" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarSelect
          title="Text color"
          value={color}
          onBeforeOpen={onCaptureSelection}
          disabled={disabled}
          onChange={onColorChange}
          options={COLOR_OPTIONS}
          menuClassName="re-select__menu--color"
          renderValue={(option) => ColorOption(option || COLOR_OPTIONS[0])}
          renderOption={(option, isSelected) => ColorOption(option, isSelected)}
        />

        <ToolbarSelect
          title="Highlight"
          value={highlight}
          onBeforeOpen={onCaptureSelection}
          disabled={disabled}
          onChange={onHighlightChange}
          options={HIGHLIGHT_OPTIONS}
          menuClassName="re-select__menu--color"
          renderValue={(option) => ColorOption(option || HIGHLIGHT_OPTIONS[0])}
          renderOption={(option, isSelected) => ColorOption(option, isSelected)}
        />

        <ToolbarButton
          title="Link"
          onBefore={onCaptureSelection}
          onClick={onOpenLink}
          disabled={disabled}
          active={activeMarks?.a}
        >
          <ToolbarIcon src={HyperlinkIcon} alt="Link" />
        </ToolbarButton>
      </ToolbarGroup>
    </div>
  );
}
