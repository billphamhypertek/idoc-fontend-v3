import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";

import { cn } from "~/lib/utils";

/**
 * v3 Icon Component
 * Wrapper for lucide-react icons with v3 design tokens
 * Supports size and color variants
 * Interactive icons have 44x44px touch target
 */
const iconVariants = cva("shrink-0", {
  variants: {
    size: {
      sm: "h-4 w-4", // 16px
      default: "h-5 w-5", // 20px
      lg: "h-6 w-6", // 24px
    },
    color: {
      default: "text-[hsl(var(--v3-color-foreground))]",
      muted: "text-[hsl(var(--v3-color-muted-foreground))]",
      primary: "text-[hsl(var(--v3-color-primary))]",
      success: "text-[hsl(var(--v3-color-success))]",
      warning: "text-[hsl(var(--v3-color-warning))]",
      error: "text-[hsl(var(--v3-color-destructive))]",
      info: "text-[hsl(var(--v3-color-info))]",
    },
  },
  defaultVariants: {
    size: "default",
    color: "default",
  },
});

export interface IconProps
  extends Omit<React.SVGAttributes<SVGElement>, "color">,
    VariantProps<typeof iconVariants> {
  /** Lucide icon component to render */
  icon: LucideIcon;
  /** Make icon interactive with 44x44px touch target */
  interactive?: boolean;
  /** Label for accessibility (required for interactive icons) */
  label?: string;
  /** Click handler for interactive icons */
  onClick?: () => void;
}

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  (
    {
      className,
      icon: IconComponent,
      size,
      color,
      interactive = false,
      label,
      onClick,
      ...props
    },
    ref
  ) => {
    const iconElement = (
      <IconComponent
        ref={ref}
        className={cn(iconVariants({ size, color }), className)}
        aria-hidden={!label}
        aria-label={label}
        {...props}
      />
    );

    // Wrap in touch target container for interactive icons
    if (interactive) {
      const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      };

      return (
        <span
          className={cn(
            "inline-flex items-center justify-center",
            "h-11 w-11", // 44px touch target
            "cursor-pointer",
            "rounded-[var(--v3-radius-md)]",
            "transition-colors duration-[var(--v3-transition-normal)]",
            "hover:bg-[hsl(var(--v3-color-muted))]",
            "focus-visible:outline-none",
            "focus-visible:ring-[length:var(--v3-ring-width)]",
            "focus-visible:ring-[hsl(var(--v3-ring-color))]"
          )}
          role="button"
          tabIndex={0}
          aria-label={label}
          onClick={onClick}
          onKeyDown={handleKeyDown}
        >
          {iconElement}
        </span>
      );
    }

    return iconElement;
  }
);
Icon.displayName = "Icon";

export { Icon, iconVariants };
