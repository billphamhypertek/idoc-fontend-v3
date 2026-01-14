import { useQuery } from "@tanstack/react-query";
import { fetchAllBadges } from "@/services/menu-badge.service";
import type {
  MenuBadgeSnapshot,
  MenuBadgesPayload,
} from "@/definitions/types/menubadges,type";
import { useEncryptStore } from "@/stores/encrypt.store";

export interface MenuBadgeParentTotals {
  DOCUMENT_IN: number;
  DOCUMENT_OUT: number;
  DOC_INTERNAL: number;
  TASK: number;
  TASK_2: number;
  DELEGATE: number;
  HSTL: number;
  VEHICLE: number;
  ALL: number;
}

export type MenuBadgesResult = {
  snapshot: MenuBadgeSnapshot;
  parent: MenuBadgeParentTotals;
  notifications: number;
  byCode: (code?: string, nameHint?: string, hrefHint?: string) => number;
};

const MENU_BADGE_KEY = "menu/badges";

function buildParentTotals(s: MenuBadgeSnapshot): MenuBadgeParentTotals {
  const DOCUMENT_IN =
    s.docIn.DOC_IN_MAIN +
    s.docIn.DOC_IN_SUPPORT +
    s.docIn.DOC_IN_KNOW +
    s.docIn.DOC_IN_OPINION +
    s.docIn.DOC_IN_DIRECTION +
    s.docIn.DOC_IN_WAIT_RECEIVE +
    s.docIn.DOC_IN_INTERNAL;

  const DOCUMENT_OUT =
    s.docOut.DRAFT_LIST +
    s.docOut.DRAFT_HANDLE +
    s.docOut.DRAFT_ISSUED +
    s.docOut.DOCUMENT_IN_LIST;

  const DOC_INTERNAL_TOTAL =
    s.internal.DOC_INTERNAL_REGISTER +
    s.internal.DOC_INTERNAL_WAITING +
    s.internal.DOC_INTERNAL_DOING +
    s.internal.DOC_INTERNAL_RETURN +
    s.internal.DOC_INTERNAL_PUBLISH +
    s.internal.DOC_INTERNAL_PENDING +
    s.internal.DOC_INTERNAL_APPROVE;

  const TASK_TOTAL =
    s.task.TASK_ASSIGN +
    s.task.TASK_MAIN +
    s.task.TASK_SUPPORT +
    s.task.WORD_EDITOR;

  const TASK_V2_TOTAL =
    s.taskV2.TASK_ASSIGN_2 +
    s.taskV2.TASK_MAIN_2 +
    s.taskV2.TASK_SUPPORT_2 +
    s.taskV2.WORD_EDITOR_2;

  const DELEGATE_TOTAL =
    s.delegate.DOC_IN_DELEGATE + s.delegate.DOC_OUT_DELEGATE;

  const HSTL_TOTAL =
    s.records.HSTL_CONGVIEC +
    s.records.HSTL_CANHAN +
    s.records.HSTL_PHONGBAN +
    s.records.HSTL_COQUAN;

  const VEHICLE_TOTAL = s.vehicle.VEHICLE_SLOT + s.vehicle.VEHICLE_MAIN;

  const ALL =
    DOCUMENT_IN +
    DOCUMENT_OUT +
    DOC_INTERNAL_TOTAL +
    TASK_TOTAL +
    TASK_V2_TOTAL +
    DELEGATE_TOTAL +
    HSTL_TOTAL +
    VEHICLE_TOTAL;

  return {
    DOCUMENT_IN,
    DOCUMENT_OUT,
    DOC_INTERNAL: DOC_INTERNAL_TOTAL,
    TASK: TASK_TOTAL,
    TASK_2: TASK_V2_TOTAL,
    DELEGATE: DELEGATE_TOTAL,
    HSTL: HSTL_TOTAL,
    VEHICLE: VEHICLE_TOTAL,
    ALL,
  };
}

