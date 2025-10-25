import styled from "styled-components";
import arrowright from "../../assets/arrow-right.svg";
import FormContent from "./FormContent.tsx";
import { useNavigate } from "react-router-dom";
import { SurveySummary } from "../../types/formTypes.ts";
import { formatDeadlineDate } from "../../utils/dateUtils.ts";

interface FormCardProps {
  SurveySummary: SurveySummary;
  miniView?: boolean;
  buttonText?: string;
}

const FormCard = ({
  SurveySummary,
  miniView = true,
  buttonText = "신청하러 가기",
}: FormCardProps) => {
  const navigate = useNavigate();

  return (
    <FormBox>
      <FormContent
        badgeStatus={"진행전"}
        duration={`${formatDeadlineDate(SurveySummary.startDate)} ~ ${formatDeadlineDate(SurveySummary.endDate)}`}
        title={SurveySummary.title}
        description={SurveySummary.description}
        miniView={miniView}
      />
      <LastLine>
        <Button
          onClick={() => {
            navigate(`form/${SurveySummary.id}`);
          }}
        >
          {buttonText} <img src={arrowright} />
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
  line-height: 24px;
  letter-spacing: 0.38px;

  img {
    margin-left: 4px;
  }
`;
