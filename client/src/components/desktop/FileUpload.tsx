import { useState, useRef } from "react";
import { Upload, File, X } from "lucide-react";

interface FileUploadProps {
  onUpload: (files: FileList) => void;
  onClose: () => void;
  isUploading: boolean;
}

export function FileUpload({ onUpload, onClose, isUploading }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      setSelectedFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleUpload = () => {
    if (selectedFiles) {
      onUpload(selectedFiles);
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <h3 className="text-xs font-bold mb-4">Upload Files</h3>

      <div
        className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed ${
          dragOver
            ? "border-[hsl(var(--win96-selection))] bg-[hsl(var(--win96-selection)/0.1)]"
            : "border-[hsl(var(--border))]"
        } mb-4`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {selectedFiles ? (
          <div className="text-center">
            <File className="w-8 h-8 mx-auto mb-2" />
            <p className="text-xs mb-1">
              {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""} selected
            </p>
            <ul className="text-xs text-[hsl(var(--muted-foreground))] max-h-24 overflow-auto">
              {Array.from(selectedFiles).map((file, i) => (
                <li key={i}>{file.name}</li>
              ))}
            </ul>
            <button
              data-testid="button-clear-files"
              onClick={() => setSelectedFiles(null)}
              className="mt-2 px-2 py-1 text-xs win96-raised win96-button-face active:win96-pressed"
            >
              Clear
            </button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-[hsl(var(--muted-foreground))]" />
            <p className="text-xs mb-2">Drag and drop files here</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">or</p>
            <button
              data-testid="button-browse-files"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1 text-xs win96-raised win96-button-face active:win96-pressed"
            >
              Browse...
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          data-testid="button-upload-confirm"
          onClick={handleUpload}
          disabled={!selectedFiles || isUploading}
          className={`px-4 py-1 text-xs win96-raised win96-button-face ${
            !selectedFiles || isUploading ? "opacity-50 cursor-not-allowed" : "active:win96-pressed"
          }`}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
        <button
          data-testid="button-upload-cancel"
          onClick={onClose}
          className="px-4 py-1 text-xs win96-raised win96-button-face active:win96-pressed"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
