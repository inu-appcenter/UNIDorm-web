import styled from "styled-components";
import Header from "../../components/common/Header/Header.tsx";
import FormField from "../../components/complain/FormField.tsx";
import { useState } from "react";
import arrowright from "../../assets/arrow-right.svg";
import { Input } from "../../styles/complain.ts";
import AddNewFormField from "../../components/form/AddNewFormField.tsx";
import { useNavigate } from "react-router-dom";

// [수정] 1. 요청하신 임포트 구문으로 변경
import {
  QuestionCreateRequest,
  SurveyCreateRequest,
  QuestionType, // (formTypes.ts에 정의되어 있다고 가정)
  OptionCreateRequest, // (formTypes.ts에 정의되어 있다고 가정)
} from "../../types/formTypes.ts";
import { createSurvey } from "../../apis/formApis.ts";

// [수정] 2. DTO에 맞춘 로컬 상태 타입 정의
// AddNewFormField에서 옵션을 관리하기 위한 UI용 옵션 상태 (React key 포함)
export interface FormOptionState {
  id: number; // React key
  optionText: string;
}

// AddNewFormField에서 질문을 관리하기 위한 UI용 질문 상태 (React key 포함)
export interface FormFieldState {
  id: number; // React key
  questionText: string;
  questionType: QuestionType; // DTO의 타입
  isRequired: boolean; // DTO의 필드
  allowMultipleSelection: boolean; // DTO의 필드
  options: FormOptionState[]; // UI용 옵션 배열
}

