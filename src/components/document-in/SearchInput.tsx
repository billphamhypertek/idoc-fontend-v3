import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

interface Props {
  placeholder: string;
  value: string;
  setSearchInput: (value: string) => void;
}

export const SearchInput = ({ placeholder, value, setSearchInput }: Props) => {
  const [draftQuery, setDraftQuery] = useState(value);
  const commit = () => setSearchInput(draftQuery.trim());
  useEffect(() => setDraftQuery(value), [value]);

  return (
    <div className="relative w-full sm:w-80">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
      <Input
        type="text"
        placeholder={placeholder}
        value={draftQuery}
        onChange={(e) => setDraftQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            commit();
          }
        }}
        className="pl-10 pr-4 h-8 border border-blue-600 focus-visible:ring-0"
      />
    </div>
  );
};
