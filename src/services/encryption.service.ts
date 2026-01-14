import { Constant } from "@/definitions/constants/constant";
import {
  getToken,
  getUserInfo,
  removeDataEncryptAll,
} from "@/utils/token.utils";
import { TextUtils } from "@/utils/text-utils";
import { CommonService } from "./common";
import { TokenValidationService } from "./token-validation.service";
import { confirmDialog } from "@/components/common/confirm";
import { useEncryptStore } from "@/stores/encrypt.store";
import { ToastUtils } from "@/utils/toast.utils";

export interface EncryptionProgress {
  totalFiles?: number;
  currentFile?: number;
  currentProgress: number;
  fileName?: string;
  expectedChunks: number;
  receivedChunks: number;
  fileSize?: number;
  namedraftFiles?: string;
}

interface Toast {
  (options: { variant?: string; title: string; description: string }): void;
}
const listeners: ((progress: EncryptionProgress) => void)[] = [];
function notify() {
  console.log("notify", encryptionProgress);
  listeners.forEach((cb) => cb(encryptionProgress));
}
let encryptionProgress: EncryptionProgress = {
  totalFiles: 0,
  currentFile: 0,
  currentProgress: 0,
  fileName: "",
  expectedChunks: 0,
  receivedChunks: 0,
  fileSize: 0,
  namedraftFiles: "",
};

