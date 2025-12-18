import { Home, X, Minus, Square } from "lucide-react";
import type { File } from "@shared/schema";

interface OpenWindow {
  id: string;
  file?: File;
  type: "file" | "recycle-bin" | "settings" | "user" | "upload" | "share" | "rename";
  title: string;
  isMinimized: boolean;
  isMaximized: boolean;
}

interface TaskbarProps {
  openWindows: OpenWindow[];
  activeWindowId: string | null;
  onWindowClick: (id: string) => void;
  onHomeClick: () => void;
}

export function Taskbar({
  openWindows,
  activeWindowId,
  onWindowClick,
  onHomeClick,
}: TaskbarProps) {
  return (
    <div
      data-testid="taskbar"
      className="fixed top-0 left-0 right-0 h-10 win96-taskbar win96-raised flex items-center px-1 gap-1 z-50"
    >
      <button
        data-testid="button-home"
        onClick={onHomeClick}
        className="flex items-center justify-center w-9 h-7 win96-raised win96-button-face active:win96-pressed"
        title="Return to Desktop"
      >
        <Home className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-[hsl(var(--win96-button-shadow))] mx-1" />

      <div className="flex-1 flex items-center gap-1 overflow-x-auto">
        {openWindows.map((window) => (
          <button
            key={window.id}
            data-testid={`taskbar-button-${window.id}`}
            onClick={() => onWindowClick(window.id)}
            className={`flex items-center gap-1 h-7 px-2 min-w-[100px] max-w-[180px] text-xs truncate ${
              activeWindowId === window.id && !window.isMinimized
                ? "win96-pressed win96-button-face"
                : "win96-raised win96-button-face"
            }`}
          >
            <span className="truncate">{window.title}</span>
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-[hsl(var(--win96-button-shadow))] mx-1" />

      <div className="win96-inset px-2 h-6 flex items-center text-xs">
        {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
    </div>
  );
}
