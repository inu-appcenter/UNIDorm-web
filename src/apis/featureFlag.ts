import { AxiosResponse } from "axios";
import axiosInstance from "@/apis/axiosInstance";
import tokenInstance from "@/apis/tokenInstance";
import { getSessionId } from "@/utils/session";
import { APP_VERSION, getOsHeaderValue } from "@/utils/deviceInfo";

export interface FeatureFlag {
  key: string;
  flag: boolean;
}

export interface AbTestGroup {
  group: "A" | "B" | "OFF";
  experimentId?: string;
  userId?: string;
  userType?: "existing" | "new";
  timestamp?: string;
}

// 로그인 유저의 A/B 실험 그룹 조회
export const getAbTestGroup = async (
  key: string,
): Promise<AxiosResponse<AbTestGroup>> => {
  const response = await tokenInstance.get<AbTestGroup>(
    `/features/ab/${key}`,
    {
      headers: {
        "X-App-Version": APP_VERSION,
        "X-OS": getOsHeaderValue(),
        "X-Session-Id": getSessionId(),
      },
    },
  );
  return response;
};

// 전체 기능 플래그 목록 조회
export const getFeatureFlags = async (): Promise<
  AxiosResponse<FeatureFlag[]>
> => {
  const response = await axiosInstance.get<FeatureFlag[]>(`/features`);
  console.log(response);
  return response;
};

// 특정 기능 플래그 조회
export const getFeatureFlagByKey = async (
  key: string,
): Promise<AxiosResponse<FeatureFlag>> => {
  const response = await axiosInstance.get<FeatureFlag>(`/features/${key}`);
  console.log(response);
  return response;
};

// 기능 플래그 생성
export const createFeatureFlag = async (
  data: FeatureFlag,
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.post<void>(`/features`, data);
  console.log(response);
  return response;
};

// 기능 플래그 수정
export const updateFeatureFlag = async (
  data: FeatureFlag,
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.put<void>(`/features`, data);
  console.log(response);
  return response;
};
