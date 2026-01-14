"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DocumentRecordService } from "@/services/document-record.service";
import { uploadFileService } from "@/services/file.service";
import { Button } from "../ui/button";

type DocListItem = {
  id: string | number;
  name: string;
  iconType: "FILE" | "DOC";
  downloadLink?: string;
  docType?: string; // 'VAN_BAN_DI' or others
  docId?: string | number;
  active?: boolean;
};

type FolderLike = { id: string | number; name?: string } | null;

export default function DocList({
  folder = null,
  onClose,
}: {
  folder?: FolderLike;
  onClose: () => void;
}) {
  const [documentList, setDocumentList] = useState<DocListItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<DocListItem | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (!folder || !folder.id) return;
        const res = await DocumentRecordService.doLoadFullDetailFolder(
          String(folder.id),
          10,
          1
        );
        setDocumentList((res?.objList as DocListItem[]) || []);
      } catch (e) {
        setDocumentList([]);
      }
    };
    load();
  }, [folder?.id]);

  const getIconName = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes(".pdf")) return "PDF.png";
    if (lower.includes(".doc")) return "doc_upload.png";
    if (lower.includes(".xls")) return "excel.png";
    if (
      lower.includes(".png") ||
      lower.includes(".jpg") ||
      lower.includes(".gif")
    )
      return "img_icon.png";
    return "other.png";
  };

  const doClickItem = (item: DocListItem) => {
    setDocumentList((prev) =>
      prev.map((it) => ({ ...it, active: it.id === item.id }))
    );
    setSelectedItem(item);
  };

  const doDblItem = (item: DocListItem) => {
    if (!item) return;
    if (item.iconType === "FILE") {
      const isPdf = item.name.toLowerCase().includes(".pdf");
      if (isPdf && item.downloadLink) {
        window.open(item.downloadLink, "_blank");
      } else if (item.downloadLink) {
        const fileName = item.name;
        uploadFileService.downloadFileFullUrl(fileName, item.downloadLink);
      }
    } else if (item.iconType === "DOC") {
      openDocument(item);
    }
  };

  const openDocument = (item: DocListItem) => {
    if (!item?.docId) return;
    const url =
      item.docType === "VAN_BAN_DI"
        ? `/document-in/search/draft-detail/${item.docId}`
        : `/document-out/list/detail/${item.docId}`;
    const base = window.location.origin;
    window.open(base + url, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h5 className="font-semibold">
          Danh sách tài liệu - Hồ sơ {folder?.name || ""}
        </h5>
      </div>
      <div className="min-h-[120px]">
        {documentList && documentList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {documentList.map((item) => (
              <div
                key={`${item.id}`}
                className={`p-2 cursor-pointer ${item.active ? "bg-blue-200" : "bg-white"}`}
                onClick={() => doClickItem(item)}
                onDoubleClick={() => doDblItem(item)}
                title={item.name}
              >
                <div className="text-center">
                  <span>
                    {item.iconType === "FILE" ? (
                      <img
                        src={`/v2/assets/images/${getIconName(item.name)}`}
                        style={{ width: 50 }}
                      />
                    ) : (
                      <img
                        src="/v2/assets/images/doc.png"
                        style={{ width: 50 }}
                      />
                    )}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-sky-600 underline">
                    {item.name.slice(0, 50)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <span>Không có dữ liệu</span>
        )}
      </div>
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Đóng
        </Button>
      </div>
    </div>
  );
}
