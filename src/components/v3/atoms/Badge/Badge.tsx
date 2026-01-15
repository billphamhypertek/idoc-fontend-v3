import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

/**
 * v3 Badge Component
 * Uses v3 design tokens for semantic color variants
 * Supports default, secondary, destructive, outline, success, warning, info, accent
 * Can be made interactive with onClick prop
 */
const badgeVariants = cva(
  [
    "inline-flex items-center",
    "rounded-[var(--v3-radius-full)]",
    "border",
    "px-2.5 py-0.5",
    "text-[length:var(--v3-font-size-sm)]",
    "font-semibold",
    "transition-colors duration-[var(--v3-transition-normal)]",
    "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-ring-color))] focus:ring-offset-2",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "border-transparent",
          "bg-[hsl(var(--v3-color-primary))]",
          "text-[hsl(var(--v3-color-primary-foreground))]",
          "shadow-[var(--v3-shadow-sm)]",
        ].join(" "),
        secondary: [
          "border-transparent",
          "bg-[hsl(var(--v3-color-secondary))]",
          "text-[hsl(var(--v3-color-secondary-foreground))]",
        ].join(" "),
        destructive: [
          "border-transparent",
          "bg-[hsl(var(--v3-color-destructive))]",
          "text-[hsl(var(--v3-color-destructive-foreground))]",
          "shadow-[var(--v3-shadow-sm)]",
        ].join(" "),
        outline: [
          "border-[hsl(var(--v3-color-border))]",
          "text-[hsl(var(--v3-color-foreground))]",
        ].join(" "),
        success: [
          "border-transparent",
          "bg-[hsl(var(--v3-color-success))]",
          "text-[hsl(var(--v3-color-success-foreground))]",
        ].join(" "),
        warning: [
          "border-transparent",
          "bg-[hsl(var(--v3-color-warning))]",
          "text-[hsl(var(--v3-color-warning-foreground))]",
        ].join(" "),
        info: [
          "border-transparent",
          "bg-[hsl(var(--v3-color-info))]",
          "text-[hsl(var(--v3-color-info-foreground))]",
        ].join(" "),
        accent: [
          "border-transparent",
          "bg-[hsl(var(--v3-color-accent))]",
          "text-[hsl(var(--v3-color-accent-foreground))]",
        ].join(" "),
      },
      interactive: {
        true: "cursor-pointer hover:opacity-80",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Click handler - makes badge interactive */
  onClick?: () => void;
}

function Badge({
  className,
  variant,
  interactive,
  onClick,
  ...props
}: BadgeProps) {
  const isInteractive = interactive || !!onClick;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isInteractive && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className={cn(
        badgeVariants({ variant, interactive: isInteractive }),
        className
      )}
      onClick={onClick}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      {...props}
    />
  );
}
Badge.displayName = "Badge";

export { Badge, badgeVariants };
