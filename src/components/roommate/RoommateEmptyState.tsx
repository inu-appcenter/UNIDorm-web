import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import hwatbuliImg from "@/assets/roommate/hwatbuli-first-post.webp";
import { PATHS } from "@/constants/paths";
import useUserStore from "@/stores/useUserStore";
import { colors, typography } from "@/styles/tokens";

interface RoommateEmptyStateProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onAction?: () => void;
  className?: string;
}

export default function RoommateEmptyState({
  title = "이번 학기 첫 번째 룸메이트 게시글의 주인공이 되세요!",
  description = "아직 등록된 모집 글이 없어요.\n가장 먼저 글을 올려 룸메이트를 찾아보세요.",
  buttonText = "첫 글 작성하러 가기",
  onAction,
  className,
}: RoommateEmptyStateProps) {
  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();

  const handleAction = () => {
    if (onAction) {
      onAction();
      return;
    }
    if (!tokenInfo.accessToken) {
      navigate(PATHS.LOGIN);
      return;
    }
    navigate(PATHS.ROOMMATE.CHECKLIST);
  };

  return (
    <CardContainer className={className}>
      <IllustWrapper>
        <IllustImage
          src={hwatbuliImg}
          alt="첫 번째 룸메이트 게시글 작성 안내 횃불이 일러스트"
        />
      </IllustWrapper>

      <ContentArea>
        <TitleText>{title}</TitleText>
        <DescriptionText>{description}</DescriptionText>
        <ActionButton type="button" onClick={handleAction}>
          {buttonText}
        </ActionButton>
      </ContentArea>
    </CardContainer>
  );
}

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  padding: 18px 16px;
  width: 100%;
  box-sizing: border-box;
  background: ${colors.bg.bg1};
  border-radius: 12px;
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.08);
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  @media (max-width: 360px) {
    gap: 12px;
    padding: 16px 12px;
  }
`;

const IllustWrapper = styled.div`
  flex-shrink: 0;
  width: 92px;
  height: 126px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 360px) {
    width: 80px;
    height: 110px;
  }
`;

const IllustImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  flex: 1;
  min-width: 0;
  gap: 6px;
`;

const TitleText = styled.h3`
  ${typography.title3}
  font-size: 15px;
  font-weight: 700;
  line-height: 1.35;
  color: ${colors.gray.gray1000};
  margin: 0;
  word-break: keep-all;

  @media (max-width: 360px) {
    font-size: 14px;
  }
`;

const DescriptionText = styled.p`
  ${typography.body2Reading}
  font-size: 12.5px;
  line-height: 1.4;
  color: ${colors.gray.gray600};
  margin: 0;
  white-space: pre-line;
  word-break: keep-all;

  @media (max-width: 360px) {
    font-size: 12px;
  }
`;

const ActionButton = styled.button`
  margin-top: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  background-color: ${colors.main.main1};
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.12s cubic-bezier(0.16, 1, 0.3, 1),
    background-color 0.12s ease;

  &:active {
    transform: scale(0.97);
    background-color: ${colors.main.main2};
  }

  @media (max-width: 360px) {
    padding: 7px 12px;
    font-size: 12px;
  }
`;
