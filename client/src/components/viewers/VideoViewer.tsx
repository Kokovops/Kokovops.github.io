import type { File } from "@shared/schema";

interface VideoViewerProps {
  file: File;
}

export function VideoViewer({ file }: VideoViewerProps) {
  return (
    <div className="flex items-center justify-center h-full p-4 bg-black">
      <video
        data-testid="video-content"
        src={`/api/files/${file.id}/content`}
        controls
        className="max-w-full max-h-full"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
