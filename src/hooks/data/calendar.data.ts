import { CalendarService } from "@/services/calendar.service";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/definitions";

export const useGetCalendarBusinessById = (id: number) => {
  return useQuery({
    queryKey: [queryKeys.calendar.detail, id],
    queryFn: async () => {
      const response = await CalendarService.getCalendarBusinessById(id);
      return response;
    },
    enabled: !!id,
  });
};

export const useGetCalendarDetail = (
  calendar: { id: number; cabinet?: boolean },
  isOpen: boolean
) => {
  return useQuery({
    queryKey: [queryKeys.calendar.detail, calendar.id, calendar.cabinet],
    queryFn: async () => {
      if (!calendar?.id) return null;

      let data;
      if (calendar.cabinet) {
        data = await CalendarService.getMeetingById(calendar.id);
      } else {
        data = await CalendarService.getCalendarBusinessById(calendar.id);
      }
      return data;
    },
    enabled: isOpen && !!calendar?.id,
  });
};

export const useGetCalendarHistory = (calendarId: number, isOpen: boolean) => {
  return useQuery({
    queryKey: [queryKeys.calendar.history, calendarId],
    queryFn: async () => {
      if (!calendarId) return [];
      const response = await CalendarService.getCalendarHistory(calendarId);
      return response;
    },
    enabled: !!calendarId && isOpen,
  });
};

export const useListOrgRoom = (param: any) => {
  return useQuery({
    queryKey: [queryKeys.calendar.orgRoom, param],
    queryFn: async () => {
      return await CalendarService.listOrgRoom(param);
    },
  });
};

export const useGetRoomListMeetingCalendar = (
  params: string,
  enabled = true
) => {
  return useQuery({
    queryKey: [queryKeys.calendar.roomList, params],
    queryFn: async () => {
      const response = await CalendarService.getRoomListMeetingCalendar(params);
      return response;
    },
    enabled,
  });
};

export const useGetOrgListCalendar = (param: any) => {
  return useQuery({
    queryKey: [queryKeys.calendar.orgRoomList, param],
    queryFn: async () => {
      return await CalendarService.getOrgListCalendar(param);
    },
  });
};
