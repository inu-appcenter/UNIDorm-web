import type { AxiosResponse } from "axios";
import tokenInstance from "./tokenInstance.ts";
import {
  DirectNotificationPayload,
  Notification,
  NotificationPayload,
  NotificationPreferences,
} from "@/types/notifications";

export const createNotification = async (
  payload: NotificationPayload,
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.post<void>("/notifications", payload);
  return response;
};

export const createNotificationByStudentNumber = async (
  payload: DirectNotificationPayload,
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.post<void>(
    "/notifications/admin/direct",
    payload,
  );
  return response;
};

export const getNotifications = async (): Promise<
  AxiosResponse<Notification[]>
> => {
  const response = await tokenInstance.get<Notification[]>("/notifications");
  return response;
};

export const getNotificationsScroll = async (
  lastId: number | null,
  size: number = 20,
): Promise<AxiosResponse<Notification[]>> => {
  const response = await tokenInstance.get<Notification[]>(
    "/notifications/scroll",
    {
      params: {
        lastId,
        size,
      },
    },
  );
  return response;
};

export const getNotificationById = async (
  notificationId: number,
): Promise<AxiosResponse<Notification>> => {
  const response = await tokenInstance.get<Notification>(
    `/notifications/${notificationId}`,
  );
  return response;
};

export const updateNotification = async (
  notificationId: number,
  payload: NotificationPayload,
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.put<void>(
    `/notifications/${notificationId}`,
    payload,
  );
  return response;
};

export const deleteNotification = async (
  notificationId: number,
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.delete<void>(
    `/notifications/${notificationId}`,
  );
  return response;
};

export const addNotificationPreferences = async (
  notificationTypes: string[],
) => {
  const response = await tokenInstance.post<void>(
    "/user-notifications/preferences",
    null,
    {
      params: {
        notificationTypes,
      },
      paramsSerializer: {
        indexes: null,
      },
    },
  );
  return response.data;
};

export const deleteNotificationPreferences = async (
  notificationTypes: string[],
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.delete<void>(
    "/user-notifications/preferences",
    {
      params: {
        notificationTypes,
      },
      paramsSerializer: {
        indexes: null,
      },
    },
  );

  return response;
};

export const getUserNotificationPreferences = async (): Promise<
  AxiosResponse<NotificationPreferences>
> => {
  const response = await tokenInstance.get<NotificationPreferences>(
    "/user-notifications/preferences",
  );
  return response;
};
