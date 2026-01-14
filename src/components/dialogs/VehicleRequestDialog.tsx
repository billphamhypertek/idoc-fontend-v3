import { Button } from "@/components/ui/button";
import {
  CustomDialogContent,
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CustomDatePicker } from "@/components/ui/calendar";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useCreateVehicleUsagePlan,
  useGetAllOrganizations,
  useGetListLeaderById,
  useGetStartNodes,
  useGetVehicleDetail,
  useUpdateVehicleUsagePlan,
} from "@/hooks/data/vehicle.data";
import { toast } from "@/hooks/use-toast";
import useAuthStore from "@/stores/auth.store";
import {
  AlertCircle,
  Car,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  FileText,
  MapPin,
  Plus,
  Save,
  Users,
  Undo2,
  Paperclip,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { ToastUtils } from "@/utils/toast.utils";
import { formatDateYMD, parseDateStringYMD } from "@/utils/datetime.utils";

interface VehicleRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSubmit?: () => void;
  action: "add" | "update";
  parsedId?: number;
}

// Constants for common locations
const COMMON_LOCATIONS = [
  "51 Quan Nhân, Thanh Xuân, Hà Nội",
  "Khu CNC Hòa Lạc, Thạch Thất, Hà Nội",
  "Trung tâm Hội nghị Quốc gia, Mỹ Đình",
  "Sân bay Nội Bài",
  "Ga Hà Nội",
  "Bộ Quốc phòng",
  "Thành phố Hồ Chí Minh",
  "Thành phố Đà Nẵng",
  "Tỉnh Quảng Ninh",
  "Tỉnh Hải Phòng",
  "Tỉnh Nghệ An",
  "Cơ quan",
  "Hà Nội",
  "Trụ sở chính",
];

// Constants for vehicle types
const VEHICLE_TYPES = [
  { value: "4", label: "4 chỗ" },
  { value: "7", label: "7 chỗ" },
  { value: "16", label: "16 chỗ" },
  { value: "24", label: "24 chỗ" },
  { value: "29", label: "29 chỗ" },
  { value: "Cứu thương", label: "Cứu thương" },
];

const LEADER_VEHICLE_TYPE = {
  value: "Xe Lãnh Đạo Ban",
  label: "Xe Lãnh Đạo Ban",
};

// Constants for range options (genPlan)
const RANGE_OPTIONS = [
  { value: "false", label: "Nội thành Hà Nội" },
  { value: "true", label: "Ngoại thành Hà Nội" },
];

