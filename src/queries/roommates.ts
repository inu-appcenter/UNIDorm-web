import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getMyChecklist,
  getMyRoommateBoardId,
  getMyRoommateInfo,
  getMyRoommateRules,
  getNotificationFilter,
  getOpponentChecklist,
  getRoomMateDetail,
  getRoommateLiked,
  getRoomMateScrollList,
  getRoommateMatchingStatus,
  getSimilarRoomMateList,
  getMatchingPostList,
} from "@/apis/roommate";
import {
  getMyRoommateTimeTableImage,
  getUserTimetableImage,
} from "@/apis/members";
import type {
  FilteredRoommatePost,
  MyRoommateBoardIdResponse,
  MyRoommateInfoResponse,
  RoommateMatchingStatus,
  RoommateNotificationFilter,
  RoommatePost,
  RoommateRulesResponse,
  SimilarRoommatePost,
} from "@/types/roommates";

export const roommateKeys = {
  all: ["roommates"] as const,
  myInfo: () => ["roommates", "myInfo"] as const,
  rules: () => ["roommates", "rules"] as const,
  myTimetable: () => ["roommates", "myTimetable"] as const,
  roommateTimetable: () => ["roommates", "roommateTimetable"] as const,
  scroll: (filters?: { keyword?: string; year?: number; semester?: number }) =>
    ["roommates", "scroll", filters] as const,
  similar: () => ["roommates", "similar"] as const,
  matching: () => ["roommates", "matching"] as const,
  detail: (id: number) => ["roommates", "detail", id] as const,
  liked: (id: number) => ["roommates", "liked", id] as const,
  matchingStatus: () => ["roommates", "matchingStatus"] as const,
  filter: () => ["roommates", "notificationFilter"] as const,
  myChecklist: () => ["roommates", "myChecklist"] as const,
  myChecklistBoardId: () => ["roommates", "myChecklistBoardId"] as const,
  opponentChecklist: (chatRoomId: number) =>
    ["roommates", "opponentChecklist", chatRoomId] as const,
};

/** 내 룸메이트 정보 (404 면 룸메이트 없음). */
export const useMyRoommateInfo = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: roommateKeys.myInfo(),
    queryFn: async (): Promise<MyRoommateInfoResponse | null> => {
      try {
        const res = await getMyRoommateInfo();
        return res.data;
      } catch (err: any) {
        if (err.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled: options?.enabled ?? true,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

/** 내 방 규칙. */
export const useMyRoommateRules = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: roommateKeys.rules(),
    queryFn: async (): Promise<RoommateRulesResponse> => {
      const res = await getMyRoommateRules();
      return res.data;
    },
    enabled: options?.enabled ?? true,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

/** 내 시간표 이미지. */
export const useUserTimetableImage = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: roommateKeys.myTimetable(),
    queryFn: async (): Promise<{ imageUrl: string }> => {
      const res = await getUserTimetableImage();
      return res.data as { imageUrl: string };
    },
    enabled: options?.enabled ?? true,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

/** 룸메이트 시간표 이미지. */
export const useMyRoommateTimetableImage = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: roommateKeys.roommateTimetable(),
    queryFn: async (): Promise<{ imageUrl: string }> => {
      const res = await getMyRoommateTimeTableImage();
      return res.data as { imageUrl: string };
    },
    enabled: options?.enabled ?? true,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

/** 룸메이트 게시글 목록 무한 스크롤. */
export const useRoommateScroll = (
  size = 10,
  filters?: { keyword?: string; year?: number; semester?: number },
) =>
  useInfiniteQuery({
    queryKey: roommateKeys.scroll(filters),
    queryFn: ({ pageParam }) =>
      getRoomMateScrollList(pageParam, size, filters),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage: RoommatePost[]) => {
      if (!lastPage || lastPage.length < size) return undefined;
      return lastPage[lastPage.length - 1].boardId;
    },
    staleTime: 1000 * 60 * 5,
  });

/** 나와 성향이 비슷한 룸메이트 목록. */
export const useSimilarRoommateList = () =>
  useQuery({
    queryKey: roommateKeys.similar(),
    queryFn: async (): Promise<SimilarRoommatePost[]> => {
      const res = await getSimilarRoomMateList();
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

/** 맞춤 룸메이트 매칭 목록. */
export const useMatchingPostList = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: roommateKeys.matching(),
    queryFn: async (): Promise<FilteredRoommatePost[]> => {
      const res = await getMatchingPostList();
      return res.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5,
  });

/** 룸메이트 게시글 상세. */
export const useRoommateBoardDetail = (id: number | undefined) =>
  useQuery({
    queryKey: roommateKeys.detail(id ?? 0),
    queryFn: async (): Promise<RoommatePost> => {
      const res = await getRoomMateDetail(id!);
      return res.data;
    },
    enabled: typeof id === "number" && id > 0,
    staleTime: 1000 * 60 * 5,
  });

/** 룸메이트 좋아요 여부. */
export const useRoommateLiked = (id: number | undefined) =>
  useQuery({
    queryKey: roommateKeys.liked(id ?? 0),
    queryFn: async (): Promise<boolean> => {
      const res = await getRoommateLiked(id!);
      return res.data;
    },
    enabled: typeof id === "number" && id > 0,
    staleTime: 1000 * 60 * 5,
  });

/** 룸메이트 매칭 상태 조회. */
export const useRoommateMatchingStatusQuery = () =>
  useQuery({
    queryKey: roommateKeys.matchingStatus(),
    queryFn: async (): Promise<RoommateMatchingStatus> => {
      const res = await getRoommateMatchingStatus();
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });

/** 룸메이트 알림 필터 설정 조회. */
export const useRoommateNotificationFilter = (options?: {
  enabled?: boolean;
}) =>
  useQuery({
    queryKey: roommateKeys.filter(),
    queryFn: async (): Promise<RoommateNotificationFilter> => {
      const res = await getNotificationFilter();
      return res.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5,
  });

/** 내 체크리스트 조회. */
export const useMyChecklist = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: roommateKeys.myChecklist(),
    queryFn: async (): Promise<RoommatePost> => {
      const res = await getMyChecklist();
      return res.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5,
  });

/** 내 체크리스트 게시글 ID 조회. */
export const useMyChecklistBoardId = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: roommateKeys.myChecklistBoardId(),
    queryFn: async (): Promise<MyRoommateBoardIdResponse> => {
      const res = await getMyRoommateBoardId();
      return res.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5,
  });

/** 상대방 체크리스트 조회. */
export const useOpponentChecklist = (chatRoomId: number | undefined) =>
  useQuery({
    queryKey: roommateKeys.opponentChecklist(chatRoomId ?? 0),
    queryFn: async (): Promise<RoommatePost> => {
      const res = await getOpponentChecklist(chatRoomId!);
      return res.data;
    },
    enabled: typeof chatRoomId === "number" && chatRoomId > 0,
    staleTime: 1000 * 60 * 5,
  });
