import { useState } from "react";
import type { File } from "@shared/schema";

interface TextViewerProps {
  file: File;
  onSave?: (content: string) => void;
}

export function TextViewer({ file, onSave }: TextViewerProps) {
  const [content, setContent] = useState(file.content || "");
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    if (onSave) {
      onSave(content);
    }
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-1 win96-raised bg-[hsl(var(--win96-button-face))]">
        <button
          data-testid="button-edit-text"
          onClick={() => setIsEditing(!isEditing)}
          className="px-2 py-1 text-xs win96-raised win96-button-face active:win96-pressed"
        >
          {isEditing ? "View" : "Edit"}
        </button>
        {isEditing && (
          <button
            data-testid="button-save-text"
            onClick={handleSave}
            className="px-2 py-1 text-xs win96-raised win96-button-face active:win96-pressed"
          >
            Save
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto">
        {isEditing ? (
          <textarea
            data-testid="textarea-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-2 font-mono text-xs resize-none border-0 focus:outline-none bg-white dark:bg-[hsl(var(--background))] dark:text-[hsl(var(--foreground))]"
          />
        ) : (
          <pre
            data-testid="text-content"
            className="p-2 font-mono text-xs whitespace-pre-wrap break-words"
          >
            {content}
          </pre>
        )}
      </div>
    </div>
  );
}
