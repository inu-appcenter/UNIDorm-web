import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import React from "react";
import ChatInfo from "../../components/chat/ChatInfo.tsx";
import ChatItemOtherPerson from "../../components/chat/ChatItemOtherPerson.tsx";
import ChatItemMy from "../../components/chat/ChatItemMy.tsx";
import ChatItemBot from "@/components/chat/ChatItemBot";
import { useRoommateChat } from "./useRoommateChat.ts";
import { useOpenChat } from "./useOpenChat";
import useUserStore from "../../stores/useUserStore.ts";
import {
  getRoommateChatHistory,
  getRoommateChatRoom,
  patchRoommateChatRead,
} from "@/apis/chat";
import { patchNotificationsRead } from "@/apis/notification";
import {
  getOpenChatMessages,
  getOpenChatRooms,
  joinOpenChatRoom,
  createPersonalOpenChatRoom,
  transferOpenChatHost,
} from "@/apis/openchat";
import {
  getOpenChatParticipants,
  kickOpenChatParticipant,
  sendOpenChatImages,
} from "@/apis/openchat";
import { OpenChatReportReason, reportOpenChatMessage } from "@/apis/report";
import { OpenChatMessage, OpenChatParticipant, OpenChatRoom } from "@/types/openchat";
import PhotoAttachmentBottomSheet from "@/components/chat/PhotoAttachmentBottomSheet";
import ChatMessageActionSheet from "@/components/chat/ChatMessageActionSheet";
import ChatMemberActionSheet from "@/components/chat/ChatMemberActionSheet";
import ImageViewerModal from "@/components/chat/ImageViewerModal";
import TooltipMessage from "@/components/common/TooltipMessage";
import { useSetHeader } from "@/hooks/useSetHeader";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  Plus,
  ChevronDown,
  Info,
  ArrowRight,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";
import * as S from "./ChattingPage.styles";
import ChatBuliLogo from "@/assets/ai-chat/챗불이로고.svg";
import { streamUnidormChat } from "@/apis/unidormChat";
import {
  getStudentIdDisclosureStatus,
  requestStudentIdDisclosure,
  cancelStudentIdDisclosure,
  rejectStudentIdDisclosure,
  acceptStudentIdDisclosure,
} from "@/apis/studentIdDisclosure";
import { getMyRoommateInfo } from "@/apis/roommate";
import type { StudentIdDisclosureStatus } from "@/apis/studentIdDisclosure";
import { isAxiosError } from "axios";
import { blockUser, getBlockedUsers } from "@/apis/block";
import { getMobilePlatform } from "@/utils/getMobilePlatform";

type MessageType = {
  id: number;
  sender: "me" | "other";
  content: string;
  time: string; // 화면 표시용 시간 (예: 오후 2:30)
  createdAt: string; // 날짜 비교용 원본 날짜 문자열 (ISO 등)
  userImageUrl?: string | null; // 프로필 이미지 URL NULL 구분
  nickname?: string;
  isSystem?: boolean; // 시스템 메시지 플래그 추가
  isBot?: boolean;
  isBotQuestion?: boolean;
  senderId?: number | null;
  type?: OpenChatMessage["type"];
  imageUrls?: string[];
  disclosureRequestId?: number | null;
  linkedRoomId?: number | null;
  linkedRoomName?: string | null;
  linkedRoomDescription?: string | null;
  linkedRoomMaxParticipants?: number | null;
  unreadCount?: number;
  isRead?: boolean;
};

interface LegacyRoommateShareMessage {
  type: "REQUEST" | "CANCEL" | "DECLINE" | "ACCEPT" | null;
  requestId: number | null;
  requesterStudentNumber?: string;
  acceptorStudentNumber?: string;
}

type RoommateBoardOwner = "opponent" | "me";

interface RoommateBoardLink {
  title: string;
  owner: RoommateBoardOwner;
  boardId?: number;
}

interface StudentIdRequestPayload {
  requestId: number;
  requesterId?: number;
  requesterNickname?: string;
}

const parseStudentIdRequestPayload = (
  content?: string | null,
): StudentIdRequestPayload | null => {
  if (!content?.trim().startsWith("{")) return null;

  try {
    const payload = JSON.parse(content) as Record<string, unknown>;
    const requestId = Number(payload.requestId ?? payload.disclosureRequestId);
    const requesterId = Number(payload.requesterId);
    const requesterNickname =
      typeof payload.requesterNickname === "string"
        ? payload.requesterNickname.trim()
        : "";

    if (
      !Number.isFinite(requestId) ||
      requestId <= 0 ||
      (!Number.isFinite(requesterId) && !requesterNickname)
    ) {
      return null;
    }

    return {
      requestId,
      requesterId: Number.isFinite(requesterId) ? requesterId : undefined,
      requesterNickname: requesterNickname || undefined,
    };
  } catch {
    return null;
  }
};

const isOpenChatLeaveMessage = (content?: string | null) => {
  if (!content) return false;
  const trimmed = content.trim();
  return (
    trimmed.includes("님이 퇴장했습니다") ||
    trimmed.includes("님이 퇴장하셨습니다") ||
    trimmed.includes("님이 나갔습니다") ||
    trimmed.includes("님이 채팅방을 나갔습니다") ||
    trimmed.includes("님이 채팅방을 퇴장했습니다")
  );
};

const dedupeStudentIdDisclosureMessages = (messages: MessageType[]) => {
  const seenRequestIds = new Set<number>();

  return messages.filter((message) => {
    if (message.type === "STUDENT_ID_REQUEST" && message.disclosureRequestId) {
      if (seenRequestIds.has(message.disclosureRequestId)) return false;
      seenRequestIds.add(message.disclosureRequestId);
    }

    return true;
  });
};

const parseChatBuliPayload = (rawContent: string) => {
  if (typeof rawContent !== "string") {
    return {
      content: rawContent,
      isBotQuestion: false,
      isBot: false,
      nickname: undefined,
    };
  }

  // 1. 질문 감지 (오직 시스템 고유 태그 [CHATBULI_QUESTION]가 있을 때만 유효 판정)
  if (rawContent.includes("[CHATBULI_QUESTION]")) {
    const content = rawContent
      .replace(/\n?\[CHATBULI_QUESTION\]$/, "")
      .replace(/^\[CHATBULI_QUESTION\](\n|\s)?/, "")
      .replace(/^\[(챗불이에게\s*질문|챗불이\s*질문)\]\s*/, "")
      .trim();
    return {
      content,
      isBotQuestion: true,
      isBot: false,
      nickname: undefined,
    };
  }

  // 2. 답변 감지 (오직 시스템 고유 태그 [CHATBULI_ANSWER]가 있을 때만 유효 판정)
  if (rawContent.includes("[CHATBULI_ANSWER]")) {
    const content = rawContent
      .replace(/\n?\[CHATBULI_ANSWER\]$/, "")
      .replace(/^\[CHATBULI_ANSWER\](\n|\s)?/, "")
      .replace(/^\[(챗불이에게\s*답변|챗불이\s*답변)\](\n|\s)?/, "")
      .trim();
    return {
      content,
      isBotQuestion: false,
      isBot: true,
      nickname: "챗불이",
    };
  }

  return {
    content: rawContent,
    isBotQuestion: false,
    isBot: false,
    nickname: undefined,
  };
};

const mapOpenChatMessageToMessageType = (
  chat: OpenChatMessage,
  userId: number,
): MessageType => {
  const studentIdRequestPayload = parseStudentIdRequestPayload(chat.content);
  const normalizedType = studentIdRequestPayload
    ? "STUDENT_ID_REQUEST"
    : chat.type;
  const normalizedSenderId =
    studentIdRequestPayload?.requesterId ?? chat.senderId ?? null;

  const rawContent = studentIdRequestPayload ? "학번 공유 요청" : chat.content;
  const { content, isBot, isBotQuestion, nickname } =
    parseChatBuliPayload(rawContent);

  return {
    id: chat.messageId,
    sender: normalizedSenderId === userId ? "me" : "other",
    content,
    nickname:
      nickname ||
      chat.senderNickname ||
      studentIdRequestPayload?.requesterNickname ||
      undefined,
    userImageUrl: null,
    isSystem: normalizedType === "SYSTEM",
    isBot:
      isBot ||
      Boolean(chat.bot) ||
      Boolean(chat.isBot) ||
      normalizedType === "BOT",
    isBotQuestion,
    senderId: normalizedSenderId,
    type: normalizedType,
    imageUrls: chat.imageUrls ?? [],
    disclosureRequestId:
      chat.disclosureRequestId ??
      studentIdRequestPayload?.requestId ??
      null,
    linkedRoomId: chat.linkedRoomId,
    linkedRoomName: chat.linkedRoomName,
    linkedRoomDescription: chat.linkedRoomDescription,
    linkedRoomMaxParticipants: chat.linkedRoomMaxParticipants,
    unreadCount: chat.unreadCount,
    time: new Date(chat.createdAt).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    createdAt: chat.createdAt,
  };
};

const parseLegacyRoommateShareMessage = (
  content: string,
): LegacyRoommateShareMessage => {
  if (!content || typeof content !== "string") {
    return { type: null, requestId: null };
  }

  if (content.startsWith("[STUDENT_ID_SHARE_REQUEST:")) {
    const parts = content
      .replace("[STUDENT_ID_SHARE_REQUEST:", "")
      .replace("]", "")
      .split(":");
    return {
      type: "REQUEST",
      requestId: Number(parts[0]),
      requesterStudentNumber: parts[1] || undefined,
    };
  }

  if (content.startsWith("[STUDENT_ID_SHARE_CANCEL:")) {
    const requestId = Number(
      content.replace("[STUDENT_ID_SHARE_CANCEL:", "").replace("]", ""),
    );
    return { type: "CANCEL", requestId };
  }

  if (content.startsWith("[STUDENT_ID_SHARE_DECLINE:")) {
    const requestId = Number(
      content.replace("[STUDENT_ID_SHARE_DECLINE:", "").replace("]", ""),
    );
    return { type: "DECLINE", requestId };
  }

  if (content.startsWith("[STUDENT_ID_SHARE_ACCEPT:")) {
    const parts = content
      .replace("[STUDENT_ID_SHARE_ACCEPT:", "")
      .replace("]", "")
      .split(":");
    return {
      type: "ACCEPT",
      requestId: Number(parts[0]),
      acceptorStudentNumber: parts[1] || undefined,
      requesterStudentNumber: parts[2] || undefined,
    };
  }

  return { type: null, requestId: null };
};

const ACCEPTED_DISCLOSURE_STATUSES = new Set([
  "DISCLOSED",
  "ACCEPTED",
  "APPROVED",
]);
const REJECTED_DISCLOSURE_STATUSES = new Set(["REJECTED", "DECLINED"]);
const CANCELED_DISCLOSURE_STATUSES = new Set(["NONE", "CANCELED", "CANCELLED"]);
const RECEIVED_DISCLOSURE_STATUSES = new Set(["PENDING_RECEIVED", "RECEIVED"]);

const normalizeDisclosureStatus = (status?: string | null) =>
  status?.trim().toUpperCase() ?? "";

const isReceivedDisclosureStatus = (status?: string | null) =>
  RECEIVED_DISCLOSURE_STATUSES.has(normalizeDisclosureStatus(status));

const isPendingDisclosureStatus = (status?: string | null) => {
  const normalizedStatus = normalizeDisclosureStatus(status);

  return (
    normalizedStatus.length > 0 &&
    !ACCEPTED_DISCLOSURE_STATUSES.has(normalizedStatus) &&
    !REJECTED_DISCLOSURE_STATUSES.has(normalizedStatus) &&
    !CANCELED_DISCLOSURE_STATUSES.has(normalizedStatus)
  );
};

