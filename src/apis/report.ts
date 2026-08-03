import tokenInstance from "./tokenInstance";

export type OpenChatReportReason =
  | "SPAM_AD"
  | "ABUSE"
  | "FRAUD"
  | "DISRUPTION"
  | "ETC";

export type OpenChatReportStatus = "PENDING" | "APPROVED" | "CANCELLED";

export interface OpenChatReport {
  reportId: number;
  status: OpenChatReportStatus;
  reason: OpenChatReportReason;
  roomId: number;
  messageId: number;
  reportedContent: string;
  reporterId: number;
  reporterStudentNumber: string;
  reporterName: string;
  targetUserId: number;
  targetStudentNumber: string;
  targetName: string;
  createdDate: string;
}

export interface OpenChatReportPage {
  totalPages: number;
  totalElements: number;
  size: number;
  content: OpenChatReport[];
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface CreateReportRequest {
  category: string;
  title: string;
  content: string;
}

export const createReport = (data: CreateReportRequest) =>
  tokenInstance.post("/reports", data);

export const reportOpenChatMessage = (
  messageId: number,
  reason: OpenChatReportReason,
) =>
  tokenInstance.post(`/open-chat-rooms/messages/${messageId}/reports`, {
    reason,
  });

export const getOpenChatReports = (
  status: OpenChatReportStatus = "PENDING",
  page = 0,
  size = 20,
) =>
  tokenInstance.get<OpenChatReportPage>("/admin/open-chat-reports", {
    params: { status, page, size },
  });

export const approveOpenChatReport = (reportId: number) =>
  tokenInstance.patch<void>(
    `/admin/open-chat-reports/${reportId}/approve`,
  );

export const cancelOpenChatReport = (reportId: number) =>
  tokenInstance.patch<void>(
    `/admin/open-chat-reports/${reportId}/cancel`,
  );

export const getApprovedOpenChatReportCount = (studentNumber: string) =>
  tokenInstance.get<number>("/admin/open-chat-reports/count", {
    params: { studentNumber, status: "APPROVED" },
  });
