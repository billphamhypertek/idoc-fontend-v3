export type OrgUnit = {
  orgId: string | number;
  orgName: string;

  // ===== Văn bản đến =====
  normalInDocOut?: number | null;
  secretInDocOut?: number | null;

  // Bản chuẩn cho VB đến
  totalDoc?: number | null; // Tổng văn bản đến
  normalDoc?: number | null; // Văn bản thường
  secretDoc?: number | null; // Văn bản mật
  digitalHandleDoc?: number | null;

  // Vai trò xử lý (bảng VB đến)
  vtDoc?: number | null; // Văn thư
  tphcDoc?: number | null; // Trưởng phòng hành chính
  lddvDoc?: number | null; // Lãnh đạo đơn vị
  ldpDoc?: number | null; // Lãnh đạo phòng
  nvDoc?: number | null; // Trợ lý / Nhân viên

  // ===== Văn bản đi =====
  totalDocOut?: number | null; // Tổng VB đi
  scanDocOut?: number | null; // Giấy
  fullProcessDocOut?: number | null; // Toàn trình
  signedDocOut?: number | null; // Không toàn trình
  normalOutDocOut?: number | null; // Gửi ngoài ban

  // ===== Chart nhiệm vụ =====
  completedTaskCount?: number | null;
  notCompletedTaskCount?: number | null;
  outOfDateTaskCount?: number | null;

  // ===== Truy cập hệ thống =====
  totalUser?: number | null;
  loginUser?: number | null;

  paperHandleDoc?: number;
  normalSusDocOut?: number;
  secretSusDocOut?: number;
};

// ==== Date range (dùng chung) ====
export type DateRange = {
  from?: Date;
  to?: Date;
};

export type DateRangePreset = {
  value: string;
  label: string;
  range: () => DateRange;
};

export const dateRangePresets: DateRangePreset[] = [
  {
    value: "week",
    label: "Tuần này",
    range: () => {
      const now = new Date();
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { from: start, to: end };
    },
  },
  {
    value: "month",
    label: "Tháng này",
    range: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { from: start, to: end };
    },
  },
  {
    value: "quarter",
    label: "Quý này",
    range: () => {
      const now = new Date();
      const quarter = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), quarter * 3, 1);
      const end = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
      return { from: start, to: end };
    },
  },
  {
    value: "year",
    label: "Năm nay",
    range: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      return { from: start, to: end };
    },
  },
  {
    value: "custom",
    label: "Tùy chọn",
    range: () => ({ from: undefined, to: undefined }),
  },
];

export type RawOrg = {
  id: number;
  name: string;
  parentId: number | null;
  level: number | null;
  orgType?: number | null;
  orgTypeModel?: {
    id: number;
    name?: string | null;
    isLeadership?: boolean | null;
  } | null;
};

export type OrgNodeType = "org" | "room" | "leadership";

export type OrgTreeNode = {
  id: string; // luôn dùng string
  name: string;
  parentId?: string | null;
  type: OrgNodeType; // org / room / leadership
  children?: OrgTreeNode[]; // dùng khi build tree
};

export type OrgUserTreeNode = {
  // Organization info (always present)
  orgId: string;
  orgName: string;

  // User info (null when selecting organization only)
  userId: number | null;
  userName: string | null;
  fullName: string | null;
  positionId: number | null;
  positionName: string | null;

  // Additional user properties
  lead?: boolean;
  directionAuthority?: boolean | null;
  positionOrder?: number | null;

  // Type to distinguish between org and user selection
  type: "org" | "user";
  children?: OrgUserTreeNode[];
};

export const detectOrgNodeType = (o: RawOrg): OrgNodeType => {
  const t = o.orgTypeModel;
  const nm = (o.name || "").toLowerCase();

  if (t?.isLeadership) return "leadership";
  if (nm.startsWith("lãnh đạo") || nm.includes("ban giám đốc"))
    return "leadership";

  if ((o.level ?? 99) >= 2 || (t?.name ?? "").toLowerCase() === "phòng") {
    return "room";
  }
  return "org";
};

export const buildOrgTree = (rows: RawOrg[]): OrgTreeNode[] => {
  const byId = new Map<string, OrgTreeNode>();
  const roots: OrgTreeNode[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    byId.set(String(r.id), {
      id: String(r.id),
      name: r.name,
      parentId: r.parentId != null ? String(r.parentId) : null,
      type: detectOrgNodeType(r),
      children: [],
    });
  }

  for (const node of Array.from(byId.values())) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  const clean = (arr?: OrgTreeNode[]) => {
    if (!arr) return;
    for (const n of arr) {
      if (n.children && n.children.length === 0) n.children = undefined;
      else clean(n.children);
    }
  };
  clean(roots);

  return roots;
};
