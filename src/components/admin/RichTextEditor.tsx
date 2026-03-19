import { useRef, useCallback, useEffect } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Link, Undo, Redo } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const ToolbarButton = ({ icon: Icon, command, active, title }: { icon: any; command: string; active?: boolean; title: string }) => {
  const exec = (e: React.MouseEvent) => {
    e.preventDefault();
    document.execCommand(command, false);
  };
  return (
    <button
      type="button"
      onMouseDown={exec}
      title={title}
      className={`p-1.5 rounded hover:bg-muted transition-colors ${active ? "bg-muted text-foreground" : "text-muted-foreground"}`}
    >
      <Icon size={15} />
    </button>
  );
};

const RichTextEditor = ({ value, onChange, placeholder = "Type here...", minHeight = "120px" }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const insertLink = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = prompt("Enter URL:");
    if (url) {
      document.execCommand("createLink", false, url);
      handleInput();
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/30 flex-wrap">
        <ToolbarButton icon={Bold} command="bold" title="Bold" />
        <ToolbarButton icon={Italic} command="italic" title="Italic" />
        <ToolbarButton icon={Underline} command="underline" title="Underline" />
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarButton icon={List} command="insertUnorderedList" title="Bullet List" />
        <ToolbarButton icon={ListOrdered} command="insertOrderedList" title="Numbered List" />
        <div className="w-px h-5 bg-border mx-1" />
        <button type="button" onMouseDown={insertLink} title="Insert Link" className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground">
          <Link size={15} />
        </button>
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarButton icon={Undo} command="undo" title="Undo" />
        <ToolbarButton icon={Redo} command="redo" title="Redo" />
      </div>
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
        className="px-3 py-2 text-sm text-foreground outline-none overflow-y-auto prose prose-sm max-w-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground/50"
        style={{ minHeight }}
      />
    </div>
  );
};

export default RichTextEditor;
