import React, { useState } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { getSurveyResultExcel } from "@/apis/formApis";
import { useSurveyResults } from "@/queries/surveys";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { formatDeadlineDate } from "@/utils/dateUtils";
import { useSetHeader } from "@/hooks/useSetHeader";
import { useCountUp } from "@/hooks/useCountUp";
import {
  AdminShell,
  AdminPage,
  AdminHero,
  AdminHeroTitle,
  AdminHeroDescription,
  AdminCard,
  AdminBadge,
  AdminButton,
  AdminEmptyState,
  AdminEmptyTitle,
  AdminEmptyDescription,
} from "./adminPageStyles";

const FormResultPage: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: formResultData = null, isLoading } = useSurveyResults(
    formId ? Number(formId) : undefined,
  );

  const totalCount = useCountUp(formResultData?.totalResponses ?? 0, {
    duration: 1000,
  });

  const handleDownloadCsv = async () => {
    if (isDownloading) return;

    if (
      !window.confirm(
        "응답 데이터를 CSV 파일로 다운로드할까요?\n응답 수에 따라 수 초 정도 걸릴 수 있습니다.",
      )
    ) {
      return;
    }

    try {
      setIsDownloading(true);
      const res = await getSurveyResultExcel(Number(formId));

      const BOM = "\uFEFF";
      const csvData = BOM + res.data;
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const fileName = `설문결과_${formResultData?.surveyTitle || formId}.csv`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("CSV 다운로드 실패:", error);
      alert("CSV 파일 다운로드에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsDownloading(false);
    }
  };

  const menuItems = [
    {
      label: "CSV 파일로 다운로드",
      onClick: handleDownloadCsv,
    },
  ];

  useSetHeader({ title: "폼 응답 결과", menuItems });

  if (isLoading) {
    return (
      <AdminShell>
        <AdminPage>
          <LoadingSpinner message="설문 응답 결과를 불러오는 중입니다..." />
        </AdminPage>
      </AdminShell>
    );
  }

  if (!formResultData) {
    return (
      <AdminShell>
        <AdminPage>
          <AdminHero style={{ flexDirection: "column", alignItems: "flex-start" }}>
            <BackButton type="button" onClick={() => navigate(-1)}>
              ‹ 뒤로가기
            </BackButton>
            <AdminHeroTitle>설문 결과를 찾을 수 없습니다</AdminHeroTitle>
            <AdminHeroDescription>
              삭제되었거나 잘못된 접근입니다. 설문 목록에서 다시 확인해주세요.
            </AdminHeroDescription>
          </AdminHero>
          <AdminEmptyState>
            <AdminEmptyTitle>조회 가능한 설문 결과가 없습니다.</AdminEmptyTitle>
            <AdminEmptyDescription>
              요청하신 설문 ID가 존재하지 않거나 권한이 없습니다.
            </AdminEmptyDescription>
            <AdminButton
              type="button"
              $tone="primary"
              onClick={() => navigate(-1)}
              style={{ marginTop: 12 }}
            >
              목록으로 돌아가기
            </AdminButton>
          </AdminEmptyState>
        </AdminPage>
      </AdminShell>
    );
  }

  const startDateFormatted = formatDeadlineDate(formResultData.startDate);
  const endDateFormatted = formatDeadlineDate(formResultData.endDate);
  const isExpired = new Date(formResultData.endDate) < new Date();

  return (
    <AdminShell>
      <AdminPage>
        <AdminHero style={{ flexDirection: "column", alignItems: "stretch", gap: 16 }}>
          <HeaderTopRow>
            <BackButton type="button" onClick={() => navigate(-1)}>
              ‹ 목록으로
            </BackButton>
            <AdminBadge $tone={isExpired ? "slate" : "green"}>
              {isExpired ? "설문 마감" : "설문 진행 중"}
            </AdminBadge>
          </HeaderTopRow>

          <TitleActionRow>
            <div>
              <AdminHeroTitle>{formResultData.surveyTitle}</AdminHeroTitle>
              <PeriodText>
                기간: {startDateFormatted} ~ {endDateFormatted}
              </PeriodText>
            </div>
            <AdminButton
              type="button"
              $tone="primary"
              disabled={isDownloading}
              onClick={handleDownloadCsv}
            >
              {isDownloading ? "파일 생성 중..." : "CSV 파일 다운로드"}
            </AdminButton>
          </TitleActionRow>
        </AdminHero>

        {/* 종합 응답 요약 카드 */}
        <SummaryCard>
          <SummaryItem>
            <SummaryLabel>총 참여 인원</SummaryLabel>
            <SummaryValue>
              <HighlightNumber>{totalCount.toLocaleString()}</HighlightNumber>
              <UnitText>명</UnitText>
            </SummaryValue>
          </SummaryItem>
          <SummaryDivider />
          <SummaryItem>
            <SummaryLabel>설문 문항 수</SummaryLabel>
            <SummaryValue>
              <HighlightNumber>
                {formResultData.questionResults?.length ?? 0}
              </HighlightNumber>
              <UnitText>개</UnitText>
            </SummaryValue>
          </SummaryItem>
          <SummaryDivider />
          <SummaryItem>
            <SummaryLabel>설문 상태</SummaryLabel>
            <SummaryValue>
              <StatusLabel $expired={isExpired}>
                {isExpired ? "마감됨" : "실시간 응답 중"}
              </StatusLabel>
            </SummaryValue>
          </SummaryItem>
        </SummaryCard>

        {/* 질문 문항별 상세 통계 */}
        <QuestionsSection>
          <SectionHeading>문항별 응답 상세</SectionHeading>

          {formResultData.questionResults.map((question, qIdx) => {
            const isShort = question.questionType === "SHORT_ANSWER";

            const totalVotes = isShort
              ? question.shortAnswers.length
              : question.optionResults.reduce((sum, opt) => sum + opt.count, 0);

            const unanswered = Math.max(
              0,
              formResultData.totalResponses - totalVotes,
            );

            return (
              <AdminCard key={question.questionId}>
                <QuestionCardHeader>
                  <QuestionTitleArea>
                    <QuestionNumberTag>문항 {qIdx + 1}</QuestionNumberTag>
                    <QuestionName>{question.questionText}</QuestionName>
                  </QuestionTitleArea>
                  <HeaderMetaArea>
                    <AdminBadge $tone={isShort ? "blue" : "amber"}>
                      {isShort ? "주관식" : "객관식"}
                    </AdminBadge>
                    <AnswerCountMeta>
                      응답 <strong>{totalVotes}</strong> / 미응답{" "}
                      <strong>{unanswered}</strong>
                    </AnswerCountMeta>
                  </HeaderMetaArea>
                </QuestionCardHeader>

                {/* 객관식: 수평 프로그레스 바 차트 */}
                {!isShort && (
                  <HorizontalBarWrapper>
                    {question.optionResults.length === 0 ? (
                      <EmptyAnswerText>설정된 선택지가 없습니다.</EmptyAnswerText>
                    ) : (
                      question.optionResults.map((opt) => {
                        const percent = opt.percentage ?? 0;
                        return (
                          <BarRow key={opt.optionId}>
                            <BarTextRow>
                              <OptionLabel>{opt.optionText}</OptionLabel>
                              <OptionCount>
                                <strong>{opt.count}명</strong>
                                <PercentText>({percent.toFixed(1)}%)</PercentText>
                              </OptionCount>
                            </BarTextRow>
                            <TrackBackground>
                              <FillBar $percentage={Math.min(100, Math.max(0, percent))} />
                            </TrackBackground>
                          </BarRow>
                        );
                      })
                    )}
                  </HorizontalBarWrapper>
                )}

                {/* 주관식: 정갈한 응답 리스트 */}
                {isShort && (
                  <ShortAnswersWrapper>
                    {question.shortAnswers.length === 0 ? (
                      <EmptyAnswerText>등록된 주관식 답변이 없습니다.</EmptyAnswerText>
                    ) : (
                      <ShortAnswersList>
                        {question.shortAnswers.map((answer, aIdx) => (
                          <ShortAnswerItem key={aIdx}>
                            <AnswerIndex>{aIdx + 1}</AnswerIndex>
                            <AnswerContent>{answer}</AnswerContent>
                          </ShortAnswerItem>
                        ))}
                      </ShortAnswersList>
                    )}
                  </ShortAnswersWrapper>
                )}
              </AdminCard>
            );
          })}
        </QuestionsSection>
      </AdminPage>
    </AdminShell>
  );
};

