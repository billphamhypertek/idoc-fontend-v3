import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "~/lib/utils";

/**
 * v3 Button Component
 * Uses v3 design tokens for theming support
 * Supports loading state and asChild composition
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-[var(--v3-radius-md)]",
    "text-[length:var(--v3-font-size-base)]",
    "font-medium",
    "transition-all duration-[var(--v3-transition-normal)]",
    "focus-visible:outline-none",
    "focus-visible:ring-[length:var(--v3-ring-width)]",
    "focus-visible:ring-offset-[length:var(--v3-ring-offset)]",
    "focus-visible:ring-[hsl(var(--v3-ring-color))]",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-[hsl(var(--v3-color-primary))]",
          "text-[hsl(var(--v3-color-primary-foreground))]",
          "shadow-[var(--v3-shadow-sm)]",
          "hover:opacity-90",
        ].join(" "),
        secondary: [
          "bg-[hsl(var(--v3-color-secondary))]",
          "text-[hsl(var(--v3-color-secondary-foreground))]",
          "shadow-[var(--v3-shadow-sm)]",
          "hover:opacity-80",
        ].join(" "),
        destructive: [
          "bg-[hsl(var(--v3-color-destructive))]",
          "text-[hsl(var(--v3-color-destructive-foreground))]",
          "shadow-[var(--v3-shadow-sm)]",
          "hover:opacity-90",
        ].join(" "),
        outline: [
          "border border-[hsl(var(--v3-color-border))]",
          "bg-[hsl(var(--v3-color-background))]",
          "text-[hsl(var(--v3-color-foreground))]",
          "hover:bg-[hsl(var(--v3-color-muted))]",
        ].join(" "),
        ghost: [
          "text-[hsl(var(--v3-color-foreground))]",
          "hover:bg-[hsl(var(--v3-color-muted))]",
        ].join(" "),
        link: [
          "text-[hsl(var(--v3-color-primary))]",
          "underline-offset-4 hover:underline",
        ].join(" "),
      },
      size: {
        sm: "h-9 px-3",
        default: "h-10 px-4 py-2",
        lg: "h-11 px-8",
        icon: "h-11 w-11", // 44px touch target
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as child component using Radix Slot */
  asChild?: boolean;
  /** Show loading spinner and disable button */
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        type={asChild ? undefined : "button"}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
