import { useEffect, useState } from "react";
import styled from "styled-components";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useSurveyDetail } from "@/queries/surveys";
import { useInitFromQuery } from "@/hooks/useInitFromQuery";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import AddNewFormField from "@/components/form/AddNewFormField";
import { useSetHeader } from "@/hooks/useSetHeader";
import {
  OptionCreateRequest,
  QuestionCreateRequest,
  QuestionType,
  SurveyCreateRequest,
  SurveyCreateRequest as SurveyUpdateRequest,
} from "@/types/formTypes";
import { createSurvey, updateSurvey } from "@/apis/formApis";

export interface FormOptionState {
  id: number;
  optionText: string;
}

export interface FormFieldState {
  id: number;
  questionText: string;
  questionDescription: string;
  questionType: QuestionType;
  isRequired: boolean;
  allowMultipleSelection: boolean;
  options: FormOptionState[];
  isNew?: boolean;
}

export default function FormCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const queryId = searchParams.get("id");
  const editId = queryId ? Number(queryId) : undefined;
  const { form: stateForm } = location.state || {};
  const [form, setForm] = useState<any>(stateForm ?? null);
  const isEditMode = !!form;

  useSetHeader({
    title: isEditMode ? "설문 폼 수정" : "설문 폼 만들기",
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxParticipants, setMaxParticipants] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: detailData, isLoading: isDetailLoading } = useSurveyDetail(
    !stateForm && editId ? editId : undefined,
  );

  useInitFromQuery(
    detailData,
    (fetched: any) => {
      if (!stateForm && fetched) {
        setForm(fetched);
      }
    },
    editId,
  );

  const [formFields, setFormFields] = useState<FormFieldState[]>([
    {
      id: Date.now(),
      questionText: "",
      questionDescription: "",
      questionType: "SHORT_ANSWER",
      isRequired: true,
      allowMultipleSelection: false,
      options: [],
      isNew: true,
    },
  ]);

  useEffect(() => {
    if (form) {
      setTitle(form.title || "");
      setContent(form.description || "");

      const toLocalISOString = (isoString: string) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16);
      };

      setStartDate(toLocalISOString(form.startDate));
      setEndDate(toLocalISOString(form.endDate));
      setMaxParticipants(
        form.recruitmentCount !== undefined && form.recruitmentCount !== null
          ? String(form.recruitmentCount)
          : "",
      );

      if (Array.isArray(form.questions) && form.questions.length > 0) {
        setFormFields(form.questions);
      }
    }
  }, [form]);

  const handleAddField = () => {
    setFormFields((prevFields) => [
      ...prevFields,
      {
        id: Date.now(),
        questionText: "",
        questionDescription: "",
        questionType: "SHORT_ANSWER",
        isRequired: true,
        allowMultipleSelection: false,
        options: [],
        isNew: true,
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

  const handleSubmit = async () => {
    if (isLoading) return;

    if (!title.trim() || !content.trim() || !startDate || !endDate) {
      alert("제목, 설명, 시작 일시, 종료 일시를 모두 입력해 주세요.");
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
      alert("질문 내용을 모두 입력해 주세요.");
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

    if (maxParticipants !== undefined && maxParticipants !== null) {
      if (maxParticipants.trim() !== "" && isNaN(Number(maxParticipants))) {
        alert("인원은 숫자만 입력할 수 있습니다.");
        return;
      }
      if (Number(maxParticipants) < 0) {
        alert("인원은 0 이상의 숫자여야 합니다.");
        return;
      }
    }

    const action = isEditMode ? "수정" : "등록";
    if (
      !window.confirm(
        `설문 폼을 ${action}하시겠습니까?\n작성한 내용을 다시 한번 확인해 주세요.`,
      )
    ) {
      return;
    }
    setIsLoading(true);

    try {
      const questionsForApi: QuestionCreateRequest[] = formFields.map(
        (field, index) => {
          const optionsForApi: OptionCreateRequest[] = field.options.map(
            (opt, optIdx) => ({
              optionId: opt.id ? opt.id : undefined,
              optionText: opt.optionText,
              optionOrder: optIdx + 1,
            }),
          );

          const apiQuestionData: QuestionCreateRequest = {
            ...(field.isNew ? {} : { questionId: field.id }),
            questionText: field.questionText,
            questionDescription: field.questionDescription,
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

      const isoStartDate = new Date(startDate).toISOString();
      const isoEndDate = new Date(endDate).toISOString();

      const payload: SurveyCreateRequest | SurveyUpdateRequest = {
        title,
        description: content,
        startDate: isoStartDate,
        endDate: isoEndDate,
        questions: questionsForApi,
        recruitmentCount: maxParticipants === "" ? "0" : maxParticipants,
      };

      if (isEditMode) {
        if (!form.id) {
          alert("수정할 폼의 ID를 찾을 수 없습니다.");
          setIsLoading(false);
          return;
        }
        await updateSurvey(form.id, payload);
        alert("설문 폼이 성공적으로 수정되었습니다.");
      } else {
        await createSurvey(payload);
        alert("설문 폼이 성공적으로 등록되었습니다.");
      }

      navigate(-1);
    } catch (error) {
      const errorAction = isEditMode ? "수정" : "생성";
      console.error(`폼 ${errorAction} 실패:`, error);
      alert(`폼 ${errorAction}에 실패했습니다. 입력 내용을 확인해 주세요.`);
    } finally {
      setIsLoading(false);
    }
  };

  const actionText = isEditMode ? "수정하기" : "등록하기";

  return (
    <PageRoot>
      <ContentContainer>
        {isDetailLoading && (
          <LoadingSpinner overlay message="설문 정보를 불러오는 중입니다..." />
        )}

        {/* 1단계: 기본 정보 카드 */}
        <SectionCard>
          <SectionHeader>
            <SectionBadge>1</SectionBadge>
            <SectionTitle>기본 정보 설정</SectionTitle>
          </SectionHeader>

          <FormGroup>
            <FieldLabel htmlFor="survey-title">설문 제목</FieldLabel>
            <TextInput
              id="survey-title"
              type="text"
              placeholder="설문 또는 신청 제목을 입력해 주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <FieldLabel htmlFor="survey-content">설문 설명</FieldLabel>
            <TextareaInput
              id="survey-content"
              rows={4}
              placeholder="설문의 목적과 작성 시 주의사항을 자세히 안내해 주세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </FormGroup>

          <DateGrid>
            <FormGroup>
              <FieldLabel htmlFor="start-date">시작 일시</FieldLabel>
              <DateInput
                id="start-date"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <FieldLabel htmlFor="end-date">종료 일시</FieldLabel>
              <DateInput
                id="end-date"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </FormGroup>
          </DateGrid>

          <FormGroup>
            <FieldLabel htmlFor="max-count">
              모집 인원 (선택)
              <HelperText>0 또는 빈칸으로 두면 무제한으로 설정돼요</HelperText>
            </FieldLabel>
            <TextInput
              id="max-count"
              type="number"
              min={0}
              placeholder="0 (무제한)"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
            />
          </FormGroup>
        </SectionCard>

        {/* 2단계: 질문 문항 빌더 */}
        <SectionCard>
          <SectionHeader>
            <SectionBadge>2</SectionBadge>
            <SectionTitle>설문 문항 작성 ({formFields.length}개)</SectionTitle>
          </SectionHeader>

          <FieldsContainer>
            {formFields.map((field, index) => (
              <AddNewFormField
                key={field.id}
                index={index}
                fieldData={field}
                onUpdate={(updatedData) => handleUpdateField(field.id, updatedData)}
                onRemove={() => handleRemoveField(field.id)}
                canRemove={formFields.length > 1}
              />
            ))}
          </FieldsContainer>

          <AddFieldButton type="button" onClick={handleAddField}>
            + 새 질문 추가하기
          </AddFieldButton>
        </SectionCard>

        {/* PC 하단 액션 버튼 바 */}
        <DesktopActionBar>
          <SecondaryButton type="button" onClick={() => navigate(-1)}>
            취소
          </SecondaryButton>
          <PrimaryButton
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "저장 중..." : `설문 폼 ${actionText}`}
          </PrimaryButton>
        </DesktopActionBar>
      </ContentContainer>

      {/* 모바일 하단 고정 CTA */}
      <MobileFixedCTA>
        <MobileCTAButton
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "저장 중..." : `설문 폼 ${actionText}`}
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
  max-width: 840px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SectionCard = styled.div`
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

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f2f4f6;
`;

const SectionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: #3182f6;
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 800;
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 800;
  color: #191f28;
  margin: 0;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldLabel = styled.label`
  font-size: 0.88rem;
  font-weight: 700;
  color: #333d4b;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const HelperText = styled.span`
  font-size: 0.78rem;
  font-weight: 400;
  color: #8b95a1;
`;

const TextInput = styled.input`
  height: 46px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  padding: 0 14px;
  font-size: 0.92rem;
  color: #191f28;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: #3182f6;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.12);
  }

  &::placeholder {
    color: #8b95a1;
  }
`;

const TextareaInput = styled.textarea`
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  padding: 12px 14px;
  font-size: 0.92rem;
  color: #191f28;
  outline: none;
  resize: vertical;
  line-height: 1.55;
  box-sizing: border-box;

  &:focus {
    border-color: #3182f6;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.12);
  }

  &::placeholder {
    color: #8b95a1;
  }
`;

const DateGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;

  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const DateInput = styled.input`
  height: 46px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  padding: 0 12px;
  font-size: 0.88rem;
  color: #191f28;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: #3182f6;
    background: #ffffff;
  }
`;

const FieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AddFieldButton = styled.button`
  height: 48px;
  border-radius: 14px;
  border: 1.5px dashed #3182f6;
  background: #f2f8ff;
  color: #3182f6;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease-out;

  &:hover {
    background: #e8f3ff;
  }

  &:active {
    transform: scale(0.99);
  }
`;

const DesktopActionBar = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 8px;
  }
`;

const SecondaryButton = styled.button`
  height: 48px;
  padding: 0 24px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #ffffff;
  color: #4e5968;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #f9fafb;
  }
`;

const PrimaryButton = styled.button`
  height: 48px;
  padding: 0 32px;
  border-radius: 12px;
  border: none;
  background: #3182f6;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease-out;

  &:hover {
    background: #1b64da;
  }

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`;

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
