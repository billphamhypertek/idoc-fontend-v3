import * as React from "react";

import { cn } from "~/lib/utils";

/**
 * v3 Input Component
 * Uses v3 design tokens for theming support
 * Supports error state and all standard input types
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Show error styling */
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex h-10 w-full",
          "rounded-[var(--v3-radius-md)]",
          "border",
          "bg-[hsl(var(--v3-color-background))]",
          "px-3 py-2",
          "text-[length:var(--v3-font-size-base)]",
          "font-[var(--v3-font-sans)]",
          "text-[hsl(var(--v3-color-foreground))]",
          "transition-all duration-[var(--v3-transition-normal)]",
          // Placeholder
          "placeholder:text-[hsl(var(--v3-color-muted-foreground))]",
          // Focus ring
          "focus-visible:outline-none",
          "focus-visible:ring-[length:var(--v3-ring-width)]",
          "focus-visible:ring-offset-[length:var(--v3-ring-offset)]",
          "focus-visible:ring-[hsl(var(--v3-ring-color))]",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50",
          "disabled:bg-[hsl(var(--v3-color-muted))]",
          // Read-only state
          "[&:read-only]:bg-[hsl(var(--v3-color-muted))]",
          // File input styling
          "file:border-0 file:bg-transparent",
          "file:text-[length:var(--v3-font-size-sm)]",
          "file:font-medium",
          "file:text-[hsl(var(--v3-color-foreground))]",
          // Border color - conditional on error (uses --v3-color-error per AC#3)
          error
            ? "border-[hsl(var(--v3-color-error))] focus-visible:ring-[hsl(var(--v3-color-error))]"
            : "border-[hsl(var(--v3-color-border))]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
