import { AxiosResponse } from "axios";
import tokenInstance from "./tokenInstance.ts";

export interface StudentIdDisclosureStatus {
  status: "NONE" | "REQUESTED" | "RECEIVED" | "ACCEPTED" | "REJECTED" | string;
  requestId: number;
  targetStudentNumber: string | null;
}

export interface DisclosureRequestResponse {
  requestId: number;
}

export interface DisclosureAcceptResponse {
  requestId: number;
  requesterStudentNumber: string;
}

/**
 * 특정 사용자와의 학번 공개 상태를 조회합니다.
 */
export const getStudentIdDisclosureStatus = async (
  roomId: number,
  targetId: number,
): Promise<AxiosResponse<StudentIdDisclosureStatus>> => {
  return tokenInstance.get<StudentIdDisclosureStatus>(
    `/student-id-disclosures/status`,
    {
      params: { roomId, targetId },
    },
  );
};

/**
 * 같은 오픈채팅방 참여자에게 학번 공개를 요청합니다.
 */
export const requestStudentIdDisclosure = async (
  roomId: number,
  targetId: number,
): Promise<AxiosResponse<DisclosureRequestResponse>> => {
  return tokenInstance.post<DisclosureRequestResponse>(
    `/student-id-disclosures`,
    {
      roomId,
      targetId,
    },
  );
};

/**
 * 내가 보낸 학번 공개 요청을 취소합니다.
 */
export const cancelStudentIdDisclosure = async (
  requestId: number,
): Promise<AxiosResponse<void>> => {
  return tokenInstance.delete<void>(`/student-id-disclosures/${requestId}`);
};

/**
 * 받은 학번 공개 요청을 거절합니다.
 */
export const rejectStudentIdDisclosure = async (
  requestId: number,
): Promise<AxiosResponse<void>> => {
  return tokenInstance.post<void>(
    `/student-id-disclosures/${requestId}/reject`,
  );
};

/**
 * 받은 학번 공개 요청을 수락합니다.
 */
export const acceptStudentIdDisclosure = async (
  requestId: number,
): Promise<AxiosResponse<DisclosureAcceptResponse>> => {
  return tokenInstance.post<DisclosureAcceptResponse>(
    `/student-id-disclosures/${requestId}/accept`,
  );
};
