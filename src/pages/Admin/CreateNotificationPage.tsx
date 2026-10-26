import React, { useState } from "react";
import styled from "styled-components";
import { AxiosError } from "axios";
import NotiItem from "@/components/notification/NotiItem";
import {
  DirectNotificationPayload,
  Notification,
  NotificationPayload,
  NotificationType,
} from "@/types/notifications";
import { SendAllFcmPayload } from "@/types/fcm";
import {
  createNotification,
  createNotificationByStudentNumber,
} from "@/apis/notification";
import { sendFcmToAllUsers } from "@/apis/fcm";
import { useFcmStatsQuery } from "@/queries/admin";
import { useSetHeader } from "@/hooks/useSetHeader";
import { useCountUp } from "@/hooks/useCountUp";
import { NOTIFICATION_TYPE_OPTIONS } from "@/utils/notificationType";
import {
  AdminButton,
  AdminCard,
  AdminCardDescription,
  AdminCardHeader,
  AdminCardTitle,
  AdminCardTitleGroup,
  AdminField,
  AdminInput,
  AdminLabel,
  AdminPage,
  AdminShell,
  AdminSubtleText,
  AdminTextarea,
} from "@/pages/Admin/adminPageStyles";

const DELIVERY_MODES = {
  AUDIENCE_NOTIFICATION: "AUDIENCE_NOTIFICATION",
  INDIVIDUAL_DIRECT: "INDIVIDUAL_DIRECT",
  ALL_USERS_FCM: "ALL_USERS_FCM",
} as const;

type DeliveryMode = (typeof DELIVERY_MODES)[keyof typeof DELIVERY_MODES];

const DELIVERY_OPTIONS: Array<{
  value: DeliveryMode;
  title: string;
  description: string;
}> = [
  {
    value: DELIVERY_MODES.ALL_USERS_FCM,
    title: "전체 유저 (FCM)",
    description: "앱을 설치한 전체 사용자 기기로 즉시 푸시 알림을 발송합니다.",
  },
  {
    value: DELIVERY_MODES.AUDIENCE_NOTIFICATION,
    title: "로그인 유저",
    description: "로그인 사용자 중 선택한 카테고리 알림 수신 유저에게 발송합니다.",
  },
  {
    value: DELIVERY_MODES.INDIVIDUAL_DIRECT,
    title: "학번 지정 발송",
    description: "특정 학번 1명의 사용자에게만 직접 알림을 발송합니다.",
  },
];

const DEFAULT_NOTIFICATION_TYPE: NotificationType = "UNI_DORM";

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "아직 갱신 전";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
};

