import axiosInstance from "../apis/axiosInstance";
import tokenInstance from "../apis/tokenInstance";
import refreshInstance from "../apis/refreshInstance";
import { ApiResponse } from "../types/common";
import { TokenInfo, UserInfo } from "../types/members";
// import {Post} from "types/posts";

// 회원 가져오기
export const getMembers = async (): Promise<ApiResponse<UserInfo>> => {
  const response =
    await tokenInstance.get<ApiResponse<UserInfo>>(`/api/members`);
  return response.data;
};

// 회원 닉네임/횃불이 이미지 변경
export const putMembers = async (
  nickname: string | null,
  fireId: number,
): Promise<ApiResponse<number>> => {
  if (nickname) {
    const response = await tokenInstance.put<ApiResponse<number>>(
      `/api/members`,
      { nickname, fireId },
    );
    return response.data;
  } else {
    const response = await tokenInstance.put<ApiResponse<number>>(
      `/api/members`,
      { fireId },
    );
    return response.data;
  }
};

// 회원 삭제
export const deleteMembers = async (): Promise<ApiResponse<number>> => {
  const response =
    await tokenInstance.delete<ApiResponse<number>>(`/api/members`);
  return response.data;
};

// 로그인
export const login = async (
  studentId: string,
  password: string,
): Promise<ApiResponse<TokenInfo>> => {
  const response = await axiosInstance.post<ApiResponse<TokenInfo>>(
    `/api/members/login`,
    {
      studentId,
      password,
    },
  );
  return response.data;
};

// 토큰 재발급
export const refresh = async (): Promise<ApiResponse<TokenInfo>> => {
  const response =
    await refreshInstance.post<ApiResponse<TokenInfo>>(`/api/members/refresh`);
  return response.data;
};
