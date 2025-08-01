// src/apis/tips.ts
import axiosInstance from "./axiosInstance";
import { Tip } from "../types/tips.ts";

export const fetchTips = async (): Promise<Tip[]> => {
  const response = await axiosInstance.get("/tips");
  return response.data;
};

export const fetchDailyRandomTips = async (): Promise<Tip[]> => {
  const response = await axiosInstance.get<Tip[]>("/tips/daily-random");
  return response.data;
};
