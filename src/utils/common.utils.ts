import axios from "axios";
import { ToastUtils } from "@/utils/toast.utils";
import dayjs from "dayjs";
import { Constant } from "@/definitions/constants/constant";
import relativeTime from "dayjs/plugin/relativeTime";
import { TreeNode } from "@/definitions/types/document-out.type";
import { Organization, User } from "@/definitions";
import { OrganizationService } from "@/services/organization.service";
import { UserService } from "@/services/user.service";
import { Bpmn2Service } from "@/services/bpmn2.service";
import { DocumentService } from "@/services/document.service";
import {
  formatDateTimeVN,
  formatDateVN,
  formatDateYMD,
} from "./datetime.utils";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
// @ts-expect-error - pdfmake doesn't have type definitions
import pdfMake from "pdfmake/build/pdfmake";
// @ts-expect-error - pdfmake doesn't have type definitions
import pdfFonts from "pdfmake/build/vfs_fonts";
import "pdfmake/build/vfs_fonts";
import { TaskService } from "@/services/task.service";
import { ModuleItem } from "@/definitions/types/personalStatus.type";
import { RegularDay } from "@/definitions/interfaces/task.interface";

dayjs.locale("vi");
dayjs.extend(relativeTime);
export function appendToFormData<T extends object>(
  obj: T,
  formData?: FormData
): FormData {
  const fd = formData ?? new FormData();
  const entries = Object.entries(obj as Record<string, unknown>);

  for (const [key, value] of entries) {
    if (value == null) continue; // skip null/undefined

    const append = (k: string, v: unknown) => {
      if (v instanceof Date) fd.append(k, v.toISOString());
      else if (v instanceof Blob)
        fd.append(k, v); // File extends Blob
      else fd.append(k, String(v));
    };

    if (Array.isArray(value)) {
      value.forEach((v, i) => v != null && append(`${key}[${i}]`, v));
    } else {
      append(key, value);
    }
  }

  return fd;
}

export const normalizeText = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim();
};
export const orginName = (name: string) =>
  name ? name.replace(/__\d+/g, "") : name;

export async function getErrorMessage(err: unknown): Promise<string> {
  // fallback mặc định
  let msg = "Đã xảy ra lỗi";

  if (axios.isAxiosError(err)) {
    const e = err;

    // 1. Nếu server trả về JSON error trong blob
    if (e.response?.data instanceof Blob) {
      try {
        const text = await e.response.data.text();
        const json = JSON.parse(text);
        msg = json?.message || e.message;
      } catch {
        msg = e.message;
      }
    }

    // 2. Nếu server trả về JSON object
    else if (e.response?.data?.message) {
      msg = e.response.data.message;
    }

    // 3. Nếu không có response (network error)
    else if (e.message) {
      msg = e.message;
    }
  } else if (err instanceof Error) {
    msg = err.message;
  }

  return msg;
}
export const handleError = async (err: any) => {
  console.error("Error:", err);
  try {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const message = await getErrorMessage(err);
      // Bỏ toast khi 403 sau logout hoặc lỗi quyền truy cập chung
      if (
        (status === 403 || status === 401) &&
        typeof message === "string" &&
        /access\s*denied|forbidden|không có quyền|permission/i.test(message)
      ) {
        return;
      }
      ToastUtils.error(message);
      return;
    }
    ToastUtils.error(await getErrorMessage(err));
  } catch {
    ToastUtils.error("Có lỗi xảy ra");
  }
};
//copy

export const includes = (str1?: string, str2?: string): boolean => {
  if (!str1 || !str2) {
    return false;
  }
  const lowStr1 = str1.toLowerCase();
  const lowStr2 = str2.toLowerCase();
  return lowStr1.includes(lowStr2) || lowStr2.includes(lowStr1);
};

export const getDateLeftUtils = (document: any) => {
  if (!document) {
    return -1;
  }

  if (document.deadline == null) {
    if (Constant.FIX_DEADLINE_WARNING_H05) {
      return 10;
    }
    return 0;
  }

  const parseDeadline = (value: any) => {
    const formats = [
      "DD/MM/YYYY HH:mm:ss",
      "DD/MM/YYYY HH:mm",
      "DD-MM-YYYY HH:mm:ss",
      "DD-MM-YYYY HH:mm",
      "DD/MM/YYYY",
      "DD/M/YYYY",
      "D/M/YYYY",
      "D/MM/YYYY",
      "DD-MM-YYYY",
      "DD-M-YYYY",
      "D-M-YYYY",
      "D-MM-YYYY",
      "YYYY-MM-DD HH:mm:ss",
      "YYYY-MM-DD HH:mm",
      "YYYY-MM-DD",
    ];

    const raw = typeof value === "string" ? value.trim() : value;

    if (typeof raw === "string") {
      // Ưu tiên parse thủ công pattern dd/mm/yyyy hoặc dd-mm-yyyy để tránh bị đảo tháng/ngày
      const simpleMatch = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
      if (simpleMatch) {
        const [, d, m, y] = simpleMatch;
        const normalized = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const parsed = dayjs(normalized, "YYYY-MM-DD", true);
        if (parsed.isValid()) return parsed;
      }

      const parsedByFormats = dayjs(raw, formats, true);
      if (parsedByFormats.isValid()) return parsedByFormats;
    }

    return dayjs(raw);
  };

  const deadlineDate = parseDeadline(document.deadline);

  if (!deadlineDate.isValid()) {
    return 0;
  }

  const currentDate = new Date();
  const deltaTime =
    new Date(deadlineDate.format("YYYY-MM-DD")).getTime() -
    currentDate.getTime();
  const dateLeft = Math.floor(deltaTime / (1000 * 3600 * 24)) + 2;

  return Math.max(dateLeft, 0);
};

