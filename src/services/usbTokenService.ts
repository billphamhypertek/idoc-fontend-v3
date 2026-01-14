import { Constant } from "@/definitions/constants/constant";
import { toast } from "@/hooks/use-toast";
import { sendGet, sendPost } from "@/api";
import { confirmDialog } from "@/components/common/confirm";
import { ToastUtils } from "@/utils/toast.utils";

// Xóa dữ liệu encrypt trong sessionStorage
export const removeDataEncryptAll = () => {
  sessionStorage.removeItem("VAN_BAN_DI_ENCRYPT");
  sessionStorage.removeItem("VAN_BAN_DEN_ENCRYPT");
  sessionStorage.removeItem("SO_VB_ENCRYPT");
};

// Hàm kiểm tra token với server
export async function checkTokenOfUser(token: string): Promise<any> {
  if (!token) throw new Error("Token không được để trống");

  try {
    const res = await sendPost(
      `${Constant.API_ENDPOINT}/users/checkTokenOfUser`,
      token
    );

    if (res && res.data !== undefined) {
      return res;
    }
    throw new Error("Dữ liệu trả về không hợp lệ");
  } catch (err) {
    console.error("Lỗi khi kiểm tra token:", err);
    throw err;
  }
}

// Hàm kiểm tra kết nối service ký số (qua WebSocket)
export async function checkServiceToken(): Promise<number | string> {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(Constant.URL_ENCRYPT_CHECK_TOKEN || "");

      ws.onopen = () => {
        console.log("Encryption WebSocket connected");
        if (ws.readyState === WebSocket.OPEN) {
          resolve(200);
          ws.close();
        }
      };

      ws.onclose = () => {
        console.log("Encryption WebSocket closed");
      };

      ws.onerror = (error) => {
        console.error("Encryption WebSocket error:", error);
        resolve("-100");
      };
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
      resolve("-100");
    }
  });
}

// Hàm fallback khi không kết nối được
export async function checkTokenConnect() {
  const isCheckToken = await checkServiceToken();
  if (isCheckToken === "-100") {
    const ok = await confirmDialog({
      title: "Khởi chạy công cụ ký mã",
      description:
        "Mã hóa tệp tin cần khởi chạy công cụ ký mã. Ấn đồng ý để khởi chạy công cụ!",
      confirmText: "Đồng ý",
      cancelText: "Hủy",
    });
    if (ok) {
      window.location.href = "signservice://start";
      removeDataEncryptAll();
      setTimeout(() => location.reload(), 2000);
    } else {
      ToastUtils.error("Không thể kiểm tra USB Token");
      removeDataEncryptAll();
      setTimeout(() => location.reload(), 2000);
    }
  }
}

// Hàm lấy cert từ USB token
export async function getUSBTokenEncryptNoMessage(): Promise<string | null> {
  const connected = await checkServiceToken();
  if (connected !== 200) {
    ToastUtils.error("Vui lòng mở sign service!");
    return null;
  }

  try {
    const res = await sendGet(`${Constant.SIGN_SERVICE_URL || ""}/get-cert`);
    if (!res) {
      ToastUtils.error("Không lấy được cert từ USB Token");
      throw new Error("Không lấy được cert từ USB Token");
    }
    return res;
  } finally {
    // disconnect nếu cần
  }
}

// Hàm kiểm tra token USB
export async function checkUsbTokenEncypt(): Promise<boolean> {
  try {
    const cert = await getUSBTokenEncryptNoMessage();

    if (!cert) {
      ToastUtils.error("Không thể lấy thông tin USB Token");
      removeDataEncryptAll();
      setTimeout(() => location.reload(), 2000);
      return false;
    }

    if (typeof cert === "string" && !cert.includes("err:")) {
      try {
        const res = await checkTokenOfUser(cert);
        if (res && res.data === true) {
          return true;
        } else {
          ToastUtils.error("USB Token không hợp lệ!");
          removeDataEncryptAll();
          setTimeout(() => location.reload(), 2000);
          return false;
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra token:", err);
        ToastUtils.error("Không thể kiểm tra USB Token");
        removeDataEncryptAll();
        setTimeout(() => location.reload(), 2000);
        return false;
      }
    } else {
      ToastUtils.error(
        "Vui lòng sử dụng USB token để sử dụng chức năng văn bản mật!"
      );
      removeDataEncryptAll();
      setTimeout(() => location.reload(), 2000);
      return false;
    }
  } catch (err) {
    await checkTokenConnect();
    return false;
  }
}

let isChecking = false;
export async function isCheckStartUsbTokenWatcher() {
  const vbden = sessionStorage.getItem("VAN_BAN_DEN_ENCRYPT") === "true";
  const vbdi = sessionStorage.getItem("VAN_BAN_DI_ENCRYPT") === "true";

  if ((vbden || vbdi) && !isChecking) {
    isChecking = true;
    try {
      await checkUsbTokenEncypt();
    } catch (err) {
      console.error("Xảy ra lỗi trong quá trình kiểm tra USB Token:", err);
    } finally {
      isChecking = false;
    }
  }
}
