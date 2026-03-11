# Rich Text Editor - Modular Documentation

## Folder Structure

```
pdp-rich-editor/
├── core.js                 # Core data structures (doc model)
├── commands.js             # Editor commands (tx functions)
├── selection-dom.js        # DOM selection utilities
├── conversion.js           # HTML <-> DOC conversion utilities
├── helpers.js              # Helper functions
├── RichEditor.css         # Styles
├── index.js               # Main exports
│
├── RichEditor.js          # Main orchestrator component
│                          # Handles all state management & prop passing
│
├── useRichEditorState.js  # Custom hook - editor state management
├── useRichEditorHistory.js # Custom hook - undo/redo history
├── useRichEditorUI.js     # Custom hook - UI state (dialogs, formats)
│
├── Toolbar.js             # Toolbar container component
├── ToolbarButton.js       # Button sub-component
├── ToolbarSelect.js       # Select/dropdown sub-component
├── ToolbarGroup.js        # Group container sub-component
│
├── Editor.js              # ContentEditable area component
├── EditorFooter.js        # Footer with word count
├── LinkPopup.js           # Link insertion popup component
└── TablePopup.js          # Table insertion popup component
```

## Architecture Pattern

The rich editor follows the **pdp-table modular pattern** with:

1. **Main Component** (`RichEditor.js`)
   - Orchestrates all functionality
   - Manages component composition
   - Passes props to sub-components
   - Handles core editor logic

2. **Custom Hooks** (3 hooks)
   - State management separated from UI
   - Reusable logic
   - Clean separation of concerns

3. **Sub-Components** (8 components)
   - Focused on single responsibilities
   - Receive props from parent
   - No internal state (except UI hooks)
   - Composable and reusable

4. **Utilities** (5 files)
   - Data transformation
   - DOM helpers
   - Command logic
   - Conversion functions

## Component Props Pattern

### RichEditor (Main)
```javascript
<RichEditor
  value={doc}
  onChange={(doc) => {}}
  onHTMLChange={(html) => {}}
  placeholder="Write…"
  disabled={false}
  className=""
  style={{}}
/>
```

### Sub-Components (Prop-Passing)
Each sub-component receives only the props it needs:

**Toolbar**
```javascript
<Toolbar
  disabled={disabled}
  format={ui.format}
  align={ui.align}
  color={ui.color}
  onCaptureSelection={...}
  onUndo={...}
  onRedo={...}
  onToggleMark={...}
  onFormatChange={...}
/>
```

**Editor**
```javascript
<Editor
  rootRef={rootRef}
  placeholder={placeholder}
  disabled={disabled}
  onInput={...}
  onBlur={...}
  onKeyDown={...}
/>
```

**LinkPopup & TablePopup**
```javascript
<LinkPopup
  linkUI={ui.linkUI}
  linkInputRef={linkInputRef}
  onHrefChange={...}
  onApply={...}
  onRemove={...}
/>
```

## Custom Hooks

### useRichEditorState
Manages editor content and selection:
- Document state
- Selection tracking  
- DOM sync
- History integration

### useRichEditorHistory
Manages undo/redo:
- History stacks (undo/redo)
- Push/pop operations
- Document restoration

### useRichEditorUI
Manages UI state:
- Format selection (p, h1, h2, h3, ul, ol)
- Alignment (left, center, right, justify)
- Text color
- Popup visibility & data
- Word count

## Usage Example

```javascript
import { RichEditor } from "@/components/pdp-rich-editor";

export function MyEditor() {
  const [doc, setDoc] = useState(null);
  const [html, setHtml] = useState("");

  return (
    <RichEditor
      value={doc}
      onChange={setDoc}
      onHTMLChange={setHtml}
      placeholder="Start writing..."
    />
  );
}
```

## Importing Sub-Components

If you need specific sub-components for custom layouts:

```javascript
import {
  Toolbar,
  Editor,
  EditorFooter,
  LinkPopup,
  TablePopup,
  useRichEditorState,
  useRichEditorHistory,
  useRichEditorUI,
} from "@/components/pdp-rich-editor";
```

## Benefits of This Structure

1. **Modularity** - Each part is self-contained
2. **Reusability** - Sub-components can be composed differently
3. **Testability** - Small, focused units are easier to test
4. **Maintainability** - Clear separation of concerns
5. **Extensibility** - Easy to add new features or modify existing ones
6. **Performance** - Better control over re-renders via prop passing
