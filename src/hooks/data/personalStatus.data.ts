import { queryKeys } from "@/definitions";
import { PersonalStatusService } from "@/services/personalStatus.service";
import {
  AssignedTasksResponse,
  CalendarEvent,
  DocumentDashboardResponse,
  DocumentStats,
  TaskToProcess,
} from "@/definitions/types/personalStatus.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEncryptStore } from "@/stores/encrypt.store";

// Base filter cho pagination
const filterBase = {
  page: 1,
  size: 10,
};

// 1. Lịch công tác
export const useGetSchedule = (date: string, orgType: number = 1) => {
  return useQuery<CalendarEvent[]>({
    queryKey: [queryKeys.personalstatus.schedule, date, orgType],
    queryFn: () => PersonalStatusService.getSchedule(date, orgType),
    enabled: !!date && typeof window !== "undefined",
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
};

// 2. Văn bản đến cần xử lý
export const useGetIncomingDocuments = (
  handlingType: "main" | "coordinate" = "main",
  status: number = 1,
  customFilter: Partial<typeof filterBase> = {}
) => {
  const filter = { ...filterBase, ...customFilter };
  const { isEncrypt } = useEncryptStore();

  const type = handlingType === "coordinate" ? 1 : 0;

  return useQuery<DocumentDashboardResponse>({
    queryKey: [
      queryKeys.personalstatus.documents,
      "incoming",
      isEncrypt,
      handlingType,
      type,
      status,
      filter.page,
      filter.size,
    ],
    queryFn: () =>
      PersonalStatusService.getIncomingDocuments(
        type,
        status,
        filter.page,
        filter.size
      ),
    enabled: typeof window !== "undefined",
  });
};

// 3. Văn bản đi cần xử lý
export const useGetOutgoingDocuments = (
  type: number = 0,
  status: number = 1,
  customFilter: Partial<typeof filterBase> = {}
) => {
  const filter = { ...filterBase, ...customFilter };
  const { isEncrypt } = useEncryptStore();

  return useQuery<DocumentDashboardResponse>({
    queryKey: [
      queryKeys.personalstatus.documents,
      "outgoing",
      isEncrypt,
      type,
      status,
      filter.page,
      filter.size,
    ],
    queryFn: () =>
      PersonalStatusService.getOutgoingDocuments(
        type,
        status,
        filter.page,
        filter.size
      ),
    enabled: typeof window !== "undefined",
  });
};

// 4. Việc đã giao
export const useGetAssignedTasks = () => {
  return useQuery<AssignedTasksResponse>({
    queryKey: [queryKeys.personalstatus.assignedTasks],
    queryFn: () => PersonalStatusService.getAssignedTasks(),
    enabled: typeof window !== "undefined",
  });
};

// 5. Công việc cần xử lý
export const useGetTasksToProcess = (
  customFilter: Partial<typeof filterBase> = {}
) => {
  const filter = { ...filterBase, ...customFilter };

  return useQuery<TaskToProcess>({
    queryKey: [
      queryKeys.personalstatus.tasksFromLeadership,
      filter.page,
      filter.size,
    ],
    queryFn: () =>
      PersonalStatusService.getTasksToProcess(filter.page, filter.size),
    enabled: typeof window !== "undefined",
  });
};

// 6. Thống kê 3 card
export const useGetDocumentStats = () => {
  const { isEncrypt } = useEncryptStore();

  return useQuery<DocumentStats>({
    queryKey: [queryKeys.personalstatus.stats, "document", isEncrypt],
    queryFn: () => PersonalStatusService.getDocumentStats(),
    enabled: typeof window !== "undefined",
  });
};

export const useGetOutgoingDocumentStats = () => {
  const { isEncrypt } = useEncryptStore();

  return useQuery<DocumentStats>({
    queryKey: [queryKeys.personalstatus.stats, "outgoing", isEncrypt],
    queryFn: () => PersonalStatusService.getOutgoingDocumentStats(),
    enabled: typeof window !== "undefined",
  });
};

export const useGetTaskStats = () => {
  const { isEncrypt } = useEncryptStore();

  return useQuery<DocumentStats>({
    queryKey: [queryKeys.personalstatus.stats, "task", isEncrypt],
    queryFn: () => PersonalStatusService.getTaskStats(),
    enabled: typeof window !== "undefined",
  });
};

export const useGetStats = (date: string) => {
  return useQuery({
    queryKey: [queryKeys.personalstatus.stats, date],
    queryFn: () => PersonalStatusService.getDocumentStats(),
    enabled: !!date && typeof window !== "undefined",
  });
};

// Mutation hooks
export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      PersonalStatusService.updateDocument(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.personalstatus.documents],
      });
    },
    onError: (error) => {
      console.error("Error updating document:", error);
    },
  });
};

export const useCompleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      PersonalStatusService.completeTask(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.personalstatus.tasksFromLeadership],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.personalstatus.assignedTasks],
      });
    },
    onError: (error) => {
      console.error("Error completing task:", error);
    },
  });
};

export const useAssignTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      documentId,
      assignees,
    }: {
      documentId: string;
      assignees: string[];
    }) => PersonalStatusService.assignTask(documentId, assignees),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.personalstatus.documents],
      });
    },
    onError: (error) => {
      console.error("Error assigning task:", error);
    },
  });
};
