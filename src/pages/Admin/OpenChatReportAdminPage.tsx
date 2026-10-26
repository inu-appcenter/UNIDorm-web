import { useEffect, useState } from "react";
import styled from "styled-components";
import {
  approveOpenChatReport,
  cancelOpenChatReport,
  OpenChatReport,
  OpenChatReportStatus,
} from "@/apis/report";
import { useOpenChatReports } from "@/queries/admin";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useSetHeader } from "@/hooks/useSetHeader";
import { useUserRole } from "@/hooks/useUserRole";
import useUserStore from "@/stores/useUserStore";
import { useNavigate } from "react-router-dom";
import {
  AdminBadge,
  AdminCard,
  AdminCardDescription,
  AdminCardHeader,
  AdminCardTitle,
  AdminCardTitleGroup,
  AdminEmptyDescription,
  AdminEmptyState,
  AdminEmptyTitle,
  AdminPage,
  AdminShell,
} from "@/pages/Admin/adminPageStyles";

const STATUS_OPTIONS: Array<{
  value: OpenChatReportStatus;
  label: string;
}> = [
  { value: "PENDING", label: "처리 대기" },
  { value: "APPROVED", label: "승인 완료" },
  { value: "CANCELLED", label: "반려됨" },
];

const REASON_LABELS: Record<OpenChatReport["reason"], string> = {
  SPAM_AD: "도배 · 광고",
  ABUSE: "욕설 · 비방",
  FRAUD: "사기 · 사칭",
  DISRUPTION: "분란 조성",
  ETC: "기타 사유",
};

