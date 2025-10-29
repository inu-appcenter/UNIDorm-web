import styled from "styled-components";
import arrowright from "../../assets/arrow-right.svg";
import FormContent from "./FormContent.tsx";
import { useNavigate } from "react-router-dom";
import { SurveySummary } from "../../types/formTypes.ts";
import { formatDeadlineDate } from "../../utils/dateUtils.ts";
import { statusText } from "../../utils/formUtils.ts";
import { useIsAdminRole } from "../../hooks/useIsAdminRole.ts";
import useUserStore from "../../stores/useUserStore.ts";

interface FormCardProps {
  SurveySummary: SurveySummary;
  miniView?: boolean;
  buttonText?: string;
}

const FormCard = ({
  SurveySummary,
  miniView = true,
  buttonText = "상세 보기",
}: FormCardProps) => {
  const navigate = useNavigate();
  const { isAdmin } = useIsAdminRole();
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  const currentStatus = statusText(SurveySummary.status);

  const ButtonText = () => {
    if (currentStatus === "진행 중") {
      if (SurveySummary.hasSubmitted) {
        return "제출 완료";
      }
      return "상세 보기";
    }
    // else if (currentStatus === "마감") {
    //   return "마감";
    // } else if (currentStatus === "진행 전") {
    //   return "진행 전";
    // }
    else {
      return buttonText;
    }
  };

  const handleCardClick = () => {
    if (!isLoggedIn) {
      alert("로그인 후 사용할 수 있습니다.");
      navigate("/login");
      return;
    }
    if (!isAdmin) {
      //관리자인 경우 무조건 폼 접근 가능
      navigate(`${SurveySummary.id}`);
    } else {
      //일반 사용자인 경우,
      if (SurveySummary.hasSubmitted) {
        //제출하지 않은 사용자인 경우(서버가 반대로 보내주고 있음)
        navigate(`${SurveySummary.id}`, {
          state: { hasSubmitted: true },
        });
        return;
      } else {
        navigate(`${SurveySummary.id}`, {
          state: { hasSubmitted: false },
        });
        return;
      }
    }
  };

  return (
    <FormBox onClick={handleCardClick}>
      <FormContent
        status={SurveySummary.status}
        duration={`${formatDeadlineDate(SurveySummary.startDate)} ~ ${formatDeadlineDate(SurveySummary.endDate)}`}
        title={SurveySummary.title}
        description={SurveySummary.description}
        miniView={miniView}
      />
      <LastLine>
        <Button status={currentStatus}>
          {ButtonText()}
          <img src={arrowright} />
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
  //justify-content: end;
`;

const Button = styled.button<{ status: string }>`
  display: flex;
  flex-direction: row;
  align-items: center;

  border-radius: 23px;
  padding: 4px 16px;
  box-sizing: border-box;

  color: var(--7, #f4f4f4);
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: 0.38px;

  background: ${({ status }) =>
    status === "진행 중" ? "var(--m-1, #0a84ff)" : "#CECECE"};

  background: #0a84ff;

  img {
    margin-left: 4px;
  }

  cursor: ${({ status }) => (status === "진행 중" ? "pointer" : "not-allowed")};
`;