export const validFileSSize = (files: FileList | File) => {
  const myFiles = files instanceof FileList ? Array.from(files) : [files];
  return myFiles.every(
    (file) => file && file.size <= Constant.MAX_SIZE_FILE_UPLOAD
  );
};

export const hasParent = (id: number, list: any[]) =>
  list.some((element) => element.parentId == id);

export const simpleVnUrl = (mUrl: string) =>
  mUrl &&
  mUrl
    .replace(/[àáâãăạảấầẩẫậắằẳẵặ]/g, "a")
    .replace(/[èéêẹẻẽếềểễệ]/g, "e")
    .replace(/[ìíĩỉị]/g, "i")
    .replace(/[òóôõơọỏốồổỗộớờởỡợ]/g, "o")
    .replace(/[ùúũưụủứừửữự]/g, "u")
    .replace(/[ýỳỵỷỹ]/g, "y")
    .replace(/đ/g, "d")
    .replace(/[ÀÁÂÃĂẠẢẤẦẨẪẬẮẰẲẴẶ]/g, "A")
    .replace(/[ÈÉÊẸẺẼẾỀỂỄỆ]/g, "E")
    .replace(/[ÌÍĨỈỊ]/g, "I")
    .replace(/[ÒÓÔÕƠỌỎỐỒỔỖỘỚỜỞỠỢ]/g, "O")
    .replace(/[ÙÚŨƯỤỦỨỪỬỮỰ]/g, "U")
    .replace(/[ÝỲỴỶỸ]/g, "Y")
    .replace(/Đ/g, "D")
    .replace(/&/g, "-and-")
    .replace(/[^\w.-]/g, "-") // why not change '-' to ' '?
    .replace(/-+/g, "-")
    .replace(/-$/, "")
    .replace("-", " ") // replace all ?
    .toUpperCase();

export const addAttachDraftType = (listDraft: any[]) => {
  if (!Array.isArray(listDraft)) {
    return;
  }
  listDraft.forEach((draft) => {
    draft.attachDrafts = draft.attachments.filter(
      (attach: any) =>
        attach.attachmentType == Constant.DOCUMENT_IN_FILE_TYPE.DRAFT
    );
  });
};

export const arrayToFormData = (
  formData: FormData,
  attribute: string,
  data: any[]
) => {
  if (!Array.isArray(data)) {
    data = [""];
  }
  data.forEach((dt) => formData.append(attribute, dt));
  return formData;
};

export const isExistFile = (fileName: string, selectedFiles: any[]) =>
  selectedFiles.some((file) => file.name === fileName);

export const getSubCheckedText = (x: any) => {
  if (!x.delegatedId) {
    return `${x.positionName} ${x.name}`;
  }
  return `${x.delegatePosition} ${x.delegatedName}(ủy quyền bởi ${x.positionName} ${x.name})`;
};

export const checkIdIsExistInList = (leadId: number, list: any[]) =>
  list.includes(leadId);

// eslint-disable-next-line no-empty-function
export const emptyFunc = (format?: any, ...ignore: any[]) => {
  console.log(format, ...ignore);
};
export const emptyFuncOn = (className: string, funcName: string) => {
  console.log(`Empty function in ${className}#${funcName}`);
};

export const timeFrom = (pastDate: Date) => dayjs(pastDate).fromNow();

export const getExtension = (fileName: string) =>
  fileName ? orginName(fileName).split(".").pop() : fileName;
const getOriginalName = (fileName: string) => fileName.split("__")[0];
export const getAssetIcon = (fileName: string) => {
  const ext = getOriginalName(getExtension(fileName)?.toLowerCase() || "");
  const iconMap: Record<string, string> = {
    pdf: "/v3/assets/images/files/PDF.png",
    doc: "/v3/assets/images/files/DOC.png",
    docx: "/v3/assets/images/files/DOC.png",
    xls: "/v3/assets/images/files/Excel.png",
    xlsx: "/v3/assets/images/files/Excel.png",
    png: "/v3/assets/images/files/unknow.gif",
    jpg: "/v3/assets/images/files/unknow.gif",
    jpeg: "/v3/assets/images/files/unknow.gif",
  };
  return iconMap[ext] || "/v3/assets/images/files/unknow.gif";
};

export const canView = (document: any, fileName: string) => {
  let extension = getExtension(fileName);
  if (extension) {
    extension = extension.toLowerCase();
  }
  if (
    document &&
    ((document.statusName &&
      document.statusName != Constant.DOCUMENT_STATUS.DONE_ISSUED) ||
      (document.status &&
        document.status != Constant.DOCUMENT_STATUS.DONE_ISSUED)) &&
    fileName &&
    (Constant.ALLOWED_VIEW_EDIT_EXTENSION.includes(extension ?? "") ||
      extension?.includes("pdf"))
  ) {
    return true;
  }
  return false;
};

export const canViewNoStatus = (fileName: string) => {
  let extension = getExtension(fileName);
  if (extension) {
    extension = extension.toLowerCase();
  }
  return fileName && (extension === "pdf" || extension === "docx");
};

