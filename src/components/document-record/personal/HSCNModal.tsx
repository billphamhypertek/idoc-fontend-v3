import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Save } from "lucide-react";
import SelectCustom from "@/components/common/SelectCustom";
import { useQuery } from "@tanstack/react-query";
import FileManager from "./FileManager";
import { DocumentRecordService } from "@/services/document-record.service";
import { useToast } from "@/hooks/use-toast";
import CreateWorkProfileModal from "@/components/common/CreateWorkProfileModal";
import AddDocumentModal from "@/components/document-record/AddDocumentModal";
import { useCreateWorkProfile } from "@/hooks/data/document-record.data";

interface MoveToHSCVModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string;
}

export const MoveToHSCVModal: React.FC<MoveToHSCVModalProps> = ({
  isOpen,
  onClose,
  folderId,
}) => {
  const [folderName, setFolderName] = useState("");
  const [maintenance, setMaintenance] = useState("");
  const [approverId, setApproverId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch folder details
  const { data: folderDetail } = useQuery({
    queryKey: ["folderDetail", folderId],
    queryFn: () => DocumentRecordService.getById(folderId),
    enabled: isOpen && !!folderId,
  });

  // Fetch maintenance options
  const { data: maintenanceData } = useQuery({
    queryKey: ["maintenanceOptions"],
    queryFn: () => DocumentRecordService.doLoadEnum("THHS"),
    enabled: isOpen,
  });

  // Fetch approvers
  const { data: approversData } = useQuery({
    queryKey: ["approvers", folderDetail?.orgQLId],
    queryFn: () =>
      DocumentRecordService.getUsersByOrgWithAuthority(
        folderDetail?.orgQLId?.toString() || "2",
        "DUYET_HOSO"
      ),
    enabled: isOpen && !!folderDetail?.orgQLId,
  });

  const maintenanceOptions =
    maintenanceData?.data?.map((item: any) => ({
      label: item.name,
      value: item.code,
    })) || [];

  const approverOptions =
    approversData?.data?.map((item: any) => ({
      label: item.fullName,
      value: item.id.toString(),
    })) || [];

  useEffect(() => {
    if (folderDetail) {
      setFolderName(folderDetail.title || "");
    }
  }, [folderDetail]);

  const isFormValid = folderName.trim() && maintenance && approverId;

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsLoading(true);
    try {
      await DocumentRecordService.sendToHSCV(folderId, approverId, maintenance);
      onClose();
    } catch (error) {
      console.error("Error moving to HSCV:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-bold">Di chuyển sang HSCV</DialogTitle>
          <button
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 text-2xl leading-none"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </DialogHeader>

        <div className="space-y-4">
          <div className="w-full">
            <div className="space-y-2">
              <Label htmlFor="folderName">Tên hồ sơ</Label>
              <Input
                id="folderName"
                placeholder="Nhập tên hồ sơ"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="w-full">
            <div className="space-y-2">
              <Label htmlFor="maintenance">Thời hạn</Label>
              <SelectCustom
                value={maintenance}
                onChange={(value) => {
                  const strValue = Array.isArray(value) ? value[0] : value;
                  setMaintenance(strValue as string);
                }}
                placeholder="Chọn thời hạn"
                className="w-full"
                options={maintenanceOptions}
              />
            </div>
          </div>

          <div className="w-full">
            <div className="space-y-2">
              <Label htmlFor="approverId">
                <span className="text-red-500">Người duyệt</span>
              </Label>
              <SelectCustom
                value={approverId}
                onChange={(value) => {
                  const strValue = Array.isArray(value) ? value[0] : value;
                  setApproverId(strValue as string);
                }}
                placeholder="Chọn người duyệt"
                className="w-full"
                options={approverOptions}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Đang xử lý..." : "Đồng ý"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface HSCNModalProps {
  onClose: () => void;
  sourceFolderId: string;
  onSuccess?: () => void;
}

const HSCN = ({ onClose, sourceFolderId, onSuccess }: HSCNModalProps) => {
  const { toast } = useToast();
  const [selectedTargetFolder, setSelectedTargetFolder] = useState<string>("");
  const [expandedFolderId, setExpandedFolderId] = useState<string>("");
  const [isMoving, setIsMoving] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddDocumentModalOpen, setIsAddDocumentModalOpen] = useState(false);

  const { mutate: createWorkProfile, isPending: isCreating } =
    useCreateWorkProfile();

  const handleSubmit = async () => {
    if (!selectedTargetFolder) {
      toast({
        title: "Vui lòng chọn thư mục đích",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsMoving(true);
      await DocumentRecordService.transferFolder(
        sourceFolderId,
        selectedTargetFolder
      );

      toast({
        title: "Di chuyển thành công",
        variant: "default",
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: "Di chuyển thất bại",
        variant: "destructive",
      });
    } finally {
      setIsMoving(false);
    }
  };

  const handleFolderSelect = (folderId: string) => {
    setSelectedTargetFolder(folderId);
  };

  const handleFolderDoubleClick = (folderId: string) => {
    // Không làm gì khi double click trong modal chọn folder đích
  };

  const handleAddProfile = () => {
    setIsCreateModalOpen(true);
  };

  const handleAddDocument = () => {
    setIsAddDocumentModalOpen(true);
  };

  const handleAddDocumentSubmit = (data: any) => {
    setIsAddDocumentModalOpen(false);
  };

  const handleCreateProfile = (data: any) => {
    const formatDateToDisplay = (dateStr: string) => {
      if (!dateStr) return null;
      const [year, month, day] = dateStr.split("-");
      return `${day}/${month}/${year}`;
    };

    const physicalStatusMap: Record<string, string> = {
      BT: "Bình thường",
      HH: "Hư hỏng",
    };

    const apiData = {
      fileCode: data.code,
      year: parseInt(data.year),
      fileNotation: data.fileNumber,
      title: data.title,
      headingsId: parseInt(data.headingId),
      maintenance: parseInt(data.maintenance),
      rights: data.usageMode || null,
      language: data.language || null,
      startTime: formatDateToDisplay(data.startDate),
      endTime: formatDateToDisplay(data.endDate),
      informationSign: data.infoCode || null,
      description: data.description || null,
      keyword: data.keywords || null,
      pageNumber: data.sheetCount ? parseInt(data.sheetCount) : null,
      pageAmount: data.pageCount ? parseInt(data.pageCount) : null,
      totalReliability: data.physicalStatus
        ? physicalStatusMap[data.physicalStatus]
        : null,
      folderType: data.folderType,
    };

    createWorkProfile(
      { data: apiData, approverId: "" },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[7xl] max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold">Chọn Hồ sơ cá nhân</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <FileManager
            isModalMode={true}
            excludeFolderId={sourceFolderId}
            selectedFolderId={expandedFolderId}
            onFolderSelect={handleFolderSelect}
            onFolderDoubleClick={(folderId) => setExpandedFolderId(folderId)}
            onFolderExpand={setExpandedFolderId}
            onTreeFolderSelect={setExpandedFolderId}
            showToolbarActions={true}
            onAddProfile={handleAddProfile}
            onAddDocument={handleAddDocument}
            showAddDocument={!!selectedTargetFolder}
            onGoBack={() => setExpandedFolderId("")}
            disableContextMenu={false}
            reverseLayout={true}
            hideTypeDropdown={true}
            showSortButtons={true}
            showFilterDropdown={false}
          />
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            className={`px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 transition flex items-center gap-2 ${
              !selectedTargetFolder || isMoving
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={handleSubmit}
            disabled={!selectedTargetFolder || isMoving}
          >
            <Save size={16} />
            <span>{isMoving ? "Đang di chuyển..." : "Đồng ý"}</span>
          </button>
          <button
            className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 transition flex items-center gap-2"
            onClick={onClose}
            disabled={isMoving}
          >
            <X size={16} className="text-red-500" />
            <span>Đóng</span>
          </button>
        </div>
      </div>

      <CreateWorkProfileModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProfile}
        hideApprover={true}
        hideFolderType={true}
      />

      <AddDocumentModal
        isOpen={isAddDocumentModalOpen}
        onClose={() => setIsAddDocumentModalOpen(false)}
        onSubmit={handleAddDocumentSubmit}
        folderId={selectedTargetFolder}
      />
    </div>
  );
};

export default HSCN;
