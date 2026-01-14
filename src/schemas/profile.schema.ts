import { z } from "zod";

export const userSchema = z.object({
  fullName: z
    .string()
    .min(1, "Họ và tên không được để trống")
    .max(200, "Họ và tên không được dài quá 200 ký tự")
    .refine(
      (val) => val.trim() !== "",
      "Đề nghị thông tin họ và tên không được có khoảng trống"
    ),
  userName: z
    .string()
    .min(1, "Tên đăng nhập không được để trống")
    .max(200, "Tên đăng nhập không được dài quá 200 ký tự")
    .refine(
      (val) => !/\s/g.test(val),
      "Đề nghị thông tin tên đăng nhập không được có khoảng trống"
    ),
  position: z.number().min(1, "Chức vụ không được để trống"),
  org: z.number().min(1, "Đơn vị không được để trống"),
  phone: z
    .string()
    .min(1, "Số điện thoại không được để trống")
    .max(20, "Số điện thoại không được dài quá 20 ký tự"),
  email: z
    .string()
    .min(1, "Thư điện tử không được để trống")
    .max(100, "Thư điện tử không được dài quá 100 ký tự")
    .email("Email không hợp lệ"),
  gender: z.number().optional(),
  lead: z.boolean().optional(),
  indentity: z.string().optional(),
  phoneCA: z.string().optional(),
  phoneCAProvider: z.string().optional(),
  address: z.string().optional(),
  birthday: z.string().optional(),
});

export type UserFormData = z.infer<typeof userSchema>;

// Password change schema
export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mật khẩu hiện tại không được để trống"),
    newPassword: z.string().min(1, "Mật khẩu mới không được để trống"),
    newPasswordConfirmation: z
      .string()
      .min(1, "Xác nhận mật khẩu không được để trống"),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["newPasswordConfirmation"],
  });

export type PasswordFormData = z.infer<typeof passwordSchema>;
