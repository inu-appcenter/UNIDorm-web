import styled from "styled-components";
import { useEffect, useState } from "react";
import profile from "../../assets/profileimg.png";
import GroupPurchaseInfo from "./GroupPurchaseInfo.tsx";
import { getRoommateChatUnreadCount } from "@/apis/chat";

interface ChatItemProps {
  chatRoomId: number; // API 호출을 위해 ID 추가
  selectedTab: string;
  onClick: () => void;
  title?: string;
  message?: string;
  time?: string;
  currentPeople?: number;
  maxPeople?: number;
  deadline?: string;
  partnerProfileImageUrl?: string;
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
}: ChatItemProps) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // 안 읽은 메시지 카운트 조회 (룸메이트 탭일 경우에만)
  useEffect(() => {
    if (selectedTab === "룸메이트" && chatRoomId) {
      getRoommateChatUnreadCount(chatRoomId)
        .then((res) => {
          setUnreadCount(res.data);
        })
        .catch((err) => {
          console.error("안 읽은 메시지 수 조회 실패", err);
        });
    }
  }, [chatRoomId, selectedTab]);

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
      <ImgWrapper>
        <img
          src={
            partnerProfileImageUrl?.trim() ? partnerProfileImageUrl : profile
          }
          alt="프로필이미지"
          onError={(e) => {
            e.currentTarget.src = profile;
          }}
        />
      </ImgWrapper>

      {/* unreadCount가 0보다 크면 안 읽음 스타일($isUnread=true) 적용 */}
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
        <div className="message">
          {message ?? "늦은 시간에 죄송합니다 ㅠㅠ"}
        </div>
      </ContentWrapper>

      <RightWrapper>
        <div className="time">{time ? formatTime(time) : ""}</div>
        {/* 안 읽은 메시지가 있을 때만 뱃지 표시 */}
        {unreadCount > 0 && (
          <Badge>{unreadCount > 99 ? "99+" : unreadCount}</Badge>
        )}
      </RightWrapper>
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
  cursor: pointer;
`;

const ImgWrapper = styled.div`
  width: fit-content;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    object-fit: cover;
  }
`;

// 안 읽음 여부에 따른 스타일 분기
const ContentWrapper = styled.div<{ $isUnread: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .titleLine {
    display: flex;
    flex-direction: row;
    margin-bottom: 2px;
  }

  .title {
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.38px;
    color: #1c1c1e;
    margin-right: 4px;
  }

  .message {
    font-family: Pretendard;
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
    line-height: 24px; /* 200% */
    letter-spacing: 0.38px;

    /* 안 읽었을 때와 읽었을 때 색상 분기 */
    color: ${(props) => (props.$isUnread ? "#1C1C1E" : "#636366")};
  }
`;

const RightWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 4px; /* 시간과 뱃지 사이 간격 */

  .time {
    font-style: normal;
    font-weight: 600;
    font-size: 10px;
    line-height: normal; /* 높이 맞춤을 위해 normal 혹은 숫자 조정 */
    letter-spacing: 0.38px;
    color: #636366;
  }
`;

/** 뱃지 스타일 (BottomBar와 동일) */
const Badge = styled.div`
  background-color: #f97171;
  color: #ffffff;
  font-size: 10px;
  font-weight: 600;

  /* 완전 원형 및 캡슐형 로직 */
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 100px;

  display: flex;
  align-items: center;
  justify-content: center;

  box-sizing: border-box;
  line-height: 1;
`;
