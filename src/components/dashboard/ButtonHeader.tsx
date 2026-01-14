"use client";

import { useSearchSuggestion } from "@/hooks/data/dashboard.data";
import { cn } from "@/lib/utils";
import { isCheckOrg } from "@/utils/token.utils";
import { ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type Tab = "personal" | "unit";

export default function ButtonHeader({
  defaultTab = "personal",
  onTabChange,
  onSearch,
}: {
  defaultTab?: Tab;
  onTabChange?: (tab: Tab) => void;
  onSearch?: (keyword: string) => void;
}) {
  const router = useRouter();
  // const roles = JSON.parse(getUserInfo() || "{}")?.authoritys || [];
  const canUnitStats = isCheckOrg();
  const [tab, setTab] = useState<Tab>(defaultTab);
  useEffect(() => {
    if (defaultTab === "unit" && !canUnitStats) {
      setTab("personal");
      onTabChange?.("personal");
    } else {
      setTab(defaultTab);
    }
  }, [defaultTab, canUnitStats, onTabChange]);

  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: suggestionsData, isFetching: loadingSuggestions } =
    useSearchSuggestion(q);

  const handleChangeTab = (t: Tab) => {
    if (t === tab) return;
    setTab(t);
    onTabChange?.(t);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQ(value);
    setShowSuggestions(value.trim().length > 0);
  };

  useEffect(() => {
    if (q.trim().length > 0 && Array.isArray(suggestionsData)) {
      setSuggestions(suggestionsData);
      setShowSuggestions(suggestionsData.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [q, suggestionsData]);

  const submitSearch = useCallback(
    (raw: string) => {
      const keyword = raw.trim();
      if (!keyword) return;
      setShowSuggestions(false);
      onSearch?.(keyword);
      router.push(`/search-doc?search=${encodeURIComponent(keyword)}`);
    },
    [onSearch, router]
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      submitSearch(q);
    },
    [q, submitSearch]
  );

  const handleSuggestionClick = useCallback(
    (s: string) => {
      submitSearch(s);
    },
    [submitSearch]
  );

  const tabButtons = useMemo(
    () => (
      <>
        <button
          type="button"
          className={cn(
            "px-6 py-2 rounded-full font-semibold text-base transition-all",
            tab === "personal"
              ? "bg-[#1976d2] text-white border-gray-200"
              : "bg-transparent text-gray-700 hover:bg-gray-100"
          )}
          onClick={() => handleChangeTab("personal")}
        >
          Thống kê cá nhân
        </button>
        {canUnitStats && (
          <button
            type="button"
            className={cn(
              "px-6 py-2 rounded-full font-semibold text-base transition-all",
              tab === "unit"
                ? "bg-[#1976d2] text-white border-gray-200"
                : "bg-transparent text-gray-700 hover:bg-gray-100"
            )}
            onClick={() => handleChangeTab("unit")}
          >
            Thống kê đơn vị
          </button>
        )}
      </>
    ),
    [tab, canUnitStats]
  );

  const suggestionItems = useMemo(
    () => (
      <>
        {loadingSuggestions && (
          <li className="px-4 py-2 text-gray-400">Đang tải...</li>
        )}
        {suggestions.map((s, idx) => (
          <li
            key={idx}
            className="px-4 py-2 cursor-pointer hover:bg-blue-50"
            onMouseDown={() => setQ(s)}
            onClick={() => handleSuggestionClick(s)}
          >
            {s}
          </li>
        ))}
      </>
    ),
    [suggestions, loadingSuggestions]
  );

  return (
    <div className="w-full flex flex-wrap items-center justify-between gap-3">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white rounded-full px-1 py-1 shadow border border-blue-100">
        {tabButtons}
      </div>

      {/* Search */}
      <form
        className="flex items-center gap-3 grow justify-end"
        onSubmit={handleSearchSubmit}
      >
        <div className="relative w-full sm:w-[380px]">
          <input
            ref={inputRef}
            value={q}
            onChange={handleInputChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Sổ văn bản, Loại văn bản, ..."
            className="w-full rounded-lg border border-blue-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-blue-200 rounded shadow max-h-56 overflow-auto">
              {suggestionItems}
            </ul>
          )}
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Tìm kiếm
        </button>

        <button
          type="button"
          onClick={() => router.push("/task/dashboard")}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {/* //<ClipboardList className="h-4 w-4" /> */}
          Dashboard
        </button>
      </form>
    </div>
  );
}
