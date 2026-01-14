import React, { useState } from "react";
import { FileManagerToolbar } from "./FileManagerToolbar";
import { FileManagerGrid } from "./FileManagerGrid";
import { FileManagerTree } from "./FileManagerTree";
import {
  useListRootFolder,
  useDataDetailByFolderId,
} from "@/hooks/data/document-record.data";

interface FileManagerProps {
  isModalMode?: boolean;
  filterType?: string;
  excludeFolderId?: string;
  selectedFolderId?: string;
  onFolderSelect?: (folderId: string) => void;
  onFolderDoubleClick?: (folderId: string) => void;
  onFolderExpand?: (folderId: string) => void;
  onTreeFolderSelect?: (folderId: string) => void;
  showToolbarActions?: boolean;
  onAddProfile?: () => void;
  onAddDocument?: () => void;
  showAddDocument?: boolean;
  onGoBack?: () => void;
  disableContextMenu?: boolean;
  reverseLayout?: boolean;
  hideTypeDropdown?: boolean;
  showSortButtons?: boolean;
  showFilterDropdown?: boolean;
}

export default function FileManager({
  isModalMode = false,
  filterType: externalFilterType,
  excludeFolderId,
  selectedFolderId: externalSelectedFolderId,
  onFolderSelect,
  onFolderDoubleClick,
  onFolderExpand,
  onTreeFolderSelect,
  showToolbarActions = true,
  onAddProfile,
  onAddDocument,
  showAddDocument = false,
  onGoBack,
  disableContextMenu = false,
  reverseLayout = false,
  hideTypeDropdown = false,
  showSortButtons = true,
  showFilterDropdown = true,
}: FileManagerProps) {
  const [internalSelectedFolderId, setInternalSelectedFolderId] =
    useState<string>("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("name");
  const [lastClickedFolderId, setLastClickedFolderId] = useState<string>("");
  const [clickCount, setClickCount] = useState<number>(0);
  const [tempFolderId, setTempFolderId] = useState<string>("");
  const [internalFilterType, setInternalFilterType] = useState<string>(
    externalFilterType || ""
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  const selectedFolderId =
    externalSelectedFolderId !== undefined
      ? externalSelectedFolderId
      : internalSelectedFolderId;

  const filterType =
    externalFilterType !== undefined ? externalFilterType : internalFilterType;

  const handleFolderSelect = (folderId: string) => {
    if (isModalMode) {
      // In modal mode: single click to select, double click to expand
      if (folderId === lastClickedFolderId) {
        setClickCount((prev) => {
          const newCount = prev + 1;
          if (newCount === 2) {
            onFolderDoubleClick?.(folderId);
            return 0; // reset
          }
          return newCount;
        });
      } else {
        setLastClickedFolderId(folderId);
        setClickCount(1);
        onFolderSelect?.(folderId);
      }
    } else {
      if (folderId === lastClickedFolderId) {
        setClickCount((prev) => {
          const newCount = prev + 1;
          if (newCount === 2) {
            if (onFolderSelect) {
              onFolderSelect(folderId);
            } else if (onFolderDoubleClick) {
              onFolderDoubleClick(folderId);
            } else {
              setInternalSelectedFolderId(folderId);
            }
          }
          return newCount;
        });
      } else {
        setLastClickedFolderId(folderId);
        setClickCount(1);
        setTempFolderId(folderId);
      }
    }
  };

  const handleFilterChange = (type: string) => {
    setInternalFilterType(type);
  };

  const handleTreeFolderSelect = (folderId: string) => {
    if (onTreeFolderSelect) {
      onTreeFolderSelect(folderId);
    }
  };

  const handleGoBackClick = () => {
    if (onGoBack) {
      onGoBack();
    }
  };

  const { data: rootFoldersData, isLoading: isLoadingRootFolders } =
    useListRootFolder(filterType === "" ? undefined : filterType);
  const { data: folderDetailData, isLoading: isLoadingFolderDetail } =
    useDataDetailByFolderId(
      selectedFolderId || "",
      true,
      filterType === "" ? undefined : filterType
    );
  const { data: tempData, isLoading: isLoadingTemp } = useDataDetailByFolderId(
    tempFolderId || "",
    !!tempFolderId,
    filterType === "" ? undefined : filterType
  );

  const folders = Array.isArray(rootFoldersData)
    ? rootFoldersData
    : rootFoldersData?.data || [];

  const filteredFolders = excludeFolderId
    ? folders.filter((f: any) => f.id?.toString() !== excludeFolderId)
    : folders;

  const clientFilteredFolders = filteredFolders;

  const treeData = [
    {
      id: "home",
      name: "Home",
      icon: "home",
      children: clientFilteredFolders.map((folder: any) => ({
        id: folder.id.toString(),
        name: folder.name,
        icon: folder.iconType === "PERSONAL" ? "folder" : "folder",
      })),
    },
  ];

  const updatedTreeData = selectedFolderId
    ? [
        {
          id: "home",
          name: "Home",
          icon: "home",
          children: [
            ...(folderDetailData?.data?.listFolder || [])
              .filter(
                (folder: any) => folder.id?.toString() !== excludeFolderId
              )
              .map((folder: any) => ({
                id: folder.id.toString(),
                name: folder.title,
                icon: folder.iconType === "PERSONAL" ? "folder" : "folder",
              })),
          ],
        },
      ]
    : treeData;

  const displayFolders = selectedFolderId
    ? folderDetailData?.data?.listFolder || []
    : clientFilteredFolders;

  const displayIcons = selectedFolderId
    ? folderDetailData?.data?.listIcon || []
    : [];

  const TreeComponent = (
    <FileManagerTree
      treeData={updatedTreeData}
      onFolderSelect={
        onTreeFolderSelect ? handleTreeFolderSelect : handleFolderSelect
      }
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    />
  );

  const ContentComponent = (
    <div className="flex-1 flex flex-col p-4 overflow-auto">
      <FileManagerToolbar
        viewMode={viewMode}
        sortBy={sortBy}
        onViewModeChange={setViewMode}
        onSortByChange={setSortBy}
        onAddProfile={showToolbarActions ? onAddProfile : undefined}
        onAddDocument={showToolbarActions ? onAddDocument : undefined}
        showAddDocument={showAddDocument}
        onGoBack={onGoBack ? handleGoBackClick : undefined}
        onFilterChange={handleFilterChange}
        filterType={filterType}
        showFilterDropdown={showFilterDropdown}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <FileManagerGrid
        folders={displayFolders}
        icons={displayIcons}
        viewMode={viewMode}
        sortBy={sortBy}
        onFolderSelect={handleFolderSelect}
        onFolderDoubleClick={onFolderDoubleClick}
        currentFolderId={selectedFolderId}
        disableContextMenu={disableContextMenu}
        searchTerm={searchTerm}
        isModalMode={isModalMode}
      />
    </div>
  );

  return (
    <div
      className={`flex ${isModalMode ? "h-full" : "h-screen"} ${isModalMode ? "" : "bg-gray-50"}`}
    >
      {reverseLayout ? (
        <>
          {TreeComponent}
          {ContentComponent}
        </>
      ) : (
        <>
          {ContentComponent}
          {TreeComponent}
        </>
      )}
    </div>
  );
}
