import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Column } from "@/definitions/types/table.type";
import { useGetListTracking } from "@/hooks/data/vehicle.data";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Table } from "../ui/table";

interface TrackingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trackingId: number;
}

// Hàm tính pagination range: 1 ... 4 5 6 ... 20
function getPageNumbers(current: number, total: number): (number | string)[] {
  const delta = 2;
  const pages: (number | string)[] = [];
  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(total - 1, current + delta);
    i++
  ) {
    pages.push(i);
  }
  if (current - delta > 2) pages.unshift("...");
  if (current + delta < total - 1) pages.push("...");
  pages.unshift(1);
  if (total > 1) pages.push(total);
  return pages;
}

export function TrackingDialog({
  isOpen,
  onOpenChange,
  trackingId,
}: TrackingDialogProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isFetching } = useGetListTracking(
    trackingId,
    currentPage,
    isOpen
  );

  const goToPage = (page: number) => setCurrentPage(page);
  const goToPrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const goToNextPage = () =>
    setCurrentPage((p) => Math.min(p + 1, data?.totalPage ?? 1));

  const pageNumbers = data ? getPageNumbers(currentPage, data.totalPage) : [];

  interface TrackingItem {
    no: number;
    org: string;
    position: string;
    fullName: string;
    action: string;
    transferer: string;
    createDate: string;
  }

  const columns: Column<TrackingItem>[] = [
    { header: "STT", accessor: "no", className: "text-center w-16" },
    { header: "Đơn vị", accessor: "org" as keyof TrackingItem },
    { header: "Chức vụ", accessor: "position" },
    { header: "Họ tên", accessor: "fullName" },
    { header: "Hành động", accessor: "action", className: "text-center w-24" },
    {
      header: "Người chuyển",
      accessor: "transferer",
      className: "text-center w-32",
    },
    {
      header: "Thời điểm",
      accessor: (item: TrackingItem) =>
        new Date(item.createDate).toLocaleString("vi-VN"),
      className: "text-center w-32",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-3 border-b bg-gray-50 flex-shrink-0">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Theo dõi
          </DialogTitle>
        </DialogHeader>

        {/* Table */}
        <div className="flex-1 overflow-auto min-h-[300px] relative">
          <Table
            sortable={true}
            columns={columns}
            dataSource={isLoading ? [] : data?.objList || []}
            itemsPerPage={10}
            emptyText="Không có dữ liệu"
            showPagination={false}
            className="mt-2"
          />
        </div>

        {/* Pagination */}
        {data && (
          <div className="px-6 py-3 border-t bg-gray-50 flex items-center justify-between flex-shrink-0">
            <div className="text-sm text-gray-600">
              Trang {currentPage}/{data.totalPage} • Tổng {data.totalRecord} bản
              ghi
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="h-9 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {pageNumbers.map((p, idx) =>
                p === "..." ? (
                  <span
                    key={`dots-${idx}`}
                    className="px-2 text-gray-500 text-sm"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={currentPage === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(Number(p))}
                    className={`h-9 w-8 p-0 text-xs ${
                      currentPage === p
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === data.totalPage}
                className="h-9 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
