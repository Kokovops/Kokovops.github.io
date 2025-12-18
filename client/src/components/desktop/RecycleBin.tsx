import type { File } from "@shared/schema";
import { Trash2, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RecycleBinProps {
  files: File[];
  onRestore: (fileId: string) => void;
  onEmptyTrash: () => void;
  onPermanentDelete: (fileId: string) => void;
}

export function RecycleBin({
  files,
  onRestore,
  onEmptyTrash,
  onPermanentDelete,
}: RecycleBinProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-2 win96-raised bg-[hsl(var(--win96-button-face))]">
        <button
          data-testid="button-empty-trash"
          onClick={onEmptyTrash}
          disabled={files.length === 0}
          className={`flex items-center gap-1 px-2 py-1 text-xs win96-raised win96-button-face ${
            files.length === 0 ? "opacity-50 cursor-not-allowed" : "active:win96-pressed"
          }`}
        >
          <Trash2 className="w-3 h-3" />
          Empty Recycle Bin
        </button>
        <span className="text-xs text-[hsl(var(--muted-foreground))]">
          {files.length} item{files.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 win96-raised bg-[hsl(var(--win96-button-face))]">
            <tr>
              <th className="text-left p-1 border-r border-[hsl(var(--win96-button-shadow))]">Name</th>
              <th className="text-left p-1 border-r border-[hsl(var(--win96-button-shadow))]">Deleted</th>
              <th className="text-left p-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-[hsl(var(--muted-foreground))]">
                  Recycle Bin is empty
                </td>
              </tr>
            ) : (
              files.map((file) => (
                <tr
                  key={file.id}
                  data-testid={`recycle-bin-item-${file.id}`}
                  className="hover:bg-[hsl(var(--win96-selection))] hover:text-[hsl(var(--win96-selection-text))]"
                >
                  <td className="p-1 border-r border-[hsl(var(--border))]">
                    {file.name}.{file.extension}
                  </td>
                  <td className="p-1 border-r border-[hsl(var(--border))]">
                    {file.deletedAt
                      ? formatDistanceToNow(new Date(file.deletedAt), { addSuffix: true })
                      : "Unknown"}
                  </td>
                  <td className="p-1">
                    <div className="flex gap-1">
                      <button
                        data-testid={`button-restore-${file.id}`}
                        onClick={() => onRestore(file.id)}
                        className="px-1 py-0.5 win96-raised win96-button-face active:win96-pressed"
                        title="Restore"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                      <button
                        data-testid={`button-delete-permanent-${file.id}`}
                        onClick={() => onPermanentDelete(file.id)}
                        className="px-1 py-0.5 win96-raised win96-button-face active:win96-pressed"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
