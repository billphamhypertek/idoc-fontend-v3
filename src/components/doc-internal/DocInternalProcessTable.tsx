"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileService, isView as canViewFile } from "@/utils/file.utils";
import { Constant } from "@/definitions/constants/constant";

enum ApproveType {
  SIGNER = "SIGNER",
  USER = "USER",
  ORG = "ORG",
  COMMENTER = "COMMENTER",
}

enum ApproveStatus {
  CHO_DUYET = "CHO_DUYET",
  DA_DUYET = "DA_DUYET",
}

type CommentItem = {
  userFullName?: string;
  createDate?: string;
  comment?: string;
  handleStatus?: string;
  handleStatusName?: string;
  internalAttachments?: Array<{
    id: number;
    name: string;
    displayName: string;
    encrypt?: boolean;
  }>;
};

type ApproverItem = {
  id?: number;
  type?: ApproveType | string;
  userId?: number;
  userFullName?: string;
  orgId?: number;
  orgName?: string;
  handleStatus?: ApproveStatus | string;
  listCmt?: CommentItem[];
};

type ReceiverItem = {
  parent?: any;
  child?: number;
  name?: string;
  type?: "ORG" | "USER";
  listCmt?: CommentItem[];
};

type DocInternalProcessTableProps = {
  listApprover?: ApproverItem[];
  mainChecked?: ReceiverItem[];
  toKnowCheck?: ReceiverItem[];
  docInternal?: any;
  currentUserId?: number;
  isPerformer?: boolean;
  onClickFile?: (file: any, showPopup: boolean) => void;
  onOpenShare?: (file: any) => void;
  onViewFile: (file: any) => void;
};

