import useAuthStore from "@/stores/auth.store";
import { useUserFromOrg } from "@/hooks/data/common.data";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  CustomDialogContent,
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, ChevronLeft, Save, Search, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "../ui/input";
import { Column, UserInfo } from "@/definitions";
import { Table } from "@/components/ui/table";

interface Props {
  data: UserInfo[];
  setData: Dispatch<SetStateAction<UserInfo[]>>;
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  onClose: () => void;
  onSubmit: (s: string) => void;
}

export function ReceiveToKnowDialog({
  data,
  setData,
  isOpen,
  onOpenChange,
  onClose,
  onSubmit,
}: Props) {
  const { user } = useAuthStore();
  const [textSearch, setTextSearch] = useState<string>("");
  const [tempQuery, setTempQuery] = useState<string>("");
  const [localSelect, setLocalSelect] = useState(data);
  const orgId = user?.org ? String(user.org) : null;
  const {
    data: userFromOrg,
    isLoading,
    error,
  } = useUserFromOrg(orgId, { textSearch: textSearch });
  const handleCancel = useCallback(() => {
    setTextSearch("");
    setTempQuery("");
    setLocalSelect(data ?? []);
    onClose();
  }, [data, onClose]);

  const handleSubmit = useCallback(() => {
    setData(localSelect);
    onSubmit(localSelect.map((t) => t.id).join(","));
    setTextSearch("");
    setTempQuery("");
    onClose();
  }, [localSelect, setData, onSubmit, onClose]);

  const handleSearch = useCallback(() => {
    setTextSearch(tempQuery);
  }, [tempQuery]);

  const handleToggle = useCallback((value: UserInfo, checked: boolean) => {
    if (checked) {
      setLocalSelect((prev) => [...prev, value]); // add
    } else {
      setLocalSelect((prev) => prev.filter((item) => item.id !== value.id)); // remove by id
    }
  }, []);

  const columns: Column<UserInfo>[] = useMemo(
    () => [
      {
        header: "STT",
        className: "text-center py-2 w-16",
        accessor: (_: UserInfo, index: number) => (
          <div className="flex items-center justify-center">
            <span className="text-xs font-medium">{index + 1}</span>
          </div>
        ),
      },
      {
        header: "Họ và tên",
        className: "text-left py-2 px-3",
        accessor: (item: UserInfo) => (
          <div className="flex items-center">
            <span className="text-xs font-medium">{item.fullName}</span>
          </div>
        ),
      },
      {
        header: "Chức danh",
        className: "text-left py-2 px-3",
        accessor: (item: UserInfo) => (
          <div className="flex items-center">
            <span className="text-xs font-medium">
              {item.positionModel.name}
            </span>
          </div>
        ),
      },
      {
        header: "Đơn vị",
        className: "text-left py-2 px-3",
        accessor: (item: UserInfo) => (
          <div className="flex items-center">
            <span className="text-xs font-medium">{item.orgModel.name}</span>
          </div>
        ),
      },
      {
        header: "Chọn",
        className: "text-center py-2 w-20",
        accessor: (item: UserInfo) => (
          <div className="flex items-center justify-center">
            <Input
              type="checkbox"
              className="w-4 h-4"
              checked={localSelect.some((selected) => selected.id === item.id)}
              onChange={(e) => handleToggle(item, e.target.checked)}
            />
          </div>
        ),
      },
    ],
    [localSelect, handleToggle]
  );

  const tableData = useMemo(() => userFromOrg ?? [], [userFromOrg]);

  useEffect(() => {
    if (isOpen) {
      setLocalSelect(data ?? []);
    }
  }, [isOpen, data]);

  // Memoized components for better performance
  const SearchSection = useMemo(
    () => (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <Label className="text-sm font-semibold text-gray-900 mb-3 block">
          Nội dung tìm kiếm
        </Label>
        <Input
          placeholder="Tìm kiếm Họ và tên | Email | Tên đăng nhập..."
          value={tempQuery}
          onChange={(e) => setTempQuery(e.target.value)}
          className="flex-1"
        />
        <div className="flex justify-center mt-3">
          <Button
            variant="default"
            onClick={handleSearch}
            className="h-9 px-4 text-sm font-medium text-white hover:bg-[#1e6bc7]"
            style={{ backgroundColor: "#2585e4" }}
          >
            <Search className="w-4 h-4 mr-1" />
            Tìm kiếm
          </Button>
        </div>
      </div>
    ),
    [tempQuery, handleSearch]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <CustomDialogContent className="max-w-4xl max-h-[75vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
                <User2 className="w-4 h-4 mr-2 text-blue-600" />
                Thêm người ký
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-sm font-medium"
              >
                <Save className="w-4 h-4 mr-1" />
                Lưu
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="h-9 px-4 text-sm font-medium border-gray-300 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Hủy
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content that fits with auto height, max 75vh */}
        <div className="px-0 py-4 overflow-hidden">
          <div className="flex flex-col space-y-4">
            {/* Search Section */}
            {SearchSection}

            {/* Table Section with auto height */}
            <div className="overflow-hidden">
              <Table
                sortable={true}
                columns={columns}
                dataSource={tableData}
                loading={isLoading}
                showPagination={false}
                emptyText={
                  isLoading
                    ? "Đang tải dữ liệu..."
                    : error
                      ? `Lỗi: ${error.message}`
                      : "Không tồn tại văn bản"
                }
              />
            </div>
          </div>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
