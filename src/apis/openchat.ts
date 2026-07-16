import {
  CreateOpenChatRoomRequest,
  CreatedOpenChatRoomResponse,
  OpenChatRoomPageResponse,
  OpenChatTab,
  OpenChatMessagesResponse,
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
