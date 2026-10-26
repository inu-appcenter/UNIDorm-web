import { useState, useMemo } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { getSurveyResultExcel } from "@/apis/formApis";
import { useSurveyResults } from "@/queries/surveys";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { formatDeadlineDate } from "@/utils/dateUtils";
import { useSetHeader } from "@/hooks/useSetHeader";
import { useCountUp } from "@/hooks/useCountUp";

export default function FormResultPage() {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const [shortAnswerSearch, setShortAnswerSearch] = useState<Record<number, string>>({});

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
        "응답 데이터를 CSV 파일로 다운로드할까요?\n응답 수에 따라 몇 초 정도 걸릴 수 있어요.",
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
      alert("CSV 파일 다운로드에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setIsDownloading(false);
    }
  };

  const menuItems = useMemo(
    () => [
      {
        label: "CSV 결과 다운로드",
        onClick: handleDownloadCsv,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formResultData, formId],
  );

  useSetHeader({ title: "설문 응답 결과", menuItems });

  if (isLoading) {
    return (
      <PageRoot>
        <LoadingSpinner message="설문 응답 결과를 불러오는 중입니다..." />
      </PageRoot>
    );
  }

  if (!formResultData) {
    return (
      <PageRoot>
        <ContentContainer>
          <EmptyContainer>
            <EmptyTitle>설문 결과를 찾을 수 없어요</EmptyTitle>
            <EmptyDescription>
              삭제되었거나 요청하신 설문 ID가 존재하지 않아요.
            </EmptyDescription>
            <PrimaryActionButton type="button" onClick={() => navigate(-1)}>
              목록으로 돌아가기
            </PrimaryActionButton>
          </EmptyContainer>
        </ContentContainer>
      </PageRoot>
    );
  }

  const startDateFormatted = formatDeadlineDate(formResultData.startDate);
  const endDateFormatted = formatDeadlineDate(formResultData.endDate);
  const isExpired = new Date(formResultData.endDate) < new Date();

  return (
    <PageRoot>
      <ContentContainer>
        {/* 상단 설문 개요 및 CSV 다운로드 바 */}
        <HeaderInfoCard>
          <HeaderLeft>
            <BadgeRow>
              <StatusBadge $expired={isExpired}>
                {isExpired ? "설문 마감" : "설문 진행 중"}
              </StatusBadge>
              <PeriodText>
                기간: {startDateFormatted} ~ {endDateFormatted}
              </PeriodText>
            </BadgeRow>
            <SurveyTitle>{formResultData.surveyTitle}</SurveyTitle>
          </HeaderLeft>

          <DesktopDownloadButton
            type="button"
            disabled={isDownloading}
            onClick={handleDownloadCsv}
          >
            {isDownloading ? "다운로드 중..." : "CSV 결과 다운로드"}
          </DesktopDownloadButton>
        </HeaderInfoCard>

        {/* 종합 응답 요약 3대 KPI 카드 */}
        <KpiGrid>
          <KpiCard>
            <KpiLabel>총 참여 인원</KpiLabel>
            <KpiValueWrap>
              <KpiHighlight style={{ color: "#3182f6" }}>
                {totalCount.toLocaleString()}
              </KpiHighlight>
              <KpiUnit>명</KpiUnit>
            </KpiValueWrap>
          </KpiCard>

          <KpiCard>
            <KpiLabel>총 설문 문항</KpiLabel>
            <KpiValueWrap>
              <KpiHighlight>
                {formResultData.questionResults?.length ?? 0}
              </KpiHighlight>
              <KpiUnit>개</KpiUnit>
            </KpiValueWrap>
          </KpiCard>

          <KpiCard>
            <KpiLabel>설문 진행 상태</KpiLabel>
            <KpiValueWrap>
              <StatusHighlight $expired={isExpired}>
                {isExpired ? "마감" : "진행 중"}
              </StatusHighlight>
            </KpiValueWrap>
          </KpiCard>
        </KpiGrid>

        {/* 질문 문항별 상세 통계 섹션 */}
        <QuestionsSection>
          <SectionTitle>문항별 응답 상세</SectionTitle>

          {formResultData.questionResults.map((question, qIdx) => {
            const isShort = question.questionType === "SHORT_ANSWER";
            const totalVotes = isShort
              ? question.shortAnswers.length
              : question.optionResults.reduce((sum, opt) => sum + opt.count, 0);

            const unanswered = Math.max(
              0,
              formResultData.totalResponses - totalVotes,
            );

            // 주관식 검색 필터링
            const kw = (shortAnswerSearch[question.questionId] || "").trim().toLowerCase();
            const filteredAnswers = isShort
              ? kw
                ? question.shortAnswers.filter((a) => a.toLowerCase().includes(kw))
                : question.shortAnswers
              : [];

            return (
              <QuestionCard key={question.questionId}>
                <QuestionCardHeader>
                  <QuestionTitleGroup>
                    <QuestionNumBadge>Q{qIdx + 1}</QuestionNumBadge>
                    <QuestionNameText>{question.questionText}</QuestionNameText>
                  </QuestionTitleGroup>

                  <HeaderMetaGroup>
                    <TypeBadge $isShort={isShort}>
                      {isShort ? "주관식" : "객관식"}
                    </TypeBadge>
                    <MetaVotesText>
                      응답 <strong>{totalVotes}명</strong> / 미응답{" "}
                      <strong>{unanswered}명</strong>
                    </MetaVotesText>
                  </HeaderMetaGroup>
                </QuestionCardHeader>

                {/* 객관식: 블루 단일 톤 수평 막대 그래프 */}
                {!isShort && (
                  <OptionResultsWrapper>
                    {question.optionResults.length === 0 ? (
                      <EmptyAnswerText>설정된 선택지가 없어요.</EmptyAnswerText>
                    ) : (
                      question.optionResults.map((opt) => {
                        const percent = opt.percentage ?? 0;
                        return (
                          <OptionBarRow key={opt.optionId}>
                            <OptionTextRow>
                              <OptionName>{opt.optionText}</OptionName>
                              <OptionStats>
                                <strong>{opt.count}명</strong>
                                <PercentText>({percent.toFixed(1)}%)</PercentText>
                              </OptionStats>
                            </OptionTextRow>
                            <ProgressTrack>
                              <ProgressFill
                                style={{
                                  width: `${Math.min(100, Math.max(0, percent))}%`,
                                }}
                              />
                            </ProgressTrack>
                          </OptionBarRow>
                        );
                      })
                    )}
                  </OptionResultsWrapper>
                )}

                {/* 주관식: 답변 목록 및 검색 */}
                {isShort && (
                  <ShortAnswersWrapper>
                    {question.shortAnswers.length > 5 && (
                      <ShortSearchInput
                        type="text"
                        placeholder="주관식 답변 내 키워드 검색..."
                        value={shortAnswerSearch[question.questionId] || ""}
                        onChange={(e) =>
                          setShortAnswerSearch((prev) => ({
                            ...prev,
                            [question.questionId]: e.target.value,
                          }))
                        }
                      />
                    )}

                    {question.shortAnswers.length === 0 ? (
                      <EmptyAnswerText>등록된 주관식 답변이 없어요.</EmptyAnswerText>
                    ) : filteredAnswers.length === 0 ? (
                      <EmptyAnswerText>검색 결과와 일치하는 답변이 없어요.</EmptyAnswerText>
                    ) : (
                      <AnswersList>
                        {filteredAnswers.map((answer, aIdx) => (
                          <AnswerItem key={aIdx}>
                            <AnswerIndex>{aIdx + 1}</AnswerIndex>
                            <AnswerText>{answer}</AnswerText>
                          </AnswerItem>
                        ))}
                      </AnswersList>
                    )}
                  </ShortAnswersWrapper>
                )}
              </QuestionCard>
            );
          })}
        </QuestionsSection>
      </ContentContainer>

      {/* 모바일 하단 고정 CTA */}
      <MobileFixedCTA>
        <MobileCTAButton
          type="button"
          disabled={isDownloading}
          onClick={handleDownloadCsv}
        >
          {isDownloading ? "파일 다운로드 중..." : "CSV 결과 파일 다운로드"}
        </MobileCTAButton>
      </MobileFixedCTA>
    </PageRoot>
  );
}