export default function OpenChatReportAdminPage() {
  const navigate = useNavigate();
  const { isMainAdmin } = useUserRole();
  const { isLoading: isUserLoading } = useUserStore();
  const [status, setStatus] = useState<OpenChatReportStatus>("PENDING");
  const [page, setPage] = useState(0);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const {
    data: reportsData,
    isLoading: loading,
    refetch: fetchReports,
  } = useOpenChatReports(status, page, {
    enabled: !isUserLoading && isMainAdmin,
  });

  const reports = reportsData?.content ?? [];
  const totalPages = reportsData?.totalPages ?? 0;
  const totalElements = reportsData?.totalElements ?? 0;

  useSetHeader({ title: "채팅 신고 관리" });

  useEffect(() => {
    if (!isUserLoading && !isMainAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [isMainAdmin, isUserLoading, navigate]);

  const changeStatus = (nextStatus: OpenChatReportStatus) => {
    setStatus(nextStatus);
    setPage(0);
  };

  const processReport = async (
    report: OpenChatReport,
    action: "approve" | "cancel",
  ) => {
    const actionLabel = action === "approve" ? "승인" : "반려";
    const confirmMessage =
      action === "approve"
        ? "이 신고를 승인할까요? 해당 메시지에 대한 조치가 적용됩니다."
        : "이 신고를 반려할까요? 별도의 제재 없이 종결됩니다.";

    if (!window.confirm(confirmMessage)) return;

    setProcessingId(report.reportId);
    try {
      if (action === "approve") {
        await approveOpenChatReport(report.reportId);
      } else {
        await cancelOpenChatReport(report.reportId);
      }
      await fetchReports();
    } catch (error) {
      console.error(`채팅 신고 ${actionLabel} 실패:`, error);
      alert(`신고 ${actionLabel} 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminShell>
      <AdminPage>
        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitleGroup>
              <AdminCardTitle>채팅 메시지 신고 관리</AdminCardTitle>
              <AdminCardDescription>
                오픈채팅방에서 접수된 신고 내용을 확인하고 승인 또는 반려할 수 있습니다.
              </AdminCardDescription>
            </AdminCardTitleGroup>

            <TotalCountBadge>
              총 {totalElements.toLocaleString()}건
            </TotalCountBadge>
          </AdminCardHeader>

          {/* 상태 세그먼트 탭 */}
          <StatusTabs aria-label="신고 처리 상태">
            {STATUS_OPTIONS.map((option) => (
              <StatusTabButton
                key={option.value}
                type="button"
                $active={status === option.value}
                aria-pressed={status === option.value}
                onClick={() => changeStatus(option.value)}
              >
                {option.label}
              </StatusTabButton>
            ))}
          </StatusTabs>

          {/* 신고 카드 목록 */}
          {loading ? (
            <LoadingContainer>
              <LoadingSpinner message="신고 목록을 불러오는 중입니다..." />
            </LoadingContainer>
          ) : reports.length === 0 ? (
            <AdminEmptyState>
              <AdminEmptyTitle>해당 상태의 신고가 없습니다.</AdminEmptyTitle>
              <AdminEmptyDescription>
                현재 {STATUS_OPTIONS.find((o) => o.value === status)?.label} 상태의 신고 내역이 존재하지 않습니다.
              </AdminEmptyDescription>
            </AdminEmptyState>
          ) : (
            <ReportList>
              {reports.map((report) => (
                <ReportCard key={report.reportId}>
                  <CardTopRow>
                    <AdminBadge $tone={report.reason === "SPAM_AD" ? "amber" : "red"}>
                      {REASON_LABELS[report.reason] || "신고"}
                    </AdminBadge>
                    <ReportTime>
                      {new Date(report.createdDate).toLocaleString("ko-KR")}
                    </ReportTime>
                  </CardTopRow>

                  {/* 신고된 메시지 본문 인용 서피스 */}
                  <ReportedQuoteBox>
                    <QuoteLabel>신고된 메시지 내용</QuoteLabel>
                    <QuoteText>
                      {report.reportedContent || "신고된 내용이 없습니다."}
                    </QuoteText>
                  </ReportedQuoteBox>

                  {/* 신고자 및 대상자 메타 정보 */}
                  <InfoGrid>
                    <InfoItem>
                      <InfoLabel>신고 대상</InfoLabel>
                      <InfoValue>
                        {report.targetName || "이름 없음"} · {report.targetStudentNumber || "학번 없음"}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>신고자</InfoLabel>
                      <InfoValue>
                        {report.reporterName || "이름 없음"} · {report.reporterStudentNumber || "학번 없음"}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>채팅방 / 메시지 ID</InfoLabel>
                      <InfoValue>
                        방 #{report.roomId} · 메시지 #{report.messageId}
                      </InfoValue>
                    </InfoItem>
                  </InfoGrid>

                  {/* 처리 대기 상태 시 액션 버튼 */}
                  {report.status === "PENDING" && (
                    <ActionButtonsGrid>
                      <RejectButton
                        type="button"
                        disabled={processingId === report.reportId}
                        onClick={() => processReport(report, "cancel")}
                      >
                        신고 반려하기
                      </RejectButton>
                      <ApproveButton
                        type="button"
                        disabled={processingId === report.reportId}
                        onClick={() => processReport(report, "approve")}
                      >
                        {processingId === report.reportId
                          ? "처리하고 있어요..."
                          : "신고 승인하기"}
                      </ApproveButton>
                    </ActionButtonsGrid>
                  )}
                </ReportCard>
              ))}
            </ReportList>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <PaginationContainer>
              <PageNavButton
                type="button"
                disabled={page === 0 || loading}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
              >
                이전 페이지
              </PageNavButton>
              <PageIndicatorText>
                {page + 1} / {totalPages}
              </PageIndicatorText>
              <PageNavButton
                type="button"
                disabled={page + 1 >= totalPages || loading}
                onClick={() => setPage((current) => current + 1)}
              >
                다음 페이지
              </PageNavButton>
            </PaginationContainer>
          )}
        </AdminCard>
      </AdminPage>
    </AdminShell>
  );
}

const TotalCountBadge = styled.span`
  font-size: 0.85rem;
  font-weight: 700;
  color: #3182f6;
  background: #e8f3ff;
  padding: 6px 14px;
  border-radius: 999px;
  letter-spacing: -0.01em;
`;

const StatusTabs = styled.div`
  display: flex;
  gap: 8px;
  padding: 4px;
  background: #f2f4f6;
  border-radius: 16px;
  width: fit-content;
  max-width: 100%;
  overflow-x: auto;
`;

const StatusTabButton = styled.button<{ $active: boolean }>`
  height: 38px;
  padding: 0 16px;
  border: none;
  border-radius: 12px;
  background: ${({ $active }) => ($active ? "#ffffff" : "transparent")};
  color: ${({ $active }) => ($active ? "#3182f6" : "#6b7684")};
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease-out;
  box-shadow: ${({ $active }) =>
    $active ? "0 1px 4px rgba(0, 0, 0, 0.08)" : "none"};
  white-space: nowrap;

  &:active {
    transform: scale(0.98);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 60px 0;
`;

const ReportList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ReportCard = styled.article`
  padding: 22px;
  border: 1px solid #e5e8eb;
  border-radius: 20px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: border-color 0.18s ease;

  &:hover {
    border-color: #3182f6;
  }
`;

const CardTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const ReportTime = styled.time`
  color: #8b95a1;
  font-size: 0.78rem;
  font-weight: 600;
`;

const ReportedQuoteBox = styled.div`
  padding: 16px;
  border-radius: 14px;
  background: #f9fafb;
  border-left: 3.5px solid #3182f6;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const QuoteLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  color: #8b95a1;
`;

const QuoteText = styled.p`
  margin: 0;
  color: #191f28;
  font-size: 0.94rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding: 14px;
  background: #f9fafb;
  border-radius: 14px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const InfoLabel = styled.span`
  color: #8b95a1;
  font-size: 0.72rem;
  font-weight: 600;
`;

const InfoValue = styled.strong`
  color: #333d4b;
  font-size: 0.85rem;
  font-weight: 700;
  word-break: break-all;
`;

const ActionButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 4px;
`;

const ActionButton = styled.button`
  min-height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease-out;

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const RejectButton = styled(ActionButton)`
  border: 1px solid #e5e8eb;
  background: #f2f4f6;
  color: #4e5968;

  &:hover:not(:disabled) {
    background: #e5e8eb;
    color: #191f28;
  }
`;

const ApproveButton = styled(ActionButton)`
  border: none;
  background: #f04452;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(240, 68, 82, 0.22);

  &:hover:not(:disabled) {
    background: #dc3545;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
`;

const PageIndicatorText = styled.span`
  font-size: 0.88rem;
  font-weight: 700;
  color: #4e5968;
`;

const PageNavButton = styled.button`
  padding: 10px 16px;
  border: 1px solid #e5e8eb;
  border-radius: 12px;
  background: #ffffff;
  color: #333d4b;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease-out;

  &:hover:not(:disabled) {
    border-color: #3182f6;
    color: #3182f6;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;
