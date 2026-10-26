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
import { NOTIFICATION_TYPE_OPTIONS } from "@/utils/notificationType";

const DELIVERY_MODES = {
  ALL_USERS_FCM: "ALL_USERS_FCM",
  AUDIENCE_NOTIFICATION: "AUDIENCE_NOTIFICATION",
  INDIVIDUAL_DIRECT: "INDIVIDUAL_DIRECT",
} as const;

type DeliveryMode = (typeof DELIVERY_MODES)[keyof typeof DELIVERY_MODES];

const DELIVERY_OPTIONS: Array<{
  value: DeliveryMode;
  title: string;
  description: string;
}> = [
  {
    value: DELIVERY_MODES.ALL_USERS_FCM,
    title: "전체 사용자",
    description: "앱을 설치한 모든 사용자에게 알림을 보냅니다.",
  },
  {
    value: DELIVERY_MODES.AUDIENCE_NOTIFICATION,
    title: "로그인 사용자",
    description: "로그인 사용자 중 카테고리 알림을 켜둔 사용자에게 발송합니다.",
  },
  {
    value: DELIVERY_MODES.INDIVIDUAL_DIRECT,
    title: "학번 지정 발송",
    description: "특정 학번을 가진 1명의 사용자에게만 직접 알림을 발송합니다.",
  },
];

const DEFAULT_NOTIFICATION_TYPE: NotificationType = "UNI_DORM";

