"use client";

import { formatDateVN } from "@/utils/datetime.utils";
import { Building, Users, Star, Paperclip } from "lucide-react";
import { Button } from "../ui/button";
import { Table } from "../ui/table";
import { canViewNoStatus, transformText } from "@/utils/common.utils";
import { Constant } from "@/definitions/constants/constant";

interface DocumentSyncTableProps {
  searchDocuments?: any[];
  loading?: boolean;
  paging?: {
    totalRecord: number;
    currentPage: number;
  };
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onViewDocument?: (document: any) => void;
  onDownloadFile?: (fileName: any, encrypt: boolean) => void;
  onViewFile?: (file: any) => void;
  onAttachmentInfo?: (document: any) => void;
  onSort?: (field: string) => void;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  onChangeImportantStatus?: (document: any) => void;
}

export default function DocumentSyncTable({
  searchDocuments = [],
  loading = false,
  paging = { totalRecord: 0, currentPage: 1 },
  itemsPerPage = 10,
  onPageChange,
  onPageSizeChange,
  onViewDocument,
  onDownloadFile,
  onViewFile,
  onAttachmentInfo,
  onSort,
  sortBy,
  sortDirection = "ASC",
  onChangeImportantStatus,
}: DocumentSyncTableProps) {
  const isView = (fileName: string) => {
    return canViewNoStatus(fileName);
  };

  const columns = [
    {
      header: "STT",
      accessor: (item: any, index: number) => (
        <span className="text-center">
          {paging.currentPage * itemsPerPage - itemsPerPage + index + 1}
        </span>
      ),
    },
    {
      header: (
        <div className="flex items-center justify-center">
          <Star className="w-4 h-4" />
        </div>
      ),
      accessor: (item: any) => (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onChangeImportantStatus?.(item);
            }}
            className="cursor-pointer"
          >
            {item.important ? (
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            ) : (
              <Star className="w-4 h-4 text-gray-500" />
            )}
          </Button>
        </div>
      ),
    },
    {
      header: "Số đi",
      accessor: (item: any) => (
        <span
          className="text-center cursor-pointer text-black hover:text-blue-600 hover:underline"
          onClick={() => onViewDocument?.(item)}
        >
          {item.numberInBook}
        </span>
      ),
    },
    {
      header: (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => onSort?.("NUMBERSIGN")}
        >
          <span>Số/Ký hiệu</span>
          {sortBy === "NUMBERSIGN" && (
            <span>{sortDirection === "ASC" ? "↑" : "↓"}</span>
          )}
        </div>
      ),
      accessor: (item: any) => (
        <span
          className="text-center cursor-pointer text-black hover:text-blue-600 hover:underline"
          onClick={() => onViewDocument?.(item)}
        >
          {item.numberOrSign?.indexOf(item.numberInBook) >= 0
            ? item.numberOrSign
            : item.numberInBook + " " + item.numberOrSign}
        </span>
      ),
    },
    {
      header: "Ngày ban hành",
      accessor: (item: any) => (
        <span
          className="text-center cursor-pointer text-black hover:text-blue-600 hover:underline"
          onClick={() => onViewDocument?.(item)}
        >
          {formatDateVN(new Date(item.dateIssued))}
        </span>
      ),
    },
    {
      header: (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => onSort?.("PREVIEW")}
        >
          <span>Trích yếu</span>
          {sortBy === "PREVIEW" && (
            <span>{sortDirection === "ASC" ? "↑" : "↓"}</span>
          )}
        </div>
      ),
      accessor: (item: any) => (
        <div
          className="cursor-pointer text-black hover:text-blue-600 hover:underline"
          title={item.preview}
          onClick={() => onViewDocument?.(item)}
        >
          {transformText(item.preview, 120)}
        </div>
      ),
    },
    {
      header: (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => onSort?.("USER_ENTER")}
        >
          <span>Đơn vị soạn thảo</span>
          {sortBy === "USER_ENTER" && (
            <span>{sortDirection === "ASC" ? "↑" : "↓"}</span>
          )}
        </div>
      ),
      accessor: (item: any) => (
        <span
          className="text-center cursor-pointer text-black hover:text-blue-600 hover:underline"
          onClick={() => onViewDocument?.(item)}
        >
          {item.orgCreateName}
        </span>
      ),
    },
    {
      header: "Đơn vị ban hành",
      accessor: (item: any) => (
        <span
          className="text-center cursor-pointer text-black hover:text-blue-600 hover:underline"
          onClick={() => onViewDocument?.(item)}
        >
          {item.orgIssuedName}
        </span>
      ),
    },
    {
      header: "Người tạo",
      accessor: (item: any) => (
        <span
          className="text-center cursor-pointer text-black hover:text-blue-600 hover:underline"
          onClick={() => onViewDocument?.(item)}
        >
          {item.personEnter}
        </span>
      ),
    },
    {
      header: "Người ký",
      accessor: (item: any) => (
        <span
          className="text-center cursor-pointer text-black hover:text-blue-600 hover:underline"
          onClick={() => onViewDocument?.(item)}
        >
          {item.signerName}
        </span>
      ),
    },
    {
      header: "File",
      accessor: (item: any) => {
        const attachDrafts = item.attachments.filter(
          (attach: any) =>
            attach.attachmentType == Constant.DOCUMENT_IN_FILE_TYPE.DRAFT
        );
        return (
          <div className="text-center">
            {attachDrafts?.length === 1 &&
              item.docStatusEnum !== "THU_HOI_XL" &&
              item.docStatusEnum !== "THU_HOI_BH" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isView(attachDrafts[0].name)) {
                      onViewFile?.(attachDrafts[0]);
                    } else {
                      onDownloadFile?.(
                        attachDrafts[0].name,
                        attachDrafts[0].encrypt
                      );
                    }
                  }}
                  className="text-yellow-600 hover:text-yellow-800"
                  title={attachDrafts[0].displayName}
                >
                  <Paperclip className="w-4 h-4 text-blue-600" />
                </Button>
              )}
            {attachDrafts?.length > 1 &&
              item.docStatusEnum !== "THU_HOI_XL" &&
              item.docStatusEnum !== "THU_HOI_BH" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAttachmentInfo?.(attachDrafts);
                  }}
                  className="text-yellow-600 hover:text-yellow-800"
                  title={`${attachDrafts.length} files`}
                >
                  <Paperclip className="w-4 h-4 text-blue-600" />
                </Button>
              )}
          </div>
        );
      },
    },
    {
      header: "Nơi nhận",
      accessor: (item: any) => (
        <div className="text-left">
          {item.listReceive?.map((receive: any, index: number) => (
            <div key={index} className="inline-block my-1 mr-2">
              <span
                className="inline-flex items-center text-black cursor-pointer hover:text-blue-600 hover:underline"
                onClick={() => onViewDocument?.(item)}
              >
                {receive.type === "ORG" ? (
                  <Building className="w-3 h-3 mr-1" />
                ) : (
                  <Users className="w-3 h-3 mr-1" />
                )}
                {receive.orgName}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      header: "Nơi nhận bên ngoài",
      accessor: (item: any) => (
        <div className="text-center">
          {item.outsideReceives?.map((receive: any, index: number) => (
            <div key={index} className="inline-block my-1">
              <span
                className="text-black cursor-pointer hover:text-blue-600 hover:underline"
                onClick={() => onViewDocument?.(item)}
              >
                {receive.address}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      header: (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => onSort?.("STATUS")}
        >
          <span>Trạng thái</span>
          {sortBy === "STATUS" && (
            <span>{sortDirection === "ASC" ? "↑" : "↓"}</span>
          )}
        </div>
      ),
      accessor: (item: any) => (
        <span
          className="text-center cursor-pointer text-black hover:text-blue-600 hover:underline"
          onClick={() => onViewDocument?.(item)}
        >
          {item.status}
        </span>
      ),
    },
  ];

  return (
    <div className="mt-4">
      <Table
        columns={columns}
        dataSource={searchDocuments}
        loading={loading}
        emptyText="Không tồn tại văn bản"
        onRowClick={onViewDocument}
        showPagination={searchDocuments.length > 0}
        currentPage={paging.currentPage}
        totalItems={paging.totalRecord}
        onPageChange={onPageChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={onPageSizeChange}
      />
    </div>
  );
}
