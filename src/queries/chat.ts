import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getAllRoommateChatUnreadCount,
  getGroupOrderChatRooms,
  getOpenChatNotificationMode,
  getRoommateChatRoom,
  getRoommateChatRooms,
  getRoommateChatUnreadCount,
  type NotificationModeResponse,
} from "@/apis/chat";
import {
  getOpenChatParticipants,
  getOpenChatRooms,
} from "@/apis/openchat";
import { getBlockedUsers, type BlockedUser } from "@/apis/block";
import type {
  GroupOrderChatRoom,
  RoommateChatRoom,
} from "@/types/chats";
import type {
  OpenChatParticipantListResponse,
  OpenChatRoomPageResponse,
  OpenChatTab,
} from "@/types/openchat";

export const chatKeys = {
  all: ["chat"] as const,
  unreadTotal: () => ["chat", "unreadTotal"] as const,
  roommateUnread: (roomId: number) => ["chat", "roommateUnread", roomId] as const,
  groupOrderRooms: () => ["chat", "groupOrderRooms"] as const,
  roommateRooms: () => ["chat", "roommateRooms"] as const,
  roommateRoom: (roomId: number) => ["chat", "roommateRoom", roomId] as const,
  blockedUsers: () => ["chat", "blockedUsers"] as const,
  openChatRooms: (tab: OpenChatTab, keyword?: string, sort?: string) =>
    ["chat", "openChatRooms", tab, keyword, sort] as const,
  openChatParticipants: (roomId: number) => ["chat", "openChatParticipants", roomId] as const,
  openChatNotificationMode: (roomId: number) =>
    ["chat", "openChatNotificationMode", roomId] as const,
};

/** 전체 룸메이트 안 읽은 메시지 수 조회. */
export const useAllRoommateChatUnreadCount = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: chatKeys.unreadTotal(),
    queryFn: async (): Promise<number> => {
      const res = await getAllRoommateChatUnreadCount();
      return res.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 30,
  });

/** 특정 룸메이트 채팅방 안 읽은 메시지 수 조회. */
export const useRoommateChatUnreadCount = (
  roomId: number | undefined,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: chatKeys.roommateUnread(roomId ?? 0),
    queryFn: async (): Promise<number> => {
      const res = await getRoommateChatUnreadCount(roomId!);
      return res.data;
    },
    enabled: typeof roomId === "number" && roomId > 0 && (options?.enabled ?? true),
    staleTime: 1000 * 30,
  });

/** 차단된 사용자 목록 조회. */
export const useBlockedUsers = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: chatKeys.blockedUsers(),
    queryFn: async (): Promise<BlockedUser[]> => {
      const res = await getBlockedUsers();
      return res.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5,
  });

/** 공동구매 채팅방 목록 조회. */
export const useGroupOrderChatRooms = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: chatKeys.groupOrderRooms(),
    queryFn: async (): Promise<GroupOrderChatRoom[]> => {
      const res = await getGroupOrderChatRooms();
      return res.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5,
  });

/** 룸메이트 채팅방 목록 조회. */
export const useRoommateChatRooms = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: chatKeys.roommateRooms(),
    queryFn: async (): Promise<RoommateChatRoom[]> => {
      const res = await getRoommateChatRooms();
      return res.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5,
  });

/** 룸메이트 채팅방 단일 정보 조회. */
export const useRoommateChatRoom = (roomId: number | undefined) =>
  useQuery({
    queryKey: chatKeys.roommateRoom(roomId ?? 0),
    queryFn: async (): Promise<RoommateChatRoom> => {
      const res = await getRoommateChatRoom(roomId!);
      return res.data;
    },
    enabled: typeof roomId === "number" && roomId > 0,
    staleTime: 1000 * 60 * 5,
  });

/** 오픈채팅방 참여자 목록 조회. */
export const useOpenChatParticipants = (roomId: number | undefined) =>
  useQuery({
    queryKey: chatKeys.openChatParticipants(roomId ?? 0),
    queryFn: async (): Promise<OpenChatParticipantListResponse> => {
      const res = await getOpenChatParticipants(roomId!);
      return res.data;
    },
    enabled: typeof roomId === "number" && roomId > 0,
    staleTime: 1000 * 60 * 5,
  });

/** 오픈채팅방 알림 모드 조회. */
export const useOpenChatNotificationMode = (roomId: number | undefined) =>
  useQuery({
    queryKey: chatKeys.openChatNotificationMode(roomId ?? 0),
    queryFn: async (): Promise<NotificationModeResponse> => {
      const res = await getOpenChatNotificationMode(roomId!);
      return res.data;
    },
    enabled: typeof roomId === "number" && roomId > 0,
    staleTime: 1000 * 60 * 5,
  });

/** 오픈채팅방 목록 무한 스크롤 조회. */
export const useOpenChatRoomsInfinite = (
  tab: OpenChatTab,
  keyword?: string,
  sort?: string,
  options?: { enabled?: boolean; refetchInterval?: number | false },
) =>
  useInfiniteQuery({
    queryKey: chatKeys.openChatRooms(tab, keyword, sort),
    queryFn: async ({ pageParam = 0 }): Promise<OpenChatRoomPageResponse> => {
      const res = await getOpenChatRooms(tab, pageParam, 20, keyword, sort);
      return res.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.pageNumber >= lastPage.totalPages - 1) {
        return undefined;
      }
      return lastPage.pageNumber + 1;
    },
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval ?? false,
    staleTime: 1000 * 60 * 5,
  });
