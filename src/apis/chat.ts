import {
  GroupOrderChatRoom,
  RoommateChat,
  RoommateChatRoom,
} from "@/types/chats";
import { AxiosResponse } from "axios";
import tokenInstance from "./tokenInstance.ts";

export const getGroupOrderChatRooms = async (): Promise<
  AxiosResponse<GroupOrderChatRoom[]>
> => {
  const response = await tokenInstance.get<GroupOrderChatRoom[]>(
    `/group-order-chat-rooms`,
  );
  console.log(response);
  return response;
};

export const getRoommateChatRooms = async (): Promise<
  AxiosResponse<RoommateChatRoom[]>
> => {
  const response = await tokenInstance.get<RoommateChatRoom[]>(
    `/roommate-chatting-room`,
  );
  console.log(response);
  return response;
};

export const createRoommateChatRoom = async (
  roommateBoardId: number,
): Promise<AxiosResponse<number>> => {
  const response = await tokenInstance.post<number>(
    `/roommate-chatting-room/board/${roommateBoardId}`,
  );
  console.log(response);
  return response;
};

export const getRoommateChatHistory = async (
  roomId: number,
): Promise<AxiosResponse<RoommateChat[]>> => {
  const response = await tokenInstance.get<RoommateChat[]>(
    `/roommate/chat/${roomId}`,
  );
  return response;
};

/** 특정 채팅방 미확인 메시지 수 조회 */
export const getRoommateChatUnreadCount = async (
  roomId: number,
): Promise<AxiosResponse<number>> => {
  const response = await tokenInstance.get<number>(
    `/roommate/chat/${roomId}/unread-count`,
  );
  return response;
};

/** 모든 채팅방 미확인 메시지 총합 조회 */
export const getAllRoommateChatUnreadCount = async (): Promise<
  AxiosResponse<number>
> => {
  const response = await tokenInstance.get<number>(
    `/roommate/chat/unread-count`,
  );
  return response;
};

/** 특정 채팅방 메시지 읽음 처리 */
export const patchRoommateChatRead = async (
  roomId: number,
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.patch<void>(
    `/roommate/chat/${roomId}/read`,
  );
  return response;
};

export type NotificationMode = "EVERY" | "BUNDLED" | "OFF";

interface UpdateOpenChatNotificationRequest {
  mode: NotificationMode;
}

export type NotificationMode = "EVERY" | "BUNDLED" | "OFF";

export interface NotificationModeResponse {
  mode: NotificationMode;
}

interface UpdateOpenChatNotificationRequest {
  mode: NotificationMode;
}

/** 오픈채팅방 내 FCM 알림 모드 조회 */
export const getOpenChatNotificationMode = async (
  roomId: number,
): Promise<AxiosResponse<NotificationModeResponse>> => {
  const response = await tokenInstance.get<NotificationModeResponse>(
    `/open-chat-rooms/${roomId}/participants/me/notification`,
  );
  return response;
};

/** 오픈채팅방 FCM 알림 모드 변경 */
export const updateOpenChatNotificationMode = async (
  roomId: number,
  mode: NotificationMode,
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.patch<void>(
    `/open-chat-rooms/${roomId}/participants/me/notification`,
    { mode } as UpdateOpenChatNotificationRequest,
  );
  return response;
};
