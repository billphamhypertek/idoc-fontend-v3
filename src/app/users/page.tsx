"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Column } from "@/definitions";
import { User } from "@/definitions/types/user.type";
import { CategoryCode } from "@/definitions/types/category.type";
import {
  Edit,
  Lock,
  Unlock,
  RotateCcw,
  Search,
  Plus,
  User as UserIcon,
  Building,
  Phone,
  Calendar,
  SquareMenu,
  CardSimIcon,
  IdCard,
  RotateCcwKey,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table } from "@/components/ui/table";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import DropdownTree, { TreeNode } from "@/components/common/DropdownTree";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import { useGetOrganizations } from "@/hooks/data/organization.data";
import {
  useSearchUsers,
  useResetPassword,
  useActiveDeactivateUser,
} from "@/hooks/data/user.data";
import AddMorePositionDialog from "@/components/users/AddMorePositionDialog";
import ShowMorePositionDialog from "@/components/users/ShowMorePositionDialog";
import { Constant } from "@/definitions/constants/constant";
import { ToastUtils } from "@/utils/toast.utils";
import { formatDate } from "@/utils/datetime.utils";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/definitions";
import { handleError } from "@/utils/common.utils";

interface SearchFields {
  fullName: string;
  userName: string;
  email: string;
  phone: string;
  sex: string | null;
  identity: string;
  title: string | null;
  employeeId: string | null;
  employeeCode: string | null;
  salt: string | null;
  role: string | null;
  position: string | null;
  lead: string | null;
  birthday: string | null;
  org: number | null;
  page: number;
  sortBy: string;
  direction: string;
  size: number;
  serialToken: string;
  nameToken: string;
}

const defaultSearchFields: SearchFields = {
  fullName: "",
  userName: "",
  email: "",
  phone: "",
  sex: null,
  identity: "",
  title: null,
  employeeId: null,
  employeeCode: null,
  salt: null,
  role: null,
  position: null,
  lead: null,
  birthday: null,
  org: null,
  page: 1,
  sortBy: "",
  direction: Constant.SORT_TYPE.DECREASE,
  size: Constant.PAGING.SIZE,
  serialToken: "",
  nameToken: "",
};

