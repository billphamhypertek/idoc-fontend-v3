"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SelectCustom from "@/components/common/SelectCustom";
import { CustomDatePicker } from "@/components/ui/calendar";
import { Table } from "@/components/ui/table";
import { Search, Upload, Check, FileCheck } from "lucide-react";
import {
  useGetListVBByFolderId,
  useGetAllDocuments,
  useAddDocument,
  useAddExistingDocument,
  useAddDocuments,
} from "@/hooks/data/document-record.data";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import { useMutation } from "@tanstack/react-query";
import { DocumentRecordService } from "@/services/document-record.service";
import { toast } from "@/hooks/use-toast";
import { ToastUtils } from "@/utils/toast.utils";
import axios from "axios";

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  folderId?: string;
}

interface VanBanFormData {
  trichYeu: string;
  soKyHieu: string;
  loaiVanBan: string;
  linhVuc: string;
  doKhan: string;
  doMat: string;
  trangThai: string;
}

interface TaiLenFormData {
  soLuongTrang: string;
  trichYeu: string;
  soCuaVanBan: string;
  kyHieuVanBan: string;
  ngayBanHanh: string;
  ngonNgu: string;
  ghiChu: string;
  kyHieuThongTin: string;
  tuKhoa: string;
  cheDoSuDung: string;
  mucDoTinCay: string;
  butTich: string;
  tinhTrangVatLy: string;
  chuThich: string;
  file: File | null;
}

// Initial form states constants
const initialVanBanForm: VanBanFormData = {
  trichYeu: "",
  soKyHieu: "",
  loaiVanBan: "0",
  linhVuc: "",
  doKhan: "",
  doMat: "",
  trangThai: "",
};

const initialTaiLenForm: TaiLenFormData = {
  soLuongTrang: "",
  trichYeu: "",
  soCuaVanBan: "",
  kyHieuVanBan: "",
  ngayBanHanh: "",
  ngonNgu: "",
  ghiChu: "",
  kyHieuThongTin: "",
  tuKhoa: "",
  cheDoSuDung: "",
  mucDoTinCay: "",
  butTich: "",
  tinhTrangVatLy: "",
  chuThich: "",
  file: null,
};

