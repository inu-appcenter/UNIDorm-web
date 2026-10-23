import type { OpenChatRoom } from "@/types/openchat";

export const isOpenChatRoomClosed = (room: OpenChatRoom): boolean =>
  room.recruitmentClosed === true ||
  room.recruitmentStatus === "CLOSED" ||
  room.joinable === false ||
  room.isJoinable === false;
