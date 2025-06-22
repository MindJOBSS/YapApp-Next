import { create } from "zustand";

interface ThemeStore {
  theme: string;
  setTheme: (theme: string) => void;
  initializeTheme: () => void;
}

export const themeStore = create<ThemeStore>((set) => ({
  theme: "light", // default fallback
  setTheme: (theme: string) => {
    localStorage.setItem("chat-theme", theme);
    set({ theme });
  },
  initializeTheme: () => {
    const savedTheme = localStorage.getItem("chat-theme") || "light";
    set({ theme: savedTheme });
  },
}));