export const checkViewFileStatus = (fileName: string) => {
  let extension = getExtension(fileName);
  if (extension) {
    extension = extension.toLowerCase();
  }
  return fileName && extension === "pdf";
};

export const saveFile = (fileName: string, data: any) => {
  if (fileName != null) {
    fileName = fileName.replace(/__\d+$/, "");
  }
  const dataType = data.type;
  const binaryData = [];
  binaryData.push(data);
  const blob = new Blob(binaryData, { type: dataType });
  if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
    // IE
    (window.navigator as any).msSaveOrOpenBlob(blob, fileName);
  } else {
    // Chrome, Firefox
    const objectUrl: string = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = objectUrl;
    downloadLink.download = fileName;
    downloadLink.click();
    URL.revokeObjectURL(objectUrl);
  }
};

export const openFileEncryptPdf = (fileData: any) => {
  const file = new Blob([fileData], { type: "application/pdf" });
  const fileURL = URL.createObjectURL(file);
  window.open(fileURL, "_blank");
};

const blobToFile = (theBlob: Blob, fileName: string): File => {
  const b: any = theBlob;
  b.lastModifiedDate = new Date();
  b.name = fileName;
  return <File>theBlob;
};

export const downloadFileToBlob = (fileName: string, data: any) => {
  if (fileName != null) {
    fileName = fileName.replace(/__\d+$/, "");
  }
  const dataType = data.type;
  const binaryData = [];
  binaryData.push(data);
  const blob = new Blob(binaryData, { type: dataType });
  return blobToFile(blob, fileName);
};

export const dateToNgbDate = (date: Date): any => ({
  year: date.getFullYear(),
  month: date.getMonth() + 1, // JS month bắt đầu từ 0
  day: date.getDate(),
});

const resizeElement = (textarea: any) => {
  setTimeout(() => {
    textarea.style.cssText = "height:auto;";
    textarea.style.cssText = `height:${textarea.scrollHeight}px`;
  }, 0);
};

export const textareaResize = (textareaListId: any[]) => {
  textareaListId.forEach((textareaId) => {
    const textarea = document.getElementById(textareaId);
    textarea?.addEventListener("keydown", () => {
      setTimeout(() => {
        textarea.style.cssText = "height:auto;";
        textarea.style.cssText = `height:${textarea.scrollHeight}px`;
      }, 0);
    });
    resizeElement(textarea);
  });
};
export const compareString = (a?: string, b?: string, ignoreCase = false) => {
  if (!a) {
    a = "";
  }
  if (!b) {
    b = "";
  }

  if (ignoreCase) {
    a = a.toLowerCase();
    b = b.toLowerCase();
  }
  return a.localeCompare(b);
};

export const utilCheckParentInTransfer = (
  listParent: any[],
  listChildren: any[]
): TreeNode[] => {
  const isExpandTree = Constant.BCY_EXPANDED_TREE_TRANSFER;
  // map children thành TreeNode
  const allParent: TreeNode[] = isExpandTree
    ? listChildren.map((child) => ({
        data: child,
        expanded: true,
        children: [],
      }))
    : listChildren.map((child) => ({
        data: child,
        children: [],
      }));

  // thêm listParent vào đầu
  allParent.unshift(...listParent);

  // build map id -> node
  const mapId: Record<string | number, TreeNode> = {};
  allParent.forEach((parent) => {
    mapId[parent.data.id] = parent;
  });

  // gắn con vào cha
  allParent.forEach((child) => {
    const parent = mapId[child.data.parentId];
    if (!parent) return;
    if (!parent.children) parent.children = []; // đảm bảo là array
    parent.children.push(child);
  });

  return allParent;
};

export function deepCloneTree(node: TreeNode): TreeNode {
  const clone: TreeNode = {
    data: { ...node.data },
    expanded: node.expanded,
    children: [],
  };
  if (node.children) {
    clone.children = node.children.map(deepCloneTree);
    clone.children.forEach((child) => (child.parent = clone));
  }
  return clone;
}

