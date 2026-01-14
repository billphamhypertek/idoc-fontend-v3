import { CommonService } from "./common";
import { getUserInfo } from "@/utils/authentication.utils";
import { EncryptionService } from "./encryption.service";
import {
  downloadFileToBlob,
  getExtension,
  handleError,
  saveFile,
} from "@/utils/common.utils";
import {
  getDataEncrypt,
  getDataEncryptDi,
  getToken,
} from "@/utils/token.utils";
import { Constant } from "@/definitions/constants/constant";
import {
  changeMessage,
  emitDecryptedFile,
} from "@/services/event-emitter.service";
import { ToastUtils } from "@/utils/toast.utils";

let webSocket: WebSocket | null = null;
let listUserReceivedKey: any[] = [];

// trạng thái progress
let decryptionProgress: DecryptionProgress = {
  totalFiles: 0,
  currentFile: 0,
  currentProgress: 0,
  fileName: "",
  expectedChunks: 0,
  receivedChunks: 0,
  fileSize: 0,
  namedraftFiles: "",
  error: false,
  isDownLoad: false,
};

// danh sách subscriber
const listeners: ((progress: DecryptionProgress) => void)[] = [];

export interface DecryptionProgress {
  totalFiles?: number;
  currentFile?: number;
  currentProgress?: number;
  fileName?: string;
  expectedChunks?: number;
  receivedChunks?: number;
  fileSize?: number;
  namedraftFiles?: string;
  error?: boolean;
  isDownLoad?: boolean;
}

function notify() {
  listeners.forEach((cb) => cb(decryptionProgress));
}

function updateDecryptionProgress(partial: DecryptionProgress) {
  decryptionProgress = { ...decryptionProgress, ...partial };
  notify();
}

async function connectToSignTools(): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      if (webSocket && webSocket.readyState === WebSocket.OPEN) {
        console.log("Đã có kết nối WebSocket");
        resolve("200");
        return;
      }

      webSocket = new WebSocket(Constant.URL_SIGN_AND_ENCRYPT_FILE || "");

      const connectionTimeout = setTimeout(() => {
        console.error("Kết nối WebSocket quá thời gian");
        resolve("-100");
      }, 10000);

      webSocket.onopen = () => {
        console.log("Encryption WebSocket connected");
        clearTimeout(connectionTimeout);
        if (webSocket?.readyState === WebSocket.OPEN) {
          resolve("200");
        }
      };

      webSocket.onmessage = (event) => {
        console.log("Encryption WebSocket message:", event);
      };

      webSocket.onclose = () => {
        console.log("Encryption WebSocket closed");
        clearTimeout(connectionTimeout);
        webSocket = null;
      };

      webSocket.onerror = (error) => {
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
async function connectToSignIssuedTools(): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      if (webSocket && webSocket.readyState === WebSocket.OPEN) {
        console.log("Đã có kết nối WebSocket");
        resolve("200");
        return;
      }

      webSocket = new WebSocket(Constant.URL_SIGN_ISSUED_ENCRYPT_FILE || "");

      const connectionTimeout = setTimeout(() => {
        console.error("Kết nối WebSocket quá thời gian");
        resolve("-100");
      }, 10000);

      webSocket.onopen = () => {
        console.log("Encryption WebSocket connected");
        clearTimeout(connectionTimeout);
        if (webSocket?.readyState === WebSocket.OPEN) {
          resolve("200");
        }
      };

      webSocket.onmessage = (event) => {
        console.log("Encryption WebSocket message:", event);
      };

      webSocket.onclose = () => {
        console.log("Encryption WebSocket closed");
        clearTimeout(connectionTimeout);
        webSocket = null;
      };

      webSocket.onerror = (error) => {
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
async function connectToSignCommentTools(): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      if (webSocket && webSocket.readyState === WebSocket.OPEN) {
        console.log("Đã có kết nối WebSocket");
        resolve("200");
        return;
      }

      webSocket = new WebSocket(Constant.URL_SIGN_COMMENT_ENCRYPT_FILE || "");

      const connectionTimeout = setTimeout(() => {
        console.error("Kết nối WebSocket quá thời gian");
        resolve("-100");
      }, 10000);

      webSocket.onopen = () => {
        console.log("Encryption WebSocket connected");
        clearTimeout(connectionTimeout);
        if (webSocket?.readyState === WebSocket.OPEN) {
          resolve("200");
        }
      };

      webSocket.onmessage = (event) => {
        console.log("Encryption WebSocket message:", event);
      };

      webSocket.onclose = () => {
        console.log("Encryption WebSocket closed");
        clearTimeout(connectionTimeout);
        webSocket = null;
      };

      webSocket.onerror = (error) => {
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

async function showInstallMes() {
  EncryptionService.checkTokenConnect();
  ToastUtils.error("Vui lòng cài đặt công cụ ký số");
}

async function getEncryptedFile(
  name: string,
  url: string,
  attachId: string | null = null
): Promise<Blob> {
  const rs = await CommonService.getEncryptedFile(name, url, attachId);
  return downloadFileToBlob(name, rs);
}
async function checkConnect(): Promise<boolean> {
  if (webSocket && webSocket.readyState === WebSocket.OPEN) {
    return true;
  }
  const status = await EncryptionService.connect();
  if (status === "-100") {
    await EncryptionService.checkTokenConnect();
    return false;
  }
  if (status !== 200) {
    ToastUtils.error("Lỗi kết nối tới service mã hóa");
    return false;
  }
  return true;
}

async function checkCert(cert: string = ""): Promise<boolean> {
  try {
    const connected = await checkConnect();
    if (!connected) {
      ToastUtils.error(
        "Không thể kết nối tới dịch vụ mã hóa, vui lòng kiểm tra lại!"
      );
      return false;
    }

    return await isValidCer(cert);
  } catch (error: any) {
    console.error("Error valid current cert", error);
    ToastUtils.error(`Lỗi xác thực: ${error.message || "Không xác định"}`);
    return false;
  }
}
async function isValidCer(cert: string = ""): Promise<boolean> {
  if (webSocket && webSocket.readyState === WebSocket.OPEN) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Quá thời gian xác thực chứng chỉ"));
      }, 15000);

      const messageHandler = (event: MessageEvent) => {
        clearTimeout(timeout);
        webSocket?.removeEventListener("message", messageHandler);

        if (event.data === "err: invalid cert") {
          reject(new Error("Lỗi chứng thực người dùng không đúng"));
        } else {
          resolve(true);
        }
      };

      webSocket?.addEventListener("message", messageHandler);

      try {
        const certValue = cert;
        webSocket?.send(`set-cer "${certValue}"`);
      } catch (error: any) {
        clearTimeout(timeout);
        webSocket?.removeEventListener("message", messageHandler);
        reject(new Error(`Lỗi khi gửi chứng chỉ: ${error.message}`));
      }
    });
  } else {
    throw new Error("WebSocket chưa kết nối");
  }
}

