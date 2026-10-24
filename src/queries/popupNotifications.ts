import { useQuery } from "@tanstack/react-query";
import {
  getAllPopupNotifications,
  getPopupNotificationById,
  getPopupNotifications,
} from "@/apis/popup-notification";

export const popupNotificationKeys = {
  all: ["popupNotifications"] as const,
  active: () => ["popupNotifications", "active"] as const,
  admin: () => ["popupNotifications", "admin"] as const,
  detail: (id: number) => ["popupNotifications", "detail", id] as const,
};

/**
 * 지금 노출 중인 팝업 공지 (홈 팝업, 공지 탭 상단).
 * 다시 조회하면 닫은 팝업이 다시 열릴 수 있어 자동 재조회하지 않습니다.
 */
export const useActivePopupNotifications = () =>
  useQuery({
    queryKey: popupNotificationKeys.active(),
    queryFn: async () => (await getPopupNotifications()).data,
    meta: { sync: "none" },
  });

/** 관리자: 전체 팝업 공지. */
export const useAdminPopupNotifications = () =>
  useQuery({
    queryKey: popupNotificationKeys.admin(),
    queryFn: async () => (await getAllPopupNotifications()).data,
  });

/** 관리자: 팝업 공지 하나 (수정 폼). */
export const usePopupNotification = (id: number | undefined) =>
  useQuery({
    queryKey: popupNotificationKeys.detail(id ?? 0),
    queryFn: async () => (await getPopupNotificationById(id!)).data,
    enabled: !!id,
  });