export async function buildFilteredOrganizationTree(
  nodeId: number,
  selectedItemId: number | null,
  allowMultiple: boolean,
  isTransferOrganization: boolean = false,
  docIn: boolean = false
): Promise<{
  tree: TreeNode[];
  listIdDisableByOrgCheck: number[];
  listIdDisableByLeaderCheck: number[];
  listByOrgAndTypeIsOne: number[];
  listByOrgAndTypeIsTwo: number[];
  listByOrgAndTypeIsThree: number[];
  listByLeaderAndTypeIsOne: number[];
  listByLeaderAndTypeIsTwo: number[];
  listByLeaderAndTypeIsThree: number[];
}> {
  // Get organizations based on constants
  let orgs: Organization[];
  let userLeadership: User[] = [];
  if (allowMultiple && !Constant.SHOW_ALL_ORG_DOCUMENT_OUT_TRANSFER) {
    orgs = await OrganizationService.getOrgCVV();
    const rootOrg = orgs.find((org) => org.parentId === null);
    if (rootOrg) {
      userLeadership = await UserService.getLeadershipByOrgId(
        rootOrg.id.toString()
      );
    }
  } else {
    orgs = await OrganizationService.getOrganizations({ active: "true" });
  }
  // Get users by node
  let users: User[] = await Bpmn2Service.getUsersByNode(nodeId);
  users = users.sort((a, b) => (a.positionOrder || 0) - (b.positionOrder || 0));
  console.log(orgs, users);

  // Get disable lists if selectedItemId
  let listIdDisableByOrg: any[] = [];
  let listIdDisableByOrgCheck: number[] = [];
  let listIdDisableByLeaderCheck: number[] = [];
  let listByOrgAndTypeIsOne: number[] = [];
  let listByOrgAndTypeIsTwo: number[] = [];
  let listByOrgAndTypeIsThree: number[] = [];
  let listByLeaderAndTypeIsOne: number[] = [];
  let listByLeaderAndTypeIsTwo: number[] = [];
  let listByLeaderAndTypeIsThree: number[] = [];
  if (selectedItemId) {
    listIdDisableByOrg = await DocumentService.findOrgByDocId(selectedItemId);
    listIdDisableByOrgCheck = listIdDisableByOrg.map(
      (x: any) => x.orgReceiveId
    );
    listIdDisableByLeaderCheck = listIdDisableByOrg
      .filter((item: any) => item.userReceiveId != null)
      .map((x: any) => x.userReceiveId);
    listByOrgAndTypeIsOne = listIdDisableByOrg
      .filter((x: any) => x.typeOrg == null || x.typeOrg == 1)
      .map((x: any) => x.orgReceiveId);
    listByLeaderAndTypeIsOne = listIdDisableByOrg
      .filter((x: any) => x.typeOrg == null || x.typeOrg == 1)
      .map((x: any) => x.userReceiveId);
    listByOrgAndTypeIsTwo = listIdDisableByOrg
      .filter((x: any) => x.typeOrg == 2)
      .map((x: any) => x.orgReceiveId);
    listByLeaderAndTypeIsTwo = listIdDisableByOrg
      .filter((x: any) => x.typeOrg == 2)
      .map((x: any) => x.userReceiveId);
    listByOrgAndTypeIsThree = listIdDisableByOrg
      .filter((x: any) => x.typeOrg == 3)
      .map((x: any) => x.orgReceiveId);
    listByLeaderAndTypeIsThree = listIdDisableByOrg
      .filter((x: any) => x.typeOrg == 3)
      .map((x: any) => x.userReceiveId);
  }

  // const {showTree: tree, mainTree: main} = createDataTree(orgs, userLeadership, users, isTransferOrganization, allowMultiple)
  // Build mainTree (roots)
  const mainTree: TreeNode[] = [];
  const orgChildren: (Organization | User)[] = [];

  // Add userLeadership to orgChildren if applicable
  userLeadership.forEach((u) => {
    u.parentId = orgs.find((org) => org.parentId === null)?.id;
    orgChildren.push(u);
  });

  // Build roots (listParent)
  orgs.forEach((org) => {
    if (org.parentId === null) {
      mainTree.push({
        data: org,
        expanded: true,
        children: [],
      });
    } else {
      orgChildren.push(org);
    }
  });

  // Add children to parents (recursive)
  const addChildrenToParent = (
    parents: TreeNode[],
    children: any[],
    isTransferOrganization: boolean
  ) => {
    parents.forEach((parent) => {
      if (!parent.children) {
        parent.children = [];
      }
      children.forEach((child) => {
        if (parent.data.id === child.parentId) {
          const childNode: TreeNode = {
            data: child,
            expanded: true,
            children: [],
            parent,
          };
          parent.children.push(childNode);
          if (!isTransferOrganization) {
            addChildrenToParent([childNode], children, isTransferOrganization);
          }
        }
      });
    });
  };

  // Call the appropriate function based on isTransferOrganization
  if (isTransferOrganization) {
    addChildrenToParent(mainTree, orgChildren, isTransferOrganization);
  } else {
    utilCheckParentInTransfer(mainTree, orgChildren);
  }

  // Build showTree based on users' orgs
  const arrAddOrg: { org: number }[] = [];
  users.forEach((user) => {
    if (
      user.org !== undefined &&
      user.org !== null &&
      !arrAddOrg.some((a) => a.org === user.org)
    ) {
      arrAddOrg.push({ org: user.org });
    }
  });

  const showTree: TreeNode[] = [];
  const findOrgInChildren = (id: number, children: TreeNode[]): boolean => {
    return children.some((child) => {
      if (child.data.id === id && !("userName" in child.data)) return true;
      return child.children ? findOrgInChildren(id, child.children) : false;
    });
  };

  const getTreeByOrgID = (orgId: number): TreeNode | undefined => {
    return mainTree.find((parent) => {
      if (parent.data.id === orgId) return true;
      return parent.children
        ? findOrgInChildren(orgId, parent.children)
        : false;
    });
  };

  if (arrAddOrg.length === 0) {
    showTree.push(...mainTree.map(deepCloneTree));
  } else {
    arrAddOrg.forEach((orgId) => {
      const treeToAdd = getTreeByOrgID(orgId.org);
      if (
        treeToAdd &&
        (showTree.length === 0 || !findOrgInChildren(orgId.org, showTree))
      ) {
        showTree.push(deepCloneTree(treeToAdd));
      }
    });
  }

  if (!isTransferOrganization) {
    users.reverse();
    const addUserToOrgTree = (user: User, tree: TreeNode[]) => {
      tree.forEach((node) => {
        if (user.org === node.data.id && !("userName" in node.data)) {
          node.children = node.children || [];
          if (
            !node.children.some(
              (c) => c.data.id === user.id && "userName" in c.data
            )
          ) {
            const userNode: TreeNode = {
              data: user,
              expanded: true,
              children: [],
              parent: node,
            };
            node.children.unshift(userNode);
          }
        } else if (node.children && node.children.length > 0) {
          addUserToOrgTree(user, node.children);
        }
      });
    };
    users.forEach((user) => addUserToOrgTree(user, showTree));

    // Pretty org tree
    const prettyOrgTree = (tree: TreeNode[]) => {
      for (let i = tree.length - 1; i >= 0; i--) {
        if (tree[i]) {
          if (
            (!tree[i].children || tree[i].children.length <= 0) &&
            !("userName" in tree[i].data)
          ) {
            tree.splice(i, 1);
            prettyOrgTree(tree);
          } else if (tree[i].children) {
            prettyOrgTree(tree[i].children);
          }
        } else {
          tree.splice(i, 1);
        }
      }
    };
    prettyOrgTree(showTree);
  }

  if (allowMultiple) {
    const removeUserFinalTree = (tree: TreeNode[]) => {
      for (let i = tree.length - 1; i >= 0; i--) {
        if (tree[i]) {
          if ("userName" in tree[i].data) {
            tree.splice(i, 1);
            removeUserFinalTree(tree);
          } else {
            if (tree[i].children?.some((c) => "userName" in c.data)) {
              tree[i].data.isCanCheck = true;
            }
            if (tree[i].children) {
              removeUserFinalTree(tree[i].children);
            }
          }
        } else {
          tree.splice(i, 1);
        }
      }
    };
    removeUserFinalTree(showTree);
  }

  // Check leaders (haveLeader)
  const checkLeadExistInOrg = (tree: TreeNode[]) => {
    tree.forEach((node) => {
      if (
        !("userName" in node.data) &&
        node.children &&
        node.children.length > 0
      ) {
        const leaderChild = node.children.find(
          (c) => "userName" in c.data && c.data.lead
        );
        if (leaderChild) {
          node.data.haveLeader = true;
          node.data.leaderId = leaderChild.data.id;
          node.data.leaderFullname = leaderChild.data.fullName;
          node.data.leaderPositionName = leaderChild.data.positionName;
        }
        checkLeadExistInOrg(node.children);
      }
    });
  };
  checkLeadExistInOrg(showTree);

  // Set levels
  const setLevels = (items: TreeNode[], level: number) => {
    items.forEach((item) => {
      item.level = level;
      if (item.children) setLevels(item.children, level + 1);
    });
  };
  setLevels(showTree, 0);
  return {
    tree: users?.length > 0 ? showTree : docIn ? [] : mainTree,
    listIdDisableByOrgCheck,
    listIdDisableByLeaderCheck,
    listByOrgAndTypeIsOne,
    listByOrgAndTypeIsTwo,
    listByOrgAndTypeIsThree,
    listByLeaderAndTypeIsOne,
    listByLeaderAndTypeIsTwo,
    listByLeaderAndTypeIsThree,
  };
}

