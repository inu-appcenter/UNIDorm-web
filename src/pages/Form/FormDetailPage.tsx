import styled from "styled-components";
import Header from "../../components/common/Header/Header.tsx";
import FormContent from "../../components/form/FormContent.tsx";
import FormField from "../../components/complain/FormField.tsx";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import { complainDormitory } from "../../constants/constants.ts";
import { useState } from "react";
import arrowright from "../../assets/arrow-right.svg";

const FormDetailPage = () => {
  const [selectedDormitoryIndex, setSelectedDormitoryIndex] = useState<
    number | null
  >(null);

  return (
    <PageWrapper>
      <Header title={"폼 상세"} hasBack={true} />
      <FormBox>
        <FormContent
          badgeStatus="마감"
          duration="09.12 10:00 ~ 10.23 17:00"
          title="외국인 학우들을 위한 추석 이벤트 신청"
          description="<무료 인천 시티투어 이벤트> 추석 연휴를 맞아 외국인 재학생들을 위해 이벤트를 진행합니다."
        />
        <FormField label="기숙사" required>
          <SelectableChipGroup
            Groups={complainDormitory}
            selectedIndex={selectedDormitoryIndex}
            onSelect={setSelectedDormitoryIndex}
          />
        </FormField>
        <LastLine>
          <Button>
            신청 <img src={arrowright} />
          </Button>
        </LastLine>
      </FormBox>
    </PageWrapper>
  );
};

export default FormDetailPage;

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