export default FormResultPage;

const HeaderTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BackButton = styled.button`
  border: none;
  background: transparent;
  color: #6b7684;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 0;
  transition: color 0.15s ease;

  &:hover {
    color: #191f28;
  }
`;

const TitleActionRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: space-between;

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: flex-end;
  }
`;

const PeriodText = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #8b95a1;
  margin-top: 6px;
`;

const SummaryCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 20px;
  padding: 20px 24px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);

  @media (min-width: 640px) {
    grid-template-columns: 1fr auto 1fr auto 1fr;
    align-items: center;
    gap: 20px;
  }
`;

const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SummaryLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #6b7684;
`;

const SummaryValue = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
`;

const HighlightNumber = styled.span`
  font-size: 26px;
  font-weight: 800;
  color: #191f28;
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
`;

const UnitText = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #8b95a1;
`;

const StatusLabel = styled.span<{ $expired: boolean }>`
  font-size: 17px;
  font-weight: 700;
  color: ${({ $expired }) => ($expired ? "#8b95a1" : "#04b05c")};
`;

const SummaryDivider = styled.div`
  display: none;
  width: 1px;
  height: 36px;
  background: #f2f4f6;

  @media (min-width: 640px) {
    display: block;
  }
`;

const QuestionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const SectionHeading = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #191f28;
  letter-spacing: -0.3px;
  margin: 8px 0 0;
