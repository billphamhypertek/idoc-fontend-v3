import * as z from "zod";

export const dailyReportFormSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  type: z.string().min(1, "Loại báo cáo là bắt buộc"),
  year: z.string().min(1, "Năm là bắt buộc"),
  week: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  organization: z.string().optional(),
  position: z.string().optional(),
  signer: z.string().min(1, "Người ký là bắt buộc"),
  recipients: z.string().optional(),
  confirmNumber: z.string().optional(),
  workDone: z.string().optional(),
  expected: z.string().optional(),
  requestAttach: z.string().optional(),
});

export type DailyReportFormData = z.infer<typeof dailyReportFormSchema>;
