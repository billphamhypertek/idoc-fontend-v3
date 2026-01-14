import { EncryptionService } from "./encryption.service";
import { Constant } from "@/definitions/constants/constant";
import { ToastUtils } from "@/utils/toast.utils";

let webSocket: WebSocket | null = null;

export interface UploadEncryptionProgress {
  totalFiles?: number;
  currentFile?: number;
  currentProgress?: number;
  fileName?: string;
  expectedChunks?: number;
  receivedChunks?: number;
  fileSize?: number;
  namedraftFiles?: string;
  error?: boolean;
}

// trạng thái progress
let uploadEncryptionProgress: UploadEncryptionProgress = {
  totalFiles: 0,
  currentFile: 0,
  currentProgress: 0,
  fileName: "",
  expectedChunks: 0,
  receivedChunks: 0,
  fileSize: 0,
  namedraftFiles: "",
  error: false,
};
let isProcessingFileRequest = false;

// danh sách subscriber
const listeners: ((progress: UploadEncryptionProgress) => void)[] = [];

const notify = () => {
  listeners.forEach((cb) => cb(uploadEncryptionProgress));
};

const updateProcess = (partial: UploadEncryptionProgress) => {
  uploadEncryptionProgress = { ...uploadEncryptionProgress, ...partial };
  notify();
};