/* ================= Styled Components ================= */

const PageRoot = styled.div`
  width: 100%;
  min-height: 100%;
  padding: 16px 20px calc(90px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  overflow-x: hidden;

  @media (min-width: 1024px) {
    padding: 24px 32px 60px;
  }
`;

const ContentContainer = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const HeaderInfoCard = styled.div`
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const StatusBadge = styled.span<{ $expired: boolean }>`
  display: inline-flex;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.74rem;
  font-weight: 700;
  background: ${({ $expired }) => ($expired ? "#f2f4f6" : "#e6f8ef")};
  color: ${({ $expired }) => ($expired ? "#6b7684" : "#04b05c")};
`;

const PeriodText = styled.span`
  font-size: 0.8rem;
  color: #8b95a1;
`;

const SurveyTitle = styled.h1`
  font-size: 1.35rem;
  font-weight: 800;
  color: #191f28;
  margin: 0;
  line-height: 1.3;
`;

const DesktopDownloadButton = styled.button`
  display: none;

  @media (min-width: 768px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    padding: 0 20px;
    border-radius: 12px;
    background: #3182f6;
    color: #ffffff;
    font-size: 0.92rem;
    font-weight: 700;
    border: none;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s ease-out;

    &:hover:not(:disabled) {
      background: #1b64da;
    }

    &:disabled {
      opacity: 0.6;
      cursor: wait;
    }
  }
