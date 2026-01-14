"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table } from "../ui/table";
import { Column, PositionModel } from "@/definitions";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import { Constant } from "@/definitions/constants/constant";

interface PositionRoleAssignmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  positionsData: PositionModel[];
  isLoading: boolean;
  positionsInformationData?: PositionModel[]; // Danh sách position đã gán (hoặc đang được gán cho vai trò này)
  onAddPosition: (position: PositionModel) => void;
  onRemovePosition: (positionId: number) => void;
  onSave: () => void;
}

export default function PositionRoleAssignmentDialog({
  isOpen,
  onOpenChange,
  positionsData = [],
  isLoading = false,
  positionsInformationData = [],
  onAddPosition,
  onRemovePosition,
  onSave,
}: PositionRoleAssignmentDialogProps) {
  const [searchResults, setSearchResults] = useState<PositionModel[]>([]);

  useEffect(() => {
    if (positionsData.length > 0) {
      setSearchResults(positionsData);
    }
  }, [positionsData.length]);

  // Chỉ dùng positionsData để kiểm tra assign trạng thái
  const isPositionAssigned = (positionId: number | undefined) => {
    if (typeof positionId !== "number") return false;
    return positionsInformationData.some((p) => p.id === positionId);
  };

  const handleAddPositionToRole = (position: PositionModel) => {
    onAddPosition(position);
  };

  const handleRemovePositionFromRole = (positionId: number) => {
    onRemovePosition(positionId);
  };

  const handleSave = () => {
    onSave();
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const columns: Column<PositionModel>[] = [
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-medium">STT</span>
        </div>
      ),
      className: "text-center py-1 w-4",
      accessor: (_item: PositionModel, index: number) => (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-medium">{index + 1}</span>
        </div>
      ),
    },
    {
      header: "Chức danh",
      className: "py-2 w-44",
      accessor: (item: PositionModel) => {
        return <div className="text-center">{item.name}</div>;
      },
    },
    {
      header: "Thao tác",
      className: "py-2 w-44",
      accessor: (item: PositionModel) => {
        const assigned = item.id && isPositionAssigned(item.id);
        return (
          <div className="text-center">
            {assigned ? (
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => handleRemovePositionFromRole(item.id!)}
                size="sm"
              >
                Hủy bỏ gán
              </Button>
            ) : (
              <Button
                className="bg-blue-600 hover:bg-blue-600 text-white"
                onClick={() => handleAddPositionToRole(item)}
                size="sm"
              >
                Gán vai trò
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Gán chức danh cho vai trò</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Đã gán {positionsInformationData.length} chức danh vào vai trò
          </div>

          <div className="overflow-x-auto max-h-96">
            <Table
              dataSource={searchResults || []}
              columns={columns}
              loading={isLoading}
              emptyText={isLoading ? "Đang tải dữ liệu..." : "Không có dữ liệu"}
              bgColor="bg-white"
              showPagination={false}
              sortable={false}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            className="bg-green-500 hover:bg-blue-600 text-white"
            onClick={handleSave}
          >
            Lưu
          </Button>
          <Button variant="outline" onClick={handleClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
