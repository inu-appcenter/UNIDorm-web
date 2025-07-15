import axiosInstance from "../apis/axiosInstance";
import tokenInstance from "../apis/tokenInstance";
import refreshInstance from "../apis/refreshInstance";
import { ApiResponse } from "../types/common";
import { TokenInfo, UserInfo } from "../types/members";
import { AxiosResponse } from "axios";
// import {Post} from "types/posts";

// 회원 가져오기
export const getMemberInfo = async (): Promise<AxiosResponse<UserInfo>> => {
  const response = await tokenInstance.get<UserInfo>(`/users`);
  console.log(response);
  return response;
};

// 회원 프로필이미지 가져오기
export const getMemberImage = async (): Promise<AxiosResponse<UserInfo>> => {
  const response = await tokenInstance.get<UserInfo>(`/users/image`);
  return response;
};

// 회원 삭제
export const deleteMembers = async (): Promise<ApiResponse<number>> => {
  const response =
    await tokenInstance.delete<ApiResponse<number>>(`/api/members`);
  return response.data;
};

// 로그인
export const login = async (
  studentNumber: string,
  password: string,
): Promise<AxiosResponse<TokenInfo>> => {
  const response = await axiosInstance.post<TokenInfo>(`/users`, {
    studentNumber,
    password,
  });

  return response; // AxiosResponse 그대로 반환
};

// 토큰 재발급
export const refresh = async (): Promise<ApiResponse<TokenInfo>> => {
  const response =
    await refreshInstance.post<ApiResponse<TokenInfo>>(`/api/members/refresh`);
  return response.data;
};
