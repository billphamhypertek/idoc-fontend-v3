"use client";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { TrackingDialog } from "@/components/dialogs/TrackingDialog";
import { VehicleRequestDialog } from "@/components/dialogs/VehicleRequestDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import AttachedFiles from "@/components/vehicles/attachedFiles";
import CommentsSection from "@/components/vehicles/commentSection";
import { TransferHandler } from "@/components/vehicles/transferHandler";
import VehicleRequestInfo from "@/components/vehicles/vehicleRequestInfo";
import {
  useAcceptDraft,
  useCompleteDraft,
  useGetListLeaderById,
  useGetListSuggestVehicleDriver,
  useGetStartNodes,
  useGetVehicleDetail,
  useGetVehicleUsagePlanComments,
  useMenuBadge,
  useRejectDraft,
  useRetakeDraft,
  useUpdateDraft,
} from "@/hooks/data/vehicle.data";
import { VehicleService } from "@/services/vehicle.service";
import { ToastUtils } from "@/utils/toast.utils";
import {
  ChevronLeft,
  Edit,
  Eye,
  Loader2,
  MoreHorizontal,
  Trash2,
  Undo2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import VehicleCommandDialog from "@/components/dialogs/VehicleCommanDialog";
import useAuthStore from "@/stores/auth.store";
import { Constant } from "@/definitions/constants/constant";
import dynamic from "next/dynamic";
import { viewFile } from "@/utils/file.utils";
import { isVerifierPDFOrDocx } from "@/utils/common.utils";
const DocumentViewer = dynamic(
  () => import("@/components/common/DocumentViewer"),
  {
    ssr: false,
  }
);

type Props = {
  params: {
    id: string;
  };
};

export default function VehicleRequestDetailPage({ params }: Props) {
  const router = useRouter();
  const { id } = params;
  const parsedId = parseInt(id, 10);
  const {
    data: vehicleDetail,
    isLoading,
    refetch,
  } = useGetVehicleDetail(parsedId, !!parsedId);
  const { data: startNodes } = useGetStartNodes();
  const { data: commentsData } = useGetVehicleUsagePlanComments(parsedId);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);
  const { mutateAsync: retakeDraft } = useRetakeDraft();
  const { mutateAsync: acceptDraft } = useAcceptDraft();
  const { mutateAsync: updateDraft } = useUpdateDraft();
  const { mutateAsync: completeDraft } = useCompleteDraft();
  const { mutateAsync: rejectDraft } = useRejectDraft();
  const { refetch: refetchMenuBadge } = useMenuBadge();
  const [selectedSignatureTypes, setSelectedSignatureTypes] = useState<
    Record<number, string>
  >({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [isCommandDialogOpen, setIsCommandDialogOpen] = useState(false);
  const [isEditCommandDialogOpen, setIsEditCommandDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [commandData, setCommandData] = useState<any>({});
  const { user } = useAuthStore();
  const { data: drivers } = useGetListSuggestVehicleDriver(user?.org ?? 0);
  const { data: listOrgCVV } = useGetListLeaderById(
    vehicleDetail?.handleType == "ORG" ? (user?.orgModel.parentId ?? 0) : 237,
    !!vehicleDetail && !!user
  );

  // Prepare files for DocumentViewer
  const pdfFiles = useMemo(
    () =>
      vehicleDetail?.attachments
        .filter((att) => isVerifierPDFOrDocx(att))
        .map((att) => ({
          id: att.id,
          name: att.name,
          displayName: att.displayName,
          encrypt: att.encrypt,
          fileType: "vehicle" as const,
        })),
    [vehicleDetail]
  );

  useEffect(() => {
    if (!selectedFile && pdfFiles && pdfFiles?.length > 0) {
      setSelectedFile(pdfFiles[0]);
    }
  }, [pdfFiles]);

  const commandInitialData = useMemo(
    () => ({
      licensePlate: vehicleDetail?.licensePlate || undefined,
      type: vehicleDetail?.type || undefined,
      driverName: vehicleDetail?.driverName || undefined,
      driverPhone: vehicleDetail?.driverPhone || "",
      distance: vehicleDetail?.distance ? String(vehicleDetail.distance) : "",
      ...(vehicleDetail?.signer2 && listOrgCVV
        ? {
            commandSigner: listOrgCVV.find(
              (signer) => signer.fullName === vehicleDetail.signer2
            ),
          }
        : {}),
      commandNumber: vehicleDetail?.ticketNumber,
      startDate: vehicleDetail?.startDate
        ? new Date(vehicleDetail.startDate)
        : undefined,
      startTime: vehicleDetail?.startDate
        ? new Date(vehicleDetail.startDate)
        : undefined,
      endDate: vehicleDetail?.endDate
        ? new Date(vehicleDetail.endDate)
        : undefined,
      endTime: vehicleDetail?.endDate
        ? new Date(vehicleDetail.endDate)
        : undefined,
      commandDate: vehicleDetail?.commandDate
        ? new Date(vehicleDetail.commandDate)
        : undefined,
    }),
    [vehicleDetail, listOrgCVV]
  );
  const vehicleRequestFiles = useMemo(
    () =>
      vehicleDetail?.attachments.map((attachment, index) => ({
        ...attachment,
        thaoTac: {
          download: true,
          view: attachment.type === "application/pdf" && !attachment.encrypt,
          signature: "Ký CA" as const,
        },
      })),
    [vehicleDetail?.attachments]
  );

  interface ReturnItem {
    userFullName: string;
    comment: string;
    createDate: string;
  }

  const columns = [
    {
      header: "#",
      accessor: (_: ReturnItem, index: number) => index + 1,
      className: "text-center w-12",
    },
    {
      header: "Người trả lại",
      accessor: "userFullName" as keyof ReturnItem,
    },
    {
      header: "Nội dung",
      accessor: (item: ReturnItem) => (
        <div>
          <div>{item.comment}</div>
          <div className="text-sm text-gray-500">
            {new Date(item.createDate).toLocaleString("vi-VN")}
          </div>
        </div>
      ),
    },
  ];

  const getDocNumber = () => {
    const numberOrSign = vehicleDetail?.numberOrSign
      ? vehicleDetail.numberOrSign
      : "CNTT";
    const numberInBook = vehicleDetail?.numberInBook
      ? `${vehicleDetail?.numberInBook}`
      : "";
    if (numberOrSign.includes(numberInBook)) {
      return numberOrSign;
    }
    return numberInBook + numberOrSign;
  };

  const handleDeleteRequest = async () => {
    try {
      await VehicleService.deleteVehicleUsagePlan(parsedId);
      ToastUtils.vehicleRequestDeleteSuccess();
      setIsDeleteDialogOpen(false);
      router.back();
    } catch (error) {
      console.error("Delete error:", error);
      ToastUtils.vehicleRequestDeleteError();
    }
  };

  const handleRetake = () => {
    retakeDraft(parsedId, {
      onSuccess: () => {
        refetch();
        router.back();
      },
      onError: (error) => {
        console.error("Retake error:", error);
      },
    });
  };

  const handleReject = () => {
    rejectDraft(
      { id: parsedId, comment: rejectComment },
      {
        onSuccess: async () => {
          await refetchMenuBadge();
          setIsRejectDialogOpen(false);
          refetch();
          router.back();
        },
        onError: (error) => {
          console.error("Reject error:", error);
        },
      }
    );
  };

  const handleAccept = (data: any) => {
    acceptDraft(parsedId, {
      onSuccess: () => {
        updateDraft(
          { ...data, id: parsedId },
          {
            onSuccess: () => {
              setIsCommandDialogOpen(false);
              refetch();
            },
            onError: (error) => {
              console.error("Update after accept error:", error);
            },
          }
        );
      },
      onError: (error) => {
        console.error("Accept error:", error);
      },
    });
  };

  const handleEditCommand = (data: any) => {
    updateDraft(
      { ...data, id: parsedId },
      {
        onSuccess: () => {
          setIsEditCommandDialogOpen(false);
          refetch();
        },
        onError: (error) => {
          console.error("Edit command error:", error);
        },
      }
    );
  };

  const handleFinish = () => {
    completeDraft([parsedId], {
      onSuccess: () => {
        refetch();
        router.back();
      },
      onError: (error) => {
        console.error("Finish error:", error);
      },
    });
  };

  const handleViewFile = (file: any) => {
    setSelectedFile(file?.id);
    viewFile(file, Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_VEHICLE);
  };

  const handleDownloadFile = async (fileId: number) => {
    try {
      const blob = await VehicleService.getDocumentFile(fileId);
      const url = URL.createObjectURL(blob);
      const attachment = vehicleDetail?.attachments.find(
        (a) => a.id === fileId
      );
      const fileName = attachment ? attachment.name : "document.pdf";

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const handleFileChange = (file: any) => {
    setSelectedFile(file);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Spinner variant="ring" size={48} className="text-blue-600" />
          <p className="text-gray-600 text-sm">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }
  if (!vehicleDetail) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Không tìm thấy dữ liệu</p>
      </div>
    );
  }
  const action = vehicleDetail.action || {};

  const comments = commentsData || [];

  const listReturn = comments.filter(
    (c) => c.type === "TRA_LAI" || c.handleStatus === "TRA_LAI"
  );

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAccept(commandData);
  };

  const handleEditCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleEditCommand(commandData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <div className="flex-1 p-3 space-y-4">
          {/* Breadcrumb */}
          <BreadcrumbNavigation
            items={[
              {
                href: "/manage-vehicle/register",
                label: "Quản lý xe",
              },
            ]}
            currentPage="Chi tiết phiếu xe"
          />

          <div className="space-y-3 lg:space-y-0">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <h1 className="text-2xl font-bold text-gray-900 flex-shrink-0">
                Chi tiết phiếu xin xe
              </h1>
              <div className="flex items-center gap-1 flex-wrap justify-start lg:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 h-9 px-2 text-xs"
                  onClick={() => setIsTrackingDialogOpen(true)}
                >
                  <Eye className="w-4 h-4" />
                  Theo dõi
                </Button>
                {startNodes && startNodes.length > 0 && (
                  <TransferHandler
                    // usagePlanId phải là id của phiếu (vehicleDetail.id), không phải nodeId
                    selectedItemId={vehicleDetail.id}
                    disabled={
                      !vehicleDetail.id ||
                      !vehicleDetail.nodeId ||
                      !action.canTransfer
                    }
                    key={vehicleDetail.id}
                    // currentNode vẫn truyền nodeId để workflow biết bước hiện tại
                    currentNode={vehicleDetail.nodeId}
                    onSuccess={refetch}
                  />
                )}
                {action.canRetake && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 h-9 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                    onClick={handleRetake}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Thu hồi
                  </Button>
                )}
                {action.canAccept && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 h-9 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                    onClick={() => setIsCommandDialogOpen(true)}
                  >
                    <Edit className="w-4 h-4" />
                    Tạo lệnh điều xe
                  </Button>
                )}
                {action.canEditCommand && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 h-9 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                    onClick={() => setIsEditCommandDialogOpen(true)}
                  >
                    <Edit className="w-4 h-4" />
                    Sửa lệnh điều xe
                  </Button>
                )}
                {action.canFinish && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 h-9 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                    onClick={handleFinish}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Hoàn thành xử lý
                  </Button>
                )}
                {action.canReject && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 h-9 px-2 text-xs bg-red-600 hover:bg-red-700 text-white border-red-600"
                    onClick={() => setIsRejectDialogOpen(true)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Trả lại
                  </Button>
                )}
                {action.canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!action.canEdit}
                    className="flex items-center gap-1 h-9 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white border-blue-600 disabled:bg-gray-400 disabled:text-white disabled:border-gray-400"
                    onClick={() => {
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                    Sửa phiếu
                  </Button>
                )}
                {action.canDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={!action.canDelete}
                    className="flex items-center gap-1 h-9 px-2 text-xs bg-red-600 hover:bg-red-700 text-white border-red-600 disabled:bg-gray-400 disabled:text-white disabled:border-gray-400"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 h-9 px-2 text-xs"
                  onClick={() => router.back()}
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <VehicleRequestInfo vehicleDetail={vehicleDetail} />

          {listReturn?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Thông tin trả lại</CardTitle>
              </CardHeader>
              <CardContent>
                <Table
                  sortable={true}
                  columns={columns}
                  dataSource={listReturn ?? []}
                  showPagination={false}
                  emptyText="Không có dữ liệu"
                />
              </CardContent>
            </Card>
          )}

          {/* DocumentViewer - hiển thị khi có file được chọn */}
          {selectedFile?.id && pdfFiles?.length && pdfFiles?.length > 0 && (
            <DocumentViewer
              files={pdfFiles}
              selectedFile={selectedFile}
              documentTitle="Tài liệu đính kèm"
              handleDownloadFile={handleDownloadFile}
              onFileChange={handleFileChange}
              fileType={Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_VEHICLE}
            />
          )}

          <AttachedFiles
            vehicleRequestFiles={vehicleRequestFiles ?? []}
            selectedSignatureTypes={selectedSignatureTypes}
            setSelectedSignatureTypes={setSelectedSignatureTypes}
            handleViewFile={handleViewFile}
            handleDownloadFile={handleDownloadFile}
            selectedFileId={selectedFile?.id}
            setSelectedFileId={(fileId: number | null) =>
              setSelectedFile(pdfFiles?.find((f) => f.id === fileId))
            }
            docNumber={getDocNumber()}
          />
        </div>

        <div className="w-80 bg-white border-l border-gray-200 p-6 space-y-6 min-h-screen">
          <CommentsSection id={parsedId} />
        </div>
      </div>

      <Button
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg"
        size="sm"
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>

      <TrackingDialog
        isOpen={isTrackingDialogOpen}
        onOpenChange={setIsTrackingDialogOpen}
        trackingId={parsedId}
      />
      <VehicleRequestDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        action={"update"}
        onSubmit={async () => {
          await refetch();
        }}
        parsedId={parsedId || undefined}
      />

      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteRequest}
        description="Bạn có muốn xóa văn bản này"
      />

      <VehicleCommandDialog
        isOpen={isCommandDialogOpen}
        onOpenChange={setIsCommandDialogOpen}
        isEditMode={false}
        onSubmit={handleAccept}
        drivers={drivers}
        signers={listOrgCVV}
      />

      <VehicleCommandDialog
        isOpen={isEditCommandDialogOpen}
        onOpenChange={setIsEditCommandDialogOpen}
        isEditMode={true}
        onSubmit={handleEditCommand}
        initialData={commandInitialData}
        drivers={drivers}
        signers={listOrgCVV}
      />
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trả lại</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="rejectComment">Nội dung trả lại</Label>
            <Textarea
              id="rejectComment"
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
            />
            <Button onClick={handleReject}>Xác nhận</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
