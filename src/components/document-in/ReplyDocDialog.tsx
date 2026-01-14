import React, { Dispatch, SetStateAction, useState } from "react";
import {
  CustomDialogContent,
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, ChevronLeft, Save, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Column } from "@/definitions";
import { Table } from "@/components/ui/table";
import { useOrgIssued, useReplyDoc } from "@/hooks/data/document-in.data";
import { ReplyDoc } from "@/definitions/types/document.type";
import { formatDateVN } from "@/utils/datetime.utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Constant } from "@/definitions/constants/constant";
import { CustomDatePicker } from "@/components/ui/calendar";
import SelectCustom from "@/components/common/SelectCustom";

interface Props {
  data: ReplyDoc[];
  setData: Dispatch<SetStateAction<ReplyDoc[]>>;
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  onClose: () => void;
  onSubmit: (s: string) => void;
}

const replyDocInit = {
  numberOrSign: "",
  orgIssuedName: "",
  docStatusId: "",
  preview: "",
  startArrival: "",
  endArrival: "",
  startIssued: "",
  endIssued: "",
  page: 1,
  sortBy: "",
  direction: "ASC" as "ASC" | "DESC",
  size: 10,
};
const documentStatus = Constant.DOCUMENT_TYPE.find(
  (documentType) => documentType.code === 0
)?.documentStatus;

