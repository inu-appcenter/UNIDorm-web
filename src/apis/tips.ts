// src/apis/tips.ts
import axiosInstance from "./axiosInstance";

export interface Tip {
  id: number;
  title: string;
  type: string;
  createDate: string;
  filePath: string;
  content: string;
  tipLikeCount: number;
  tipCommentCount: number;
}

export const fetchTips = async (): Promise<Tip[]> => {
  const response = await axiosInstance.get("/tips");
  return response.data;
};
