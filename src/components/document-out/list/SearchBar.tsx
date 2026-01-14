"use client";

import { Input } from "@/components/ui/input";
import SelectCustom from "@/components/common/SelectCustom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBarProps {
  quickSearchText: string;
  onChangeQuickText: (v: string) => void;
  encryptValue: string;
  onChangeEncrypt: (v: string) => void;
  onSubmit: () => void;
}

export default function SearchBar({
  quickSearchText,
  onChangeQuickText,
  encryptValue,
  onChangeEncrypt,
  onSubmit,
}: SearchBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10 w-[300px]"
          placeholder="Tìm kiếm Số văn bản | Trích yếu"
          value={quickSearchText}
          onChange={(e) => onChangeQuickText(e.target.value)}
          onKeyUp={(e) => e.key === "Enter" && onSubmit()}
        />
      </div>
      <Button variant="outline" onClick={onSubmit}>
        Tìm
      </Button>
      <SelectCustom
        className="w-[180px]"
        options={[
          { label: "Văn bản thường", value: "false" },
          { label: "Văn bản mật", value: "true" },
        ]}
        value={encryptValue}
        onChange={(val) =>
          onChangeEncrypt(String(Array.isArray(val) ? val[0] : val))
        }
      />
    </div>
  );
}
