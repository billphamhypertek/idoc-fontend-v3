"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Table } from "@/components/ui/table";
import { Column } from "@/definitions/types/table.type";
import SelectCustom from "@/components/common/SelectCustom";
import { UserService } from "@/services/user.service";
import { CategoryService } from "@/services/category-service";
import { OrganizationService } from "@/services/organization.service";
import OrgTreeSelect from "@/components/common/OrgTreeSelect";
import {
  useGetListShare,
  useAddShare,
} from "@/hooks/data/document-record.data";
import { useToast } from "@/hooks/use-toast";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string;
}

interface SharedUser {
  id: number;
  name: string;
  position: string;
  unit: string;
  permission: string;
}

interface User {
  id: number;
  fullName: string;
  positionName: string;
  orgName: string;
}

// Helper function để chuyển flat array thành tree structure
const buildOrgTree = (
  flatArray: any[],
  parentId: number | null = null
): any[] => {
  return flatArray
    .filter((item) => item.parentId === parentId)
    .map((item) => ({
      id: item.id,
      name: item.name,
      parentId: item.parentId,
      children: buildOrgTree(flatArray, item.id),
      expanded: false,
      hasChildren: flatArray.some((child) => child.parentId === item.id),
    }));
};

export default function ShareModal({
  isOpen,
  onClose,
  folderId,
}: ShareModalProps) {
  const { toast } = useToast();
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [isFindUserOpen, setIsFindUserOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { data: sharedUsersData, isLoading: loadingSharedUsers } =
    useGetListShare(folderId, isOpen && !!folderId);
  const { mutate: addShare, isPending: sharing } = useAddShare();

  useEffect(() => {
    if (sharedUsersData) {
      const users: SharedUser[] =
        sharedUsersData?.map((user: any) => ({
          id: user.id,
          name: user.fullName,
          position: user.positionName,
          unit: user.orgName,
          permission: user.permission || "Xem",
        })) || [];
      setSharedUsers(users);
    }
  }, [sharedUsersData]);

  useEffect(() => {
    if (isFindUserOpen) {
      loadOrganizations();
      loadPositions();
      loadUsers();
    }
  }, [isFindUserOpen]);

  useEffect(() => {
    if (isFindUserOpen) {
      const timeoutId = setTimeout(() => {
        loadUsers();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [search]);

  useEffect(() => {
    if (isFindUserOpen) {
      loadUsers();
    }
  }, [page]);

  const loadOrganizations = async () => {
    try {
      const response = await OrganizationService.getOrganizations({
        active: true,
      });

      const treeOrgs = buildOrgTree(response || []);

      setOrganizations(treeOrgs);
    } catch (error) {
      console.error("Error loading organizations:", error);
    }
  };

  const loadPositions = async () => {
    try {
      const response = await CategoryService.getCategoriesByCode("CVND");
      const formattedPositions =
        response?.map((pos: any) => ({
          value: pos.id,
          label: pos.name,
        })) || [];
      setPositions(formattedPositions);
    } catch (error) {
      console.error("Error loading positions:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const params = new URLSearchParams({
        fullName: search,
        orgId: selectedOrg,
        posId: selectedPosition,
        page: page.toString(),
      });
      const response = await UserService.searchByFullnamePosOrg(
        params.toString()
      );
      const userData = response?.content || [];
      setUsers(userData);
      setTotalPages(response?.totalPages || 1);
    } catch (error) {
      console.error("Error loading users:", error);
      setUsers([]);
    }
  };

  const handleSelectUser = (user: User) => {
    const isSelected = selectedUsers.some((u) => u.id === user.id);
    if (isSelected) {
      setSelectedUsers((prev) => prev.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers((prev) => [...prev, user]);
    }
  };

  const handleSaveSelectedUsers = () => {
    const newUsers: SharedUser[] = selectedUsers.map((user) => ({
      id: user.id,
      name: user.fullName,
      position: user.positionName,
      unit: user.orgName,
      permission: "Xem",
    }));
    setSharedUsers((prev) => {
      const existingIds = prev.map((u) => u.id);
      const uniqueNewUsers = newUsers.filter(
        (u) => !existingIds.includes(u.id)
      );
      return [...prev, ...uniqueNewUsers];
    });
    setSelectedUsers([]);
    setIsFindUserOpen(false);
  };

  const handleRemoveUser = (userId: number) => {
    setSharedUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  const handlePermissionChange = (userId: number, permission: string) => {
    const permissionMap: Record<string, string> = {
      "Chỉ được phép xem": "READ",
      "Được phép sửa": "FULL",
    };
    setSharedUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, permission: permissionMap[permission] || permission }
          : user
      )
    );
  };

  const handleSubmit = () => {
    const permissionMap: Record<string, string> = {
      Xem: "READ",
      "Chỉ được phép xem": "READ",
      "Được phép sửa": "FULL",
    };
    const shareData = sharedUsers.map((user) => ({
      folderId: folderId.toString(),
      userId: user.id.toString(),
      permission: permissionMap[user.permission] || "READ",
    }));
    addShare(shareData, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: "Chia sẻ hồ sơ thành công",
          variant: "default",
        });
        onClose();
      },
    });
  };

  const handleSearch = () => {
    setPage(1);
    loadUsers();
  };

  const shareColumns: Column<SharedUser>[] = [
    {
      header: "STT",
      accessor: (user, index) => index + 1,
      className: "w-[5%] text-center bg-[#7da5c8] text-black",
    },
    {
      header: "Họ và tên",
      accessor: (user) => user.name,
      className: "w-[20%] bg-[#7da5c8] text-black",
    },
    {
      header: "Chức danh",
      accessor: (user) => user.position,
      className: "w-[20%] bg-[#7da5c8] text-black",
    },
    {
      header: "Đơn vị",
      accessor: (user) => user.unit,
      className: "w-[30%] bg-[#7da5c8] text-black",
    },
    {
      header: "Cấp quyền",
      accessor: (user) => {
        const displayMap: Record<string, string> = {
          READ: "Chỉ được phép xem",
          FULL: "Được phép sửa",
        };
        const valueMap: Record<string, string> = {
          "Chỉ được phép xem": "READ",
          "Được phép sửa": "FULL",
        };
        return (
          <select
            className="w-full border rounded px-2 py-1 text-sm"
            value={displayMap[user.permission] || user.permission}
            onChange={(e) => handlePermissionChange(user.id, e.target.value)}
          >
            <option value="Chỉ được phép xem">Chỉ được phép xem</option>
            <option value="Được phép sửa">Được phép sửa</option>
          </select>
        );
      },
      className: "w-[15%] bg-[#7da5c8] text-black",
    },
    {
      header: "Hành động",
      accessor: (user) => (
        <button
          onClick={() => handleRemoveUser(user.id)}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 size={18} />
        </button>
      ),
      className: "w-[5%] text-center bg-[#7da5c8] text-black",
    },
  ];

  const findUserColumns: Column<User>[] = [
    {
      header: "STT",
      accessor: (user, index) => index + 1,
      className: "w-[5%] text-center",
    },
    {
      header: "Họ và tên",
      accessor: (user) => user.fullName,
      className: "w-[30%] text-center",
    },
    {
      header: "Chức danh",
      accessor: (user) => user.positionName,
      className: "w-[25%] text-center",
    },
    {
      header: "Đơn vị",
      accessor: (user) => user.orgName,
      className: "w-[30%] text-center",
    },
    {
      header: "",
      accessor: (user) => {
        const isInSelectedUsers = selectedUsers.some((u) => u.id === user.id);
        const isInSharedUsers = sharedUsers.some((u) => u.id === user.id);
        const isSelected = isInSelectedUsers || isInSharedUsers;
        return (
          <button
            onClick={() => handleSelectUser(user)}
            className={
              isSelected
                ? "text-blue-600 hover:underline"
                : "text-blue-600 hover:underline"
            }
          >
            {isSelected ? "Hủy bỏ" : "Chọn"}
          </button>
        );
      },
      className: "w-[40%] text-center",
    },
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="max-w-7xl rounded-none"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">
              Chia sẻ tài liệu
            </DialogTitle>
          </DialogHeader>

          <div className="flex justify-center my-4">
            <Button
              variant="outline"
              className="flex items-center gap-2 rounded-none ring-2 ring-blue-300 text-blue-400 hover:bg-blue-400 hover:text-white"
              onClick={() => setIsFindUserOpen(true)}
            >
              <Search className="w-4 h-4" /> Tìm kiếm người dùng
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table
              columns={shareColumns}
              dataSource={sharedUsers}
              loading={loadingSharedUsers}
              emptyText="Không có dữ liệu"
              showPagination={false}
              cellClassName={() => "bg-white text-center rounded-none"}
            />
          </div>

          <div className="flex justify-end mt-6 bg-blue">
            <Button
              onClick={handleSubmit}
              disabled={sharedUsers.length === 0}
              className="flex items-center gap-2 rounded-none"
            >
              <i className="fa fa-save"></i> Đồng ý
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isFindUserOpen}
        onOpenChange={() => setIsFindUserOpen(false)}
      >
        <DialogContent
          className="max-w-5xl max-h-[95vh] overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="font-bold text-lg text-left">
              Thêm người chia sẻ
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Họ và tên
                </label>
                <Input
                  placeholder="Nhập họ tên..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Chức danh
                </label>
                <SelectCustom
                  options={positions}
                  value={selectedPosition}
                  onChange={(value) => setSelectedPosition(value as string)}
                  placeholder="--- Chọn ---"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Đơn vị</label>
                <OrgTreeSelect
                  dataSource={organizations}
                  value={selectedOrg ? parseInt(selectedOrg) : null}
                  onChange={(value) => setSelectedOrg(value?.toString() || "")}
                  placeholder="--- Chọn đơn vị ---"
                  className="[&_.tree-indent]:hidden [&_.tree-node]:pl-0"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                variant="default"
                className="flex items-center gap-2 bg-blue-400 text-white hover:bg-blue-500"
                onClick={handleSearch}
              >
                <Search className="w-4 h-4" /> Tìm kiếm
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table
                columns={findUserColumns}
                dataSource={users}
                loading={false}
                emptyText="Không có dữ liệu"
                showPagination={true}
                currentPage={page}
                onPageChange={setPage}
                totalItems={users.length * totalPages}
                itemsPerPage={10}
                pageSizeOptions={[10, 20, 50]}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 border-t pt-4">
            <Button
              onClick={handleSaveSelectedUsers}
              disabled={selectedUsers.length === 0}
              className="flex items-center gap-2 bg-blue-400 text-white hover:bg-blue-500"
            >
              <i className="fa fa-save"></i> Lưu
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedUsers([]);
                setIsFindUserOpen(false);
              }}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
