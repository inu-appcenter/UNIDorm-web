import styled from "styled-components";
import { Notification } from "../../types/notifications.ts";
import announce from "../../assets/notification/announce.svg";
import roommate from "../../assets/notification/roommate.svg";
import purchase from "../../assets/notification/purchase.svg";
// import chat from "../../assets/notification/chat.svg";
import { formatTimeAgo } from "../../utils/dateUtils.ts";

interface NotiItemProps {
  notidata: Notification;
}

const NotiItem = ({ notidata }: NotiItemProps) => {
  const NotiIconSelector = () => {
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
  return (
    <NotiItemWrapper onClick={undefined}>
      <IconWrapper>
        <img src={NotiIconSelector()} alt={"공지아이콘"} />
      </IconWrapper>
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
    </NotiItemWrapper>
  );
};

export default NotiItem;

const NotiItemWrapper = styled.div`
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: row;
  gap: 10px;
  box-sizing: border-box;

  padding: 16px;
  border-bottom: 1px solid #e6e6e6;
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
