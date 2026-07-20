import {
  CreateOpenChatRoomRequest,
  CreatedOpenChatRoomResponse,
  OpenChatRoomPageResponse,
  OpenChatTab,
  OpenChatMessagesResponse,
  OpenChatMessage,
  OpenChatParticipantListResponse,
  OpenChatKickReason,
  CreatePersonalOpenChatRoomRequest,
  CreatePersonalOpenChatRoomResponse,
  LeaveOpenChatRoomResponse,
} from "@/types/openchat";
import { AxiosResponse } from "axios";
import tokenInstance from "./tokenInstance.ts";

/** 오픈채팅방 목록 조회 */
export const getOpenChatRooms = async (
  tab: OpenChatTab,
  page = 0,
  size = 20,
): Promise<AxiosResponse<OpenChatRoomPageResponse>> => {
  const response = await tokenInstance.get<OpenChatRoomPageResponse>(
    `/open-chat-rooms`,
    {
      params: {
        tab,
        page,
        size,
      },
    },
  );

  console.log(response);
  return response;
};
/** 오픈채팅방 생성 */
export const createOpenChatRoom = async (
  data: CreateOpenChatRoomRequest,
): Promise<AxiosResponse<CreatedOpenChatRoomResponse>> => {
  const response = await tokenInstance.post<CreatedOpenChatRoomResponse>(
    `/open-chat-rooms`,
    data,
  );

  console.log(response);
  return response;
};

/** 오픈채팅방 입장 */
export const joinOpenChatRoom = async (
  roomId: number,
  password?: string,
): Promise<AxiosResponse<CreatedOpenChatRoomResponse>> => {
  const response = await tokenInstance.post<CreatedOpenChatRoomResponse>(
    `/open-chat-rooms/${roomId}/participants/me`,
    null,
    {
      params: {
        password,
      },
    },
  );

  console.log(response);
  return response;
};

/** 오픈채팅방 메시지 목록 조회 */
export const getOpenChatMessages = async (
  roomId: number,
  lastMessageId?: number | null,
  size = 30,
): Promise<AxiosResponse<OpenChatMessagesResponse>> => {
  const response = await tokenInstance.get<OpenChatMessagesResponse>(
    `/open-chat-rooms/${roomId}/messages`,
    {
      params: {
        lastMessageId,
        size,
      },
    },
  );
  return response;
};

export const sendOpenChatImages = async (
  roomId: number,
  images: File[],
): Promise<AxiosResponse<OpenChatMessage[]>> => {
  const formData = new FormData();
  images.forEach((image) => formData.append("images", image));

  return tokenInstance.post<OpenChatMessage[]>(
    `/open-chat-rooms/${roomId}/messages/image`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
};

export const getOpenChatParticipants = (
  roomId: number,
): Promise<AxiosResponse<OpenChatParticipantListResponse>> =>
  tokenInstance.get(`/open-chat-rooms/${roomId}/participants`);

export const leaveOpenChatRoom = (
  roomId: number,
  newHostUserId?: number,
): Promise<AxiosResponse<LeaveOpenChatRoomResponse>> =>
  tokenInstance.delete(`/open-chat-rooms/${roomId}/participants/me`, {
    params: { newHostUserId },
  });

export const transferOpenChatHost = (
  roomId: number,
  targetUserId: number,
): Promise<AxiosResponse<void>> =>
  tokenInstance.patch(`/open-chat-rooms/${roomId}/hosts/me`, null, {
    params: { targetUserId },
  });

export const kickOpenChatParticipant = (
  roomId: number,
  targetUserId: number,
  reason: OpenChatKickReason,
): Promise<AxiosResponse<void>> =>
  tokenInstance.delete(
    `/open-chat-rooms/${roomId}/participants/${targetUserId}`,
    { params: { reason } },
  );

export const createPersonalOpenChatRoom = (
  data: CreatePersonalOpenChatRoomRequest,
): Promise<AxiosResponse<CreatePersonalOpenChatRoomResponse>> =>
  tokenInstance.post(`/open-chat-rooms/personal`, data);
