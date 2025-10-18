import styled from "styled-components";
import { Notification } from "../../types/notifications.ts";
import announce from "../../assets/notification/announce.svg";
import roommate from "../../assets/notification/roommate.svg";
import purchase from "../../assets/notification/purchase.svg";
// import chat from "../../assets/notification/chat.svg";
import { formatTimeAgo } from "../../utils/dateUtils.ts";
import { useNavigate } from "react-router-dom";
import { ReceivedMatchingRequest } from "../../types/roommates.ts";
import { useCouponStore } from "../../stores/useCouponStore.ts";

interface NotiItemProps {
  notidata?: Notification;
  receivedRoommateRequest?: ReceivedMatchingRequest;
  handleRoommateRequest?: (matchingId: number, senderName: string) => void;
}

const NotiItem = ({
  notidata,
  receivedRoommateRequest,
  handleRoommateRequest,
}: NotiItemProps) => {
  const navigate = useNavigate();

  //쿠폰 바텀시트 열림 상태 전역관리
  const setIsCouponWinOpen = useCouponStore(
    (state) => state.setIsCouponWinOpen,
  );

  const NotiIconSelector = (notidata: Notification) => {
    if (notidata.notificationType === "룸메이트") {
      return roommate;
    } else if (notidata.notificationType === "공동구매") {
      return purchase;
    } else if (
      notidata.notificationType === "생활원 공지사항" ||
      notidata.notificationType === "유니돔 공지사항" ||
      notidata.notificationType === "생활원 민원"
    ) {
      return announce;
    } else {
      return announce;
    }
  };

  const handleNotificationClick = (notidata: Notification) => {
    switch (notidata.apiType) {
      case "ANNOUNCEMENT":
        // 공지사항 상세 페이지로 이동
        navigate(`/announcements/${notidata.boardId}`);
        break;
      case "COMPLAINT":
        // 민원 상세 페이지로 이동
        navigate(`/complain/${notidata.boardId}`);
        break;
      case "GROUP_ORDER":
        // 공동구매 상세 페이지로 이동
        navigate(`/groupPurchase/${notidata.boardId}`);
        break;
      case "ROOMMATE":
        if (notidata.boardId) {
          // 룸메이트 상세 페이지로 이동
          navigate(`/roommate/list/${notidata.boardId}`);
        } else {
          alert(notidata.title + "\n" + notidata.body);
        }
        break;
      case "COUPON":
        setIsCouponWinOpen(true);
        break;
      default:
        // 처리할 수 없는 타입일 경우 콘솔에 경고를 출력하거나 기본 페이지로 이동
        console.warn("Unhandled apiType:", notidata.apiType);
        // navigate("/notifications"); // 예: 알림 목록 페이지로 이동
        break;
    }
  };

  return (
    // 2. notidata.read 값을 isRead prop으로 전달합니다.
    <NotiItemWrapper
      isRead={notidata ? notidata.read : false}
      onClick={() => {
        if (notidata && handleNotificationClick) {
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
            {/*<div className="createdDate">*/}
            {/*  {formatTimeAgo(receivedRoommateRequest.createdDate)}*/}
            {/*</div>*/}
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

// 1. isRead prop을 받도록 수정하고, 해당 prop 값에 따라 오버레이를 표시합니다.
const NotiItemWrapper = styled.div<{ isRead: boolean }>`
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: row;
  gap: 10px;
  box-sizing: border-box;
  position: relative; /* 오버레이를 위한 포지셔닝 컨텍스트 */

  padding: 16px;
  border-bottom: 1px solid #e6e6e6;

  /* 읽음 처리된 알림 위에 반투명 오버레이를 씌웁니다. */
  &::after {
    content: "";
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.5); /* 흰색 반투명 오버레이 */
    opacity: ${(props) =>
      props.isRead ? 1 : 0}; /* isRead가 true일 때만 보이도록 설정 */
    pointer-events: none; /* 오버레이가 클릭 이벤트를 가로채지 않도록 설정 */
    transition: opacity 0.2s ease-in-out; /* 부드러운 전환 효과 */
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
  flex: 1; /* 아이콘을 제외한 나머지 공간을 모두 차지하도록 설정 */

  .notificationType {
    color: var(--1, #1c1c1e);
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: 24px; /* 171.429% */
    letter-spacing: 0.38px;
  }

  /* 날짜 스타일 추가 */

  .createdDate {
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 24px;
    color: #919191;
    white-space: nowrap; /* 날짜가 길어져도 줄바꿈되지 않도록 설정 */
  }

  .title {
    color: var(--1, #1c1c1e);
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: 24px; /* 150% */
    letter-spacing: 0.38px;
  }

  .body {
    color: #919191;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 24px; /* 171.429% */
    letter-spacing: 0.38px;
  }
`;
