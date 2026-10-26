import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { deletePopupNotification } from "@/apis/popup-notification";
import { useAdminPopupNotifications } from "@/queries/popupNotifications";
import HomeNoticeBottomSheet from "@/components/modal/HomeNoticeBottomSheet";
import { useSetHeader } from "@/hooks/useSetHeader";
import { useCountUp } from "@/hooks/useCountUp";
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminCardDescription,
  AdminCardHeader,
  AdminCardTitle,
  AdminCardTitleGroup,
  AdminEmptyDescription,
  AdminEmptyState,
  AdminEmptyTitle,
  AdminMiniStat,
  AdminMiniStatLabel,
  AdminMiniStatValue,
  AdminPage,
  AdminPreviewImage,
  AdminShell,
  formatDateLabel,
  formatDateRangeLabel,
  getLocalDateInputValue,
  summarizeText,
} from "@/pages/Admin/adminPageStyles";
import { PopupNotification } from "@/types/popup-notifications";

const getPopupStatus = (notification: PopupNotification, today: string) => {
  if (notification.deadline < today) {
    return { label: "종료됨", tone: "slate" as const, order: 2 };
  }

  if (notification.startDate > today) {
    return { label: "노출 예정", tone: "blue" as const, order: 1 };
  }

  return { label: "노출 중", tone: "green" as const, order: 0 };
};

