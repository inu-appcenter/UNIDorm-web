import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { Check, X } from "lucide-react";
import {
  approveOpenChatReport,
  cancelOpenChatReport,
  getOpenChatReports,
  OpenChatReport,
  OpenChatReportStatus,
} from "@/apis/report";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useSetHeader } from "@/hooks/useSetHeader";
import { useUserRole } from "@/hooks/useUserRole";
import useUserStore from "@/stores/useUserStore";
import { useNavigate } from "react-router-dom";

const STATUS_OPTIONS: Array<{
  value: OpenChatReportStatus;
  label: string;
}> = [
  { value: "PENDING", label: "처리 대기" },
  { value: "APPROVED", label: "승인" },
  { value: "CANCELLED", label: "반려" },
];

const REASON_LABELS: Record<OpenChatReport["reason"], string> = {
  SPAM_AD: "도배 · 광고",
  ABUSE: "욕설 · 비방",
  FRAUD: "사기 · 사칭",
  DISRUPTION: "지속적인 분란 조성",
  ETC: "기타",
};

export default function OpenChatReportAdminPage() {
  const navigate = useNavigate();
  const { isMainAdmin } = useUserRole();
  const { isLoading: isUserLoading } = useUserStore();
  const [status, setStatus] = useState<OpenChatReportStatus>("PENDING");
  const [reports, setReports] = useState<OpenChatReport[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useSetHeader({ title: "채팅 신고 관리" });

  useEffect(() => {
    if (!isUserLoading && !isMainAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [isMainAdmin, isUserLoading, navigate]);

  const fetchReports = useCallback(async () => {
    if (isUserLoading || !isMainAdmin) return;
    setLoading(true);
    try {
      const response = await getOpenChatReports(status, page);
      setReports(response.data.content ?? []);
      setTotalPages(response.data.totalPages ?? 0);
      setTotalElements(response.data.totalElements ?? 0);
    } catch (error) {
      console.error("채팅 신고 목록 조회 실패:", error);
      alert("채팅 신고 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [isMainAdmin, isUserLoading, page, status]);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const changeStatus = (nextStatus: OpenChatReportStatus) => {
    setStatus(nextStatus);
    setPage(0);
  };

  const processReport = async (
    report: OpenChatReport,
    action: "approve" | "cancel",
  ) => {
    const actionLabel = action === "approve" ? "승인" : "반려";
    if (!window.confirm(`이 신고를 ${actionLabel}할까요?`)) return;

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
      alert(`신고 ${actionLabel}에 실패했습니다.`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Page>
      <Header>
        <div>
          <h1>오픈채팅 신고</h1>
          <p>메시지 신고 내용을 확인하고 승인 또는 반려할 수 있습니다.</p>
        </div>
        <Count>{totalElements.toLocaleString()}건</Count>
      </Header>

      <StatusTabs aria-label="신고 처리 상태">
        {STATUS_OPTIONS.map((option) => (
          <StatusButton
            key={option.value}
            type="button"
            $active={status === option.value}
            aria-pressed={status === option.value}
            onClick={() => changeStatus(option.value)}
          >
            {option.label}
          </StatusButton>
        ))}
      </StatusTabs>

      {loading ? (
        <LoadingSpinner message="신고 목록을 불러오는 중입니다." />
      ) : reports.length === 0 ? (
        <Empty>해당 상태의 신고가 없습니다.</Empty>
      ) : (
        <ReportList>
          {reports.map((report) => (
            <ReportCard key={report.reportId}>
              <CardHeader>
                <ReasonBadge>{REASON_LABELS[report.reason]}</ReasonBadge>
                <time>{new Date(report.createdDate).toLocaleString("ko-KR")}</time>
              </CardHeader>

              <ReportedContent>{report.reportedContent || "내용 없음"}</ReportedContent>

              <InfoGrid>
                <Info>
                  <span>신고 대상</span>
                  <strong>
                    {report.targetName || "이름 없음"} ·{" "}
                    {report.targetStudentNumber || "학번 없음"}
                  </strong>
                </Info>
                <Info>
                  <span>신고자</span>
                  <strong>
                    {report.reporterName || "이름 없음"} ·{" "}
                    {report.reporterStudentNumber || "학번 없음"}
                  </strong>
                </Info>
                <Info>
                  <span>방 / 메시지</span>
                  <strong>
                    {report.roomId} / {report.messageId}
                  </strong>
                </Info>
              </InfoGrid>

              {report.status === "PENDING" && (
                <Actions>
                  <RejectButton
                    type="button"
                    disabled={processingId === report.reportId}
                    onClick={() => processReport(report, "cancel")}
                  >
                    <X size={16} />
                    반려
                  </RejectButton>
                  <ApproveButton
                    type="button"
                    disabled={processingId === report.reportId}
                    onClick={() => processReport(report, "approve")}
                  >
                    <Check size={16} />
                    {processingId === report.reportId ? "처리 중..." : "승인"}
                  </ApproveButton>
                </Actions>
              )}
            </ReportCard>
          ))}
        </ReportList>
      )}

      {totalPages > 1 && (
        <Pagination>
          <PageButton
            type="button"
            disabled={page === 0 || loading}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
          >
            이전
          </PageButton>
          <span>
            {page + 1} / {totalPages}
          </span>
          <PageButton
            type="button"
            disabled={page + 1 >= totalPages || loading}
            onClick={() => setPage((current) => current + 1)}
          >
            다음
          </PageButton>
        </Pagination>
      )}
    </Page>
  );
}

const Page = styled.main`
  width: min(100%, 960px);
  margin: 0 auto;
  padding: 24px 20px 100px;
  box-sizing: border-box;
`;

const Header = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  h1 {
    margin: 0;
    color: #222;
    font-size: 24px;
  }
  p {
    margin: 8px 0 0;
    color: #8b8b8b;
    font-size: 14px;
  }
`;

const Count = styled.strong`
  flex-shrink: 0;
  color: #1677ff;
`;

const StatusTabs = styled.div`
  display: flex;
  gap: 8px;
  margin: 24px 0 20px;
`;

const StatusButton = styled.button<{ $active: boolean }>`
  height: 36px;
  padding: 0 14px;
  border: 1px solid ${({ $active }) => ($active ? "#1677ff" : "#dfdfdf")};
  border-radius: 999px;
  background: ${({ $active }) => ($active ? "#1677ff" : "#fff")};
  color: ${({ $active }) => ($active ? "#fff" : "#555")};
  cursor: pointer;
`;

const ReportList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ReportCard = styled.article`
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #fff;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  time {
    color: #8b8b8b;
    font-size: 12px;
  }
`;

const ReasonBadge = styled.span`
  padding: 5px 9px;
  border-radius: 999px;
  background: #fff2f0;
  color: #cf1322;
  font-size: 12px;
  font-weight: 700;
`;

const ReportedContent = styled.p`
  margin: 16px 0;
  padding: 14px;
  border-radius: 10px;
  background: #f7f7f7;
  color: #3d3d3d;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  span {
    color: #8b8b8b;
    font-size: 12px;
  }
  strong {
    color: #3d3d3d;
    font-size: 13px;
    overflow-wrap: anywhere;
  }
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 18px;
`;

const ActionButton = styled.button`
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 700;
  cursor: pointer;
  &:disabled {
    cursor: default;
    opacity: 0.55;
  }
`;

const RejectButton = styled(ActionButton)`
  border: 1px solid #ffccc7;
  background: #fff2f0;
  color: #cf1322;
`;

const ApproveButton = styled(ActionButton)`
  border: 1px solid #1677ff;
  background: #1677ff;
  color: #fff;
`;

const Empty = styled.p`
  margin: 80px 0 0;
  color: #8b8b8b;
  text-align: center;
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  color: #555;
`;

const PageButton = styled.button`
  padding: 8px 14px;
  border: 1px solid #dfdfdf;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  &:disabled {
    cursor: default;
    opacity: 0.45;
  }
`;
