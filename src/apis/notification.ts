import type { AxiosResponse } from "axios";
import tokenInstance from "./tokenInstance.ts";
import { NotificationPayload } from "../types/notifications.ts";
import { Notification } from "../types/notifications.ts";

/**
 * 새로운 알림을 생성합니다. (POST /notifications)
 * @param payload 생성할 알림의 정보
 * @returns AxiosResponse<void>
 */
export const createNotification = async (
  payload: NotificationPayload,
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.post<void>("/notifications", payload);
  return response;
};

/**
 * 현재 로그인한 사용자의 모든 알림을 최신순으로 조회합니다. (GET /notifications)
 * @returns AxiosResponse<Notification[]>
 */
export const getNotifications = async (): Promise<
  AxiosResponse<Notification[]>
> => {
  const response = await tokenInstance.get<Notification[]>("/notifications");
  return response;
};

/**
 * 알림 ID로 특정 알림의 상세 정보를 조회합니다. (GET /notifications/{notificationId})
 * @param notificationId 조회할 알림의 ID
 * @returns AxiosResponse<Notification>
 */
export const getNotificationById = async (
  notificationId: number,
): Promise<AxiosResponse<Notification>> => {
  const response = await tokenInstance.get<Notification>(
    `/notifications/${notificationId}`,
  );
  return response;
};

/**
 * 특정 알림의 내용을 수정합니다. (PUT /notifications/{notificationId})
 * @param notificationId 수정할 알림의 ID
 * @param payload 수정할 알림 정보
 * @returns AxiosResponse<void>
 */
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

/**
 * 특정 알림을 삭제합니다. (DELETE /notifications/{notificationId})
 * @param notificationId 삭제할 알림의 ID
 * @returns AxiosResponse<void>
 */
export const deleteNotification = async (
  notificationId: number,
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.delete<void>(
    `/notifications/${notificationId}`,
  );
  return response;
};

// 알림 수신 설정
export const addNotificationPreferences = async (
  notificationTypes: string[],
) => {
  const response = await tokenInstance.post<void>(
    `/user-notifications/preferences`,
    null,
    {
      params: {
        notificationTypes,
      },
      paramsSerializer: {
        // indexes: null을 설정하면 대괄호([]) 없이 직렬화됩니다.
        indexes: null,
      },
    },
  );
  return response.data;
};
