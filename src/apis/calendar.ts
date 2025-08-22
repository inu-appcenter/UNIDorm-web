import axiosInstance from "./axiosInstance.ts";
import { AxiosResponse } from "axios";
import { CalendarItem, CreateCalendarDto } from "../types/calendar.ts";
import tokenInstance from "./tokenInstance.ts";

export const getAllCalendars = async (): Promise<
  AxiosResponse<CalendarItem[]>
> => {
  const response = await axiosInstance.get<CalendarItem[]>("/calenders");
  console.log(response);
  return response;
};

export const getCalendarByMonth = async (
  year: number,
  month: number,
): Promise<AxiosResponse<CalendarItem[]>> => {
  const response = await axiosInstance.get<CalendarItem[]>(
    "/calenders/search",
    {
      params: { year, month },
    },
  );
  console.log(response);
  return response;
};

export const createCalendar = async (
  data: CreateCalendarDto,
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.post("/calenders", data);
  return response;
};

export const updateCalendar = async (
  calenderId: number,
  data: CreateCalendarDto,
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.put(`/calenders/${calenderId}`, data);
  return response;
};

export const deleteCalendar = async (
  calenderId: number,
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.delete(`/calenders/${calenderId}`);
  return response;
};
