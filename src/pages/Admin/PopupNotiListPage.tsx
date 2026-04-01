import { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  CalendarRange,
  Clock3,
  PencilLine,
  PlusCircle,
  Trash2,
} from "lucide-react";
import {
  deletePopupNotification,
  getAllPopupNotifications,
} from "@/apis/popup-notification";
import HomeNoticeBottomSheet from "@/components/modal/HomeNoticeBottomSheet";
import { useSetHeader } from "@/hooks/useSetHeader";
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminCardEyebrow,
  AdminCardHeader,
  AdminCardTitle,
  AdminCardTitleGroup,
  AdminEmptyDescription,
  AdminEmptyState,
  AdminEmptyTitle,
  AdminHero,
  AdminHeroMetricGrid,
  AdminMiniStat,
  AdminMiniStatLabel,
  AdminMiniStatValue,
  AdminPage,
  AdminPageGrid,
  AdminPreviewImage,
  AdminShell,
  AdminStack,
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
  const [notifications, setNotifications] = useState<PopupNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] =
    useState<PopupNotification | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const navigate = useNavigate();
  const today = getLocalDateInputValue();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getAllPopupNotifications();
        setNotifications(response.data);
      } catch (error) {
        console.error("팝업 공지 목록 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchNotifications();
  }, []);

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
      setNotifications((prev) => prev.filter((noti) => noti.id !== id));
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
        <AdminHero>
          <AdminHeroMetricGrid>
            <AdminMiniStat>
              <AdminMiniStatLabel>전체 팝업</AdminMiniStatLabel>
              <AdminMiniStatValue>{notifications.length}</AdminMiniStatValue>
            </AdminMiniStat>
            <AdminMiniStat>
              <AdminMiniStatLabel>노출 중</AdminMiniStatLabel>
              <AdminMiniStatValue>{activeCount}</AdminMiniStatValue>
            </AdminMiniStat>
            <AdminMiniStat>
              <AdminMiniStatLabel>예정 팝업</AdminMiniStatLabel>
              <AdminMiniStatValue>{scheduledCount}</AdminMiniStatValue>
            </AdminMiniStat>
            <AdminMiniStat>
              <AdminMiniStatLabel>종료됨</AdminMiniStatLabel>
              <AdminMiniStatValue>{endedCount}</AdminMiniStatValue>
            </AdminMiniStat>
          </AdminHeroMetricGrid>
        </AdminHero>

        <AdminPageGrid $desktopColumns="minmax(0, 1fr)">
          <AdminStack>
            <AdminCard>
              <AdminCardHeader>
                <AdminCardTitleGroup>
                  <AdminCardEyebrow>Popup Inventory</AdminCardEyebrow>
                  <AdminCardTitle>등록된 팝업 공지</AdminCardTitle>
                </AdminCardTitleGroup>

                <AdminButton type="button" onClick={handleCreateClick}>
                  <PlusCircle size={16} />새 팝업 등록
                </AdminButton>
              </AdminCardHeader>

              {notifications.length === 0 ? (
                <AdminEmptyState>
                  <AdminEmptyTitle>
                    등록된 팝업 공지가 없습니다.
                  </AdminEmptyTitle>
                  <AdminEmptyDescription>
                    홈 화면에 노출할 팝업 공지를 새로 등록해 보세요.
                  </AdminEmptyDescription>
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
                            {summarizeText(noti.content, 120)}
                          </PopupDescription>
                        </PopupHeader>

                        <PopupMetaGrid>
                          <PopupMetaCard>
                            <PopupMetaLabel>
                              <CalendarRange size={14} />
                              노출 기간
                            </PopupMetaLabel>
                            <PopupMetaValue>
                              {formatDateRangeLabel(
                                noti.startDate,
                                noti.deadline,
                              )}
                            </PopupMetaValue>
                          </PopupMetaCard>
                          <PopupMetaCard>
                            <PopupMetaLabel>
                              <Clock3 size={14} />
                              등록일
                            </PopupMetaLabel>
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
                                alt={`popup-image-${index + 1}`}
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
          </AdminStack>
        </AdminPageGrid>

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
                <PopupDetailActionButton
                  type="button"
                  $tone="secondary"
                  onClick={() => handleEditClick(selectedNotification.id)}
                >
                  <PencilLine size={16} />
                  수정하기
                </PopupDetailActionButton>
                <PopupDetailActionButton
                  type="button"
                  $tone="danger"
                  onClick={() => handleDeleteClick(selectedNotification.id)}
                >
                  <Trash2 size={16} />
                  삭제하기
                </PopupDetailActionButton>
              </PopupDetailActions>
            </PopupDetailContent>
          )}
        </HomeNoticeBottomSheet>
      </AdminPage>
    </AdminShell>
  );
};

export default PopupNotiListPage;

const LoadingMessage = styled.div`
  padding: 32px 12px;
  text-align: center;
  color: #64748b;
  font-size: 0.96rem;
`;

const PopupGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 18px;

  @media (min-width: 960px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const PopupCard = styled.button`
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  padding: 22px;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  box-shadow: 0 18px 32px -34px rgba(15, 23, 42, 0.28);
  cursor: pointer;
  text-align: left;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: #bfdbfe;
    box-shadow: 0 22px 36px -32px rgba(37, 99, 235, 0.24);
  }

  &:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }
`;

const PopupHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PopupBadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const PopupTitle = styled.h3`
  margin: 0;
  font-size: 1.08rem;
  font-weight: 800;
  line-height: 1.45;
  color: #0f172a;
`;

const PopupDescription = styled.p`
  margin: 0;
  min-height: 48px;
  font-size: 0.94rem;
  line-height: 1.7;
  color: #475569;
`;

const PopupMetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  /* 모바일 대응: 768px 이하에서 1열 배치 */
  @media (max-width: 768px) {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
`;

const PopupMetaCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
  border-radius: 18px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
`;

const PopupMetaLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
`;

const PopupMetaValue = styled.strong`
  font-size: 0.92rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.45;
`;

const ImageRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
`;

const PopupDetailContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const PopupDetailBadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const PopupDetailMetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
`;

const PopupDetailMetaCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
`;

const PopupDetailMetaLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
`;

const PopupDetailMetaValue = styled.strong`
  font-size: 0.92rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.45;
`;

const PopupDetailImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const PopupDetailActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const PopupDetailActionButton = styled(AdminButton)`
  flex: 1 1 160px;
  min-height: 44px;
`;
