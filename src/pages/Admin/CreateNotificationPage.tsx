import React, { useState } from "react";
import styled from "styled-components";
import { AxiosError } from "axios";
import { Send } from "lucide-react";
import NotiItem from "@/components/notification/NotiItem";
import { Notification, NotificationPayload } from "@/types/notifications";
import {
  createNotification,
  createNotificationByStudentNumber,
} from "@/apis/notification";
import { useSetHeader } from "@/hooks/useSetHeader";
import {
  AdminActionRow,
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
  AdminPage,
  AdminPageGrid,
  AdminShell,
  AdminStack,
  AdminSubtleText,
  AdminTextarea,
} from "@/pages/Admin/adminPageStyles";

const TARGET_TYPES = {
  UNIDORM: "UNI_DORM",
  DORMITORY: "DORMITORY",
  INDIVIDUAL: "INDIVIDUAL",
} as const;

const TARGET_OPTIONS = [
  {
    value: TARGET_TYPES.UNIDORM,
    title: "유니돔 전체",
    description:
      "전체 사용자에게 공통 공지나 운영 메시지를 보낼 때 사용합니다.",
  },
  {
    value: TARGET_TYPES.DORMITORY,
    title: "기숙사생 전체",
    description: "기숙사 관련 안내만 묶어서 보낼 때 사용합니다.",
  },
  {
    value: TARGET_TYPES.INDIVIDUAL,
    title: "학번 개별 발송",
    description: "특정 학번 1명에게 확인 요청이나 테스트 메시지를 보냅니다.",
  },
] as const;

const CreateNotificationPage = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetType, setTargetType] = useState<string>(TARGET_TYPES.UNIDORM);
  const [studentNumber, setStudentNumber] = useState("");
  const [boardId, setBoardId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentTarget =
    TARGET_OPTIONS.find((option) => option.value === targetType) ??
    TARGET_OPTIONS[0];
  const parsedPreviewBoardId = boardId.trim() ? Number(boardId) : 0;
  const isSubmitDisabled =
    !title.trim() ||
    !body.trim() ||
    (targetType === TARGET_TYPES.INDIVIDUAL && !studentNumber.trim()) ||
    isSubmitting;
  const previewNotification: Notification = {
    id: 0,
    apiType: "ANNOUNCEMENT",
    boardId:
      Number.isFinite(parsedPreviewBoardId) && parsedPreviewBoardId > 0
        ? parsedPreviewBoardId
        : 0,
    title: title.trim() || "푸시 제목이 여기에 표시됩니다.",
    body:
      body.trim() ||
      "본문을 입력하면 실제 알림 페이지에서 보이는 형태로 이 영역에 표시됩니다.",
    notificationType: "유니돔",
    createdDate: new Date().toISOString(),
    read: false,
  };

  useSetHeader({ title: "푸시 알림 전송" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      alert("제목과 내용을 모두 입력해 주세요.");
      return;
    }

    if (targetType === TARGET_TYPES.INDIVIDUAL && !studentNumber.trim()) {
      alert("개별 발송을 선택한 경우 학번이 필요합니다.");
      return;
    }

    const parsedBoardId = boardId.trim() ? Number(boardId) : 0;

    if (
      boardId.trim() &&
      (!Number.isFinite(parsedBoardId) || parsedBoardId < 0)
    ) {
      alert("연결 게시글 ID는 0 이상의 숫자로 입력해 주세요.");
      return;
    }

    if (!window.confirm(`${currentTarget.title}에게 푸시 알림을 전송할까요?`)) {
      return;
    }

    const payload: NotificationPayload = {
      title: title.trim(),
      body: body.trim(),
      notificationType: TARGET_TYPES.UNIDORM,
      boardId: parsedBoardId,
    };

    try {
      setIsSubmitting(true);

      if (targetType === TARGET_TYPES.INDIVIDUAL) {
        await createNotificationByStudentNumber(studentNumber.trim(), payload);
      } else {
        await createNotification(payload);
      }

      alert("푸시 알림을 전송했습니다.");
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
    setTargetType(TARGET_TYPES.UNIDORM);
    setStudentNumber("");
    setBoardId("");
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
                  <AdminCardTitle>발송 설정</AdminCardTitle>
                  <AdminCardDescription>
                    발송 대상을 선택하고 제목과 본문을 입력하면 오른쪽
                    미리보기에 바로 반영됩니다.
                  </AdminCardDescription>
                </AdminCardTitleGroup>
              </AdminCardHeader>

              <FormContainer onSubmit={handleSubmit}>
                <AdminField>
                  <AdminLabel htmlFor="notification-target-type">
                    발송 대상
                  </AdminLabel>
                  <TargetTypeSelect
                    id="notification-target-type"
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value)}
                  >
                    {TARGET_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.title}
                      </option>
                    ))}
                  </TargetTypeSelect>
                  <AdminSubtleText>{currentTarget.description}</AdminSubtleText>
                </AdminField>

                {targetType === TARGET_TYPES.INDIVIDUAL && (
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
                      개별 발송은 입력한 학번 1명에게만 전송됩니다.
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
                    placeholder="예: 오늘 밤 11시 점검 안내"
                    required
                  />
                  <FieldLengthHint>현재 {title.length}자</FieldLengthHint>
                </AdminField>

                <AdminField>
                  <AdminLabel htmlFor="notification-body">본문</AdminLabel>
                  <AdminTextarea
                    id="notification-body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="사용자에게 전달할 상세 내용을 입력해 주세요."
                    rows={8}
                    required
                  />
                  <FieldLengthHint>현재 {body.length}자</FieldLengthHint>
                </AdminField>

                {/*<AdminField>*/}
                {/*  <AdminLabel htmlFor="board-id">연결 게시글 ID</AdminLabel>*/}
                {/*  <AdminInput*/}
                {/*    id="board-id"*/}
                {/*    type="number"*/}
                {/*    value={boardId}*/}
                {/*    onChange={(e) => setBoardId(e.target.value)}*/}
                {/*    placeholder="선택 사항"*/}
                {/*  />*/}
                {/*  <AdminSubtleText>*/}
                {/*    게시글 상세 화면으로 이동시킬 ID가 있다면 함께 입력해*/}
                {/*    주세요.*/}
                {/*  </AdminSubtleText>*/}
                {/*</AdminField>*/}

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
            <AdminCard $sticky>
              <AdminCardHeader>
                <AdminCardTitleGroup>
                  <AdminCardEyebrow>Preview</AdminCardEyebrow>
                  <AdminCardTitle>발송 미리보기</AdminCardTitle>
                  <AdminCardDescription>
                    실제 알림 페이지에서 사용하는 항목 컴포넌트로 미리
                    확인합니다.
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

const TargetTypeSelect = styled(AdminInput).attrs({ as: "select" })`
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
