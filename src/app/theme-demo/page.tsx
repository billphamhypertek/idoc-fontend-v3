"use client";

import { useState, useEffect } from "react";
import { setTheme, getTheme, initTheme, type Theme } from "@/lib/theme";

/**
 * Theme Demo Page - Demonstrates v3 theme system
 *
 * Visit: http://localhost:3001/theme-demo
 */
export default function ThemeDemoPage() {
  const [currentTheme, setCurrentTheme] = useState<Theme>("light");

  useEffect(() => {
    initTheme();
    setCurrentTheme(getTheme());
  }, []);

  const handleThemeChange = (theme: Theme) => {
    setTheme(theme);
    setCurrentTheme(theme);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem",
        backgroundColor: "hsl(var(--v3-color-background))",
        color: "hsl(var(--v3-color-foreground))",
        fontFamily: "var(--v3-font-family-sans)",
        transition: "background-color 0.3s, color 0.3s",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "var(--v3-font-size-4xl)",
            fontWeight: "var(--v3-font-weight-bold)",
            marginBottom: "1rem",
          }}
        >
          🎨 ĐHTN v3 Theme Demo
        </h1>

        <p
          style={{
            color: "hsl(var(--v3-color-muted-foreground))",
            marginBottom: "2rem",
          }}
        >
          Trang demo này sử dụng v3 design tokens. Chọn theme bên dưới để xem
          thay đổi.
        </p>

        {/* Theme Switcher */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}
        >
          {(["light", "dark", "high-contrast"] as Theme[]).map((theme) => (
            <button
              key={theme}
              onClick={() => handleThemeChange(theme)}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "var(--v3-radius-md)",
                border:
                  currentTheme === theme
                    ? "2px solid hsl(var(--v3-color-primary))"
                    : "2px solid hsl(var(--v3-color-border))",
                backgroundColor:
                  currentTheme === theme
                    ? "hsl(var(--v3-color-primary))"
                    : "hsl(var(--v3-color-card))",
                color:
                  currentTheme === theme
                    ? "hsl(var(--v3-color-primary-foreground))"
                    : "hsl(var(--v3-color-foreground))",
                cursor: "pointer",
                fontWeight: "var(--v3-font-weight-medium)",
                transition: "all 0.2s",
              }}
            >
              {theme === "light" && "☀️ Light"}
              {theme === "dark" && "🌙 Dark"}
              {theme === "high-contrast" && "👁️ High Contrast"}
            </button>
          ))}
        </div>

        {/* Demo Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {/* Card 1 - Primary */}
          <div
            style={{
              padding: "1.5rem",
              borderRadius: "var(--v3-radius-lg)",
              backgroundColor: "hsl(var(--v3-color-card))",
              border: "1px solid hsl(var(--v3-color-border))",
              boxShadow: "var(--v3-shadow-md)",
            }}
          >
            <h3
              style={{
                fontSize: "var(--v3-font-size-lg)",
                fontWeight: "var(--v3-font-weight-semibold)",
                marginBottom: "0.5rem",
              }}
            >
              Card với v3 Tokens
            </h3>
            <p
              style={{
                color: "hsl(var(--v3-color-muted-foreground))",
                fontSize: "var(--v3-font-size-sm)",
              }}
            >
              Background, border, và shadow đều sử dụng v3 design tokens.
            </p>
          </div>

          {/* Card 2 - Semantic Colors */}
          <div
            style={{
              padding: "1.5rem",
              borderRadius: "var(--v3-radius-lg)",
              backgroundColor: "hsl(var(--v3-color-card))",
              border: "1px solid hsl(var(--v3-color-border))",
            }}
          >
            <h3
              style={{
                fontSize: "var(--v3-font-size-lg)",
                fontWeight: "var(--v3-font-weight-semibold)",
                marginBottom: "0.5rem",
              }}
            >
              Semantic Colors
            </h3>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <span
                style={{
                  padding: "0.25rem 0.75rem",
                  borderRadius: "var(--v3-radius-full)",
                  backgroundColor: "hsl(var(--v3-color-success))",
                  color: "hsl(var(--v3-color-success-foreground))",
                  fontSize: "var(--v3-font-size-xs)",
                }}
              >
                Success
              </span>
              <span
                style={{
                  padding: "0.25rem 0.75rem",
                  borderRadius: "var(--v3-radius-full)",
                  backgroundColor: "hsl(var(--v3-color-warning))",
                  color: "hsl(var(--v3-color-warning-foreground))",
                  fontSize: "var(--v3-font-size-xs)",
                }}
              >
                Warning
              </span>
              <span
                style={{
                  padding: "0.25rem 0.75rem",
                  borderRadius: "var(--v3-radius-full)",
                  backgroundColor: "hsl(var(--v3-color-error))",
                  color: "hsl(var(--v3-color-error-foreground))",
                  fontSize: "var(--v3-font-size-xs)",
                }}
              >
                Error
              </span>
              <span
                style={{
                  padding: "0.25rem 0.75rem",
                  borderRadius: "var(--v3-radius-full)",
                  backgroundColor: "hsl(var(--v3-color-info))",
                  color: "hsl(var(--v3-color-info-foreground))",
                  fontSize: "var(--v3-font-size-xs)",
                }}
              >
                Info
              </span>
            </div>
          </div>
        </div>

        {/* Current Theme Info */}
        <div
          style={{
            padding: "1rem",
            borderRadius: "var(--v3-radius-md)",
            backgroundColor: "hsl(var(--v3-color-muted))",
            fontFamily: "monospace",
          }}
        >
          <p style={{ margin: 0 }}>
            <strong>Current Theme:</strong> {currentTheme}
          </p>
          <p
            style={{
              margin: "0.5rem 0 0 0",
              color: "hsl(var(--v3-color-muted-foreground))",
            }}
          >
            localStorage key: <code>dhtn-v3-theme</code>
          </p>
        </div>
      </div>
    </div>
  );
}
