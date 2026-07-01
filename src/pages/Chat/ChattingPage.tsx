import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import React from "react";
import ChatInfo from "../../components/chat/ChatInfo.tsx";
import ChatItemOtherPerson from "../../components/chat/ChatItemOtherPerson.tsx";
import ChatItemMy from "../../components/chat/ChatItemMy.tsx";
import { useRoommateChat } from "./useRoommateChat.ts";
import useUserStore from "../../stores/useUserStore.ts";
import { getRoommateChatHistory } from "@/apis/chat";
import { useSetHeader } from "@/hooks/useSetHeader";
import { deleteRoommateChatRoom } from "@/apis/roommate";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Plus, ChevronDown, Info, ArrowRight } from "lucide-react";
import * as S from "./ChattingPage.styles";

type MessageType = {
  id: number;
  sender: "me" | "other";
  content: string;
  time: string; // 화면 표시용 시간 (예: 오후 2:30)
  createdAt: string; // 날짜 비교용 원본 날짜 문자열 (ISO 등)
  userImageUrl?: string | null; // 프로필 이미지 URL NULL 구분
  nickname?: string;
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

  const location = useLocation();
  const partnerName = location.state?.partnerName ?? undefined;
  const partnerProfileImageUrl =
    location.state?.partnerProfileImageUrl ?? undefined;

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const roomId = Number(id);
  const userId = userInfo.id;
  const token = tokenInfo.accessToken;

  // 오픈채팅방 공지 확장 여부
  const [isNoticeExpanded, setIsNoticeExpanded] = useState(true);
  // 플로팅 입력바의 + 버튼 메뉴 열림 여부
  const [menuOpen, setMenuOpen] = useState(false);
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

  const { connect, disconnect, sendMessage, isConnected } = useRoommateChat({
    roomId,
    userId,
    token,
    onMessage: (msg) => {
      const now = new Date();
      setMessageList((prev) => [
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
      ]);
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

  useEffect(() => {
    const init = async () => {
      if (chatType === "roommate") {
        setTypeString("룸메이트");
        setIsHistoryLoading(true);
        try {
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
        connect();
      } else if (chatType === "open") {
        setTypeString("오픈채팅");
        setMessageList([
          {
            id: 1,
            sender: "other",
            nickname: "방장횃불이",
            content: "오픈채팅방에 오신 것을 환영합니다! 오늘 배달 같이 시키실 분 계신가요?",
            time: "오전 11:30",
            createdAt: "2026-07-01T11:30:00Z",
            userImageUrl: null
          },
          {
            id: 2,
            sender: "me",
            content: "안녕하세요! 혹시 치킨 같이 시킬 수 있을까요?",
            time: "오전 11:31",
            createdAt: "2026-07-01T11:31:00Z"
          },
          {
            id: 3,
            sender: "other",
            nickname: "동네UNI",
            content: "오 좋네요. 저도 치킨 같이 시켜요! 무슨 브랜드 좋아하시나요?",
            time: "오전 11:35",
            createdAt: "2026-07-01T11:35:00Z",
            userImageUrl: null
          }
        ]);
      } else {
        setTypeString("개인대화");
        setMessageList([
          {
            id: 1,
            sender: "other",
            content: "안녕하세요! 아까 오픈채팅방에서 얘기 나누던 사람입니다. 기숙사 신관 3동이 맞으시죠?",
            time: "오후 1:15",
            createdAt: "2026-07-01T13:15:00Z",
            userImageUrl: null
          },
          {
            id: 2,
            sender: "me",
            content: "안녕하세요! 네 맞아요. 신관 3동 402호에 살고 있어요.",
            time: "오후 1:17",
            createdAt: "2026-07-01T13:17:00Z"
          }
        ]);
      }
    };
    init();
    return () => {
      isLeavingRef.current = true;
      if (isConnected) disconnect();
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

    if (chatType === "roommate" && !isConnected) {
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
      sendMessage(inputValue.trim());
    }
    setInputValue("");
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  const menuItems = [
    {
      label: "사전 체크리스트 보기",
      onClick: async () => {
        navigate("/roommate/list/opponent", { state: { partnerName, roomId } });
      },
    },
    {
      label: "채팅방 나가기",
      onClick: async () => {
        const confirmed = window.confirm(
          "정말 채팅방을 나갈까요?\n서로에게 더 이상 채팅방이 보이지 않습니다.",
        );
        if (!confirmed) return;
        try {
          if (roomId === undefined)
            throw new Error("채팅방 id가 undefined입니다.");
          const response = await deleteRoommateChatRoom(roomId);
          if (response.status === 201) {
            alert("채팅방에서 나왔어요.");
            navigate("/chat");
          }
        } catch (error: unknown) {
          alert("채팅방 나가기를 실패했어요." + String(error));
        }
      },
    },
  ];

  const headerTitle =
    partnerName ||
    (chatType === "roommate"
      ? "룸메이트 채팅"
      : chatType === "open"
        ? "오픈채팅방"
        : "1대1 채팅");

  useSetHeader({
    title: headerTitle,
    menuItems: chatType === "roommate" ? menuItems : null,
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
          <S.NoticeContainer>
            <S.NoticeHeader onClick={() => setIsNoticeExpanded((prev) => !prev)}>
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

            {isNoticeExpanded && (
              <S.NoticeBody>
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
            )}
          </S.NoticeContainer>
        )}
      </S.FixedHeaderContainer>

      {/* 내부 스크롤 채팅 영역 (Flex Item, grow) */}
      <S.ChattingWrapper ref={scrollRef}>
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

              return (
                <React.Fragment key={msg.id}>
                  {showDateLine && (
                    <S.DateDivider>{formatDateLine(msg.createdAt)}</S.DateDivider>
                  )}
                  {msg.sender === "me" ? (
                    <ChatItemMy content={msg.content} time={msg.time} />
                  ) : (
                    <ChatItemOtherPerson
                      content={msg.content}
                      time={msg.time}
                      userImageUrl={msg.userImageUrl}
                      senderName={chatType === "open" ? (msg.nickname || "익명 01") : undefined}
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
            <S.FloatingMenuItem onClick={() => setMenuOpen(false)}>
              사진 첨부
            </S.FloatingMenuItem>
            {chatType === "open" ? (
              <S.FloatingMenuItem onClick={() => setMenuOpen(false)}>
                단체 톡방 만들기
              </S.FloatingMenuItem>
            ) : (
              <S.FloatingMenuItem onClick={() => setMenuOpen(false)}>
                학번 공유하기
              </S.FloatingMenuItem>
            )}
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
    </S.ChatPageWrapper>
  );
}
