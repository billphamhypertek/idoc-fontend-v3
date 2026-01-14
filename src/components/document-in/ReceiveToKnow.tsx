import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ReceiveToKnowDialog } from "@/components/document-in/ReceiveToKnowDialog";
import { UserInfo } from "@/definitions";
import { X, User2 } from "lucide-react";

interface Props {
  onSubmit: (s: string) => void;
}

export default function ReceiveToKnowButton({ onSubmit }: Props) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [receiveToKnowData, setReceiveToKnowData] = useState<UserInfo[]>([]);

  const handleRemove = useCallback((user: UserInfo) => {
    setReceiveToKnowData((prev) => prev.filter((item) => item.id !== user.id));
  }, []);

  const handleOpenDialog = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center gap-3">
        <Button
          variant={"outline"}
          onClick={handleOpenDialog}
          className="flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-none w-[220px]"
        >
          <User2 className="w-4 h-4 mr-2 text-white" />
          Thêm người ký
        </Button>
        <span className="text-sm font-medium text-gray-600 flex items-center">
          {receiveToKnowData.length} người ký
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {receiveToKnowData.map((user) => (
          <span
            key={user.id}
            className="inline-flex items-center px-3 py-2 rounded-md bg-gray-100 text-sm border"
          >
            <User2 className="mr-2 w-4 h-4 text-blue-600" />
            <span className="truncate max-w-xs text-blue-600 font-medium">
              {user.positionModel?.name || user.position} - {user.fullName}
            </span>
            <X
              className="ml-2 w-4 h-4 cursor-pointer text-gray-500 hover:text-red-600 transition-colors"
              onClick={() => handleRemove(user)}
            />
          </span>
        ))}
      </div>

      <ReceiveToKnowDialog
        data={receiveToKnowData}
        setData={setReceiveToKnowData}
        isOpen={isDialogOpen}
        onOpenChange={setDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={onSubmit}
      />
    </div>
  );
}
