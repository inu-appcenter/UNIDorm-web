import styled from "styled-components";
import { Dropdown, Input, Textarea } from "../../styles/complain"; // 기존 경로
import { QuestionType } from "../../types/formTypes.ts";
import { FormFieldState } from "../../pages/Admin/FormCreatePage.tsx";
import { AddButton, AddButtonArea } from "../../styles/form.ts";

// [수정] 1. 부모로부터 받을 props 타입 정의
interface AddNewFormFieldProps {
  fieldData: FormFieldState;
  onUpdate: (updatedData: Partial<Omit<FormFieldState, "id">>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

// [수정] 2. UI 표시용 텍스트와 실제 DTO 값을 매핑
const typeOptions: { label: string; value: QuestionType }[] = [
  { label: "주관식", value: "SHORT_ANSWER" },
  { label: "객관식", value: "MULTIPLE_CHOICE" },
];

const AddNewFormField = ({
  fieldData,
  onUpdate,
  onRemove,
  canRemove,
}: AddNewFormFieldProps) => {
  // [수정] 4. 질문 타입 변경 핸들러 (DTO에 맞게)
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as QuestionType;
    const currentType = fieldData.questionType;

    if (newType === currentType) return;

    if (newType === "SHORT_ANSWER") {
      // 주관식으로 변경 시: 옵션 초기화, 다중 선택 비활성화
      onUpdate({
        questionType: newType,
        options: [],
        allowMultipleSelection: false,
      });
    } else {
      // 객관식으로 변경 시: 옵션이 없다면 기본 1개 추가
      onUpdate({
        questionType: newType,
        options:
          fieldData.options.length > 0
            ? fieldData.options
            : [{ id: Date.now(), optionText: "" }],
      });
    }
  };

  // [수정] 5. 객관식 옵션 변경 핸들러 (부모 상태 업데이트)
  const handleOptionChange = (id: number, newText: string) => {
    // 부모의 options 배열(FormOptionState[])을 기준으로 새 배열 생성
    const newOptions = fieldData.options.map((opt) =>
      opt.id === id ? { ...opt, optionText: newText } : opt,
    );
    // onUpdate로 'options' 키에 새 배열을 담아 전달
    onUpdate({ options: newOptions });
  };

  // [수정] 6. 객관식 옵션 추가 핸들러 (부모 상태 업데이트)
  const handleAddOption = () => {
    const newOptions = [
      ...fieldData.options,
      { id: Date.now(), optionText: "" }, // DTO에 맞는 객체 추가
    ];
    onUpdate({ options: newOptions });
  };

  // [수정] 7. 객관식 옵션 제거 핸들러 (부모 상태 업데이트)
  const handleRemoveOption = (id: number) => {
    const newOptions = fieldData.options.filter((opt) => opt.id !== id);
    onUpdate({ options: newOptions });
  };

  return (
    <FormBox>
      {/* --- 1. 질문 제목 / 질문 타입 --- */}
      <FirstLine>
        <Input
          placeholder="질문 제목을 입력해주세요."
          value={fieldData.questionText} // 👈 부모 상태 바인딩
          onChange={(e) => onUpdate({ questionText: e.target.value })} // 👈 onUpdate 호출
        />

        <Dropdown
          value={fieldData.questionType} // 👈 부모 상태 바인딩
          onChange={handleTypeChange} // 👈 타입 변경 핸들러
          hasValue={!!fieldData.questionType}
        >
          {typeOptions.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Dropdown>
      </FirstLine>
      <Textarea
        placeholder="(선택)설명을 입력해주세요."
        value={fieldData.questionDescription} // 👈 부모 상태 바인딩
        onChange={(e) => onUpdate({ questionDescription: e.target.value })} // 👈 onUpdate 호출
      />
      {/* --- 2. 토글 / 질문 삭제 버튼 --- */}
      <SecondLine>
        <ToggleWrapper>
          <ToggleLabel>
            <input
              type="checkbox"
              checked={fieldData.isRequired}
              onChange={(e) => onUpdate({ isRequired: e.target.checked })}
            />
            필수 응답
          </ToggleLabel>
          {fieldData.questionType === "MULTIPLE_CHOICE" && (
            <ToggleLabel>
              <input
                type="checkbox"
                checked={fieldData.allowMultipleSelection}
                onChange={(e) =>
                  onUpdate({ allowMultipleSelection: e.target.checked })
                }
              />
              다중 선택 허용
            </ToggleLabel>
          )}
        </ToggleWrapper>
        {/* '질문 삭제' 버튼 (onRemove, canRemove props 사용) */}
        <RemoveQuestionButton onClick={onRemove} disabled={!canRemove}>
          X
        </RemoveQuestionButton>
      </SecondLine>
      {/* --- 3. 주관식 / 객관식 UI --- */}
      {/* '주관식' 선택 시 */}
      {fieldData.questionType === "SHORT_ANSWER" && (
        <SubjectiveMessage>주관식 텍스트를 받습니다</SubjectiveMessage>
      )}
      {/* '객관식' 선택 시 */}
      {fieldData.questionType === "MULTIPLE_CHOICE" && (
        <ObjectiveOptionsWrapper>
          {/* 부모의 options 배열(FormOptionState[])을 순회 */}
          {fieldData.options.map((option, index) => (
            <OptionItem key={option.id}>
              <RadioInput
                type={fieldData.allowMultipleSelection ? "checkbox" : "radio"}
                name={`preview-${fieldData.id}`}
                disabled
              />
              <OptionInput
                placeholder={`옵션 ${index + 1}`}
                value={option.optionText} // 👈 부모 상태 바인딩
                onChange={(e) => handleOptionChange(option.id, e.target.value)} // 👈 onUpdate 호출
              />
              {/* 옵션이 2개 이상일 때만 '삭제' 버튼 표시 */}
              {fieldData.options.length > 1 && (
                <RemoveOptionButton
                  onClick={() => handleRemoveOption(option.id)} // 👈 onUpdate 호출
                >
                  X
                </RemoveOptionButton>
              )}
            </OptionItem>
          ))}
          <AddButtonArea>
            <AddButton onClick={handleAddOption}>{"+"}</AddButton>
          </AddButtonArea>
        </ObjectiveOptionsWrapper>
      )}
    </FormBox>
  );
};
export default AddNewFormField;

// --- Styled Components (기존 + 신규 추가) ---

const FormBox = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 600px; // 🖥️ PC 레이아웃 고려
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

const FirstLine = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  width: 100%;

  /* 드롭다운이 너무 커지는 것을 방지 */
  & > ${Dropdown} {
    flex-shrink: 0;
    width: 100px;
  }
`;

// [신규] 2번째 줄 (토글, 삭제 버튼)
const SecondLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 16px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
`;

// [신규] 토글 스위치들을 감싸는 래퍼
const ToggleWrapper = styled.div`
  display: flex;
  gap: 16px;
`;

// [신규] 토글 레이블 스타일
const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #333;
  cursor: pointer;

  input[type="checkbox"] {
    accent-color: #0a84ff;
    cursor: pointer;
  }

  input[type="checkbox"]:disabled {
    cursor: not-allowed;
    accent-color: #ccc;
  }
`;

// 주관식 타입 선택 시 보여줄 메시지
const SubjectiveMessage = styled.div`
  width: 100%;
  color: var(--5, #6c6c74);
  text-align: start;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
`;

// 객관식 옵션들을 감싸는 래퍼
const ObjectiveOptionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-top: 8px;
`;

// 개별 옵션 (라디오 + 인풋 + 삭제버튼) 래퍼
const OptionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const OptionInput = styled(Input)`
  flex: 1;
`;

const RadioInput = styled.input`
  flex-shrink: 0;
  accent-color: #0a84ff;
  cursor: not-allowed;
`;

const BaseButton = styled.button`
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// [수정] 옵션 삭제 버튼 (이름 변경)
const RemoveOptionButton = styled(BaseButton)`
  flex-shrink: 0;
  background-color: #ffe0e0;
  color: #ff3b30;
  padding: 6px 10px;
  font-weight: bold;
  line-height: 1;

  &:hover {
    background-color: #ffcfcf;
  }
`;

// [신규] 질문 삭제 버튼
const RemoveQuestionButton = styled(BaseButton)`
  position: absolute;
  top: -12px;
  right: -12px;
  background-color: #f0f0f0;
  color: #ff3b30;
  font-weight: 600;
  border-radius: 50%;

  &:hover:not(:disabled) {
    background-color: #ffcfcf;
  }
`;