const reUpLoadFileSigned = async (
  file: File,
  totalLength: number
): Promise<any[]> => {
  if (webSocket && webSocket.readyState === WebSocket.OPEN) {
    return new Promise((resolve, reject) => {
      const list: any[] = [];
      const listChuckFile: Blob[] = [];

      webSocket?.send(file);

      const fileSizeInMB = file.size / (1024 * 1024);
      const expectedChunks = Math.ceil(fileSizeInMB);

      updateDecryptionProgress({
        expectedChunks,
        receivedChunks: 0,
        currentProgress: 0,
        fileSize: file.size,
      });

      if (webSocket) {
        webSocket.onmessage = (event) => {
          if (event.data instanceof Blob) {
            listChuckFile.push(event.data);

            const receivedChunks = listChuckFile.length;
            const receivedSize = listChuckFile.reduce(
              (total, chunk) => total + chunk.size,
              0
            );
            const progress = Math.round((receivedSize / file.size) * 100);

            updateDecryptionProgress({
              receivedChunks,
              currentProgress: Math.min(progress, 100),
            });
          } else if (event.data === "99") {
            const tmp = new File(listChuckFile, `${file.name}`);
            list.push(tmp);
            updateDecryptionProgress({ currentProgress: 100 });
          } else if (event.data === "lỗi null path" || event.data === "0") {
            updateDecryptionProgress({ error: true });
            disconnect();
          } else if (
            typeof event.data === "string" &&
            event.data !== "encrypted" &&
            event.data !== "0"
          ) {
            list.push(event.data);
          } else if (event.data === "encrypted") {
            resolve(list);
          }
        };
      }

      if (webSocket) {
        webSocket.onclose = () => {
          disconnect();
          ToastUtils.error("Có lỗi trong quá trình ký, xin thử lại!");
          updateDecryptionProgress({ error: true });
          reject(new Error("Có lỗi xảy ra trong quá trình mã hóa tệp"));
        };
      }
    });
  }
  return [];
};

