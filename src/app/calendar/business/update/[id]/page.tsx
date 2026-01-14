"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useAddAttachmentAction,
  useAddAttachmentMeetingAction,
  useUpdateCalendarMutation,
  useDeleteAttachmentAction,
  useDeleteAttachmentMeetingAction,
} from "@/hooks/data/calendar.actions";
import { useGetCalendarBusinessById } from "@/hooks/data/calendar.data";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table } from "@/components/ui/table";
import TextEditor from "@/components/common/TextEditor";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { CalendarService } from "@/services/calendar.service";
import { uploadFileService, verifierPDF } from "@/services/file.service";
import { downloadFile } from "@/utils/file.utils";
import { ATTACHMENT_DOWNLOAD_TYPE } from "@/definitions/constants/common.constant";
import { ToastUtils } from "@/utils/toast.utils";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  Save,
  Upload,
  Download,
  X,
  Check,
  Trash2,
  Undo2,
  KeyRound,
  FileCheck,
} from "lucide-react";
import WorkAttachment from "../../selection-modal/work-attachment";
import DocAttachment from "../../selection-modal/doc-attachment";
import { Checkbox } from "@/components/ui/checkbox";
import { getDefaultFormValues } from "@/utils/formValue.utils";
import { getAssetIcon, handleError, isVerifierPDF } from "@/utils/common.utils";
import { EncryptionService } from "@/services/encryption.service";
import { CERT_OBJ_TYPE, OBJ_TYPE } from "@/definitions/enums/document.enum";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";

