"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CategoryCode } from "@/definitions/types/category.type";

interface ShowMorePositionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mainPosition: CategoryCode;
  additionalPositions: CategoryCode[];
}

export default function ShowMorePositionDialog({
  isOpen,
  onOpenChange,
  mainPosition,
  additionalPositions,
}: ShowMorePositionDialogProps) {
  const allPositions = [mainPosition, ...additionalPositions];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Danh sách chức danh</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700 w-1/6">
                    STT
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700 w-2/3">
                    Chức danh
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-center text-sm font-medium text-gray-700 w-1/5">
                    Loại
                  </th>
                </tr>
              </thead>
              <tbody>
                {allPositions.map((position, index) => (
                  <tr
                    key={position.id}
                    className={index === 0 ? "font-bold bg-blue-50" : ""}
                  >
                    <td className="border border-gray-200 px-4 py-2 text-center text-sm">
                      {index + 1}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm pl-4">
                      {position.name}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center text-sm">
                      {index === 0 ? "Chính" : "Phụ"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <i className="ti ti-close mr-2" />
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
