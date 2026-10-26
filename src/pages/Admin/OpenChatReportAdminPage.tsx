import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
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
  const [reasonFilter, setReasonFilter] = useState<string>("ALL");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [page, setPage] = useState(0);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // 글로벌 헤더 등록 (중복 헤더 제거)
  useSetHeader({ title: "채팅 신고 관리" });

  useEffect(() => {
    if (!isUserLoading && !isMainAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [isMainAdmin, isUserLoading, navigate]);

  const {
    data: reportsData,
    isLoading: loading,
    refetch: fetchReports,
  } = useOpenChatReports(status, page, {
    enabled: !isUserLoading && isMainAdmin,
  });

  const rawReports = reportsData?.content ?? [];
  const totalPages = reportsData?.totalPages ?? 0;
  const totalElements = reportsData?.totalElements ?? 0;

  // 클라이언트 단 검색 및 사유 필터링
  const filteredReports = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    return rawReports.filter((report) => {
      // 1. 사유 필터
      if (reasonFilter !== "ALL" && report.reason !== reasonFilter) {
        return false;
      }
      // 2. 검색어 (신고 내용, 대상자 이름/학번, 신고자 이름/학번)
      if (keyword) {
        const contentMatch = report.reportedContent?.toLowerCase().includes(keyword);
        const targetMatch =
          report.targetName?.toLowerCase().includes(keyword) ||
          report.targetStudentNumber?.includes(keyword);
        const reporterMatch =
          report.reporterName?.toLowerCase().includes(keyword) ||
          report.reporterStudentNumber?.includes(keyword);
        if (!contentMatch && !targetMatch && !reporterMatch) return false;
      }
      return true;
    });
  }, [rawReports, reasonFilter, searchKeyword]);

  const changeStatus = (nextStatus: OpenChatReportStatus) => {
    setStatus(nextStatus);
    setPage(0);
    setReasonFilter("ALL");
  };

  const processReport = async (
    report: OpenChatReport,
    action: "approve" | "cancel",
  ) => {
    const actionLabel = action === "approve" ? "승인" : "반려";
    const confirmMessage =
      action === "approve"
        ? "이 신고를 승인할까요? 해당 메시지에 제재를 적용해요."
        : "이 신고를 반려할까요? 별도 제재 없이 종결해요.";

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
      alert(`신고 ${actionLabel} 처리에 실패했어요. 다시 시도해 주세요.`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <PageRoot>
      {/* 1. 상태 탭 & 검색 / 필터 제어 바 */}
      <ControlBarCard>
        <TopControlRow>
          {/* 상태 세그먼트 탭 */}
          <StatusTabs>
            {STATUS_OPTIONS.map((option) => (
              <StatusTabButton
                key={option.value}
                type="button"
                $active={status === option.value}
                onClick={() => changeStatus(option.value)}
              >
                {option.label}
              </StatusTabButton>
            ))}
          </StatusTabs>

          <TotalCountTag>
            총 <strong>{totalElements.toLocaleString()}</strong>건의 신고
          </TotalCountTag>
        </TopControlRow>

        {/* 2행: 검색 인풋 & 사유 필터 드롭다운 */}
        <SearchFilterRow>
          <SearchInputWrapper>
            <SearchInput
              type="text"
              placeholder="신고된 메시지, 대상자/신고자 이름·학번 검색..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            {searchKeyword && (
              <ClearButton type="button" onClick={() => setSearchKeyword("")}>
                ✕
              </ClearButton>
            )}
          </SearchInputWrapper>

          <ReasonSelect
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
          >
            <option value="ALL">전체 사유</option>
            {Object.entries(REASON_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </ReasonSelect>
        </SearchFilterRow>
      </ControlBarCard>

      {/* 2. 신고 목록 본문 */}
      <ContentCard>
        {loading ? (
          <LoadingWrapper>
            <LoadingSpinner message="신고 목록을 불러오는 중입니다..." />
          </LoadingWrapper>
        ) : filteredReports.length === 0 ? (
          <EmptyContainer>
            <EmptyTitle>해당 조건의 신고가 없어요.</EmptyTitle>
            <EmptyDesc>
              현재 {STATUS_OPTIONS.find((o) => o.value === status)?.label} 상태에 표시할 내역이 없어요.
            </EmptyDesc>
          </EmptyContainer>
        ) : (
          <ReportListGrid>
            {filteredReports.map((report) => (
              <ReportCardItem key={report.reportId}>
                <CardMetaHeader>
                  <ReasonBadge $reason={report.reason}>
                    {REASON_LABELS[report.reason] || "신고"}
                  </ReasonBadge>
                  <ReportDateText>
                    {new Date(report.createdDate).toLocaleString("ko-KR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </ReportDateText>
                </CardMetaHeader>

                {/* 신고된 메시지 본문 인용 서피스 */}
                <QuoteSurface>
                  <QuoteHeading>신고된 메시지 내용</QuoteHeading>
                  <QuoteBodyText>
                    {report.reportedContent || "(내용 없음)"}
                  </QuoteBodyText>
                </QuoteSurface>

                {/* 메타 정보 3분할 그리드 */}
                <MetaInfoGrid>
                  <MetaBox>
                    <MetaKey>신고 대상자</MetaKey>
                    <MetaVal>
                      {report.targetName || "이름 없음"} ({report.targetStudentNumber || "-"})
                    </MetaVal>
                  </MetaBox>

                  <MetaBox>
                    <MetaKey>신고자</MetaKey>
                    <MetaVal>
                      {report.reporterName || "이름 없음"} ({report.reporterStudentNumber || "-"})
                    </MetaVal>
                  </MetaBox>

                  <MetaBox>
                    <MetaKey>위치 / ID</MetaKey>
                    <MetaVal>
                      방 #{report.roomId} · 메시지 #{report.messageId}
                    </MetaVal>
                  </MetaBox>
                </MetaInfoGrid>

                {/* 대기 상태일 때 승인/반려 액션 버튼 */}
                {report.status === "PENDING" && (
                  <ActionButtonsRow>
                    <RejectActionButton
                      type="button"
                      disabled={processingId === report.reportId}
                      onClick={() => processReport(report, "cancel")}
                    >
                      신고 반려
                    </RejectActionButton>
                    <ApproveActionButton
                      type="button"
                      disabled={processingId === report.reportId}
                      onClick={() => processReport(report, "approve")}
                    >
                      {processingId === report.reportId
                        ? "처리 중..."
                        : "신고 승인"}
                    </ApproveActionButton>
                  </ActionButtonsRow>
                )}
              </ReportCardItem>
            ))}
          </ReportListGrid>
        )}

        {/* 3. 모바일 안전 페이지네이션 바 */}
        {totalPages > 1 && (
          <PaginationWrapper>
            <PageNavButton
              type="button"
              disabled={page === 0 || loading}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
            >
              ‹ 이전
            </PageNavButton>

            <PageIndicator>
              <strong>{page + 1}</strong> / {totalPages} 페이지
            </PageIndicator>

            <PageNavButton
              type="button"
              disabled={page + 1 >= totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              다음 ›
            </PageNavButton>
          </PaginationWrapper>
        )}
      </ContentCard>
    </PageRoot>
  );
}

/* --- Styled Components (Zero Brand Pollution, 가로스크롤 원천 차단) --- */

const PageRoot = styled.div`
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  padding: 10px 14px calc(60px + env(safe-area-inset-bottom, 0px));

  @media (min-width: 1024px) {
    padding: 16px 0 60px;
    gap: 24px;
    overflow-x: visible;
  }
`;

const ControlBarCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 16px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);

  @media (min-width: 768px) {
    border-radius: 20px;
    padding: 18px 20px;
    gap: 14px;
  }
`;

const TopControlRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const StatusTabs = styled.div`
  display: inline-flex;
  background: #f2f4f6;
  padding: 4px;
  border-radius: 12px;
  gap: 4px;
  width: fit-content;
`;

const StatusTabButton = styled.button<{ $active: boolean }>`
  border: none;
  background: ${({ $active }) => ($active ? "#ffffff" : "transparent")};
  color: ${({ $active }) => ($active ? "#191f28" : "#6b7684")};
  font-size: 13px;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: ${({ $active }) =>
    $active ? "0 2px 6px rgba(0, 0, 0, 0.06)" : "none"};

  &:hover {
    color: #191f28;
  }
`;

const TotalCountTag = styled.span`
  font-size: 13px;
  color: #6b7684;

  strong {
    color: #3182f6;
    font-weight: 700;
  }
`;

const SearchFilterRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 38px 12px 16px;
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

const ClearButton = styled.button`
  position: absolute;
  right: 12px;
  border: none;
  background: transparent;
  color: #8b95a1;
  font-size: 13px;
  cursor: pointer;
  padding: 4px;
`;

const ReasonSelect = styled.select`
  padding: 11px 14px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  font-size: 13px;
  font-weight: 600;
  color: #333d4b;
  outline: none;
  cursor: pointer;
  min-width: 140px;

  &:focus {
    border-color: #3182f6;
    background: #ffffff;
  }
`;

const ContentCard = styled.div`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 16px;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);

  @media (min-width: 768px) {
    border-radius: 20px;
    padding: 24px;
  }
`;

const LoadingWrapper = styled.div`
  padding: 60px 0;
  display: flex;
  justify-content: center;
`;

const EmptyContainer = styled.div`
  padding: 60px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const EmptyTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #191f28;
`;

const EmptyDesc = styled.p`
  margin: 0;
  font-size: 13px;
  color: #8b95a1;
`;

/* 신고 카드 리스트 그리드: PC에서는 2열 또는 1열 반응형 */
const ReportListGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 1100px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ReportCardItem = styled.article`
  border: 1px solid #e5e8eb;
  border-radius: 16px;
  padding: 14px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  transition: border-color 0.18s ease;

  @media (min-width: 768px) {
    border-radius: 18px;
    padding: 20px;
    gap: 14px;
  }

  &:hover {
    border-color: #3182f6;
  }
`;

const CardMetaHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const ReasonBadge = styled.span<{ $reason: OpenChatReport["reason"] }>`
  font-size: 12px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: -0.2px;

  ${({ $reason }) => {
    switch ($reason) {
      case "ABUSE":
      case "FRAUD":
        return `
          background: #fdf2f2;
          color: #f04452;
        `;
      case "SPAM_AD":
        return `
          background: #fff5e5;
          color: #ff8b00;
        `;
      default:
        return `
          background: #f2f4f6;
          color: #6b7684;
        `;
    }
  }}
`;

const ReportDateText = styled.span`
  font-size: 12px;
  color: #8b95a1;
  font-variant-numeric: tabular-nums;
`;

const QuoteSurface = styled.div`
  background: #f9fafb;
  border: 1px solid #f2f4f6;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const QuoteHeading = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #8b95a1;
`;

const QuoteBodyText = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #191f28;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
`;

const MetaInfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  background: #ffffff;
  border-top: 1px solid #f2f4f6;
  padding-top: 10px;

  @media (min-width: 600px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const MetaBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const MetaKey = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #8b95a1;
`;

const MetaVal = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #333d4b;
`;

const ActionButtonsRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px solid #f2f4f6;
`;

const RejectActionButton = styled.button`
  flex: 1;
  height: 42px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #ffffff;
  color: #4e5968;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: #fdf2f2;
    border-color: #fde8e8;
    color: #f04452;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ApproveActionButton = styled.button`
  flex: 1;
  height: 42px;
  border-radius: 12px;
  border: none;
  background: #3182f6;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: #1b64da;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* 페이지네이션 */
const PaginationWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f2f4f6;
`;

const PageNavButton = styled.button`
  border: 1px solid #e5e8eb;
  background: #ffffff;
  color: #4e5968;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    border-color: #3182f6;
    color: #3182f6;
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

const PageIndicator = styled.span`
  font-size: 13px;
  color: #6b7684;

  strong {
    color: #191f28;
    font-weight: 700;
  }
`;