export default function UpdateWorkSchedulePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const now = new Date();

  const currentTab = searchParams?.get("tab") || "room";
  const isCabinet = searchParams?.get("isCabinet") === "true";
  const orgType = currentTab === "room" ? 1 : 2;

  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAndAdding, setIsSavingAndAdding] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [validFiles, setValidFiles] = useState(true);

  const ENCRYPTION_TWD = true;

  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    file: File;
  } | null>(null);

  const [selectedTasks, setSelectedTasks] = useState<any[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<any[]>([]);
  const [selectedGuests, setSelectedGuests] = useState<any[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<any[]>([]);
  const [selectedParticipantsOrg, setSelectedParticipantsOrg] = useState<any[]>(
    []
  );
  const [selectedGroups, setSelectedGroups] = useState<any[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);
  const [docToDelete, setDocToDelete] = useState<any>(null);
  const [fileToDelete, setFileToDelete] = useState<any>(null);
  const [isFromModal, setIsFromModal] = useState(false);
  const [participantInput, setParticipantInput] = useState("");
  const [guestInput, setGuestInput] = useState("");
  const [orgInput, setOrgInput] = useState("");
  const [groupInput, setGroupInput] = useState("");
  const [uIds, setUIds] = useState<any[]>([]);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [orgSearchResults, setOrgSearchResults] = useState<any[]>([]);
  const [groupSearchResults, setGroupSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [registerWithBan, setRegisterWithBan] = useState(false);

  const form = useForm({
    defaultValues: getDefaultFormValues(now),
  });

  const participantsGuestList = useMemo(() => {
    const value = form.watch("participantsGuest");
    return value?.split(";").filter((p: string) => p.trim()) || [];
  }, [form.watch("participantsGuest")]);

  const filteredSearchResults = useMemo(() => {
    return searchResults.filter(
      (user) =>
        !selectedParticipants.find(
          (participant) => participant.name === user.fullName
        )
    );
  }, [searchResults, selectedParticipants]);

  const filteredOrgSearchResults = useMemo(() => {
    return orgSearchResults.filter(
      (org) => !selectedParticipantsOrg.find((o) => o.fullName === org.fullName)
    );
  }, [orgSearchResults, selectedParticipantsOrg]);

  const filteredGroupSearchResults = useMemo(() => {
    return groupSearchResults.filter(
      (group) => !selectedGroups.find((g) => g.fullName === group.fullName)
    );
  }, [groupSearchResults, selectedGroups]);

  // Columns for selectedDocs table
  const selectedDocsColumns = [
    {
      header: "STT",
      className: "w-[50px] text-center border-r",
      accessor: (item: any, index: number) => (
        <span className="text-sm">{index + 1}</span>
      ),
    },
    {
      header: "Trích yếu",
      className: "text-center border-r",
      accessor: (item: any) => (
        <span className="text-sm">
          {item.docTypeName === "VAN_BAN_DEN"
            ? item.docInName
            : item.docOutName || item.preview || "-"}
        </span>
      ),
    },
    {
      header: "Loại văn bản",
      className: "text-center border-r",
      accessor: (item: any) => (
        <span className="text-sm">
          {item.docTypeName && item.docTypeName === "VAN_BAN_DEN"
            ? "Văn bản đến"
            : "Văn bản đi"}
        </span>
      ),
    },
    {
      header: "Xóa",
      className: "w-[50px] text-center",
      accessor: (item: any) => (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDeleteDoc(item);
          }}
          className="text-red-600 hover:text-red-800 p-0 h-auto"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  // Columns for selectedTasks table
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
      accessor: (item: any) => (
        <span className="text-sm">
          {item.taskName || item.name || item.title || "-"}
        </span>
      ),
    },
    {
      header: "Mô tả",
      className: "text-center border-r",
      accessor: (item: any) => (
        <span className="text-sm">
          {item.description || item.content || "-"}
        </span>
      ),
    },
    {
      header: "Xóa",
      className: "w-[50px] text-center",
      accessor: (item: any) => (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDeleteTask(item);
          }}
          className="text-red-600 hover:text-red-800 p-0 h-auto"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const {
    data: calendarData,
    isLoading: isCalendarLoading,
    error: calendarError,
  } = useGetCalendarBusinessById(parseInt(params.id));

  useEffect(() => {
    if (calendarData) {
      const startDateTime = calendarData.startTime
        ? new Date(calendarData.startTime)
        : now;
      const endDateTime = calendarData.endTime
        ? new Date(calendarData.endTime)
        : new Date(now.getTime() + 60 * 60 * 1000);

      form.reset({
        content: calendarData.description || "",
        participants: calendarData.participants || "",
        location: calendarData.roomName || calendarData.address || "",
        notes: calendarData.note || "",
        startDate: startDateTime,
        startHour: startDateTime.getHours().toString().padStart(2, "0"),
        startMinute: startDateTime.getMinutes().toString().padStart(2, "0"),
        endDate: endDateTime,
        endHour: endDateTime.getHours().toString().padStart(2, "0"),
        endMinute: endDateTime.getMinutes().toString().padStart(2, "0"),
        participantsGuest: calendarData.participantsGuest || "",
        participantsOrg: calendarData.participantsOrg || [],
        participantsGroup: calendarData.participantsGroup || [],
        registerBan: calendarData.registerBan || false,
      });

      setSelectedTasks(calendarData.taskList || []);

      const mappedDocs = [
        ...(calendarData.dInList || []).map((doc: any) => ({
          ...doc,
          type: "VAN_BAN_DEN",
          docId: doc.docInId,
          numberOrSign: doc.docInName,
          preview: doc.taskName || doc.taskDescription,
          docTypeName: doc.type,
        })),
        ...(calendarData.dOutList || []).map((doc: any) => ({
          ...doc,
          type: "VAN_BAN_DI",
          docId: doc.docOutId,
          numberOrSign: doc.docOutName,
          preview: doc.taskName || doc.taskDescription,
          docTypeName: doc.type,
        })),
      ];
      setSelectedDocs(mappedDocs);
      setSelectedFiles(calendarData.attachments || []);

      const mappedGuests = calendarData.participantsGuest
        ? calendarData.participantsGuest.split(";").map((guest: string) => ({
            name: guest.trim(),
            id: guest.trim(),
          }))
        : [];
      setSelectedGuests(mappedGuests);

      const mappedParticipants = calendarData.participants
        ? calendarData.participants.split(",").map((participant: string) => ({
            name: participant.trim(),
            id: participant.trim(),
          }))
        : [];
      setSelectedParticipants(mappedParticipants);
      setSelectedParticipantsOrg(calendarData.participantsOrg || []);
      setSelectedGroups(calendarData.participantsGroup || []);
    }
  }, [calendarData]);

  useEffect(() => {
    if (calendarError) {
      ToastUtils.khongTheTaiDuLieuLich();
    }
  }, [calendarError]);

  const createPayload = (data: any) => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    const startTime = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, "0")}-${startDate.getDate().toString().padStart(2, "0")}T${data.startHour}:${data.startMinute}`;
    const endTime = `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, "0")}-${endDate.getDate().toString().padStart(2, "0")}T${data.endHour}:${data.endMinute}`;

    const dInList = selectedDocs
      ?.filter((item: any) => item.type === "VAN_BAN_DEN")
      .map((doc) => ({
        // id: doc.id || null,
        docInId: doc.docId,
        cId: parseInt(params.id),
      }));
    const dOutList = selectedDocs
      ?.filter((item: any) => item.type === "VAN_BAN_DI")
      .map((doc) => ({
        // id: doc.id || null,
        docOutId: doc.docId,
        cId: parseInt(params.id),
      }));

    return {
      active: calendarData?.active,
      createDate: calendarData?.createDate || Date.now(),
      createBy: calendarData?.createBy || 870,
      clientId: 1,
      title: data.content || "",
      address: data.location || "",
      orgId: calendarData?.orgId || 2,
      orgModel: calendarData?.orgModel || null,
      description: data.content || "",
      startTime,
      endTime,
      publishBy: calendarData?.publishBy || null,
      status: calendarData?.status || "PRE_APPROVE",
      registerBan: calendarData?.registerBan || data.registerBan || false,
      comment: calendarData?.comment || null,
      ingredient: calendarData?.ingredient || null,
      note: data.notes || "",
      participants: data.participants || "",
      participantsGuest: data.participantsGuest || "",
      participantsOrg: selectedParticipantsOrg || [],
      participantsGroup: selectedGroups || [],
      roomId: calendarData?.roomId || null,
      attachments: selectedFiles || [],
      attCalWeek: calendarData?.attCalWeek || null,
      isShowAttachments: true,
      taskList: selectedTasks || [],
      showApproveBt: calendarData?.showApproveBt || false,
      showRejectBt: calendarData?.showRejectBt || false,
      showEditBt: calendarData?.showEditBt || false,
      showCancelBt: calendarData?.showCancelBt || false,
      showDelBt: calendarData?.showDelBt || false,
      parentOrgName: calendarData?.parentOrgName || null,
      createUserName: calendarData?.createUserName || "",
      isCabinet: calendarData?.isCabinet || null,
      isScheduleAFile: calendarData?.isScheduleAFile || null,
      scheduleFileName: calendarData?.scheduleFileName || null,
      meetingCalendar: calendarData?.meetingCalendar || false,
      unitCalendar: calendarData?.unitCalendar || false,
      endTimeStr:
        calendarData?.endTimeStr ||
        `${endDate.getDate().toString().padStart(2, "0")}/${(endDate.getMonth() + 1).toString().padStart(2, "0")}/${endDate.getFullYear()} ${data.endHour}:${data.endMinute}`,
      statusName: calendarData?.statusName || "Chờ duyệt",
      startTimeStr:
        calendarData?.startTimeStr ||
        `${startDate.getDate().toString().padStart(2, "0")}/${(startDate.getMonth() + 1).toString().padStart(2, "0")}/${startDate.getFullYear()} ${data.startHour}:${data.startMinute}`,
      dInList,
      dOutList,
      timeEnd: {
        hour: calendarData?.timeEnd?.hour || parseInt(data.endHour),
        minute: calendarData?.timeEnd?.minute || parseInt(data.endMinute),
      },
      dateEnd: {
        year: calendarData?.dateEnd?.year || endDate.getFullYear(),
        month: calendarData?.dateEnd?.month || endDate.getMonth() + 1,
        day: calendarData?.dateEnd?.day || endDate.getDate(),
      },
      timeStart: {
        hour: calendarData?.timeStart?.hour || parseInt(data.startHour),
        minute: calendarData?.timeStart?.minute || parseInt(data.startMinute),
      },
      dateStart: {
        year: calendarData?.dateStart?.year || startDate.getFullYear(),
        month: calendarData?.dateStart?.month || startDate.getMonth() + 1,
        day: calendarData?.dateStart?.day || startDate.getDate(),
      },
    };
  };

  const validateForm = (data: any) => {
    const errors: string[] = [];
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

    if (missing) {
      ToastUtils.error("Bạn chưa nhập đủ thông tin bắt buộc");
      return errors;
    }

    return errors;
  };

  const resetForm = () => {
    const now = new Date();
    form.reset(getDefaultFormValues(now));

    setSelectedTasks([]);
    setSelectedDocs([]);
    setSelectedGuests([]);
    setSelectedParticipants([]);
    setSelectedParticipantsOrg([]);
    setSelectedGroups([]);
    setParticipantInput("");
    setGuestInput("");
    setOrgInput("");
    setGroupInput("");
  };

  const { mutateAsync: saveCalendar } = useUpdateCalendarMutation();

  const { mutateAsync: addAttachmentMeeting } = useAddAttachmentMeetingAction();
  const { mutateAsync: addAttachment } = useAddAttachmentAction();
  const { mutateAsync: deleteAttachment } = useDeleteAttachmentAction();
  const { mutateAsync: deleteAttachmentMeeting } =
    useDeleteAttachmentMeetingAction();

  const handleSave = async (isAddNew: boolean = false) => {
    const data = form.getValues();
    const validationErrors = validateForm(data);

    if (validationErrors && validationErrors.length > 0) {
      validationErrors.forEach((error) => {
        ToastUtils.error(error);
      });
      return;
    }

    if (isAddNew) {
      setIsSavingAndAdding(true);
    } else {
      setIsSaving(true);
    }

    try {
      let result;

      if (isCabinet) {
        const meetingData = {
          id: parseInt(params.id),
          ...createPayload(data),
          isCabinet: true,
          attachments: selectedFiles,
        };

        result = await CalendarService.updateMeeting(meetingData);
      } else {
        result = await saveCalendar({
          id: parseInt(params.id),
          payload: { ...createPayload(data), id: parseInt(params.id) },
        });
      }

      if (result && (result.success || result.id)) {
        const calId = result.data?.id || result.id || parseInt(params.id);

        if (selectedFiles && selectedFiles.length > 0) {
          const attachmentResult = await doAddAttachments(
            calId,
            1,
            selectedFiles
          );
          if (attachmentResult === false) {
            ToastUtils.lichDaDuocCapNhatNhungCoLoiKhiXuLyTepDinhKem();
            return;
          }
        }

        if (isCabinet) {
          ToastUtils.capNhatCuocHopThanhCong();
        } else {
          ToastUtils.capNhatLichThanhCong();
        }
        if (isAddNew) {
          resetForm();
        } else {
          const tabParam = currentTab ? `?tab=${currentTab}` : "";
          router.push(`/calendar/business${tabParam}`);
        }
      } else {
        if (isCabinet) {
          ToastUtils.capNhatCuocHopThatBai();
        } else {
          ToastUtils.capNhatLichThatBai();
        }
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
    handleSave();
  };

  const validFileSSize = (files: FileList | null): boolean => {
    if (!files) return true;
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > 300 * 1024 * 1024) {
        return false;
      }
    }
    return true;
  };

  const isExistFile = (fileName: string, files: any[]): boolean => {
    return files.some((file) => file.name === fileName);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleParticipantKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (participantInput.trim()) {
        const currentParticipants =
          (form.getValues("participantsGuest") as string) || "";
        const participantsArray = currentParticipants
          ? currentParticipants.split(";").filter((p: string) => p.trim())
          : [];
        const newParticipants = [
          ...participantsArray,
          participantInput.trim(),
        ].join(";");
        form.setValue("participantsGuest", newParticipants);
        setParticipantInput("");
      }
    }
  };

  const handleParticipantBlur = () => {
    if (participantInput.trim()) {
      const currentParticipants =
        (form.getValues("participantsGuest") as string) || "";
      const participantsArray = currentParticipants
        ? currentParticipants.split(";").filter((p: string) => p.trim())
        : [];
      const newParticipants = [
        ...participantsArray,
        participantInput.trim(),
      ].join(";");
      form.setValue("participantsGuest", newParticipants);
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

  const adjustTime = (
    currentValue: string,
    fieldName: "startHour" | "endHour" | "startMinute" | "endMinute",
    type: "hour" | "minute",
    action: "increment" | "decrement"
  ) => {
    const currentTime = parseInt(currentValue) || 0;
    const max = type === "hour" ? 23 : 59;
    let newTime: number;

    switch (action) {
      case "increment":
        newTime = currentTime >= max ? 0 : currentTime + 1;
        break;
      case "decrement":
        newTime = currentTime <= 0 ? max : currentTime - 1;
        break;
      default:
        newTime = currentTime;
    }

    form.setValue(fieldName as any, newTime.toString().padStart(2, "0"));
  };

  const incrementHour = (
    currentValue: string,
    fieldName: "startHour" | "endHour"
  ) => adjustTime(currentValue, fieldName, "hour", "increment");
  const decrementHour = (
    currentValue: string,
    fieldName: "startHour" | "endHour"
  ) => adjustTime(currentValue, fieldName, "hour", "decrement");
  const incrementMinute = (
    currentValue: string,
    fieldName: "startMinute" | "endMinute"
  ) => adjustTime(currentValue, fieldName, "minute", "increment");
  const decrementMinute = (
    currentValue: string,
    fieldName: "startMinute" | "endMinute"
  ) => adjustTime(currentValue, fieldName, "minute", "decrement");

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      form.setValue("startDate", date);
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      form.setValue("endDate", date);
    }
  };

  const handleGuestInputChange = async (value: string) => {
    setGuestInput(value);
    if (value.length > 2) {
      try {
        const results = await CalendarService.searchFullName(value);
        setSearchResults(results || []);
        setShowDropdown(true);
      } catch (error) {
        console.error("Error searching guests:", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleOrgInputChange = async (value: string) => {
    setOrgInput(value);
    if (value.length > 2) {
      try {
        const results = await CalendarService.searchOrgByName(value);
        setOrgSearchResults(results || []);
        setShowOrgDropdown(true);
      } catch (error) {
        console.error("Error searching orgs:", error);
        setOrgSearchResults([]);
      }
    } else {
      setOrgSearchResults([]);
      setShowOrgDropdown(false);
    }
  };

  const handleGroupInputChange = async (value: string) => {
    setGroupInput(value);
    if (value.length > 2) {
      try {
        const results = await CalendarService.searchGroupByName(value);
        setGroupSearchResults(results || []);
        setShowGroupDropdown(true);
      } catch (error) {
        console.error("Error searching groups:", error);
        setGroupSearchResults([]);
      }
    } else {
      setGroupSearchResults([]);
      setShowGroupDropdown(false);
    }
  };

  const handleGuestSelection = (user: any) => {
    if (
      !selectedParticipants.find(
        (participant) => participant.name === user.fullName
      )
    ) {
      const newParticipant = {
        name: user.fullName,
        id: user.fullName,
      };
      const newParticipants = [...selectedParticipants, newParticipant];
      setSelectedParticipants(newParticipants);
      form.setValue(
        "participants",
        newParticipants.map((p) => p.name).join(",")
      );
    }
    setGuestInput("");
    setShowDropdown(false);
  };

  const selectOrganization = (org: any) => {
    if (!selectedParticipantsOrg.find((o) => o.fullName === org.fullName)) {
      const newOrgs = [...selectedParticipantsOrg, org];
      setSelectedParticipantsOrg(newOrgs);
      form.setValue("participantsOrg", newOrgs);
    }
    setOrgInput("");
    setShowOrgDropdown(false);
  };

  const selectGroup = (group: any) => {
    if (!selectedGroups.find((g) => g.fullName === group.fullName)) {
      const newGroups = [...selectedGroups, group];
      setSelectedGroups(newGroups);
      form.setValue("participantsGroup", newGroups);
    }
    setGroupInput("");
    setShowGroupDropdown(false);
  };

  const removeGuest = (fullName: string) => {
    const newParticipants = selectedParticipants.filter(
      (participant) => participant.name !== fullName
    );
    setSelectedParticipants(newParticipants);
    form.setValue("participants", newParticipants.map((p) => p.name).join(","));
  };

  const removeOrganization = (orgName: string) => {
    const newOrgs = selectedParticipantsOrg.filter(
      (org) => org.fullName !== orgName
    );
    setSelectedParticipantsOrg(newOrgs);
    form.setValue("participantsOrg", newOrgs);
  };

  const removeGroup = (groupName: string) => {
    const newGroups = selectedGroups.filter(
      (group) => group.fullName !== groupName
    );
    setSelectedGroups(newGroups);
    form.setValue("participantsGroup", newGroups);
  };

  const closeDropdown = () => {
    setShowDropdown(false);
    setShowOrgDropdown(false);
    setShowGroupDropdown(false);
  };

  const handleGuestKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchResults.length > 0) {
        handleGuestSelection(searchResults[0]);
      }
    } else if (e.key === "Escape") {
      closeDropdown();
    }
  };

  const handleOrgKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (orgSearchResults.length > 0) {
        selectOrganization(orgSearchResults[0]);
      }
    } else if (e.key === "Escape") {
      closeDropdown();
    }
  };

  const handleGroupKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (groupSearchResults.length > 0) {
        selectGroup(groupSearchResults[0]);
      }
    } else if (e.key === "Escape") {
      closeDropdown();
    }
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
    if (type === "task" && taskToDelete) {
      setSelectedTasks((prev) =>
        prev.filter(
          (t) => t.taskId !== taskToDelete.taskId && t.id !== taskToDelete.id
        )
      );
      setTaskToDelete(null);
    } else if (type === "doc" && docToDelete) {
      setSelectedDocs((prev) =>
        prev.filter(
          (d) => d.docId !== docToDelete.docId && d.id !== docToDelete.id
        )
      );
      setDocToDelete(null);
    }

    setShowDeleteConfirm(false);
    setIsFromModal(false);
  };

  const confirmDeleteTask = () => confirmDelete("task");
  const confirmDeleteDoc = () => confirmDelete("doc");

  const handleTaskSelect = (task: any) => {
    if (
      !selectedTasks.find((t) => t.taskId === task.taskId || t.id === task.id)
    ) {
      setSelectedTasks((prev) => [...prev, task]);
    }
  };

  const handleTaskDeselect = (task: any) => {
    setTaskToDelete(task);
    setDocToDelete(null);
    setIsFromModal(true);
    setShowDeleteConfirm(true);
  };

  const handleDocSelect = (doc: any) => {
    if (!selectedDocs.find((d) => d.docId === doc.docId || d.id === doc.id)) {
      setSelectedDocs((prev) => [...prev, doc]);
    }
  };

  const handleDocDeselect = (doc: any) => {
    setDocToDelete(doc);
    setTaskToDelete(null);
    setIsFromModal(true);
    setShowDeleteConfirm(true);
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
      ToastUtils.fileSizeMustBeLessThan300MB();
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

  const removeFile = (index: number, file: any) => {
    if (file.id) {
      setFileToDelete({ index, file });
      setTaskToDelete(null);
      setDocToDelete(null);
      setIsFromModal(false);
      setShowDeleteConfirm(true);
    } else {
      removeFileFromView(index);
    }
  };

  const removeFileFromView = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const removeFileFromDB = async (index: number, file: any) => {
    try {
      if (isCabinet) {
        await deleteAttachmentMeeting({
          calId: parseInt(params.id),
          meetingId: file.id,
        });
      } else {
        await deleteAttachment({
          attachmentId: file.id,
        });
      }

      ToastUtils.xoaTepThanhCong();

      removeFileFromView(index);
      setFileToDelete(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      handleError(error);
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

    selectedParticipantsOrg.forEach((org) => {
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
        ToastUtils.lichKhongCoThanhVienThamGiaTrongHeThong();
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
      <div className="border-b border-gray-200 px-6 py-2 bg-gray-200">
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
                Cập nhật lịch làm việc
              </h1>
              <p className="text-sm text-gray-600">
                Hiển thị thông tin lịch làm việc, lịch công tác của cá nhân
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
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
                <FormLabel className="block text-base font-medium text-gray-700 mb-2">
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="participantsGuest"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-base font-medium text-gray-700 mb-2">
                  Thành phần
                </FormLabel>
                <FormControl>
                  <div className="w-full">
                    <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-2 border border-input rounded-md bg-background">
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
                        className="flex-1 min-w-[200px] outline-none bg-transparent text-sm border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
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
                    <FormLabel className="block text-base font-medium text-gray-700 mb-2">
                      Cá nhân nhận tệp
                    </FormLabel>
                    <FormControl>
                      <div className="w-full relative guest-dropdown-container">
                        <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-2 border border-input rounded-md bg-background">
                          {selectedParticipants.map((participant, index) => (
                            <div
                              key={
                                participant.id || participant.userId || index
                              }
                              className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800"
                            >
                              <span>
                                {participant.name ||
                                  participant.fullName ||
                                  participant}
                              </span>

                              <X
                                className="h-4 w-4"
                                onClick={() =>
                                  removeGuest(
                                    participant.name ||
                                      participant.fullName ||
                                      participant
                                  )
                                }
                              />
                            </div>
                          ))}
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
                              <span className="text-xs font-medium text-gray-600">
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
                                <div className="font-medium text-gray-900">
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
                    <FormLabel className="block text-base font-medium text-gray-700 mb-2">
                      Đơn vị nhận tệp
                    </FormLabel>
                    <FormControl>
                      <div className="w-full relative org-dropdown-container">
                        <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-2 border border-input rounded-md bg-background">
                          {selectedParticipantsOrg.map((org, index) => (
                            <div
                              key={org.id || index}
                              className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800"
                            >
                              <span>
                                {org.fullName || org.name || org.orgName || "-"}
                              </span>

                              <X
                                className="h-4 w-4"
                                onClick={() =>
                                  removeOrganization(
                                    org.fullName || org.name || org.orgName
                                  )
                                }
                              />
                            </div>
                          ))}
                          <Input
                            type="text"
                            value={orgInput}
                            onChange={(e) =>
                              handleOrgInputChange(e.target.value)
                            }
                            onKeyDown={handleOrgKeyDown}
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
                                  closeDropdown();
                                }
                              }, 150);
                            }}
                            placeholder="Nhập tên đơn vị nhận tệp"
                            className="flex-1 min-w-[200px] outline-none bg-transparent text-sm border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </div>

                        {showOrgDropdown && orgSearchResults.length > 0 && (
                          <div
                            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                            style={{ top: "100%" }}
                          >
                            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 bg-gray-50">
                              <span className="text-xs font-medium text-gray-600">
                                Kết quả tìm kiếm
                              </span>
                              <X className="h-4 w-4" onClick={closeDropdown} />
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
                                className="px-4 py-3 hover:bg-blue-50 hover:border-blue-200 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 w-full transition-colors duration-150 select-none"
                              >
                                <div className="font-medium text-gray-900">
                                  {org.fullName}
                                </div>
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
                    <FormLabel className="block text-base font-medium text-gray-700 mb-2">
                      Nhóm nhận tệp
                    </FormLabel>
                    <FormControl>
                      <div className="w-full relative group-dropdown-container">
                        <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-2 border border-input rounded-md bg-background">
                          {selectedGroups.map((group, index) => (
                            <div
                              key={group.id || index}
                              className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full"
                            >
                              <span>
                                {group.fullName ||
                                  group.name ||
                                  group.groupName ||
                                  "-"}
                              </span>
                              <X
                                className="h-4 w-4"
                                onClick={() =>
                                  removeGroup(
                                    group.fullName ||
                                      group.name ||
                                      group.groupName
                                  )
                                }
                              />
                            </div>
                          ))}
                          <Input
                            type="text"
                            value={groupInput}
                            onChange={(e) =>
                              handleGroupInputChange(e.target.value)
                            }
                            onKeyDown={handleGroupKeyDown}
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
                                  closeDropdown();
                                }
                              }, 150);
                            }}
                            placeholder="Nhập tên nhóm nhận tệp"
                            className="flex-1 min-w-[200px] outline-none bg-transparent text-sm border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </div>

                        {showGroupDropdown && groupSearchResults.length > 0 && (
                          <div
                            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                            style={{ top: "100%" }}
                          >
                            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 bg-gray-50">
                              <span className="text-xs font-medium text-gray-600">
                                Kết quả tìm kiếm
                              </span>
                              <X className="h-4 w-4" onClick={closeDropdown} />
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
                                <div className="font-medium text-gray-900">
                                  {group.fullName}
                                </div>
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
              onClick={() => setShowDocModal(true)}
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
              onClick={() => setShowTaskModal(true)}
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
                <FormLabel className="block text-base font-medium text-gray-700 mb-2">
                  Địa điểm
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Nhập địa điểm..."
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
                <FormLabel className="block text-base font-medium text-gray-700 mb-2">
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
              rules={{ required: "Ngày bắt đầu không được để trống" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-base font-medium text-gray-700 mb-2">
                    Bắt đầu <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="flex items-center space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[180px] justify-start text-left font-normal",
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              rules={{ required: "Ngày kết thúc không được để trống" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-base font-medium text-gray-700 mb-2">
                    Kết thúc <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="flex items-center space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[180px] justify-start text-left font-normal",
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {orgType === 2 && (
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="registerWithBan"
                  checked={registerWithBan}
                  onCheckedChange={(checked) => setRegisterWithBan(!!checked)}
                />
                <Label
                  htmlFor="registerWithBan"
                  className="text-sm font-medium text-gray-700"
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
                className="bg-blue-600 hover:bg-blue-700 text-white w-fit"
              >
                <Upload className="w-4 h-4 mr-2" /> Văn bản đính kèm
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

            {/* Hiển thị danh sách files đã chọn */}
            {selectedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-gray-700">
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
                            e.stopPropagation();
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
                              e.stopPropagation();
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
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              verifierPDF(
                                file.name,
                                "",
                                ATTACHMENT_DOWNLOAD_TYPE.CALENDAR
                              );
                            }}
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
                            e.stopPropagation();
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
                            e.stopPropagation();
                            e.preventDefault();
                            removeFile(index, file);
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

          {/* Submit buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            {/* <Button
              type="button"
              onClick={handleSaveAndAddNew}
              disabled={isSavingAndAdding || isCalendarLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {isSavingAndAdding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" /> Cập nhật và thêm mới
                </>
              )}
            </Button> */}
            <Button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isSaving || isCalendarLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Cập nhật
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Modals */}
      <WorkAttachment
        open={showTaskModal}
        onOpenChange={setShowTaskModal}
        selectedTasks={selectedTasks}
        onTaskSelect={handleTaskSelect}
        onTaskDeselect={handleTaskDeselect}
      />

      <DocAttachment
        open={showDocModal}
        onOpenChange={setShowDocModal}
        selectedDocs={selectedDocs}
        onDocSelect={handleDocSelect}
        onDocDeselect={handleDocDeselect}
      />

      <ConfirmDeleteDialog
        isOpen={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={
          taskToDelete
            ? confirmDeleteTask
            : fileToDelete
              ? () => removeFileFromDB(fileToDelete.index, fileToDelete.file)
              : confirmDeleteDoc
        }
        title="Hãy xác nhận"
        description={
          taskToDelete
            ? "Bạn muốn xóa công việc liên quan?"
            : fileToDelete
              ? `Tệp ${fileToDelete.file.name} sẽ được xóa khỏi dữ liệu?`
              : "Bạn muốn xóa văn bản liên quan?"
        }
        confirmText="Đồng ý"
        cancelText="Đóng"
      />
    </div>
  );
}
