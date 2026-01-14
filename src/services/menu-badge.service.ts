import { sendGet } from "@/api";
import { getDataEncrypt } from "@/utils/token.utils";
import type {
  DocInCounts,
  DocOutCounts,
  DocInternalCounts,
  DelegateCounts,
  RecordsCounts,
  VehicleCounts,
  MenuBadgeSnapshot,
  MenuBadgesPayload,
} from "@/definitions/types/menubadges,type";

type Dict = Record<string, unknown>;

const toNum = (v: unknown): number =>
  typeof v === "number" && Number.isFinite(v)
    ? v
    : typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))
      ? Number(v)
      : 0;

const pickNum = (obj: Dict | undefined, keys: readonly string[]): number => {
  for (const k of keys) {
    const v = obj?.[k];
    const n = toNum(v);
    if (n) return n;
  }
  return 0;
};

const sum = (...nums: number[]) => nums.reduce((a, b) => a + b, 0);

export async function fetchDocIn(): Promise<DocInCounts> {
  const res = await sendGet("/document/report_doc_by_type");
  const d = (res as { data?: Dict }).data;

  const waitReceive = pickNum(d, [
    "DOC_IN_WAIT_RECEIVE",
    "DOC_IN_WAITING_RECEIVE",
    "DOC_IN_WAIT",
    "DOC_IN_WAITING",
    "WAIT_RECEIVE",
    "DOC_IN_TIEP_NHAN",
    "DOC_IN_TIEPNHAN",
  ]);

  const counts: Omit<DocInCounts, "ALL"> = {
    DOC_IN_MAIN: toNum(d?.["DOC_IN_MAIN"]),
    DOC_IN_SUPPORT: toNum(d?.["DOC_IN_SUPPORT"]),
    DOC_IN_KNOW: toNum(d?.["DOC_IN_KNOW"]),
    DOC_IN_OPINION: toNum(d?.["DOC_IN_OPINION"]),
    DOC_IN_DIRECTION: toNum(d?.["DOC_IN_DIRECTION"]),
    DOC_IN_WAIT_RECEIVE: waitReceive,
    DOC_IN_INTERNAL: toNum(d?.["DOC_IN_INTERNAL"]),
  };

  return {
    ...counts,
    ALL: sum(
      counts.DOC_IN_MAIN,
      counts.DOC_IN_SUPPORT,
      counts.DOC_IN_KNOW,
      counts.DOC_IN_OPINION,
      counts.DOC_IN_DIRECTION,
      counts.DOC_IN_WAIT_RECEIVE,
      counts.DOC_IN_INTERNAL
    ),
  };
}

export async function fetchDocOut(): Promise<DocOutCounts> {
  const res = await sendGet("/document_out/report_doc_by_type");
  const d = (res as { data?: Dict }).data;

  const counts: Omit<DocOutCounts, "ALL"> = {
    DRAFT_LIST: toNum(d?.["DRAFT_LIST"]),
    DRAFT_HANDLE: toNum(d?.["DRAFT_HANDLE"]),
    DRAFT_ISSUED: toNum(d?.["DRAFT_ISSUED"]),
    DOCUMENT_IN_LIST: toNum(d?.["DOCUMENT_IN_LIST"]),
  };
  return {
    ...counts,
    ALL: sum(
      counts.DRAFT_LIST,
      counts.DRAFT_HANDLE,
      counts.DRAFT_ISSUED,
      counts.DOCUMENT_IN_LIST
    ),
  };
}

export async function fetchDocInternal(): Promise<DocInternalCounts> {
  const res = await sendGet("/doc_internal/report");
  const d = (res as { data?: Dict }).data;

  // Nếu APPROVE không có, dùng WAITING như code cũ
  const approve =
    toNum(d?.["DOC_INTERNAL_APPROVE"]) || toNum(d?.["DOC_INTERNAL_WAITING"]);

  const counts: Omit<DocInternalCounts, "ALL"> = {
    DOC_INTERNAL_REGISTER: toNum(d?.["DOC_INTERNAL_REGISTER"]),
    DOC_INTERNAL_WAITING: toNum(d?.["DOC_INTERNAL_WAITING"]),
    DOC_INTERNAL_DOING: toNum(d?.["DOC_INTERNAL_DOING"]),
    DOC_INTERNAL_RETURN: toNum(d?.["DOC_INTERNAL_RETURN"]),
    // DOC_INTERNAL_PUBLISH: toNum(d?.["DOC_INTERNAL_PUBLISH"]), // TODO: remove this
    DOC_INTERNAL_PUBLISH: 0,
    DOC_INTERNAL_PENDING: toNum(d?.["DOC_INTERNAL_PENDING"]),
    DOC_INTERNAL_APPROVE: approve,
  };
  return {
    ...counts,
    ALL: sum(
      counts.DOC_INTERNAL_REGISTER,
      counts.DOC_INTERNAL_WAITING,
      counts.DOC_INTERNAL_DOING,
      counts.DOC_INTERNAL_RETURN,
      // counts.DOC_INTERNAL_PUBLISH,
      counts.DOC_INTERNAL_PENDING,
      counts.DOC_INTERNAL_APPROVE
    ),
  };
}

