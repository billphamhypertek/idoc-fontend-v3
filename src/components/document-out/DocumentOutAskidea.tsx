import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TableBase,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Constant } from "@/definitions/constants/constant";
import { CERT_OBJ_TYPE } from "@/definitions/enums/document.enum";
import { TokenInfo } from "@/definitions/types/auth.type";
import { ToastUtils } from "@/utils/toast.utils";
import { uploadFileService } from "@/services/file.service";
import { notificationService } from "@/services/notification.service";
import { b64DecodeUnicode } from "@/services/shared.service";
import { getTokenInfo } from "@/services/signature.service";
import { handleError } from "@/utils/common.utils";
import { getUserInfo } from "@/utils/token.utils";
import { DocumentService } from "@/services/document.service";
import { UserService } from "@/services/user.service";
import {
  ChevronDown,
  ChevronRight,
  KeyIcon,
  Trash2,
  User2,
  University,
} from "lucide-react";
import * as React from "react";
import { useRouter } from "next/navigation";

interface DocumentOutAskideaProps {
  docId: string;
  onClose: () => void;
  showAskIdeaModal: boolean;
  setShowAskIdeaModal: (show: boolean) => void;
}

export default function DocumentOutAskidea({
  docId,
  onClose,
  showAskIdeaModal,
  setShowAskIdeaModal,
}: DocumentOutAskideaProps) {
  const [comment, setComment] = React.useState<string>("");
  // Keep files as File[] and attach encrypt flag directly on each File
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [validFiles, setValidFiles] = React.useState<boolean>(true);
  const [inSubmit, setInSubmit] = React.useState<boolean>(false);
  const ENCRYPTION_TWD = Constant.ENCRYPTION_TWD;
  const router = useRouter();

  type TreeNode = {
    data: any;
    children?: TreeNode[];
    expanded?: boolean;
  };

  const [tree, setTree] = React.useState<TreeNode[]>([]);
  const [loadingTree, setLoadingTree] = React.useState<boolean>(false);
  const [selectedUsers, setSelectedUsers] = React.useState<
    { id: string | number; name: string }[]
  >([]);

  React.useEffect(() => {
    const load = async () => {
      setLoadingTree(true);
      try {
        const raw = await UserService.getTreeUsers();
        const normalized: TreeNode[] = customData(raw || []);
        setTree(normalized);
      } catch (e) {
        setTree([]);
      } finally {
        setLoadingTree(false);
      }
    };
    load();
  }, []);

  const customData = (list: any[]): TreeNode[] => {
    const clone = (list || []).map((item: any) => ({ ...item }));
    const convert = (arr: any[]): TreeNode[] => {
      return (arr || []).map((item: any) => {
        let children: any[] = item.children || [];
        if (item.users && Array.isArray(item.users)) {
          children = [...item.users, ...children];
        }
        const data = { ...item };
        delete (data as any).children;
        delete (data as any).users;
        return {
          data,
          children: children && children.length > 0 ? convert(children) : [],
          expanded: true,
        } as TreeNode;
      });
    };
    return convert(clone);
  };

  const toggleExpand = (nodePath: number[]) => {
    setTree((prev) => {
      const next = [...prev];
      let ref: any = next;
      for (let i = 0; i < nodePath.length; i++) {
        ref = ref[nodePath[i]];
        if (i < nodePath.length - 1) ref = ref.children;
      }
      ref.expanded = !ref.expanded;
      return next;
    });
  };

  const isUserNode = (n: TreeNode) => !!n.data && n.data.fullName;
  const getNodeLabel = (n: TreeNode) =>
    isUserNode(n) ? n.data.fullName : n.data.name;

  const onToggleUser = (n: TreeNode) => {
    const id = n.data.id;
    const name = n.data.fullName;
    setSelectedUsers((prev) => {
      const exists = prev.some((x) => String(x.id) === String(id));
      return exists
        ? prev.filter((x) => String(x.id) !== String(id))
        : [...prev, { id, name }];
    });
  };

  const removeSelectedUser = (userId: string | number) => {
    setSelectedUsers((prev) =>
      prev.filter((x) => String(x.id) !== String(userId))
    );
  };

  const validFileSize = (files: FileList | File[]): boolean => {
    const MAX_SINGLE = 100 * 1024 * 1024;
    const MAX_TOTAL = 300 * 1024 * 1024;
    let total = 0;
    const arr: File[] = Array.isArray(files) ? files : Array.from(files);
    for (const f of arr) {
      if (f.size > MAX_SINGLE) return false;
      total += f.size;
      if (total > MAX_TOTAL) return false;
    }
    return true;
  };

  const onSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (!validFileSize(files)) {
      setValidFiles(false);
      e.target.value = "";
      return;
    }
    setValidFiles(true);
    const current = [...selectedFiles];
    for (const f of Array.from(files)) {
      const exists = current.some(
        (x) =>
          ((x as any).webkitRelativePath || x.name) ===
          ((f as any).webkitRelativePath || f.name)
      );
      if (!exists) {
        (f as any).encrypt = false;
        current.push(f);
      }
    }
    setSelectedFiles(current);
    e.target.value = "";
  };

  const onRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onToggleEncrypt = (index: number) => {
    setSelectedFiles((prev) => {
      const next = [...prev];
      if (next[index])
        (next[index] as any).encrypt = !(next[index] as any).encrypt;
      return next;
    });
  };

  const handleSubmit = async () => {
    let serialNumber = "";
    if (Constant.BCY_VERIFY_TOKEN) {
      getTokenInfo(async (data: string) => {
        if (data === "") {
          ToastUtils.loiKhiLayThongTinChungThuSo();
        } else if (data === "-100") {
          ToastUtils.khongKetNoiDuocChungThuSo();
        } else {
          const tokenInfo: TokenInfo = JSON.parse(
            b64DecodeUnicode(data) || "{}"
          );
          serialNumber = tokenInfo.SerialNumber || "";
          await doDoneDocumentTaskCheckToken(serialNumber);
          router.refresh();
        }
      });
    } else {
      await doDoneDocumentTaskCheckToken(serialNumber);
      router.refresh();
    }
  };

  const setSharedFileData = (
    userIds: (string | number)[],
    orgIds: (string | number)[] = []
  ) => {
    const data: any = {};
    data.objId = docId;
    data.files = selectedFiles;
    data.comment = comment;
    data.userIds = userIds;
    data.orgIds = orgIds;
    data.userIdShared = [];
    data.allFileNames = [];
    data.attType = CERT_OBJ_TYPE.doc_in_add;
    data.cmtType = "VAN_BAN_DEN_CMT";
    data.userOrobj = CERT_OBJ_TYPE.user;
    data.checkObjEnc = false;
    return data;
  };
  const doDoneDocumentTaskCheckToken = async (serialNumber: string) => {
    if (Constant.BCY_VERIFY_TOKEN) {
      const userInfo = JSON.parse(getUserInfo() || "{}");
      if (userInfo.serialToken !== serialNumber) {
        ToastUtils.banDungKhongDungChungThuSo();
        return;
      }
    }
    setInSubmit(true);
    const toUserIds = selectedUsers.map((x) => x.id);
    const data = setSharedFileData(toUserIds, []);
    const rs = await uploadFileService.doSharePermissionDocFile(data);
    if (rs === false) {
      setInSubmit(false);
      return rs;
    }
    try {
      const form = new FormData();
      // Append toUserId without index: multiple entries with the same key
      toUserIds.forEach((id) => form.append("toUserId", String(id)));
      form.append("comment", data.comment);
      if (data.files && data.files.length > 0) {
        for (const f of data.files as File[]) form.append("files", f);
      }
      await DocumentService.doRequestComment(Number(docId), form);
      ToastUtils.commentCreateSuccess();
      onClose();
      notificationService.countUnreadNotification();
      setInSubmit(false);
    } catch (err) {
      setInSubmit(false);
      handleError(err);
      await uploadFileService.rollback(
        data.allFileNames,
        data.userIdShared,
        data.cmtType
      );
    }
  };

  return (
    <Dialog open={showAskIdeaModal} onOpenChange={setShowAskIdeaModal}>
      <DialogContent className="w-full max-w-4xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{"Xin ý kiến"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 border rounded-md overflow-hidden max-h-[400px]">
              <div className="max-h-[400px] overflow-auto">
                <TableBase>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên đơn vị, cá nhân</TableHead>
                      <TableHead className="w-[30%] text-center">
                        Chức danh
                      </TableHead>
                      <TableHead className="w-[20%] text-center bg-red-100/50">
                        Xin ý kiến
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingTree ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-sm text-muted-foreground py-6"
                        >
                          Đang tải dữ liệu...
                        </TableCell>
                      </TableRow>
                    ) : tree.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-sm text-muted-foreground py-6"
                        >
                          Không có dữ liệu
                        </TableCell>
                      </TableRow>
                    ) : (
                      tree.map((node, idx) => (
                        <TreeRow
                          key={idx}
                          node={node}
                          path={[idx]}
                          level={0}
                          onToggleExpand={toggleExpand}
                          onToggleUser={onToggleUser}
                          selectedUsers={selectedUsers}
                        />
                      ))
                    )}
                  </TableBody>
                </TableBase>
              </div>
            </div>

            <div className="border rounded-md p-3">
              <div className="font-bold mb-2 text-blue-500">
                Thông tin xử lý
              </div>
              {selectedUsers.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Chưa chọn người nhận
                </div>
              ) : (
                <TableBase>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left">
                        Danh sách được chọn
                      </TableHead>
                      <TableHead className="w-[10%]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedUsers.map((u) => (
                      <TableRow key={String(u.id)}>
                        <TableCell>
                          <div className="text-red-500 truncate">{u.name}</div>
                        </TableCell>
                        <TableCell className="w-[10%] text-center">
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => removeSelectedUser(u.id)}
                            aria-label="Xóa"
                          >
                            ×
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableBase>
              )}
            </div>
          </div>

          {/* --- BẮT ĐẦU PHẦN SỬA LỖI --- */}
          <div className="border rounded-md">
            <div className="px-3 py-2 border-b">
              <span className="font-bold text-blue-500">Nội dung xử lý</span>
            </div>
            <div className="p-3 space-y-2">
              <Textarea
                placeholder={"Nhập ý kiến..."}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                maxLength={2000}
                className="px-3 py-2"
              />
              {comment.length >= 2000 && (
                <p className="text-red-500 text-sm">
                  Nội dung xử lý không được dài quá 2000 ký tự
                </p>
              )}
              {/* PHẦN UPLOAD FILE */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="doneFileUpload"
                    className="btn btn-success m-0 cursor-pointer px-3 py-1.5 border rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Chọn tệp
                  </label>
                  <input
                    id="doneFileUpload"
                    hidden
                    type="file"
                    multiple
                    onChange={onSelectFiles}
                  />
                </div>

                {!validFiles && (
                  <p className="text-red-500 text-sm">
                    Kích thước tệp không hợp lệ
                  </p>
                )}

                <div className="space-y-1">
                  {selectedFiles.map((file, i) => (
                    <div
                      key={`${file.name}-${i}`}
                      className="flex items-center gap-2 text-sm"
                    >
                      {ENCRYPTION_TWD && (
                        <button
                          type="button"
                          className="mx-1"
                          title="Mã hóa tệp tin"
                          onClick={() => onToggleEncrypt(i)}
                        >
                          {(file as any).encrypt ? (
                            <KeyIcon
                              className="text-red-500"
                              aria-hidden="true"
                            />
                          ) : (
                            <KeyIcon
                              className="text-secondary"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      )}
                      <span>
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                      <Trash2
                        onClick={() => onRemoveFile(i)}
                        className="text-red-500 ml-1 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>{" "}
              {/* ✅ ĐÃ THÊM THẺ ĐÓNG BỊ THIẾU */}
            </div>
          </div>
          {/* --- KẾT THÚC PHẦN SỬA --- */}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={inSubmit || selectedUsers.length === 0}
              className="text-white border-0 h-9 px-3 gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:text-white bg-blue-600 hover:bg-blue-700"
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "#3a7bc8")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "#4798e8")
              }
            >
              Gửi xử lý
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type TreeRowProps = {
  node: any;
  path: number[];
  level: number;
  onToggleExpand: (path: number[]) => void;
  onToggleUser: (n: any) => void;
  selectedUsers: { id: string | number; name: string }[];
};

function TreeRow({
  node,
  path,
  level,
  onToggleExpand,
  onToggleUser,
  selectedUsers,
}: TreeRowProps) {
  const isUser = !!node.data?.fullName;
  const label = isUser ? node.data.fullName : node.data?.name;
  const pos = node.data?.positionName;
  const checked =
    isUser && selectedUsers.some((x) => String(x.id) === String(node.data.id));
  return (
    <>
      <tr>
        <td className="p-2">
          <div className="flex items-center">
            <span style={{ width: level * 16 }}></span>
            {node.children && node.children.length > 0 && (
              <button
                type="button"
                className="mr-1 text-gray-600"
                onClick={() => onToggleExpand(path)}
                aria-label="toggle"
              >
                {node.expanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            )}
            {!node.children || node.children.length === 0 ? (
              <span className="mr-1" style={{ width: 16 }}></span>
            ) : null}
            {isUser ? (
              <User2 className="text-blue-500 mr-2" size={16} />
            ) : (
              <University className="text-red-500 mr-2" size={16} />
            )}
            <span>{label}</span>
          </div>
        </td>
        <td className="p-2 text-center">{pos || ""}</td>
        <td className="p-2 text-center">
          {isUser ? (
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggleUser(node)}
            />
          ) : null}
        </td>
      </tr>
      {node.children &&
        node.children.length > 0 &&
        node.expanded &&
        node.children.map((c: any, idx: number) => (
          <TreeRow
            key={`${path.join("-")}-${idx}`}
            node={c}
            path={[...path, idx]}
            level={level + 1}
            onToggleExpand={onToggleExpand}
            onToggleUser={onToggleUser}
            selectedUsers={selectedUsers}
          />
        ))}
    </>
  );
}
