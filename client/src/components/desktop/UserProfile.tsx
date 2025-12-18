import { useState } from "react";
import type { User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfileProps {
  user: User;
  onClose: () => void;
  onLogout: () => void;
}

export function UserProfile({ user, onClose, onLogout }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "account">("profile");

  const getInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-[hsl(var(--border))]">
        <button
          data-testid="tab-profile"
          onClick={() => setActiveTab("profile")}
          className={`px-3 py-2 text-xs ${
            activeTab === "profile"
              ? "win96-inset bg-white dark:bg-[hsl(var(--background))]"
              : "win96-raised win96-button-face"
          }`}
        >
          Profile
        </button>
        <button
          data-testid="tab-account"
          onClick={() => setActiveTab("account")}
          className={`px-3 py-2 text-xs ${
            activeTab === "account"
              ? "win96-inset bg-white dark:bg-[hsl(var(--background))]"
              : "win96-raised win96-button-face"
          }`}
        >
          Account
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeTab === "profile" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback className="text-lg">{getInitials(user)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-sm font-bold">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.email || "User"}
                </h3>
                {user.email && (
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{user.email}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="win96-inset p-2">
                <label className="block text-xs font-bold mb-1">First Name</label>
                <div className="text-xs">{user.firstName || "Not set"}</div>
              </div>
              <div className="win96-inset p-2">
                <label className="block text-xs font-bold mb-1">Last Name</label>
                <div className="text-xs">{user.lastName || "Not set"}</div>
              </div>
              <div className="win96-inset p-2">
                <label className="block text-xs font-bold mb-1">Email</label>
                <div className="text-xs">{user.email || "Not set"}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "account" && (
          <div className="space-y-4">
            <div className="win96-inset p-3">
              <h4 className="text-xs font-bold mb-2">Session Information</h4>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                You are currently logged in. Your session will remain active until you log out.
              </p>
            </div>

            <div className="space-y-2">
              <button
                data-testid="button-logout"
                onClick={onLogout}
                className="w-full px-4 py-2 text-xs win96-raised win96-button-face active:win96-pressed"
              >
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 p-2 win96-raised bg-[hsl(var(--win96-button-face))]">
        <button
          data-testid="button-close-profile"
          onClick={onClose}
          className="px-4 py-1 text-xs win96-raised win96-button-face active:win96-pressed"
        >
          Close
        </button>
      </div>
    </div>
  );
}
