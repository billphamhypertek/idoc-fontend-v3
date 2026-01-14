import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { X, Building2 } from "lucide-react";
import { OutsideReceivePlaceDialog } from "@/components/document-in/OutsideReceivePlaceDialog";
import { OutsideAgency } from "@/definitions/types/common.type";

interface Props {
  onSubmit: (i: any) => void;
}

export default function OutsideReceivePlace({ onSubmit }: Props) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [outsideReceive, setOutsideReceive] = useState<OutsideAgency[]>([]);

  // Memoized functions
  const convertObject = useCallback((agencies: OutsideAgency[]) => {
    return agencies.map((item) => ({
      address: item.code,
      name: item.name,
      outsideId: item.id,
    }));
  }, []);

  const handleRemove = useCallback(
    (agency: OutsideAgency) => {
      setOutsideReceive((prev) => {
        const newValue = prev.filter((item) => item !== agency);
        onSubmit(convertObject(newValue));
        return newValue;
      });
    },
    [convertObject, onSubmit]
  );

  const handleAdd = useCallback(
    (agencies: OutsideAgency[]) => {
      setOutsideReceive(agencies);
      onSubmit(convertObject(agencies));
    },
    [convertObject, onSubmit]
  );

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
          <Building2 className="w-4 h-4 mr-2 text-white" />
          Thêm nơi nhận bên ngoài
        </Button>
        <span className="text-sm font-medium text-gray-600 flex items-center">
          {outsideReceive.length} nơi nhận
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {outsideReceive.map((agency) => (
          <span
            key={agency.id}
            className="inline-flex items-center px-3 py-2 rounded-md bg-gray-100 text-sm border"
          >
            <Building2 className="mr-2 w-4 h-4 text-blue-600" />
            <span className="truncate max-w-xs text-blue-600 font-medium">
              {agency.name}
            </span>
            <X
              className="ml-2 w-4 h-4 cursor-pointer text-gray-500 hover:text-red-600 transition-colors"
              onClick={() => handleRemove(agency)}
            />
          </span>
        ))}
      </div>

      <OutsideReceivePlaceDialog
        data={outsideReceive}
        setData={handleAdd}
        isOpen={isDialogOpen}
        onOpenChange={setDialogOpen}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
