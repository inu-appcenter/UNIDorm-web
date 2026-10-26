import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useSurveyDetail } from "@/queries/surveys";
import { useInitFromQuery } from "@/hooks/useInitFromQuery";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import AddNewFormField from "@/components/form/AddNewFormField";
import {
  OptionCreateRequest,
  QuestionCreateRequest,
  QuestionType,
  SurveyCreateRequest,
  SurveyCreateRequest as SurveyUpdateRequest,
} from "@/types/formTypes";
import { createSurvey, updateSurvey } from "@/apis/formApis";
import {
  AdminShell,
  AdminPage,
  AdminHero,
  AdminHeroTitle,
  AdminHeroDescription,
  AdminCard,
  AdminButton,
  AdminInput,
  AdminTextarea,
  AdminField,
  AdminLabel,
} from "./adminPageStyles";

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

const FormCreatePage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxParticipants, setMaxParticipants] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const queryId = searchParams.get("id");
  const editId = queryId ? Number(queryId) : undefined;
  const { form: stateForm } = location.state || {};
  const [form, setForm] = useState<any>(stateForm ?? null);
  const isEditMode = !!form;

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
        `폼을 ${action}할까요? 입력한 내용을 다시 한번 확인해주세요.`,
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
        alert("폼이 성공적으로 수정되었습니다.");
      } else {
        await createSurvey(payload);
        alert("폼이 성공적으로 등록되었습니다.");
      }

      navigate(-1);
    } catch (error) {
      const errorAction = isEditMode ? "수정" : "생성";
      console.error(`폼 ${errorAction} 실패:`, error);
      alert(`폼 ${errorAction}에 실패했습니다. 입력 내용을 확인해주세요.`);
    } finally {
      setIsLoading(false);
    }
  };

  const actionText = isEditMode ? "수정" : "등록";

  return (
    <AdminShell>
      <AdminPage style={{ maxWidth: 760 }}>
        {isDetailLoading && (
          <LoadingSpinner overlay message="설문 정보를 불러오는 중입니다..." />
        )}

        <AdminHero style={{ flexDirection: "column", alignItems: "flex-start" }}>
          <HeaderTopRow>
            <BackButton type="button" onClick={() => navigate(-1)}>
              ‹ 뒤로가기
            </BackButton>
          </HeaderTopRow>
          <AdminHeroTitle>
            {isEditMode ? "설문 폼 수정하기" : "새 설문 폼 만들기"}
          </AdminHeroTitle>
          <AdminHeroDescription>
            기숙사 사생들이 참여할 신청 및 설문 폼의 내용과 질문을 작성합니다.
          </AdminHeroDescription>
        </AdminHero>

        {/* 1단계: 기본 정보 카드 */}
        <AdminCard>
          <SectionHeader>
            <SectionNumber>1</SectionNumber>
            <SectionTitle>기본 정보</SectionTitle>
          </SectionHeader>

          <AdminField>
            <AdminLabel>제목</AdminLabel>
            <AdminInput
              type="text"
              placeholder="설문 또는 신청 제목을 입력해주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </AdminField>

          <AdminField>
            <AdminLabel>설명</AdminLabel>
            <AdminTextarea
              rows={4}
              placeholder="설문의 목적과 작성 시 주의사항을 자세히 적어주세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </AdminField>

          <DateGrid>
            <AdminField>
              <AdminLabel>시작 일시</AdminLabel>
              <AdminInput
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </AdminField>

            <AdminField>
              <AdminLabel>종료 일시</AdminLabel>
              <AdminInput
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </AdminField>
          </DateGrid>

          <AdminField>
            <AdminLabel>
              모집 인원 (선택)
              <HelperText>0 또는 빈칸으로 두면 무제한으로 설정됩니다.</HelperText>
            </AdminLabel>
            <AdminInput
              type="number"
              min={0}
              placeholder="0 (무제한)"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
            />
          </AdminField>
        </AdminCard>

        {/* 2단계: 질문 문항 빌더 */}
        <SectionContainer>
          <SectionHeaderRow>
            <SectionHeader>
              <SectionNumber>2</SectionNumber>
              <SectionTitle>질문 문항 ({formFields.length}개)</SectionTitle>
            </SectionHeader>
          </SectionHeaderRow>

          <QuestionsList>
            {formFields.map((field, idx) => (
              <AddNewFormField
                key={field.id}
                fieldData={field}
                index={idx}
                onUpdate={(updatedData) =>
                  handleUpdateField(field.id, updatedData)
                }
                onRemove={() => handleRemoveField(field.id)}
                canRemove={formFields.length > 1}
              />
            ))}
          </QuestionsList>

          <AddQuestionDashedButton type="button" onClick={handleAddField}>
            + 질문 문항 추가하기
          </AddQuestionDashedButton>
        </SectionContainer>

        {/* PC용 하단 버튼 영역 */}
        <DesktopActionArea>
          <AdminButton
            type="button"
            $tone="ghost"
            onClick={() => navigate(-1)}
          >
            취소
          </AdminButton>
          <AdminButton
            type="button"
            $tone="primary"
            disabled={isLoading}
            onClick={handleSubmit}
            style={{ minWidth: 160 }}
          >
            {isLoading ? `${actionText} 처리 중...` : `폼 ${actionText}하기`}
          </AdminButton>
        </DesktopActionArea>

        {/* 모바일 하단 플로팅 CTA */}
        <BottomCTABar>
          <AdminButton
            type="button"
            $tone="primary"
            $fullWidth
            disabled={isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? `${actionText} 처리 중...` : `폼 ${actionText}하기`}
          </AdminButton>
        </BottomCTABar>
      </AdminPage>
    </AdminShell>
  );
};

export default FormCreatePage;

const HeaderTopRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
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

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const SectionHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
`;

const SectionNumber = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: #3182f6;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
`;

const SectionTitle = styled.h2`
  font-size: 17px;
  font-weight: 700;
  color: #191f28;
  letter-spacing: -0.3px;
  margin: 0;
`;

const HelperText = styled.span`
  font-size: 12px;
  font-weight: 400;
  color: #8b95a1;
  margin-left: 8px;
`;

const DateGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 600px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const QuestionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const AddQuestionDashedButton = styled.button`
  width: 100%;
  padding: 16px;
  border: 2px dashed #d1d6db;
  border-radius: 16px;
  background: #ffffff;
  color: #3182f6;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f2f4f6;
    border-color: #3182f6;
  }

  &:active {
    transform: scale(0.99);
  }
`;

const DesktopActionArea = styled.div`
  display: none;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 0 32px;

  @media (min-width: 768px) {
    display: flex;
  }
`;

const BottomCTABar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #e5e8eb;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
  z-index: 50;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.04);

  @media (min-width: 768px) {
    display: none;
  }
`;