const DocInternalProcessTable: React.FC<DocInternalProcessTableProps> = ({
  listApprover = [],
  mainChecked = [],
  toKnowCheck = [],
  docInternal,
  currentUserId,
  isPerformer = false,
  onClickFile,
  onOpenShare,
  onViewFile,
}) => {
  const getNamePersonOrOrg = (item: ApproverItem) => {
    if (item.type === ApproveType.SIGNER) {
      return `Người ký: ${item.userFullName}`;
    }

    if (item.type === ApproveType.USER) {
      return `Người duyệt: ${item.userFullName}`;
    }

    return `Người cho ý kiến: ${item.type === ApproveType.ORG ? item.orgName : item.userFullName}`;
  };

  const getIconClassByStatus = (item: ApproverItem) => {
    if (item.handleStatus !== ApproveStatus.CHO_DUYET) {
      return "fa fa-check-circle text-success";
    } else if (
      item.type === ApproveType.SIGNER ||
      item.type === ApproveType.USER
    ) {
      return "fa fa-user";
    } else {
      return "fa fa-building";
    }
  };

  const checkCanViewIdea = (item: ApproverItem): boolean => {
    if (
      docInternal?.createBy === currentUserId ||
      item.userId === currentUserId ||
      isPerformer
    ) {
      return true;
    }
    return false;
  };

  const getPersonReceived = (list: ReceiverItem[], type: string) => {
    let listReceiver = "";
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      if (element.type === "USER") {
        listReceiver +=
          listReceiver === "" ? element.name : `, ${element.name}`;
      }
      if (element.type === "ORG") {
        listReceiver +=
          listReceiver === "" ? element.name : `, ${element.name}`;
      }
    }
    return `${type}: ${listReceiver}`;
  };

  const handleClickFile = async (file: any, showPopup: boolean = false) => {
    if (onClickFile) {
      onClickFile(file, showPopup);
      return;
    }

    try {
      if (canViewFile(file)) {
        await FileService.viewFile(
          { name: file.name, id: String(file.id), encrypt: file.encrypt },
          Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL
        );
      } else {
        await FileService.downloadFile(
          String(file.id || file.name),
          Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL,
          !!file.encrypt,
          null,
          String(file.id || null)
        );
      }
    } catch (e) {
      // handled
    }
  };

  if (
    (!listApprover || listApprover.length === 0) &&
    (!mainChecked || mainChecked.length === 0) &&
    (!toKnowCheck || toKnowCheck.length === 0)
  ) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Quá trình cho ý kiến</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm border-collapse">
            <thead style={{ backgroundColor: "#E6F1FC" }}>
              <tr>
                <th className="border px-3 py-2 text-center w-12">#</th>
                <th className="border px-3 py-2 text-center w-1/3">
                  Người cho ý kiến
                </th>
                <th className="border px-3 py-2 text-center">
                  Nội dung cho ý kiến
                </th>
              </tr>
            </thead>
            <tbody>
              {/* List Approver rows */}
              {listApprover.map((item, idx) => (
                <tr key={`approver-${idx}`} className="hover:bg-gray-50">
                  <td className="border px-3 py-2 text-center">
                    <i className={getIconClassByStatus(item)} />
                  </td>
                  <td className="border px-3 py-2">
                    <span>{getNamePersonOrOrg(item)}</span>
                  </td>
                  <td className="border px-3 py-2">
                    {item.listCmt && item.listCmt.length > 0 && (
                      <div className="space-y-3">
                        {item.listCmt.map((cmt, cmtIdx) => (
                          <div key={cmtIdx}>
                            <div className="mb-1">
                              <span className="font-semibold mr-2">
                                {cmt.userFullName}
                              </span>
                              <span className="text-gray-500 text-xs mr-2">
                                {cmt.createDate
                                  ? new Date(cmt.createDate).toLocaleString(
                                      "vi-VN",
                                      {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )
                                  : ""}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-white text-xs ${
                                  cmt.handleStatus === ApproveStatus.DA_DUYET
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              >
                                {item.type !== ApproveType.USER
                                  ? "Đã cho ý kiến"
                                  : cmt.handleStatusName}
                              </span>
                            </div>
                            <div className="text-gray-800">
                              {isPerformer ||
                              docInternal?.createBy === currentUserId ||
                              item.userId === currentUserId
                                ? cmt.comment
                                : "Đã cho ý kiến"}
                            </div>
                            {Array.isArray(cmt.internalAttachments) &&
                              cmt.internalAttachments.length > 0 &&
                              checkCanViewIdea(item) && (
                                <div className="mt-2">
                                  <div className="text-gray-500 text-xs mb-1">
                                    Đính kèm:
                                  </div>
                                  <div className="space-y-1">
                                    {cmt.internalAttachments.map((file) => (
                                      <div
                                        key={file.id}
                                        className="flex items-center gap-2"
                                      >
                                        <button
                                          className="text-blue-600 hover:underline flex items-center gap-1"
                                          onClick={() => onViewFile?.(file)}
                                        >
                                          <i className="fas fa-paperclip text-xs" />
                                          {file.displayName}
                                        </button>
                                        {file.encrypt && onOpenShare && (
                                          <button
                                            onClick={() => onOpenShare(file)}
                                            title="Chia sẻ tệp đính kèm"
                                          >
                                            <i className="fas fa-share text-blue-500 text-xs" />
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {/* Main Checked (Thực hiện) rows */}
              {mainChecked.map((item, idx) => (
                <tr key={`main-${idx}`} className="hover:bg-gray-50">
                  <td className="border px-3 py-2 text-center">
                    <i className="fa fa-user text-blue-500" />
                  </td>
                  <td className="border px-3 py-2">
                    <span>Thực hiện: {item.name}</span>
                  </td>
                  <td className="border px-3 py-2">
                    {item.listCmt && item.listCmt.length > 0 && (
                      <div className="space-y-3">
                        {item.listCmt.map((cmt, cmtIdx) => (
                          <div key={cmtIdx}>
                            <div className="mb-1">
                              <span className="font-semibold mr-2">
                                {cmt.userFullName}
                              </span>
                              <span className="text-gray-500 text-xs mr-2">
                                {cmt.createDate
                                  ? new Date(cmt.createDate).toLocaleString(
                                      "vi-VN",
                                      {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )
                                  : ""}
                              </span>
                              <span className="px-2 py-0.5 rounded text-white text-xs bg-green-500">
                                Đã hoàn thành
                              </span>
                            </div>
                            <div className="text-gray-800">{cmt.comment}</div>
                            {Array.isArray(cmt.internalAttachments) &&
                              cmt.internalAttachments.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-gray-500 text-xs mb-1">
                                    Đính kèm:
                                  </div>
                                  <div className="space-y-1">
                                    {cmt.internalAttachments.map((file) => (
                                      <div
                                        key={file.id}
                                        className="flex items-center gap-2"
                                      >
                                        <button
                                          className="text-blue-600 hover:underline flex items-center gap-1"
                                          onClick={() => onViewFile?.(file)}
                                        >
                                          <i className="fas fa-paperclip text-xs" />
                                          {file.displayName}
                                        </button>
                                        {file.encrypt && onOpenShare && (
                                          <button
                                            onClick={() => onOpenShare(file)}
                                            title="Chia sẻ tệp đính kèm"
                                          >
                                            <i className="fas fa-share text-blue-500 text-xs" />
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {/* To Know Check (Xem để biết) row */}
              {toKnowCheck && toKnowCheck.length > 0 && (
                <tr className="hover:bg-gray-50">
                  <td className="border px-3 py-2 text-center">
                    <i className="fa fa-user text-gray-500" />
                  </td>
                  <td className="border px-3 py-2">
                    <span>{getPersonReceived(toKnowCheck, "Xem để biết")}</span>
                  </td>
                  <td className="border px-3 py-2"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocInternalProcessTable;
