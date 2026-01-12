import axiosInstance from "../apis/axiosInstance";
import tokenInstance from "../apis/tokenInstance";
import { ApiResponse } from "@/types/common";
import { MyPost_GroupOrder, TokenInfo, UserInfo } from "@/types/members";
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

// 회원 시간표이미지 가져오기
export const getUserTimetableImage = async (): Promise<AxiosResponse> => {
  const response = await tokenInstance.get<AxiosResponse>(
    `/users/time-table-image`,
  );
  return response;
};

//룸메이트의 시간표 이미지 가져오기
export const getMyRoommateTimeTableImage = async (): Promise<AxiosResponse> => {
  const response = await tokenInstance.get<AxiosResponse>(
    "/my-roommate/time-table-image",
  );
  return response;
};

export const putUserTimetableImage = async (
  imageFile: File,
): Promise<AxiosResponse> => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await tokenInstance.put(
    "/users/time-table-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response;
};

// 회원 삭제
export const deleteMembers = async (): Promise<number> => {
  const response = await tokenInstance.delete(`/users`);
  return response.status;
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
export const refresh = async (): Promise<ApiResponse> => {
  const refreshToken = localStorage.getItem("refreshToken"); // 필요에 따라 위치 변경 가능
  if (!refreshToken) {
    throw new Error("리프레시 토큰이 없습니다.");
  }
  console.log("refresh", refreshToken);
  const response = await axiosInstance.post<ApiResponse<TokenInfo>>(
    "/users/refreshToken",
    { refreshToken: `Bearer ${refreshToken}` },
  );

  if (response) {
    console.log("리프레시응답");
    console.log(response);
  }

  return response;
};

// 사용자가 작성한 게시글 조회
export const getMemberPosts = async (): Promise<
  AxiosResponse<MyPost_GroupOrder[]>
> => {
  const response = await tokenInstance.get<MyPost_GroupOrder[]>(`/users/board`);
  console.log(response);
  return response;
};

// 사용자가 좋아요한 게시글 조회
export const getMemberLikePosts = async (): Promise<
  AxiosResponse<MyPost_GroupOrder[]>
> => {
  const response = await tokenInstance.get<MyPost_GroupOrder[]>(`/users/like`);
  console.log(response);
  return response;
};

//개인정보, 이용약관 동의
export const putUserAgreement = async (
  isTermsAgreed: boolean,
  isPrivacyAgreed: boolean,
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.put<void>(`/users/agreement`, null, {
    params: {
      isTermsAgreed,
      isPrivacyAgreed,
    },
  });
  console.log(response);
  return response;
};
