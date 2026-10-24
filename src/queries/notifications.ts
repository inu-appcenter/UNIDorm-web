import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getNotificationsScroll,
  getUserNotificationPreferences,
} from "@/apis/notification";

export const notificationKeys = {
  all: ["notifications"] as const,
  scroll: () => [...notificationKeys.all, "scroll"] as const,
  preferences: () => [...notificationKeys.all, "preferences"] as const,
};

export const useNotificationScroll = (
  pageSize: number = 20,
  options?: { enabled?: boolean },
) =>
  useInfiniteQuery({
    queryKey: [...notificationKeys.scroll(), pageSize],
    queryFn: ({ pageParam }) =>
      getNotificationsScroll(pageParam as number | null, pageSize),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => {
      const lastItems = lastPage.data;
      if (!lastItems || lastItems.length < pageSize) return undefined;
      return lastItems[lastItems.length - 1].id;
    },
    staleTime: 1000 * 60,
    ...options,
  });

export const useUserNotificationPreferences = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: () => getUserNotificationPreferences().then((res) => res.data),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
