import styled from "styled-components";
import profile from "../../assets/chat/profile.svg";
import GroupPurchaseInfo from "./GroupPurchaseInfo.tsx";

interface ChatItemProps {
  selectedTab: string;
  onClick: () => void;
  title?: string;
  message?: string;
  time?: string;
  currentPeople?: number;
  maxPeople?: number;
  deadline?: string;
}
const ChatListItem = ({
  selectedTab,
  onClick,
  title,
  message,
  time,
  currentPeople,
  maxPeople,
  deadline,
}: ChatItemProps) => {
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ChatItemWrapper onClick={onClick}>
      <ImgWrapper>
        <img src={profile} alt={"프로필이미지"} />
      </ImgWrapper>
      <ContentWrapper>
        <div className="titleLine">
          <div className="title">{title ?? "익명 1"}</div>
          {selectedTab === "공구" && (
            <GroupPurchaseInfo
              currentPeople={currentPeople}
              maxPeople={maxPeople}
              deadline={deadline}
            />
          )}
        </div>
        <div className="message">
          {message ?? "늦은 시간에 죄송합니다 ㅠㅠ"}
        </div>
      </ContentWrapper>
      <TimeWrapper>
        <div className="time">{time ? formatTime(time) : "오후 6:20"}</div>
      </TimeWrapper>
    </ChatItemWrapper>
  );
};
export default ChatListItem;

const ChatItemWrapper = styled.div`
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: row;

  padding: 8px 20px;
  box-sizing: border-box;

  gap: 16px;
`;

const ImgWrapper = styled.div`
  width: fit-content;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 46px;
  }
`;
const ContentWrapper = styled.div`
  flex: 1;

  .titleLine {
    display: flex;
    flex-direction: row;
  }

  .title {
    font-family: "Pretendard";
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 24px;
    letter-spacing: 0.38px;

    color: #1c1c1e;
    margin-right: 4px;
  }

  .message {
    font-family: "Pretendard";
    font-style: normal;
    font-weight: 600;
    font-size: 10px;
    line-height: 24px;

    letter-spacing: 0.38px;

    color: #636366;
  }
`;

const TimeWrapper = styled.div`
  display: flex;
  align-items: center;
  .time {
    font-family: "Pretendard";
    font-style: normal;
    font-weight: 600;
    font-size: 10px;
    line-height: 24px;

    letter-spacing: 0.38px;

    color: #636366;
  }
`;
