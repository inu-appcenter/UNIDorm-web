import styled from "styled-components";
import Header from "../components/common/Header.tsx";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ChatInfo from "../components/chat/ChatInfo.tsx";
import ChatItemOtherPerson from "../components/chat/ChatItemOtherPerson.tsx";
import ChatItemMy from "../components/chat/ChatItemMy.tsx";
import send from "../assets/chat/send.svg";

export default function ChatPage() {
  const { chatType } = useParams();
  const [typeString, setTypeString] = useState<string>("");
  useEffect(() => {
    if (chatType === "roommate") setTypeString("룸메");
    else if (chatType === "groupPurchase") setTypeString("공구");
  }, []);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = () => {
    const el = inputRef.current;
    if (el) {
      el.style.height = "auto"; // 초기화
      const newHeight = Math.min(el.scrollHeight, 96); // ✅ 최대 높이 제한
      el.style.height = `${newHeight}px`;
    }
  };
  return (
    <ChatPageWrapper>
      <Header title={`${typeString} 채팅`} hasBack={true} />
      <ContentWrapper>
        <ChatInfo selectedTab={typeString} />
        <ChattingWrapper>
          <ChatItemOtherPerson />
          <ChatItemMy />
        </ChattingWrapper>
        <InputArea>
          <Input
            placeholder={"메시지 입력"}
            ref={inputRef}
            onInput={handleInput}
            rows={1}
          />
          <SendButton>
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
  display: flex;
  flex-direction: column;
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
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background: #f4f4f4;
`;
const InputArea = styled.div`
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
