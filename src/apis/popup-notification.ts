import {
  PopupNotification,
  RequestPopupNotificationDto,
} from "../types/popup-notifications.ts";
import { AxiosResponse } from "axios";
import tokenInstance from "./tokenInstance.ts";
import axiosInstance from "./axiosInstance.ts";

/**
 * 🔹 오늘 보여야 하는 팝업 알림 조회
 * GET /popup-notifications
 */
export const getPopupNotifications = async (): Promise<
  AxiosResponse<PopupNotification[]>
> => {
  const response = await axiosInstance.get<PopupNotification[]>(
    "/popup-notifications",
  );
  return response;
};

/**
 * 🔹 모든 팝업 알림 조회
 * GET /popup-notifications/admin
 */
export const getAllPopupNotifications = async (): Promise<
  AxiosResponse<PopupNotification[]>
> => {
  const response = await tokenInstance.get<PopupNotification[]>(
    "/popup-notifications/admin",
  );
  return response;
};

/**
 * 🔹 특정 팝업 알림 조회
 * GET /popup-notifications/{popupNotificationId}
 */
export const getPopupNotificationById = async (
  popupNotificationId: number,
): Promise<AxiosResponse<PopupNotification>> => {
  const response = await tokenInstance.get<PopupNotification>(
    `/popup-notifications/${popupNotificationId}`,
  );
  return response;
};

/**
 * 🔹 팝업 알림 생성
 * POST /popup-notifications
 * multipart/form-data
 */
export const createPopupNotification = async (
  data: RequestPopupNotificationDto,
  images?: File[],
): Promise<AxiosResponse<void>> => {
  const formData = new FormData();
  formData.append(
    "requestPopupNotificationDto",
    new Blob([JSON.stringify(data)], { type: "application/json" }),
  );

  if (images && images.length > 0) {
    images.forEach((image) => formData.append("images", image));
  }

  const response = await tokenInstance.post<void>(
    "/popup-notifications",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response;
};

/**
 * 🔹 팝업 알림 수정
 * PUT /popup-notifications/{popupNotificationId}
 * multipart/form-data
 */
export const updatePopupNotification = async (
  popupNotificationId: number,
  data: RequestPopupNotificationDto,
  images?: File[],
): Promise<AxiosResponse<void>> => {
  const formData = new FormData();
  formData.append(
    "requestPopupNotificationDto",
    new Blob([JSON.stringify(data)], { type: "application/json" }),
  );

  if (images && images.length > 0) {
    images.forEach((image) => formData.append("images", image));
  }

  const response = await tokenInstance.put<void>(
    `/popup-notifications/${popupNotificationId}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response;
};

/**
 * 🔹 팝업 알림 삭제
 * DELETE /popup-notifications/{popupNotificationId}
 */
export const deletePopupNotification = async (
  popupNotificationId: number,
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.delete<void>(
    `/popup-notifications/${popupNotificationId}`,
  );
  return response;
};
