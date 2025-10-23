import styled from "styled-components";
import Header from "../../components/common/Header/Header.tsx";
import FormField from "../../components/complain/FormField.tsx";
import { useState } from "react";
import arrowright from "../../assets/arrow-right.svg";
import { Input } from "../../styles/complain.ts";
import AddNewFormField from "../../components/form/AddNewFormField.tsx";

const FormCreatePage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [incidentTime, setIncidentTime] = useState("");

  // 1. 동적으로 추가될 폼 필드를 위한 상태 추가
  // 간단한 고유 ID를 가진 객체 배열로 관리합니다.
  const [formFields, setFormFields] = useState<{ id: number }[]>([
    { id: Date.now() },
  ]);

  // 2. 필드 추가 버튼 클릭 시 실행될 핸들러
  const handleAddField = () => {
    setFormFields((prevFields) => [
      ...prevFields,
      { id: Date.now() }, // Date.now()를 사용해 간단하고 고유한 key 생성
    ]);
  };

  return (
    <PageWrapper>
      <Header title={"폼 생성"} hasBack={true} />
      <FormBox>
        {/*<FormContent />*/}
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
            value={
              incidentDate && incidentTime
                ? `${incidentDate}T${incidentTime}`
                : ""
            }
            onChange={(e) => {
              const [date, time] = e.target.value.split("T");
              setIncidentDate(date);
              setIncidentTime(time);
            }}
          />
        </FormField>

        <FormField label="종료 일시">
          <Input
            type="datetime-local"
            value={
              incidentDate && incidentTime
                ? `${incidentDate}T${incidentTime}`
                : ""
            }
            onChange={(e) => {
              const [date, time] = e.target.value.split("T");
              setIncidentDate(date);
              setIncidentTime(time);
            }}
          />
        </FormField>
      </FormBox>

      {/* 3. formFields 배열을 순회하며 AddNewFormField 렌더링 */}
      {formFields.map((field) => (
        <AddNewFormField key={field.id} />
      ))}

      <AddButtonArea>
        {/* 4. 버튼에 onClick 이벤트 핸들러 연결 */}
        <AddButton onClick={handleAddField}>{"+"}</AddButton>
        필드 추가
      </AddButtonArea>

      <LastLine>
        <Button>
          생성하기 <img src={arrowright} />
        </Button>
      </LastLine>
    </PageWrapper>
  );
};

export default FormCreatePage;

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
