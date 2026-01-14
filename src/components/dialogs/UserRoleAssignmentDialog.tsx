"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { UserInfo } from "@/definitions/types/auth.type";
import { useSearchUserActiveByTextSearch } from "@/hooks/data/role.data";
import { ToastUtils } from "@/utils/toast.utils";
import { Table } from "../ui/table";
import { Column } from "@/definitions";

interface UserRoleAssignmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  usersInformationData?: UserInfo[]; // Danh sách user đã gán (hoặc đang được gán cho vai trò này)
  onAddUser: (user: UserInfo) => void;
  onRemoveUser: (userId: number) => void;
  onSave: () => void;
}

export default function UserRoleAssignmentDialog({
  isOpen,
  onOpenChange,
  usersInformationData = [],
  onAddUser,
  onRemoveUser,
  onSave,
}: UserRoleAssignmentDialogProps) {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<UserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { mutate: doSearchUserActiveByTextSearch } =
    useSearchUserActiveByTextSearch();

  // Chỉ dùng usersInformationData để kiểm tra assign trạng thái
  const isUserAssigned = (userId: number | undefined) => {
    if (typeof userId !== "number") return false;
    return usersInformationData.some((u) => u.id === userId);
  };

  const handleSearchUsers = async () => {
    setIsLoading(true);
    doSearchUserActiveByTextSearch(
      { textSearch: searchText },
      {
        onSuccess: (response) => {
          setIsLoading(false);
          setSearchResults(response);
        },
        onError: () => {
          setIsLoading(false);
          ToastUtils.error("Lỗi khi tìm kiếm người dùng");
        },
      }
    );
  };

  const handleAddUserToRole = (user: UserInfo) => {
    onAddUser(user);
  };

  const handleRemoveUserFromRole = (userId: number) => {
    onRemoveUser(userId);
  };

  const handleSave = () => {
    onSave();
    setSearchText("");
    setSearchResults([]);
  };

  const handleClose = () => {
    onOpenChange(false);
    setSearchText("");
    setSearchResults([]);
  };

  const columns: Column<UserInfo>[] = [
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-medium">STT</span>
        </div>
      ),
      className: "text-center py-1 w-4",
      accessor: (_item: UserInfo, index: number) => (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-medium">{index + 1}</span>
        </div>
      ),
    },
    {
      header: "Họ và tên",
      className: "py-2 w-44",
      accessor: (item: UserInfo) => {
        return <div className="text-center">{item.fullName}</div>;
      },
    },
    {
      header: "Chức danh",
      className: "py-2 w-44",
      accessor: (item: UserInfo) => {
        return (
          <div className="text-center">{item.positionModel?.name || ""}</div>
        );
      },
    },
    {
      header: "Thao tác",
      className: "py-2 w-44",
      accessor: (item: UserInfo) => {
        const assigned = item.id && isUserAssigned(item.id);
        return (
          <div className="text-center">
            {assigned ? (
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => handleRemoveUserFromRole(item.id!)}
                size="sm"
              >
                Hủy bỏ gán
              </Button>
            ) : (
              <Button
                className="bg-blue-600 hover:bg-blue-600 text-white"
                onClick={() => handleAddUserToRole(item)}
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
          <DialogTitle>Gán người dùng cho vai trò</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-4">
            <Input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Nhập họ và tên"
              className="flex-1"
            />
            <Button
              className="bg-blue-600 hover:bg-blue-600 text-white"
              onClick={handleSearchUsers}
            >
              <Search className="h-4 w-4 mr-2" />
              Tìm kiếm
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            Đã gán {usersInformationData.length} người dùng vào vai trò
          </div>

          <div className="overflow-x-auto max-h-96">
            <Table
              dataSource={searchResults}
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
