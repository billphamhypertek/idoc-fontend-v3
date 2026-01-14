"use client";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import AddLable from "@/components/label/AddLable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/ui/table"; // <-- dùng Table có sortable, pagination, emptyText
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Column } from "@/definitions/types/table.type";
import {
  useAddTagMutation,
  useDeleteTagMutation,
  useListObjectQuery,
  useListTagUnpageQuery,
  useRemoveObjectMutation,
  useUpdateTagMutation,
} from "@/hooks/data/label.data";
import { ToastUtils } from "@/utils/toast.utils";
import { Label } from "@/services/label.service";
import {
  CheckCircle,
  Edit,
  Plus,
  PlusIcon,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Document {
  id: string;
  typeName: string;
  number: string;
  code: string;
  objName: string;
  date: string;
  objId: string;
}

const ITEMS_PER_PAGE = 10;
const MAX_LABEL_LENGTH = 50;

export default function LabelsPage() {
  const router = useRouter();
  const [searchLabel, setSearchLabel] = useState("");
  const [searchDocument, setSearchDocument] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [newLabelName, setNewLabelName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [currentLabelPage, setCurrentLabelPage] = useState(1);
  const [currentDocumentPage, setCurrentDocumentPage] = useState(1);

  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingLabelName, setEditingLabelName] = useState("");

  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);

  const { data: allLabelsData = [] } = useListTagUnpageQuery();
  const allLabels: Label[] = Array.isArray(allLabelsData) ? allLabelsData : [];

  const { data: documentsResponse } = useListObjectQuery(
    selectedLabelId,
    currentDocumentPage,
    searchDocument
  );
  const documents = documentsResponse?.content || [];
  const totalDocuments = documentsResponse?.totalElements || 0;
  const totalDocumentPages = Math.ceil(totalDocuments / ITEMS_PER_PAGE);

  const addMutation = useAddTagMutation();
  const updateMutation = useUpdateTagMutation();
  const deleteMutation = useDeleteTagMutation();
  const removeMutation = useRemoveObjectMutation();

  const filteredLabels = allLabels.filter((label) =>
    label.name?.toLowerCase().includes(searchLabel?.toLowerCase())
  );

  const totalItems = Math.ceil(filteredLabels.length);
  const startLabelIndex = (currentLabelPage - 1) * ITEMS_PER_PAGE;
  const endLabelIndex = startLabelIndex + ITEMS_PER_PAGE;
  const paginatedLabels = filteredLabels.slice(startLabelIndex, endLabelIndex);

  const selectedLabelName =
    allLabels.find((l) => l.id === selectedLabelId)?.name || "";

  useEffect(() => {
    setCurrentDocumentPage(1);
  }, [selectedLabelId, searchDocument]);

  // Clear data when dialog opens
  useEffect(() => {
    if (isAddDialogOpen) {
      setNewLabelName("");
      setErrorMessage("");
      setEditingLabel(null);
      setEditingLabelId(null);
      setEditingLabelName("");
    }
  }, [isAddDialogOpen]);

  // Column definitions for Labels table
  const labelColumns: Column<Label>[] = [
    {
      header: "STT",
      className: "w-16 text-center text-sm",
      accessor: (item: Label, index: number) => (
        <div className="text-center text-sm">{startLabelIndex + index + 1}</div>
      ),
    },
    {
      header: "Nhãn",
      accessor: (item: Label, index: number) => {
        return editingLabelId === item.id ? (
          <div className="flex items-center space-x-2">
            <Input
              value={editingLabelName}
              onChange={(e) => setEditingLabelName(e.target.value)}
              onKeyDown={handleLabelKeyPress}
              className="h-9 text-sm"
              autoFocus
            />
            <Button
              size="sm"
              className="h-9 px-2 bg-blue-600 hover:bg-blue-700"
              onClick={handleSaveLabelEdit}
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 px-2"
              onClick={handleCancelLabelEdit}
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div
            className={`font-medium text-sm cursor-pointer hover:text-blue-600 transition-colors ${
              selectedLabelId === item.id
                ? "text-blue-600 font-semibold"
                : "text-gray-900"
            }`}
            onClick={() => handleLabelClick(item.id)}
            title={`Click để lọc văn bản theo nhãn '${item.name}'`}
          >
            {item.name}
            {selectedLabelId === item.id && (
              <span className="ml-2 text-xs text-blue-500">✓</span>
            )}
          </div>
        );
      },
    },
    {
      header: "Thao tác",
      type: "actions",
      className: "w-24 text-center",
      renderActions: (item: Label) => (
        <div className="flex items-center justify-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-8 p-0 hover:bg-blue-50"
                onClick={() => handleStartLabelEdit(item)}
                disabled={editingLabelId === item.id}
              >
                <Edit className="w-4 h-4 text-blue-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Chỉnh sửa nhãn</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-8 p-0 hover:bg-red-50"
                onClick={() => handleDeleteLabel(item.id)}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Xóa nhãn</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];

  // Column definitions for Documents table
  const documentColumns: Column<Document>[] = [
    {
      header: "STT",
      className: "w-10 text-center text-sm",
      accessor: (item: Document, index: number) => (
        <div className="text-center text-sm">
          {(currentDocumentPage - 1) * ITEMS_PER_PAGE + index + 1}
        </div>
      ),
    },
    {
      header: "Loại",
      className: "w-28",
      accessor: (item: Document) => (
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">
          {item.typeName}
        </span>
      ),
    },
    {
      header: "Số văn bản",
      className: "w-32",
      accessor: (item: Document) => (
        <span className="text-xs font-mono whitespace-nowrap">
          {item.code ? item.code : ""}
        </span>
      ),
    },
    {
      header: "Mô tả",
      className: "min-w-0 flex-1",
      accessor: (item: Document) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="line-clamp-3 cursor-pointer text-left">
              {item.objName}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-md p-3">
            <p className="text-sm whitespace-pre-wrap">{item.objName}</p>
          </TooltipContent>
        </Tooltip>
      ),
    },
    {
      header: "Ngày văn bản",
      className: "w-24",
      accessor: (item: Document) => (
        <span className="text-xs">{item.date ? item.date : ""}</span>
      ),
    },
    {
      header: "Thao tác",
      className: "w-16 text-center",
      type: "actions",
      renderActions: (item: Document) => (
        <div className="flex items-center justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-8 p-0 hover:bg-red-50"
                onClick={() => handleDeleteDocument(item.id)}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Xóa văn bản</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];

  // Handlers

  async function handleDeleteLabel(labelId: string) {
    try {
      await deleteMutation.mutateAsync(labelId);
      if (selectedLabelId === labelId) {
        setSelectedLabelId(null);
      }
    } catch (error) {
      console.error("Error deleting label:", error);
    }
  }

  function handleCancel() {
    setNewLabelName("");
    setErrorMessage("");
    setEditingLabel(null);
    setIsAddDialogOpen(false);
    setEditingLabelId(null);
    setEditingLabelName("");
  }

  function handleDialogOpenChange(open: boolean) {
    setIsAddDialogOpen(open);
    if (!open) {
      // Clear data when dialog closes
      setNewLabelName("");
      setErrorMessage("");
      setEditingLabel(null);
      setEditingLabelId(null);
      setEditingLabelName("");
    }
  }

  function handleLabelPageChange(page: number) {
    setCurrentLabelPage(page);
  }

  function handleDocumentPageChange(page: number) {
    setCurrentDocumentPage(page);
  }

  function handleLabelSearchChange(value: string) {
    setSearchLabel(value);
    setCurrentLabelPage(1);
  }

  function handleDocumentSearchChange(value: string) {
    setSearchDocument(value);
    setCurrentDocumentPage(1);
  }

  function handleStartLabelEdit(label: Label) {
    setEditingLabelId(label.id);
    setEditingLabelName(label.name);
  }

  async function handleSaveLabelEdit() {
    if (editingLabelName.trim() && editingLabelId) {
      if (editingLabelName.trim().length > MAX_LABEL_LENGTH) {
        ToastUtils.tenNhanVuotQuaKyTu(MAX_LABEL_LENGTH);
        return;
      }

      const original = allLabels.find((l) => l.id === editingLabelId);
      if (original) {
        const updated: Label = {
          ...original,
          name: editingLabelName.trim(),
        };
        const hasDuplicate = allLabels.some(
          (l) => l.name === editingLabelName.trim()
        );
        if (hasDuplicate) {
          ToastUtils.tenNhanDaTonTai();
          return;
        }
        try {
          await updateMutation.mutateAsync(updated);
          setEditingLabelId(null);
          setEditingLabelName("");
          ToastUtils.labelUpdateSuccess();
        } catch (error) {
          console.error("Error saving label edit:", error);
        }
      }
    }
  }

  function handleCancelLabelEdit() {
    setEditingLabelId(null);
    setEditingLabelName("");
  }

  function handleLabelKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSaveLabelEdit();
    } else if (e.key === "Escape") {
      handleCancelLabelEdit();
    }
  }

  function handleLabelClick(labelId: string) {
    setSelectedLabelId(selectedLabelId === labelId ? null : labelId);
  }

  function handleClearLabelFilter() {
    setSelectedLabelId(null);
    setCurrentDocumentPage(1);
    setSearchDocument("");
  }

  async function handleDeleteDocument(documentId: string) {
    if (selectedLabelId) {
      try {
        await removeMutation.mutateAsync({
          tagId: selectedLabelId,
          objId: documentId,
          type: "document",
        });
      } catch (error) {
        console.error("Error deleting document:", error);
      }
    }
  }

  function handleDocumentRowClick(document: Document) {
    // Determine document type based on typeName
    // If typeName contains "đến" or "den", it's a document-in
    // Otherwise, assume it's a document-out
    const isDocumentIn =
      document.typeName?.toLowerCase().includes("đến") ||
      document.typeName?.toLowerCase().includes("den");

    const detailUrl = isDocumentIn
      ? `/document-out/search/detail/${document.objId}`
      : `/document-in/search/draft-detail/${document.objId}`;

    router.push(detailUrl);
  }

  return (
    <TooltipProvider>
      <div className="pl-4 pr-4 space-y-4">
        <BreadcrumbNavigation
          items={[{ label: "Quản lý nhãn" }]}
          currentPage="Danh sách nhãn"
        />
        <div className="flex h-full mt-2 bg-gray-50 relative">
          {/* Left Section - Label Management */}
          <div className="w-2/5 bg-white border-r border-gray-200 p-3">
            {/* Search and Add */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10 pointer-events-none" />
                <Input
                  placeholder="Tìm kiếm nhãn..."
                  value={searchLabel}
                  onChange={(e) => handleLabelSearchChange(e.target.value)}
                  className="pl-10 pr-4 h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 relative z-0"
                />
                {searchLabel && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-9 w-8 p-0 hover:bg-gray-100"
                    onClick={() => handleLabelSearchChange("")}
                  >
                    <XCircle className="w-4 h-4 text-gray-400" />
                  </Button>
                )}
              </div>
              <AddLable
                isAddDialogOpen={isAddDialogOpen}
                handleDialogOpenChange={handleDialogOpenChange}
                newLabelName={newLabelName}
                setNewLabelName={setNewLabelName}
                onClose={handleCancel}
                renderBtn={() => (
                  <Button className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-sm font-medium shadow-sm">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Thêm nhãn
                  </Button>
                )}
              />
            </div>

            <Table
              sortable={true}
              columns={labelColumns}
              dataSource={paginatedLabels}
              itemsPerPage={ITEMS_PER_PAGE}
              currentPage={currentLabelPage}
              onPageChange={handleLabelPageChange}
              totalItems={totalItems}
              showPagination={true}
              bgColor="bg-white"
              className="overflow-hidden"
              emptyText="Không có nhãn"
              showPageSize={false}
            />
          </div>

          {/* Right Section - Document Management */}
          <div className="flex-1 bg-white p-3">
            {selectedLabelId && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-blue-700">
                      Đang lọc theo nhãn:{" "}
                      <span className="font-semibold">{selectedLabelName}</span>
                    </span>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      {totalDocuments} văn bản
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearLabelFilter}
                    className="h-9 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Bỏ lọc
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10 pointer-events-none" />
                <Input
                  placeholder="Tìm kiếm văn bản..."
                  value={searchDocument}
                  onChange={(e) => handleDocumentSearchChange(e.target.value)}
                  className="pl-10 pr-4 h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 relative z-0"
                />
                {searchDocument && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-9 w-8 p-0 hover:bg-gray-100"
                    onClick={() => handleDocumentSearchChange("")}
                  >
                    <XCircle className="w-4 h-4 text-gray-400" />
                  </Button>
                )}
              </div>
            </div>

            <Table
              sortable={true}
              columns={documentColumns}
              dataSource={documents}
              itemsPerPage={ITEMS_PER_PAGE}
              currentPage={currentDocumentPage}
              onPageChange={handleDocumentPageChange}
              totalItems={totalDocuments}
              showPagination={true}
              showPageSize={false}
              bgColor="bg-white"
              className="overflow-hidden"
              emptyText={
                !selectedLabelId
                  ? "Chọn một nhãn để xem văn bản"
                  : "Không tồn tại văn bản"
              }
              onSort={(sortConfig) => {
                console.log("Sort changed:", sortConfig);
              }}
              onRowClick={handleDocumentRowClick}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