export async function fetchDelegate(): Promise<DelegateCounts> {
  const res = await sendGet("/document/report_doc_delegate");
  const d = (res as { data?: Dict }).data;
  const counts: Omit<DelegateCounts, "ALL"> = {
    DOC_IN_DELEGATE: toNum(d?.["DOC_IN_DELEGATE"]),
    DOC_OUT_DELEGATE: toNum(d?.["DOC_OUT_DELEGATE"]),
  };
  return {
    ...counts,
    ALL: sum(counts.DOC_IN_DELEGATE, counts.DOC_OUT_DELEGATE),
  };
}

export async function fetchTask(): Promise<MenuBadgeSnapshot["task"]> {
  const res = await sendGet("/task/report_doc_by_type");
  const d = (res as { data?: Dict }).data;
  const counts = {
    TASK_ASSIGN: toNum(d?.["TASK_ASSIGN"]),
    TASK_MAIN: toNum(d?.["TASK_MAIN"]),
    TASK_SUPPORT: toNum(d?.["TASK_SUPPORT"]),
    WORD_EDITOR: toNum(d?.["WORD_EDITOR"]),
  };
  return {
    ...counts,
    ALL: sum(
      counts.TASK_ASSIGN,
      counts.TASK_MAIN,
      counts.TASK_SUPPORT,
      counts.WORD_EDITOR
    ),
  };
}

export async function fetchTaskV2(): Promise<MenuBadgeSnapshot["taskV2"]> {
  if (getDataEncrypt() === "true") {
    return {
      TASK_ASSIGN_2: 0,
      TASK_MAIN_2: 0,
      TASK_SUPPORT_2: 0,
      WORD_EDITOR_2: 0,
      ALL: 0,
    };
  }

  const res = await sendGet("/task2/report_doc_by_type");
  const d = (res as { data?: Dict }).data;
  const counts = {
    TASK_ASSIGN_2: toNum(d?.["TASK_ASSIGN"]),
    TASK_MAIN_2: toNum(d?.["TASK_MAIN"]),
    TASK_SUPPORT_2: toNum(d?.["TASK_SUPPORT"]),
    WORD_EDITOR_2: toNum(d?.["WORD_EDITOR"]),
  };

  return {
    ...counts,
    ALL: sum(
      counts.TASK_ASSIGN_2,
      counts.TASK_MAIN_2,
      counts.TASK_SUPPORT_2,
      counts.WORD_EDITOR_2
    ),
  };
}

export async function fetchRecords(): Promise<RecordsCounts> {
  const res = await sendGet("/hstl/report/menu");
  const d = (res as { data?: Dict }).data;

  const HSTL_PHONGBAN = sum(
    toNum(d?.["HSTL_PHONGBAN_CHOXACNHAN"]),
    toNum(d?.["HSTL_PHONGBAN_NOPLUUTRU"]),
    toNum(d?.["HSTL_PHONGBAN_TRALAI"]),
    toNum(d?.["HSTL_PHONGBAN_TRALAI"])
  );

  const HSTL_COQUAN = sum(
    toNum(d?.["HSTL_COQUAN_TIEPNHAN"]),
    toNum(d?.["HSTL_COQUAN_DUYETTRALAI"]),
    toNum(d?.["HSTL_COQUAN_TRALAI"])
  );

  const counts: Omit<RecordsCounts, "ALL"> = {
    HSTL_CONGVIEC: toNum(d?.["HSTL_CONGVIEC"]),
    HSTL_CANHAN: toNum(d?.["HSTL_CANHAN"]),
    HSTL_PHONGBAN,
    HSTL_COQUAN,
  };
  return {
    ...counts,
    ALL: sum(
      counts.HSTL_CONGVIEC,
      counts.HSTL_CANHAN,
      counts.HSTL_PHONGBAN,
      counts.HSTL_COQUAN
    ),
  };
}

export async function fetchVehicle(): Promise<VehicleCounts> {
  const res = await sendGet("/vehicle-usage-plan/report_doc_by_type");
  const d = (res as { data?: Dict }).data;

  const VEHICLE_SLOT = pickNum(d, [
    "VEHICLE_USAGE_PLAN_TICKET",
    "VEHICLE_SLOT",
  ]);
  const VEHICLE_MAIN = pickNum(d, [
    "VEHICLE_USAGE_PLAN_HANDLE",
    "VEHICLE_MAIN",
  ]);

  const counts: Omit<VehicleCounts, "ALL"> = {
    VEHICLE_SLOT,
    VEHICLE_MAIN,
  };
  return {
    ...counts,
    ALL: sum(counts.VEHICLE_SLOT, counts.VEHICLE_MAIN),
  };
}

export async function fetchNotifications(): Promise<number> {
  const res = await sendGet("/notification/getTotal");
  return toNum((res as { data?: unknown }).data);
}

export async function fetchAllBadges(): Promise<MenuBadgesPayload> {
  const [
    docIn,
    docOut,
    internal,
    delegate,
    task,
    taskV2,
    records,
    vehicle,
    notifications,
  ] = await Promise.all([
    fetchDocIn(),
    fetchDocOut(),
    fetchDocInternal(),
    fetchDelegate(),
    fetchTask(),
    fetchTaskV2(),
    fetchRecords(),
    fetchVehicle(),
    fetchNotifications(),
  ]);

  const snapshot: MenuBadgeSnapshot = {
    docIn,
    docOut,
    internal,
    task,
    taskV2,
    delegate,
    records,
    vehicle,
  };

  return { snapshot, notifications };
}