export function ReplyDocDialog({
  data,
  setData,
  isOpen,
  onOpenChange,
  onClose,
  onSubmit,
}: Props) {
  const [search, setSearch] = useState(replyDocInit);
  const [tempSearch, setTempSearch] = useState(replyDocInit);
  const [localSelect, setLocalSelect] = useState(data);
  const { data: replyDocData, isLoading, error, refetch } = useReplyDoc(search);
  const { data: orgIssued } = useOrgIssued();
  const handleCancel = () => {
    setLocalSelect(data ?? []);
    onClose();
  };
  const handleSubmit = () => {
    setData(localSelect);
    onSubmit(localSelect.map((t) => t.id).join(","));
    onClose();
  };
  const handleSearch = () => {
    setSearch(tempSearch);
    refetch();
  };
  const handleToggle = (value: ReplyDoc, checked: boolean) => {
    if (checked) {
      setLocalSelect((prev) => [...prev, value]); // add
    } else {
      setLocalSelect((prev) => prev.filter((item) => item !== value)); // remove
    }
  };

  const columns: Column<ReplyDoc>[] = [
    {
      header: "STT",
      className: "text-center py-1 w-8",
      accessor: (item: ReplyDoc, index: number) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-medium">{index + 1}</span>
          <Input
            type="checkbox"
            className="w-4 h-4"
            checked={localSelect.includes(item)}
            onChange={(e) => handleToggle(item, e.target.checked)}
          />
        </div>
      ),
    },
    {
      header: "Số đến",
      className: "text-center py-1 w-8",
      accessor: (item: ReplyDoc) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-medium">{item.numberArrival}</span>
        </div>
      ),
    },
    {
      header: "Số, KH của VB đến",
      className: "text-center py-1 w-6",
      accessor: (item: ReplyDoc) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-medium">{item.numberOrSign}</span>
        </div>
      ),
    },
    {
      header: "Ngày văn bản",
      className: "text-center py-1 w-8",
      accessor: (item: ReplyDoc) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-medium">
            {formatDateVN(item.dateArrival)}
          </span>
        </div>
      ),
    },
    {
      header: "Ngày vào sổ",
      className: "text-center py-1 w-8",
      accessor: (item: ReplyDoc) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-medium">
            {formatDateVN(item.dateIssued)}
          </span>
        </div>
      ),
    },
    {
      header: "Trích yếu",
      className: "text-center py-1 w-2",
      accessor: (item: ReplyDoc) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-medium">{item.preview}</span>
        </div>
      ),
    },
    {
      header: "Đơn vị ban hành",
      className: "text-center py-1 w-8",
      accessor: (item: ReplyDoc) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-medium">{item.orgIssuedName}</span>
        </div>
      ),
    },
    {
      header: "Hạn xử lý",
      className: "text-center py-1 w-8",
      accessor: (item: ReplyDoc) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-medium">
            {formatDateVN(item.deadline)}
          </span>
        </div>
      ),
    },
  ];
  const tableData = replyDocData?.objList ?? [];
  const totalElement = replyDocData?.totalRecord ?? 0;
  const totalPage = replyDocData?.totalPage ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <CustomDialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
                Tìm kiếm văn bản
              </DialogTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="h-9 px-4 text-sm font-medium border-gray-300 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-sm font-medium"
              >
                <Save className="w-4 h-4 mr-1" />
                Lưu
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nội dung xử lý */}
          <div className="mb-3 p-4 bg-white border border-blue-200 rounded-lg">
            <div className="space-y-4 mb-4">
              {/* Hàng thứ 1: Số/Ký hiệu, Đơn vị ban hành, Trạng thái văn bản */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Số/Ký hiệu
                  </label>
                  <Input
                    type="text"
                    value={tempSearch.numberOrSign}
                    onChange={(e) =>
                      setTempSearch((prev) => ({
                        ...prev,
                        numberOrSign: e.target.value,
                      }))
                    }
                    className="h-9 text-sm bg-background"
                    placeholder="Nhập số/ký hiệu..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Đơn vị ban hành
                  </label>
                  <SelectCustom
                    value={tempSearch.orgIssuedName || "all"}
                    onChange={(value) =>
                      setTempSearch((prev) => ({
                        ...prev,
                        orgIssuedName: value === "all" ? "" : String(value),
                      }))
                    }
                    options={[
                      { label: "Tất cả", value: "all" },
                      ...(orgIssued?.map((doc: any) => ({
                        id: String(doc.id),
                        name: doc.name,
                      })) || []),
                    ]}
                    placeholder="Chọn đơn vị soạn thảo"
                    className="h-9 bg-background"
                    contentClassName="max-h-[400px] overflow-y-auto scrollbar-visible"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Trạng thái văn bản
                  </label>
                  <Select //todo change to selectcustom
                    value={tempSearch.docStatusId || "all"}
                    onValueChange={(value) =>
                      setTempSearch((prev) => ({
                        ...prev,
                        docStatusId: value === "all" ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger className="h-9 bg-background">
                      <SelectValue placeholder="Chọn trạng thái văn bản" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {documentStatus?.map((doc) => (
                        <SelectItem key={doc.key} value={String(doc.key)}>
                          {doc.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Hàng thứ 3: Trích yếu */}
              <div className="grid grid-cols-1 gap-4">
                {/* Trích yếu */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Trích yếu
                  </label>
                  <Input
                    type="text"
                    value={tempSearch.preview}
                    onChange={(e) =>
                      setTempSearch((prev) => ({
                        ...prev,
                        preview: e.target.value,
                      }))
                    }
                    className="h-9 text-sm bg-background"
                    placeholder="Nhập từ khóa..."
                  />
                </div>
              </div>
              {/* Hàng thứ 4: Tất cả ngày trên 1 dòng */}
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Ngày ban hành (Từ ngày)
                  </label>
                  <CustomDatePicker
                    selected={
                      tempSearch.startIssued
                        ? new Date(tempSearch.startIssued)
                        : null
                    }
                    onChange={(d) =>
                      setTempSearch((prev) => ({
                        ...prev,
                        startIssued: d ? d.toISOString().slice(0, 10) : "",
                      }))
                    }
                    className="h-9 text-sm bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Ngày ban hành (Đến ngày)
                  </label>
                  <CustomDatePicker
                    selected={
                      tempSearch.endIssued
                        ? new Date(tempSearch.endIssued)
                        : null
                    }
                    onChange={(d) =>
                      setTempSearch((prev) => ({
                        ...prev,
                        endIssued: d ? d.toISOString().slice(0, 10) : "",
                      }))
                    }
                    className="h-9 text-sm bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Ngày nhận (Từ ngày)
                  </label>
                  <CustomDatePicker
                    selected={
                      tempSearch.startArrival
                        ? new Date(tempSearch.startArrival)
                        : null
                    }
                    onChange={(d) =>
                      setTempSearch((prev) => ({
                        ...prev,
                        startArrival: d ? d.toISOString().slice(0, 10) : "",
                      }))
                    }
                    className="h-9 text-sm bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Ngày nhận (Đến ngày)
                  </label>
                  <CustomDatePicker
                    selected={
                      tempSearch.endArrival
                        ? new Date(tempSearch.endArrival)
                        : null
                    }
                    onChange={(d) =>
                      setTempSearch((prev) => ({
                        ...prev,
                        endArrival: d ? d.toISOString().slice(0, 10) : "",
                      }))
                    }
                    className="h-9 text-sm bg-background"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-3">
              <Button
                variant="outline"
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-sm font-medium hover:text-white"
              >
                Tìm kiếm
              </Button>
            </div>
          </div>
          <Table
            columns={columns}
            dataSource={tableData}
            loading={isLoading}
            showPagination={true}
            currentPage={search.page}
            itemsPerPage={search.size}
            sortable={true}
            bgColor={"bg-white"}
            onPageChange={(p) =>
              setSearch((prev) => ({
                ...prev,
                page: p,
              }))
            }
            emptyText={
              isLoading
                ? "Đang tải dữ liệu..."
                : error
                  ? `Lỗi: ${error.message}`
                  : "Không tồn tại văn bản"
            }
          />
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
