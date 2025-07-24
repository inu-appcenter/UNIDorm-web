import styled from "styled-components";
import Header from "../../components/common/Header.tsx";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ChatInfo from "../../components/chat/ChatInfo.tsx";
import ChatItemOtherPerson from "../../components/chat/ChatItemOtherPerson.tsx";
import ChatItemMy from "../../components/chat/ChatItemMy.tsx";
import send from "../../assets/chat/send.svg";

type MessageType = {
  id: number;
  sender: "me" | "other";
  content: string;
  time: string;
};

export default function ChattingPage() {
  const { chatType } = useParams();
  const [typeString, setTypeString] = useState<string>("");
  const [messageList, setMessageList] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState<string>("");

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatType === "roommate") setTypeString("룸메");
    else if (chatType === "groupPurchase") setTypeString("공구");

    // 예시 초기 메시지
    setMessageList([
      {
        id: 1,
        sender: "other",
        content: "안녕하세요, 먼저 연락드려서 죄송해요.",
        time: "오후 6:20",
      },
    ]);
  }, []);

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

    const newMessage: MessageType = {
      id: Date.now(),
      sender: "me",
      content: inputValue.trim(),
      time: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };

    setMessageList((prev) => [...prev, newMessage]);
    setInputValue("");

    // 높이 초기화
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    // 스크롤 하단으로 이동
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
  };

  return (
    <ChatPageWrapper>
      <Header hasBack={true} />
      <ContentWrapper>
        <ChatInfo selectedTab={typeString} />
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
  padding-top: 70px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;

  width: 100%;
  height: 100%;

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
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: fit-content;
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

  font-family: "AppleSDGothicNeoM00";

  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 24px;

  letter-spacing: 0.38px;

  color: #1c1c1e;
`;
const SendButton = styled.button`
  background: none;
  border: none;
`;
