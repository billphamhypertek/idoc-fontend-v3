import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DocumentRecordService } from "@/services/document-record.service";
import {
  useGetListFolder,
  useGetListByFolderIdNew,
} from "@/hooks/data/document-record.data";
import React, { useEffect, useMemo, useState } from "react";
import { FileCheck } from "lucide-react";
import { ToastUtils } from "@/utils/toast.utils";

type IconType =
  | "ORG"
  | "PERSONAL"
  | "SHARE"
  | "FILE"
  | "DOC"
  | null
  | undefined;

interface FolderNode {
  id: string | number;
  name: string;
  title?: string;
  fileCode?: string;
  parentId: string | number | null;
  hasChild?: boolean;
  expanded?: boolean;
  nodeIcon?: string;
  iconType?: IconType;
  totalItems?: number;
  totalDoc?: number;
}

interface ListDataItem {
  id: string | number;
  name?: string;
  title?: string;
  fileCode?: string;
  soKyHieu?: string;
  ngayTao?: string | number | Date;
  downloadLink?: string;
  docType?: "VAN_BAN_DEN" | "VAN_BAN_DI";
  iconType: IconType;
  active?: boolean;
  totalDoc?: number;
}

interface DataCurrentFolder {
  listFolder: ListDataItem[];
  listIcon: ListDataItem[];
  listDocument: any[];
}

interface SelectHstlProps {
  docId?: string | number | null;
  docType?: string | null;
  folderId?: string | null; // source folder when transfer
  fileId?: string | null; // source file when transfer
  onTransferSuccess?: () => void;
  onAddDocumentSuccess?: () => void;
  onClose: () => void;
  showSelectHstlModal: boolean;
  setShowSelectHstlModal: (show: boolean) => void;
}