const PopupNotiListPage = () => {
  const { data: notifications = [], isLoading: loading } =
    useAdminPopupNotifications();
  const [selectedNotification, setSelectedNotification] =
    useState<PopupNotification | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const navigate = useNavigate();
  const today = getLocalDateInputValue();

  const handleCreateClick = () => {
    navigate("create");
  };

  const handleCardClick = (notification: PopupNotification) => {
    setSelectedNotification(notification);
    setIsDetailOpen(true);
  };

  const handleEditClick = (popupNotificationId: number) => {
    setIsDetailOpen(false);
    navigate(`edit/${popupNotificationId}`);
  };

  const handleDeleteClick = async (id: number) => {
    if (!window.confirm("이 팝업 공지를 삭제할까요?")) {
      return;
    }

    try {
      await deletePopupNotification(id);
      alert("팝업 공지를 삭제했습니다.");
      setSelectedNotification((prev) => (prev?.id === id ? null : prev));
      setIsDetailOpen(false);
    } catch (error) {
      console.error("팝업 공지 삭제 실패:", error);
      alert("팝업 공지를 삭제하지 못했습니다.");
    }
  };

  const activeCount = notifications.filter(
    (notification) =>
      notification.startDate <= today && notification.deadline >= today,
  ).length;
  const scheduledCount = notifications.filter(
    (notification) => notification.startDate > today,
  ).length;
  const endedCount = notifications.filter(
    (notification) => notification.deadline < today,
  ).length;

  const animatedTotal = useCountUp(notifications.length);
  const animatedActive = useCountUp(activeCount);
  const animatedScheduled = useCountUp(scheduledCount);
  const animatedEnded = useCountUp(endedCount);

  const sortedNotifications = [...notifications].sort((a, b) => {
    const statusDiff =
      getPopupStatus(a, today).order - getPopupStatus(b, today).order;

    if (statusDiff !== 0) {
      return statusDiff;
    }

    return a.startDate.localeCompare(b.startDate);
  });

  useSetHeader({ title: "홈 화면 팝업 공지" });

  if (loading) {
    return (
      <AdminShell>
        <AdminPage>
          <AdminCard>
            <LoadingMessage>
              팝업 공지 목록을 불러오는 중입니다...
            </LoadingMessage>
          </AdminCard>
        </AdminPage>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <AdminPage>
        {/* 상단 4대 카운트업 지표 (Zero-Icon) */}
        <MetricsGrid>
          <AdminMiniStat>
            <AdminMiniStatLabel>전체 팝업</AdminMiniStatLabel>
            <AdminMiniStatValue>{animatedTotal}건</AdminMiniStatValue>
          </AdminMiniStat>
          <AdminMiniStat>
            <AdminMiniStatLabel>노출 중</AdminMiniStatLabel>
            <AdminMiniStatValue style={{ color: "#04b05c" }}>
              {animatedActive}건
            </AdminMiniStatValue>
          </AdminMiniStat>
          <AdminMiniStat>
            <AdminMiniStatLabel>예정 팝업</AdminMiniStatLabel>
            <AdminMiniStatValue style={{ color: "#3182f6" }}>
              {animatedScheduled}건
            </AdminMiniStatValue>
          </AdminMiniStat>
          <AdminMiniStat>
            <AdminMiniStatLabel>종료됨</AdminMiniStatLabel>
            <AdminMiniStatValue>{animatedEnded}건</AdminMiniStatValue>
          </AdminMiniStat>
        </MetricsGrid>

        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitleGroup>
              <AdminCardTitle>등록된 팝업 공지</AdminCardTitle>
              <AdminCardDescription>
                홈 화면 접속 시 표시되는 팝업 공지 목록입니다. 카드를 눌러 세부 내용을 확인하고 수정/삭제할 수 있습니다.
              </AdminCardDescription>
            </AdminCardTitleGroup>

            <DesktopCreateButton type="button" onClick={handleCreateClick}>
              새 팝업 등록하기
            </DesktopCreateButton>
          </AdminCardHeader>

          {notifications.length === 0 ? (
            <AdminEmptyState>
              <AdminEmptyTitle>등록된 팝업 공지가 없습니다.</AdminEmptyTitle>
              <AdminEmptyDescription>
                홈 화면에 노출할 팝업 공지를 새로 등록해 보세요.
              </AdminEmptyDescription>
              <AdminButton type="button" onClick={handleCreateClick}>
                첫 팝업 등록하기
              </AdminButton>
            </AdminEmptyState>
          ) : (
            <PopupGrid>
              {sortedNotifications.map((noti) => {
                const status = getPopupStatus(noti, today);

                return (
                  <PopupCard
                    key={noti.id}
                    type="button"
                    onClick={() => handleCardClick(noti)}
                  >
                    <PopupHeader>
                      <PopupBadgeRow>
                        <AdminBadge $tone={status.tone}>
                          {status.label}
                        </AdminBadge>
                        <AdminBadge $tone="blue">
                          {noti.notificationType}
                        </AdminBadge>
                      </PopupBadgeRow>
                      <PopupTitle>{noti.title}</PopupTitle>
                      <PopupDescription>
                        {summarizeText(noti.content, 110)}
                      </PopupDescription>
                    </PopupHeader>

                    <PopupMetaGrid>
                      <PopupMetaCard>
                        <PopupMetaLabel>노출 기간</PopupMetaLabel>
                        <PopupMetaValue>
                          {formatDateRangeLabel(noti.startDate, noti.deadline)}
                        </PopupMetaValue>
                      </PopupMetaCard>
                      <PopupMetaCard>
                        <PopupMetaLabel>등록일</PopupMetaLabel>
                        <PopupMetaValue>
                          {formatDateLabel(noti.createdDate)}
                        </PopupMetaValue>
                      </PopupMetaCard>
                    </PopupMetaGrid>

                    {noti.imagePath.length > 0 && (
                      <ImageRow>
                        {noti.imagePath.slice(0, 3).map((img, index) => (
                          <AdminPreviewImage
                            key={`${img}-${index}`}
                            src={img}
                            alt={`popup-thumbnail-${index + 1}`}
                          />
                        ))}
                      </ImageRow>
                    )}
                  </PopupCard>
                );
              })}
            </PopupGrid>
          )}
        </AdminCard>

        {/* 상세 확인 바텀시트 */}
        <HomeNoticeBottomSheet
          id={`admin-popup-notice-${selectedNotification?.id ?? "detail"}`}
          isOpen={isDetailOpen}
          setIsOpen={setIsDetailOpen}
          title={selectedNotification?.title}
          text={selectedNotification?.content}
          links={[]}
          showHideAction={false}
          useStorage={false}
          closeButtonText="닫기"
        >
          {selectedNotification && (
            <PopupDetailContent>
              <PopupDetailBadgeRow>
                <AdminBadge
                  $tone={getPopupStatus(selectedNotification, today).tone}
                >
                  {getPopupStatus(selectedNotification, today).label}
                </AdminBadge>
                <AdminBadge $tone="blue">
                  {selectedNotification.notificationType}
                </AdminBadge>
              </PopupDetailBadgeRow>

              <PopupDetailMetaGrid>
                <PopupDetailMetaCard>
                  <PopupDetailMetaLabel>노출 기간</PopupDetailMetaLabel>
                  <PopupDetailMetaValue>
                    {formatDateRangeLabel(
                      selectedNotification.startDate,
                      selectedNotification.deadline,
                    )}
                  </PopupDetailMetaValue>
                </PopupDetailMetaCard>
                <PopupDetailMetaCard>
                  <PopupDetailMetaLabel>등록일</PopupDetailMetaLabel>
                  <PopupDetailMetaValue>
                    {formatDateLabel(selectedNotification.createdDate)}
                  </PopupDetailMetaValue>
                </PopupDetailMetaCard>
              </PopupDetailMetaGrid>

              {selectedNotification.imagePath.length > 0 && (
                <PopupDetailImageGrid>
                  {selectedNotification.imagePath.map((img, index) => (
                    <AdminPreviewImage
                      key={`${img}-${index}`}
                      src={img}
                      alt={`popup-detail-image-${index + 1}`}
                    />
                  ))}
                </PopupDetailImageGrid>
              )}

              <PopupDetailActions>
                <AdminButton
                  type="button"
                  $tone="secondary"
                  onClick={() => handleEditClick(selectedNotification.id)}
                  style={{ flex: 1 }}
                >
                  수정하기
                </AdminButton>
                <AdminButton
                  type="button"
                  $tone="danger"
                  onClick={() => handleDeleteClick(selectedNotification.id)}
                  style={{ flex: 1 }}
                >
                  삭제하기
                </AdminButton>
              </PopupDetailActions>
            </PopupDetailContent>
          )}
        </HomeNoticeBottomSheet>

        {/* 모바일 하단 고정 CTA */}
        <MobileCTAContainer>
          <MobileCTAButton type="button" onClick={handleCreateClick}>
            새 팝업 공지 등록하기
          </MobileCTAButton>
        </MobileCTAContainer>
      </AdminPage>
    </AdminShell>
  );
};

export default PopupNotiListPage;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }
`;

const DesktopCreateButton = styled(AdminButton)`
  display: none;

  @media (min-width: 768px) {
    display: inline-flex;
  }
