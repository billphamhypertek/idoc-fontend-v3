import { useCallback, useEffect, useState } from "react";
import { sendGet } from "@/api";

interface UseFileToViewOptions {
  url: string;
  idOrName: string;
  enabled?: boolean; // Control when to fetch
}

interface UseFileToViewReturn {
  blob: Blob | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useFetchViewFile({
  url,
  idOrName,
  enabled = true,
}: UseFileToViewOptions): UseFileToViewReturn {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchFile = useCallback(async () => {
    if (!url || !idOrName) return;

    setLoading(true);
    setError(null);

    try {
      const res = await sendGet(`${url}${encodeURIComponent(idOrName)}`, null, {
        responseType: "blob",
        timeout: 0,
      });
      setBlob(res as Blob);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch file"));
      setBlob(null);
    } finally {
      setLoading(false);
    }
  }, [url, idOrName]);

  useEffect(() => {
    if (enabled) {
      fetchFile();
    }
  }, [enabled, fetchFile]);

  return {
    blob,
    loading,
    error,
    refetch: fetchFile,
  };
}
