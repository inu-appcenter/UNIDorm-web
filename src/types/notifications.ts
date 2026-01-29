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

/**
 * 알림 데이터 형식
 */
export interface NotificationPayload {
  title: string;
  body: string;
  notificationType: "UNIDORM" | "DORMITORY" | "INDIVIDUAL" | string; // 알림 타입
  boardId: number;
}

/**
 * 알림 환경설정 객체의 타입 정의
 */
export interface NotificationPreferences {
  roommateNotification: boolean;
  groupOrderNotification: boolean;
  dormitoryNotification: boolean;
  unidormNotification: boolean;
  supportersNotification: boolean;
}
