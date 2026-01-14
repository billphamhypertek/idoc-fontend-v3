import React from "react";
import { cn } from "@/lib/utils";
import { Search, ClipboardList } from "lucide-react";

export interface Suggestion {
  id: string;
  icon?: React.ReactNode;
  title: string;
  description?: string;
}

export interface SearchAssignBarProps {
  searchQuery: string;
  onSearchQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showSuggestions: boolean;
  suggestions: Suggestion[];
  setSearchQuery: (v: string) => void;
  setSuggestions: (v: Suggestion[]) => void;
  setShowSuggestions: (v: boolean) => void;
  assignLabel: string;
}

export function SearchAssignBar(props: SearchAssignBarProps) {
  const {
    searchQuery,
    onSearchQueryChange,
    showSuggestions,
    suggestions,
    setSearchQuery,
    setSuggestions,
    setShowSuggestions,
    assignLabel,
  } = props;
  return (
    <div className={cn("hidden md:flex items-center gap-3 ml-auto relative")}>
      <div className={cn("relative w-56 sm:w-64 md:w-72")}>
        <div className={cn("relative")}>
          <Search
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
            )}
          />
          <input
            value={searchQuery}
            onChange={onSearchQueryChange}
            placeholder="Tìm kiếm..."
            className={cn(
              "w-full pr-4 pl-9 py-2 h-9 rounded-lg border border-[#1976d2] text-base text-[#1976d2] bg-white transition-all duration-200"
            )}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <div
            className={cn(
              "absolute z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-xl"
            )}
          >
            {suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                className={cn(
                  "w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-50"
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setSearchQuery("");
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
              >
                {s.icon}
                <div>
                  <div className={cn("font-medium")}>{s.title}</div>
                  <div className={cn("text-xs text-gray-500")}>
                    {s.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        className={cn(
          "flex items-center gap-2 px-5 py-2 h-11 rounded-lg text-white text-lg shadow transition-all duration-200 bg-[#1ca153]"
        )}
      >
        <ClipboardList className="w-4 h-4" />
        <span>{assignLabel}</span>
      </button>
    </div>
  );
}