export default function ChattingPage() {
  const isLeavingRef = useRef(false);
  const { chatType, id } = useParams();
  const [typeString, setTypeString] = useState<string>("");
  const [messageList, setMessageList] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isBlockedPartner, setIsBlockedPartner] = useState(false);
  const [isBlockedByPartner, setIsBlockedByPartner] = useState(false);
  const isChatBlocked = isBlockedPartner || isBlockedByPartner;
  const blockedChatMessage = isBlockedByPartner
    ? "상대방의 차단으로 메시지를 보낼 수 없습니다."
    : "차단한 사람과는 대화할 수 없습니다.";
  const { tokenInfo, userInfo } = useUserStore();
  const navigate = useNavigate();

  const [showStudentIdTooltip, setShowStudentIdTooltip] = useState(() => {
    return localStorage.getItem("hasClosedStudentIdTooltip") !== "true";
  });

  const handleCloseStudentIdTooltip = () => {
    setShowStudentIdTooltip(false);
    localStorage.setItem("hasClosedStudentIdTooltip", "true");
  };

  // 학번 공유 관련 상태 및 Ref
  const opponentIdRef = useRef<number | null>(null);
  const [opponentStudentNumber, setOpponentStudentNumber] =
    useState<string>("");
  const [roommateDisclosureStatus, setRoommateDisclosureStatus] =
    useState<StudentIdDisclosureStatus | null>(null);

  const location = useLocation();
  const partnerName = location.state?.partnerName ?? undefined;
  const routeRoom = location.state?.room as OpenChatRoom | undefined;
  const routeRoomName = location.state?.roomName as string | undefined;
  const routeRoomDescription = location.state?.roomDescription as
    | string
    | undefined;
  const routeRoommateBoardTitle = location.state?.roommateBoardTitle as
    | string
    | undefined;
  const routeRoommateBoardOwner = location.state?.roommateBoardOwner as
    | RoommateBoardOwner
    | undefined;
  const routeRoommateBoardId =
    Number(location.state?.roommateBoardId) || undefined;
  const [roommateBoardLink, setRoommateBoardLink] =
    useState<RoommateBoardLink | null>(
      routeRoommateBoardTitle && routeRoommateBoardOwner
        ? {
            title: routeRoommateBoardTitle,
            owner: routeRoommateBoardOwner,
            boardId: routeRoommateBoardId,
          }
        : null,
    );
  const [openChatRoomName, setOpenChatRoomName] = useState<string | undefined>(
    routeRoomName,
  );
  const partnerProfileImageUrl =
    location.state?.partnerProfileImageUrl ?? undefined;
  const pendingDisclosureRequestId = Number(
    location.state?.disclosureRequestId,
  );
  const openChatOpponentIdRef = useRef<number | null>(
    location.state?.partnerId ?? null,
  );
  const [openChatDisclosureStatus, setOpenChatDisclosureStatus] =
    useState<StudentIdDisclosureStatus | null>(null);
  const [openChatOpponentStudentNumber, setOpenChatOpponentStudentNumber] =
    useState("");
  const [processingDisclosureId, setProcessingDisclosureId] = useState<
    number | null
  >(null);
  const [isMyRoommateState, setIsMyRoommateState] = useState<boolean>(() => {
    const routeIsMyRoommate = location.state?.isMyRoommate;
    const room = location.state?.room;
    return Boolean(
      routeIsMyRoommate ||
        room?.isMyRoommate ||
        room?.roommate ||
        room?.myRoommate ||
        room?.matched ||
        room?.isRoommate,
    );
  });

  useEffect(() => {
    if (chatType === "roommate") {
      getMyRoommateInfo()
        .then((res) => {
          if (res.data) {
            setIsMyRoommateState(true);
          }
        })
        .catch(() => {});
    }
  }, [chatType]);

  const [joiningLinkedRoomId, setJoiningLinkedRoomId] = useState<number | null>(
    null,
  );

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<number | null>(null);
  const isInitialLoadedRef = useRef(false);
  const isInitialScrollReadyRef = useRef(false);
  const allRoommateMessagesRef = useRef<MessageType[]>([]);
  const roommateLoadedCountRef = useRef(30);
  const wasNearBottomRef = useRef(true);
  const lastMessageContentRef = useRef<string | null>(null);

  const [hasNextMessages, setHasNextMessages] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [isFetchingOlderMessages, setIsFetchingOlderMessages] = useState(false);
  const [isInitialScrollReady, setIsInitialScrollReady] = useState(false);

  const roomId = Number(id);
  const userId = userInfo.id;
  const token = tokenInfo.accessToken;

  const [isChatBuliActive, setIsChatBuliActive] = useState(false);
  const [isSlashMenuOpen, setIsSlashMenuOpen] = useState(false);
  const slashMenuContainerRef = useRef<HTMLDivElement>(null);

  const refreshBlockedPartnerStatus = async (targetUserId?: number | null) => {
    if (!targetUserId || (chatType !== "roommate" && chatType !== "personal")) {
      setIsBlockedPartner(false);
      return;
    }

    try {
      const response = await getBlockedUsers();
      setIsBlockedPartner(
        response.data.some(
          (blockedUser) => blockedUser.blockedUserId === targetUserId,
        ),
      );
    } catch (error) {
      console.error("차단 상태 조회 실패:", error);
      setIsBlockedPartner(false);
    }
  };

  useEffect(() => {
    if (isChatBlocked) {
      setMenuOpen(false);
      setIsSlashMenuOpen(false);
      setIsChatBuliActive(false);
      setInputValue("");
    }
  }, [isChatBlocked]);

  const clearPendingDisclosureRouteState = () => {
    if (!pendingDisclosureRequestId) return;

    const nextState = {
      ...((location.state ?? {}) as Record<string, unknown>),
    };
    delete nextState.disclosureRequestId;
    navigate(location.pathname, { replace: true, state: nextState });
  };

  // 알림 읽음 처리 및 iOS 네이티브 브릿지 호출
  useEffect(() => {
    if (!id) return;

    const markReadAndNotifyNative = async () => {
      try {
        await patchNotificationsRead("CHAT", id);
      } catch (err) {
        console.error("채팅방 알림 읽음 처리 실패:", err);
      }

      if (window.webkit?.messageHandlers?.enterDetailView) {
        try {
          window.webkit.messageHandlers.enterDetailView.postMessage({
            type: "CHAT",
            id: id,
          });
        } catch (err) {
          console.error("iOS enterDetailView 브릿지 호출 실패:", err);
        }
      }
    };

    markReadAndNotifyNative();
  }, [id]);

  // 오픈채팅방 공지 확장 여부
  const [isNoticeExpanded, setIsNoticeExpanded] = useState(false);
  // 플로팅 입력바의 + 버튼 메뉴 열림 여부
  const [menuOpen, setMenuOpen] = useState(false);
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false);
  const [messageSheetOpen, setMessageSheetOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageType | null>(
    null,
  );
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isOpenChatHost, setIsOpenChatHost] = useState(false);
  const [participants, setParticipants] = useState<OpenChatParticipant[]>([]);
  const [selectedMember, setSelectedMember] =
    useState<OpenChatParticipant | null>(null);
  const [memberActionSheetOpen, setMemberActionSheetOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
      if (
        slashMenuContainerRef.current &&
        !slashMenuContainerRef.current.contains(event.target as Node)
      ) {
        setIsSlashMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 오픈채팅 공지 확장 시 외부 터치/드래그 시 닫기 핸들러
  useEffect(() => {
    if (!isNoticeExpanded) return;

    const collapseNotice = () => {
      setIsNoticeExpanded(false);
    };

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (
        noticeRef.current &&
        !noticeRef.current.contains(event.target as Node)
      ) {
        collapseNotice();
      }
    };

    const chatContainer = scrollRef.current;

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    if (chatContainer) {
      chatContainer.addEventListener("scroll", collapseNotice, {
        passive: true,
      });
      chatContainer.addEventListener("touchmove", collapseNotice, {
        passive: true,
      });
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      if (chatContainer) {
        chatContainer.removeEventListener("scroll", collapseNotice);
        chatContainer.removeEventListener("touchmove", collapseNotice);
      }
    };
  }, [isNoticeExpanded]);

  // 방이 바뀌었을 때 초기화
  useEffect(() => {
    isInitialLoadedRef.current = false;
    isInitialScrollReadyRef.current = false;
    setIsInitialScrollReady(false);
    lastMessageIdRef.current = null;
    setHasNextMessages(false);
    setNextCursor(null);
    allRoommateMessagesRef.current = [];
    roommateLoadedCountRef.current = 30;
  }, [id, chatType]);

  // 내부 스크롤 이동
  const scrollToBottom = (smooth = false) => {
    if (scrollRef.current) {
      if (smooth) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      } else {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
      wasNearBottomRef.current = true;
    }
  };

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    wasNearBottomRef.current = distanceFromBottom <= 120;
  }, []);

  // 메시지 리스트 변경 시 스크롤 위치 제어
  useEffect(() => {
    if (messageList.length === 0) return;

    const latestMessage = messageList[messageList.length - 1];
    const isNewMessageAtBottom =
      latestMessage.id !== lastMessageIdRef.current;
    const isContentChanged =
      latestMessage.content !== lastMessageContentRef.current;

    lastMessageIdRef.current = latestMessage.id;
    lastMessageContentRef.current = latestMessage.content;

    // 1. 첫 로딩 시 맨 아래로 이동하고 안착된 후에만 무한스크롤 옵저버 활성화
    if (!isInitialLoadedRef.current) {
      isInitialLoadedRef.current = true;
      wasNearBottomRef.current = true;
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
      const timer = setTimeout(() => {
        scrollToBottom();
        requestAnimationFrame(() => {
          isInitialScrollReadyRef.current = true;
          setIsInitialScrollReady(true);
        });
      }, 100);
      return () => clearTimeout(timer);
    }

    if (selectedImageUrl) return;

    const container = scrollRef.current;
    const distanceFromBottom = container
      ? container.scrollHeight - container.scrollTop - container.clientHeight
      : 9999;

    // 2. 새로운 메시지 아이템이 하단에 추가되었을 때
    if (isNewMessageAtBottom) {
      // 본인이 보낸 메시지이거나 메시지 수신 직전 스크롤이 바닥 근처였으면 아래로 스크롤
      if (
        latestMessage.sender === "me" ||
        wasNearBottomRef.current ||
        distanceFromBottom <= 150
      ) {
        scrollToBottom();
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      }
      return;
    }

    // 3. 기존 최하단 메시지 내용(챗불이 스트리밍 등)이 갱신되었을 때
    if (isContentChanged) {
      // 사용자가 현재 바닥 근처(100px 이내)에 머물러 있는 경우에만 자연스럽게 바닥 유지
      // 사용자가 스크롤을 위로 올려서 보고 있는 상태라면 스크롤을 아래로 잡아끌지 않음
      if (distanceFromBottom <= 100 && container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messageList, selectedImageUrl]);

  // 오픈채팅 / 1:1 개인 오픈채팅 과거 메시지 페칭 (서버 커서 기반)
  const fetchOlderOpenChatMessages = useCallback(async () => {
    if (
      !hasNextMessages ||
      isFetchingOlderMessages ||
      nextCursor == null ||
      (chatType !== "open" && chatType !== "personal") ||
      !isInitialScrollReadyRef.current
    ) {
      return;
    }

    const container = scrollRef.current;
    if (!container) return;

    const prevScrollHeight = container.scrollHeight;
    const prevScrollTop = container.scrollTop;

    setIsFetchingOlderMessages(true);

    try {
      const response = await getOpenChatMessages(roomId, nextCursor, 30);
      const { messages: olderChats, hasNext, nextCursor: newCursor } =
        response.data;

      setHasNextMessages(hasNext);
      setNextCursor(newCursor);

      if (olderChats.length === 0) return;

      const sortedOlderChats = [...olderChats].sort((a, b) => {
        const createdAtDifference =
          Date.parse(a.createdAt) - Date.parse(b.createdAt);

        if (Number.isFinite(createdAtDifference)) {
          return createdAtDifference || a.messageId - b.messageId;
        }

        return a.messageId - b.messageId;
      });

      const visibleChats =
        chatType === "open"
          ? sortedOlderChats
              .filter((m) => m.type !== "STUDENT_ID_REQUEST")
              .filter(
                (m) =>
                  !(
                    m.type === "SYSTEM" &&
                    isOpenChatLeaveMessage(m.content)
                  ),
              )
          : sortedOlderChats;

      const formattedOlderMessages: MessageType[] =
        dedupeStudentIdDisclosureMessages(
          visibleChats.map((chat) =>
            mapOpenChatMessageToMessageType(chat, userId),
          ),
        );

      setMessageList((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const uniqueOlder = formattedOlderMessages.filter(
          (m) => !existingIds.has(m.id),
        );
        if (uniqueOlder.length === 0) return prev;
        return [...uniqueOlder, ...prev];
      });

      // 스크롤 위치 복원 (사용자가 보고 있던 위치 유지)
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          const newScrollHeight = scrollRef.current.scrollHeight;
          scrollRef.current.scrollTop =
            newScrollHeight - prevScrollHeight + prevScrollTop;
        }
      });
    } catch (error) {
      console.error("이전 오픈채팅 메시지 불러오기 실패:", error);
    } finally {
      setIsFetchingOlderMessages(false);
    }
  }, [
    hasNextMessages,
    isFetchingOlderMessages,
    nextCursor,
    chatType,
    roomId,
    userId,
  ]);

  // 룸메이트 1:1 채팅 과거 메시지 페칭 (클라이언트 무한 스크롤)
  const fetchOlderRoommateMessages = useCallback(() => {
    if (
      !hasNextMessages ||
      isFetchingOlderMessages ||
      chatType !== "roommate" ||
      !isInitialScrollReadyRef.current
    ) {
      return;
    }

    const container = scrollRef.current;
    if (!container) return;

    const prevScrollHeight = container.scrollHeight;
    const prevScrollTop = container.scrollTop;

    setIsFetchingOlderMessages(true);

    const all = allRoommateMessagesRef.current;
    const currentCount = roommateLoadedCountRef.current;
    const nextCount = currentCount + 30;
    const startIndex = Math.max(0, all.length - nextCount);
    const endIndex = all.length - currentCount;
    const olderSlice = all.slice(startIndex, endIndex);

    roommateLoadedCountRef.current = nextCount;
    if (startIndex <= 0) {
      setHasNextMessages(false);
    }

    setMessageList((prev) => [...olderSlice, ...prev]);

    requestAnimationFrame(() => {
      if (scrollRef.current) {
        const newScrollHeight = scrollRef.current.scrollHeight;
        scrollRef.current.scrollTop =
          newScrollHeight - prevScrollHeight + prevScrollTop;
      }
      setIsFetchingOlderMessages(false);
    });
  }, [hasNextMessages, isFetchingOlderMessages, chatType]);

  // 통합 과거 메시지 페칭
  const fetchOlderMessages = useCallback(() => {
    if (!isInitialScrollReadyRef.current) return;
    if (chatType === "roommate") {
      fetchOlderRoommateMessages();
    } else if (chatType === "open" || chatType === "personal") {
      fetchOlderOpenChatMessages();
    }
  }, [chatType, fetchOlderRoommateMessages, fetchOlderOpenChatMessages]);

  // 상단 스크롤 감지 (IntersectionObserver)
  useEffect(() => {
    if (!isInitialScrollReady || !hasNextMessages || isFetchingOlderMessages)
      return;

    const sentinel = topSentinelRef.current;
    const container = scrollRef.current;
    if (!sentinel || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          isInitialScrollReadyRef.current &&
          hasNextMessages &&
          !isFetchingOlderMessages
        ) {
          fetchOlderMessages();
        }
      },
      {
        root: container,
        rootMargin: "80px 0px 0px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    isInitialScrollReady,
    hasNextMessages,
    isFetchingOlderMessages,
    fetchOlderMessages,
  ]);

  // 로컬 메시지 리스트에 커스텀 메시지를 직접 추가하는 헬퍼 함수
  const appendCustomMessageLocal = (content: string) => {
    const nowObj = new Date();
    const nowTime = nowObj.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    setMessageList((prev) => {
      // 이미 동일한 트리거 메시지가 있으면 무시 (중복 추가 방지)
      if (prev.some((m) => m.content === content)) return prev;
      return [
        ...prev,
        {
          id: Date.now(),
          sender: "me",
          content: content,
          time: nowTime,
          createdAt: nowObj.toISOString(),
        },
      ];
    });
  };

  const refreshOpenChatDisclosureStatus = async () => {
    const opponentId = openChatOpponentIdRef.current;
    if (!opponentId) return;

    try {
      const response = await getStudentIdDisclosureStatus(roomId, opponentId);
      setOpenChatDisclosureStatus(response.data);
      setOpenChatOpponentStudentNumber(response.data.targetStudentNumber ?? "");
    } catch (error) {
      console.error("오픈채팅 학번 공개 상태 조회 실패:", error);
    }
  };

  const refreshRoommateDisclosureStatus = async () => {
    const opponentId = opponentIdRef.current;
    if (!opponentId) return;

    try {
      const response = await getStudentIdDisclosureStatus(roomId, opponentId);
      setRoommateDisclosureStatus(response.data);
      setOpponentStudentNumber(response.data.targetStudentNumber ?? "");
    } catch (error) {
      console.error("룸메이트 학번 공개 상태 조회 실패:", error);
    }
  };

  const handleCancelShare = async (requestId: number) => {
    if (processingDisclosureId !== null) return;
    setProcessingDisclosureId(requestId);

    try {
      await cancelStudentIdDisclosure(requestId);
      if (chatType === "roommate") {
        setRoommateDisclosureStatus((current) => ({
          status: "NONE",
          requestId,
          targetStudentNumber: current?.targetStudentNumber ?? null,
        }));
        appendCustomMessageLocal(`[STUDENT_ID_SHARE_CANCEL:${requestId}]`);
        await refreshRoommateDisclosureStatus();
      } else {
        setOpenChatDisclosureStatus((current) => ({
          status: "NONE",
          requestId,
          targetStudentNumber: current?.targetStudentNumber ?? null,
        }));
        await refreshOpenChatDisclosureStatus();
      }
    } catch (error) {
      console.error("학번 공유 취소 실패:", error);
      alert("학번 공유 취소에 실패했습니다.");
    } finally {
      setProcessingDisclosureId(null);
    }
  };

  const handleDeclineShare = async (requestId: number) => {
    if (processingDisclosureId !== null) return;
    setProcessingDisclosureId(requestId);

    try {
      await rejectStudentIdDisclosure(requestId);
      if (chatType === "roommate") {
        setRoommateDisclosureStatus({
          status: "REJECTED",
          requestId,
          targetStudentNumber: null,
        });
        appendCustomMessageLocal(`[STUDENT_ID_SHARE_DECLINE:${requestId}]`);
        await refreshRoommateDisclosureStatus();
      } else {
        setOpenChatDisclosureStatus({
          status: "REJECTED",
          requestId,
          targetStudentNumber: null,
        });
        await refreshOpenChatDisclosureStatus();
      }
    } catch (error) {
      console.error("학번 공유 거절 실패:", error);
      alert("학번 공유 거절에 실패했습니다.");
    } finally {
      setProcessingDisclosureId(null);
    }
  };

  const handleAcceptShare = async (requestId: number) => {
    if (processingDisclosureId !== null) return;
    setProcessingDisclosureId(requestId);

    try {
      const res = await acceptStudentIdDisclosure(requestId);
      const { requesterStudentNumber } = res.data;
      if (chatType === "roommate") {
        setOpponentStudentNumber(requesterStudentNumber);
        setRoommateDisclosureStatus({
          status: "DISCLOSED",
          requestId,
          targetStudentNumber: requesterStudentNumber,
        });
        appendCustomMessageLocal(
          `[STUDENT_ID_SHARE_ACCEPT:${requestId}:${userInfo.studentNumber}:${requesterStudentNumber}]`,
        );
        await refreshRoommateDisclosureStatus();
      } else {
        setOpenChatOpponentStudentNumber(requesterStudentNumber);
        setOpenChatDisclosureStatus({
          status: "DISCLOSED",
          requestId,
          targetStudentNumber: requesterStudentNumber,
        });
        await refreshOpenChatDisclosureStatus();
      }
    } catch (error) {
      console.error("학번 공유 수락 실패:", error);
      alert("학번 공유 수락에 실패했습니다.");
    } finally {
      setProcessingDisclosureId(null);
    }
  };

  const {
    connect: connectRoommate,
    disconnect: disconnectRoommate,
    sendMessage: sendRoommateMessage,
  } = useRoommateChat({
    roomId,
    userId,
    token,
    enabled: chatType === "roommate",
    onMessage: (msg) => {
      const now = new Date();

      const studentIdRequestPayload = parseStudentIdRequestPayload(msg.content);
      if (studentIdRequestPayload) {
        setRoommateDisclosureStatus({
          status:
            studentIdRequestPayload.requesterId === userId
              ? "PENDING_SENT"
              : "PENDING_RECEIVED",
          requestId: studentIdRequestPayload.requestId,
          targetStudentNumber: null,
        });
        void refreshRoommateDisclosureStatus();
        return;
      }

      // 학번 공유 관련 특수 메시지 실시간 감지
      const parsed = parseLegacyRoommateShareMessage(msg.content);
      if (msg.system) {
        void refreshRoommateDisclosureStatus();
      }
      if (parsed.type) {
        if (parsed.type === "REQUEST" && parsed.requestId) {
          setRoommateDisclosureStatus({
            status: "PENDING_RECEIVED",
            requestId: parsed.requestId,
            targetStudentNumber: null,
          });
        } else if (parsed.type === "CANCEL" && parsed.requestId) {
          setRoommateDisclosureStatus({
            status: "NONE",
            requestId: parsed.requestId,
            targetStudentNumber: null,
          });
        } else if (parsed.type === "DECLINE" && parsed.requestId) {
          setRoommateDisclosureStatus({
            status: "REJECTED",
            requestId: parsed.requestId,
            targetStudentNumber: null,
          });
        } else if (parsed.type === "ACCEPT" && parsed.requestId) {
          const receivedOpponentStudentNumber =
            parsed.acceptorStudentNumber ?? "";
          setRoommateDisclosureStatus({
            status: "DISCLOSED",
            requestId: parsed.requestId,
            targetStudentNumber: receivedOpponentStudentNumber || null,
          });
          if (receivedOpponentStudentNumber) {
            setOpponentStudentNumber(receivedOpponentStudentNumber);
          }

          // 수락 메시지 수신 시 상대방 학번 정보 조회
          const oppId = opponentIdRef.current;
          if (oppId) {
            getStudentIdDisclosureStatus(roomId, oppId)
              .then((res) => {
                setRoommateDisclosureStatus(res.data);
                if (res.data.targetStudentNumber) {
                  setOpponentStudentNumber(res.data.targetStudentNumber);
                }
              })
              .catch((err) => console.error("학번 조회 실패:", err));
          }
        }
      }

      setMessageList((prev) => {
        const messageId = msg.roommateChatId || msg.messageId || Date.now();
        const isMyMessage = msg.userId === userId;

        if (prev.some((message) => message.id === messageId)) {
          return prev;
        }

        // 이미 렌더링된 학번 공유 관련 동일 내용 메시지가 있다면 무시
        if (
          msg.content.startsWith("[STUDENT_ID_SHARE_") &&
          prev.some((m) => m.content === msg.content)
        ) {
          return prev;
        }

        const { content, isBot, isBotQuestion, nickname } =
          parseChatBuliPayload(msg.content);

        const nextMessage: MessageType = {
          id: messageId,
          sender: isMyMessage ? "me" : "other",
          senderId: msg.userId,
          nickname: nickname || undefined,
          content,
          isSystem: Boolean(msg.system),
          isBot: isBot || Boolean(msg.system),
          isBotQuestion,
          userImageUrl: msg.userImageUrl,
          // 실시간 발신 메시지는 상대방의 읽음 이벤트를 받기 전까지 미확인이다.
          // 서버의 최초 WebSocket 메시지는 read가 누락되거나 발신자 기준 true일 수 있다.
          isRead: isMyMessage ? false : msg.read,
          time: new Date(msg.createdDate || now).toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          createdAt: msg.createdDate || now.toISOString(),
        };

        // 1. 내 질문 메시지가 소켓으로 돌아왔을 때, 이미 로컬에 추가된 질문 메시지를 찾아 in-place로 ID/정보 업데이트 (순서 역전 방지)
        if (isBotQuestion && isMyMessage) {
          const localQuestionIdx = prev.findIndex(
            (m) =>
              m.sender === "me" &&
              m.isBotQuestion &&
              (m.content === content ||
                m.content === `[챗불이에게 질문] ${content}` ||
                content === `[챗불이에게 질문] ${m.content}`),
          );
          if (localQuestionIdx !== -1) {
            const copy = [...prev];
            copy[localQuestionIdx] = {
              ...copy[localQuestionIdx],
              id: messageId,
              isRead: msg.read,
              createdAt: msg.createdDate || copy[localQuestionIdx].createdAt,
            };
            return copy;
          }
        }

        // 2. 챗불이 답변 메시지가 소켓으로 돌아왔을 때, 스트리밍 중이던 임시 봇 메시지를 찾아 in-place로 교체 (순서 역전 방지)
        if (isBot && nickname === "챗불이") {
          const tempIdx = prev.findIndex(
            (m) =>
              m.isBot &&
              m.nickname === "챗불이" &&
              (m.content === content ||
                m.content === "답변을 준비하고 있어요..." ||
                content.includes(m.content) ||
                m.content.includes(content)),
          );
          if (tempIdx !== -1) {
            const copy = [...prev];
            copy[tempIdx] = nextMessage;
            return copy;
          }
        }

        return [...prev, nextMessage];
      });
    },
    onRead: ({ messageIds, lastReadMessageId }) => {
      const readIds = new Set(messageIds.map(String));
      const numericLastReadMessageId = Number(lastReadMessageId);
      const hasLastReadMessageId = Number.isFinite(numericLastReadMessageId);

      setMessageList((current) =>
        current.map((message) => {
          if (message.sender !== "me" || message.isRead !== false) {
            return message;
          }

          const messageId = Number(message.id);
          const wasRead =
            readIds.has(String(message.id)) ||
            (hasLastReadMessageId &&
              Number.isFinite(messageId) &&
              messageId <= numericLastReadMessageId);

          return wasRead ? { ...message, isRead: true } : message;
        }),
      );
    },
    onConnect: () => {
      console.log("✅ WebSocket 연결됨");
    },
    onDisconnect: () => {
      console.log("🛑 WebSocket 연결 해제됨");
    },
  });

  const {
    connect: connectOpen,
    disconnect: disconnectOpen,
    sendMessage: sendOpenMessage,
    sendRead: sendOpenRead,
  } = useOpenChat({
    roomId,
    userId,
    token,
    onMessage: (msg) => {
      const now = new Date();
      const studentIdRequestPayload = parseStudentIdRequestPayload(msg.content);
      const normalizedType = studentIdRequestPayload
        ? "STUDENT_ID_REQUEST"
        : msg.type;
      const normalizedRequestId =
        msg.disclosureRequestId ?? studentIdRequestPayload?.requestId ?? null;
      const normalizedSenderId =
        studentIdRequestPayload?.requesterId ?? msg.senderId ?? null;
      const normalizedNickname =
        msg.senderNickname || studentIdRequestPayload?.requesterNickname;

      if (normalizedSenderId !== userId && msg.messageId) {
        sendOpenRead(msg.messageId);
      }

      if (
        chatType === "open" &&
        (normalizedType === "STUDENT_ID_REQUEST" ||
          (normalizedType === "SYSTEM" && isOpenChatLeaveMessage(msg.content)))
      ) {
        return;
      }

      if (
        chatType === "personal" &&
        normalizedType === "STUDENT_ID_REQUEST" &&
        normalizedRequestId
      ) {
        if (normalizedSenderId && normalizedSenderId !== userId) {
          openChatOpponentIdRef.current = normalizedSenderId;
        }
        setOpenChatDisclosureStatus({
          status:
            normalizedSenderId === userId ? "PENDING_SENT" : "PENDING_RECEIVED",
          requestId: normalizedRequestId,
          targetStudentNumber: null,
        });
      } else if (chatType === "personal" && normalizedType === "SYSTEM") {
        void refreshOpenChatDisclosureStatus();
      }

      setMessageList((prev) => {
        const rawContent = studentIdRequestPayload
          ? "학번 공유 요청"
          : msg.content;
        const { content, isBot, isBotQuestion, nickname } =
          parseChatBuliPayload(rawContent);

        const nextMessage: MessageType = {
          id: msg.messageId || Date.now(),
          sender: normalizedSenderId === userId ? "me" : "other",
          content,
          nickname:
            nickname ||
            normalizedNickname ||
            undefined,
          userImageUrl: null,
          isSystem: normalizedType === "SYSTEM",
          isBot: isBot || msg.isBot || normalizedType === "BOT",
          isBotQuestion,
          senderId: normalizedSenderId,
          type: normalizedType,
          imageUrls: msg.imageUrls ?? [],
          disclosureRequestId: normalizedRequestId,
          linkedRoomId: msg.linkedRoomId,
          linkedRoomName: msg.linkedRoomName,
          linkedRoomDescription: msg.linkedRoomDescription,
          linkedRoomMaxParticipants: msg.linkedRoomMaxParticipants,
          unreadCount: msg.unreadCount,
          time: now.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          createdAt: msg.createdAt || now.toISOString(),
        };

        // 1. 내 질문 메시지가 소켓으로 돌아왔을 때, 이미 로컬에 추가된 질문 메시지를 찾아 in-place로 ID/정보 업데이트 (순서 역전 방지)
        if (isBotQuestion && normalizedSenderId === userId) {
          const localQuestionIdx = prev.findIndex(
            (m) =>
              m.sender === "me" &&
              m.isBotQuestion &&
              (m.content === content ||
                m.content === `[챗불이에게 질문] ${content}` ||
                content === `[챗불이에게 질문] ${m.content}`),
          );
          if (localQuestionIdx !== -1) {
            const copy = [...prev];
            copy[localQuestionIdx] = {
              ...copy[localQuestionIdx],
              id: msg.messageId || copy[localQuestionIdx].id,
              unreadCount: msg.unreadCount,
              createdAt: msg.createdAt || copy[localQuestionIdx].createdAt,
            };
            return copy;
          }
        }

        // 2. 챗불이 답변 메시지가 소켓으로 돌아왔을 때, 스트리밍 중이던 임시 봇 메시지를 찾아 in-place로 교체 (순서 역전 방지)
        if (isBot && nickname === "챗불이") {
          const tempIdx = prev.findIndex(
            (m) =>
              m.isBot &&
              m.nickname === "챗불이" &&
              (m.content === content ||
                m.content === "답변을 준비하고 있어요..." ||
                content.includes(m.content) ||
                m.content.includes(content)),
          );
          if (tempIdx !== -1) {
            const copy = [...prev];
            copy[tempIdx] = nextMessage;
            return copy;
          }
        }

        const isDuplicate = prev.some(
          (message) =>
            message.id === nextMessage.id ||
            (normalizedType === "STUDENT_ID_REQUEST" &&
              message.type === "STUDENT_ID_REQUEST" &&
              message.disclosureRequestId === normalizedRequestId),
        );
        if (isDuplicate) return prev;

        return [...prev, nextMessage];
      });
    },
    onRead: ({ messageId, unreadCount }) => {
      setMessageList((current) =>
        current.map((message) => {
          if (
            message.id > messageId ||
            typeof message.unreadCount !== "number"
          ) {
            return message;
          }

          // 최신 메시지를 읽었다면 그보다 앞선 메시지도 읽은 상태다.
          // 기존 값보다 커지지 않도록 줄어드는 방향으로만 소급 반영한다.
          const nextUnreadCount = Math.min(message.unreadCount, unreadCount);

          return nextUnreadCount === message.unreadCount
            ? message
            : { ...message, unreadCount: nextUnreadCount };
        }),
      );
    },
    onConnect: () => {
      console.log("✅ Open WebSocket 연결됨");
      sendOpenRead();
    },
    onDisconnect: () => {
      console.log("🛑 Open WebSocket 연결 해제됨");
    },
  });

  useEffect(() => {
    isLeavingRef.current = false;

    const init = async () => {
      if (chatType === "roommate") {
        setTypeString("룸메이트");
        setIsHistoryLoading(true);
        setIsBlockedByPartner(Boolean(location.state?.isBlockedByPartner));
        try {
          // 1. 상대방 ID 조회
          let oppId: number | null = null;
          let fetchedRoommateDisclosureStatus: StudentIdDisclosureStatus | null =
            null;
          try {
            const roomResponse = await getRoommateChatRoom(roomId);
            const currentRoom = roomResponse.data;
            if (currentRoom) {
              oppId = currentRoom.partnerId;
              opponentIdRef.current = oppId;
              setIsBlockedByPartner(
                Boolean(currentRoom.isBlockedByPartner),
              );
              void refreshBlockedPartnerStatus(oppId);

              const opponentBoardTitle = currentRoom.opponentBoardTitle?.trim();
              const nextBoardLink = {
                title: opponentBoardTitle || "삭제된 게시물입니다",
                owner: "opponent" as const,
              };

              setRoommateBoardLink((current) => ({
                ...nextBoardLink,
                boardId:
                  current?.title === nextBoardLink.title &&
                  current.owner === nextBoardLink.owner
                    ? current.boardId
                    : undefined,
              }));
            }
          } catch (e) {
            console.error("채팅방 목록 조회 실패:", e);
          }

          // 2. 학번 공유 상태 조회
          if (oppId) {
            try {
              const statusResponse = await getStudentIdDisclosureStatus(
                roomId,
                oppId,
              );
              fetchedRoommateDisclosureStatus = statusResponse.data;
              setRoommateDisclosureStatus(statusResponse.data);
              const { targetStudentNumber } = statusResponse.data;
              if (targetStudentNumber) {
                setOpponentStudentNumber(targetStudentNumber);
              }
            } catch (e) {
              console.error("학번 공유 상태 조회 실패:", e);
            }
          }

          try {
            await patchRoommateChatRead(roomId);
          } catch (error) {
            console.error("룸메이트 채팅 읽음 처리 실패:", error);
          }

          const response = await getRoommateChatHistory(roomId);
          const chats = response.data;
          if (!oppId) {
            const opponentMessage = chats.find(
              (chat) => !chat.system && chat.userId !== userId,
            );
            if (opponentMessage) {
              oppId = opponentMessage.userId;
              opponentIdRef.current = opponentMessage.userId;
              void refreshBlockedPartnerStatus(opponentMessage.userId);

              try {
                const statusResponse = await getStudentIdDisclosureStatus(
                  roomId,
                  opponentMessage.userId,
                );
                fetchedRoommateDisclosureStatus = statusResponse.data;
                setRoommateDisclosureStatus(statusResponse.data);
                setOpponentStudentNumber(
                  statusResponse.data.targetStudentNumber ?? "",
                );
              } catch (error) {
                console.error("룸메이트 학번 공유 상태 조회 실패:", error);
              }
            }
          }

          // 기존 API 데이터
          const formattedMessages: MessageType[] = chats
            .filter((chat) => !parseStudentIdRequestPayload(chat.content))
            .map((chat) => {
              const { content, isBot, isBotQuestion, nickname } =
                parseChatBuliPayload(chat.content);
              return {
                id: chat.roommateChatId,
                sender: chat.userId === userId ? "me" : "other",
                senderId: chat.userId,
                nickname: nickname || undefined,
                content,
                isBotQuestion,
                isBot: isBot || Boolean(chat.system),
                userImageUrl: chat.userImageUrl, // 프로필 이미지 URL 추가
                isSystem: Boolean(chat.system),
                time: new Date(chat.createdDate).toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }),
                createdAt: chat.createdDate, // API에서 받은 날짜 저장
                isRead: chat.read,
              };
            });

          const currentStatusRequestId =
            fetchedRoommateDisclosureStatus?.requestId;
          const normalizedRoommateStatus = normalizeDisclosureStatus(
            fetchedRoommateDisclosureStatus?.status,
          );
          if (
            currentStatusRequestId &&
            !CANCELED_DISCLOSURE_STATUSES.has(normalizedRoommateStatus) &&
            !formattedMessages.some(
              (message) =>
                parseLegacyRoommateShareMessage(message.content).requestId ===
                currentStatusRequestId,
            )
          ) {
            const now = new Date();
            formattedMessages.push({
              id: Date.now(),
              sender: isReceivedDisclosureStatus(normalizedRoommateStatus)
                ? "other"
                : "me",
              senderId: isReceivedDisclosureStatus(normalizedRoommateStatus)
                ? oppId
                : userId,
              content: `[STUDENT_ID_SHARE_REQUEST:${currentStatusRequestId}]`,
              time: now.toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }),
              createdAt: now.toISOString(),
            });
          }

          if (
            pendingDisclosureRequestId &&
            !formattedMessages.some(
              (message) =>
                parseLegacyRoommateShareMessage(message.content).requestId ===
                pendingDisclosureRequestId,
            )
          ) {
            const now = new Date();
            formattedMessages.push({
              id: Date.now(),
              sender: "me",
              senderId: userId,
              content: `[STUDENT_ID_SHARE_REQUEST:${pendingDisclosureRequestId}]`,
              time: now.toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }),
              createdAt: now.toISOString(),
            });
            setRoommateDisclosureStatus({
              status: "PENDING_SENT",
              requestId: pendingDisclosureRequestId,
              targetStudentNumber: null,
            });
          }

          allRoommateMessagesRef.current = formattedMessages;
          roommateLoadedCountRef.current = 30;

          if (formattedMessages.length > 30) {
            setHasNextMessages(true);
            setMessageList(
              formattedMessages.slice(formattedMessages.length - 30),
            );
          } else {
            setHasNextMessages(false);
            setMessageList(formattedMessages);
          }
          clearPendingDisclosureRouteState();
        } catch (error) {
          console.error("채팅 내역 불러오기 실패:", error);
        } finally {
          setIsHistoryLoading(false);
        }
        connectRoommate();
      } else if (chatType === "open" || chatType === "personal") {
        setTypeString(chatType === "open" ? "오픈채팅" : "1대1 채팅");
        setIsHistoryLoading(true);
        setIsBlockedByPartner(Boolean(routeRoom?.isBlockedByPartner));

        if ((chatType === "open" || chatType === "personal") && !openChatRoomName) {
          try {
            const roomsResponse = await getOpenChatRooms("MY", 0, 50);
            const currentRoom = roomsResponse.data.content.find(
              (room) => room.roomId === roomId,
            );

            if (currentRoom) {
              setOpenChatRoomName(currentRoom.name);
              setIsBlockedByPartner(Boolean(currentRoom.isBlockedByPartner));
            }
          } catch (error) {
            console.error("오픈채팅방 정보 조회 실패:", error);
          }
        }

        try {
          const [response, participantsResponse] = await Promise.all([
            getOpenChatMessages(roomId, null, 30),
            getOpenChatParticipants(roomId),
          ]);
          setHasNextMessages(response.data.hasNext);
          setNextCursor(response.data.nextCursor);

          const participantsData = participantsResponse.data.participants;
          setParticipants(participantsData);
          setIsOpenChatHost(
            participantsData.some(
              (participant) =>
                participant.userId === userId && participant.isHost,
            ),
          );

          // 응답 순서와 관계없이 화면에는 과거 메시지부터 최신 메시지 순으로 표시한다.
          const chats = [...response.data.messages].sort((a, b) => {
            const createdAtDifference =
              Date.parse(a.createdAt) - Date.parse(b.createdAt);

            if (Number.isFinite(createdAtDifference)) {
              return createdAtDifference || a.messageId - b.messageId;
            }

            return a.messageId - b.messageId;
          });
          const visibleChats =
            chatType === "open"
              ? chats
                  .filter((message) => message.type !== "STUDENT_ID_REQUEST")
                  .filter(
                    (message) =>
                      !(
                        message.type === "SYSTEM" &&
                        isOpenChatLeaveMessage(message.content)
                      ),
                  )
              : chats;
          let disclosureOpponentId =
            chatType === "personal" ? openChatOpponentIdRef.current : null;
          let fetchedOpenChatDisclosureStatus: StudentIdDisclosureStatus | null =
            null;

          if (chatType === "personal") {
            const opponent = participantsData.find(
              (participant) => participant.userId !== userId,
            );
            if (opponent) {
              disclosureOpponentId = opponent.userId;
            }
          }

          if (chatType === "personal" && !disclosureOpponentId) {
            const receivedRequest = visibleChats.find(
              (message) =>
                message.type === "STUDENT_ID_REQUEST" &&
                message.senderId !== null &&
                message.senderId !== userId,
            );
            disclosureOpponentId = receivedRequest?.senderId ?? null;
          }

          if (chatType === "personal" && disclosureOpponentId) {
            openChatOpponentIdRef.current = disclosureOpponentId;
            void refreshBlockedPartnerStatus(disclosureOpponentId);
            try {
              const statusResponse = await getStudentIdDisclosureStatus(
                roomId,
                disclosureOpponentId,
              );
              fetchedOpenChatDisclosureStatus = statusResponse.data;
              setOpenChatDisclosureStatus(statusResponse.data);
              setOpenChatOpponentStudentNumber(
                statusResponse.data.targetStudentNumber ?? "",
              );
            } catch (error) {
              console.error("오픈채팅 학번 공개 상태 조회 실패:", error);
            }
          }

          const formattedMessages: MessageType[] =
            dedupeStudentIdDisclosureMessages(
              visibleChats.map((chat) =>
                mapOpenChatMessageToMessageType(chat, userId),
              ),
            );

          const currentOpenChatRequestId =
            fetchedOpenChatDisclosureStatus?.requestId;
          const normalizedOpenChatStatus = normalizeDisclosureStatus(
            fetchedOpenChatDisclosureStatus?.status,
          );
          if (
            chatType === "personal" &&
            currentOpenChatRequestId &&
            !CANCELED_DISCLOSURE_STATUSES.has(normalizedOpenChatStatus) &&
            !formattedMessages.some(
              (message) =>
                message.type === "STUDENT_ID_REQUEST" &&
                message.disclosureRequestId === currentOpenChatRequestId,
            )
          ) {
            const now = new Date();
            formattedMessages.push({
              id: Date.now(),
              sender: isReceivedDisclosureStatus(normalizedOpenChatStatus)
                ? "other"
                : "me",
              senderId: isReceivedDisclosureStatus(normalizedOpenChatStatus)
                ? disclosureOpponentId
                : userId,
              content: isReceivedDisclosureStatus(normalizedOpenChatStatus)
                ? "학번 공유 요청이 도착했어요."
                : "학번 공유를 요청했어요.",
              type: "STUDENT_ID_REQUEST",
              disclosureRequestId: currentOpenChatRequestId,
              time: now.toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }),
              createdAt: now.toISOString(),
            });
          }

          if (
            chatType === "personal" &&
            pendingDisclosureRequestId &&
            !formattedMessages.some(
              (message) =>
                message.type === "STUDENT_ID_REQUEST" &&
                message.disclosureRequestId === pendingDisclosureRequestId,
            )
          ) {
            const now = new Date();
            formattedMessages.push({
              id: Date.now(),
              sender: "me",
              senderId: userId,
              content: "학번 공유를 요청했어요.",
              type: "STUDENT_ID_REQUEST",
              disclosureRequestId: pendingDisclosureRequestId,
              time: now.toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }),
              createdAt: now.toISOString(),
            });
            setOpenChatDisclosureStatus({
              status: "PENDING_SENT",
              requestId: pendingDisclosureRequestId,
              targetStudentNumber: null,
            });
          }

          setMessageList(formattedMessages);
          clearPendingDisclosureRouteState();
        } catch (error) {
          console.error("오픈채팅방 메시지 조회 실패:", error);
        } finally {
          setIsHistoryLoading(false);
        }
        connectOpen();
      } else {
        setTypeString("개인대화");
        setMessageList([
          {
            id: 1,
            sender: "other",
            content:
              "안녕하세요! 아까 오픈채팅방에서 얘기 나누던 사람입니다. 기숙사 신관 3동이 맞으시죠?",
            time: "오후 1:15",
            createdAt: "2026-07-01T13:15:00Z",
            userImageUrl: null,
          },
          {
            id: 2,
            sender: "me",
            content: "안녕하세요! 네 맞아요. 신관 3동 402호에 살고 있어요.",
            time: "오후 1:17",
            createdAt: "2026-07-01T13:17:00Z",
          },
          {
            id: 3,
            sender: "other",
            content: "[STUDENT_ID_SHARE_REQUEST:999:202012345]",
            time: "오후 1:18",
            createdAt: "2026-07-01T13:18:00Z",
          },
          {
            id: 4,
            sender: "me",
            content: "[STUDENT_ID_SHARE_REQUEST:888:202154321]",
            time: "오후 1:19",
            createdAt: "2026-07-01T13:19:00Z",
          },
          {
            id: 5,
            sender: "other",
            content: "[STUDENT_ID_SHARE_ACCEPT:777:202209876:202154321]",
            time: "오후 1:20",
            createdAt: "2026-07-01T13:20:00Z",
          },
          {
            id: 6,
            sender: "other",
            content: "[STUDENT_ID_SHARE_CANCEL:666]",
            time: "오후 1:21",
            createdAt: "2026-07-01T13:21:00Z",
          },
          {
            id: 7,
            sender: "other",
            content: "[STUDENT_ID_SHARE_DECLINE:555]",
            time: "오후 1:22",
            createdAt: "2026-07-01T13:22:00Z",
          },
        ]);
      }
    };
    init();
    return () => {
      isLeavingRef.current = true;
      // 연결 여부 state는 effect가 실행될 때의 값을 캡처하므로 cleanup 시점에는
      // 실제 연결 상태와 다를 수 있다. 채팅 종류에 맞는 소켓을 항상 정리해야
      // 같은 종류의 다른 방으로 이동할 때 이전 방 연결이 남지 않는다.
      if (chatType === "roommate") disconnectRoommate();
      if (chatType === "open" || chatType === "personal") disconnectOpen();
    };
  }, [chatType, roomId]);

  const handleInput = () => {
    const el = inputRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
    }
  };

  const CHATBULI_PREFIX_REGEX =
    /^\/(?:ㅊ|채|챗|챗ㅂ|챗부|챗불|챗불ㅇ|챗불이)?(\s|\n)/;
  const CHATBULI_TYPING_REGEX =
    /^\/(?:ㅊ|채|챗|챗ㅂ|챗부|챗불|챗불ㅇ|챗불이)?$/;

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;

    if (!isChatBuliActive) {
      if (CHATBULI_PREFIX_REGEX.test(val)) {
        setIsChatBuliActive(true);
        setIsSlashMenuOpen(false);
        const remaining = val.replace(CHATBULI_PREFIX_REGEX, "");
        setInputValue(remaining);
        if (inputRef.current) {
          inputRef.current.value = remaining;
          inputRef.current.style.height = "auto";
        }
        return;
      }

      if (CHATBULI_TYPING_REGEX.test(val)) {
        setIsSlashMenuOpen(true);
      } else {
        setIsSlashMenuOpen(false);
      }
    }

    setInputValue(val);
  };

  const handleSelectCommand = (_cmd?: "챗불이") => {
    setIsChatBuliActive(true);
    setIsSlashMenuOpen(false);
    setInputValue("");
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.style.height = "auto";
      inputRef.current.focus();
    }
  };

  const isMobileDevice = () => {
    if (typeof window === "undefined") return false;
    const platform = getMobilePlatform();
    if (platform !== "other") return true;
    return (
      /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent || "",
      ) || (navigator.maxTouchPoints > 0 && window.innerWidth <= 768)
    );
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Backspace" && inputValue === "" && isChatBuliActive) {
      e.preventDefault();
      setIsChatBuliActive(false);
      return;
    }
    if (e.key === "Escape" && isSlashMenuOpen) {
      e.preventDefault();
      setIsSlashMenuOpen(false);
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      if (e.nativeEvent.isComposing) {
        return;
      }
      if (isSlashMenuOpen && !isChatBuliActive) {
        if (CHATBULI_TYPING_REGEX.test(inputValue.trim())) {
          e.preventDefault();
          handleSelectCommand("챗불이");
          return;
        }
      }

      // 모바일 환경(앱 및 모바일 웹)에서는 엔터 입력 시 전송 대신 줄바꿈 실행
      if (isMobileDevice()) {
        return;
      }

      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (isChatBlocked) {
      alert(blockedChatMessage);
      return;
    }
    const trimmedInput = inputValue.trim();
    if (!trimmedInput && !isChatBuliActive) return;

    if (trimmedInput.startsWith("[STUDENT_ID_SHARE_")) {
      alert("올바르지 않은 메시지 형식입니다.");
      return;
    }

    // 1. 챗불이 AI 슬래시 명령어 처리
    const isChatBuliCommand =
      isChatBuliActive ||
      trimmedInput === "/챗불이" ||
      trimmedInput.startsWith("/챗불이");

    if (isChatBuliCommand) {
      let question = trimmedInput;
      if (question.startsWith("/챗불이")) {
        question = question.replace(/^\/챗불이\s*/, "").trim();
      }

      if (!question) {
        alert("챗불이에게 물어볼 질문을 입력해주세요.");
        return;
      }

      const questionPayload = `[챗불이에게 질문] ${question}\n[CHATBULI_QUESTION]`;

      const userMsgId = Date.now();
      const tempBotMsgId = userMsgId + 1;
      const now = new Date();
      const nowTime = now.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const userQuestionMessage: MessageType = {
        id: userMsgId,
        sender: "me",
        senderId: userId,
        content: question,
        isBotQuestion: true,
        time: nowTime,
        createdAt: now.toISOString(),
      };

      const tempBotMessage: MessageType = {
        id: tempBotMsgId,
        sender: "other",
        senderId: null,
        nickname: "챗불이",
        content: "답변을 준비하고 있어요...",
        isBot: true,
        time: nowTime,
        createdAt: new Date(now.getTime() + 100).toISOString(),
      };

      // 질문과 답변을 반드시 [질문, 답변] 순서로 동시에 로컬 상태에 먼저 배치 (순서 역전 방지)
      setMessageList((prev) => [...prev, userQuestionMessage, tempBotMessage]);

      setIsChatBuliActive(false);
      setIsSlashMenuOpen(false);
      setInputValue("");
      if (inputRef.current) {
        inputRef.current.value = "";
        inputRef.current.style.height = "auto";
        inputRef.current.focus();
      }
      wasNearBottomRef.current = true;
      scrollToBottom();
      requestAnimationFrame(() => {
        scrollToBottom();
        setTimeout(() => scrollToBottom(), 80);
      });

      // 소켓으로 질문 전송 (끊김 시 자동 재연결 시도 후 전송)
      const sendQuestion = async () => {
        let success = false;
        if (chatType === "roommate") {
          success = await sendRoommateMessage(questionPayload);
        } else if (chatType === "open" || chatType === "personal") {
          success = await sendOpenMessage(questionPayload);
        }
        if (!success) {
          console.warn("챗불이 질문 소켓 전송 실패 (재연결 실패)");
        }
      };
      void sendQuestion();

      let accumulated = "";
      const sessionId = `${chatType || "chat"}-${roomId}`;

      streamUnidormChat({
        question,
        history: [],
        userId: userInfo.id,
        sessionId,
        onChunk: (chunk) => {
          accumulated += chunk;
          setMessageList((prev) =>
            prev.map((msg) =>
              msg.id === tempBotMsgId
                ? { ...msg, content: accumulated }
                : msg,
            ),
          );
        },
      })
        .then(async () => {
          // 3. 스트리밍 완료 시 소켓을 통해 방 전체에 완성된 챗불이 답변 전송
          const finalAnswer = accumulated.trim();
          if (finalAnswer) {
            const answerPayload = `[챗불이 답변]\n${finalAnswer}\n[CHATBULI_ANSWER]`;
            let success = false;
            if (chatType === "roommate") {
              success = await sendRoommateMessage(answerPayload);
            } else if (chatType === "open" || chatType === "personal") {
              success = await sendOpenMessage(answerPayload);
            }

            if (!success) {
              console.error("챗불이 답변 소켓 전송 실패");
              setMessageList((prev) =>
                prev.map((msg) =>
                  msg.id === tempBotMsgId
                    ? {
                        ...msg,
                        content:
                          accumulated +
                          "\n\n(⚠️ 네트워크 접속 오류로 채팅방에 답변이 전송되지 않았습니다. 다른 사람에게 보이지 않으며, 다시 접속 시 사라집니다.)",
                      }
                    : msg,
                ),
              );
            }
          }
        })
        .catch((err) => {
          console.error("챗불이 스트리밍 응답 오류:", err);
          setMessageList((prev) =>
            prev.map((msg) =>
              msg.id === tempBotMsgId
                ? {
                    ...msg,
                    content:
                      accumulated ||
                      "챗불이 답변을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
                  }
                : msg,
            ),
          );
        });

      return;
    }

    // 일반 메시지 전송
    setInputValue("");
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.style.height = "auto";
      inputRef.current.focus();
    }
    wasNearBottomRef.current = true;
    scrollToBottom();
    requestAnimationFrame(() => {
      scrollToBottom();
      setTimeout(() => scrollToBottom(), 80);
    });

    let sent = false;
    if (chatType === "roommate") {
      sent = await sendRoommateMessage(trimmedInput);
    } else if (chatType === "open" || chatType === "personal") {
      sent = await sendOpenMessage(trimmedInput);
    }

    if (!sent) {
      alert("채팅 서버와 연결이 불안정하여 전송에 실패했습니다. 다시 시도해 주세요.");
      setInputValue(trimmedInput);
      if (inputRef.current) {
        inputRef.current.value = trimmedInput;
        inputRef.current.focus();
      }
    }
  };

  const toMessageType = (message: OpenChatMessage): MessageType => {
    const { content, isBot, isBotQuestion, nickname } =
      parseChatBuliPayload(message.content);
    return {
      id: message.messageId,
      sender: message.senderId === userId ? "me" : "other",
      senderId: message.senderId,
      content,
      nickname: nickname || message.senderNickname || undefined,
      isSystem: message.type === "SYSTEM",
      isBot: isBot || message.isBot || message.type === "BOT",
      isBotQuestion,
      type: message.type,
      imageUrls: message.imageUrls ?? [],
      disclosureRequestId: message.disclosureRequestId,
      linkedRoomId: message.linkedRoomId,
      linkedRoomName: message.linkedRoomName,
      linkedRoomDescription: message.linkedRoomDescription,
      linkedRoomMaxParticipants: message.linkedRoomMaxParticipants,
      unreadCount: message.unreadCount,
      time: new Date(message.createdAt).toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      createdAt: message.createdAt,
    };
  };

  const handleSendImages = async (files: File[]) => {
    if (isChatBlocked) {
      alert(blockedChatMessage);
      return;
    }

    try {
      const response = await sendOpenChatImages(roomId, files);
      setMessageList((current) => {
        const currentIds = new Set(current.map((message) => message.id));
        const newMessages = response.data
          .map(toMessageType)
          .filter((message) => !currentIds.has(message.id));
        return [...current, ...newMessages];
      });
    } catch (error) {
      console.error("사진 전송 실패:", error);
      alert(
        "사진 전송에 실패했습니다. 이미지 형식과 네트워크 상태를 확인해주세요.",
      );
      throw error;
    }
  };

  const openMessageActions = (message: MessageType) => {
    if (chatType !== "open" || message.sender !== "other" || message.isSystem)
      return;
    setSelectedMessage(message);
    setMessageSheetOpen(true);
  };

  const handleReportMessage = async (reason: OpenChatReportReason) => {
    if (!selectedMessage) return;
    await reportOpenChatMessage(selectedMessage.id, reason);
    alert("신고가 접수되었습니다.");
  };

  const handleKickSender = async () => {
    if (!selectedMessage?.senderId) return;
    await kickOpenChatParticipant(roomId, selectedMessage.senderId, "OTHER");
    alert("참여자를 퇴장시켰습니다.");
  };

  const handleAvatarClick = (msg: MessageType) => {
    if (
      msg.isBot ||
      msg.isSystem ||
      !msg.senderId ||
      msg.senderId === userId
    ) {
      return;
    }

    if (chatType === "open") {
      const found = participants.find((p) => p.userId === msg.senderId);
      const target: OpenChatParticipant = found ?? {
        userId: msg.senderId,
        nickname: msg.nickname || "익명",
        joinedAt: "",
        isHost: false,
        isAdmin: false,
      };
      setSelectedMember(target);
      setMemberActionSheetOpen(true);
    } else if (chatType === "personal" || chatType === "roommate") {
      const target: OpenChatParticipant = {
        userId: msg.senderId,
        nickname: msg.nickname || partnerName || "상대방",
        joinedAt: "",
        isHost: false,
        isAdmin: false,
      };
      setSelectedMember(target);
      setMemberActionSheetOpen(true);
    }
  };

  const handleCreatePersonalChatFromSheet = async () => {
    if (!selectedMember) return;
    try {
      const response = await createPersonalOpenChatRoom({
        name: selectedMember.nickname.trim() || "1:1 채팅",
        targetUserId: selectedMember.userId,
      });
      navigate(`/chat/personal/${response.data.roomId}`, {
        state: {
          partnerName: selectedMember.nickname,
          partnerId: selectedMember.userId,
        },
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        const responseData = error.response.data as
          | { roomId?: number; data?: { roomId?: number } }
          | undefined;
        const conflictRoomId = Number(
          responseData?.roomId ?? responseData?.data?.roomId,
        );
        if (Number.isInteger(conflictRoomId) && conflictRoomId > 0) {
          navigate(`/chat/personal/${conflictRoomId}`, {
            state: {
              partnerName: selectedMember.nickname,
              partnerId: selectedMember.userId,
            },
          });
          return;
        }
      }
      console.error("1:1 채팅방 생성 실패:", error);
      alert("1:1 채팅방 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleTransferHostFromSheet = async () => {
    if (!selectedMember) return;
    if (
      !window.confirm(`${selectedMember.nickname}님에게 방장을 위임할까요?`)
    ) {
      return;
    }
    try {
      await transferOpenChatHost(roomId, selectedMember.userId);
      setIsOpenChatHost(false);
      const res = await getOpenChatParticipants(roomId);
      setParticipants(res.data.participants);
      alert("방장을 위임했습니다.");
    } catch (error) {
      console.error("방장 위임 실패:", error);
      alert("방장 위임에 실패했습니다.");
    }
  };

  const handleKickUserFromSheet = async () => {
    if (!selectedMember) return;
    if (!window.confirm(`${selectedMember.nickname}님을 강퇴할까요?`)) return;
    try {
      await kickOpenChatParticipant(roomId, selectedMember.userId, "OTHER");
      const res = await getOpenChatParticipants(roomId);
      setParticipants(res.data.participants);
      alert("참여자를 강퇴했습니다.");
    } catch (error) {
      console.error("참여자 강퇴 실패:", error);
      alert("참여자 강퇴에 실패했습니다.");
    }
  };

  const handleBlockUserFromSheet = async () => {
    if (!selectedMember) return;
    if (
      !window.confirm(
        `${selectedMember.nickname}님을 차단할까요?\n차단 후 해당 사용자와 1:1 채팅방 생성 및 메시지 전송이 제한됩니다.`,
      )
    ) {
      return;
    }
    try {
      await blockUser(selectedMember.userId);
      setIsBlockedPartner(true);
      alert(`${selectedMember.nickname}님을 차단했습니다.`);
    } catch (error) {
      console.error("사용자 차단 실패:", error);
      alert("사용자 차단에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  const basePartnerName =
    chatType === "roommate" ? "룸메이트 채팅" : "1대1 채팅";
  const headerTitle =
    chatType === "open" ? openChatRoomName || "오픈채팅방" : basePartnerName;

  useSetHeader({
    title: headerTitle,
    titleBadge: chatType === "open" && isOpenChatHost ? "방장" : null,
    hamburgerOnClick: () => {
      navigate(`/chat/${chatType}/${roomId}/members`, {
        state: {
          partnerName,
          partnerId:
            chatType === "roommate"
              ? opponentIdRef.current
              : openChatOpponentIdRef.current,
          partnerProfileImageUrl,
          roomId,
          roomName: openChatRoomName,
          roomDescription: routeRoomDescription,
          room: routeRoom,
        },
      });
    },
  });

  // 날짜 포맷 함수 (YYYY년 M월 D일)
  const formatDateLine = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  // 날짜 비교 함수
  const isSameDate = (date1: string, date2: string) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isSameMinute = (date1: string, date2: string) => {
    const firstTime = new Date(date1).getTime();
    const secondTime = new Date(date2).getTime();

    if (Number.isNaN(firstTime) || Number.isNaN(secondTime)) return false;

    return Math.floor(firstTime / 60_000) === Math.floor(secondTime / 60_000);
  };

  const isRegularBubbleMessage = (message: MessageType) => {
    if (
      message.isSystem ||
      message.isBot ||
      message.type === "ROOM_LINK" ||
      message.type === "STUDENT_ID_REQUEST"
    ) {
      return false;
    }

    return !(
      chatType === "roommate" &&
      parseLegacyRoommateShareMessage(message.content).type
    );
  };

  const isSameMessageSender = (
    firstMessage: MessageType,
    secondMessage: MessageType,
  ) => {
    if (firstMessage.sender !== secondMessage.sender) return false;
    if (firstMessage.sender === "me") return true;

    if (
      typeof firstMessage.senderId === "number" &&
      typeof secondMessage.senderId === "number"
    ) {
      return firstMessage.senderId === secondMessage.senderId;
    }

    if (firstMessage.nickname && secondMessage.nickname) {
      return firstMessage.nickname === secondMessage.nickname;
    }

    return chatType === "roommate" || chatType === "personal";
  };

  const handleRequestShareClick = async () => {
    setMenuOpen(false);
    if (chatType !== "roommate" && chatType !== "personal") return;
    if (isChatBlocked) {
      alert(blockedChatMessage);
      return;
    }

    const targetId =
      chatType === "roommate"
        ? opponentIdRef.current
        : openChatOpponentIdRef.current;

    if (!targetId) {
      alert("상대방 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    if (!window.confirm("학번 공유를 요청할까요?")) return;

    try {
      const res = await requestStudentIdDisclosure(roomId, targetId);
      const { requestId } = res.data;

      if (chatType === "roommate") {
        setRoommateDisclosureStatus({
          status: "PENDING_SENT",
          requestId,
          targetStudentNumber: null,
        });
        appendCustomMessageLocal(`[STUDENT_ID_SHARE_REQUEST:${requestId}]`);
      } else {
        const now = new Date();
        setOpenChatDisclosureStatus({
          status: "PENDING_SENT",
          requestId,
          targetStudentNumber: null,
        });
        setMessageList((current) => [
          ...current,
          {
            id: Date.now(),
            sender: "me",
            senderId: userId,
            content: "학번 공개를 요청했어요.",
            type: "STUDENT_ID_REQUEST",
            disclosureRequestId: requestId,
            time: now.toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            createdAt: now.toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error("학번 공유 요청 실패:", error);
      alert(
        "학번 공유 요청에 실패했습니다. 이미 요청을 보냈거나 처리 중일 수 있습니다.",
      );
    }
  };

  const handleJoinLinkedRoom = async (message: MessageType) => {
    const linkedRoomId = message.linkedRoomId;
    if (!linkedRoomId || joiningLinkedRoomId) return;

    const enterRoom = async () => {
      const response = await joinOpenChatRoom(linkedRoomId);
      const targetRoomId = response.data.roomId ?? linkedRoomId;
      const targetRoomName =
        response.data.name ?? message.linkedRoomName ?? "단체 톡방";

      navigate(`/chat/open/${targetRoomId}`, {
        state: {
          roomName: targetRoomName,
          roomDescription: message.linkedRoomDescription,
        },
      });
    };

    try {
      setJoiningLinkedRoomId(linkedRoomId);
      await enterRoom();
    } catch (error) {
      console.error("파생 톡방 입장 실패:", error);
      if (isAxiosError(error) && error.response?.status === 409) {
        alert("참여 인원이 가득 찬 단체 톡방입니다.");
      } else {
        alert("단체 톡방에 입장하지 못했습니다.");
      }
    } finally {
      setJoiningLinkedRoomId(null);
    }
  };

  const handleRoommateBoardClick = async () => {
    if (!roommateBoardLink) return;

    if (roommateBoardLink.title === "삭제된 게시물입니다") {
      alert("삭제된 게시물입니다.");
      return;
    }

    if (roommateBoardLink.boardId) {
      navigate(`/roommate/list/${roommateBoardLink.boardId}`);
      return;
    }

    navigate("/roommate/list/opponent", {
      state: {
        roomId,
        partnerName,
      },
    });
  };

  return (
    <S.ChatPageWrapper>
      {/* 배경 그라데이션 SVG */}
      <S.BackgroundImage />

      {/* 상단 고정 영역 (Flex Item) */}
      <S.FixedHeaderContainer>
        {chatType === "roommate" && (
          <ChatInfo
            selectedTab={typeString}
            partnerName={partnerName}
            roomId={roomId}
            isChatted={messageList.length > 0}
            boardTitle={roommateBoardLink?.title}
            onBoardTitleClick={handleRoommateBoardClick}
            isMyRoommate={isMyRoommateState}
            isBlocked={isChatBlocked}
          />
        )}
        {chatType === "open" && (
          <S.NoticeContainer ref={noticeRef}>
            <S.NoticeHeader
              onClick={() => setIsNoticeExpanded((prev) => !prev)}
            >
              <S.NoticeTitleArea>
                <S.InfoIconWrapper>
                  <Info size={20} color="#0958d9" />
                </S.InfoIconWrapper>
                <S.NoticeTitle>방 설명 / 활용 예시</S.NoticeTitle>
              </S.NoticeTitleArea>
              <S.ChevronWrapper $expanded={isNoticeExpanded}>
                <ChevronDown size={20} color="#8b8b8b" />
              </S.ChevronWrapper>
            </S.NoticeHeader>

            <S.NoticeBody $expanded={isNoticeExpanded}>
              <S.NoticeParagraph>
                {routeRoomDescription?.trim()
                  ? routeRoomDescription.replace(/\\n/g, "\n").trim()
                  : "생활 정보 공유, 공동구매, 배달 메이트 등 자유롭게 이야기해보세요."}
              </S.NoticeParagraph>
              {!routeRoomDescription?.trim() && (
                <>
                  <S.NoticeParagraph>
                    예시: 같이 배달 시키기 / 생필품 공동구매 / 분실물 문의
                  </S.NoticeParagraph>
                  <S.NoticeParagraph style={{ color: "#8b8b8b" }}>
                    채팅방의 목적에 맞는 대화를 나눠주세요.
                  </S.NoticeParagraph>
                </>
              )}
            </S.NoticeBody>
          </S.NoticeContainer>
        )}
      </S.FixedHeaderContainer>

      {/* 내부 스크롤 채팅 영역 (Flex Item, grow) */}
      <S.ChattingWrapper
        ref={scrollRef}
        onScroll={handleScroll}
        $chatType={chatType}
      >
        {isHistoryLoading ? (
          <LoadingSpinner message="채팅 내역을 가져오고 있습니다..." />
        ) : (
          <>
            {isInitialScrollReady && hasNextMessages && (
              <div
                ref={topSentinelRef}
                style={{ height: "1px", width: "100%", pointerEvents: "none" }}
              />
            )}
            {isFetchingOlderMessages && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "10px 0",
                  gap: "8px",
                }}
              >
                <LoadingSpinner />
              </div>
            )}
            {messageList.map((msg, index) => {
              if (
                chatType === "roommate" &&
                parseStudentIdRequestPayload(msg.content)
              ) {
                return null;
              }

              // 날짜 구분선 표시 여부 확인
              let showDateLine = false;
              if (index === 0) {
                showDateLine = true;
              } else {
                const prevMsg = messageList[index - 1];
                if (!isSameDate(prevMsg.createdAt, msg.createdAt)) {
                  showDateLine = true;
                }
              }

              if (msg.type === "ROOM_LINK" && msg.linkedRoomId) {
                const isJoining = joiningLinkedRoomId === msg.linkedRoomId;

                return (
                  <React.Fragment key={msg.id}>
                    {showDateLine && (
                      <S.DateDivider>
                        {formatDateLine(msg.createdAt)}
                      </S.DateDivider>
                    )}
                    <S.RoomLinkRow>
                      <S.RoomLinkCard
                        type="button"
                        disabled={isJoining}
                        onClick={() => handleJoinLinkedRoom(msg)}
                      >
                        <S.RoomLinkTextArea>
                          <S.RoomLinkLabel>새 단체 톡방</S.RoomLinkLabel>
                          <S.RoomLinkName>
                            {msg.linkedRoomName || "단체 톡방"}
                          </S.RoomLinkName>
                          {msg.linkedRoomDescription && (
                            <S.RoomLinkDescription>
                              {msg.linkedRoomDescription}
                            </S.RoomLinkDescription>
                          )}
                          {msg.linkedRoomMaxParticipants && (
                            <S.RoomLinkMeta>
                              최대 {msg.linkedRoomMaxParticipants}명
                            </S.RoomLinkMeta>
                          )}
                        </S.RoomLinkTextArea>
                        <S.RoomLinkAction>
                          {isJoining ? "입장 중..." : "참여하기"}
                          {!isJoining && <ArrowRight size={18} />}
                        </S.RoomLinkAction>
                      </S.RoomLinkCard>
                    </S.RoomLinkRow>
                  </React.Fragment>
                );
              }

              if (msg.isSystem) {
                if (
                  chatType === "open" &&
                  isOpenChatLeaveMessage(msg.content)
                ) {
                  return null;
                }

                return (
                  <React.Fragment key={msg.id}>
                    {showDateLine && (
                      <S.DateDivider>
                        {formatDateLine(msg.createdAt)}
                      </S.DateDivider>
                    )}
                    <S.ShareSystemMessage>{msg.content}</S.ShareSystemMessage>
                  </React.Fragment>
                );
              }

              if (msg.isBot) {
                const nextMessage = messageList[index + 1];
                const showMessageTime =
                  !nextMessage ||
                  !isRegularBubbleMessage(nextMessage) ||
                  !isSameMessageSender(msg, nextMessage) ||
                  !isSameMinute(msg.createdAt, nextMessage.createdAt);

                const isChatBuli = msg.nickname === "챗불이";

                return (
                  <React.Fragment key={msg.id}>
                    {showDateLine && (
                      <S.DateDivider>{formatDateLine(msg.createdAt)}</S.DateDivider>
                    )}
                    <ChatItemBot
                      content={msg.content}
                      time={msg.time}
                      showTime={showMessageTime}
                      isChatBuli={isChatBuli}
                      title={isChatBuli ? "챗불이" : "공지봇"}
                      subtitle={
                        isChatBuli
                          ? "기숙사 생활 도우미"
                          : "인천대 기숙사 채팅도우미"
                      }
                      onAskHere={
                        isChatBuli
                          ? () => handleSelectCommand("챗불이")
                          : undefined
                      }
                      unreadCount={
                        chatType === "open" || chatType === "personal"
                          ? msg.unreadCount
                          : undefined
                      }
                    />
                  </React.Fragment>
                );
              }

              if (
                chatType === "personal" &&
                msg.type === "STUDENT_ID_REQUEST" &&
                msg.disclosureRequestId
              ) {
                const requestId = msg.disclosureRequestId;
                const isMe = msg.sender === "me";
                const isCurrentRequest =
                  openChatDisclosureStatus?.requestId === requestId;
                const normalizedStatus = isCurrentRequest
                  ? normalizeDisclosureStatus(openChatDisclosureStatus?.status)
                  : "";
                const isLatestRequest = !messageList
                  .slice(index + 1)
                  .some(
                    (message) =>
                      message.type === "STUDENT_ID_REQUEST" &&
                      message.disclosureRequestId,
                  );
                const isPending =
                  isLatestRequest &&
                  (!openChatDisclosureStatus ||
                    (isCurrentRequest &&
                      isPendingDisclosureStatus(normalizedStatus)));
                const isAccepted =
                  isCurrentRequest &&
                  ACCEPTED_DISCLOSURE_STATUSES.has(normalizedStatus);
                const isRejected =
                  isCurrentRequest &&
                  REJECTED_DISCLOSURE_STATUSES.has(normalizedStatus);
                const isCanceled =
                  isCurrentRequest &&
                  CANCELED_DISCLOSURE_STATUSES.has(normalizedStatus);

                const requestCardTitle = isMe
                  ? "학번 공유를 요청했어요"
                  : "학번을 공유하시겠습니까?";

                const requestCardSubtitle = (
                  <>
                    <p>수락하면 이 1:1 채팅방에서만</p>
                    <p>닉네임과 학번이 함께 표시됩니다.</p>
                  </>
                );

                if (isAccepted) {
                  const successCard = (
                    <S.ShareSuccessCard>
                      <S.ShareSuccessTitle>
                        <CheckCircle2 size={20} color="#3B7CF6" />
                        학번 공유 완료
                      </S.ShareSuccessTitle>
                      <S.ShareSuccessInfo>
                        <S.ShareSuccessInfoRow>
                          <span className="label">나</span>
                          <span className="value">
                            {userInfo.studentNumber || "알 수 없음"}
                          </span>
                        </S.ShareSuccessInfoRow>
                        <S.ShareSuccessInfoRow>
                          <span className="label-other">상대방</span>
                          <span className="value">
                            {openChatOpponentStudentNumber || "알 수 없음"}
                          </span>
                        </S.ShareSuccessInfoRow>
                      </S.ShareSuccessInfo>
                    </S.ShareSuccessCard>
                  );

                  return (
                    <React.Fragment key={msg.id}>
                      {showDateLine && (
                        <S.DateDivider>
                          {formatDateLine(msg.createdAt)}
                        </S.DateDivider>
                      )}
                      <S.ShareCardRowOther>{successCard}</S.ShareCardRowOther>
                    </React.Fragment>
                  );
                }

                if (isRejected) {
                  return (
                    <React.Fragment key={msg.id}>
                      {showDateLine && (
                        <S.DateDivider>
                          {formatDateLine(msg.createdAt)}
                        </S.DateDivider>
                      )}
                      <S.ShareCardRowOther>
                        <S.ShareRejectedCard>
                          <XCircle size={20} aria-hidden="true" />
                          학번 공개 요청 거절됨
                        </S.ShareRejectedCard>
                      </S.ShareCardRowOther>
                    </React.Fragment>
                  );
                }

                if (isCanceled) {
                  return (
                    <React.Fragment key={msg.id}>
                      {showDateLine && (
                        <S.DateDivider>
                          {formatDateLine(msg.createdAt)}
                        </S.DateDivider>
                      )}
                      <S.ShareCardRowOther>
                        <S.ShareRejectedCard>
                          <XCircle size={20} aria-hidden="true" />
                          학번 공개 요청 취소됨
                        </S.ShareRejectedCard>
                      </S.ShareCardRowOther>
                    </React.Fragment>
                  );
                }

                if (!isPending) {
                  return (
                    <React.Fragment key={msg.id}>
                      {showDateLine && (
                        <S.DateDivider>
                          {formatDateLine(msg.createdAt)}
                        </S.DateDivider>
                      )}
                      <S.ShareCardRowOther>
                        <S.ShareRejectedCard>
                          <XCircle size={20} aria-hidden="true" />
                          이전 학번 공개 요청
                        </S.ShareRejectedCard>
                      </S.ShareCardRowOther>
                    </React.Fragment>
                  );
                }

                return (
                  <React.Fragment key={msg.id}>
                    {showDateLine && (
                      <S.DateDivider>
                        {formatDateLine(msg.createdAt)}
                      </S.DateDivider>
                    )}
                    {isMe ? (
                      <S.ShareCardRowMy>
                        <S.ShareCardWrapper>
                          <S.ShareCardTextSection>
                            <S.ShareCardTitle>
                              {requestCardTitle}
                            </S.ShareCardTitle>
                            <S.ShareCardSubtitle>
                              {requestCardSubtitle}
                            </S.ShareCardSubtitle>
                          </S.ShareCardTextSection>
                          <S.ShareCardButtonGroup>
                            <S.ShareCardButton
                              $variant="secondary"
                              disabled={processingDisclosureId === requestId}
                              onClick={() => handleCancelShare(requestId)}
                            >
                              {processingDisclosureId === requestId
                                ? "처리 중"
                                : "취소"}
                            </S.ShareCardButton>
                          </S.ShareCardButtonGroup>
                        </S.ShareCardWrapper>
                      </S.ShareCardRowMy>
                    ) : (
                      <S.ShareCardRowOther>
                        <S.ShareCardWrapper>
                          <S.ShareCardTextSection>
                            <S.ShareCardTitle>
                              {requestCardTitle}
                            </S.ShareCardTitle>
                            <S.ShareCardSubtitle>
                              {requestCardSubtitle}
                            </S.ShareCardSubtitle>
                          </S.ShareCardTextSection>
                          <S.ShareCardButtonGroup>
                            <S.ShareCardButton
                              $variant="secondary"
                              disabled={processingDisclosureId === requestId}
                              onClick={() => handleDeclineShare(requestId)}
                            >
                              {processingDisclosureId === requestId
                                ? "처리 중"
                                : "거절"}
                            </S.ShareCardButton>
                            <S.ShareCardButton
                              $variant="primary"
                              disabled={processingDisclosureId === requestId}
                              onClick={() => handleAcceptShare(requestId)}
                            >
                              {processingDisclosureId === requestId
                                ? "처리 중"
                                : "수락"}
                            </S.ShareCardButton>
                          </S.ShareCardButtonGroup>
                        </S.ShareCardWrapper>
                      </S.ShareCardRowOther>
                    )}
                  </React.Fragment>
                );
              }

              const parsed =
                chatType === "roommate"
                  ? parseLegacyRoommateShareMessage(msg.content)
                  : { type: null, requestId: null };

              if (parsed.type) {
                const isMe = msg.sender === "me";

                if (parsed.type === "REQUEST") {
                  const isResolved = messageList.slice(index + 1).some((m) => {
                    const p = parseLegacyRoommateShareMessage(m.content);
                    return (
                      p.requestId === parsed.requestId &&
                      (p.type === "CANCEL" ||
                        p.type === "DECLINE" ||
                        p.type === "ACCEPT")
                    );
                  });
                  const isCurrentRequest =
                    roommateDisclosureStatus?.requestId === parsed.requestId;
                  const normalizedRoommateStatus = isCurrentRequest
                    ? normalizeDisclosureStatus(
                        roommateDisclosureStatus?.status,
                      )
                    : "";
                  const isAccepted =
                    isCurrentRequest &&
                    ACCEPTED_DISCLOSURE_STATUSES.has(normalizedRoommateStatus);
                  const isRejected =
                    isCurrentRequest &&
                    REJECTED_DISCLOSURE_STATUSES.has(normalizedRoommateStatus);
                  const isCanceled =
                    isCurrentRequest &&
                    CANCELED_DISCLOSURE_STATUSES.has(normalizedRoommateStatus);
                  const isPending = roommateDisclosureStatus
                    ? isCurrentRequest &&
                      isPendingDisclosureStatus(normalizedRoommateStatus)
                    : !isResolved;

                  if (isResolved) {
                    return null;
                  }

                  if (isAccepted) {
                    return (
                      <React.Fragment key={msg.id}>
                        {showDateLine && (
                          <S.DateDivider>
                            {formatDateLine(msg.createdAt)}
                          </S.DateDivider>
                        )}
                        <S.ShareCardRowOther>
                          <S.ShareSuccessCard>
                            <S.ShareSuccessTitle>
                              <CheckCircle2 size={20} color="#3B7CF6" />
                              학번 공유 완료
                            </S.ShareSuccessTitle>
                            <S.ShareSuccessInfo>
                              <S.ShareSuccessInfoRow>
                                <span className="label">나</span>
                                <span className="value">
                                  {userInfo.studentNumber || "알 수 없음"}
                                </span>
                              </S.ShareSuccessInfoRow>
                              <S.ShareSuccessInfoRow>
                                <span className="label-other">상대방</span>
                                <span className="value">
                                  {roommateDisclosureStatus?.targetStudentNumber ||
                                    opponentStudentNumber ||
                                    "알 수 없음"}
                                </span>
                              </S.ShareSuccessInfoRow>
                            </S.ShareSuccessInfo>
                          </S.ShareSuccessCard>
                        </S.ShareCardRowOther>
                      </React.Fragment>
                    );
                  }

                  if (isRejected) {
                    return (
                      <React.Fragment key={msg.id}>
                        {showDateLine && (
                          <S.DateDivider>
                            {formatDateLine(msg.createdAt)}
                          </S.DateDivider>
                        )}
                        <S.ShareCardRowOther>
                          <S.ShareRejectedCard>
                            <XCircle size={20} aria-hidden="true" />
                            학번 공개 요청 거절
                          </S.ShareRejectedCard>
                        </S.ShareCardRowOther>
                      </React.Fragment>
                    );
                  }

                  if (isCanceled || !isPending) {
                    return null;
                  }

                  if (isMe) {
                    return (
                      <React.Fragment key={msg.id}>
                        {showDateLine && (
                          <S.DateDivider>
                            {formatDateLine(msg.createdAt)}
                          </S.DateDivider>
                        )}
                        <S.ShareCardRowMy>
                          <S.ShareCardWrapper>
                            <S.ShareCardTextSection>
                              <S.ShareCardTitle>
                                학번 공유를 요청했어요
                              </S.ShareCardTitle>
                              <S.ShareCardSubtitle>
                                <p>수락하면 이 1:1 채팅방에서만</p>
                                <p>닉네임과 학번이 함께 표시됩니다.</p>
                              </S.ShareCardSubtitle>
                            </S.ShareCardTextSection>
                            <S.ShareCardButtonGroup>
                              <S.ShareCardButton
                                $variant="secondary"
                                disabled={
                                  processingDisclosureId === parsed.requestId
                                }
                                onClick={() =>
                                  handleCancelShare(parsed.requestId!)
                                }
                              >
                                {processingDisclosureId === parsed.requestId
                                  ? "처리 중"
                                  : "취소"}
                              </S.ShareCardButton>
                            </S.ShareCardButtonGroup>
                          </S.ShareCardWrapper>
                        </S.ShareCardRowMy>
                      </React.Fragment>
                    );
                  } else {
                    return (
                      <React.Fragment key={msg.id}>
                        {showDateLine && (
                          <S.DateDivider>
                            {formatDateLine(msg.createdAt)}
                          </S.DateDivider>
                        )}
                        <S.ShareCardRowOther>
                          <S.ShareCardWrapper>
                            <S.ShareCardTextSection>
                              <S.ShareCardTitle>
                                학번을 공유하시겠습니까?
                              </S.ShareCardTitle>
                              <S.ShareCardSubtitle>
                                <p>수락하면 이 1:1 채팅방에서만</p>
                                <p>닉네임과 학번이 함께 표시됩니다.</p>
                              </S.ShareCardSubtitle>
                            </S.ShareCardTextSection>
                            <S.ShareCardButtonGroup>
                              <S.ShareCardButton
                                $variant="secondary"
                                disabled={
                                  processingDisclosureId === parsed.requestId
                                }
                                onClick={() =>
                                  handleDeclineShare(parsed.requestId!)
                                }
                              >
                                {processingDisclosureId === parsed.requestId
                                  ? "처리 중"
                                  : "거절"}
                              </S.ShareCardButton>
                              <S.ShareCardButton
                                $variant="primary"
                                disabled={
                                  processingDisclosureId === parsed.requestId
                                }
                                onClick={() =>
                                  handleAcceptShare(parsed.requestId!)
                                }
                              >
                                {processingDisclosureId === parsed.requestId
                                  ? "처리 중"
                                  : "수락"}
                              </S.ShareCardButton>
                            </S.ShareCardButtonGroup>
                          </S.ShareCardWrapper>
                        </S.ShareCardRowOther>
                      </React.Fragment>
                    );
                  }
                }

                if (parsed.type === "ACCEPT") {
                  let myNum = "";
                  let partnerNum = "";
                  if (
                    parsed.acceptorStudentNumber &&
                    parsed.requesterStudentNumber
                  ) {
                    if (isMe) {
                      myNum = parsed.acceptorStudentNumber;
                      partnerNum = parsed.requesterStudentNumber;
                    } else {
                      myNum = parsed.requesterStudentNumber;
                      partnerNum = parsed.acceptorStudentNumber;
                    }
                  } else {
                    myNum = userInfo.studentNumber;
                    partnerNum = opponentStudentNumber;
                  }

                  const cardContent = (
                    <S.ShareSuccessCard>
                      <S.ShareSuccessTitle>
                        <CheckCircle2 size={20} color="#3B7CF6" />
                        학번 공유 완료
                      </S.ShareSuccessTitle>
                      <S.ShareSuccessInfo>
                        <S.ShareSuccessInfoRow>
                          <span className="label">나</span>
                          <span className="value">{myNum || "알 수 없음"}</span>
                        </S.ShareSuccessInfoRow>
                        <S.ShareSuccessInfoRow>
                          <span className="label-other">상대방</span>
                          <span className="value">
                            {partnerNum || "알 수 없음"}
                          </span>
                        </S.ShareSuccessInfoRow>
                      </S.ShareSuccessInfo>
                    </S.ShareSuccessCard>
                  );

                  return (
                    <React.Fragment key={msg.id}>
                      {showDateLine && (
                        <S.DateDivider>
                          {formatDateLine(msg.createdAt)}
                        </S.DateDivider>
                      )}
                      <S.ShareCardRowOther>{cardContent}</S.ShareCardRowOther>
                    </React.Fragment>
                  );
                }

                if (parsed.type === "DECLINE") {
                  return (
                    <React.Fragment key={msg.id}>
                      {showDateLine && (
                        <S.DateDivider>
                          {formatDateLine(msg.createdAt)}
                        </S.DateDivider>
                      )}
                      <S.ShareCardRowOther>
                        <S.ShareRejectedCard>
                          <XCircle size={20} aria-hidden="true" />
                          학번 공개 요청 거절
                        </S.ShareRejectedCard>
                      </S.ShareCardRowOther>
                    </React.Fragment>
                  );
                }

                if (parsed.type === "CANCEL") {
                  return null;
                }
              }

              const nextMessage = messageList[index + 1];
              const previousMessage = messageList[index - 1];
              const showMessageTime =
                !nextMessage ||
                !isRegularBubbleMessage(nextMessage) ||
                !isSameMessageSender(msg, nextMessage) ||
                !isSameMinute(msg.createdAt, nextMessage.createdAt);
              const showSenderInfo =
                !previousMessage ||
                !isRegularBubbleMessage(previousMessage) ||
                !isSameMessageSender(previousMessage, msg) ||
                !isSameMinute(previousMessage.createdAt, msg.createdAt);

              return (
                <React.Fragment key={msg.id}>
                  {showDateLine && (
                    <S.DateDivider>
                      {formatDateLine(msg.createdAt)}
                    </S.DateDivider>
                  )}
                  {msg.sender === "me" ? (
                    <ChatItemMy
                      content={msg.content}
                      time={msg.time}
                      showTime={showMessageTime}
                      imageUrls={msg.imageUrls}
                      isBotQuestion={msg.isBotQuestion}
                      unreadCount={
                        chatType === "open" || chatType === "personal"
                          ? msg.unreadCount
                          : chatType === "roommate" && msg.isRead === false
                            ? 1
                            : undefined
                      }
                      onImageClick={(url) => setSelectedImageUrl(url)}
                    />
                  ) : (
                    <ChatItemOtherPerson
                      content={msg.content}
                      time={msg.time}
                      showTime={showMessageTime}
                      showSenderInfo={showSenderInfo}
                      userImageUrl={msg.userImageUrl}
                      senderName={
                        chatType === "open" || chatType === "personal"
                          ? msg.nickname || "익명 01"
                          : msg.nickname || partnerName || "상대방"
                      }
                      imageUrls={msg.imageUrls}
                      isBotQuestion={msg.isBotQuestion}
                      unreadCount={
                        chatType === "open" || chatType === "personal"
                          ? msg.unreadCount
                          : undefined
                      }
                      onMessageClick={() => openMessageActions(msg)}
                      onImageClick={(url) => setSelectedImageUrl(url)}
                      onAvatarClick={() => handleAvatarClick(msg)}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </>
        )}
      </S.ChattingWrapper>

      {/* 하단 플로팅 입력 바 */}
      <S.FloatingInputArea ref={menuContainerRef}>
        <div style={{ position: "relative", display: "inline-flex" }}>
          {chatType === "roommate" &&
            !isChatBlocked &&
            showStudentIdTooltip && (
              <TooltipMessage
                message={"상대방에게\n학번 공유를 요청해보세요!"}
                onClose={handleCloseStudentIdTooltip}
                position={"top"}
                align={"left"}
                width={"max-content"}
              />
            )}
          <S.PlusButton
            type="button"
            disabled={isChatBlocked}
            aria-label={
              isChatBlocked
                ? blockedChatMessage
                : "채팅 추가 기능"
            }
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <Plus size={24} />
          </S.PlusButton>
        </div>

        {menuOpen && (
          <S.FloatingMenu>
            <S.FloatingMenuItem
              onClick={() => {
                setMenuOpen(false);
                handleSelectCommand("챗불이");
              }}
            >
              <S.FloatingMenuIcon src={ChatBuliLogo} alt="" />
              챗불이에게 질문
            </S.FloatingMenuItem>
            <S.FloatingMenuItem
              onClick={() => {
                setMenuOpen(false);
                if (chatType === "roommate") {
                  alert("사진 첨부는 현재 오픈채팅에서 사용할 수 있어요.");
                  return;
                }
                setPhotoSheetOpen(true);
              }}
            >
              사진 첨부
            </S.FloatingMenuItem>
            {chatType === "open" ? (
              <S.FloatingMenuItem
                onClick={() => {
                  setMenuOpen(false);
                  navigate(`/chat/open/create?originRoomId=${roomId}`);
                }}
              >
                단체 톡방 만들기
              </S.FloatingMenuItem>
            ) : chatType === "roommate" || chatType === "personal" ? (
              <S.FloatingMenuItem onClick={handleRequestShareClick}>
                학번 공유하기
              </S.FloatingMenuItem>
            ) : null}
          </S.FloatingMenu>
        )}

        {isSlashMenuOpen && !isChatBuliActive && (
          <S.SlashMenuContainer ref={slashMenuContainerRef}>
            <S.SlashMenuHeader>기능 선택</S.SlashMenuHeader>
            <S.SlashMenuItem
              type="button"
              onClick={() => handleSelectCommand("챗불이")}
            >
              <S.SlashIconWrapper>
                <img src={ChatBuliLogo} alt="챗불이" />
              </S.SlashIconWrapper>
              <S.SlashMeta>
                <S.SlashName>/챗불이</S.SlashName>
                <S.SlashDescription>
                  기숙사 생활에 대해 챗불이에게 질문하기
                </S.SlashDescription>
              </S.SlashMeta>
            </S.SlashMenuItem>
          </S.SlashMenuContainer>
        )}

        <S.InputWrapper>
          {isChatBuliActive && (
            <S.InputBadge>
              <img src={ChatBuliLogo} alt="" />
              <span>/챗불이</span>
              <button
                type="button"
                onClick={() => {
                  setIsChatBuliActive(false);
                  inputRef.current?.focus();
                }}
                aria-label="기능 취소"
              >
                <X size={12} />
              </button>
            </S.InputBadge>
          )}

          <S.FloatingInput
            $hasBadge={isChatBuliActive}
            placeholder={
              isChatBlocked
                ? blockedChatMessage
                : isChatBuliActive
                  ? "질문할 내용을 입력하세요"
                  : "메시지 보내기 (/ 입력 시 기능 선택)"
            }
            disabled={isChatBlocked}
            ref={inputRef}
            onInput={handleInput}
            rows={1}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
          />
        </S.InputWrapper>
        <S.SendCircleButton
          type="button"
          disabled={isChatBlocked}
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleSendMessage}
        >
          <ArrowRight size={20} color="white" />
        </S.SendCircleButton>
      </S.FloatingInputArea>

      <PhotoAttachmentBottomSheet
        open={photoSheetOpen}
        onOpenChange={setPhotoSheetOpen}
        onSend={handleSendImages}
      />

      <ChatMessageActionSheet
        open={messageSheetOpen}
        onOpenChange={setMessageSheetOpen}
        senderName={selectedMessage?.nickname || "익명"}
        content={selectedMessage?.content || "사진"}
        canKick={isOpenChatHost}
        onReport={handleReportMessage}
        onKick={handleKickSender}
      />

      <ChatMemberActionSheet
        open={memberActionSheetOpen}
        onOpenChange={setMemberActionSheetOpen}
        selectedUser={selectedMember}
        chatType={chatType || "open"}
        isHost={isOpenChatHost}
        isBlocked={isBlockedPartner}
        onBlockUser={handleBlockUserFromSheet}
        onCreatePersonalChat={handleCreatePersonalChatFromSheet}
        onTransferHost={handleTransferHostFromSheet}
        onKickUser={handleKickUserFromSheet}
        onRequestStudentIdDisclosure={handleRequestShareClick}
      />

      <ImageViewerModal
        imageUrl={selectedImageUrl}
        onClose={() => setSelectedImageUrl(null)}
      />
    </S.ChatPageWrapper>
  );
}
