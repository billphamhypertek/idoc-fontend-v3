import { Constant } from "@/definitions/constants/constant";

type CallFunction = ((data: string) => void) | null;

let webSocket: WebSocket | null = null;
let isConnect = false;
let callFunction: CallFunction = null;

function connectScanService(_callFunction: (data: string) => void) {
  callFunction = _callFunction;
  webSocket = new WebSocket(Constant.URL_SERVER_SCAN || "");

  webSocket.onopen = () => {
    isConnect = true;
    console.log("webSocket ::", webSocket, isConnect);
    if (callFunction) {
      callFunction("200");
      callFunction = null;
    }
  };

  webSocket.onmessage = (event: MessageEvent) => {
    console.log("webSocket.onmessage :", event);
    if (callFunction) {
      callFunction(event.data);
    }
  };

  webSocket.onclose = () => {
    console.log("webSocket.onclose");
    webSocket = null;
    isConnect = false;
  };

  webSocket.onerror = () => {
    console.log("webSocket.onerror");
    if (callFunction) {
      callFunction("-100");
    }
  };
}

function scanMessage(value: string, _callFunction: (data: string) => void) {
  if (!webSocket) {
    console.error("WebSocket is not connected.");
    return;
  }
  callFunction = _callFunction;
  webSocket.send(value);

  webSocket.onmessage = (event: MessageEvent) => {
    console.log("webSocket.onmessage :", event);
    if (callFunction) {
      callFunction(event.data);
    }
  };
}

function disconnectScanService() {
  if (webSocket) {
    webSocket.close();
    webSocket = null;
    isConnect = false;
    console.log("Disconnected from scan service.");
  }
}

// state dạng getter
function getIsConnect() {
  return isConnect;
}

function getWebSocket() {
  return webSocket;
}

export {
  connectScanService,
  scanMessage,
  disconnectScanService,
  getIsConnect,
  getWebSocket,
};
