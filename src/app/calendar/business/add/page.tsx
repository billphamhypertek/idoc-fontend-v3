"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useAddAttachmentAction,
  useAddAttachmentMeetingAction,
  useCreateCalendarMutation,
} from "@/hooks/data/calendar.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table } from "@/components/ui/table";
import TextEditor from "@/components/common/TextEditor";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import {
  CalendarIcon,
  Plus,
  Save,
  Trash2,
  Upload,
  Download,
  X,
  Check,
  Undo2,
  KeyRound,
  FileCheck,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import WorkAttachment from "../selection-modal/work-attachment";
import DocAttachment from "../selection-modal/doc-attachment";
import { CalendarService } from "@/services/calendar.service";
import { ToastUtils } from "@/utils/toast.utils";
import { CERT_OBJ_TYPE } from "@/definitions/enums/document.enum";
import {
  validFileSSize,
  isExistFile,
  getAssetIcon,
  handleError,
  isVerifierPDF,
} from "@/utils/common.utils";
import { Constant } from "@/definitions/constants/constant";
import { ATTACHMENT_DOWNLOAD_TYPE } from "@/definitions/constants/common.constant";
import { downloadFile } from "@/utils/file.utils";
import { uploadFileService, verifierPDF } from "@/services/file.service";
import { OBJ_TYPE } from "@/definitions/enums/document.enum";
import { EncryptionService } from "@/services/encryption.service";
import { getDefaultFormValues } from "@/utils/formValue.utils";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { toast } from "@/hooks/use-toast";

export default function AddWorkSchedulePage() {
  const ENCRYPTION_TWD = Constant.ENCRYPTION_TWD;
  const router = useRouter();
  const searchParams = useSearchParams();
  const now = new Date();

  // Lấy ngày từ URL params nếu có và kết hợp với giờ phút hiện tại
  const dateFromUrl = searchParams?.get("date");
  const selectedDateFromUrl = dateFromUrl
    ? (() => {
        const [year, month, day] = dateFromUrl.split("-").map(Number);
        const now = new Date();
        return new Date(
          year,
          month - 1,
          day,
          now.getHours(),
          now.getMinutes(),
          now.getSeconds()
        );
      })()
    : null;

  // Bật shouldFocusError để focus vào ô có lỗi khi submit
  const form = useForm({
    defaultValues: getDefaultFormValues(selectedDateFromUrl || now),
    mode: "onSubmit",
    shouldFocusError: true,
  });

  const [isDocumentAttachmentModal, setIsDocumentAttachmentModal] =
    useState(false);
  const [isWorkAttachmentModal, setIsWorkAttachmentModal] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<any[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<any[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);
  const [docToDelete, setDocToDelete] = useState<any>(null);
  const [isFromModal, setIsFromModal] = useState(false);
  const [registerWithBan, setRegisterWithBan] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validFiles, setValidFiles] = useState(true);
  const [participantInput, setParticipantInput] = useState("");
  const [guestInput, setGuestInput] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState<any[]>([]);
  const [lastSelectedGuest, setLastSelectedGuest] = useState<any>(null);
  const [lastSelectionTime, setLastSelectionTime] = useState<number>(0);

  const [orgInput, setOrgInput] = useState("");
  const [orgSearchResults, setOrgSearchResults] = useState<any[]>([]);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [selectedOrgs, setSelectedOrgs] = useState<any[]>([]);

  const [groupInput, setGroupInput] = useState("");
  const [groupSearchResults, setGroupSearchResults] = useState<any[]>([]);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<any[]>([]);
  const [uIds, setUIds] = useState<number[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAndAdding, setIsSavingAndAdding] = useState(false);

  const tabFromUrl = searchParams?.get("tab");
  const currentTab = tabFromUrl === "room" ? 1 : 2; // 1: lịch ban, 2: lịch đơn vị
  const isCabinet = searchParams?.get("isCabinet") === "true";
  const orgType = currentTab === 1 ? 1 : 2;

  const selectedDocsColumns = [
    {
      header: "STT",
      className: "w-[50px] text-center border-r",
      accessor: (item: any, index: number) => (
        <span className="text-sm">{index + 1}</span>
      ),
    },
    // {
    //   header: "Số ký hiệu",
    //   className: "text-center border-r",
    //   accessor: (item: any) => (
    //     <span className="text-sm">{item.numberOrSign || "-"}</span>
    //   ),
    // },
    {
      header: "Trích yếu",
      className: "text-center border-r",
      accessor: (item: any) => (
        <span className="text-sm">{item.preview || "-"}</span>
      ),
    },
    {
      header: "Loại văn bản",
      className: "text-center border-r",
      accessor: (item: any) => (
        <span className="text-sm">{item.docTypeName || "-"}</span>
      ),
    },
    {
      header: "Xóa",
      className: "w-[50px] text-center",
      accessor: (item: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteDoc(item)}
          className="text-red-600 hover:text-red-800 p-0 h-auto"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const selectedTasksColumns = [
    {
      header: "STT",
      className: "w-[50px] text-center border-r",
      accessor: (item: any, index: number) => (
        <span className="text-sm">{index + 1}</span>
      ),
    },
    {
      header: "Tên công việc",
      className: "text-center border-r",
      accessor: (item: any) => <span className="text-sm">{item.taskName}</span>,
    },
    {
      header: "Mô tả",
      className: "text-center border-r",
      accessor: (item: any) => (
        <span className="text-sm">{item.description || "-"}</span>
      ),
    },
    {
      header: "Xóa",
      className: "w-[50px] text-center",
      accessor: (item: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteTask(item)}
          className="text-red-600 hover:text-red-800 p-0 h-auto"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const participantsGuestList = useMemo(() => {
    const value = form.watch("participantsGuest");
    return value?.split(";").filter((p: string) => p.trim()) || [];
  }, [form.watch("participantsGuest")]);

  const participantsList = useMemo(() => {
    const value = form.watch("participants");
    return value?.split(",").filter((p: string) => p.trim()) || [];
  }, [form.watch("participants")]);

  const filteredSearchResults = useMemo(() => {
    const currentGuests = (form.watch("participants") as string) || "";
    const guestsArray = currentGuests
      ? currentGuests.split(",").filter((g: string) => g.trim())
      : [];
    return searchResults.filter((user) => !guestsArray.includes(user.fullName));
  }, [searchResults, form.watch("participants")]);

  const filteredOrgSearchResults = useMemo(() => {
    return orgSearchResults.filter(
      (org) =>
        !selectedOrgs.find((selected) => selected.fullName === org.fullName)
    );
  }, [orgSearchResults, selectedOrgs]);

  const filteredGroupSearchResults = useMemo(() => {
    return groupSearchResults.filter(
      (group) =>
        !selectedGroups.find((selected) => selected.fullName === group.fullName)
    );
  }, [groupSearchResults, selectedGroups]);

  const validateStartEndOrderInline = () => {
    const data = form.getValues();
    if (!data?.startDate || !data?.endDate) return;

    const s = new Date(data.startDate);
    s.setHours(
      parseInt(data.startHour || "0"),
      parseInt(data.startMinute || "0")
    );

    const e = new Date(data.endDate);
    e.setHours(parseInt(data.endHour || "0"), parseInt(data.endMinute || "0"));

    if (s >= e) {
      form.setError("startDate", {
        type: "manual",
        message: "Thời gian bắt đầu phải trước thời gian kết thúc",
      });
      form.setError("endDate", {
        type: "manual",
        message: "Thời gian kết thúc phải sau thời gian bắt đầu",
      });
    } else {
      form.clearErrors("startDate");
      form.clearErrors("endDate");
    }
  };

  const validateForm = (data: any) => {
    const errors: string[] = [];

    const startDateTime = new Date(data.startDate);
    startDateTime.setHours(
      parseInt(data.startHour),
      parseInt(data.startMinute)
    );

    const endDateTime = new Date(data.endDate);
    endDateTime.setHours(parseInt(data.endHour), parseInt(data.endMinute));

    if (startDateTime >= endDateTime) {
      errors.push("Thời gian kết thúc phải sau thời gian bắt đầu");
    }

    return errors;
  };

  const createPayload = (data: any) => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    const startTime = `${startDate.getFullYear()}-${(startDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${startDate
      .getDate()
      .toString()
      .padStart(2, "0")}T${data.startHour}:${data.startMinute}`;
    const endTime = `${endDate.getFullYear()}-${(endDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${endDate
      .getDate()
      .toString()
      .padStart(2, "0")}T${data.endHour}:${data.endMinute}`;

    const dInList = selectedDocs
      ?.filter((item: any) => item.docTypeName === "Văn bản đến")
      .map((doc) => ({ docInId: doc.docId }));
    const dOutList = selectedDocs
      ?.filter((item: any) => item.docTypeName === "Văn bản đi")
      .map((doc) => ({ docOutId: doc.docId }));
    const taskList = selectedTasks.map((task) => ({
      ...task,
      isNew: true,
    }));

    return {
      dInList,
      dOutList,
      taskRelateds: [],
      taskList,
      participantsOrg: data.participantsOrg || [],
      participantsGroup: data.participantsGroup || [],
      title: data.content || "",
      schedureType: "0",
      description: data.content || "",
      endTime,
      timeEnd: {
        hour: parseInt(data.endHour),
        minute: parseInt(data.endMinute),
      },
      dateEnd: {
        year: endDate.getFullYear(),
        month: endDate.getMonth() + 1,
        day: endDate.getDate(),
      },
      startTime,
      timeStart: {
        hour: parseInt(data.startHour),
        minute: parseInt(data.startMinute),
      },
      dateStart: {
        year: startDate.getFullYear(),
        month: startDate.getMonth() + 1,
        day: startDate.getDate(),
      },
      roomName: data.location || "",
      categoryName: "",
      address: data.location || "",
      note: data.notes || "",
      participants: data.participants || "",
      participantsGuest: data.participantsGuest || "",
      registerBan: registerWithBan,
    };
  };

  const resetForm = () => {
    const now = new Date();
    form.reset(getDefaultFormValues(selectedDateFromUrl || now));

    setSelectedTasks([]);
    setSelectedDocs([]);
    setSelectedGuests([]);
    setSelectedOrgs([]);
    setSelectedGroups([]);
    setParticipantInput("");
    setGuestInput("");
    setOrgInput("");
    setGroupInput("");
  };

  const { mutateAsync: saveCalendar } = useCreateCalendarMutation();

  const { mutateAsync: addAttachmentMeeting } = useAddAttachmentMeetingAction();

  const { mutateAsync: addAttachment } = useAddAttachmentAction();

  const handleSave = async (isAddNew: boolean = false) => {
    const data = form.getValues();

    let missing = false;
    // Kiểm tra nội dung có thực sự trống không (loại bỏ tất cả HTML tags)
    const isContentEmpty =
      !data.content || data.content.replace(/<[^>]*>/g, "").trim() === "";

    if (isContentEmpty) {
      form.setError("content", {
        type: "manual",
        message: "Nội dung không được để trống",
      });
      missing = true;
    }
    if (!data.startDate) {
      form.setError("startDate", {
        type: "manual",
        message: "Vui lòng chọn ngày bắt đầu",
      });
      missing = true;
    }
    if (!data.endDate) {
      form.setError("endDate", {
        type: "manual",
        message: "Vui lòng chọn ngày kết thúc",
      });
      missing = true;
    }

    if (missing) {
      ToastUtils.error("Bạn chưa nhập đủ thông tin bắt buộc");
      return;
    }

    const validationErrors = validateForm(data);
    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => {
        ToastUtils.error(error);
      });
      form.setError("endDate", {
        type: "manual",
        message: "Thời gian kết thúc phải sau thời gian bắt đầu",
      });
      form.setError("startDate", {
        type: "manual",
        message: "Thời gian bắt đầu phải trước thời gian kết thúc",
      });
      return;
    }

    if (isAddNew) {
      setIsSavingAndAdding(true);
    } else {
      setIsSaving(true);
    }

    try {
      const result = await saveCalendar({
        orgType,
        payload: createPayload(data),
      });

      if (result && result.success) {
        const calId = result.data?.id;

        if (selectedFiles && selectedFiles.length > 0) {
          const attachmentResult = await doAddAttachments(
            calId,
            1,
            selectedFiles
          );
          if (attachmentResult === false) {
            ToastUtils.lichDaDuocTaoNhungCoLoiKhiXuLyTepDinhKem();
            return;
          }
        }

        ToastUtils.taoLichThanhCong();

        if (isAddNew) {
          resetForm();
          setSelectedFiles([]);
          setValidFiles(true);
        } else {
          const tabParam = tabFromUrl ? `?tab=${tabFromUrl}` : "";
          router.push(`/calendar/business${tabParam}`);
        }
      } else {
        ToastUtils.error("Tạo lịch thất bại");
      }
    } catch (error) {
      handleError(error);
    } finally {
      if (isAddNew) {
        setIsSavingAndAdding(false);
      } else {
        setIsSaving(false);
      }
    }
  };

  const handleSaveAndAddNew = () => handleSave(true);

  const onSubmit = (data: any) => {
    handleSave(false);
  };

  const handleBack = () => {
    router.back();
  };

  const handleFileAttach = () => {
    const fileInput = document.getElementById(
      "file-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !validFileSSize(event.target.files)) {
      setValidFiles(false);
      event.target.value = "";
      ToastUtils.error("File size must be less than 300MB");
      return;
    }

    setValidFiles(true);

    if (selectedFiles.length === 0) {
      setSelectedFiles(Array.from(event.target.files || []));
    } else {
      const newFiles = Array.from(event.target.files || []);
      const uniqueFiles = newFiles.filter(
        (file) => !isExistFile(file.name, selectedFiles)
      );
      setSelectedFiles((prev) => [...prev, ...uniqueFiles]);
    }

    event.target.value = "";
  };

  const handleDeleteTask = (task: any) => {
    setTaskToDelete(task);
    setDocToDelete(null);
    setIsFromModal(false);
    setShowDeleteConfirm(true);
  };

  const handleDeleteDoc = (doc: any) => {
    setDocToDelete(doc);
    setTaskToDelete(null);
    setIsFromModal(false);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = (type: "task" | "doc") => {
    const itemToDelete = type === "task" ? taskToDelete : docToDelete;

    if (itemToDelete) {
      if (type === "task") {
        setSelectedTasks((prev) =>
          prev.filter((t) => {
            return (
              t.taskId !== itemToDelete.taskId &&
              t.taskId !== itemToDelete.id &&
              t.id !== itemToDelete.id
            );
          })
        );
        setTaskToDelete(null);
      } else {
        setSelectedDocs((prev) =>
          prev.filter((d) => {
            return (
              d.docId !== itemToDelete.docId &&
              d.docId !== itemToDelete.id &&
              d.id !== itemToDelete.id
            );
          })
        );
        setDocToDelete(null);
      }

      setShowDeleteConfirm(false);
      setIsFromModal(false);
    }
  };

  const confirmDeleteTask = () => confirmDelete("task");
  const confirmDeleteDoc = () => confirmDelete("doc");

  const adjustTime = (
    value: string,
    fieldName: string,
    type: "hour" | "minute",
    action: "increment" | "decrement"
  ) => {
    const numValue = parseInt(value) || 0;
    const max = type === "hour" ? 24 : 60;
    let newValue: number;

    switch (action) {
      case "increment":
        newValue = (numValue + 1) % max;
        break;
      case "decrement":
        if (type === "hour") {
          newValue = numValue === 0 ? 23 : numValue - 1;
        } else {
          newValue = numValue < 1 ? 59 : numValue - 1;
        }
        break;
      default:
        newValue = numValue;
    }

    form.setValue(fieldName as any, newValue.toString().padStart(2, "0"));
    validateStartEndOrderInline();
  };

  const incrementHour = (hour: string, fieldName: string) =>
    adjustTime(hour, fieldName, "hour", "increment");
  const decrementHour = (hour: string, fieldName: string) =>
    adjustTime(hour, fieldName, "hour", "decrement");
  const incrementMinute = (minute: string, fieldName: string) =>
    adjustTime(minute, fieldName, "minute", "increment");
  const decrementMinute = (minute: string, fieldName: string) =>
    adjustTime(minute, fieldName, "minute", "decrement");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const addParticipant = () => {
    const trimmedInput = participantInput.trim();
    if (trimmedInput) {
      const currentParticipants =
        (form.getValues("participantsGuest") as string) || "";
      const participantsArray = currentParticipants
        ? currentParticipants.split(";").filter((p: string) => p.trim())
        : [];
      if (!participantsArray.includes(trimmedInput)) {
        const newParticipants = [...participantsArray, trimmedInput].join(";");
        form.setValue("participantsGuest", newParticipants);
      }
      setParticipantInput("");
    }
  };

  const removeParticipant = (index: number) => {
    const currentParticipants =
      (form.getValues("participantsGuest") as string) || "";
    const participantsArray = currentParticipants
      ? currentParticipants.split(";").filter((p: string) => p.trim())
      : [];
    const newParticipants = participantsArray
      .filter((_: string, i: number) => i !== index)
      .join(";");
    form.setValue("participantsGuest", newParticipants);
  };

  const handleParticipantKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addParticipant();
    } else if (
      (e.key === "Backspace" || e.key === "Delete") &&
      participantInput === ""
    ) {
      const currentParticipants =
        (form.getValues("participantsGuest") as string) || "";
      const participantsArray = currentParticipants
        ? currentParticipants.split(";").filter((p: string) => p.trim())
        : [];
      if (participantsArray.length > 0) {
        removeParticipant(participantsArray.length - 1);
      }
    }
  };

  const handleParticipantBlur = () => {
    addParticipant();
  };
  function debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  const searchUsers = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    try {
      const results = await CalendarService.searchFullName(query);
      setSearchResults(results || []);
      setShowDropdown(true);
    } catch (error) {
      ToastUtils.error("Tìm kiếm người dùng thất bại");
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const debouncedSearch = debounce(searchUsers, 300);

  const searchOrganizations = async (query: string) => {
    if (query.trim().length < 2) {
      setOrgSearchResults([]);
      setShowOrgDropdown(false);
      return;
    }

    try {
      const results = await CalendarService.searchOrgByName(query);
      setOrgSearchResults(results || []);
      setShowOrgDropdown(true);
    } catch (error) {
      ToastUtils.error("Tìm kiếm tổ chức thất bại");
      setOrgSearchResults([]);
      setShowOrgDropdown(false);
    }
  };

  const searchGroups = async (query: string) => {
    if (query.trim().length < 2) {
      setGroupSearchResults([]);
      setShowGroupDropdown(false);
      return;
    }

    try {
      const results = await CalendarService.searchGroupByName(query);
      setGroupSearchResults(results || []);
      setShowGroupDropdown(true);
    } catch (error) {
      ToastUtils.error("Tìm kiếm nhóm thất bại");
      setGroupSearchResults([]);
      setShowGroupDropdown(false);
    }
  };

  const debouncedOrgSearch = debounce(searchOrganizations, 300);
  const debouncedGroupSearch = debounce(searchGroups, 300);

  const handleGuestInputChange = (value: string) => {
    setGuestInput(value);
    debouncedSearch(value);
  };

  const handleOrgInputChange = (value: string) => {
    setOrgInput(value);
    debouncedOrgSearch(value);
  };

  const handleGroupInputChange = (value: string) => {
    setGroupInput(value);
    debouncedGroupSearch(value);
  };

  const handleGuestSelection = (user: any) => {
    const now = Date.now();
    const isSameGuest =
      lastSelectedGuest &&
      (lastSelectedGuest.id === user.id ||
        lastSelectedGuest.fullName === user.fullName);
    const isRecentSelection = now - lastSelectionTime < 300;

    if (isSameGuest && isRecentSelection) {
      return;
    }

    setLastSelectedGuest(user);
    setLastSelectionTime(now);
    selectGuest(user);
  };

  const selectGuest = (user: any) => {
    const currentGuests = (form.getValues("participants") as string) || "";
    const guestsArray = currentGuests
      ? currentGuests.split(",").filter((g: string) => g.trim())
      : [];

    if (!guestsArray.includes(user.fullName)) {
      const newGuests = [...guestsArray, user.fullName].join(",");
      form.setValue("participants", newGuests);
    }

    setGuestInput("");
  };

  // Remove selected guest
  const removeGuest = (guestName: string) => {
    const currentGuests = (form.getValues("participants") as string) || "";
    const guestsArray = currentGuests
      ? currentGuests.split(",").filter((g: string) => g.trim())
      : [];
    const newGuests = guestsArray
      .filter((g: string) => g !== guestName)
      .join(",");
    form.setValue("participants", newGuests);
  };

  const handleGuestKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchResults.length > 0) {
        handleGuestSelection(searchResults[0]);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setSearchResults([]);
    }
  };

  // Close dropdown and clear search
  const closeDropdown = () => {
    setShowDropdown(false);
    setSearchResults([]);
    setGuestInput("");
  };

  // Close organization dropdown
  const closeOrgDropdown = () => {
    setShowOrgDropdown(false);
    setOrgSearchResults([]);
    setOrgInput("");
  };

  // Close group dropdown
  const closeGroupDropdown = () => {
    setShowGroupDropdown(false);
    setGroupSearchResults([]);
    setGroupInput("");
  };

  // Select organization
  const selectOrganization = (org: any) => {
    const newOrg = {
      id: org.id || org.orgId || `org-${Date.now()}`,
      fullName: org.fullName || org.orgName || "Unknown Organization",
    };

    setSelectedOrgs((prevOrgs) => {
      const existingOrg = prevOrgs.find((o) => o.fullName === newOrg.fullName);

      if (!existingOrg) {
        const newOrgs = [...prevOrgs, newOrg];
        form.setValue("participantsOrg", newOrgs);
        return newOrgs;
      } else {
        return prevOrgs;
      }
    });

    setOrgInput("");
  };

  // Select group
  const selectGroup = (group: any) => {
    const newGroup = {
      id: group.id || group.groupId || `group-${Date.now()}`,
      fullName: group.fullName || group.groupName || "Unknown Group",
    };

    setSelectedGroups((prevGroups) => {
      const existingGroup = prevGroups.find(
        (g) => g.fullName === newGroup.fullName
      );

      if (!existingGroup) {
        const newGroups = [...prevGroups, newGroup];
        form.setValue("participantsGroup", newGroups);
        return newGroups;
      } else {
        return prevGroups;
      }
    });

    setGroupInput("");
  };

  // Remove organization
  const removeOrganization = (orgName: string) => {
    setSelectedOrgs((prevOrgs) => {
      const newOrgs = prevOrgs.filter((org) => org.fullName !== orgName);
      form.setValue("participantsOrg", newOrgs);
      return newOrgs;
    });
  };

  // Remove group
  const removeGroup = (groupName: string) => {
    setSelectedGroups((prevGroups) => {
      const newGroups = prevGroups.filter(
        (group) => group.fullName !== groupName
      );
      form.setValue("participantsGroup", newGroups);
      return newGroups;
    });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      form.setValue("startDate", date);
      form.clearErrors("startDate");
      validateStartEndOrderInline();
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      form.setValue("endDate", date);
      form.clearErrors("endDate"); // ✅ clear lỗi inline khi đã chọn
      // ✅ THÊM: kiểm tra ngay khi đổi ngày
      validateStartEndOrderInline();
    }
  };

  const downloadAttachment = async (file: any) => {
    if (isCabinet) {
      await CalendarService.fileMeetingDownload(file.name);
    } else {
      await downloadFile(
        file.name,
        ATTACHMENT_DOWNLOAD_TYPE.CALENDAR,
        file.encrypt,
        null,
        null
      );
    }
  };

  const changeEncrypt = (file: any) => {
    if (!(file.id && file.oEncrypt)) {
      file.encrypt = !file.encrypt;
      setSelectedFiles([...selectedFiles]);
    }
  };

  const setSharedFileData = (taskId: number, main: number[] = []) => {
    const data = {
      objId: taskId,
      comment: "",
      userIds: main || [],
      userIdShared: [],
      allFileNames: [],
      attType: CERT_OBJ_TYPE.calendar,
      cmtType: "calendar",
      objType: CERT_OBJ_TYPE.calendar,
      userOrobj: CERT_OBJ_TYPE.user,
    };
    return data;
  };

  const extractUserIds = async () => {
    const userIds: number[] = [];

    selectedGuests.forEach((guest) => {
      if (guest.id || guest.userId) {
        userIds.push(guest.id || guest.userId);
      }
    });

    selectedOrgs.forEach((org) => {
      if (org.id && typeof org.id === "number") {
        userIds.push(org.id);
      }
    });

    selectedGroups.forEach((group) => {
      if (group.id && typeof group.id === "number") {
        userIds.push(group.id);
      }
    });

    const participants = (form.getValues("participants") as string) || "";
    if (participants) {
      participants.split(",").forEach((participant: string) => {
        const userId = parseInt(participant.trim());
        if (!isNaN(userId)) {
          userIds.push(userId);
        }
      });
    }

    setUIds(userIds);
    return userIds;
  };

  const doAddAttachments = async (calId: number, type: any, files: File[]) => {
    const encryptArr = await uploadFileService.filterFile(
      files,
      "encrypt",
      OBJ_TYPE.LICH
    );
    const nonEncryptArr = await uploadFileService.filterFile(
      files,
      "",
      OBJ_TYPE.LICH
    );

    if (encryptArr.length > 0) {
      const rs = await EncryptionService.doEncryptExecute(
        encryptArr as File[],
        calId,
        "TAO_LICH"
      );
      if (!rs) {
        return false;
      }

      const extractedUIds = await extractUserIds();

      if (extractedUIds && extractedUIds.length === 0) {
        ToastUtils.warning(
          "Lịch không có thành viên tham gia trong hệ thống, không chia sẻ tệp đính kèm"
        );
      }
    }

    const extractedUIds = await extractUserIds();

    if (calId && extractedUIds && extractedUIds.length > 0) {
      const dataFile = setSharedFileData(calId, extractedUIds);
      const rs1 = await uploadFileService.doSharePermissionDocFile(dataFile);
      if (rs1 === false) {
        return false;
      }
    }

    if (isCabinet) {
      await addAttachmentMeeting({ id: calId, files });
    } else if (nonEncryptArr.length > 0) {
      await addAttachment({
        id: calId,
        type,
        files: nonEncryptArr as File[],
        week: 0,
        year: new Date().getFullYear(),
      });
    }

    setUIds([]);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200 px-3 py-3">
        <BreadcrumbNavigation
          items={[
            { href: "/calendar", label: "Lịch" },
            { href: "/calendar/business", label: "Đăng ký lịch" },
          ]}
          currentPage="Thông tin lịch làm việc"
          showHome={false}
          className="ml-3"
        />
      </div>

      {/* Header */}
      <div className="bg-gray-200 border-b border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-gray-900">
                Thêm mới lịch làm việc
              </h1>
              <p className="text-sm text-gray-600">
                Hiển thị thông tin lịch làm việc, lịch công tác của cá nhân
              </p>
            </div>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 px-10 py-6"
        >
          <FormField
            control={form.control}
            name="content"
            rules={{ required: "Nội dung không được để trống" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-bold text-gray-700 mb-2">
                  Nội dung <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <TextEditor
                    value={field.value}
                    onChange={(val: string) => {
                      field.onChange(val);
                      // Kiểm tra nội dung có thực sự có giá trị không (loại bỏ tất cả HTML tags)
                      const hasRealContent =
                        val && val.replace(/<[^>]*>/g, "").trim() !== "";

                      if (hasRealContent) {
                        form.clearErrors("content");
                      }
                    }}
                    placeholder="Nhập nội dung..."
                    height="250px"
                    toolbar="full"
                  />
                </FormControl>
                {/* 🔴 Dòng chữ đỏ khi để trống */}
                <FormMessage className="text-xs text-red-600 mt-1" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="participantsGuest"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel className="block text-sm font-bold text-gray-700 mb-2 mt-2">
                  Thành phần
                </FormLabel>
                <FormControl>
                  <div className="w-full">
                    <div className="flex flex-wrap gap-2 mb-2 min-h-[32px] p-1 border border-input rounded-md bg-background">
                      {participantsGuestList.map(
                        (participant: string, index: number) => (
                          <div
                            key={index}
                            className={`flex items-center gap-1 bg-blue-100 text-blue-800 text-sm rounded-full overflow-hidden ${
                              participant.length > 50 ? "px-12 py-6" : "p-2"
                            }`}
                          >
                            <span className="break-all [word-break:break-word]">
                              {participant}
                            </span>
                            <X
                              className="h-4 w-4 flex-shrink-0 cursor-pointer"
                              onClick={() => removeParticipant(index)}
                            />
                          </div>
                        )
                      )}
                      <Input
                        type="text"
                        value={participantInput}
                        onChange={(e) => setParticipantInput(e.target.value)}
                        onKeyDown={handleParticipantKeyDown}
                        onBlur={handleParticipantBlur}
                        placeholder="Nhập tên thành phần"
                        className="flex-1 min-w-[150px] outline-none bg-transparent text-xs border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedFiles.length > 0 && (
            <>
              <FormField
                control={form.control}
                name="participants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-bold text-gray-700 mb-2">
                      Cá nhân nhận tệp
                    </FormLabel>
                    <FormControl>
                      <div className="w-full relative guest-dropdown-container">
                        <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-2 border border-input rounded-md bg-background">
                          {participantsList.map(
                            (guest: string, index: number) => (
                              <div
                                key={index}
                                className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800"
                              >
                                <span>{guest}</span>

                                <X
                                  className="h-4 w-4"
                                  onClick={() => removeGuest(guest)}
                                />
                              </div>
                            )
                          )}
                          <Input
                            type="text"
                            value={guestInput}
                            onChange={(e) =>
                              handleGuestInputChange(e.target.value)
                            }
                            onKeyDown={handleGuestKeyDown}
                            onFocus={() => {
                              if (searchResults.length > 0) {
                                setShowDropdown(true);
                              }
                            }}
                            onBlur={() => {
                              setTimeout(() => {
                                if (
                                  !document.activeElement?.closest(
                                    ".guest-dropdown-container"
                                  )
                                ) {
                                  closeDropdown();
                                }
                              }, 150);
                            }}
                            placeholder="Nhập tên người nhận tệp"
                            className="flex-1 min-w-[200px] outline-none bg-transparent text-sm border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </div>

                        {showDropdown && searchResults.length > 0 && (
                          <div
                            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                            style={{ top: "100%" }}
                          >
                            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 bg-gray-50">
                              <span className="text-xs font-bold text-gray-600">
                                Kết quả tìm kiếm
                              </span>

                              <X className="h-4 w-4" onClick={closeDropdown} />
                            </div>
                            {filteredSearchResults.map((user, index) => (
                              <div
                                key={user.id || user.userId || index}
                                onClick={() => handleGuestSelection(user)}
                                onMouseDown={() => handleGuestSelection(user)}
                                onTouchEnd={(e) => {
                                  e.preventDefault();
                                  handleGuestSelection(user);
                                }}
                                className="px-4 py-3 hover:bg-blue-50 hover:border-blue-200 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 w-full transition-colors duration-150 select-none"
                              >
                                <div className="text-sm font-bold text-gray-900">
                                  {user.fullName}
                                </div>
                                {user.email && (
                                  <div className="text-xs text-gray-500">
                                    {user.email}
                                  </div>
                                )}
                                {user.orgName && (
                                  <div className="text-xs text-gray-500">
                                    {user.orgName}
                                  </div>
                                )}
                              </div>
                            ))}
                            {filteredSearchResults.length === 0 &&
                              searchResults.length > 0 && (
                                <div className="px-4 py-2 text-sm text-gray-500 text-center">
                                  Tất cả kết quả đã được chọn
                                </div>
                              )}
                            {searchResults.length === 0 && (
                              <div className="px-4 py-2 text-sm text-gray-500 text-center">
                                Không có kết quả tìm kiếm
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="participantsOrg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-bold text-gray-700 mb-2">
                      Đơn vị nhận tệp
                    </FormLabel>
                    <FormControl>
                      <div className="w-full relative org-dropdown-container">
                        <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-2 border border-input rounded-md bg-background">
                          {selectedOrgs.map((org, index) => (
                            <div
                              key={org.id || index}
                              className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800"
                            >
                              <span>{org.fullName}</span>

                              <X
                                className="h-4 w-4"
                                onClick={() => removeOrganization(org.fullName)}
                              />
                            </div>
                          ))}
                          <Input
                            type="text"
                            value={orgInput}
                            onChange={(e) =>
                              handleOrgInputChange(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (orgSearchResults.length > 0) {
                                  selectOrganization(orgSearchResults[0]);
                                }
                              } else if (e.key === "Escape") {
                                closeOrgDropdown();
                              }
                            }}
                            onFocus={() => {
                              if (orgSearchResults.length > 0) {
                                setShowOrgDropdown(true);
                              }
                            }}
                            onBlur={() => {
                              setTimeout(() => {
                                if (
                                  !document.activeElement?.closest(
                                    ".org-dropdown-container"
                                  )
                                ) {
                                  closeOrgDropdown();
                                }
                              }, 150);
                            }}
                            placeholder="Nhập tên đơn vị"
                            className="flex-1 min-w-[200px] outline-none bg-transparent text-sm border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </div>

                        {showOrgDropdown && orgSearchResults.length > 0 && (
                          <div
                            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                            style={{ top: "100%" }}
                          >
                            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 bg-gray-50">
                              <span className="text-xs font-bold text-gray-600">
                                Kết quả tìm kiếm
                              </span>
                              <X
                                className="h-4 w-4"
                                onClick={closeOrgDropdown}
                              />
                            </div>
                            {filteredOrgSearchResults.map((org, index) => (
                              <div
                                key={org.id || index}
                                onClick={() => selectOrganization(org)}
                                onMouseDown={() => selectOrganization(org)}
                                onTouchEnd={(e) => {
                                  e.preventDefault();
                                  selectOrganization(org);
                                }}
                                className="px-4 py-3 hover:bg-blue-50 hover:border-blue-200 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 w-full transition-colors	duration-150 select-none"
                              >
                                <div className="text-sm font-bold text-gray-900">
                                  {org.fullName || org.orgName}
                                </div>
                                {org.code && (
                                  <div className="text-xs text-gray-500">
                                    Mã: {org.code}
                                  </div>
                                )}
                                {org.description && (
                                  <div className="text-xs text-gray-500">
                                    {org.description}
                                  </div>
                                )}
                              </div>
                            ))}
                            {filteredOrgSearchResults.length === 0 &&
                              orgSearchResults.length > 0 && (
                                <div className="px-4 py-2 text-sm text-gray-500 text-center">
                                  Tất cả kết quả đã được chọn
                                </div>
                              )}
                            {orgSearchResults.length === 0 && (
                              <div className="px-4 py-2 text-sm text-gray-500 text-center">
                                Không có kết quả tìm kiếm
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="participantsGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-bold text-gray-700 mb-2">
                      Nhóm nhận tệp
                    </FormLabel>
                    <FormControl>
                      <div className="w-full relative group-dropdown-container">
                        <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-2 border border-input rounded-md bg-background">
                          {selectedGroups.map((group, index) => (
                            <div
                              key={group.id || index}
                              className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800"
                            >
                              <span>{group.fullName}</span>
                              <X
                                className="h-4 w-4"
                                onClick={() => removeGroup(group.fullName)}
                              />
                            </div>
                          ))}
                          <Input
                            type="text"
                            value={groupInput}
                            onChange={(e) =>
                              handleGroupInputChange(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (groupSearchResults.length > 0) {
                                  selectGroup(groupSearchResults[0]);
                                }
                              } else if (e.key === "Escape") {
                                closeGroupDropdown();
                              }
                            }}
                            onFocus={() => {
                              if (groupSearchResults.length > 0) {
                                setShowGroupDropdown(true);
                              }
                            }}
                            onBlur={() => {
                              setTimeout(() => {
                                if (
                                  !document.activeElement?.closest(
                                    ".group-dropdown-container"
                                  )
                                ) {
                                  closeGroupDropdown();
                                }
                              }, 150);
                            }}
                            placeholder="Nhập tên nhóm"
                            className="flex-1 min-w-[200px] outline-none bg-transparent text-sm border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </div>

                        {/* Dropdown with search results */}
                        {showGroupDropdown && groupSearchResults.length > 0 && (
                          <div
                            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                            style={{ top: "100%" }}
                          >
                            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 bg-gray-50">
                              <span className="text-xs font-bold text-gray-600">
                                Kết quả tìm kiếm
                              </span>
                              <X
                                className="h-4 w-4"
                                onClick={closeGroupDropdown}
                              />
                            </div>
                            {filteredGroupSearchResults.map((group, index) => (
                              <div
                                key={group.id || index}
                                onClick={() => selectGroup(group)}
                                onMouseDown={() => selectGroup(group)}
                                onTouchEnd={(e) => {
                                  e.preventDefault();
                                  selectGroup(group);
                                }}
                                className="px-4 py-3 hover:bg-blue-50 hover:border-blue-200 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 w-full transition-colors duration-150 select-none"
                              >
                                <div className="text-sm font-bold text-gray-900">
                                  {group.fullName || group.groupName}
                                </div>
                                {group.code && (
                                  <div className="text-xs text-gray-500">
                                    Mã: {group.code}
                                  </div>
                                )}
                                {group.description && (
                                  <div className="text-xs text-gray-500">
                                    {group.description}
                                  </div>
                                )}
                              </div>
                            ))}
                            {filteredGroupSearchResults.length === 0 &&
                              groupSearchResults.length > 0 && (
                                <div className="px-4 py-2 text-sm text-gray-500 text-center">
                                  Tất cả kết quả đã được chọn
                                </div>
                              )}
                            {groupSearchResults.length === 0 && (
                              <div className="px-4 py-2 text-sm text-gray-500 text-center">
                                Không có kết quả tìm kiếm
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <div>
            <Label
              className="block text-sm font-bold text-blue-600 mb-2 cursor-pointer hover:underline transition-all duration-200"
              onClick={() => setIsDocumentAttachmentModal(true)}
            >
              Lựa chọn văn bản đính kèm
            </Label>
            <div className="border rounded-md overflow-hidden">
              <Table
                dataSource={selectedDocs}
                columns={selectedDocsColumns}
                emptyText="Không có dữ liệu"
                showPagination={false}
                // className="task-monitor-table"
              />
            </div>
          </div>

          <div>
            <Label
              className="block text-sm font-bold text-blue-600 mb-2 cursor-pointer hover:underline transition-all duration-200"
              onClick={() => setIsWorkAttachmentModal(true)}
            >
              Lựa chọn công việc đính kèm
            </Label>
            <div className="border rounded-md overflow-hidden">
              <Table
                dataSource={selectedTasks}
                columns={selectedTasksColumns}
                emptyText="Không có dữ liệu"
                showPagination={false}
                // className="task-monitor-table"
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-bold text-gray-700 mb-2">
                  Địa điểm
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Địa điểm"
                    className="w-full"
                    onKeyDown={handleKeyDown}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-bold text-gray-700 mb-2">
                  Ghi chú
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Ghi chú"
                    rows={3}
                    className="flex h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    onKeyDown={handleKeyDown}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="startDate"
              rules={{ required: "Vui lòng chọn ngày bắt đầu" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-bold text-gray-700 mb-2">
                    Bắt đầu <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="flex items-center space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[180px] justify-start text-left font-bold",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Chọn ngày</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={handleStartDateChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {/* Time Input with separate hour and minute */}
                    <div className="flex items-center space-x-1">
                      {/* Hour Input */}
                      <FormField
                        control={form.control}
                        name="startHour"
                        render={({ field }) => (
                          <div className="flex flex-col">
                            <Button
                              type="button"
                              onClick={() =>
                                incrementHour(field.value, "startHour")
                              }
                              className="flex items-center justify-center p-1 hover:bg-white bg-white border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-black"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 15l7-7 7 7"
                                />
                              </svg>
                            </Button>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                className="w-12 text-center focus-visible:ring-0 focus-visible:ring-offset-0 p-1"
                                placeholder="HH"
                                maxLength={2}
                                onKeyDown={handleKeyDown}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              onClick={() =>
                                decrementHour(field.value, "startHour")
                              }
                              className="flex items-center justify-center p-1 hover:bg-white bg-white border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-black"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </Button>
                          </div>
                        )}
                      />
                      <span className="text-gray-500">:</span>
                      {/* Minute Input */}
                      <FormField
                        control={form.control}
                        name="startMinute"
                        render={({ field }) => (
                          <div className="flex flex-col">
                            <Button
                              type="button"
                              onClick={() =>
                                incrementMinute(field.value, "startMinute")
                              }
                              className="flex items-center justify-center p-1 hover:bg-white bg-white border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-black"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 15l7-7 7 7"
                                />
                              </svg>
                            </Button>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                className="w-12 text-center focus-visible:ring-0 focus-visible:ring-offset-0 p-1"
                                placeholder="MM"
                                maxLength={2}
                                onKeyDown={handleKeyDown}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              onClick={() =>
                                decrementMinute(field.value, "startMinute")
                              }
                              className="flex items-center justify-center p-1 hover:bg-white bg-white border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-black"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </Button>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                  <FormMessage className="text-xs text-red-600 mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              rules={{ required: "Vui lòng chọn ngày kết thúc" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-bold text-gray-700 mb-2">
                    Kết thúc <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="flex items-center space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[180px] justify-start text-left font-bold",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Chọn ngày</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={handleEndDateChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {/* Time Input with separate hour and minute */}
                    <div className="flex items-center space-x-1">
                      {/* Hour Input */}
                      <FormField
                        control={form.control}
                        name="endHour"
                        render={({ field }) => (
                          <div className="flex flex-col">
                            <Button
                              type="button"
                              onClick={() =>
                                incrementHour(field.value, "endHour")
                              }
                              className="flex items-center justify-center p-1 hover:bg-white bg-white border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-black"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 15l7-7 7 7"
                                />
                              </svg>
                            </Button>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                className="w-12 text-center focus-visible:ring-0 focus-visible:ring-offset-0 p-1"
                                placeholder="HH"
                                maxLength={2}
                                onKeyDown={handleKeyDown}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              onClick={() =>
                                decrementHour(field.value, "endHour")
                              }
                              className="flex items-center justify-center p-1 hover:bg-white bg-white border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-black"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </Button>
                          </div>
                        )}
                      />
                      <span className="text-gray-500">:</span>
                      {/* Minute Input */}
                      <FormField
                        control={form.control}
                        name="endMinute"
                        render={({ field }) => (
                          <div className="flex flex-col">
                            <Button
                              type="button"
                              onClick={() =>
                                incrementMinute(field.value, "endMinute")
                              }
                              className="flex items-center justify-center p-1 hover:bg-white bg-white border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-black"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 15l7-7 7 7"
                                />
                              </svg>
                            </Button>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                className="w-12 text-center focus-visible:ring-0 focus-visible:ring-offset-0 p-1"
                                placeholder="MM"
                                maxLength={2}
                                onKeyDown={handleKeyDown}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              onClick={() =>
                                decrementMinute(field.value, "endMinute")
                              }
                              className="flex items-center justify-center p-1 hover:bg-white bg-white border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-black"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </Button>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                  <FormMessage className="text-xs text-red-600 mt-1" />
                </FormItem>
              )}
            />
          </div>

          {currentTab === 2 && (
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="registerWithBan"
                  checked={registerWithBan}
                  onCheckedChange={(checked) => setRegisterWithBan(!!checked)}
                />
                <Label
                  htmlFor="registerWithBan"
                  className="text-sm font-bold text-gray-700"
                >
                  Đăng ký lịch với ban
                </Label>
              </div>
            </div>
          )}

          <div>
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                onClick={handleFileAttach}
                className="h-9 w-fit bg-blue-600 hover:bg-blue-700 text-white hover:text-white"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#3a7bc8")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#4798e8")
                }
              >
                <Upload className="w-4 h-4 mr-2" />
                Văn bản đính kèm
              </Button>
              <span className="text-xs text-red-500">
                Dung lượng file phải nhỏ hơn 300MB
              </span>
            </div>
            <Input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
              multiple
            />
            {!validFiles && (
              <p className="text-xs text-red-500 mt-1">
                Dung lượng file phải nhỏ hơn 300MB.
              </p>
            )}

            {/* Hiển thị danh sách files đã chọn */}
            {selectedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-bold text-gray-700">
                  Files đã chọn ({selectedFiles.length}):
                </p>
                <div className="space-y-1">
                  {selectedFiles.map((file: any, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                    >
                      <div className="flex items-center space-x-2">
                        <img
                          src={getAssetIcon(file.name)}
                          alt={file.name}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-900">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            changeEncrypt(file);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1 h-6 w-6"
                          title="Mã hóa tệp tin"
                        >
                          {file.encrypt ? (
                            <KeyRound className="h-4 w-4 text-red-500" />
                          ) : (
                            <KeyRound className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                        {ENCRYPTION_TWD && (
                          <Input
                            type="checkbox"
                            name="checked"
                            checked={file.encrypt || false}
                            onChange={(e) => {
                              e.preventDefault();
                              changeEncrypt(file);
                            }}
                            disabled={file.id && file.oEncrypt}
                            className="hidden"
                          />
                        )}
                        {isVerifierPDF(file) && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              verifierPDF(
                                file.name,
                                "",
                                ATTACHMENT_DOWNLOAD_TYPE.CALENDAR
                              )
                            }
                            className="text-purple-600 hover:text-purple-800 p-1 h-6 w-6"
                            title="Xác thực ký số"
                          >
                            <FileCheck className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            downloadAttachment(file);
                          }}
                          className="text-green-600 hover:text-green-800 p-1 h-6 w-6"
                          title="Tải xuống"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            const newFiles = selectedFiles.filter(
                              (_, i) => i !== index
                            );
                            setSelectedFiles(newFiles);
                          }}
                          className="text-red-600 hover:text-red-800 p-1 h-6 w-6"
                          title="Xóa file"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit buttons inside form */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              onClick={handleSaveAndAddNew}
              disabled={isSavingAndAdding || isLoading}
              className="text-white disabled:opacity-50 h-9 bg-blue-600 hover:bg-blue-700 hover:text-white"
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#3a7bc8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#4798e8")
              }
            >
              {isSavingAndAdding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" /> Lưu và thêm mới
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isSaving || isLoading}
              className="text-white disabled:opacity-50 h-9 bg-blue-600 hover:bg-blue-700 hover:text-white"
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#3a7bc8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#4798e8")
              }
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Lưu lại
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {isDocumentAttachmentModal && (
        <DocAttachment
          open={isDocumentAttachmentModal}
          onOpenChange={setIsDocumentAttachmentModal}
          selectedDocs={selectedDocs}
          onDocSelect={(doc) => {
            setSelectedDocs((prev) => [...prev, doc]);
          }}
          onDocDeselect={(doc) => {
            setDocToDelete(doc);
            setIsFromModal(true);
            setShowDeleteConfirm(true);
          }}
        />
      )}
      {isWorkAttachmentModal && (
        <WorkAttachment
          open={isWorkAttachmentModal}
          onOpenChange={setIsWorkAttachmentModal}
          selectedTasks={selectedTasks}
          onTaskSelect={(task) => {
            setSelectedTasks((prev) => [...prev, task]);
          }}
          onTaskDeselect={(task) => {
            setTaskToDelete(task);
            setIsFromModal(true);
            setShowDeleteConfirm(true);
          }}
        />
      )}

      <ConfirmDeleteDialog
        isOpen={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={taskToDelete ? confirmDeleteTask : confirmDeleteDoc}
        title="Hãy xác nhận"
        description={
          taskToDelete
            ? "Bạn muốn xóa công việc liên quan?"
            : "Bạn muốn xóa văn bản liên quan?"
        }
        confirmText="Đồng ý"
        cancelText="Đóng"
      />
    </div>
  );
}
