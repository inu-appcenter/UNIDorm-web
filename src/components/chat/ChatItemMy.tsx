import styled from "styled-components";

type Props = {
  content: string;
  time: string;
};

const ChatItemMy = ({ content, time }: Props) => {
  return (
    <ChatItemMyWrapper>
      <ContentArea>
        <div className="message">{content}</div>
      </ContentArea>
      <TimeArea>
        <div className="time">{time}</div>
        <div className="isRead">1</div>
      </TimeArea>
    </ChatItemMyWrapper>
  );
};

export default ChatItemMy;

const ChatItemMyWrapper = styled.div`
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: row-reverse;

  padding: 8px 20px;
  box-sizing: border-box;

  gap: 4px;
`;

const ContentArea = styled.div`
  //flex: 1;
  width: fit-content;
  max-width: 60%;

  .title {
    font-family: "Pretendard";
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 24px;
    letter-spacing: 0.38px;

    color: #1c1c1e;
  }

  .message {
    font-family: "Pretendard";
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 14px;
    text-align: start;

    color: #f4f4f4;
    background: #0a84ff;
    padding: 8px;
    border-radius: 4px;
  }
`;

const TimeArea = styled.div`
  display: flex;
  align-items: flex-end;
  flex-direction: column-reverse;
  font-family: "Pretendard";
  font-style: normal;
  font-weight: 400;
  font-size: 8px;
  line-height: 10px;

  letter-spacing: 0.38px;
  .time {
    color: #8e8e93;
  }
  .isRead {
    color: #ffd60a;
    font-size: 9px;
    font-weight: 600;
  }
`;
