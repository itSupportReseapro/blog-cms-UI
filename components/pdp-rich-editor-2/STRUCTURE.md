# Rich Text Editor - Modular Documentation

## Folder Structure

```
pdp-rich-editor/
├── core.js                  # Core data structures (doc model)
├── commands.js              # Editor commands (tx functions)
├── selection-dom.js         # DOM selection utilities
├── conversion.js            # HTML <-> DOC conversion utilities
├── helpers.js               # Helper functions
├── RichEditor.css           # Styles
├── index.js                 # Main exports
│
├── RichEditor.js            # Main orchestrator component
│                           # Handles all state management & prop passing
│
├── useRichEditorState.js    # Custom hook - editor state management
├── useRichEditorHistory.js  # Custom hook - undo/redo history
├── useRichEditorUI.js       # Custom hook - UI state (dialogs, formats)
│
├── Toolbar.js               # Toolbar container component
├── ToolbarButton.js         # Button sub-component
├── ToolbarSelect.js         # Select/dropdown sub-component
├── ToolbarGroup.js          # Group container sub-component
│
├── Editor.js                # ContentEditable area component
├── EditorFooter.js          # Footer with word count
├── LinkModal.js             # Link insertion modal used by RichEditor
├── LinkPopup.js             # Legacy popup export kept for compatibility
└── TablePopup.js            # Table insertion popup component
```

## Notes

- `RichEditor` uses `LinkModal` internally.
- `LinkPopup` is still exported for backward compatibility, but it is not the default link UI used by the main editor.
- Table text selection offsets now account for cell tabs and row newlines.
- Toolbar formatting commands safely skip table blocks instead of crashing.
- Typing now contributes to undo history in throttled snapshots.
- Removing a link also removes the editor's default auto-link blue color.