async function pushFile(
  map: any[],
  objId: any,
  type: any,
  fileId: any
): Promise<void> {
  await Promise.all(
    map.map(async (value, key) => {
      try {
        const res = await CommonService.doUpdateEncrypt(
          value[1],
          value[0],
          objId,
          type,
          fileId
        );

        if (res?.data?.result === true) {
          ToastUtils.success("Mã hóa tệp thành công");

          const fileNameShare = [res.data.fileName];
          const userIdShared = res.data.userIds;

          await EncryptionService.doTransferExecute(
            fileNameShare,
            listUserReceivedKey
          );
        } else {
          updateDecryptionProgress({ error: true });
          ToastUtils.error("Có lỗi xảy ra trong quá trình mã hóa tệp");
        }
      } catch (error: any) {
        updateDecryptionProgress({ error: true });
        ToastUtils.error(
          `Lỗi khi gọi API mã hóa tệp: ${(error as Error).message}`
        );
      }
    })
  );
}

function disconnect() {
  webSocket?.close();
  webSocket = null;
}

export const DecryptionService = {
  getProgress() {
    return decryptionProgress;
  },
  updateProgress(partial: DecryptionProgress) {
    decryptionProgress = { ...decryptionProgress, ...partial };
  },
  disconnect() {
    webSocket?.close();
    webSocket = null;
  },
  subscribe(cb: (progress: DecryptionProgress) => void) {
    listeners.push(cb);
    cb(decryptionProgress); // emit ngay lần đầu
    return () => {
      const idx = listeners.indexOf(cb);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  },
  connect(isDownLoad: boolean = false): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = isDownLoad
          ? Constant.URL_DECRYPT_FILE_DOWNLOAD
          : Constant.URL_DECRYPT_FILE;

        webSocket = new WebSocket(wsUrl || "");

        webSocket.onopen = () => {
          resolve("200");
        };

        webSocket.onmessage = (event) => {
          // Có thể phát event nếu cần (ví dụ: cập nhật progress)
        };

        webSocket.onclose = () => {
          if (sessionStorage.getItem("VMM") === "false") {
            ToastUtils.error("Vui lòng kiểm tra ổ VMM hoặc công cụ ký mã!");
          }
          sessionStorage.setItem("VMM", "false");

          // Nếu bạn cần phát event về UI:
          // eventBus.emit(Constant.SHARE_DATA.CLOSE_POPUP);
          webSocket = null;
        };

        webSocket.onerror = (err) => {
          resolve("-100");
        };
      } catch (error) {
        console.error("Lỗi khi mở kết nối WebSocket:", error);
        reject(error);
      }
    });
  },
  async sendFile(
    size: number = 1,
    url: string,
    name: string,
    draftId: string,
    typeDoc: string
  ): Promise<File> {
    const socket = webSocket;
    if (!socket) {
      throw new Error(
        "WebSocket chưa được khởi tạo — hãy gọi connect() trước."
      );
    }

    return new Promise((resolve, reject) => {
      const listChunkFile: Blob[] = [];

      // Tính số chunk dự kiến (1 chunk = 1MB)
      const fileSizeInMB = size / (1024 * 1024);
      const expectedChunks = Math.ceil(fileSizeInMB);

      // Cập nhật thông tin tiến trình
      updateDecryptionProgress({
        expectedChunks,
        receivedChunks: 0,
        currentProgress: 0,
        fileSize: size,
        fileName: name,
      });

      sessionStorage.setItem("VMM", "false");

      // Gửi lệnh tải file
      const command = `url-download ${getToken()} \"${url}${name}\" ${draftId} ${typeDoc}`;
      socket.send(command);

      socket.onmessage = (event: MessageEvent) => {
        sessionStorage.setItem("VMM", "true");

        if (event.data instanceof Blob) {
          // Nhận 1 chunk
          listChunkFile.push(event.data);

          // Cập nhật tiến trình
          const receivedChunks = (decryptionProgress.receivedChunks ?? 0) + 1;
          const receivedSize = listChunkFile.reduce(
            (sum, chunk) => sum + chunk.size,
            0
          );
          const progress = Math.min(
            Math.round((receivedSize / size) * 100),
            100
          );

          updateDecryptionProgress({
            receivedChunks,
            currentProgress: progress,
          });
        } else if (event.data === "99") {
          // Hoàn tất, ghép file
          const finalFile = new File(listChunkFile, name);
          updateDecryptionProgress({ currentProgress: 100 });
          resolve(finalFile);
        } else if (event.data === "0") {
          changeMessage(Constant.SHARE_DATA.CLOSE_POPUP);
        } else if (event.data === "6789") {
          updateDecryptionProgress({ isDownLoad: false });
        } else {
          this.checReadyStatus(event.data);
          reject(false);
        }
      };

      socket.onerror = (err: any) => {
        reject(err);
      };

      socket.onclose = () => {};
    });
  },
  async doDecrypt(
    name: string,
    url: string,
    type: boolean = false,
    attachId: string | null = null,
    cert: any = null,
    isDownLoad: boolean = false,
    size: number = 1,
    draftId?: string,
    typeDoc?: string
  ): Promise<void | undefined> {
    const user = getUserInfo();
    if (!user?.cert) {
      ToastUtils.error("Lỗi: Chưa đăng ký chứng thực số");
      return;
    }

    const status = await this.connect(isDownLoad);
    if (status === "-100") {
      ToastUtils.error("Cần cài đặt dịch vụ giải mã");
      return;
    } else if (status !== "200") {
      ToastUtils.error("Lỗi kết nối tới service");
      return;
    }

    const validCert = await checkCert(cert || user.cert);
    if (!validCert) {
      ToastUtils.error("Chứng chỉ không hợp lệ");
      return;
    }

    const _decryptionProgress: DecryptionProgress = {
      totalFiles: 1,
      currentFile: 1,
      currentProgress: 0,
      fileName: name,
      expectedChunks: 0,
      receivedChunks: 0,
      fileSize: size,
      namedraftFiles: "Giải mã tệp",
      error: false,
      isDownLoad: true,
    };
    updateDecryptionProgress(_decryptionProgress);
    const file = await this.sendFile(
      size,
      url,
      name,
      draftId || "",
      typeDoc || ""
    );

    if (type) {
      const extension = getExtension(name)?.toLowerCase();
      if (extension?.includes("pdf")) {
        emitDecryptedFile(file);
      } else {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          const fileData = event.target.result;
          window.open(fileData, "_blank"); // Mở trực tiếp file (hoặc bạn có thể tuỳ biến)
        };
        reader.readAsDataURL(file);
      }
    } else {
      if (!getDataEncrypt() || !getDataEncryptDi()) {
        saveFile(name, file);
      } else {
        ToastUtils.success("Tải file xuống thư mục an toàn thành công!");
      }
    }

    disconnect();
  },
  async doDecryptToSignFilePdf(
    name: string,
    url: string,
    type = false,
    attachId: number | null = null,
    cert: any = null,
    fileId?: string,
    typeDoc?: string,
    typeFile: string | null = null,
    idDoc: number | null = null
  ) {
    const res2 = await CommonService.getUserSharedFile(name);
    listUserReceivedKey = [...res2];

    const userInfo = getUserInfo();
    if (!userInfo?.cert) {
      ToastUtils.error("Lỗi: chưa đăng ký chứng thực số");
      return;
    }

    if (!webSocket) {
      const status = await connectToSignTools();
      if (status === "-100") {
        await showInstallMes();
      } else if (status !== "200") {
        ToastUtils.error("Lỗi kết nối tới service ký số");
      }
    }

    const zipFile = await getEncryptedFile(name, url);

    const validCert = await checkCert(cert || userInfo.cert);
    if (!validCert) return false;

    updateDecryptionProgress({
      totalFiles: 1,
      currentFile: 1,
      currentProgress: 0,
      fileName: name.split("__")[0],
      expectedChunks: 0,
      receivedChunks: 0,
      fileSize: zipFile.size,
      namedraftFiles: "Giải mã tệp để ký số",
      error: false,
    });

    const map: any[] = await reUpLoadFileSigned(zipFile as File, 1);

    await this.pushFileNew(typeFile, fileId);

    // if (map.length > 0) {
    //   await pushFile(map, attachId, typeDoc, fileId);
    // }

    disconnect();
  },
  async doDecryptToSignIssuedFilePdf(
    name: string,
    url: string,
    type = false,
    attachId: number | null = null,
    cert: any = null,
    fileId?: string,
    typeDoc?: string,
    soVanBan: string | null = null,
    ngayVanBan: string | null = null,
    typeFile: string | null = null,
    idDoc: number | null = null
  ) {
    const res2 = await CommonService.getUserSharedFile(name);
    listUserReceivedKey = [...res2];

    const userInfo = getUserInfo();
    if (!userInfo?.cert) {
      ToastUtils.error("Lỗi: chưa đăng ký chứng thực số");
      return;
    }

    if (!webSocket) {
      const status = await connectToSignIssuedTools();
      if (status === "-100") {
        await showInstallMes();
      } else if (status !== "200") {
        ToastUtils.error("Lỗi kết nối tới service ký số");
      }
    }

    const zipFile = await getEncryptedFile(name, url);

    const validCert = await checkCert(cert || userInfo.cert);
    if (!validCert) return false;
    const valiNgayCongVan = await this.checkSendvalue(
      'ngay_cong_van "' + ngayVanBan + '"'
    );
    if (valiNgayCongVan == false || !valiNgayCongVan) {
      return false;
    }
    if (soVanBan != null) {
      const valiSoCongVan = await this.checkSendvalue(
        "so_cong_van " + (soVanBan != "" ? soVanBan : '""')
      );
      if (valiSoCongVan == false || !valiSoCongVan) {
        return false;
      }
    }

    updateDecryptionProgress({
      totalFiles: 1,
      currentFile: 1,
      currentProgress: 0,
      fileName: name.split("__")[0],
      expectedChunks: 0,
      receivedChunks: 0,
      fileSize: 1,
      namedraftFiles: "Giải mã tệp để ký số",
      error: false,
    });

    const map: any[] = await reUpLoadFileSigned(zipFile as File, 1);
    await this.pushFileNew(typeFile, fileId);

    // if (map.length > 0) {
    //   await pushFile(map, attachId, typeDoc, fileId);
    // }

    disconnect();
  },
  async checkSendvalue(value: string) {
    try {
      return await this.webSocketSendData(value);
    } catch (error) {
      console.error("Error valid current cert", error);
      handleError(error);
      return false;
    }
  },
  async webSocketSendData(value: string) {
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
      return new Promise((resolve, reject) => {
        webSocket?.send(value);
        console.log("set-cer");
        if (webSocket) {
          webSocket.onmessage = (event) => {
            if (event.data != undefined && event.data.indexOf("err") > -1) {
              this.checReadyStatus(event.data);
            }
            if (event.data == "err: invalid cert") {
              reject(new Error("lỗi"));
            } else {
              resolve(true);
            }
          };
        } else {
          reject(new Error("WebSocket connection not available"));
        }
      });
    }
  },
  checReadyStatus(status: string) {
    switch (status) {
      case "-10":
        console.log("Hệ thống chưa nhận được mật khẩu của usb token");
        break;
      case "-16":
        console.log("Tên tệp đã mã hóa không có");
        break;
      case "-11":
        console.log("Không unwrap được key token của office truyền vào");
        break;
      case "-14":
        console.log("Không tạo được folder tạm để lưu trữ file đã mã hóa");
        break;
      case "-13":
        console.log("Không giải nén được filezip office trả về");
        break;
      case "-12":
        console.log("Không tải được file zip từ office ");
        break;
      case "-7":
        console.log("Không tìm được tệp đã mã hóa hoặc file key trong filezip");
        break;
      case "-5":
        console.log("Giải mã không thành công");
        break;
      case "-15":
        console.log("Lỗi không tạo đươc file chứa key tạm");
        break;
      case "18":
        console.log("Key giải mã không hợp lệ");
        break;
      default:
        break;
    }
    this.showError(status);
  },
  showError(status: string) {
    if (status.indexOf("err") > -1) {
      ToastUtils.error(status.substring(4, status.length));
      this.disconnect();
      return;
    }
    switch (status) {
      case "-10":
        this.disconnect();
        ToastUtils.error("Hệ thống chưa nhận được mật khẩu của usb token");
        break;
      case "-16":
      case "-11":
      case "-14":
      case "-13":
      case "-12":
      case "-7":
      case "-5":
      case "6789":
        break;
      case "-15":
        this.disconnect();
        ToastUtils.error("Tải tệp thất bại");
        break;
      case "18":
        this.disconnect();
        ToastUtils.error("Key giải mã không hợp lệ");
        break;
      default:
        this.disconnect();
        ToastUtils.error("Tải tệp thất bại");
    }
  },
  async pushFileNew(typeFile: string | null, fileId: string = "") {
    const res = await CommonService.getFileNameById(typeFile, fileId);
    const fileNameShare = res.name;
    const arrFile = [];
    arrFile.push(fileNameShare);
    await EncryptionService.doTransferExecute(
      arrFile as [],
      listUserReceivedKey as [],
      null
    );
  },
};