`;

/* 3대 KPI 카드 */
const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 640px) {
    gap: 8px;
  }
`;

const KpiCard = styled.div`
  background: #ffffff;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 6px;

  @media (max-width: 640px) {
    padding: 14px 10px;
    border-radius: 14px;
  }
`;

const KpiLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: #4e5968;
`;

const KpiValueWrap = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
`;

const KpiHighlight = styled.span`
  font-size: 1.45rem;
  font-weight: 800;
  color: #191f28;
  letter-spacing: -0.02em;

  @media (max-width: 640px) {
    font-size: 1.15rem;
  }
`;

const KpiUnit = styled.span`
  font-size: 0.84rem;
  font-weight: 600;
  color: #8b95a1;
`;

const StatusHighlight = styled.span<{ $expired: boolean }>`
  font-size: 1.15rem;
  font-weight: 800;
  color: ${({ $expired }) => ($expired ? "#6b7684" : "#04b05c")};

  @media (max-width: 640px) {
    font-size: 0.95rem;
  }
`;

/* 질문 목록 섹션 */
const QuestionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 1.15rem;
  font-weight: 800;
  color: #191f28;
  margin: 8px 0 0;
`;

const QuestionCard = styled.div`
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 640px) {
    padding: 18px;
    border-radius: 16px;
  }
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

const QuestionTitleGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
`;

const QuestionNumBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  border-radius: 8px;
  background: #e8f3ff;
  color: #3182f6;
  font-size: 0.8rem;
  font-weight: 800;
  flex-shrink: 0;
`;

const QuestionNameText = styled.h3`
  font-size: 1.05rem;
  font-weight: 800;
  color: #191f28;
  margin: 0;
  line-height: 1.4;
`;

const HeaderMetaGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`;

const TypeBadge = styled.span<{ $isShort: boolean }>`
  display: inline-flex;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.74rem;
  font-weight: 700;
  background: ${({ $isShort }) => ($isShort ? "#e8f3ff" : "#fff3e0")};
  color: ${({ $isShort }) => ($isShort ? "#3182f6" : "#f59e0b")};
`;

const MetaVotesText = styled.span`
  font-size: 0.8rem;
  color: #6b7684;

  strong {
    color: #191f28;
  }
`;

/* 객관식 프로그레스 바 */
const OptionResultsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const OptionBarRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const OptionTextRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const OptionName = styled.span`
  font-size: 0.92rem;
  font-weight: 600;
  color: #333d4b;
`;

const OptionStats = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.88rem;

  strong {
    color: #191f28;
    font-weight: 700;
  }
`;

const PercentText = styled.span`
  color: #8b95a1;
  font-size: 0.8rem;
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: #f2f4f6;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 999px;
  background: #3182f6;
  transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
`;

/* 주관식 답변 */
const ShortAnswersWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ShortSearchInput = styled.input`
  height: 40px;
  border-radius: 10px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  padding: 0 12px;
  font-size: 0.86rem;
  color: #191f28;
  outline: none;

  &:focus {
    border-color: #3182f6;
    background: #ffffff;
  }
`;

const AnswersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 360px;
  overflow-y: auto;
  padding-right: 4px;
`;

const AnswerItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f9fafb;
  border: 1px solid #f2f4f6;
`;

const AnswerIndex = styled.span`
  font-size: 0.74rem;
  font-weight: 800;
  color: #8b95a1;
  margin-top: 2px;
`;

const AnswerText = styled.span`
  font-size: 0.9rem;
  color: #191f28;
  line-height: 1.5;
  word-break: break-all;
  flex: 1;
`;

const EmptyAnswerText = styled.div`
  padding: 24px 0;
  text-align: center;
  color: #8b95a1;
  font-size: 0.88rem;
`;

/* 빈 상태 */
const EmptyContainer = styled.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 60px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const EmptyTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 800;
  color: #191f28;
  margin: 0;
`;

const EmptyDescription = styled.p`
  font-size: 0.88rem;
  color: #8b95a1;
  margin: 0 0 16px;
`;

const PrimaryActionButton = styled.button`
  height: 46px;
  padding: 0 24px;
  border-radius: 12px;
  border: none;
  background: #3182f6;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #1b64da;
  }
`;

/* 모바일 하단 고정 CTA */
const MobileFixedCTA = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 40;
  background: linear-gradient(to top, #ffffff 70%, rgba(255, 255, 255, 0));
  padding: 12px 20px calc(14px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileCTAButton = styled.button`
  width: 100%;
  height: 52px;
  border-radius: 16px;
  background: #3182f6;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  box-shadow: 0 4px 16px rgba(49, 130, 246, 0.28);
  cursor: pointer;
  transition: all 0.15s ease-out;

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`;
