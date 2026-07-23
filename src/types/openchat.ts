export type OpenChatTab = "MY" | "DORMITORY" | "ALL";

export type OpenChatScope = "DORMITORY" | "ALL";

export interface OpenChatRoom {
  roomId: number;
  name: string;
  description: string;
  scope: OpenChatScope;
  roomType: "OPEN" | "DERIVED" | "PERSONAL";
  chatCategory: "OPEN_CHAT" | "ROOMMATE";
  hasPassword: boolean;
  currentParticipants: number;
  maxParticipants: number;
  lastMessageAt: string;
  lastMessage: string;
  unreadCount: number;
  isPublic?: boolean;
  public?: boolean;
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
  isPublic?: boolean;
  password?: string;
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

export interface OpenChatMessage {
  messageId: number;
  roomId: number;
  senderId: number | null;
  senderNickname: string | null;
  content: string;
  type:
    | "TEXT"
    | "IMAGE"
    | "SYSTEM"
    | "ROOM_LINK"
    | "STUDENT_ID_REQUEST";
  imageUrls?: string[];
  unreadCount: number;
  createdAt: string;
  linkedRoomId?: number | null;
  linkedRoomName?: string | null;
  linkedRoomDescription?: string | null;
  linkedRoomMaxParticipants?: number | null;
  disclosureRequestId?: number | null;
}

export interface OpenChatParticipant {
  userId: number;
  nickname: string;
  joinedAt: string;
  isHost: boolean;
  isAdmin: boolean;
}

export interface OpenChatParticipantListResponse {
  roomId: number;
  participants: OpenChatParticipant[];
  totalCount: number;
  hostCount: number;
}

export type OpenChatKickReason =
  | "SPAM"
  | "ABUSE"
  | "IMPERSONATION"
  | "REPORT_ACCUMULATED"
  | "OTHER";

export interface CreatePersonalOpenChatRoomRequest {
  name: string;
  targetUserId: number;
  password?: string;
}

export interface CreatePersonalOpenChatRoomResponse {
  roomId: number;
}

export interface LeaveOpenChatRoomResponse {
  roomDeleted: boolean;
}

export interface OpenChatMessagesResponse {
  messages: OpenChatMessage[];
  hasNext: boolean;
  nextCursor: number | null;
}
