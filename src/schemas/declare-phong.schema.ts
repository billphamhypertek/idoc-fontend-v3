import { z } from "zod";
import dayjs from "dayjs";

export const declarePhongSchema = z.object({
  taskName: z.string().trim().min(1, "Tên công việc là bắt buộc"),
  complexityId: z
    .number()
    .nullable()
    .refine((val) => val !== null, {
      message: "Mức độ phức tạp là bắt buộc",
    }),
  startDate: z.string().min(1, "Thời gian giao là bắt buộc"),
  deadline: z.string().min(1, "Hạn xử lý là bắt buộc"),
  endDate: z.string().optional().nullable(),
  actualStartDate: z.string().optional().nullable(),
  actualEndDate: z.string().optional().nullable(),
  completeDate: z.string().min(1, "Ngày hoàn thành là bắt buộc"),
  extendDeadline: z.string().optional().nullable(),
  result: z.string().trim().min(1, "Kết quả thực hiện là bắt buộc"),
});

export type DeclarePhongFormData = z.infer<typeof declarePhongSchema>;
