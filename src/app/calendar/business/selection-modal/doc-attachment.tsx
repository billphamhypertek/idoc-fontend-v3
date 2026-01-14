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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { SearchTaskDocument } from "@/definitions/types/calendar.type";
import { useQuery } from "@tanstack/react-query";
import { CalendarService } from "@/services/calendar.service";
import { Constant } from "@/definitions/constants/constant";
import { CustomDatePicker } from "@/components/ui/calendar";
import { Table } from "@/components/ui/table";
import { SearchableSelect } from "@/components/ui/searchable-select";

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
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
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
    queryKey: ["documents", currentPage, searchParams, itemsPerPage],
    queryFn: () => {
      // Add pageSize to searchParams for API
      const paramsWithPageSize = {
        ...searchParams,
        size: itemsPerPage,
      };
      if (searchParams.docType === "0") {
        return CalendarService.getSearchDocIn(paramsWithPageSize, currentPage);
      } else {
        return CalendarService.getSearchDocOut(paramsWithPageSize, currentPage);
      }
    },
    enabled: hasSearched,
  });

  const { data: placeSendCategory } = useQuery({
    queryKey: ["placeSendCategory"],
    queryFn: () =>
      CalendarService.getPlaceSendCategory(Constant.CATEGORYTYPE_CODE.ORG_SEND),
  });

  const { data: docFieldsCategory } = useQuery({
    queryKey: ["docFieldsCategory"],
    queryFn: () =>
      CalendarService.getPlaceSendCategory(
        Constant.CATEGORYTYPE_CODE.DOC_FIELDS
      ),
  });

  const { data: urgentCategory } = useQuery({
    queryKey: ["urgentCategory"],
    queryFn: () =>
      CalendarService.getPlaceSendCategory(Constant.CATEGORYTYPE_CODE.URGENT),
  });

  const { data: securityCategory } = useQuery({
    queryKey: ["securityCategory"],
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

  // Auto search when dialog opens
  useEffect(() => {
    if (open) {
      setHasSearched(true);
      setCurrentPage(1);
      // Reset search params when dialog opens
      setSearchParams({
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
    }
  }, [open]);

  const handleDocSelect = (doc: any) => {
    const docToAdd = {
      ...doc,
      docId: doc.id,
      isNew: true,
      type: searchParams.docType === "0" ? "VAN_BAN_DEN" : "VAN_BAN_DI",
    };
    onDocSelect(docToAdd);
  };

  const handleDocDeselect = (doc: any) => {
    onDocDeselect(doc);
  };

  const isDocSelected = (doc: any) => {
    return selectedDocs.some(
      (selected) =>
        selected.id === doc.id ||
        selected.docId === doc.id ||
        selected.docInId === doc.id ||
        selected.docOutId === doc.id
    );
  };

  const columns = [
    {
      header: "STT",
      className: "w-16 text-center border-r",
      accessor: (item: any, index: number) => (
        <span className="text-sm">
          {item?.no || (currentPage - 1) * itemsPerPage + index + 1}
        </span>
      ),
    },
    {
      header: "Số ký hiệu",
      className: "text-left border-r",
      accessor: (item: any) => (
        <span className="text-sm font-medium">{item?.numberOrSign || "-"}</span>
      ),
    },
    {
      header: "Trích yếu",
      className: "text-left border-r",
      accessor: (item: any) => <span className="text-sm">{item?.preview}</span>,
    },
    {
      header: "Đơn vị",
      className: "text-left border-r",
      accessor: (item: any) => (
        <span className="text-sm">{item?.placeSend || "-"}</span>
      ),
    },
    {
      header: "Loại văn bản",
      className: "w-32 text-left border-r",
      accessor: (item: any) => (
        <span className="text-sm">{item?.docTypeName}</span>
      ),
    },
    {
      header: "Lựa chọn",
      className: "w-24 text-center",
      accessor: (item: any) => (
        <Button
          variant={isDocSelected(item) ? "destructive" : "default"}
          size="sm"
          className={
            isDocSelected(item)
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }
          onClick={() =>
            isDocSelected(item)
              ? handleDocDeselect(item)
              : handleDocSelect(item)
          }
        >
          {isDocSelected(item) ? "Xóa" : "Chọn"}
        </Button>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden [&>button]:hidden p-0">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-6 pt-6 flex-shrink-0">
          <div className="flex flex-row items-center justify-between space-y-0 gap-4">
            <DialogTitle className="text-lg font-bold">
              Lựa chọn văn bản đính kèm
            </DialogTitle>
            <div className="flex gap-2 items-center">
              <Switch
                checked={showAdvancedSearch}
                onCheckedChange={() =>
                  setShowAdvancedSearch(!showAdvancedSearch)
                }
              />
              <Label htmlFor="advancedSearch" className="text-sm font-bold">
                Tìm kiếm nâng cao
              </Label>
            </div>
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

        <div
          className="flex-1 overflow-y-auto px-6 pb-6"
          style={{ scrollbarGutter: "stable" }}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preview" className="text-sm font-bold">
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
              <div className="space-y-2">
                <Label htmlFor="numberOrSign" className="text-sm font-bold">
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
              <div className="space-y-2">
                <Label htmlFor="docType" className="text-sm font-bold">
                  Loại văn bản
                </Label>
                <Select
                  value={searchParams.docType}
                  onValueChange={(value) =>
                    setSearchParams((prev) => ({ ...prev, docType: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Loại văn bản" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Văn bản đến</SelectItem>
                    <SelectItem value="1">Văn bản đi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="placeSendId" className="text-sm font-bold">
                  Nơi gửi
                </Label>
                <SearchableSelect
                  options={
                    placeSendCategory &&
                    Array.isArray(placeSendCategory) &&
                    placeSendCategory.length > 0
                      ? [
                          { label: "Tất cả", value: "all" },
                          ...placeSendCategory.map((item: any) => ({
                            label: item?.name || "",
                            value: item?.id?.toString() || "",
                          })),
                        ].filter((opt) => opt.value !== "")
                      : [{ label: "Tất cả", value: "all" }]
                  }
                  value={searchParams.placeSendId || "all"}
                  onValueChange={(value) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      placeSendId: value === "all" ? "" : value,
                    }))
                  }
                  placeholder="--- Chọn nơi gửi ---"
                  searchPlaceholder="Tìm kiếm nơi gửi..."
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="docFieldsId" className="text-sm font-bold">
                  Lĩnh vực
                </Label>
                <Select
                  value={searchParams.docFieldsId?.toString() || "all"}
                  onValueChange={(value) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      docFieldsId: value === "all" ? null : parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="--- Chọn ---" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {docFieldsCategory?.map((item: any) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="urgentId" className="text-sm font-bold">
                  Độ khẩn
                </Label>
                <Select
                  value={searchParams.urgentId?.toString() || "all"}
                  onValueChange={(value) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      urgentId: value === "all" ? null : parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="--- Chọn ---" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {urgentCategory?.map((item: any) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="securityId" className="text-sm font-bold">
                  Độ mật
                </Label>
                <Select
                  value={searchParams.securityId?.toString() || "all"}
                  onValueChange={(value) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      securityId: value === "all" ? null : parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="--- Chọn ---" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {securityCategory?.map((item: any) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-bold">
                  Trạng thái
                </Label>
                <Select
                  value={searchParams.status || "all"}
                  onValueChange={(value) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      status: value === "all" ? null : value,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="--- Chọn ---" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {getDocumentStatuses().map((status: any) => (
                      <SelectItem key={status.key} value={status.key}>
                        {status.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {showAdvancedSearch && (
              <div className="space-y-4 rounded-lg">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">Ngày văn bản</Label>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-600">
                          Từ ngày
                        </Label>
                        <CustomDatePicker
                          selected={
                            searchParams.dateArrivalFrom
                              ? new Date(searchParams.dateArrivalFrom)
                              : null
                          }
                          onChange={(date) =>
                            setSearchParams((prev) => ({
                              ...prev,
                              dateArrivalFrom: date
                                ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                                : "",
                            }))
                          }
                          placeholder="dd/mm/yyyy"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-600">
                          Đến ngày
                        </Label>
                        <CustomDatePicker
                          selected={
                            searchParams.dateArrivalTo
                              ? new Date(searchParams.dateArrivalTo)
                              : null
                          }
                          onChange={(date) =>
                            setSearchParams((prev) => ({
                              ...prev,
                              dateArrivalTo: date
                                ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                                : "",
                            }))
                          }
                          placeholder="dd/mm/yyyy"
                          min={searchParams.dateArrivalFrom || undefined}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">Ngày vào sổ</Label>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-600">
                          Từ ngày
                        </Label>
                        <CustomDatePicker
                          selected={
                            searchParams.dateIssuedFrom
                              ? new Date(searchParams.dateIssuedFrom)
                              : null
                          }
                          onChange={(date) =>
                            setSearchParams((prev) => ({
                              ...prev,
                              dateIssuedFrom: date
                                ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                                : "",
                            }))
                          }
                          placeholder="dd/mm/yyyy"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-600">
                          Đến ngày
                        </Label>
                        <CustomDatePicker
                          selected={
                            searchParams.dateIssuedTo
                              ? new Date(searchParams.dateIssuedTo)
                              : null
                          }
                          onChange={(date) =>
                            setSearchParams((prev) => ({
                              ...prev,
                              dateIssuedTo: date
                                ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                                : "",
                            }))
                          }
                          placeholder="dd/mm/yyyy"
                          min={searchParams.dateIssuedFrom || undefined}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">
                      Ngày nhận văn bản
                    </Label>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-600">
                          Từ ngày
                        </Label>
                        <CustomDatePicker
                          selected={
                            searchParams.dateReceivedFrom
                              ? new Date(searchParams.dateReceivedFrom)
                              : null
                          }
                          onChange={(date) =>
                            setSearchParams((prev) => ({
                              ...prev,
                              dateReceivedFrom: date
                                ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                                : "",
                            }))
                          }
                          placeholder="dd/mm/yyyy"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-600">
                          Đến ngày
                        </Label>
                        <CustomDatePicker
                          selected={
                            searchParams.dateReceivedTo
                              ? new Date(searchParams.dateReceivedTo)
                              : null
                          }
                          onChange={(date) =>
                            setSearchParams((prev) => ({
                              ...prev,
                              dateReceivedTo: date
                                ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                                : "",
                            }))
                          }
                          placeholder="dd/mm/yyyy"
                          min={searchParams.dateReceivedFrom || undefined}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

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

          <div className="flex-1 overflow-hidden mt-4">
            <Table
              columns={columns}
              dataSource={documents?.content || []}
              currentPage={currentPage}
              onPageChange={(page) => {
                setCurrentPage(page);
              }}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(size) => {
                setItemsPerPage(size);
                setCurrentPage(1);
              }}
              totalItems={documents?.totalElements}
              loading={isLoading}
              emptyText={
                !hasSearched ? "Vui lòng tìm kiếm" : "Không có dữ liệu"
              }
              showPagination={true}
              showPageSize={true}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
