import { GroupOrderChatRoom, RoommateChatRoom } from "../types/chats.ts";
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
