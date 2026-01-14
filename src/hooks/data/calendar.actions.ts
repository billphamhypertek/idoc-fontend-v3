import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarService } from "@/services/calendar.service";
import { queryKeys } from "@/definitions";
import { handleError } from "@/utils/common.utils";

export const useCreateCalendarMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { orgType: number; payload: any }) => {
      const response = await CalendarService.createCalendar(
        data.orgType,
        data.payload
      );
      return { success: true, data: response };
    },
    onError: (error) => {
      handleError(error);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [queryKeys.calendar.business],
      });
    },
  });
};

export const useUpdateCalendarMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: number; payload: any }) => {
      const response = await CalendarService.updateCalendar(
        data.id,
        data.payload
      );

      return { success: true, data: response };
    },
    onError: (error) => {
      handleError(error);
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({
        queryKey: [queryKeys.calendar.business],
      });
      qc.invalidateQueries({
        queryKey: [queryKeys.calendar.detail, variables.id],
      });
    },
  });
};

export const useAddAttachmentAction = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: number;
      type: number;
      files: File[];
      week: number;
      year: number;
    }) => {
      const response = await CalendarService.addAttachment(params);
      return { success: true, data: response };
    },
    onError: (error) => {
      handleError(error);
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({
        queryKey: [queryKeys.calendar.business],
      });
      qc.invalidateQueries({
        queryKey: [queryKeys.calendar.detail, variables.id],
      });
    },
  });
};

export const useAddAttachmentMeetingAction = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: number; files: File[] }) => {
      const response = await CalendarService.addAttachmentMeeting(
        params.id,
        params.files
      );
      return { success: true, data: response };
    },
    onError: (error) => {
      handleError(error);
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({
        queryKey: [queryKeys.calendar.business],
      });
      qc.invalidateQueries({
        queryKey: [queryKeys.calendar.detail, variables.id],
      });
    },
  });
};

export const useDeleteAttachmentMeetingAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { calId: number; meetingId: number }) => {
      const response = await CalendarService.doDeleteAttachmentMeeting(
        params.calId,
        params.meetingId
      );
      return { success: true, data: response };
    },
    onError: (error) => {
      handleError(error);
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({
        queryKey: [queryKeys.calendar.business],
      });

      qc.invalidateQueries({
        queryKey: [queryKeys.calendar.detail, variables.calId],
      });
    },
  });
};

export const useDeleteAttachmentAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { attachmentId: number }) => {
      const response = await CalendarService.doDeleteAttachment(
        params.attachmentId
      );
      return { success: true, data: response };
    },
    onError: (error) => {
      handleError(error);
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({
        queryKey: [queryKeys.calendar.business],
      });
    },
  });
};

export const useAddRoomAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: any) => {
      const response = await CalendarService.addRoom(body);
      return { success: true, data: response };
    },
    onError: (error) => {
      handleError(error);
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({
        queryKey: [queryKeys.calendar.roomList],
      });
    },
  });
};

export const useExportRoomFileAction = () => {
  return useMutation({
    mutationFn: async (type: "excel" | "csv") => {
      const response = await CalendarService.exportRoomFile(type);
      return { success: true, data: response };
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

export const useImportRoomFileAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await CalendarService.importRoomFile(formData);
      return { success: true, data: response };
    },
    onError: (error) => {
      handleError(error);
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({
        queryKey: [queryKeys.calendar.roomList],
      });
    },
  });
};

export const useDeleteRoomAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await CalendarService.delRoom(id);
      return { success: true, data: response };
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [queryKeys.calendar.roomList],
      });
    },
  });
};

export const useImportOrgFileAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await CalendarService.importOrgFile(formData);
      return { success: true, data: response };
    },
    onError: (error) => {
      handleError(error);
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({
        queryKey: [queryKeys.calendar.orgRoomList],
      });
    },
  });
};

export const useExportOrgFileAction = () => {
  return useMutation({
    mutationFn: async (type: "excel" | "csv") => {
      const response = await CalendarService.exportOrgFile(type);
      return { success: true, data: response };
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

export const useAddOrgAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: any) => {
      const response = await CalendarService.addOrg(body);
      return { success: true, data: response };
    },
    onError: (error) => {
      handleError(error);
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({
        queryKey: [queryKeys.calendar.orgRoomList],
      });
    },
  });
};

export const useUpdateOrgAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: number; body: any }) => {
      const response = await CalendarService.updateOrg(id, body);
      return { success: true, data: response };
    },
    onError: (error) => {
      handleError(error);
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({
        queryKey: [queryKeys.calendar.orgRoomList],
      });
    },
  });
};

export const useDeleteOrgAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await CalendarService.delOrg(id);
      return { success: true, data: response };
    },
    onError: (error) => {
      handleError(error);
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({
        queryKey: [queryKeys.calendar.orgRoomList],
      });
    },
  });
};
