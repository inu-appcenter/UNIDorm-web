export interface PopupNotification {
  id: number;
  title: string;
  content: string;
  notificationType: string; // 룸메이트, 공동구매, 생활원, 유니돔, 서포터즈 중 하나
  startDate: string;
  deadline: string; // YYYY-MM-DD
  createdDate: string; // YYYY-MM-DD
  imagePath: string[];
}

export interface RequestPopupNotificationDto {
  title: string;
  content: string;
  notificationType: string;
  startDate: string;
  deadline: string;
}
