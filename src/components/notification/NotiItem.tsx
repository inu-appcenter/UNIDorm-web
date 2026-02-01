import styled from "styled-components";
import { Notification } from "@/types/notifications";
import announce from "../../assets/notification/announce.svg";
import roommate from "../../assets/notification/roommate.svg";
import purchase from "../../assets/notification/purchase.svg";
import { formatTimeAgo } from "@/utils/dateUtils";
import { useNavigate } from "react-router-dom";
import { ReceivedMatchingRequest } from "@/types/roommates";
import { useCouponStore } from "@/stores/useCouponStore";

interface NotiItemProps {
  notidata?: Notification;
  receivedRoommateRequest?: ReceivedMatchingRequest;
  handleRoommateRequest?: (matchingId: number, senderName: string) => void;
  // 매칭 요청 클릭 핸들러 추가
  onMatchRequestClick?: (matchingId: number, message: string) => void;
}

const NotiItem = ({
  notidata,
  receivedRoommateRequest,
  handleRoommateRequest,
  onMatchRequestClick,
}: NotiItemProps) => {
  const navigate = useNavigate();
  const setIsCouponWinOpen = useCouponStore(
    (state) => state.setIsCouponWinOpen,
  );

  const NotiIconSelector = (notidata: Notification) => {
    if (notidata.notificationType === "룸메이트") return roommate;
    if (notidata.notificationType === "공동구매") return purchase;
    return announce;
  };

  const handleNotificationClick = (notidata: Notification) => {
    switch (notidata.apiType) {
      case "ANNOUNCEMENT":
        navigate(`/announcements/${notidata.boardId}`);
        break;
      case "COMPLAINT":
        navigate(`/complain/${notidata.boardId}`);
        break;
      case "GROUP_ORDER":
        navigate(`/groupPurchase/${notidata.boardId}`);
        break;
      case "ROOMMATE":
        if (notidata.boardId) {
          navigate(`/roommate/list/${notidata.boardId}`);
        } else {
          alert(notidata.title + "\n" + notidata.body);
        }
        break;
      case "COUPON":
        setIsCouponWinOpen(true);
        break;
      case "ROOMMATE_MATCHING":
        if (notidata.boardId && onMatchRequestClick) {
          onMatchRequestClick(notidata.boardId, notidata.body);
        } else if (!notidata.boardId) {
          console.error("매칭 ID 누락");
        }
        break;
      case "CHAT":
        if (notidata.boardId) {
          navigate(`/chat/roommate/${notidata.boardId}`);
        } else {
          alert(notidata.title + "\n" + notidata.body);
        }
        return;
      default:
        console.warn("Unhandled apiType:", notidata.apiType);
        break;
    }
  };

  return (
    <NotiItemWrapper
      isRead={notidata ? notidata.read : false}
      onClick={() => {
        if (notidata) {
          handleNotificationClick(notidata);
        }
        if (receivedRoommateRequest && handleRoommateRequest) {
          handleRoommateRequest(
            receivedRoommateRequest.matchingId,
            receivedRoommateRequest.senderName,
          );
        }
      }}
    >
      <IconWrapper>
        <img
          src={!notidata ? roommate : NotiIconSelector(notidata)}
          alt={"공지아이콘"}
        />
      </IconWrapper>
      {notidata && (
        <ContentWrapper>
          <TopRow>
            <div className="notificationType">{notidata.notificationType}</div>
            <div className="createdDate">
              {formatTimeAgo(notidata.createdDate)}
            </div>
          </TopRow>
          <div className="title">{notidata.title}</div>
          <div className="body">{notidata.body}</div>
        </ContentWrapper>
      )}
      {receivedRoommateRequest && (
        <ContentWrapper>
          <TopRow>
            <div className="notificationType">룸메이트</div>
          </TopRow>
          <div className="title">룸메이트 신청이 도착했습니다!</div>
          <div className="body">
            {receivedRoommateRequest.senderName}님이 룸메이트 신청을 보냈습니다.
          </div>
        </ContentWrapper>
      )}
    </NotiItemWrapper>
  );
};

export default NotiItem;

const NotiItemWrapper = styled.div<{ isRead: boolean }>`
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: row;
  gap: 10px;
  box-sizing: border-box;
  position: relative;
  padding: 16px;
  border-bottom: 1px solid #e6e6e6;

  cursor: pointer;

  &::after {
    content: "";
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.5);
    opacity: ${(props) => (props.isRead ? 1 : 0)};
    pointer-events: none;
    transition: opacity 0.1s ease-in-out;
  }
`;

const IconWrapper = styled.div``;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  .notificationType {
    color: #1c1c1e;
    font-size: 14px;
    font-weight: 600;
    line-height: 24px;
  }

  .createdDate {
    font-size: 12px;
    color: #919191;
  }

  .title {
    color: #1c1c1e;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
  }

  .body {
    color: #919191;
    font-size: 14px;
    line-height: 24px;
  }
`;
