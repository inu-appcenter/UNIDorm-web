import type { AxiosResponse } from "axios";
import tokenInstance from "./tokenInstance.ts";
import {
  FcmStatsResponse,
  SendAllFcmPayload,
  SendAllFcmResponse,
} from "@/types/fcm";

export const sendFcmToAllUsers = async (
  payload: SendAllFcmPayload,
): Promise<AxiosResponse<SendAllFcmResponse>> => {
  const response = await tokenInstance.post<SendAllFcmResponse>(
    "/fcm/send/all",
    payload,
  );
  return response;
};

export const getFcmStats = async (): Promise<AxiosResponse<FcmStatsResponse>> => {
  const response = await tokenInstance.get<FcmStatsResponse>("/fcm/stats");
  return response;
};

/** FCM 토큰 연결 해제 (현재 로그인 유저의 FCM 토큰 user_id 매핑 제거) */
export const unlinkFcmToken = async (): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.delete<void>("/fcm/token");
  return response;
};

