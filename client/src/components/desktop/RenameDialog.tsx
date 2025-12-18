import { useState } from "react";
import type { File } from "@shared/schema";

interface RenameDialogProps {
  file: File;
  onRename: (newName: string) => void;
  onClose: () => void;
}

export function RenameDialog({ file, onRename, onClose }: RenameDialogProps) {
  const [newName, setNewName] = useState(file.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onRename(newName.trim());
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full p-4">
      <h3 className="text-xs font-bold mb-4">Rename File</h3>
      
      <div className="mb-4">
        <label className="block text-xs mb-2">
          Enter new name for "{file.name}.{file.extension}":
        </label>
        <div className="flex items-center gap-1">
          <input
            data-testid="input-rename"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
            className="flex-1 px-2 py-1 text-xs win96-inset bg-white dark:bg-[hsl(var(--background))]"
          />
          <span className="text-xs">.{file.extension}</span>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-auto">
        <button
          type="submit"
          data-testid="button-rename-confirm"
          disabled={!newName.trim() || newName === file.name}
          className={`px-4 py-1 text-xs win96-raised win96-button-face ${
            !newName.trim() || newName === file.name
              ? "opacity-50 cursor-not-allowed"
              : "active:win96-pressed"
          }`}
        >
          OK
        </button>
        <button
          type="button"
          data-testid="button-rename-cancel"
          onClick={onClose}
          className="px-4 py-1 text-xs win96-raised win96-button-face active:win96-pressed"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
