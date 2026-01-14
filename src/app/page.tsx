"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { formatDate } from "@/utils/datetime.utils";
import {
  transformDocument,
  filterDocumentsBySecurity,
  filterByQuery,
  filterSchedulesByTime,
  filterSchedulesByType,
  getPriorityColor,
  getRoleStatusColor,
  formatDateForDisplay,
  type Document,
  type Task,
  type ScheduleItem,
} from "@/utils/dashboard.utils";

import {
  useGetIncomingDocuments,
  useGetOutgoingDocuments,
  useGetAssignedTasks,
  useGetTasksToProcess,
  useGetSchedule,
  useGetDocumentStats,
  useGetOutgoingDocumentStats,
  useGetTaskStats,
  useUpdateDocument,
  useCompleteTask,
  useAssignTask,
} from "@/hooks/data/personalStatus.data";

import { useGetCalendarHistory } from "@/hooks/data/calendar.data";

import ButtonHeader, { type Tab } from "@/components/dashboard/ButtonHeader";
import ScheduleCard from "@/components/dashboard/ScheduleCard";
import IncomingDocumentsCard from "@/components/dashboard/IncomingDocumentsCard";
import OutgoingDocumentsCard from "@/components/dashboard/OutgoingDocumentsCard";
import AssignedTasksCard from "@/components/dashboard/AssignedTasksCard";
import PendingTasksCard from "@/components/dashboard/PendingTasksCard";
import StatsSection from "@/components/dashboard/StatsSection";
import UnitStats from "@/components/dashboard/UnitStats";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