`;

const QuestionCardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f2f4f6;

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }
`;

const QuestionTitleArea = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex: 1;
`;

const QuestionNumberTag = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #3182f6;
  background: #e8f3ff;
  padding: 3px 8px;
  border-radius: 6px;
  white-space: nowrap;
`;

const QuestionName = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #191f28;
  line-height: 1.4;
  margin: 0;
`;

const HeaderMetaArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
`;

const AnswerCountMeta = styled.span`
  font-size: 12px;
  color: #8b95a1;

  strong {
    color: #4e5968;
    font-weight: 600;
  }
`;

const HorizontalBarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 8px;
`;

const BarRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const BarTextRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 14px;
`;

const OptionLabel = styled.span`
  font-weight: 600;
  color: #333d4b;
  word-break: break-all;
`;

const OptionCount = styled.span`
  font-size: 13px;
  color: #4e5968;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;

  strong {
    color: #191f28;
    font-weight: 700;
  }
`;

const PercentText = styled.span`
  color: #3182f6;
  font-weight: 600;
`;

const TrackBackground = styled.div`
  width: 100%;
  height: 10px;
  background: #f2f4f6;
  border-radius: 6px;
  overflow: hidden;
`;

const FillBar = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${({ $percentage }) => $percentage}%;
  background: #3182f6;
  border-radius: 6px;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
`;

const ShortAnswersWrapper = styled.div`
  padding-top: 8px;
`;

const ShortAnswersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 380px;
  overflow-y: auto;
  padding-right: 4px;
`;

const ShortAnswerItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #f2f4f6;
`;

const AnswerIndex = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #8b95a1;
  min-width: 20px;
  text-align: center;
  padding-top: 1px;
`;

const AnswerContent = styled.p`
  font-size: 14px;
  color: #191f28;
  line-height: 1.5;
  margin: 0;
  word-break: break-word;
`;

const EmptyAnswerText = styled.div`
  padding: 24px;
  text-align: center;
  font-size: 13px;
  color: #8b95a1;
`;
