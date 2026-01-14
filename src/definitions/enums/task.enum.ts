export enum EvaluationLevel {
  KHONG_HOAN_THANH = "KHONG_HOAN_THANH",
  HOAN_THANH = "HOAN_THANH",
  HOAN_THANH_TOT = "HOAN_THANH_TOT",
  HOAN_THANH_XUAT_SAC = "HOAN_THANH_XUAT_SAC",
}

export const EVALUATION_LEVELS = [
  { value: EvaluationLevel.KHONG_HOAN_THANH, label: "Không hoàn thành" },
  { value: EvaluationLevel.HOAN_THANH, label: "Hoàn thành" },
  { value: EvaluationLevel.HOAN_THANH_TOT, label: "Hoàn thành tốt" },
  { value: EvaluationLevel.HOAN_THANH_XUAT_SAC, label: "Hoàn thành xuất sắc" },
] as const;
