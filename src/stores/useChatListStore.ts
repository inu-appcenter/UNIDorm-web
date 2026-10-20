import { create } from "zustand";
import { OpenChatRoom, OpenChatTab } from "@/types/openchat";
import { RoommateChatRoom } from "@/types/chats";

interface ChatListState {
  roomsByTab: Partial<Record<OpenChatTab, OpenChatRoom[]>>;
  roommateRooms: RoommateChatRoom[];
  roommateUnreadTotal: number;
  myOpenChatUnreadTotal: number;
  isInitialized: boolean;

  setTabRooms: (tab: OpenChatTab, rooms: OpenChatRoom[]) => void;
  setRoommateRooms: (rooms: RoommateChatRoom[]) => void;
  setRoommateUnreadTotal: (count: number) => void;
  setMyOpenChatUnreadTotal: (count: number) => void;
  setChatListData: (data: {
    tab: OpenChatTab;
    rooms: OpenChatRoom[];
    roommateRooms?: RoommateChatRoom[];
    roommateUnreadTotal?: number;
    myOpenChatUnreadTotal?: number;
  }) => void;
  markOpenChatRoomAsRead: (roomId: number) => void;
  markRoommateChatRoomAsRead: (chatRoomId: number) => void;
  resetChatList: () => void;
  appendChatListData: (data: {
    tab: OpenChatTab;
    rooms: OpenChatRoom[];
    roommateRooms?: RoommateChatRoom[];
  }) => void;
}

export const useChatListStore = create<ChatListState>((set) => ({
  roomsByTab: {},
  roommateRooms: [],
  roommateUnreadTotal: 0,
  myOpenChatUnreadTotal: 0,
  isInitialized: false,

  setTabRooms: (tab, rooms) =>
    set((state) => ({
      roomsByTab: { ...state.roomsByTab, [tab]: rooms },
    })),

  setRoommateRooms: (rooms) =>
    set({
      roommateRooms: rooms,
    }),

  setRoommateUnreadTotal: (count) =>
    set({
      roommateUnreadTotal: count,
    }),

  setMyOpenChatUnreadTotal: (count) =>
    set({
      myOpenChatUnreadTotal: count,
    }),

  setChatListData: ({
    tab,
    rooms,
    roommateRooms,
    roommateUnreadTotal,
    myOpenChatUnreadTotal,
  }) =>
    set((state) => ({
      roomsByTab: { ...state.roomsByTab, [tab]: rooms },
      roommateRooms:
        roommateRooms !== undefined ? roommateRooms : state.roommateRooms,
      roommateUnreadTotal:
        roommateUnreadTotal !== undefined
          ? roommateUnreadTotal
          : state.roommateUnreadTotal,
      myOpenChatUnreadTotal:
        myOpenChatUnreadTotal !== undefined
          ? myOpenChatUnreadTotal
          : state.myOpenChatUnreadTotal,
      isInitialized: true,
    })),
  appendChatListData: ({ tab, rooms, roommateRooms }) =>
    set((state) => {
      const currentTabRooms = state.roomsByTab[tab] || [];
      const existingRoomIds = new Set(currentTabRooms.map((r) => r.roomId));
      const filteredNewRooms = rooms.filter(
        (r) => !existingRoomIds.has(r.roomId),
      );
      const updatedTabRooms = [...currentTabRooms, ...filteredNewRooms];

      let updatedRoommates = state.roommateRooms;
      if (roommateRooms && roommateRooms.length > 0) {
        const existingRoommateIds = new Set(
          state.roommateRooms.map((r) => r.chatRoomId),
        );
        const filteredNewRoommates = roommateRooms.filter(
          (r) => !existingRoommateIds.has(r.chatRoomId),
        );
        updatedRoommates = [...state.roommateRooms, ...filteredNewRoommates];
      }

      return {
        roomsByTab: { ...state.roomsByTab, [tab]: updatedTabRooms },
        roommateRooms: updatedRoommates,
      };
    }),

  markOpenChatRoomAsRead: (roomId) =>
    set((state) => {
      let readCount = 0;
      const updatedRoomsByTab = { ...state.roomsByTab };

      Object.entries(updatedRoomsByTab).forEach(([tab, roomList]) => {
        if (!roomList) return;
        updatedRoomsByTab[tab as OpenChatTab] = roomList.map((room) => {
          if (room.roomId === roomId) {
            readCount = room.unreadCount || 0;
            return { ...room, unreadCount: 0 };
          }
          return room;
        });
      });

      return {
        roomsByTab: updatedRoomsByTab,
        myOpenChatUnreadTotal: Math.max(
          0,
          state.myOpenChatUnreadTotal - readCount,
        ),
      };
    }),

  markRoommateChatRoomAsRead: (chatRoomId) =>
    set((state) => {
      let readCount = 0;
      const updatedRoommates = state.roommateRooms.map((room) => {
        if (room.chatRoomId === chatRoomId) {
          readCount = room.unreadCount || 0;
          return { ...room, unreadCount: 0 };
        }
        return room;
      });

      const updatedRoomsByTab = { ...state.roomsByTab };
      if (updatedRoomsByTab.MY) {
        updatedRoomsByTab.MY = updatedRoomsByTab.MY.map((room) => {
          if (room.chatCategory === "ROOMMATE" && room.roomId === chatRoomId) {
            if (readCount === 0) readCount = room.unreadCount || 0;
            return { ...room, unreadCount: 0 };
          }
          return room;
        });
      }

      return {
        roomsByTab: updatedRoomsByTab,
        roommateRooms: updatedRoommates,
        roommateUnreadTotal: Math.max(0, state.roommateUnreadTotal - readCount),
      };
    }),

  resetChatList: () =>
    set({
      roomsByTab: {},
      roommateRooms: [],
      roommateUnreadTotal: 0,
      myOpenChatUnreadTotal: 0,
      isInitialized: false,
    }),
}));

