import tokenInstance from "@/apis/tokenInstance";

export interface FeatureFlag {
  key: string;
  flag: boolean;
}

import { AxiosResponse } from "axios";
import axiosInstance from "@/apis/axiosInstance";

// 전체 기능 플래그 목록 조회
export const getFeatureFlags = async (): Promise<
  AxiosResponse<FeatureFlag[]>
> => {
  const response = await tokenInstance.get<FeatureFlag[]>(`/features`);
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
