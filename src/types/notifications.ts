export type NotificationType =
  | "ROOMMATE"
  | "GROUP_ORDER"
  | "DORMITORY"
  | "UNI_DORM"
  | "SUPPORTERS"
  | "COMPLAINT"
  | "COUPON"
  | "CHAT";

export interface Notification {
  id: number;
  apiType: string;
  boardId: number;
  title: string;
  body: string;
  notificationType: string;
  createdDate: string;
  read: boolean;
}

export interface NotificationPayload {
  title: string;
  body: string;
  notificationType: NotificationType | string;
  boardId?: number;
}

export interface DirectNotificationPayload {
  studentNumber: string;
  title: string;
  content: string;
  notificationType?: NotificationType | string;
}

export interface NotificationPreferences {
  roommateNotification: boolean;
  groupOrderNotification: boolean;
  dormitoryNotification: boolean;
  unidormNotification: boolean;
  supportersNotification: boolean;
  complaintNotification: boolean;
}
