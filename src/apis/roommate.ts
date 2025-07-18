// 룸메이트 게시글 최신순 목록 조회
import { AxiosResponse } from "axios";
import tokenInstance from "./tokenInstance.ts";
import {
  RoommatePost,
  RoommatePostRequest,
  RoommatePostResponse,
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
