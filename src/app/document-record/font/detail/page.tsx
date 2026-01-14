"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useGetDetailFont } from "@/hooks/data/document-record.data";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";

export default function FontDetailPage() {
  const searchParams = useSearchParams();
  const id = searchParams?.get("id") ?? "";

  const { data: font, isPending } = useGetDetailFont(id);

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4">
      <BreadcrumbNavigation
        items={[
          {
            href: "/document-record/font",
            label: "Hồ sơ tài liệu",
          },
        ]}
        currentPage="Chi tiết phông"
        showHome={false}
      />

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b px-6 py-3">
          <span className="m-0 font-semibold text-sky-600">
            Thông tin chung
          </span>
        </div>

        <div className="px-6 py-5">
          {(() => {
            const Row = ({
              label,
              children,
            }: {
              label: React.ReactNode;
              children: React.ReactNode;
            }) => (
              <div className="grid grid-cols-12 items-start gap-y-2">
                <label className="col-span-5 pr-4 text-right font-bold">
                  {label}
                </label>
                <div className="col-span-7">{children}</div>
              </div>
            );

            return (
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-3">
                  <Row label={"Tên phông"}>{font.fondName}</Row>
                  <Row label={"Lịch sử hình thành phông"}>
                    {font.fondHistory}
                  </Row>
                  <Row label={"Thời gian tài liệu"}>{font.archivesTime}</Row>
                  <Row label={"Số tài liệu giấy đã số hóa:"}>
                    {font.paperDigital}
                  </Row>
                  <Row label={"Các nhóm tài liệu chủ yếu:"}>
                    {font.keyGroups}
                  </Row>
                  <Row label={"Ghi chú"}>
                    <div className="whitespace-pre-wrap break-words">
                      {font.description}
                    </div>
                  </Row>
                </div>
                <div className="space-y-3">
                  <Row label={"Mã phông"}>{font.organld}</Row>
                  <Row label={"Ngôn ngữ"}>{font.language}</Row>
                  <Row label={"Tổng số tài liệu giấy"}>{font.paperTotal}</Row>
                  <Row label={"Các loại tài liệu khác"}>{font.otherTypes}</Row>
                  <Row label={"Công cụ tra cứu"}>{font.lookupTools}</Row>
                  <Row label={"Số lượng tài liệu đã lập bản sao bảo hiểm"}>
                    {font.copyNumber}
                  </Row>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
