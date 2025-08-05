import styled from "styled-components";
import { Notification } from "../../types/notifications.ts";
import announce from "../../assets/notification/announce.svg";
import roommate from "../../assets/notification/roommate.svg";
import purchase from "../../assets/notification/purchase.svg";
import chat from "../../assets/notification/chat.svg";

interface NotiItemProps {
  notidata: Notification;
}

const NotiItem = ({ notidata }: NotiItemProps) => {
  const NotiIconSelector = () => {
    if (notidata.category === "룸메이트") {
      return roommate;
    } else if (notidata.category === "공동구매") {
      return purchase;
    } else if (notidata.category === "채팅") {
      return chat;
    } else {
      return announce;
    }
  };
  return (
    <NotiItemWrapper onClick={notidata.onClick}>
      <IconWrapper>
        <img src={NotiIconSelector()} alt={"공지아이콘"} />
      </IconWrapper>
      <ContentWrapper>
        <div className="category">{notidata.category}</div>
        <div className="content">{notidata.content}</div>
        <div className="more">더보기</div>
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
const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;

  .category {
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 24px;

    letter-spacing: 0.38px;

    color: #1c1c1e;
  }

  .content {
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 24px;

    letter-spacing: 0.38px;

    color: #1c1c1e;
  }

  .more {
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 24px;

    letter-spacing: 0.38px;

    color: #919191;
  }
`;
