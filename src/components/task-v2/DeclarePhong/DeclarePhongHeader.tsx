"use client";

import { Button } from "@/components/ui/button";
import { File, Plus } from "lucide-react";

interface DeclarePhongHeaderProps {
  currentTab: string;
  onOpenModal: (open: boolean) => void;
  onExportExcel: () => void;
}
export default function DeclarePhongHeader({
  currentTab,
  onOpenModal,
  onExportExcel,
}: DeclarePhongHeaderProps) {
  return (
    <div className="space-y-4 px-4">
      <div className="flex justify-end items-center gap-2">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => onOpenModal(true)}
        >
          <Plus className="w-4 h-4" />
          Khai công việc phòng
        </Button>
        {currentTab === "ACCEPTED" && (
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={onExportExcel}
          >
            <File className="w-4 h-4" />
            Xuất Excel
          </Button>
        )}
      </div>
    </div>
  );
}
