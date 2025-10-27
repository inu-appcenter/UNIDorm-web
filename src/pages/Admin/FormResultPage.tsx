import styled from "styled-components";
import Header from "../../components/common/Header/Header.tsx";
import { useEffect, useState } from "react";
import { SurveyResults } from "../../types/formTypes.ts"; // OptionResult 임포트 제거 (차트 컴포넌트로 이동)
import { getSurveyResults } from "../../apis/formApis.ts";
import { useParams } from "react-router-dom";
import { FormBoxBlue } from "../../styles/form.ts";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import FormResultHeader from "../../components/form/FormResultHeader.tsx";
import FormResultQuestionHeader from "../../components/form/FormResultQuestionHeader.tsx";
// recharts 임포트 제거 (차트 컴포넌트로 이동)

// 분리한 차트 컴포넌트와 COLORS 배열을 임포트합니다.
// (경로는 실제 파일 위치에 맞게 조정하세요)
import MultipleChoiceResultChart, {
  COLORS,
} from "../../components/form/MultipleChoiceResultChart.tsx";

// --- 차트 색상 --- (제거)
// --- 차트 내부 커스텀 라벨 --- (제거)
// --- 객관식 결과 차트 컴포넌트 --- (제거)

// --- 메인 페이지 컴포넌트 ---
const FormResultPage = () => {
  const { formId } = useParams<{ formId: string }>();

  const [isLoading, setIsLoading] = useState(false);
  const [formResultData, setFormResultData] = useState<SurveyResults | null>(
    null,
  );

  useEffect(() => {
    const getResultData = async () => {
      try {
        setIsLoading(true);
        const res = await getSurveyResults(Number(formId));
        console.log("폼 결과 데이터 불러오기 성공", res);
        setFormResultData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    getResultData();
  }, [formId]); // formId가 변경될 때마다 다시 불러오도록 수정

  const menuItems = [
    {
      label: "엑셀 파일로 다운로드",
      onClick: () => {
        alert("엑셀 다운로드 기능 구현 예정");
      },
    },
  ];

  return (
    <PageWrapper>
      <Header hasBack={true} title="폼 결과 보기" menuItems={menuItems} />
      <FormBoxBlue>
        {isLoading ? (
          <LoadingSpinner message={"폼을 불러오는 중 ..."} />
        ) : formResultData ? (
          <>
            <FormResultHeader
              status={"진행중"} // API 응답에 status가 없어서 임시 하드코딩
              duration={
                "1.10 ~ 1.13" // API 응답에 날짜가 없어서 임시 하드코딩
                // `${formatDeadlineDate(formResultData.startDate)} ~ ${formatDeadlineDate(formResultData.endDate)}`
              }
              title={formResultData.surveyTitle}
              viewCount={formResultData.totalResponses}
            />

            {/* 질문 리스트 */}
            {formResultData.questionResults.map((question, index) => {
              if (question.questionType === "SHORT_ANSWER") {
                //주관식 문항인 경우
                return (
                  <FormBoxBlue key={question.questionId}>
                    <FormResultQuestionHeader
                      question={`${index + 1}. ${question.questionText}`}
                      type={question.questionType}
                      answerCount={question.shortAnswers.length}
                      unanswerCount={0} // API에 정보가 없음
                    />
                    <AnswerListWrapper>
                      {question.shortAnswers.length > 0 ? (
                        question.shortAnswers.map((answer, index) => (
                          <ChoiceAnswer key={index}>{answer}</ChoiceAnswer>
                        ))
                      ) : (
                        <EmptyChartMessage>
                          응답 기록이 없습니다.
                        </EmptyChartMessage>
                      )}
                    </AnswerListWrapper>
                  </FormBoxBlue>
                );
              }

              if (question.questionType === "MULTIPLE_CHOICE") {
                //객관식 문항인 경우
                // 총 응답 수 계산 (unanswerCount를 모르기 때문에, option의 count 합계로 대체)
                const totalVotes = question.optionResults.reduce(
                  (sum, opt) => sum + opt.count,
                  0,
                );

                return (
                  <FormBoxBlue key={question.questionId}>
                    <FormResultQuestionHeader
                      question={`${index + 1}. ${question.questionText}`}
                      type={question.questionType}
                      answerCount={totalVotes}
                      unanswerCount={0} // API에 정보가 없음
                    />
                    {/* 차트 컴포넌트 렌더링 */}
                    <MultipleChoiceResultChart data={question.optionResults} />

                    {/* 차트 하단에 텍스트로도 결과 표시 (범례 역할) */}
                    <ChoiceAnswerList>
                      {question.optionResults.map(
                        (
                          opt,
                          index, // index 추가
                        ) => (
                          <ChoiceResultItem key={opt.optionId}>
                            {/* 색상 정보 표시용 div 추가 */}
                            <div
                              className="color-swatch"
                              style={{
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />
                            <span>{opt.optionText}</span>
                            <span className="count">
                              {opt.count}명 ({opt.percentage.toFixed(1)}%)
                            </span>
                          </ChoiceResultItem>
                        ),
                      )}
                    </ChoiceAnswerList>
                  </FormBoxBlue>
                );
              }

              return null;
            })}
          </>
        ) : (
          <EmptyMessage>삭제된 폼이거나, 오류가 발생했습니다.</EmptyMessage>
        )}
      </FormBoxBlue>
    </PageWrapper>
  );
};

export default FormResultPage;

// --- Styled Components ---

const PageWrapper = styled.div`
  padding: 90px 16px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  box-sizing: border-box;

  overflow-y: auto;
  background-color: white;
  flex: 1;
  align-items: center; // 🖥️ PC 레이아웃을 위해 중앙 정렬 추가

  .description {
    font-size: 14px;
  }
`;

const EmptyMessage = styled.div`
  padding: 24px;
  text-align: center;
  color: #aaa;
  font-size: 14px;
`;

// 주관식 답변 목록 패딩용 래퍼
const AnswerListWrapper = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: #fcfcfc;
  width: 100%;
`;

const ChoiceAnswer = styled.div`
  display: flex;
  width: 100%;
  padding: 10px 12px; // 패딩 조정
  box-sizing: border-box;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.04);

  color: var(--5, #6c6c74);
  font-size: 14px;
  font-style: normal;
  font-weight: 500; // 두께 조정
  line-height: normal;
`;

const EmptyChartMessage = styled.div`
  width: 100%;
  padding: 48px 16px;
  text-align: center;
  font-size: 14px;
  color: #999;
  box-sizing: border-box;
`;

// 객관식 텍스트 결과 목록
const ChoiceAnswerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px; // 간격 조정
  padding: 16px;
  background-color: #fcfcfc;
  border-top: 1px solid #f0f0f0;
  width: 100%;
`;

// 객관식 텍스트 결과 항목 (색상 표시를 위해 수정)
const ChoiceResultItem = styled.div`
  display: flex;
  /* justify-content: space-between; <-- 이 속성 대신 margin-right: auto 사용 */
  align-items: center;
  font-size: 15px;
  color: #333;

  .color-swatch {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    margin-right: 8px;
    flex-shrink: 0; /* 크기가 줄어들지 않도록 설정 */
  }

  span:first-child {
    font-weight: 600; // 옵션 텍스트
    margin-right: auto; /* 옵션 텍스트와 카운트 사이를 밀어냄 */
  }
  span.count {
    color: #555;
    font-weight: 500;
    font-size: 14px;
    flex-shrink: 0; /* 크기가 줄어들지 않도록 설정 */
    margin-left: 8px; /* 옵션 텍스트와 최소 간격 확보 */
  }
`;
