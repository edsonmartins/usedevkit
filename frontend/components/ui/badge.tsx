"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-terminal-green focus:ring-offset-1 focus:ring-offset-terminal-bg",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-terminal-green text-terminal-bg shadow-[0_0_10px_rgba(34,197,94,0.3)]",
        secondary:
          "border-transparent bg-terminal-surface text-terminal-text",
        destructive:
          "border-transparent bg-terminal-coral text-white",
        outline: "text-terminal-text border-terminal-border",
        success:
          "border-transparent bg-terminal-green/20 text-terminal-green border-terminal-green/50",
        warning:
          "border-transparent bg-terminal-yellow/20 text-terminal-yellow border-terminal-yellow/50",
        danger:
          "border-transparent bg-terminal-coral/20 text-terminal-coral border-terminal-coral/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
