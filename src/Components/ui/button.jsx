import React from "react";
import { cn } from "@/utils";

const baseStyles =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50";

const variantStyles = {
  default:
    "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/80 shadow-[0_8px_24px_-12px_rgba(14,116,255,0.7)]",
  outline:
    "border border-border bg-card text-card-foreground hover:bg-muted/60",
  ghost:
    "text-foreground hover:bg-muted/60",
};

const sizeStyles = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3 text-xs",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10",
};

export const Button = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      type = "button",
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        baseStyles,
        variantStyles[variant] || variantStyles.default,
        sizeStyles[size] || sizeStyles.default,
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
