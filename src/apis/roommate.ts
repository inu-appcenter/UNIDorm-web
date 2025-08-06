// 룸메이트 게시글 최신순 목록 조회
import { AxiosResponse } from "axios";
import tokenInstance from "./tokenInstance.ts";
import {
  MyRoommateInfoResponse,
  ReceivedMatchingRequest,
  RoommateMatchingRequest,
  RoommateMatchingResponse,
  RoommatePost,
  RoommatePostRequest,
  RoommatePostResponse,
  RoommateRulesResponse,
  RoommateRulesUpdateRequest,
  SimilarRoommatePost,
} from "../types/roommates.ts";

export const getRoomMateList = async (): Promise<
  AxiosResponse<RoommatePost[]>
> => {
  const response = await tokenInstance.get<RoommatePost[]>(`/roommates/list`);
  console.log(response);
  return response;
};

export const getSimilarRoomMateList = async (): Promise<
  AxiosResponse<SimilarRoommatePost[]>
> => {
  const response =
    await tokenInstance.get<SimilarRoommatePost[]>(`/roommates/similar`);
  console.log(response);
  return response;
};

export const createRoommatePost = async (
  data: RoommatePostRequest,
): Promise<AxiosResponse<RoommatePostResponse>> => {
  console.log(data);
  const response = await tokenInstance.post<RoommatePostResponse>(
    "/roommates",
    data,
  );
  return response;
};

export const putRoommatePost = async (
  data: RoommatePostRequest,
): Promise<AxiosResponse<RoommatePostResponse>> => {
  console.log(data);
  const response = await tokenInstance.put<RoommatePostResponse>(
    "/roommates",
    data,
  );
  return response;
};

/**
 * 룸메이트 게시글 단일 조회 API
 * @param boardId 조회할 게시글 ID
 * @returns 게시글 상세 정보
 */
export const getRoomMateDetail = async (
  boardId: number,
): Promise<AxiosResponse<RoommatePost>> => {
  const response = await tokenInstance.get<RoommatePost>(
    `/roommates/${boardId}`,
  );
  console.log(response);
  return response;
};
export const getRoommateLiked = async (
  boardId: number,
): Promise<AxiosResponse<boolean>> => {
  const response = await tokenInstance.get<boolean>(
    `/roommates/${boardId}/liked`,
  );
  console.log(response);
  return response;
};

export const requestRoommateMatching = async (
  data: RoommateMatchingRequest,
): Promise<AxiosResponse<RoommateMatchingResponse>> => {
  const response = await tokenInstance.post<RoommateMatchingResponse>(
    "/roommate-matching/request",
    data,
  );
  return response;
};

export const getMyRoommateInfo = async (): Promise<
  AxiosResponse<MyRoommateInfoResponse>
> => {
  const response = await tokenInstance.get<MyRoommateInfoResponse>(
    "/my-roommate/informations",
  );
  return response;
};

export const getMyRoommateRules = async (): Promise<
  AxiosResponse<RoommateRulesResponse>
> => {
  return await tokenInstance.get<RoommateRulesResponse>("/my-roommate/rules");
};

export const updateMyRoommateRules = async (
  data: RoommateRulesUpdateRequest,
): Promise<AxiosResponse<void>> => {
  return await tokenInstance.post("/my-roommate", data);
};

export const deleteMyRoommateRules = async (): Promise<AxiosResponse<void>> => {
  return await tokenInstance.delete("/my-roommate");
};

export const getOpponentChecklist = async (
  chatRoomId: number,
): Promise<AxiosResponse<RoommatePost>> => {
  const response = await tokenInstance.get<RoommatePost>(
    `/roommate-chatting-room/roommate-chatrooms/${chatRoomId}/opponent-checklist`,
  );
  return response;
};

export const getMyChecklist = async (): Promise<
  AxiosResponse<RoommatePost>
> => {
  const response = await tokenInstance.get<RoommatePost>(
    `/roommates/my-checklist`,
  );
  return response;
};

export const deleteRoommateChatRoom = async (
  chatRoomId: number,
): Promise<AxiosResponse<void>> => {
  return await tokenInstance.delete(`/roommate-chatting-room/${chatRoomId}`);
};

export const likeRoommateBoard = async (
  boardId: number,
): Promise<AxiosResponse<number>> => {
  return await tokenInstance.post(`/roommates/${boardId}/like`);
};
export const unlikeRoommateBoard = async (
  boardId: number,
): Promise<AxiosResponse<number>> => {
  return await tokenInstance.delete(`/roommates/${boardId}/like`);
};

export const getReceivedRoommateRequests = async (): Promise<
  AxiosResponse<ReceivedMatchingRequest[]>
> => {
  const response = await tokenInstance.get<ReceivedMatchingRequest[]>(
    "/roommate-matching/received",
  );
  console.log(response);
  return response;
};

export const rejectRoommateMatching = async (
  matchingId: number,
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.patch<void>(
    `/roommate-matching/${matchingId}/reject`,
  );
  return response;
};

export const acceptRoommateMatching = async (
  matchingId: number,
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.patch<void>(
    `/roommate-matching/${matchingId}/accept`,
  );
  return response;
};

export const cancelRoommateMatching = async (
  matchingId: number,
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.patch<void>(
    `/roommate-matching/${matchingId}/cancel`,
  );
  return response;
};
