import * as z from "zod";

// Validation schema for self declare task form
export const selfDeclareTaskSchema = z
  .object({
    taskName: z
      .string()
      .min(1, "Yêu cầu nhập tên công việc")
      .max(1000, "Tên công việc không được vượt quá 1000 ký tự")
      .refine((val) => val.trim() !== "", {
        message: "Tên công việc không được để trống",
      }),
    description: z
      .string()
      .min(1, "Yêu cầu nhập mô tả")
      .max(1000, "Mô tả không được vượt quá 1000 ký tự")
      .refine((val) => val.trim() !== "", {
        message: "Mô tả không được để trống",
      }),
    complexityId: z.union([z.number(), z.null(), z.string()]).refine(
      (val) => {
        if (val === null || val === undefined || val === "all" || val === "") {
          return false;
        }
        return true;
      },
      {
        message: "Yêu cầu chọn mức độ phức tạp",
      }
    ),
    assignerId: z.union([z.number(), z.null(), z.string()]).refine(
      (val) => {
        if (val === null || val === undefined || val === "all" || val === "") {
          return false;
        }
        return true;
      },
      {
        message: "Yêu cầu chọn người giao",
      }
    ),
    handlerId: z.union([z.number(), z.null(), z.string()]).refine(
      (val) => {
        if (val === null || val === undefined || val === "all" || val === "") {
          return false;
        }
        return true;
      },
      {
        message: "Yêu cầu chọn người thực hiện",
      }
    ),
    startDate: z.string().min(1, "Yêu cầu chọn ngày giao việc"),
    endDate: z.string().min(1, "Yêu cầu chọn hạn xử lý"),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        return endDate >= startDate;
      }
      return true;
    },
    {
      message: "Hạn xử lý phải sau hoặc bằng ngày giao việc",
      path: ["endDate"],
    }
  );

export type SelfDeclareFormData = z.infer<typeof selfDeclareTaskSchema>;
