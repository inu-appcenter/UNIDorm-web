import styled from "styled-components";
import GroupPurchaseInfo from "./GroupPurchaseInfo.tsx";
import { useRoommateChatUnreadCount } from "@/queries/chat";
import ChatAvatar from "./ChatAvatar";
import { MapPin } from "lucide-react";

interface ChatItemProps {
  chatRoomId: number;
  selectedTab: string;
  onClick: () => void;
  title?: string;
  message?: string;
  time?: string;
  currentPeople?: number;
  maxPeople?: number;
  deadline?: string;
  partnerProfileImageUrl?: string;
  isRoommate?: boolean;
  boardTitle?: string | null;
}

const ChatListItem = ({
  chatRoomId,
  selectedTab,
  onClick,
  title,
  message,
  time,
  currentPeople,
  maxPeople,
  deadline,
  partnerProfileImageUrl,
  isRoommate,
  boardTitle,
}: ChatItemProps) => {
  const { data: serverUnreadCount } = useRoommateChatUnreadCount(
    selectedTab === "룸메이트" ? chatRoomId : undefined,
  );
  const unreadCount = serverUnreadCount ?? 0;

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();

    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();

    return isToday
      ? date.toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : date.toLocaleDateString("ko-KR", {
          month: "2-digit",
          day: "2-digit",
        });
  };

  return (
    <ChatItemWrapper onClick={onClick}>
      <LeftSection>
        {isRoommate && (
          <RoommateBadge>
            <MapPin size={12} color="#1677ff" style={{ marginRight: 4 }} />
            내 룸메
          </RoommateBadge>
        )}
        <MainRow>
          <ChatAvatar
            count={currentPeople || 1}
            imageUrl={partnerProfileImageUrl}
          />
          <ContentWrapper $isUnread={unreadCount > 0}>
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
            {boardTitle && <BoardTitleText>{boardTitle}</BoardTitleText>}
            <div className="message">
              {message ?? "대화 내역이 없습니다."}
            </div>
          </ContentWrapper>
        </MainRow>
      </LeftSection>

      <RightWrapper>
        {unreadCount > 0 && (
          <Badge>{unreadCount > 99 ? "99+" : unreadCount}</Badge>
        )}
        <div className="time">{time ? formatTime(time) : ""}</div>
      </RightWrapper>
    </ChatItemWrapper>
  );
};

export default ChatListItem;

const ChatItemWrapper = styled.div`
  width: 100%;
  padding: 14px 12px;
  margin: 0 -12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  box-sizing: border-box;
  cursor: pointer;
  border-radius: 12px;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  /* iOS 메시지 앱 스타일 셀 하이라이트 & 탭 햅틱 */
  transition: background-color 0.12s ease, transform 0.12s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.05);
    transform: scale(0.99);
  }
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

const MainRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const ContentWrapper = styled.div<{ $isUnread: boolean }>`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .titleLine {
    display: flex;
    align-items: center;
  }

  .title {
    font-family: "Pretendard", sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 1.5;
    color: #3d3d3d;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .message {
    font-family: "Pretendard", sans-serif;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.5;
    color: ${(props) => (props.$isUnread ? "#3d3d3d" : "#8b8b8b")};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const RightWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 12px;

  .time {
    font-family: "Pretendard", sans-serif;
    font-size: 12px;
    font-weight: 400;
    line-height: 1.5;
    color: #8b8b8b;
  }
`;

const Badge = styled.div`
  background-color: #1677ff;
  color: #ffffff;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;

  min-width: 20px;
  height: 20px;
  padding: 0 10px;
  border-radius: 23px;
  width: fit-content;

  display: flex;
  align-items: center;
  justify-content: center;

  box-sizing: border-box;
`;

const RoommateBadge = styled.div`
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 400;
  color: #1677ff;
  line-height: 1.5;
`;

const BoardTitleText = styled.div`
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  color: #8e8e93;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
