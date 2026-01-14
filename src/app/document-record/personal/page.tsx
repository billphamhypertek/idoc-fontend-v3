"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FileManagerToolbar } from "@/components/document-record/personal/FileManagerToolbar";
import { FileManagerGrid } from "@/components/document-record/personal/FileManagerGrid";
import { FileManagerTree } from "@/components/document-record/personal/FileManagerTree";
import {
  useDataDetailByFolderId,
  useListRootFolder,
  useCreateWorkProfile,
} from "@/hooks/data/document-record.data";
import { queryKeys } from "@/definitions";
import { DocumentRecordService } from "@/services/document-record.service";
import CreateWorkProfileModal from "@/components/common/CreateWorkProfileModal";
import AddDocumentModal from "@/components/document-record/AddDocumentModal";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";

export default function PersonalPage() {
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("name");
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [selectedFolderForDetail, setSelectedFolderForDetail] = useState<
    string | null
  >(null);
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddDocumentModalOpen, setIsAddDocumentModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("");
  const [breadcrumbPath, setBreadcrumbPath] = useState<
    Array<{ id: string; name: string }>
  >([{ id: "home", name: "Home" }]);
  // State để lưu children của các folder đã được load
  const [folderChildrenMap, setFolderChildrenMap] = useState<
    Record<string, any[]>
  >({});

  const { data: folderData, isLoading: isLoadingFolderData } =
    useDataDetailByFolderId(
      selectedFolderForDetail ?? "",
      true,
      filterType === "" ? undefined : filterType
    );

  const { data: rootFolders, refetch: refetchRootFolders } = useListRootFolder(
    filterType === "" ? undefined : filterType
  );

  const { mutate: createWorkProfile, isPending: isCreating } =
    useCreateWorkProfile();

  const folders = useMemo(
    () => folderData?.listFolder || [],
    [folderData?.listFolder]
  );
  const icons = folderData?.listIcon || [];

  useEffect(() => {
    if (selectedFolderForDetail && folders.length > 0) {
      setFolderChildrenMap((prev) => ({
        ...prev,
        [selectedFolderForDetail]: folders,
      }));
    }
  }, [selectedFolderForDetail, folders]);

  // Reset folderChildrenMap khi filterType thay đổi để lazy load lại
  useEffect(() => {
    setFolderChildrenMap({});
  }, [filterType]);

  // Xây dựng tree structure - chỉ hiển thị children khi đã được load
  const treeData = useMemo(() => {
    // Hàm đệ quy để xây dựng tree structure
    const buildTreeNode = (folder: any, level = 0): any => {
      const folderId = folder.id.toString();
      const children = folderChildrenMap[folderId];

      // Chỉ thêm children nếu đã được load (có trong folderChildrenMap)
      const childNodes =
        children && children.length > 0
          ? children.map((child: any) => buildTreeNode(child, level + 1))
          : undefined;

      return {
        id: folderId,
        name: folder.title || folder.name,
        icon: folder.iconType === "PERSONAL" ? "folder" : "folder",
        children: childNodes,
      };
    };

    const rootChildren = (rootFolders || []).map((folder: any) =>
      buildTreeNode(folder)
    );

    return [
      {
        id: "home",
        name: "Home",
        icon: "home",
        children: rootChildren,
      },
    ];
  }, [rootFolders, folderChildrenMap]);

  const displayFolders = folderData?.listFolder || rootFolders || [];
  const displayIcons = folderData?.listIcon || [];

  const handleAddProfile = () => {
    setIsCreateModalOpen(true);
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
          // Đóng modal sau khi tạo thành công
          setIsCreateModalOpen(false);
          // Reset folderChildrenMap để load lại dữ liệu
          setFolderChildrenMap({});
          // Refetch root folders
          refetchRootFolders();
        },
      }
    );
  };

  const handleFolderSelection = (folderId: string) => {
    setSelectedFolderId(folderId);
    // Tìm folder name từ rootFolders
    const folder = (rootFolders || []).find(
      (f: any) => f.id.toString() === folderId
    );
    if (folder) {
      setBreadcrumbPath([
        { id: "home", name: "Home" },
        { id: folderId, name: folder.title || folder.name || "Folder" },
      ]);
    }
  };

  const handleFolderSelect = (folderId: string) => {
    const currentCount = clickCounts[folderId] || 0;
    const newCount = currentCount + 1;
    setClickCounts((prev) => ({ ...prev, [folderId]: newCount }));

    if (newCount === 2) {
      setSelectedFolderForDetail(folderId);
      setSelectedFolderId(folderId);
      // Tìm folder name từ folders (subfolders)
      const folder = folders.find((f: any) => f.id.toString() === folderId);
      if (folder) {
        setBreadcrumbPath((prev) => [
          ...prev,
          { id: folderId, name: folder.title || folder.name || "Folder" },
        ]);
      }
    }
  };

  const handleAddDocument = () => {
    setIsAddDocumentModalOpen(true);
  };

  const handleAddDocumentSubmit = (data: any) => {
    setIsAddDocumentModalOpen(false);
  };

  const handleGoBack = () => {
    if (breadcrumbPath.length > 1) {
      const parentFolder = breadcrumbPath[breadcrumbPath.length - 2];
    }
    setSelectedFolderForDetail(null);
    setSelectedFolderId("");
    setClickCounts({});
    setBreadcrumbPath([{ id: "home", name: "Home" }]);
  };

  const handleBreadcrumbClick = (folderId: string) => {
    if (folderId === "home") {
      handleGoBack();
    } else {
      // Tìm vị trí của folder trong breadcrumb path
      const index = breadcrumbPath.findIndex((item) => item.id === folderId);
      if (index !== -1) {
        // Cắt breadcrumb path đến folder được click
        setBreadcrumbPath(breadcrumbPath.slice(0, index + 1));
        // Reset và navigate về folder đó
        if (index === 0) {
          // Click vào Home
          handleGoBack();
        } else {
          // Click vào folder trong path
          setSelectedFolderForDetail(folderId);
          setSelectedFolderId(folderId);
          setClickCounts({});
        }
      }
    }
  };

  const handleFilterChange = (type: string) => {
    setFilterType(type);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="px-4 pb-4">
        <BreadcrumbNavigation
          items={[
            {
              href: "/",
              label: "Hồ sơ tài liệu",
            },
          ]}
          currentPage="Hồ sơ cá nhân"
          showHome={false}
        />
      </div>
      <div className="flex flex-1 overflow-hidden bg-gray-50">
        <div className="flex-1 flex flex-col p-4 overflow-auto">
          <FileManagerToolbar
            viewMode={viewMode}
            sortBy={sortBy}
            onViewModeChange={setViewMode}
            onSortByChange={setSortBy}
            onAddProfile={handleAddProfile}
            onAddDocument={handleAddDocument}
            showAddDocument={!!selectedFolderId}
            onGoBack={handleGoBack}
            onFilterChange={handleFilterChange}
            filterType={filterType}
            breadcrumbPath={breadcrumbPath}
            onBreadcrumbClick={handleBreadcrumbClick}
            selectedFolderId={selectedFolderForDetail || selectedFolderId}
          />

          <FileManagerGrid
            folders={displayFolders}
            icons={displayIcons}
            viewMode={viewMode}
            sortBy={sortBy}
            onFolderSelect={handleFolderSelection}
            onFolderDoubleClick={handleFolderSelect}
            selectedFolderId={selectedFolderForDetail || selectedFolderId}
          />
        </div>

        <FileManagerTree
          treeData={treeData}
          onFolderSelect={(folderId) => {
            setSelectedFolderForDetail(folderId);
            setSelectedFolderId(folderId);
            // Cập nhật breadcrumb khi chọn folder từ tree
            if (folderId !== "home") {
              // Tìm folder name từ rootFolders hoặc folderChildrenMap
              let folder = (rootFolders || []).find(
                (f: any) => f.id.toString() === folderId
              );

              // Nếu không tìm thấy trong rootFolders, tìm trong folderChildrenMap
              if (!folder) {
                for (const children of Object.values(folderChildrenMap)) {
                  folder = children.find(
                    (f: any) => f.id.toString() === folderId
                  );
                  if (folder) break;
                }
              }

              if (folder) {
                setBreadcrumbPath([
                  { id: "home", name: "Home" },
                  {
                    id: folderId,
                    name: folder.title || folder.name || "Folder",
                  },
                ]);
              }
            } else {
              setBreadcrumbPath([{ id: "home", name: "Home" }]);
            }
            setClickCounts({});
          }}
        />
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
        folderId={selectedFolderId}
      />
    </div>
  );
}