const FormCreatePage = () => {
  // --- 기본 설문 정보 상태 ---
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // (description)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // [수정] 3. DTO의 필드를 반영한 'questions' 상태 초기화
  const [formFields, setFormFields] = useState<FormFieldState[]>([
    {
      id: Date.now(),
      questionText: "",
      questionType: "SHORT_ANSWER", // (QuestionType의 기본값으로 가정)
      isRequired: true,
      allowMultipleSelection: false,
      options: [],
    },
  ]);

  // [수정] 4. 필드 추가 핸들러 (새 DTO 구조에 맞게)
  const handleAddField = () => {
    setFormFields((prevFields) => [
      ...prevFields,
      {
        id: Date.now(),
        questionText: "",
        questionType: "SHORT_ANSWER", // (QuestionType의 기본값으로 가정)
        isRequired: true,
        allowMultipleSelection: false,
        options: [],
      },
    ]);
  };

  // [수정] 5. 질문 업데이트 핸들러 (AddNewFormField로부터 변경된 데이터 받기)
  // (이 핸들러의 시그니처는 변경 없으나, updatedData의 내용이 DTO에 맞게 변경됨)
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

  // [수정] 6. 질문 삭제 핸들러 (변경 없음)
  const handleRemoveField = (id: number) => {
    if (formFields.length <= 1) {
      alert("최소 1개의 질문이 필요합니다.");
      return;
    }
    setFormFields((prevFields) =>
      prevFields.filter((field) => field.id !== id),
    );
  };

  // [수정] 7. 폼 제출 핸들러 (새 DTO 구조에 맞게 API 페이로드 생성)
  const handleSubmit = async () => {
    if (isLoading) return;

    // --- 유효성 검사 ---
    if (!title.trim() || !content.trim() || !startDate || !endDate) {
      alert("제목, 설명, 시작 일시, 종료 일시를 모두 입력해주세요.");
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      alert("종료 일시는 시작 일시보다 이후여야 합니다.");
      return;
    }
    // 질문 유효성 검사
    const isQuestionsValid = formFields.every(
      (f) => f.questionText.trim() !== "",
    );
    if (!isQuestionsValid) {
      alert("질문 내용을 모두 입력해주세요.");
      return;
    }
    // (추가) 옵션이 필요한 질문(CHOICE)에 옵션이 있는지 검사
    const choiceQuestions = formFields.filter(
      (f) => f.questionType !== "SHORT_ANSWER",
    );
    const isOptionsValid = choiceQuestions.every((f) => f.options.length > 0);
    if (!isOptionsValid) {
      alert("선택형 질문에는 최소 1개 이상의 옵션이 필요합니다.");
      return;
    }
    // --- 유효성 검사 끝 ---

    setIsLoading(true);

    try {
      // API DTO 형식에 맞게 데이터 가공
      const questionsForApi: QuestionCreateRequest[] = formFields.map(
        (field, index) => {
          // 1. UI용 options (FormOptionState[])를 API용 (OptionCreateRequest[])로 변환
          // (가정: OptionCreateRequest가 { optionText: string } 라고 가정)
          const optionsForApi: OptionCreateRequest[] = field.options.map(
            (opt, index) => ({
              optionText: opt.optionText,
              optionOrder: index + 1,
            }),
          );

          // 2. 최종 QuestionCreateRequest 객체 생성
          const apiQuestionData: QuestionCreateRequest = {
            questionText: field.questionText,
            questionType: field.questionType,
            questionOrder: index + 1, // DTO에 맞게 1-based 순서 부여
            isRequired: field.isRequired,
            allowMultipleSelection: field.allowMultipleSelection,
            options: optionsForApi,
          };

          // 3. (서버 정책에 따라) SHORT_ANSWER 타입일 경우 옵션 관련 필드 정리
          if (field.questionType === "SHORT_ANSWER") {
            apiQuestionData.options = [];
            apiQuestionData.allowMultipleSelection = false;
          }

          return apiQuestionData;
        },
      );

      // 날짜 ISO String 변환
      const isoStartDate = new Date(startDate).toISOString();
      const isoEndDate = new Date(endDate).toISOString();

      // 최종 요청 페이로드
      const surveyData: SurveyCreateRequest = {
        title,
        description: content,
        startDate: isoStartDate,
        endDate: isoEndDate,
        questions: questionsForApi,
      };

      console.log("요청 보낼 설문 객체", surveyData);

      // API 호출
      const response = await createSurvey(surveyData);
      console.log("설문 생성 성공:", response.data);
      alert("설문이 성공적으로 생성되었습니다.");

      navigate(-1); // (성공 시 이동 경로)
    } catch (error) {
      console.error("설문 생성 실패:", error);
      alert("설문 생성에 실패했습니다. 입력 내용을 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Header title={"폼 생성"} hasBack={true} />
      <FormBox>
        {/* --- 기본 설문 정보 입력 --- */}
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

      {/* [수정] 8. 개별 질문 필드 렌더링 */}
      {/* [주의] AddNewFormField.tsx 컴포넌트가 아래 props를 받아야 합니다.
        - fieldData: FormFieldState (현재 질문의 모든 데이터)
        - onUpdate: (id: number, updatedData: Partial<FormFieldState>) => void
        - onRemove: (id: number) => void
        - canRemove: boolean
      */}
      {formFields.map((field) => (
        <AddNewFormField
          key={field.id}
          fieldData={field}
          onUpdate={(updatedData) => handleUpdateField(field.id, updatedData)}
          onRemove={() => handleRemoveField(field.id)}
          canRemove={formFields.length > 1}
        />
      ))}

      {/* --- 필드 추가 버튼 --- */}
      <AddButtonArea>
        <AddButton onClick={handleAddField}>{"+"}</AddButton>
        필드 추가
      </AddButtonArea>

      {/* --- 생성하기 버튼 --- */}
      <LastLine>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "생성 중..." : "생성하기"}
          {!isLoading && <img src={arrowright} />}
        </Button>
      </LastLine>
    </PageWrapper>
  );
};

export default FormCreatePage;

// ... (styled-components 코드는 이전과 동일) ...

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
  max-width: 600px; // (PC 레이아웃 고려)
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
  max-width: 600px; // (PC 레이아웃 고려)
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

const AddButtonArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  color: #0a84ff;
`;

const AddButton = styled.button`
  border-radius: 60px;
  background: #fff;
  box-shadow: 0 0 16px 0 rgba(10, 132, 255, 0.25);
  width: 40px;
  height: 40px;
  color: #0a84ff;
  font-size: 28px;
`;
