"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Input } from "@/components/ui/input";
import { X, User2, Loader2 } from "lucide-react";
import { User } from "@/definitions/types/user.type";
import { useSearchUserActive } from "@/hooks/data/document-in.data";
import { toast } from "@/hooks/use-toast";
import { ReceiveToKnow } from "@/definitions/types/document.type";
import { ToastUtils } from "@/utils/toast.utils";

interface Props {
  // Emits comma-separated signer IDs whenever selection changes
  onSubmit: (idsCsv: string) => void;
  // Optional: emits comma-separated signer names (e.g. "Full Name - Org")
  // so callers can build listSignersName similar to Angular implementation
  onNamesChange?: (namesCsv: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * SignerSearch
 * - Replaces ReceiveToKnowButton by providing an inline searchable input
 * - Fetches users via React Query hook as user types
 * - Allows selecting multiple users (chips) and removing them
 * - Emits comma-separated user IDs on every selection change via onSubmit
 */
export default function SignerSearch({
  onSubmit,
  onNamesChange,
  placeholder = "Nhập tên người ký",
  disabled,
}: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ReceiveToKnow[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const idsCsv = useMemo(
    () => selected.map((u) => String(u.id)).join(","),
    [selected]
  );

  const namesCsv = useMemo(
    () =>
      selected
        .map((u) =>
          `${u.fullName || ""}${u.orgName ? " - " + u.orgName : ""}`.trim()
        )
        .filter((n) => n && n.length > 0)
        .join(","),
    [selected]
  );

  // debounce search text
  const onChangeQuery = (val: string) => {
    setQuery(val);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!val || val.trim().length === 0) {
      setDebouncedQuery("");
      setOpen(false);
      return;
    }
    debounceRef.current = window.setTimeout(() => {
      setDebouncedQuery(val.trim());
      setOpen(true);
    }, 250);
  };

  // React Query hook for suggestions
  const { data: suggestions = [], isFetching } = useSearchUserActive(
    debouncedQuery,
    open
  );

  const addUser = (u: ReceiveToKnow) => {
    setSelected((prev) => {
      if (prev.some((x) => x.id === u.id)) {
        ToastUtils.error(
          `${u.fullName || ""}${u.orgName ? " - " + u.orgName : ""} đã được chọn`
        );
        return prev;
      }
      const next = [...prev, u];
      const nextIds = next.map((x) => String(x.id)).join(",");
      const nextNames = next
        .map((x) =>
          `${x.fullName || ""}${x.orgName ? " - " + x.orgName : ""}`.trim()
        )
        .filter((n) => n && n.length > 0)
        .join(",");

      onSubmit(nextIds);
      if (onNamesChange) {
        onNamesChange(nextNames);
      }
      return next;
    });
    setQuery("");
    setOpen(false);
  };

  const removeUser = (u: ReceiveToKnow) => {
    setSelected((prev) => {
      const next = prev.filter((x) => x.id !== u.id);
      const nextIds = next.map((x) => String(x.id)).join(",");
      const nextNames = next
        .map((x) =>
          `${x.fullName || ""}${x.orgName ? " - " + x.orgName : ""}`.trim()
        )
        .filter((n) => n && n.length > 0)
        .join(",");

      onSubmit(nextIds);
      if (onNamesChange) {
        onNamesChange(nextNames);
      }
      return next;
    });
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="w-full" ref={containerRef}>
      <div className="flex flex-col gap-2">
        {/* Search input */}
        <div className="relative">
          <Input
            value={query}
            onChange={(e) => onChangeQuery(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="h-9"
          />

          {/* Dropdown */}
          {open && (
            <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-sm max-h-60 overflow-auto">
              {isFetching ? (
                <div className="p-2 text-sm text-gray-500 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang tìm kiếm...
                </div>
              ) : (suggestions as ReceiveToKnow[]).length === 0 ? (
                <div className="p-2 text-sm text-gray-500">
                  Không có kết quả
                </div>
              ) : (
                (suggestions as ReceiveToKnow[]).map((u: ReceiveToKnow) => {
                  const label =
                    `${u.fullName || ""}${u.orgName ? " - " + u.orgName : ""}`.trim();
                  return (
                    <div
                      key={String(u.id)}
                      className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                      onClick={() => addUser(u)}
                    >
                      <User2 className="w-4 h-4 text-blue-600" />
                      <span className="truncate">{label}</span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-2">
          {selected.map((u) => (
            <span
              key={u.id}
              className="inline-flex items-center px-3 py-1.5 rounded-md bg-gray-100 text-sm border"
            >
              <User2 className="mr-2 w-4 h-4 text-blue-600" />
              <span className="truncate max-w-xs text-blue-700 font-medium">
                {u.fullName || ""}
                {u.orgName ? " - " + u.orgName : ""}
              </span>
              <X
                className="ml-2 w-4 h-4 cursor-pointer text-gray-500 hover:text-red-600"
                onClick={() => removeUser(u)}
              />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
