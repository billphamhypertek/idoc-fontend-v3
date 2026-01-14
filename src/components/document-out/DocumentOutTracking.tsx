import * as React from "react";
import { useEffect } from "react";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Constant } from "@/definitions/constants/constant";
import {
  useGetTrackingList,
  useGetAllTrackingList,
} from "@/hooks/data/document-out.data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dayjs from "dayjs";

interface DocumentOutTrackingProps {
  docId: string;
  onClose: () => void;
  isDocumentInternal?: boolean;
  showTrackingModal: boolean;
  setShowTrackingModal: (show: boolean) => void;
}

type TrackingItem = {
  id?: string | number;
  org?: string | null;
  position?: string | null;
  fullName?: string | null;
  action?: string | null;
  category?: string | null;
  createDate?: string | number | Date | null;
  transferer?: string | null;
};

export default function DocumentOutTracking({
  docId,
  onClose,
  isDocumentInternal,
  showTrackingModal,
  setShowTrackingModal,
}: DocumentOutTrackingProps) {
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = React.useState<number>(
    Constant.ITEMS_PER_PAGE || 10
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [showTrackingModal]);
  const {
    data: trackingData,
    isLoading: loading,
    refetch,
  } = useGetTrackingList(Number(docId), currentPage);

  const data = trackingData?.objList ?? [];
  const totalItems = trackingData?.totalRecord ?? 0;

  const { data: allTrackingData, refetch: refetchAll } = useGetAllTrackingList(
    Number(docId),
    false
  );

  const getFullNameLogin = (
    position?: string | null,
    fullName?: string | null
  ) => {
    const pos = position || "";
    const name = fullName || "";
    if (pos && !name) return pos;
    if (!pos && name) return name;
    if (!pos && !name) return "";
    return `${pos} (${name})`;
  };

  const formatDate = (value?: string | number | Date | null) => {
    if (!value) return "";
    try {
      return dayjs(value).format("HH:mm:ss DD/MM/YYYY");
    } catch (e) {
      return String(value);
    }
  };

  const handleExport = async () => {
    try {
      const result = await refetchAll();
      const list: TrackingItem[] = result?.data ?? [];

      const rows: string[][] = [];
      const header = [
        "STT",
        "Đơn vị",
        "Tên đăng nhập",
        "Hành động",
        "Loại đối tượng",
        "Thời điểm",
      ];

      list.forEach((element: TrackingItem, index: number) => {
        rows.push([
          String(index + 1),
          element.org ? String(element.org) : "",
          getFullNameLogin(element.position ?? "", element.fullName ?? ""),
          element.action ? String(element.action) : "",
          element.category ? String(element.category) : "",
          element.createDate ? formatDate(element.createDate) : "",
        ]);
      });

      const csv = [header, ...rows]
        .map((r) =>
          r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");
      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Danh_sach_theo_doi.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export tracking failed", err);
    }
  };

  const columns = React.useMemo(() => {
    const cols: any[] = [];
    cols.push({
      header: "STT",
      accessor: (_: TrackingItem, index: number) =>
        (currentPage - 1) * itemsPerPage + (index + 1),
      className: "w-14 text-center",
    });
    if (isDocumentInternal) {
      cols.push({
        header: "Người gửi",
        accessor: (item: TrackingItem) => item.transferer ?? "",
        className: "w-1/6",
      });
    }
    cols.push(
      {
        header: "Đơn vị",
        accessor: (item: TrackingItem) => item.org ?? "",
        className: "w-1/5",
      },
      {
        header: "Tên đăng nhập",
        accessor: (item: TrackingItem) =>
          getFullNameLogin(item.position, item.fullName),
        className: "w-2/5",
      },
      {
        header: "Hành động",
        accessor: (item: TrackingItem) => item.action ?? "",
        className: "w-1/6",
      },
      {
        header: "Loại đối tượng",
        accessor: (item: TrackingItem) => item.category ?? "",
        className: "w-1/6",
      },
      {
        header: "Thời điểm",
        accessor: (item: TrackingItem) => formatDate(item.createDate),
        className: "w-1/6",
      }
    );
    return cols;
  }, [currentPage, itemsPerPage, isDocumentInternal]);

  return (
    <Dialog open={showTrackingModal} onOpenChange={setShowTrackingModal}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Theo dõi</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[calc(95vh-250px)] overflow-y-auto">
          <Table
            columns={columns}
            dataSource={data}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(size) => {
              setItemsPerPage(size);
              setCurrentPage(1);
            }}
            loading={loading}
            emptyText="Không có dữ liệu"
          />
        </div>
        <div>
          <div className="flex items-center justify-end">
            <div className="flex gap-2">
              {Constant.EXPORT_TRACKING_BCY && (
                <Button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={handleExport}
                >
                  Xuất file
                </Button>
              )}
              <Button variant="secondary" onClick={onClose}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
