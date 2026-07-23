import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import React from "react";
import ChatInfo from "../../components/chat/ChatInfo.tsx";
import ChatItemOtherPerson from "../../components/chat/ChatItemOtherPerson.tsx";
import ChatItemMy from "../../components/chat/ChatItemMy.tsx";
import { useRoommateChat } from "./useRoommateChat.ts";
import { useOpenChat } from "./useOpenChat";
import useUserStore from "../../stores/useUserStore.ts";
import { getRoommateChatHistory, getRoommateChatRooms } from "@/apis/chat";
import { patchNotificationsRead } from "@/apis/notification";
import { getOpenChatMessages } from "@/apis/openchat";
import {
  getOpenChatParticipants,
  kickOpenChatParticipant,
  sendOpenChatImages,
} from "@/apis/openchat";
import { createReport } from "@/apis/report";
import { OpenChatKickReason, OpenChatMessage } from "@/types/openchat";
import PhotoAttachmentBottomSheet from "@/components/chat/PhotoAttachmentBottomSheet";
import ChatMessageActionSheet from "@/components/chat/ChatMessageActionSheet";
import ImageViewerModal from "@/components/chat/ImageViewerModal";
import { useSetHeader } from "@/hooks/useSetHeader";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  Plus,
  ChevronDown,
  Info,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import * as S from "./ChattingPage.styles";
import {
  getStudentIdDisclosureStatus,
  requestStudentIdDisclosure,
  cancelStudentIdDisclosure,
  rejectStudentIdDisclosure,
  acceptStudentIdDisclosure,
} from "@/apis/studentIdDisclosure";

type MessageType = {
  id: number;
  sender: "me" | "other";
  content: string;
  time: string; // 화면 표시용 시간 (예: 오후 2:30)
  createdAt: string; // 날짜 비교용 원본 날짜 문자열 (ISO 등)
  userImageUrl?: string | null; // 프로필 이미지 URL NULL 구분
  nickname?: string;
  isSystem?: boolean; // 시스템 메시지 플래그 추가
  senderId?: number | null;
  type?: OpenChatMessage["type"];
  imageUrls?: string[];
};

interface ShareMessageInfo {
  type: "REQUEST" | "CANCEL" | "DECLINE" | "ACCEPT" | null;
  requestId: number | null;
  requesterStudentNumber?: string;
  acceptorStudentNumber?: string;
}

// 이 함수를 통해 백엔드에서 보내주는 웹소켓 메시지 형식이 달라지더라도 여기만 수정하면 작동되도록 합니다.
const parseShareMessage = (content: string): ShareMessageInfo => {
  if (!content || typeof content !== "string") {
    return { type: null, requestId: null };
  }

  if (content.startsWith("[STUDENT_ID_SHARE_REQUEST:")) {
    const parts = content
      .replace("[STUDENT_ID_SHARE_REQUEST:", "")
      .replace("]", "")
      .split(":");
    const requestId = Number(parts[0]);
    const requesterStudentNumber = parts[1] || undefined;
    return { type: "REQUEST", requestId, requesterStudentNumber };
  }

  if (content.startsWith("[STUDENT_ID_SHARE_CANCEL:")) {
    const parts = content
      .replace("[STUDENT_ID_SHARE_CANCEL:", "")
      .replace("]", "")
      .split(":");
    const requestId = Number(parts[0]);
    return { type: "CANCEL", requestId };
  }

  if (content.startsWith("[STUDENT_ID_SHARE_DECLINE:")) {
    const parts = content
      .replace("[STUDENT_ID_SHARE_DECLINE:", "")
      .replace("]", "")
      .split(":");
    const requestId = Number(parts[0]);
    return { type: "DECLINE", requestId };
  }

  if (content.startsWith("[STUDENT_ID_SHARE_ACCEPT:")) {
    const parts = content
      .replace("[STUDENT_ID_SHARE_ACCEPT:", "")
      .replace("]", "")
      .split(":");
    const requestId = Number(parts[0]);
    const acceptorStudentNumber = parts[1] || undefined;
    const requesterStudentNumber = parts[2] || undefined;
    return {
      type: "ACCEPT",
      requestId,
      acceptorStudentNumber,
      requesterStudentNumber,
    };
  }

  return { type: null, requestId: null };
};

