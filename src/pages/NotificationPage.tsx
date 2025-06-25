import styled from "styled-components";
import Header from "../components/common/Header.tsx";
import { Notification } from "../types/notifications.ts";
import NotiItem from "../components/notification/NotiItem.tsx";
export const dummyNotifications: Notification[] = [
  {
    id: 1,
    category: "룸메",
    content: "시스템 점검이 6월 15일 오전 2시에 진행됩니다.",
  },
  {
    id: 2,
    category: "채팅",
    content: "신규 가입 회원 대상 웰컴 이벤트가 시작되었습니다!",
  },
  {
    id: 3,
    category: "공동구매",
    content: "회원님의 비밀번호가 30일 후 만료됩니다.",
  },
  {
    id: 4,
    category: "공지사항",
    content: "앱 버전 2.1.0이 출시되었습니다. 지금 업데이트하세요.",
  },
  {
    id: 5,
    category: "룸메",
    content: "의심스러운 로그인 시도가 감지되었습니다.",
  },
];

const NotificationPage = () => {
  return (
    <NotificationPageWrapper>
      <Header title={"알림"} hasBack={true} />
      <ContentWrapper>
        {dummyNotifications.map((noti) => (
          <NotiItem key={noti.id} notidata={noti} />
        ))}{" "}
      </ContentWrapper>
    </NotificationPageWrapper>
  );
};

export default NotificationPage;

const NotificationPageWrapper = styled.div`
  padding: 70px 0;

  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;

  width: 100%;
  height: 100%;

  overflow-y: auto;
`;

const ContentWrapper = styled.div`
  //padding-bottom: 70px;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;

  overflow-y: auto;
`;
