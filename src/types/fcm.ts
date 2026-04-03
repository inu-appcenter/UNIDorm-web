export interface SendAllFcmPayload {
  title: string;
  body: string;
}

export interface SendAllFcmResponse {
  messageId: string;
  status: string;
}

export interface FcmStatsResponse {
  date: string;
  successCount: number;
  failCount: number;
}
