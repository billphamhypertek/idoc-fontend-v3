"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Plus, ChevronDown } from "lucide-react";
import { useRef } from "react";
import {
  useExportOrgFileAction,
  useImportOrgFileAction,
} from "@/hooks/data/calendar.actions";
import { saveAs } from "file-saver";
import { ToastUtils } from "@/utils/toast.utils";

interface CalendarOrgListHeaderProps {
  onAddRoom?: () => void;
}

export default function CalendarOrgListHeader({
  onAddRoom,
}: CalendarOrgListHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportOrgFileMutation = useExportOrgFileAction();
  const importOrgFileMutation = useImportOrgFileAction();

  const handleImportFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ["xlsx", "csv", "xls"];
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!extension || !allowedExtensions.includes(extension)) {
      ToastUtils.error("Chỉ chấp nhận các file .xlsx, .xls hoặc .csv");
      event.target.value = "";
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      await importOrgFileMutation.mutateAsync(formData);

      ToastUtils.success("Tải file lên thành công!");

      event.target.value = "";
    } catch (error) {
      ToastUtils.error("Tải file thất bại!");
      event.target.value = "";
    }
  };

  const handleExportFile = async (type: "excel" | "csv") => {
    try {
      const response = await exportOrgFileMutation.mutateAsync(type);
      const blob = response.data;

      const now = new Date();
      const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}_${now
        .getHours()
        .toString()
        .padStart(2, "0")}-${now.getMinutes().toString().padStart(2, "0")}`;

      const fileName = `Danh_sach_dia_diem_phong_hop_${timestamp}.${
        type === "excel" ? "xlsx" : "csv"
      }`;

      saveAs(blob, fileName);
    } catch (error) {
      ToastUtils.error("Lỗi khi tải file từ máy chủ");
    }
  };

  return (
    <div className="bg-gray-100 px-4 py-4 rounded-lg mb-5 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold">Đăng ký phòng họp</h1>
        <p className="text-sm text-muted-foreground">
          Hiển thị thông tin phòng họp
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={handleImportFile}
          disabled={importOrgFileMutation.isPending}
        >
          <Plus className="w-4 h-4" />
          Tải file vào
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: "none" }}
          onChange={handleFileSelected}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="w-4 h-4" />
              Xuất dưới dạng
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[var(--radix-dropdown-menu-trigger-width)]"
          >
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => handleExportFile("excel")}
              disabled={exportOrgFileMutation.isPending}
            >
              Export ra Excel
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => handleExportFile("csv")}
              disabled={exportOrgFileMutation.isPending}
            >
              Export ra CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={onAddRoom}
        >
          <Plus className="w-4 h-4" />
          Thêm phòng họp
        </Button>
      </div>
    </div>
  );
}
