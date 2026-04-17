import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { AxiosError } from "axios";
import { RefreshCcw, Send } from "lucide-react";
import NotiItem from "@/components/notification/NotiItem";
import {
  DirectNotificationPayload,
  Notification,
  NotificationPayload,
  NotificationType,
} from "@/types/notifications";
import { FcmStatsResponse, SendAllFcmPayload } from "@/types/fcm";
import {
  createNotification,
  createNotificationByStudentNumber,
} from "@/apis/notification";
import { getFcmStats, sendFcmToAllUsers } from "@/apis/fcm";
import { useSetHeader } from "@/hooks/useSetHeader";
import { NOTIFICATION_TYPE_OPTIONS } from "@/utils/notificationType";
import {
  AdminActionRow,
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminCardDescription,
  AdminCardEyebrow,
  AdminCardHeader,
  AdminCardTitle,
  AdminCardTitleGroup,
  AdminField,
  AdminInput,
  AdminLabel,
  AdminMiniStat,
  AdminMiniStatLabel,
  AdminMiniStatValue,
  AdminPage,
  AdminPageGrid,
  AdminShell,
  AdminStack,
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
    title: "전체 유저",
    description:
      "로그인 여부와 상관없이 앱을 설치한 전체 사용자에게 전송합니다.",
  },
  {
    value: DELIVERY_MODES.AUDIENCE_NOTIFICATION,
    title: "로그인 유저",
    description: "로그인된 사용자 중 선택한 알림 타입으로 전송합니다.",
  },
  {
    value: DELIVERY_MODES.INDIVIDUAL_DIRECT,
    title: "학번",
    description: "특정 학번 1명에게 알림을 전송합니다.",
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
  const [fcmStats, setFcmStats] = useState<FcmStatsResponse | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [lastStatsFetchedAt, setLastStatsFetchedAt] = useState<string | null>(
    null,
  );

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
    title: title.trim() || "알림 제목을 입력하면 여기에 표시됩니다.",
    body:
      body.trim() ||
      "본문을 입력하면 실제 알림 페이지에서 보이는 형태로 이 영역에 표시됩니다.",
    notificationType: previewNotificationType,
    createdDate: new Date().toISOString(),
    read: false,
  };

  useSetHeader({ title: "푸시 알림 전송" });

  const loadFcmStats = useCallback(async () => {
    try {
      setIsStatsLoading(true);
      setStatsError(null);

      const response = await getFcmStats();
      setFcmStats(response.data);
      setLastStatsFetchedAt(new Date().toISOString());
    } catch (error) {
      console.error("FCM 통계 조회 실패:", error);
      setStatsError("FCM 발송 통계를 불러오지 못했습니다.");
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFcmStats();
  }, [loadFcmStats]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      alert("제목과 내용을 모두 입력해 주세요.");
      return;
    }

    if (requiresStudentNumber && !studentNumber.trim()) {
      alert("개인 전송을 선택한 경우 학번이 필요합니다.");
      return;
    }

    if (
      !window.confirm(`${currentDeliveryOption.title} 방식으로 전송할까요?`)
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

      await loadFcmStats();
      alert(
        "푸시 알림을 전송했습니다. 하단 FCM 통계가 최신 값으로 갱신되었습니다.",
      );
      resetForm();
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("푸시 알림 전송 실패:", axiosError);
      alert("푸시 알림 전송 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setBody("");
    setDeliveryMode(DELIVERY_MODES.AUDIENCE_NOTIFICATION);
    setStudentNumber("");
    setNotificationType(DEFAULT_NOTIFICATION_TYPE);
  };

  return (
    <AdminShell>
      <AdminPage>
        <AdminPageGrid $desktopColumns="minmax(0, 1.1fr) minmax(320px, 0.9fr)">
          <AdminStack>
            <AdminCard>
              <AdminCardHeader>
                <AdminCardTitleGroup>
                  <AdminCardEyebrow>Delivery Setup</AdminCardEyebrow>
                  <AdminCardTitle>푸시 알림 전송</AdminCardTitle>
                  <AdminCardDescription>
                    유니돔 앱을 설치한 유저에게 푸시알림을 보낼 수 있습니다.
                  </AdminCardDescription>
                </AdminCardTitleGroup>
              </AdminCardHeader>

              <FormContainer onSubmit={handleSubmit}>
                <AdminField>
                  <AdminLabel htmlFor="delivery-mode">발송 방식</AdminLabel>
                  <SelectInput
                    id="delivery-mode"
                    value={deliveryMode}
                    onChange={(e) =>
                      setDeliveryMode(e.target.value as DeliveryMode)
                    }
                  >
                    {DELIVERY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.title}
                      </option>
                    ))}
                  </SelectInput>
                  <AdminSubtleText>
                    {currentDeliveryOption.description}
                  </AdminSubtleText>
                </AdminField>

                {requiresStudentNumber && (
                  <AdminField>
                    <AdminLabel htmlFor="student-number">학번</AdminLabel>
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

                {usesStoredNotification && (
                  <AdminField>
                    <AdminLabel htmlFor="notification-type">
                      알림 타입
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

                <AdminField>
                  <AdminLabel htmlFor="notification-title">제목</AdminLabel>
                  <AdminInput
                    id="notification-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                  <FieldLengthHint>현재 {title.length}자</FieldLengthHint>
                </AdminField>

                <AdminField>
                  <AdminLabel htmlFor="notification-body">내용</AdminLabel>
                  <AdminTextarea
                    id="notification-body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={8}
                    required
                  />
                  <FieldLengthHint>현재 {body.length}자</FieldLengthHint>
                </AdminField>

                <AdminActionRow>
                  <AdminButton type="submit" disabled={isSubmitDisabled}>
                    <Send size={16} />
                    {isSubmitting ? "전송 중..." : "푸시 알림 전송"}
                  </AdminButton>
                  <AdminButton
                    type="button"
                    $tone="secondary"
                    onClick={resetForm}
                    disabled={isSubmitting}
                  >
                    입력 초기화
                  </AdminButton>
                </AdminActionRow>
              </FormContainer>
            </AdminCard>
          </AdminStack>

          <AdminStack>
            <AdminCard>
              <AdminCardHeader>
                <AdminCardTitleGroup>
                  <AdminCardEyebrow>FCM Stats</AdminCardEyebrow>
                  <AdminCardTitle>오늘 FCM 전송 현황</AdminCardTitle>
                  <AdminCardDescription>
                    오늘 날짜 기준 성공/실패 건수를 보여줍니다. 전송 성공 후
                    자동 갱신되고, 필요하면 수동으로 다시 불러올 수 있습니다.
                  </AdminCardDescription>
                </AdminCardTitleGroup>
                <AdminButton
                  type="button"
                  $tone="secondary"
                  onClick={() => void loadFcmStats()}
                  disabled={isStatsLoading}
                >
                  <RefreshCcw size={16} />
                  {isStatsLoading ? "갱신 중..." : "통계 새로고침"}
                </AdminButton>
              </AdminCardHeader>

              <StatsHeaderRow>
                <AdminBadge $tone={statsError ? "red" : "blue"}>
                  {fcmStats?.date || "당일 기준"}
                </AdminBadge>
                <StatsMetaText>
                  최근 갱신: {formatDateTime(lastStatsFetchedAt)}
                </StatsMetaText>
              </StatsHeaderRow>

              <StatsGrid>
                <AdminMiniStat>
                  <AdminMiniStatLabel>전송 성공</AdminMiniStatLabel>
                  <AdminMiniStatValue>
                    {fcmStats ? fcmStats.successCount.toLocaleString() : "-"}
                  </AdminMiniStatValue>
                </AdminMiniStat>
                <AdminMiniStat>
                  <AdminMiniStatLabel>전송 실패</AdminMiniStatLabel>
                  <AdminMiniStatValue>
                    {fcmStats ? fcmStats.failCount.toLocaleString() : "-"}
                  </AdminMiniStatValue>
                </AdminMiniStat>
              </StatsGrid>

              {statsError ? (
                <StatsFeedback $tone="error">{statsError}</StatsFeedback>
              ) : (
                <StatsFeedback>
                  현재 화면에서 어떤 방식으로 전송하든, 전송 직후 이 통계를
                  새로고침하여 성공/실패 건수를 바로 확인할 수 있습니다.
                </StatsFeedback>
              )}
            </AdminCard>

            <AdminCard $sticky>
              <AdminCardHeader>
                <AdminCardTitleGroup>
                  <AdminCardEyebrow>Preview</AdminCardEyebrow>
                  <AdminCardTitle>발송 미리보기</AdminCardTitle>
                  <AdminCardDescription>
                    실제 알림 페이지에서 보이는 카드 형태로 확인합니다.
                  </AdminCardDescription>
                </AdminCardTitleGroup>
              </AdminCardHeader>

              <NotificationPreviewFrame>
                <NotificationPreviewList>
                  <NotificationPreviewItem>
                    <NotiItem notidata={previewNotification} />
                  </NotificationPreviewItem>
                </NotificationPreviewList>
              </NotificationPreviewFrame>
            </AdminCard>
          </AdminStack>
        </AdminPageGrid>
      </AdminPage>
    </AdminShell>
  );
};

export default CreateNotificationPage;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FieldLengthHint = styled(AdminSubtleText)`
  width: 100%;
  text-align: right;
  font-size: 0.78rem;
`;

const SelectInput = styled(AdminInput).attrs({ as: "select" })`
  appearance: none;
  padding-right: 44px;
  background-image:
    linear-gradient(45deg, transparent 50%, #64748b 50%),
    linear-gradient(135deg, #64748b 50%, transparent 50%);
  background-position:
    calc(100% - 20px) calc(50% - 3px),
    calc(100% - 14px) calc(50% - 3px);
  background-size: 6px 6px;
  background-repeat: no-repeat;
  cursor: pointer;
`;

const StatsHeaderRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const StatsMetaText = styled(AdminSubtleText)`
  font-size: 0.84rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
`;

const StatsFeedback = styled(AdminSubtleText)<{ $tone?: "default" | "error" }>`
  padding: 14px 16px;
  border-radius: 18px;
  background: ${({ $tone }) =>
    $tone === "error"
      ? "#fff1f2"
      : "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)"};
  border: 1px solid
    ${({ $tone }) => ($tone === "error" ? "#fecdd3" : "#dbeafe")};
  color: ${({ $tone }) => ($tone === "error" ? "#be123c" : "#475569")};
`;

const NotificationPreviewFrame = styled.div`
  border-radius: 24px;
  border: 1px solid #dbeafe;
  background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%);
  overflow: hidden;
`;

const NotificationPreviewList = styled.div`
  display: flex;
  flex-direction: column;
`;

const NotificationPreviewItem = styled.div`
  pointer-events: none;
`;
