"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SelectCustom from "@/components/common/SelectCustom";
import {
  Quote,
  FileText,
  Star,
  Clock,
  Shield,
  Paperclip,
  Search,
} from "lucide-react";
import { CustomDatePicker } from "@/components/ui/calendar";
import { formatDateYMD, parseDateStringYMD } from "@/utils/datetime.utils";
import { cn } from "@/lib/utils";

interface AdvancedSearchProps {
  preview: string;
  onChangePreview: (v: string) => void;
  docTypeOptions: Array<{ id: string; name: string }>;
  docTypeId: string;
  onChangeDocType: (v: string) => void;
  important?: string;
  onChangeImportant?: (v: string) => void;
  expired: string;
  onChangeExpired: (v: string) => void;
  onSubmit: () => void;
  // Extended fields for opinion page
  startDate?: string;
  onChangeStartDate?: (v: string) => void;
  endDate?: string;
  onChangeEndDate?: (v: string) => void;
  sign?: string;
  onChangeSign?: (v: string) => void;
  userEnter?: string;
  onChangeUserEnter?: (v: string) => void;
  orgName?: string;
  onChangeOrgName?: (v: string) => void;
  encryptShowing?: string;
  onChangeEncryptShowing?: (v: string) => void;
  extraBtn?: any;
}