export default function AddDocumentModal({
  isOpen,
  onClose,
  onSubmit,
  folderId,
}: AddDocumentModalProps) {
  const [activeTab, setActiveTab] = useState<"van-ban" | "tai-len">("van-ban");

  // API hooks
  const { data: linhVucData } = useGetCategoriesByCode("LVVB");
  const { data: doKhanData } = useGetCategoriesByCode("DKVB");
  const { data: doMatData } = useGetCategoriesByCode("DMVB");
  const { data: folderDocuments } = useGetListVBByFolderId(
    folderId || "",
    10,
    1,
    !!folderId
  );
  const { data: allDocuments } = useGetAllDocuments(0);
  const { mutate: addDocument, isPending: isAdding } = useAddDocument();
  const { mutate: addExistingDocument, isPending: isAddingExisting } =
    useAddExistingDocument();
  const { mutate: addDocuments, isPending: isAddingMultiple } =
    useAddDocuments();

  // Helper function to extract error message from error object
  const getErrorMessage = (error: any): string => {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;

      // Check if error response has message property
      if (responseData?.message) {
        return responseData.message;
      }

      // Check if error response data is a string
      if (typeof responseData === "string") {
        return responseData;
      }

      // Check for validation errors or error array
      if (
        Array.isArray(responseData?.errors) &&
        responseData.errors.length > 0
      ) {
        return responseData.errors.join(", ");
      }

      // Check for error object with detail
      if (responseData?.error) {
        return typeof responseData.error === "string"
          ? responseData.error
          : responseData.error.message || "Thêm tài liệu thất bại";
      }

      // Check if error has message property
      if (error.message) {
        return error.message;
      }
    } else if (error instanceof Error) {
      return error.message;
    } else if (typeof error === "string") {
      return error;
    }

    // Fallback to default message
    return "Thêm tài liệu thất bại";
  };

  const { mutate: addFile, isPending: isAddingFile } = useMutation({
    mutationFn: (fileInfo: any) => DocumentRecordService.doAddFile(fileInfo),
    onSuccess: () => {
      onClose();
      ToastUtils.themMoiTepThanhCong();
    },
    onError: (error: any) => {
      console.error("Error uploading file:", error);
      const errorMessage = getErrorMessage(error);
      ToastUtils.coLoiXayRaKhiThemTepLichTuan();
    },
  });

  const [formVanBan, setFormVanBan] =
    useState<VanBanFormData>(initialVanBanForm);
  const [formTaiLen, setFormTaiLen] =
    useState<TaiLenFormData>(initialTaiLenForm);

  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [filteredDocuments, setFilteredDocuments] = useState<any[]>([]);

  // Update filtered documents when allDocuments changes
  React.useEffect(() => {
    setFilteredDocuments(allDocuments?.content || []);
  }, [allDocuments]);

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      // Reset all form states when modal is closed
      setFormVanBan(initialVanBanForm);
      setFormTaiLen(initialTaiLenForm);
      setSelectedDocument(null);
      setFilteredDocuments(allDocuments?.content || []);
      setActiveTab("van-ban");

      // Reset file input
      const fileInput = document.getElementById(
        "file-upload"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    }
  }, [isOpen, allDocuments]);

  // Transform API data to select options
  const linhVucList = linhVucData
    ? [
        { value: "", label: "--- Chọn ---" },
        ...linhVucData.map((item) => ({
          value: item.id.toString(),
          label: item.name,
        })),
      ]
    : [{ value: "", label: "--- Chọn ---" }];

  const doKhanList = doKhanData
    ? [
        { value: "", label: "--- Chọn ---" },
        ...doKhanData.map((item) => ({
          value: item.id.toString(),
          label: item.name,
        })),
      ]
    : [{ value: "", label: "--- Chọn ---" }];

  const doMatList = doMatData
    ? [
        { value: "", label: "--- Chọn ---" },
        ...doMatData.map((item) => ({
          value: item.id.toString(),
          label: item.name,
        })),
      ]
    : [{ value: "", label: "--- Chọn ---" }];

  const trangThaiList = [
    { value: "", label: "--- Chọn ---" },
    { value: "RETURN_DOC", label: "Trả lại văn bản" },
    { value: "RETAKE_DOC", label: "Thu hồi văn bản" },
    { value: "DOING", label: "Đang xử lý" },
    { value: "NOT_YET", label: "Chờ xử lý" },
    { value: "DONE", label: "Hoàn thành" },
    { value: "DELEGATE_DOC", label: "Văn bản ủy quyền" },
  ];

  const loaiVanBanList = [
    { value: "0", label: "Văn bản đến" },
    { value: "1", label: "Văn bản đi" },
  ];

  const tableColumns = [
    {
      header: "STT",
      className: "text-center w-16",
      accessor: (_: any, index: number) => index + 1,
    },
    {
      header: "Số ký hiệu",
      className: "text-left",
      accessor: (item: any) => item.soKyHieu || "-",
    },
    {
      header: "Trích yếu",
      className: "text-left",
      accessor: (item: any) => item.trichYeu || "-",
    },
    {
      header: "Đơn vị",
      className: "text-left",
      accessor: (item: any) => item.donVi || "-",
    },
    {
      header: "Loại văn bản",
      className: "text-left",
      accessor: (item: any) => item.loaiVanBan || "-",
    },
    {
      header: "Độ khẩn",
      className: "text-left",
      accessor: (item: any) => item.doKhan || "-",
    },
    {
      header: "Độ mật",
      className: "text-left",
      accessor: (item: any) => item.doMat || "-",
    },
    {
      header: "Lĩnh vực",
      className: "text-left",
      accessor: (item: any) => item.linhVuc || "-",
    },
    {
      header: "Trạng thái",
      className: "text-left",
      accessor: (item: any) => item.trangThai || "-",
    },
    {
      header: "Lựa chọn",
      className: "text-center w-24",
      accessor: (item: any) => (
        <Button
          size="sm"
          variant={selectedDocument?.id === item.id ? "default" : "outline"}
          onClick={() => setSelectedDocument(item)}
        >
          {selectedDocument?.id === item.id ? "Đã chọn" : "Chọn"}
        </Button>
      ),
    },
  ];

  const handleVanBanChange = (field: keyof VanBanFormData, value: string) => {
    setFormVanBan((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTaiLenChange = (field: keyof TaiLenFormData, value: string) => {
    setFormTaiLen((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormTaiLen((prev) => ({
        ...prev,
        file: file,
      }));
    }
  };

  const handleSearch = () => {
    // Filter documents based on form data
    let filtered = allDocuments?.content || [];

    if (formVanBan.trichYeu) {
      filtered = filtered.filter((doc: any) =>
        doc.title?.toLowerCase().includes(formVanBan.trichYeu.toLowerCase())
      );
    }

    if (formVanBan.soKyHieu) {
      filtered = filtered.filter((doc: any) =>
        doc.fileNumber
          ?.toLowerCase()
          .includes(formVanBan.soKyHieu.toLowerCase())
      );
    }

    if (formVanBan.loaiVanBan) {
      filtered = filtered.filter(
        (doc: any) => doc.docType === formVanBan.loaiVanBan
      );
    }

    if (formVanBan.linhVuc) {
      filtered = filtered.filter(
        (doc: any) => doc.categoryId === formVanBan.linhVuc
      );
    }

    if (formVanBan.doKhan) {
      filtered = filtered.filter(
        (doc: any) => doc.urgencyId === formVanBan.doKhan
      );
    }

    if (formVanBan.doMat) {
      filtered = filtered.filter(
        (doc: any) => doc.securityId === formVanBan.doMat
      );
    }

    if (formVanBan.trangThai) {
      filtered = filtered.filter(
        (doc: any) => doc.status === formVanBan.trangThai
      );
    }

    setFilteredDocuments(filtered);
  };

  const handleSubmit = () => {
    if (!folderId) {
      console.error("Không có folderId");
      return;
    }

    if (activeTab === "van-ban") {
      if (selectedDocument) {
        // Add existing document to folder
        addExistingDocument(
          { folderId, documentId: selectedDocument.id },
          {
            onSuccess: () => {
              onClose(); // Close modal on success
              ToastUtils.themMoiTepThanhCong();
            },
            onError: (error: any) => {
              const errorMessage = getErrorMessage(error);
              ToastUtils.error(errorMessage);
            },
          }
        );
      } else {
        // Send empty array if no document selected
        addDocuments(
          { folderId, documents: [] },
          {
            onSuccess: () => {
              onClose(); // Close modal on success
              ToastUtils.themMoiTepThanhCong();
            },
            onError: (error: any) => {
              const errorMessage = getErrorMessage(error);
              ToastUtils.error(errorMessage);
            },
          }
        );
      }
    } else {
      if (!formTaiLen.trichYeu.trim()) {
        ToastUtils.error("Trích yếu không được bỏ trống");
        return;
      }

      if (!formTaiLen.soCuaVanBan) {
        ToastUtils.error("Số của văn bản không được bỏ trống");
        return;
      }

      if (!formTaiLen.ngayBanHanh) {
        ToastUtils.error("Ngày ban hành không được bỏ trống");
        return;
      }

      if (!formTaiLen.file) {
        ToastUtils.error("Chọn file không được bỏ trống");
        return;
      }

      // Use addFile API for upload tab
      const fileInfo = {
        folderId: folderId.toString(),
        comment: formTaiLen.ghiChu || "",
        fileNotation: formTaiLen.kyHieuVanBan,
        fileCatalog: parseInt(formTaiLen.soCuaVanBan),
        docCode: "000.00.07.G11",
        pageAmount: parseInt(formTaiLen.soLuongTrang),
        codeNumber: 2,
        autograph: formTaiLen.butTich,
        confidenceLevel: formTaiLen.mucDoTinCay,
        description: formTaiLen.chuThich,
        format: formTaiLen.cheDoSuDung,
        inforSign: formTaiLen.kyHieuThongTin,
        issuedDate: formTaiLen.ngayBanHanh,
        keyword: formTaiLen.tuKhoa,
        language: formTaiLen.ngonNgu,
        mode: formTaiLen.cheDoSuDung,
        subject: formTaiLen.trichYeu,
        files: [formTaiLen.file],
      };

      addFile(fileInfo);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Thêm tài liệu</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="border-b border-gray-400 bg-gray-50">
            <nav className="flex -mb-px">
              <button
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "van-ban"
                    ? "border-blue-500 text-blue-600 bg-white"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("van-ban")}
              >
                Văn bản
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "tai-len"
                    ? "border-blue-500 text-blue-600 bg-white"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("tai-len")}
              >
                Tải lên
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "van-ban" && (
              <div>
                <div className="grid grid-cols-12 gap-4 mb-6">
                  <div className="col-span-12 lg:col-span-6">
                    <Label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Trích yếu
                    </Label>
                    <Input
                      type="text"
                      placeholder="Trích yếu"
                      maxLength={100}
                      value={formVanBan.trichYeu}
                      onChange={(e) =>
                        handleVanBanChange("trichYeu", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-12 md:col-span-6 lg:col-span-3">
                    <Label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Số ký hiệu
                    </Label>
                    <Input
                      type="text"
                      placeholder="Số ký hiệu"
                      maxLength={100}
                      value={formVanBan.soKyHieu}
                      onChange={(e) =>
                        handleVanBanChange("soKyHieu", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-12 md:col-span-6 lg:col-span-3">
                    <Label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Loại văn bản
                    </Label>
                    <div className="flex-1 min-w-0">
                      <SelectCustom
                        options={loaiVanBanList}
                        value={formVanBan.loaiVanBan}
                        onChange={(value) =>
                          handleVanBanChange(
                            "loaiVanBan",
                            Array.isArray(value) ? value[0] : value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="col-span-12 md:col-span-6 lg:col-span-3">
                    <Label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Lĩnh vực
                    </Label>
                    <Select
                      value={formVanBan.linhVuc || "empty"}
                      onValueChange={(value) =>
                        handleVanBanChange(
                          "linhVuc",
                          value === "empty" ? "" : value
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {linhVucList.map((item) => (
                          <SelectItem
                            key={item.value}
                            value={item.value === "" ? "empty" : item.value}
                          >
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-12 md:col-span-6 lg:col-span-3">
                    <Label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Độ khẩn
                    </Label>
                    <Select
                      value={formVanBan.doKhan || "empty"}
                      onValueChange={(value) =>
                        handleVanBanChange(
                          "doKhan",
                          value === "empty" ? "" : value
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {doKhanList.map((item) => (
                          <SelectItem
                            key={item.value}
                            value={item.value === "" ? "empty" : item.value}
                          >
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-12 md:col-span-6 lg:col-span-3">
                    <Label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Độ mật
                    </Label>
                    <Select
                      value={formVanBan.doMat || "empty"}
                      onValueChange={(value) =>
                        handleVanBanChange(
                          "doMat",
                          value === "empty" ? "" : value
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {doMatList.map((item) => (
                          <SelectItem
                            key={item.value}
                            value={item.value === "" ? "empty" : item.value}
                          >
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-12 md:col-span-6 lg:col-span-3">
                    <Label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Trạng thái
                    </Label>
                    <Select
                      value={formVanBan.trangThai || "empty"}
                      onValueChange={(value) =>
                        handleVanBanChange(
                          "trangThai",
                          value === "empty" ? "" : value
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {trangThaiList.map((item) => (
                          <SelectItem
                            key={item.value}
                            value={item.value === "" ? "empty" : item.value}
                          >
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <Button
                    onClick={handleSearch}
                    className="bg-blue-600 hover:bg-blue-600 text-white"
                  >
                    <Search size={16} className="mr-2" />
                    Tìm kiếm
                  </Button>
                </div>

                <div className="border border-gray-200 rounded overflow-hidden">
                  <Table
                    columns={tableColumns}
                    dataSource={filteredDocuments}
                    emptyText="Không có dữ liệu"
                  />
                </div>
              </div>
            )}

            {activeTab === "tai-len" && (
              <div>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 sm:col-span-6 md:col-span-4">
                    <Label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Số lượng trang của văn bản
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Số lượng trang của văn bản"
                      value={formTaiLen.soLuongTrang}
                      onChange={(e) =>
                        handleTaiLenChange("soLuongTrang", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-6 md:col-span-4">
                    <Label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Trích yếu <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="Trích yếu"
                      value={formTaiLen.trichYeu}
                      onChange={(e) =>
                        handleTaiLenChange("trichYeu", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-6 md:col-span-4">
                    <Label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Số của văn bản <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Số của văn bản"
                      value={formTaiLen.soCuaVanBan}
                      onChange={(e) =>
                        handleTaiLenChange("soCuaVanBan", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-6 md:col-span-4">
                    <Label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Ký hiệu của văn bản
                    </Label>
                    <Input
                      type="text"
                      placeholder="Ký hiệu của văn bản"
                      value={formTaiLen.kyHieuVanBan}
                      onChange={(e) =>
                        handleTaiLenChange("kyHieuVanBan", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-6 md:col-span-4">
                    <Label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Ngày ban hành <span className="text-red-500">*</span>
                    </Label>
                    <CustomDatePicker
                      selected={
                        formTaiLen.ngayBanHanh
                          ? new Date(formTaiLen.ngayBanHanh + "T00:00:00")
                          : null
                      }
                      onChange={(date) => {
                        setFormTaiLen((prev) => ({
                          ...prev,
                          ngayBanHanh: date
                            ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                            : "",
                        }));
                      }}
                      placeholder="dd/mm/yyyy"
                      showClearButton={false}
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-6 md:col-span-4">
                    <Label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Ngôn ngữ
                    </Label>
                    <Input
                      type="text"
                      placeholder="Ngôn ngữ"
                      value={formTaiLen.ngonNgu}
                      onChange={(e) =>
                        handleTaiLenChange("ngonNgu", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-6 md:col-span-4">
                    <Label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Ghi chú
                    </Label>
                    <Input
                      type="text"
                      placeholder="Ghi chú"
                      value={formTaiLen.ghiChu}
                      onChange={(e) =>
                        handleTaiLenChange("ghiChu", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-6 md:col-span-4">
                    <Label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Ký hiệu thông tin
                    </Label>
                    <Input
                      type="text"
                      placeholder="Ký hiệu thông tin"
                      value={formTaiLen.kyHieuThongTin}
                      onChange={(e) =>
                        handleTaiLenChange("kyHieuThongTin", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-6 md:col-span-4">
                    <Label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Từ khóa
                    </Label>
                    <Input
                      type="text"
                      placeholder="Từ khóa"
                      value={formTaiLen.tuKhoa}
                      onChange={(e) =>
                        handleTaiLenChange("tuKhoa", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-6 md:col-span-4">
                    <Label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Chế độ sử dụng
                    </Label>
                    <Input
                      type="text"
                      placeholder="Chế độ sử dụng"
                      value={formTaiLen.cheDoSuDung}
                      onChange={(e) =>
                        handleTaiLenChange("cheDoSuDung", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-6 md:col-span-4">
                    <Label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Mức độ tin cậy
                    </Label>
                    <Input
                      type="text"
                      placeholder="Mức độ tin cậy"
                      value={formTaiLen.mucDoTinCay}
                      onChange={(e) =>
                        handleTaiLenChange("mucDoTinCay", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-6 md:col-span-4">
                    <Label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Bút tích
                    </Label>
                    <Input
                      type="text"
                      placeholder="Bút tích"
                      value={formTaiLen.butTich}
                      onChange={(e) =>
                        handleTaiLenChange("butTich", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-6 md:col-span-4">
                    <Label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Tình trạng vật lý
                    </Label>
                    <Input
                      type="text"
                      placeholder="Tình trạng vật lý"
                      value={formTaiLen.tinhTrangVatLy}
                      onChange={(e) =>
                        handleTaiLenChange("tinhTrangVatLy", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-10 md:col-span-8">
                    <Label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Chú thích
                    </Label>
                    <Textarea
                      placeholder="Nhập chú thích"
                      rows={2}
                      value={formTaiLen.chuThich}
                      onChange={(e) =>
                        handleTaiLenChange("chuThich", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-6 md:col-span-4">
                    <Label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Chọn file <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-stretch">
                      <div className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l">
                        <Upload size={16} className="text-gray-600" />
                      </div>
                      <div className="relative flex-1">
                        <input
                          type="file"
                          id="file-upload"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={handleFileChange}
                        />
                        <label
                          htmlFor="file-upload"
                          className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-r bg-white cursor-pointer hover:bg-gray-50 h-full"
                        >
                          <span className="text-gray-500">
                            {formTaiLen.file
                              ? formTaiLen.file.name
                              : "Chọn tệp"}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={isAdding || isAddingMultiple || isAddingFile}
            className="bg-blue-600 hover:bg-blue-600 text-white"
          >
            <FileCheck size={16} className="mr-2" />
            {isAdding || isAddingExisting || isAddingMultiple || isAddingFile
              ? "Đang xử lý..."
              : "Đồng ý"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
