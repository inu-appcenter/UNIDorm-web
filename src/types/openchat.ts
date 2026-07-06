export type OpenChatTab = "MY" | "DORMITORY" | "ALL";

export type OpenChatScope = "DORMITORY" | "ALL";

export interface OpenChatRoom {
  roomId: number;
  name: string;
  description: string;
  scope: OpenChatScope;
  roomType: "OPEN" | string;
  hasPassword: boolean;
  currentParticipants: number;
  maxParticipants: number;
  lastMessageAt: string;
  lastMessage: string;
  unreadCount: number;
  public: boolean;
  joined: boolean;
}

export interface OpenChatRoomPageResponse {
  totalPages: number;
  totalElements: number;
  size: number;
  content: OpenChatRoom[];
  number: number;
  sort: {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
  };
  first: boolean;
  last: boolean;
  numberOfElements: number;
  pageable: {
    offset: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    pageSize: number;
    paged: boolean;
    pageNumber: number;
    unpaged: boolean;
  };
  empty: boolean;
}

export interface CreateOpenChatRoomRequest {
  name: string;
  description: string;
  scope: "DORMITORY" | "ALL";
  maxParticipants: number;
}

export interface CreatedOpenChatRoomResponse {
  roomId: number;
  name: string;
  description: string;
  scope: "DORMITORY" | "ALL";
  currentParticipants: number;
  maxParticipants: number;
  createdAt: string;
  official: boolean;
}
