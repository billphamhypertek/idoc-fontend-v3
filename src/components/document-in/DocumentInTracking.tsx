import * as React from "react";
import { useEffect } from "react";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Constant } from "@/definitions/constants/constant";
import { sendGet } from "@/api/base-axios-protected-request";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetAllTracking,
  useGetDocOutTracking,
} from "@/hooks/data/draft.data";
import { useState } from "react";
import { useGetOutTrackingSystem } from "@/hooks/data/outside-system.data";
import dayjs from "dayjs";

interface DocumentInTrackingProps {
  docId: string;
  onClose: () => void;
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
type LSGPTracking = {
  id?: string | number;
  receiver?: string | null;
  result?: string | null;
  handler?: string | null;
  action?: string | null;
  date?: string | number | Date | null;
};
const tabs = {
  IN_SYSTEM: "Trong hệ thống",
  OUT_SYSTEM: "Ngoài hệ thống",
};

export default function DocumentInTracking({
  docId,
  onClose,
  showTrackingModal,
  setShowTrackingModal,
}: DocumentInTrackingProps) {
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = React.useState<number>(
    Constant.ITEMS_PER_PAGE || 10
  );
  const [activeTab, setActiveTab] = useState(tabs.IN_SYSTEM);

  const insystem = useGetDocOutTracking(docId, currentPage, showTrackingModal);
  const outsystem = useGetOutTrackingSystem(
    docId,
    currentPage,
    showTrackingModal
  );
  const tracking = useGetAllTracking(docId, showTrackingModal);

  useEffect(() => {
    if (showTrackingModal) {
      setCurrentPage(1);
    }
  }, [showTrackingModal]);

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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const trackingColumns = React.useMemo(() => {
    const cols: any[] = [];
    cols.push({
      header: "STT",
      accessor: (_: TrackingItem, index: number) =>
        (currentPage - 1) * itemsPerPage + (index + 1),
      className: "w-14 text-center",
    });
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
  }, [currentPage, itemsPerPage]);
  const LSGPTrackingColumn = React.useMemo(() => {
    const cols: any[] = [];
    cols.push({
      header: "STT",
      accessor: (_: LSGPTracking, index: number) =>
        (currentPage - 1) * itemsPerPage + (index + 1),
      className: "w-14 text-center",
    });
    cols.push(
      {
        header: "Đơn vị nhận",
        accessor: (item: LSGPTracking) => item.receiver ?? "",
        className: "w-1/5",
      },
      {
        header: "Hành động",
        accessor: (item: LSGPTracking) => item.action ?? "",
        className: "w-1/6",
      },
      {
        header: "Kết quả",
        accessor: (item: LSGPTracking) => item.result ?? "",
        className: "w-2/5",
      },

      {
        header: "Người thực hiện",
        accessor: (item: LSGPTracking) => item.handler ?? "",
        className: "w-1/6",
      },
      {
        header: "Thời điểm",
        accessor: (item: LSGPTracking) => formatDate(item.date),
        className: "w-1/6",
      }
    );
    return cols;
  }, [currentPage, itemsPerPage]);

  const handleExport = async () => {
    try {
      const rows: string[][] = [];
      const header = [
        "STT",
        "Đơn vị",
        "Tên đăng nhập",
        "Hành động",
        "Loại đối tượng",
        "Thời điểm",
      ];
      const list: TrackingItem[] = tracking?.data ?? tracking?.data ?? [];
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
      link.download = "Danh sách theo dõi.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export tracking failed", err);
    }
  };

  const tableColumn =
    tabs.IN_SYSTEM === activeTab ? trackingColumns : LSGPTrackingColumn;
  const tableData =
    tabs.IN_SYSTEM === activeTab
      ? insystem.data?.objList
      : outsystem.data?.content;
  const loading =
    tabs.IN_SYSTEM === activeTab ? insystem.isLoading : outsystem.isLoading;
  const totalItems =
    tabs.IN_SYSTEM === activeTab
      ? insystem.data?.totalRecord
      : outsystem.data?.totalElements;
  return (
    <Dialog open={showTrackingModal} onOpenChange={setShowTrackingModal}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Theo dõi</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === tabs.IN_SYSTEM
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => handleTabChange(tabs.IN_SYSTEM)}
            >
              {tabs.IN_SYSTEM}
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === tabs.OUT_SYSTEM
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => handleTabChange(tabs.OUT_SYSTEM)}
            >
              {tabs.OUT_SYSTEM}
            </button>
          </div>
        </div>

        <div className="space-y-4 max-h-[calc(95vh-250px)] overflow-y-auto">
          <Table
            columns={tableColumn}
            dataSource={tableData}
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
            showPageSize={false}
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
