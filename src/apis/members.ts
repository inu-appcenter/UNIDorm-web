import axiosInstance from "../apis/axiosInstance";
import tokenInstance from "../apis/tokenInstance";
import refreshInstance from "../apis/refreshInstance";
import { ApiResponse } from "../types/common";
import { MyPost, TokenInfo, UserInfo } from "../types/members";
import { AxiosResponse } from "axios";

// 회원 가져오기
export const getMemberInfo = async (): Promise<AxiosResponse<UserInfo>> => {
  const response = await tokenInstance.get<UserInfo>(`/users`);
  console.log(response);
  return response;
};

// 회원 프로필이미지 가져오기
export const getMemberImage = async (): Promise<AxiosResponse> => {
  const response = await tokenInstance.get<AxiosResponse>(`/users/image`);
  return response;
};

export const putUserImage = async (imageFile: File): Promise<AxiosResponse> => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await tokenInstance.put("/users/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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

  return response;
};

// 회원정보 수정
export const putMember = async (
  name: string,
  college: string,
  dormType: string,
  penalty: number,
): Promise<AxiosResponse<TokenInfo>> => {
  console.log(name, college, dormType, penalty);
  const response = await tokenInstance.put<TokenInfo>(`/users`, {
    name,
    college,
    dormType,
    penalty,
  });

  return response;
};

// 토큰 재발급
export const refresh = async (): Promise<ApiResponse<TokenInfo>> => {
  const response =
    await refreshInstance.post<ApiResponse<TokenInfo>>(`/users/refreshToken`);
  console.log(response);
  return response.data;
};

// 사용자가 작성한 게시글 조회
export const getMemberPosts = async (): Promise<AxiosResponse<MyPost[]>> => {
  const response = await tokenInstance.get<MyPost[]>(`/users/board`);
  console.log(response);
  return response;
};

// 사용자가 좋아요한 게시글 조회
export const getMemberLikePosts = async (): Promise<
  AxiosResponse<MyPost[]>
> => {
  const response = await tokenInstance.get<MyPost[]>(`/users/like`);
  console.log(response);
  return response;
};
