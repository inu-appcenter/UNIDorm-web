import styled from "styled-components";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import React from "react";
import ChatInfo from "../../components/chat/ChatInfo.tsx";
import ChatItemOtherPerson from "../../components/chat/ChatItemOtherPerson.tsx";
import ChatItemMy from "../../components/chat/ChatItemMy.tsx";
import send from "../../assets/chat/send.svg";
import { useRoommateChat } from "./useRoommateChat.ts";
import useUserStore from "../../stores/useUserStore.ts";
import { getRoommateChatHistory } from "@/apis/chat";
import { useSetHeader } from "@/hooks/useSetHeader";
import { deleteRoommateChatRoom } from "@/apis/roommate";

type MessageType = {
  id: number;
  sender: "me" | "other";
  content: string;
  time: string; // 화면 표시용 시간 (예: 오후 2:30)
  createdAt: string; // 날짜 비교용 원본 날짜 문자열 (ISO 등)
};

export default function ChattingPage() {
  const isLeavingRef = useRef(false);
  const { chatType, id } = useParams();
  const [typeString, setTypeString] = useState<string>("");
  const [messageList, setMessageList] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
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
        try {
          const response = await getRoommateChatHistory(roomId);
          const chats = response.data;
          const formattedMessages: MessageType[] = chats.map((chat) => ({
            id: chat.roommateChatId,
            sender: chat.userId === userId ? "me" : "other",
            content: chat.content,
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
        }
        connect();
      } else if (chatType === "groupPurchase") {
        setTypeString("공동구매");
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
    if (!inputValue.trim() || !isConnected) {
      if (!isConnected) alert("채팅 연결을 확인해주세요.");
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
    sendMessage(inputValue.trim());
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
        } catch (error: any) {
          alert("채팅방 나가기를 실패했어요." + error);
        }
      },
    },
  ];

  useSetHeader({ title: "룸메이트 채팅", menuItems });

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
    <ChatPageWrapper>
      {/* 상단 고정 영역 (Flex Item) */}
      <FixedHeaderContainer>
        <ChatInfo
          selectedTab={typeString}
          partnerName={partnerName}
          roomId={roomId}
          isChatted={messageList.length > 0}
          partnerProfileImageUrl={partnerProfileImageUrl}
        />
      </FixedHeaderContainer>

      {/* 내부 스크롤 채팅 영역 (Flex Item, grow) */}
      <ChattingWrapper ref={scrollRef}>
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
                <DateDivider>{formatDateLine(msg.createdAt)}</DateDivider>
              )}
              {msg.sender === "me" ? (
                <ChatItemMy content={msg.content} time={msg.time} />
              ) : (
                <ChatItemOtherPerson content={msg.content} time={msg.time} />
              )}
            </React.Fragment>
          );
        })}
      </ChattingWrapper>

      {/* 하단 고정 입력창 (Flex Item) */}
      <FixedInputArea>
        <Input
          placeholder={"메시지 입력"}
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
        <SendButton onClick={handleSendMessage}>
          <img src={send} alt={"send"} />
        </SendButton>
      </FixedInputArea>
    </ChatPageWrapper>
  );
}

const ChatPageWrapper = styled.div`
  width: 100%;
  background: #f4f4f4;
  /* 부모(SubPage)의 padding-top 80px를 뺀 나머지 전체 높이 */
  height: calc(100vh - 80px);
  /* Flex Column 레이아웃 */
  display: flex;
  flex-direction: column;
  /* 외부 스크롤 방지 */
  overflow: hidden;
`;

const FixedHeaderContainer = styled.div`
  width: 100%;
  background: #f4f4f4;
  /* 크기가 줄어들거나 늘어나지 않도록 고정 */
  flex-shrink: 0;
`;

const ChattingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  /* 남은 공간을 모두 차지하며 내부 스크롤 활성화 */
  flex: 1;
  overflow-y: auto;

  padding-bottom: 10px;
  box-sizing: border-box;
  background: #f4f4f4;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #d1d1d1;
    border-radius: 2px;
  }
`;

const DateDivider = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 24px 0 16px 0;

  font-size: 12px;
  font-weight: 500;
  color: #767676;

  /* 선택 사항: 텍스트 배경을 캡슐 형태로 만들거나 단순 텍스트로 둘 수 있음 */
  /* 여기서는 깔끔한 텍스트 스타일 적용 */
`;

const FixedInputArea = styled.div`
  width: 100%;
  min-height: 56px;
  background-color: #fafafa;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  box-sizing: border-box;
  gap: 8px;
  border-top: 1px solid #e0e0e0;
  /* 크기가 줄어들거나 늘어나지 않도록 고정 */
  flex-shrink: 0;
`;

const Input = styled.textarea`
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 4px;
  border: none;
  font-size: 16px;
  line-height: 24px;
  color: #1c1c1e;
  resize: none;
  outline: none;
`;

const SendButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;
