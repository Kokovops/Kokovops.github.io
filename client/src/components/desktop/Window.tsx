import { useState, useRef, useEffect } from "react";
import { Minus, Square, X, Maximize2 } from "lucide-react";
import type { File } from "@shared/schema";

interface WindowProps {
  id: string;
  title: string;
  file?: File;
  isActive: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  children: React.ReactNode;
}

export function Window({
  id,
  title,
  file,
  isActive,
  isMinimized,
  isMaximized,
  zIndex,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  children,
}: WindowProps) {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 600, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isMaximized) {
      setPosition({ x: 0, y: 40 });
      setSize({ width: window.innerWidth, height: window.innerHeight - 40 });
    }
  }, [isMaximized]);

  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    e.preventDefault();
    onFocus();
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.current.x,
          y: Math.max(40, e.clientY - dragOffset.current.y),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing]);

  if (isMinimized) {
    return null;
  }

  return (
    <div
      ref={windowRef}
      data-testid={`window-${id}`}
      className="fixed win96-raised win96-window flex flex-col"
      style={{
        left: isMaximized ? 0 : position.x,
        top: isMaximized ? 40 : position.y,
        width: isMaximized ? "100%" : size.width,
        height: isMaximized ? "calc(100vh - 40px)" : size.height,
        zIndex,
        minWidth: 320,
        minHeight: 240,
      }}
      onClick={onFocus}
    >
      <div
        data-testid={`window-titlebar-${id}`}
        className={`flex items-center h-7 px-1 gap-1 cursor-move ${
          isActive ? "win96-title-active" : "win96-title-inactive"
        }`}
        onMouseDown={handleTitleMouseDown}
      >
        <span className="flex-1 text-white text-xs font-bold truncate px-1">
          {title}
        </span>
        <div className="flex gap-px">
          <button
            data-testid={`button-minimize-${id}`}
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            className="w-4 h-4 win96-raised win96-button-face flex items-center justify-center"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            data-testid={`button-maximize-${id}`}
            onClick={(e) => {
              e.stopPropagation();
              onMaximize();
            }}
            className="w-4 h-4 win96-raised win96-button-face flex items-center justify-center"
          >
            {isMaximized ? <Maximize2 className="w-3 h-3" /> : <Square className="w-3 h-3" />}
          </button>
          <button
            data-testid={`button-close-${id}`}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-4 h-4 win96-raised win96-button-face flex items-center justify-center"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex-1 win96-inset m-1 overflow-auto bg-white dark:bg-[hsl(var(--background))]">
        {children}
      </div>

      {!isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = size.width;
            const startHeight = size.height;

            const handleResize = (moveEvent: MouseEvent) => {
              setSize({
                width: Math.max(320, startWidth + (moveEvent.clientX - startX)),
                height: Math.max(240, startHeight + (moveEvent.clientY - startY)),
              });
            };

            const stopResize = () => {
              setIsResizing(false);
              document.removeEventListener("mousemove", handleResize);
              document.removeEventListener("mouseup", stopResize);
            };

            document.addEventListener("mousemove", handleResize);
            document.addEventListener("mouseup", stopResize);
          }}
        />
      )}
    </div>
  );
}
