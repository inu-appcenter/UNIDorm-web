import styled from "styled-components";
import NotiItem from "../components/notification/NotiItem.tsx";
import { useEffect, useState } from "react";
import { getNotifications } from "@/apis/notification"; // 새로 만든 알림 API 임포트
import useUserStore from "../stores/useUserStore.ts";
import { Notification } from "@/types/notifications";
import { useNavigate } from "react-router-dom";
import BottomBar from "../components/common/BottomBar/BottomBar.tsx";
import {
  acceptRoommateMatching,
  getReceivedRoommateRequests,
  rejectRoommateMatching,
} from "@/apis/roommate";
import axios from "axios";
import { ReceivedMatchingRequest } from "@/types/roommates";
import { useSetHeader } from "@/hooks/useSetHeader";

const NotificationPage = () => {
  // 표시될 모든 알림을 저장하는 상태
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [receivedRoommateRequests, setReceivedRoommateRequests] = useState<
    ReceivedMatchingRequest[]
  >([]);
  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  // 룸메이트 매칭 요청 처리 로직 (기존과 동일)
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
        alert(
          "UNI Dorm에서의 룸메이트 매칭은 실제 기숙사 룸메이트 지정과 무관하며, 룸메이트와의 편리한 생활을 위한 서비스를 제공하기 위함입니다.\n반드시 룸메이트 사전 지정 기간에 인천대학교 포털에서 신청해주세요!!!!",
        );
      } else {
        if (
          window.confirm(`${senderName}님이 보낸 룸메이트 요청을 거절할까요?`)
        ) {
          await rejectRoommateMatching(matchingId);
          alert("매칭 요청이 거절되었습니다.");
        }
      }
      // 요청 처리 후 목록을 새로고침
      fetchNotiData();
    } catch (e: any) {
      if (axios.isAxiosError(e) && e.response) {
        if (e.response.status === 409) {
          alert("이미 처리된 매칭 요청입니다.");
          fetchNotiData(); // 다른 기기에서 처리했을 수 있으니 목록 새로고침
          return;
        }
      }
      console.error(e.message);
      alert("처리 중 오류가 발생했습니다.");
    }
  };

  // 모든 알림 데이터를 가져오는 함수
  const fetchNotiData = async () => {
    try {
      const notiResponse = await getNotifications();
      console.log("알림 목록 불러오기 성공", notiResponse);
      setNotifications(notiResponse.data);
    } catch (error) {
      console.error("알림 목록 불러오기 실패:", error);
    }
  };

  // 모든 룸메이트 요청을 가져오는 함수
  const fetchRoommateRequestData = async () => {
    try {
      const response = await getReceivedRoommateRequests();
      console.log("룸메이트 요청 목록 불러오기 성공", response);
      setReceivedRoommateRequests(response.data);
    } catch (error) {
      console.error("룸메이트 요청 목록 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotiData();
      fetchRoommateRequestData();
    }
  }, [isLoggedIn]);

  useSetHeader({
    title: "알림",
    menuItems: [
      {
        label: "알림 수신 설정",
        onClick: () => {
          navigate("/notification-setting");
        },
      },
    ],
  });

  return (
    <NotificationPageWrapper>
      <ContentWrapper>
        {receivedRoommateRequests.length > 0 &&
          receivedRoommateRequests.map((receivedRoommateRequest) => (
            <NotiItem
              key={receivedRoommateRequest.matchingId}
              receivedRoommateRequest={receivedRoommateRequest}
              handleRoommateRequest={handleRoommateRequest}
            />
          ))}
        {notifications.length > 0 ? (
          notifications.map((noti) => (
            <NotiItem key={noti.id} notidata={noti} />
          ))
        ) : (
          <EmptyMessage>알림이 없습니다.</EmptyMessage>
        )}
      </ContentWrapper>
      <BottomBar />
    </NotificationPageWrapper>
  );
};

export default NotificationPage;

// Styled-components (기존과 동일)
const NotificationPageWrapper = styled.div`
  //padding: 70px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow-y: auto;
`;

const ContentWrapper = styled.div`
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