const CreateNotificationPage = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>(
    DELIVERY_MODES.ALL_USERS_FCM,
  );
  const [studentNumber, setStudentNumber] = useState("");
  const [notificationType, setNotificationType] = useState<NotificationType>(
    DEFAULT_NOTIFICATION_TYPE,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: fcmStats,
    isLoading: isStatsLoading,
    isError: isStatsError,
    dataUpdatedAt,
    refetch: refetchFcmStats,
  } = useFcmStatsQuery();

  const lastStatsFetchedAt = dataUpdatedAt
    ? new Date(dataUpdatedAt).toISOString()
    : null;
  const statsError = isStatsError
    ? "FCM 발송 통계를 불러오지 못했습니다."
    : null;

  const animatedSuccess = useCountUp(fcmStats?.successCount ?? 0);
  const animatedFail = useCountUp(fcmStats?.failCount ?? 0);

  const currentDeliveryOption =
    DELIVERY_OPTIONS.find((option) => option.value === deliveryMode) ??
    DELIVERY_OPTIONS[0];
  const currentNotificationType =
    NOTIFICATION_TYPE_OPTIONS.find(
      (option) => option.value === notificationType,
    ) ?? NOTIFICATION_TYPE_OPTIONS[0];

  const isFcmBroadcastMode = deliveryMode === DELIVERY_MODES.ALL_USERS_FCM;
  const requiresStudentNumber =
    deliveryMode === DELIVERY_MODES.INDIVIDUAL_DIRECT;
  const usesStoredNotification = !isFcmBroadcastMode;
  const previewNotificationType: NotificationType = isFcmBroadcastMode
    ? "UNI_DORM"
    : notificationType;

  const isSubmitDisabled =
    !title.trim() ||
    !body.trim() ||
    (requiresStudentNumber && !studentNumber.trim()) ||
    isSubmitting;

  const previewNotification: Notification = {
    id: 0,
    apiType: "ANNOUNCEMENT",
    boardId: 0,
    title: title.trim() || "알림 제목을 입력하면 여기에 실시간으로 표시돼요.",
    body:
      body.trim() ||
      "본문을 작성하면 실제 사용자의 알림함 카드 형태로 실시간 반영됩니다.",
    notificationType: previewNotificationType,
    createdDate: new Date().toISOString(),
    read: false,
  };

  useSetHeader({ title: "푸시 알림 전송" });

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!title.trim() || !body.trim()) {
      alert("제목과 내용을 모두 입력해 주세요.");
      return;
    }

    if (requiresStudentNumber && !studentNumber.trim()) {
      alert("개인 전송을 선택한 경우 학번이 필요합니다.");
      return;
    }

    if (
      !window.confirm(`${currentDeliveryOption.title} 방식으로 푸시 알림을 발송할까요?`)
    ) {
      return;
    }

    try {
      setIsSubmitting(true);

      if (deliveryMode === DELIVERY_MODES.INDIVIDUAL_DIRECT) {
        const directPayload: DirectNotificationPayload = {
          studentNumber: studentNumber.trim(),
          title: title.trim(),
          content: body.trim(),
          notificationType,
        };

        await createNotificationByStudentNumber(directPayload);
      } else if (deliveryMode === DELIVERY_MODES.ALL_USERS_FCM) {
        const payload: SendAllFcmPayload = {
          title: title.trim(),
          body: body.trim(),
        };

        await sendFcmToAllUsers(payload);
      } else {
        const payload: NotificationPayload = {
          title: title.trim(),
          body: body.trim(),
          notificationType,
        };

        await createNotification(payload);
      }

      await refetchFcmStats();
      alert("푸시 알림을 성공적으로 전송했습니다.");
      resetForm();
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("푸시 알림 전송 실패:", axiosError);
      alert("푸시 알림 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setBody("");
    setDeliveryMode(DELIVERY_MODES.ALL_USERS_FCM);
    setStudentNumber("");
    setNotificationType(DEFAULT_NOTIFICATION_TYPE);
  };

  return (
    <AdminShell>
      <AdminPage>
        <FormContainer onSubmit={handleSubmit}>
          {/* PC 2열 스플릿 뷰: 좌측 폼(7) + 우측 실시간 패널(5) */}
          <SplitLayout>
            <FormMainSection>
              <AdminCard>
                <AdminCardHeader>
                  <AdminCardTitleGroup>
                    <AdminCardTitle>푸시 알림 전송</AdminCardTitle>
                    <AdminCardDescription>
                      유니돔 앱을 설치한 사용자에게 푸시 알림을 발송할 수 있습니다.
                    </AdminCardDescription>
                  </AdminCardTitleGroup>
                </AdminCardHeader>

                <FormBody>
                  {/* 발송 대상 세그먼트 컨트롤러 */}
                  <AdminField>
                    <AdminLabel>발송 대상 선택</AdminLabel>
                    <SegmentGrid>
                      {DELIVERY_OPTIONS.map((option) => (
                        <SegmentButton
                          key={option.value}
                          type="button"
                          $selected={deliveryMode === option.value}
                          onClick={() => setDeliveryMode(option.value)}
                        >
                          {option.title}
                        </SegmentButton>
                      ))}
                    </SegmentGrid>
                    <AdminSubtleText>
                      {currentDeliveryOption.description}
                    </AdminSubtleText>
                  </AdminField>

                  {/* 특정 학번 입력 (개인 지정 발송일 때만) */}
                  {requiresStudentNumber && (
                    <AdminField>
                      <AdminLabel htmlFor="student-number">수신 대상 학번</AdminLabel>
                      <AdminInput
                        id="student-number"
                        type="text"
                        value={studentNumber}
                        onChange={(e) => setStudentNumber(e.target.value)}
                        placeholder="예: 20231234"
                        required
                      />
                      <AdminSubtleText>
                        입력한 학번 사용자 1명에게만 전송됩니다.
                      </AdminSubtleText>
                    </AdminField>
                  )}

                  {/* 알림 카테고리 (저장형 알림일 때만) */}
                  {usesStoredNotification && (
                    <AdminField>
                      <AdminLabel htmlFor="notification-type">
                        알림 카테고리
                      </AdminLabel>
                      <SelectInput
                        id="notification-type"
                        value={notificationType}
                        onChange={(e) =>
                          setNotificationType(e.target.value as NotificationType)
                        }
                      >
                        {NOTIFICATION_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.title}
                          </option>
                        ))}
                      </SelectInput>
                      <AdminSubtleText>
                        {currentNotificationType.description}
                      </AdminSubtleText>
                    </AdminField>
                  )}

                  {/* 제목 입력 */}
                  <AdminField>
                    <FieldHeaderRow>
                      <AdminLabel htmlFor="notification-title">알림 제목</AdminLabel>
                      <FieldLengthHint>{title.length}자</FieldLengthHint>
                    </FieldHeaderRow>
                    <AdminInput
                      id="notification-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="알림 제목을 간결하게 입력해 주세요"
                      required
                    />
                  </AdminField>

                  {/* 본문 입력 */}
                  <AdminField>
                    <FieldHeaderRow>
                      <AdminLabel htmlFor="notification-body">알림 내용</AdminLabel>
                      <FieldLengthHint>{body.length}자</FieldLengthHint>
                    </FieldHeaderRow>
                    <AdminTextarea
                      id="notification-body"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={6}
                      placeholder="수신자가 이해하기 쉬운 문장으로 본문을 작성해 주세요."
                      required
                    />
                  </AdminField>

                  {/* PC 전용 폼 내 액션 버튼 */}
                  <DesktopActionRow>
                    <AdminButton
                      type="submit"
                      disabled={isSubmitDisabled}
                      style={{ flex: 2 }}
                    >
                      {isSubmitting ? "알림을 발송하고 있어요..." : "푸시 알림 보내기"}
                    </AdminButton>
                    <AdminButton
                      type="button"
                      $tone="secondary"
                      onClick={resetForm}
                      disabled={isSubmitting}
                      style={{ flex: 1 }}
                    >
                      입력 초기화
                    </AdminButton>
                  </DesktopActionRow>
                </FormBody>
              </AdminCard>
            </FormMainSection>

            {/* PC 전용 우측 패널: 오늘 통계 & 실시간 알림함 미리보기 (Sticky) */}
            <LiveSidePanel>
              {/* 오늘 FCM 전송 현황 카드 */}
              <AdminCard>
                <AdminCardHeader>
                  <AdminCardTitleGroup>
                    <AdminCardTitle>오늘 전송 현황</AdminCardTitle>
                    <AdminCardDescription>
                      당일 기준 성공 및 실패 건수입니다.
                    </AdminCardDescription>
                  </AdminCardTitleGroup>
                  <RefreshButton
                    type="button"
                    onClick={() => void refetchFcmStats()}
                    disabled={isStatsLoading}
                  >
                    {isStatsLoading ? "갱신 중..." : "새로고침"}
                  </RefreshButton>
                </AdminCardHeader>

                <StatsTimeRow>
                  <span className="font-mono text-xs text-brand-primary font-bold">
                    {fcmStats?.date || "당일 기준"}
                  </span>
                  <span className="text-xs text-text-caption">
                    최근 갱신: {formatDateTime(lastStatsFetchedAt)}
                  </span>
                </StatsTimeRow>

                <StatsMiniGrid>
                  <StatMiniBox>
                    <StatMiniLabel>전송 성공</StatMiniLabel>
                    <StatMiniValue style={{ color: "#04b05c" }}>
                      {animatedSuccess.toLocaleString()}건
                    </StatMiniValue>
                  </StatMiniBox>
                  <StatMiniBox>
                    <StatMiniLabel>전송 실패</StatMiniLabel>
                    <StatMiniValue style={{ color: "#f04452" }}>
                      {animatedFail.toLocaleString()}건
                    </StatMiniValue>
                  </StatMiniBox>
                </StatsMiniGrid>

                {statsError && (
                  <StatsNoticeText>{statsError}</StatsNoticeText>
                )}
              </AdminCard>

              {/* 실시간 알림함 미리보기 카드 */}
              <AdminCard>
                <AdminCardHeader>
                  <AdminCardTitleGroup>
                    <AdminCardTitle>알림함 실시간 미리보기</AdminCardTitle>
                    <AdminCardDescription>
                      실제 사용자 기기의 알림함에 도착했을 때의 모습입니다.
                    </AdminCardDescription>
                  </AdminCardTitleGroup>
                </AdminCardHeader>

                <PreviewCardFrame>
                  <NotiItem notidata={previewNotification} />
                </PreviewCardFrame>
              </AdminCard>
            </LiveSidePanel>
          </SplitLayout>

          {/* 모바일 하단 고정 CTA */}
          <MobileCTAContainer>
            <MobilePrimaryButton
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitDisabled}
            >
              {isSubmitting ? "알림을 발송하고 있어요..." : "푸시 알림 보내기"}
            </MobilePrimaryButton>
          </MobileCTAContainer>
        </FormContainer>
      </AdminPage>
    </AdminShell>
  );
};

