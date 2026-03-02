"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { BubbleMenu } from "@tiptap/react/menus";
import { useEffect, useState, useRef } from "react";
import "./richtext.css";
import Tooltip from "@/assets/tooltip/ToolTip";

export default function RichTextEditor({ value, onChange }) {
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      Highlight,
      Subscript,
      Superscript,
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
      }),
      Image,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Table.configure({
        resizable: true,
        allowTableNodeSelection: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder:
          "Place your contents here. All formatting can be done from here too!",
      }),
      CharacterCount,
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!mounted || !editor) return null;

  const addLink = () => {
    const url = prompt("Enter URL");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      editor.chain().focus().setImage({ src: reader.result }).run();
    };
    reader.readAsDataURL(file);
  };

  const ToolbarButton = ({ label, onClick, children, active }) => (
    <Tooltip text={label}>
      <button
        type="button"
        onClick={onClick}
        className={active ? "active-tool" : ""}
      >
        {children}
      </button>
    </Tooltip>
  );

  return (
    <div className="rte-wrapper">
      {/* HIDDEN FILE INPUT — ADD HERE */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleImageUpload}
      />
      <div className="rte-toolbar">
        {/* Basic */}
        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </ToolbarButton>

        <ToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </ToolbarButton>

        <ToolbarButton
          label="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          U
        </ToolbarButton>

        <ToolbarButton
          label="Strike"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          S
        </ToolbarButton>

        {/* Super / Sub */}
        <ToolbarButton
          label="Superscript"
          active={editor.isActive("superscript")}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
        >
          X²
        </ToolbarButton>

        <ToolbarButton
          label="Subscript"
          active={editor.isActive("subscript")}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
        >
          X₂
        </ToolbarButton>

        {/* Highlight */}
        <ToolbarButton
          label="Highlight"
          active={editor.isActive("highlight")}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          🖍
        </ToolbarButton>

        {/* Headings */}
        <Tooltip text="Heading level" position="top">
          <select
            onChange={(e) =>
              editor
                .chain()
                .focus()
                .toggleHeading({ level: Number(e.target.value) })
                .run()
            }
          >
            <option value="">Paragraph</option>
            <option value="1">H1</option>
            <option value="2">H2</option>
            <option value="3">H3</option>
            <option value="4">H4</option>
            <option value="5">H5</option>
            <option value="6">H6</option>
          </select>
        </Tooltip>

        {/* Lists */}
        <ToolbarButton
          label="Bullet List"
          active={editor.isActive("bulletlist")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •
        </ToolbarButton>

        <ToolbarButton
          label="Ordered List"
          active={editor.isActive("orderlist")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </ToolbarButton>

        {/* Alignment */}
        <ToolbarButton
          label="Align Left"
          active={editor.isActive("alignleft")}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          ⬅
        </ToolbarButton>

        <ToolbarButton
          label="Align Center"
          active={editor.isActive("aligncenter")}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          ⬍
        </ToolbarButton>

        <ToolbarButton
          label="Align Right"
          active={editor.isActive("alignright")}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          ➡
        </ToolbarButton>

        {/* Block tools */}
        <ToolbarButton
          label="Quote Text"
          onClick={() => {
            const { from, to } = editor.state.selection;
            const selectedText = editor.state.doc.textBetween(from, to);

            if (!selectedText) return;

            editor.chain().focus().insertContent(`“${selectedText}”`).run();
          }}
        >
          ❝❞
        </ToolbarButton>

        <ToolbarButton
          label="Code Block"
          active={editor.isActive("codeblock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          {"</>"}
        </ToolbarButton>

        <ToolbarButton
          label="Horizontal Line"
          active={editor.isActive("horizontalline")}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          ―
        </ToolbarButton>

        {/* Link & Image */}
        <ToolbarButton
          label="Insert Link"
          onClick={addLink}
          active={editor.isActive("insertlink")}
        >
          🔗
        </ToolbarButton>

        <ToolbarButton
          label="Insert Image"
          active={editor.isActive("insertimage")}
          onClick={() => fileInputRef.current.click()}
        >
          🖼
        </ToolbarButton>

        {/* Table */}
        <ToolbarButton
          label="Insert Table"
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()
          }
          active={editor.isActive("inserttable")}
        >
          Table
        </ToolbarButton>

        {/* TABLE CONTROLS */}
        <ToolbarButton
          label="Add Row Below"
          active={editor.isActive("addrowbellow")}
          onClick={() => editor.chain().focus().addRowAfter().run()}
        >
          ➕ Row
        </ToolbarButton>

        <ToolbarButton
          label="Add Column Right"
          active={editor.isActive("addcolumnright")}
          onClick={() => editor.chain().focus().addColumnAfter().run()}
        >
          ➕ Col
        </ToolbarButton>

        <ToolbarButton
          label="Delete Row"
          active={editor.isActive("deleterow")}
          onClick={() => editor.chain().focus().deleteRow().run()}
        >
          ❌ Row
        </ToolbarButton>

        <ToolbarButton
          label="Delete Column"
          active={editor.isActive("deletecolumn")}
          onClick={() => editor.chain().focus().deleteColumn().run()}
        >
          ❌ Col
        </ToolbarButton>

        <ToolbarButton
          label="Delete Table"
          active={editor.isActive("deletetable")}
          onClick={() => editor.chain().focus().deleteTable().run()}
        >
          ❌ Table
        </ToolbarButton>

        <ToolbarButton
          label="Task List"
          active={editor.isActive("tasklist")}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        >
          ☑
        </ToolbarButton>

        {/* Undo / Redo */}
        <ToolbarButton
          label="Undo"
          active={editor.isActive("undo")}
          onClick={() => editor.chain().focus().undo().run()}
        >
          ↺
        </ToolbarButton>

        <ToolbarButton
          label="Redo"
          active={editor.isActive("redo")}
          onClick={() => editor.chain().focus().redo().run()}
        >
          ↻
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} className="rte-editor" />

      <BubbleMenu
        editor={editor}
        shouldShow={({ editor }) => editor.isActive("table")}
      >
        <div className="table-bubble">
          <button onClick={() => editor.chain().focus().addRowAfter().run()}>
            + Row
          </button>
          <button onClick={() => editor.chain().focus().addColumnAfter().run()}>
            + Col
          </button>
          <button onClick={() => editor.chain().focus().deleteTable().run()}>
            Delete
          </button>
        </div>
      </BubbleMenu>

      <div className="rte-footer">
        Characters: {editor.storage.characterCount.characters()}
      </div>
    </div>
  );
}
