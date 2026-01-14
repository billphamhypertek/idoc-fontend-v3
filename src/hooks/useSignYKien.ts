import { useState, useEffect, useRef } from "react";

// Placeholder for vgca_sign_json function (assumed to be available globally or imported)
declare const vgca_sign_json: (
  ws: WebSocket | null,
  jsonData: string,
  successCallback: (ev: Event, data: string) => void,
  errorCallback: (err: any) => void
) => void;

interface SignYKienParams {
  message: string;
  successCallback: (ev: Event, data: string) => void;
  failCallback: (err: any) => void;
}

export const useSignYKien = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const webSocketRef = useRef<WebSocket | null>(null);

  const signYKien = ({
    message,
    successCallback,
    failCallback,
  }: SignYKienParams) => {
    const params = { JsonContent: message };
    const jsonParams = JSON.stringify(params);

    setIsLoading(true);

    // Initialize WebSocket connection
    webSocketRef.current = new WebSocket("wss://127.0.0.1:8987/SignJson");

    // Handle WebSocket errors
    webSocketRef.current.onerror = (err) => {
      setIsLoading(false);
      webSocketRef.current = null;
      if (failCallback) failCallback(err);
    };

    // Handle WebSocket close
    webSocketRef.current.onclose = () => {
      webSocketRef.current = null;
    };

    // Call vgca_sign_json for signing
    vgca_sign_json(
      webSocketRef.current,
      jsonParams,
      (ev, data) => {
        setIsLoading(false);
        if (!data) {
          console.error("No data returned from signing", ev);
          if (failCallback) failCallback(ev);
          return;
        }
        successCallback(ev, data);
      },
      (err) => {
        setIsLoading(false);
        if (failCallback) failCallback(err);
      }
    );
  };

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
        webSocketRef.current = null;
      }
    };
  }, []);

  return { signYKien, isLoading };
};
