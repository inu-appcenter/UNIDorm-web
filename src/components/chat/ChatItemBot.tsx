import styled from "styled-components";
import ChatMessageContent from "./ChatMessageContent";

type Props = {
  content: string;
  time: string;
  showTime?: boolean;
  unreadCount?: number;
};

const ChatItemBot = ({
  content,
  time,
  showTime = true,
  unreadCount,
}: Props) => {
  const unreadLabel =
    typeof unreadCount === "number" && unreadCount > 0
      ? unreadCount > 99
        ? "99+"
        : String(unreadCount)
      : null;

  return (
    <Wrapper>
      <ContentArea>
        <SenderName>횃불이</SenderName>
        <Bubble><ChatMessageContent content={content} /></Bubble>
      </ContentArea>
      {(showTime || unreadLabel) && (
        <TimeArea>
          {showTime && <span>{time}</span>}
          {unreadLabel && <strong>{unreadLabel}</strong>}
        </TimeArea>
      )}
    </Wrapper>
  );
};

export default ChatItemBot;

const Wrapper = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 6px;
  width: 100%;
  padding: 8px 20px;
  box-sizing: border-box;
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 60%;
`;

const SenderName = styled.div`
  margin: 0 0 4px 4px;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: #3d3d3d;
`;

const Bubble = styled.div`
  padding: 10px 14px;
  border-radius: 18px;
  background: #e9ddff;
  color: #3d3d3d;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
`;

const TimeArea = styled.div`
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-start;
  font-family: "Pretendard", sans-serif;
  font-size: 11px;
  line-height: 1.5;
  color: #8b8b8b;

  strong {
    color: #0958d9;
    font-weight: 600;
  }
`;
