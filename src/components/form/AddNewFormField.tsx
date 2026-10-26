import React from "react";
import styled from "styled-components";
import { QuestionType } from "@/types/formTypes";
import { FormFieldState } from "@/pages/Admin/FormCreatePage";

interface AddNewFormFieldProps {
  fieldData: FormFieldState;
  index: number;
  onUpdate: (updatedData: Partial<Omit<FormFieldState, "id">>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const AddNewFormField: React.FC<AddNewFormFieldProps> = ({
  fieldData,
  index,
  onUpdate,
  onRemove,
  canRemove,
}) => {
  const handleTypeSelect = (newType: QuestionType) => {
    if (newType === fieldData.questionType) return;

    if (newType === "SHORT_ANSWER") {
      onUpdate({
        questionType: newType,
        options: [],
        allowMultipleSelection: false,
      });
    } else {
      onUpdate({
        questionType: newType,
        options:
          fieldData.options.length > 0
            ? fieldData.options
            : [{ id: Date.now(), optionText: "" }],
      });
    }
  };

  const handleOptionChange = (id: number, newText: string) => {
    const newOptions = fieldData.options.map((opt) =>
      opt.id === id ? { ...opt, optionText: newText } : opt,
    );
    onUpdate({ options: newOptions });
  };

  const handleAddOption = () => {
    const newOptions = [
      ...fieldData.options,
      { id: Date.now(), optionText: "" },
    ];
    onUpdate({ options: newOptions });
  };

  const handleRemoveOption = (id: number) => {
    const newOptions = fieldData.options.filter((opt) => opt.id !== id);
    onUpdate({ options: newOptions });
  };

  return (
    <CardContainer>
      <CardHeader>
        <HeaderLeft>
          <QuestionBadge>문항 {index + 1}</QuestionBadge>
          <TypeSegmentGroup>
            <TypeSegmentButton
              type="button"
              $active={fieldData.questionType === "SHORT_ANSWER"}
              onClick={() => handleTypeSelect("SHORT_ANSWER")}
            >
              주관식
            </TypeSegmentButton>
            <TypeSegmentButton
              type="button"
              $active={fieldData.questionType === "MULTIPLE_CHOICE"}
              onClick={() => handleTypeSelect("MULTIPLE_CHOICE")}
            >
              객관식
            </TypeSegmentButton>
          </TypeSegmentGroup>
        </HeaderLeft>

        {canRemove && (
          <DeleteQuestionButton
            type="button"
            onClick={onRemove}
            title="문항 삭제"
          >
            문항 삭제
          </DeleteQuestionButton>
        )}
      </CardHeader>

      <FieldGroup>
        <FieldLabel>질문 제목</FieldLabel>
        <StyledInput
          type="text"
          placeholder="질문 내용을 입력해주세요"
          value={fieldData.questionText}
          onChange={(e) => onUpdate({ questionText: e.target.value })}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>설명 (선택)</FieldLabel>
        <StyledTextarea
          placeholder="질문에 대한 추가 안내가 필요하다면 입력해주세요"
          value={fieldData.questionDescription}
          onChange={(e) => onUpdate({ questionDescription: e.target.value })}
          rows={2}
        />
      </FieldGroup>

      <SettingsRow>
        <CheckboxLabel>
          <input
            type="checkbox"
            checked={fieldData.isRequired}
            onChange={(e) => onUpdate({ isRequired: e.target.checked })}
          />
          <span>필수 응답</span>
        </CheckboxLabel>

        {fieldData.questionType === "MULTIPLE_CHOICE" && (
          <CheckboxLabel>
            <input
              type="checkbox"
              checked={fieldData.allowMultipleSelection}
              onChange={(e) =>
                onUpdate({ allowMultipleSelection: e.target.checked })
              }
            />
            <span>다중 선택 허용</span>
          </CheckboxLabel>
        )}
      </SettingsRow>

      {fieldData.questionType === "SHORT_ANSWER" ? (
        <ShortAnswerPreview>
          응답자가 자유롭게 주관식 텍스트를 작성할 수 있는 입력란이 제공됩니다.
        </ShortAnswerPreview>
      ) : (
        <OptionsSection>
          <OptionsTitle>선택지 목록</OptionsTitle>
          <OptionsList>
            {fieldData.options.map((option, optIdx) => (
              <OptionRow key={option.id}>
                <OptionIndexIndicator>
                  {fieldData.allowMultipleSelection ? "□" : "○"}
                </OptionIndexIndicator>
                <OptionInput
                  type="text"
                  placeholder={`선택지 ${optIdx + 1}`}
                  value={option.optionText}
                  onChange={(e) =>
                    handleOptionChange(option.id, e.target.value)
                  }
                />
                {fieldData.options.length > 1 && (
                  <RemoveOptionButton
                    type="button"
                    onClick={() => handleRemoveOption(option.id)}
                    title="선택지 삭제"
                  >
                    ✕
                  </RemoveOptionButton>
                )}
              </OptionRow>
            ))}
          </OptionsList>
          <AddOptionButton type="button" onClick={handleAddOption}>
            + 선택지 추가하기
          </AddOptionButton>
        </OptionsSection>
      )}
    </CardContainer>
  );
};

export default AddNewFormField;

const CardContainer = styled.div`
  background: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
  transition: border-color 0.2s ease;

  &:focus-within {
    border-color: #3182f6;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding-bottom: 12px;
  border-bottom: 1px solid #f2f4f6;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const QuestionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  background: #f2f4f6;
  color: #191f28;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.2px;
`;

const TypeSegmentGroup = styled.div`
  display: inline-flex;
  background: #f2f4f6;
  padding: 3px;
  border-radius: 10px;
  gap: 2px;
`;

const TypeSegmentButton = styled.button<{ $active: boolean }>`
  border: none;
  background: ${({ $active }) => ($active ? "#3182f6" : "transparent")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#6b7684")};
  font-size: 13px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    color: ${({ $active }) => ($active ? "#ffffff" : "#191f28")};
  }
`;

const DeleteQuestionButton = styled.button`
  border: none;
  background: transparent;
  color: #8b95a1;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.15s ease;

  &:hover {
    color: #f04452;
    background: #fdf2f2;
  }
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

const FieldLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #4e5968;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e5e8eb;
  border-radius: 12px;
  font-size: 15px;
  color: #191f28;
  background: #f9fafb;
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s ease;

  &::placeholder {
    color: #8b95a1;
  }

  &:focus {
    background: #ffffff;
    border-color: #3182f6;
    box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.12);
  }
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e5e8eb;
  border-radius: 12px;
  font-size: 14px;
  color: #191f28;
  background: #f9fafb;
  outline: none;
  box-sizing: border-box;
  resize: vertical;
  min-height: 56px;
  font-family: inherit;
  transition: all 0.2s ease;

  &::placeholder {
    color: #8b95a1;
  }

  &:focus {
    background: #ffffff;
    border-color: #3182f6;
    box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.12);
  }
`;

const SettingsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding-top: 4px;
`;

const CheckboxLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333d4b;
  cursor: pointer;
  user-select: none;

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #3182f6;
    cursor: pointer;
  }
`;

const ShortAnswerPreview = styled.div`
  padding: 14px 16px;
  background: #f9fafb;
  border: 1px dashed #e5e8eb;
  border-radius: 12px;
  font-size: 13px;
  color: #8b95a1;
  line-height: 1.5;
`;

const OptionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 6px;
`;

const OptionsTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #4e5968;
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const OptionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
`;

const OptionIndexIndicator = styled.span`
  color: #8b95a1;
  font-size: 14px;
  width: 18px;
  text-align: center;
  flex-shrink: 0;
`;

const OptionInput = styled.input`
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e5e8eb;
  border-radius: 10px;
  font-size: 14px;
  color: #191f28;
  background: #ffffff;
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s ease;

  &::placeholder {
    color: #8b95a1;
  }

  &:focus {
    border-color: #3182f6;
    box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.12);
  }
`;

const RemoveOptionButton = styled.button`
  border: none;
  background: transparent;
  color: #8b95a1;
  font-size: 14px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;

  &:hover {
    color: #f04452;
    background: #fdf2f2;
  }
`;

const AddOptionButton = styled.button`
  border: 1px dashed #d1d6db;
  background: #ffffff;
  color: #3182f6;
  font-size: 13px;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  width: fit-content;

  &:hover {
    background: #f2f4f6;
    border-color: #3182f6;
  }
`;
