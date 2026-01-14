"use client";
import React from "react";
import SelectCustom from "@/components/common/SelectCustom";

interface SelectDocumentTypeProps {
  selectedValue: boolean;
  selectedChange: (value: boolean) => void;
  onChange?: () => void;
  className?: string;
}

export default function SelectDocumentType({
  selectedValue,
  selectedChange,
  onChange,
  className = "",
}: SelectDocumentTypeProps) {
  const handleChange = (value: string | string[]) => {
    const boolValue = Array.isArray(value)
      ? value[0] === "true"
      : value === "true";
    selectedChange(boolValue);
    onChange?.();
  };

  return (
    <div className={`form-group row ${className}`}>
      <label className="col-sm-4 text-right px-0 pt-2">Hiển thị: </label>
      <div className="col-sm-8">
        <SelectCustom
          value={selectedValue ? "true" : "false"}
          onChange={handleChange}
          options={[
            { label: "Văn bản thường", value: "false" },
            { label: "Văn bản mật", value: "true" },
          ]}
        />
      </div>
    </div>
  );
}
