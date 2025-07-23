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
