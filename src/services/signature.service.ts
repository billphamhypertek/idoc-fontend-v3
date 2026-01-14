import { Constant } from "@/definitions/constants/constant";
import { ToastUtils } from "@/utils/toast.utils";
import { b64EncodeUnicode } from "@/utils/base64.utils";

// SignatureService.ts
type CallbackFn = (data: any) => void;

let webSocket: WebSocket | null = null;
let isConnect = false;
let callbackFunction: CallbackFn | null = null;

const connectWebSocket = (onConnected: CallbackFn) => {
  webSocket = new WebSocket(Constant.URL_SINGNATURE as string);

  webSocket.onopen = () => {
    isConnect = true;
    onConnected("connected");
  };

  webSocket.onmessage = (event) => {
    if (callbackFunction) {
      callbackFunction(event.data);
    }
  };

  webSocket.onerror = () => {
    isConnect = false;
    onConnected("-100");
  };

  webSocket.onclose = () => {
    isConnect = false;
  };
};

const sendObject = (obj: any) => {
  if (webSocket && isConnect) {
    const json = JSON.stringify(obj);
    webSocket.send(b64EncodeUnicode(json));
  }
};

const VerifierPDF = async (params: any, _callbackFunction: CallbackFn) => {
  if (isConnect && webSocket != null) {
    if (callbackFunction == null) {
      callbackFunction = _callbackFunction;
      sendObject(params);
    } else {
      alert("File đang được mở hoặc chỉnh sửa, vui lòng thử lại."); // hoặc toast
    }
  } else {
    connectWebSocket((data) => {
      if (data !== "-100") {
        VerifierPDF(params, _callbackFunction);
      } else {
        _callbackFunction(data);
      }
    });
  }
};

const sendMessage = (message: string) => {
  console.log(message);
  webSocket?.send(message);
};

export const getTokenInfo = (_callbackFunction: CallbackFn) => {
  if (isConnect && webSocket) {
    sendMessage("GetTokenInfo");
    if (callbackFunction == null) {
      callbackFunction = _callbackFunction;
    } else {
      ToastUtils.fileDangDuocMoHoacChinhSua();
    }
  } else {
    connectWebSocket((data: string) => {
      if (data !== "-100") {
        getTokenInfo(_callbackFunction);
      } else {
        _callbackFunction(data);
      }
    });
  }
};
export const getTokenInfoVgca = (_callbackFunction: CallbackFn) => {
  if (typeof window !== "undefined" && (window as any).vgca_get_certinfo) {
    (window as any).vgca_get_certinfo(_callbackFunction);
  } else {
    _callbackFunction("-100");
  }
};

export const SignatureService = {
  VerifierPDF,
  getTokenInfo,
  getTokenInfoVgca,
};
