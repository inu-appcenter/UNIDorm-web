import styled from "styled-components";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ChatInfo from "../../components/chat/ChatInfo.tsx";
import ChatItemOtherPerson from "../../components/chat/ChatItemOtherPerson.tsx";
import ChatItemMy from "../../components/chat/ChatItemMy.tsx";
import send from "../../assets/chat/send.svg";
import { useRoommateChat } from "./useRoommateChat.ts";
import useUserStore from "../../stores/useUserStore.ts";
import { getRoommateChatHistory } from "@/apis/chat";
import TopNoticeBanner from "../../components/chat/TopNoticeBanner.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";
import { deleteRoommateChatRoom } from "@/apis/roommate";

type MessageType = {
  id: number;
  sender: "me" | "other";
  content: string;
  time: string;
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

  const roomId = Number(id);
  const userId = userInfo.id;
  const token = tokenInfo.accessToken;

  // 하단 스크롤 이동
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  // 메시지 리스트 변경 시 자동 스크롤
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
      setMessageList((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "other",
          content: msg.content,
          time: new Date().toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        },
      ]);
    },
    onConnect: () => {
      console.log("✅ WebSocket 연결됨");
    },
    onDisconnect: () => {
      console.log("🛑 WebSocket 연결 해제됨");
      if (!isLeavingRef.current) {
        // alert(
        //   "실시간 채팅 연결이 끊어졌습니다.\n현재 페이지를 새로고침합니다.",
        // );
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
    const now = new Date().toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const newMessage: MessageType = {
      id: Date.now(),
      sender: "me",
      content: inputValue.trim(),
      time: now,
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
            console.log("채팅방 나가기 성공, 채팅방이 삭제되었습니다.");
            // 추가 처리(예: 화면 이동, 상태 업데이트 등)
            navigate("/chat");
          }
        } catch (error: any) {
          alert("채팅방 나가기를 실패했어요." + error);
          if (error.response) {
            if (error.response.status === 403) {
              console.error("게스트가 아닌 사용자의 접근입니다.");
            } else if (error.response.status === 404) {
              console.error("유저 또는 채팅방을 찾을 수 없습니다.");
            } else {
              console.error("알 수 없는 오류가 발생했습니다.");
            }
          } else {
            console.error("네트워크 오류 또는 서버 응답 없음");
          }
        }
      },
    },
  ];

  useSetHeader({ title: "룸메이트 채팅", menuItems });

  return (
    <ChatPageWrapper>
      {/* 상단 고정 영역 */}
      <FixedHeaderContainer>
        <ChatInfo
          selectedTab={typeString}
          partnerName={partnerName}
          roomId={roomId}
          isChatted={messageList.length > 0}
          partnerProfileImageUrl={partnerProfileImageUrl}
        />
        <TopNoticeBanner
          message={
            messageList.length > 0
              ? "서로 룸메이트를 하기로 마음먹었다면,\n룸메 신청 버튼을 눌러 룸메이트가 되어보세요!"
              : "자유롭게 채팅을 나누며 서로를 알아가보세요!"
          }
        />
      </FixedHeaderContainer>

      {/* 스크롤 채팅 영역 */}
      <ChattingWrapper>
        {messageList.map((msg) =>
          msg.sender === "me" ? (
            <ChatItemMy key={msg.id} content={msg.content} time={msg.time} />
          ) : (
            <ChatItemOtherPerson
              key={msg.id}
              content={msg.content}
              time={msg.time}
            />
          ),
        )}
      </ChattingWrapper>

      {/* 하단 고정 입력창 */}
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
  min-height: 100vh;
  position: relative;
`;

const FixedHeaderContainer = styled.div`
  position: fixed;
  /* 부모 레이아웃 상단 패딩값 */
  top: 70px;
  left: 0;
  right: 0;
  z-index: 10;
  background: #f4f4f4;
`;

const ChattingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  /* 상단 고정 요소(ChatInfo + Banner) 높이만큼 여백 */
  padding-top: 70px;
  /* 하단 입력창 높이만큼 여백 */
  padding-bottom: 70px;
  box-sizing: border-box;
  background: #f4f4f4;
`;

const FixedInputArea = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  min-height: 56px;
  background-color: #fafafa;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  box-sizing: border-box;
  gap: 8px;
  border-top: 1px solid #e0e0e0;
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
