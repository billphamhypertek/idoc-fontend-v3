"use client";

import FilterField from "@/components/common/FilterFiled";
import { Button } from "@/components/ui/button";
import { Organization, VehicleDriver } from "@/definitions";
import { VehicleStatus } from "@/definitions/enums/vehicle.enum";
import { VehicleService } from "@/services/vehicle.service";
import { normalizeText } from "@/utils/common.utils";
import { saveAs } from "file-saver";
import { useState } from "react";
type SuggestionListProps = {
  field: "licensePlate" | "driverName" | "driverPhone" | "type";
  value: string;
};
export interface Filters {
  licensePlate: string;
  driverName: string;
  driverPhone: string;
  type: string;
  reason: string;
  startLocation: string;
  pickUpLocation: string;
  destination: string;
  startDate: string;
  endDate: string;
  orgId: string;
}

const defaultFilters: Filters = {
  licensePlate: "",
  driverName: "",
  driverPhone: "",
  type: "",
  reason: "",
  startLocation: "",
  pickUpLocation: "",
  destination: "",
  startDate: "",
  endDate: "",
  orgId: "",
};

const ALL_STATUSES = Object.values(VehicleStatus).join(",");
const EXPORT_STATUSES = [VehicleStatus.HOAN_THANH, VehicleStatus.DA_DUYET].join(
  ","
);

interface AdvancedSearchProps {
  initialFilters: Filters;
  appliedFilters: Filters;
  listDriver: VehicleDriver[];
  listOrgCVV: Organization[];
  isOpenSearchByOrgId: boolean;
  isCheckExport: boolean;
  onApply: (filters: Filters) => void;
  onReset: () => void;
}

