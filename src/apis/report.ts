import tokenInstance from "./tokenInstance";

export interface CreateReportRequest {
  category: string;
  title: string;
  content: string;
}

export const createReport = (data: CreateReportRequest) =>
  tokenInstance.post("/reports", data);
