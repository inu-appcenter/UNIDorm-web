// 통계 응답 데이터 타입 정의
import { AxiosResponse } from "axios";
import tokenInstance from "@/apis/tokenInstance";

export interface StatisticResponse {
  date: string;
  apiPath: string;
  httpMethod: string;
  callCount: number;
  lastCalledAt: string;
}

// 특정 날짜 API 호출 통계 조회
export const getStatistics = async (
  date?: string,
  from?: string,
  to?: string,
  apiPath?: string,
): Promise<AxiosResponse<StatisticResponse[]>> => {
  const response = await tokenInstance.get<StatisticResponse[]>(`/statistics`, {
    params: {
      date,
      from,
      to,
      apiPath,
    },
  });
  console.log(response);
  return response;
};

// 특정 API 총 호출 횟수 조회
export const getStatisticsTotal = async (
  apiPath: string,
  from?: string,
  to?: string,
): Promise<AxiosResponse<number>> => {
  const response = await tokenInstance.get<number>(`/statistics/total`, {
    params: {
      apiPath,
      from,
      to,
    },
  });
  console.log(response);
  return response;
};
