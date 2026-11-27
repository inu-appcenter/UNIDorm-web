import styled from "styled-components";
import { useTranslation } from "react-i18next";
import NotiItem from "../components/notification/NotiItem.tsx";
import { useEffect, useRef, useState } from "react";
import { useNotificationScroll } from "@/queries/notifications";
import useUserStore from "../stores/useUserStore.ts";
import { flushAllBroadcastSync } from "@/stores/middleware/broadcastSync";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { roommateKeys } from "@/queries/roommates";
import {
  acceptRoommateMatching,
  rejectRoommateMatching,
} from "@/apis/roommate";
import { isAxiosError } from "axios";
import { useSetHeader } from "@/hooks/useSetHeader";
import Modal from "@/components/modal/Modal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { PATHS } from "@/constants/paths";

const PAGE_SIZE = 20;

const NotificationPage = () => {
  const { t } = useTranslation(["home", "common"]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { tokenInfo, userInfo, clearUnreadNotifications } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);
  const observerTarget = useRef<HTMLDivElement>(null);

  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [selectedMatching, setSelectedMatching] = useState<{
    id: number;
    message: string;
  } | null>(null);

  // 알림 데이터 무한스크롤 조회
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isLoading } =
    useNotificationScroll(PAGE_SIZE, { enabled: isLoggedIn });

  // 알림 페이지 진입 및 이탈 시 미읽음 알림 상태 해제 및 브로드캐스트 동기화
  useEffect(() => {
    clearUnreadNotifications();
    flushAllBroadcastSync();

    return () => {
      clearUnreadNotifications();
      flushAllBroadcastSync();
    };
  }, [clearUnreadNotifications]);

  // 알림 목록 수신 시에도 미읽음 상태가 남아있다면 해제
  useEffect(() => {
    if (userInfo.hasUnreadNotifications) {
      clearUnreadNotifications();
      flushAllBroadcastSync();
    }
  }, [userInfo.hasUnreadNotifications, clearUnreadNotifications]);

  // 데이터 평탄화 처리
  const notifications = data?.pages.flatMap((page) => page.data) || [];

  // 관찰자 설정 (하단 도달 시 다음 페이지 호출)
  useEffect(() => {
    if (!observerTarget.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 },
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  // 매칭 요청 클릭 핸들러
  const handleRoommateRequestClick = (matchingId: number, message: string) => {
    setSelectedMatching({ id: matchingId, message });
    setIsMatchModalOpen(true);
  };

  // 수락 핸들러
  const handleAccept = async () => {
    if (!window.confirm(t("home:notification.acceptConfirm"))) {
      return;
    }

    if (!selectedMatching) return;
    try {
      await acceptRoommateMatching(selectedMatching.id);
      queryClient.invalidateQueries({ queryKey: roommateKeys.myInfo() });
      alert(t("home:notification.acceptSuccess"));
      alert(t("home:notification.acceptPortalNotice"));
      refetch();
    } catch (e: any) {
      handleError(e);
    } finally {
      setIsMatchModalOpen(false);
    }
  };

  // 거절 핸들러
  const handleReject = async () => {
    if (!window.confirm(t("home:notification.rejectConfirm"))) {
      return;
    }
    if (!selectedMatching) return;
    try {
      await rejectRoommateMatching(selectedMatching.id);
      alert(t("home:notification.rejectSuccess"));
      refetch();
    } catch (e: any) {
      handleError(e);
    } finally {
      setIsMatchModalOpen(false);
    }
  };

  // 에러 처리 핸들러
  const handleError = (e: any) => {
    if (isAxiosError(e) && e.response?.status === 409) {
      alert(t("home:notification.alreadyProcessed"));
      refetch();
      return;
    }
    alert(t("common:states.error"));
  };

  // 헤더 설정
  useSetHeader({
    title: t("home:notification.title"),
    menuItems: [
      {
        label: t("home:notification.settingsMenu"),
        onClick: () => navigate("/notification-setting"),
      },
    ],
  });

  if (isLoading && !isFetchingNextPage) {
    return <LoadingSpinner message={t("home:notification.loading")} />;
  }

  return (
    <NotificationPageWrapper>
      <ContentWrapper>
        {notifications.length > 0 ? (
          <>
            {notifications.map((noti) => (
              <NotiItem
                key={noti.id}
                notidata={noti}
                onMatchRequestClick={handleRoommateRequestClick}
              />
            ))}
            {/* 무한스크롤 트리거 지점 */}
            <div ref={observerTarget} style={{ height: "10px" }} />
            {isFetchingNextPage && <LoadingSpinner message="" />}
          </>
        ) : isLoggedIn ? (
          <EmptyMessage>{t("home:notification.empty")}</EmptyMessage>
        ) : (
          <EmptyMessage>
            {t("home:notification.loginPrompt")}
            <br />
            <br />
            <LoginLink to={PATHS.LOGIN}>{t("home:notification.loginAction")}</LoginLink>
          </EmptyMessage>
        )}
      </ContentWrapper>

      <Modal
        show={isMatchModalOpen}
        onClose={() => setIsMatchModalOpen(false)}
        title={t("home:notification.matchModalTitle")}
        headerImageId={1}
        content={selectedMatching ? selectedMatching.message : ""}
        closeButtonText={t("home:notification.accept")}
        onCloseClick={handleAccept}
        secondaryButtonText={t("home:notification.reject")}
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
  color: #777;
  font-size: 15px;
  line-height: 1.6;
`;

const LoginLink = styled(Link)`
  color: #0070f3;
  cursor: pointer;
  text-decoration: underline;
`;
