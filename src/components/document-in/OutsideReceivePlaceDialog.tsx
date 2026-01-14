import { useOutsideAgency } from "@/hooks/data/common.data";
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
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  Loader2,
  Save,
  Search,
  User2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "../ui/input";
import { Column } from "@/definitions";
import { Table } from "@/components/ui/table";
import { OutsideAgency } from "@/definitions/types/common.type";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEncryptStore } from "@/stores/encrypt.store";
import { useReloadLGSP } from "@/hooks/data/draft.data";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "../ui/toast";
import { ToastUtils } from "@/utils/toast.utils";

interface Props {
  data: OutsideAgency[];
  setData: (items: OutsideAgency[]) => void;
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  onClose: () => void;
}

export function OutsideReceivePlaceDialog({
  data,
  setData,
  isOpen,
  onOpenChange,
  onClose,
}: Props) {
  const { isEncrypt } = useEncryptStore();
  const [textSearch, setTextSearch] = useState<string>("");
  const [tempQuery, setTempQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [localSelect, setLocalSelect] = useState(data);
  const {
    data: outsideAgency,
    isLoading,
    error,
  } = useOutsideAgency(textSearch, currentPage, isOpen && isEncrypt === false);
  const toast = useToast();

  const reloadLGSPMutation = useReloadLGSP();
  const handleCancel = useCallback(() => {
    setLocalSelect(data ?? []);
    onClose();
  }, [data, onClose]);

  const handleSubmit = useCallback(() => {
    setData(localSelect);
    onClose();
  }, [localSelect, setData, onClose]);

  const handleSearch = useCallback(() => {
    setTextSearch(tempQuery);
    setCurrentPage(1);
  }, [tempQuery]);

  const handleToggle = useCallback((value: OutsideAgency, checked: boolean) => {
    if (checked) {
      setLocalSelect((prev) => [...prev, value]); // add
    } else {
      setLocalSelect((prev) => prev.filter((item) => item !== value)); // remove
    }
  }, []);

  const handleRemoveSelected = useCallback((value: OutsideAgency) => {
    setLocalSelect((prev) => prev.filter((item) => item !== value));
  }, []);

  const handleClearAll = useCallback(() => {
    setLocalSelect([]);
  }, []);

  const columns: Column<OutsideAgency>[] = useMemo(
    () => [
      {
        header: "Tên",
        className: "text-left py-3 px-3",
        accessor: (item: OutsideAgency) => (
          <div className="flex items-center">
            <span className="text-sm font-medium">
              {item.name}({item.code})
            </span>
          </div>
        ),
      },
      {
        header: "Chọn",
        className: "text-center py-3 w-20",
        accessor: (item: OutsideAgency) => (
          <div className="flex items-center justify-center">
            <Input
              type="checkbox"
              className="w-4 h-4"
              checked={localSelect.includes(item)}
              onChange={(e) => handleToggle(item, e.target.checked)}
            />
          </div>
        ),
      },
    ],
    [localSelect, handleToggle]
  );

  const tableData = useMemo(
    () => outsideAgency?.content ?? [],
    [outsideAgency?.content]
  );
  const totalItems = useMemo(
    () => outsideAgency?.totalElements ?? 0,
    [outsideAgency?.totalElements]
  );

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
          placeholder="Tìm kiếm..."
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

  const SelectedItemsList = useMemo(
    () => (
      <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
        {localSelect.length === 0 ? (
          <div className="text-xs text-gray-500">Chưa có mục nào được chọn</div>
        ) : (
          <TooltipProvider>
            {localSelect.map((item, idx) => (
              <Tooltip key={`${item.id || item.name}-${idx}`}>
                <div
                  className={`flex items-center justify-between gap-2 p-2 border rounded-md ${idx === localSelect.length - 1 ? "!mb-2" : ""}`}
                >
                  <TooltipTrigger asChild>
                    <div className="truncate max-w-[180px] cursor-help">
                      <span className="text-sm font-medium truncate">
                        {item.name}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveSelected(item)}
                      className="h-9 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <TooltipContent>
                  <p className="text-sm">{item.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        )}
      </div>
    ),
    [localSelect, handleRemoveSelected]
  );

  const handleReloadListLGSP = async () => {
    try {
      await reloadLGSPMutation.mutateAsync();
      ToastUtils.success("Cập nhật dữ liệu danh sách đơn vị thành công!");
    } catch (error) {
      console.log(error);
      ToastUtils.error("Lỗi cập nhật dữ liệu danh sách đơn vị!");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <CustomDialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                Chuyển nơi nhận công văn
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

        {/* Optimized wrapper body with better structure */}
        <div className="px-0 py-4 h-[calc(90vh-96px)] overflow-hidden">
          <div className="grid grid-cols-3 gap-4 h-full">
            {/* LEFT: Search and Table Section */}
            <div className="col-span-2 flex flex-col h-full min-h-0 overflow-hidden">
              {SearchSection}

              {/* Optimized Table wrapper */}
              <div className="mt-3 flex-1 h-full min-h-0 overflow-y-auto">
                <Table
                  sortable={true}
                  columns={columns}
                  dataSource={tableData}
                  loading={isLoading}
                  showPagination={true}
                  emptyText={
                    isLoading
                      ? "Đang tải dữ liệu..."
                      : error
                        ? `Lỗi: ${error.message}`
                        : "Không tồn tại văn bản"
                  }
                  currentPage={currentPage}
                  totalItems={totalItems}
                  onPageChange={setCurrentPage}
                  showPageSize={false}
                  fixedHeader
                />
              </div>
            </div>

            {/* RIGHT: Selected Items Section */}
            <div className="col-span-1 flex flex-col h-full min-h-0 overflow-hidden">
              <Button
                onClick={handleReloadListLGSP}
                disabled={reloadLGSPMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-sm font-medium mb-4 w-[200px]"
              >
                {reloadLGSPMutation?.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Đang cập
                    nhật
                  </>
                ) : (
                  "Cập nhật đơn vị mới"
                )}
              </Button>
              <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">
                    Đã chọn ({localSelect.length})
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-xs"
                  >
                    Xóa hết
                  </Button>
                </div>

                {SelectedItemsList}
              </div>
            </div>
          </div>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
