"use client";
import { useCallback } from "react";

import {
  getDataEncrypt,
  setDataEncrypt,
  getDataEncryptDocBook,
  setDataEncryptDocBook,
  removeDataEncryptDocBook,
} from "@/utils/token.utils";
import { isCheckStartUsbTokenWatcher } from "@/services/usbTokenService";

export function useUsbTokenWatcher() {
  const ensureWatcherIfEncrypted = useCallback(async () => {
    try {
      if (getDataEncrypt() === "true") {
        await isCheckStartUsbTokenWatcher();
      }
    } catch (err) {
      console.error("USB Token watcher check failed:", err);
    }
  }, []);

  const enableEncryptionAndWatch = useCallback(async () => {
    try {
      setDataEncrypt(true);
      await isCheckStartUsbTokenWatcher();
    } catch (err) {
      console.error("Enable encryption/watch failed:", err);
    }
  }, []);

  const isCheckStartUsbTokenWatcherDocBook = useCallback(async () => {
    try {
      if (getDataEncryptDocBook() === "true") {
        await isCheckStartUsbTokenWatcher();
      }
    } catch (err) {
      console.error("USB Token watcher check failed for document book:", err);
    }
  }, []);

  const enableEncryptionAndWatchDocBook = useCallback(async () => {
    try {
      setDataEncryptDocBook(true);
      await isCheckStartUsbTokenWatcher();
    } catch (err) {
      console.error("Enable encryption/watch failed for document book:", err);
    }
  }, []);

  const disableEncryptionDocBook = useCallback(() => {
    try {
      removeDataEncryptDocBook();
    } catch (err) {
      console.error("Disable encryption failed for document book:", err);
    }
  }, []);

  return {
    ensureWatcherIfEncrypted,
    enableEncryptionAndWatch,
    isCheckStartUsbTokenWatcherDocBook,
    enableEncryptionAndWatchDocBook,
    disableEncryptionDocBook,
  };
}
