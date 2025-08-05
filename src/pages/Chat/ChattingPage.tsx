import styled from "styled-components";
import Header from "../../components/common/Header.tsx";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ChatInfo from "../../components/chat/ChatInfo.tsx";
import ChatItemOtherPerson from "../../components/chat/ChatItemOtherPerson.tsx";
import ChatItemMy from "../../components/chat/ChatItemMy.tsx";
import send from "../../assets/chat/send.svg";
import { useRoommateChat } from "./useRoommateChat.ts";
import useUserStore from "../../stores/useUserStore.ts";
import { getRoommateChatHistory } from "../../apis/chat.ts";

type MessageType = {
  id: number;
  sender: "me" | "other";
  content: string;
  time: string;
};

export default function ChattingPage() {
  const { chatType, id } = useParams();
  const [typeString, setTypeString] = useState<string>("");
  const [messageList, setMessageList] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const { tokenInfo, userInfo } = useUserStore();

  const location = useLocation();
  // navigate 시 넘긴 state 객체에서 partnerName 꺼내기
  const partnerName = location.state?.partnerName ?? undefined;

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const roomId = Number(id);
  const userId = userInfo.id;
  const token = tokenInfo.accessToken;

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
      scrollToBottom();
    },
    onConnect: () => {
      console.log("✅ WebSocket 연결됨");
    },
    onDisconnect: () => {
      console.log("🛑 WebSocket 연결 해제됨");
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
            time: new Date().toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
          }));

          setMessageList(formattedMessages);
          scrollToBottom();
        } catch (error) {
          console.error("채팅 내역 불러오기 실패:", error);
        }

        connect(); // WebSocket 연결
      } else if (chatType === "groupPurchase") {
        setTypeString("공동구매");
        // 추후 WebSocket 연결
      }
    };

    init();

    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, [chatType]);

  const handleInput = () => {
    const el = inputRef.current;
    if (el) {
      el.style.height = "auto";
      const newHeight = Math.min(el.scrollHeight, 96);
      el.style.height = `${newHeight}px`;
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

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
    sendMessage(inputValue.trim()); // ✅ WebSocket 전송
    setInputValue("");

    if (inputRef.current) inputRef.current.style.height = "auto";

    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo?.({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
        // fallback
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);
  };

  return (
    <ChatPageWrapper>
      <Header hasBack={true} title={typeString + " 채팅"} />
      <ContentWrapper>
        <ChatInfo
          selectedTab={typeString}
          partnerName={partnerName}
          roomId={roomId}
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
  height: 100%;
  padding-top: 70px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;

  overflow-y: auto;
`;

const ContentWrapper = styled.div`
  //padding-bottom: 70px;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
`;

const ChattingWrapper = styled.div`
  flex: 1;
  height: 100%;

  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  background: #f4f4f4;

  padding-bottom: 56px;
`;
const InputArea = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: fit-content;
  min-height: 56px;

  background-color: #fafafa;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  padding: 8px 16px;
  box-sizing: border-box;

  gap: 8px;
`;

const Input = styled.textarea`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px;
  box-sizing: border-box;
  gap: 10px;

  width: 100%;
  height: 100%;

  background: #ffffff;
  border-radius: 4px;
  border: none;

  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;

  letter-spacing: 0.38px;

  color: #1c1c1e;
`;
const SendButton = styled.button`
  background: none;
  border: none;
`;
