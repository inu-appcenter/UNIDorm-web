import styled from "styled-components";
import Header from "../components/common/Header.tsx";
import { Notification } from "../types/notifications.ts";
import NotiItem from "../components/notification/NotiItem.tsx";
import { useEffect, useState } from "react";
import {
  acceptRoommateMatching,
  getReceivedRoommateRequests,
  rejectRoommateMatching,
} from "../apis/roommate.ts";
import axios from "axios";

const NotificationPage = () => {
  const [matchRequests, setMatchRequests] = useState<Notification[]>([]);

  const handleRoommateRequest = async (
    matchingId: number,
    senderName: string,
  ) => {
    try {
      if (
        window.confirm(`${senderName}님이 보낸 룸메이트 요청을 수락할까요?`)
      ) {
        await acceptRoommateMatching(matchingId);
        alert("매칭 요청이 수락되었습니다.");
      } else {
        if (
          window.confirm(`${senderName}님이 보낸 룸메이트 요청을 거절할까요?`)
        ) {
          await rejectRoommateMatching(matchingId);
          alert("매칭 요청이 거절되었습니다.");
        }
      }
    } catch (e: any) {
      if (axios.isAxiosError(e) && e.response) {
        if (e.response.status === 409) {
          alert("이미 처리된 매칭 요청입니다.");
          return;
        }
      }
      console.error(e.message);
      alert("처리 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    const fetchMatchingRequests = async () => {
      try {
        const response = await getReceivedRoommateRequests();
        const formatted = response.data.map((item) => ({
          id: item.matchingId,
          category: "룸메이트",
          content: `${item.senderName}님이 룸메 신청을 보냈어요!`,
          onClick: () =>
            handleRoommateRequest(item.matchingId, item.senderName),
        }));
        setMatchRequests(formatted);
      } catch (error) {
        console.error("매칭 요청 조회 실패:", error);
      }
    };

    fetchMatchingRequests();
  }, []);

  const allNotifications = [...matchRequests];

  return (
    <NotificationPageWrapper>
      <Header hasBack={true} />
      <ContentWrapper>
        {allNotifications.length > 0 ? (
          allNotifications.map((noti) => (
            <NotiItem key={noti.id} notidata={noti} />
          ))
        ) : (
          <EmptyMessage>알림이 없습니다.</EmptyMessage>
        )}
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

const EmptyMessage = styled.div`
  padding: 24px;
  text-align: center;
  color: #aaa;
  font-size: 14px;
`;
