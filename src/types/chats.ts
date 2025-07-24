export interface GroupOrderChatRoom {
  chatRoomId: number;
  chatRoomTitle: string;
  unreadCount: number;
  recentChatContent: string;
  recentChatTime: string; // ISO format
  chatRoomType: "GROUP_ORDER";
  currentPeople: number;
  maxPeople: number;
  deadline: string; // ISO format
}

export interface RoommateChatRoom {
  chatRoomId: number;
  opponentNickname: string;
  lastMessage: string;
  lastMessageTime: string; // ISO8601 형식
}