export const sanitizeVietnameseText = (html: string): string => {
  if (!html) return "";

  const div = document.createElement("div");
  div.innerHTML = html;

  // Whitelist of allowed tags
  const allowedTags = ["B", "STRONG", "I", "EM", "U", "BR", "P", "SPAN"];

  const removeDisallowedTags = (element: Element) => {
    Array.from(element.children).forEach((child) => {
      if (!allowedTags.includes(child.tagName)) {
        // Replace tag with its text content
        const textNode = document.createTextNode(child.textContent || "");
        child.replaceWith(textNode);
      } else {
        // Recursively clean allowed tags
        removeDisallowedTags(child);

        // Remove all attributes except style for basic formatting
        Array.from(child.attributes).forEach((attr) => {
          if (attr.name !== "style") {
            child.removeAttribute(attr.name);
          }
        });
      }
    });
  };

  removeDisallowedTags(div);

  // Remove script tags
  div.querySelectorAll("script").forEach((script) => script.remove());

  return div.innerHTML;
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "Đã duyệt":
      return "text-green-700 font-semibold";
    case "Chờ duyệt":
      return "text-yellow-700 font-semibold";
    case "Đang xử lý":
      return "text-blue-700 font-semibold";
    case "Từ chối":
      return "text-red-700 font-semibold";
    case "Hoàn thành":
      return "text-gray-700 font-semibold";
    case "Bản nháp":
      return "text-gray-600 font-semibold";
    default:
      return "text-gray-600 font-semibold";
  }
};

export const isVerifierPDF = (file: any) => {
  if (
    file.name &&
    file.name.toLowerCase().indexOf(".pdf") > 0 &&
    !file.oEncrypt
  ) {
    return true;
  }
  return false;
};

export const isVerifierPDFOrDocx = (file: any) => {
  if (
    file.name &&
    (file.name.toLowerCase().indexOf(".pdf") > 0 ||
      file.name.toLowerCase().indexOf(".docx") > 0 ||
      file.name.toLowerCase().indexOf(".doc") > 0) &&
    !file.oEncrypt
  ) {
    return true;
  }
};
export const doFindActionStr = (action: string): string => {
  switch (action) {
    case "CREATE":
      return "Tạo mới";
    case "UPDATE":
      return "Sửa lịch trực";
    case "ACCEPT":
      return "Duyệt lịch trực đơn vị";
    case "REJECT":
      return "Trả lại lịch trực đơn vị";
    case "FINISH":
      return "Duyệt lịch trực Ban";
    case "NOTE":
      return "Ghi chú trực Ban";
    case "RETURN":
      return "Trả lại lịch trực đơn vị";
    default:
      return "Tạo mới";
  }
};

