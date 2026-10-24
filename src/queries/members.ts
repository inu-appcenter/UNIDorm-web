import { useQuery } from "@tanstack/react-query";
import {
  getMemberImage,
  getMemberInfo,
  getMemberLikePosts,
  getMemberPosts,
} from "@/apis/members";
import { getUserNotificationPreferences } from "@/apis/notification";
import type { MyPost, UserInfo } from "@/types/members";
import type { NotificationPreferences } from "@/types/notifications";

export const memberKeys = {
  all: ["members"] as const,
  info: () => ["members", "info"] as const,
  image: () => ["members", "image"] as const,
  posts: () => ["members", "posts"] as const,
  likePosts: () => ["members", "likePosts"] as const,
  preferences: () => ["members", "notificationPreferences"] as const,
};

/** 내 회원 정보 조회. */
export const useMemberInfo = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: memberKeys.info(),
    queryFn: async (): Promise<UserInfo> => {
      const res = await getMemberInfo();
      return res.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5,
  });

/** 내 프로필 이미지 조회. */
export const useMemberImage = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: memberKeys.image(),
    queryFn: async (): Promise<{ imageUrl: string }> => {
      const res = await getMemberImage();
      return res.data as { imageUrl: string };
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5,
  });

/** 내가 작성한 게시글 목록 조회. */
export const useMemberPosts = () =>
  useQuery({
    queryKey: memberKeys.posts(),
    queryFn: async (): Promise<MyPost[]> => {
      const res = await getMemberPosts();
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

/** 내가 좋아요 누른 게시글 목록 조회. */
export const useMemberLikePosts = () =>
  useQuery({
    queryKey: memberKeys.likePosts(),
    queryFn: async (): Promise<MyPost[]> => {
      const res = await getMemberLikePosts();
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

/** 사용자 알림 수신 설정 조회. */
export const useNotificationPreferences = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: memberKeys.preferences(),
    queryFn: async (): Promise<NotificationPreferences> => {
      const res = await getUserNotificationPreferences();
      return res.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5,
  });