export default function CreateNotificationPage() {
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

  useSetHeader({ title: "푸시 알림 전송" });

  const {
    data: fcmStats,
    isLoading: isStatsLoading,
    refetch: refetchFcmStats,
  } = useFcmStatsQuery();

  const isFcmBroadcastMode = deliveryMode === DELIVERY_MODES.ALL_USERS_FCM;
  const requiresStudentNumber = deliveryMode === DELIVERY_MODES.INDIVIDUAL_DIRECT;
  const usesStoredNotification = !isFcmBroadcastMode;

  const previewNotification: Notification = {
    id: 0,
    apiType: "ANNOUNCEMENT",
    boardId: 0,
    title: title.trim() || "알림 제목을 입력해 주세요",
    body: body.trim() || "작성한 내용이 사용자 알림함에 표시되는 형태입니다.",
    notificationType: isFcmBroadcastMode ? "UNI_DORM" : notificationType,
    createdDate: new Date().toISOString(),
    read: false,
  };

  const isSubmitDisabled =
    !title.trim() ||
    !body.trim() ||
    (requiresStudentNumber && !studentNumber.trim()) ||
    isSubmitting;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!title.trim() || !body.trim()) {
      alert("알림 제목과 내용을 모두 입력해 주세요.");
      return;
    }
    if (requiresStudentNumber && !studentNumber.trim()) {
      alert("수신 대상 학번을 입력해 주세요.");
      return;
    }

    const currentOption = DELIVERY_OPTIONS.find((o) => o.value === deliveryMode);
    if (!window.confirm(`${currentOption?.title} 대상으로 푸시 알림을 발송할까요?`)) {
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
      alert("푸시 알림을 성공적으로 발송했습니다.");
      setTitle("");
      setBody("");
      setStudentNumber("");
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("푸시 알림 전송 실패:", axiosError);
      alert("푸시 알림 전송에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageRoot>
      <LayoutGrid onSubmit={handleSubmit}>
        {/* 좌측 메인 작성 영역 */}
        <FormColumn>
          <FormCard>
            {/* 1. 발송 대상 선택 칩 */}
            <FieldGroup>
              <FieldLabel>발송 대상 선택</FieldLabel>
              <ModeSegmentGrid>
                {DELIVERY_OPTIONS.map((opt) => (
                  <ModeSegmentBtn
                    key={opt.value}
                    type="button"
                    $active={deliveryMode === opt.value}
                    onClick={() => setDeliveryMode(opt.value)}
                  >
                    <ModeTitle>{opt.title}</ModeTitle>
                    <ModeDesc>{opt.description}</ModeDesc>
                  </ModeSegmentBtn>
                ))}
              </ModeSegmentGrid>
            </FieldGroup>

            {/* 학번 입력 (개인 지정 발송일 때만 노출) */}
            {requiresStudentNumber && (
              <FieldGroup>
                <FieldLabel htmlFor="noti-student">수신 대상 학번</FieldLabel>
                <StyledInput
                  id="noti-student"
                  type="text"
                  placeholder="예: 20231234"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  required
                />
              </FieldGroup>
            )}

            {/* 알림 카테고리 선택 (저장형 알림일 때만 노출) */}
            {usesStoredNotification && (
              <FieldGroup>
                <FieldLabel htmlFor="noti-cat">알림 카테고리</FieldLabel>
                <StyledSelect
                  id="noti-cat"
                  value={notificationType}
                  onChange={(e) =>
                    setNotificationType(e.target.value as NotificationType)
                  }
                >
                  {NOTIFICATION_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.title} - {opt.description}
                    </option>
                  ))}
                </StyledSelect>
              </FieldGroup>
            )}

            {/* 알림 제목 입력 */}
            <FieldGroup>
              <FieldHeaderRow>
                <FieldLabel htmlFor="noti-title">알림 제목</FieldLabel>
                <LengthHint>{title.length}자</LengthHint>
              </FieldHeaderRow>
              <StyledInput
                id="noti-title"
                type="text"
                placeholder="간결하고 명확한 제목을 입력해 주세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </FieldGroup>

            {/* 알림 본문 입력 */}
            <FieldGroup>
              <FieldHeaderRow>
                <FieldLabel htmlFor="noti-body">알림 본문</FieldLabel>
                <LengthHint>{body.length}자</LengthHint>
              </FieldHeaderRow>
              <StyledTextarea
                id="noti-body"
                rows={6}
                placeholder="사용자에게 전달할 알림 내용을 작성해 주세요."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
            </FieldGroup>

            {/* 데스크톱 발송 버튼 */}
            <DesktopActionRow>
              <SubmitActionButton type="submit" disabled={isSubmitDisabled}>
                {isSubmitting ? "발송하고 있어요..." : "푸시 알림 발송하기"}
              </SubmitActionButton>
            </DesktopActionRow>
          </FormCard>
        </FormColumn>

        {/* 우측 알림함 미리보기 및 오늘 전송 현황 (PC 전용) */}
        <SideColumn>
          {/* 오늘 발송 현황 */}
          <SideCard>
            <SideCardHeader>
              <SideCardTitle>오늘 발송 현황</SideCardTitle>
              <RefreshBtn
                type="button"
                onClick={() => void refetchFcmStats()}
                disabled={isStatsLoading}
              >
                {isStatsLoading ? "갱신 중" : "새로고침"}
              </RefreshBtn>
            </SideCardHeader>

            <StatsRow>
              <StatItem>
                <StatLabel>전송 성공</StatLabel>
                <StatValue style={{ color: "#04b05c" }}>
                  {(fcmStats?.successCount ?? 0).toLocaleString()}건
                </StatValue>
              </StatItem>
              <StatDivider />
              <StatItem>
                <StatLabel>전송 실패</StatLabel>
                <StatValue style={{ color: "#f04452" }}>
                  {(fcmStats?.failCount ?? 0).toLocaleString()}건
                </StatValue>
              </StatItem>
            </StatsRow>
          </SideCard>

          {/* 알림함 미리보기 */}
          <SideCard>
            <SideCardHeader>
              <SideCardTitle>알림함 미리보기</SideCardTitle>
            </SideCardHeader>

            <PreviewWrapper>
              <NotiItem notidata={previewNotification} />
            </PreviewWrapper>
          </SideCard>
        </SideColumn>
      </LayoutGrid>

      {/* 모바일 전용 하단 고정 CTA */}
      <MobileFixedBar>
        <MobileCTAButton
          type="button"
          onClick={() => handleSubmit()}
          disabled={isSubmitDisabled}
        >
          {isSubmitting ? "발송하고 있어요..." : "푸시 알림 발송하기"}
        </MobileCTAButton>
      </MobileFixedBar>
    </PageRoot>
  );
}