export const toDateOnly = (
  v: number | string | null | undefined
): string | undefined => {
  if (v == null) return undefined;
  let d: Date;

  if (typeof v === "number") {
    const ms = v < 1e12 ? v * 1000 : v; // giây -> ms
    d = new Date(ms);
  } else if (/^\d+$/.test(v)) {
    const n = parseInt(v, 10);
    const ms = n < 1e12 ? n * 1000 : n;
    d = new Date(ms);
  } else {
    d = new Date(v);
  }

  const t = d.getTime();
  if (Number.isNaN(t)) return undefined;
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
};

const prettyJSON = (objList: any[], maxResults?: number) => {
  const excelJson: any[] = [];

  objList.forEach((element, i) => {
    if (Array.isArray(element.results)) {
      // Phần lịch sử kết quả nếu cần xuất hết thì maxResult = element.results.length
      const reportQuantity =
        maxResults == null
          ? 1
          : element.results.length < maxResults
            ? element.results.length
            : maxResults;

      for (let index = 0; index < reportQuantity; index++) {
        if (index < 1) {
          excelJson.push([
            i + 1,
            element.taskName ? element.taskName : "",
            element.endDate ? formatDateVN(new Date(element.endDate)) : "",
            element.results[index].commentDate
              ? formatDateTimeVN(
                  new Date(element.results[index].commentDate),
                  true
                )
              : "",
            element.results[index].comment
              ? element.results[index].comment
              : "",
            element.description ? element.description : "",
          ]);
        } else {
          excelJson.push([
            "",
            "",
            "",
            element.results[index].commentDate
              ? formatDateTimeVN(
                  new Date(element.results[index].commentDate),
                  true
                )
              : "",
            element.results[index].comment
              ? element.results[index].comment
              : "",
            "",
          ]);
        }
      }
    } else {
      excelJson.push([
        i + 1,
        element.taskName ? element.taskName : "",
        element.endDate ? formatDateVN(new Date(element.endDate)) : "",
        "",
        "",
        element.description ? element.description : "",
      ]);
    }
  });

  return excelJson;
};

export { prettyJSON };

export const generateExcelTask = (
  title: string,
  header: string[],
  data: any[],
  filename: string
) => {
  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Thống kê");

  // Add Row and formatting
  const titleRow = worksheet.addRow([title]);
  titleRow.font = { name: "Times New Roman", size: 18, bold: true };
  titleRow.alignment = { vertical: "middle" };
  worksheet.addRow([]);
  worksheet.mergeCells("A1:F2");
  worksheet.mergeCells("A3:F3");

  // Blank Row
  worksheet.addRow([]);

  // Add Header Row
  const headerRow = worksheet.addRow(header);

  // Cell Style : Fill and Border
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "e9f9f7" },
      bgColor: { argb: "e9f9f7" },
    };
    cell.font = { name: "Times New Roman", size: 14, bold: true };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Add Data and Conditional Formatting
  data.forEach((d) => {
    const row = worksheet.addRow(d);
    row.font = { name: "Times New Roman", size: 14 };
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // Set column widths and alignments
  worksheet.getColumn(1).width = 8; // STT
  worksheet.getColumn(1).alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getColumn(2).width = 30; // Tên công việc
  worksheet.getColumn(2).alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getColumn(3).width = 15; // Lĩnh vực
  worksheet.getColumn(3).alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getColumn(4).width = 15; // Độ ưu tiên
  worksheet.getColumn(4).alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getColumn(5).width = 30; // tiến độ
  worksheet.getColumn(5).alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getColumn(6).width = 20; // Ngày bắt đầu
  worksheet.getColumn(6).alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getColumn(7).width = 20; // Ngày kết thúc
  worksheet.getColumn(7).alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getColumn(8).width = 40; // Nội dung
  worksheet.getColumn(8).alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getColumn(9).width = 20; // Người thực hiện
  worksheet.getColumn(9).alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getColumn(10).width = 25; // Người giao việc
  worksheet.getColumn(10).alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getColumn(11).width = 20; // Nhận để biết
  worksheet.getColumn(11).alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.addRow([]);

  // Generate and download file
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const currentDate = formatDateVN(new Date());
    const formattedDate = currentDate.replace(/\//g, "_");
    saveAs(blob, `${filename}_${formattedDate}.xlsx`);
  });
};

// Helper function to check content row duplicates
const checkContentRowDuplicates = (rows: any[]) => {
  for (let i = 0; i < rows.length; i++) {
    if (rows[i] == "" || rows[i] !== rows[i + 1]) {
      return false;
    }
    return true;
  }
};

// Helper function to find items in group task
const findItemInGroupTask = (objList: any[], type: string) => {
  let resultFilter: any[] = [];
  resultFilter.push({ groupTask: type });

  const result = objList.filter((item) => {
    return item.priorityName == type;
  });

  if (result.length > 0) {
    resultFilter.push(...result);
  } else {
    resultFilter = [];
  }

  return resultFilter;
};