export default function Home(): JSX.Element {
  const sp = useSearchParams();
  const router = useRouter();

  // 1) Dùng giá trị ổn định khi SSR
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>("personal");
  const [isFiltering, setIsFiltering] = useState(false);

  // 2) Sau khi mount mới đọc search params để set tab
  useEffect(() => {
    setMounted(true);
    const q = sp?.get("tab");
    if (q === "unit") setTab("unit");
  }, [sp]);

  // Những state khác nên khởi tạo ổn định
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [scheduleTab, setScheduleTab] = useState<"board" | "unit">("board");
  const [incomingHandling, setIncomingHandling] = useState<
    "main" | "coordinate"
  >("main");
  const [taskHandling, setTaskHandling] = useState<"main" | "coordinate">(
    "main"
  );
  const [isFilteringTask, setIsFilteringTask] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const isClient = true; // không phụ thuộc runtime để tránh khác biệt SSR/CSR
  const dateStr = selectedDate ? formatDate(selectedDate, "dd/MM/yyyy") : "";

  const { data: incomingDocuments } = useGetIncomingDocuments(incomingHandling);
  const { data: outgoingDocuments } = useGetOutgoingDocuments();
  const { data: assignedTasksResponse, refetch: refetchAssignedTasks } =
    useGetAssignedTasks();
  const { data: tasksToProcessResponse } = useGetTasksToProcess();
  const { data: rawScheduleItems = [] } = useGetSchedule(
    dateStr,
    scheduleTab === "board" ? 1 : 2
  );
  const { data: documentStats } = useGetDocumentStats();
  const { data: outgoingDocumentStats } = useGetOutgoingDocumentStats();
  const { data: taskStats } = useGetTaskStats();

  const assignedTasks: Task[] = (assignedTasksResponse?.objList || []).map(
    (task: any) => ({
      id: task.id?.toString() || "",
      title: task.taskName || "",
      description: task.description || "",
      assignedBy: task.userAssignName || "",
      assignees: [],
      deadline: task.endDate
        ? formatDate(new Date(task.endDate), "dd/MM/yyyy")
        : "",
      endDate: task.endDate || 0,
      status: task.statusName || "",
    })
  );

  const decodeHtmlEntities = (text: string) => {
    if (!text) return "";
    // Strip HTML tags first
    const stripped = text.replace(/<[^>]*>/g, "");
    // Simple decode for common entities
    return stripped
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, '"')
      .replace(/'/g, "'")
      .replace(/'/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/&iacute;/g, "í")
      .replace(/&uacute;/g, "ú")
      .replace(/&agrave;/g, "à")
      .replace(/&ograve;/g, "ò")
      .replace(/&eacute;/g, "é")
      .replace(/&oacute;/g, "ó")
      .replace(/&Yacute;/g, "Ý")
      .replace(/&Agrave;/g, "À")
      .replace(/&Aacute;/g, "Á")
      .replace(/&Egrave;/g, "È")
      .replace(/&Igrave;/g, "Ì")
      .replace(/&Ograve;/g, "Ò")
      .replace(/&Ugrave;/g, "Ù")
      .replace(/&agrave;/g, "à")
      .replace(/&egrave;/g, "è")
      .replace(/&igrave;/g, "ì")
      .replace(/&ograve;/g, "ò")
      .replace(/&ugrave;/g, "ù")
      .replace(/&acirc;/g, "â")
      .replace(/&ecirc;/g, "ê")
      .replace(/&icirc;/g, "î")
      .replace(/&ocirc;/g, "ô")
      .replace(/&ucirc;/g, "û");
  };

  const scheduleItems: ScheduleItem[] = rawScheduleItems.map((item: any) => ({
    id: item.id,
    time: item.startTimeStr || "",
    title: decodeHtmlEntities(item.description || item.title),
    location: item.address || "",
    participants: item.participantsGuest || item.participants,
    startTimeStr: item.startTimeStr,
    endTimeStr: item.endTimeStr,
    address: item.address,
    description: decodeHtmlEntities(item.description),
    statusName: item.statusName,
    meetingCalendar: item.meetingCalendar,
    unitCalendar: item.unitCalendar,
  }));

  const documents: Document[] = useMemo(
    () => [
      ...(incomingDocuments?.documentIn || []).map((doc: any) =>
        transformDocument(doc, "incoming")
      ),
      ...(outgoingDocuments?.documentOut || []).map((doc: any) =>
        transformDocument(doc, "outgoing")
      ),
    ],
    [incomingDocuments, outgoingDocuments]
  );

  const filteredDocuments = useMemo(
    () => filterByQuery(documents, searchQuery, ["id", "title", "from", "to"]),
    [documents, searchQuery]
  );

  const filteredAssignedTasks = useMemo(
    () =>
      filterByQuery(assignedTasks, searchQuery, ["id", "title", "assignees"]),
    [assignedTasks, searchQuery]
  );

  const tasksToProcess: Task[] = (tasksToProcessResponse?.content || []).map(
    (task: any) => ({
      id: task.id?.toString() || "",
      title: task.taskName || "",
      assignedBy: task.userAssignName || "",
      assignees: [],
      deadline: task.endDate
        ? formatDate(new Date(task.endDate), "dd/MM/yyyy")
        : "",
      status: task.statusName || "",
      handlingType: task.type === "main" ? "main" : "coordinate",
    })
  );

  const filteredTasksToProcess = useMemo(
    () =>
      filterByQuery(tasksToProcess, searchQuery, [
        "id",
        "title",
        "assignedBy",
      ]).filter((task) => task.handlingType === taskHandling),
    [tasksToProcess, searchQuery, taskHandling]
  );

  const filteredScheduleItems = useMemo(() => {
    const items = filterSchedulesByType(scheduleItems, scheduleTab);
    return filterByQuery(items, searchQuery, [
      "title",
      "location",
      "address",
      "participants",
    ]);
  }, [scheduleItems, searchQuery, scheduleTab]);

  const morningSchedules = useMemo(
    () => filterSchedulesByTime(filteredScheduleItems, "morning"),
    [filteredScheduleItems]
  );
  const afternoonSchedules = useMemo(
    () => filterSchedulesByTime(filteredScheduleItems, "afternoon"),
    [filteredScheduleItems]
  );

  const updateDocumentMutation = useUpdateDocument();
  const completeTaskMutation = useCompleteTask();
  const assignTaskMutation = useAssignTask();

  // 3) (Tuỳ chọn) Chặn render khi chưa mounted để 100% tránh mismatch
  if (!mounted) {
    return (
      <div className="px-4 mx-auto space-y-4" style={{ minHeight: "100vh" }} />
    );
  }

  return (
    <div className="px-4 mx-auto space-y-4" style={{ minHeight: "100vh" }}>
      <ButtonHeader
        defaultTab={tab}
        onTabChange={(t) => setTab(t)}
        onSearch={(kw) => setSearchQuery(kw)}
      />

      {isFiltering && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
            <Spinner variant="ring" size={48} className="text-blue-600" />
            <span className="text-gray-600 text-sm">Đang tải...</span>
          </div>
        </div>
      )}

      {isFilteringTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
            <Spinner variant="ring" size={48} className="text-blue-600" />
            <span className="text-gray-600 text-sm">Đang tải...</span>
          </div>
        </div>
      )}

      {tab === "unit" ? (
        <UnitStats />
      ) : (
        <div className="space-y-4">
          <ScheduleCard
            selectedDateLabel={formatDateForDisplay(selectedDate, isClient)}
            scheduleTab={scheduleTab}
            onChangeTab={setScheduleTab}
            onNavigateDate={(direction) => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + (direction === "next" ? 1 : -1));
              setSelectedDate(d);
            }}
            onToggleDatePicker={() => setShowDatePicker(!showDatePicker)}
            showDatePicker={showDatePicker}
            isClient={isClient}
            selectedDate={selectedDate}
            onChangeDate={setSelectedDate}
            onCloseDatePicker={() => setShowDatePicker(false)}
            scheduleItems={filteredScheduleItems}
            morningSchedules={morningSchedules}
            afternoonSchedules={afternoonSchedules}
          />

          <div className="grid grid-cols-2 gap-4">
            <IncomingDocumentsCard
              incomingHandling={incomingHandling}
              onIncomingHandlingChange={setIncomingHandling}
              documents={filteredDocuments.filter(
                (doc) => doc.type === "incoming"
              )}
              isClient={isClient}
              expandedItems={expandedItems}
              onToggleExpanded={(id) =>
                setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }))
              }
              onDetailClick={(id) => {
                const docId = id.replace("incoming-", "");
                router.push(`/document-out/main/detail/${docId}`);
              }}
              getPriorityColor={getPriorityColor}
              onUpdateDocument={(id, status) =>
                updateDocumentMutation.mutate({ id, status })
              }
              isFiltering={isFiltering}
              setIsFiltering={setIsFiltering}
            />

            <OutgoingDocumentsCard
              documents={filteredDocuments.filter(
                (doc) => doc.type === "outgoing"
              )}
              isClient={isClient}
              expandedItems={expandedItems}
              onToggleExpanded={(id) =>
                setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }))
              }
              onDetailClick={(id) => {
                const docId = id.replace("outgoing-", "");
                router.push(`/document-in/draft-handle/draft-detail/${docId}`);
              }}
              getPriorityColor={getPriorityColor}
              onUpdateDocument={(id, status) =>
                updateDocumentMutation.mutate({ id, status })
              }
            />

            <AssignedTasksCard
              tasks={filteredAssignedTasks as Task[]}
              isClient={isClient}
              getRoleStatusColor={getRoleStatusColor}
              onCompleteTask={(id, status) =>
                completeTaskMutation.mutate({ id, status })
              }
              onDetailClick={(id) => {
                router.push(`/task/assign/detail/${id}`);
              }}
              onRefetchAssignedTasks={refetchAssignedTasks}
            />

            <PendingTasksCard
              tasks={filteredTasksToProcess as Task[]}
              isClient={isClient}
              getRoleStatusColor={getRoleStatusColor}
              onCompleteTask={(id, status) =>
                completeTaskMutation.mutate({ id, status })
              }
              onDetailClick={(id) => {
                router.push(`/task/work/detail/${id}`);
              }}
              taskHandling={taskHandling}
              onTaskHandlingChange={setTaskHandling}
              isFiltering={isFilteringTask}
              setIsFiltering={setIsFilteringTask}
            />
          </div>

          <StatsSection
            documentStats={documentStats}
            outgoingDocumentStats={outgoingDocumentStats}
            taskStats={taskStats}
            completedRate="0.0"
          />
        </div>
      )}
    </div>
  );
}
