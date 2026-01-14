"use client";

import SelectCustom from "@/components/common/SelectCustom";
import { cn } from "@/lib/utils";
import { setAllEncryptFlags, useEncryptStore } from "@/stores/encrypt.store";

interface EncryptDisplaySelectProps {
  onChange?: () => void;
  className?: string;
  selectClassName?: string;
  label?: string;
}

export default function EncryptDisplaySelect({
  onChange,
  className,
  selectClassName = "w-[180px]",
  label = "Hiển thị:",
}: EncryptDisplaySelectProps) {
  const { isEncrypt, setEncrypt } = useEncryptStore();
  const handleChange = (val: boolean) => {
    setEncrypt(val);
    setAllEncryptFlags(val);
    onChange?.();
  };
  return (
    <div className={"flex items-center gap-2 " + (className || "")}>
      <span className="text-xs text-gray-600 font-bold">{label}</span>
      <div className="flex-1 min-w-0">
        <SelectCustom
          className={cn(
            selectClassName,
            "font-bold",
            isEncrypt ? "text-red-500" : "text-black"
          )}
          options={[
            { label: "Văn bản thường", value: "false" },
            { label: "Văn bản mật", value: "true" },
          ]}
          value={isEncrypt ? "true" : "false"}
          onChange={(val: string | string[]) => {
            const str = String(Array.isArray(val) ? val[0] : val);
            handleChange(str === "true");
          }}
        />
      </div>
    </div>
  );
}
