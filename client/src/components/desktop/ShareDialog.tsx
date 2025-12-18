import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { File } from "@shared/schema";

interface ShareDialogProps {
  file: File;
  onClose: () => void;
}

export function ShareDialog({ file, onClose }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = file.shareToken
    ? `${window.location.origin}/share/${file.shareToken}`
    : "";

  const handleCopy = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <h3 className="text-xs font-bold mb-4">Share File</h3>
      <p className="text-xs mb-4">
        Share "{file.name}.{file.extension}" with others by copying the link below:
      </p>

      <div className="flex gap-2 mb-4">
        <input
          data-testid="input-share-link"
          type="text"
          value={shareUrl}
          readOnly
          className="flex-1 px-2 py-1 text-xs win96-inset bg-white dark:bg-[hsl(var(--background))]"
        />
        <button
          data-testid="button-copy-link"
          onClick={handleCopy}
          className="px-3 py-1 text-xs win96-raised win96-button-face active:win96-pressed flex items-center gap-1"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {!file.shareToken && (
        <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">
          Generating share link...
        </p>
      )}

      <div className="flex justify-end mt-auto">
        <button
          data-testid="button-close-share"
          onClick={onClose}
          className="px-4 py-1 text-xs win96-raised win96-button-face active:win96-pressed"
        >
          Close
        </button>
      </div>
    </div>
  );
}