export default function ChattingPage() {
  const isLeavingRef = useRef(false);
  const { chatType, id } = useParams();
  const [typeString, setTypeString] = useState<string>("");
  const [messageList, setMessageList] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const { tokenInfo, userInfo } = useUserStore();
  const navigate = useNavigate();

  // 학번 공유 관련 상태 및 Ref
  const opponentIdRef = useRef<number | null>(null);
  const [opponentStudentNumber, setOpponentStudentNumber] =
    useState<string>("");

  const location = useLocation();
  const partnerName = location.state?.partnerName ?? undefined;
  const partnerProfileImageUrl =
    location.state?.partnerProfileImageUrl ?? undefined;

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);

  const roomId = Number(id);
  const userId = userInfo.id;
  const token = tokenInfo.accessToken;

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
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
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

  // 내부 스크롤 이동
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 50);
    return () => clearTimeout(timer);
  }, [messageList]);

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

  const handleCancelShare = async (requestId: number) => {
    try {
      await cancelStudentIdDisclosure(requestId);
      appendCustomMessageLocal(`[STUDENT_ID_SHARE_CANCEL:${requestId}]`);
    } catch (error) {
      console.error("학번 공유 취소 실패:", error);
      alert("학번 공유 취소에 실패했습니다.");
    }
  };

  const handleDeclineShare = async (requestId: number) => {
    try {
      await rejectStudentIdDisclosure(requestId);
      appendCustomMessageLocal(`[STUDENT_ID_SHARE_DECLINE:${requestId}]`);
    } catch (error) {
      console.error("학번 공유 거절 실패:", error);
      alert("학번 공유 거절에 실패했습니다.");
    }
  };

  const handleAcceptShare = async (requestId: number) => {
    try {
      const res = await acceptStudentIdDisclosure(requestId);
      const { requesterStudentNumber } = res.data;
      setOpponentStudentNumber(requesterStudentNumber);
      appendCustomMessageLocal(
        `[STUDENT_ID_SHARE_ACCEPT:${requestId}:${userInfo.studentNumber}:${requesterStudentNumber}]`,
      );
    } catch (error) {
      console.error("학번 공유 수락 실패:", error);
      alert("학번 공유 수락에 실패했습니다.");
    }
  };

  const {
    connect: connectRoommate,
    disconnect: disconnectRoommate,
    sendMessage: sendRoommateMessage,
    isConnected: isRoommateConnected,
  } = useRoommateChat({
    roomId,
    userId,
    token,
    onMessage: (msg) => {
      const now = new Date();

      // 학번 공유 관련 특수 메시지 실시간 감지
      const parsed = parseShareMessage(msg.content);
      if (parsed.type) {
        if (parsed.type === "ACCEPT") {
          // 수락 메시지 수신 시 상대방 학번 정보 조회
          const oppId = opponentIdRef.current;
          if (oppId) {
            getStudentIdDisclosureStatus(roomId, oppId)
              .then((res) => {
                if (res.data.targetStudentNumber) {
                  setOpponentStudentNumber(res.data.targetStudentNumber);
                }
              })
              .catch((err) => console.error("학번 조회 실패:", err));
          }
        }
      }

      setMessageList((prev) => {
        // 이미 렌더링된 학번 공유 관련 동일 내용 메시지가 있다면 무시
        if (
          msg.content.startsWith("[STUDENT_ID_SHARE_") &&
          prev.some((m) => m.content === msg.content)
        ) {
          return prev;
        }
        return [
          ...prev,
          {
            id: Date.now(),
            sender: "other",
            content: msg.content,
            time: now.toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            createdAt: now.toISOString(), // 수신 시점 날짜 저장
          },
        ];
      });
    },
    onConnect: () => {
      console.log("✅ WebSocket 연결됨");
    },
    onDisconnect: () => {
      console.log("🛑 WebSocket 연결 해제됨");
      if (!isLeavingRef.current) {
        window.location.reload();
      }
    },
  });

  const {
    connect: connectOpen,
    disconnect: disconnectOpen,
    sendMessage: sendOpenMessage,
    isConnected: isOpenConnected,
  } = useOpenChat({
    roomId,
    userId,
    token,
    onMessage: (msg) => {
      const now = new Date();
      setMessageList((prev) => [
        ...prev,
        {
          id: msg.messageId || Date.now(),
          sender: msg.senderId === userId ? "me" : "other",
          content: msg.content,
          nickname: msg.senderNickname || undefined,
          userImageUrl: null,
          isSystem: msg.type === "SYSTEM",
          senderId: msg.senderId,
          type: msg.type,
          imageUrls: msg.imageUrls ?? [],
          time: now.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          createdAt: now.toISOString(),
        },
      ]);
    },
    onConnect: () => {
      console.log("✅ Open WebSocket 연결됨");
    },
    onDisconnect: () => {
      console.log("🛑 Open WebSocket 연결 해제됨");
      if (!isLeavingRef.current) {
        window.location.reload();
      }
    },
  });

  useEffect(() => {
    const init = async () => {
      if (chatType === "roommate") {
        setTypeString("룸메이트");
        setIsHistoryLoading(true);
        try {
          // 1. 상대방 ID 조회
          let oppId: number | null = null;
          try {
            const roomsResponse = await getRoommateChatRooms();
            const currentRoom = roomsResponse.data.find(
              (r) => r.chatRoomId === roomId,
            );
            if (currentRoom) {
              oppId = currentRoom.partnerId;
              opponentIdRef.current = oppId;
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
              const { targetStudentNumber } = statusResponse.data;
              if (targetStudentNumber) {
                setOpponentStudentNumber(targetStudentNumber);
              }
            } catch (e) {
              console.error("학번 공유 상태 조회 실패:", e);
            }
          }

          const response = await getRoommateChatHistory(roomId);
          const chats = response.data;
          // 기존 API 데이터
          const formattedMessages: MessageType[] = chats.map((chat) => ({
            id: chat.roommateChatId,
            sender: chat.userId === userId ? "me" : "other",
            content: chat.content,
            userImageUrl: chat.userImageUrl, // 프로필 이미지 URL 추가
            time: new Date(chat.createdDate).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            createdAt: chat.createdDate, // API에서 받은 날짜 저장
          }));

          setMessageList(formattedMessages);
        } catch (error) {
          console.error("채팅 내역 불러오기 실패:", error);
        } finally {
          setIsHistoryLoading(false);
        }
        connectRoommate();
      } else if (chatType === "open" || chatType === "personal") {
        setTypeString(chatType === "open" ? "오픈채팅" : "1대1 채팅");
        setIsHistoryLoading(true);
        try {
          const [response, participantsResponse] = await Promise.all([
            getOpenChatMessages(roomId),
            getOpenChatParticipants(roomId),
          ]);
          setIsOpenChatHost(
            participantsResponse.data.participants.some(
              (participant) =>
                participant.userId === userId && participant.isHost,
            ),
          );
          const chats = response.data.messages;
          const formattedMessages: MessageType[] = chats.map((chat) => ({
            id: chat.messageId,
            sender: chat.senderId === userId ? "me" : "other",
            content: chat.content,
            nickname: chat.senderNickname || undefined,
            userImageUrl: null,
            isSystem: chat.type === "SYSTEM",
            senderId: chat.senderId,
            type: chat.type,
            imageUrls: chat.imageUrls ?? [],
            time: new Date(chat.createdAt).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            createdAt: chat.createdAt,
          }));
          setMessageList(formattedMessages);
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
      if (isRoommateConnected) disconnectRoommate();
      if (isOpenConnected) disconnectOpen();
    };
  }, [chatType]);

  const handleInput = () => {
    const el = inputRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    if (inputValue.trim().startsWith("[STUDENT_ID_SHARE_")) {
      alert("올바르지 않은 메시지 형식입니다.");
      return;
    }

    if (chatType === "roommate" && !isRoommateConnected) {
      alert("채팅 연결을 확인해주세요.");
      return;
    }
    if ((chatType === "open" || chatType === "personal") && !isOpenConnected) {
      alert("채팅 연결을 확인해주세요.");
      return;
    }

    const nowObj = new Date();
    const nowTime = nowObj.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const newMessage: MessageType = {
      id: Date.now(),
      sender: "me",
      content: inputValue.trim(),
      time: nowTime,
      createdAt: nowObj.toISOString(), // 전송 시점 날짜 저장
    };

    setMessageList((prev) => [...prev, newMessage]);
    if (chatType === "roommate") {
      sendRoommateMessage(inputValue.trim());
    } else if (chatType === "open" || chatType === "personal") {
      sendOpenMessage(inputValue.trim());
    }
    setInputValue("");
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  const toMessageType = (message: OpenChatMessage): MessageType => ({
    id: message.messageId,
    sender: message.senderId === userId ? "me" : "other",
    senderId: message.senderId,
    content: message.content,
    nickname: message.senderNickname ?? undefined,
    isSystem: message.type === "SYSTEM",
    type: message.type,
    imageUrls: message.imageUrls ?? [],
    time: new Date(message.createdAt).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    createdAt: message.createdAt,
  });

  const handleSendImages = async (files: File[]) => {
    try {
      const response = await sendOpenChatImages(roomId, files);
      setMessageList((current) => [
        ...current,
        ...response.data.map(toMessageType),
      ]);
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

  const handleReportMessage = async (reason: string) => {
    if (!selectedMessage) return;
    await createReport({
      category: reason,
      title: "오픈채팅 메시지 신고",
      content: `[roomId:${roomId}][messageId:${selectedMessage.id}] ${selectedMessage.content || "사진 메시지"}`,
    });
    alert("신고가 접수되었습니다.");
  };

  const handleKickSender = async (reason: OpenChatKickReason) => {
    if (!selectedMessage?.senderId) return;
    await kickOpenChatParticipant(roomId, selectedMessage.senderId, reason);
    alert("참여자를 퇴장시켰습니다.");
  };

  const headerTitle =
    partnerName ||
    (chatType === "roommate"
      ? "룸메이트 채팅"
      : chatType === "open"
        ? "오픈채팅방"
        : "1대1 채팅");

  useSetHeader({
    title: headerTitle,
    hamburgerOnClick: () => {
      navigate(`/chat/${chatType}/${roomId}/members`, {
        state: { partnerName, partnerProfileImageUrl, roomId },
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

  const handleRequestShareClick = async () => {
    setMenuOpen(false);
    if (!opponentIdRef.current) {
      alert("상대방 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    if (!window.confirm("학번 공유를 요청할까요?")) return;

    try {
      const res = await requestStudentIdDisclosure(
        roomId,
        opponentIdRef.current,
      );
      const { requestId } = res.data;
      appendCustomMessageLocal(
        `[STUDENT_ID_SHARE_REQUEST:${requestId}:${userInfo.studentNumber}]`,
      );
    } catch (error) {
      console.error("학번 공유 요청 실패:", error);
      alert(
        "학번 공유 요청에 실패했습니다. 이미 요청을 보냈거나 처리 중일 수 있습니다.",
      );
    }
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
            partnerProfileImageUrl={partnerProfileImageUrl}
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
                1긱 생활 이슈, 공동구매, 배달 메이트를 자유롭게 대화
              </S.NoticeParagraph>
              <S.NoticeParagraph>
                예시: 같이 배달 시키기 / 생필품 공동구매 / 분실물 문의
              </S.NoticeParagraph>
              <S.NoticeParagraph style={{ color: "#8b8b8b" }}>
                확인후 공지를 접고 일반 대화만 볼 수 있음
              </S.NoticeParagraph>
            </S.NoticeBody>
          </S.NoticeContainer>
        )}
      </S.FixedHeaderContainer>

      {/* 내부 스크롤 채팅 영역 (Flex Item, grow) */}
      <S.ChattingWrapper ref={scrollRef} $chatType={chatType}>
        {isHistoryLoading ? (
          <LoadingSpinner message="채팅 내역을 가져오고 있습니다..." />
        ) : (
          <>
            {messageList.map((msg, index) => {
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

              if (msg.isSystem) {
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

              const parsed = parseShareMessage(msg.content);

              if (parsed.type) {
                const isMe = msg.sender === "me";

                if (parsed.type === "REQUEST") {
                  const isResolved = messageList.slice(index + 1).some((m) => {
                    const p = parseShareMessage(m.content);
                    return (
                      p.requestId === parsed.requestId &&
                      (p.type === "CANCEL" ||
                        p.type === "DECLINE" ||
                        p.type === "ACCEPT")
                    );
                  });

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
                                학번 공유를 요청했어요!
                              </S.ShareCardTitle>
                              <S.ShareCardSubtitle>
                                <p>수락하면 이 1:1 채팅방에서만</p>
                                <p>서로의 학번이 공유돼요.</p>
                              </S.ShareCardSubtitle>
                            </S.ShareCardTextSection>
                            {!isResolved && (
                              <S.ShareCardButtonGroup>
                                <S.ShareCardButton
                                  $variant="secondary"
                                  onClick={() =>
                                    handleCancelShare(parsed.requestId!)
                                  }
                                >
                                  취소
                                </S.ShareCardButton>
                              </S.ShareCardButtonGroup>
                            )}
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
                                학번을 공유할까요?
                              </S.ShareCardTitle>
                              <S.ShareCardSubtitle>
                                <p>수락하면 이 1:1 채팅방에서만</p>
                                <p>서로의 학번이 공개돼요.</p>
                              </S.ShareCardSubtitle>
                            </S.ShareCardTextSection>
                            {!isResolved && (
                              <S.ShareCardButtonGroup>
                                <S.ShareCardButton
                                  $variant="secondary"
                                  onClick={() =>
                                    handleDeclineShare(parsed.requestId!)
                                  }
                                >
                                  거절
                                </S.ShareCardButton>
                                <S.ShareCardButton
                                  $variant="primary"
                                  onClick={() =>
                                    handleAcceptShare(parsed.requestId!)
                                  }
                                >
                                  수락
                                </S.ShareCardButton>
                              </S.ShareCardButtonGroup>
                            )}
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
                        <CheckCircle2 size={20} color="#3D3D3D" />
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
                      {isMe ? (
                        <S.ShareCardRowMy>{cardContent}</S.ShareCardRowMy>
                      ) : (
                        <S.ShareCardRowOther>{cardContent}</S.ShareCardRowOther>
                      )}
                    </React.Fragment>
                  );
                }

                if (parsed.type === "CANCEL" || parsed.type === "DECLINE") {
                  return null;
                }
              }

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
                      imageUrls={msg.imageUrls}
                      onImageClick={(url) => setSelectedImageUrl(url)}
                    />
                  ) : (
                    <ChatItemOtherPerson
                      content={msg.content}
                      time={msg.time}
                      userImageUrl={msg.userImageUrl}
                      senderName={
                        chatType === "open" || chatType === "personal"
                          ? msg.nickname || "익명 01"
                          : undefined
                      }
                      imageUrls={msg.imageUrls}
                      onMessageClick={() => openMessageActions(msg)}
                      onImageClick={(url) => setSelectedImageUrl(url)}
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
        <S.PlusButton onClick={() => setMenuOpen((prev) => !prev)}>
          <Plus size={24} />
        </S.PlusButton>

        {menuOpen && (
          <S.FloatingMenu>
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
              <S.FloatingMenuItem onClick={() => setMenuOpen(false)}>
                단체 톡방 만들기
              </S.FloatingMenuItem>
            ) : chatType === "roommate" ? (
              <S.FloatingMenuItem onClick={handleRequestShareClick}>
                학번 공유하기
              </S.FloatingMenuItem>
            ) : null}
          </S.FloatingMenu>
        )}

        <S.FloatingInput
          placeholder="메시지 보내기"
          ref={inputRef}
          onInput={handleInput}
          rows={1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <S.SendCircleButton onClick={handleSendMessage}>
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

      <ImageViewerModal
        imageUrl={selectedImageUrl}
        onClose={() => setSelectedImageUrl(null)}
      />
    </S.ChatPageWrapper>
  );
}
