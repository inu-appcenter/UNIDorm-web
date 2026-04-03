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
