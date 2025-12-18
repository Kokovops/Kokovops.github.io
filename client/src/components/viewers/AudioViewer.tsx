import type { File } from "@shared/schema";
import { Music } from "lucide-react";

interface AudioViewerProps {
  file: File;
}

export function AudioViewer({ file }: AudioViewerProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 gap-4 bg-[hsl(var(--muted))]">
      <div className="w-24 h-24 flex items-center justify-center bg-[hsl(var(--win96-button-face))] win96-raised">
        <Music className="w-12 h-12 text-[hsl(var(--muted-foreground))]" />
      </div>
      <p className="text-sm font-medium">{file.name}.{file.extension}</p>
      <audio
        data-testid="audio-content"
        src={`/api/files/${file.id}/content`}
        controls
        className="w-full max-w-md"
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
