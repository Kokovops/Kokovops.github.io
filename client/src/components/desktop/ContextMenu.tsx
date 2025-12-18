import { useEffect, useRef } from "react";

interface MenuItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const adjustedX = Math.min(x, window.innerWidth - 160);
  const adjustedY = Math.min(y, window.innerHeight - items.length * 28 - 8);

  return (
    <div
      ref={menuRef}
      data-testid="context-menu"
      className="fixed win96-raised win96-window py-1 min-w-[150px] z-[100]"
      style={{ left: adjustedX, top: adjustedY }}
    >
      {items.map((item, index) => (
        <div key={index}>
          {item.divider ? (
            <div className="h-px bg-[hsl(var(--win96-button-shadow))] my-1 mx-1" />
          ) : (
            <button
              data-testid={`context-menu-item-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick();
                  onClose();
                }
              }}
              disabled={item.disabled}
              className={`w-full text-left px-4 py-1 text-xs ${
                item.disabled
                  ? "text-[hsl(var(--muted-foreground))] cursor-not-allowed"
                  : "hover:bg-[hsl(var(--win96-selection))] hover:text-[hsl(var(--win96-selection-text))]"
              }`}
            >
              {item.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
