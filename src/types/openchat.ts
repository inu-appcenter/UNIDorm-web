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
  isBlockedByPartner?: boolean;
}

export interface OpenChatRoomPageResponse {
  content: OpenChatRoom[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  totalUnreadCount: number;
}

export interface CreateOpenChatRoomRequest {
  name: string;
  description: string;
  scope: "DORMITORY" | "ALL";
  maxParticipants: number;
  isPublic?: boolean;
  password?: string;
}

export interface UpdateOpenChatRoomRequest {
  name?: string;
  description?: string;
  scope?: OpenChatScope;
  maxParticipants?: number;
  password?: string;
  isPublic?: boolean;
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

export interface JoinOpenChatRoomResponse
  extends CreatedOpenChatRoomResponse {
  isBlockedByPartner: boolean;
}

export interface CreateDerivedOpenChatRoomRequest {
  originRoomId: number;
  name: string;
  description?: string;
  maxParticipants: number;
  isPublic: boolean;
  password?: string;
}

export interface CreateDerivedOpenChatRoomResponse {
  roomId: number;
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
    | "STUDENT_ID_REQUEST"
    | "BOT";
  isBot?: boolean;
  bot?: boolean;
  imageUrls?: string[];
  unreadCount: number;
  createdAt: string;
  linkedRoomId?: number | null;
  linkedRoomName?: string | null;
  linkedRoomDescription?: string | null;
  linkedRoomMaxParticipants?: number | null;
  disclosureRequestId?: number | null;
}

export interface AdminOpenChatRoom {
  roomId: number;
  roomName: string;
}

export interface CreateDormOfficialRoomRequest {
  name: string;
  description: string;
  dormType: string;
}

export interface UpdateDormOfficialRoomRequest {
  name: string;
  description: string;
}

export interface OpenChatReadEvent {
  messageId: number;
  unreadCount: number;
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
