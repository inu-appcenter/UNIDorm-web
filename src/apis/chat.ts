import { GroupOrderChatRoom } from "../types/chats.ts";
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
