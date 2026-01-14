import * as z from "zod";

// Validation schema for regular task form
export const regularTaskSchema = z.object({
  taskName: z
    .string()
    .min(1, "Yêu cầu nhập tên công việc")
    .refine((val) => val.trim() !== "", {
      message: "Tên công việc không được để trống",
    }),
  complexityId: z
    .string()
    .nullable()
    .refine((val) => val !== null && val !== "null", {
      message: "Yêu cầu chọn mức độ phức tạp",
    }),
  orgIds: z.array(z.string()).min(1, "Yêu cầu chọn đơn vị"),
});

export type RegularFormData = z.infer<typeof regularTaskSchema>;
