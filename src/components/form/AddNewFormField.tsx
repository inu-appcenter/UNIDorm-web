import styled from "styled-components";
import { Dropdown, Input } from "../../styles/complain"; // 기존 경로 가정
import { useState } from "react";

const AddNewFormField = () => {
  const [title, setTitle] = useState("");

  // 1. 선택된 필드 타입을 string으로 관리 (dropdown의 value는 단일 string)
  const [selectedFieldType, setSelectedFieldType] = useState<string>("주관식");

  // 2. 객관식 옵션 목록을 관리할 state
  const [options, setOptions] = useState<string[]>([""]); // 첫 번째 빈 옵션으로 시작

  const typeOptions = ["주관식", "객관식"];

  // 3. 객관식 옵션의 내용을 변경하는 핸들러
  const handleOptionChange = (index: number, value: string) => {
    // map을 사용하여 해당 index의 값만 변경한 새 배열을 생성
    const newOptions = options.map((option, i) =>
      i === index ? value : option,
    );
    setOptions(newOptions);
  };

  // 4. 객관식 옵션을 추가하는 핸들러
  const handleAddOption = () => {
    setOptions([...options, ""]); // 배열에 빈 문자열을 추가
  };

  // 5. 객관식 옵션을 제거하는 핸들러
  const handleRemoveOption = (index: number) => {
    // filter를 사용하여 해당 index를 제외한 새 배열을 생성
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  return (
    <FormBox>
      <FirstLine>
        <Input
          placeholder="질문 제목을 입력해주세요."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Dropdown
          value={selectedFieldType}
          onChange={(e) => setSelectedFieldType(e.target.value)} // setselectedFieldType -> setSelectedFieldType
          hasValue={!!selectedFieldType}
          disabled={typeOptions.length === 0}
        >
          {typeOptions.map(
            (
              type, // 변수명 'floor' -> 'type'으로 변경
            ) => (
              <option key={type} value={type}>
                {type}
              </option>
            ),
          )}
        </Dropdown>
      </FirstLine>

      {/* 7. '주관식' 선택 시 메시지 렌더링 */}
      {selectedFieldType === "주관식" && (
        <SubjectiveMessage>주관식 텍스트를 받습니다</SubjectiveMessage>
      )}

      {/* 8. '객관식' 선택 시 옵션 관리 UI 렌더링 */}
      {selectedFieldType === "객관식" && (
        <ObjectiveOptionsWrapper>
          {options.map((option, index) => (
            <OptionItem key={index}>
              {/* 시각적 표현을 위한 비활성화된 라디오 버튼 */}
              <RadioInput type="radio" name="preview" disabled />

              {/* 옵션 내용을 입력받는 Input (기존 Input 스타일 재사용) */}
              <OptionInput
                placeholder={`옵션 ${index + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
              />

              {/* 9. 옵션이 2개 이상일 때만 '삭제' 버튼 표시 */}
              {options.length > 1 && (
                <RemoveButton onClick={() => handleRemoveOption(index)}>
                  X
                </RemoveButton>
              )}
            </OptionItem>
          ))}
          {/* 10. 옵션 추가 버튼 */}
          <AddButton onClick={handleAddOption}>옵션 추가</AddButton>
        </ObjectiveOptionsWrapper>
      )}
    </FormBox>
  );
};
export default AddNewFormField;

// --- 기존 Styled Components ---

const FormBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
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
  gap: 12px; // 옵션 사이의 간격
  width: 100%;
  margin-top: 8px; // 상단 UI와의 간격
`;

// 개별 옵션 (라디오 + 인풋 + 삭제버튼) 래퍼
const OptionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px; // 라디오, 인풋, 버튼 사이 간격
  width: 100%;
`;

// 옵션 입력용 Input (기존 Input 스타일 상속 및 확장)
const OptionInput = styled(Input)`
  flex: 1; // 남은 공간을 모두 차지하도록 설정
`;

// 미리보기용 라디오 버튼 스타일
const RadioInput = styled.input`
  flex-shrink: 0; // 크기 고정
  accent-color: #0a84ff; // 라디오 버튼 활성 색상 (지원 브라우저)
`;

// 공용 버튼 스타일
const BaseButton = styled.button`
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// 옵션 추가 버튼
const AddButton = styled(BaseButton)`
  background-color: #e0eaff;
  color: #0a84ff;
  align-self: flex-start; // 좌측 정렬

  &:hover {
    background-color: #d0e0ff;
  }
`;

// 옵션 삭제 버튼
const RemoveButton = styled(BaseButton)`
  flex-shrink: 0;
  background-color: #ffe0e0;
  color: #ff3b30;
  padding: 6px 10px; // 추가 버튼보다 살짝 작게
  font-weight: bold;
  line-height: 1;

  &:hover {
    background-color: #ffcfcf;
  }
`;
