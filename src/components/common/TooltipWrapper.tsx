"use client";

import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface TooltipWrapperProps {
  title: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  // passthrough positioning props if needed later
}

export default function TooltipWrapper({
  title,
  children,
  className,
  contentClassName,
}: TooltipWrapperProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("inline-flex", className)}>{children}</span>
        </TooltipTrigger>
        <TooltipContent className={contentClassName}>{title}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
