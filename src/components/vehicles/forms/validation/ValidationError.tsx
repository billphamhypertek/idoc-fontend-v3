import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle } from "lucide-react";

interface ValidationErrorProps {
  fieldName: string;
  hasFieldError: (fieldName: string) => boolean;
  getFieldError: (fieldName: string) => string;
}

export function ValidationError({
  fieldName,
  hasFieldError,
  getFieldError,
}: ValidationErrorProps) {
  if (!hasFieldError(fieldName)) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center text-xs text-red-500 mt-1">
            <AlertCircle className="w-4 h-4 mr-1" />
            {getFieldError(fieldName)}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getFieldError(fieldName)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
