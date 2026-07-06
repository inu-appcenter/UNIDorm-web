import styled from "styled-components";
import profile from "../../assets/profileimg.png";

type Props = {
  content: string;
  time: string;
  userImageUrl?: string | null;
  senderName?: string;
};

const ChatItemOtherPerson = ({ content, time, userImageUrl, senderName }: Props) => {
  return (
    <ChatItemOtherPersonWrapper>
      <ProfileImg
        src={userImageUrl && userImageUrl !== "string" ? userImageUrl : profile}
        alt="상대방"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = profile;
        }}
      />
      <ContentArea>
        {senderName && <div className="sender-name">{senderName}</div>}
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

  gap: 8px;
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
  display: flex;
  flex-direction: column;

  .sender-name {
    font-family: "Pretendard", sans-serif;
    font-size: 12px;
    font-weight: 400;
    color: #3d3d3d;
    margin-bottom: 4px;
    padding-left: 4px;
  }

  .message {
    font-family: "Pretendard", sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 1.5;
    text-align: start;

    color: #3d3d3d;
    background: #f7f7f7;
    padding: 8px 12px;
    border-radius: 16px;
  }
`;

const TimeArea = styled.div`
  display: flex;
  align-items: flex-end;
  font-family: "Pretendard", sans-serif;
  .time {
    font-style: normal;
    font-weight: 400;
    font-size: 11px;
    line-height: 1.5;

    letter-spacing: 0.38px;

    color: #8b8b8b;
  }
`;