const norm = (s?: string) =>
  (s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();

function canonicalCode(code?: string, nameHint?: string, hrefHint?: string) {
  const c = norm(code);

  const alias: Record<string, string> = {
    ADDSLOT_VEHILE: "VEHICLE_SLOT",
    MAINHANDLE_VEHICLE: "VEHICLE_MAIN",
    VEHICLE_USAGE_PLAN_TICKET: "VEHICLE_SLOT",
    VEHICLE_USAGE_PLAN_HANDLE: "VEHICLE_MAIN",
    DOC_WAIT_RECEIVE: "DOC_IN_WAIT_RECEIVE",
    DOC_IN_RECEIVE: "DOC_IN_WAIT_RECEIVE",
    DOC_RECEIVE: "DOC_IN_WAIT_RECEIVE",
    VB_DEN_TIEP_NHAN: "DOC_IN_WAIT_RECEIVE",
    VB_DEN_MOI: "DOC_IN_WAIT_RECEIVE",
    DOC_OUT_KNOW: "DOCUMENT_IN_LIST",
    TASK_WORK: "TASK_MAIN",
    DOC_IN_MAIN: "DOC_IN_MAIN",
  };
  if (c && alias[c]) return alias[c];

  const h = norm(hrefHint);
  if (h) {
    if (h.includes("MANAGE-VEHICLE/REGISTER")) return "VEHICLE_SLOT";
    if (h.includes("MANAGE-VEHICLE/MAIN")) return "VEHICLE_MAIN";
    // Task mappings by href
    if (h.includes("/TASK/WORK") || h.includes("/task/work"))
      return "TASK_MAIN";
    // Task V2 mappings by href
    if (h.includes("/TASK-V2/WORK") || h.includes("/task-v2/work"))
      return "TASK_MAIN_2";
    if (h.includes("/TASK-V2/ASSIGN") || h.includes("/task-v2/assign"))
      return "TASK_ASSIGN_2";
    if (
      h.includes("/TASK-V2/COMBINATION") ||
      h.includes("/task-v2/combination")
    )
      return "TASK_SUPPORT_2";
  }

  const nName = norm(nameHint);
  if (nName) {
    if (nName.includes("PHIEU XIN XE")) return "VEHICLE_SLOT";
    if (nName.includes("XU LY CHINH")) return "VEHICLE_MAIN";
  }

  return c || "";
}

function valueByCodeFromSnapshot(
  s: MenuBadgeSnapshot,
  code?: string,
  nameHint?: string,
  hrefHint?: string
): number {
  const key = canonicalCode(code, nameHint, hrefHint);
  if (!key) return 0;

  if (key === "DOCUMENT_IN") return buildParentTotals(s).DOCUMENT_IN;
  if (key === "DOCUMENT_OUT") return buildParentTotals(s).DOCUMENT_OUT;
  if (key === "DOC_INTERNAL") return buildParentTotals(s).DOC_INTERNAL;
  if (key === "TASK") return buildParentTotals(s).TASK;
  if (key === "DELEGATE") return buildParentTotals(s).DELEGATE;
  if (key === "HSTL") return buildParentTotals(s).HSTL;
  if (key === "TASK_2") return buildParentTotals(s).TASK_2;
  if (key === "VEHICLE" || key === "VEHICLE_DRAFT")
    return buildParentTotals(s).VEHICLE;

  const docIn: Record<string, number> = {
    DOC_IN_MAIN: s.docIn.DOC_IN_MAIN,
    DOC_IN_SUPPORT: s.docIn.DOC_IN_SUPPORT,
    DOC_IN_KNOW: s.docIn.DOC_IN_KNOW,
    DOC_IN_OPINION: s.docIn.DOC_IN_OPINION,
    DOC_IN_DIRECTION: s.docIn.DOC_IN_DIRECTION,
    DOC_OUT_LIST: s.docIn.DOC_IN_WAIT_RECEIVE,
    DOC_IN_INTERNAL: s.docIn.DOC_IN_INTERNAL,
  };
  if (key in docIn) return docIn[key];

  const docOut: Record<string, number> = {
    DRAFT_LIST: s.docOut.DRAFT_LIST,
    DRAFT_HANDLE: s.docOut.DRAFT_HANDLE,
    DRAFT_ISSUED: s.docOut.DRAFT_ISSUED,
    DOCUMENT_IN_LIST: s.docOut.DOCUMENT_IN_LIST,
  };
  if (key in docOut) return docOut[key];

  const internal: Record<string, number> = {
    DOC_INTERNAL_REGISTER: s.internal.DOC_INTERNAL_REGISTER,
    DOC_INTERNAL_WAITING: s.internal.DOC_INTERNAL_WAITING,
    DOC_INTERNAL_DOING: s.internal.DOC_INTERNAL_DOING,
    DOC_INTERNAL_RETURN: s.internal.DOC_INTERNAL_RETURN,
    DOC_INTERNAL_PUBLISH: s.internal.DOC_INTERNAL_PUBLISH,
    DOC_INTERNAL_PENDING: s.internal.DOC_INTERNAL_PENDING,
    DOC_INTERNAL_APPROVE: s.internal.DOC_INTERNAL_APPROVE,
  };
  if (key in internal) return internal[key];

  const task: Record<string, number> = {
    TASK_ASSIGN: s.task.TASK_ASSIGN,
    TASK_MAIN: s.task.TASK_MAIN,
    TASK_SUPPORT: s.task.TASK_SUPPORT,
    WORD_EDITOR: s.task.WORD_EDITOR,
  };
  if (key in task) return task[key];

  const taskV2: Record<string, number> = {
    TASK_ASSIGN_2: s.taskV2.TASK_ASSIGN_2,
    TASK_MAIN_2: s.taskV2.TASK_MAIN_2,
    TASK_SUPPORT_2: s.taskV2.TASK_SUPPORT_2,
    WORD_EDITOR_2: s.taskV2.WORD_EDITOR_2,
  };
  if (key in taskV2) return taskV2[key];

  const delegate: Record<string, number> = {
    DOC_IN_DELEGATE: s.delegate.DOC_IN_DELEGATE,
    DOC_OUT_DELEGATE: s.delegate.DOC_OUT_DELEGATE,
  };
  if (key in delegate) return delegate[key];

  const records: Record<string, number> = {
    HSTL_CONGVIEC: s.records.HSTL_CONGVIEC,
    HSTL_CANHAN: s.records.HSTL_CANHAN,
    HSTL_PHONGBAN: s.records.HSTL_PHONGBAN,
    HSTL_COQUAN: s.records.HSTL_COQUAN,
  };
  if (key in records) return records[key];

  const vehicle: Record<string, number> = {
    VEHICLE_SLOT: s.vehicle.VEHICLE_SLOT,
    VEHICLE_MAIN: s.vehicle.VEHICLE_MAIN,
  };
  if (key in vehicle) return vehicle[key];

  return 0;
}

export const useMenuBadges = (ownerKey?: string) => {
  const { isEncrypt } = useEncryptStore();
  return useQuery<MenuBadgesResult>({
    queryKey: [MENU_BADGE_KEY, ownerKey ?? "global", isEncrypt],
    queryFn: async () => {
      const { snapshot, notifications }: MenuBadgesPayload =
        await fetchAllBadges();

      const parent = buildParentTotals(snapshot);
      const byCode = (code?: string, nameHint?: string, hrefHint?: string) =>
        valueByCodeFromSnapshot(snapshot, code, nameHint, hrefHint);

      return { snapshot, parent, notifications, byCode };
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchInterval: 60_000,
  });
};
