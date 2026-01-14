import { sendPostRaw } from "@/api";

export const TokenValidationService = {
  async checkTokenOfUser(token: string): Promise<any> {
    if (!token) {
      throw new Error("Token không được để trống");
    }

    try {
      const response = await sendPostRaw("/users/checkTokenOfUser", token);

      if (response && response.data !== undefined) {
        return response;
      } else {
        throw new Error("Dữ liệu trả về không hợp lệ");
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra token:", error);
      throw new Error("Không thể kết nối đến server");
    }
  },
};