export default function AdvancedSearch({
  initialFilters,
  appliedFilters,
  listDriver,
  listOrgCVV,
  isOpenSearchByOrgId,
  isCheckExport,
  onApply,
  onReset,
}: AdvancedSearchProps) {
  const [tempFilters, setTempFilters] = useState<Filters>(initialFilters);
  const [isFirstSelection, setIsFirstSelection] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState({
    licensePlate: false,
    driverName: false,
    driverPhone: false,
    type: false,
  });
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [exportDownloadType, setExportDownloadType] = useState<
    "excel" | "csv" | "pdf" | ""
  >("");
  const [exportPrintType, setExportPrintType] = useState<"excel" | "pdf" | "">(
    ""
  );

  const getSuggestions = (field: string) => {
    switch (field) {
      case "licensePlate":
        return Array.from(new Set(listDriver.map((v) => v.licensePlate)));

      case "driverName":
      case "driverPhone": {
        const uniqueDrivers = Array.from(
          new Map(
            listDriver.map((item) => [
              item.driverName.trim() + item.driverPhone.replace(/\s+/g, ""),
              item,
            ])
          ).values()
        );

        return field === "driverName"
          ? Array.from(new Set(uniqueDrivers.map((v) => v.driverName)))
          : Array.from(new Set(uniqueDrivers.map((v) => v.driverPhone)));
      }

      case "type":
        return Array.from(new Set(listDriver.map((v) => v.type)));

      default:
        return [];
    }
  };

  const getFilteredSuggestions = (field: string, value: string) => {
    const suggestions = getSuggestions(field);
    const inputValue = normalizeText(value);
    return suggestions
      .filter((s) => normalizeText(s).includes(inputValue))
      .slice(0, 5);
  };

  const handleInputFocus = (field: string) => {
    setShowSuggestions((prev) => ({ ...prev, [field]: true }));
  };

  const handleInputBlur = (field: string) => {
    setTimeout(() => {
      setShowSuggestions((prev) => ({ ...prev, [field]: false }));
    }, 200);
  };
  const updateFilter = (updates: Partial<typeof tempFilters>) => {
    setTempFilters((prev) => ({
      ...prev,
      ...updates,
    }));
  };
  const handleSuggestionClick = (field: string, value: string) => {
    updateFilter({ [field]: value });

    switch (field) {
      case "licensePlate": {
        const selectedVehicle = listDriver.find(
          (v) => v.licensePlate === value
        );
        if (selectedVehicle) {
          if (isFirstSelection) {
            updateFilter({ type: selectedVehicle.type });
            setIsFirstSelection(false);
          }
        }
        break;
      }

      case "driverName": {
        const selectedDriver = listDriver.find((v) => v.driverName === value);
        if (selectedDriver) {
          updateFilter({ driverPhone: selectedDriver.driverPhone });
        }
        break;
      }

      case "driverPhone": {
        const selectedPhone = listDriver.find((v) => v.driverPhone === value);
        if (selectedPhone) {
          updateFilter({ driverName: selectedPhone.driverName });
        }
        break;
      }

      default:
        break;
    }

    setShowSuggestions((prev) => ({ ...prev, [field]: false }));
  };

  const handleSearchFilterChange = (field: string, value: string) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    onApply(tempFilters);
  };

  const handleResetSearch = () => {
    setTempFilters(defaultFilters);
    setIsFirstSelection(true);
    onReset();
  };

  const toggleExportOptions = () => {
    setShowExportOptions(!showExportOptions);
    setShowPrintOptions(false);
  };

  const togglePrintOptions = () => {
    setShowPrintOptions(!showPrintOptions);
    setShowExportOptions(false);
  };

  const hideExportOptions = () => {
    setShowExportOptions(false);
    setExportDownloadType("");
  };

  const hidePrintOptions = () => {
    setShowPrintOptions(false);
    setExportPrintType("");
  };

  const exportExcel = async (
    exportType: "excel" | "csv" | "pdf",
    mode: "download" | "print"
  ) => {
    const exportParams = {
      startDate: appliedFilters.startDate,
      endDate: appliedFilters.endDate,
      pickUpLocation: appliedFilters.pickUpLocation,
      destination: appliedFilters.destination,
      reason: appliedFilters.reason,
      status: isCheckExport ? EXPORT_STATUSES : ALL_STATUSES,
      licensePlate: appliedFilters.licensePlate,
      driverName: appliedFilters.driverName,
      driverPhone: appliedFilters.driverPhone,
      type: appliedFilters.type,
      startLocation: appliedFilters.startLocation,
      typeFile: exportType,
    };

    try {
      const blob = await VehicleService.exportVehicle(exportParams);
      const mimeMap = {
        excel:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        csv: "text/csv",
        pdf: "application/pdf",
      };
      const extMap = { excel: "xlsx", csv: "csv", pdf: "pdf" };

      const now = new Date();
      const timeStr = `${now.getDate().toString().padStart(2, "0")}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getFullYear()}_${now.getHours().toString().padStart(2, "0")}-${now.getMinutes().toString().padStart(2, "0")}`;

      saveAs(blob, `BAO_CAO_THONG_KE_QL_XE_${timeStr}.${extMap[exportType]}`);

      if (mode === "download") setExportDownloadType("");
      if (mode === "print") setExportPrintType("");
    } catch (error) {
      console.error("Lỗi khi tải file", error);
    }
  };
  const SuggestionList = ({ field, value }: SuggestionListProps) => {
    const suggestions = getFilteredSuggestions(field, value);

    if (!showSuggestions[field] || suggestions.length === 0) return null;

    return (
      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer"
            onClick={() => handleSuggestionClick(field, suggestion)}
          >
            {suggestion}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FilterField
          label="Biển kiểm soát xe"
          field="licensePlate"
          value={tempFilters.licensePlate}
          placeholder="Biển kiểm soát xe"
          withSuggestions
          showSuggestions={showSuggestions.licensePlate}
          suggestions={getFilteredSuggestions(
            "licensePlate",
            tempFilters.licensePlate
          )}
          onChange={handleSearchFilterChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onSelectSuggestion={handleSuggestionClick}
        />

        <FilterField
          label="Tên tài xế"
          field="driverName"
          value={tempFilters.driverName}
          placeholder="Tên tài xế"
          withSuggestions
          showSuggestions={showSuggestions.driverName}
          suggestions={getFilteredSuggestions(
            "driverName",
            tempFilters.driverName
          )}
          onChange={handleSearchFilterChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onSelectSuggestion={handleSuggestionClick}
        />

        <FilterField
          label="Số điện thoại tài xế"
          field="driverPhone"
          value={tempFilters.driverPhone}
          placeholder="Số điện thoại tài xế"
          withSuggestions
          showSuggestions={showSuggestions.driverPhone}
          suggestions={getFilteredSuggestions(
            "driverPhone",
            tempFilters.driverPhone
          )}
          onChange={handleSearchFilterChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onSelectSuggestion={handleSuggestionClick}
        />

        <FilterField
          label="Loại xe"
          field="type"
          value={tempFilters.type}
          placeholder="Loại xe"
          withSuggestions
          showSuggestions={showSuggestions.type}
          suggestions={getFilteredSuggestions("type", tempFilters.type)}
          onChange={handleSearchFilterChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onSelectSuggestion={handleSuggestionClick}
        />

        <FilterField
          label="Lý do sử dụng"
          field="reason"
          value={tempFilters.reason}
          placeholder="Lý do sử dụng"
          onChange={handleSearchFilterChange}
        />

        <FilterField
          label="Địa điểm xuất phát"
          field="startLocation"
          value={tempFilters.startLocation}
          placeholder="Địa điểm xuất phát"
          onChange={handleSearchFilterChange}
        />

        <FilterField
          label="Địa điểm đón"
          field="pickUpLocation"
          value={tempFilters.pickUpLocation}
          placeholder="Địa điểm đón"
          onChange={handleSearchFilterChange}
        />

        <FilterField
          label="Địa điểm đến"
          field="destination"
          value={tempFilters.destination}
          placeholder="Địa điểm đến"
          onChange={handleSearchFilterChange}
        />

        <FilterField
          label="Thời gian đi"
          field="startDate"
          type="date"
          value={tempFilters.startDate}
          onChange={handleSearchFilterChange}
        />

        <FilterField
          label="Thời gian đến"
          field="endDate"
          type="date"
          value={tempFilters.endDate}
          onChange={handleSearchFilterChange}
        />

        {isOpenSearchByOrgId && (
          <FilterField
            label="Đơn vị sử dụng"
            field="orgId"
            type="select"
            value={tempFilters.orgId}
            options={listOrgCVV.map((item) => ({
              label: item.name,
              value: item.id.toString(),
            }))}
            onChange={handleSearchFilterChange}
          />
        )}
      </div>

      <div className="flex items-center justify-center gap-3 mt-4">
        <Button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-sm font-medium"
        >
          Tìm kiếm
        </Button>
        {!isCheckExport ? (
          <Button
            onClick={() => exportExcel("excel", "download")}
            className="bg-green-500 hover:bg-blue-600 text-white h-9 px-4 text-sm font-medium"
          >
            Xuất Excel
          </Button>
        ) : (
          <>
            <div className="relative">
              <Button
                variant="outline"
                onClick={toggleExportOptions}
                className="h-9 px-4 text-sm font-medium"
              >
                <i className="fa fa-download me-1"></i> Xuất ra dạng
              </Button>
              {showExportOptions && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <select
                    value={exportDownloadType}
                    onChange={(e) => {
                      setExportDownloadType(
                        e.target.value as "excel" | "csv" | "pdf"
                      );
                      if (e.target.value)
                        exportExcel(
                          e.target.value as "excel" | "csv" | "pdf",
                          "download"
                        );
                    }}
                    onBlur={hideExportOptions}
                    className="w-full p-2 text-sm"
                  >
                    <option value="" disabled>
                      Chọn định dạng
                    </option>
                    <option value="excel">📄 Xuất ra dạng Excel</option>
                    <option value="csv">📄 Xuất ra dạng CSV</option>
                    <option value="pdf">📄 Xuất ra dạng PDF</option>
                  </select>
                </div>
              )}
            </div>
            <div className="relative">
              <Button
                variant="outline"
                onClick={togglePrintOptions}
                className="h-9 px-4 text-sm font-medium"
              >
                <i className="fa fa-print"></i> In danh sách theo dạng
              </Button>
              {showPrintOptions && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <select
                    value={exportPrintType}
                    onChange={(e) => {
                      setExportPrintType(e.target.value as "excel" | "pdf");
                      if (e.target.value)
                        exportExcel(e.target.value as "excel" | "pdf", "print");
                    }}
                    onBlur={hidePrintOptions}
                    className="w-full p-2 text-sm"
                  >
                    <option value="" disabled>
                      Chọn định dạng
                    </option>
                    <option value="excel">📄 Excel</option>
                    <option value="pdf">📄 PDF</option>
                  </select>
                </div>
              )}
            </div>
          </>
        )}
        <Button
          onClick={handleResetSearch}
          variant="outline"
          className="h-9 px-4 text-sm font-medium border-gray-300 hover:bg-gray-50"
        >
          Đặt lại
        </Button>
      </div>
    </div>
  );
}