`;

const LoadingMessage = styled.div`
  padding: 40px 16px;
  text-align: center;
  color: #8b95a1;
  font-size: 0.95rem;
`;

const PopupGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;

  @media (min-width: 960px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }
`;

const PopupCard = styled.button`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  padding: 22px;
  border-radius: 20px;
  border: 1px solid #e5e8eb;
  background: #ffffff;
  cursor: pointer;
  text-align: left;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-2px);
    border-color: #3182f6;
    box-shadow: 0 8px 24px -10px rgba(49, 130, 246, 0.15);
  }

  &:active {
    transform: scale(0.99);
  }
`;

const PopupHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PopupBadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const PopupTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.35;
  color: #191f28;
`;

const PopupDescription = styled.p`
  margin: 0;
  min-height: 42px;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #6b7684;
`;

const PopupMetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const PopupMetaCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 14px;
  border-radius: 12px;
  background: #f9fafb;
`;

const PopupMetaLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #8b95a1;
`;

const PopupMetaValue = styled.strong`
  font-size: 0.88rem;
  font-weight: 700;
  color: #333d4b;
`;

const ImageRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
`;

const PopupDetailContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PopupDetailBadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const PopupDetailMetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`;

const PopupDetailMetaCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #f9fafb;
`;

const PopupDetailMetaLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #8b95a1;
`;

const PopupDetailMetaValue = styled.strong`
  font-size: 0.88rem;
  font-weight: 700;
  color: #191f28;
`;

const PopupDetailImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const PopupDetailActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 8px;
`;

const MobileCTAContainer = styled.div`
  display: block;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 30;
  max-width: 600px;
  margin: 0 auto;
  pointer-events: none;
  background: linear-gradient(to top, #ffffff 60%, rgba(255, 255, 255, 0));
  padding: 16px 20px calc(14px + env(safe-area-inset-bottom, 0px));

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileCTAButton = styled.button`
  pointer-events: auto;
  width: 100%;
  height: 52px;
  border-radius: 16px;
  background: #3182f6;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 800;
  border: none;
  box-shadow: 0 4px 16px rgba(49, 130, 246, 0.28);
  cursor: pointer;
  transition: all 0.15s ease-out;

  &:active {
    transform: scale(0.98);
  }
`;
