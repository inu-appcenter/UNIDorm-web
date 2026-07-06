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
        {/*<div className="isRead">1</div>*/}
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
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 24px;
    letter-spacing: 0.38px;

    color: #1c1c1e;
  }

  .message {
    font-family: "Pretendard", sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 1.5;
    text-align: start;

    color: #ffffff;
    background: #1677ff;
    padding: 8px 12px;
    border-radius: 16px;
  }
`;

const TimeArea = styled.div`
  display: flex;
  align-items: flex-end;
  flex-direction: column-reverse;
  font-family: "Pretendard", sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 11px;
  line-height: 1.5;

  letter-spacing: 0.38px;
  .time {
    color: #8b8b8b;
  }
  .isRead {
    color: #0958d9;
    font-size: 11px;
    font-weight: 600;
  }
`;
