// src/apis/tips.ts
import axiosInstance from "./axiosInstance";
import { Tip } from "@/types/tips";
import tokenInstance from "./tokenInstance.ts";

export const fetchTips = async (): Promise<Tip[]> => {
  const response = await axiosInstance.get("/tips");
  return response.data;
};

export const fetchDailyRandomTips = async (): Promise<Tip[]> => {
  const response = await axiosInstance.get<Tip[]>("/tips/daily-random");
  return response.data;
};

// 팁 댓글 삭제
export const deleteTipComment = async (tipCommentId: number): Promise<void> => {
  await tokenInstance.delete(`/tip-comments/${tipCommentId}`);
};
