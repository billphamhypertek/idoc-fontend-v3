"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table } from "@/components/ui/table";
import { Column } from "@/definitions";
import SelectCustom from "@/components/common/SelectCustom";
import DropdownTree, { TreeNode } from "@/components/common/DropdownTree";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import { useGetOrganizations } from "@/hooks/data/organization.data";
import { UserService } from "@/services/user.service";
import { useQuery } from "@tanstack/react-query";
import { Constant } from "@/definitions/constants/constant";
import { Save, X, Search } from "lucide-react";

interface User {
  id: number;
  fullName: string;
  positionName?: string;
  orgName?: string;
}

interface FindUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  onSave: (users: User[]) => void;
}

export default function FindUserDialog({
  isOpen,
  onOpenChange,
  users: initialUsers,
  onSave,
}: FindUserDialogProps) {
  const [searchFields, setSearchFields] = useState({
    fullName: "",
    position: null as number | null,
    org: [] as number[],
    page: 1,
    size: Constant.PAGING.SIZE,
  });
  const [userJoin, setUserJoin] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: positionList } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.USER_POSITION
  );
  const { data: orgList } = useGetOrganizations({ active: true });

  // Search users query
  const { data: searchResult, isLoading } = useQuery({
    queryKey: ["findUserForGroup", searchFields, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("fullName", searchFields.fullName || "");
      params.append(
        "posId",
        searchFields.position ? searchFields.position.toString() : ""
      );
      params.append("page", currentPage.toString());
      params.append("size", searchFields.size.toString());

      const result = await UserService.searchByFullnamePosOrgUsingGroupUser(
        params.toString(),
        searchFields.org
      );
      return result;
    },
    enabled: isOpen,
  });

  const usersSearch = searchResult?.content || [];
  const totalItems = searchResult?.totalElements || 0;

  useEffect(() => {
    if (isOpen) {
      setUserJoin([]);
      setSearchFields({
        fullName: "",
        position: null,
        org: [],
        page: 1,
        size: Constant.PAGING.SIZE,
      });
      setCurrentPage(1);
    }
  }, [isOpen]);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleAddUser = (user: User) => {
    if (!checkExistJoin(user.id)) {
      setUserJoin((prev) => [...prev, user]);
    }
  };

  const handleRemoveUser = (userId: number) => {
    setUserJoin((prev) => prev.filter((u) => u.id !== userId));
  };

  const checkExistJoin = (id: number): boolean => {
    if (userJoin.find((x) => x.id === id)) return true;
    if (initialUsers.find((x) => x.id === id)) return true;
    return false;
  };

  const handleSave = () => {
    const allUsers = [...initialUsers, ...userJoin];
    onSave(allUsers);
    onOpenChange(false);
  };

  // Convert orgList to tree structure
  const convertToTree = (orgs: any[]): TreeNode[] => {
    if (!orgs) return [];

    const orgMap = new Map();
    const rootNodes: TreeNode[] = [];

    orgs.forEach((org) => {
      orgMap.set(org.id, {
        id: org.id,
        name: org.name,
        parentId: org.parentId,
        children: [],
      });
    });

    orgs.forEach((org) => {
      const node = orgMap.get(org.id);
      if (org.parentId && orgMap.has(org.parentId)) {
        const parent = orgMap.get(org.parentId);
        parent.children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  };

  const handleOrgChange = (value: number | number[] | null) => {
    if (Array.isArray(value)) {
      setSearchFields((prev) => ({ ...prev, org: value }));
    } else if (value !== null) {
      setSearchFields((prev) => ({ ...prev, org: [value] }));
    } else {
      setSearchFields((prev) => ({ ...prev, org: [] }));
    }
  };

  const userColumns: Column<User>[] = [
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-bold">STT</span>
        </div>
      ),
      className: "text-center py-1 w-12",
      accessor: (_item: User, index: number) => (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs">
            {(currentPage - 1) * searchFields.size + index + 1}
          </span>
        </div>
      ),
    },
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-bold">Họ và tên</span>
        </div>
      ),
      className: "py-2",
      accessor: (user: User) => (
        <span className="text-sm">{user.fullName}</span>
      ),
    },
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-bold">Chức vụ</span>
        </div>
      ),
      className: "py-2",
      accessor: (user: User) => (
        <span className="text-sm">{user.positionName || ""}</span>
      ),
    },
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-bold">Đơn vị</span>
        </div>
      ),
      className: "py-2",
      accessor: (user: User) => (
        <span className="text-sm">{user.orgName || ""}</span>
      ),
    },
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-bold">Thao tác</span>
        </div>
      ),
      type: "actions",
      className: "text-center py-2 w-24",
      renderActions: (user: User) => (
        <div className="flex items-center justify-center gap-1">
          {!checkExistJoin(user.id) ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-600 hover:text-blue-800 p-1"
              onClick={() => handleAddUser(user)}
            >
              Chọn
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-red-600 hover:text-red-800 p-1"
              onClick={() => handleRemoveUser(user.id)}
            >
              Hủy bỏ
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm người dùng</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Họ và tên</Label>
              <Input
                className="h-9 text-sm"
                value={searchFields.fullName}
                onChange={(e) =>
                  setSearchFields((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Chức vụ</Label>
              <SelectCustom
                value={searchFields.position?.toString() || ""}
                onChange={(value: string | string[]) => {
                  const posValue = Array.isArray(value)
                    ? parseInt(value[0])
                    : value
                      ? parseInt(value)
                      : null;
                  setSearchFields((prev) => ({
                    ...prev,
                    position: posValue,
                  }));
                }}
                options={
                  positionList?.map((item) => ({
                    label: item.name,
                    value: item.id.toString(),
                  })) || []
                }
                placeholder="-- Chọn --"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Đơn vị</Label>
              <DropdownTree
                value={searchFields.org.length > 0 ? searchFields.org : null}
                onChange={handleOrgChange}
                dataSource={convertToTree(orgList || [])}
                placeholder="-- Chọn đơn vị --"
                multiple={true}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              size="sm"
              onClick={handleSearch}
              className="h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700"
            >
              <Search className="w-3 h-3 mr-1" />
              Tìm kiếm
            </Button>
          </div>

          {/* Users Table */}
          <Table
            columns={userColumns}
            dataSource={usersSearch}
            itemsPerPage={searchFields.size}
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            showPagination
            bgColor="bg-white"
            loading={isLoading}
            emptyText="Không có dữ liệu"
          />
        </div>

        <DialogFooter>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Lưu
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Hủy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
