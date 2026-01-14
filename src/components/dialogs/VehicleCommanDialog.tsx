"use client";

import FilterField from "@/components/common/FilterFiled";
import { CustomDatePicker, CustomTimePicker } from "@/components/ui/calendar";
import {
  CustomDialogContent,
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { LeadInformation, VehicleDriver } from "@/definitions";
import { formatDateTime } from "@/utils/datetime.utils";
import { CircleCheckIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* ------------------------- [FIX-180] Biển số & Phone ------------------------- */
const PLATE_REGEX =
  /^(?:\d{2}[A-Z]-\d{3}\.\d{2}|\d{2}[A-Z]-\d{4}|[A-Z]{2}\s?\d{2}-\d{2})$/i;

const normalizePlate = (v: string) =>
  v.toUpperCase().replace(/\s+/g, " ").trim();
const isValidPlate = (v: string) => PLATE_REGEX.test(normalizePlate(v));

// Cho phép số ĐT có khoảng trắng, dấu +, (), -, tối thiểu 7 ký tự
const isValidPhone = (v: string) => /^\+?[0-9\s().-]{7,}$/.test(v.trim());
/* --------------------------------------------------------------------------- */

interface VehicleFormData {
  licensePlate: string;
  type: string;
  driverName: string;
  driverPhone: string;
  distance: string;
  commandSigner: LeadInformation | null;
  commandNumber: string;
  startDate: Date | null;
  startTime: Date | null;
  endDate: Date | null;
  endTime: Date | null;
  commandDate: Date | null;
}

interface VehicleCommandDialogProps {
  isOpen: boolean;
  isEditMode: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: Partial<VehicleFormData>;
  drivers?: VehicleDriver[];
  signers?: LeadInformation[];
}

// Helper functions for deep comparison
function isDateEqual(d1: Date | null, d2: Date | null): boolean {
  if (d1 === null && d2 === null) return true;
  if (d1 === null || d2 === null) return false;
  return d1.getTime() === d2.getTime();
}

function isSignerEqual(
  s1: LeadInformation | null,
  s2: LeadInformation | null
): boolean {
  if (s1 === null && s2 === null) return true;
  if (s1 === null || s2 === null) return false;
  return s1.id === s2.id; // Giả sử id là unique
}

function isFormEqual(a: VehicleFormData, b: VehicleFormData): boolean {
  return (
    a.licensePlate === b.licensePlate &&
    a.type === b.type &&
    a.driverName === b.driverName &&
    a.driverPhone === b.driverPhone &&
    a.distance === b.distance &&
    a.commandNumber === b.commandNumber &&
    isDateEqual(a.startDate, b.startDate) &&
    isDateEqual(a.startTime, b.startTime) &&
    isDateEqual(a.endDate, b.endDate) &&
    isDateEqual(a.endTime, b.endTime) &&
    isDateEqual(a.commandDate, b.commandDate) &&
    isSignerEqual(a.commandSigner, b.commandSigner)
  );
}

export default function VehicleCommandDialog({
  isOpen,
  isEditMode,
  onOpenChange,
  onSubmit,
  initialData,
  drivers = [],
  signers = [],
}: VehicleCommandDialogProps) {
  const [form, setForm] = useState<VehicleFormData>({
    licensePlate: "",
    type: "",
    driverName: "",
    driverPhone: "",
    distance: "",
    commandSigner: null,
    commandNumber: "",
    startDate: null,
    startTime: null,
    endDate: null,
    endTime: null,
    commandDate: null,
  });

  const [showLicenseDropdown, setShowLicenseDropdown] = useState(false);
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);
  const [filteredLicensePlates, setFilteredLicensePlates] = useState<string[]>(
    []
  );
  const [filteredDrivers, setFilteredDrivers] = useState<string[]>([]);
  const [firstSelectionDone, setFirstSelectionDone] = useState(false);

  const licenseInputRef = useRef<HTMLDivElement>(null);
  const driverInputRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const effectiveInitialData = isEditMode ? initialData : {};

    const parseTimestamp = (timestamp: string | Date | undefined | null) => {
      if (!timestamp) return { date: null, time: null };

      const dateObj =
        timestamp instanceof Date ? timestamp : new Date(timestamp);
      const isDefaultDate =
        dateObj.getFullYear() === 2000 &&
        dateObj.getMonth() === 0 &&
        dateObj.getDate() === 1;
      const seconds = dateObj.getSeconds();

      if (seconds === 0) {
        return {
          date: dateObj,
          time: null,
        };
      } else if (isDefaultDate && seconds === 1) {
        return {
          date: null,
          time: dateObj,
        };
      } else {
        return {
          date: dateObj,
          time: dateObj,
        };
      }
    };

    const start = parseTimestamp(effectiveInitialData?.startDate);
    const end = parseTimestamp(effectiveInitialData?.endDate);
    const command = parseTimestamp(effectiveInitialData?.commandDate);

    const commandSignerValue = effectiveInitialData?.commandSigner
      ? signers.find(
          (s) => s.fullName === effectiveInitialData.commandSigner?.fullName
        ) || effectiveInitialData.commandSigner
      : null;

    const newForm: VehicleFormData = {
      licensePlate: effectiveInitialData?.licensePlate || "",
      type: effectiveInitialData?.type || "",
      driverName: effectiveInitialData?.driverName || "",
      driverPhone: effectiveInitialData?.driverPhone || "",
      distance: effectiveInitialData?.distance || "",
      commandSigner: commandSignerValue,
      commandNumber: effectiveInitialData?.commandNumber || "",
      startDate: start.date,
      startTime: start.time,
      endDate: end.date,
      endTime: end.time,
      commandDate: command.date,
    };

    setForm((prev) => {
      if (isFormEqual(prev, newForm)) {
        return prev;
      }
      return newForm;
    });

    setFirstSelectionDone(isEditMode);
  }, [isEditMode, initialData, signers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        licenseInputRef.current &&
        !licenseInputRef.current.contains(event.target as Node)
      ) {
        hideDropdownWithDelay("license");
      }
      if (
        driverInputRef.current &&
        !driverInputRef.current.contains(event.target as Node)
      ) {
        hideDropdownWithDelay("driver");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hideDropdownWithDelay = (type: "license" | "driver") => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      if (type === "license") {
        setShowLicenseDropdown(false);
      } else {
        setShowDriverDropdown(false);
      }
    }, 200);
  };

  const uniqueDrivers = Array.from(
    new Set(drivers.map((v) => v.driverName))
  ).map((name) => {
    const driver = drivers.find((v) => v.driverName === name) as VehicleDriver;
    return {
      ...driver,
      driverPhone: driver.driverPhone || "Không có số điện thoại",
    };
  });
  const selectDriver = (driverName: string) => {
    const selectedDriver = uniqueDrivers.find(
      (d) => d.driverName === driverName
    );
    if (selectedDriver) {
      setForm((prev) => ({
        ...prev,
        driverName: selectedDriver.driverName,
        driverPhone: selectedDriver.driverPhone || "Không có số điện thoại",
      }));
    }
    setShowDriverDropdown(false);
  };

  /* ----------------------- [FIX-180] filter kèm chế độ show all --------------- */
  const filterLicensePlates = (keyword?: string) => {
    const base = Array.from(
      new Set(drivers.map((v) => normalizePlate(v.licensePlate)))
    );
    const k = normalizePlate(keyword ?? form.licensePlate ?? "");
    const data = k ? base.filter((p) => p.includes(k)) : base;
    setFilteredLicensePlates(data);
    setShowLicenseDropdown(true);
  };

  const filterDrivers = (keyword?: string) => {
    const base = Array.from(new Set(uniqueDrivers.map((d) => d.driverName)));
    const k = (keyword ?? form.driverName ?? "").trim().toLowerCase();
    const data = k ? base.filter((n) => n.toLowerCase().includes(k)) : base;
    setFilteredDrivers(data);
    setShowDriverDropdown(true);
  };
  /* --------------------------------------------------------------------------- */

  const selectLicensePlate = (plate: string) => {
    const normalized = normalizePlate(plate); // [FIX-180] chuẩn hoá
    const selectedVehicle = drivers.find(
      (v) => normalizePlate(v.licensePlate) === normalized
    );
    if (selectedVehicle) {
      setForm((prev) => ({
        ...prev,
        licensePlate: normalizePlate(selectedVehicle.licensePlate), // [FIX-180]
        type: selectedVehicle.type,
        driverName: !firstSelectionDone
          ? selectedVehicle.driverName
          : prev.driverName,
        driverPhone: !firstSelectionDone
          ? selectedVehicle.driverPhone
          : prev.driverPhone,
      }));
      setFirstSelectionDone(true);
    } else {
      setForm((prev) => ({ ...prev, licensePlate: normalized }));
    }
    setShowLicenseDropdown(false);
  };

  /* ------------------------ [FIX-180] Nhập tay biển số ----------------------- */
  const handleManualLicensePlateInput = (value: string) => {
    const valueNorm = normalizePlate(value);
    const selectedVehicle = drivers.find(
      (v) => normalizePlate(v.licensePlate) === valueNorm
    );
    if (selectedVehicle) {
      setForm((prev) => ({
        ...prev,
        licensePlate: normalizePlate(selectedVehicle.licensePlate),
        type: selectedVehicle.type,
        driverName: !firstSelectionDone
          ? selectedVehicle.driverName
          : prev.driverName,
        driverPhone: !firstSelectionDone
          ? selectedVehicle.driverPhone
          : prev.driverPhone,
      }));
      setFirstSelectionDone(true);
    } else {
      setForm((prev) => ({
        ...prev,
        licensePlate: valueNorm,
        type: "",
        driverName: "",
        driverPhone: "",
      }));
      setFirstSelectionDone(false);
    }
  };
  /* --------------------------------------------------------------------------- */

  const isValidDistance = (value: string): boolean =>
    /^[0-9]+(\.[0-9]+)?$/.test(value);

  const isValidCommandSigner = (value: LeadInformation | null): boolean =>
    value !== null && value.fullName.trim().length > 0;

  const formatDate = (date: Date | null): string => {
    return date ? date.toISOString().split("T")[0] : "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      type: form.type,
      driverName: form.driverName,
      licensePlate: normalizePlate(form.licensePlate), // [FIX-180] gửi bản chuẩn hoá
      driverPhone: form.driverPhone,
      distance: form.distance,
      commandSigner: form.commandSigner?.fullName || "",
      commandNumber: form.commandNumber,
      startDate: formatDateTime(form.startDate, form.startTime),
      endDate: formatDateTime(form.endDate, form.endTime),
      commandDate: formatDate(form.commandDate),
    };
    onSubmit(data);
    onOpenChange(false);
  };

  /* ----------------- [FIX-180] Bổ sung validate biển & phone ----------------- */
  const isSubmitDisabled = (): boolean =>
    !form.driverName ||
    !form.licensePlate ||
    !form.driverPhone ||
    !form.distance ||
    !form.type ||
    !isValidCommandSigner(form.commandSigner) ||
    !isValidDistance(form.distance) ||
    !isValidPlate(form.licensePlate) || // [FIX-180] biển số
    !isValidPhone(form.driverPhone); // [FIX-180] số điện thoại có khoảng trắng
  /* --------------------------------------------------------------------------- */

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <CustomDialogContent className="max-h-[90vh] max-w-[500px] rounded-lg overflow-y-auto p-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-left">
            Thông tin xe
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="relative" ref={licenseInputRef}>
            <FilterField
              label="Biển kiểm soát xe"
              field="licensePlate"
              value={form.licensePlate}
              placeholder="Chọn hoặc nhập biển số xe"
              required={true}
              withSuggestions={true}
              showSuggestions={showLicenseDropdown}
              suggestions={filteredLicensePlates}
              onChange={(_, value) => {
                handleManualLicensePlateInput(value); // [FIX-180]
                filterLicensePlates(value); // [FIX-180] gõ -> lọc theo value mới
              }}
              onFocus={() => filterLicensePlates("")} // [FIX-180] focus -> show all
              onBlur={() => {
                setForm((prev) => ({
                  ...prev,
                  licensePlate: normalizePlate(prev.licensePlate),
                }));
                hideDropdownWithDelay("license");
              }}
              onSelectSuggestion={(_, value) => selectLicensePlate(value)}
            />
            {form.licensePlate && !isValidPlate(form.licensePlate) && (
              <p className="text-xs text-red-500 mt-1">
                Biển kiểm soát không hợp lệ (ví dụ: 29A-123.45, 51C-1234, PK
                57-99)
              </p>
            )}
          </div>

          <div className="relative" ref={driverInputRef}>
            <FilterField
              label="Tên lái xe"
              field="driverName"
              value={form.driverName}
              placeholder="Chọn hoặc nhập tên lái xe"
              required={true}
              withSuggestions={true}
              showSuggestions={showDriverDropdown}
              suggestions={filteredDrivers}
              onChange={(_, value) => {
                setForm({ ...form, driverName: value });
                filterDrivers(value); // [FIX-180] gõ -> lọc theo value mới
              }}
              onFocus={() => filterDrivers("")} // [FIX-180] focus -> show all
              onBlur={() => hideDropdownWithDelay("driver")}
              onSelectSuggestion={(_, value) => selectDriver(value)}
            />
          </div>

          <FilterField
            label="Số điện thoại lái xe"
            field="driverPhone"
            value={form.driverPhone}
            required={true}
            onChange={(_, value) => setForm({ ...form, driverPhone: value })}
          />
          {form.driverPhone && !isValidPhone(form.driverPhone) && (
            <p className="text-xs text-red-500 -mt-2">
              Số điện thoại không hợp lệ (cho phép khoảng trắng, +, (), -)
            </p>
          )}

          <FilterField
            label="Loại xe"
            field="type"
            value={form.type}
            required={true}
            onChange={(_, value) => setForm({ ...form, type: value })}
          />
          <FilterField
            label="Quãng đường đi (km)"
            field="distance"
            value={form.distance}
            required={true}
            onChange={(_, value) => setForm({ ...form, distance: value })}
          />
          <FilterField
            label="Người ký lệnh"
            field="commandSigner"
            type="select"
            value={form.commandSigner?.id?.toString() || ""}
            required={true}
            placeholder="Chọn người ký lệnh"
            options={signers.map((signer) => ({
              label: signer.fullName,
              value: signer.id.toString(),
            }))}
            onChange={(_, value) => {
              const signer =
                signers.find((s) => s.id.toString() === value) || null;
              setForm({ ...form, commandSigner: signer });
            }}
          />
          <FilterField
            label="Số ký hiệu của lệnh"
            field="commandNumber"
            value={form.commandNumber}
            onChange={(_, value) => setForm({ ...form, commandNumber: value })}
          />

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-700">
              Thời gian đi
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <CustomTimePicker
                selected={form.startTime}
                onChange={(time) => setForm({ ...form, startTime: time })}
              />
              <CustomDatePicker
                selected={form.startDate}
                onChange={(date) => setForm({ ...form, startDate: date })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-700">
              Thời gian về
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <CustomTimePicker
                selected={form.endTime}
                onChange={(time) => setForm({ ...form, endTime: time })}
              />
              <CustomDatePicker
                selected={form.endDate}
                onChange={(date) => setForm({ ...form, endDate: date })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-700">
              Thời gian phê duyệt
            </Label>
            <CustomDatePicker
              selected={form.commandDate}
              onChange={(date) => setForm({ ...form, commandDate: date })}
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition text-xs flex items-center gap-1"
              disabled={isSubmitDisabled()}
            >
              <CircleCheckIcon className="w-4 h-4" />
              Phê duyệt
            </button>
          </div>
        </form>
      </CustomDialogContent>
    </Dialog>
  );
}
