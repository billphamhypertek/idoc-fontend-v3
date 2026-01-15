import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

/**
 * v3 Text Component
 * Polymorphic typography component with v3 design tokens
 * Supports size, weight, color, and alignment variants
 * Use `as` prop to render as different HTML elements
 */
const textVariants = cva("leading-normal", {
  variants: {
    size: {
      xs: "text-[length:var(--v3-font-size-xs)]",
      sm: "text-[length:var(--v3-font-size-sm)]",
      base: "text-[length:var(--v3-font-size-base)]",
      lg: "text-[length:var(--v3-font-size-lg)]",
      xl: "text-[length:var(--v3-font-size-xl)]",
      "2xl": "text-[length:var(--v3-font-size-2xl)]",
      "3xl": "text-[length:var(--v3-font-size-3xl)]",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    color: {
      default: "text-[hsl(var(--v3-color-foreground))]",
      muted: "text-[hsl(var(--v3-color-muted-foreground))]",
      primary: "text-[hsl(var(--v3-color-primary))]",
      success: "text-[hsl(var(--v3-color-success))]",
      warning: "text-[hsl(var(--v3-color-warning))]",
      error: "text-[hsl(var(--v3-color-destructive))]",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    size: "base",
    weight: "normal",
    color: "default",
    align: "left",
  },
});

type TextElement =
  | "span"
  | "p"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "div"
  | "label";

export interface TextProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">,
    VariantProps<typeof textVariants> {
  /** Render as different HTML element */
  as?: TextElement;
}

const Text = React.forwardRef<HTMLElement, TextProps>(
  (
    { className, as: Component = "span", size, weight, color, align, ...props },
    ref
  ) => {
    return (
      <Component
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={ref as any}
        className={cn(textVariants({ size, weight, color, align }), className)}
        {...props}
      />
    );
  }
);
Text.displayName = "Text";

export { Text, textVariants };