export const EncryptionService = (function () {
  const ENCRYPT = "encrypt";
  let webSocketRef: WebSocket | null = null;
  let webSocketUsbTokenRef: WebSocket | null = null;
  let webSocketTokenCheckRef: WebSocket | null = null;
  const isCheckConnectToken = true;
  let countSuccessRef = 0;
  const numberOfFileRef = 0;
  const usbTokenTimerRef: NodeJS.Timeout | null = null;
  let errorsRef: string[] = [];
  let toast: Toast;

  function init(toastFn: Toast) {
    toast = toastFn;
  }
  function subscribe(cb: (progress: EncryptionProgress) => void) {
    listeners.push(cb);
    cb(encryptionProgress); // emit ngay lần đầu
    return () => {
      const idx = listeners.indexOf(cb);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }

  function getEncryptionProgress(): EncryptionProgress {
    return encryptionProgress;
  }

  function updateEncryptionProgress(
    partial: Partial<EncryptionProgress>
  ): void {
    encryptionProgress = { ...encryptionProgress, ...partial };
    notify();
  }

  function toString(arr: any[]): string {
    if (!arr || arr.length === 0) {
      return "";
    }
    let tmp = "";
    for (let index = 0; index < arr.length; index++) {
      const element = encodeURIComponent(arr[index]);
      tmp = index === 0 ? `${element}` : `${tmp},${element}`;
    }
    return tmp;
  }

  async function connect(): Promise<number | string> {
    return new Promise((resolve, reject) => {
      try {
        if (webSocketRef && webSocketRef.readyState === WebSocket.OPEN) {
          console.log("Đã có kết nối WebSocket");
          resolve(200);
          return;
        }

        webSocketRef = new WebSocket(Constant.URL_ENCRYPT_FILE || "");

        const connectionTimeout = setTimeout(() => {
          console.error("Kết nối WebSocket quá thời gian");
          resolve("-100");
        }, 10000);

        webSocketRef.onopen = () => {
          console.log("Encryption WebSocket connected");
          clearTimeout(connectionTimeout);
          if (webSocketRef?.readyState === WebSocket.OPEN) {
            resolve(200);
          }
        };

        webSocketRef.onmessage = (event) => {
          console.log("Encryption WebSocket message:", event);
        };

        webSocketRef.onclose = () => {
          console.log("Encryption WebSocket closed");
          clearTimeout(connectionTimeout);
          webSocketRef = null;
        };

        webSocketRef.onerror = (error) => {
          console.error("Encryption WebSocket error:", error);
          clearTimeout(connectionTimeout);
          resolve("-100");
        };
      } catch (error) {
        console.error("Error connecting to WebSocket:", error);
        resolve("-100");
      }
    });
  }

  async function checkServiceToken(): Promise<number | string> {
    return new Promise((resolve, reject) => {
      try {
        webSocketTokenCheckRef = new WebSocket(
          Constant.URL_ENCRYPT_CHECK_TOKEN || ""
        );
        webSocketTokenCheckRef.onopen = () => {
          console.log("Encryption WebSocket connected");
          if (webSocketTokenCheckRef?.readyState === WebSocket.OPEN) {
            resolve(200);
            webSocketTokenCheckRef?.close();
            webSocketTokenCheckRef = null;
          }
        };
        webSocketTokenCheckRef.onclose = () => {
          console.log("Encryption WebSocket closed");
          webSocketTokenCheckRef = null;
        };
        webSocketTokenCheckRef.onerror = (error) => {
          console.error("Encryption WebSocket error:", error);
          resolve("-100");
        };
      } catch (error) {
        console.error("Error connecting to WebSocket:", error);
        resolve("-100");
      }
    });
  }

  async function checkTokenConnect(): Promise<void> {
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
        useEncryptStore.getState().setEncrypt(false);
        removeDataEncryptAll();
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        ToastUtils.error("Không thể kiểm tra USB Token");
        useEncryptStore.getState().setEncrypt(false);
        removeDataEncryptAll();
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    }
  }

  async function connectUsbToken(): Promise<number | string> {
    return new Promise((resolve, reject) => {
      try {
        webSocketUsbTokenRef = new WebSocket(Constant.URL_ENCRYPT_FILE || "");
        webSocketUsbTokenRef.onopen = () => {
          console.log("Encryption WebSocket connected");
          if (webSocketUsbTokenRef?.readyState === WebSocket.OPEN) {
            resolve(200);
          }
        };
        webSocketUsbTokenRef.onmessage = (event) => {
          console.log("Encryption WebSocket message:", event);
        };
        webSocketUsbTokenRef.onclose = () => {
          console.log("Encryption WebSocket closed");
          webSocketUsbTokenRef = null;
        };
        webSocketUsbTokenRef.onerror = (error) => {
          console.error("Encryption WebSocket error:", error);
          resolve("-100");
        };
      } catch (error) {
        console.error("Error connecting to WebSocket:", error);
        resolve("-100");
      }
    });
  }

  async function disconnect(): Promise<void> {
    if (webSocketRef && webSocketRef.readyState !== WebSocket.CLOSED) {
      await webSocketRef.close();
    }
    webSocketRef = null;
  }

  function disconnectUsbToken(): void {
    if (
      webSocketUsbTokenRef &&
      webSocketUsbTokenRef.readyState !== WebSocket.CLOSED
    ) {
      webSocketUsbTokenRef.close();
    }
    webSocketUsbTokenRef = null;
  }

  async function checkConnect(): Promise<boolean> {
    if (webSocketRef && webSocketRef.readyState === WebSocket.OPEN) {
      return true;
    }
    const status = await connect();
    if (status === "-100") {
      await checkTokenConnect();
      return false;
    }
    if (status !== 200) {
      ToastUtils.error("Lỗi kết nối tới service mã hóa");
      return false;
    }
    return true;
  }

  async function checkConnectUsbToken(): Promise<boolean> {
    if (
      webSocketUsbTokenRef &&
      webSocketUsbTokenRef.readyState === WebSocket.OPEN
    ) {
      return true;
    }
    const status = await connectUsbToken();
    if (status === "-100") {
      return false;
    }
    if (status !== 200) {
      ToastUtils.error("Lỗi kết nối tới service mã hóa");
      return false;
    }
    return true;
  }

  async function getUSBToken(): Promise<string> {
    const connected = await checkConnect();
    if (!connected) {
      throw new Error("Không thể kết nối đến service mã hóa");
    }
    try {
      const cert = await getCert();
      ToastUtils.success("Lấy thông tin thành công, vui lòng Lưu lại!!!");
      return cert;
    } catch (error) {
      console.error("Error getting USB token:", error);
      throw error;
    } finally {
      await disconnect();
    }
  }

  async function getUSBTokenEncryptNoMessage(): Promise<string | undefined> {
    const connected = await checkConnectUsbToken();
    if (!connected) {
      ToastUtils.warning("Vui lòng mở sign service!");
      return undefined;
    }
    try {
      return await getCertUsbToken();
    } finally {
      disconnectUsbToken();
    }
  }

  async function checkUsbTokenEncypt(onFailure?: () => void): Promise<boolean> {
    try {
      const cert = await getUSBTokenEncryptNoMessage();
      if (!cert) {
        ToastUtils.error("Không thể lấy thông tin USB Token");
        useEncryptStore.getState().setEncrypt(false);
        removeDataEncryptAll();
        setTimeout(() => {
          if (onFailure) {
            onFailure();
          } else {
            window.location.reload();
          }
        }, 2000);
        return false;
      }

      if (typeof cert === "string" && !cert.includes("err:")) {
        try {
          const res = await TokenValidationService.checkTokenOfUser(cert);
          if (res && res.data === true) {
            return true;
          } else {
            ToastUtils.error("USB Token không hợp lệ!");
            useEncryptStore.getState().setEncrypt(false);
            removeDataEncryptAll();
            setTimeout(() => {
              if (onFailure) {
                onFailure();
              } else {
                window.location.reload();
              }
            }, 2000);
            return false;
          }
        } catch (error) {
          ToastUtils.error("Không thể kiểm tra USB Token");
          useEncryptStore.getState().setEncrypt(false);
          removeDataEncryptAll();
          setTimeout(() => {
            if (onFailure) {
              onFailure();
            } else {
              window.location.reload();
            }
          }, 2000);
          return false;
        }
      } else {
        ToastUtils.error(
          "Vui lòng sử dụng USB token để sử dụng chức năng văn bản mật!"
        );
        useEncryptStore.getState().setEncrypt(false);
        removeDataEncryptAll();
        setTimeout(() => {
          if (onFailure) {
            onFailure();
          } else {
            window.location.reload();
          }
        }, 2000);
        return false;
      }
    } catch (error) {
      await checkTokenConnect();
      return false;
    }
  }

  function isCheckStartUsbTokenWatcher(onFailure?: () => void): void {
    let isChecking = false;
    const vbden = sessionStorage.getItem("VAN_BAN_DEN_ENCRYPT") === "true";
    const vbdi = sessionStorage.getItem("VAN_BAN_DI_ENCRYPT") === "true";
    if ((vbden || vbdi) && !isChecking) {
      isChecking = true;
      try {
        checkUsbTokenEncypt(onFailure);
      } catch (err) {
        console.error("Xảy ra lỗi trong quá trình kiểm tra USB Token:", err);
      } finally {
        isChecking = false;
      }
    }
  }

  function getCert(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!webSocketRef || webSocketRef.readyState !== WebSocket.OPEN) {
        reject(new Error("WebSocket không kết nối"));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error("Timeout khi lấy thông tin USB token"));
      }, 30000);

      webSocketRef.send("get-cer");
      webSocketRef.onmessage = (event) => {
        clearTimeout(timeout);
        if (event.data === "err: invalid cert") {
          reject(new Error("Lỗi chứng thực người dùng không đúng"));
        } else {
          resolve(event.data);
        }
      };
    });
  }

  function getCertUsbToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (
        !webSocketUsbTokenRef ||
        webSocketUsbTokenRef.readyState !== WebSocket.OPEN
      ) {
        reject(new Error("WebSocket không kết nối"));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error("Timeout khi lấy thông tin USB token"));
      }, 30000);
      webSocketUsbTokenRef.send("get-cer");
      webSocketUsbTokenRef.onmessage = (event) => {
        clearTimeout(timeout);
        if (event.data === "err: invalid cert") {
          reject(new Error("Lỗi chứng thực người dùng không đúng"));
        } else {
          resolve(event.data);
        }
      };
    });
  }

  async function isValidCer(cert: string = ""): Promise<boolean> {
    if (webSocketRef && webSocketRef.readyState === WebSocket.OPEN) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Quá thời gian xác thực chứng chỉ"));
        }, 15000);

        const messageHandler = (event: MessageEvent) => {
          clearTimeout(timeout);
          webSocketRef?.removeEventListener("message", messageHandler);

          if (event.data === "err: invalid cert") {
            reject(new Error("Lỗi chứng thực người dùng không đúng"));
          } else {
            resolve(true);
          }
        };

        webSocketRef?.addEventListener("message", messageHandler);

        try {
          const certValue = cert || JSON.parse(getUserInfo() || "{}").cert;
          webSocketRef?.send(`set-cer "${certValue}"`);
        } catch (error: any) {
          clearTimeout(timeout);
          webSocketRef?.removeEventListener("message", messageHandler);
          reject(new Error(`Lỗi khi gửi chứng chỉ: ${error.message}`));
        }
      });
    } else {
      throw new Error("WebSocket chưa kết nối");
    }
  }

  async function checkCert(): Promise<boolean> {
    try {
      const connected = await checkConnect();
      if (!connected) {
        ToastUtils.error(
          "Không thể kết nối tới dịch vụ mã hóa, vui lòng kiểm tra lại!"
        );
        return false;
      }

      return await isValidCer();
    } catch (error: any) {
      console.error("Error valid current cert", error);
      ToastUtils.error(`Lỗi xác thực: ${error.message || "Không xác định"}`);
      return false;
    }
  }

  async function sendFile(file: File, totalLength: number): Promise<any[]> {
    if (webSocketRef && webSocketRef.readyState === WebSocket.OPEN) {
      return new Promise((resolve, reject) => {
        const list: any[] = [];
        let isResolved = false;
        const listTruckFile: Blob[] = [];

        const fileSizeInMB = file.size / (1024 * 1024);
        const expectedChunks = Math.ceil(fileSizeInMB);

        updateEncryptionProgress({
          expectedChunks,
          receivedChunks: 0,
          currentProgress: 0,
        });

        const messageHandler = (event: MessageEvent) => {
          if (event.data instanceof Blob) {
            listTruckFile.push(event.data);
            const receivedChunks = encryptionProgress.receivedChunks + 1;

            const receivedSize = listTruckFile.reduce(
              (total, chunk) => total + chunk.size,
              0
            );
            const progress = Math.round((receivedSize / file.size) * 100);

            updateEncryptionProgress({
              receivedChunks,
              currentProgress: Math.min(progress, 100),
            });

            console.log(
              `Đã nhận chunk ${receivedChunks}/${expectedChunks} - Kích thước: ${(receivedSize / (1024 * 1024)).toFixed(2)}MB/${(file.size / (1024 * 1024)).toFixed(2)}MB - Tiến trình: ${progress}%`
            );
          } else if (event.data === "99") {
            const tmp = new File(listTruckFile, `${file.name}`);
            list.push(tmp);
            updateEncryptionProgress({
              currentProgress: 100,
            });
          } else if (
            typeof event.data === "string" &&
            event.data !== "encrypted"
          ) {
            list.push(event.data);
          } else if (event.data === "encrypted") {
            countSuccessRef++;

            if (totalLength === countSuccessRef) {
              countSuccessRef = 0;
              isResolved = true;
              if (webSocketRef) {
                webSocketRef.removeEventListener("message", messageHandler);
                webSocketRef.removeEventListener("close", closeHandler);
              }
              resolve(list);
            } else {
              isResolved = true;
              if (webSocketRef) {
                webSocketRef.removeEventListener("message", messageHandler);
                webSocketRef.removeEventListener("close", closeHandler);
              }
              resolve(list);
            }
          } else if (event.data.includes("err")) {
            isResolved = true;
            if (webSocketRef) {
              webSocketRef.removeEventListener("message", messageHandler);
              webSocketRef.removeEventListener("close", closeHandler);
            }
            ToastUtils.error("Sai mã PIN hãy khởi động lại công cụ!");
            disconnect();
            reject(new Error("Sai mã PIN"));
          }
        };

        const closeHandler = () => {
          if (!isResolved) {
            isResolved = true;
            if (webSocketRef) {
              webSocketRef.removeEventListener("message", messageHandler);
            }
            disconnect();
            reject(new Error("Có lỗi xảy ra trong quá trình mã hóa tệp"));
          }
        };

        webSocketRef?.addEventListener("message", messageHandler);
        webSocketRef?.addEventListener("close", closeHandler);

        webSocketRef?.send(file);
      });
    } else {
      throw new Error("WebSocket is not open");
    }
  }

  async function sendObj(data: string, expectedCount: number): Promise<any[]> {
    if (webSocketRef && webSocketRef.readyState === WebSocket.OPEN) {
      return new Promise((resolve, reject) => {
        const list: any[] = [];
        const timeout = 180000;
        let isResolved = false;
        let messageReceived = false;

        const cleanup = () => {
          if (webSocketRef) {
            webSocketRef.removeEventListener("message", handler);
            webSocketRef.removeEventListener("close", closeHandler);
          }
          clearTimeout(timer);
          clearTimeout(delayedResolveTimer as NodeJS.Timeout);
        };

        const clearAndReject = (err: string) => {
          if (isResolved) return;
          isResolved = true;
          cleanup();
          reject(new Error(err));
        };

        const clearAndResolve = (value: any[]) => {
          if (isResolved) return;
          isResolved = true;
          cleanup();
          resolve(value);
        };

        let delayedResolveTimer: NodeJS.Timeout | null = null;

        const handler = (event: MessageEvent) => {
          if (isResolved) return;

          if (!event.data) {
            clearAndReject("Có lỗi xảy ra trong quá trình xác thực");
            return;
          }

          try {
            console.log("Dữ liệu nhận được từ sendObj:", event.data);
            messageReceived = true;

            if (event.data === "[]") {
              console.log("Nhận được mảng rỗng, đang chờ dữ liệu tiếp theo");
              return;
            }
            if (!TextUtils.isValidJson(event.data)) {
              clearAndReject(
                event.data.includes("err:")
                  ? `${event.data.split("err:")[1]}`
                  : "Có lỗi xảy ra trong quá trình xác thực"
              );
            } else {
              const arr = JSON.parse(event.data);
              if (arr && arr.length > 0) {
                list.push(...arr);
                console.log(`Đã nhận được ${list.length} phần tử dữ liệu`);

                clearTimeout(delayedResolveTimer!);
                delayedResolveTimer = setTimeout(() => {
                  console.log("Hoàn tất xử lý dữ liệu, đóng socket");
                  clearAndResolve(list);
                }, 500);
              }
            }
          } catch (error: any) {
            console.error("Lỗi xử lý dữ liệu:", error, "Data:", event.data);
            clearAndReject(
              `Có lỗi xảy ra trong quá trình xác thực: ${error.message}`
            );
          }
        };

        const closeHandler = () => {
          if (!isResolved) {
            if (messageReceived && list.length > 0) {
              console.log("Socket đóng nhưng đã nhận được dữ liệu, resolve");
              clearAndResolve(list);
            } else {
              clearAndReject(
                "WebSocket đã đóng đột ngột trong quá trình nhận dữ liệu"
              );
            }
          }
        };

        const timer = setTimeout(() => {
          if (messageReceived && list.length > 0) {
            console.log("Timeout nhưng đã nhận được dữ liệu, resolve");
            clearAndResolve(list);
          } else {
            clearAndReject(
              `Timeout waiting for WebSocket response (sau ${timeout / 1000} giây)`
            );
          }
        }, timeout);

        webSocketRef?.addEventListener("message", handler);
        webSocketRef?.addEventListener("close", closeHandler);

        console.log("Gửi yêu cầu sendObj:", data);
        try {
          webSocketRef?.send(data);
        } catch (error: any) {
          clearAndReject(`Lỗi khi gửi dữ liệu: ${error.message}`);
        }
      });
    } else {
      throw new Error("WebSocket is not open");
    }
  }

  async function pushObj(encryptions: any[]): Promise<boolean> {
    console.log("Dữ liệu encryptions cần chia sẻ:", encryptions);

    try {
      const res = await CommonService.shareEncryptedFiles(encryptions);

      if (res && res["data"]) {
        console.log("Kết quả chia sẻ:", res["data"]);
        return true;
      } else {
        console.error("Chia sẻ thất bại:", res);
        return false;
      }
    } catch (error) {
      console.error("Lỗi khi chia sẻ:", error);
      return false;
    }
  }

  async function pushObjOutSide(
    outSideId: string,
    encryptions: any[]
  ): Promise<boolean> {
    const res = await CommonService.shareEncryptedFilesOutside(
      outSideId,
      encryptions
    );
    if (res && res["data"]) {
      ToastUtils.success("Chia sẻ tệp mã hóa liên thông thành công");
      return true;
    } else {
      ToastUtils.error("Chia sẻ tệp mã hóa liên thông thất bại");
      return false;
    }
  }

  async function transfer(
    fileNames: any[],
    userIds: any[],
    outsideId: string | null = null
  ): Promise<boolean> {
    const names = toString(fileNames);
    const users = toString(userIds);
    const data = `get-file-ids ${getToken()} ${outsideId ? Constant.API_ENDPOINT : ""} ${outsideId || ""} "${names}" ${users}`;
    let list;

    try {
      list = await sendObj(data, numberOfFileRef);
      console.log("Danh sách file IDs nhận được:", list);

      if (userIds.length < 3) {
        await disconnect();
      }

      if (list && list.length > 0) {
        let success;
        if (outsideId) {
          success = await pushObjOutSide(outsideId, list);
        } else {
          success = await pushObj(list);
        }

        if (success) {
          ToastUtils.success("Chia sẻ khóa thành công");
          return true;
        } else {
          ToastUtils.error("Chia sẻ khóa thất bại");
          return false;
        }
      } else {
        ToastUtils.error("Có lỗi xảy ra trong quá trình xác thực");
        return false;
      }
    } catch (error: any) {
      await disconnect();
      console.error("Error encryption", error);
      ToastUtils.error(`Lỗi: ${error.message}`);
      return false;
    }
  }

  async function doTransferExecute(
    files: any[],
    userIds: any[],
    outsideId: string | null = null
  ): Promise<boolean> {
    if (!userIds || userIds.length === 0 || !files || files.length === 0) {
      return false;
    }
    const rs = await checkConnect();
    if (!rs) {
      return false;
    }

    for (let i = 0; i < userIds.length; i += 3) {
      const batch = userIds.slice(i, i + 3);
      let success;
      if (outsideId) {
        success = await transfer(files, batch, outsideId);
      } else {
        success = await transfer(files, batch);
      }

      if (!success) {
        ToastUtils.error("Chia sẻ khóa thất bại");
        return false;
      }
    }
    return true;
  }

  async function pushFile(
    map: any[],
    objId: number,
    type: string
  ): Promise<void> {
    const allFilesToShare: { fileId: string; userIds: string[] }[] = [];

    await Promise.all(
      map.map(async (value, key) => {
        console.log(`${key} = ${value}`);
        const res = await CommonService.doEncrypt(
          value[1],
          value[0],
          objId,
          type
        );
        if (res["data"]["result"] === true) {
          allFilesToShare.push({
            fileId: res["data"]["fileId"],
            userIds: value[0],
          });
          console.log("allFilesToShare", allFilesToShare);
          const fileNameShare = [res["data"]["fileName"]];
          const userIdShared = res["data"]["userIds"];
          console.log(fileNameShare, userIdShared);
          await doTransferExecute(fileNameShare, userIdShared);
        }
      })
    );
  }

  async function encrypt(
    files: File[],
    objId: number,
    type: string
  ): Promise<boolean> {
    errorsRef = [];
    const validCert = await checkCert();
    if (!validCert) {
      ToastUtils.error("Chứng thư số không hợp lệ hoặc đã hết hạn!");
      return false;
    }

    const results = [];
    for (let i = 0; i < files.length; i++) {
      try {
        updateEncryptionProgress({
          currentFile: i + 1,
          fileName: files[i].name,
          fileSize: files[i].size,
        });

        const result = await sendFile(files[i], files.length);
        results.push(result);
      } catch (error: any) {
        console.error("Lỗi khi mã hóa file:", error);
        errorsRef.push(
          `Lỗi khi mã hóa file ${files[i].name}: ${error.message}`
        );
      }
    }

    if (results.length === files.length) {
      await pushFile(results, objId, type);
      if (errorsRef.length > 0) {
        return false;
      }
      return true;
    }
    return false;
  }

  async function doEncryptExecute(
    files: File[],
    objId: number,
    type: string
  ): Promise<boolean> {
    if (!files || files.length === 0) {
      return true; // Return true if no files to process
    }
    await checkConnect();
    let name = type;
    if (type === "VAN_BAN_DI_DU_THAO") {
      name = "File Dự Thảo";
    } else if (type === "VAN_BAN_DI_LIEN_QUAN") {
      name = "File Đính Kèm";
    }
    updateEncryptionProgress({
      totalFiles: files.length,
      currentFile: 0,
      currentProgress: 0,
      fileName: "",
      expectedChunks: 0,
      receivedChunks: 0,
      fileSize: 0,
      namedraftFiles: name,
    });

    return encrypt(files, objId, type);
  }

  function checkedEntry(
    securityCategoryFilter: any[],
    securityId: number | null,
    selectedFiles: any[]
  ): any[] {
    if (securityCategoryFilter && securityId && selectedFiles) {
      for (const element of securityCategoryFilter) {
        if (element.id === securityId) {
          if (element.isDefault) {
            selectedFiles.forEach((file) => {
              if (!file.encrypt) {
                file.autoEntry = true;
              }
              file.encrypt = true;
            });
          } else {
            selectedFiles.forEach((file) => {
              if (file.autoEntry) {
                file.encrypt = false;
                file.autoEntry = false;
              }
            });
          }
          return selectedFiles;
        }
      }
    }
    return selectedFiles;
  }

  async function sendListFile(
    files: File[],
    observableCustom: any = null
  ): Promise<Map<number, any> | boolean> {
    if (!files || files.length === 0) {
      return false;
    }
    await checkConnect();
    const validCert = await checkCert();
    if (!validCert) {
      return false;
    }
    const map = new Map<number, any>();
    for (let index = 0; index < files.length; index++) {
      const element = files[index];
      let list;
      try {
        list = await sendFile(element, files.length);
      } catch (error: any) {
        ToastUtils.error(`Có lỗi trong quá trình mã: ${error.message}`);
        return false;
      }
      map.set(index, list);
    }
    console.log("map", map);
    await disconnect();
    return map;
  }

  return {
    init,
    subscribe,
    ENCRYPT,
    getEncryptionProgress,
    updateEncryptionProgress,
    connect,
    checkServiceToken,
    checkTokenConnect,
    connectUsbToken,
    disconnect,
    disconnectUsbToken,
    checkConnect,
    checkConnectUsbToken,
    getUSBToken,
    getUSBTokenEncryptNoMessage,
    checkUsbTokenEncypt,
    isCheckStartUsbTokenWatcher,
    getCert,
    getCertUsbToken,
    doEncryptExecute,
    encrypt,
    sendListFile,
    checkCert,
    isValidCer,
    pushFile,
    sendFile,
    doTransferExecute,
    transfer,
    sendObj,
    pushObj,
    pushObjOutSide,
    toString,
    checkedEntry,
  };
})();
