import type { AxiosResponse } from "axios";
import tokenInstance from "./tokenInstance.ts";
import {
  Notification,
  NotificationPayload,
  NotificationPreferences,
} from "@/types/notifications";

/**
 * 알림 생성 및 푸시 전송 (POST /notifications)
 * 대상: 유니돔(전체), 생활원(사생), 기타(개별)
 */
export const createNotification = async (
  payload: NotificationPayload,
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.post<void>("/notifications", payload);
  return response;
};

/**
 * 학번 기준 개별 알림 전송
 * 경로 변수 및 쿼리 파라미터 중복 적용
 */
export const createNotificationByStudentNumber = async (
  studentNumber: string,
  payload: NotificationPayload,
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.post<void>(
    `/notifications/student-number/{studentNumber}`,
    payload,
    {
      params: { studentNumber }, // 쿼리 스트링 추가 (?studentNumber=...)
    },
  );
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
 * 사용자 알림 목록 무한스크롤 조회 (조회 시 자동 읽음 처리)
 * @param lastId 마지막 조회 알림 ID (커서)
 * @param size 조회 개수
 * @returns AxiosResponse<Notification[]>
 */
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

/**
 * 사용자의 알림 수신 설정을 삭제합니다. (DELETE /user-notifications/preferences)
 * * 이 함수는 쿼리 파라미터로 삭제할 알림 타입 목록을 배열 형태로 전송합니다.
 * * @param notificationTypes 삭제할 알림 타입 배열 (예: ["공동구매", "룸메이트"])
 * @returns AxiosResponse<void> (성공 시 204 No Content)
 */
export const deleteNotificationPreferences = async (
  notificationTypes: string[],
): Promise<AxiosResponse<void>> => {
  // DELETE 요청 시 쿼리 파라미터를 사용하기 위해 Axios의 'params' 옵션을 사용합니다.
  const response = await tokenInstance.delete<void>(
    "/user-notifications/preferences",
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

  return response;
};

/**
 * 현재 로그인한 사용자의 알림 환경설정을 조회합니다. (GET /user-notifications/preferences)
 * @returns AxiosResponse<NotificationPreferences>
 */
export const getUserNotificationPreferences = async (): Promise<
  AxiosResponse<NotificationPreferences>
> => {
  const response = await tokenInstance.get<NotificationPreferences>(
    "/user-notifications/preferences",
  );
  return response;
};