export default CreateNotificationPage;

const FormContainer = styled.form`
  width: 100%;
`;

const SplitLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 24px;
  align-items: start;

  @media (min-width: 1024px) {
    grid-template-columns: minmax(0, 1.18fr) minmax(340px, 0.82fr);
    gap: 32px;
  }
`;

const FormMainSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

const SegmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const SegmentButton = styled.button<{ $selected: boolean }>`
  height: 44px;
  padding: 0 12px;
  border-radius: 12px;
  font-size: 0.86rem;
  font-weight: 700;
  border: 1.5px solid ${({ $selected }) => ($selected ? "#3182f6" : "#e5e8eb")};
  background: ${({ $selected }) => ($selected ? "#e8f3ff" : "#ffffff")};
  color: ${({ $selected }) => ($selected ? "#3182f6" : "#4e5968")};
  cursor: pointer;
  transition: all 0.15s ease-out;

  &:hover {
    border-color: #3182f6;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const FieldHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FieldLengthHint = styled.span`
  font-size: 0.78rem;
  color: #8b95a1;
`;

const SelectInput = styled(AdminInput).attrs({ as: "select" })`
  cursor: pointer;
`;

const DesktopActionRow = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: flex;
    gap: 12px;
    margin-top: 8px;
  }
`;

const LiveSidePanel = styled.div`
  display: none;

  @media (min-width: 1024px) {
    display: flex;
    flex-direction: column;
    gap: 24px;
    position: sticky;
    top: 80px;
  }
`;

const RefreshButton = styled.button`
  font-size: 0.8rem;
  font-weight: 700;
  color: #3182f6;
  background: transparent;
  border: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }

  &:disabled {
    opacity: 0.5;
  }
`;

const StatsTimeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatsMiniGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`;

const StatMiniBox = styled.div`
  padding: 16px;
  border-radius: 14px;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatMiniLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #8b95a1;
`;

const StatMiniValue = styled.strong`
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
`;

const StatsNoticeText = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #f04452;
`;

const PreviewCardFrame = styled.div`
  border-radius: 16px;
  background: #f9fafb;
  border: 1px solid #e5e8eb;
  overflow: hidden;
  pointer-events: none;
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
  background: linear-gradient(to top, #ffffff 65%, rgba(255, 255, 255, 0));
  padding: 16px 20px calc(14px + env(safe-area-inset-bottom, 0px));

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobilePrimaryButton = styled.button`
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

  &:disabled {
    opacity: 0.45;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;
