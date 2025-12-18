import { useState } from "react";
import type { UserSettings } from "@shared/schema";
import { Upload, Check } from "lucide-react";

interface Theme {
  id: string;
  name: string;
  colors: {
    taskbar: string;
    window: string;
    desktop: string;
    text: string;
    accent: string;
  };
}

const themes: Theme[] = [
  {
    id: "classic",
    name: "Classic",
    colors: {
      taskbar: "180 7% 75%",
      window: "180 7% 80%",
      desktop: "180 30% 35%",
      text: "0 0% 0%",
      accent: "240 100% 25%",
    },
  },
  {
    id: "dark",
    name: "Dark",
    colors: {
      taskbar: "0 0% 18%",
      window: "0 0% 20%",
      desktop: "220 15% 12%",
      text: "0 0% 90%",
      accent: "210 85% 50%",
    },
  },
  {
    id: "high-contrast",
    name: "High Contrast",
    colors: {
      taskbar: "0 0% 0%",
      window: "0 0% 0%",
      desktop: "0 0% 0%",
      text: "0 0% 100%",
      accent: "60 100% 50%",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    colors: {
      taskbar: "200 30% 30%",
      window: "200 20% 40%",
      desktop: "200 40% 20%",
      text: "0 0% 95%",
      accent: "180 60% 50%",
    },
  },
];

interface SettingsWindowProps {
  settings: UserSettings | null;
  onSave: (settings: Partial<UserSettings>) => void;
  onClose: () => void;
}

export function SettingsWindow({ settings, onSave, onClose }: SettingsWindowProps) {
  const [activeTab, setActiveTab] = useState<"appearance" | "themes">("appearance");
  const [selectedTheme, setSelectedTheme] = useState(settings?.theme || "classic");
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(
    settings?.desktopBackground || null
  );

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApply = () => {
    const theme = themes.find((t) => t.id === selectedTheme);
    onSave({
      theme: selectedTheme,
      desktopBackground: backgroundPreview,
      customColors: theme?.colors,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-[hsl(var(--border))]">
        <button
          data-testid="tab-appearance"
          onClick={() => setActiveTab("appearance")}
          className={`px-3 py-2 text-xs ${
            activeTab === "appearance"
              ? "win96-inset bg-white dark:bg-[hsl(var(--background))]"
              : "win96-raised win96-button-face"
          }`}
        >
          Appearance
        </button>
        <button
          data-testid="tab-themes"
          onClick={() => setActiveTab("themes")}
          className={`px-3 py-2 text-xs ${
            activeTab === "themes"
              ? "win96-inset bg-white dark:bg-[hsl(var(--background))]"
              : "win96-raised win96-button-face"
          }`}
        >
          Themes
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeTab === "appearance" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-2">Desktop Background</label>
              <div className="flex items-start gap-4">
                <div
                  className="w-48 h-36 win96-inset flex items-center justify-center bg-cover bg-center"
                  style={{
                    backgroundImage: backgroundPreview ? `url(${backgroundPreview})` : undefined,
                    backgroundColor: backgroundPreview ? undefined : "hsl(var(--win96-desktop))",
                  }}
                >
                  {!backgroundPreview && (
                    <span className="text-xs text-white drop-shadow">No background</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="px-3 py-1 text-xs win96-raised win96-button-face cursor-pointer active:win96-pressed flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    Browse...
                    <input
                      data-testid="input-background-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundUpload}
                      className="hidden"
                    />
                  </label>
                  {backgroundPreview && (
                    <button
                      data-testid="button-remove-background"
                      onClick={() => setBackgroundPreview(null)}
                      className="px-3 py-1 text-xs win96-raised win96-button-face active:win96-pressed"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "themes" && (
          <div className="space-y-4">
            <label className="block text-xs font-bold mb-2">Select Theme</label>
            <div className="grid grid-cols-2 gap-4">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  data-testid={`theme-${theme.id}`}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`relative p-2 text-left ${
                    selectedTheme === theme.id ? "win96-inset" : "win96-raised"
                  } win96-button-face`}
                >
                  <div
                    className="w-full h-16 mb-2"
                    style={{
                      background: `linear-gradient(to bottom, 
                        hsl(${theme.colors.taskbar}) 0%, 
                        hsl(${theme.colors.taskbar}) 20%, 
                        hsl(${theme.colors.desktop}) 20%, 
                        hsl(${theme.colors.desktop}) 100%)`,
                    }}
                  >
                    <div
                      className="absolute top-6 left-4 right-4 h-8"
                      style={{
                        backgroundColor: `hsl(${theme.colors.window})`,
                        border: "2px solid",
                        borderTopColor: "white",
                        borderLeftColor: "white",
                        borderRightColor: "#555",
                        borderBottomColor: "#555",
                      }}
                    >
                      <div
                        className="h-3"
                        style={{ backgroundColor: `hsl(${theme.colors.accent})` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedTheme === theme.id && <Check className="w-3 h-3" />}
                    <span className="text-xs">{theme.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 p-2 win96-raised bg-[hsl(var(--win96-button-face))]">
        <button
          data-testid="button-ok"
          onClick={() => {
            handleApply();
            onClose();
          }}
          className="px-4 py-1 text-xs win96-raised win96-button-face active:win96-pressed"
        >
          OK
        </button>
        <button
          data-testid="button-cancel"
          onClick={onClose}
          className="px-4 py-1 text-xs win96-raised win96-button-face active:win96-pressed"
        >
          Cancel
        </button>
        <button
          data-testid="button-apply"
          onClick={handleApply}
          className="px-4 py-1 text-xs win96-raised win96-button-face active:win96-pressed"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
