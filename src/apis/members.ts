import axiosInstance from "../apis/axiosInstance";
import tokenInstance from "../apis/tokenInstance";
import { ApiResponse } from "@/types/common";
import { MyPost_GroupOrder, TokenInfo, UserInfo } from "@/types/members";
import { appendDebugLog } from "@/utils/debugLog";
import { AxiosError, AxiosResponse } from "axios";

export const getMemberInfo = async (): Promise<AxiosResponse<UserInfo>> => {
  const response = await tokenInstance.get<UserInfo>(`/users`);
  console.log(response);
  return response;
};

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

export const getUserTimetableImage = async (): Promise<AxiosResponse> => {
  const response = await tokenInstance.get<AxiosResponse>(
    `/users/time-table-image`,
  );
  return response;
};

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

export const deleteMembers = async (): Promise<number> => {
  const response = await tokenInstance.delete(`/users`);
  return response.status;
};

export const signupFreshman = async (
  studentNumber: string,
  password: string,
): Promise<AxiosResponse<TokenInfo>> => {
  const response = await axiosInstance.post<TokenInfo>(
    `/users/freshman/register`,
    {
      studentNumber,
      password,
    },
  );
  return response;
};

export const loginFreshman = async (
  studentNumber: string,
  password: string,
): Promise<AxiosResponse<TokenInfo>> => {
  const response = await axiosInstance.post<TokenInfo>(`/users/freshman`, {
    studentNumber,
    password,
  });
  return response;
};

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

type RefreshResponsePayload = Partial<TokenInfo> & {
  data?: Partial<TokenInfo>;
};

const normalizeRefreshTokenInfo = (
  payload: ApiResponse<TokenInfo> | RefreshResponsePayload | undefined,
  currentRefreshToken: string,
): TokenInfo => {
  const flatPayload = payload as RefreshResponsePayload | undefined;
  const nestedPayload = flatPayload?.data;
  const accessToken =
    nestedPayload?.accessToken ?? flatPayload?.accessToken ?? "";
  const nextRefreshToken =
    nestedPayload?.refreshToken ??
    flatPayload?.refreshToken ??
    currentRefreshToken;
  const role =
    nestedPayload?.role ??
    flatPayload?.role ??
    localStorage.getItem("role") ??
    "";

  if (!accessToken) {
    throw new Error("리프레시 응답에 액세스 토큰이 없습니다.");
  }

  return {
    accessToken,
    refreshToken: nextRefreshToken,
    role,
  };
};

export const refresh = async (): Promise<TokenInfo> => {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    appendDebugLog({
      category: "token-refresh",
      action: "리프레시 토큰 없음",
      details: {
        endpoint: "/users/refreshToken",
      },
    });
    throw new Error("리프레시 토큰이 없습니다.");
  }

  appendDebugLog({
    category: "token-refresh",
    action: "리프레시 토큰 재발급 요청",
    details: {
      endpoint: "/users/refreshToken",
    },
  });

  console.log("refresh", refreshToken);

  try {
    const response = await axiosInstance.post<
      ApiResponse<TokenInfo> | RefreshResponsePayload
    >("/users/refreshToken", {
      refreshToken: `Bearer ${refreshToken}`,
    });
    const tokenInfo = normalizeRefreshTokenInfo(response.data, refreshToken);

    appendDebugLog({
      category: "token-refresh",
      action: "리프레시 토큰 재발급 성공",
      details: {
        endpoint: "/users/refreshToken",
        status: response.status,
        hasAccessToken: Boolean(tokenInfo.accessToken),
        hasRefreshToken: Boolean(tokenInfo.refreshToken),
        hasRole: Boolean(tokenInfo.role),
      },
    });

    console.log("리프레시 응답");
    console.log(response);

    return tokenInfo;
  } catch (error) {
    const refreshError = error as AxiosError;

    appendDebugLog({
      category: "token-refresh",
      action: "리프레시 토큰 재발급 실패",
      details: {
        endpoint: "/users/refreshToken",
        status: refreshError.response?.status ?? null,
        message: refreshError.message,
      },
    });

    throw error;
  }
};

export const getMemberPosts = async (): Promise<
  AxiosResponse<MyPost_GroupOrder[]>
> => {
  const response = await tokenInstance.get<MyPost_GroupOrder[]>(`/users/board`);
  console.log(response);
  return response;
};

export const getMemberLikePosts = async (): Promise<
  AxiosResponse<MyPost_GroupOrder[]>
> => {
  const response = await tokenInstance.get<MyPost_GroupOrder[]>(`/users/like`);
  console.log(response);
  return response;
};

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

export const putInuStudent = async (
  studentNumber: string,
  password: string,
): Promise<AxiosResponse<TokenInfo>> => {
  console.log(studentNumber, password);

  const response = await tokenInstance.put<TokenInfo>(`/users/inu-student`, {
    studentNumber,
    password,
  });

  return response;
};
