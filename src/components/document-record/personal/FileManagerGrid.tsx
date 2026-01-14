import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { Table } from "@/components/ui/table";
import { Column } from "@/definitions/types/table.type";
import { Menu, Item, contextMenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import {
  FolderPen,
  Info,
  Folder,
  Eye,
  CornerUpLeft,
  Trash,
} from "lucide-react";
import { DocumentRecordService } from "@/services/document-record.service";
import HSCNModal, { MoveToHSCVModal } from "./HSCNModal";
import {
  Dialog,
  CustomDialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import EditWorkProfileModal from "@/components/document-record/EditWorkProfileModal";
import {
  useUpdateWorkProfile,
  useDeleteWorkProfile,
  useDataDetailByFolderId,
  useStopShare,
  useSendToHSCV,
} from "@/hooks/data/document-record.data";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/definitions";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import ShareModal from "./ShareModal";

interface Folder {
  id: number;
  name?: string;
  title?: string;
  fileCode: string;
  totalItems?: number;
  totalDoc?: number;
  createDate?: number;
  button?: {
    typeFolder?: string;
    edit?: boolean;
    del?: boolean;
    share?: boolean;
    move2HSCN?: boolean;
    move2HSCV?: boolean;
    addDoc?: boolean;
    stopShare?: boolean;
  };
}

interface Icon {
  id: number;
  docId: string | null;
  name: string;
  fileType: string;
  iconType: string;
  docType: string | null;
  ngayTao: number;
  soKyHieu: string | null;
  downloadLink: string;
  button?: {
    typeFolder?: string;
    edit?: boolean;
    del?: boolean;
    share?: boolean;
    move2HSCN?: boolean;
    move2HSCV?: boolean;
    addDoc?: boolean;
    stopShare?: boolean;
  };
}

interface FileManagerGridProps {
  folders: Folder[];
  icons?: Icon[];
  viewMode: string;
  sortBy?: string;
  onFolderSelect?: (folderId: string) => void;
  onFolderDoubleClick?: (item: any) => void;
  currentFolderId?: string;
  selectedFolderId?: string;
  disableContextMenu?: boolean;
  searchTerm?: string;
  isModalMode?: boolean;
}

const MENU_ID = "folder-context-menu";

export function FileManagerGrid({
  folders,
  icons = [],
  viewMode,
  sortBy,
  onFolderSelect,
  onFolderDoubleClick,
  currentFolderId,
  selectedFolderId,
  disableContextMenu = false,
  searchTerm = "",
  isModalMode = false,
}: FileManagerGridProps) {
  const show = contextMenu.show;

  const [selectedFolder, setSelectedFolder] = React.useState<Folder | null>(
    null
  );
  const [selectedIcon, setSelectedIcon] = React.useState<Icon | null>(null);
  const [folderDetail, setFolderDetail] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFolderForEdit, setSelectedFolderForEdit] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isHSCNModalOpen, setIsHSCNModalOpen] = useState(false);
  const [isHSCVModalOpen, setIsHSCVModalOpen] = useState(false);
  const [movingFolderId, setMovingFolderId] = useState<string>("");
  const [movingToHSCVFolderId, setMovingToHSCVFolderId] = useState<string>("");
  const [lastClickedFolderId, setLastClickedFolderId] = useState<string>("");
  const [clickCount, setClickCount] = useState<number>(0);
  const [currentSelectedFolderId, setCurrentSelectedFolderId] =
    useState<string>("");

  useEffect(() => {
    setCurrentSelectedFolderId(currentFolderId || "");
  }, [currentFolderId]);

  useEffect(() => {
    setCurrentSelectedFolderId(currentFolderId || "");
    setLastClickedFolderId("");
    setClickCount(0);
  }, [currentFolderId]);

  useEffect(() => {
    setSelectedFolder(null);
    setSelectedIcon(null);
  }, [viewMode]);

  const { data: dataDetail, isLoading: isLoadingDataDetail } =
    useDataDetailByFolderId(currentSelectedFolderId, true);

  const { mutate: updateWorkProfile, isPending: isUpdating } =
    useUpdateWorkProfile();
  const { mutate: deleteWorkProfile, isPending: isDeleting } =
    useDeleteWorkProfile();
  const { mutate: stopShare } = useStopShare();
  const { mutate: sendToHSCV } = useSendToHSCV();
  const queryClient = useQueryClient();

  const normalize = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();

  const extractNumbers = (str: string) => {
    const matches = str.match(/\d+/g);
    return matches ? matches.map(Number) : [];
  };

  const compareByName = (a: Folder, b: Folder, direction: "asc" | "desc") => {
    const aName = normalize(a.name || a.title || "");
    const bName = normalize(b.name || b.title || "");
    if (aName < bName) return direction === "asc" ? -1 : 1;
    if (aName > bName) return direction === "asc" ? 1 : -1;
    return 0;
  };

  const compareByNumber = (a: Folder, b: Folder, direction: "asc" | "desc") => {
    const aNumbers = extractNumbers(a.name || a.title || "");
    const bNumbers = extractNumbers(b.name || b.title || "");

    const aFirstNum = aNumbers.length > 0 ? aNumbers[0] : 0;
    const bFirstNum = bNumbers.length > 0 ? bNumbers[0] : 0;

    if (aFirstNum !== bFirstNum) {
      return direction === "asc"
        ? aFirstNum - bFirstNum
        : bFirstNum - aFirstNum;
    }

    const aCodeNumbers = extractNumbers(a.fileCode || "");
    const bCodeNumbers = extractNumbers(b.fileCode || "");

    for (
      let i = 0;
      i < Math.max(aCodeNumbers.length, bCodeNumbers.length);
      i++
    ) {
      const aNum = aCodeNumbers[i] || 0;
      const bNum = bCodeNumbers[i] || 0;
      if (aNum !== bNum) {
        return direction === "asc" ? aNum - bNum : bNum - aNum;
      }
    }

    return 0;
  };

  const processedFolders = useMemo(() => {
    return folders.map((folder) => ({
      ...folder,
      button: isModalMode
        ? { ...folder.button, move2HSCV: true }
        : folder.button,
    }));
  }, [folders, isModalMode]);

  const sortedFolders = useMemo(() => {
    const toSort = currentSelectedFolderId
      ? dataDetail?.listFolder || []
      : processedFolders;
    if (isModalMode) {
    }

    let sorted = [...toSort];
    if (sortBy) {
      if (sortBy === "name-asc") {
        sorted.sort((a, b) => compareByName(a, b, "asc"));
      } else if (sortBy === "name-desc") {
        sorted.sort((a, b) => compareByName(a, b, "desc"));
      } else if (sortBy === "date-asc") {
        sorted.sort((a, b) => compareByNumber(a, b, "asc"));
      } else if (sortBy === "date-desc") {
        sorted.sort((a, b) => compareByNumber(a, b, "desc"));
      }
    }
    if (searchTerm) {
      const normalizedSearch = normalize(searchTerm);
      sorted = sorted.filter((folder) =>
        normalize(folder.name || folder.title || "").includes(normalizedSearch)
      );
    }
    return sorted;
  }, [
    sortBy,
    dataDetail,
    processedFolders,
    currentSelectedFolderId,
    searchTerm,
    isModalMode,
  ]);

  const foldersToRender = sortedFolders;
  const iconsToRender = dataDetail?.listIcon || [];

  const handleFolderClick = async (folderId: string) => {
    if (folderId === lastClickedFolderId) {
      const newClickCount = clickCount + 1;
      setClickCount(newClickCount);

      if (newClickCount === 1) {
        onFolderSelect?.(folderId);

        try {
          const response =
            await DocumentRecordService.getDataDetailByFolderId(folderId);
        } catch (error) {
          console.error("Lỗi gọi API lần 1:", error);
        }
      } else if (newClickCount === 2) {
        setCurrentSelectedFolderId(folderId);
        onFolderDoubleClick?.(folderId);
        setClickCount(0);
        setLastClickedFolderId("");
      }
    } else {
      setLastClickedFolderId(folderId);
      setClickCount(1);

      onFolderSelect?.(folderId);

      try {
        const response =
          await DocumentRecordService.getDataDetailByFolderId(folderId);
      } catch (error) {
        console.error("Lỗi gọi API lần 1:", error);
      }
    }
  };

  const handleContextMenu = (event: React.MouseEvent, item: Folder | Icon) => {
    if (disableContextMenu) {
      return;
    }
    event.preventDefault();
    let processedItem = item;
    if (isModalMode && "fileCode" in item) {
      processedItem = {
        ...item,
        button: {
          ...item.button,
          move2HSCV: true,
        },
      };
    }
    if ("fileCode" in processedItem) {
      setSelectedFolder(processedItem);
      setSelectedIcon(null);
    } else {
      setSelectedIcon(processedItem);
      setSelectedFolder(null);
    }
    show({
      id: MENU_ID,
      event: event,
    });
  };

  const handleRename = () => {
    if (selectedFolder) {
      setSelectedFolderForEdit(selectedFolder);
      setIsEditModalOpen(true);
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedFolder) {
      deleteWorkProfile(
        {
          folderId: "",
          id: selectedFolder.id.toString(),
          iconType: "FOLDER",
        },
        {
          onSuccess: () => {
            setIsDeleteModalOpen(false);
            setSelectedFolder(null);
            queryClient.invalidateQueries({
              queryKey: [queryKeys.documentRecord.dataDetailByFolderId],
            });
            queryClient.invalidateQueries({
              queryKey: [queryKeys.documentRecord.listRootFolder],
            });
          },
        }
      );
    }
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleInfo = async () => {
    if (!selectedFolder && !selectedIcon) return;

    setIsDetailDialogOpen(true);
    setLoadingDetail(true);
    try {
      let response;
      if (selectedFolder) {
        response = await DocumentRecordService.getById(
          selectedFolder.id.toString()
        );
      } else if (selectedIcon && selectedIcon.docId) {
        response = await DocumentRecordService.getDocs(selectedIcon.docId);
      }

      if (response) {
        setFolderDetail(response);
      } else {
        setFolderDetail(null);
      }
    } catch (error) {
      setFolderDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleStopShare = () => {
    if (selectedFolder) {
      stopShare(selectedFolder.id.toString());
    }
  };

  const handleMoveToHSCN = () => {
    const folderId = selectedFolder?.id || selectedIcon?.id;
    if (folderId) {
      setMovingFolderId(folderId.toString());
      setIsHSCNModalOpen(true);
    }
  };

  const handleMoveToHSCV = () => {
    const folderId = selectedFolder?.id;
    if (folderId) {
      setMovingToHSCVFolderId(folderId.toString());
      setIsHSCVModalOpen(true);
    }
  };

  const handleMoveSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.documentRecord.dataDetailByFolderId],
    });
    queryClient.invalidateQueries({
      queryKey: [queryKeys.documentRecord.listRootFolder],
    });
    setIsHSCNModalOpen(false);
    setMovingFolderId("");
  };

  const handleEditSubmit = (data: any) => {
    const formatDateToDisplay = (dateStr: string) => {
      if (!dateStr) return null;
      const [year, month, day] = dateStr.split("-");
      return `${day}/${month}/${year}`;
    };

    const apiData = {
      id: selectedFolderForEdit?.id,
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
      sheerNumber: data.sheetCount ? parseInt(data.sheetCount) : null,
      pageNumber: data.pageCount ? parseInt(data.pageCount) : null,
      format: data.physicalStatus || null,
    };

    updateWorkProfile(
      { data: apiData, approverId: data.approverId || "" },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setSelectedFolderForEdit(null);

          queryClient.invalidateQueries({
            queryKey: [queryKeys.documentRecord.listRootFolder],
          });

          if (currentFolderId) {
            queryClient.invalidateQueries({
              queryKey: [
                queryKeys.documentRecord.dataDetailByFolderId,
                currentFolderId,
              ],
            });
          } else {
            queryClient.invalidateQueries({
              queryKey: [queryKeys.documentRecord.dataDetailByFolderId, ""],
            });
          }
        },
      }
    );
  };

  if (viewMode === "list") {
    const columns: Column<Folder | Icon>[] = [
      {
        header: "Tên",
        accessor: (item) => (
          <div className="inline-flex items-center">
            <Image
              src={
                "fileCode" in item
                  ? "/v3/assets/images/files/folder.png"
                  : item.fileType?.toLowerCase().includes("pdf")
                    ? "/v3/assets/images/files/PDF.png"
                    : "/v3/assets/images/files/img_icon.png"
              }
              alt={"fileCode" in item ? "folder" : "file"}
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <span className="ml-2 text-blue-600 underline">
              {"fileCode" in item
                ? `${item.name || item.title} - ${item.fileCode}`
                : item.name}
            </span>
            {"fileCode" in item && (
              <span className="ml-1">
                ({item.totalItems || item.totalDoc || 0})
              </span>
            )}
          </div>
        ),
        className: "py-2 px-4 align-middle",
      },
      {
        header: "Ngày tạo",
        accessor: (item) => {
          if ("fileCode" in item && item.createDate) {
            const date = new Date(item.createDate);
            return date.toLocaleDateString("vi-VN");
          }
          if (!("fileCode" in item) && item.ngayTao) {
            const date = new Date(item.ngayTao);
            return date.toLocaleDateString("vi-VN");
          }
          return "03/11/2025";
        },
        className: "py-2 px-4 text-center align-middle",
      },
      {
        header: "Loại",
        accessor: (item) => ("fileCode" in item ? "Hồ sơ" : item.fileType),
        className: "py-2 px-4 text-center align-middle",
      },
    ];

    const data = [...foldersToRender, ...iconsToRender];

    return (
      <>
        <Table
          columns={columns}
          dataSource={data}
          onRowClick={(record) => {
            if ("fileCode" in record) {
              handleFolderClick(record.id.toString());
            }
          }}
          onRowDoubleClick={(record) => {
            onFolderDoubleClick?.(record);
          }}
          onRowContextMenu={(record, event) => handleContextMenu(event, record)}
          rowClassName={(record) => {
            const isSelected =
              "fileCode" in record &&
              selectedFolderId &&
              record.id.toString() === selectedFolderId;
            return `border-b cursor-pointer ${
              isSelected ? "bg-blue-100 hover:bg-blue-100" : "hover:bg-gray-50"
            }`;
          }}
          bgColor="bg-white"
        />
        <Menu
          key={selectedFolder?.id || selectedIcon?.id || "none"}
          id={MENU_ID}
        >
          {(() => {
            const item = selectedFolder || selectedIcon;
            return null;
          })()}

          {(selectedFolder || selectedIcon)?.button?.edit && (
            <Item onClick={handleRename} className="hover:bg-gray-50">
              <FolderPen className="w-4 h-4 mr-2" />
              Đổi tên
            </Item>
          )}
          {(selectedFolder || selectedIcon)?.button?.del && (
            <Item
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash className="w-4 h-4 mr-2" />
              Xóa
            </Item>
          )}
          {(selectedFolder || selectedIcon)?.button?.share && (
            <Item onClick={handleShare} className="hover:bg-gray-50">
              <Eye className="w-4 h-4 mr-2" />
              Chia Sẻ
            </Item>
          )}

          {/* ⭐ FIX: Show move2HSCV if isModalMode OR button.move2HSCV is true */}
          {(isModalMode ||
            (selectedFolder || selectedIcon)?.button?.move2HSCV) && (
            <Item onClick={handleMoveToHSCV} className="hover:bg-gray-50">
              Di chuyển sang HSCV
            </Item>
          )}
          <Item onClick={handleInfo} className="hover:bg-gray-50">
            <Info className="w-4 h-4 mr-2" />
            Thông tin
          </Item>
          {(selectedFolder || selectedIcon)?.button?.move2HSCN && (
            <Item onClick={handleMoveToHSCN} className="hover:bg-gray-50">
              <CornerUpLeft
                className="w-4 h-4 mr-2"
                style={{ transform: "scaleX(-1)" }}
              />
              Di chuyển sang HSCN
            </Item>
          )}
        </Menu>
        <Dialog open={isDetailDialogOpen} onOpenChange={() => {}}>
          <CustomDialogContent>
            <DialogHeader>
              <DialogTitle>Thông tin chi tiết hồ sơ</DialogTitle>
            </DialogHeader>
            {loadingDetail ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">Đang tải...</div>
              </div>
            ) : folderDetail ? (
              <Table
                columns={[
                  {
                    header: "Tên hồ sơ",
                    accessor: (item: any) => item.title,
                    className:
                      "py-2 px-4 font-medium bg-gray-50 border-r border-gray-300 w-1/3",
                  },
                  {
                    header: "Giá trị",
                    accessor: (item: any) => item.value,
                    className: "py-2 px-4",
                  },
                ]}
                dataSource={[
                  { title: "Tên hồ sơ", value: folderDetail.title || "" },
                  { title: "Mã hồ sơ", value: folderDetail.fileCode || "" },
                  {
                    title: "Mã cơ quan lưu trữ lịch sử",
                    value: folderDetail.identifier || "",
                  },
                  { title: "Mã phông", value: folderDetail.orgQLId || "" },
                  {
                    title: "Ngày tạo",
                    value: folderDetail.createDate
                      ? new Date(folderDetail.createDate).toLocaleDateString(
                          "vi-VN"
                        )
                      : "",
                  },
                  {
                    title: "Thời gian bảo quản",
                    value: folderDetail.mainternanceStr || "",
                  },
                  { title: "Chế độ sử dụng", value: folderDetail.rights || "" },
                  {
                    title: "Người lập hồ sơ",
                    value: folderDetail.creator || "",
                  },
                  { title: "Ngôn ngữ", value: folderDetail.language || "" },
                  {
                    title: "Năm hình thành hồ sơ",
                    value: folderDetail.year || "",
                  },
                  {
                    title: "Thời gian bắt đầu",
                    value: folderDetail.startDate
                      ? new Date(folderDetail.startDate).toLocaleDateString(
                          "vi-VN"
                        )
                      : "",
                  },
                  {
                    title: "Thời gian kết thúc",
                    value: folderDetail.endDate
                      ? new Date(folderDetail.endDate).toLocaleDateString(
                          "vi-VN"
                        )
                      : "",
                  },
                  {
                    title: "Tổng số văn bản trong hồ sơ",
                    value: folderDetail.totalDoc || 0,
                  },
                  {
                    title: "Tổng số trang của hồ sơ",
                    value: folderDetail.pageNumber || 0,
                  },
                  {
                    title: "Tổng số tờ của hồ sơ",
                    value: folderDetail.sheerNumber || 0,
                  },
                  { title: "Ghi chú", value: folderDetail.description || "" },
                  {
                    title: "Ký hiệu thông tin",
                    value: folderDetail.inforSign || "",
                  },
                  { title: "Từ khóa", value: folderDetail.keyword || "" },
                  {
                    title: "Tình trạng vật lý",
                    value: folderDetail.format || "",
                  },
                ]}
                showPagination={false}
                bgColor="bg-white"
              />
            ) : (
              <div className="text-red-500 py-8 text-center">
                Không thể tải dữ liệu
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsDetailDialogOpen(false)}>Đóng</Button>
            </DialogFooter>
          </CustomDialogContent>
        </Dialog>

        <EditWorkProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          folderId={selectedFolderForEdit?.id || ""}
        />

        <ConfirmDeleteDialog
          isOpen={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onConfirm={handleConfirmDelete}
          title="Hãy xác nhận"
          description={`Bạn có chắc chắn muốn xóa hồ sơ "${selectedFolder?.title}" không?`}
          confirmText="Đồng ý"
          cancelText="Đóng"
          isLoading={isDeleting}
        />

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          folderId={selectedFolder?.id.toString() || ""}
        />

        {isHSCNModalOpen && (
          <HSCNModal
            onClose={() => {
              setIsHSCNModalOpen(false);
              setMovingFolderId("");
            }}
            sourceFolderId={movingFolderId}
            onSuccess={handleMoveSuccess}
          />
        )}

        {isHSCVModalOpen && (
          <MoveToHSCVModal
            isOpen={isHSCVModalOpen}
            onClose={() => {
              setIsHSCVModalOpen(false);
              setMovingToHSCVFolderId("");
            }}
            folderId={movingToHSCVFolderId}
          />
        )}
      </>
    );
  }

  return (
    <>
      {isLoadingDataDetail && (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      )}
      <div className="grid grid-cols-4 gap-1">
        {foldersToRender.map((folder: Folder) => {
          const isSelected =
            selectedFolderId && folder.id.toString() === selectedFolderId;
          return (
            <div
              key={folder.id}
              className={`rounded-lg p-4 transition cursor-pointer flex flex-col items-center justify-center min-h-[120px] ${
                isSelected
                  ? "bg-blue-100 border-2"
                  : "hover:bg-gray-50 border-2 border-transparent"
              }`}
              onClick={() => handleFolderClick(folder.id.toString())}
              onDoubleClick={() => {
                onFolderDoubleClick?.(folder);
              }}
              onContextMenu={(e) => handleContextMenu(e, folder)}
            >
              <Image
                src="/v3/assets/images/files/folder.png"
                alt="Folder"
                width={48}
                height={48}
                className="mb-2"
              />
              <div className="text-center">
                <div className="text-blue-500 text-sm hover:underline">
                  {folder.name || folder.title} - {folder.fileCode}
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  ({folder.totalItems || folder.totalDoc || 0})
                </div>
              </div>
            </div>
          );
        })}
        {iconsToRender.map((icon: Icon) => (
          <div
            key={icon.id}
            className="rounded-lg p-4 transition cursor-pointer flex flex-col items-center justify-center min-h-[120px]"
            onClick={() => {}}
            onDoubleClick={() => {
              onFolderDoubleClick?.(icon);
            }}
            onContextMenu={(e) => handleContextMenu(e, icon)}
          >
            <Image
              src={
                icon.fileType?.toLowerCase().includes("pdf")
                  ? "/v3/assets/images/files/PDF.png"
                  : "/v3/assets/images/files/img_icon.png"
              }
              alt="File"
              width={48}
              height={48}
              className="mb-2"
            />
            <div className="text-center">
              <div className="text-blue-500 text-sm hover:underline">
                {icon.name}
              </div>
              <div className="text-gray-500 text-xs mt-1">{icon.fileType}</div>
            </div>
          </div>
        ))}
      </div>
      <Menu id={MENU_ID}>
        {(() => {
          const item = selectedFolder || selectedIcon;
          return null;
        })()}

        {(selectedFolder || selectedIcon)?.button?.edit && (
          <Item onClick={handleRename} className="hover:bg-gray-50">
            <FolderPen className="w-4 h-4 mr-2" />
            Đổi tên
          </Item>
        )}
        {(selectedFolder || selectedIcon)?.button?.del && (
          <Item
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash className="w-4 h-4 mr-2" />
            Xóa
          </Item>
        )}
        {(selectedFolder || selectedIcon)?.button?.share && (
          <Item onClick={handleShare} className="hover:bg-gray-50">
            <Eye className="w-4 h-4 mr-2" />
            Chia Sẻ
          </Item>
        )}
        {(isModalMode ||
          (selectedFolder || selectedIcon)?.button?.move2HSCV) && (
          <Item onClick={handleMoveToHSCV} className="hover:bg-gray-50">
            Di chuyển sang HSCV
          </Item>
        )}
        <Item onClick={handleInfo} className="hover:bg-gray-50">
          <Info className="w-4 h-4 mr-2" />
          Thông tin
        </Item>
        {(selectedFolder || selectedIcon)?.button?.move2HSCN && (
          <Item onClick={handleMoveToHSCN} className="hover:bg-gray-50">
            <CornerUpLeft
              className="w-4 h-4 mr-2"
              style={{ transform: "scaleX(-1)" }}
            />
            Di chuyển sang HSCN
          </Item>
        )}
      </Menu>
      <Dialog open={isDetailDialogOpen} onOpenChange={() => {}}>
        <CustomDialogContent>
          <DialogHeader>
            <DialogTitle>Thông tin chi tiết hồ sơ</DialogTitle>
          </DialogHeader>
          {loadingDetail ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">Đang tải...</div>
            </div>
          ) : folderDetail ? (
            <Table
              columns={[
                {
                  header: "Tên hồ sơ",
                  accessor: (item: any) => item.title,
                  className:
                    "py-2 px-4 font-medium bg-gray-50 border-r border-gray-300 w-1/3",
                },
                {
                  header: "Giá trị",
                  accessor: (item: any) => item.value,
                  className: "py-2 px-4",
                },
              ]}
              dataSource={[
                { title: "Tên hồ sơ", value: folderDetail.title || "" },
                { title: "Mã hồ sơ", value: folderDetail.fileCode || "" },
                {
                  title: "Mã cơ quan lưu trữ lịch sử",
                  value: folderDetail.identifier || "",
                },
                { title: "Mã phông", value: folderDetail.orgQLId || "" },
                {
                  title: "Ngày tạo",
                  value: folderDetail.createDate
                    ? new Date(folderDetail.createDate).toLocaleDateString(
                        "vi-VN"
                      )
                    : "",
                },
                {
                  title: "Thời gian bảo quản",
                  value: folderDetail.mainternanceStr || "",
                },
                { title: "Chế độ sử dụng", value: folderDetail.rights || "" },
                { title: "Người lập hồ sơ", value: folderDetail.creator || "" },
                { title: "Ngôn ngữ", value: folderDetail.language || "" },
                {
                  title: "Năm hình thành hồ sơ",
                  value: folderDetail.year || "",
                },
                {
                  title: "Thời gian bắt đầu",
                  value: folderDetail.startDate
                    ? new Date(folderDetail.startDate).toLocaleDateString(
                        "vi-VN"
                      )
                    : "",
                },
                {
                  title: "Thời gian kết thúc",
                  value: folderDetail.endDate
                    ? new Date(folderDetail.endDate).toLocaleDateString("vi-VN")
                    : "",
                },
                {
                  title: "Tổng số văn bản trong hồ sơ",
                  value: folderDetail.totalDoc || 0,
                },
                {
                  title: "Tổng số trang của hồ sơ",
                  value: folderDetail.pageNumber || 0,
                },
                {
                  title: "Tổng số tờ của hồ sơ",
                  value: folderDetail.sheerNumber || 0,
                },
                { title: "Ghi chú", value: folderDetail.description || "" },
                {
                  title: "Ký hiệu thông tin",
                  value: folderDetail.inforSign || "",
                },
                { title: "Từ khóa", value: folderDetail.keyword || "" },
                {
                  title: "Tình trạng vật lý",
                  value: folderDetail.format || "",
                },
              ]}
              showPagination={false}
              bgColor="bg-white"
            />
          ) : (
            <div className="text-red-500 py-8 text-center">
              Không thể tải dữ liệu
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </CustomDialogContent>
      </Dialog>

      <EditWorkProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        folderId={selectedFolderForEdit?.id || ""}
      />

      <ConfirmDeleteDialog
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        title="Hãy xác nhận"
        description={`Bạn có chắc chắn muốn xóa hồ sơ "${selectedFolder?.title}" không?`}
        confirmText="Đồng ý"
        cancelText="Đóng"
        isLoading={isDeleting}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        folderId={selectedFolder?.id.toString() || ""}
      />

      {isHSCNModalOpen && (
        <HSCNModal
          onClose={() => {
            setIsHSCNModalOpen(false);
            setMovingFolderId("");
          }}
          sourceFolderId={movingFolderId}
          onSuccess={handleMoveSuccess}
        />
      )}
    </>
  );
}
