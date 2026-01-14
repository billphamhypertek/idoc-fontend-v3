"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Table } from "@/components/ui/table";
import type { SearchResult } from "@/definitions/types/auth.type";
import { DashboardService } from "@/services/dashboard.service";
import { cn } from "@/lib/utils";

export default function DocumentOutListSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlKeyword = React.useMemo(
    () => (searchParams?.get("search") ?? "").trim(),
    [searchParams]
  );

  const [q, setQ] = React.useState(urlKeyword);

  React.useEffect(() => {
    setQ(urlKeyword);
  }, [urlKeyword]);

  const {
    data = [],
    isLoading,
    isFetching,
  } = useQuery<SearchResult[], Error>({
    queryKey: ["search-keyword", urlKeyword],
    enabled: urlKeyword.length > 0,
    refetchOnWindowFocus: false,
    staleTime: 0,
    queryFn: async () => {
      if (!urlKeyword) return [];
      const res = await DashboardService.searchKeyword(urlKeyword);
      if (Array.isArray(res)) return res as SearchResult[];
      const anyRes = res as any;
      if (Array.isArray(anyRes?.items)) return anyRes.items as SearchResult[];
      if (Array.isArray(anyRes?.data)) return anyRes.data as SearchResult[];
      return [];
    },
  });

  const results = data;
  const total = results.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const kw = q.trim();
    router.push(`/document-out/list-search?search=${encodeURIComponent(kw)}`);
  };

  return (
    <div className="px-4 space-y-4">
      <form
        onSubmit={handleSubmit}
        className="mb-6 w-full flex items-center gap-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nhập từ khoá (ví dụ: văn bản, lịch họp, ...)"
          className="w-full rounded-lg border border-blue-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Tìm kiếm
        </button>
      </form>

      <div className="p-4 sm:p-8 bg-white rounded-2xl shadow-lg border border-blue-100">
        <h2 className="text-2xl font-bold text-blue-700 mb-2">
          Kết quả tìm kiếm văn bản
        </h2>

        <div className="mb-3 text-gray-600 text-base flex flex-wrap items-center gap-x-3">
          <span>Từ khoá:</span>
          <span className="font-semibold text-blue-600">
            {urlKeyword || "(trống)"}
          </span>
          {urlKeyword && (
            <span className="text-sm text-gray-500">
              •{" "}
              {isFetching
                ? "Đang tải..."
                : `Tìm thấy ${total.toLocaleString("vi-VN")} kết quả`}
            </span>
          )}
        </div>

        <div className="w-full overflow-x-auto">
          <Table<SearchResult>
            sortable={true}
            className="w-full border rounded-xl shadow-sm"
            columns={[
              { header: "ID", accessor: (item) => item.id, sortKey: "id" },
              {
                header: "Tên đối tượng/Trích yếu",
                accessor: (item) => item.name,
                sortKey: "name",
              },
              {
                header: "Số ký hiệu/Mã công việc",
                accessor: (item) => item.code,
                sortKey: "code",
              },
              {
                header: "Mô tả",
                accessor: (item) => item.description,
                sortKey: "description",
              },
              {
                header: "Ngày tạo",
                accessor: (item) =>
                  item.createDate
                    ? new Date(item.createDate).toLocaleDateString("vi-VN")
                    : "",
                sortKey: "createDate",
              },
              {
                header: "Đơn vị",
                accessor: (item) => item.type,
                sortKey: "type",
              },
            ]}
            dataSource={results}
          />
        </div>

        {isLoading && (
          <div className="mt-6 text-blue-500 text-center animate-pulse">
            Đang tải...
          </div>
        )}

        {!isLoading && urlKeyword && results.length === 0 && (
          <div className="mt-6 text-gray-400 text-center">
            Không có kết quả phù hợp
          </div>
        )}

        {!urlKeyword && (
          <div className="mt-6 text-gray-500 text-center">
            Nhập từ khoá ở trên và nhấn Enter để tìm kiếm.
          </div>
        )}
      </div>
    </div>
  );
}
