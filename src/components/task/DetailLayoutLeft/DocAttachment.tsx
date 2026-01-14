"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table } from "@/components/ui/table";
import SelectCustom from "@/components/common/SelectCustom";
import { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { SearchTaskDocument } from "@/definitions/types/calendar.type";
import { useQuery } from "@tanstack/react-query";
import { CalendarService } from "@/services/calendar.service";
import { Constant } from "@/definitions/constants/constant";
import { queryKeys } from "@/definitions";

interface DocAttachmentProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selectedDocs?: any[];
  onDocSelect: (doc: any) => void;
  onDocDeselect: (doc: any) => void;
}

export default function DocAttachment({
  open,
  onOpenChange,
  selectedDocs = [],
  onDocSelect,
  onDocDeselect,
}: DocAttachmentProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchTaskDocument>({
    numberOrSign: "",
    docStatusId: null,
    docFieldsId: null,
    urgentId: null,
    securityId: null,
    status: null,
    preview: "",
    docType: "0",
    orgIssuedId: "",
    createFrom: "",
    createTo: "",
    dateIssuedFrom: "",
    dateIssuedTo: "",
    placeSendId: "",
    dateArrivalFrom: "",
    dateArrivalTo: "",
    dateReceivedFrom: "",
    dateReceivedTo: "",
  });

  const { data: documents, isLoading } = useQuery({
    queryKey: [queryKeys.documentBook.documents, currentPage, searchParams],
    queryFn: () => {
      if (searchParams.docType === "0") {
        return CalendarService.getSearchDocIn(searchParams, currentPage);
      } else {
        return CalendarService.getSearchDocOut(searchParams, currentPage);
      }
    },
    enabled: hasSearched,
  });

  const { data: docFieldsCategory } = useQuery({
    queryKey: [queryKeys.documentBook.docFieldsCategory],
    queryFn: () =>
      CalendarService.getPlaceSendCategory(
        Constant.CATEGORYTYPE_CODE.DOC_FIELDS
      ),
  });

  const { data: urgentCategory } = useQuery({
    queryKey: [queryKeys.documentBook.urgentCategory],
    queryFn: () =>
      CalendarService.getPlaceSendCategory(Constant.CATEGORYTYPE_CODE.URGENT),
  });

  const { data: securityCategory } = useQuery({
    queryKey: [queryKeys.documentBook.securityCategory],
    queryFn: () =>
      CalendarService.getPlaceSendCategory(Constant.CATEGORYTYPE_CODE.SECURITY),
  });

  // Lấy danh sách status dựa trên docType
  const getDocumentStatuses = () => {
    const documentType = Constant.DOCUMENT_TYPE.find(
      (doc) => doc.code === parseInt(searchParams.docType)
    );
    return documentType?.documentStatus || [];
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setHasSearched(true);
  };

  const handleDocSelect = (doc: any) => {
    const docToAdd = {
      ...doc,
      docId: doc.id,
      isNew: true,
    };
    onDocSelect(docToAdd);
  };

  const handleDocDeselect = (doc: any) => {
    onDocDeselect(doc);
  };

  const isDocSelected = (doc: any) => {
    return selectedDocs.some(
      (selected) => selected.id === doc.id || selected.docId === doc.id
    );
  };

  const getDataSource = () => {
    if (!hasSearched) {
      return [];
    }

    if (isLoading) {
      return [];
    }

    if (documents?.content?.length === 0) {
      return [];
    }

    return (
      documents?.content?.map((item: any, index: number) => ({
        no: item?.no || (currentPage - 1) * itemsPerPage + index + 1,
        numberOrSign: item?.numberOrSign || "-",
        preview: item?.preview,
        orgName: item?.orgName || "-",
        docTypeName: item?.docTypeName,
        actions: (
          <div
            className="text-red-500 cursor-pointer"
            onClick={() =>
              isDocSelected(item)
                ? handleDocDeselect(item)
                : handleDocSelect(item)
            }
          >
            {isDocSelected(item) ? "Bỏ chọn" : "Chọn"}
          </div>
        ),
      })) || []
    );
  };

  const columns = [
    {
      header: "STT",
      accessor: "no",
      className: "w-16 text-center border-r",
    },
    {
      header: "Số ký hiệu",
      accessor: "numberOrSign",
      className: "w-10 text-center border-r",
    },
    {
      header: "Trích yếu",
      accessor: "preview",
      className: "w-20 text-center border-r",
    },
    {
      header: "Đơn vị",
      accessor: "orgName",
      className: "w-32 text-center border-r",
    },
    {
      header: "Loại văn bản",
      accessor: "docTypeName",
      className: "w-32 text-center border-r",
    },
    {
      header: "Lựa chọn",
      accessor: "actions",
      className: "w-24 text-center border-r",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex flex-row items-center justify-between space-y-0 gap-4">
            <DialogTitle className="text-lg font-semibold">
              Lựa chọn văn bản đính kèm
            </DialogTitle>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-9 w-8 p-0 rounded-none"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4 pb-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="preview" className="text-sm font-medium">
                Trích yếu
              </Label>
              <Input
                id="preview"
                placeholder="Trích yếu"
                value={searchParams.preview}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    preview: e.target.value,
                  }))
                }
                className="w-full"
              />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="numberOrSign" className="text-sm font-medium">
                Số ký hiệu
              </Label>
              <Input
                id="numberOrSign"
                placeholder="Số ký hiệu"
                value={searchParams.numberOrSign}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    numberOrSign: e.target.value,
                  }))
                }
                className="w-full"
              />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="docType" className="text-sm font-medium">
                Loại văn bản
              </Label>
              <SelectCustom
                options={[
                  { id: "0", name: "Văn bản đến" },
                  { id: "1", name: "Văn bản đi" },
                ]}
                value={searchParams.docType}
                onChange={(value) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    docType: Array.isArray(value) ? value[0] : value,
                  }))
                }
                placeholder="Loại văn bản"
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="docFieldsId" className="text-sm font-medium">
                Lĩnh vực
              </Label>
              <SelectCustom
                options={[
                  { id: "all", name: "Tất cả" },
                  ...(docFieldsCategory?.map((item: any) => ({
                    id: item.id.toString(),
                    name: item.name,
                  })) || []),
                ]}
                value={searchParams.docFieldsId?.toString() || ""}
                onChange={(value) => {
                  const stringValue = Array.isArray(value) ? value[0] : value;
                  setSearchParams((prev) => ({
                    ...prev,
                    docFieldsId:
                      stringValue === "all" ? null : parseInt(stringValue),
                  }));
                }}
                placeholder="--- Chọn ---"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="urgentId" className="text-sm font-medium">
                Độ khẩn
              </Label>
              <SelectCustom
                options={[
                  { id: "all", name: "Tất cả" },
                  ...(urgentCategory?.map((item: any) => ({
                    id: item.id.toString(),
                    name: item.name,
                  })) || []),
                ]}
                value={searchParams.urgentId?.toString() || ""}
                onChange={(value) => {
                  const stringValue = Array.isArray(value) ? value[0] : value;
                  setSearchParams((prev) => ({
                    ...prev,
                    urgentId:
                      stringValue === "all" ? null : parseInt(stringValue),
                  }));
                }}
                placeholder="--- Chọn ---"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="securityId" className="text-sm font-medium">
                Độ mật
              </Label>
              <SelectCustom
                options={[
                  { id: "all", name: "Tất cả" },
                  ...(securityCategory?.map((item: any) => ({
                    id: item.id.toString(),
                    name: item.name,
                  })) || []),
                ]}
                value={searchParams.securityId?.toString() || ""}
                onChange={(value) => {
                  const stringValue = Array.isArray(value) ? value[0] : value;
                  setSearchParams((prev) => ({
                    ...prev,
                    securityId:
                      stringValue === "all" ? null : parseInt(stringValue),
                  }));
                }}
                placeholder="--- Chọn ---"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Trạng thái
              </Label>
              <SelectCustom
                options={[
                  { id: "all", name: "Tất cả" },
                  ...getDocumentStatuses().map((status: any) => ({
                    id: status.key,
                    name: status.value,
                  })),
                ]}
                value={searchParams.status || "all"}
                onChange={(value) => {
                  const stringValue = Array.isArray(value) ? value[0] : value;
                  setSearchParams((prev) => ({
                    ...prev,
                    status: stringValue === "all" ? null : stringValue,
                  }));
                }}
                placeholder="--- Chọn ---"
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              <Search className="h-4 w-4 mr-2" />
              Tìm kiếm
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <Table
            columns={columns}
            dataSource={getDataSource()}
            showPagination={true}
            currentPage={currentPage}
            totalItems={documents?.totalElements || 0}
            onPageChange={setCurrentPage}
            emptyText={
              !hasSearched
                ? "Vui lòng nhập thông tin tìm kiếm và nhấn nút 'Tìm kiếm' để hiển thị dữ liệu"
                : isLoading
                  ? "Đang tải..."
                  : "Không có dữ liệu"
            }
            className="task-monitor-table"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