export default function AdvancedSearch({
  preview,
  onChangePreview,
  docTypeOptions,
  docTypeId,
  onChangeDocType,
  important,
  onChangeImportant,
  expired,
  onChangeExpired,
  onSubmit,
  // Extended fields
  startDate,
  onChangeStartDate,
  endDate,
  onChangeEndDate,
  sign,
  onChangeSign,
  userEnter,
  onChangeUserEnter,
  orgName,
  onChangeOrgName,
  extraBtn,
}: AdvancedSearchProps) {
  const isExtendedMode = !!startDate; // Check if extended fields are provided

  return (
    <div className="bg-white rounded-lg border mb-4">
      <h3 className="font-bold text-info mb-10 p-4 bg-blue-100 rounded-t-lg">
        Tìm kiếm nâng cao
      </h3>
      <div className="space-y-3 px-8">
        {isExtendedMode ? (
          <>
            {/* Extended mode for opinion page */}
            {/* Row 1: Date & DocType/Important */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                  Từ ngày
                </Label>
                <div className="flex-1">
                  <CustomDatePicker
                    selected={parseDateStringYMD(startDate)}
                    onChange={(e) => onChangeStartDate?.(formatDateYMD(e))}
                    placeholder="Chọn ngày"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                  Đến ngày
                </Label>
                <div className="flex-1">
                  <CustomDatePicker
                    selected={parseDateStringYMD(endDate)}
                    onChange={(e) => onChangeEndDate?.(formatDateYMD(e))}
                    placeholder="Chọn ngày"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                  {/* <Paperclip className="w-4 h-4 text-blue-600" /> */}
                  Loại văn bản
                </Label>
                <div className="flex-1 min-w-0">
                  <SelectCustom
                    options={docTypeOptions.map((x) => ({
                      id: String(x.id),
                      name: x.name,
                    }))}
                    value={docTypeId}
                    onChange={(v) => {
                      onChangeDocType(String(Array.isArray(v) ? v[0] : v));
                    }}
                    // placeholder="--- Chọn ---"
                    className="data-[placeholder]:text-black"
                  />
                </div>
              </div>
              {/* </div> */}

              {/* Row 2: Sign, UserEnter, OrgName, Preview */}
              {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4"> */}
              <div className="flex items-center gap-3">
                <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                  Ký số
                </Label>
                <div className="flex-1 min-w-0">
                  <SelectCustom
                    options={[
                      { label: "Tất cả", value: "all" },
                      { label: "Có ký", value: "true" },
                      { label: "Không ký", value: "false" },
                    ]}
                    value={sign || ""}
                    onChange={(v) =>
                      onChangeSign?.(String(Array.isArray(v) ? v[0] : v))
                    }
                    // placeholder="-- Chọn --"
                    className="data-[placeholder]:text-black"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                  Người nhập
                </Label>
                <div className="flex-1">
                  <Input
                    value={userEnter || ""}
                    onChange={(e) => onChangeUserEnter?.(e.target.value)}
                    className="h-9"
                    placeholder="Nhập tên người nhập…"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                  Cơ quan ban hành
                </Label>
                <div className="flex-1">
                  <Input
                    value={orgName || ""}
                    onChange={(e) => onChangeOrgName?.(e.target.value)}
                    className="h-9"
                    placeholder="Nhập tên cơ quan…"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                  {/* <Quote className="w-4 h-4" /> */}
                  Trích yếu
                </Label>
                <div className="flex-1">
                  <Input
                    value={preview}
                    onChange={(e) => onChangePreview(e.target.value)}
                    onKeyUp={(e) => e.key === "Enter" && onSubmit()}
                    className="h-9"
                    placeholder="Nhập từ khóa…"
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Standard mode for other pages */}
            {/* Preview */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="flex items-center gap-3">
                <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                  {/* <Quote className="w-4 h-4" /> */}
                  Trích yếu
                </Label>
                <Input
                  value={preview}
                  onChange={(e) => onChangePreview(e.target.value)}
                  onKeyUp={(e) => e.key === "Enter" && onSubmit()}
                  className="h-9"
                />
              </div>
            </div>

            {/* Row with docType, important, expired */}
            <div
              className={cn(
                "grid grid-cols-1 gap-4",
                onChangeImportant ? "md:grid-cols-3" : "md:grid-cols-2"
              )}
            >
              <div className="flex items-center gap-3">
                <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                  {/* <Paperclip className="w-4 h-4 text-blue-600" /> */}
                  Loại văn bản
                </Label>
                <div className="flex-1 min-w-0">
                  <SelectCustom
                    options={docTypeOptions.map((x) => ({
                      id: String(x.id),
                      name: x.name,
                    }))}
                    value={docTypeId}
                    onChange={(v) => {
                      onChangeDocType(String(Array.isArray(v) ? v[0] : v));
                    }}
                    placeholder="Chọn loại văn bản"
                  />
                </div>
              </div>
              {onChangeImportant && (
                <div className="flex items-center gap-3">
                  <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                    {/* <Star className="w-4 h-4 text-gray-400 mx-auto" /> */}
                    Văn bản quan trọng
                  </Label>
                  <div className="flex-1 min-w-0">
                    <SelectCustom
                      options={[
                        { label: "Quan trọng", value: "true" },
                        { label: "Không quan trọng", value: "false" },
                      ]}
                      value={important}
                      onChange={(v) =>
                        onChangeImportant(String(Array.isArray(v) ? v[0] : v))
                      }
                      // placeholder="-- Chọn --"
                      className="data-[placeholder]:text-black"
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                  {/* <Clock className="w-4 h-4" /> */}
                  Hạn văn bản
                </Label>
                <div className="flex-1 min-w-0">
                  <SelectCustom
                    options={[
                      { label: "Văn bản còn hạn", value: "false" },
                      { label: "Văn bản hết hạn", value: "true" },
                    ]}
                    value={expired}
                    onChange={(v) =>
                      onChangeExpired(String(Array.isArray(v) ? v[0] : v))
                    }
                    // placeholder="-- Chọn --"
                    className="data-[placeholder]:text-black"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="my-6 text-center flex align-items-center gap-2 justify-center">
        <Button
          onClick={onSubmit}
          className="h-9 px-4 text-sm font-medium bg-blue-600 hover:bg-blue-700"
          // onMouseEnter={(e) =>
          //   (e.currentTarget.style.backgroundColor = "#3a7bc8")
          // }
          // onMouseLeave={(e) =>
          //   (e.currentTarget.style.backgroundColor = "#4798e8")
          // }
        >
          <Search className="w-4 h-4 mr-1" />
          Tìm kiếm
        </Button>
        {extraBtn}
      </div>
    </div>
  );
}
