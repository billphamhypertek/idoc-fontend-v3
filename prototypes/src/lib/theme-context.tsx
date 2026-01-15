"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { themePalettes } from "@/data/mock-data";

type ThemePalette = typeof themePalettes[number];

interface ThemeContextType {
    currentTheme: ThemePalette;
    setTheme: (theme: ThemePalette) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const THEME_STORAGE_KEY = "dhtn-v3-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [currentTheme, setCurrentTheme] = useState<ThemePalette>(themePalettes[0]);

    // Load theme from localStorage on mount
    useEffect(() => {
        const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedThemeId) {
            const savedTheme = themePalettes.find((t) => t.id === savedThemeId);
            if (savedTheme) {
                setCurrentTheme(savedTheme);
                applyTheme(savedTheme);
            }
        }
    }, []);

    const applyTheme = (theme: ThemePalette) => {
        const root = document.documentElement;
        root.style.setProperty("--v3-primary", theme.primary);
        root.style.setProperty("--v3-primary-hover", theme.primaryHover);
        root.style.setProperty("--v3-sidebar-active", theme.primary);
        root.style.setProperty("--v3-accent", theme.accent);
    };

    const setTheme = useCallback((theme: ThemePalette) => {
        setCurrentTheme(theme);
        applyTheme(theme);
        localStorage.setItem(THEME_STORAGE_KEY, theme.id);
    }, []);

    return (
        <ThemeContext.Provider value={{ currentTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        // Return default values if context is not available (SSR or outside provider)
        return {
            currentTheme: themePalettes[0],
            setTheme: () => { },
        };
    }
    return context;
}
