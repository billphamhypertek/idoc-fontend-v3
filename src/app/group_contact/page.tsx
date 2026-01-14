"use client";

import React, { useState, useMemo } from "react";
import { Column } from "@/definitions";
import { ContactGroup } from "@/services/group.service";
import {
  Edit,
  Lock,
  Unlock,
  Trash2,
  Search,
  Plus,
  Save,
  X,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import SelectCustom from "@/components/common/SelectCustom";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import FindUserDialog from "@/components/group-contact/FindUserDialog";
import {
  useSearchContactGroups,
  useAddContactGroup,
  useUpdateContactGroup,
  useDeleteContactGroup,
  useUpdateContactGroupStatus,
} from "@/hooks/data/group.data";
import { Constant } from "@/definitions/constants/constant";
import { ToastUtils } from "@/utils/toast.utils";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/definitions";
import { handleError } from "@/utils/common.utils";

enum SearchTitles {
  NAME = "NAME",
  DESCRIPTION = "DESCRIPTION",
  ACTIVE = "ACTIVE",
}

interface SearchFields {
  name: string;
  description: string;
  active: string;
  page: number;
  sortBy: string;
  direction: string;
  size: number;
}

interface User {
  id: number;
  fullName: string;
  positionName?: string;
  orgName?: string;
}

const defaultSearchFields: SearchFields = {
  name: "",
  description: "",
  active: "0",
  page: 1,
  sortBy: "",
  direction: Constant.SORT_TYPE.DECREASE,
  size: Constant.PAGING.SIZE,
};

export default function GroupContactPage() {
  const queryClient = useQueryClient();

  // State
  const [searchFields, setSearchFields] =
    useState<SearchFields>(defaultSearchFields);
  const [tempSearchFields, setTempSearchFields] =
    useState<SearchFields>(defaultSearchFields);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [selectedGroup, setSelectedGroup] = useState<ContactGroup | null>(null);
  const [isEditGroup, setIsEditGroup] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isFindUserDialogOpen, setIsFindUserDialogOpen] =
    useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [confirmStatus, setConfirmStatus] = useState<boolean>(false);
  const [usersJoin, setUsersJoin] = useState<User[]>([]);
  const [searchTrigger, setSearchTrigger] = useState<number>(0);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Form state for add/edit
  const [groupForm, setGroupForm] = useState<ContactGroup>({
    name: "",
    description: "",
    active: true,
    listUser: [],
  });

  // Mutations
  const { mutate: addGroup } = useAddContactGroup();
  const { mutate: updateGroup } = useUpdateContactGroup();
  const { mutate: deleteGroup } = useDeleteContactGroup();
  const { mutate: updateStatus } = useUpdateContactGroupStatus();

  // Prepare search params for useQuery
  const searchParams = useMemo(() => {
    return {
      groupName: searchFields.name || "",
      description: searchFields.description || "",
      active: searchFields.active === "0" ? "" : searchFields.active || "",
      page: currentPage,
      sortBy: searchFields.sortBy,
      direction: searchFields.direction,
      size: itemsPerPage,
    };
  }, [searchFields, currentPage, itemsPerPage, searchTrigger]);

  // Use useQuery for search
  const {
    data: searchResult,
    isLoading,
    error,
    refetch,
  } = useSearchContactGroups(searchParams, true);

  // Extract data from search result
  const contactGroups = searchResult?.content || [];
  const totalItems = searchResult?.totalElements || 0;

  // Handlers
  const handleSearchSubmit = async () => {
    setIsSearching(true);
    setSearchFields({ ...tempSearchFields, page: 1 });
    setCurrentPage(1);
    // Trigger search by updating searchTrigger
    setSearchTrigger((prev) => prev + 1);
    // Also manually refetch to ensure API is called
    try {
      await refetch();
    } finally {
      // isLoading from query will handle the loading state, but we keep this for immediate feedback
      setIsSearching(false);
    }
  };

  const handleSearchReset = () => {
    setSearchFields(defaultSearchFields);
    setTempSearchFields(defaultSearchFields);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const handleSort = (fieldName: string) => {
    const newDirection =
      searchFields.direction === Constant.SORT_TYPE.DECREASE
        ? Constant.SORT_TYPE.INCREASE
        : Constant.SORT_TYPE.DECREASE;

    setSearchFields((prev) => ({
      ...prev,
      sortBy: fieldName,
      direction: newDirection,
    }));
    // Trigger search when sorting
    setSearchTrigger((prev) => prev + 1);
  };

  const handleAddGroup = () => {
    setIsEditGroup(false);
    setGroupForm({
      name: "",
      description: "",
      active: true,
      listUser: [],
    });
    setUsersJoin([]);
    setIsModalOpen(true);
  };

  const handleEditGroup = (group: ContactGroup, index: number) => {
    setIsEditGroup(true);
    setSelectedGroup(group);
    setGroupForm({
      ...group,
      listUser: [],
    });
    // Convert listUser IDs to User objects - API may return listUserDetail with full info
    const groupWithDetails = group as any;
    if (
      groupWithDetails.listUserDetail &&
      Array.isArray(groupWithDetails.listUserDetail)
    ) {
      // Map listUserDetail to User format
      const userObjects: User[] = groupWithDetails.listUserDetail.map(
        (user: any) => {
          // Handle different possible structures
          if (typeof user === "object" && user !== null) {
            return {
              id: user.id || user.userId || 0,
              fullName: user.fullName || user.name || String(user),
              positionName: user.positionName || user.position || "",
              orgName: user.orgName || user.org || "",
            };
          }
          // If it's just an ID, return placeholder
          return {
            id: typeof user === "number" ? user : 0,
            fullName: String(user),
            positionName: "",
            orgName: "",
          };
        }
      );
      setUsersJoin(userObjects);
    } else if (group.listUser && Array.isArray(group.listUser)) {
      // If only IDs are available, convert to User objects (simplified)
      const userObjects: User[] = group.listUser.map((item: any) => {
        // Check if item is already an object with user info
        if (typeof item === "object" && item !== null) {
          return {
            id: item.id || item.userId || 0,
            fullName: item.fullName || item.name || String(item),
            positionName: item.positionName || item.position || "",
            orgName: item.orgName || item.org || "",
          };
        }
        // If it's just an ID number
        return {
          id: typeof item === "number" ? item : 0,
          fullName: `User ${item}`, // Placeholder - should fetch real data
          positionName: "",
          orgName: "",
        };
      });
      setUsersJoin(userObjects);
    } else {
      setUsersJoin([]);
    }
    setIsModalOpen(true);
  };

  const handleDeleteGroup = (group: ContactGroup) => {
    setSelectedGroup(group);
    setConfirmDelete(true);
  };

  const doDeleteGroup = () => {
    if (!selectedGroup?.id) return;

    deleteGroup(selectedGroup.id, {
      onSuccess: () => {
        ToastUtils.success("Xóa nhóm người dùng thành công!");
        queryClient.invalidateQueries({ queryKey: [queryKeys.group.search] });
        setConfirmDelete(false);
        setSelectedGroup(null);
      },
      onError: (error) => {
        handleError(error);
        setConfirmDelete(false);
        setSelectedGroup(null);
      },
    });
  };

  const handleSetStatus = (group: ContactGroup) => {
    setSelectedGroup(group);
    setConfirmStatus(true);
  };

  const doSetStatus = () => {
    if (!selectedGroup?.id) return;

    updateStatus(
      {
        groupId: selectedGroup.id,
        active: !selectedGroup.active,
      },
      {
        onSuccess: () => {
          const message = selectedGroup.active
            ? "Ngưng kích hoạt thành công!"
            : "Kích hoạt thành công!";
          ToastUtils.success(message);
          queryClient.invalidateQueries({ queryKey: [queryKeys.group.search] });
          setConfirmStatus(false);
          setSelectedGroup(null);
        },
        onError: (error) => {
          handleError(error);
          setConfirmStatus(false);
          setSelectedGroup(null);
        },
      }
    );
  };

  const handleSaveGroup = () => {
    if (!groupForm.name || groupForm.name.trim() === "") {
      ToastUtils.error("Tên nhóm người dùng không được để trống!");
      return;
    }

    if (usersJoin.length <= 0) {
      ToastUtils.error("Thêm người dùng vào nhóm!");
      return;
    }

    const groupToSave: ContactGroup = {
      ...groupForm,
      listUser: usersJoin.map((u) => u.id),
    };

    if (!isEditGroup) {
      addGroup(groupToSave, {
        onSuccess: () => {
          ToastUtils.success("Thêm nhóm người dùng thành công!");
          queryClient.invalidateQueries({ queryKey: [queryKeys.group.search] });
          setIsModalOpen(false);
          resetForm();
        },
        onError: (error) => {
          handleError(error);
        },
      });
    } else {
      updateGroup(groupToSave, {
        onSuccess: () => {
          ToastUtils.success("Cập nhật nhóm người dùng thành công!");
          queryClient.invalidateQueries({ queryKey: [queryKeys.group.search] });
          setIsModalOpen(false);
          resetForm();
        },
        onError: (error) => {
          handleError(error);
        },
      });
    }
  };

  const resetForm = () => {
    setGroupForm({
      name: "",
      description: "",
      active: true,
      listUser: [],
    });
    setUsersJoin([]);
    setSelectedGroup(null);
    setIsEditGroup(false);
  };

  const handleFindUser = () => {
    setIsFindUserDialogOpen(true);
  };

  const handleSaveUsers = (users: User[]) => {
    setUsersJoin(users);
    setIsFindUserDialogOpen(false);
  };

  // Table columns
  const groupColumns: Column<ContactGroup>[] = [
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-medium">STT</span>
        </div>
      ),
      className: "text-center py-1 w-12",
      accessor: (_item: ContactGroup, index: number) => (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-medium">
            {(currentPage - 1) * itemsPerPage + index + 1}
          </span>
        </div>
      ),
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700"
          onClick={() => handleSort(SearchTitles.NAME)}
        >
          <span className="text-xs font-medium">Tên nhóm người dùng</span>
        </div>
      ),
      className: "py-2",
      accessor: (group: ContactGroup) => (
        <span className="text-sm">{group.name}</span>
      ),
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700"
          onClick={() => handleSort(SearchTitles.DESCRIPTION)}
        >
          <span className="text-xs font-medium">Mô tả</span>
        </div>
      ),
      className: "py-2",
      accessor: (group: ContactGroup) => (
        <span className="text-sm">{group.description || ""}</span>
      ),
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700"
          onClick={() => handleSort(SearchTitles.ACTIVE)}
        >
          <span className="text-xs font-medium">Trạng thái</span>
        </div>
      ),
      className: "text-center py-2",
      accessor: (group: ContactGroup) => (
        <Badge
          variant={group.active ? "default" : "destructive"}
          className={cn(
            "text-xs",
            group.active
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-red-100 text-red-800 border-red-200"
          )}
        >
          {group.active ? "Hoạt động" : "Đang khóa"}
        </Badge>
      ),
    },
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-medium">Thao tác</span>
        </div>
      ),
      type: "actions",
      className: "text-center py-2",
      renderActions: (group: ContactGroup) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:bg-green-100 rounded transition-colors"
            onClick={() => handleSetStatus(group)}
            title={group.active ? "Khóa" : "Mở khóa"}
          >
            {group.active ? (
              <Unlock className="w-4 h-4 text-green-600" />
            ) : (
              <Lock className="w-4 h-4 text-red-600" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:bg-blue-100 rounded transition-colors"
            onClick={() => handleEditGroup(group, 0)}
            title="Sửa"
          >
            <Edit className="w-4 h-4 text-blue-600" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:bg-red-100 rounded transition-colors"
            onClick={() => handleDeleteGroup(group)}
            title="Xóa"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 p-3">
      <BreadcrumbNavigation
        items={[
          {
            href: "/group_contact",
            label: "Quản trị hệ thống",
          },
        ]}
        currentPage="Quản lý nhóm người dùng"
        showHome={false}
      />
      <div
        className="flex items-center justify-between border rounded-lg p-4 mt-4"
        style={{ backgroundColor: "#E8E9EB" }}
      >
        <div>
          <div className="font-bold text-black text-lg">
            Quản lý nhóm người dùng
          </div>
          <div className="text-gray-500 text-xs">
            Hiển thị thông tin nhóm người dùng
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-sm font-medium"
            onClick={handleAddGroup}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm mới
          </Button>
        </div>
      </div>

      {/* Search Form */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Tên nhóm</label>
            <Input
              className="h-9 text-sm"
              value={tempSearchFields.name}
              onChange={(e) =>
                setTempSearchFields((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="Tên nhóm người dùng"
              maxLength={100}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchSubmit();
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Trạng thái</label>
            <div className="flex-1 min-w-0">
              <SelectCustom
                value={tempSearchFields.active || "0"}
                onChange={(value: string | string[]) =>
                  setTempSearchFields((prev) => ({
                    ...prev,
                    active: Array.isArray(value) ? value[0] : value,
                  }))
                }
                options={[
                  { label: "-- Chọn --", value: "0" },
                  { label: "Hoạt động", value: "true" },
                  { label: "Đang khóa", value: "false" },
                ]}
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold">Mô tả</label>
            <Textarea
              className="h-9 text-sm min-h-[64px]"
              value={tempSearchFields.description}
              onChange={(e) =>
                setTempSearchFields((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Nhập mô tả"
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-center gap-2">
          <Button
            size="sm"
            onClick={handleSearchSubmit}
            className="h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700 inline-flex items-center justify-center"
          >
            <Search className="w-3 h-3 mr-1" />
            <span className="leading-none">Tìm kiếm</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSearchReset}
            className="h-9 px-3 text-xs inline-flex items-center justify-center"
          >
            <span className="leading-none">Đặt lại</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table
        sortable
        columns={groupColumns}
        dataSource={contactGroups}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        showPagination
        bgColor="bg-white"
        rowClassName={(_item: ContactGroup, index: number) =>
          index % 2 === 0 ? "bg-white" : "bg-[#0000000d]"
        }
        emptyText={
          isLoading || isSearching
            ? "Đang tải dữ liệu..."
            : error
              ? `Lỗi: ${error.message}`
              : "Không có dữ liệu nhóm người dùng"
        }
        onItemsPerPageChange={handleItemsPerPageChange}
        loading={isLoading || isSearching}
      />

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditGroup
                ? "Cập nhật nhóm người dùng"
                : "Thêm mới nhóm người dùng"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Tên nhóm người dùng<span className="text-red-500">*</span>
              </label>
              <Input
                className="h-9 text-sm"
                value={groupForm.name}
                onChange={(e) =>
                  setGroupForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Nhập tên nhóm người dùng"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Mô tả<span className="text-red-500">*</span>
              </label>
              <Textarea
                className="min-h-[80px] text-sm"
                value={groupForm.description || ""}
                onChange={(e) =>
                  setGroupForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Nhập mô tả"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">
                <a
                  onClick={handleFindUser}
                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  Thêm người dùng<span className="text-red-500">*</span>
                </a>
              </label>
              {usersJoin.length > 0 ? (
                <div className="overflow-hidden">
                  <Table
                    columns={[
                      {
                        header: (
                          <div className="flex justify-center items-center py-1">
                            <span className="text-xs font-bold">STT</span>
                          </div>
                        ),
                        className: "text-center py-1 w-12",
                        accessor: (_item: User, index: number) => (
                          <div className="flex justify-center items-center py-1">
                            <span className="text-xs">{index + 1}</span>
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
                          <span className="text-sm">
                            {user.positionName || ""}
                          </span>
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
                    ]}
                    dataSource={usersJoin}
                    bgColor="bg-white"
                  />
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Không có dữ liệu
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleSaveGroup}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Lưu lại
            </Button>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Find User Dialog */}
      <FindUserDialog
        isOpen={isFindUserDialogOpen}
        onOpenChange={setIsFindUserDialogOpen}
        users={usersJoin}
        onSave={handleSaveUsers}
      />

      {/* Confirmation Dialogs */}
      <ConfirmDeleteDialog
        isOpen={confirmDelete}
        onOpenChange={setConfirmDelete}
        onConfirm={doDeleteGroup}
        title="Xác nhận"
        description="Bạn có chắc chắn muốn xóa nhóm người dùng?"
        confirmText="Đồng ý"
        cancelText="Hủy"
      />

      <ConfirmDeleteDialog
        isOpen={confirmStatus}
        onOpenChange={setConfirmStatus}
        onConfirm={doSetStatus}
        title="Xác nhận"
        description={
          selectedGroup?.active
            ? "Bạn có chắc chắn muốn ngưng kích hoạt nhóm người dùng?"
            : "Bạn có chắc chắn muốn kích hoạt nhóm người dùng?"
        }
        confirmText="Đồng ý"
        cancelText="Hủy"
      />
    </div>
  );
}
