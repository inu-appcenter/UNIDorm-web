import styled from "styled-components";
import profile from "../../assets/profileimg.png";

type Props = {
  content: string;
  time: string;
  userImageUrl?: string | null;
};

const ChatItemOtherPerson = ({ content, time, userImageUrl }: Props) => {
  return (
    <ChatItemOtherPersonWrapper>
      <ProfileImg
        src={userImageUrl && userImageUrl !== "string" ? userImageUrl : profile}
        alt="상대방"
        onError={(e) => {
          e.currentTarget.src = profile;
        }}
      />
      <ContentArea>
        <div className="message">{content}</div>
      </ContentArea>
      <TimeArea>
        <div className="time">{time}</div>
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
const ProfileImg = styled.img`
  //padding-top: 3px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
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
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
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
    font-style: normal;
    font-weight: 400;
    font-size: 8px;
    line-height: 10px;

    letter-spacing: 0.38px;

    color: #8e8e93;
  }
`;
