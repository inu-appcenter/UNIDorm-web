import styled from "styled-components";
import Header from "../../components/common/Header/Header.tsx";
import FormField from "../../components/complain/FormField.tsx";
import { useEffect, useState } from "react";
import arrowright from "../../assets/arrow-right.svg";
import { Input } from "../../styles/complain.ts";
import AddNewFormField from "../../components/form/AddNewFormField.tsx";
import { useLocation, useNavigate } from "react-router-dom";

// [수정] 1. 요청하신 임포트 구문으로 변경 (updateSurvey 추가)
import {
  QuestionCreateRequest,
  SurveyCreateRequest,
  QuestionType,
  OptionCreateRequest,
  // [가정] SurveyUpdateRequest 타입을 import (SurveyCreateRequest와 동일하다고 가정)
  // 만약 타입이 다르다면, 해당 타입을 import 해야 합니다.
  SurveyCreateRequest as SurveyUpdateRequest,
} from "../../types/formTypes.ts";
// [수정] 2. updateSurvey API 임포트
import { createSurvey, updateSurvey } from "../../apis/formApis.ts";
import { AddButton, AddButtonArea } from "../../styles/form.ts";

// (FormOptionState, FormFieldState 인터페이스는 동일)
export interface FormOptionState {
  id: number;
  optionText: string;
}

export interface FormFieldState {
  id: number;
  questionText: string;
  questionType: QuestionType;
  isRequired: boolean;
  allowMultipleSelection: boolean;
  options: FormOptionState[];
}

