import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin } from "lucide-react";

interface TripInfoFormProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  handleLocationInputChange: (field: string, value: string) => void;
  selectLocationSuggestion: (field: string, location: string) => void;
  hasFieldError: (fieldName: string) => boolean;
  ValidationError: ({ fieldName }: { fieldName: string }) => JSX.Element | null;
  locationSuggestions: any;
  showSuggestions: any;
  commonLocations: string[];
  isCheckPhamVi: boolean;
  isCheckThongTu: boolean;
  handleDocumentChange: (subField: string, value: string) => void;
  isValid: any;
}

export function TripInfoForm({
  formData,
  handleInputChange,
  handleLocationInputChange,
  selectLocationSuggestion,
  hasFieldError,
  ValidationError,
  locationSuggestions,
  showSuggestions,
  commonLocations,
  isCheckPhamVi,
  isCheckThongTu,
  handleDocumentChange,
  isValid,
}: TripInfoFormProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h3 className="text-sm font-semibold text-green-600 mb-3 flex items-center">
        <MapPin className="w-4 h-4 mr-2" />
        Thông tin chuyến đi
      </h3>
      <div className="space-y-3">
        {/* Lý do sử dụng */}
        <div className="space-y-2">
          <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
            Lý do sử dụng xe <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="reason"
            placeholder="Nhập lý do sử dụng xe"
            value={formData.reason}
            onChange={(e) => handleInputChange("reason", e.target.value)}
            className={`min-h-[80px] resize-none ${hasFieldError("reason") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
          />
          <ValidationError fieldName="reason" />
        </div>

        {/* Thông tư (conditional) */}
        {isCheckPhamVi && !isCheckThongTu && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Nhập thông tư <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <Input
                  placeholder="Số thông tư"
                  value={formData.document.number}
                  onChange={(e) =>
                    handleDocumentChange("number", e.target.value)
                  }
                  className={`h-9 ${hasFieldError("documentNumber") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                />
                <ValidationError fieldName="documentNumber" />
              </div>
              <div>
                <Input
                  placeholder="Ngày"
                  value={formData.document.day}
                  onChange={(e) => handleDocumentChange("day", e.target.value)}
                  className={`h-9 ${hasFieldError("documentDay") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                />
                {!isValid.day && (
                  <small className="text-danger">Vui lòng nhập số</small>
                )}
                <ValidationError fieldName="documentDay" />
              </div>
              <div>
                <Input
                  placeholder="Tháng"
                  value={formData.document.month}
                  onChange={(e) =>
                    handleDocumentChange("month", e.target.value)
                  }
                  className={`h-9 ${hasFieldError("documentMonth") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                />
                {!isValid.month && (
                  <small className="text-danger">Vui lòng nhập số</small>
                )}
                <ValidationError fieldName="documentMonth" />
              </div>
              <div>
                <Input
                  placeholder="Năm"
                  value={formData.document.year}
                  onChange={(e) => handleDocumentChange("year", e.target.value)}
                  className={`h-9 ${hasFieldError("documentYear") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                />
                {!isValid.year && (
                  <small className="text-danger">Vui lòng nhập số</small>
                )}
                <ValidationError fieldName="documentYear" />
              </div>
            </div>
          </div>
        )}

        {/* Thời gian và số người */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Thời gian đi <span className="text-red-500">*</span>
            </Label>
            <Input
              type="datetime-local"
              value={
                formData.dateStart &&
                formData.timeStart.hour !== undefined &&
                formData.timeStart.minute !== undefined
                  ? `${formData.dateStart}T${formData.timeStart.hour.toString().padStart(2, "0")}:${formData.timeStart.minute.toString().padStart(2, "0")}`
                  : ""
              }
              onChange={(e) => {
                const datetime = e.target.value;
                if (datetime) {
                  const [date, time] = datetime.split("T");
                  const [hour, minute] = time.split(":");
                  handleInputChange("dateStart", date);
                  handleInputChange("timeStart", {
                    hour: parseInt(hour),
                    minute: parseInt(minute),
                  });
                }
              }}
              className={`h-9 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm w-full max-w-none ${hasFieldError("dateStart") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
              style={{
                colorScheme: "light",
                fontSize: "14px",
                padding: "6px 8px",
              }}
            />
            <ValidationError fieldName="dateStart" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Thời gian về (Dự kiến) <span className="text-red-500">*</span>
            </Label>
            <Input
              type="datetime-local"
              value={
                formData.dateEnd &&
                formData.timeEnd.hour !== undefined &&
                formData.timeEnd.minute !== undefined
                  ? `${formData.dateEnd}T${formData.timeEnd.hour.toString().padStart(2, "0")}:${formData.timeEnd.minute.toString().padStart(2, "0")}`
                  : ""
              }
              onChange={(e) => {
                const datetime = e.target.value;
                if (datetime) {
                  const [date, time] = datetime.split("T");
                  const [hour, minute] = time.split(":");
                  handleInputChange("dateEnd", date);
                  handleInputChange("timeEnd", {
                    hour: parseInt(hour),
                    minute: parseInt(minute),
                  });
                }
              }}
              className={`h-9 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm w-full max-w-none ${hasFieldError("dateEnd") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
              style={{
                colorScheme: "light",
                fontSize: "14px",
                padding: "6px 8px",
              }}
            />
            <ValidationError fieldName="dateEnd" />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="passengerQuantity"
              className="text-sm font-medium text-gray-700"
            >
              Số người đi <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="passengerQuantity"
                type="number"
                min="1"
                max="50"
                placeholder="1"
                value={formData.passengerQuantity}
                onChange={(e) => {
                  const value = e.target.value;
                  if (
                    value === "" ||
                    (parseInt(value) >= 1 && parseInt(value) <= 50)
                  ) {
                    handleInputChange("passengerQuantity", value);
                  }
                }}
                className={`h-9 pr-2 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${hasFieldError("passengerQuantity") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                style={{ MozAppearance: "textfield" }}
              />
              <div className="absolute right-1 top-0 h-full flex flex-col">
                <button
                  type="button"
                  onClick={() => {
                    const current = parseInt(formData.passengerQuantity) || 0;
                    if (current < 50) {
                      handleInputChange(
                        "passengerQuantity",
                        (current + 1).toString()
                      );
                    }
                  }}
                  className="flex-1 px-1 hover:bg-gray-100 rounded-t text-gray-500 hover:text-gray-700 text-xs leading-none flex items-center justify-center"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const current = parseInt(formData.passengerQuantity) || 0;
                    if (current > 1) {
                      handleInputChange(
                        "passengerQuantity",
                        (current - 1).toString()
                      );
                    }
                  }}
                  className="flex-1 px-1 hover:bg-gray-100 rounded-b text-gray-500 hover:text-gray-700 text-xs leading-none flex items-center justify-center"
                >
                  ▼
                </button>
              </div>
            </div>
            <ValidationError fieldName="passengerQuantity" />
          </div>
        </div>

        {/* Địa điểm */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2 relative">
            <Label
              htmlFor="startLocation"
              className="text-sm font-medium text-gray-700"
            >
              Điểm xuất phát <span className="text-red-500">*</span>
            </Label>
            <Input
              id="startLocation"
              placeholder="Nhập địa điểm xuất phát"
              value={formData.startLocation}
              onChange={(e) =>
                handleLocationInputChange("startLocation", e.target.value)
              }
              onFocus={() => {
                if (formData.startLocation.length > 0) {
                  const filtered = commonLocations.filter((location) =>
                    location
                      .toLowerCase()
                      .includes(formData.startLocation.toLowerCase())
                  );
                  if (filtered.length > 0) {
                    // This would need to be handled by parent component
                  }
                }
              }}
              className={`h-9 ${hasFieldError("startLocation") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
            />
            {showSuggestions.startLocation &&
              locationSuggestions.startLocation.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {locationSuggestions.startLocation.map(
                    (location: string, index: number) => (
                      <div
                        key={index}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                        onClick={() =>
                          selectLocationSuggestion("startLocation", location)
                        }
                      >
                        {location}
                      </div>
                    )
                  )}
                </div>
              )}
            <ValidationError fieldName="startLocation" />
          </div>

          <div className="space-y-2 relative">
            <Label
              htmlFor="pickUpLocation"
              className="text-sm font-medium text-gray-700"
            >
              Địa điểm xe đón <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pickUpLocation"
              placeholder="Nhập địa điểm xe đón"
              value={formData.pickUpLocation}
              onChange={(e) =>
                handleLocationInputChange("pickUpLocation", e.target.value)
              }
              className={`h-9 ${hasFieldError("pickUpLocation") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
            />
            {showSuggestions.pickUpLocation &&
              locationSuggestions.pickUpLocation.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {locationSuggestions.pickUpLocation.map(
                    (location: string, index: number) => (
                      <div
                        key={index}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                        onClick={() =>
                          selectLocationSuggestion("pickUpLocation", location)
                        }
                      >
                        {location}
                      </div>
                    )
                  )}
                </div>
              )}
            <ValidationError fieldName="pickUpLocation" />
          </div>

          <div className="space-y-2 relative">
            <Label
              htmlFor="destination"
              className="text-sm font-medium text-gray-700"
            >
              Địa điểm xe đến <span className="text-red-500">*</span>
            </Label>
            <Input
              id="destination"
              placeholder="Nhập địa điểm xe đến"
              value={formData.destination}
              onChange={(e) =>
                handleLocationInputChange("destination", e.target.value)
              }
              className={`h-9 ${hasFieldError("destination") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
            />
            {showSuggestions.destination &&
              locationSuggestions.destination.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {locationSuggestions.destination.map(
                    (location: string, index: number) => (
                      <div
                        key={index}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                        onClick={() =>
                          selectLocationSuggestion("destination", location)
                        }
                      >
                        {location}
                      </div>
                    )
                  )}
                </div>
              )}
            <ValidationError fieldName="destination" />
          </div>
        </div>
      </div>
    </div>
  );
}
