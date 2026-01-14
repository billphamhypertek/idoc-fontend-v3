import { Button } from "@/components/ui/button";
import { ListChecks } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";

export function TaskGivingHandler({
  selectedItemId,
}: {
  selectedItemId: number;
}) {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      className="text-white border-0 h-9 px-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700"
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3a7bc8")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4798e8")}
      onClick={() =>
        router.push(
          `/task/userAssign?draftId=${encodeURIComponent(String(selectedItemId))}`
        )
      }
    >
      <ListChecks className="w-4 h-4 mr-1" />
      Giao việc
    </Button>
  );
}
