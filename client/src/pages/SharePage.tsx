import { useEffect } from "react";
import { useParams } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, LogIn } from "lucide-react";

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const addToDesktopMutation = useMutation({
    mutationFn: async () => apiRequest("POST", `/api/share/${token}/add`),
    onSuccess: () => {
      toast({ title: "File added to your desktop!" });
      window.location.href = "/";
    },
    onError: () => {
      toast({ title: "Failed to add file", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen win96-desktop flex items-center justify-center">
        <div className="win96-raised win96-window p-8">
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen win96-desktop flex flex-col items-center justify-center p-8">
      <div className="win96-raised win96-window p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 win96-raised win96-button-face flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Shared File</h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Someone shared a file with you
            </p>
          </div>
        </div>

        <div className="win96-inset p-3 mb-4">
          <p className="text-xs">
            {isAuthenticated
              ? "Click the button below to add this file to your desktop."
              : "Sign in to add this file to your desktop."}
          </p>
        </div>

        {isAuthenticated ? (
          <button
            data-testid="button-add-to-desktop"
            onClick={() => addToDesktopMutation.mutate()}
            disabled={addToDesktopMutation.isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs win96-raised win96-button-face active:win96-pressed"
          >
            <Download className="w-4 h-4" />
            {addToDesktopMutation.isPending ? "Adding..." : "Add to My Desktop"}
          </button>
        ) : (
          <a
            href="/api/login"
            data-testid="button-login-to-add"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs win96-raised win96-button-face active:win96-pressed"
          >
            <LogIn className="w-4 h-4" />
            Sign In to Add File
          </a>
        )}
      </div>
    </div>
  );
}
