import styled from "styled-components";
import arrowright from "../../assets/arrow-right.svg";
import FormContent from "./FormContent.tsx";
import { useNavigate } from "react-router-dom";

const FormCard = () => {
  const navigate = useNavigate();
  return (
    <FormBox>
      <FormContent
        badgeStatus="마감"
        duration="09.12 10:00 ~ 10.23 17:00"
        title="외국인 학우들을 위한 추석 이벤트 신청"
        description="<무료 인천 시티투어 이벤트> 추석 연휴를 맞아 외국인 재학생들을 위해 이벤트를 진행합니다."
        miniView={true}
      />
      <LastLine>
        <Button
          onClick={() => {
            navigate("1");
          }}
        >
          신청하러 가기 <img src={arrowright} />
        </Button>
      </LastLine>
    </FormBox>
  );
};

export default FormCard;

const FormBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: fit-content;
  gap: 4px;

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
