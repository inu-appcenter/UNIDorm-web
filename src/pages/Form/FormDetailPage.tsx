import styled from "styled-components";
import Header from "../../components/common/Header/Header.tsx";
import FormContent from "../../components/form/FormContent.tsx";
import FormField from "../../components/complain/FormField.tsx";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import { useEffect, useState } from "react";
import arrowright from "../../assets/arrow-right.svg";
import { formatDeadlineDate } from "../../utils/dateUtils.ts";
import { SurveyDetail } from "../../types/formTypes.ts";
import {
  closeSurvey,
  deleteSurvey,
  getSurveyDetail,
  submitSurveyResponse,
} from "../../apis/formApis.ts";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import { Input } from "../../styles/complain.ts";

const FormDetailPage = () => {
  const navigate = useNavigate();

  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<SurveyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // 답변 상태 (문항 순서대로 관리)
  const [answers, setAnswers] = useState<(string | number | number[] | null)[]>(
    [],
  );

  // 텍스트 입력 변경 핸들러
  const handleTextChange = (questionIndex: number, value: string) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = value;
      return newAnswers;
    });
  };

  // 단일 선택 칩 핸들러
  const handleSingleChipSelect = (questionIndex: number, chipIndex: number) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = chipIndex;
      return newAnswers;
    });
  };

  // 다중 선택 칩 핸들러
  const handleMultiChipSelect = (
    questionIndex: number,
    selectedIndices: number[],
  ) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = selectedIndices;
      return newAnswers;
    });
  };

  useEffect(() => {
    const getFormList = async () => {
      if (!formId) return;
      try {
        setIsLoading(true);
        const res = await getSurveyDetail(Number(formId));
        setForm(res.data);

        if (res.data && res.data.questions) {
          setAnswers(new Array(res.data.questions.length).fill(null));
        }
      } catch (e) {
        console.error("폼 상세정보 불러오기 실패", e);
      } finally {
        setIsLoading(false);
      }
    };
    getFormList();
  }, [formId]);

  const handleSubmit = async () => {
    if (!form || !form.questions) return;

    const hasMissingRequired = form.questions.some((q, i) => {
      if (!q.required) return false;
      const ans = answers[i];
      return (
        ans === null || ans === "" || (Array.isArray(ans) && ans.length === 0)
      );
    });
    if (hasMissingRequired) {
      alert("필수 질문에 답변을 모두 입력해주세요.");
      return;
    }

    try {
      console.log("폼 제출 시도");
      setIsSubmitLoading(true);

      // 1️⃣ SurveyResponseRequest 구조에 맞게 변환
      const responseData = {
        surveyId: form.id, // 설문 ID
        answers: form.questions.map((question, index) => {
          const userAnswer = answers[index];

          // 기본 구조
          const answer: {
            questionId: number;
            optionIds: number[];
            answerText: string | null;
          } = {
            questionId: question.id,
            optionIds: [],
            answerText: null,
          };

          // 주관식
          if (question.questionType === "SHORT_ANSWER") {
            answer.answerText = (userAnswer as string) || null;
          }

          // 객관식 (단일 or 다중)
          if (question.questionType === "MULTIPLE_CHOICE") {
            if (question.allowMultipleSelection) {
              // 다중 선택
              answer.optionIds = Array.isArray(userAnswer)
                ? userAnswer
                    .map((idx: number) => question.options[idx]?.id)
                    .filter((id): id is number => !!id)
                : [];
            } else {
              // 단일 선택
              const optionIndex = userAnswer as number | null;
              if (
                typeof optionIndex === "number" &&
                question.options[optionIndex]
              ) {
                answer.optionIds = [question.options[optionIndex].id];
              }
            }
          }

          return answer;
        }),
      };

      console.log("제출 요청 데이터:", responseData);

      // 2️⃣ API 호출
      const res = await submitSurveyResponse(responseData);

      console.log("폼 제출 성공:", res.data); // res.data는 number (응답 ID)
      alert("제출이 완료되었습니다!");
      navigate(-1);
    } catch (e) {
      console.error("폼 제출 실패", e);
      alert("제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleFormClose = async () => {
    if (!formId) return;
    if (
      !window.confirm(
        "정말 마감할까요?\n더 이상 응답을 받지 않으며, 이 작업은 되돌릴 수 없습니다.",
      )
    )
      return;
    try {
      const res = closeSurvey(Number(formId));
      console.log("폼 마감 처리 성공", res);
      alert("마감 처리 되었습니다.");
      // navigate(-1);
    } catch (err) {
      alert("마감 처리에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!formId) return;
    if (!window.confirm("정말 삭제할까요?\n이 작업은 되돌릴 수 없습니다."))
      return;
    try {
      const res = deleteSurvey(Number(formId));
      console.log("폼 삭제 성공", res);
      alert("삭제되었습니다.");
      navigate(-1);
    } catch (err) {
      alert("삭제에 실패했습니다.");
    }
  };

  const menuItems = [
    {
      label: "수정하기",
      onClick: () => alert("구현 예정"),
      // navigate("/tips/write", { state: { tip: tip, tipImages: images } }),
    },
    {
      label: "설문 마감하기",
      onClick: handleFormClose,
    },
    {
      label: "삭제하기",
      onClick: handleDelete,
    },
  ];

  return (
    <PageWrapper>
      <Header title={"폼 상세"} hasBack={true} menuItems={menuItems} />
      {isSubmitLoading && <LoadingSpinner overlay={true} />}
      <FormBox>
        {isLoading ? (
          <LoadingSpinner />
        ) : form ? (
          <>
            <FormContent
              closed={form.closed}
              duration={`${formatDeadlineDate(form.startDate)} ~ ${formatDeadlineDate(form.endDate)}`}
              title={form.title}
              description={form.description}
              miniView={false}
            />

            {/* 질문 리스트 */}
            {form.questions.map((question, index) => {
              if (question.questionType === "SHORT_ANSWER") {
                return (
                  <FormField
                    label={`${index + 1}. ${question.questionText}`}
                    required={question.required}
                    key={index}
                  >
                    <Input
                      placeholder="답변을 입력하세요"
                      value={(answers[index] as string) || ""}
                      onChange={(e) => handleTextChange(index, e.target.value)}
                    />
                  </FormField>
                );
              }

              if (question.questionType === "MULTIPLE_CHOICE") {
                const options = question.options.map((opt) => opt.optionText);
                if (question.allowMultipleSelection) {
                  // 다중 선택
                  return (
                    <FormField
                      label={`${index + 1}. ${question.questionText}`}
                      required={question.required}
                      key={index}
                    >
                      <SelectableChipGroup
                        Groups={options}
                        selectedIndices={(answers[index] as number[]) || []}
                        onSelect={(selectedIndices) =>
                          handleMultiChipSelect(index, selectedIndices)
                        }
                        multi={true}
                      />
                    </FormField>
                  );
                } else {
                  // 단일 선택
                  return (
                    <FormField
                      label={`${index + 1}. ${question.questionText}`}
                      required={question.required}
                      key={index}
                    >
                      <SelectableChipGroup
                        Groups={options}
                        selectedIndex={answers[index] as number | null}
                        onSelect={(chipIndex) =>
                          handleSingleChipSelect(index, chipIndex)
                        }
                        multi={false}
                      />
                    </FormField>
                  );
                }
              }

              return null;
            })}
          </>
        ) : (
          <></>
        )}

        <LastLine>
          <Button onClick={handleSubmit}>
            신청 <img src={arrowright} />
          </Button>
        </LastLine>
      </FormBox>
    </PageWrapper>
  );
};

export default FormDetailPage;

// ... (styled-components 코드는 동일)
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

const FormBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: fit-content;
  gap: 32px;
  align-items: center;

  padding: 16px;
  box-sizing: border-box;

  border-radius: 16px;
  background: #fff;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.25);
`;

const LastLine = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: end;
`;
const Button = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;

  border-radius: 23px;
  background: var(--m-1, #0a84ff);
  padding: 4px 16px;
  box-sizing: border-box;

  color: var(--7, #f4f4f4);
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px; /* 171.429% */
  letter-spacing: 0.38px;
`;
