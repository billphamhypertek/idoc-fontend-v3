import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Car } from "lucide-react";

interface VehicleInfoFormProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  listNextNode: any[];
  createOrgList: any[];
  hasFieldError: (fieldName: string) => boolean;
  ValidationError: ({ fieldName }: { fieldName: string }) => JSX.Element | null;
  checkDepartment: boolean;
  checkOrgVP: boolean;
  isUserAssigned: boolean;
  onOrgChange?: (orgId: number) => void;
  onNodeChange?: (nodeId: number) => void;
}

export function VehicleInfoForm({
  formData,
  handleInputChange,
  listNextNode,
  createOrgList,
  hasFieldError,
  ValidationError,
  checkDepartment,
  checkOrgVP,
  isUserAssigned,
  onOrgChange,
  onNodeChange,
}: VehicleInfoFormProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h3 className="text-sm font-semibold text-blue-600 mb-3 flex items-center">
        <Car className="w-4 h-4 mr-2" />
        Thông tin xe
      </h3>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="nextNode"
              className="text-sm font-medium text-gray-700"
            >
              Phiếu xin xe <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.nextNode.toString()}
              onValueChange={(value) => {
                const intValue = parseInt(value);
                handleInputChange("nextNode", intValue);
                onNodeChange?.(intValue);
              }}
            >
              <SelectTrigger
                className={`h-9 ${hasFieldError("nextNode") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
              >
                <SelectValue placeholder="--- Chọn phiếu xin xe ---" />
              </SelectTrigger>
              <SelectContent>
                {listNextNode.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ValidationError fieldName="nextNode" />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="orgId"
              className="text-sm font-medium text-gray-700"
            >
              Tên cơ quan, đơn vị <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.orgId?.toString() || ""}
              onValueChange={(value) => {
                const intValue = parseInt(value);
                handleInputChange("orgId", intValue);
                onOrgChange?.(intValue);
              }}
            >
              <SelectTrigger
                className={`h-9 ${hasFieldError("orgId") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
              >
                <SelectValue>
                  {formData.orgId
                    ? createOrgList.find((item) => item.id === formData.orgId)
                        ?.name || "--- Chọn cơ quan đơn vị ---"
                    : "--- Chọn cơ quan đơn vị ---"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {createOrgList.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ValidationError fieldName="orgId" />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="genPlan"
              className="text-sm font-medium text-gray-700"
            >
              Phạm vi <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.genPlan?.toString() || ""}
              onValueChange={(value) => {
                const boolValue = value === "true";
                handleInputChange("genPlan", boolValue);
              }}
            >
              <SelectTrigger
                className={`h-9 ${hasFieldError("genPlan") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
              >
                <SelectValue>
                  {formData.genPlan === null
                    ? "--- Chọn phạm vi hoạt động của xe ---"
                    : formData.genPlan
                      ? "Ngoại thành Hà Nội"
                      : "Nội thành Hà Nội"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Nội thành Hà Nội</SelectItem>
                <SelectItem value="true">Ngoại thành Hà Nội</SelectItem>
              </SelectContent>
            </Select>
            <ValidationError fieldName="genPlan" />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="expectedType"
              className="text-sm font-medium text-gray-700"
            >
              Loại xe <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.expectedType}
              onValueChange={(value) => {
                handleInputChange("expectedType", value);
              }}
            >
              <SelectTrigger
                className={`h-9 ${hasFieldError("expectedType") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
              >
                <SelectValue placeholder="-- Chọn loại xe --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4 chỗ</SelectItem>
                <SelectItem value="7">7 chỗ</SelectItem>
                <SelectItem value="16">16 chỗ</SelectItem>
                <SelectItem value="24">24 chỗ</SelectItem>
                <SelectItem value="29">29 chỗ</SelectItem>
                <SelectItem value="Cứu thương">Cứu thương</SelectItem>
                {isUserAssigned && (
                  <SelectItem value="Xe Lãnh Đạo Ban">
                    Xe Lãnh Đạo Ban
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <ValidationError fieldName="expectedType" />
          </div>
        </div>
      </div>
    </div>
  );
}
