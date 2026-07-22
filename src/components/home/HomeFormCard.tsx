import styled from "styled-components";
import { colors, typography } from "@/styles/tokens";
import { useNavigate } from "react-router-dom";
import { AiOutlineClockCircle } from "react-icons/ai";
import { FiChevronRight } from "react-icons/fi";
import { SurveySummary } from "@/types/formTypes";
import { formatTimeAgo } from "@/utils/dateUtils";
import { statusText } from "@/utils/formUtils";
import useUserStore from "../../stores/useUserStore";
import { useUserRole } from "@/hooks/useUserRole";
import { mixpanelTrack } from "@/utils/mixpanel";

interface HomeFormCardProps {
  survey: SurveySummary;
}

const HomeFormCard = ({ survey }: HomeFormCardProps) => {
  const navigate = useNavigate();
  const { isAdmin } = useUserRole();
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  const currentStatus = statusText(survey.status);
  const isProgress = currentStatus === "진행 중";

  const getButtonLabel = () => {
    if (isProgress) {
      if (survey.hasSubmitted) {
        return "제출 완료";
      }
      return "신청하러 가기";
    }
    return "마감";
  };

  const handleClick = () => {
    mixpanelTrack.itemClicked("폼", survey.id, survey.title, "홈_폼목록");
    if (!isLoggedIn) {
      alert("로그인 후 사용할 수 있습니다.");
      navigate("/login");
      return;
    }
    if (!isAdmin) {
      navigate(`/form/${survey.id}`);
    } else {
      navigate(`/form/${survey.id}`, {
        state: { hasSubmitted: survey.hasSubmitted },
      });
    }
  };

  return (
    <CardWrapper onClick={handleClick}>
      <CardHeader>
        <Title>{survey.title}</Title>
        <TimeAgo>
          <AiOutlineClockCircle style={{ marginRight: "4px" }} />
          {formatTimeAgo(survey.createdDate)}
        </TimeAgo>
      </CardHeader>
      <ButtonWrapper>
        <StatusButton $isProgress={isProgress}>
          <span>{getButtonLabel()}</span>
          {isProgress && <FiChevronRight className="arrow-icon" />}
        </StatusButton>
      </ButtonWrapper>
    </CardWrapper>
  );
};

export default HomeFormCard;

const CardWrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px 16px 12px 16px;

  width: 45vw;
  max-width: 240px;
  min-width: 200px;
  height: 160px;
  flex-shrink: 0;

  border-radius: 16px;
  background: ${colors.bg.bg1};
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.08);

  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0px 6px 14px rgba(0, 0, 0, 0.12);
  }
`;

const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
`;

const Title = styled.div`
  ${typography.body1Normal}
  color: ${colors.main.main2};

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;

  height: 44px;
`;

const TimeAgo = styled.div`
  display: flex;
  align-items: center;
  ${typography.label2}
  color: ${colors.gray.gray700};
`;

const ButtonWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-end;
`;

const StatusButton = styled.div<{ $isProgress: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 23px;
  ${typography.label1Normal}
  width: ${({ $isProgress }) => ($isProgress ? "100%" : "fit-content")};
  background-color: ${({ $isProgress }) =>
    $isProgress ? colors.main.main1 : colors.cta.disabled};
  color: ${({ $isProgress }) =>
    $isProgress ? colors.gray.gray0 : colors.gray.gray50};

  .arrow-icon {
    font-size: 16px;
  }
`;
