/**
 * v3 Atoms - Base Atomic Components
 *
 * These components use v3 design tokens and support theming
 * via the data-theme attribute on the html element.
 *
 * @see src/styles/v3/tokens/ for design token values
 * @see src/styles/v3/themes/ for theme overrides
 */

// Button - Primary interactive element with variants
export { Button, buttonVariants, type ButtonProps } from "./Button";

// Input - Text input field with error state
export { Input, type InputProps } from "./Input";

// Badge - Status indicator with semantic colors
export { Badge, badgeVariants, type BadgeProps } from "./Badge";

// Text - Typography component with polymorphic rendering
export { Text, textVariants, type TextProps } from "./Text";

// Icon - Wrapper for lucide-react icons
export { Icon, iconVariants, type IconProps } from "./Icon";
