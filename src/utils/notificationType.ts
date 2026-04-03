import type { NotificationType } from "@/types/notifications";

export interface NotificationTypeOption {
  value: NotificationType;
  title: string;
  description: string;
}

export const NOTIFICATION_TYPE_OPTIONS: NotificationTypeOption[] = [
  {
    value: "UNI_DORM",
    title: "유니돔",
    description:
      "알림함과 발송 미리보기 상단 타입 라벨에 '유니돔'으로 표시됩니다.",
  },
  {
    value: "DORMITORY",
    title: "생활원",
    description:
      "알림함과 발송 미리보기 상단 타입 라벨에 '생활원'으로 표시됩니다.",
  },
  {
    value: "ROOMMATE",
    title: "룸메이트",
    description:
      "알림함과 발송 미리보기 상단 타입 라벨에 '룸메이트'로 표시됩니다.",
  },
  {
    value: "GROUP_ORDER",
    title: "공동구매",
    description:
      "알림함과 발송 미리보기 상단 타입 라벨에 '공동구매'로 표시됩니다.",
  },
  {
    value: "SUPPORTERS",
    title: "서포터즈",
    description:
      "알림함과 발송 미리보기 상단 타입 라벨에 '서포터즈'로 표시됩니다.",
  },
  {
    value: "COMPLAINT",
    title: "민원",
    description:
      "알림함과 발송 미리보기 상단 타입 라벨에 '민원'으로 표시됩니다.",
  },
  {
    value: "COUPON",
    title: "쿠폰",
    description:
      "알림함과 발송 미리보기 상단 타입 라벨에 '쿠폰'으로 표시됩니다.",
  },
  {
    value: "CHAT",
    title: "채팅",
    description:
      "알림함과 발송 미리보기 상단 타입 라벨에 '채팅'으로 표시됩니다.",
  },
];

const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  ROOMMATE: "룸메이트",
  GROUP_ORDER: "공동구매",
  DORMITORY: "생활원",
  UNI_DORM: "유니돔",
  SUPPORTERS: "서포터즈",
  COMPLAINT: "민원",
  COUPON: "쿠폰",
  CHAT: "채팅",
};

const NOTIFICATION_TYPE_ALIASES: Record<string, NotificationType> = {
  ROOMMATE: "ROOMMATE",
  "룸메이트": "ROOMMATE",
  GROUP_ORDER: "GROUP_ORDER",
  GROUPORDER: "GROUP_ORDER",
  "공동구매": "GROUP_ORDER",
  DORMITORY: "DORMITORY",
  "생활원": "DORMITORY",
  UNI_DORM: "UNI_DORM",
  UNIDORM: "UNI_DORM",
  "유니돔": "UNI_DORM",
  SUPPORTERS: "SUPPORTERS",
  "서포터즈": "SUPPORTERS",
  COMPLAINT: "COMPLAINT",
  "민원": "COMPLAINT",
  COUPON: "COUPON",
  "쿠폰": "COUPON",
  CHAT: "CHAT",
  "채팅": "CHAT",
};

export const normalizeNotificationType = (
  value?: string | null,
): NotificationType | string => {
  if (!value) {
    return "UNI_DORM";
  }

  const trimmedValue = value.trim();
  const normalizedKey = trimmedValue.replace(/[\s-]+/g, "_").toUpperCase();

  return (
    NOTIFICATION_TYPE_ALIASES[normalizedKey] ??
    NOTIFICATION_TYPE_ALIASES[trimmedValue] ??
    trimmedValue
  );
};

export const isKnownNotificationType = (
  value: string,
): value is NotificationType =>
  Object.prototype.hasOwnProperty.call(NOTIFICATION_TYPE_LABELS, value);

export const getNotificationTypeLabel = (value?: string | null): string => {
  if (!value) {
    return NOTIFICATION_TYPE_LABELS.UNI_DORM;
  }

  const normalizedType = normalizeNotificationType(value);
  return isKnownNotificationType(normalizedType)
    ? NOTIFICATION_TYPE_LABELS[normalizedType]
    : value;
};
