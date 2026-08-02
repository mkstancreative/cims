import React, { useCallback, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Superscript } from "@tiptap/extension-superscript";
import { Subscript } from "@tiptap/extension-subscript";
import { Youtube } from "@tiptap/extension-youtube";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Code,
  Quote,
  Strikethrough,
  Undo,
  Redo,
  Minus,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table as TableIcon,
  Superscript as SuperscriptIcon,
  Subscript as SubscriptIcon,
  Highlighter,
  Type,
  Video as VideoIcon,
} from "lucide-react";
import "./RichTextEditor.css";

interface ToolBtnProps {
  onClick?: () => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

function ToolBtn({ onClick, active, title, children, disabled }: ToolBtnProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      title={title}
      disabled={disabled}
      className={`rte-tool-btn${active ? " rte-tool-btn--active" : ""}${disabled ? " rte-tool-btn--disabled" : ""}`}
    >
      {children}
    </button>
  );
}

/* ── Separator ── */
function Sep() {
  return <span className="rte-sep" />;
}

/* ── Color Picker Button ── */
interface ColorBtnProps {
  title?: string;
  value: string;
  onChange: (color: string) => void;
  children: React.ReactNode;
}

function ColorBtn({ title, value, onChange, children }: ColorBtnProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <button
      type="button"
      title={title}
      className="rte-tool-btn rte-color-btn"
      onMouseDown={(e) => {
        e.preventDefault();
        inputRef.current?.click();
      }}
    >
      {children}
      <input
        ref={inputRef}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rte-color-input"
        tabIndex={-1}
      />
    </button>
  );
}

/* ── Link Dialog ── */
interface LinkDialogProps {
  onConfirm: (url: string) => void;
  onCancel: () => void;
  initialUrl?: string;
}

function LinkDialog({ onConfirm, onCancel, initialUrl = "" }: LinkDialogProps) {
  const [url, setUrl] = useState(initialUrl);
  return (
    <div className="rte-link-dialog">
      <input
        autoFocus
        type="url"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onConfirm(url);
          if (e.key === "Escape") onCancel();
        }}
        className="rte-link-input"
      />
      <button
        type="button"
        className="rte-link-ok"
        onMouseDown={(e) => {
          e.preventDefault();
          onConfirm(url);
        }}
      >
        OK
      </button>
      <button
        type="button"
        className="rte-link-cancel"
        onMouseDown={(e) => {
          e.preventDefault();
          onCancel();
        }}
      >
        ✕
      </button>
    </div>
  );
}

/* ── Image Dialog ── */
interface ImageDialogProps {
  onConfirm: (url: string) => void;
  onCancel: () => void;
}

function ImageDialog({ onConfirm, onCancel }: ImageDialogProps) {
  const [url, setUrl] = useState("");
  return (
    <div className="rte-link-dialog">
      <input
        autoFocus
        type="url"
        placeholder="Image URL…"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onConfirm(url);
          if (e.key === "Escape") onCancel();
        }}
        className="rte-link-input"
      />
      <button
        type="button"
        className="rte-link-ok"
        onMouseDown={(e) => {
          e.preventDefault();
          onConfirm(url);
        }}
      >
        Insert
      </button>
      <button
        type="button"
        className="rte-link-cancel"
        onMouseDown={(e) => {
          e.preventDefault();
          onCancel();
        }}
      >
        ✕
      </button>
    </div>
  );
}

/* ── YouTube Dialog ── */
interface VideoDialogProps {
  onConfirm: (url: string) => void;
  onCancel: () => void;
}

