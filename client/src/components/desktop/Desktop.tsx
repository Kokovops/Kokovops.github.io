import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { File, UserSettings } from "@shared/schema";
import { DesktopIcon } from "./DesktopIcon";
import { Taskbar } from "./Taskbar";
import { Window } from "./Window";
import { ContextMenu } from "./ContextMenu";
import { RecycleBin } from "./RecycleBin";
import { SettingsWindow } from "./SettingsWindow";
import { UserProfile } from "./UserProfile";
import { ShareDialog } from "./ShareDialog";
import { RenameDialog } from "./RenameDialog";
import { FileUpload } from "./FileUpload";
import { TextViewer } from "../viewers/TextViewer";
import { ImageViewer } from "../viewers/ImageViewer";
import { VideoViewer } from "../viewers/VideoViewer";
import { AudioViewer } from "../viewers/AudioViewer";
import { Plus } from "lucide-react";

interface OpenWindow {
  id: string;
  file?: File;
  type: "file" | "recycle-bin" | "settings" | "user" | "upload" | "share" | "rename";
  title: string;
  isMinimized: boolean;
  isMaximized: boolean;
}

export function Desktop() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    type: "file" | "desktop" | "recycle-bin" | "user";
    file?: File;
  } | null>(null);
  const [windowZIndexes, setWindowZIndexes] = useState<Record<string, number>>({});
  const [maxZIndex, setMaxZIndex] = useState(10);

  const { data: files = [], isLoading: filesLoading } = useQuery<File[]>({
    queryKey: ["/api/files"],
  });

  const { data: deletedFiles = [] } = useQuery<File[]>({
    queryKey: ["/api/files/deleted"],
  });

  const { data: settings } = useQuery<UserSettings>({
    queryKey: ["/api/settings"],
  });

  const desktopFiles = files.filter((f) => !f.isDeleted);

  const updateFileMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<File> & { id: string }) =>
      apiRequest("PATCH", `/api/files/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/files/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      queryClient.invalidateQueries({ queryKey: ["/api/files/deleted"] });
      toast({ title: "File moved to Recycle Bin" });
    },
  });

  const restoreFileMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("POST", `/api/files/${id}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      queryClient.invalidateQueries({ queryKey: ["/api/files/deleted"] });
      toast({ title: "File restored" });
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/files/${id}/permanent`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files/deleted"] });
      toast({ title: "File permanently deleted" });
    },
  });

  const emptyTrashMutation = useMutation({
    mutationFn: async () => apiRequest("DELETE", "/api/files/trash/empty"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files/deleted"] });
      toast({ title: "Recycle Bin emptied" });
    },
  });

  const shareFileMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("POST", `/api/files/${id}/share`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: Partial<UserSettings>) =>
      apiRequest("PATCH", "/api/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Settings saved" });
    },
  });

  const uploadFilesMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      toast({ title: "Files uploaded successfully" });
      closeWindow("upload");
    },
    onError: () => {
      toast({ title: "Upload failed", variant: "destructive" });
    },
  });

  const openWindow = useCallback(
    (window: OpenWindow) => {
      setOpenWindows((prev) => {
        const existing = prev.find((w) => w.id === window.id);
        if (existing) {
          return prev.map((w) =>
            w.id === window.id ? { ...w, isMinimized: false } : w
          );
        }
        return [...prev, window];
      });
      setActiveWindowId(window.id);
      setMaxZIndex((prev) => prev + 1);
      setWindowZIndexes((prev) => ({
        ...prev,
        [window.id]: maxZIndex + 1,
      }));
    },
    [maxZIndex]
  );

  const closeWindow = useCallback((id: string) => {
    setOpenWindows((prev) => prev.filter((w) => w.id !== id));
    setActiveWindowId(null);
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setOpenWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    setActiveWindowId(null);
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setOpenWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
    );
  }, []);

  const focusWindow = useCallback(
    (id: string) => {
      setActiveWindowId(id);
      setMaxZIndex((prev) => prev + 1);
      setWindowZIndexes((prev) => ({
        ...prev,
        [id]: maxZIndex + 1,
      }));
    },
    [maxZIndex]
  );

  const handleTaskbarWindowClick = useCallback(
    (id: string) => {
      const window = openWindows.find((w) => w.id === id);
      if (window) {
        if (window.isMinimized) {
          setOpenWindows((prev) =>
            prev.map((w) => (w.id === id ? { ...w, isMinimized: false } : w))
          );
          focusWindow(id);
        } else if (activeWindowId === id) {
          minimizeWindow(id);
        } else {
          focusWindow(id);
        }
      }
    },
    [openWindows, activeWindowId, focusWindow, minimizeWindow]
  );

  const handleHomeClick = useCallback(() => {
    if (activeWindowId) {
      minimizeWindow(activeWindowId);
    }
  }, [activeWindowId, minimizeWindow]);

  const handleFileDoubleClick = useCallback(
    (file: File) => {
      openWindow({
        id: `file-${file.id}`,
        file,
        type: "file",
        title: `${file.name}.${file.extension}`,
        isMinimized: false,
        isMaximized: true,
      });
    },
    [openWindow]
  );

  const handleFileContextMenu = useCallback(
    (e: React.MouseEvent, file: File) => {
      e.preventDefault();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        type: "file",
        file,
      });
    },
    []
  );

  const handleDesktopContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if ((e.target as HTMLElement).closest("[data-testid^='desktop-icon-']")) {
      return;
    }
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: "desktop",
    });
  }, []);

  const handleRecycleBinContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: "recycle-bin",
    });
  }, []);

  const handleUserContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: "user",
    });
  }, []);

  const handleFileDragEnd = useCallback(
    (fileId: string, position: { x: number; y: number }) => {
      updateFileMutation.mutate({
        id: fileId,
        positionX: position.x,
        positionY: position.y,
      });
    },
    [updateFileMutation]
  );

  const handleRename = useCallback(
    (fileId: string, newName: string) => {
      updateFileMutation.mutate({ id: fileId, name: newName });
      closeWindow(`rename-${fileId}`);
    },
    [updateFileMutation, closeWindow]
  );

  const handleShare = useCallback(
    async (file: File) => {
      if (!file.shareToken) {
        await shareFileMutation.mutateAsync(file.id);
      }
      openWindow({
        id: `share-${file.id}`,
        file,
        type: "share",
        title: "Share File",
        isMinimized: false,
        isMaximized: false,
      });
    },
    [shareFileMutation, openWindow]
  );

  const handleUpload = useCallback(
    (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });
      uploadFilesMutation.mutate(formData);
    },
    [uploadFilesMutation]
  );

  const renderFileViewer = useCallback(
    (file: File) => {
      const ext = file.extension.toLowerCase();

      if (["txt", "md", "json", "js", "ts", "html", "css"].includes(ext)) {
        return (
          <TextViewer
            file={file}
            onSave={(content) =>
              updateFileMutation.mutate({ id: file.id, content })
            }
          />
        );
      }

      if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)) {
        return <ImageViewer file={file} />;
      }

      if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) {
        return <VideoViewer file={file} />;
      }

      if (["mp3", "wav", "ogg", "flac", "m4a"].includes(ext)) {
        return <AudioViewer file={file} />;
      }

      return (
        <div className="flex items-center justify-center h-full p-4">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Cannot preview this file type
          </p>
        </div>
      );
    },
    [updateFileMutation]
  );

  const getContextMenuItems = useCallback(() => {
    if (!contextMenu) return [];

    switch (contextMenu.type) {
      case "file":
        return [
          {
            label: "Open",
            onClick: () => contextMenu.file && handleFileDoubleClick(contextMenu.file),
          },
          { label: "", onClick: () => {}, divider: true },
          {
            label: "Rename",
            onClick: () => {
              if (contextMenu.file) {
                openWindow({
                  id: `rename-${contextMenu.file.id}`,
                  file: contextMenu.file,
                  type: "rename",
                  title: "Rename",
                  isMinimized: false,
                  isMaximized: false,
                });
              }
            },
          },
          {
            label: "Share",
            onClick: () => contextMenu.file && handleShare(contextMenu.file),
          },
          { label: "", onClick: () => {}, divider: true },
          {
            label: "Delete",
            onClick: () => contextMenu.file && deleteFileMutation.mutate(contextMenu.file.id),
          },
        ];

      case "desktop":
        return [
          {
            label: "Upload File",
            onClick: () =>
              openWindow({
                id: "upload",
                type: "upload",
                title: "Upload Files",
                isMinimized: false,
                isMaximized: false,
              }),
          },
          { label: "", onClick: () => {}, divider: true },
          {
            label: "Settings",
            onClick: () =>
              openWindow({
                id: "settings",
                type: "settings",
                title: "Settings",
                isMinimized: false,
                isMaximized: false,
              }),
          },
        ];

      case "recycle-bin":
        return [
          {
            label: "Open",
            onClick: () =>
              openWindow({
                id: "recycle-bin",
                type: "recycle-bin",
                title: "Recycle Bin",
                isMinimized: false,
                isMaximized: false,
              }),
          },
          { label: "", onClick: () => {}, divider: true },
          {
            label: "Empty Recycle Bin",
            onClick: () => emptyTrashMutation.mutate(),
            disabled: deletedFiles.length === 0,
          },
        ];

      case "user":
        return [
          {
            label: "Open Profile",
            onClick: () =>
              openWindow({
                id: "user",
                type: "user",
                title: "User Profile",
                isMinimized: false,
                isMaximized: false,
              }),
          },
          {
            label: "Settings",
            onClick: () =>
              openWindow({
                id: "settings",
                type: "settings",
                title: "Settings",
                isMinimized: false,
                isMaximized: false,
              }),
          },
          { label: "", onClick: () => {}, divider: true },
          {
            label: "Log Out",
            onClick: () => {
              window.location.href = "/api/logout";
            },
          },
        ];

      default:
        return [];
    }
  }, [
    contextMenu,
    handleFileDoubleClick,
    handleShare,
    openWindow,
    deleteFileMutation,
    emptyTrashMutation,
    deletedFiles,
  ]);

  const desktopStyle = settings?.desktopBackground
    ? {
        backgroundImage: `url(${settings.desktopBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {};

  useEffect(() => {
    if (settings?.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings?.theme]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Taskbar
        openWindows={openWindows}
        activeWindowId={activeWindowId}
        onWindowClick={handleTaskbarWindowClick}
        onHomeClick={handleHomeClick}
      />

      <div
        data-testid="desktop"
        className="flex-1 relative win96-desktop pt-10"
        style={desktopStyle}
        onContextMenu={handleDesktopContextMenu}
        onClick={() => {
          setSelectedFileId(null);
          setContextMenu(null);
        }}
      >
        {filesLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-sm">Loading...</div>
          </div>
        ) : (
          <>
            {desktopFiles.map((file, index) => (
              <DesktopIcon
                key={file.id}
                file={file}
                type="file"
                label={`${file.name}.${file.extension}`}
                position={{
                  x: file.positionX ?? (index % 8) * 80 + 16,
                  y: file.positionY ?? Math.floor(index / 8) * 90 + 16,
                }}
                isSelected={selectedFileId === file.id}
                onSelect={() => setSelectedFileId(file.id)}
                onDoubleClick={() => handleFileDoubleClick(file)}
                onContextMenu={(e) => handleFileContextMenu(e, file)}
                onDragEnd={(pos) => handleFileDragEnd(file.id, pos)}
              />
            ))}

            <DesktopIcon
              type="recycle-bin"
              label="Recycle Bin"
              position={{ x: 16, y: window.innerHeight - 180 }}
              isSelected={selectedFileId === "recycle-bin"}
              onSelect={() => setSelectedFileId("recycle-bin")}
              onDoubleClick={() =>
                openWindow({
                  id: "recycle-bin",
                  type: "recycle-bin",
                  title: "Recycle Bin",
                  isMinimized: false,
                  isMaximized: false,
                })
              }
              onContextMenu={handleRecycleBinContextMenu}
              onDragEnd={() => {}}
            />

            <DesktopIcon
              type="user"
              label={user?.firstName || user?.email?.split("@")[0] || "User"}
              position={{ x: 96, y: window.innerHeight - 180 }}
              isSelected={selectedFileId === "user"}
              onSelect={() => setSelectedFileId("user")}
              onDoubleClick={() =>
                openWindow({
                  id: "user",
                  type: "user",
                  title: "User Profile",
                  isMinimized: false,
                  isMaximized: false,
                })
              }
              onContextMenu={handleUserContextMenu}
              onDragEnd={() => {}}
            />
          </>
        )}
      </div>

      {openWindows.map((win) => (
        <Window
          key={win.id}
          id={win.id}
          title={win.title}
          file={win.file}
          isActive={activeWindowId === win.id}
          isMinimized={win.isMinimized}
          isMaximized={win.isMaximized}
          zIndex={windowZIndexes[win.id] || 10}
          onClose={() => closeWindow(win.id)}
          onMinimize={() => minimizeWindow(win.id)}
          onMaximize={() => maximizeWindow(win.id)}
          onFocus={() => focusWindow(win.id)}
        >
          {win.type === "file" && win.file && renderFileViewer(win.file)}
          {win.type === "recycle-bin" && (
            <RecycleBin
              files={deletedFiles}
              onRestore={(id) => restoreFileMutation.mutate(id)}
              onEmptyTrash={() => emptyTrashMutation.mutate()}
              onPermanentDelete={(id) => permanentDeleteMutation.mutate(id)}
            />
          )}
          {win.type === "settings" && (
            <SettingsWindow
              settings={settings || null}
              onSave={(data) => saveSettingsMutation.mutate(data)}
              onClose={() => closeWindow("settings")}
            />
          )}
          {win.type === "user" && user && (
            <UserProfile
              user={user}
              onClose={() => closeWindow("user")}
              onLogout={() => {
                globalThis.location.href = "/api/logout";
              }}
            />
          )}
          {win.type === "upload" && (
            <FileUpload
              onUpload={handleUpload}
              onClose={() => closeWindow("upload")}
              isUploading={uploadFilesMutation.isPending}
            />
          )}
          {win.type === "share" && win.file && (
            <ShareDialog
              file={win.file}
              onClose={() => closeWindow(`share-${win.file?.id}`)}
            />
          )}
          {win.type === "rename" && win.file && (
            <RenameDialog
              file={win.file}
              onRename={(name) => handleRename(win.file!.id, name)}
              onClose={() => closeWindow(`rename-${win.file?.id}`)}
            />
          )}
        </Window>
      ))}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems()}
          onClose={() => setContextMenu(null)}
        />
      )}

      <button
        data-testid="button-upload-fab"
        onClick={() =>
          openWindow({
            id: "upload",
            type: "upload",
            title: "Upload Files",
            isMinimized: false,
            isMaximized: false,
          })
        }
        className="fixed bottom-4 right-4 w-12 h-12 win96-raised win96-button-face flex items-center justify-center active:win96-pressed z-40"
        title="Upload Files"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
