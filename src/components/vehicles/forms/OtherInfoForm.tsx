import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Paperclip } from "lucide-react";
import { CustomDatePicker } from "@/components/ui/calendar";
import { formatDateYMD, parseDateStringYMD } from "@/utils/datetime.utils";

interface OtherInfoFormProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  hasFieldError: (fieldName: string) => boolean;
  ValidationError: ({ fieldName }: { fieldName: string }) => JSX.Element | null;
}

export function OtherInfoForm({
  formData,
  handleInputChange,
  hasFieldError,
  ValidationError,
}: OtherInfoFormProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
        <Paperclip className="w-4 h-4 text-blue-600" />
        Thông tin khác
      </h3>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="creator"
              className="text-sm font-medium text-gray-700"
            >
              Người dự trù <span className="text-red-500">*</span>
            </Label>
            <Input
              id="creator"
              placeholder="Nhập người dự trù"
              value={formData.creator}
              onChange={(e) => handleInputChange("creator", e.target.value)}
              className={`h-9 ${hasFieldError("creator") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
            />
            <ValidationError fieldName="creator" />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="createDate"
              className="text-sm font-medium text-gray-700"
            >
              Thời gian khởi tạo <span className="text-red-500">*</span>
            </Label>
            <CustomDatePicker
              selected={
                formData.createDate
                  ? parseDateStringYMD(formData.createDate)
                  : null
              }
              onChange={(date) =>
                handleInputChange("createDate", date ? formatDateYMD(date) : "")
              }
              className={`h-9 ${hasFieldError("createDate") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
              placeholder="dd/mm/yyyy"
            />
            <ValidationError fieldName="createDate" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="note" className="text-sm font-medium text-gray-700">
            Ghi chú
          </Label>
          <Textarea
            id="note"
            placeholder="Nhập ghi chú"
            value={formData.note}
            onChange={(e) => handleInputChange("note", e.target.value)}
            className="min-h-[80px] resize-none"
          />
        </div>
      </div>
    </div>
  );
}
