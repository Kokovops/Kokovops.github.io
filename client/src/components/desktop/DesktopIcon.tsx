import { useState, useRef } from "react";
import type { File } from "@shared/schema";
import { FileText, Image, Video, Music, Trash2, User, Settings, Folder } from "lucide-react";

interface DesktopIconProps {
  file?: File;
  type?: "file" | "recycle-bin" | "user" | "settings";
  label: string;
  position: { x: number; y: number };
  isSelected: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onDragEnd: (position: { x: number; y: number }) => void;
}

const getFileIcon = (extension: string) => {
  const ext = extension.toLowerCase();
  if (["txt", "md", "json", "js", "ts", "html", "css"].includes(ext)) {
    return FileText;
  }
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)) {
    return Image;
  }
  if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) {
    return Video;
  }
  if (["mp3", "wav", "ogg", "flac", "m4a"].includes(ext)) {
    return Music;
  }
  return FileText;
};

export function DesktopIcon({
  file,
  type = "file",
  label,
  position,
  isSelected,
  onSelect,
  onDoubleClick,
  onContextMenu,
  onDragEnd,
}: DesktopIconProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState(position);
  const iconRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    onSelect();
    
    const rect = iconRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    setIsDragging(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const gridSize = 80;
      const newX = Math.round((moveEvent.clientX - dragOffset.x) / gridSize) * gridSize;
      const newY = Math.round((moveEvent.clientY - dragOffset.y - 40) / gridSize) * gridSize;
      setCurrentPos({ x: Math.max(0, newX), y: Math.max(0, newY) });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onDragEnd(currentPos);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const renderIcon = () => {
    const iconClass = "w-8 h-8";
    
    switch (type) {
      case "recycle-bin":
        return <Trash2 className={iconClass} />;
      case "user":
        return <User className={iconClass} />;
      case "settings":
        return <Settings className={iconClass} />;
      default:
        if (file) {
          const IconComponent = getFileIcon(file.extension);
          return <IconComponent className={iconClass} />;
        }
        return <Folder className={iconClass} />;
    }
  };

  return (
    <div
      ref={iconRef}
      data-testid={`desktop-icon-${type === "file" ? file?.id : type}`}
      className={`absolute flex flex-col items-center justify-center w-20 cursor-pointer select-none ${
        isDragging ? "opacity-70 z-50" : ""
      }`}
      style={{
        left: currentPos.x,
        top: currentPos.y,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
    >
      <div
        className={`flex items-center justify-center w-10 h-10 mb-1 ${
          isSelected ? "win96-selected" : ""
        }`}
      >
        {renderIcon()}
      </div>
      <span
        className={`text-center text-xs leading-tight max-w-full px-1 break-words ${
          isSelected
            ? "bg-[hsl(var(--win96-selection))] text-[hsl(var(--win96-selection-text))]"
            : "text-white drop-shadow-[1px_1px_1px_rgba(0,0,0,0.8)]"
        }`}
        style={{ 
          textShadow: isSelected ? "none" : "1px 1px 2px rgba(0,0,0,0.9)",
          maxWidth: "70px",
        }}
      >
        {label}
      </span>
    </div>
  );
}