export default function SelectHstl({
  docId = null,
  docType = null,
  folderId = null,
  fileId = null,
  onTransferSuccess,
  onAddDocumentSuccess,
  onClose,
  showSelectHstlModal,
  setShowSelectHstlModal,
}: SelectHstlProps) {
  // Tree and listing state
  const [folderList, setFolderList] = useState<FolderNode[]>([]);
  const [folderObject, setFolderObject] = useState<FolderNode[]>([]);
  const [dataCurrentFolder, setDataCurrentFolder] =
    useState<DataCurrentFolder | null>(null);
  const [documentList, setDocumentList] = useState<ListDataItem[]>([]);

  const [currentFolderId, setCurrentFolderId] = useState<string | number | "">(
    ""
  );
  const [currentFolderName, setCurrentFolderName] = useState<string>("Home");
  const [selectedItem, setSelectedItem] = useState<ListDataItem | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<
    string | number | undefined
  >(undefined);
  const [breadcrumbString, setBreadcrumbString] = useState<string[]>([]);
  const [currentIconType, setCurrentIconType] = useState<IconType>(undefined);

  // UI controls
  const [isShowList, setIsShowList] = useState<boolean>(false);
  const [textSearch, setTextSearch] = useState<string>("");
  const [searchTree, setSearchTree] = useState<string>("");
  const [isDirectionNameDown, setIsDirectionNameDown] = useState<boolean>(true);
  const [isDirectionTimeDown, setIsDirectionTimeDown] = useState<boolean>(true);
  const [backHomes, setBackHomes] = useState<string>("");

  // Hooks for data fetching
  const { data: folderListData } = useGetListFolder(
    undefined,
    showSelectHstlModal
  );
  const { data: folderContentData } = useGetListByFolderIdNew(
    currentFolderId,
    showSelectHstlModal
  );

  // Process folder list data
  useEffect(() => {
    if (folderListData) {
      // First prepare the tree without mapping
      const prepared = prepareFolderTree(folderListData);
      setFolderList(prepared);
      setFolderObject(prepared);
    }
  }, [folderListData]);

  // Update folder list with icon types after folderList is set
  useEffect(() => {
    if (folderListData && folderList.length > 0) {
      const mapped = mappingShareFolder(folderListData);
      const prepared = prepareFolderTree(mapped);
      setFolderList(prepared);
      setFolderObject(prepared);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderListData]);

  // Process folder content data
  useEffect(() => {
    if (folderContentData && folderList.length > 0) {
      setDataCurrentFolder(folderContentData);
      const merged = mergerList(folderContentData);
      const name = getFolderName(currentFolderId);
      if (name) setCurrentFolderName(name);
      const breadcrumb = getBreadcrumbArray(currentFolderId);
      setBreadcrumbString(breadcrumb);
      const iconType = getIconType(currentFolderId);
      setCurrentIconType(iconType);
      mappingIconType(iconType, merged, setDocumentList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderContentData, currentFolderId, folderList]);

  // This function is now replaced by the useGetListByFolderIdNew hook
  // Just update currentFolderId to trigger refetch
  const getListByFolderId = async (fid: string | number | "") => {
    setCurrentFolderId(fid);
  };

  const mappingIconType = (
    iconType: IconType,
    list: ListDataItem[],
    setter: (v: ListDataItem[]) => void
  ) => {
    const updated = list.map((el) => ({
      ...el,
      iconType: el.iconType == null ? iconType : el.iconType,
    }));
    setter(updated);
  };

  const getIconType = (folderId: any): IconType => {
    const f = folderList.find((x) => x.id == folderId);
    if (f) {
      if (f.iconType == null) {
        return getIconType((f as any).parentId);
      }
      return f.iconType as IconType;
    }
    return undefined;
  };

  const getIconTypeOfRoot = (folderId: any): IconType => {
    const folder = folderList.find((item) => item.id == folderId);
    if (folder) {
      if (folder.parentId != null && folder.parentId != 0) {
        return getIconTypeOfRoot(folder.parentId);
      }
      return folder.iconType as IconType;
    }
    return undefined;
  };

  const getFolderName = (folderId: any) => {
    const f = folderList.find((x) => x.id == folderId);
    return f?.name;
  };

  const getBreadcrumbArray = (folderId: any) => {
    const arr: string[] = [];
    const build = (fid: any) => {
      const f = folderList.find((x) => x.id == fid);
      if (f) {
        arr.unshift(f.name);
        if (f.parentId != null) build(f.parentId);
      }
    };
    build(folderId);
    return arr;
  };

  const mergerList = (data: DataCurrentFolder | null) => {
    if (!data) return [] as ListDataItem[];
    const folders = (data.listFolder || []).map((i) => ({
      ...i,
      type: "FOLDER",
    }));
    const icons = (data.listIcon || []).map((i) => ({ ...i, type: "DOC" }));
    return [...folders, ...icons] as ListDataItem[];
  };

  // This function is now replaced by the useGetListFolder hook
  // Data is processed in useEffect when folderListData changes

  const mappingShareFolder = (list: FolderNode[]) => {
    return (list || []).map((el) => {
      const e: FolderNode = { ...el } as any;
      if (e.parentId != null && e.parentId != 0) {
        e.iconType = getIconTypeOfRoot(e.parentId);
      }
      return e;
    });
  };

  const prepareFolderTree = (list: FolderNode[]) => {
    const homeFolder: FolderNode = {
      id: 0,
      name: "Home",
      parentId: null,
      expanded: true,
      hasChild: true,
      nodeIcon: "fa fa-home text-danger",
      iconType: undefined,
    };
    const folders = [homeFolder, ...list.map((x) => ({ ...x }))];
    for (let i = 0; i < folders.length; i++) {
      if (folders[i].parentId == null && folders[i].id != 0) {
        (folders[i] as any).parentId = 0;
      }
    }
    for (let i = 0; i < folders.length; i++) {
      const hasChild = folders.some(
        (x) =>
          folders[i].id != null &&
          folders[i].id == (x as any).parentId &&
          folders[i].id != x.id
      );
      folders[i].hasChild = hasChild;
      folders[i].expanded = true;
      if (folders[i].id != 0 && folders[i].iconType == "SHARE") {
        folders[i].nodeIcon = "ti ti-sharethis text-info";
      } else if (folders[i].iconType == "ORG") {
        folders[i].nodeIcon = "fa fa-users";
      } else if (folders[i].id != 0) {
        folders[i].nodeIcon = "fa fa-folder-open text-warning";
      }
    }
    return folders;
  };

  // Tree filtering
  const filteredTree = useMemo(() => {
    const text = searchTree.trim().toLowerCase();
    if (!text) return folderObject;
    const ids = new Set<any>();
    const byName = folderList.filter((f) =>
      f.name?.toLowerCase().startsWith(text)
    );
    const collectParents = (f: FolderNode | undefined) => {
      if (!f) return;
      ids.add(f.id);
      const parent = folderList.find((x) => x.id == f.parentId);
      if (parent) collectParents(parent);
    };
    byName.forEach((f) => collectParents(f as any));
    return folderList.filter((f) => ids.has(f.id)) as FolderNode[];
  }, [searchTree, folderList, folderObject]);

  const isFolder = (type: IconType) => {
    return type == "ORG" || type == "PERSONAL" || type == "SHARE";
  };

  const getIconName = (name?: string) => {
    const n = (name || "").toLowerCase();
    if (n.includes(".pdf")) return "PDF.png";
    if (n.includes(".doc")) return "doc_upload.png";
    if (n.includes(".xls")) return "excel.png";
    if (n.includes(".png") || n.includes(".jpg") || n.includes(".gif"))
      return "img_icon.png";
    return "other.png";
  };

  const getTypeString = (item: ListDataItem) => {
    if (isFolder(item.iconType)) return "Hồ sơ";
    if (item.iconType === "DOC") {
      return item.docType === "VAN_BAN_DEN" ? "VBDE" : "VBDI";
    }
    return "Cá nhân";
  };

  const doClickItem = (item: ListDataItem) => {
    setSelectedItem((prev) => (prev ? { ...prev, active: false } : null));
    const updated = documentList.map((x) => ({
      ...x,
      active: x.id === item.id,
    }));
    setDocumentList(updated);
    setSelectedItem({ ...item, active: true });
    if (isFolder(item.iconType)) {
      setSelectedFolderId(String(item.id));
      const name = getFolderName(item.id);
      if (name) setCurrentFolderName(name);
    }
  };

  const doDblItem = async (item: ListDataItem) => {
    if (!item) return;
    if (isFolder(item.iconType)) {
      setCurrentFolderId(item.id);
      setSelectedFolderId(String(item.id));
      await getListByFolderId(item.id as any);
    } else if (item.iconType == "FILE") {
      // In Angular: open viewer or download. Here just download via link if exists
      if ((item.name || "").toLowerCase().includes(".pdf")) {
        if (item.downloadLink) window.open(item.downloadLink, "_blank");
      } else if (item.downloadLink) {
        window.open(item.downloadLink, "_blank");
      }
    } else if (item.iconType == "DOC") {
      openDocument(item);
    }
  };

  const openDocument = (item: ListDataItem) => {
    const api =
      item.docType === "VAN_BAN_DI"
        ? `/document-in/search/draft-detail/${item.id}`
        : `/document-out/search/detail/${item.id}`;
    const url = api; // Adjust if need base path
    window.open(url, "_blank");
  };

  const doBack = async () => {
    const parentId = getParentId(currentFolderId);
    setCurrentFolderId(parentId ? parentId : "");
    await getListByFolderId(parentId ? parentId : "");
  };

  const getParentId = (folderId: any) => {
    const folder = folderList.find((item) => item.id == folderId);
    if (folder) return folder.parentId;
    return null;
  };

  const mainSearchChange = () => {
    const search = textSearch.toLowerCase();
    const filtered = [
      ...(dataCurrentFolder?.listFolder || []).filter((i) =>
        (i.name || "").toLowerCase().includes(search)
      ),
      ...(dataCurrentFolder?.listIcon || []).filter((i) =>
        (i.name || "").toLowerCase().includes(search)
      ),
    ] as ListDataItem[];
    setDocumentList(filtered);
  };

  const sortName = () => {
    const dir = isDirectionNameDown ? -1 : 1;
    const sorted = [
      ...(dataCurrentFolder?.listFolder || []).sort((a: any, b: any) =>
        a.name > b.name ? dir : -dir
      ),
      ...(dataCurrentFolder?.listIcon || []).sort((a: any, b: any) =>
        a.name > b.name ? dir : -dir
      ),
    ] as ListDataItem[];
    setDocumentList(sorted);
    setIsDirectionNameDown(!isDirectionNameDown);
  };

  const sortTime = () => {
    const dir = isDirectionTimeDown ? -1 : 1;
    const getT = (d: any) => (d ? new Date(d).getTime() : 0);
    const sorted = [
      ...(dataCurrentFolder?.listFolder || []).sort((a: any, b: any) =>
        getT(a.ngayTao) > getT(b.ngayTao) ? dir : -dir
      ),
      ...(dataCurrentFolder?.listIcon || []).sort((a: any, b: any) =>
        getT(a.ngayTao) > getT(b.ngayTao) ? dir : -dir
      ),
    ] as ListDataItem[];
    setDocumentList(sorted);
    setIsDirectionTimeDown(!isDirectionTimeDown);
  };

  const doAddDocument = async () => {
    if (!selectedFolderId) return;
    const documents: any[] = [];
    const documentInfo: any = {
      comment: "",
      docId: docId,
      type: docType,
      folderId: selectedFolderId,
    };
    documents.push(documentInfo);
    try {
      await DocumentRecordService.doAddDocument(
        String(selectedFolderId),
        documents
      );
      ToastUtils.success("Thêm tài liệu thành công!");
      if (onAddDocumentSuccess) {
        onAddDocumentSuccess();
      }
      onClose();
    } catch (e) {
      ToastUtils.error("Lỗi khi thêm tài liệu");
    }
  };

  const doTransferHSTL = async () => {
    try {
      if (fileId) {
        const fid = selectedFolderId ? String(selectedFolderId) : "";
        const dId = docId == null ? 0 : docId;
        await DocumentRecordService.transferFileToOtherFolder(
          String(fileId),
          String(folderId || ""),
          String(fid),
          String(dId)
        );
      } else {
        await DocumentRecordService.transferFolder(
          String(folderId),
          selectedFolderId ? String(selectedFolderId) : ""
        );
      }
      ToastUtils.success("Di chuyển Hồ sơ cá nhân thành công!");
      onTransferSuccess?.();
      onClose();
    } catch (e) {
      ToastUtils.error("Di chuyển thất bại");
    }
  };

  const backHome = () => {
    setBackHomes("1");
  };

  // UI rendering helpers
  const TreeNodeView: React.FC<{ node: FolderNode; level?: number }> = ({
    node,
    level = 0,
  }) => {
    const hasChildren = folderList.some((x) => x.parentId == node.id);
    const children = folderList.filter((x) => x.parentId == node.id);
    const isSelected = String(currentFolderId) === String(node.id);
    return (
      <div>
        <div
          className={`px-2 py-1 cursor-pointer rounded hover:bg-gray-100 ${isSelected ? "bg-blue-50" : ""}`}
          style={{ paddingLeft: 8 + level * 12 }}
          onClick={async () => {
            const fid = node.id != 0 ? String(node.id) : "";
            if (currentFolderId !== fid) {
              setCurrentFolderId(fid);
              setSelectedFolderId(fid);
              await getListByFolderId(fid);
            }
          }}
        >
          <span className="mr-2 text-gray-500">{hasChildren ? "▾" : "·"}</span>
          <span>{node.name}</span>
        </div>
        {hasChildren &&
          children.map((c) => (
            <TreeNodeView key={String(c.id)} node={c} level={level + 1} />
          ))}
      </div>
    );
  };

  return (
    <Dialog open={showSelectHstlModal} onOpenChange={setShowSelectHstlModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chọn Hồ sơ cá nhân</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-4">
              <input
                className="w-full border rounded px-2 py-1 mb-2"
                placeholder="Tìm kiếm hồ sơ"
                value={searchTree}
                onChange={(e) => setSearchTree(e.target.value)}
              />
              <div className="border rounded max-h-[360px] overflow-auto p-1">
                {filteredTree.map((n) =>
                  n.parentId === null || n.parentId === undefined ? (
                    <TreeNodeView key={String(n.id)} node={n} />
                  ) : null
                )}
              </div>
            </div>
            <div className="col-span-12 md:col-span-8">
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="secondary" onClick={doBack}>
                  ←
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    ToastUtils.error("Mở tạo/cập nhật hồ sơ (chưa hỗ trợ)")
                  }
                >
                  + Thêm hồ sơ
                </Button>
                <Button
                  variant="secondary"
                  onClick={sortName}
                  title="Sắp xếp theo tên"
                >
                  {isDirectionNameDown ? "A↓" : "A↑"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={sortTime}
                  title="Sắp xếp theo ngày"
                >
                  {isDirectionTimeDown ? "#↓" : "#↑"}
                </Button>
                <input
                  className="flex-1 border rounded px-2 py-1"
                  placeholder="Tìm kiếm"
                  value={textSearch}
                  onChange={(e) => setTextSearch(e.target.value)}
                  onBlur={mainSearchChange}
                />
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    variant={isShowList ? "default" : "outline"}
                    onClick={() => setIsShowList(true)}
                  >
                    Danh sách
                  </Button>
                  <Button
                    variant={!isShowList ? "default" : "outline"}
                    onClick={() => setIsShowList(false)}
                  >
                    Lưới
                  </Button>
                </div>
              </div>

              <div className="mt-3 flex items-center text-sm text-gray-700 gap-1">
                <img
                  src="/v3/assets/images/home.png"
                  alt="home"
                  className="w-4 h-4 cursor-pointer"
                  onClick={backHome}
                />
                {breadcrumbString.map((item, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="text-gray-400">›</span>}
                    <span>{item}</span>
                  </React.Fragment>
                ))}
              </div>

              <div className="min-h-[320px] mt-3">
                {documentList?.length > 0 ? (
                  isShowList ? (
                    <div className="overflow-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-left border-b">
                            <th className="py-2">Tên</th>
                            <th className="py-2 text-center">Ngày tạo</th>
                            <th className="py-2 text-center">Số ký hiệu</th>
                            <th className="py-2 text-center">Loại</th>
                          </tr>
                        </thead>
                        <tbody>
                          {documentList.map((item) => (
                            <tr
                              key={String(item.id)}
                              className={`${item.active ? "bg-blue-100" : ""} hover:bg-gray-50 cursor-pointer`}
                              onClick={() => doClickItem(item)}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                doClickItem(item);
                              }}
                            >
                              <td
                                className="py-2 align-middle"
                                onDoubleClick={() => doDblItem(item)}
                              >
                                <span className="inline-flex items-center gap-2">
                                  {isFolder(item.iconType) && (
                                    <img
                                      src="/v3/assets/images/folder.png"
                                      className="w-4 h-4"
                                    />
                                  )}
                                  {item.iconType === "FILE" && (
                                    <img
                                      src={`/v3/assets/images/${getIconName(item.name)}`}
                                      className="w-4 h-4"
                                    />
                                  )}
                                  {item.iconType === "DOC" && (
                                    <img
                                      src="/v3/assets/images/doc.png"
                                      className="w-4 h-4"
                                    />
                                  )}
                                  <span className="text-blue-600 underline">
                                    {(isFolder(item.iconType)
                                      ? `${item.title || ""} - ${item.fileCode || ""}`
                                      : item.name) || ""}
                                  </span>
                                  {isFolder(item.iconType) && (
                                    <span>({item.totalDoc || 0})</span>
                                  )}
                                </span>
                              </td>
                              <td className="py-2 text-center align-middle">
                                {item.ngayTao
                                  ? new Date(item.ngayTao).toLocaleDateString(
                                      "vi-VN"
                                    )
                                  : ""}
                              </td>
                              <td className="py-2 text-center align-middle">
                                {item.soKyHieu || ""}
                              </td>
                              <td className="py-2 text-center align-middle">
                                {getTypeString(item)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="grid grid-cols-12 gap-3">
                      {documentList.map((item) => (
                        <div
                          key={String(item.id)}
                          className={`col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 p-2 rounded border ${item.active ? "bg-blue-100" : "bg-white"}`}
                          onClick={() => doClickItem(item)}
                          onDoubleClick={() => doDblItem(item)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            doClickItem(item);
                          }}
                          title={
                            isFolder(item.iconType)
                              ? `${item.title || ""} - ${item.fileCode || ""}`
                              : item.name
                          }
                        >
                          <div className="text-center">
                            {isFolder(item.iconType) && (
                              <img
                                src="/v3/assets/images/folder.png"
                                className="w-12 h-12 mx-auto"
                              />
                            )}
                            {item.iconType === "FILE" && (
                              <img
                                src={`/v3/assets/images/${getIconName(item.title || item.name)}`}
                                className="w-12 h-12 mx-auto"
                              />
                            )}
                            {item.iconType === "DOC" && (
                              <img
                                src="/v3/assets/images/doc.png"
                                className="w-12 h-12 mx-auto"
                              />
                            )}
                          </div>
                          <div className="mt-2 text-center text-sm">
                            <div className="text-blue-600 underline truncate">
                              {isFolder(item.iconType)
                                ? `${item.title || ""} - ${item.fileCode || ""}`
                                : item.name}
                            </div>
                            {isFolder(item.iconType) && (
                              <div>({item.totalDoc || 0})</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <span>Không có dữ liệu</span>
                )}
              </div>

              <div className="mt-3">
                <input
                  className="w-full border rounded px-2 py-1"
                  value={`Đang chọn: ${currentFolderName}`}
                  disabled
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t px-4 py-2">
          <Button
            variant="secondary"
            disabled={!selectedFolderId && !backHomes}
            onClick={() =>
              folderId == null ? doAddDocument() : doTransferHSTL()
            }
          >
            <FileCheck size={16} className="mr-2" />
            Đồng ý
          </Button>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