/* --- Styled Components (가로스크롤 방지 & 배경색 위임) --- */

const PageRoot = styled.div`
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  padding: 8px 16px 120px;

  @media (min-width: 1024px) {
    padding: 16px 0 60px;
    overflow-x: visible;
  }
`;

const LayoutGrid = styled.form`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  width: 100%;

  @media (min-width: 1024px) {
    grid-template-columns: minmax(0, 1.25fr) minmax(360px, 0.95fr);
    align-items: start;
    gap: 28px;
  }
`;

const FormColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
`;

const FormCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);

  @media (min-width: 768px) {
    padding: 28px;
  }
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FieldHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FieldLabel = styled.label`
  font-size: 14px;
  font-weight: 700;
  color: #191f28;
`;

const LengthHint = styled.span`
  font-size: 12px;
  color: #8b95a1;
`;

const ModeSegmentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const ModeSegmentBtn = styled.button<{ $active: boolean }>`
  border: 1.5px solid ${({ $active }) => ($active ? "#3182f6" : "#e5e8eb")};
  background: ${({ $active }) => ($active ? "#e8f3ff" : "#ffffff")};
  border-radius: 14px;
  padding: 14px 16px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #3182f6;
  }
`;

const ModeTitle = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #191f28;
`;

const ModeDesc = styled.span`
  font-size: 12px;
  color: #6b7684;
  line-height: 1.4;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  font-size: 14px;
  color: #191f28;
  outline: none;
  box-sizing: border-box;
  transition: all 0.15s ease;

  &::placeholder {
    color: #8b95a1;
  }

  &:focus {
    background: #ffffff;
    border-color: #3182f6;
    box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.12);
  }
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  font-size: 14px;
  font-weight: 600;
  color: #191f28;
  outline: none;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.15s ease;

  &:focus {
    background: #ffffff;
    border-color: #3182f6;
  }
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  font-size: 14px;
  color: #191f28;
  line-height: 1.6;
  outline: none;
  box-sizing: border-box;
  resize: vertical;
  transition: all 0.15s ease;

  &::placeholder {
    color: #8b95a1;
  }

  &:focus {
    background: #ffffff;
    border-color: #3182f6;
    box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.12);
  }
`;

const DesktopActionRow = styled.div`
  display: none;
  padding-top: 10px;

  @media (min-width: 768px) {
    display: flex;
  }
`;

const SubmitActionButton = styled.button`
  width: 100%;
  height: 50px;
  border-radius: 14px;
  border: none;
  background: #3182f6;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(49, 130, 246, 0.25);
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: #1b64da;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* 우측 사이드 패널 (PC 전용) */
const SideColumn = styled.div`
  display: none;

  @media (min-width: 1024px) {
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: sticky;
    top: 90px;
  }
`;

const SideCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
`;

const SideCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SideCardTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #191f28;
`;

const RefreshBtn = styled.button`
  border: none;
  background: #f2f4f6;
  color: #6b7684;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #e5e8eb;
    color: #191f28;
  }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  background: #f9fafb;
  border-radius: 14px;
  padding: 14px 18px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #8b95a1;
`;

const StatValue = styled.span`
  font-size: 20px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
`;

const StatDivider = styled.div`
  width: 1px;
  height: 28px;
  background: #e5e8eb;
`;

const PreviewWrapper = styled.div`
  background: #f9fafb;
  border-radius: 14px;
  padding: 12px;
  border: 1px solid #f2f4f6;
`;

/* 모바일 전용 하단 고정 CTA */
const MobileFixedBar = styled.div`
  display: block;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 25;
  background: linear-gradient(to top, #ffffff 70%, rgba(255, 255, 255, 0.8) 90%, transparent);
  padding: 12px 20px calc(14px + env(safe-area-inset-bottom, 0px));

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileCTAButton = styled.button`
  width: 100%;
  height: 52px;
  border-radius: 16px;
  border: none;
  background: #3182f6;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(49, 130, 246, 0.25);
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
  }

  &:active {
    transform: scale(0.98);
  }
`;
