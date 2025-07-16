// 룸메이트 게시글 최신순 목록 조회
import { AxiosResponse } from "axios";
import tokenInstance from "./tokenInstance.ts";
import { RoommatePost, SimilarRoommatePost } from "../types/roommates.ts";

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