export function VehicleRequestDialog({
  isOpen,
  onOpenChange,
  onClose,
  action,
  parsedId,
  onSubmit,
}: VehicleRequestDialogProps) {
  const { data: vehicleDetail, isLoading } = useGetVehicleDetail(
    parsedId || 0,
    action === "update" && isOpen
  );
  const { user } = useAuthStore();
  const getCurrentDateTime = () => {
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];
    const currentHour = now.getHours().toString().padStart(2, "0");
    const currentMinute = now.getMinutes().toString().padStart(2, "0");
    const nextHour = ((now.getHours() + 1) % 24).toString().padStart(2, "0");

    return {
      currentDate,
      currentHour,
      currentMinute,
      nextHour,
    };
  };
  const { mutateAsync: createVehicleMutation } = useCreateVehicleUsagePlan();
  const { mutateAsync: updateVehicleMutation } = useUpdateVehicleUsagePlan();

  const { currentDate, currentHour, currentMinute, nextHour } =
    getCurrentDateTime();

  // Form data for vehicle request
  const [formData, setFormData] = useState({
    nextNode: -1, // Phiếu xin xe
    orgId: null as number | null, // Tên cơ quan, đơn vị
    reason: "", // Lý do sử dụng xe
    genPlan: false, // Phạm vi (false: Nội thành, true: Ngoại thành)
    expectedType: "", // Loại xe
    dateStart: currentDate, // Thời gian đi (date)
    timeStart: { hour: parseInt(currentHour), minute: parseInt(currentMinute) }, // Thời gian đi (time)
    dateEnd: currentDate, // Thời gian về (date)
    timeEnd: { hour: parseInt(nextHour), minute: parseInt(currentMinute) }, // Thời gian về (time)
    startLocation: "", // Điểm xuất phát
    pickUpLocation: "", // Địa điểm xe đón
    destination: "", // Địa điểm xe đến
    passengerQuantity: "", // Số người đi
    personEnter: "", // Người phụ trách chuyến đi công tác
    phone: "", // Số điện thoại
    participant: "", // Thành phần tham gia
    leadOrg: null as string | null, // Thủ trưởng đơn vị ký
    signer2: "", // Thủ trưởng văn phòng ký / Phòng CT-TC-HC
    creator: "", // Người dự trù
    createDate: currentDate, // Thời gian khởi tạo
    note: "", // Ghi chú
    document: { number: "", day: "", month: "", year: "" }, // Thông tư (conditional)
    circular: "", // Added to match Angular's vehicle.circular
  });

  const [locationSuggestions, setLocationSuggestions] = useState({
    startLocation: [] as string[],
    pickUpLocation: [] as string[],
    destination: [] as string[],
  });

  const [showSuggestions, setShowSuggestions] = useState({
    startLocation: false,
    pickUpLocation: false,
    destination: false,
  });

  // Form validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showValidation, setShowValidation] = useState(false);
  const [isValid, setIsValid] = useState({
    day: true,
    month: true,
    year: true,
  });
  const [orgIdDraft, setOrgIdDraft] = useState(user?.orgModel?.parentId);
  useEffect(() => {
    if (user && user.orgModel.isPermissionViewAll) {
      setIsUserAssigned(true);
    }
  }, [user]);
  // Dummy data for selects (replace with actual hooks/data)
  const { data: startNodes } = useGetStartNodes();
  const { data: organizations } = useGetAllOrganizations();
  const filteredOrganizations =
    organizations?.filter((org) => org.parentId === orgIdDraft) || [];
  const { data: TTDVOBJ } = useGetListLeaderById(
    user?.orgModel?.parentId || 0,
    isOpen
  );
  const { data: TTVPOBJ } = useGetListLeaderById(237, isOpen);
  const { data: ObjLDB } = useGetListLeaderById(2, isOpen);
  const listNextNode = startNodes || [];
  const createOrgList = filteredOrganizations || [];
  const [isUserAssigned, setIsUserAssigned] = useState(false); // Adjust based on user
  const [isCheckPhamVi, setIsCheckPhamVi] = useState(false); // Based on genPlan === true
  const [isCheckThongTu, setIsCheckThongTu] = useState(false); // Based on expectedType === "Xe Lãnh Đạo Ban"
  const [checkDepartment, setCheckDepartment] = useState(true);
  const [checkOrgVP, setCheckOrgVP] = useState(false);

  // Extract date info from circular (similar to Angular)
  const extractDateInfo = (circular: string | null | undefined) => {
    if (!circular || typeof circular !== "string") {
      return { number: "", day: "", month: "", year: "" };
    }

    const regex = /(.*)\sngày\s(\d+)\stháng\s(\d+)\snăm\s(\d+)/;
    const match = circular.match(regex);

    if (match) {
      return {
        number: match[1] || "",
        day: match[2] || "",
        month: match[3] || "",
        year: match[4] || "",
      };
    } else {
      return { number: "", day: "", month: "", year: "" };
    }
  };

  // Reset form when opening dialog with "add" action
  useEffect(() => {
    if (isOpen && action === "add") {
      const { currentDate, currentHour, currentMinute, nextHour } =
        getCurrentDateTime();
      setFormData({
        nextNode: -1,
        orgId: null,
        reason: "",
        genPlan: false,
        expectedType: "",
        dateStart: currentDate,
        timeStart: {
          hour: parseInt(currentHour),
          minute: parseInt(currentMinute),
        },
        dateEnd: currentDate,
        timeEnd: { hour: parseInt(nextHour), minute: parseInt(currentMinute) },
        startLocation: "",
        pickUpLocation: "",
        destination: "",
        passengerQuantity: "",
        personEnter: "",
        phone: "",
        participant: "",
        leadOrg: null,
        signer2: "",
        creator: "",
        createDate: currentDate,
        note: "",
        document: { number: "", day: "", month: "", year: "" },
        circular: "",
      });

      // Reset location suggestions
      setLocationSuggestions({
        startLocation: [],
        pickUpLocation: [],
        destination: [],
      });
    }
  }, [isOpen, action]);

  // Load data when editing (similar to doFillDataOldVehicle)
  useEffect(() => {
    if (vehicleDetail && action === "update") {
      const startDateConvert = new Date(vehicleDetail.expectedStartDate);
      const endDateConvert = new Date(vehicleDetail.expectedEndDate);
      const ticketDateConvert = new Date(vehicleDetail.ticketDate);

      const startDateStr = startDateConvert.toISOString().split("T")[0];
      const endDateStr = endDateConvert.toISOString().split("T")[0];
      const createDateStr = ticketDateConvert.toISOString().split("T")[0];

      const timeStart = {
        hour: startDateConvert.getHours(),
        minute: startDateConvert.getMinutes(),
      };
      const timeEnd = {
        hour: endDateConvert.getHours(),
        minute: endDateConvert.getMinutes(),
      };

      let document = { number: "", day: "", month: "", year: "" };
      let isCheckPhamViLocal = false;

      if (vehicleDetail.circular && vehicleDetail.circular.trim() !== "") {
        document = extractDateInfo(vehicleDetail.circular);
        isCheckPhamViLocal = true;
      }

      const isCheckThongTuLocal =
        vehicleDetail.expectedType === "Xe Lãnh Đạo Ban";

      setIsCheckThongTu(isCheckThongTuLocal);

      setFormData({
        nextNode: vehicleDetail.nodeId || -1,
        orgId: vehicleDetail.orgId || null,
        reason: vehicleDetail.reason || "",
        genPlan: Boolean(vehicleDetail.genPlan), // Handle as boolean
        expectedType: vehicleDetail.expectedType || "",
        dateStart: startDateStr,
        timeStart,
        dateEnd: endDateStr,
        timeEnd,
        startLocation: vehicleDetail.startLocation || "",
        pickUpLocation: vehicleDetail.pickUpLocation || "",
        destination: vehicleDetail.destination || "",
        passengerQuantity: vehicleDetail.passengerQuantity?.toString() || "",
        personEnter: vehicleDetail.personEnter || "",
        phone: vehicleDetail.phone || "",
        participant: vehicleDetail.participant || "",
        leadOrg: vehicleDetail.leadOrg || null,
        signer2: vehicleDetail.signer2 || "",
        creator: vehicleDetail.creator || "",
        createDate: createDateStr,
        note: vehicleDetail.note || "",
        document,
        circular: vehicleDetail.circular || "",
      });

      setIsCheckPhamVi(isCheckPhamViLocal || Boolean(vehicleDetail.genPlan));
      // Simulate changeDraftOrg
      const orgDraftSelected = listNextNode.find(
        (item) => item.id === vehicleDetail.nodeId
      );
      if (orgDraftSelected) {
        setOrgIdDraft(orgDraftSelected.orgId);
        if (orgDraftSelected.orgId === 2) {
          setCheckDepartment(true);
          setCheckOrgVP(vehicleDetail.orgId === 237);
        } else if (orgDraftSelected.orgId === 237) {
          setCheckDepartment(false);
          setCheckOrgVP(true);
        } else {
          setCheckDepartment(false);
          setCheckOrgVP(false);
        }
      }
    } else if (action === "add") {
      // Reset formData cho mode "add"
      const { currentDate, currentHour, currentMinute, nextHour } =
        getCurrentDateTime();
      setFormData({
        nextNode: -1,
        orgId: null,
        reason: "",
        genPlan: false,
        expectedType: "",
        dateStart: currentDate,
        timeStart: {
          hour: parseInt(currentHour),
          minute: parseInt(currentMinute),
        },
        dateEnd: currentDate,
        timeEnd: { hour: parseInt(nextHour), minute: parseInt(currentMinute) },
        startLocation: "",
        pickUpLocation: "",
        destination: "",
        passengerQuantity: "",
        personEnter: "",
        phone: "",
        participant: "",
        leadOrg: null,
        signer2: "",
        creator: "",
        createDate: currentDate,
        note: "",
        document: { number: "", day: "", month: "", year: "" },
        circular: "",
      });
      setOrgIdDraft(user?.orgModel?.parentId || null);
      setCheckDepartment(true);
      setCheckOrgVP(false);
    }
  }, [vehicleDetail, action, listNextNode]);

  // doloadThongTu logic when orgIdDraft changes (for add mode)
  useEffect(() => {
    if (action === "add") {
      const userOrgId = user?.org;
      const userParentOrgId = user?.orgModel?.parentId;
      let isCheckIdUser: number | null = null;

      if (userOrgId === 2 && orgIdDraft === 0) {
        isCheckIdUser = null;
      } else if (orgIdDraft === 2) {
        isCheckIdUser = userOrgId ?? null;
      } else if (orgIdDraft && orgIdDraft !== 2) {
        isCheckIdUser = orgIdDraft;
      }

      let doc = { number: "", day: "", month: "", year: "" };
      if (isCheckIdUser === 237) {
        doc = { number: "51/TT-BQP", day: "12", month: "6", year: "2014" };
      } else if (isCheckIdUser === 238) {
        doc = {
          number: "45/2014/TT-BQP",
          day: "12",
          month: "6",
          year: "2014",
        };
      } else if (isCheckIdUser === 248) {
        doc = {
          number: "52/2014/TT-BQP",
          day: "12",
          month: "6",
          year: "2014",
        };
      }

      setFormData((prev) => ({ ...prev, document: doc }));
    }
  }, [orgIdDraft, action, user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDocumentChange = (subField: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      document: { ...prev.document, [subField]: value },
    }));
    if (["day", "month", "year"].includes(subField)) {
      validateNumber(subField as "day" | "month" | "year");
    }
  };

  const handleLocationInputChange = (field: string, value: string) => {
    handleInputChange(field, value);

    if (value.length > 0) {
      const filtered = COMMON_LOCATIONS.filter((location) =>
        location.toLowerCase().includes(value.toLowerCase())
      );
      setLocationSuggestions((prev) => ({
        ...prev,
        [field]: filtered.slice(0, 5),
      }));
      setShowSuggestions((prev) => ({
        ...prev,
        [field]: filtered.length > 0,
      }));
    } else {
      setShowSuggestions((prev) => ({
        ...prev,
        [field]: false,
      }));
    }
  };

  const selectLocationSuggestion = (field: string, location: string) => {
    handleInputChange(field, location);
    setShowSuggestions((prev) => ({
      ...prev,
      [field]: false,
    }));
  };

  const validateNumber = (field: "day" | "month" | "year") => {
    const value = formData.document[field];
    setIsValid((prev) => ({
      ...prev,
      [field]: value === "" || /^\d+$/.test(value),
    }));
  };

  // Validation functions
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Required fields
    if (formData.nextNode === -1)
      errors.nextNode = "Vui lòng chọn phiếu xin xe";
    if (!formData.orgId) errors.orgId = "Vui lòng chọn cơ quan đơn vị";
    if (!formData.reason.trim())
      errors.reason = "Vui lòng nhập lý do sử dụng xe";
    if (formData.genPlan === null) errors.genPlan = "Vui lòng chọn phạm vi";
    if (!formData.expectedType) errors.expectedType = "Vui lòng chọn loại xe";
    if (!formData.dateStart) errors.dateStart = "Vui lòng chọn thời gian đi";
    if (!formData.dateEnd) errors.dateEnd = "Vui lòng chọn thời gian về";
    if (!formData.startLocation.trim())
      errors.startLocation = "Vui lòng nhập điểm xuất phát";
    if (!formData.pickUpLocation.trim())
      errors.pickUpLocation = "Vui lòng nhập địa điểm xe đón";
    if (!formData.destination.trim())
      errors.destination = "Vui lòng nhập địa điểm xe đến";
    if (!formData.passengerQuantity.trim())
      errors.passengerQuantity = "Vui lòng nhập số người đi";
    if (!formData.personEnter.trim())
      errors.personEnter = "Vui lòng nhập người phụ trách chuyến đi";
    if (!formData.phone.trim()) errors.phone = "Vui lòng nhập số điện thoại";
    else if (formData.phone.replace(/\s/g, "").length < 10) {
      errors.phone = "Số điện thoại phải có ít nhất 10 chữ số";
    }
    if (!formData.participant.trim())
      errors.participant = "Vui lòng nhập thành phần tham gia";
    if (!formData.leadOrg)
      errors.leadOrg = "Vui lòng chọn thủ trưởng đơn vị ký";
    if (!formData.creator.trim()) errors.creator = "Vui lòng nhập người dự trù";
    if (!formData.createDate)
      errors.createDate = "Vui lòng chọn thời gian khởi tạo";

    // Conditional for signer2
    if (orgIdDraft !== 237 && !checkDepartment && !formData.signer2.trim()) {
      errors.signer2 = "Vui lòng nhập phòng CT-TC-HC";
    }
    if (checkDepartment && !checkOrgVP && !formData.signer2) {
      errors.signer2 = "Vui lòng chọn thủ trưởng văn phòng ký";
    }

    // Conditional for document
    if (isCheckPhamVi && !isCheckThongTu) {
      if (!formData.document.number.trim())
        errors.documentNumber = "Vui lòng nhập số thông tư";
      if (!formData.document.day || !isValid.day)
        errors.documentDay = "Vui lòng nhập ngày hợp lệ";
      if (!formData.document.month || !isValid.month)
        errors.documentMonth = "Vui lòng nhập tháng hợp lệ";
      if (!formData.document.year || !isValid.year)
        errors.documentYear = "Vui lòng nhập năm hợp lệ";
    }

    setFieldErrors(errors);
    setShowValidation(true);
    return Object.keys(errors).length === 0;
  };

  const getFieldError = (fieldName: string): string => {
    return fieldErrors[fieldName] || "";
  };

  const hasFieldError = (fieldName: string): boolean => {
    return showValidation && !!fieldErrors[fieldName];
  };

  const scrollToTop = () => {
    const dialogContent = document.querySelector(
      '[role="dialog"] .overflow-y-auto'
    );
    if (dialogContent) {
      dialogContent.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Helper component for validation error display
  const ValidationError = ({ fieldName }: { fieldName: string }) => {
    if (!hasFieldError(fieldName)) return null;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center text-xs text-red-500 mt-1">
              <AlertCircle className="w-4 h-4 mr-1" />
              {getFieldError(fieldName)}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getFieldError(fieldName)}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const updatedFormData: any = { ...formData };
      if (isCheckPhamVi && !isCheckThongTu) {
        const { number, day, month, year } = formData.document;
        const trimmedNumber = number ? number.trim() : "";
        const trimmedDay = day ? day.trim() : "";
        const trimmedMonth = month ? month.trim() : "";
        const trimmedYear = year ? year.trim() : "";
        const isValidInput =
          trimmedNumber !== "" &&
          trimmedDay !== "" &&
          !isNaN(Number(trimmedDay)) &&
          trimmedMonth !== "" &&
          !isNaN(Number(trimmedMonth)) &&
          trimmedYear !== "" &&
          !isNaN(Number(trimmedYear));
        if (isValidInput) {
          updatedFormData.circular = `${trimmedNumber} ngày ${Number(
            trimmedDay
          )} tháng ${Number(trimmedMonth)} năm ${Number(trimmedYear)}`;
        } else {
          // Optional: handle invalid circular input
          return;
        }
      }

      // Compute dates similar to Angular
      const startHour = String(formData.timeStart.hour).padStart(2, "0");
      const startMinute = String(formData.timeStart.minute).padStart(2, "0");
      const endHour = String(formData.timeEnd.hour).padStart(2, "0");
      const endMinute = String(formData.timeEnd.minute).padStart(2, "0");

      updatedFormData.expectedStartDate = `${formData.dateStart}T${startHour}:${startMinute}:00`;
      updatedFormData.expectedEndDate = `${formData.dateEnd}T${endHour}:${endMinute}:00`;
      updatedFormData.ticketDate = formData.createDate;
      updatedFormData.planDate = formData.dateStart; // Set to dateStart similar to Angular logic

      // Remove any HTML from reason (though Textarea shouldn't have it)
      updatedFormData.reason = updatedFormData.reason
        .replace(/<p[^>]*>/g, "")
        .replace(/<\/p>/g, "");

      // Transform to match sample payload
      updatedFormData.genPlan = formData.genPlan ? "true" : "false";
      updatedFormData.handleType = orgIdDraft === 2 ? "DEPARTMENT" : "ORG";
      updatedFormData.signer = null;
      updatedFormData.commandSigner = null;

      const startParts = formData.dateStart.split("-");
      updatedFormData.dateStart = {
        year: parseInt(startParts[0]),
        month: parseInt(startParts[1]),
        day: parseInt(startParts[2]),
      };

      const endParts = formData.dateEnd.split("-");
      updatedFormData.dateEnd = {
        year: parseInt(endParts[0]),
        month: parseInt(endParts[1]),
        day: parseInt(endParts[2]),
      };

      const createParts = formData.createDate.split("-");
      updatedFormData.createDate = {
        year: parseInt(createParts[0]),
        month: parseInt(createParts[1]),
        day: parseInt(createParts[2]),
      };

      updatedFormData.dateTimePlan = updatedFormData.dateStart;

      updatedFormData.timeStart = { ...formData.timeStart, second: 0 };
      updatedFormData.timeEnd = { ...formData.timeEnd, second: 0 };

      delete updatedFormData.nextNode;
      delete updatedFormData.document;

      updatedFormData.nodeId = formData.nextNode;

      if (action === "add") {
        createVehicleMutation(updatedFormData, {
          onSuccess: () => {
            ToastUtils.success("Đã tạo phiếu xin xe thành công");
            // Reset form
            const { currentDate, currentHour, currentMinute, nextHour } =
              getCurrentDateTime();
            setFormData({
              nextNode: -1,
              orgId: null,
              reason: "",
              genPlan: false,
              expectedType: "",
              dateStart: currentDate,
              timeStart: {
                hour: parseInt(currentHour),
                minute: parseInt(currentMinute),
              },
              dateEnd: currentDate,
              timeEnd: {
                hour: parseInt(nextHour),
                minute: parseInt(currentMinute),
              },
              startLocation: "",
              pickUpLocation: "",
              destination: "",
              passengerQuantity: "",
              personEnter: "",
              phone: "",
              participant: "",
              leadOrg: null,
              signer2: "",
              creator: "",
              createDate: currentDate,
              note: "",
              document: { number: "", day: "", month: "", year: "" },
              circular: "",
            });
            setFieldErrors({});
            setShowValidation(false);
            setIsValid({ day: true, month: true, year: true });
            if (onSubmit) {
              onSubmit();
            }
            onClose();
          },
          onError: (error: any) => {
            console.error("Error creating vehicle request:", error);
            ToastUtils.error("Không thể tạo phiếu xin xe. Vui lòng thử lại.");
          },
        });
      } else if (action === "update" && parsedId) {
        updateVehicleMutation(
          { ...updatedFormData, id: parsedId },
          {
            onSuccess: () => {
              ToastUtils.success("Đã cập nhật phiếu xin xe thành công");
              if (onSubmit) {
                onSubmit();
              }
              onClose();
            },
            onError: (error: any) => {
              console.error("Error updating vehicle request:", error);
              ToastUtils.error(
                "Không thể cập nhật phiếu xin xe. Vui lòng thử lại."
              );
            },
          }
        );
      }
    } else {
      scrollToTop();
    }
  };

  const handleGoBack = () => {
    // setFormData({
    //   nextNode: -1,
    //   orgId: null,
    //   reason: "",
    //   genPlan: false,
    //   expectedType: "",
    //   dateStart: currentDate,
    //   timeStart: {
    //     hour: parseInt(currentHour),
    //     minute: parseInt(currentMinute),
    //   },
    //   dateEnd: currentDate,
    //   timeEnd: { hour: parseInt(nextHour), minute: parseInt(currentMinute) },
    //   startLocation: "",
    //   pickUpLocation: "",
    //   destination: "",
    //   passengerQuantity: "",
    //   personEnter: "",
    //   phone: "",
    //   participant: "",
    //   leadOrg: null,
    //   signer2: "",
    //   creator: "",
    //   createDate: currentDate,
    //   note: "",
    //   document: { number: "", day: "", month: "", year: "" },
    //   circular: "",
    // });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <CustomDialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-3 border-b border-gray-200 bg-white sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Car className="w-4 h-4 mr-2 text-blue-600" />
                {action === "add"
                  ? "Thêm mới đăng ký xin xe"
                  : "Cập nhật đăng ký xin xe"}
              </DialogTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                Hiển thị thông tin xin xe, lịch xin xe
              </p>
            </div>
            <div className="flex gap-1.5">
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-2 text-xs font-medium"
              >
                {action === "add" ? (
                  <Plus className="w-4 h-4 mr-1" />
                ) : (
                  <Save className="w-4 h-4 mr-1" />
                )}
                {action === "add" ? "Tạo mới" : "Cập nhật"}
              </Button>
              <Button
                variant="outline"
                onClick={handleGoBack}
                className="h-9 px-2 text-xs font-medium border-gray-300 hover:bg-gray-50"
              >
                <Undo2 className="w-4 h-4 mr-1" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-1.5 py-3 overflow-y-auto flex-1">
          {/* Thông tin xe */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <h3 className="text-xs font-semibold text-blue-600 mb-2 flex items-center">
              <Car className="w-4 h-4 mr-1.5" />
              Thông tin xe
            </h3>
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="nextNode"
                    className="text-xs font-medium text-gray-700"
                  >
                    Phiếu xin xe <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.nextNode.toString()}
                    onValueChange={(value) => {
                      const intValue = parseInt(value);
                      handleInputChange("nextNode", intValue);
                      const orgDraftSelected = listNextNode.find(
                        (item) => item.id === intValue
                      );
                      if (orgDraftSelected) {
                        setOrgIdDraft(orgDraftSelected.orgId);
                        if (orgDraftSelected.orgId === 2) {
                          setCheckDepartment(true);
                          setCheckOrgVP(formData.orgId === 237);
                        } else if (orgDraftSelected.orgId === 237) {
                          setCheckDepartment(false);
                          setCheckOrgVP(true);
                        } else {
                          setCheckDepartment(false);
                          setCheckOrgVP(false);
                        }
                      }
                    }}
                  >
                    <SelectTrigger
                      className={`h-9 text-xs ${hasFieldError("nextNode") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
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

                <div className="space-y-1.5">
                  <Label
                    htmlFor="orgId"
                    className="text-xs font-medium text-gray-700"
                  >
                    Tên cơ quan, đơn vị <span className="text-red-500">*</span>
                  </Label>
                  <SearchableSelect
                    options={createOrgList.map((item) => ({
                      value: item.id.toString(),
                      label: item.name,
                    }))}
                    value={formData.orgId?.toString() || ""}
                    onValueChange={(value) => {
                      const intValue = value ? parseInt(value) : NaN;
                      if (!isNaN(intValue)) {
                        handleInputChange("orgId", intValue);
                        if (checkDepartment) {
                          setCheckOrgVP(intValue === 237);
                        }
                      } else {
                        handleInputChange("orgId", null);
                      }
                    }}
                    placeholder="--- Chọn cơ quan đơn vị ---"
                    className={`h-9 w-full text-xs ${hasFieldError("orgId") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                    searchPlaceholder="Tìm cơ quan..."
                  />
                  <ValidationError fieldName="orgId" />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="genPlan"
                    className="text-xs font-medium text-gray-700"
                  >
                    Phạm vi <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.genPlan?.toString() || ""}
                    onValueChange={(value) => {
                      const boolValue = value === "true";
                      handleInputChange("genPlan", boolValue);
                      setIsCheckPhamVi(boolValue);
                    }}
                  >
                    <SelectTrigger
                      className={`h-9 text-xs ${hasFieldError("genPlan") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
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
                      {RANGE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ValidationError fieldName="genPlan" />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="expectedType"
                    className="text-xs font-medium text-gray-700"
                  >
                    Loại xe <span className="text-red-500">*</span>
                  </Label>
                  <SearchableSelect
                    options={[
                      ...VEHICLE_TYPES,
                      ...(isUserAssigned ? [LEADER_VEHICLE_TYPE] : []),
                    ]}
                    value={formData.expectedType}
                    onValueChange={(value) => {
                      handleInputChange("expectedType", value);
                      setIsCheckThongTu(value === LEADER_VEHICLE_TYPE.value);
                    }}
                    placeholder="-- Chọn loại xe --"
                    className={`h-9 w-full text-xs ${hasFieldError("expectedType") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                    searchPlaceholder="Tìm loại xe..."
                  />
                  <ValidationError fieldName="expectedType" />
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin chuyến đi */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <h3 className="text-xs font-semibold text-green-600 mb-2 flex items-center">
              <MapPin className="w-4 h-4 mr-1.5" />
              Thông tin chuyến đi
            </h3>
            <div className="space-y-1.5">
              {/* Lý do sử dụng */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="reason"
                  className="text-xs font-medium text-gray-700"
                >
                  Lý do sử dụng xe <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Nhập lý do sử dụng xe"
                  value={formData.reason}
                  onChange={(e) => handleInputChange("reason", e.target.value)}
                  className={`min-h-[60px] resize-none text-xs ${hasFieldError("reason") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                />
                <ValidationError fieldName="reason" />
              </div>

              {/* Thông tư (conditional) */}
              {isCheckPhamVi && !isCheckThongTu && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">
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
                        className={`h-9 text-xs ${hasFieldError("documentNumber") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                      />
                      <ValidationError fieldName="documentNumber" />
                    </div>
                    <div>
                      <Input
                        placeholder="Ngày"
                        value={formData.document.day}
                        onChange={(e) =>
                          handleDocumentChange("day", e.target.value)
                        }
                        className={`h-9 text-xs ${hasFieldError("documentDay") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
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
                        className={`h-9 text-xs ${hasFieldError("documentMonth") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
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
                        onChange={(e) =>
                          handleDocumentChange("year", e.target.value)
                        }
                        className={`h-9 text-xs ${hasFieldError("documentYear") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
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
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">
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
                    className={`h-9 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs w-full max-w-none ${hasFieldError("dateStart") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                    style={{
                      colorScheme: "light",
                      fontSize: "12px",
                      padding: "6px 8px",
                    }}
                  />
                  <ValidationError fieldName="dateStart" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">
                    Thời gian về (Dự kiến){" "}
                    <span className="text-red-500">*</span>
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
                    className={`h-9 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs w-full max-w-none ${hasFieldError("dateEnd") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                    style={{
                      colorScheme: "light",
                      fontSize: "12px",
                      padding: "6px 8px",
                    }}
                  />
                  <ValidationError fieldName="dateEnd" />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="passengerQuantity"
                    className="text-xs font-medium text-gray-700"
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
                      className={`h-9 text-xs pr-8 text-left [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${hasFieldError("passengerQuantity") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                      style={{ MozAppearance: "textfield" }}
                    />
                    <div className="absolute right-1 top-0 h-full flex flex-col w-6">
                      <button
                        type="button"
                        onClick={() => {
                          const current =
                            parseInt(formData.passengerQuantity) || 0;
                          if (current < 50) {
                            handleInputChange(
                              "passengerQuantity",
                              (current + 1).toString()
                            );
                          }
                        }}
                        className="flex-1 px-1 hover:bg-gray-100 rounded-t text-gray-500 hover:text-gray-700 text-xs leading-none flex items-center justify-center border-b border-gray-200"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const current =
                            parseInt(formData.passengerQuantity) || 0;
                          if (current > 1) {
                            handleInputChange(
                              "passengerQuantity",
                              (current - 1).toString()
                            );
                          }
                        }}
                        className="flex-1 px-1 hover:bg-gray-100 rounded-b text-gray-500 hover:text-gray-700 text-xs leading-none flex items-center justify-center"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <ValidationError fieldName="passengerQuantity" />
                </div>
              </div>

              {/* Địa điểm */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5 relative">
                  <Label
                    htmlFor="startLocation"
                    className="text-xs font-medium text-gray-700"
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
                        const filtered = COMMON_LOCATIONS.filter((location) =>
                          location
                            .toLowerCase()
                            .includes(formData.startLocation.toLowerCase())
                        );
                        if (filtered.length > 0) {
                          setLocationSuggestions((prev) => ({
                            ...prev,
                            startLocation: filtered.slice(0, 5),
                          }));
                          setShowSuggestions((prev) => ({
                            ...prev,
                            startLocation: true,
                          }));
                        }
                      }
                    }}
                    onBlur={() => {
                      setTimeout(
                        () =>
                          setShowSuggestions((prev) => ({
                            ...prev,
                            startLocation: false,
                          })),
                        200
                      );
                    }}
                    className={`h-9 ${hasFieldError("startLocation") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                  />
                  {showSuggestions.startLocation &&
                    locationSuggestions.startLocation.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {locationSuggestions.startLocation.map(
                          (location, index) => (
                            <div
                              key={index}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                              onClick={() =>
                                selectLocationSuggestion(
                                  "startLocation",
                                  location
                                )
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

                <div className="space-y-1.5 relative">
                  <Label
                    htmlFor="pickUpLocation"
                    className="text-xs font-medium text-gray-700"
                  >
                    Địa điểm xe đón <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pickUpLocation"
                    placeholder="Nhập địa điểm xe đón"
                    value={formData.pickUpLocation}
                    onChange={(e) =>
                      handleLocationInputChange(
                        "pickUpLocation",
                        e.target.value
                      )
                    }
                    onFocus={() => {
                      if (formData.pickUpLocation.length > 0) {
                        const filtered = COMMON_LOCATIONS.filter((location) =>
                          location
                            .toLowerCase()
                            .includes(formData.pickUpLocation.toLowerCase())
                        );
                        if (filtered.length > 0) {
                          setLocationSuggestions((prev) => ({
                            ...prev,
                            pickUpLocation: filtered.slice(0, 5),
                          }));
                          setShowSuggestions((prev) => ({
                            ...prev,
                            pickUpLocation: true,
                          }));
                        }
                      }
                    }}
                    onBlur={() => {
                      setTimeout(
                        () =>
                          setShowSuggestions((prev) => ({
                            ...prev,
                            pickUpLocation: false,
                          })),
                        200
                      );
                    }}
                    className={`h-9 ${hasFieldError("pickUpLocation") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                  />
                  {showSuggestions.pickUpLocation &&
                    locationSuggestions.pickUpLocation.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {locationSuggestions.pickUpLocation.map(
                          (location, index) => (
                            <div
                              key={index}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                              onClick={() =>
                                selectLocationSuggestion(
                                  "pickUpLocation",
                                  location
                                )
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

                <div className="space-y-1.5 relative">
                  <Label
                    htmlFor="destination"
                    className="text-xs font-medium text-gray-700"
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
                    onFocus={() => {
                      if (formData.destination.length > 0) {
                        const filtered = COMMON_LOCATIONS.filter((location) =>
                          location
                            .toLowerCase()
                            .includes(formData.destination.toLowerCase())
                        );
                        if (filtered.length > 0) {
                          setLocationSuggestions((prev) => ({
                            ...prev,
                            destination: filtered.slice(0, 5),
                          }));
                          setShowSuggestions((prev) => ({
                            ...prev,
                            destination: true,
                          }));
                        }
                      }
                    }}
                    onBlur={() => {
                      setTimeout(
                        () =>
                          setShowSuggestions((prev) => ({
                            ...prev,
                            destination: false,
                          })),
                        200
                      );
                    }}
                    className={`h-9 ${hasFieldError("destination") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                  />
                  {showSuggestions.destination &&
                    locationSuggestions.destination.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {locationSuggestions.destination.map(
                          (location, index) => (
                            <div
                              key={index}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                              onClick={() =>
                                selectLocationSuggestion(
                                  "destination",
                                  location
                                )
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

          {/* Thông tin phụ trách */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <h3 className="text-xs font-semibold text-orange-600 mb-2 flex items-center">
              <Users className="w-4 h-4 mr-1.5" />
              Thông tin phụ trách
            </h3>
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="personEnter"
                    className="text-xs font-medium text-gray-700"
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
                        {ObjLDB?.map((item: any, index: number) => (
                          <SelectItem key={index} value={item.fullName}>
                            {item.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <ValidationError fieldName="personEnter" />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="phone"
                    className="text-xs font-medium text-gray-700"
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
                          value = digits
                            .replace(/(\d{4})(\d{0,3})/, "$1 $2")
                            .trim();
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

              <div className="space-y-1.5">
                <Label
                  htmlFor="participant"
                  className="text-xs font-medium text-gray-700"
                >
                  Thành phần tham gia <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="participant"
                  placeholder="Nhập thành phần tham gia"
                  value={formData.participant}
                  onChange={(e) =>
                    handleInputChange("participant", e.target.value)
                  }
                  className={`h-9 ${hasFieldError("participant") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                />
                <ValidationError fieldName="participant" />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="leadOrg"
                  className="text-xs font-medium text-gray-700"
                >
                  Thủ trưởng đơn vị ký <span className="text-red-500">*</span>
                </Label>
                <SearchableSelect
                  options={(TTDVOBJ || []).map((item: any) => ({
                    value: item.fullName,
                    label: item.fullName,
                  }))}
                  value={formData.leadOrg || ""}
                  onValueChange={(value) => {
                    handleInputChange("leadOrg", value);
                  }}
                  placeholder="--- Chọn thủ trưởng đơn vị ký ---"
                  className={`h-9 w-full ${hasFieldError("leadOrg") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                  searchPlaceholder="Tìm thủ trưởng..."
                />
                <ValidationError fieldName="leadOrg" />
              </div>

              {checkDepartment && !checkOrgVP && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="signer2"
                    className="text-xs font-medium text-gray-700"
                  >
                    Thủ trưởng văn phòng ký{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <SearchableSelect
                    options={(TTVPOBJ || []).map((item: any) => ({
                      value: item.fullName,
                      label: item.fullName,
                    }))}
                    value={formData.signer2}
                    onValueChange={(value) => {
                      handleInputChange("signer2", value);
                    }}
                    placeholder="--- Chọn thủ trưởng văn phòng ký ---"
                    className={`h-9 w-full ${hasFieldError("signer2") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                    searchPlaceholder="Tìm thủ trưởng VP..."
                  />
                  <ValidationError fieldName="signer2" />
                </div>
              )}

              {orgIdDraft !== 237 && !checkDepartment && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="signer2"
                    className="text-xs font-medium text-gray-700"
                  >
                    Phòng CT-TC-HC <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="signer2"
                    placeholder="Nhập phòng CT-TC-HC"
                    value={formData.signer2}
                    onChange={(e) =>
                      handleInputChange("signer2", e.target.value)
                    }
                    className={`h-9 ${hasFieldError("signer2") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                  />
                  <ValidationError fieldName="signer2" />
                </div>
              )}
            </div>
          </div>

          {/* Thông tin khác */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <h3 className="text-xs font-semibold text-gray-600 mb-2 flex items-center">
              <Paperclip className="w-4 h-4 mr-1.5 text-blue-600" />
              Thông tin khác
            </h3>
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="creator"
                    className="text-xs font-medium text-gray-700"
                  >
                    Người dự trù <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="creator"
                    placeholder="Nhập người dự trù"
                    value={formData.creator}
                    onChange={(e) =>
                      handleInputChange("creator", e.target.value)
                    }
                    className={`h-9 ${hasFieldError("creator") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                  />
                  <ValidationError fieldName="creator" />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="createDate"
                    className="text-xs font-medium text-gray-700"
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
                      handleInputChange("createDate", formatDateYMD(date))
                    }
                    className={`h-9 ${hasFieldError("createDate") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                    placeholder="dd/mm/yyyy"
                  />
                  <ValidationError fieldName="createDate" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="note"
                  className="text-xs font-medium text-gray-700"
                >
                  Ghi chú
                </Label>
                <Textarea
                  id="note"
                  placeholder="Nhập ghi chú"
                  value={formData.note}
                  onChange={(e) => handleInputChange("note", e.target.value)}
                  className="min-h-[60px] resize-none text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
