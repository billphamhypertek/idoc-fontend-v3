import React, { useState } from "react";
import { Search } from "lucide-react";
import { useSearchKeyword } from "@/hooks/data/dashboard.data";
import { cn } from "@/lib/utils";

type SearchResult = {
  id: number;
  code: string;
  name: string;
  createDate: number;
  type: string;
};

export default function SearchSuggestionBar() {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { data: suggestions = [], isLoading } = useSearchKeyword(query);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(!!value.trim());
  };

  return (
    <div className={cn("relative w-full max-w-md mx-auto mt-8")}>
      <div className={cn("relative")}>
        <Search
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
          )}
        />
        <input
          value={query}
          onChange={handleChange}
          placeholder="Tìm kiếm..."
          className={cn(
            "w-full pr-4 pl-9 py-2 h-9 rounded-lg border border-blue-400 text-base text-blue-700 bg-white transition-all duration-200"
          )}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 800)}
        />
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div
          className={cn(
            "absolute z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-xl max-h-80 overflow-auto"
          )}
        >
          {isLoading && (
            <div className={cn("p-3 text-gray-500")}>Đang tải...</div>
          )}
          {suggestions.map((s: SearchResult) => (
            <button
              key={s.id}
              type="button"
              className={cn(
                "w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-50"
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setQuery(s.name);
                setShowSuggestions(false);
              }}
            >
              <div>
                <div className={cn("font-medium")}>{s.name}</div>
                <div className={cn("text-xs text-gray-500")}>{s.type}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
