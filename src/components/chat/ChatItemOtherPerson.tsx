import styled from "styled-components";

const ChatItemOtherPerson = () => {
  return (
    <ChatItemOtherPersonWrapper>
      <ImgArea>
        <img alt={" "} />
      </ImgArea>
      <ContentArea>
        <div className="message">
          늦은 시간에
          죄송합니다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐다람쥐
        </div>
      </ContentArea>
      <TimeArea>
        <div className="time">오후 6:20</div>
      </TimeArea>
    </ChatItemOtherPersonWrapper>
  );
};
export default ChatItemOtherPerson;

const ChatItemOtherPersonWrapper = styled.div`
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: row;

  padding: 8px 20px;
  box-sizing: border-box;

  gap: 4px;
`;
const ImgArea = styled.div`
  width: fit-content;
  height: 100%;
  display: flex;
  justify-content: center;
  //align-items: center;
  padding-top: 3px;

  img {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: grey;
  }
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

    color: #1c1c1e;
    background: white;
    padding: 8px;
    border-radius: 4px;
  }
`;

const TimeArea = styled.div`
  display: flex;
  align-items: flex-end;
  .time {
    font-family: "Pretendard";
    font-style: normal;
    font-weight: 400;
    font-size: 8px;
    line-height: 10px;

    letter-spacing: 0.38px;

    color: #8e8e93;
  }
`;
