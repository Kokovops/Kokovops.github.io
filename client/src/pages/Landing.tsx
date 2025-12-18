import { Monitor, FileText, Folder, Shield, Share2, Palette } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen win96-desktop flex flex-col">
      <header className="win96-taskbar win96-raised h-12 flex items-center px-4 gap-4">
        <div className="flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          <span className="font-bold text-sm">FileOS 96</span>
        </div>
        <div className="flex-1" />
        <a
          href="/api/login"
          data-testid="button-login"
          className="px-4 py-1 text-xs win96-raised win96-button-face active:win96-pressed"
        >
          Sign In
        </a>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="win96-raised win96-window p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 win96-raised win96-button-face flex items-center justify-center">
                <Monitor className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">Welcome to FileOS 96</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              A nostalgic file storage experience inspired by classic desktop operating systems
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="win96-inset p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" />
                <h3 className="text-xs font-bold">Store Files</h3>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Upload and manage your documents, images, videos, and audio files
              </p>
            </div>
            <div className="win96-inset p-4">
              <div className="flex items-center gap-2 mb-2">
                <Folder className="w-4 h-4" />
                <h3 className="text-xs font-bold">Desktop Interface</h3>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Drag and drop files on your virtual desktop, just like the good old days
              </p>
            </div>
            <div className="win96-inset p-4">
              <div className="flex items-center gap-2 mb-2">
                <Share2 className="w-4 h-4" />
                <h3 className="text-xs font-bold">Share Files</h3>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Generate share links to let others access your files
              </p>
            </div>
            <div className="win96-inset p-4">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-4 h-4" />
                <h3 className="text-xs font-bold">Customize</h3>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Change themes, upload custom backgrounds, and personalize your experience
              </p>
            </div>
          </div>

          <div className="text-center">
            <a
              href="/api/login"
              data-testid="button-get-started"
              className="inline-block px-8 py-2 text-sm win96-raised win96-button-face active:win96-pressed font-bold"
            >
              Get Started
            </a>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-4">
              Create an account or sign in to access your personal desktop
            </p>
          </div>
        </div>
      </main>

      <footer className="win96-raised win96-taskbar h-8 flex items-center justify-center px-4">
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          FileOS 96 - Your files, your way
        </p>
      </footer>
    </div>
  );
}
