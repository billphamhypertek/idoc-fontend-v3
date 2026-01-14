"use client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  FORM_FIELD_LAYOUT_CONFIG,
  type LayoutPropertyKey,
} from "@/definitions/constants/formConfig.constant";
import type { FormField } from "./types";

interface LayoutStylingPropertiesProps {
  field: FormField;
  onChange: (fieldId: string, updates: Partial<FormField>) => void;
}

export default function LayoutStylingProperties({
  field,
  onChange,
}: LayoutStylingPropertiesProps) {
  // Lấy config cho field type hiện tại
  const allowedFields = FORM_FIELD_LAYOUT_CONFIG[field.type] || [];

  // Helper function để check xem field có được phép hiển thị không
  const isFieldAllowed = (fieldName: LayoutPropertyKey) =>
    allowedFields.includes(fieldName);

  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
        Bố cục & Giao diện
      </h4>
      <div className="space-y-3">
        {/* size */}
        {isFieldAllowed("size") && (
          <div className="space-y-1.5">
            <Label htmlFor="size" className="text-sm font-medium text-gray-700">
              Kích thước (size)
            </Label>
            <Select
              value={field.size || "full"}
              onValueChange={(value) =>
                onChange(field.id, {
                  size: value as "full" | "half" | "third" | "quarter",
                })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Width (100%)</SelectItem>
                <SelectItem value="half">Half Width (50%)</SelectItem>
                <SelectItem value="third">Third Width (33%)</SelectItem>
                <SelectItem value="quarter">Quarter Width (25%)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Chọn độ rộng của trường trong form
            </p>
          </div>
        )}

        {/* CSS */}
        {isFieldAllowed("css") && (
          <div className="space-y-1.5">
            <Label
              htmlFor="fieldCss"
              className="text-sm font-medium text-gray-700"
            >
              CSS
            </Label>
            <Textarea
              id="fieldCss"
              value={field.css || ""}
              onChange={(e) =>
                onChange(field.id, {
                  css: e.target.value,
                })
              }
              placeholder="Gắn CSS"
              rows={3}
              className="text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}
