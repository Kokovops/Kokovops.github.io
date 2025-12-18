import type { File } from "@shared/schema";

interface ImageViewerProps {
  file: File;
}

export function ImageViewer({ file }: ImageViewerProps) {
  const imageUrl = file.filePath || "";

  return (
    <div className="flex items-center justify-center h-full p-4 overflow-auto bg-[hsl(var(--muted))]">
      {imageUrl ? (
        <img
          data-testid="image-content"
          src={`/api/files/${file.id}/content`}
          alt={file.name}
          className="max-w-full max-h-full object-contain"
          style={{ imageRendering: "auto" }}
        />
      ) : (
        <div className="text-center text-[hsl(var(--muted-foreground))]">
          <p>No image content available</p>
        </div>
      )}
    </div>
  );
}
