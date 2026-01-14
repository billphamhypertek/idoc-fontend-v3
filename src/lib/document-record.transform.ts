import dayjs from "dayjs";
import type {
  HeadingSearchParams,
  RawTreeNode,
  UiTreeNode,
} from "@/definitions/types/document-record";

function normalizeMonthOrDate(val: string, edge: "start" | "end") {
  if (!val) return "";
  if (/^\d{4}-\d{2}$/.test(val)) {
    const d = dayjs(val + "-01");
    return edge === "start"
      ? d.startOf("month").format("YYYY-MM-DD")
      : d.endOf("month").format("YYYY-MM-DD");
  }
  return val;
}

export function buildHeadingQueryParams(form: HeadingSearchParams) {
  const p: Record<string, string> = {};
  if (form.text) p.text = form.text.trim();
  if (form.yearFolders) p.yearFolders = String(form.yearFolders);
  if (form.typeFolders) p.typeFolders = String(form.typeFolders);
  if (form.maintenance && String(form.maintenance) !== "-1") {
    p.maintenance = String(form.maintenance);
  }
  if (form.from) p.from = normalizeMonthOrDate(form.from, "start");
  if (form.to) p.to = normalizeMonthOrDate(form.to, "end");
  return p;
}

export function toUiTree(raw?: RawTreeNode[]): UiTreeNode[] {
  if (!raw || !Array.isArray(raw)) return [];

  const mapNode = (n: RawTreeNode): UiTreeNode => {
    const mergedChildren = [
      ...(Array.isArray(n.children) ? n.children : []),
      ...(Array.isArray((n as any).hsFolders) ? (n as any).hsFolders : []),
    ];

    const isFolder =
      !!(n as any).headingsId ||
      !!(n as any).folderType ||
      n.iconType === "folder" ||
      n.type === "FOLDER";

    return {
      id: n.id,
      label: n.name,
      maintenance: n.maintenance,
      creator: n.creator,
      icon: isFolder ? "folder" : "doc",
      children: mergedChildren.map(mapNode),
    };
  };

  return raw.map(mapNode);
}