function VideoDialog({ onConfirm, onCancel }: VideoDialogProps) {
  const [url, setUrl] = useState("");
  return (
    <div className="rte-link-dialog">
      <input
        autoFocus
        type="url"
        placeholder="YouTube URL…"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onConfirm(url);
          if (e.key === "Escape") onCancel();
        }}
        className="rte-link-input"
      />
      <button
        type="button"
        className="rte-link-ok"
        onMouseDown={(e) => {
          e.preventDefault();
          onConfirm(url);
        }}
      >
        Embed
      </button>
      <button
        type="button"
        className="rte-link-cancel"
        onMouseDown={(e) => {
          e.preventDefault();
          onCancel();
        }}
      >
        ✕
      </button>
    </div>
  );
}

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write here…",
}: RichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [textColor, setTextColor] = useState("#000000");
  const [highlightColor, setHighlightColor] = useState("#ffff00");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList: {},
        orderedList: {},
        blockquote: {},
        codeBlock: false,
        code: {},
        horizontalRule: {},
        strike: {},
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({ inline: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Superscript,
      Subscript,
      Youtube.configure({
        inline: false,
        controls: true,
        allowFullscreen: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "rte-content",
        "data-placeholder": placeholder,
      },
    },
  });

  const handleSetLink = useCallback(
    (url: string) => {
      setShowLinkDialog(false);
      if (!editor) return;
      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    },
    [editor],
  );

  const handleInsertImage = useCallback(
    (url: string) => {
      setShowImageDialog(false);
      if (!url || !editor) return;
      editor.chain().focus().setImage({ src: url }).run();
    },
    [editor],
  );

  const handleInsertVideo = useCallback(
    (url: string) => {
      setShowVideoDialog(false);
      if (!url || !editor) return;
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    },
    [editor],
  );

  if (!editor) return null;

  const iSize = 14;

  return (
    <div className="rte-wrapper">
      {/* ── Toolbar ── */}
      <div className="rte-toolbar">
        {/* History */}
        <ToolBtn
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo size={iSize} />
        </ToolBtn>
        <ToolBtn
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo size={iSize} />
        </ToolBtn>

        <Sep />

        {/* Headings */}
        <ToolBtn
          title="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 size={iSize} />
        </ToolBtn>
        <ToolBtn
          title="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 size={iSize} />
        </ToolBtn>

        <Sep />

        {/* Inline marks */}
        <ToolBtn
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={iSize} />
        </ToolBtn>
        <ToolBtn
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={iSize} />
        </ToolBtn>
        <ToolBtn
          title="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon size={iSize} />
        </ToolBtn>
        <ToolBtn
          title="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={iSize} />
        </ToolBtn>
        <ToolBtn
          title="Inline Code"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code size={iSize} />
        </ToolBtn>
        <ToolBtn
          title="Superscript"
          active={editor.isActive("superscript")}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
        >
          <SuperscriptIcon size={iSize} />
        </ToolBtn>
        <ToolBtn
          title="Subscript"
          active={editor.isActive("subscript")}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
        >
          <SubscriptIcon size={iSize} />
        </ToolBtn>

        <Sep />

        {/* Color & Highlight */}
        <ColorBtn
          title="Text Color"
          value={textColor}
          onChange={(color) => {
            setTextColor(color);
            editor.chain().focus().setColor(color).run();
          }}
        >
          <Type size={iSize} style={{ color: textColor }} />
        </ColorBtn>
        <ColorBtn
          title="Highlight Color"
          value={highlightColor}
          onChange={(color) => {
            setHighlightColor(color);
            editor.chain().focus().setHighlight({ color }).run();
          }}
        >
          <Highlighter size={iSize} style={{ color: highlightColor }} />
        </ColorBtn>

        <Sep />

        {/* Text Align */}
        <ToolBtn
          title="Align Left"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft size={iSize} />
        </ToolBtn>
        <ToolBtn
          title="Align Center"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter size={iSize} />
        </ToolBtn>
        <ToolBtn
          title="Align Right"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight size={iSize} />
        </ToolBtn>
        <ToolBtn
          title="Justify"
          active={editor.isActive({ textAlign: "justify" })}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <AlignJustify size={iSize} />
        </ToolBtn>

        <Sep />

        {/* Lists */}
        <ToolBtn
          title="Bullet List"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={iSize} />
        </ToolBtn>
        <ToolBtn
          title="Ordered List"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={iSize} />
        </ToolBtn>

        <Sep />

        {/* Blocks */}
        <ToolBtn
          title="Blockquote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={iSize} />
        </ToolBtn>
        <ToolBtn
          title="Horizontal Rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus size={iSize} />
        </ToolBtn>

        <Sep />

        {/* Link */}
        <ToolBtn
          title="Insert / Edit Link"
          active={editor.isActive("link")}
          onClick={() => setShowLinkDialog(true)}
        >
          <LinkIcon size={iSize} />
        </ToolBtn>
        <ToolBtn
          title="Remove Link"
          disabled={!editor.isActive("link")}
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <Unlink size={iSize} />
        </ToolBtn>

        <Sep />

        {/* Image */}
        <ToolBtn title="Insert Image" onClick={() => setShowImageDialog(true)}>
          <ImageIcon size={iSize} />
        </ToolBtn>

        <Sep />

        {/* Video */}
        <ToolBtn
          title="Insert YouTube Video"
          onClick={() => setShowVideoDialog(true)}
        >
          <VideoIcon size={iSize} />
        </ToolBtn>

        <Sep />

        {/* Table */}
        <ToolBtn
          title="Insert Table"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          <TableIcon size={iSize} />
        </ToolBtn>
        {editor.isActive("table") && (
          <>
            <ToolBtn
              title="Add Column After"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
            >
              <span style={{ fontSize: 10, fontWeight: 700 }}>C+</span>
            </ToolBtn>
            <ToolBtn
              title="Delete Column"
              onClick={() => editor.chain().focus().deleteColumn().run()}
            >
              <span style={{ fontSize: 10, fontWeight: 700 }}>C−</span>
            </ToolBtn>
            <ToolBtn
              title="Add Row After"
              onClick={() => editor.chain().focus().addRowAfter().run()}
            >
              <span style={{ fontSize: 10, fontWeight: 700 }}>R+</span>
            </ToolBtn>
            <ToolBtn
              title="Delete Row"
              onClick={() => editor.chain().focus().deleteRow().run()}
            >
              <span style={{ fontSize: 10, fontWeight: 700 }}>R−</span>
            </ToolBtn>
            <ToolBtn
              title="Delete Table"
              onClick={() => editor.chain().focus().deleteTable().run()}
            >
              <span style={{ fontSize: 10, fontWeight: 700, color: "red" }}>
                Del
              </span>
            </ToolBtn>
          </>
        )}
      </div>

      {/* ── Inline Dialogs ── */}
      {showLinkDialog && (
        <LinkDialog
          initialUrl={editor.getAttributes("link").href ?? ""}
          onConfirm={handleSetLink}
          onCancel={() => setShowLinkDialog(false)}
        />
      )}
      {showImageDialog && (
        <ImageDialog
          onConfirm={handleInsertImage}
          onCancel={() => setShowImageDialog(false)}
        />
      )}
      {showVideoDialog && (
        <VideoDialog
          onConfirm={handleInsertVideo}
          onCancel={() => setShowVideoDialog(false)}
        />
      )}

      {/* ── Editor Area ── */}
      <EditorContent editor={editor} />
    </div>
  );
}
