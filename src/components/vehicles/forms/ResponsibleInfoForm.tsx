import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users } from "lucide-react";

interface ResponsibleInfoFormProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  hasFieldError: (fieldName: string) => boolean;
  ValidationError: ({ fieldName }: { fieldName: string }) => JSX.Element | null;
  isCheckThongTu: boolean;
  checkDepartment: boolean;
  checkOrgVP: boolean;
  orgIdDraft: number | null;
  TTDVOBJ: any[];
  TTVPOBJ: any[];
  ObjLDB: any[];
}

export function ResponsibleInfoForm({
  formData,
  handleInputChange,
  hasFieldError,
  ValidationError,
  isCheckThongTu,
  checkDepartment,
  checkOrgVP,
  orgIdDraft,
  TTDVOBJ,
  TTVPOBJ,
  ObjLDB,
}: ResponsibleInfoFormProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h3 className="text-sm font-semibold text-orange-600 mb-3 flex items-center">
        <Users className="w-4 h-4 mr-2" />
        Thông tin phụ trách
      </h3>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="personEnter"
              className="text-sm font-medium text-gray-700"
            >
              Người phụ trách chuyến đi công tác{" "}
              <span className="text-red-500">*</span>
            </Label>
            {!isCheckThongTu ? (
              <Input
                id="personEnter"
                placeholder="Nhập người phụ trách"
                value={formData.personEnter}
                onChange={(e) =>
                  handleInputChange("personEnter", e.target.value)
                }
                className={`h-9 ${hasFieldError("personEnter") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
              />
            ) : (
              <Select
                value={formData.personEnter}
                onValueChange={(value) =>
                  handleInputChange("personEnter", value)
                }
              >
                <SelectTrigger
                  className={`h-9 ${hasFieldError("personEnter") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                >
                  <SelectValue placeholder="--- Chọn người phụ trách chuyến đi công tác ---" />
                </SelectTrigger>
                <SelectContent>
                  {ObjLDB.map((item: any, index: number) => (
                    <SelectItem key={index} value={item.fullName}>
                      {item.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <ValidationError fieldName="personEnter" />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-sm font-medium text-gray-700"
            >
              Số điện thoại <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0912 345 678"
              value={formData.phone}
              onChange={(e) => {
                let value = e.target.value.replace(/[^0-9\s]/g, "");
                const digits = value.replace(/\s/g, "");
                if (digits.length <= 10) {
                  if (digits.length > 6) {
                    value = digits
                      .replace(/(\d{4})(\d{3})(\d{0,3})/, "$1 $2 $3")
                      .trim();
                  } else if (digits.length > 3) {
                    value = digits.replace(/(\d{4})(\d{0,3})/, "$1 $2").trim();
                  } else {
                    value = digits;
                  }
                  handleInputChange("phone", value);
                }
              }}
              onKeyPress={(e) => {
                if (
                  !/[0-9]/.test(e.key) &&
                  !["Backspace", "Delete", "Tab", "Enter"].includes(e.key)
                ) {
                  e.preventDefault();
                }
              }}
              className={`h-9 ${hasFieldError("phone") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
              maxLength={13}
            />
            <ValidationError fieldName="phone" />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="participant"
            className="text-sm font-medium text-gray-700"
          >
            Thành phần tham gia <span className="text-red-500">*</span>
          </Label>
          <Input
            id="participant"
            placeholder="Nhập thành phần tham gia"
            value={formData.participant}
            onChange={(e) => handleInputChange("participant", e.target.value)}
            className={`h-9 ${hasFieldError("participant") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
          />
          <ValidationError fieldName="participant" />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="leadOrg"
            className="text-sm font-medium text-gray-700"
          >
            Thủ trưởng đơn vị ký <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.leadOrg || ""}
            onValueChange={(value) => {
              handleInputChange("leadOrg", value);
            }}
          >
            <SelectTrigger
              className={`h-9 ${hasFieldError("leadOrg") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
            >
              <SelectValue placeholder="--- Chọn thủ trưởng đơn vị ký ---" />
            </SelectTrigger>
            <SelectContent>
              {TTDVOBJ &&
                TTDVOBJ.map((item: any, index: number) => (
                  <SelectItem key={index} value={item.fullName}>
                    {item.fullName}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <ValidationError fieldName="leadOrg" />
        </div>

        {checkDepartment && !checkOrgVP && (
          <div className="space-y-2">
            <Label
              htmlFor="signer2"
              className="text-sm font-medium text-gray-700"
            >
              Thủ trưởng văn phòng ký <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.signer2}
              onValueChange={(value) => {
                handleInputChange("signer2", value);
              }}
            >
              <SelectTrigger
                className={`h-9 ${hasFieldError("signer2") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
              >
                <SelectValue placeholder="--- Chọn thủ trưởng văn phòng ký ---" />
              </SelectTrigger>
              <SelectContent>
                {TTVPOBJ &&
                  TTVPOBJ.map((item: any, index: number) => (
                    <SelectItem key={index} value={item.fullName}>
                      {item.fullName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <ValidationError fieldName="signer2" />
          </div>
        )}

        {orgIdDraft !== 237 && !checkDepartment && (
          <div className="space-y-2">
            <Label
              htmlFor="signer2"
              className="text-sm font-medium text-gray-700"
            >
              Phòng CT-TC-HC <span className="text-red-500">*</span>
            </Label>
            <Input
              id="signer2"
              placeholder="Nhập phòng CT-TC-HC"
              value={formData.signer2}
              onChange={(e) => handleInputChange("signer2", e.target.value)}
              className={`h-9 ${hasFieldError("signer2") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
            />
            <ValidationError fieldName="signer2" />
          </div>
        )}
      </div>
    </div>
  );
}
