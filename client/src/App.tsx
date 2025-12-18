import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import SharePage from "@/pages/SharePage";
import { Monitor } from "lucide-react";

function LoadingScreen() {
  return (
    <div className="min-h-screen win96-desktop flex items-center justify-center">
      <div className="win96-raised win96-window p-8 flex flex-col items-center gap-4">
        <Monitor className="w-12 h-12 animate-pulse" />
        <p className="text-sm">Loading FileOS 96...</p>
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/share/:token" component={SharePage} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/share/:token" component={SharePage} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
