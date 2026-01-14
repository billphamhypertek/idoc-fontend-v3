import { Button } from "@/components/ui/button";
import { CustomDatePicker } from "@/components/ui/calendar";
import {
  CustomDialogContent,
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table } from "@/components/ui/table";
import { Column } from "@/definitions";
import { Constant } from "@/definitions/constants/constant";
import { CategoryCode } from "@/definitions/types/category.type";
import {
  AttachedDocument,
  AttachedDocumentSearch,
} from "@/definitions/types/document-out.type";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import { useGetAttachedDocumentQuery } from "@/hooks/data/task.data";
import { FileCheck, Minus, Plus, X } from "lucide-react";
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import SelectCustom from "../common/SelectCustom";
import { Input } from "../ui/input";
import { formatDateYMD, parseDateStringYMD } from "@/utils/datetime.utils";
import { useGetAttachedDocumentQueryV2 } from "@/hooks/data/taskv2.data";

interface Props {
  data: AttachedDocument[];
  setData: Dispatch<SetStateAction<AttachedDocument[]>>;
  isOpen: boolean;
  onClose: () => void;
  isV2?: boolean;
}

const docStatusOptions = [
  {
    label: "Trả lại văn bản",
    value: "RETURN_DOC",
  },
  {
    label: "Thu hồi văn bản",
    value: "RETAKE_DOC",
  },
  {
    label: "Đang xử lý",
    value: "DOING",
  },
  {
    label: "Chờ xử lý",
    value: "NOT_YET",
  },
  {
    label: "Hoàn thành",
    value: "DONE",
  },
  {
    label: "Văn bản ủy quyền",
    value: "DELEGATE_DOC",
  },
];

const defaultSearchState = {
  preview: "",
  numberOrSign: "",
  docStatusId: "0",
  docFieldsId: "0",
  urgentId: "0",
  securityId: "0",
  status: "",
  docType: "0",
  orgIssuedId: "",
  createFromNgb: {
    year: null,
    month: null,
    day: null,
  },
  createFrom: "",
  createToNgb: {
    year: null,
    month: null,
    day: null,
  },
  createTo: "",
  dateIssuedFromNgb: {
    year: null,
    month: null,
    day: null,
  },
  dateIssuedFrom: "",
  dateIssuedToNgb: {
    year: null,
    month: null,
    day: null,
  },
  dateIssuedTo: "",
  dateReceivedFrom: "",
  dateReceivedTo: "",
  dateReceivedFromNgb: {
    year: null,
    month: null,
    day: null,
  },
  dateReceivedToNgb: {
    year: null,
    month: null,
    day: null,
  },
  issuedDateFromNgb: {
    year: null,
    month: null,
    day: null,
  },
  issuedDateToNgb: {
    year: null,
    month: null,
    day: null,
  },
  placeSendId: "",
  dateArrivalFromNgb: {
    year: null,
    month: null,
    day: null,
  },
  dateArrivalFrom: "",
  dateArrivalToNgb: {
    year: null,
    month: null,
    day: null,
  },
  dateArrivalTo: "",
};
type SearchState = typeof defaultSearchState;

