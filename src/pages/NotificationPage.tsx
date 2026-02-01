import styled from "styled-components";
import NotiItem from "../components/notification/NotiItem.tsx";
import { useEffect, useState } from "react";
import { getNotifications } from "@/apis/notification";
import useUserStore from "../stores/useUserStore.ts";
import { Notification } from "@/types/notifications";
import { useNavigate } from "react-router-dom";
import {
  acceptRoommateMatching,
  rejectRoommateMatching,
} from "@/apis/roommate";
import axios from "axios";
import { useSetHeader } from "@/hooks/useSetHeader";
import Modal from "@/components/modal/Modal";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [selectedMatching, setSelectedMatching] = useState<{
    id: number;
    message: string;
  } | null>(null);

  // 모달 오픈 핸들러
  const handleRoommateRequestClick = (matchingId: number, message: string) => {
    setSelectedMatching({ id: matchingId, message });
    setIsMatchModalOpen(true);
  };

  const handleAccept = async () => {
    if (!window.confirm("정말 매칭을 수락할까요?")) {
      return;
    }

    if (!selectedMatching) return;
    try {
      await acceptRoommateMatching(selectedMatching.id);
      alert("매칭 요청이 수락되었습니다.");
      alert(
        "UNI Dorm에서의 룸메이트 매칭은 실제 기숙사 룸메이트 지정과 무관하며, 룸메이트와의 편리한 생활을 위한 서비스를 제공하기 위함입니다.\n반드시 룸메이트 사전 지정 기간에 인천대학교 포털에서 신청해주세요!!!!",
      );
      fetchNotiData();
    } catch (e: any) {
      handleError(e);
    } finally {
      setIsMatchModalOpen(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm("정말 매칭을 거절할까요?")) {
      return;
    }
    if (!selectedMatching) return;
    try {
      await rejectRoommateMatching(selectedMatching.id);
      alert("매칭 요청이 거절되었습니다.");
      fetchNotiData();
    } catch (e: any) {
      handleError(e);
    } finally {
      setIsMatchModalOpen(false);
    }
  };

  const handleError = (e: any) => {
    if (axios.isAxiosError(e) && e.response?.status === 409) {
      alert("이미 처리된 매칭 요청입니다.");
      fetchNotiData();
      return;
    }
    alert("처리 중 오류가 발생했습니다.");
  };

  const fetchNotiData = async () => {
    try {
      const notiResponse = await getNotifications();
      setNotifications(notiResponse.data);
    } catch (error) {
      console.error("알림 목록 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchNotiData();
  }, [isLoggedIn]);

  useSetHeader({
    title: "알림",
    menuItems: [
      {
        label: "알림 수신 설정",
        onClick: () => navigate("/notification-setting"),
      },
    ],
  });

  return (
    <NotificationPageWrapper>
      <ContentWrapper>
        {notifications.length > 0 ? (
          notifications.map((noti) => (
            <NotiItem
              key={noti.id}
              notidata={noti}
              // 통합된 핸들러 전달
              onMatchRequestClick={handleRoommateRequestClick}
            />
          ))
        ) : (
          <EmptyMessage>알림이 없습니다.</EmptyMessage>
        )}
      </ContentWrapper>

      <Modal
        show={isMatchModalOpen}
        onClose={() => setIsMatchModalOpen(false)}
        title={"룸메이트 매칭 요청"}
        headerImageId={1}
        content={selectedMatching ? selectedMatching.message : ""}
        closeButtonText="수락"
        onCloseClick={handleAccept}
        secondaryButtonText="거절"
        onSecondaryButtonClick={handleReject}
      />
    </NotificationPageWrapper>
  );
};

export default NotificationPage;

const NotificationPageWrapper = styled.div`
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
