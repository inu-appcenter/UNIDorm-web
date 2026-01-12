import styled from "styled-components";
import Header from "../../components/common/Header/Header.tsx";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ChatInfo from "../../components/chat/ChatInfo.tsx";
import ChatItemOtherPerson from "../../components/chat/ChatItemOtherPerson.tsx";
import ChatItemMy from "../../components/chat/ChatItemMy.tsx";
import send from "../../assets/chat/send.svg";
import { useRoommateChat } from "./useRoommateChat.ts";
import useUserStore from "../../stores/useUserStore.ts";
import { getRoommateChatHistory } from "../../apis/chat.ts";
import { deleteRoommateChatRoom } from "../../apis/roommate.ts";
import TopNoticeBanner from "../../components/chat/TopNoticeBanner.tsx";

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
  const scrollRef = useRef<HTMLDivElement>(null);

  const roomId = Number(id);
  const userId = userInfo.id;
  const token = tokenInfo.accessToken;

  // 하단 스크롤 이동 함수
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
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
        alert(
          "실시간 채팅 연결이 끊어졌습니다.\n현재 페이지를 새로고침합니다.",
        );
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
          if (roomId === undefined) throw new Error("채팅방 id 미정의");
          const response = await deleteRoommateChatRoom(roomId);
          if (response.status === 201) {
            alert("채팅방에서 나왔어요.");
            navigate("/chat");
          }
        } catch (error: any) {
          alert("채팅방 나가기 실패");
        }
      },
    },
  ];

  return (
    <ChatPageWrapper>
      <Header
        hasBack={true}
        title={typeString + " 채팅"}
        menuItems={menuItems}
      />
      <ContentWrapper>
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

        <ChattingWrapper ref={scrollRef}>
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

        <InputArea>
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
        </InputArea>
      </ContentWrapper>
    </ChatPageWrapper>
  );
}

const ChatPageWrapper = styled.div`
  width: 100%;
  height: 100dvh; /* 뷰포트 높이 고정 */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  background: #f4f4f4;
  padding-top: 70px;
`;

const ChattingWrapper = styled.div`
  flex: 1; /* 가용 공간 점유 */
  overflow-y: auto; /* 독립 스크롤 */
  display: flex;
  flex-direction: column;
  padding: 10px 0 20px 0;
  background: #f4f4f4;
`;

const InputArea = styled.div`
  width: 100%;
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
`;
