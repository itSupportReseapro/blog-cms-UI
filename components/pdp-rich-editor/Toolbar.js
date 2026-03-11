import ToolbarButton from "./ToolbarButton";
import ToolbarSelect from "./ToolbarSelect";
import ToolbarGroup from "./ToolbarGroup";

export default function Toolbar({
  disabled,
  format,
  align,
  color,
  onCaptureSelection,
  onUndo,
  onRedo,
  onToggleMark,
  onSetBlockType,
  onToggleList,
  onSetAlign,
  onIndent,
  onInsertTable,
  onSetColor,
  onOpenLink,
  onFormatChange,
  onAlignChange,
  onColorChange,
}) {
  return (
    <div className="re-toolbar">
      <ToolbarGroup>
        <ToolbarButton title="Undo" onBefore={onCaptureSelection} onClick={onUndo} disabled={disabled}>
          ↶
        </ToolbarButton>
        <ToolbarButton title="Redo" onBefore={onCaptureSelection} onClick={onRedo} disabled={disabled}>
          ↷
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton 
          title="Bold" 
          onBefore={onCaptureSelection} 
          onClick={() => onToggleMark("b")} 
          disabled={disabled}
        >
          B
        </ToolbarButton>
        <ToolbarButton 
          title="Italic" 
          onBefore={onCaptureSelection} 
          onClick={() => onToggleMark("i")} 
          disabled={disabled}
        >
          I
        </ToolbarButton>
        <ToolbarButton 
          title="Underline" 
          onBefore={onCaptureSelection} 
          onClick={() => onToggleMark("u")} 
          disabled={disabled}
        >
          U
        </ToolbarButton>
        <ToolbarButton 
          title="Subscript" 
          onBefore={onCaptureSelection} 
          onClick={() => onToggleMark("sub")} 
          disabled={disabled}
        >
          X<sub>2</sub>
        </ToolbarButton>
        <ToolbarButton 
          title="Superscript" 
          onBefore={onCaptureSelection} 
          onClick={() => onToggleMark("sup")} 
          disabled={disabled}
        >
          X<sup>2</sup>
        </ToolbarButton>
        <ToolbarButton 
          title="Strikethrough" 
          onBefore={onCaptureSelection} 
          onClick={() => onToggleMark("s")} 
          disabled={disabled}
        >
          S
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
            { value: "ul", label: "Bullets" },
            { value: "ol", label: "Numbered" },
          ]}
        />
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarSelect
          title="Align"
          value={align}
          onBeforeOpen={onCaptureSelection}
          onChange={onAlignChange}
          options={[
            { value: "left", label: "Align Left" },
            { value: "center", label: "Align Center" },
            { value: "right", label: "Align Right" },
            { value: "justify", label: "Justify" },
          ]}
        />
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton 
          title="Indent" 
          onBefore={onCaptureSelection} 
          onClick={() => onIndent(1)} 
          disabled={disabled}
        >
          ⇥
        </ToolbarButton>
        <ToolbarButton 
          title="Outdent" 
          onBefore={onCaptureSelection} 
          onClick={() => onIndent(-1)} 
          disabled={disabled}
        >
          ⇤
        </ToolbarButton>
        <ToolbarButton 
          title="Insert Table" 
          onBefore={onCaptureSelection} 
          onClick={onInsertTable} 
          disabled={disabled}
        >
          ⊞
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarSelect
          title="Text color"
          value={color}
          onBeforeOpen={onCaptureSelection}
          onChange={onColorChange}
          options={[
            { value: "#111111", label: "Black" },
            { value: "#ef4444", label: "Red" },
            { value: "#f59e0b", label: "Orange" },
            { value: "#22c55e", label: "Green" },
            { value: "#3b82f6", label: "Blue" },
            { value: "#a855f7", label: "Purple" },
          ]}
        />
        <ToolbarButton 
          title="Link" 
          onBefore={onCaptureSelection} 
          onClick={onOpenLink} 
          disabled={disabled}
        >
          🔗
        </ToolbarButton>
      </ToolbarGroup>
    </div>
  );
}