export function AttachedDocumentDialog({
  data,
  setData,
  isOpen,
  onClose,
  isV2 = false,
}: Props) {
  const [localSelect, setLocalSelect] = useState(data);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [searchParams, setSearchParams] =
    useState<SearchState>(defaultSearchState);
  const [tmpSearchParams, setTmpSearchParams] =
    useState<SearchState>(defaultSearchState);

  // New state to control displaying advanced search fields
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const { data: docFieldsCategoryData } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.DOC_FIELDS
  );
  const { data: urgentCategoryData } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.URGENT
  );
  const { data: securityCategoryData } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.SECURITY
  );
  const { data: docStatusCategoryData } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.DOC_STATUS
  );
  const { data: orgSendCategoryData } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.ORG_SEND
  );
  const { data: docTypeCategoryData } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.DOC_TYPE
  );
  const advanceParams: AttachedDocumentSearch = useMemo(
    () => ({
      docStatusId:
        !searchParams.docStatusId || searchParams.docStatusId === "0"
          ? null
          : searchParams.docStatusId,
      docFieldsId:
        !searchParams.docFieldsId || searchParams.docFieldsId === "0"
          ? null
          : searchParams.docFieldsId,
      urgentId:
        !searchParams.urgentId || searchParams.urgentId === "0"
          ? null
          : searchParams.urgentId,
      securityId:
        !searchParams.securityId || searchParams.securityId === "0"
          ? null
          : searchParams.securityId,
      status: null,
      docType: searchParams.docType ?? "0",
      orgIssuedId: "",
      createFromNgb:
        searchParams.createFrom && searchParams.createFrom !== ""
          ? (() => {
              const d = new Date(searchParams.createFrom);
              return {
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                day: d.getDate(),
              };
            })()
          : { year: null, month: null, day: null },
      createToNgb:
        searchParams.createTo && searchParams.createTo !== ""
          ? (() => {
              const d = new Date(searchParams.createTo);
              return {
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                day: d.getDate(),
              };
            })()
          : { year: null, month: null, day: null },
      dateIssuedFromNgb:
        searchParams.dateIssuedFrom && searchParams.dateIssuedFrom !== ""
          ? (() => {
              const d = new Date(searchParams.dateIssuedFrom);
              return {
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                day: d.getDate(),
              };
            })()
          : { year: null, month: null, day: null },
      dateIssuedToNgb:
        searchParams.dateIssuedTo && searchParams.dateIssuedTo !== ""
          ? (() => {
              const d = new Date(searchParams.dateIssuedTo);
              return {
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                day: d.getDate(),
              };
            })()
          : { year: null, month: null, day: null },
      dateArrivalFromNgb:
        searchParams.dateArrivalFrom && searchParams.dateArrivalFrom !== ""
          ? (() => {
              const d = new Date(searchParams.dateArrivalFrom);
              return {
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                day: d.getDate(),
              };
            })()
          : { year: null, month: null, day: null },
      dateArrivalToNgb:
        searchParams.dateArrivalTo && searchParams.dateArrivalTo !== ""
          ? (() => {
              const d = new Date(searchParams.dateArrivalTo);
              return {
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                day: d.getDate(),
              };
            })()
          : { year: null, month: null, day: null },
      dateReceivedFromNgb:
        searchParams.dateReceivedFrom && searchParams.dateReceivedFrom !== ""
          ? (() => {
              const d = new Date(searchParams.dateReceivedFrom);
              return {
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                day: d.getDate(),
              };
            })()
          : { year: null, month: null, day: null },
      dateReceivedToNgb:
        searchParams.dateReceivedTo && searchParams.dateReceivedTo !== ""
          ? (() => {
              const d = new Date(searchParams.dateReceivedTo);
              return {
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                day: d.getDate(),
              };
            })()
          : { year: null, month: null, day: null },
      issuedDateToNgb: {
        year: null,
        month: null,
        day: null,
      },
      issuedDateFromNgb: {
        year: null,
        month: null,
        day: null,
      },
      createFrom: searchParams.createFrom ?? "",
      createTo: searchParams.createTo ?? "",
      dateArrivalFrom: searchParams.dateArrivalFrom ?? "",
      dateArrivalTo: searchParams.dateArrivalTo ?? "",
      dateReceivedFrom: searchParams.dateReceivedFrom ?? "",
      dateReceivedTo: searchParams.dateReceivedTo ?? "",
      dateIssuedFrom: searchParams.dateIssuedFrom ?? "",
      dateIssuedTo: searchParams.dateIssuedTo ?? "",
      numberOrSign: searchParams.numberOrSign ?? "",
      preview: searchParams.preview ?? "",
      placeSendId:
        !searchParams.placeSendId || searchParams.placeSendId === "0"
          ? null
          : searchParams.placeSendId,
    }),
    [searchParams]
  );
  const {
    data: currentData,
    isLoading,
    error,
  } = useGetAttachedDocumentQuery(advanceParams, currentPage, isOpen && !isV2);

  const {
    data: currentDataV2,
    isLoading: isLoadingV2,
    error: errorV2,
  } = useGetAttachedDocumentQueryV2(advanceParams, currentPage, isOpen && isV2);

  const handleSubmit = useCallback(() => {
    setData(localSelect);
    handleSearchReset();
    onClose();
  }, [localSelect, setData, onClose]);

  const handleToggle = useCallback(
    (value: AttachedDocument, checked: boolean) => {
      if (checked) {
        setLocalSelect((prev) => [...prev, value]);
      } else {
        setLocalSelect((prev) => prev.filter((item) => item !== value));
      }
    },
    []
  );

  const handleDateChange = (name: string, date: string) => {
    setTmpSearchParams((prev) => ({ ...prev, [name]: date }));
  };

  const handleSearchSubmit = () => {
    setSearchParams((prev) => ({
      ...prev,
      ...tmpSearchParams,
    }));
  };

  const handleSearchReset = () => {
    setCurrentPage(1);
    setSearchParams(defaultSearchState);
    setTmpSearchParams(defaultSearchState);
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns: Column<AttachedDocument>[] = useMemo(
    () => [
      {
        header: "STT",
        className: "text-center py-2 w-16",
        accessor: (_: AttachedDocument, index: number) => (
          <div className="flex items-center justify-center">
            <span className="text-xs font-medium">
              {(currentPage - 1) * itemsPerPage + index + 1}
            </span>
          </div>
        ),
      },
      {
        header: "Số ký hiệu",
        className: "text-center py-2 px-3",
        accessor: (item: AttachedDocument) => (
          <div className="flex items-center justify-center">
            <span className="text-xs font-medium">{item.numberOrSign}</span>
          </div>
        ),
      },
      {
        header: "Trích yếu",
        className: "text-center py-2 px-3",
        accessor: (item: AttachedDocument) => (
          <div className="flex items-center justify-center">
            <span className="text-xs font-medium">{item.preview}</span>
          </div>
        ),
      },
      {
        header: "Đơn vị",
        className: "text-center py-2 px-3",
        accessor: (item: AttachedDocument) => (
          <div className="flex items-center justify-center">
            <span className="text-xs font-medium">{item.orgName}</span>
          </div>
        ),
      },
      {
        header: "Loại văn bản",
        className: "text-center py-2 px-3",
        accessor: (item: AttachedDocument) => (
          <div className="flex items-center justify-center">
            <span className="text-xs font-medium">{item.docTypeName}</span>
          </div>
        ),
      },
      {
        header: "Chọn",
        className: "text-center py-2 w-20",
        accessor: (item: AttachedDocument) => (
          <div className="flex items-center justify-center">
            <Input
              type="checkbox"
              className="w-4 h-4"
              checked={localSelect.includes(item)}
              onChange={(e) => {
                handleToggle(item, e.target.checked);
              }}
            />
          </div>
        ),
      },
    ],
    [localSelect, handleToggle]
  );

  const tableData = useMemo(() => {
    if (isV2) {
      // V2 API might return objList or content
      return currentDataV2?.objList ?? currentDataV2?.content ?? [];
    } else {
      // V1 API returns content
      return currentData?.content ?? [];
    }
  }, [isV2, currentData, currentDataV2]);

  const totalItems = useMemo(() => {
    if (isV2) {
      // V2 API might return totalRecord or totalElements
      return currentDataV2?.totalRecord ?? currentDataV2?.totalElements ?? 0;
    } else {
      // V1 API returns totalElements
      return currentData?.totalElements ?? 0;
    }
  }, [isV2, currentData, currentDataV2]);

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      handleSearchReset();
      setLocalSelect(data ?? []);
      setShowAdvanced(false);
    }
  }, [isOpen, data]);

  // ---------- Tạo component Section cho search Ẩn/Hiện ----------
  const SearchSection = useMemo(
    () => (
      <div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Trích yếu */}
          <div className="flex flex-col">
            <Label className="text-sm font-semibold text-gray-800 mb-2">
              Trích yếu
            </Label>
            <div className="relative">
              <Input
                type="text"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTmpSearchParams((prev) => ({
                    ...prev,
                    preview: e.target.value,
                  }))
                }
                value={tmpSearchParams.preview}
                placeholder="Trích yếu"
              />
            </div>
          </div>
          {/* Số ký hiệu */}
          <div className="flex flex-col">
            <Label className="text-sm font-semibold text-gray-800 mb-2">
              Số ký hiệu
            </Label>
            <div className="relative">
              <Input
                type="text"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTmpSearchParams((prev) => ({
                    ...prev,
                    numberOrSign: e.target.value,
                  }))
                }
                value={tmpSearchParams.numberOrSign}
                placeholder="Số ký hiệu"
              />
            </div>
          </div>
          {/* Loại văn bản */}
          <div className="flex flex-col">
            <Label className="text-sm font-semibold text-gray-800 mb-2">
              Loại văn bản
            </Label>
            <div className="relative">
              <SelectCustom
                value={tmpSearchParams.docType ?? ""}
                options={[
                  {
                    label: "Văn bản đến",
                    value: "0",
                  },
                  {
                    label: "Văn bản đi",
                    value: "1",
                  },
                ]}
                onChange={(value: string | string[]) =>
                  setTmpSearchParams((prev) => ({
                    ...prev,
                    docType: value.toString(),
                  }))
                }
              />
            </div>
          </div>
          {/* Lĩnh vực */}
          <div className="flex flex-col">
            <Label className="text-sm font-semibold text-gray-800 mb-2">
              Lĩnh vực
            </Label>
            <div className="relative">
              <SelectCustom
                value={tmpSearchParams.docFieldsId ?? "0"}
                options={[
                  { label: "--Chọn--", value: "0" },
                  ...(docFieldsCategoryData?.map((item: CategoryCode) => ({
                    label: item.name,
                    value: item.id.toString(),
                  })) ?? []),
                ]}
                onChange={(value: string | string[]) =>
                  setTmpSearchParams((prev) => ({
                    ...prev,
                    docFieldsId: value.toString(),
                  }))
                }
              />
            </div>
          </div>
          {/* Độ khẩn */}
          <div className="flex flex-col">
            <Label className="text-sm font-semibold text-gray-800 mb-2">
              Độ khẩn
            </Label>
            <div className="relative">
              <SelectCustom
                value={tmpSearchParams.urgentId ?? "0"}
                options={[
                  { label: "--Chọn--", value: "0" },
                  ...(urgentCategoryData?.map((item: CategoryCode) => ({
                    label: item.name,
                    value: item.id.toString(),
                  })) ?? []),
                ]}
                onChange={(value: string | string[]) => {
                  setTmpSearchParams((prev) => ({
                    ...prev,
                    urgentId: value.toString(),
                  }));
                }}
              />
            </div>
          </div>
          {/* Độ mật */}
          <div className="flex flex-col">
            <Label className="text-sm font-semibold text-gray-800 mb-2">
              Độ mật
            </Label>
            <div className="relative">
              <SelectCustom
                value={tmpSearchParams.securityId ?? "0"}
                options={[
                  { label: "--Chọn--", value: "0" },
                  ...(securityCategoryData?.map((item: CategoryCode) => ({
                    label: item.name,
                    value: item.id.toString(),
                  })) ?? []),
                ]}
                onChange={(value: string | string[]) => {
                  setTmpSearchParams((prev) => ({
                    ...prev,
                    securityId: value.toString(),
                  }));
                }}
              />
            </div>
          </div>
          {/* Trạng thái */}
          <div className="flex flex-col">
            <Label className="text-sm font-semibold text-gray-800 mb-2">
              Trạng thái
            </Label>
            <div className="relative">
              <SelectCustom
                value={tmpSearchParams.docStatusId ?? "0"}
                options={[
                  { label: "--Chọn--", value: "0" },
                  ...(docStatusOptions?.map((item) => ({
                    label: item.label,
                    value: item.value.toString(),
                  })) ?? []),
                ]}
                onChange={(value: string | string[]) => {
                  setTmpSearchParams((prev) => ({
                    ...prev,
                    docStatusId: value.toString(),
                  }));
                }}
              />
            </div>
          </div>
          {/* Nơi gửi, chỉ hiện khi showAdvanced */}
          {showAdvanced && (
            <div className="flex flex-col">
              <Label className="text-sm font-semibold text-gray-800 mb-2">
                Nơi gửi
              </Label>
              <div className="relative">
                <SelectCustom
                  value={tmpSearchParams.placeSendId ?? "0"}
                  options={[
                    { label: "--Chọn--", value: "0" },
                    ...(orgSendCategoryData?.map((item: CategoryCode) => ({
                      label: item.name,
                      value: item.id.toString(),
                    })) ?? []),
                  ]}
                  onChange={(value: string | string[]) => {
                    setTmpSearchParams((prev) => ({
                      ...prev,
                      placeSendId: value.toString(),
                    }));
                  }}
                />
              </div>
            </div>
          )}
          {/* Ngày văn bản từ ngày/đến ngày, chỉ hiện khi showAdvanced */}
          {showAdvanced && (
            <>
              <div className="flex flex-col">
                <Label className="text-sm font-semibold text-gray-800 mb-2">
                  Ngày văn bản, từ ngày
                </Label>
                <div className="relative">
                  <CustomDatePicker
                    selected={
                      tmpSearchParams.dateArrivalFrom
                        ? parseDateStringYMD(tmpSearchParams.dateArrivalFrom)
                        : null
                    }
                    onChange={(date) => {
                      setTmpSearchParams((prev) => ({
                        ...prev,
                        dateArrivalFrom: formatDateYMD(date),
                      }));
                    }}
                    placeholder="dd/mm/yyyy"
                    className="h-9"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <Label className="text-sm font-semibold text-gray-800 mb-2">
                  đến ngày
                </Label>
                <div className="relative">
                  <CustomDatePicker
                    selected={
                      tmpSearchParams.dateArrivalTo
                        ? parseDateStringYMD(tmpSearchParams.dateArrivalTo)
                        : null
                    }
                    onChange={(date) => {
                      setTmpSearchParams((prev) => ({
                        ...prev,
                        dateArrivalTo: formatDateYMD(date),
                      }));
                    }}
                    placeholder="dd/mm/yyyy"
                    className="h-9"
                    min={tmpSearchParams.dateArrivalFrom || undefined}
                  />
                </div>
              </div>
            </>
          )}
          {/* Ngày vào sổ từ ngày/đến ngày, chỉ hiện khi showAdvanced */}
          {showAdvanced && (
            <>
              <div className="flex flex-col">
                <Label className="text-sm font-semibold text-gray-800 mb-2">
                  Ngày vào sổ, từ ngày
                </Label>
                <div className="relative">
                  <CustomDatePicker
                    selected={
                      tmpSearchParams.dateIssuedFrom
                        ? parseDateStringYMD(tmpSearchParams.dateIssuedFrom)
                        : null
                    }
                    onChange={(date) => {
                      setTmpSearchParams((prev) => ({
                        ...prev,
                        dateIssuedFrom: formatDateYMD(date),
                      }));
                    }}
                    placeholder="dd/mm/yyyy"
                    className="h-9"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <Label className="text-sm font-semibold text-gray-800 mb-2">
                  đến ngày
                </Label>
                <div className="relative">
                  <CustomDatePicker
                    selected={
                      tmpSearchParams.dateIssuedTo
                        ? parseDateStringYMD(tmpSearchParams.dateIssuedTo)
                        : null
                    }
                    onChange={(date) => {
                      setTmpSearchParams((prev) => ({
                        ...prev,
                        dateIssuedTo: formatDateYMD(date),
                      }));
                    }}
                    placeholder="dd/mm/yyyy"
                    className="h-9"
                    min={tmpSearchParams.dateIssuedFrom || undefined}
                  />
                </div>
              </div>
            </>
          )}
          {/* Ngày nhận văn bản từ ngày/đến ngày, chỉ hiện khi showAdvanced */}
          {showAdvanced && (
            <>
              <div className="flex flex-col">
                <Label className="text-sm font-semibold text-gray-800 mb-2">
                  Ngày nhận văn bản, từ ngày
                </Label>
                <div className="relative">
                  <CustomDatePicker
                    selected={
                      tmpSearchParams.dateReceivedFrom
                        ? parseDateStringYMD(tmpSearchParams.dateReceivedFrom)
                        : null
                    }
                    onChange={(date) => {
                      setTmpSearchParams((prev) => ({
                        ...prev,
                        dateReceivedFrom: formatDateYMD(date),
                      }));
                    }}
                    placeholder="dd/mm/yyyy"
                    className="h-9"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <Label className="text-sm font-semibold text-gray-800 mb-2">
                  đến ngày
                </Label>
                <div className="relative">
                  <CustomDatePicker
                    selected={
                      tmpSearchParams.dateReceivedTo
                        ? parseDateStringYMD(tmpSearchParams.dateReceivedTo)
                        : null
                    }
                    onChange={(date) => {
                      setTmpSearchParams((prev) => ({
                        ...prev,
                        dateReceivedTo: formatDateYMD(date),
                      }));
                    }}
                    placeholder="dd/mm/yyyy"
                    className="h-9"
                    min={tmpSearchParams.dateReceivedFrom || undefined}
                  />
                </div>
              </div>
            </>
          )}
        </div>
        {/* Button search - center below form */}
        <div className="w-full flex justify-center mt-5">
          <Button
            onClick={handleSearchSubmit}
            size="sm"
            className="h-9 px-3 text-sm bg-blue-600 hover:bg-blue-700"
          >
            Tìm kiếm
          </Button>
        </div>
      </div>
    ),
    [
      tmpSearchParams,
      docFieldsCategoryData,
      urgentCategoryData,
      securityCategoryData,
      docStatusCategoryData,
      orgSendCategoryData,
      docTypeCategoryData,
      handleDateChange,
      showAdvanced,
    ]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <CustomDialogContent
        className="sm:max-w-5xl max-h-[95vh] p-0 flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center mr-2">
                Lựa chọn văn bản đính kèm
              </DialogTitle>
              <Button
                variant="outline"
                onClick={() => setShowAdvanced((prev) => !prev)}
                className="flex items-center gap-1 h-7 w-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors hover:text-white"
                aria-label={
                  showAdvanced ? "Ẩn thêm điều kiện" : "Hiện thêm điều kiện"
                }
                type="button"
              >
                {showAdvanced ? (
                  <>
                    <Minus className="w-2 h-2" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    <Plus className="w-2 h-2" aria-hidden="true" />
                  </>
                )}
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex items-center gap-1 h-9 px-3 text-xs text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-md font-medium transition-colors"
                aria-label="Đóng"
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 min-h-0 max-h-[calc(95vh-56px-56px)] px-0 py-4 overflow-y-auto">
          <div className="flex flex-col space-y-4">
            {/* Search Section */}
            {SearchSection}

            {/* Table Section with auto height */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <Table
                sortable={true}
                columns={columns}
                dataSource={tableData as AttachedDocument[]}
                totalItems={totalItems}
                loading={isLoading || isLoadingV2}
                showPagination={true}
                emptyText={
                  isLoading || isLoadingV2
                    ? "Đang tải dữ liệu..."
                    : error || errorV2
                      ? `Lỗi: ${error?.message || errorV2?.message}`
                      : "Không tồn tại văn bản đính kèm"
                }
                showPageSize={false}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="p-4 justify-end gap-2 shrink-0">
          <Button
            onClick={handleSubmit}
            size="sm"
            className="h-9 px-3 text-sm bg-blue-600 hover:bg-blue-700"
          >
            <FileCheck className="w-4 h-4 mr-2" />
            Đồng ý
          </Button>
        </DialogFooter>
      </CustomDialogContent>
    </Dialog>
  );
}
