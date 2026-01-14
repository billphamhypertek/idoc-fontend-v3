import * as z from "zod";

// Validation schema for calendar room form
export const calendarRoomSchema = z.object({
  name: z
    .string()
    .min(1, "Tên phòng họp không được để trống")
    .max(100, "Tên phòng họp không được vượt quá 100 ký tự")
    .refine((val) => val.trim() !== "", {
      message: "Tên phòng họp không được để trống",
    }),
  addressId: z.union([z.number(), z.null(), z.string()]).optional(),
  quantity: z.union([z.number(), z.null(), z.undefined()]).optional(),
  acreage: z.union([z.number(), z.null(), z.undefined()]).optional(),
  description: z
    .string()
    .max(200, "Mô tả không được vượt quá 200 ký tự")
    .optional(),
});

export type CalendarRoomFormData = z.infer<typeof calendarRoomSchema>;