export const UploadEncryptionService = {
  getProgress() {
    return uploadEncryptionProgress;
  },
  updateProcess(partial: UploadEncryptionProgress) {
    uploadEncryptionProgress = { ...uploadEncryptionProgress, ...partial };
  },
  disconnect() {
    webSocket?.close();
    webSocket = null;
  },
  subscribe(cb: (progress: UploadEncryptionProgress) => void) {
    listeners.push(cb);
    cb(uploadEncryptionProgress); // emit ngay lần đầu
    return () => {
      const idx = listeners.indexOf(cb);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  },
  connect(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = Constant.URL_CHECK_UPLOAD_FILE_ENCRYPT;

        webSocket = new WebSocket(wsUrl || "");

        webSocket.onopen = () => {
          if (webSocket?.readyState === WebSocket.OPEN) {
            resolve("200");
          }
        };

        webSocket.onmessage = (event) => {
          console.log("Encryption WebSocket message:", event);
        };

        webSocket.onclose = () => {
          console.log("Encryption WebSocket closed");

          webSocket = null;
        };

        webSocket.onerror = (error) => {
          console.error("Encryption WebSocket error:", error);
          resolve("-100");
        };
      } catch (error) {
        console.error("Lỗi khi mở kết nối WebSocket:", error);
        reject(error);
      }
    });
  },
  async checkConnect() {
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
      return true;
    }
    const status = await this.connect();
    if (status === "-100") {
      await EncryptionService.checkTokenConnect();
      return false;
    }
    if (status != "200") {
      ToastUtils.error("Lỗi kết nối tới service mã hóa");
      return false;
    }
    return true;
  },
  async openChooseFileToCheck(): Promise<any[]> {
    try {
      console.log("Kiểm tra kết nối WebSocket...");
      const connected = await this.checkConnect();
      if (!connected) {
        ToastUtils.error("Không thể kết nối đến service mã hóa");
        return [];
      }

      console.log("Kiểm tra chứng chỉ...");
      if (!webSocket) {
        ToastUtils.error("WebSocket không tồn tại");
        return [];
      }

      console.log("Trạng thái WebSocket:", webSocket.readyState);
      if (webSocket.readyState !== WebSocket.OPEN) {
        ToastUtils.error("WebSocket không ở trạng thái kết nối");
        return [];
      }

      if (isProcessingFileRequest) {
        console.log("Đang xử lý yêu cầu file khác, vui lòng đợi");
        return [];
      }
      updateProcess({
        totalFiles: 1,
        currentFile: 1,
        currentProgress: 0,
        fileName: "",
        expectedChunks: 0,
        receivedChunks: 0,
        fileSize: 0,
        namedraftFiles: "File đang tải",
        error: false,
      });

      isProcessingFileRequest = true;
      console.log("Khởi tạo Promise để nhận file...");

      return new Promise((resolve, reject) => {
        const list: any[] = [];
        const listChuckFile: Blob[] = [];
        let isResolved = false;
        let fileName: string = "";
        let totalSize = 0;

        const cleanup = () => {
          if (webSocket) {
            webSocket.removeEventListener("message", messageHandler);
            webSocket.removeEventListener("close", closeHandler);
          }
          // clearTimeout(timeoutId);
          isProcessingFileRequest = false;
        };

        const messageHandler = (event: any) => {
          if (isResolved) return;

          console.log("Nhận sự kiện từ WebSocket:", event);

          if (typeof event.data === "string") {
            if (event.data === "-1") {
              updateProcess({
                error: true,
              });
              this.disconnect();
            }
            if (!isNaN(Number(event.data)) && event.data !== "99") {
              totalSize = Number(event.data);
              const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
              updateProcess({
                fileSize: totalSize,
                namedraftFiles: `File đang tải (${sizeInMB} MB)`,
                expectedChunks: Math.ceil(totalSize / (1024 * 1024)),
              });
              return;
            }
            console.log("Dữ liệu string nhận được:", event.data);

            if (event.data === "99") {
              try {
                if (listChuckFile.length === 0) {
                  throw new Error("Không có dữ liệu file để tạo");
                }
                const tmp = new File(listChuckFile, fileName);
                console.log("Tạo file thành công:", tmp);
                updateProcess({
                  currentProgress: 100,
                  receivedChunks: this.getProgress().expectedChunks,
                });
                list.push(tmp);
                isResolved = true;
                this.disconnect();
                isProcessingFileRequest = false;
                resolve(list);
              } catch (error) {
                console.error("Lỗi khi tạo file:", error);
                ToastUtils.error("Lỗi khi tạo file: " + error);
                isResolved = true;
                this.disconnect();
                isProcessingFileRequest = false;
                reject(error);
              }
            } else if (!event.data.includes("err")) {
              fileName = event.data;
              updateProcess({
                fileName: fileName,
              });
              if (event.data == "-1") {
                console.log("!", event.data, "!");
                updateProcess({
                  error: true,
                });
                this.disconnect();
              }
            } else {
              updateProcess({
                error: true,
              });
              console.error("Lỗi từ WebSocket:", event.data);
              ToastUtils.error("Có lỗi xảy ra: " + event.data);
              isResolved = true;
              this.disconnect();
              reject(new Error(event.data));
            }
          } else if (event.data instanceof Blob) {
            console.log("Nhận được chunk file, kích thước:", event.data.size);
            listChuckFile.push(event.data);
            console.log("Số chunks đã nhận:", listChuckFile.length);
            // totalSize += event.data.size;

            // Cập nhật kích thước file
            // updateProcess({
            //   fileSize: totalSize
            // });

            // Tính toán số chunks dự kiến (1 chunk = 1MB)
            const fileSizeInMB = totalSize / (1024 * 1024);
            const expectedChunks = Math.ceil(fileSizeInMB);

            // Cập nhật số chunks đã nhận và tiến trình
            const receivedChunks = listChuckFile.length;
            const progress = Math.round(
              (receivedChunks / expectedChunks) * 100
            );

            updateProcess({
              expectedChunks: expectedChunks,
              receivedChunks: receivedChunks,
              currentProgress: Math.min(progress, 100),
            });
          }
        };

        const closeHandler = () => {
          if (isResolved) return;
          console.log("WebSocket đã đóng");
          isResolved = true;
          isProcessingFileRequest = false;
          cleanup();
          this.disconnect();
          resolve([]);
        };

        webSocket?.addEventListener("message", messageHandler);
        webSocket?.addEventListener("close", closeHandler);

        // const timeoutId = setTimeout(() => {
        //   if (isResolved) return;
        //   console.error('Hết thời gian chờ phản hồi');
        //   isResolved = true;
        //   cleanup();
        //   reject(new Error("Hết thời gian chờ phản hồi"));
        //   this.isProcessingFileRequest = false;
        // }, 30000);

        console.log("Gửi yêu cầu chọn file...");
        webSocket?.send("get-file");
      });
    } catch (error) {
      console.error("Lỗi trong openChooseFileToCheck:", error);
      ToastUtils.error("Lỗi: " + error);
      isProcessingFileRequest = false;
      return [];
    }
  },
};
