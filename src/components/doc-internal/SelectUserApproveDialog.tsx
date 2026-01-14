"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  CustomDialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { useGetUserApprove } from "@/hooks/data/doc-internal.data";
import { getUserInfo } from "@/utils/token.utils";
import {
  TableBase,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface User {
  id: number;
  fullName: string;
  userName?: string;
  orgName?: string;
  positionName?: string;
  checked?: boolean;
}

interface SelectUserApproveDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUsers: User[];
  onConfirm: (users: User[]) => void;
}

export function SelectUserApproveDialog({
  isOpen,
  onOpenChange,
  selectedUsers,
  onConfirm,
}: SelectUserApproveDialogProps) {
  const [users, setUsers] = useState<User[]>([]);

  // Lấy orgId từ user hiện tại - giống Angular
  const userInfo = getUserInfo();
  const orgId = userInfo ? JSON.parse(userInfo).org : "";

  const { data: usersData = [], isLoading } = useGetUserApprove(orgId);

  useEffect(() => {
    if (isOpen && usersData.length > 0) {
      // Map users and mark selected ones as checked - giống Angular
      const mappedUsers = usersData.map((user: User) => ({
        ...user,
        checked: selectedUsers.some((selected) => selected.id === user.id),
      }));
      setUsers(mappedUsers);
    }
  }, [isOpen, usersData, selectedUsers]);

  const handleUserCheckedChange = (user: User) => {
    // Toggle checked state - giống Angular
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, checked: !u.checked } : u))
    );
  };

  const handleConfirm = () => {
    // Lấy danh sách users đã checked - giống Angular
    const selected = users.filter((u) => u.checked);
    onConfirm(selected);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <CustomDialogContent>
        <DialogHeader className="relative">
          <div className="flex items-center justify-between">
            <DialogTitle>Danh sách người duyệt</DialogTitle>
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="h-9 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto border rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-9 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-gray-500">
              Không có dữ liệu
            </div>
          ) : (
            <TableBase>
              <TableHeader className="sticky top-0 bg-[#E6F1FC]">
                <TableRow>
                  <TableHead className="px-4 py-3 text-center text-sm font-bold">
                    Lãnh đạo Phòng/Ban
                  </TableHead>
                  <TableHead className="px-4 py-3 text-center text-sm font-bold w-32">
                    Phê duyệt
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="border-t hover:bg-gray-50">
                    <TableCell className="px-4 py-3 text-sm">
                      {[user.fullName, user.positionName]
                        .filter(Boolean)
                        .join(" - ")}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <Checkbox
                        checked={user.checked || false}
                        onCheckedChange={() => handleUserCheckedChange(user)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableBase>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Chọn
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