export default function UserListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // State
  const [searchFields, setSearchFields] =
    useState<SearchFields>(defaultSearchFields);
  const [tempSearchFields, setTempSearchFields] =
    useState<SearchFields>(defaultSearchFields);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmActiveDeactivate, setConfirmActiveDeactivate] =
    useState<boolean>(false);
  const [confirmResetPassword, setConfirmResetPassword] =
    useState<boolean>(false);
  const [showAddMorePosition, setShowAddMorePosition] =
    useState<boolean>(false);
  const [showMorePosition, setShowMorePosition] = useState<boolean>(false);
  const [selectedPositionUser, setSelectedPositionUser] = useState<User | null>(
    null
  );

  // Data hooks
  const { data: positionList } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.USER_POSITION
  );
  const { data: orgList } = useGetOrganizations({ active: true });

  // Mutations
  const { mutate: activeDeactivateUser } = useActiveDeactivateUser();
  const { mutate: resetPassword } = useResetPassword();

  // Computed values
  const enableAddUser = !Constant.AUTHEN_CAS;
  const BCY_ADD_TOKEN_INFO = Constant.BCY_ADD_TOKEN_INFO;

  // Prepare search params for useQuery
  const searchParams = useMemo(() => {
    return {
      fullName: searchFields.fullName,
      userName: searchFields.userName,
      email: searchFields.email,
      phone: searchFields.phone,
      sex: searchFields.sex || "",
      identity: searchFields.identity,
      title: searchFields.title || "",
      employeeId: searchFields.employeeId || "",
      employeeCode: searchFields.employeeCode || "",
      salt: searchFields.salt == null ? "" : searchFields.salt,
      org: searchFields.org || "",
      position: searchFields.position || "",
      lead: searchFields.lead || "",
      birthday: searchFields.birthday ? searchFields.birthday.toString() : "",
      nameToken: searchFields.nameToken
        ? searchFields.nameToken.toString()
        : "",
      serialToken: searchFields.serialToken
        ? searchFields.serialToken.toString()
        : "",
      page: currentPage,
      sortBy: searchFields.sortBy,
      direction: searchFields.direction,
      size: itemsPerPage,
    };
  }, [searchFields, currentPage, itemsPerPage]);

  // Use useQuery for search
  const {
    data: searchResult,
    isLoading,
    error,
  } = useSearchUsers(searchParams, true);

  // Extract data from search result
  const users = searchResult?.content || [];
  const totalItems = searchResult?.totalElements || 0;

  // Handlers
  const handleSearchSubmit = () => {
    setSearchFields({ ...tempSearchFields, page: 1 });
    setCurrentPage(1);
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
  };

  const handleAddUser = () => {
    router.push("/users/detail");
  };

  const handleEditUser = (user: User) => {
    router.push(`/users/detail?userName=${user.userName}`);
  };

  const handleActiveDeactivateUser = (user: User) => {
    setSelectedUser(user);
    setConfirmActiveDeactivate(true);
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setConfirmResetPassword(true);
  };

  const doActiveDeactivateUser = () => {
    if (!selectedUser) return;

    activeDeactivateUser(selectedUser, {
      onSuccess: () => {
        ToastUtils.success(
          selectedUser.active ? "Ngưng kích hoạt" : "Kích hoạt người dùng"
        );
        queryClient.invalidateQueries({ queryKey: [queryKeys.users.search] });
        setConfirmActiveDeactivate(false);
        setSelectedUser(null);
      },
      onError: (error) => {
        handleError(error);
        setConfirmActiveDeactivate(false);
        setSelectedUser(null);
      },
    });
  };

  const doResetPassword = () => {
    if (!selectedUser) return;

    resetPassword(selectedUser.id.toString(), {
      onSuccess: () => {
        ToastUtils.success("Thiết lập mặc định password");
        setConfirmResetPassword(false);
        setSelectedUser(null);
      },
      onError: (error) => {
        handleError(error);
        setConfirmResetPassword(false);
        setSelectedUser(null);
      },
    });
  };

  // Helper functions
  const getOrgnameByID = (id: number) => {
    if (!orgList) return "";
    const org = orgList.find((item) => item.id === id);
    return org ? org.name : "";
  };

  const getPosnameByID = (id: number) => {
    if (!positionList) return "";
    const pos = positionList.find((item) => item.id === id);
    return pos ? pos.name : "";
  };

  // Convert orgList to tree structure
  const convertToTree = (orgs: any[]): TreeNode[] => {
    if (!orgs) return [];

    const orgMap = new Map();
    const rootNodes: TreeNode[] = [];

    // Create map of all organizations
    orgs.forEach((org) => {
      orgMap.set(org.id, {
        id: org.id,
        name: org.name,
        parentId: org.parentId,
        children: [],
      });
    });

    // Build tree structure
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

  // Convert positionList to tree structure
  const convertPositionToTree = (positions: any[]): TreeNode[] => {
    if (!positions) return [];

    const positionMap = new Map();
    const rootNodes: TreeNode[] = [];

    // Create map of all positions
    positions.forEach((pos) => {
      positionMap.set(pos.id, {
        id: pos.id,
        name: pos.name,
        parentId: pos.parentId,
        children: [],
      });
    });

    // Build tree structure
    positions.forEach((pos) => {
      const node = positionMap.get(pos.id);
      if (pos.parentId && positionMap.has(pos.parentId)) {
        const parent = positionMap.get(pos.parentId);
        parent.children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  };

  const handleShowMorePosition = (user: User) => {
    setSelectedPositionUser(user);
    setShowMorePosition(true);
  };

  const handleAddMorePosition = (user: User) => {
    setSelectedPositionUser(user);
    setShowAddMorePosition(true);
  };

  // Calendar popover state
  const [birthdayOpen, setBirthdayOpen] = useState(false);

  // Table columns
  const userColumns: Column<User>[] = [
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-medium">STT</span>
        </div>
      ),
      className: "text-center py-1 w-4",
      accessor: (_item: User, index: number) => (
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
          onClick={() => handleSort("FULLNAME")}
        >
          <span className="text-xs font-medium">Họ và tên</span>
        </div>
      ),
      className: "py-2 w-44",
      accessor: (user: User) => (
        <div className="flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{user.fullName}</span>
        </div>
      ),
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700"
          onClick={() => handleSort("ORG")}
        >
          <span className="text-xs font-medium">Đơn vị</span>
        </div>
      ),
      className: "py-2 w-32",
      accessor: (user: User) => (
        <span className="text-sm">{getOrgnameByID(user.org)}</span>
      ),
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700"
          onClick={() => handleSort("ORG")}
        >
          <span className="text-xs font-medium"> Đơn vị cấp trên </span>
        </div>
      ),
      className: "py-2 w-32",
      accessor: (user: User) => (
        <span className="text-sm">{user.orgParent}</span>
      ),
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700"
          onClick={() => handleSort("POSITION")}
        >
          <span className="text-xs font-medium">Chức danh</span>
        </div>
      ),
      className: "py-2 w-32",
      accessor: (user: User) => {
        const additionalPositions = (user as any).additionalPositions;
        const hasAdditionalPositions =
          additionalPositions &&
          Array.isArray(additionalPositions) &&
          additionalPositions.length > 0;

        return (
          <div className="text-sm text-center flex items-center">
            <span>{getPosnameByID(user.position)}</span>
            {hasAdditionalPositions && (
              <a
                className="action-table ml-1 cursor-pointer hover:text-blue-800"
                title="Danh sách chức danh"
                onClick={() => handleShowMorePosition(user)}
              >
                <SquareMenu className="w-4 h-4 text-gray-500" />
              </a>
            )}
          </div>
        );
      },
    },
    // Conditional columns based on BCY_ADD_TOKEN_INFO
    ...(BCY_ADD_TOKEN_INFO
      ? [
          {
            header: (
              <div
                className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700"
                onClick={() => handleSort("NAMETOKEN")}
              >
                <span className="text-xs font-medium">Tên token</span>
              </div>
            ),
            className: "text-center py-2 w-24",
            accessor: (user: User) => (
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm">{user.nameToken}</span>
              </div>
            ),
          },
          {
            header: (
              <div
                className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700"
                onClick={() => handleSort("SERIALTOKEN")}
              >
                <span className="text-xs font-medium">Serial token</span>
              </div>
            ),
            className: "text-center py-2 w-32",
            accessor: (user: User) => (
              <div className="flex items-center justify-center gap-2">
                <span
                  className="text-sm cursor-pointer"
                  title={
                    user.serialToken && user.serialToken.length > 35
                      ? user.serialToken
                      : ""
                  }
                >
                  {user.serialToken && user.serialToken.length > 35
                    ? `${user.serialToken.slice(0, 32)}...`
                    : user.serialToken}
                </span>
              </div>
            ),
          },
        ]
      : [
          {
            header: (
              <div
                className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700"
                onClick={() => handleSort("BIRTHDAY")}
              >
                <span className="text-xs font-medium">Ngày sinh</span>
              </div>
            ),
            className: "text-center py-2 w-24",
            accessor: (user: User) => (
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{formatDate(user.birthday)}</span>
              </div>
            ),
          },
          {
            header: (
              <div
                className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700"
                onClick={() => handleSort("PHONE")}
              >
                <span className="text-xs font-medium">Số điện thoại</span>
              </div>
            ),
            className: "text-center py-2 w-32",
            accessor: (user: User) => (
              <div className="flex items-center justify-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{user.phone}</span>
              </div>
            ),
          },
        ]),
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700"
          onClick={() => handleSort("ACTIVE")}
        >
          <span className="text-xs font-medium">Trạng thái</span>
        </div>
      ),
      className: "text-center py-2 w-32",
      accessor: (user: User) => (
        <Badge
          variant={user.active ? "default" : "destructive"}
          className={cn(
            "text-xs cursor-pointer",
            user.active
              ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
              : "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
          )}
        >
          {user.active ? "Đang kích hoạt" : "Khóa"}
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
      className: "text-center py-2 w-32",
      renderActions: (user: User) => (
        <TooltipProvider>
          <div className="flex items-center justify-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 hover:bg-blue-100 rounded transition-colors"
                  onClick={() => handleEditUser(user)}
                >
                  <Edit className="w-4 h-4 text-blue-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sửa</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 hover:bg-green-100 rounded transition-colors"
                  onClick={() => handleActiveDeactivateUser(user)}
                >
                  {user.active ? (
                    <Lock className="w-4 h-4 text-red-600" />
                  ) : (
                    <Unlock className="w-4 h-4 text-green-600" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.active ? "Ngừng kích hoạt" : "Kích hoạt"}</p>
              </TooltipContent>
            </Tooltip>

            {!user.ldap && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 hover:bg-orange-100 rounded transition-colors"
                    onClick={() => handleResetPassword(user)}
                  >
                    <RotateCcwKey className="w-4 h-4 text-orange-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset password</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 hover:bg-purple-100 rounded transition-colors"
                  onClick={() => handleAddMorePosition(user)}
                >
                  <IdCard className="w-4 h-4 text-purple-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Thêm chức danh phụ</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      ),
    },
  ];

  return (
    <div className="space-y-4 p-3">
      <BreadcrumbNavigation
        items={[
          {
            href: "/users",
            label: "Quản trị hệ thống",
          },
        ]}
        currentPage="Quản lý người dùng"
        showHome={false}
      />
      <div
        className="flex items-center justify-between border rounded-lg p-4"
        style={{ backgroundColor: "#E8E9EB" }}
      >
        <div>
          <div className="text-gray-900 text-lg font-bold">
            Danh sách người dùng
          </div>
          <div className="text-gray-500 text-xs">
            Quản lý thông tin của lãnh đạo, chuyên viên trong đơn vị
          </div>
        </div>
        {enableAddUser && (
          <div className="flex items-center gap-2">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-sm font-medium"
              onClick={handleAddUser}
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm mới
            </Button>
          </div>
        )}
      </div>

      {/* Search Form */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Họ và tên</label>
            <Input
              className="h-9 text-sm"
              placeholder="Họ và tên"
              value={tempSearchFields.fullName}
              onChange={(e) =>
                setTempSearchFields((prev) => ({
                  ...prev,
                  fullName: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Tên đăng nhập</label>
            <Input
              className="h-9 text-sm"
              placeholder="Tên đăng nhập"
              value={tempSearchFields.userName}
              onChange={(e) =>
                setTempSearchFields((prev) => ({
                  ...prev,
                  userName: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Đơn vị</label>
            <DropdownTree
              className="h-9"
              value={tempSearchFields.org}
              onChange={(value) => {
                setTempSearchFields((prev) => ({
                  ...prev,
                  org: value as number | null,
                }));
              }}
              dataSource={convertToTree(orgList || [])}
              placeholder="-- Chọn đơn vị --"
              multiple={false}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Chức danh</label>
            <DropdownTree
              className="h-9"
              value={
                tempSearchFields.position
                  ? Number(tempSearchFields.position)
                  : null
              }
              onChange={(value) => {
                setTempSearchFields((prev) => ({
                  ...prev,
                  position: value ? String(value) : null,
                }));
              }}
              dataSource={convertPositionToTree(positionList || [])}
              placeholder="-- Chọn chức danh --"
              multiple={false}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Số điện thoại</label>
            <Input
              className="h-9 text-sm"
              placeholder="Số điện thoại"
              value={tempSearchFields.phone}
              onChange={(e) =>
                setTempSearchFields((prev) => ({
                  ...prev,
                  phone: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Thư điện tử</label>
            <Input
              className="h-9 text-sm"
              placeholder="Thư điện tử"
              value={tempSearchFields.email}
              onChange={(e) =>
                setTempSearchFields((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Ngày sinh</label>
            <Popover open={birthdayOpen} onOpenChange={setBirthdayOpen}>
              <div className="relative">
                <Input
                  type="text"
                  readOnly
                  onClick={() => setBirthdayOpen(true)}
                  className="h-9 text-sm bg-background pr-9 cursor-pointer"
                  value={tempSearchFields.birthday || ""}
                  placeholder="dd/mm/yyyy"
                />
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setBirthdayOpen(true)}
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    captionLayout="dropdown"
                    selected={
                      tempSearchFields.birthday
                        ? new Date(tempSearchFields.birthday)
                        : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        const yyyyMmDd = new Date(
                          date.getTime() - date.getTimezoneOffset() * 60000
                        )
                          .toISOString()
                          .slice(0, 10);
                        setTempSearchFields((prev) => ({
                          ...prev,
                          birthday: yyyyMmDd,
                        }));
                        setBirthdayOpen(false);
                      }
                    }}
                    initialFocus
                    required={false}
                  />
                </PopoverContent>
              </div>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Số CMTND</label>
            <Input
              className="h-9 text-sm"
              placeholder="Số CMTND"
              value={tempSearchFields.identity}
              onChange={(e) =>
                setTempSearchFields((prev) => ({
                  ...prev,
                  identity: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Tên token</label>
            <Input
              className="h-9 text-sm"
              placeholder="Tên token"
              value={tempSearchFields.nameToken}
              onChange={(e) =>
                setTempSearchFields((prev) => ({
                  ...prev,
                  nameToken: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Serial token</label>
            <Input
              className="h-9 text-sm"
              placeholder="Serial token"
              value={tempSearchFields.serialToken}
              onChange={(e) =>
                setTempSearchFields((prev) => ({
                  ...prev,
                  serialToken: e.target.value,
                }))
              }
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
            <RotateCcw className="w-3 h-3 mr-1" />
            <span className="leading-none">Đặt lại</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table
        sortable
        columns={userColumns}
        dataSource={users}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        showPagination
        bgColor="bg-white"
        rowClassName={(_item: User, index: number) =>
          index % 2 === 0 ? "bg-white" : "bg-[#0000000d]"
        }
        emptyText={
          isLoading
            ? "Đang tải dữ liệu..."
            : error
              ? `Lỗi: ${error.message}`
              : "Không có dữ liệu người dùng"
        }
        onItemsPerPageChange={handleItemsPerPageChange}
        loading={isLoading}
      />

      {/* Hide default calendar icon for custom-date inputs */}
      <style jsx global>{`
        input.custom-date::-webkit-calendar-picker-indicator {
          opacity: 0 !important;
          display: none !important;
        }
        input.custom-date::-webkit-clear-button,
        input.custom-date::-webkit-inner-spin-button {
          display: none !important;
          -webkit-appearance: none;
        }
        input.custom-date {
          -webkit-appearance: none;
          -moz-appearance: textfield;
          appearance: none;
        }
      `}</style>

      {/* Confirmation Dialogs */}
      <ConfirmDeleteDialog
        isOpen={confirmActiveDeactivate}
        onOpenChange={setConfirmActiveDeactivate}
        onConfirm={doActiveDeactivateUser}
        title="Xác nhận"
        description={
          selectedUser?.active
            ? "Bạn có muốn ngừng kích hoạt người dùng?"
            : "Bạn có muốn kích hoạt người dùng?"
        }
        confirmText="Đồng ý"
        cancelText="Hủy"
      />

      <ConfirmDeleteDialog
        isOpen={confirmResetPassword}
        onOpenChange={setConfirmResetPassword}
        onConfirm={doResetPassword}
        title="Xác nhận"
        description="Bạn có muốn reset password người dùng?"
        confirmText="Đồng ý"
        cancelText="Hủy"
      />

      {/* Position Dialogs */}
      {selectedPositionUser && (
        <>
          <AddMorePositionDialog
            isOpen={showAddMorePosition}
            onOpenChange={setShowAddMorePosition}
            userId={selectedPositionUser.id.toString()}
            positionList={positionList || []}
            selectedPositions={
              (selectedPositionUser as any).additionalPositions?.map(
                (pos: any) => pos.id
              ) || []
            }
            onSuccess={() => {
              setSelectedPositionUser(null);
            }}
          />

          <ShowMorePositionDialog
            isOpen={showMorePosition}
            onOpenChange={setShowMorePosition}
            mainPosition={
              positionList?.find(
                (pos) => pos.id === selectedPositionUser.position
              ) || ({} as CategoryCode)
            }
            additionalPositions={
              (selectedPositionUser as any).additionalPositions || []
            }
          />
        </>
      )}
    </div>
  );
}
