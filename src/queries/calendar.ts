import { useQuery } from "@tanstack/react-query";
import {
  getAllCalendars,
  getCalendarByMonth,
  getCalendarDetail,
} from "@/apis/calendar";
import type { CalendarItem } from "@/types/calendar";

export const calendarKeys = {
  all: ["calendar"] as const,
  months: () => ["calendar", "month"] as const,
  month: (year: number, month: number) =>
    ["calendar", "month", year, month] as const,
  detail: (id: number) => ["calendar", "detail", id] as const,
};

/** 특정 연/월의 캘린더 일정 목록. */
export const useCalendarMonth = (year: number, month: number) =>
  useQuery({
    queryKey: calendarKeys.month(year, month),
    queryFn: async (): Promise<CalendarItem[]> => {
      const res = await getCalendarByMonth(year, month);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

/** 전체 캘린더 일정 목록 (관리자용). */
export const useAllCalendars = () =>
  useQuery({
    queryKey: calendarKeys.all,
    queryFn: async (): Promise<CalendarItem[]> => {
      const res = await getAllCalendars();
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

/** 캘린더 일정 상세. */
export const useCalendarDetail = (id: number | undefined) =>
  useQuery({
    queryKey: calendarKeys.detail(id ?? 0),
    queryFn: async (): Promise<CalendarItem> => {
      const res = await getCalendarDetail(id!);
      return res.data;
    },
    enabled: typeof id === "number" && id > 0,
    staleTime: 1000 * 60 * 5,
  });
