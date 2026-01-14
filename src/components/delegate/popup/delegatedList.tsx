"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  CustomDialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { File, X, Download } from "lucide-react";
import { getFileSizeString } from "@/utils/file.utils";
import { FileService } from "@/utils/file.utils";
import { Constant } from "@/definitions/constants/constant";
import { Table } from "@/components/ui/table";
import DailyReportAttachmentInfo from "@/components/daily-report/DailyReportAttachmentInfo";

// Define DelegatedUser interface based on Angular code
interface DelegatedUser {
  id: string;
  fullName: string;
  endDate: string;
  attachments?: Attachment[];
  isChecked?: boolean;
  // Additional fields that might be used in Out scenarios
  numberOrSign?: string;
  fromUserName?: string;
  startDate?: string;
}

interface Attachment {
  name: string;
  displayName: string;
  encrypt?: boolean;
  size?: number;
}

interface DelegatedListProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  delegatedUserList: DelegatedUser[];
  personHandleType: number;
  onSelect: (result: {
    delegatedUser: DelegatedUser | null;
    personHandleType: number;
  }) => void;
  title?: string;
  showSorting?: boolean;
  showPagination?: boolean;
  pageSize?: number;
  delegateType?: "IN" | "OUT";
}

export default function DelegatedList({
  isOpen,
  onOpenChange,
  delegatedUserList,
  personHandleType,
  onSelect,
  title = "Danh sách người được ủy quyền",
  showSorting = false,
  showPagination = false,
  pageSize = 10,
  delegateType = "IN",
}: DelegatedListProps) {
  const [selectedUser, setSelectedUser] = useState<DelegatedUser | null>(null);
  const [localUserList, setLocalUserList] = useState<DelegatedUser[]>([]);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>(
    []
  );

  React.useEffect(() => {
    if (isOpen) {
      const resetList = delegatedUserList.map((user) => ({
        ...user,
        isChecked: false,
      }));
      setLocalUserList(resetList);
      setSelectedUser(null);
    }
  }, [isOpen, delegatedUserList]);

  const handleClose = (isChoose: boolean = true) => {
    if (isChoose) {
      onSelect({
        delegatedUser: selectedUser,
        personHandleType: personHandleType,
      });
    }
    onOpenChange(false);
  };

  const selectDelegateUser = (item: DelegatedUser) => {
    const updatedList = localUserList.map((user) => {
      if (user.id === item.id) {
        if (user.isChecked) {
          setSelectedUser(null);
          return { ...user, isChecked: false };
        } else {
          setSelectedUser(user);
          return { ...user, isChecked: true };
        }
      } else {
        return { ...user, isChecked: false };
      }
    });

    setLocalUserList(updatedList);
  };

  const isView = (fileName: string): boolean => {
    return FileService.isViewFile(fileName);
  };

  const viewFile = (fileName: string) => {
    const downloadType =
      delegateType === "OUT"
        ? Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT
        : Constant.ATTACHMENT_DOWNLOAD_TYPE.DELEGATE;

    FileService.viewFile({ name: fileName }, downloadType);
  };

  const downloadFile = (fileName: string, encrypt?: boolean) => {
    const downloadType =
      delegateType === "OUT"
        ? Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT
        : Constant.ATTACHMENT_DOWNLOAD_TYPE.DELEGATE;

    FileService.downloadFile(fileName, downloadType, encrypt || false);
  };

  const doOpenAttachmentInfo = (attachments: Attachment[]) => {
    setSelectedAttachments(attachments || []);
    setShowAttachmentModal(true);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const showNumberOrSign =
    delegateType === "OUT" && localUserList.some((user) => user.numberOrSign);
  const showFromUserName =
    delegateType === "OUT" && localUserList.some((user) => user.fromUserName);
  const showStartDate =
    delegateType === "OUT" && localUserList.some((user) => user.startDate);

  const columns = [
    {
      header: "STT",
      className: "text-center w-16",
      accessor: (item: DelegatedUser, index: number) => (
        <div className="flex items-center justify-center gap-2">
          <span>{index + 1}</span>
          <Checkbox
            checked={item.isChecked || false}
            onCheckedChange={() => selectDelegateUser(item)}
          />
        </div>
      ),
    },
    ...(showNumberOrSign
      ? [
          {
            header: "Số văn bản ủy quyền",
            className: "text-center",
            accessor: (item: DelegatedUser) => item.numberOrSign || "-",
          },
        ]
      : []),
    ...(showFromUserName
      ? [
          {
            header: "Người ủy quyền",
            className: "text-center",
            accessor: (item: DelegatedUser) => item.fromUserName || "-",
          },
        ]
      : []),
    {
      header: "Người được ủy quyền",
      className: "text-center",
      accessor: (item: DelegatedUser) => item.fullName,
    },
    ...(showStartDate
      ? [
          {
            header: "Ngày bắt đầu",
            className: "text-center",
            accessor: (item: DelegatedUser) => formatDate(item.startDate || ""),
          },
        ]
      : []),
    {
      header: "Ngày kết thúc",
      className: "text-center",
      accessor: (item: DelegatedUser) => formatDate(item.endDate),
    },
    {
      header: "Đính kèm",
      className: "text-center",
      accessor: (item: DelegatedUser) => {
        if (item.attachments && item.attachments.length > 0) {
          if (item.attachments.length === 1) {
            return (
              <Button
                variant="ghost"
                size="sm"
                className="hover:text-yellow-600 cursor-pointer"
                onClick={() => {
                  const attachment = item.attachments![0];
                  if (isView(attachment.name)) {
                    viewFile(attachment.name);
                  } else {
                    downloadFile(attachment.name, attachment.encrypt);
                  }
                }}
                title={item.attachments[0].displayName}
              >
                <File className="w-4 h-4" />
              </Button>
            );
          } else {
            return (
              <Button
                variant="ghost"
                size="sm"
                className="hover:text-yellow-600 cursor-pointer"
                onClick={() => doOpenAttachmentInfo(item.attachments!)}
                title={`${item.attachments.length} files`}
              >
                <File className="w-4 h-4" />
              </Button>
            );
          }
        }
        return "-";
      },
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={() => handleClose(false)}>
      <CustomDialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-blue-600 text-white -m-6 mb-0 p-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-white">{title}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleClose(false)}
              className="text-white hover:bg-blue-700 p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Table
            columns={columns}
            dataSource={localUserList}
            showPagination={false}
            emptyText="Không tồn tại dữ liệu"
            className="border-0"
          />
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            onClick={() => handleClose(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Chọn
          </Button>
        </DialogFooter>
        {showAttachmentModal && (
          <DailyReportAttachmentInfo
            attachments={selectedAttachments as any}
            isOpen={showAttachmentModal}
            onOpenChange={(open) => {
              setShowAttachmentModal(open);
              if (!open) {
                setSelectedAttachments([]);
              }
            }}
            constant={
              delegateType === "OUT"
                ? Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT
                : Constant.ATTACHMENT_DOWNLOAD_TYPE.DELEGATE
            }
          />
        )}
      </CustomDialogContent>
    </Dialog>
  );
}
