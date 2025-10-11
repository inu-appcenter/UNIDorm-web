// GET 응답에 사용될 알림 타입
export interface Notification {
  id: number;
  apiType: string;
  boardId: number;
  title: string;
  body: string;
  notificationType: string;
  createdDate: string; // ISO 8601 형식의 날짜 문자열
  read: boolean;
}

// POST, PUT 요청 본문에 사용될 타입
export interface NotificationPayload {
  title: string;
  body: string;
  notificationType: string;
  boardId: number;
}