const FormCreatePage = () => {
  // --- 기본 설문 정보 상태 ---
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // (description)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // (formFields 상태 초기화는 동일)
  const [formFields, setFormFields] = useState<FormFieldState[]>([
    {
      id: Date.now(),
      questionText: "",
      questionType: "SHORT_ANSWER",
      isRequired: true,
      allowMultipleSelection: false,
      options: [],
    },
  ]);

  const location = useLocation();
  // [수정] 3. 수정할 폼 데이터(form) 및 수정 모드(isEditMode) 확인
  const { form } = location.state || {};
  const isEditMode = !!form; // form 객체가 있으면 true (수정 모드)

  // [수정] 4. useEffect 의존성 배열 변경 (기존 []도 문제는 없으나 명시적으로 form 추가)
  // (기존 코드와 동일하게 두어도 무방합니다.)
  useEffect(() => {
    if (form) {
      setTitle(form.title);
      setContent(form.description);
      // [수정] 4-1. 날짜 형식이 datetime-local input에 맞게 변환 (ISO -> YYYY-MM-DDTHH:MM)
      // (서버에서 ISO String (UTC)으로 왔다고 가정)
      const toLocalISOString = (isoString: string) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        // 로컬 시간대로 변환
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        // 'YYYY-MM-DDTHH:MM' 형식으로 자르기
        return date.toISOString().slice(0, 16);
      };

      setStartDate(toLocalISOString(form.startDate));
      setEndDate(toLocalISOString(form.endDate));

      // [중요] form.questions가 FormFieldState[]와 호환되는 구조여야 함
      // (React key를 위한 id 필드가 포함되어 있어야 함)
      setFormFields(form.questions);
    }
  }, [form]); // 의존성 배열에 form 추가

  // (필드 추가, 업데이트, 삭제 핸들러는 기존과 동일)
  const handleAddField = () => {
    setFormFields((prevFields) => [
      ...prevFields,
      {
        id: Date.now(),
        questionText: "",
        questionType: "SHORT_ANSWER",
        isRequired: true,
        allowMultipleSelection: false,
        options: [],
      },
    ]);
  };

  const handleUpdateField = (
    id: number,
    updatedData: Partial<Omit<FormFieldState, "id">>,
  ) => {
    setFormFields((prevFields) =>
      prevFields.map((field) =>
        field.id === id ? { ...field, ...updatedData } : field,
      ),
    );
  };

  const handleRemoveField = (id: number) => {
    if (formFields.length <= 1) {
      alert("최소 1개의 질문이 필요합니다.");
      return;
    }
    setFormFields((prevFields) =>
      prevFields.filter((field) => field.id !== id),
    );
  };

  // [수정] 5. 폼 제출 핸들러 (수정 / 생성 분기 처리)
  const handleSubmit = async () => {
    if (isLoading) return;

    // --- 유효성 검사 (기존과 동일) ---
    if (!title.trim() || !content.trim() || !startDate || !endDate) {
      alert("제목, 설명, 시작 일시, 종료 일시를 모두 입력해주세요.");
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      alert("종료 일시는 시작 일시보다 이후여야 합니다.");
      return;
    }
    const isQuestionsValid = formFields.every(
      (f) => f.questionText.trim() !== "",
    );
    if (!isQuestionsValid) {
      alert("질문 내용을 모두 입력해주세요.");
      return;
    }
    const choiceQuestions = formFields.filter(
      (f) => f.questionType !== "SHORT_ANSWER",
    );
    const isOptionsValid = choiceQuestions.every((f) => f.options.length > 0);
    if (!isOptionsValid) {
      alert("선택형 질문에는 최소 1개 이상의 옵션이 필요합니다.");
      return;
    }
    // --- 유효성 검사 끝 ---

    // [수정] 6. 모드에 따른 확인 메시지
    const action = isEditMode ? "수정" : "등록";
    if (
      !window.confirm(`폼을 ${action}할까요? 내용을 다시한번 확인해주세요.`)
    ) {
      return;
    }
    setIsLoading(true);

    try {
      // API DTO 형식에 맞게 데이터 가공 (기존과 동일)
      const questionsForApi: QuestionCreateRequest[] = formFields.map(
        (field, index) => {
          const optionsForApi: OptionCreateRequest[] = field.options.map(
            (opt, index) => ({
              optionText: opt.optionText,
              optionOrder: index + 1,
            }),
          );

          const apiQuestionData: QuestionCreateRequest = {
            questionText: field.questionText,
            questionType: field.questionType,
            questionOrder: index + 1,
            isRequired: field.isRequired,
            allowMultipleSelection: field.allowMultipleSelection,
            options: optionsForApi,
          };

          if (field.questionType === "SHORT_ANSWER") {
            apiQuestionData.options = [];
            apiQuestionData.allowMultipleSelection = false;
          }

          return apiQuestionData;
        },
      );

      // 날짜 ISO String 변환 (UTC)
      const isoStartDate = new Date(startDate).toISOString();
      const isoEndDate = new Date(endDate).toISOString();

      // [가정] SurveyUpdateRequest가 SurveyCreateRequest와 동일한 구조라고 가정
      const payload: SurveyCreateRequest | SurveyUpdateRequest = {
        title,
        description: content,
        startDate: isoStartDate,
        endDate: isoEndDate,
        questions: questionsForApi,
      };

      // [수정] 7. 모드에 따라 다른 API 호출
      if (isEditMode) {
        // [가정] 수정할 폼의 ID가 form.id (또는 form.surveyId)에 있다고 가정
        if (!form.id) {
          alert("수정할 폼의 ID를 찾을 수 없습니다.");
          setIsLoading(false);
          return;
        }

        console.log("요청 보낼 폼 객체 (수정)", form.id, payload);
        // PUT /surveys/{surveyId} 호출
        await updateSurvey(form.id, payload);
        alert("폼이 성공적으로 수정되었습니다.");
      } else {
        // POST /surveys 호출
        console.log("요청 보낼 폼 객체 (생성)", payload);
        await createSurvey(payload);
        alert("폼이 성공적으로 등록되었습니다.");
      }

      navigate(-1); // (성공 시 공통 이동)
    } catch (error) {
      // [수정] 8. 모드에 따른 동적 에러 메시지
      const errorAction = isEditMode ? "수정" : "생성";
      console.error(`폼 ${errorAction} 실패:`, error);
      alert(`폼 ${errorAction}에 실패했습니다. 입력 내용을 확인해주세요.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      {/* [수정] 9. 헤더 타이틀 동적 변경 */}
      <Header title={isEditMode ? "폼 수정하기" : "폼 만들기"} hasBack={true} />
      <FormBox>
        {/* --- 기본 설문 정보 입력 (폼은 동일) --- */}
        <FormField label="제목">
          <Input
            placeholder="글 제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormField>
        <FormField label="설명">
          <Textarea
            placeholder="내용을 입력해주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </FormField>
        <FormField label="시작 일시">
          <Input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </FormField>
        <FormField label="종료 일시">
          <Input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </FormField>
      </FormBox>

      {/* (질문 필드 맵핑은 동일) */}
      {formFields.map((field) => (
        <AddNewFormField
          key={field.id}
          fieldData={field}
          onUpdate={(updatedData) => handleUpdateField(field.id, updatedData)}
          onRemove={() => handleRemoveField(field.id)}
          canRemove={formFields.length > 1}
        />
      ))}

      {/* (필드 추가 버튼 동일) */}
      <AddButtonArea>
        <AddButton onClick={handleAddField}>{"+"}</AddButton>
        필드 추가
      </AddButtonArea>

      <LastLine>
        {/* [수정] 10. 버튼 텍스트 동적 변경 */}
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading
            ? isEditMode
              ? "수정 중..."
              : "생성 중..."
            : isEditMode
              ? "수정하기"
              : "생성하기"}
          {!isLoading && <img src={arrowright} />}
        </Button>
      </LastLine>
    </PageWrapper>
  );
};

export default FormCreatePage;

// ... (styled-components 코드는 기존과 동일) ...

const PageWrapper = styled.div`
  padding: 90px 16px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  box-sizing: border-box;
  overflow-y: auto;
  background-color: white;
  flex: 1;
  align-items: center;

  .description {
    font-size: 14px;
  }
`;

const FormBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 600px;
  height: fit-content;
  gap: 16px;
  align-items: center;
  padding: 16px;
  box-sizing: border-box;
  border-radius: 16px;
  background: #fff;
  box-shadow:
    0 0 16px 0 rgba(10, 132, 255, 0.25),
    0 0 10px 0 rgba(0, 0, 0, 0.25);
`;

const LastLine = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  max-width: 600px;
  justify-content: end;
`;

const Button = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 23px;
  background: #0a84ff;
  padding: 4px 16px;
  box-sizing: border-box;
  color: #f4f4f4;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: 0.38px;

  &:disabled {
    background: #aaa;
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #eee;
  background: #f8f8f8;
  resize: vertical;
  color: #1c1c1e;
  font-size: 15px;
  font-weight: 500;
  box-sizing: border-box;

  &::placeholder {
    color: #aeaeae;
  }
`;
