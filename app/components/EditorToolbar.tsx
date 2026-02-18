import type { Editor } from "@tiptap/react";
import {
  Bold, Italic, Strikethrough, Code,
  Heading1, Heading2,
  List, ListOrdered, Quote,
  Undo, Redo,
} from "lucide-react";
import { Toggle } from "~/components/ui/toggle";
import { Separator } from "~/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "~/components/ui/tooltip";
import { Button } from "~/components/ui/button";

interface EditorToolbarProps {
  editor: Editor | null;
}

interface ToolItem {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  isActive?: boolean;
  disabled?: boolean;
  isButton?: boolean; // undo/redo use Button, formatting items use Toggle
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  const groups: ToolItem[][] = [
    [
      {
        label: "Bold (Ctrl+B)",
        icon: <Bold />,
        action: () => editor.chain().focus().toggleBold().run(),
        isActive: editor.isActive("bold"),
      },
      {
        label: "Italic (Ctrl+I)",
        icon: <Italic />,
        action: () => editor.chain().focus().toggleItalic().run(),
        isActive: editor.isActive("italic"),
      },
      {
        label: "Strikethrough",
        icon: <Strikethrough />,
        action: () => editor.chain().focus().toggleStrike().run(),
        isActive: editor.isActive("strike"),
      },
      {
        label: "Inline code",
        icon: <Code />,
        action: () => editor.chain().focus().toggleCode().run(),
        isActive: editor.isActive("code"),
      },
    ],
    [
      {
        label: "Heading 1",
        icon: <Heading1 />,
        action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        isActive: editor.isActive("heading", { level: 1 }),
      },
      {
        label: "Heading 2",
        icon: <Heading2 />,
        action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: editor.isActive("heading", { level: 2 }),
      },
    ],
    [
      {
        label: "Bullet list",
        icon: <List />,
        action: () => editor.chain().focus().toggleBulletList().run(),
        isActive: editor.isActive("bulletList"),
      },
      {
        label: "Ordered list",
        icon: <ListOrdered />,
        action: () => editor.chain().focus().toggleOrderedList().run(),
        isActive: editor.isActive("orderedList"),
      },
      {
        label: "Blockquote",
        icon: <Quote />,
        action: () => editor.chain().focus().toggleBlockquote().run(),
        isActive: editor.isActive("blockquote"),
      },
    ],
    [
      {
        label: "Undo (Ctrl+Z)",
        icon: <Undo />,
        action: () => editor.chain().focus().undo().run(),
        disabled: !editor.can().undo(),
        isButton: true,
      },
      {
        label: "Redo (Ctrl+Y)",
        icon: <Redo />,
        action: () => editor.chain().focus().redo().run(),
        disabled: !editor.can().redo(),
        isButton: true,
      },
    ],
  ];

  return (
    <TooltipProvider>
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b flex-wrap">
        {groups.map((group, gi) => (
          <div key={gi} className="flex items-center gap-0.5">
            {gi > 0 && <Separator orientation="vertical" className="mx-1 h-5" />}
            {group.map(({ label, icon, action, isActive, disabled, isButton }) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  {isButton ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={action}
                      disabled={disabled}
                    >
                      {icon}
                    </Button>
                  ) : (
                    <Toggle
                      size="sm"
                      pressed={isActive}
                      onPressedChange={action}
                      className="size-8"
                      aria-label={label}
                    >
                      {icon}
                    </Toggle>
                  )}
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