export const prettyJSONtoPDF = (objList: any[], maxResults?: number) => {
  const sortGroupTask = [
    "Nhiệm vụ cấp bách",
    "Nhiệm vụ quan trọng",
    "Nhiệm vụ thường xuyên",
    "Nhiệm vụ của đơn vị",
    "Kế hoạch và dự toán ngân sách",
  ];

  const dataResult: any[] = [];

  sortGroupTask.forEach((item) => {
    dataResult.push(...findItemInGroupTask(objList, item));
  });

  objList = dataResult;

  const header = [
    "TT",
    "Nhiệm vụ",
    "Thời hạn hoàn thành",
    "Thời gian báo cáo",
    "Kết quả thực hiện",
    "Lãnh đạo chỉ đạo/căn cứ giao nhiệm vụ",
  ];

  const excelJson = [header];

  objList.forEach((element, i) => {
    if (element.groupTask) {
      excelJson.push([
        element.groupTask,
        element.groupTask,
        element.groupTask,
        element.groupTask,
        element.groupTask,
        element.groupTask,
      ]);
    }

    if (Array.isArray(element.results) && !element.groupTask) {
      const reportQuantity =
        maxResults == null
          ? 1
          : element.results.length < maxResults
            ? element.results.length
            : maxResults;
      for (let index = 0; index < reportQuantity; index++) {
        if (index < 1) {
          excelJson.push([
            i + 1,
            element.taskName ? element.taskName : "",
            element.endDate ? formatDateVN(new Date(element.endDate)) : "",
            element.results[index].commentDate
              ? formatDateTimeVN(
                  new Date(element.results[index].commentDate),
                  true
                )
              : "",
            element.results[index].comment
              ? element.results[index].comment
              : "",
            element.description ? element.description : "",
          ]);
        } else {
          excelJson.push([
            "",
            "",
            "",
            element.results[index].commentDate
              ? formatDateTimeVN(
                  new Date(element.results[index].commentDate),
                  true
                )
              : "",
            element.results[index].comment
              ? element.results[index].comment
              : "",
            "",
          ]);
        }
      }
    } else if (!element.groupTask) {
      excelJson.push([
        i + 1,
        element.taskName ? element.taskName : "",
        element.endDate ? formatDateVN(new Date(element.endDate)) : "",
        "",
        "",
        element.description ? element.description : "",
      ]);
    }
  });

  return excelJson;
};

export const generatePDFTask = (
  title: string,
  data: any[],
  action: string,
  namedv: string,
  nameSign: string,
  onRedirect?: (url: string) => void
) => {
  const date = new Date();
  const formatted = dayjs(date).format("DD_MM_YYYY");
  pdfMake.vfs = pdfFonts?.pdfMake?.vfs;
  let numberSubtract = 0;
  const formattedArray = data.map((row, index) => {
    if (index === 0) {
      if (!checkContentRowDuplicates(row)) {
        return row.map((cell: any) => ({
          text: cell,
          bold: true,
          alignment: "center",
          fontSize: 14,
        }));
      } else {
        return [
          {
            text: row[0],
            bold: true,
            alignment: "left",
            fontSize: 14,
            colSpan: 6,
          },
        ];
      }
    } else {
      if (!checkContentRowDuplicates(row)) {
        const pdfItem = row.map((cell: any, index: number) => {
          if (index < 2) {
            return { text: cell, bold: true };
          } else {
            return { text: cell };
          }
        });
        pdfItem[0].text =
          pdfItem[0].text !== "" ? pdfItem[0].text - numberSubtract : "";
        return pdfItem;
      } else {
        numberSubtract++;
        return [
          {
            text: row[0],
            bold: true,
            alignment: "left",
            fontSize: 14,
            colSpan: 6,
          },
        ];
      }
    }
  });

  const documentDefinition = {
    pageOrientation: "landscape",
    content: [
      {
        columns: [
          { text: "BAN CƠ YẾU CHÍNH PHỦ", alignment: "center", fontSize: 14 },
          {
            text: "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM ",
            alignment: "center",
            fontSize: 14,
            bold: true,
          },
        ],
        columnGap: 150,
      },
      {
        columns: [
          {
            text: namedv.toUpperCase(),
            alignment: "center",
            fontSize: 14,
            bold: true,
          },
          {
            text: "Độc lập - Tự do - Hạnh phúc",
            alignment: "center",
            fontSize: 14,
            bold: true,
          },
        ],
        columnGap: 150,
      },
      {
        columns: [
          {
            text: "\nSố: ",
            alignment: "center",
            fontSize: 14,
            margin: [0, 0, 120, 0],
          },
          {
            text: "\nHà Nội, ngày       tháng       năm 20      \n \n ",
            alignment: "center",
            fontSize: 14,
          },
        ],
        columnGap: 150,
      },
      { text: title.toUpperCase(), style: "header" },
      {
        text: `Giờ xuất báo cáo: ${dayjs(date).format("DD/MM/YYYY HH:mm:ss")}\n \n`,
        alignment: "right",
        fontSize: 10,
      },
      {
        table: {
          headerRows: 1,
          widths: ["4%", "25%", "11%", "11%", "32%", "19%"],
          body: formattedArray,
        },
      },
      {
        unbreakable: true,
        columns: [
          { text: "", width: "70%" },
          {
            stack: [
              {
                text: "THỦ TRƯỞNG ĐƠN VỊ",
                alignment: "center",
                bold: true,
                fontSize: 14,
              },
              {
                text: "(Ký và ghi rõ họ tên)",
                alignment: "center",
                fontSize: 10,
                margin: [0, 0, 0, 70],
              },
              { text: nameSign, alignment: "center", fontSize: 14, bold: true },
            ],
            width: "30%",
          },
        ],
        margin: [0, 20, 0, 0],
      },
    ],
    styles: {
      header: {
        fontSize: 14,
        bold: true,
        margin: [0, 0, 0, 30],
        alignment: "center",
      },
    },
  };

  if (action === "viewPDF") {
    pdfMake.createPdf(documentDefinition).getBase64(function (base64: string) {
      sessionStorage.setItem("pdfDocument", base64);
    });
  } else if (action === "submitPDF") {
    try {
      const pdfDocGenerator = pdfMake.createPdf(documentDefinition as any);
      pdfDocGenerator.getBlob(async (blob: Blob) => {
        const fileNamePdf = namedv
          ? `Tổng hợp nhiệm vụ_${namedv}_${formatted}.pdf`
          : `Tổng hợp nhiệm vụ_${formatted}.pdf`;
        const file = new File([blob], fileNamePdf, {
          lastModified: new Date().getTime(),
          type: "application/pdf",
        });
        const files: File[] = [];
        files.push(file);
        const res = await TaskService.doSaveATaskReport(files);
        if (res) {
          const dataList = Array.isArray(res) ? res : res?.data;

          if (
            Array.isArray(dataList) &&
            dataList.length > 0 &&
            dataList[0]?.id
          ) {
            const url = `/document-in/draft-list/draft-insert?taskReportId=${dataList[0].id}`;
            if (onRedirect) onRedirect(url);
            else if (typeof window !== "undefined") window.location.assign(url);
          }
        }
      });
    } catch (error) {
      handleError(error);
    }
  } else if (action === "downloadPDF") {
    const fileNamePdf = namedv
      ? `Tổng hợp nhiệm vụ_${namedv}_${formatted}.pdf`
      : `Tổng hợp nhiệm vụ_${formatted}.pdf`;
    pdfMake.createPdf(documentDefinition as any).download(fileNamePdf);
  }
};

