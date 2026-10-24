// src/apis/tips.ts
import axiosInstance from "./axiosInstance";
import { Tip, TipDetail, TipImage } from "@/types/tips";
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

// 팁 상세
export const getTipDetail = async (tipId: number): Promise<TipDetail> => {
  const response = await tokenInstance.get<TipDetail>(`/tips/${tipId}`);
  return response.data;
};

// 팁 이미지
export const getTipImages = async (tipId: number): Promise<TipImage[]> => {
  const response = await tokenInstance.get<TipImage[]>(`/tips/${tipId}/image`);
  return response.data;
};

// 팁 작성 (requestTipDto + images 를 담은 multipart)
export const createTip = async (formData: FormData): Promise<void> => {
  await tokenInstance.post("/tips", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// 팁 수정
export const updateTip = async (
  tipId: number,
  formData: FormData,
): Promise<void> => {
  await tokenInstance.put(`/tips/${tipId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// 팁 삭제
export const deleteTip = async (tipId: number): Promise<void> => {
  await tokenInstance.delete(`/tips/${tipId}`);
};

// 팁 좋아요 / 좋아요 취소
export const setTipLiked = async (
  tipId: number,
  liked: boolean,
): Promise<void> => {
  await tokenInstance.patch(`/tips/${tipId}/${liked ? "like" : "unlike"}`);
};

// 팁 댓글·답글 작성 (parentCommentId 가 null 이면 댓글)
export const createTipComment = async (body: {
  parentCommentId: number | null;
  tipId: number;
  reply: string;
}): Promise<void> => {
  await tokenInstance.post("/tip-comments", body);
};
