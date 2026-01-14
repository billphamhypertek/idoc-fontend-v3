import * as z from "zod";

// Validation schema for watch item form
export const watchItemFormSchema = z.object({
  role: z.string().min(1, "Vui lòng chọn vai trò"),
  org: z.string().min(1, "Vui lòng chọn vai trò để hiển thị đơn vị"),
  fullName: z
    .string()
    .min(1, "Vui lòng nhập người trực")
    .refine((val) => val !== "null", {
      message: "Vui lòng chọn người trực",
    }),
  department: z.string().min(1, "Vui lòng chọn vai trò để hiển thị phòng ban"),
  position: z.string().min(1, "Vui lòng nhập chức vụ"),
  phone: z.string().min(1, "Vui lòng nhập số điện thoại"),
});

export type WatchItemFormData = z.infer<typeof watchItemFormSchema>;