export const flattenProcess = (
  nodes: { data: any; children?: { data: any }[] }[],
  level: number = 0,
  basePath: string = "0",
  expandedSet: Set<string> = new Set()
): any[] => {
  const rows: any[] = [];
  nodes.forEach((node, index) => {
    const path = node?.data?.pid || `${basePath}-${index}`;
    const hasChildren = !!(node.children && node.children.length);
    rows.push({
      data: node.data,
      children: node.children,
      level,
      path,
      hasChildren,
    });
    if (hasChildren && expandedSet.has(path)) {
      rows.push(...flattenProcess(node.children!, level + 1, path));
    }
  });
  return rows;
};

export const transformText = (text: string, maxLength: number) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

export function createURLQueryString(obj: any) {
  const params = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    // if object/array, stringify it
    if (typeof value === "object") {
      params.set(key, JSON.stringify(value));
    } else {
      params.set(key, String(value));
    }
  });

  return params.toString(); // e.g. "tab=draft&consult=true"
}

export const normalize = (path = "") =>
  path.startsWith("/") ? path : `/${path}`;

export const findIdByRouterPathSafe = (
  modules: ModuleItem[],
  targetPath: string
): number | null => {
  const normalizedTarget = normalize(targetPath);

  // 👉 Ưu tiên route dài hơn
  const sortedModules = [...modules].sort(
    (a, b) => normalize(b.routerPath).length - normalize(a.routerPath).length
  );

  for (const item of sortedModules) {
    const normalizedRouter = normalize(item.routerPath);

    const isMatch =
      normalizedRouter === normalizedTarget ||
      (normalizedRouter !== "/" &&
        normalizedTarget.startsWith(normalizedRouter + "/"));

    if (isMatch) {
      return item.id;
    }

    if (item.subModule?.length) {
      const found = findIdByRouterPathSafe(item.subModule, targetPath);
      if (found !== null) return found;
    }
  }

  return null;
};

export const parseCssToStyle = (css: string): React.CSSProperties => {
  if (!css) return {};

  const style: Record<string, string> = {};

  css
    .replace(/[{}]/g, "")
    .split(";")
    .map((rule) => rule.trim())
    .filter(Boolean)
    .forEach((rule) => {
      const [prop, value] = rule.split(":").map((s) => s.trim());
      if (!prop || !value) return;

      const camelProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      style[camelProp] = value;
    });

  return style as React.CSSProperties;
};

export const addCookie = (tokenInfo: any) => {
  const attrs = ["Path=/", "SameSite=Lax"];
  const expireDate = new Date(tokenInfo.timeExprise).toUTCString();
  document.cookie = `tokenInfo=${encodeURIComponent(JSON.stringify(tokenInfo))}; expires=${expireDate}; ${attrs.join("; ")}`;
};

export const getCycleDays = (): RegularDay[] => {
  const today = dayjs();
  const day = today.day();
  let diffToFriday = 0;

  if (day >= 1 && day <= 4) {
    diffToFriday = day + 2;
  } else if (day === 5) {
    diffToFriday = 0;
  } else if (day === 6) {
    diffToFriday = 1;
  } else if (day === 0) {
    diffToFriday = 2;
  }

  const friday = today.subtract(diffToFriday, "day");

  const days: RegularDay[] = [];
  const labels = ["Thứ 6", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5"];
  const offsets = [0, 3, 4, 5, 6];

  offsets.forEach((offset, index) => {
    const d = friday.add(offset, "day");
    const dateObj = d.toDate();
    const dateStr = formatDateYMD(dateObj);
    days.push({
      label: labels[index],
      date: dateObj,
      dateStr: dateStr,
    });
  });

  return days;
};
